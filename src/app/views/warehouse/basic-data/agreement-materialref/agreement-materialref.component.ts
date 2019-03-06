import { ActionCode } from './../../../../../environments/actionCode';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  AgreementMaterialrefService,
  AgreementMaterialrefServiceNs
} from './../../../../core/trans/warehouse/agreement-materialref.service';
import { UfastTableNs } from '../../../../layout/layout.module';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage
}
interface ActionStatus {
  edit: boolean;
  del: boolean;
}

@Component({
  selector: 'app-agreement-materialref',
  templateUrl: './agreement-materialref.component.html',
  styleUrls: ['./agreement-materialref.component.scss']
})
export class AgreementMaterialrefComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  agreementMaterialrefList: any[];
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  ActionCode = ActionCode;
  filters: any;
  showAdvancedSearch: boolean;
  actionStatus: { [index: string]: ActionStatus };
  detailId: string;

  constructor(private agreementMaterialrefService: AgreementMaterialrefService,
    private messageService: ShowMessageService) {
    this.currentPage = this.tabPageType.ManagePage;
    this.agreementMaterialrefList = [];
    this.filters = <any>{};
    this.showAdvancedSearch = false;
    this.detailId = '';
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public reset() {
    this.filters = {};
    this.getAgreementMaterialrefList();
  }
  getAgreementMaterialrefList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.agreementMaterialrefService.getAgreementMaterialrefList(filter).subscribe(
      (resData: AgreementMaterialrefServiceNs.UfastHttpResT<any>) => {
        this.agreementMaterialrefList = resData.value.list;
        this.tableConfig.total = resData.value.total;
        this.actionStatus = {};
        this.agreementMaterialrefList.forEach((item, index) => {
          this.actionStatus[item.id] = {
            edit: true,
            del: true
          };
        });
      });
  }
  public addAgreementMaterialref() {
    this.detailId = '';
    this.currentPage = this.tabPageType.AddPage;
  }
  public edit(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public del(id) {
    const ids = [];
    ids.push(id);
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.agreementMaterialrefService.delAgreementMaterialref(ids), true);
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: AgreementMaterialrefServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getAgreementMaterialrefList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getAgreementMaterialrefList();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-agreementMaterialref',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 50 },
        // { title: '序号', field: '', width: 50 },
        { title: '物料编码', field: 'materialCode', width: 60 },
        { title: '物料描述', field: 'materialDesc', width: 100 },
        { title: '单位', field: 'unit', width: 40 },
        { title: '结算物料编码', field: 'settlementMaterialCode', width: 60 },
        { title: '结算物料描述', field: 'settlementMaterialDesc', width: 100 },
        { title: '结算单位', field: 'settlementUnit', width: 40 }
      ]
    };
    this.getAgreementMaterialrefList();
  }

}
