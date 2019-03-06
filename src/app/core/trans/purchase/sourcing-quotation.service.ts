import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';
import {UfastUtilServiceNs} from '../../infra/ufast-util.service';

export namespace SourcingQuotationServiceNs {
  export const quotationDataMap = {
    id: {key: 'id', label: 'id'},
    enquiryCode: {key: 'inquiryNo', label: '询价单编号'},
    enquiryStatus: {key: 'inquireStatus', label: '询价状态'},
    quotationCode: {key: 'quotaNo', label: '报价单编号'},
    quotationStatus: {key: 'status', label: '报价状态'},
    enquiryDateStart: {key: 'inquireDateStart', label: '询价日期开始'},
    enquiryDateEnd: {key: 'inquireDateEnd', label: '询价日期截止'},
    enquiryDate: {key: 'inquireDate', label: '询价日期'},
    enquiryTimes: {key: 'count', label: '询价次数'},
    supplier: {key: 'supplierName', label: '供应商'},
    title: {key: 'title', label: '标题'},
    quotationDateEnd: {key: 'quoteEndDate', label: '报价截止日期'},
    sendDepartment: {key: 'inquireUserDept', label: '发件部门'},
    sender: {key: 'inquireUserName', label: '发件人'},
    createDate: {key: 'createDate', label: '创建日期'},
    enquiryRequire: {key: 'inquirySpecificClaim', label: '询价要求'},
    quotationValidDate: {key: 'quotaExpire', label: '报价有效期'},
    isAgreeForward: {key: 'accpetAdvance', label: '是否统一提前接收报价'},
    contact: {key: 'contactName', label: '联系人'},
    contactTel: {key: 'contactPhone', label: '联系电话'},
    currency: {key: 'currency', label: '币种'},
    quotationExplain: {key: 'remark', label: '报价说明'},
  };
  export const materialDataMap = {
    detailVOS: {key: 'detailVOS', label: '物料集合名'},
    id: {key: 'id', label: 'id'},
    lineNo: {key: 'indexNo', label: '行号'},
    materialName: {key: 'materialName', label: '物料名称'},
    materialCode: {key: 'materialNo', label: '物料编码'},
    materialDesc: {key: 'materialDesc', label: '物料描述'},
    materialType: {key: 'materialType', label: '物料类型'},
    drawingNumber: {key: 'drawingNumber', label: '零件号/图号'},
    materialTexture: {key: 'material', label: '材质'},
    materialModel: {key: 'specificationModel', label: '规格型号'},
    brand: {key: 'brand', label: '品牌'},
    materialFrom: {key: 'importOrDomestic', label: '进口/国产'},
    technicalParameters: {key: 'technicalParameters', label: '技术参数'},
    supplierModel: {key: 'supplierModel', label: '供应商规格型号'},
    supplierTechParam: {key: 'supplierParameter', label: '供应商技术参数'},
    supplierBrand: {key: 'supplierBrand', label: '品牌厂家'},
    unit: {key: 'unit', label: '单位'},
    supplierUnitPrice: {key: 'supplierPrice', label: '单价'},
    purchaseQuantity: {key: 'quantity', label: '数量'},
    demandDate: {key: 'needDate', label: '需求日期'},
    deliverDate: {key: 'deliverDate', label: '交货日期'},
    transportWay: {key: 'translateRoute', label: '运输方式'},
    quotationRemark: {key: 'remark', label: '报价备注'},
    useOrgName: {key: 'useOrgName', label: '使用单位'},
    remark: {key: 'originRemark', label: '备注'},
    availableQuantity: {key: 'supplierCount', label: '可供数量'},
    tax: {key: 'taxCode', label: '税率'},
    taxRate: {key: 'taxRate', label: '税率'},
    totalAmount: {key: 'totalAmount', label: '报价总计'},
    attachmentUrl: {key: 'annexUrl', label: '附件Url'},
    detailStatus: {kep: 'detailStatus'}
  };
  export interface QuotationData {
    id: string;
    supplier: string;
    quotationCode: string;
    enquiryCode: string;
    enquiryTimes: number;
    title: string;
    enquiryDate: string;
    quotationDateEnd: string;
    sendDepartment: string;
    sender: string;
    createDate: string;
    enquiryStatus: number|string;
    quotationStatus: number|string;
  }
  export interface QuotationDetail extends EnquiryData {
    quotationValidDate: string|number;
    isAgreeForward: boolean;
    contact: string;
    contactTel: string;
    currency: string;
    quotationExplain: string;
  }
  export interface EnquiryData {
    enquiryCode: string;
    title: string;
    enquiryDate: string|number;
    quotationDateEnd: string;
    enquiryRequire: string;
    quotationStatus?: number;
  }
  export interface QuotationMaterialData {
    lineNo: string;
    materialName: string;
    materialCode: string;
    materialFuture: string;
    materialTexture: string;
    materialModel: string;
    brand: string;
    materialFrom: string;
    technicalParameters: string;
    supplierModel: string;
    supplierTechParam: string;
    supplierUnitPrice: string;
    purchaseQuantity: number;
    demandDate: string;
    deliverDate: string;
    transportWay: string;
    supplierBrand: string;
    quotationRemark: string;
    useOrgName: string;
    remark: string;
    availableQuantity: number;
    unitPrice: string;
    tax: string;
    totalAmount: string;
    attachmentUrl: string;
  }
  export enum IsSupplier {
    True = 1,
    false = 0
  }
  export enum QuotationStatus {
    // HasNotRead = 1,
    // HasNotQuota = 2,
    // PartQuota = 3,
    // AllQuota = 4,
    // CancelQuota = 6

