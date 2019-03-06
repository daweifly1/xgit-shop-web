import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../layout/layout.module';
import { PlanToReturnService, PlanToReturnServiceNs } from '../../../../core/trans/purchase/plan-to-return.service';
import { ShowMessageService } from './../../../../widget/show-message/show-message';
import { PurchaseServiceNs, PurchaseService } from '../../../../core/trans/purchase.service';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
enum PageTypeEnum {
  ManagePage,
  DeviceDetailPage,
  MaterialDetailPage
}
@Component({
  selector: 'app-return-list',
  templateUrl: './return-list.component.html',
  styleUrls: ['./return-list.component.scss']
})
export class ReturnListComponent implements OnInit {
  currentPage: PageTypeEnum;
  tabPageType = PageTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  showAdvancedSearch: boolean;
  filters: any;
  planReturnList: any;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public detailSearchBy = 'divideNo';
  public operation = 'showDetail';
  purchasePlanNo: string;
  materialTypeList: any;
  constructor(private returnListService: PlanToReturnService,
    private messageService: ShowMessageService,
    private purchaseService: PurchaseService,
    private utilService: UfastUtilService) {
    this.currentPage = this.tabPageType.ManagePage;
    this.showAdvancedSearch = false;
    this.filters = <any>{};
    this.planReturnList = [];
    this.purchasePlanNo = '';
    this.materialTypeList = [];
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public reset() {
    this.filters = {};
    this.getPlanReturnList();
  }
  getPlanReturnList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.returnListService.getReturnList(filter).subscribe((resData: PlanToReturnServiceNs.UfastHttpResT<any>) => {
      this.planReturnList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    });
  }
  public showDetail(purchasePlanNo, materialType) {
    this.purchasePlanNo = purchasePlanNo;
    if (materialType === PurchaseServiceNs.MaterialType.Device) {
      this.currentPage = this.tabPageType.DeviceDetailPage;
      return;
    }
    this.currentPage = this.tabPageType.MaterialDetailPage;
  }
  public onChildEmit(refresh) {
    this.currentPage = this.tabPageType.ManagePage;
    if (!refresh) {
      return;
    }
    this.getPlanReturnList();
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-returnList',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      checkAll: false,
      splitPage: true,
      headers: [
        { title: '采购计划编号', field: 'purchasePlanNo', width: 170, fixed: true },
        // { title: '采购计划编号', tdTemplate: this.showDetailTpl, width: 170, fixed: true },
        { title: '行号', field: 'indexNo', width: 80, fixed: true },
        { title: '计划月份', field: 'planMonth', pipe: 'date: yyyy-MM', width: 100 },
        { title: '业务类型', field: 'businessType', width: 100 },
        { title: '采购计划类型', field: 'purchasePlanType', pipe: 'purchasePlanType', width: 120 },
        { title: '采购方式', field: 'purchaseWay', pipe: 'purchaseType', width: 100 },
        { title: '业务实体', field: 'orgName', width: 100 },
        { title: '物料编码', field: 'materialNo', width: 100 },
        { title: '物料描述', field: 'materialName', width: 150 },
        { title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 100 },
        { title: '技术参数', field: 'technicalParameters', width: 100 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '采购数量', field: 'quantity', width: 100 },
        { title: '需求日期', field: 'needDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: '二级单位计划员', field: 'factoryPlanner', width: 120 },
        { title: '项目编码', field: 'projectCode', width: 100 },
        { title: '项目名称', field: 'projectName', width: 100 },
      ]
    };
    this.getPlanReturnList();
  }

}
