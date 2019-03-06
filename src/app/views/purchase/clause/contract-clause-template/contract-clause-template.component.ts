import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {
  ContractClauseTemplateService, ContractClauseTemplateServiceNs
} from '../../../../core/trans/purchase/contract-clause-template.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { ActionCode } from '../../../../../environments/actionCode';
import { UfastTableNs } from '../../../../layout/layout.module';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage,
  DetailPage
}
@Component({
  selector: 'app-contract-clause-template',
  templateUrl: './contract-clause-template.component.html',
  styleUrls: ['./contract-clause-template.component.scss']
})
export class ContractClauseTemplateComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  ActionCode = ActionCode;
  tableConfig: UfastTableNs.TableConfig;
  filters: ContractClauseTemplateServiceNs.ClauseTemplateFilter;
  clauseTemplateDataList: ContractClauseTemplateServiceNs.ClauseTemplateDataList[];
  @ViewChild('listOperationTpl') listOperationTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('nameTpl') nameTpl: TemplateRef<any>;
  @ViewChild('contentTpl') contentTpl: TemplateRef<any>;
  @ViewChild('rightContentTpl') rightContentTpl: TemplateRef<any>;
  detailId: string;
  /**详情 */
  headerFieldList: { name: string; field: string; pipe?: string }[];
  headerInfo: any;
  clauseLeftTableConfig: UfastTableNs.TableConfig;
  clauseLeftDataList: any[];
  clauseRightTableConfig: UfastTableNs.TableConfig;
  clauseRightDataList: any[];
  purchaseTemplateDetailVOS: any[];

  constructor(private contractCaluseTemplateService: ContractClauseTemplateService,
    private messageService: ShowMessageService) {
    this.currentPage = this.tabPageType.ManagePage;
    this.filters = {};
    this.clauseTemplateDataList = [];
    this.detailId = '';
    this.headerFieldList = [
      {name: '模板编码', field: 'templateNo'},
       {name: '模板名称', field: 'templateName'},
      {name: '模板类型', field: 'templateType', pipe: 'templateType'}
    ];
    this.headerInfo = {};
    this.clauseLeftDataList = [];
    this.clauseRightDataList = [];
    this.purchaseTemplateDetailVOS = [];
  }
  getClauseTemplateDataList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.contractCaluseTemplateService.getClauseTemplateDataList(filter).subscribe((resData: any) => {
      this.clauseTemplateDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    });
  }
  public add() {
    this.detailId = '';
    this.currentPage = this.tabPageType.AddPage;
  }
  public edit(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public detail(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.DetailPage;
    this.getClauseTemplateDetail();
  }
  public getClauseTemplateDetail() {
    this.contractCaluseTemplateService.getClauseTemplateContentDetail(this.detailId).subscribe(
      (resData: ContractClauseTemplateServiceNs.UfastHttpResT<any>) => {
        this.headerInfo = resData.value;
        this.clauseLeftDataList = [];
        this.clauseRightDataList = [];
        this.purchaseTemplateDetailVOS = [];
        resData.value.purchaseClauseVOS.forEach((item) => {
          const temp = <any>{};
          temp['id'] = item['id'];
          temp['seq'] = item['seq'];
          temp['content'] = item['content'];
          temp['highLight'] = false;
          this.clauseLeftDataList.push(temp);
          item.details.forEach((detailItem) => {
            this.purchaseTemplateDetailVOS.push(detailItem);
          });
        });
        this.clauseLeftTableConfig.total = this.clauseLeftDataList.length;
        this.view(this.clauseLeftDataList[0].id);
    });
  }
  public view(id) {
    this.clauseRightDataList = [];
    this.clauseLeftDataList.forEach((item) => {
      item.highLight = false;
    });
    this.clauseLeftDataList.forEach((item) => {
      if (item.id === id) {
        item.highLight = true;
      }
    });
    this.purchaseTemplateDetailVOS.forEach((item) => {
      if (item.parentId === id) {
        this.clauseRightDataList.push(item);
      }
    });
    this.clauseRightTableConfig.total = this.clauseRightDataList.length;
  }
  public childPageFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getClauseTemplateDataList();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-contractClauseTemplate',
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.listOperationTpl, width: 80, fixed: true },
        // { title: '序号', field: 'seq', width: 100 },
        { title: '模板编码', field: 'templateNo', width: 90 },
        { title: '模板名称', tdTemplate: this.nameTpl, width: 150 },
        { title: '类型', field: 'templateType', width: 100, pipe: 'templateType' }
      ]
    };
    this.clauseLeftTableConfig = {
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      checkAll: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        // { title: '操作', tdTemplate: this.operationTpl, width: 100, fixed: true },
        { title: '序号', field: 'seq', width: 80 },
        { title: '条内容', tdTemplate: this.contentTpl, width: 300 }
      ]
    };
    this.clauseRightTableConfig = {
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      checkAll: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '序号', field: 'seq', width: 80 },
        { title: '款内容', tdTemplate: this.rightContentTpl, width: 300 }
      ]
    };
    this.getClauseTemplateDataList();
  }

}
