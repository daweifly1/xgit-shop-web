import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace WarehouseWarrantServiceNs {

    export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
    }
    export interface WarehouseWarrantList {
        inNo: string;
        inType: string;
        status: string;
        contractNo: string;
        agreementFlag: string;
        businessEntityId: string;
        supplierName: string;
        receiveName: string;
        // 收单方
        createDate: string;
        createName: string;
        keeperName: string;
    }
    export interface HeaderInfo {
        inNo: string;              // 入库单号
        invoiceNo: string;         // 收货单号
        deliveryType: number;       // 发货类型
        contractNo: string;         // 合同号
        agreementFlag: string;       // 合同类型
        supplierName: string;        // 供应商
        receiveName: string;         // 收货方
        status: string;              // 状态
        barcodeFlag: number;         // 按条码管理
        keeperId: string;            // 保管员id
        keeperName: string;          // 保管员名称
    }
    export interface WarehouseStockInDetailVOs {
        materialCode: string;    // 物料编码
        materialName: string;    // 物料名称
        unit: string;            // 单位
        amountTotal: string;     // 验收数量
        amountNow: string;        // 本次入库数量
        status: string;           // 状态
        amountIn: string;         // 本单已入库数量
        locationCode: string;     // 储位

    }
    export enum ErpSyncFlag {
      UnSync,
      Syncing,
      SyncFailed,
      SyncDone,

    }
    export enum CompactType {
      order = 1,
      agreement
    }
    export class WarehouseWarrantServiceClass {
        private http: HttpUtilService;
        private inventoryStatus: {value: number, label: string}[];
        constructor(private injector: Injector) {
            this.http = this.injector.get(HttpUtilService);
            this.inventoryStatus = [
              {value: 0, label: '待入库'},
              {value: 1, label: '部分入库'},
              {value: 2, label: '全部入库'},
              {value: 3, label: '强制结单'}
            ];
        }
        public getInventoryStatus(): Observable<any> {
          return Observable.of(this.inventoryStatus);
        }

        public getWarehouseWarrantList(filter: any): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post<UfastHttpResT<any>>('/WarehouseStockIn/list', filter, config);
        }

        public getWarehouseWarrantDetail(id: string): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Get('/WarehouseStockIn/item', { id: id} , config);
        }

        public getLocationList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post<UfastHttpResT<any>>('/warehouse/list', filter, config);
        }

        public accountStatement(data): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post<UfastHttpResT<any>>('/warehouseStockIn/manualFinish',  data, config);
        }

        public delete(data): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post<UfastHttpResT<any>>('/warehouseStockIn/remove',  data, config);
        }

        public putInStorage(data): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post<UfastHttpResT<any>>('/warehouseInboundRecord/receive',  data, config);
        }
        public erpSync(id: string): Observable<UfastHttpResT<any>> {
          const config: HttpUtilNs.UfastHttpConfig = {};
          config.gateway = HttpUtilNs.GatewayKey.Ss;
          return this.http.Post('/WarehouseStockIn/receiveErp', {id: id}, config);
        }

    }
}
@Injectable()
export class WarehouseWarrantService extends WarehouseWarrantServiceNs.WarehouseWarrantServiceClass {
    constructor(injector: Injector) {
        super(injector);
    }
}

