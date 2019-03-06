import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {UfastFormDetailNs} from '../../../../../layout/ufast-form-detail/ufast-form-detail.component';
import {SourcingQuotationService} from '../../../../../core/trans/purchase/sourcing-quotation.service';
import {SourcingInquiryNs} from '../../../../../core/trans/purchase/sourcing-inquiry.service';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';

@Component({
  selector: 'app-quota-compare',
  templateUrl: './quota-compare.component.html',
  styleUrls: ['./quota-compare.component.scss']
})
export class QuotaCompareComponent implements OnInit {
  @Input() inquiryId: string;
  @Output() finish: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('operateTpl') operateTpl: TemplateRef<any>;
  public inquiryDetail: any = {};
  public inquiryDetailConfig: UfastFormDetailNs.DetailDataConfig[] = [];
  public compareList: any[] = [];
  public compareTableConfig: UfastTableNs.TableConfig;
  private compareDetailObj: any = {};
  public compareDetailList: SourcingInquiryNs.QuotaCompareDetailData[] = [];
  public compareDetailTableConfig: UfastTableNs.TableConfig;
  public detailSum: any = {
    quantity: null,
    difference: null,
    priceRange: null,
    supplierName: '',
    supplierPriceList: [],
  };
  disabledComfirm: boolean;
  private quotaTotalCount = 0;

  constructor(private quotaService: SourcingQuotationService, private messageService: ShowMessageService,
              private ufastService: UfastUtilService) { }

  public getQuotaCompare() {
    this.disabledComfirm = true;
    this.quotaService.compareQuota(this.inquiryId).subscribe((resData) => {
      this.inquiryDetail = resData.value.purchaseInquiryVO;
      this.compareList = resData.value.purchaseQuotaCompareTotalVO || [];
      this.compareList.forEach((item, index) => {
        item.rowNumber = index + 1;
      });
      this.compareDetailObj = resData.value.purchaseQuotaCompareDetailVO;
      this.quotaTotalCount = resData.value.quotaRecentCount || 0;
      this.disabledComfirm = this.inquiryDetail.status !== SourcingInquiryNs.InquiryStatus.Quoted;
    });
  }
  public showDetail(supplierId, supplierName) {
    this.compareDetailTableConfig.loading = true;
    this.compareDetailList = [];
    this.detailSum.difference = 0;
    this.detailSum.priceRange = 0;
    this.detailSum.quantity = 0;
    this.detailSum.supplierPriceList = [];
    this.detailSum.supplierName = supplierName;
    const supplierObj: any = {};
    if ( !this.compareDetailObj[supplierId]) {
      this.compareDetailTableConfig.loading = false;
      return;
    }
    Object.keys(this.compareDetailObj[supplierId]).forEach((key) => {
      const supplierPriceListFormat = [];
      for (let i = 1; i <= this.quotaTotalCount; i++ ) {
        const index = this.compareDetailObj[supplierId][key].supplierPriceList.findIndex((priceItem) => priceItem.count === i);
        if (index > -1) {
          supplierPriceListFormat.push({
            supplierPrice: this.compareDetailObj[supplierId][key].supplierPriceList[index].supplierPrice,
            count: i
          });
        } else {
          supplierPriceListFormat.push({
            supplierPrice: null,
            count: i
          });
        }
      }
      this.compareDetailObj[supplierId][key].supplierPriceListFormat = supplierPriceListFormat || [];
      this.compareDetailList.push(this.compareDetailObj[supplierId][key]);
      this.detailSum.difference = this.ufastService.add(this.detailSum.difference, this.compareDetailObj[supplierId][key].difference);
      this.detailSum.priceRange = this.ufastService.add(this.detailSum.priceRange, this.compareDetailObj[supplierId][key].priceRange);
      this.detailSum.quantity = this.ufastService.add(this.detailSum.quantity, this.compareDetailObj[supplierId][key].quantity);
      this.compareDetailObj[supplierId][key].supplierPriceListFormat.forEach((item) => {
        supplierObj[item.count] = this.ufastService.add((supplierObj[item.count] || 0), (item.supplierPrice || 0));
      });
    });
    Object.keys(supplierObj).forEach((key) => {
      this.detailSum.supplierPriceList.push({
        count: key,
        supplierPrice: supplierObj[key]
      });
    });
    this.compareDetailTableConfig.loading = false;
  }
  public emitPage(refresh) {
    this.finish.emit(refresh);
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public confirmPrice() {
    this.messageService.showAlertMessage('', '确认报价后将无法再次询价，是否确认报价?', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.quotaService.confirmPrice(this.inquiryId).subscribe((resData) => {
          this.emitPage(true);
        });
      });
  }
  ngOnInit() {
    this.inquiryDetailConfig = [
      {name: '询价单号', field: 'inquiryNo'},
      {name: '询价日期', field: 'inquireDate', pipe: 'date: yyyy-MM-dd'},
      {name: '报价截止日期', field: 'quoteEndDate', pipe: 'date: yyyy-MM-dd'},
      {name: '标题', field: 'title', isFullSpan: true},
      {name: '询价要求', field: 'inquirySpecificClaim', isFullSpan: true},
    ];
    this.compareTableConfig = {
      showPagination: true,
      pageNum: 1,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      frontPagination: true,
      yScroll: 350,
      showCheckbox: false,
      loading: false,
      headers: [
        {title: '操作', tdTemplate: this.operateTpl, width: 100},
        {title: '行号', field: 'rowNumber', width: 80},
        {title: '供应商名称', field: 'supplierName', width: 100},
        {title: '币种', field: 'currency', width: 100},
        {title: '汇率', field: 'exchangeRate', width: 100},
        {title: '首轮总报价(元)', field: 'firstPriceTotal', width: 100},
        {title: '最终总报价(元)', field: 'lastPriceTotal', width: 100},
        {title: '差额', field: 'difference', width: 100},
        {title: '涨跌幅(%)', field: 'priceRange', width: 100},
      ]
    };
    this.compareDetailTableConfig = {
      showPagination: true,
      pageNum: 1,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      frontPagination: true,
      yScroll: 350,
      showCheckbox: false,
      loading: false,
      headers: []
    };
    this.getQuotaCompare();
  }

}
