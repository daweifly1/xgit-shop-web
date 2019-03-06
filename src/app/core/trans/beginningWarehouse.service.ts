import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace BeginningWarehouseServiceNs {
  // 入库状态
  export enum StockInStatus {
    Undone,
    Part,
    All,
    Finish
  }
  export enum BarcodeFlag {
    UnBarcode,
    Barcode
  }
  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }

  export interface OutLocationModel {
    description?: string;
    id?: string;
    orgId?: string;
    warehouseCode?: string;
  }

  export interface ReservoirModel {
    areaCode?: string;
    description?: string;
    id?: string;
    sapCode?: string;
    warehouseId?: string;
  }

  export class BeginningWarehouseServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private inventoryStatusList: { value: number, label: string}[];
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      this.inventoryStatusList = [
        { value: 0, label: '待入库'},
        { value: 1, label: '部分入库'},
        { value: 2, label: '全部入库'},
        { value: 3, label: '强制结单'}
      ];
    }
    public getInventoryStatusList(): Observable<any> {
      return Observable.of(this.inventoryStatusList);
    }
    public getBeginningWarehouseList(filter: {
      pageNum: number, pageSize: number, filters: any
    }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/initialInventory/listBill', filter, this.defaultConfig);
    }

    // 入库--详情接口
    public getStockInDetailMaterialList(filter: { pageNum: number, pageSize: number, filters: any }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/initialInventory/listWithStorage', filter, this.defaultConfig);
    }
    // 详情接口
    public getDetailMaterialList(filter: { pageNum: number, pageSize: number, filters: any }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/initialInventory/listMaterials', filter, this.defaultConfig);
    }

    public statementFinish(billNo: string, materialsNo: string): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/initialInventory/manualFinish', {
        billNo: billNo,
        materialsNo: materialsNo || null
      }, this.defaultConfig);
    }

    public getOutWareHouseList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      const data = {
        pageNum: filter.pageNum + '',
        pageSize: filter.pageSize + '',
        filters: filter.filters
      };
      return this.http.Post<UfastHttpResT<any>>('/warehouse/list', data, this.defaultConfig);
    }

    // 根据仓库编码查找库区
    public getCodeAreaWareHouseList(filter: { warehouseCode: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      const data = {
        pageNum: filter.pageNum + '',
        pageSize: filter.pageSize + '',
        warehouseCode: filter.warehouseCode + '',
      };
      return this.http.Get<UfastHttpResT<any>>('/warehouse/areaCodeListPage', data, this.defaultConfig);
    }

    public printTpl(CurPage: string, PageSize: string, TemplateType: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/printTemplate/list', {
        CurPage,
        PageSize,
        TemplateType
      }, this.defaultConfig);
    }
  }
}
@Injectable()
export class BeginningWarehouseService extends BeginningWarehouseServiceNs.BeginningWarehouseServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

