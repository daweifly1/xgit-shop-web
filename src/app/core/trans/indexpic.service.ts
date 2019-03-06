import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';


export namespace IndexpicServiceNs {
  export interface IndexpicModelT<T> extends HttpUtilNs.UfastHttpRes {
    value: any;
  }

  export interface IndexpicModel {
    id?: string;
    imgUrl: string;
    name?: string;
    status?: string;
    type?: string;
  }
  export class IndexpicServiceClass {
    private http: HttpUtilService;
    constructor(private injector: Injector) {
      this.http = injector.get(HttpUtilService);
    }
    public addNews(IndexpicData: IndexpicModel) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post<IndexpicModelT<any>>('/information/queryImg', IndexpicData, config);
    }

    public getIndexpic(): Observable<IndexpicModelT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Get<IndexpicModelT<any>>('/information/queryImg', null, config);
    }
    public editIndexpic(IndexpicData: IndexpicModel) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post<IndexpicModelT<any>>('/information/imgConfig', IndexpicData, config);
    }
  }
}
@Injectable()
export class IndexpicService extends IndexpicServiceNs.IndexpicServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
