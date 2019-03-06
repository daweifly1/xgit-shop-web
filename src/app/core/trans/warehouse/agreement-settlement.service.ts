import { HttpUtilService } from './../../infra/http/http-util.service';
import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace AgreementSettlementServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> { }
  export interface AgreementSettlementFilter {
    code?: string;
    status?: number;
  }
  export interface AgreementSettlementList {
    id?: string;
    code: string;
    vendorName: string;
    agreementCode: string;
    applyDepartment: string;
    section: string;
    createDate: string;
    recordUserName: string;
    status: number;
  }
  export enum AgreementSettlementStatus {
    add,
    finish
  }
  export enum MaterialStatus {
    add,
    finish
  }
  export class AgreementSettlementServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private newConfig: HttpUtilNs.NewHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      this.newConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss,
        delayLoading: 0
      };
    }
    /**选择协议号 */
    public getAgreementList(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost<UfastHttpResT<any>>('/consumptionOutPut/listAgreement', data, this.defaultConfig);
    }
    /**根据协议号获取出库单信息 */
    public getPickingOutInfo(agreementCode): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/consumptionOutPut/queryByAgreement', { agreementCode: agreementCode }, this.defaultConfig);
    }
    /**完结 */
    public finishMaterial(ids): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/consumptionOutPut/endDetail', ids, this.newConfig);
    }
    /**列表 */
    public getAgreementSettlementList(filter): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/consumptionOutPut/list', filter, this.defaultConfig);
    }
    /**保存 */
    public addAgreementSettlement(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/consumptionOutPut/save', data, this.newConfig);
    }
    /**详情 */
    public getAgreementSettlementDetail(id): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/consumptionOutPut/item', { id: id }, this.defaultConfig);
    }
    /**删除 */
    public delAgreementSettlement(ids): Observable<UfastHttpResT<any>> {
      return this.http.newPost<UfastHttpResT<any>>('/consumptionOutPut/del', ids, this.newConfig);
    }
    /**提交计划 */
    public submitPlan(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/consumptionOutPut/subPlan', data, this.newConfig);
    }
  }
}

@Injectable()
export class AgreementSettlementService extends AgreementSettlementServiceNs.AgreementSettlementServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }

}
