import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
import { ActionCode } from '../../../../environments/actionCode';

enum SupperAuditPageType {
  MainPage,
  DetailPage,
  RecommendPage
}
interface ActionStatus {
  recommend: boolean;   // 推荐
  lurking: boolean;     // 潜在
  register: boolean;
}
@Component({
  selector: 'app-registration-audit',
  templateUrl: './registration-audit.component.html',
  styleUrls: ['./registration-audit.component.scss']
})
export class RegistrationAuditComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('supplierNameTpl') supplierNameTpl: TemplateRef<any>;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  PageTypeEnum = SupperAuditPageType;
  ActionCode = ActionCode;
  currentPage: SupperAuditPageType;
  advancedSearchShow: boolean;
  filters: any;
  actionStatus: {[index: string]: ActionStatus};
  selectedSupplierId: string;
  supplierStatusList: SupplierManageNs.SelectItemModel[];
  recommendSrouce = SupplierManageNs.RecommendSource.Common;
  constructor(private messageService: ShowMessageService, private supplierManageService: SupplierManageService,
              private supplierInfoService: SupplierInfoService, private utilService: UfastUtilService) {
    this.dataList = [];
    this.advancedSearchShow = false;
    this.filters = {};
    this.currentPage = this.PageTypeEnum.MainPage;
    this.actionStatus = {};
    this.supplierStatusList = [];
  }
  public advancedSearchBtn() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getDataList();
  }
  getDataList = () => {
    this.filters.startRegistDate = this.utilService.getStartDate(this.filters.startRegistDate);
    this.filters.endRegistDate = this.utilService.getEndDate(this.filters.endRegistDate);
    const data = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: this.filters
    };
    this.dataList = [];
    this.actionStatus = {};
    this.dataTableConfig.loading = true;
    this.supplierManageService.getRegisterAndPotentList(data)
      .subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
        this.dataTableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.dataTableConfig.total = resData.value.total;
        this.dataList = resData.value.list ;
        resData.value.list.forEach((item) => {
          this.actionStatus[item.supplierId] = {
            recommend: item.status === SupplierManageNs.SupplierStatus.Lurking,
            lurking: item.status !== SupplierManageNs.SupplierStatus.Lurking,
            register: item.status !== SupplierManageNs.SupplierStatus.Register
          };
          item['workAddressAll'] = `${item.workAreaName} ${item.workDetailsAddress}`;
        });
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
        this.dataTableConfig.loading = false;
      });
  }
  public setLurking(id: string) {
    this.setStatus('确定设为潜在吗?', this.supplierManageService.setPotentialStatus(id));
  }
  public setRegister(id: string) {
    this.setStatus('确定设为注册吗?', this.supplierManageService.setRegistStatus(id));
  }
  private setStatus(message: string, observer) {
    this.messageService.showAlertMessage('', message, 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        observer.subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getDataList();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public goRecommend(supplierId: string) {
    this.selectedSupplierId = supplierId;
    this.currentPage = this.PageTypeEnum.RecommendPage;
  }
  public goDetailPage(id) {
    this.currentPage = this.PageTypeEnum.DetailPage;
    this.selectedSupplierId = id;
  }
  public returnMainPage() {
    this.currentPage = this.PageTypeEnum.MainPage;
    this.getDataList();
  }
  public trackById(index: number, item: any) {
    return item;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.endRegistDate) {
      return false;
    }
    return startDate.getTime() > this.filters.endRegistDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.startRegistDate) {
      return false;
    }
    return endDate.getTime() <= this.filters.startRegistDate.getTime();
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
      id: 'supplier-registrationAudit',
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 150},
        {title: '公司名称', tdTemplate: this.supplierNameTpl, width: 100},
        {title: '状态', field: 'status', width: 100, pipe: 'supplierStatus'},
        {title: '联系人', field: 'contact', width: 100},
        {title: '联系电话', field: 'phone', width: 100},
        {title: '地址', field: 'workAddressAll', width: 200},
        {title: '合作范围', field: 'cooperationScope', width: 100},
      ]
    };
    this.getDataList();
    this.supplierManageService.getSupplierStatusList().subscribe((data) => {
      this.supplierStatusList = data.filter(item => item.id > SupplierManageNs.SupplierStatus.Save &&
        item.id <= SupplierManageNs.SupplierStatus.Lurking);
    });
  }
}
