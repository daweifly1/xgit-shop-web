import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';
export namespace NegotiationPlanServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {}
  export interface NegotiationPlanList {
    id?: string;
    planNo: string;
    approvalNo: string;
    planTopic?: string;
    negotiationAmout?: number;
    negotiationDate?: string;
    negotiationAddress?: string;
    negotiationWay?: string;
    negotiationForm?: string;
    businessDepartment: string;
    negotiationLeader?: string;
    createName: string;
    createDate: string;
    status: number;
  }
  export enum SubmitType {
    Save,
    Submit
  }
  export enum NegotiationPlanStatus {
    Save,
    Submit,
    Pass,
    Reject
  }
  export enum NegotiationPlanPageType {
    AddPage = 1,
    EditPage,
    DetailPage,
    AuditPage
  }
  export class NegotiationPlanServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps
      };

    }
    public getDepartmentMember(filter): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ius
      };
      return this.http.newPost('/profile/list', filter, config);
    }
    /**谈判预案列表 */
    public getNegotiationPlanList(filter: any): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/purchaseNegotiationPlan/list', filter, this.defaultConfig);
    }
    /**谈判预案新增编辑 */
    public addNegotiationPlan(data): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost('/purchaseNegotiationPlan/save', data, config);
    }
    /**详情 */
    public getNegotiationPlanDetail(id: string): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/purchaseNegotiationPlan/item', {id: id}, this.defaultConfig);
    }
    /**审批 */
    public audit(id: string, status: NegotiationPlanStatus): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost<UfastHttpResT<any>> ('/purchaseNegotiationPlan/audit', {id: id, status: status}, config);
    }
  }
}

@Injectable()
export class NegotiationPlanService extends NegotiationPlanServiceNs.NegotiationPlanServiceClass {

  constructor(injector: Injector) {
    super(injector);
   }

}


