import { ActionCode } from './../../../../../environments/actionCode';
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {SourcingInquiryNs, SourcingInquiryService} from '../../../../core/trans/purchase/sourcing-inquiry.service';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
import {ApprovalFormNs, ApprovalFormService} from '../../../../core/trans/purchase/approval-form.service';
export enum InquiryPageType {
  MainPage,
  DetailPage,
  EditPage,
  DealBidPage,
  QuotaCompare
}
interface ActionStatus {
  edit: boolean;
  dealBid: boolean;
  againAskPrice: boolean;
  compareQuota: boolean;
}
@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss']
})
export class InquiryComponent implements OnInit {
  @ViewChild('operationTpl')operationTpl: TemplateRef<any>;
  @ViewChild('inquiryNoNumTpl')inquiryNoNumTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  actionStatus: {[index: string]: ActionStatus};
  currentPage: InquiryPageType;
  PageTypeEnum = InquiryPageType;
  showAdvancedSearch: boolean;
  filterData: any;
  selectId: string;
  approvalId: string;
  isAgainAskPrice: boolean;
  ActionCode = ActionCode;
  constructor(private messageService: ShowMessageService, private inquiryService: SourcingInquiryService,
              private utilService: UfastUtilService) {
    this.currentPage = this.PageTypeEnum.MainPage;
    this.dataList = [];
    this.actionStatus = {};
    this.showAdvancedSearch = false;
    this.filterData = {};
  }
  public resetSearch() {
    this.filterData = {};
    this.getDataList();
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filterData.endCreateDate) {
      return false;
    }
    return startDate.getTime() > this.filterData.endCreateDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filterData.startCreateDate) {
      return false;
    }
    return endDate.getTime() <= this.filterData.startCreateDate.getTime();
  }
  getDataList = () => {
    Object.keys(this.filterData).forEach((key) => {
      if (typeof this.filterData[key] === 'string') {
        this.filterData[key] = this.filterData[key].trim();
      }
    });
    this.filterData.startCreateDate = this.utilService.getStartDate(this.filterData.startCreateDate);
    this.filterData.endCreateDate = this.utilService.getEndDate(this.filterData.endCreateDate);
    const filter = {
      pageSize: this.tableConfig.pageSize,
      pageNum: this.tableConfig.pageNum,
      filters: this.filterData
    };
    this.inquiryService.getInquiryOrderList(filter).subscribe((resData: SourcingInquiryNs.UfastHttpResT<any>) => {
      this.tableConfig.total = resData.value.total;
      this.dataList = resData.value.list;
      this.actionStatus = {};
      this.dataList.forEach((item) => {
        this.actionStatus[item.id] = {
          edit: item.status === SourcingInquiryNs.InquiryStatus.WaitSend ,
          dealBid: (item.status === SourcingInquiryNs.InquiryStatus.End) &&
           (item.approveStatus === ApprovalFormNs.ApprovalStatus.WaitDealPrice ||
             item.approveStatus === ApprovalFormNs.ApprovalStatus.PartConfirm),
          againAskPrice: item.status === SourcingInquiryNs.InquiryStatus.Quoted,
          compareQuota: item.status !== SourcingInquiryNs.InquiryStatus.WaitSend &&
          item.status !== SourcingInquiryNs.InquiryStatus.WaitQuote
        };
      });
    });
  }

  public goChildPage(id: string, approvalId: string, type: InquiryPageType, isAgainAskPrice?: boolean) {
    this.selectId = id;
    this.currentPage = type;
    this.isAgainAskPrice = isAgainAskPrice;
    this.approvalId = approvalId;
  }
  public exitChildPage(page?: InquiryPageType) {
    if (page === undefined) {
      this.currentPage = this.PageTypeEnum.MainPage;
      this.getDataList();
    } else {
      this.currentPage = page;
    }
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-sourcingInquiry',
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 220, fixed: true},
        {title: '询价单编号-次数', tdTemplate: this.inquiryNoNumTpl, width: 160, fixed: true},
        {title: '标题', field: 'title', width: 180},
        {title: '审批表编号', field: 'purchaseApproveNo', width: 140},
        {title: '询价状态', field: 'status', width: 120, pipe: 'purchaseInquiryStatus'},
        {title: '询价日期', field: 'inquireDate', width: 140, pipe: 'date:yyyy-MM-dd'},
        {title: '报价截止日期', field: 'quoteEndDate', width: 140, pipe: 'date:yyyy-MM-dd'},
        {title: '发件部门', field: 'inquireUserDept', width: 120},
        {title: '发件人', field: 'inquireUserName', width: 120},
        {title: '创建时间', field: 'createDate', width: 160, pipe: 'date:yyyy-MM-dd HH:mm:ss'},
      ]
    };
    this.getDataList();
  }

}
