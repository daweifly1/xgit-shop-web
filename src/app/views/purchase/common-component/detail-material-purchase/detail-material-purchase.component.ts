import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {PurchaseServiceNs, PurchaseService} from '../../../../core/trans/purchase.service';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {environment} from '../../../../../environments/environment';
import {UfastFormDetailNs} from '../../../../layout/ufast-form-detail/ufast-form-detail.component';

@Component({
  selector: 'app-detail-material-purchase',
  templateUrl: './detail-material-purchase.component.html',
  styleUrls: ['./detail-material-purchase.component.scss']
})
export class DetailMaterialPurchaseComponent implements OnInit {
  @Input() purchasePlanId: string|number;
  @Input() operation: string;     // showDetail: 查看详情; factoryAudit: 厂矿审核; materialAudit: 材设审核
  @Input() searchBy?: string;     // id: 详情通过id搜索; no: 详情通过no搜索;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('upDownloadTpl') upDownloadTpl: TemplateRef<any>;
  @ViewChild('remarkTpl') remarkTpl: TemplateRef<any>;
  @ViewChild('receiverTpl') receiverTpl: TemplateRef<any>;
  public purchasePlanDetailConfig: UfastFormDetailNs.DetailDataConfig[] = [];
  public purchasePlanDetail: PurchaseServiceNs.PurchasePlanItemData = {
    orgName: '',
    purchasePlanId: '',
    businessType: null,
    purchasePlanType: null,
    purchaseType: null,
    materialType: null,
    monthPlanIn: '',
    allocatePlanner: '',
    departmentName: '',
    status: null,
    remark: '',
    auditRemark: '',
  };
  public purchaseDetailMaterialList: PurchaseServiceNs.PurchasePlanItemTableData[] = [];
  public purchaseDetailMaterialTableConfig: UfastTableNs.TableConfig;
  public purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public isFactoryAuditPage = false;
  public isMaterialAuditPage = false;
  public isShowRefuseModal = false;
  public refuseReason = '';
  public downloadUrl = environment.otherData.fileServiceUrl;
  public lengthLimit = {maxLength: environment.otherData.searchInputMaxLen};

  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService) { }
  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }
  private getPurchasePlanDetail() {
    this.messageService.showLoading();
    let req = null;
    if (this.searchBy === 'no') {
      req = this.purchaseService.getPurchaseDetailByNo(this.purchasePlanId);
    } else if (this.searchBy === 'divideNo') {
      req = this.purchaseService.getPurchaseExecuteDetail(this.purchasePlanId);
    } else {
      req = this.purchaseService.getPurchaseDetail(this.purchasePlanId);
    }
    this.purchaseDetailMaterialList = [];
    req.subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      Object.keys(this.purchasePlanDetail).forEach((item) => {
        this.purchasePlanDetail[item] = resData.value[this.purchaseDataMap[item].key];
      });
      if ((this.purchasePlanDetail.status === PurchaseServiceNs.PurchasePlanStatus.RefuseAudit)
        || (this.purchasePlanDetail.status === PurchaseServiceNs.PurchasePlanStatus.MaterialRefuseAudit)) {
        this.purchasePlanDetailConfig.splice(11, 0, {
          name: '拒绝原因',
          field: 'auditRemark',
          isFullSpan: true
        });
      }
      resData.value.purchasePlanDetailsVOS.forEach((item, index) => {
        this.purchaseDetailMaterialList = [...this.purchaseDetailMaterialList, {
          index: index,
          id: item[this.purchaseDataMap.id.key],
          lineNo: item[this.purchaseDataMap.lineNo.key],
          materialCode: item[this.purchaseDataMap.materialCode.key],
          materialDescription: item[this.purchaseDataMap.materialDescription.key],
          unit: item[this.purchaseDataMap.unit.key],
          purchaseAmount: item[this.purchaseDataMap.purchaseAmount.key],
          inventory: item[this.purchaseDataMap.inventory.key],
          amountInPlan: item[this.purchaseDataMap.amountInPlan.key],
          useAmountInThreeMonth: item[this.purchaseDataMap.useAmountInThreeMonth.key],
          demandDate: item[this.purchaseDataMap.demandDate.key],
          targetPricePlan: item[this.purchaseDataMap.targetPricePlan.key],
          receiver: item[this.purchaseDataMap.receiver.key],
          attachment: item[this.purchaseDataMap.attachment.key],
          annexName: item[this.purchaseDataMap.annexName.key],
          remark: item[this.purchaseDataMap.remark.key],
        }];
      });
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public agreeAudit() {
    if (this.isMaterialAuditPage) {
      this.agreeMaterialAudit();
      return;
    }
    this.agreeFactoryAudit();
  }
  public openRefuseModal() {
    this.isShowRefuseModal = true;
    this.refuseReason = '';
  }
  public refuseAudit() {
    if (this.isMaterialAuditPage) {
      this.refuseMaterialAudit();
      return;
    }
    this.refuseFactoryAudit();
  }
  public agreeFactoryAudit() {
    this.messageService.showAlertMessage('', '是否确认通过该审核', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        const filters = {
          id: this.purchasePlanId
        };
        this.purchaseService.agreeFactoryAudit(filters).subscribe((resData) => {
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('已通过', 'success');
          this.emitPage(true);
        }, (error) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public refuseFactoryAudit() {
    if (!this.refuseReason) {
      this.messageService.showToastMessage('请填写拒绝原因', 'warning');
      return;
    }
    const filters = {
      id: this.purchasePlanId,
      auditRemark: this.refuseReason
    };
    this.purchaseService.refuseFactoryAudit(filters).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('已拒绝', 'success');
      this.emitPage(true);
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public agreeMaterialAudit() {
    this.messageService.showAlertMessage('', '是否确认通过该审核', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        const filters = {
          id: this.purchasePlanId
        };
        this.purchaseService.agreeMaterialAudit(filters).subscribe((resData) => {
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('已通过', 'success');
          this.emitPage(true);
        }, (error) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public refuseMaterialAudit() {
    if (!this.refuseReason) {
      this.messageService.showToastMessage('请填写拒绝原因', 'warning');
      return;
    }
    const filters = {
      id: this.purchasePlanId,
      auditRemark: this.refuseReason
    };
    this.purchaseService.refuseMaterialAudit(filters).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('已拒绝', 'success');
      this.emitPage(true);
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.purchaseDetailMaterialTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      frontPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        {title: '行号', field: 'lineNo', width: 80},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料描述', field: 'materialDescription', width: 150},
        {title: '单位', field: 'unit', width: 100},
        {title: '采购数量', field: 'purchaseAmount', width: 100},
        // {title: '库存现有量', field: 'inventory', width: 100},
        // {title: '已申报计划', field: 'amountInPlan', width: 100},
        // {title: '前三个月领用量', field: 'useAmountInThreeMonth', width: 120},
        {title: '需求日期', field: 'demandDate', pipe: 'date: yyyy-MM-dd', width: 100},
        {title: '计划价', field: 'targetPricePlan', width: 100},
        {title: '通知接收人', tdTemplate: this.receiverTpl, width: 100},
        {title: '备注', tdTemplate: this.remarkTpl, width: 100},
        {title: '附件', tdTemplate: this.upDownloadTpl, width: 100},
      ]
    };
    this.purchasePlanDetailConfig = [
      {name: '业务实体', field: 'orgName'},
      {name: '采购计划编号', field: 'purchasePlanId'},
      {name: '业务类型', field: 'businessType'},
      {name: '采购计划类型', field: 'purchasePlanType', pipe: 'purchasePlanType'},
      {name: '采购方式', field: 'purchaseType', pipe: 'purchaseType'},
      {name: '物料类型', field: 'materialType', pipe: 'materialType2'},
      {name: '计划月份', field: 'monthPlanIn', pipe: 'date: yyyy-MM'},
      {name: '计划员', field: 'allocatePlanner'},
      {name: '所属部门', field: 'departmentName'},
      {name: '备注', field: 'remark', isFullSpan: true},
      {name: '状态', field: 'status', pipe: 'purchasePlanStatus'},
    ];
    this.isFactoryAuditPage = this.operation === 'factoryAudit';
    this.isMaterialAuditPage = this.operation === 'materialAudit';
    this.getPurchasePlanDetail();
  }

}

