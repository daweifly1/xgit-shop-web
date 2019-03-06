import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace OtherWarehouseServiceNs {


  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }
  export enum ErpSyncFlag {
    Undone,     // 未同步
    Done        // 已同步
  }
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
  // 新增时头部数据模型
  export interface AddOtherHeaderModel {
    applyDate?: string;
    createId: string;
    createName: string;
    deptId?: string;
    dept?: string;
    inArea?: string;
    inLocation?: string;
    innerOrder?: string;
    innerOrderNote?: string;
    note?: string;
    typeId?: string;
    barcodeFlag: number;
    agreementCode?: string;
    agreementFlag?: number;
    customerId?: string;
    customerName?: string;
  }

  // 选择物料提交数据模型
  export interface AddOtherMaterialModel {
    amount?: number;
    amountAfterAdjust?: number;
    applyQty?: number;
    barCode?: string;
    deliveryNum?: number;
    enableNum?: number;
    intentionNum?: number;
    isChecked?: boolean;
    locationCode?: string;
    marketingActivityPriceVOList?: string[];
    materialsDes?: string;
    materialsId?: string;
    materialsNo?: string;
    materialsType?: string;
    price?: string;
    priceSchemeId?: string;
    priceSchemeName?: string;
    qty?: number;
    requestDeliveryDate?: string;
    unit?: string;
    userName?: string;
  }

  // 物料列表展示数据模型
  export interface WareHouseModel {
    abnormalNo?: number;
    applicationDate?: number;
    createName?: number;
    dept?: string;
    deptId?: number;
    qty?: number;
    id?: number;
    inArea?: number;
    inLocation?: boolean;
    orgId?: string;
    state?: string;
    type?: string;
    typeId?: string;
  }
  export interface InboundData {
    detailList: any[];
    headerInfo: any;
  }
  export class OtherWarehouseServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway : HttpUtilNs.GatewayKey.Ss
      };
    }

    // 获取入库列表
    public getWareHouseList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/abnormalIn/list', filter, this.defaultConfig);
    }

    // 新增入库记录
    public addWareHouse(detailList: AddOtherMaterialModel[], headerInfo: AddOtherHeaderModel): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/abnormalIn/add', {
        detailList: detailList,
        headerInfo: headerInfo
      }, this.defaultConfig);
    }

    // 更新非正常入库记录
    public updateWareHouse(detailList: AddOtherMaterialModel[], headerInfo: AddOtherHeaderModel): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/abnormalIn/update', {
        detailList: detailList,
        headerInfo: headerInfo
      }, this.defaultConfig);
    }

    // 删除入库记录
    public deleteWareHouse(ids: string[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/abnormalIn/remove', ids, this.defaultConfig);
    }

    // 查询仓库，查询条件为企业标识，选填
    public getInWareHouseList(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/warehouse/list', data, this.defaultConfig);
    }


    // 根据仓库编码查找库区
    public getCodeAreaWareHouseList(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/warehouse/list', data, this.defaultConfig);
    }

    // 查询单据配置类型记录列表
    public getBillTypeConfigList(filter: { filters: {inOut?: number}, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      const data = {
        pageNum: filter.pageNum,
        pageSize: filter.pageSize,
        filters: filter.filters,
      };
      return this.http.Post<UfastHttpResT<any>>('/billTypeConfig/list', data, this.defaultConfig);
    }

    // 选择入库类型
    public getInType(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/billTypeConfig/item', {id: id}, this.defaultConfig);
    }

    // 获取单条入库记录详情
    public getInMouseDetail(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/abnormalIn/item', {id: id}, this.defaultConfig);
    }

    // 获取物料列表
    public getMaterialList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      filter.filters.storageFlag = true;
      return this.http.Post<UfastHttpResT<any>>('/factoryMaterial/listByOrgId', filter, this.defaultConfig);
    }

    // 提交审批
    public statementFinish(billNo: string, materialsNo: string): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/abnormalIn/manualFinish', {
        billNo: billNo,
        materialsNo: materialsNo || null
      }, this.defaultConfig);
    }
    // 入库
    public inboundReceive(data: InboundData): Observable<UfastHttpResT<any>> {
      return this.http.Post('/warehouseInboundRecord/receive', data, this.defaultConfig);
    }
    // 打印模板列表
    public printTpl(CurPage: string, PageSize: string, TemplateType: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/printTemplate/list', {
        CurPage,
        PageSize,
        TemplateType
      }, this.defaultConfig);
    }
    /**
     * erp同步
     * */
    public stockInErpSync(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Post('/abnormalIn/abnormalInErp', {id: id}, this.defaultConfig);
    }
  }
}
@Injectable()
export class OtherwarehouseService extends OtherWarehouseServiceNs.OtherWarehouseServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

