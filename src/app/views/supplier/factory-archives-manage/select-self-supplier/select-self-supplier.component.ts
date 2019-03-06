import {Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {SupplierManageNs, SupplierManageService} from '../../../../core/trans/supplier-manage.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {Observable} from 'rxjs/Observable';
import {DictionaryService, DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';
import {SupplierInfoNs, SupplierInfoService} from '../../../../core/trans/supplier-info.service';
enum FactorySupplierPageType {
  MainPage,
  DetailPage
}
@Component({
  selector: 'app-select-self-supplier',
  templateUrl: './select-self-supplier.component.html',
  styleUrls: ['./select-self-supplier.component.scss']
})
export class SelectSelfSupplierComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @ViewChild('codeTpl')codeTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  filterData: any;
  currentPage: FactorySupplierPageType;
  PageTypeEnum = FactorySupplierPageType;
  advancedSearchShow: boolean;
  supplierDataList: any[];
  detailSupplierId: string;
  supplierStatusList: SupplierManageNs.SelectItemModel[];
  supplyScopeList: DictionaryServiceNs.DictItemModel[];
  companyNatureList: DictionaryServiceNs.DictItemModel[];
  statusOptional: any[];
  constructor(private messageService: ShowMessageService, private supplierManageService: SupplierManageService,
              private dictService: DictionaryService, private supplierInfoService: SupplierInfoService) {
    this.finish = new EventEmitter<any>();
    this.filterData = {};
    this.currentPage = this.PageTypeEnum.MainPage;
    this.advancedSearchShow = false;
  }
  public cancelSelect() {
    this.finish.emit();
  }
  public submitSelect() {
    const idList: string[] = [];
    this.supplierDataList.forEach((item) => {
      if (item[this.tableConfig.checkRowField]) {
        idList.push(item.id);
      }
    });
    if (idList.length === 0) {
      this.messageService.showToastMessage('请选择潜在供应商', 'info');
      return;
    }
    this.messageService.showAlertMessage('', '确定挑选潜在供应商？', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading();
        this.supplierManageService.supplierCommonToSelf(idList).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.finish.emit();
        }, (error) => {
          this.messageService.showAlertMessage('', error.message, 'error');
          this.messageService.closeLoading();
        });
      });
  }
  public resetSearch() {
    this.filterData = {};
    this.getSupplierList();
  }
  getSupplierList = () => {
    const data = {
      pageSize: this.tableConfig.pageSize,
      pageNum: this.tableConfig.pageNum,
      filters: this.filterData
    };
    this.supplierDataList = [];
    this.tableConfig.loading = true;
    this.supplierManageService.getArchivesList(data).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.supplierDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
      this.tableConfig.loading = false;
    });
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
  public selectSupplier(event: UfastTableNs.SelectedChange) {
    const checked = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
    if (event.index === -1) {
      this.tableConfig.checkAll = checked;
      this.supplierDataList.forEach((item: any) => {
        item[this.tableConfig.checkRowField] = checked;
      });
      return;
    }
    this.tableConfig.checkAll = checked;
    if (checked) {
      for (let i = 0, len = this.supplierDataList.length; i < len; i++) {
        if (!this.supplierDataList[this.tableConfig.checkRowField]) {
          this.tableConfig.checkAll = false;
          break;
        }
      }
    }
  }
  private getDataDict() {
    const observerComNature = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.CompanyNature});
    const observerIndustry = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.SuppliyScope});
    const tempList = [this.companyNatureList, this.supplyScopeList];
    Observable.forkJoin(observerComNature, observerIndustry)
      .subscribe((resData: any[]) => {
        resData.forEach((item, index: number) => {
          tempList[index].length = 0;
          if (item.code !== 0) {
            this.messageService.showToastMessage(item.message, 'error');
          }
          tempList[index].push(...item.value);
        });
      }, (error) => {
        tempList.forEach((item) => {
          item.length = 0;
        });
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    this.supplierManageService.getSupplierStatusList().subscribe((resData) => {
      this.supplierStatusList = resData.filter(item => item.id >= SupplierManageNs.SupplierStatus.Temporary);
      this.statusOptional = resData.filter(item => item.id >= SupplierManageNs.SupplierStatus.Standby);
    });
  }
  ngOnInit() {
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      checkRowField: '_checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      id: 'supplier-factoryToSelf',
      headers: [
        {title: '代码', tdTemplate: this.codeTpl, width: 100, fixed: true},
        {title: '公司名称', field: 'name', width: 100},
        {title: '类别', field: 'materialType', width: 100, pipe: 'materialType2'},
        {title: '状态', field: 'status', width: 100, pipe: 'supplierStatus'},
        {title: '等级', field: 'grade', width: 100},
      ]
    };
    this.getSupplierList();
    this.getDataDict();
  }

}
