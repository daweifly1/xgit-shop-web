import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace ReceivingNoteServiceNs {
    export enum BarcodeFlag {
      Flase,
      True
    }
    export enum BillType {
      Dispach,
      Receive
    }
    export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
    }
    // 合同列表字段
    export interface ContractItemModel {
        attribute2: string;              // 物料类型 ,
        attribute3: string;              // 签约日期 ,
        attribute8: string;              // 合同有效期 ,
        billToLocationId: string;        // 收单方组织ID ,
        documentSubtype: string;         // 合同类型 ,
        locationCode: string;            // 收单方 ,
        name: string;                    // 业务实体 ,
        orgId: string;                   // 业务实体ID ,
        poHeaderId: string;              // 合同头ID ,
        purchase: string;                // 统购/自购 ,
        purchaseContractDetailVOs?: ContractMaterialItem[];
        segment1: string;                 // 合同编号 ,
        shipToId: string;                 // 收货方组织ID ,
        shipToName: string;               // 收货方 ,
        typeName: string;                 // 合同类型描述 ,
        vendorId: string;                 // 供应商ID;
        vendorName: string;               // 供应商名称
        index?: number;
    }
    export interface ContractMaterialItem {
        description: string;              // 物料描述 ,
        itemId: string;                   // 物料ID ,
        keeperId: string;                   // 保管员id
        keeperName: string;                 // 保管员名称
        lineNum: string;                  // 行号 ,
        locationCode: string;             // 储位,
        needByDate: string;               // 需要日期 ,
        orgId: string;                    // 业务实体 ,
        poHeaderId: string;               // 合同头ID ,
        poLineId: string;                 // 合同行ID ,
        qtyRcvTolerance: number;          // 超量接收允差 ,
        quantity: number;                 // 订单数量 ,
        segment1: string;                 // 物料编码 ,
        unitMeasLookupCode: string;       // 单位 ,
        uomCode: string;                  // 单位编码
    }
    // 收货列表字段
    export interface ReceivingNoteList {
        deliveryType?: string;
        invoiceNo?: string;
        deliveryStatus?: number;
        status: number;
        purchaseNo?: string;
        contractType?: string;
        businessEntity?: string;
        goodsReceivor?: string;
        billReceivor?: string;
        createDate?: string;
        creator?: string;
        billType: number;
        ifCodeManage: number;
        _checked?: boolean;
        stockStatus: number;
        isShowActionPopover?: boolean;
        index?: number;
        qrDeliveryStatus?: number;
    }
    // 详情-headerInfo字段
    export interface ReceivingNoteHeaderInfo {
        invoice: string;
    }
    // 详情-物料字段
    export interface ReceivingNoteMaterial {
        materialsNo: string;
        materialsName: string;
        unit: string;
        ifCodeManage: boolean;
        deliveryCount: string;
    }
    // 合同列表字段
    export interface ContractList {
        purchaseNo: string;
        deliveryStatus: string;
        contractType: string;
        // 签约日期
        // 交货日期
        businessEntity: string;
        goodsReceivor: String;
        billReceivor: string;
        index?: number;
    }
    // 侧边栏物料
    export interface MaterialList {
        code?: string;
        name?: string;
        unit?: string;
        barcodeFlag?: number;
        locationCode?: string;
        keeperId: string;
        keeperName: string;
        _checked?: boolean;
    }
    // 采购订单物料信息
    export interface PurchaseOrderMaterialList {
        id?: string;
        materialsNo?: string;
        materialsName?: string;
        unit?: string;
        ifCodeManage?: number;
        orderCount?: string;
        deliveredCount?: string;
        deliveryCount?: number;
        itemId?: string;
        locationCode?: string;
        keeperId?: string;
        keeperName?: string;
        quantity?: string;
        materialCode?: string;
        materialDesc?: string;
        unitMeasLookupCode?: string;
        poLineId?: string;
        poHeaderId?: string;
        qty?: string;
        barcodeFlag?: number;
        checked?: boolean;
        lineNum?: number;
        receiptCount?: number;
        billReceiptCount?: number;
        storedCount?: number;
    }
    export enum ButtonState {
        Receive = 1,
        ManualFinish = 2,
        Finish = 3,
        Print = 10,
        AbnormalPrint = 11
    }
    export enum BillStatus {
      Init = 0,
      UnReceive,
      PartReceive,
      AllReceive,
      PartStockIn,
      AllStockIn = 10,
      Finish = 11
    }
    export enum QrDeliveryStatus {
      Init = 0,   // 未扫码发货
      PartSend = 3, // 部分扫码发货
      AllSend = 4, // 全部扫码发货
      RegSend = 11, // 到货登记
    }
    export class ReceivingNoteServiceClass {
        private http: HttpUtilService;
        private defaultConfig: HttpUtilNs.UfastHttpConfig;
        private newConfig: HttpUtilNs.NewHttpConfig;
        constructor(private injector: Injector) {
            this.http = this.injector.get(HttpUtilService);
            this.defaultConfig = {
                gateway: HttpUtilNs.GatewayKey.Ss
            };
            this.newConfig = {
              gateway: HttpUtilNs.GatewayKey.Ss,
              delayLoading: 0
            };
        }

        // 收货单列表
        public getReceivingNoteList(filter: any): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouseInvoice/pageList', filter, this.defaultConfig);
        }

        // 收货单详情
        public getReceivingNoteDetail(id: string): Observable<UfastHttpResT<any>> {
            return this.http.Get<UfastHttpResT<any>>('/warehouseInvoice/view', { id: id }, this.defaultConfig);
        }
        // 收货单入库详情
        public getReceivingNoteStockInDetail(id: string): Observable<UfastHttpResT<any>> {
          return this.http.Get<UfastHttpResT<any>>('/warehouseInvoice/viewWithUpdate', { id: id }, this.defaultConfig);
      }

        // 合同列表
        public getContractList(filter: any): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/purchaseContract/list', filter, this.defaultConfig);
        }

        // 合同详情
        public getContractDetail(id: string): Observable<UfastHttpResT<any>> {
            return this.http.Get<UfastHttpResT<any>>('/purchaseContract/item', { poHeaderId: id }, this.defaultConfig);
        }

        // 合同详情里的默认储位
        public getLocation(id: string): Observable<UfastHttpResT<any>> {
            return this.http.Get<UfastHttpResT<any>>('/FactoryMaterial/item', { id: id }, this.defaultConfig);
        }


        public getLocationList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouse/list', filter, this.defaultConfig);
        }

        // 结单
        public accountStatement(data): Observable<UfastHttpResT<any>> {
            return this.http.Post('/warehouseInvoice/manualFinish', data, this.defaultConfig);
        }


        // 保存
        public add(invoiceInfo, detailList): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouseInvoice/add', {
                invoiceInfo: invoiceInfo,
                detailList: detailList
            }, this.defaultConfig);
        }

        // 生成入库单
        public acknowledgeReceipt(invoiceInfo, detailList): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouseInvoice/acknowledgeReceipt', {
                invoiceInfo: invoiceInfo,
                detailList: detailList
            }, this.defaultConfig);
        }
        // 验收收货单
        public acceptanceReceipt(invoiceInfo: any, detailList: any[]): Observable<UfastHttpResT<any>> {
          return this.http.Post('/warehouseInvoice/conformReceipt', {
            invoiceInfo: invoiceInfo,
            detailList: detailList
          }, this.defaultConfig);
        }
        // 编辑
        public updateReceivingNote(invoiceInfo, detailList): Observable<UfastHttpResT<any>> {
            return this.http.Post<UfastHttpResT<any>>('/warehouseInvoice/update', {
                invoiceInfo,
                detailList
            }, this.defaultConfig);
        }

        // 删除
        public deleteReceivingNote(id): Observable<UfastHttpResT<any>> {
            return this.http.Get('/warehouseInvoice/delete', { id: id }, this.defaultConfig);
        }

        // 侧边栏物料
        public getMaterialSettingList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpResT<any>> {
          filter.filters.storageFlag = true;
            return this.http.Post('/factoryMaterial/listByOrgId', filter, this.defaultConfig);
        }

        // 入库通知单
        public getPrintWarehouseWarrantData(invoice: string): Observable<UfastHttpResT<any>> {
          return this.http.Get<UfastHttpResT<any>>('/warehouseInvoice/groupView', { id: invoice }, this.defaultConfig);
      }

      // 收货单验收退回
      public returnAcceptance(invoiceInfo: any, detailList: any[]): Observable<UfastHttpResT<any>> {
        return this.http.newPost('/warehouseInvoice/rollbackReceipt', {
          invoiceInfo: invoiceInfo,
          detailList: detailList
        }, this.newConfig);
      }
    }
}
@Injectable()
export class ReceivingNoteService extends ReceivingNoteServiceNs.ReceivingNoteServiceClass {
    constructor(injector: Injector) {
        super(injector);
    }
}

