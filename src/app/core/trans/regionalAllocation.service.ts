import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace RegionalAllocationServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }
  export enum billStatus {
    Submit = 1,
    Pass,
    Reject
  }
  export class RegionalAllocationServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
    }
    /**
     * 仓库管理列表
     */
    public getWarehouseList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post('/warehouse/list', filter, this.defaultConfig);
    }
    /**
     * 侧边栏物料
     */

    public getMaterialList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/warehouseInventory/listForCollect', filter, this.defaultConfig);
    }
    /**
     * 列表
     */
    public getRegionAllotList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post('/regionAllot/list', filter, this.defaultConfig);
    }
    /**
     * 新增
     */
    public addRegionAllot(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/regionAllot/add', data, this.defaultConfig);
    }
    /**
     * 详情
     */
    public getRegionAllotDetail(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Get('/regionAllot/item', {id: id}, this.defaultConfig);
    }
    /**
     * 编辑
     */
    public editRegionAllot(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/regionAllot/update', data, this.defaultConfig);
    }
    /**
     * 删除
     */
    public deleteRegionAllot(ids): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/regionAllot/remove', ids, this.defaultConfig);
    }
    /**
     * 审核通过
     */
    public auditPass(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/regionAllot/auditPass', data, this.defaultConfig);
    }
    /**
     * 审核拒绝
     */
    public reject(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/regionAllot/auditRefused', data, this.defaultConfig);
    }
    /**
     * 导出
     */
    public export(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/regionAllot/export', data, this.defaultConfig);
    }
    /**
     * 导出
     */
    public exportAll(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/regionAllot/exportAll', data, this.defaultConfig);
    }
    public outbound(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/warehouseDeliveryRecord/receive', data, this.defaultConfig);
    }
    public inbound(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>> ('/warehouseInboundRecord/receive', data, this.defaultConfig);
    }
  }

}
@Injectable()
export class RegionalAllocationService extends RegionalAllocationServiceNs.RegionalAllocationServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

