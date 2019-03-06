import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {UfastFormDetailNs} from '../../../../../layout/ufast-form-detail/ufast-form-detail.component';
import {SourcingQuotationService, SourcingQuotationServiceNs} from '../../../../../core/trans/purchase/sourcing-quotation.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';

@Component({
  selector: 'app-detail-quotation',
  templateUrl: './detail-quotation.component.html',
  styleUrls: ['./detail-quotation.component.scss']
})
export class DetailQuotationComponent implements OnInit {
  @Input() quotationId: string;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  public detailDataConfig: UfastFormDetailNs.DetailDataConfig[] = [];
  public quotationDetail: SourcingQuotationServiceNs.QuotationDetail = {
    enquiryCode: '',
    title: '',
    enquiryDate: '',
    quotationDateEnd: '',
    enquiryRequire: '',
    quotationValidDate: '',
    isAgreeForward: null,
    contact: '',
    contactTel: '',
    currency: '',
    quotationExplain: '',
    quotationStatus: null,
  };
  public materialTableConfig: UfastTableNs.TableConfig;
  public quotationMaterialList: SourcingQuotationServiceNs.QuotationMaterialData[] = [];
  private quotationDataMap = SourcingQuotationServiceNs.quotationDataMap;
  private materialMap = SourcingQuotationServiceNs.materialDataMap;
  private materialDataKey = ['lineNo', 'materialName', 'materialCode', 'drawingNumber', 'materialTexture', 'materialModel', 'brand',
    'materialFrom', 'technicalParameters', 'supplierModel', 'supplierTechParam', 'unit', 'purchaseQuantity', 'demandDate', 'deliverDate',
    'transportWay', 'supplierBrand', 'quotationRemark', 'useOrgName', 'remark', 'availableQuantity', 'supplierUnitPrice', 'tax',
    'totalAmount', 'attachmentUrl'];

  constructor(private quotationService: SourcingQuotationService,
              private messageService: ShowMessageService,
              private ufastService: UfastUtilService) { }

  public getQuotationDetail() {
    this.quotationService.getQuotationDetail(this.quotationId).subscribe((resData) => {
      Object.keys(this.quotationDetail).forEach((item) => {
        this.quotationDetail[item] = resData.value[this.quotationDataMap[item].key];
      });
      this.quotationMaterialList = [];
      resData.value.detailVOS.forEach((item) => {
        const detailItem: any = {};
        this.materialDataKey.forEach((key) => {
          if (key === 'totalAmount') {
            detailItem[key] = this.ufastService.mul((item[this.materialMap.supplierUnitPrice.key] || 0),
              (item[this.materialMap.availableQuantity.key] || 0));
            return;
          }
          detailItem[key] = item[this.materialMap[key].key];
        });
        this.quotationMaterialList = [...this.quotationMaterialList, detailItem];
      });
    });
  }
  public emitPage() {
    if (this.quotationDetail.quotationStatus === SourcingQuotationServiceNs.QuotationStatus.Init) {
      this.backToMainPage.emit(true);
      return;
    }
    this.backToMainPage.emit(false);
  }
  ngOnInit() {
    this.materialTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      frontPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        {title: '行号', field: 'lineNo', width: 80},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料名称', field: 'materialName', width: 140},
        {title: '零件号/图号', field: 'drawingNumber', width: 100},
        {title: '材质', field: 'materialTexture', width: 100},
        {title: '规格型号', field: 'materialModel', width: 100},
        {title: '品牌', field: 'brand', width: 100},
        {title: '进口/国产', field: 'materialFrom', width: 100},
        {title: '技术参数', field: 'technicalParameters', width: 100},
        {title: '供应商规格型号', field: 'supplierModel', width: 120},
        {title: '供应商技术参数', field: 'supplierTechParam', width: 120},
        {title: '单位', field: 'unit', width: 100},
        {title: '数量', field: 'purchaseQuantity', width: 100},
        {title: '需求日期', field: 'demandDate', pipe: 'date: yyyy-MM-dd', width: 100},
        {title: '交货日期', field: 'deliverDate', pipe: 'date: yyyy-MM-dd', width: 100},
        {title: '运输方式', field: 'transportWay', width: 100},
        {title: '品牌/厂家', field: 'supplierBrand', width: 100},
        {title: '报价备注', field: 'quotationRemark', width: 100},
        {title: '使用单位', field: 'useOrgName', width: 100},
        {title: '备注', field: 'remark', width: 100},
        {title: '可供数量', field: 'availableQuantity', width: 100},
        {title: '含税单价', field: 'supplierUnitPrice', width: 100},
        {title: '税码', field: 'tax', width: 120},
        {title: '报价总价', field: 'totalAmount', width: 100},
      ]
    };
    this.detailDataConfig = [
      {name: '询价单号', field: 'enquiryCode'},
      {name: '标题', field: 'title'},
      {name: '询价日期', field: 'enquiryDate', pipe: 'date: yyyy-MM-dd'},
      {name: '报价截止日期', field: 'quotationDateEnd', pipe: 'date: yyyy-MM-dd'},
      {name: '询价要求', field: 'enquiryRequire', isFullSpan: true},
      {name: '报价有效期', field: 'quotationValidDate', pipe: 'date: yyyy-MM-dd'},
      {name: '提前接收报价', field: 'isAgreeForward', pipe: 'yesOrNo'},
      {name: '报价联系人', field: 'contact'},
      {name: '联系电话', field: 'contactTel'},
      {name: '币种', field: 'currency'},
      {name: '报价说明', field: 'quotationExplain', isFullSpan: true},
    ];
    this.getQuotationDetail();
  }

}
