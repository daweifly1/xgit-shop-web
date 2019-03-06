import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace PurchaseOutServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }
  export enum StockOutStatus {
    Undone = 1,
    Wait,
    Part,
    All,
    Finish
  }
  export enum BarcodeFlag {
    Encoding = 0,
    Barcode
  }
  export interface PurchaseStockOut {
    barcodeFlag: number;
    refundCode: string;
    detailVOList: {
      amountOut: number;
      id: string;
      materialNo: string;
      keeperId: string;
      keeperName: string;
      locationCode: string;
    } [];
  }
  export enum ErpStatus {
    UnSync,
    InSync,
    SycnFail,
    SyncDone

  }
  export class PurchaseOutServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private barcodeFlagList: { value: number, label: string }[];
    private returnState: { value: number, label: string }[];
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      this.barcodeFlagList = [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
      ];
      this.returnState = [
        { label: '创建', value: 1 },
        { label: '待出库', value: 2 },
        { label: '部分出库', value: 3 },
        { label: '全部出库', value: 4 },
        { label: '强制结单', value: 5 }
      ];
    }
    public getBarcodeList(): Observable<any> {
      return Observable.of(this.barcodeFlagList);
    }
    public getReturnStateList(): Observable<any> {
      return Observable.of(this.returnState);
    }
    /**退出库列表 */
    public getPurchaseOutList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/refund/list', filter, this.defaultConfig);
    }
    /**出入库记录列表 */
    public getStockRecordList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/refund/queryStockInDetailList', filter, this.defaultConfig);
    }
    // 新增时查询调出仓库数据
    public getOutWareHouseList(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/warehouse/list', data, this.defaultConfig);
    }
    /**新增保存 */
    public addSavePurchaseOut(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/refund/save', data, this.defaultConfig);
    }
    /**新增提交 */
    public addSubmitPurchaseOut(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/refund/submit', data, this.defaultConfig);
    }
    /**详情 */
    public getPurchaseOutDetail(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/refund/item', { id: id }, this.defaultConfig);
    }
    /**结单 */
    public statementFinish(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/refund/endBill', data, this.defaultConfig);
    }
    /**删除 */
    public deletePurchaseOut(ids: any[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/refund/delete', ids, this.defaultConfig);
    }
    /**
     * 出库
     * */
    public purchaseExitStockOut(data: PurchaseStockOut): Observable<UfastHttpResT<any>> {
      return this.http.Post('/refund/out', data, this.defaultConfig);
    }
    /**
     * erp同步
     * */
    public stockInErpSync(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Post('/refund/outErp', {id: id}, this.defaultConfig);
    }
  }
}

@Injectable()
export class PurchaseOutService extends PurchaseOutServiceNs.PurchaseOutServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
