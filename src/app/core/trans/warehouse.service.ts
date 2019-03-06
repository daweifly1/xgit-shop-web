import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace WarehouseServiceNs {

  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }

  export interface WarehouseModel {
    warehouseCode?: string;
    description?: string;
    isPlan?: string;
  }

  export interface WarehouseAreaModel {
    areaCode?: string;
    description?: string;
    sapCode?: string;
    warehouseId?: string;
  }

  export interface LocationModel {
    locationCode?: string;
    locationDesc?: string;
    shelfNo?: string;
    shelfType?: string;
    warehouseAreaId?: string;
  }
  export interface LocationDataModel {
    code: string;
    createDate: any;
    delFlag: number;
    houseLevel: number;
    id: string;
    keeperId: string;
    keeperName: string;
    name: string;
    orgId: string;
    pCode: string;
    remark: string;
    type: number;
    updateDate: any;
  }

  export class WarehouseServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
    }

    // 根据name获取保管员
    public getKeeperNameList(filter: {
      pageNum: number, pageSize: number, filters: any
    }): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post<UfastHttpAnyResModel>('/profile/list', filter, config);
    }

    public addWarehouse(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/warehouse/add', form, this.defaultConfig);
    }
    public updateWarehouse(form): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post('/warehouse/update', form, this.defaultConfig);
    }
    public deleteWarehouse(id): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/warehouse/removeWarehouse', id, this.defaultConfig);
    }

    public addWarehouseArea(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/warehouse/add', form, this.defaultConfig);
    }

    public addLocation(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/warehouse/addLocations', form, this.defaultConfig);
    }

    public getLocationList(filter): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/warehouse/list', filter, this.defaultConfig);
    }

    public editLocation(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/warehouse/update', form, this.defaultConfig);
    }
  }
}
@Injectable()
export class WarehouseService extends WarehouseServiceNs.WarehouseServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

