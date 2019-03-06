import { AgreementSettlementService, AgreementSettlementServiceNs } from './../../../core/trans/warehouse/agreement-settlement.service';
import { ActionCode } from './../../../../environments/actionCode';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UfastTableNs } from '../../../layout/layout.module';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  DetailPage,
  EditPage
}
interface ActionStatus {
  edit: boolean;
  del: boolean;
}
@Component({
  selector: 'app-agreement-settlement',
  templateUrl: './agreement-settlement.component.html',
  styleUrls: ['./agreement-settlement.component.scss']
})
export class AgreementSettlementComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  @ViewChild('codeTpl') codeTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  agreementSettlementList: AgreementSettlementServiceNs.AgreementSettlementList[];
  ActionCode = ActionCode;
  filters: AgreementSettlementServiceNs.AgreementSettlementFilter;
  showAdvancedSearch: boolean;
  detailId: string;
  actionStatus: { [index: string]: ActionStatus };

  constructor(private agreementSettlementService: AgreementSettlementService,
    private messageService: ShowMessageService) {
    this.currentPage = this.tabPageType.ManagePage;
    this.agreementSettlementList = [];
    this.filters = <any>{};
    this.showAdvancedSearch = false;
    this.detailId = '';
    this.actionStatus = {};
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public reset() {
    this.filters = {};
    this.getAgreementSettlementList();
  }
  getAgreementSettlementList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.agreementSettlementService.getAgreementSettlementList(filter).subscribe(
      (resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
        this.agreementSettlementList = resData.value.list;
        this.tableConfig.total = resData.value.total;
        this.agreementSettlementList.forEach((item) => {
          this.actionStatus[item.id] = {
            edit: item.status !== AgreementSettlementServiceNs.AgreementSettlementStatus.finish,
            del: item.status !== AgreementSettlementServiceNs.AgreementSettlementStatus.finish
          };
        });
      });
  }
  public addAgreementSettlement() {
    this.detailId = '';
    this.currentPage = this.tabPageType.AddPage;
  }
  public detail(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.DetailPage;
  }
  public editAgreementSettlement(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public delAgreementSettlement(id) {
    const ids = [];
    ids.push(id);
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.agreementSettlementService.delAgreementSettlement(ids), true);
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getAgreementSettlementList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public submitPlan() {
    const ids = [];
    this.agreementSettlementList.forEach((item) => {
      if (item[this.tableConfig.checkRowField]) {
        ids.push(item.id);
      }
    });
    if (!ids.length) {
      this.messageService.showToastMessage('请选择要提交的数据', 'warning');
      return;
    }
    this.agreementSettlementService.submitPlan(ids).subscribe((resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.getAgreementSettlementList();
    });
  }
  public onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getAgreementSettlementList();
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-agreementSettlement',
      showCheckbox: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 100 },
        { title: '单据编号', tdTemplate: this.codeTpl, width: 180 },
        { title: '供应商', field: 'vendorName', width: 200 },
        { title: '协议号', field: 'agreementCode', width: 140 },
        { title: '领料部门', field: 'applyDepartment', width: 100 },
        { title: '工段', field: 'section', width: 60 },
        { title: '单据日期', field: 'createDate', width: 130, pipe: 'date:yyyy-MM-dd HH:mm' },
        { title: '录入人员', field: 'recordUserName', width: 80 },
        { title: '状态', field: 'status', width: 100, pipe: 'agreementSettlementStatus' }
      ]
    };
    this.getAgreementSettlementList();
  }

}
