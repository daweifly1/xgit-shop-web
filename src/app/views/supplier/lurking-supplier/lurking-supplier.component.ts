import { ActionCode } from './../../../../environments/actionCode';
import {Component, EventEmitter, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';

enum FactorySupplierPageType {
  MainPage,
  DetailPage,
  RecommendPage
}
interface ActionStatus {
  recommend: boolean;
}
@Component({
  selector: 'app-lurking-supplier',
  templateUrl: './lurking-supplier.component.html',
  styleUrls: ['./lurking-supplier.component.scss']
})
export class LurkingSupplierComponent implements OnInit {
  @ViewChild('supplierNameTpl')supplierNameTpl: TemplateRef<any>;
  @ViewChild('operationTpl')operationTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  filterData: any;
  currentPage: FactorySupplierPageType;
  PageTypeEnum = FactorySupplierPageType;
  advancedSearchShow: boolean;
  supplierDataList: any[];
  detailSupplierId: string;
  actionStatus: { [index: string]: ActionStatus };
  recommendSource: SupplierManageNs.RecommendSource;
  ActionCode = ActionCode;
  constructor(private messageService: ShowMessageService, private supplierManageService: SupplierManageService,
              private utilService: UfastUtilService) {
    this.filterData = {};
    this.currentPage = this.PageTypeEnum.MainPage;
    this.advancedSearchShow = false;
    this.actionStatus = {};
    this.recommendSource = SupplierManageNs.RecommendSource.Self;
  }

  public resetSearch() {
    this.filterData = {};
    this.getSupplierList();
  }
  public onAdvancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filterData.endRegistDate) {
      return false;
    }
    return startDate.getTime() > this.filterData.endRegistDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filterData.startRegistDate) {
      return false;
    }
    return endDate.getTime() <= this.filterData.startRegistDate.getTime();
  }
  public recommendSupplier(supplierId: string) {
    this.detailSupplierId = supplierId;
    this.currentPage = this.PageTypeEnum.RecommendPage;
  }
  getSupplierList = () => {
    this.tableConfig.loading = true;
    const data = {
      pageSize: this.tableConfig.pageSize,
      pageNum: this.tableConfig.pageNum,
      filters: this.filterData
    };
    this.filterData.startRegistDate = this.utilService.getStartDate(this.filterData.startRegistDate);
    this.filterData.endRegistDate = this.utilService.getStartDate(this.filterData.endRegistDate);
    this.supplierManageService.getPotentialSupplierList(data)
      .subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
        this.tableConfig.loading = false;
        this.tableConfig.checkAll = false;
        this.supplierDataList = [];
        this.actionStatus = {};
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.supplierDataList = resData.value.list;
        this.tableConfig.total = resData.value.total;
        this.supplierDataList.forEach((item) => {
          this.actionStatus[item.id] = {
            recommend: !item['existed']
          };
        });
      }, (error) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public goDetailPage(supplierId: string) {
    this.detailSupplierId = supplierId;
    this.currentPage = this.PageTypeEnum.DetailPage;
  }
  public returnMainPage() {
    this.currentPage = this.PageTypeEnum.MainPage;
  }

  ngOnInit() {
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      id: 'supplier-factorySelectSupplier',
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 80},
        {title: '是否已存在', field: 'existed', width: 80, pipe: 'supplierRecommend'},
        {title: '公司名称', tdTemplate: this.supplierNameTpl, width: 100},
        {title: '联系人', field: 'contact', width: 100},
        {title: '联系电话', field: 'phone', width: 100},
        {title: '地址', field: 'workAreaName', width: 100},
        {title: '状态', field: 'status', width: 100, pipe: 'supplierStatus'},
        {title: '合作范围', field: 'cooperationScope', width: 100}
      ]
    };
    this.getSupplierList();
  }

}
