import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import TableConfig = UfastTableNs.TableConfig;
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
enum RecomAuditPageType {
  MainPage,
  DetailPage
}
@Component({
  selector: 'app-modify-audit',
  templateUrl: './modify-audit.component.html',
  styleUrls: ['./modify-audit.component.scss']
})
export class ModifyAuditComponent implements OnInit {
  @ViewChild('codeTpl') codeTpl: TemplateRef<any>;
  PageTypeEnum = RecomAuditPageType;
  currentPage: RecomAuditPageType;
  dataTableConfig: TableConfig;
  dataList: any[];
  filters: any;
  advancedSearchShow: boolean;
  auditStatusList: SupplierManageNs.SelectItemModel[];
  selectedCode: string;
  constructor(private messageService: ShowMessageService, private supplierManageService: SupplierManageService) {
    this.currentPage = this.PageTypeEnum.MainPage;
    this.filters = {};
    this.advancedSearchShow = false;
    this.auditStatusList = [];
    this.dataList = [];
  }
  public advancedSearchBtn() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getDataList();
  }
  getDataList = () => {
    const filters = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: this.filters
    };
    this.dataTableConfig.loading = true;
    this.dataList = [];
    this.supplierManageService.getSupplierModifyAuditList(filters).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.dataTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataTableConfig.total = resData.value.total;
      this.dataList = resData.value.list;
    }, (error) => {
      this.dataTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public returnMainPage() {
    this.selectedCode = null;
    this.currentPage = this.PageTypeEnum.MainPage;
    this.getDataList();
  }
  public goDetailPage(id: string) {
    this.selectedCode = id;
    this.currentPage = this.PageTypeEnum.DetailPage;
  }
  private getDataDict() {
    this.supplierManageService.getSupplierAuditStatusList().subscribe((resData) => {
      this.auditStatusList = resData;
    });
  }
  ngOnInit() {
    this.dataTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      id: 'supplier-modifyAudit',
      headers: [
        {title: '代码', tdTemplate: this.codeTpl, width: 120, fixed: true},
        {title: '公司名称', field: 'name', width: 150},
        // {title: '类别', field: 'materialType', width: 80, pipe: 'materialType2'},
        // {title: '状态', field: '', width: 120},
        {title: '审核状态', field: 'auditStatus', width: 80, pipe: 'supplierAuditStatus'},
        {title: '提交时间', field: 'createDate', width: 100, pipe: 'date:yyyy-MM-dd HH:mm'},
      ]
    };
    this.getDataList();
    this.getDataDict();
  }

}
