import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UfastTableNs } from '../../../../layout/layout.module';
import { PickingApplyService, PickingApplyServiceNs } from '../../../../core/trans/picking-apply.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { PickingApply } from '../../../../../environments/printData';
import { PrintTplSelectorService } from '../../../../widget/print-tpl-selector/print-tpl-selector';
import { ActionCode } from '../../../../../environments/actionCode';
enum PageTypeEnum {
  ManagePage,
  AddOrEditPage,
  DetailPage,
  DeliverPage
}
interface ActionStatus {
  edit: boolean;
  del: boolean;
}
@Component({
  selector: 'app-picking-apply',
  templateUrl: './picking-apply.component.html',
  styleUrls: ['./picking-apply.component.scss']
})
export class PickingApplyComponent implements OnInit {
  PageType = PageTypeEnum;
  currentPage: PageTypeEnum;

  @ViewChild('orderNoTpl') orderNoTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  orderTableConfig: UfastTableNs.TableConfig;
  orderDataList: PickingApplyServiceNs.PickingApplyOrder[];
  listFilters: any;

  operateOrderNo: string;
  showAdvancedSearch: boolean;

  // 订单详情
  orderDetail: PickingApplyServiceNs.PickingApplyOrder;
  detailTableConfig: UfastTableNs.TableConfig;
  detailMaterialList: PickingApplyServiceNs.MaterialDetail[];
  detailFieldList: { field: string; name: string; pipe?: string; }[];

