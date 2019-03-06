import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace BillTypeServiceNs {

  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }

  // 定义更新单据类型参数
  export interface UpdateBillTypeModel {
    detailList?: any[];
    inOut?: number;
    isSynsap?: number;
    moveType?: string;
    type: string;
    createId: string;
    createName: string;
    id: string;
    orgId: string;
  }

  export class BillTypeServiceClass {
    private http: HttpUtilService;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
    }

    // 获取入库列表
    public getBillTypeList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post<UfastHttpResT<any>>('/billTypeConfig/list', filter, config);
    }

    public addBillType(data): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post<UfastHttpResT<any>>('/billTypeConfig/add', data, config);
    }

    // 编辑单据类型
    public updateBillType(data: UpdateBillTypeModel): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post<UfastHttpResT<any>>('/billTypeConfig/update', data, config);
    }

    // 获取单据列表详情
    public getBillTypeDetail(id: string): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Get<UfastHttpResT<any>>('/billTypeConfig/item', {id: id}, config);
    }

    // 删除单据类型
    public deleteBillType(ids: string[]): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post('/billTypeConfig/remove', ids, config);
    }
  }
}
@Injectable()
export class BillTypeService extends BillTypeServiceNs.BillTypeServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

