import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace BasisCodeServiceNs {

  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }

  // 新增时数据模型
  export interface AddInventoryHeaderModel {
    checkOrderDes: string;
    checkType: number;
    inventoryCheckDetailVOS?: any[];
    plannedDate: string;
    warehouseCode: string;
    warehouseId: string;
    userIds?: string[];
    locationCodes?: string[];
    materialsList?: string[];
  }

  export class BasisCodeServiceClass {
    private http: HttpUtilService;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
    }

    // 获取期初条码打印列表
    public getInitInventoryPrintList(filter: { filters: { },
      pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post<UfastHttpResT<any>>('/initialInventory/listForPrint', filter, config);
    }

    // 期初条码打印预览
    public getInitInventoryBatchPrint(id: string[]): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post<UfastHttpResT<any>>('/initialInventory/batchPrint', id, config);
    }

    // 获取包装条码列表，默认不触发，通过搜索条件触发
    public getPackageCodePrint(order: string): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Get<UfastHttpResT<any>>('/warehouseInbound/itemByOrder', {order: order}, config);
    }

    // 包装条码打印
    public print(billNo: string, detailList: any,
       totalQty: number, materialsNo: string, materialsDes: string, rowNo: string ): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post<UfastHttpResT<any>>('/barcode/singlePrint', {
        billNo,
        detailList,
        totalQty,
        materialsNo,
        materialsDes,
        rowNo
      }, config);
    }
    public printPackageBarcode(data: any): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post('/barcode/singlePrint', data, config);
    }
  }
}
@Injectable()
export class BasisCodeService extends BasisCodeServiceNs.BasisCodeServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

