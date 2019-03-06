import { HttpUtilService } from './../../infra/http/http-util.service';
import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace AgreementMaterialrefServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {}
  export class AgreementMaterialrefServiceClass {
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
    /**列表 */
    public getAgreementMaterialrefList(filter): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/materialSettlementRel/list', filter, this.defaultConfig);
    }
    /**新增 */
    public addAgreementMaterialref(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/materialSettlementRel/save', data, this.newConfig);
    }
    /**详情 */
    public getAgreementMaterialrefDetail(id): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/materialSettlementRel/item', { id: id }, this.defaultConfig);
    }
    /**删除 */
    public delAgreementMaterialref(ids): Observable<UfastHttpResT<any>> {
      return this.http.newPost<UfastHttpResT<any>>('/materialSettlementRel/del', ids, this.newConfig);
    }
  }
}

@Injectable()
export class AgreementMaterialrefService extends AgreementMaterialrefServiceNs.AgreementMaterialrefServiceClass {

constructor(injector: Injector) {
  super(injector);
 }

}
