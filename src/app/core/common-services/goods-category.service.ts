import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace GoodsCategoryServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }

  export class GoodsCategoryServiceClass {
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
      return this.http.Post<UfastHttpResT<any>>('/goodsCategory/list', filter, this.defaultConfig);
    }

    /**详情 */
    public getItem(id: number): Observable<any> {
      return this.http.Get('/goodsCategory/item', {'id': id}, this.defaultConfig);
    }

    /**新增保存 */
    public save(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goodsCategory/save', data, this.defaultConfig);
    }

    /**删除 */
    public delete(ids: any[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/goodsCategory/delete', ids, this.defaultConfig);
    }
  }
}

@Injectable()
export class GoodsCategoryService extends GoodsCategoryServiceNs.GoodsCategoryServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
