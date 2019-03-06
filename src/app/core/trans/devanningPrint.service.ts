import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';


export namespace DevanningPrintServiceNs {
    export enum BarcodeStatus {
      Printed = '0',
      StockIn = '1',
      StouckOut = '2',
      Splited = '3'
    }
    export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
    }
    export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
    }
    export interface DevanningPrintListModel {
        _checked: boolean;
        materialsNo: string;
        materialsDes: string;
        totalQty: number;
        currentQty: number;
        barcodeStatus: string;
        printTime: string;
        printName: string;
        billNo: string;
        barcode: string;
        barcodeFlag: string;
        vinid: string;
        orawyd: string;
        barcodeDesc: string;
        model: string;
    }

    export class DevanningPrintServiceClass {
        private http: HttpUtilService;
        constructor(private injector: Injector) {
            this.http = this.injector.get(HttpUtilService);
        }

        public getDevanningPrintList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post('/barcode/list', filter, config);
        }

        public getBeginningWarehouseList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post('/initialInventory/listBill', filter, config);
        }

        public getDetailMaterialList(filter: { pageNum: number, pageSize: number, filters: any }): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post('/initialInventory/listMaterials', filter, config);
        }

        public statementFinish(billNo: string, materialsNo: string): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post<UfastHttpResT<any>>('/initialInventory/manualFinish', {
                billNo: billNo,
                materialsNo: materialsNo || null
            }, config);
        }

        public print(barcode: string, detailList: any): Observable<UfastHttpResT<any>> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Ss;
            return this.http.Post<UfastHttpResT<any>>('/barcode/splitPrint', {
                barcode,
                detailList
            }, config);
        }
    }
}
@Injectable()
export class DevanningPrintService extends DevanningPrintServiceNs.DevanningPrintServiceClass {
    constructor(injector: Injector) {
        super(injector);
    }
}

