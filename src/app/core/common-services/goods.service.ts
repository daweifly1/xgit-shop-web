import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace GoodServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }

  export class GoodsServiceClass {
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
      return this.http.Post<UfastHttpResT<any>>('/goods/list', filter, this.defaultConfig);
    }

    /**详情 */
    public getItem(id: number): Observable<any> {
      return this.http.Get('/goods/item', {'id': id}, this.defaultConfig);
    }

    /**新增保存 */
    public save(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/goods/save', data, this.defaultConfig);
    }

    /**删除 */
    public delete(ids: any[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/goods/delete', ids, this.defaultConfig);
    }
  }
}

@Injectable()
export class GoodsService extends GoodServiceNs.GoodsServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
