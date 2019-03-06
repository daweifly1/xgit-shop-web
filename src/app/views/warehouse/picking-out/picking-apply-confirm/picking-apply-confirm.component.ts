import { Component, OnInit, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { PickingApplyService, PickingApplyServiceNs } from '../../../../core/trans/picking-apply.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { ActionCode } from '../../../../../environments/actionCode';
import { UserService, UserServiceNs } from '../../../../core/common-services/user.service';
import {PickingDeliveryService, PickingDeliveryServiceNs} from '../../../../core/trans/picking-delivery.service';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
enum PageTypeEnum {
  ManagePage,
  DetailPage,
  PickingDeliveryDetailPage
}
interface ActionStatus {
  confirm: boolean;
}
interface DetailInfoField {
  name: string;
  field: string;
  pipe?: string;
}
@Component({
  selector: 'app-picking-apply-confirm',
  templateUrl: './picking-apply-confirm.component.html',
  styleUrls: ['./picking-apply-confirm.component.scss']
})
export class PickingApplyConfirmComponent implements OnInit {
  PageType = PageTypeEnum;
  selectedPage: PageTypeEnum;
  @Output() finish: EventEmitter<any>;
  /**
  * 高级搜索条件
  */
  filters: any;

  /**
  * 高级搜索
  */
  fullSearchShow: boolean;

  /**
  * 模板项
  */
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('pickingNoTpl') pickingNoTpl: TemplateRef<any>;

  /**
  * 表头数据
  */
  tableConfig: UfastTableNs.TableConfig;
  /**
  * 表数据
  */
  dataList: any;
  /**
   * 单据状态
   */
  orderStatusList: any[];
  /**
   * 是否配送
   */
  deliveryMethodList: any[];
  /**
   * 详情id
   */
  detailId: string;
  isDistribution: number;
  /**
   * 按钮权限
   */
  actionStatus: { [index: string]: ActionStatus };
  ActionCode = ActionCode;
  /**
   * 出库单详情字段
   */
  orderDetail: PickingDeliveryServiceNs.PickingDeliveryItem;
  detailFieldList: DetailInfoField[];
  agreementField: DetailInfoField[];
  baseField: DetailInfoField[];
  detailTableConfig: UfastTableNs.TableConfig;
  detailMaterialList: PickingDeliveryServiceNs.PickingDeliveryMaterial[];
  constructor(private pickingApplyService: PickingApplyService,
    private messageService: ShowMessageService,
    private userService: UserService,
    private pickingDeliveryService: PickingDeliveryService,
    private utilService: UfastUtilService ) {
    this.finish = new EventEmitter<any>();
    this.selectedPage = this.PageType.ManagePage;
    this.filters = <any>{};
    this.fullSearchShow = false;
    this.dataList = [];
    this.actionStatus = {};
    this.baseField = [
      {name: '领料出库单号', field: 'pickingNo'},
      {name: '出库类型', field: 'type'},
      {name: '领料部门', field: 'applyDepartment'},
      {name: '工段', field: 'section'},
      {name: '保管员', field: 'keeperName'},
      {name: '出库状态', field: 'outStatus', pipe: 'stockOutStatus'},
      {name: '业务实体', field: 'orgName'},
      {name: '计划员', field: 'plannerName'},
      {name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage'},
      {name: '是否配送', field: 'isDistribution', pipe: 'isDistribution'},
      {name: '领料配送单号', field: 'distributionNum'},
      {name: '添加人', field: 'createName'},
      {name: '申请日期', field: 'createDate', pipe: 'date:yyyy-MM-dd'},
      {name: '收货人', field: 'receiverName'},
      {name: '收货人电话', field: 'receiverNumber'},
      {name: '收货地址', field: 'receiverAddress'},
      {name: '客户', field: 'customerName'},
      { name: 'ERP同步', field: 'erpFlag', pipe: 'pickingOutSearchErpSync'},
      { name: 'ERP出库单号', field: 'erpOutNo'},
      {name: '是否协议', field: 'agreementFlag', pipe: 'isAgreement'},
    ];
    this.agreementField = [
      {name: '协议类型', field: 'agreementType', pipe: 'agreementType'},
      {name: '协议号', field: 'agreementCode'},
      {name: '代储供应商', field: 'storageOrgName'},
    ];
    this.detailMaterialList = [];
  }
  /**
  * 高级搜索显隐
  */
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }
  /**
  * 重置
  */
  public reset() {
    this.filters = {};
    this.getDataList();
  }
  // 获取登录信息
  private getUserInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<UserServiceNs.UserInfoModel>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
        return;
      }
      this.filters.plannerName = resData.value.name;
      this.getDataList();
    }, (error) => {
      this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
    });
  }
  getDataList = (pageNum?: number, pageSize?: number) => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
  });
  this.filters.applyDateStart = this.filters.applyDateStart ?
      this.utilService.getStartDate(this.filters.applyDateStart) : undefined;
    this.filters.applyDateEnd = this.filters.applyDateEnd ?
      this.utilService.getEndDate(this.filters.applyDateEnd) : undefined;
    const data = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize || pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.tableConfig.checkAll = false;
    this.pickingApplyService.getPickingApplyConfirmList(data).subscribe((resData: any) => {
      this.tableConfig.loading = false;
      this.dataList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.tableConfig.total = resData.value.total;
      this.dataList = resData.value.list;
      this.dataList.forEach((item) => {
        this.actionStatus[item.id] = {
          confirm: item.status === PickingApplyServiceNs.PickingApplyConfirmStatus.UnConfirm
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.dataList.length; i < len; i++) {
      this.dataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.dataList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }
  public confirm(id, isDistribution) {
    this.detailId = id;
    this.isDistribution = isDistribution;
    this.selectedPage = this.PageType.DetailPage;
  }
  public childPageFinish() {
    this.selectedPage = this.PageType.ManagePage;
    this.getDataList();
  }
  public addPickingOut() {
    const data = [];
    this.dataList.forEach((item) => {
      if (item._checked) {
          data.push(item);
      }
    });
    if (!data.length) {
      this.messageService.showToastMessage('请选择数据', 'warning');
      return;
    }
    let statusFlag = false;
    let isDistributionFlag = false;
    data.forEach((item) => {
      if (item.status !== PickingApplyServiceNs.PickingApplyConfirmStatus.Confirm ) {
        statusFlag = true;
        return;
      }
      if (item.isDistribution !== PickingApplyServiceNs.IsDistribution.TakeTheir) {
        isDistributionFlag = true;
        return;
      }
    });
    if (statusFlag) {
      this.messageService.showToastMessage('请选择已确认的数据', 'warning');
      return;
    }
    if (isDistributionFlag) {
      this.messageService.showToastMessage('请选择自提的数据', 'warning');
      return;
    }
    // 生成出库单
    const applyDetailIds = [];
    data.forEach((item) => {
      applyDetailIds.push(item.id);
    });
    this.messageService.showLoading();
    this.pickingApplyService.addPickingOut({applyDetailIds: applyDetailIds}).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getDataList();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.applyDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.applyDateEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.applyDateStart) {
      return false;
    }
    return endDate.getTime() <= this.filters.applyDateStart.getTime();
  }
  /**领料出库详情页 */
  public toPickingDeliveryDetail(pickingNo) {
    this.selectedPage = this.PageType.PickingDeliveryDetailPage;
    this.orderDetail = <any>{pickingNo: pickingNo};
    this.detailMaterialList = [];
    this.detailFieldList = this.baseField;
    this.pickingDeliveryService.getPickingDeliveryDetail(pickingNo).subscribe(
      (resData: PickingDeliveryServiceNs.PickingDeliveryResT<any>) => {
      this.orderDetail = resData.value;
      this.detailMaterialList = resData.value.detailVOList || [];
      if (this.orderDetail.agreementFlag) {
        this.detailFieldList = this.baseField.concat(this.agreementField);
      }
    });
  }
  public exitDetailPage() {
    this.selectedPage = this.PageType.ManagePage;
  }
  ngOnInit() {
    this.pickingApplyService.getOrderStatusList().subscribe((orderStatusList) => {
      this.orderStatusList = orderStatusList;
    });
    this.pickingApplyService.getDeliveryMethodList().subscribe((deliveryMethodList) => {
      this.deliveryMethodList = deliveryMethodList;
    });
    this.tableConfig = {
      id: 'warehouse-pickingApplyConfirm',
      pageSize: 10,
      showCheckbox: true,
      checkRowField: '_checked',
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 80, fixed: true },
        { title: '状态', field: 'status', width: 120, pipe: 'pickingApplyConfirmStatus', fixed: true },
        { title: '是否配送', field: 'isDistribution', width: 100, pipe: 'isDistribution', fixed: true },
        { title: '领料申请单号', field: 'applyNo', width: 160, fixed: true },
        // { title: '领料出库单号', field: 'pickingNo', width: 160 },
        { title: '领料出库单号', tdTemplate: this.pickingNoTpl, width: 180 },
        { title: '计划员', field: 'plannerName', width: 100 },
        { title: '出库类型', field: 'type', width: 100 },
        { title: '领料部门', field: 'applyDepartment', width: 120 },
        { title: '行号', field: 'rowNo', width: 80 },
        { title: '物料编码', field: 'materialCode', width: 160 },
        { title: '物料名称', field: 'materialName', width: 180 },
        { title: '物料类别', field: 'materialType', width: 100, pipe: 'materialType2' },
        { title: '是否条码管理', field: 'managementMode', width: 150, pipe: 'barcodeManage' },
        { title: '单位', field: 'unit', width: 100 },
        { title: '申请数量', field: 'amountApply', width: 100 },
        { title: '确认数量', field: 'amountConfirm', width: 100 },
        { title: '协议号', field: 'agreementNo', width: 100 },
        { title: '保管员', field: 'keeperName', width: 100 },
        { title: '收货人', field: 'receiverName', width: 100 },
        { title: '收货地点', field: 'receiverAddress', width: 150 },
        { title: '客户', field: 'customerName', width: 150},
        { title: '出库单状态', field: 'outStatus', width: 100, pipe: 'stockOutStatus'},
        { title: '领料申请日期', field: 'applyDate', width: 130, pipe: 'date:yyyy-MM-dd' },
      ]
    };
    this.getUserInfo();
    this.detailTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageSize: 10,
      pageNum: 1,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'rowNo', width: 100},
        {title: '物料编码', field: 'materialCode', width: 150},
        {title: '物料名称', field: 'materialName', width: 150},
        {title: '单位', field: 'unit', width: 100},
        {title: '储位', field: 'warehouseCode', width: 150},
        {title: '出库数量', field: 'amountApply', width: 100},
        {title: '已出库数量', field: 'pickNum', width: 100 },
        {title: '状态', field: 'status', width: 100, pipe: 'stockOutStatus'},
        {title: '需要日期', field: 'needDate', width: 150, pipe: 'date:yyyy-MM-dd'}
      ]
    };
  }

}
