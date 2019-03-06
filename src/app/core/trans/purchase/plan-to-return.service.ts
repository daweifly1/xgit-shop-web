import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../../infra/http/http-util.service';
export namespace PlanToReturnServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {}
  export class PlanToReturnServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig = {};
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig.gateway = HttpUtilNs.GatewayKey.Ps;
    }
    /**
     * 计划退回列表
     */
    public getReturnList(filter) {
      return this.http.newPost('/purchasePlanDetailsExtend/listReturnDetails', filter, this.defaultConfig);
    }
  }
}

@Injectable()
export class PlanToReturnService extends PlanToReturnServiceNs.PlanToReturnServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }

}
