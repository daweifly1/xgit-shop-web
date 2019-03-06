import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace DispatchBillServiceNs {

    export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
    }
    export enum DeliveryStatus {
      WAIT_SUBMIT = 0,  //  待提交
      WAIT_SEND = 1,  // 待发货
      QR_PART_SEND = 3, // 部分扫码发货
      QR_ALL_SEND = 4,   // 全部扫码发货
      SEND = 10,  // 已发货
      REG_SEND = 11   // 到货登记
    }
    // 发货列表字段
    export interface DispatchBillList {
        deliveryType: string;
        invoiceNo: string;
        deliveryStatus: number;
        purchaseNo: string;
        contractType: string;
        businessEntity: string;
        goodsReceivor: string;
        billReceivor: string;
        createDate: string;
        creator: string;
        status: number;
        index?: number;
        isShowActionPopover?: boolean;
        ifCodeManage?: number;
    }
    export enum ContractTypeEnum {
      Purchase = 1,
      Protocol = 2
    }
    export enum BarcodeFlag {
      False,
      True
    }
    // 合同类型
    export interface ContractType {
        id: number;
        type: string;
    }
    export interface DeliveryTypeItem {
      id: number;
      name: string;
    }
    export interface GoodsReceivor {
        id: string;
        name: string;
    }
    export interface TransportMode {
      id: number;
      type: string;
    }
    // 详情-发货信息-物流信息字段
    export interface DispatchDetailHeaderInfo {
        invoiceNo: string;
        deliveryType: string;
        purchaseNo: string;
        supplierName: string;
        goodsReceivor: string;
        contractType: string;
        consignee: string;
        deliveryPhone: string;
        deliveryAddress: string;

        logisticsNo: string;
        logisticsCompany: string;
        deliveryDate: string;
        logisticsContact: string;
        logisticsPhone: string;
        licensePlate: string;
        ogisticsAttach: string;
    }
    // 详情-物料字段
    export interface DispatchDetailMaterial {
        materialsNo: string;
        materialsName: string;
        unit: string;
        ifCodeManage: boolean;
        deliveryCount: string;
    }
    // 合同列表字段
    export interface ContractItemModel {
      attribute2: string;      // 物料类型 ,
      attribute3: string;     // 签约日期 ,
      attribute8: string;       // 合同有效期 ,
      billToLocationId: string;       // 收单方组织ID ,
      documentSubtype: string;        // 合同类型 ,
      locationCode: string;         // 收单方 ,
      name: string;                   // 业务实体 ,
      orgId: string;                     // 业务实体ID ,
      poHeaderId: string;     // 合同头ID ,
      purchase: string;                 // 统购/自购 ,
      purchaseContractDetailVOs?: ContractMaterialItem[];
      segment1: string;                   // 合同编号 ,
      shipToId: string;                     // 收货方组织ID ,
      shipToName: string;  // 收货方 ,
      typeName: string;                       // 合同类型描述 ,
      vendorId: string;                   // 供应商ID;
      vendorName: string;                  // 供应商名称
      index?: number;
    }
    // 物料信息
    export interface OrderMaterialItem {
      deliveredCount?: number;
      deliveryCount?: number;
      ifCodeManage: number;
      materialsName: string;
      materialsNo: string;
      materialsId: string;
      materialType: number;
      orderCount?: number;
      unit: string;
      lineNum?: number;
      unDeliveredCount?: number;

    }
    export interface ContractMaterialItem {
      description: string;              // 物料描述 ,
      itemId: string;                   // 物料ID ,
      keeperId: string;
      keeperName: string;
      lineNum: string;                  // 行号 ,
      locationCode: string;             // 储位,
      needByDate: string;                // 需要日期 ,
      orgId: string;                     // 业务实体 ,
      poHeaderId: string;                // 合同头ID ,
      poLineId: string;                  // 合同行ID ,
      qtyRcvTolerance: number;            // 超量接收允差 ,
      quantity: number;                   // 订单数量 ,
      segment1: string;                   // 物料编码 ,
      unitMeasLookupCode: string;         // 单位 ,
      uomCode: string;                   // 单位编码
      deliveryCount?: number;             // 发货数量
    }
    // 年度协议物料信息
    export interface AnnualAgreementMaterialList {
        materialsNo: string;
        materialsName: string;
        unit: string;
        ifCodeManage: string;
        deliveryCount: string;

    }
    export enum SubmitType {
      StashSave,
      Submit
    }
    export interface DeliveryInfo {
      deliveryDate: string;
      licensePlate: string;
      logisticsAttach: string;
      logisticsCompany: string;
      logisticsContact: string;
      logisticsNo: string;
      logisticsPhone: string;
    }
    export interface SubmitInvoiceInfo extends DeliveryInfo {
      billReceivor: string;
      billType: number;
      consignee: string;
      contractType: number;
      deliveryAddress: string;
      deliveryPhone: string;
      deliveryType: number;
      goodsReceivor: string;
      purchaseNo: string;
      status: number;
      supplierName: string;
      supplierNo: string;
      purchaseHeaderId?: string;
      goodsReceivorID?: string;
      fullName?: string;
    }
    export interface SubmitData {
      detailList: OrderMaterialItem[];
      invoiceInfo: SubmitInvoiceInfo;
    }
    // 批量物流发货--发货信息
    export interface ShippingInformationList {
        deliveryType: string;
        invoiceNo: string;
        purchaseNo: string;
        contractType: string;
        businessEntity: string;
        goodsReceivor: string;
        billReceivor: string;
    }

    export class DispatchBillServiceClass {
      private http: HttpUtilService;
      private deliveryTypeList: DeliveryTypeItem[];
      private contractTypeList: ContractType[];
      private defaultConfig: HttpUtilNs.UfastHttpConfig;
      private iusConfig: HttpUtilNs.UfastHttpConfig;
      private transportModeList: TransportMode[];
      constructor(private injector: Injector) {
            this.http = this.injector.get(HttpUtilService);
            this.deliveryTypeList = [
              {id: 1, name: '采购订单发货'},
              {id: 2, name: '年度协议发货'}
            ];
          this.contractTypeList = [
            {id: 1, type: '采购订单' },
            {id: 2, type: '年度协议'}
          ];
          this.defaultConfig = {
            gateway: HttpUtilNs.GatewayKey.Ss
          };
          this.iusConfig = {
            gateway: HttpUtilNs.GatewayKey.Ius
          };
          this.transportModeList = [
            {id: 1, type: '铁运' },
            {id: 2, type: '汽运'}
          ];
        }
      public getMaterialList(filter: {pageNum: number; pageSize: number; filters: any}) {
        filter.filters.storageFlag = true;
        return this.http.Post<UfastHttpResT<any>>('/factoryMaterial/listByOrgId', filter, this.defaultConfig);
      }
      // 发货单列表
      public getDispatchBillList(filter: any): Observable<UfastHttpResT<any>> {
        return this.http.Post<UfastHttpResT<any>>('/warehouseInvoice/pageList', filter, this.defaultConfig);
      }

      // 发货单详情
      public getDispatchBillDetail(id: string): Observable<UfastHttpResT<any>> {
          return this.http.Get<UfastHttpResT<any>>('/warehouseInvoice/view', { id: id }, this.defaultConfig);
      }

      // 合同列表
      public getContractList(filter: any): Observable<UfastHttpResT<any>> {
          return this.http.Post<UfastHttpResT<any>>('/purchaseContract/list', filter, this.defaultConfig);
      }

      // 合同类型
      public getContractType(): Observable<UfastHttpResT<any>> {
        const resData: UfastHttpResT<ContractType[]> = {
          code: 0,
          message: '',
          value: JSON.parse(JSON.stringify(this.contractTypeList))
        };
        return Observable.of(resData);
      }
      public getDeliveryTypeList(): Observable<UfastHttpResT<DeliveryTypeItem[]>> {
        const resData: UfastHttpResT<DeliveryTypeItem[]> = {
          code: 0,
          message: '',
          value: JSON.parse(JSON.stringify(this.deliveryTypeList))
        };
        return Observable.of(resData);
      }
      public getContractDetail(id: string): Observable<UfastHttpResT<any>> {
        return this.http.Get('/purchaseContract/item', {poHeaderId: id}, this.defaultConfig);
      }
      // 收货方
      public getGoodsReceivor(data): Observable<UfastHttpResT<any>> {
          return this.http.Post<UfastHttpResT<any>>('', data, this.defaultConfig);
      }
      // 保存
      public saveDispatchBill(submitData: SubmitData): Observable<UfastHttpResT<any>> {
        return this.http.Post<UfastHttpResT<any>>('/warehouseInvoice/save', submitData, this.defaultConfig);
    }
    // 提交
    public commitDispatchBill(submitData: SubmitData): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/warehouseInvoice/commit', submitData, this.defaultConfig);
  }

      // 删除
      public deleteDispatchBill(id): Observable<UfastHttpResT<any>> {
          return this.http.Get('/warehouseInvoice/delete', {id: id}, this.defaultConfig);
      }
      // 批量发货
      public batchDelivery(info: DeliveryInfo, idList: string[]): Observable<UfastHttpResT<any>> {
        const data: any = Object.assign({}, info);
        data['invoiceNoList'] = idList;
        return this.http.Post('/warehouseInvoice/batchDelivery', data, this.defaultConfig);
      }

      // 判断是不是供应商
      // public isVendor() {
      //   return this.http.Get('/workspace/info', {}, this.iusConfig);
      // }
      // 运输方式
      public getTransportModeList(): Observable<any> {
        return Observable.of(this.transportModeList);
      }
    }
}
@Injectable()
export class DispatchBillService extends DispatchBillServiceNs.DispatchBillServiceClass {
    constructor(injector: Injector) {
        super(injector);
    }
}

