import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace AbnormalOutServiceNs {

    export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
    }
    // 出库状态
    export enum StockOutStatus {
      Undone,
      Part,
      All,
      Finish
    }
  export enum BarcodeFlag {
    UnBarcode,
    Barcode
  }
    // 其他出库列表数据模型
    export interface AbnormalOutDataListModel {
        abnormalNo?: string;
        voucherNo?: string;
        reasonName?: string;
        agentName?: string;
        outLocation?: string;
        createName?: string;
        applicationDate?: string;
        status?: StockOutStatus;
        note?: string;
        crmOrder?: string;
        id?: string;
        barcodeFlag: number;
    }

    export interface ReasonNameDataModel {
        id?: string;
        name?: string;
    }
    export interface ShippingMethodModel {
        id?: string;
        name?: string;
        code?: string;
        createDate?: string;
        groupName?: string;
        parentCode?: string;
        parentName?: string;
    }
    export interface AbnormalOutTypeModel {
        createId?: string;
        createName?: string;
        detailList?: string;
        id?: string;
        inOut?: string;
        innerOrder?: string;
        innerOrderNote?: string;
        isSynsap?: string;
        orgId?: string;
        type?: string;
    }
    export interface FreightSettlementMethodModel {
        id?: string;
        name?: string;
        code?: string;
        createDate?: string;
        groupName?: string;
        parentCode?: string;
        parentName?: string;
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
    export interface TransportLogisticsModel {
        companyName?: string;
        companyType?: string;
        companyTypeDesc?: string;
        createDate?: string;
        isBarcode?: string;
        orgCode?: string;
        orgId?: string;
        templateName?: string;
    }
    export interface ClientModel {
        companyName?: string;
        dealerCode?: string;
    }

    // 新增时头部数据模型
    export interface AbnormalOutHeaderModel {
        abnormalNo?: string;
        type?: string;
        applicationDate?: string;
        createName?: string;
        deliveryTypeName?: string;
        dept?: string;
        deptId?: string;
        innerOrder?: string;
        innerOrderNote?: string;
        receiverFax?: string;
        reasonName?: string;
        outLocation?: string;
        outArea?: string;
        logistics?: string;
        logisticsPerson?: string;
        logisticsPhone?: string;
        agentName?: string;
        sapOutArea?: string;
        settleTypeName?: string;
        receiverName?: string;
        receiverPhone?: string;
        address?: string;
        note?: string;
        createId?: string;
        applyDate?: string;
        typeId?: string;
        id?: string;
    }

    // 选择物料提交数据模型
    export interface AbnormalOutMaterialModel {
        amount?: number;
        amountAfterAdjust?: number;
        applyQty?: number;
        barCode?: string;
        deliveryDate?: string;
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
        sourcePrice?: string;
        unit?: string;
        userName?: string;
        status?: number;
    }

    // 物料信息数据模型
    export interface MaterialModel {
        abnormalNo?: number;
        applicationDate?: number;
        createName?: number;
        dept?: string;
        deptId?: number;
        qty?: number;
        id?: number;
        inArea?: number;
        inLocation?: boolean;
        isSynsap?: string;
        orgId?: string;
        state?: string;
        type?: string;
        typeId?: string;
    }

    export interface AbnormalOutFilterModel {
        pageNum?: number;
        pageSize?: number;
        abnormalNo?: string;
        outLocation?: string;
        status?: string;
        createName?: string;
        reasonName?: string;
        agentName?: string;
        crmOrder?: string;
        createDateStart?: string;
        createDateEnd?: string;
    }

    export class AbnormalOutServiceClass {
        private http: HttpUtilService;
        private defaultConfig: HttpUtilNs.UfastHttpConfig;
        constructor(private injector: Injector) {
            this.http = this.injector.get(HttpUtilService);
            this.defaultConfig = {
                gateway : HttpUtilNs.GatewayKey.Ss
            };
        }

        // 其他出库列表
        public getAbnormalOutList(filter: AbnormalOutFilterModel): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/abnormalOut/list', filter, this.defaultConfig);
        }

        // 获取其他出库详情
        public getAbnormalOutDetail(id: string): Observable<UfastHttpResT<any>> {
            return this.http.Get<UfastHttpResT<any>>('/abnormalOut/item', { id: id }, this.defaultConfig);
        }

        // 查询下拉选择框数据
        public getBillTypeConfigList(data): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/dataDictionary/searchList', data, this.defaultConfig);
        }

        // 查询出库类型下拉选择框数据
        public getAbnormalOutTypeList(data): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/billTypeConfig/list', data, this.defaultConfig);
        }
        /**部门编号数据 */
        public getBillType(id: string): Observable<UfastHttpResT<any>> {
          return this.http.Get<UfastHttpResT<any>>('/billTypeConfig/item', {id: id}, this.defaultConfig);
        }

        // 新增时查询调出仓库数据
        public getOutWareHouseList(data): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouse/list', data, this.defaultConfig);
        }

        // 新增
        public addWareHouse(detailList: AbnormalOutMaterialModel[],
            headerInfo: AbnormalOutHeaderModel): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/abnormalOut/add', {
                materialList: detailList,
                headerInfo: headerInfo
            }, this.defaultConfig);
        }

        // 更新
        public updateWareHouse(headerInfo: AbnormalOutHeaderModel,
            materialList: AbnormalOutMaterialModel[]): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/abnormalOut/update', {
                headerInfo: headerInfo,
                materialList: materialList
            }, this.defaultConfig);
        }

        // 删除
        public deleteWareHouse(ids: string[]): Observable<UfastHttpResT<any>> {
            return this.http.Post('/abnormalOut/remove', ids, this.defaultConfig);
        }


        // 根据仓库编码查找库区
        public getCodeAreaWareHouseList(data): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouse/list', data, this.defaultConfig);
        }

        // 根据componyType获取承运物流列表
        public getTransportLogisticsList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/company/list', filter, this.defaultConfig);
        }

        // 根据dealer,componyName获取客户列表
        public getClientList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/companyDealer/list', filter, this.defaultConfig);
        }


        // 获取物料列表
        public getMaterialList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouseInventory/listForCollect', filter, this.defaultConfig);
        }

        // 结单
        public statementFinish(billNo: string, materialsNo: string): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/abnormalOut/manualFinish', {
                billNo: billNo,
                materialsNo: materialsNo || null
            }, this.defaultConfig);
        }

        // 打印模板列表
        public printTpl(CurPage: string, PageSize: string, TemplateType: string): Observable<UfastHttpResT<any>> {
            return this.http.Get<UfastHttpResT<any>>('/printTemplate/list', {
                CurPage,
                PageSize,
                TemplateType
            }, this.defaultConfig);
        }
        // 非条码管理出库
        public addDelivery(data): Observable<UfastHttpResT<any>> {
            return this.http.Post('/warehouseDeliveryRecord/receive', data, this.defaultConfig);
        }
        /**
         * erp同步
         * */
        public stockOutErpSync(id: string): Observable<UfastHttpResT<any>> {
          return this.http.Post('/abnormalOut/abnormalOutErp', {id: id}, this.defaultConfig);
        }
    }
}
@Injectable()
export class AbnormalOutService extends AbnormalOutServiceNs.AbnormalOutServiceClass {
    constructor(injector: Injector) {
        super(injector);
    }
}

