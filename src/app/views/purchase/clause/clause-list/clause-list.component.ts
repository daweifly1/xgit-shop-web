import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { ActionCode } from '../../../../../environments/actionCode';
import { ContractClauseListService, ContractClauseListServiceNs } from '../../../../core/trans/purchase/contract-clause-list.service';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage,
  DetailPage
}

@Component({
  selector: 'app-clause-list',
  templateUrl: './clause-list.component.html',
  styleUrls: ['./clause-list.component.scss']
})
export class ClauseListComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  currentPage: PageTypeEnum;
  tabPageType = PageTypeEnum;

  public clauseDataMap = ContractClauseListServiceNs.clauseDataMap;
  public filters = {
    clauseType: ContractClauseListServiceNs.ContentType.bar
  };
  public clauseTableConfig: UfastTableNs.TableConfig;
  public clauseList: ContractClauseListServiceNs.ClauseListData[] = [];
  public detailId = '';
  ActionCode = ActionCode;

  constructor(private clauseService: ContractClauseListService,
    private messageService: ShowMessageService) {
      this.currentPage = this.tabPageType.ManagePage;
     }

  public getClauseList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageSize: this.clauseTableConfig.pageSize,
      pageNum: this.clauseTableConfig.pageNum,
      filters: this.filters
    };
    this.clauseList = [];
    this.clauseService.getClauseList(filter).subscribe((resData: ContractClauseListServiceNs.UfastHttpResT<any>) => {
      this.clauseList = resData.value.list;
      this.clauseTableConfig.total = resData.value.total;
    });
  }
  public addClause() {
    this.detailId = '';
    this.currentPage = this.tabPageType.AddPage;
  }
  public editClause(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public delClause(id) {
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.clauseService.delClause(id).subscribe((resData: ContractClauseListServiceNs.UfastHttpResT<any>) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.getClauseList();
      });
    });
  }
  public showDetail(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.DetailPage;
  }
  public onChildEmit() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getClauseList();
  }

  ngOnInit() {
    this.clauseTableConfig = {
      id: 'purchase-clauseList',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 60 },
        { title: '序号', field: 'seq', width: 50 },
        { title: '条目编码', field: 'clauseNo', width: 60 },
        { title: '条内容', tdTemplate: this.showDetailTpl, width: 400 },
      ]
    };
    this.getClauseList();
  }

}
