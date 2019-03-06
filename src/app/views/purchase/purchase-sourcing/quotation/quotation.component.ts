import { ActionCode } from './../../../../../environments/actionCode';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { SourcingQuotationService, SourcingQuotationServiceNs } from '../../../../core/trans/purchase/sourcing-quotation.service';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
export interface TabPageType {
  mainPage: number;
  detailPage: number;
  editPage: number;
}
export interface ActionStatus {
  quotePrice: boolean;
}
@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss']
})
export class QuotationComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('enquiryInfoTpl') enquiryInfoTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public selectedPage = 0;
  public tabPageType: TabPageType = {
    mainPage: 0,
    detailPage: 1,
    editPage: 2
  };
  public filters = {
    enquiryCode: '',
    enquiryDateStart: null,
    enquiryDateEnd: null,
    enquiryStatus: null,
    quotationCode: '',
    quotationStatus: null
  };
  public isShowAdvancedSearch = false;
  public quotationList: SourcingQuotationServiceNs.QuotationData[] = [];
  public quotationTableConfig: UfastTableNs.TableConfig;
  private quotationDataMap = SourcingQuotationServiceNs.quotationDataMap;
  private quotationKeys = ['id', 'supplier', 'enquiryCode', 'enquiryTimes', 'quotationCode', 'quotationStatus', 'enquiryStatus', 'title',
    'enquiryDate', 'quotationDateEnd', 'sendDepartment', 'sender', 'createDate'];
  public actionStatus: { [index: string]: ActionStatus } = {};
  public currQuotationId = '';
  public isSupplierList = false;
  ActionCode = ActionCode;
  purchaseInquiryStatus: any[];

  constructor(private quotationService: SourcingQuotationService,
    private ufastService: UfastUtilService) {
    this.purchaseInquiryStatus = [];
  }

  public getQuotationList = () => {
    const filters = {};
    Object.keys(this.filters).forEach((item) => {
      if (item === 'enquiryDateStart') {
        filters[this.quotationDataMap[item].key] = this.ufastService.getStartDate(this.filters[item]);
        return;
      }
      if (item === 'enquiryDateEnd') {
        filters[this.quotationDataMap[item].key] = this.ufastService.getEndDate(this.filters[item]);
        return;
      }
      if (item === 'enquiryStatus' || item === 'quotationStatus') {
        filters[this.quotationDataMap[item].key] = this.filters[item];
        return;
      }
      filters[this.quotationDataMap[item].key] = this.filters[item].trim();
    });
    const paramsData = {
      filters: filters,
      pageNum: this.quotationTableConfig.pageNum,
      pageSize: this.quotationTableConfig.pageSize,
    };
    this.quotationService.getQuotationList(paramsData).subscribe((resData) => {
      this.quotationList = [];
      this.isSupplierList = resData.value.isSupplier === SourcingQuotationServiceNs.IsSupplier.True;
      if (this.isSupplierList && this.quotationTableConfig.headers[1].field === 'supplier') {
        this.quotationTableConfig.headers.splice(1, 1);
      }
      this.quotationTableConfig.total = resData.value.pageInfo.total;
      resData.value.pageInfo.list.forEach((item) => {
        const detailItem: any = {};
        this.quotationKeys.forEach((key) => {
          detailItem[key] = item[this.quotationDataMap[key].key];
        });
        const currentDate = this.ufastService.getStartDate(Number(new Date()));
        this.actionStatus[item[this.quotationDataMap.id.key]] = {
          quotePrice: (detailItem.quotationStatus !== SourcingQuotationServiceNs.QuotationStatus.Complete) &&
            (detailItem.quotationStatus !== SourcingQuotationServiceNs.QuotationStatus.Cancel) &&
            (detailItem.quotationDateEnd - currentDate.getTime() > 0)
          // quotePrice: (detailItem.quotationStatus === SourcingQuotationServiceNs.QuotationStatus.Init) ||
          // (detailItem.quotationStatus === SourcingQuotationServiceNs.QuotationStatus.Read) ||
          // (detailItem.quotationStatus === SourcingQuotationServiceNs.QuotationStatus.PartQuota) ||
          // (detailItem.quotationStatus === SourcingQuotationServiceNs.QuotationStatus.FullQuota)
        };
        this.quotationList.push(detailItem);
      });
    });
  }
  public resetSearch() {
    Object.keys(this.filters).forEach((item) => {
      this.filters[item] = '';
    });
    this.getQuotationList();
  }
  public showAdvancedSearch() {
    this.isShowAdvancedSearch = true;
  }
  public closeAdvancedSearch() {
    this.isShowAdvancedSearch = false;
  }
  public showQuotationDetail(id) {
    this.currQuotationId = id;
    this.selectedPage = this.tabPageType.detailPage;
  }
  public quotePrice(id) {
    this.currQuotationId = id;
    this.selectedPage = this.tabPageType.editPage;
  }
  public onChildEmit(refresh) {
    this.selectedPage = this.tabPageType.mainPage;
    if (refresh) {
      this.getQuotationList();
    }
  }
  public disabledEndDate = (endDate) => {
    if (!this.filters.enquiryDateStart) {
      return false;
    }
    return endDate.getTime() < this.filters.enquiryDateStart.getTime();
  }
  public disabledStartDate = (startDate) => {
    if (!this.filters.enquiryDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.enquiryDateEnd.getTime();
  }
  public getPurchaseInquiryStatus() {
    this.quotationService.getPurchaseInquiryStatus().subscribe((resData) => {
      this.purchaseInquiryStatus = resData;
    });
  }
  ngOnInit() {
    this.getPurchaseInquiryStatus();
    this.quotationTableConfig = {
      id: 'purchase-quotation',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, fixed: true, width: 80 },
        { title: '供应商', field: 'supplier', width: 100, fixed: true },
        { title: '报价单编号', tdTemplate: this.showDetailTpl, width: 160, fixed: true },
        { title: '询价单编号-次数', tdTemplate: this.enquiryInfoTpl, width: 160 },
        { title: '标题', field: 'title', width: 140 },
        { title: '询价日期', field: 'enquiryDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: '报价截止日期', field: 'quotationDateEnd', pipe: 'date: yyyy-MM-dd', width: 110 },
        { title: '发件部门', field: 'sendDepartment', width: 100 },
        { title: '发件人', field: 'sender', width: 100 },
        { title: '创建日期', field: 'createDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: '询价状态', field: 'enquiryStatus', pipe: 'purchaseInquiryStatus', width: 100 },
        { title: '报价状态', field: 'quotationStatus', pipe: 'purchaseQuotationStatus', width: 100 },
      ]
    };
    this.getQuotationList();
  }

}