    Init = 1, // 1未阅
    Read, // 2待报价
    PartQuota,  // 3部分报价
    FullQuota, // 4全部报价
    Complete,  // 5报价结束
    Cancel, // 6已放弃
/*    NoBidding,  // 7未中标
    PartBidding, // 8部分中标
    FullBidding // 9全部中标*/
  }
  export class SourcingQuotationServiceClass {
    private http: HttpUtilService;
    private paramConfig: HttpUtilNs.UfastHttpConfig = {};
    private purchaseInquiryStatus: { value: number, label: string}[];
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.paramConfig.gateway = HttpUtilNs.GatewayKey.Ps;
      this.purchaseInquiryStatus = [
        { value: 1, label: '待报价'},
        { value: 2, label: '已获取报价'},
        { value: 3, label: '已确认报价'},
        { value: 4, label: '已再次询价'}
      ];
    }

    /**
     * 报价单列表
     */
    public getQuotationList(paramsData) {
      return this.http.newPost('/PurchaseQuota/list', paramsData, this.paramConfig);
    }
    /**
     * 报价单详情
     */
    public getQuotationDetail(id) {
      return this.http.newGet('/PurchaseQuota/detail', {quotaId: id}, this.paramConfig);
    }
    /**
     * 编辑报价单
     */
    public editQuotation(paramsData) {
      return this.http.newPost('/PurchaseQuota/update', paramsData, this.paramConfig);
    }
    /**
     * 新增报价单
     */
    public addQuotation(paramsData) {
      return this.http.newPost('/PurchaseQuota/insert', paramsData, this.paramConfig);
    }
    /**
     * 报价单放弃
     */
    public cancelQuotation(id) {
      return this.http.newPost('/PurchaseQuota/cancel/' + id, null, this.paramConfig);
    }
    /**
     * 报价对比
     */
    public compareQuota(id) {
      return this.http.newGet('/PurchaseQuota/compare/' + id, null, this.paramConfig);
    }
    /**
     * 税率列表
     */
    public getRateList() {
      return this.http.newGet('/rate/getRateList', null, this.paramConfig);
    }
    /**
     * 确认报价*/
    public confirmPrice(id: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        delayLoading: 0,
        params: {id : id},
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      return this.http.newPost('/purchaseInquiry/confirmPrice', null, config);
    }

    /**
     * 报价单的询价状态
     */
    public getPurchaseInquiryStatus(): Observable<any> {
      return Observable.of(this.purchaseInquiryStatus);
    }
  }
}

@Injectable()
export class SourcingQuotationService extends SourcingQuotationServiceNs.SourcingQuotationServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
