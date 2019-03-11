import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace GoodsAttributeServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }

  export class GoodsAttributeServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;

    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Shop
      };
    }

    // 查询分页列表
    public getPageList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goodsAttributeCategory/list', filter, this.defaultConfig);
    }

    /**详情 */
    public getItem(id: number): Observable<any> {
      return this.http.Get('/goodsAttributeCategory/item', {'id': id}, this.defaultConfig);
    }

    /**新增保存 */
    public save(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goodsAttributeCategory/save', data, this.defaultConfig);
    }

    /**删除 */
    public delete(ids: any[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/goodsAttributeCategory/delete', ids, this.defaultConfig);
    }

    // 查询属性分页列表
    public getAttrPageList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goodsAttribute/list', filter, this.defaultConfig);
    }

    /**新增保存 */
    public saveAttr(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goodsAttribute/save', data, this.defaultConfig);
    }

    /**删除 */
    public deleteAttr(ids: any[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/goodsAttribute/delete', ids, this.defaultConfig);
    }

    // 查询属性分页列表
    public getParamPageList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goodsAttributeValue/list', filter, this.defaultConfig);
    }

    /**新增保存 */
    public saveParam(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goodsAttributeValue/save', data, this.defaultConfig);
    }

    /**删除 */
    public deleteParam(ids: any[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/goodsAttributeValue/delete', ids, this.defaultConfig);
    }

  }
}

@Injectable()
export class GoodsAttributeService extends GoodsAttributeServiceNs.GoodsAttributeServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
