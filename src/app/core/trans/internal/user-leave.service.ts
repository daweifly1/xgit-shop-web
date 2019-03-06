import { HttpUtilService } from './../../infra/http/http-util.service';
import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace UserLeaveServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> { }
  export class UserLeaveServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private newConfig: HttpUtilNs.NewHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ius
      };
      this.newConfig = {
        gateway: HttpUtilNs.GatewayKey.Ius,
        delayLoading: 0
      };
    }
    /**列表 */
    public getUserLeaveList(filter): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/leave/list', filter, this.defaultConfig);
    }
    /**新增 */
    public addUserLeave(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/leave/insert', data, this.newConfig);
    }
    /**编辑 */
    public editUserLeave(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/leave/update', data, this.newConfig);
    }
    /**详情 */
    public getUserLeaveDetail(id): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/leave/item', { id: id }, this.defaultConfig);
    }
    /**删除 */
    public deleteUserLeave(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/leave/delete', data, this.newConfig);
    }
  }
}
@Injectable()
export class UserLeaveService extends UserLeaveServiceNs.UserLeaveServiceClass {

constructor(injector: Injector) {
  super(injector);
}

}
