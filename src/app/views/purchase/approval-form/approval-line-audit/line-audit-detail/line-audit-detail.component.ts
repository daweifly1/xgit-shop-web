import {Component, OnInit, Output, EventEmitter, Input, TemplateRef} from '@angular/core';
import {ApprovalFormNs, ApprovalFormService} from '../../../../../core/trans/purchase/approval-form.service';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {PurchaseStepsNs} from '../../../common-component/purchase-steps/purchase-steps.component';
import { purchaseWay as PurchaseWayObj} from '../../../../../../environments/map-data';
@Component({
  selector: 'app-line-audit-detail',
  templateUrl: './line-audit-detail.component.html',
  styleUrls: ['./line-audit-detail.component.scss']
})
export class LineAuditDetailComponent  implements OnInit {
  @Output()finish: EventEmitter<any>;
  @Input()formId: string;
  @Input()operationTpl: TemplateRef<any>;
  supplierList: any[];
  purchaseRowList: any[];
  purchaseInfo: any;
  fieldList: {field: string; name: string; pipe?: string}[];
  supplierTableConfig: UfastTableNs.TableConfig;
  purchasePlanTableConfig:  UfastTableNs.TableConfig;
  detailCtx: any;
  purchaseSteps: PurchaseStepsNs.PurchaseStep = {
    mainStep: PurchaseStepsNs.steps.approveForm,
    subStep: PurchaseStepsNs.subSteps.editApproveForm
  };
  isShowAuditProcess = false;
  supplierTableList: any[];
  supplierTableRightField: string;
  constructor(private approvalFormService: ApprovalFormService, private messageService: ShowMessageService) {
    this.supplierTableList = [];
    this.supplierTableRightField = '_right';
    this.finish = new EventEmitter<any>();
    this.purchaseInfo = {};
    this.supplierList = [];
    this.purchaseRowList = [];
    this.detailCtx = {
      finishHandle: this.exitPage,
      orderInfo: {}
    };
    this.fieldList = [
      { name: '审批表编号', field: 'approveNo'},
      { name: '采购模式', field: 'purchaseType', pipe: 'purchaseMode'},
      { name: '采购方式', field: 'purchaseMethod'},
      { name: '价格类型', field: 'priceType', pipe: 'purchasePriceType'},
      { name: '业务类型', field: 'businessType', pipe: 'purchaseContractBusiness'},
      // { name: '状态', field: 'status', pipe: 'purchaseApprovalStatus'},
      // { name: '成交策略', field: 'strategy', pipe: 'purchaseDealStrategy'},
    ];
  }
  private getDetailInfo() {
    this.approvalFormService.getRowAuditDetail(this.formId).subscribe((resData: ApprovalFormNs.UfastHttpResT<any>) => {
      this.purchaseInfo = resData.value || {};
      this.purchaseRowList = resData.value.purchaseApproveFullDetailVOList;
      this.supplierList = resData.value.purchaseApproveSupplierVOList;
      this.supplierTableList = [];
      this.supplierList.forEach((item, index) => {
        this.resetSupplierTable(item, index);
      });
      this.detailCtx.orderInfo['approveNo'] = this.purchaseInfo.approveNo;
      this.detailCtx.orderInfo['purchaseWay'] = this.purchaseInfo.purchaseMethod;
      this.getPurchaseSteps();
      let oldPurchaseMethod = 0;
      let newPurchaseMethod = 0;
      if (this.purchaseRowList[0].changeMethodStatus === ApprovalFormNs.ApprovalRowStatus.Approved) {
        oldPurchaseMethod = this.purchaseRowList[0].purchaseMethod + 1;
        newPurchaseMethod = this.purchaseRowList[0].purchaseMethod;
      } else {
        newPurchaseMethod = this.purchaseRowList[0].purchaseMethod - 1;
        oldPurchaseMethod = this.purchaseRowList[0].purchaseMethod;
      }
      this.purchaseInfo.purchaseMethod =
      `${PurchaseWayObj[oldPurchaseMethod]} → ${PurchaseWayObj[newPurchaseMethod]}`;
    });
  }
  private getPurchaseSteps() {
    if (this.purchaseInfo.status === ApprovalFormNs.ApprovalStatus.WaitApprove) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.auditApproveForm;
    }
    if (this.purchaseInfo.status === ApprovalFormNs.ApprovalStatus.Init) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.editApproveForm;
    }
    if (this.purchaseInfo.status === ApprovalFormNs.ApprovalStatus.ApprovePass) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.completeApproveForm;
    }
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  exitPage = () => {
    this.finish.emit();
  }
  public showAuditProcess() {
    this.isShowAuditProcess = true;
  }
  private resetSupplierTable(supplier: any, index: number) {
    if (index % 2 === 0) {
      this.supplierTableList.push(supplier);
    } else {
      Object.keys(supplier).forEach((key: string) => {
        this.supplierTableList[(index - 1) / 2][key + this.supplierTableRightField] = supplier[key];
      });
    }
  }
  ngOnInit() {
    this.getDetailInfo();
    this.supplierTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'rowNo', width: 40},
        {title: '供应商编码', field: 'supplierId', width: 100},
        {title: '供应商名称', field: 'supplierName', width: 170},

        {title: '行号', field: 'rowNo' + this.supplierTableRightField, width: 40},
        {title: '供应商编码', field: 'supplierId' + this.supplierTableRightField, width: 100},
        {title: '供应商名称', field: 'supplierName' + this.supplierTableRightField, width: 170},
      ]
    };
    this.purchasePlanTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'rowNo', width: 60, fixed: true},
        {title: '采购计划编号', field: 'purchasePlanNo', width: 170},
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '采购计划行号', field: 'indexNo', width: 80},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料名称', field: 'materialName', width: 140},
        {title: '属性描述', field: 'materialDesc', width: 140},
        {title: '单位', field: 'unit', width: 100},
        {title: '采购数量', field: 'quantity', width: 100},
        {title: '采购含税价(元)', field: 'unitPrice', width: 120},
        {title: '总价(元)', field: 'totalPrice', width: 100},
      ]
    };
  }

}
