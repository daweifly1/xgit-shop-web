import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
import {UfastUtilServiceNs} from '../../infra/ufast-util.service';

export namespace SourcingInquiryNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }
  export interface FilterData<T> {
    pageSize: number;
    pageNum: number;
    filters: T;
  }
  export enum InquiryStatus {
    WaitSend,       // 待发送
    WaitQuote,     // 待报价
    Quoted,       // 已获取报价
    End,          // 已确认报价
    InquiryAgain  // 已再次询价
  }
  export interface InquiryMaterialRowItem {
    approveDetailId: string;
    brand: string;
    drawingNumber: string;
    id: string;
    importOrDomestic: string;
    indexNo: number;
    inquiryId: string;
    material: string;
    materialDesc: string;
    materialName: string;
    materialNo: string;
    materialType: number;
    needDate: any;
    quantity: number;
    remark: string;
    specificationModel: string;
    technicalParameters: string;
    transportMethod: number;
    unit: string;
    useOrgId: string;
    useOrgName: string;
  }
  export interface InquirySupplierItem {
    createDate: any;
    createId: string;
    id: string;
    purchaseInquiryId: string;
    supplierContactName: string;
    supplierContactPhone: string;
    supplierId: string;
    supplierName: string;
    supplierNo: string;
    accpetAdvance?: number;
    status?: number;
    purchaseQuotationStatus?: number;
  }
  export interface InquiryOrderDetail {
    count: number;
    createDate: any;
    createId: string;
    detailVOS: InquiryMaterialRowItem[];
    supplierVOS: InquirySupplierItem[];
    id: string;
    inquireDate: any;
    inquireUserDept: string;
    inquireUserId: string;
    inquireUserName: string;
    inquireUserPhone: string;
    inquiryClaim: string;
    inquiryMethod: number;
    inquiryNo: string;
    inquirySpecificClaim: string;
    orgId: string;
    orgName: string;
    payMethod: string;
    purchaseApproveId: string;
    purchaseApproveNo: string;
    quoteEndDate: any;
    receiveQuoteAddress: string;
    receiveQuoteFax: string;
    status: number;
    title: string;
    updateDate: any;
    updateId: string;
    approveVO: any;
  }
  export interface QuotaCompareDetailData {
    rowNumber: number;
    materialNo: string;
    materialDesc: string;
    unit: string;
    quantity: number;
    difference: number;
    priceRange: number;
    supplierPriceList: CompareSupplierPrice[];
    supplierPriceListFormat: CompareSupplierPrice[];
  }
  export interface CompareSupplierPrice {
    supplierPrice: number;
    count: number;
  }
  export class SourcingInquiryClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.NewHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway : HttpUtilNs.GatewayKey.Ps
      };
    }
    public getInquiryNewData(approvalId: string): Observable<UfastHttpResT<InquiryOrderDetail>> {
      return this.http.newGet('/purchaseInquiry/createByApproveId', {approveId: approvalId}, this.defaultConfig);
    }
    /**
     * 保存询价单*/
    public saveInquiryOrder(data: InquiryOrderDetail): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost('/purchaseInquiry/save', data, config);
    }
    /**
     * 发送询价*/
    public sendInquiryOrder(data: InquiryOrderDetail): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost('/purchaseInquiry/send', data, config);
    }
    /**
     * 再次询价*/
    public againSendInquiry(data: InquiryOrderDetail): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost('/purchaseInquiry/inquiryAgain', data, config);
    }
    /**
     * 询价单列表*/
    public getInquiryOrderList(data: FilterData<any>): Observable<any> {
      return this.http.newPost('/purchaseInquiry/list', data, this.defaultConfig);
    }
    /**
     * 询价单详情*/
    public getInquiryDetail(id: string): Observable<any> {
      return this.http.newGet('/purchaseInquiry/itemWithDetail', {id: id}, this.defaultConfig);
    }
    /**
     * 询价单获取报价*/
    public getQuote(id: string): Observable<any> {
      const config:  HttpUtilNs.NewHttpConfig = {
        params: {id: id},
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      return this.http.newPost('/purchaseInquiry/getQuota', null, config);
    }
    /**
     * 获取中标处理数据*/
    public getDealBidDetail(approveId: string, inquiryId: string): Observable<any> {
      const config:  HttpUtilNs.NewHttpConfig = {
        params: {approveid: approveId, inquiryId: inquiryId},
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      return this.http.newPost('/purchaseapprove/dealbidding', null, config);
    }
  }
}
@Injectable()
export class SourcingInquiryService extends SourcingInquiryNs.SourcingInquiryClass {

  constructor( injector: Injector) {
    super(injector);
  }

}
