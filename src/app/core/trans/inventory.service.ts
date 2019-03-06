import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace InventoryServiceNs {

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

  export class InventoryServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
    }

    // 查询出入库记录列表
    public getInOutRecordList(filter: {
      filters: {
        businessOrder: string;
        type: any;
        materialName: string;
        materialNo: string;
        createDateStart: string;
        createDateEnd: string;
      }, pageNum: number, pageSize: number
    }): Observable<UfastHttpResT<any>> {
      const data = {
        pageNum: filter.pageNum,
        pageSize: filter.pageSize,
        filters: filter.filters,
      };
      return this.http.Post<UfastHttpResT<any>>('/warehouseInventory/listForInOutRecord', data, this.defaultConfig);
    }

    // 查询仓库库存列表
    public getWarehouseInventoryList(filter): Observable<UfastHttpResT<any>> {
      // const data = {
      //   pageNum: filter.pageNum,
      //   pageSize: filter.pageSize,
      //   filters: filter.filters,
      // };
      return this.http.Post<UfastHttpResT<any>>('/warehouseInventory/list', filter, this.defaultConfig);
    }

    // 仓库库存详情
    public getWarehouseInventoryDetail(filter: {
      filters: {
        locationCode: string;
        materialCode: string;
        agreementCode: string;
        status: number;
      }, pageNum: number, pageSize: number
    }): Observable<UfastHttpResT<any>> {
      const data = {
        pageNum: filter.pageNum,
        pageSize: filter.pageSize,
        filters: filter.filters,
      };
      return this.http.Post<UfastHttpResT<any>>('/warehouseInventory/detailList', data, this.defaultConfig);
    }

    // 查询盘点单列表
    public getinventoryCheckList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/inventoryCheck/list', filter, this.defaultConfig);
    }

    // 删除盘点单记录
    public deleteInventory(ids: string[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/inventoryCheck/remove', ids, this.defaultConfig);
    }

    // 启动盘点单
    public startInventory(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Post('/inventoryCheck/runCheck', { id: id }, this.defaultConfig);
    }

    // 关闭盘点单
    public stopInventory(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Post('/inventoryCheck/enforce', { id: id }, this.defaultConfig);
    }

    // 获取仓库列表
    public getWareHouseList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/warehouse/list', filter, this.defaultConfig);
    }

    // 选中仓库后获取物料列表
    public getCheckMaterialList(filter): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/inventoryCheck/invenitoryMaterialsList', filter, this.defaultConfig);
    }

    // 获取保管员列表
    public getKeeperList(warehouseCode: any): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/inventoryCheck/selectUserByWarehouse', warehouseCode, this.defaultConfig);
    }


    // 新增盘点单记录
    public addInventory(inventoryCheckDetailVOS: AddInventoryHeaderModel): Observable<UfastHttpResT<AddInventoryHeaderModel>> {
      return this.http.Post<UfastHttpResT<any>>('/inventoryCheck/add', inventoryCheckDetailVOS, this.defaultConfig);
    }

    // 查询盘点单详情
    public getInventoryDetail(inventoryCheckId: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/inventoryCheck/item', {
        inventoryCheckId: inventoryCheckId
      }, this.defaultConfig);
    }

    // 查询盘点单物料详情列表
    public getMaterialList(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/inventoryCheck/itemList', data, this.defaultConfig);
    }

    // 打印模板列表
    public printTpl(CurPage: string, PageSize: string, TemplateType: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/printTemplate/list', {
        CurPage,
        PageSize,
        TemplateType
      }, this.defaultConfig);
    }

    // 非条码管理盘点
    public inventory(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/inventoryCheck/check', data, this.defaultConfig);
    }
  }
}
@Injectable()
export class InventoryService extends InventoryServiceNs.InventoryServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

