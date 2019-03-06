import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace EquipmentModelServiceNs {
  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }
  export class EquipmentModelServiceClass {
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
    // 详情
    public getEquipmentModelItem(id: string): Observable<UfastHttpAnyResModel> {
      return this.http.newGet('/materialDeviceModel/itemByDeviceId', { deviceId: id }, this.defaultConfig);
    }
    // 保存
    public addEquipmentModel(data): Observable<UfastHttpAnyResModel> {
      return this.http.newPost('/materialDeviceModel/save', data, this.newConfig);
    }
        // 保存
        public editEquipmentModel(data): Observable<UfastHttpAnyResModel> {
          return this.http.newPost('/materialDeviceModel/update', data, this.newConfig);
        }
  }
}
@Injectable()
export class EquipmentModelService extends EquipmentModelServiceNs.EquipmentModelServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }

}
