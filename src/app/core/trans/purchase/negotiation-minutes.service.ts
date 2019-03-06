import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace NegotiationMinutesServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> { }
  export interface NegotiationMinutesFiters {
    id?: string;     // 纪要编号
    approvalNo?: string;   // 审批表编号
    status?: number;          // 状态
    createName?: string;     //  创建人
    createDateStart?: any;    // 创建时间
    createDateEnd?: any;    // 创建时间
  }
  export interface NegotiationMinutesList {
    id: string;    // 纪要编号
    approvalNo: string;  // 审批表编号
    negotiationTopic?: string;   // 谈判主题
    // 成交合计
    negotiationDate?: string;   //  谈判日期
    negotiationAddress?: string;  // 谈判地点
    negotiationForm?: string; // 谈判形式
    businessDepartment?: string; // 商务科室
    createName?: string;     // 创建人
    createDate?: string;     // 创建时间
    status: number;          // 状态
  }
  export enum NegotiationMinutesStatus {
    Save,
    Submit,
    Pass,
    Reject
  }
  export enum NegotiationMinutesPageType {
    AddPage = 1,
    EditPage,
    DetailPage,
    AuditPage
  }
  export enum OfferType {
    First = 1,
    Final,
    MakeBargain
  }
  export interface SupplierOfferData {
    rowNo?: number;
    purchaseSummaryOfferVOS?: any;
    materialCode?: string;
    materialDesc?: string;
    unit?: string;
    quantity?: number;
    supplierName?: string;
    supplierPrice?: number;
    summaryOfferBodyDOS?: any[];
  }

  export class NegotiationMinutesServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private newConfig: HttpUtilNs.NewHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      this.newConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
    }
    /**根据审批表编号查询供应商报价 */
    public getSupplierOffer(approvalNo): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/purchaseNegotiationSummary/listOffer', {comfirmNo: approvalNo}, this.newConfig);
    }
    /**谈判纪要列表 */
    public getNegotiationMinutesList(filter: any): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/purchaseNegotiationSummary/list', filter, this.defaultConfig);
    }
    /**谈判纪要新增编辑 */
    public addNegotiationMinutes(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/purchaseNegotiationSummary/save', data, this.newConfig);
    }

    /**谈判纪要详情 */
    public getNegotiationMinutesDetail(id): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/purchaseNegotiationSummary/item', { id: id }, this.defaultConfig);
    }
    /**谈判纪要审核 */
    public audit(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost<UfastHttpResT<any>>('/purchaseNegotiationSummary/audit', data, this.newConfig);
    }
    /**谈判纪要删除 */
    public delNegotiationMinutes(id): Observable<UfastHttpResT<any>> {
      return this.http.newPost<UfastHttpResT<any>>('', id, this.newConfig);
    }
  }
}
@Injectable()
export class NegotiationMinutesService extends NegotiationMinutesServiceNs.NegotiationMinutesServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }
}

