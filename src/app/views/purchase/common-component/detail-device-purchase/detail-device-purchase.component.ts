import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {PurchaseServiceNs, PurchaseService} from '../../../../core/trans/purchase.service';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {environment} from '../../../../../environments/environment';
import {UfastFormDetailNs} from '../../../../layout/ufast-form-detail/ufast-form-detail.component';

@Component({
  selector: 'app-detail-device-purchase',
  templateUrl: './detail-device-purchase.component.html',
  styleUrls: ['./detail-device-purchase.component.scss']
})
export class DetailDevicePurchaseComponent implements OnInit {
  @Input() devicePlanId: string|number;
  @Input() operation: string;     // showDetail: 查看详情; factoryAudit: 厂矿审核; materialAudit: 材设审核
  @Input() searchBy?: string;     // id: 详情通过id搜索; no: 详情通过no搜索; divideNo: 执行详情通过no查询;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('upDownloadTpl') upDownloadTpl: TemplateRef<any>;
  @ViewChild('remarkTpl') remarkTpl: TemplateRef<any>;
  @ViewChild('receiverTpl') receiverTpl: TemplateRef<any>;
  public deviceDetailConfig: UfastFormDetailNs.DetailDataConfig[] = [];
  public devicePurchaseItem: PurchaseServiceNs.DevicePurchaseDetailData = {
    id: '',
    orgName: '',
    purchasePlanId: '',
    purchaseType: null,
    monthPlanIn: '',
    allocatePlanner: '',
    departmentName: '',
    projectCode: '',
    projectName: '',
    totalInvest: null,
    availableAmount: null,
    remainAmount: null,
    planInvest: null,
    remark: '',
    auditRemark: '',
    status: null
  };
  public deviceDetailTableConfig: UfastTableNs.TableConfig;
  public deviceDetailList: PurchaseServiceNs.DevicePurchaseDetailTableData[] = [];
  private purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public isFactoryAuditPage = false;
  public isMaterialAuditPage = false;
  public isShowRefuseModal = false;
  public refuseReason = '';
  public downloadUrl = environment.otherData.fileServiceUrl;
  public lengthLimit = {maxLength: environment.otherData.searchInputMaxLen};

  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService) { }

  private getDevicePurchaseDetail() {
    this.messageService.showLoading();
    this.deviceDetailList = [];
    let req = null;
    if (this.searchBy === 'no') {
      req = this.purchaseService.getPurchaseDetailByNo(this.devicePlanId);
    } else if (this.searchBy === 'divideNo') {
      req = this.purchaseService.getPurchaseExecuteDetail(this.devicePlanId);
    } else {
      req = this.purchaseService.getPurchaseDetail(this.devicePlanId);
    }
    req.subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      Object.keys(this.devicePurchaseItem).forEach((item) => {
        if (this.purchaseDataMap[item].parentKey) {
          this.devicePurchaseItem[item] = resData.value[this.purchaseDataMap[item].parentKey][this.purchaseDataMap[item].key];
          return;
        }
        this.devicePurchaseItem[item] = resData.value[this.purchaseDataMap[item].key];
      });
      if ((this.devicePurchaseItem.status === PurchaseServiceNs.PurchasePlanStatus.RefuseAudit)
        || (this.devicePurchaseItem.status === PurchaseServiceNs.PurchasePlanStatus.MaterialRefuseAudit)) {
        this.deviceDetailConfig.splice(11, 0, {
          name: '拒绝原因',
          field: 'auditRemark',
          isFullSpan: true
        });
      }
      resData.value.purchasePlanDetailsVOS.forEach((item, index) => {
        const detailItem = {
          index: index,
          id: item[this.purchaseDataMap.id.key],
          lineNo: item[this.purchaseDataMap.lineNo.key],
          materialCode: item[this.purchaseDataMap.materialCode.key],
          materialDescription: item[this.purchaseDataMap.materialDescription.key],
          unit: item[this.purchaseDataMap.unit.key],
          materialModel: item[this.purchaseDataMap.materialModel.key],
          technicalParameters: item[this.purchaseDataMap.technicalParameters.key],
          brand: item[this.purchaseDataMap.brand.key],
          demandAmount: item[this.purchaseDataMap.demandAmount.key],
          demandDate: item[this.purchaseDataMap.demandDate.key],
          unitPriceAbout: item[this.purchaseDataMap.unitPriceAbout.key],
          receiver: item[this.purchaseDataMap.receiver.key],
          remark: item[this.purchaseDataMap.remark.key],
          status: item[this.purchaseDataMap.status.key],
          lineTotalPrice: item[this.purchaseDataMap.lineTotalPrice.key],
          attachment: item[this.purchaseDataMap.attachment.key],
          annexName: item[this.purchaseDataMap.annexName.key]
        };
        this.deviceDetailList = [...this.deviceDetailList, detailItem];
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
  private agreeFactoryAudit() {
    this.messageService.showAlertMessage('', '是否确认通过该审核', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        const filters = {
          id: this.devicePlanId
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
  private refuseFactoryAudit() {
    if (!this.refuseReason) {
      this.messageService.showToastMessage('请填写拒绝原因', 'warning');
      return;
    }
    const filters = {
      id: this.devicePlanId,
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
  private agreeMaterialAudit() {
    this.messageService.showAlertMessage('', '是否确认通过该审核', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        const filters = {
          id: this.devicePlanId
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
  private refuseMaterialAudit() {
    if (!this.refuseReason) {
      this.messageService.showToastMessage('请填写拒绝原因', 'warning');
      return;
    }
    const filters = {
      id: this.devicePlanId,
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
  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }

  ngOnInit() {
    this.deviceDetailConfig = [
      {name: '业务实体', field: 'orgName'},
      {name: '采购计划编号', field: 'purchasePlanId'},
      {name: '采购方式', field: 'purchaseType', pipe: 'purchaseType'},
      {name: '计划月份', field: 'monthPlanIn', pipe: 'date: yyyy-MM'},
      {name: '计划员', field: 'allocatePlanner'},
      {name: '所属部门', field: 'departmentName'},
      {name: '项目编码', field: 'projectCode'},
      {name: '项目名称', field: 'projectName'},
      {name: '项目总投资(万)', field: 'totalInvest'},
      {name: '当年剩余投资(万)', field: 'remainAmount'},
      // {name: '状态', field: 'status', pipe: 'purchasePlanStatus'},
      // {name: '备注', field: 'remark', isFullSpan: true},
    ];
    this.deviceDetailTableConfig = {
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
        {title: '物料描述', field: 'materialDescription', width: 140},
        {title: '单位', field: 'unit', width: 100},
        {title: '型号规格', field: 'materialModel', width: 120},
        {title: '技术参数', field: 'technicalParameters', width: 120},
        {title: '品牌厂家', field: 'brand', width: 120},
        {title: '需求数量', field: 'demandAmount', width: 120},
        {title: '需求日期', field: 'demandDate', pipe: 'date: yyyy-MM-dd', width: 140},
        {title: '概算单价', field: 'unitPriceAbout', width: 120},
        {title: '通知接收人', tdTemplate: this.receiverTpl, width: 120},
        {title: '备注', tdTemplate: this.remarkTpl, width: 100},
        {title: '行总金额', field: 'lineTotalPrice', width: 80},
        {title: '附件', tdTemplate: this.upDownloadTpl, width: 80},
      ]
    };
    this.isFactoryAuditPage = this.operation === 'factoryAudit';
    this.isMaterialAuditPage = this.operation === 'materialAudit';
    this.getDevicePurchaseDetail();
  }

}
