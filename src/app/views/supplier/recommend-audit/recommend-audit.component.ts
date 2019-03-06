import { ActionCode } from './../../../../environments/actionCode';
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {DictionaryService, DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
import {Observable} from 'rxjs/Observable';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {UserService, UserServiceNs} from '../../../core/common-services/user.service';
import {environment} from '../../../../environments/environment';
enum RecomAuditPageType {
  MainPage,
  DetailPage,
  RecommendPage
}
interface ActionStatus {
  audit: boolean;
}
@Component({
  selector: 'app-recommend-audit',
  templateUrl: './recommend-audit.component.html',
  styleUrls: ['./recommend-audit.component.scss']
})
export class RecommendAuditComponent implements OnInit {
  @ViewChild('operationTpl')operationTpl: TemplateRef<any>;
  @ViewChild('companyTpl')companyTpl: TemplateRef<any>;
  @ViewChild('codeTpl')codeTpl: TemplateRef<any>;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  PageType = RecomAuditPageType;
  ActionCode = ActionCode;
  currentPage: RecomAuditPageType;
  advancedSearchShow: boolean;
  filters: any;
  supplyScopeList: DictionaryServiceNs.DictItemModel[];
  companyNatureList: DictionaryServiceNs.DictItemModel[];
  supplierStatusList: SupplierManageNs.SelectItemModel[];
  actionStatus: {[index: string]: ActionStatus};
  detailBacisInfo: any;
  selectedCode: string;
  selecedId: string;
  isFactory: boolean;
  companyTypeList: DictionaryServiceNs.DictItemModel[];
  constructor(private messageService: ShowMessageService, private supplierInfoService: SupplierInfoService,
              private dictService: DictionaryService, private supplierManageService: SupplierManageService,
              private userService: UserService) {
    this.currentPage = this.PageType.MainPage;
    this.advancedSearchShow = false;
    this.filters = {};
    this.supplyScopeList = [];
    this.companyNatureList = [];
    this.supplierStatusList = [];
    this.actionStatus = {};
    this.companyTypeList = [];
  }
  public advancedSearchBtn() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getDataList();
  }
  public goDetialPage(code: string, id: string) {
    this.selecedId = id;
    this.detailBacisInfo = {};
    this.messageService.showLoading('');
    this.supplierManageService.getRecommendSupplierInfo(code)
      .subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.detailBacisInfo = resData.value;
        this.currentPage = this.PageType.DetailPage;
        this.selectedCode = code;
      }, (error) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public returnMainPage() {
    this.currentPage = this.PageType.MainPage;
  }
  getDataList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filtersData: SupplierManageNs.Filters<any> = {
      pageNum: this.dataTableConfig.pageNum,
      pageSize: this.dataTableConfig.pageSize,
      filters: this.filters
    };
    this.dataList = [];
    this.actionStatus = {};
    this.dataTableConfig.loading = true;
    this.supplierManageService.getManageRecommendAuditList(filtersData).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.dataTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.dataTableConfig.total = resData.value.total;
      this.dataList.forEach((item) => {

        this.actionStatus[item.id] = {
          audit: item['auditStatus'] === SupplierManageNs.SupplierAuditStatus.WaitAudit ||
          (!this.isFactory && item['auditStatus'] === SupplierManageNs.SupplierAuditStatus.WaitAudit2)
        };
      });
    }, (error) => {
      this.dataTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  private getDataDict() {
    const observerComNature = this.dictService.getDataDictionarySearchList({parentCode : DictionaryServiceNs.TypeCode.CompanyNature});
    const observerIndustry = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.SuppliyScope});
    const observerCompanyType = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.CompanyType});
    const tempList = [this.companyNatureList, this.supplyScopeList, this.companyTypeList];
    Observable.forkJoin(observerComNature, observerIndustry, observerCompanyType)
      .subscribe((resData: any[]) => {
        resData.forEach((item, index: number) => {
          tempList[index].length = 0;
          if (item.code !== 0) {
            this.messageService.showToastMessage(item.message, 'error');
          }
          tempList[index].push(...item.value);
        });
      }, (error) => {
        tempList.forEach((item) => {item.length = 0; });
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    this.supplierManageService.getSupplierStatusList().subscribe((resData) => {
      this.supplierStatusList = resData.filter(item => item.id >= SupplierManageNs.SupplierStatus.Temporary);
    });
  }
  /**
   * 审核通过
   * */
  public onAuditPass(code?, auditResult?: boolean) {
    code = code || this.selectedCode;
    this.doAudit(auditResult, () => {
      return this.supplierManageService.recommendAuditPass(code);
    });
  }
  /**
   * 审核拒绝
   * */
  public onAuditReject(code?, auditResult?: boolean) {
    code = code || this.selectedCode;
    this.doAudit(auditResult, () => {
      return this.supplierManageService.recommendAuditReject(code);
    });
  }
  /**
   * 查看推荐表*/
  public viewRecommendInfo(id: string, code: string) {
    this.selectedCode = code;
    this.currentPage = this.PageType.RecommendPage;
    this.selecedId = id;
  }
  private doAudit( auditResult: boolean, callback: () => Observable<any>) {
    let promptMessage = '';
    if (auditResult) {
      promptMessage = '确定审核通过吗?';
    } else {
      promptMessage = '确定审核拒绝吗?';
    }
    this.messageService.showAlertMessage('', promptMessage, 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        callback().subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getDataList();
          this.returnMainPage();
        });
      }, (error) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
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
      id: 'supplier-recommendAudit',
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 80, fixed: true},
        {title: '代码', tdTemplate: this.codeTpl, width: 120, fixed: true},
        {title: '审核状态', field: 'auditStatus', width: 120, pipe: 'supplierAuditStatus', fixed: true},
        {title: '公司名称', tdTemplate: this.companyTpl, width: 150, fixed: true},
        {title: '企业性质', field: 'companyNature', width: 130},
        {title: '企业类型', field: 'companyType', width: 130},
        {title: '类别', field: 'materialType', width: 80, pipe: 'materialType2'},
        {title: '推荐类型', field: 'recomentFor', width: 100, pipe: 'supplierType'},
        // {title: '供应范围', field: 'supplyRange', width: 120},
        {title: '提交时间', field: 'createDate', width: 130, pipe: 'date:yyyy-MM-dd HH:mm'},
      ]
    };
    this.getDataDict();
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<UserServiceNs.UserInfoModel>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.isFactory = resData.value.spaceId !== environment.otherData.managerId;
      this.getDataList();
    }, (error) => {
      this.messageService.showToastMessage(error.message, 'error');
    });
  }

}
