import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace CoreIndexServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> { }
  export class CoreIndexServiceClass {
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
  }
}
@Injectable()
export class CoreIndexService extends CoreIndexServiceNs.CoreIndexServiceClass {

constructor(injector: Injector) {
  super(injector);
 }

}
