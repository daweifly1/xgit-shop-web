import { ActivatedRoute, Router } from '@angular/router';

import { ShowMessageService } from './../../../../widget/show-message/show-message';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NegotiationMinutesService, NegotiationMinutesServiceNs } from '../../../../core/trans/purchase/negotiation-minutes.service';
import { UfastTableNs } from '../../../../layout/layout.module';
import { ActionCode } from '../../../../../environments/actionCode';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage,
  DetailPage,
  AuditPage
}
interface ActionStatus {
  edit: boolean;
  audit: boolean;
}
@Component({
  selector: 'app-negotiation-minutes',
  templateUrl: './negotiation-minutes.component.html',
  styleUrls: ['./negotiation-minutes.component.scss']
})
export class NegotiationMinutesComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  ActionCode = ActionCode;
  tableConfig: UfastTableNs.TableConfig;
  showAdvancedSearch: boolean;
  filters: NegotiationMinutesServiceNs.NegotiationMinutesFiters;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('orderNoTpl') orderNoTpl: TemplateRef<any>;
  @ViewChild('negotiationTopicTpl') negotiationTopicTpl: TemplateRef<any>;
  @ViewChild('negotiationAddressTpl') negotiationAddressTpl: TemplateRef<any>;
  negotiationMinutesList: NegotiationMinutesServiceNs.NegotiationMinutesList[];
  confirmNo: string;
  detailId: string;
  isDetailPage: boolean;
  actionStatus: { [index: string]: ActionStatus };
  constructor(private negotiationMinutesService: NegotiationMinutesService,
    private messageService: ShowMessageService,
    private route: ActivatedRoute,
    private utilService: UfastUtilService,
    private router: Router) {
    this.currentPage = this.tabPageType.ManagePage;
    this.showAdvancedSearch = false;
    this.filters = <any>{};
    this.negotiationMinutesList = [];
    this.confirmNo = '';
    this.detailId = '';
    this.isDetailPage = true;
    this.actionStatus = {};
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.createDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.createDateEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.createDateStart) {
      return false;
    }
    return endDate.getTime() <= this.filters.createDateStart.getTime();
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  getNegotiationMinutesList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.createDateStart = this.filters.createDateStart ?
      this.utilService.getStartDate(this.filters.createDateStart) : undefined;
    this.filters.createDateEnd = this.filters.createDateEnd ?
      this.utilService.getEndDate(this.filters.createDateEnd) : undefined;
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.negotiationMinutesService.getNegotiationMinutesList(filter).subscribe(
      (resData: NegotiationMinutesServiceNs.UfastHttpResT<any>) => {
        this.negotiationMinutesList = resData.value.list;
        this.negotiationMinutesList.forEach((item) => {
          let temp = <any>{};
          temp = item;
          temp['_this'] = item;
          this.actionStatus[item.id] = {
            edit: item.status === NegotiationMinutesServiceNs.NegotiationMinutesStatus.Save,
            audit: item.status === NegotiationMinutesServiceNs.NegotiationMinutesStatus.Submit
          };
        });
        this.tableConfig.total = resData.value.total;
      });
  }
  public reset() {
    this.filters = {};
    this.getNegotiationMinutesList();
  }
  public edit(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public audit(id) {
    this.detailId = id;
    this.isDetailPage = false;
    this.currentPage = this.tabPageType.AuditPage;
  }
  public detail(id) {
    this.detailId = id;
    this.isDetailPage = true;
    this.currentPage = this.tabPageType.DetailPage;
  }
  public childPageFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getNegotiationMinutesList();
    this.router.navigate([], {relativeTo: this.route});
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-negotiationMinutes',
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 170, fixed: true },
        { title: '纪要编号', tdTemplate: this.orderNoTpl, width: 180, fixed: true },
        { title: '审定表编号', field: 'confirmNo', width: 180 },
        { title: '谈判主题',  tdTemplate: this.negotiationTopicTpl, width: 120 },
        { title: '成交金额合计(元)', field: 'finalOfferTotal', width: 130 },
        { title: '谈判日期', field: 'negotiationDate', width: 180, pipe: 'date:yyyy-MM-dd' },
        { title: '谈判地点',  tdTemplate: this.negotiationAddressTpl, width: 120 },
        { title: '谈判形式', field: 'negotiationForm', width: 120 },
        { title: '商务科室', field: 'businessDepartment', width: 100 },
        { title: '创建人', field: 'createName', width: 120 },
        { title: '创建时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' },
        { title: '状态', field: 'status', width: 100, pipe: 'negotiationMinutesStatus' }
      ]
    };
    this.route.queryParams.subscribe((params) => {
      const confirmNo = params ? params.confirmNo : '';
      if (!confirmNo) {
        return;
      }
      this.currentPage = Number(params.pageType);
      this.confirmNo = params.confirmNo;
      this.detailId = '';
    });
    this.getNegotiationMinutesList();
  }

}