  showAudit: boolean;
  auditStatusList: { status: number; name: string }[];
  auditData: PickingApplyServiceNs.AuditData;
  AuditStatus = PickingApplyServiceNs.AuditStatus;
  actionStatus: { [index: string]: ActionStatus };
  ActionCode = ActionCode;
  constructor(private dataService: PickingApplyService, private messageService: ShowMessageService,
    private printTplSelector: PrintTplSelectorService) {
    this.actionStatus = {};
    this.auditData = {
      ids: [],
      status: PickingApplyServiceNs.AuditStatus.Pass,
      remark: ''
    };
    this.showAudit = false;
    this.auditStatusList = [
      { status: PickingApplyServiceNs.AuditStatus.Pass, name: '审批通过' },
      { status: PickingApplyServiceNs.AuditStatus.Reject, name: '审批拒绝' }
    ];

    this.operateOrderNo = '';
    this.currentPage = this.PageType.ManagePage;
    this.listFilters = {};
    this.showAdvancedSearch = false;

    this.orderDetail = null;
    this.detailMaterialList = [];
    // 订单详情展示字段列表
    this.detailFieldList = [
      { field: 'applyNo', name: '领料申请单号' },
      { field: 'orgName', name: '业务实体' },
      { field: 'type', name: '出库类型' },
      { field: 'applyDepartment', name: '领料部门' },
      { field: 'section', name: '工段' },
      { field: 'isDistribution', name: '是否配送', pipe: 'isDistribution' },
      { field: 'receiverName', name: '收货人' },
      { field: 'receiverNumber', name: '收货人电话' },
      { field: 'receiverAddress', name: '收货地址' },
      { field: 'applyName', name: '申请人' },
      { field: 'applyDate', name: '申请日期', pipe: 'date:yyyy-MM-dd' },
      { field: 'customerName', name: '客户' },
    ];
  }
  getList = () => {
    Object.keys(this.listFilters).filter(item => typeof this.listFilters[item] === 'string').forEach((key: string) => {
      this.listFilters[key] = this.listFilters[key].trim();
  });
    const filter = {
      pageNum: this.orderTableConfig.pageNum,
      pageSize: this.orderTableConfig.pageSize,
      filters: this.listFilters
    };
    this.orderTableConfig.loading = true;
    this.orderTableConfig.checkAll = false;
    this.orderDataList = [];
    this.dataService.getOrderList(filter).subscribe((resData: PickingApplyServiceNs.PostListRes) => {
      this.orderTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.orderTableConfig.total = resData.value.total;
      this.actionStatus = {};
      this.orderDataList = resData.value.list;
      this.orderDataList.forEach((item) => {
        this.calcPermission(item);
      });
    }, (error) => {
      this.orderTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private calcPermission(item: PickingApplyServiceNs.PickingApplyOrder) {
    this.actionStatus[item.id] = {
      edit: item.status === PickingApplyServiceNs.PickingApplyStatus.UnCommited,
      del: item.status === PickingApplyServiceNs.PickingApplyStatus.UnCommited,
    };
  }
  public trackById(index: number, item: any) {
    return item;
  }


  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public resetFilter() {
    this.listFilters = {};
    this.getList();
  }
  public childPageFinish() {
    this.currentPage = this.PageType.ManagePage;
    this.getList();
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public toggleAdd() {
    this.operateOrderNo = null;
    this.currentPage = this.PageType.AddOrEditPage;
  }
  public toggleEdit(id: string) {
    if (!this.actionStatus[id].edit) {
      return;
    }
    this.currentPage = this.PageType.AddOrEditPage;
    this.operateOrderNo = id;
  }
  public deleteOrder(id: string) {
    if (!this.actionStatus[id].del) {
      return;
    }
    this.batchDeleteOrder([id]);
  }

  private batchDeleteOrder(orderNoList: string[]) {
    this.messageService.showAlertMessage('', '确定删除所选的订单吗？', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.dataService.batchDeleteOrder(orderNoList).subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getList();
        });
      });
  }

  /**********详情页**********/
  public toggleDetail(id: string) {
    this.currentPage = this.PageType.DetailPage;
    this.viewOrderDetail(id);
  }
  private viewOrderDetail(id: string, callback?: Function) {
    this.orderDetail = <any>{ id: id };
    this.detailMaterialList = [];
    this.dataService.getOrderDetail(id)
      .subscribe((resData: PickingApplyServiceNs.PickingApplyResT<PickingApplyServiceNs.PickingApplyOrder>) => {
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.orderDetail = resData.value;
        this.calcPermission(this.orderDetail);
        this.detailMaterialList = resData.value.pickingApplyDetailVOs;
        if (callback) {
          callback();
        }
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  ngOnInit() {
    this.orderTableConfig = {
      id: 'warehouse-pickingApply',
      checkAll: false,
      showCheckbox: false,
      checkRowField: '_checked',
      showPagination: true,
      pageNum: 1,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      loading: false,
      total: 0,
      splitPage: true,
      headers: [
        { title: '操作', width: 100, fixed: true, tdTemplate: this.operationTpl },
        { title: '业务实体', field: 'orgName', width: 100, fixed: true },
        { title: '领料申请单号', width: 180, tdTemplate: this.orderNoTpl, fixed: true },
        { title: '是否配送', field: 'isDistribution', width: 100, pipe: 'isDistribution' },
        { title: '出库类型', field: 'type', width: 100 },
        { title: '领料部门', field: 'applyDepartment', width: 100 },
        { title: '工段', field: 'section', width: 100 },
        { title: '领料人', field: 'applyName', width: 100 },
        { title: '申请日期', field: 'applyDate', width: 130, pipe: 'date:yyyy-MM-dd' },
        { title: '状态', field: 'status', width: 120, pipe: 'pickingApplyStatus' }
      ]
    };
    this.detailTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageSize: 10,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '行号', field: 'rowNo', width: 80, fixed: true },
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '物料名称', width: 200, field: 'materialName' },
        { title: '单位', field: 'unit', width: 100 },
        { title: '物料类别', field: 'materialType', width: 80, pipe: 'materialType2' },
        { title: '申请数量', field: 'amountApply', width: 80 },
        { title: '计划员', field: 'planner', width: 100 },
        { title: '是否条码管理', width: 120, field: 'barcodeFlag', pipe: 'barcodeManage' },
        { title: '需要日期', field: 'needDate', width: 130, pipe: 'date:yyyy-MM-dd' }
      ]
    };
    this.getList();
  }
}
