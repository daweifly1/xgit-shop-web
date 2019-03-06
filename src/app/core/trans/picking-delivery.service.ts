import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';

export namespace PickingDeliveryServiceNs {
  export interface PickingDeliveryResT<T> extends HttpUtilNs.UfastHttpRes {
    value: T;
  }
  export interface PickingDeliveryItem {
    agreementFlag: number;
    agreementCode: string;        // 协议号 ,
    agreementType: number;       // 协议类型(0代储代销,1单耗承包) ,
    applyDepartment: string;     // 领料部门 ,
    applyNo: string;             // 领料申请单号 ,
    createDate: string;           // 申请日期 ,
    detailVOList?: PickingDeliveryMaterial[];
    erpFlag: number;      // ERP过账(0未过账,1成功，2失败) ,
    erpOutNo: string;             // ERP出库单号 ,
    id: string;
    keeperId: string;           // 保管员ID ,
    keeperName: string;          // 保管员名称 ,
    needDate: string;             // 需要日期 ,
    orgId: string;                // 业务实体 ,
    outStatus: number;            // 出库状态（0未出库，1部分出库，2全部出库，3结单） ,
    outType: string;              // 出库类型(常规耗用) ,
    pickingNo: string;            // 领料出库单号 ,
    receiverAddress: string;      // 收货地址 ,
    receiverName: string;         // 收货人名称 ,
    receiverNumber: string;       // 收货人电话 ,
    section: string;              // 工段 ,
    status: number;               // 状态（0待审批，1审批通过，2审批拒绝） ,
    storageOrgId: string;         // 代储供应商id
    orgName: string;              // 业务实体
    storageOrgName: string;       // 代储供应商
    barcodeFlag: number;          // 是否条码管理
    isDistribution?: number;        // 是否配送
    isPrint?: Number;
  }
  export interface PickingDeliveryMaterial {
    amountApply?: number;     // 申请数量
    amountOuted?: number;     // 已出库数量
    id: string;               // 物料id
    materialCode: string;     // 物料编码
    materialName: string;     // 物料名称
    status: number;          //  出库状态
    unit: string;             // 单位
    pickingNo: string;        // 领料单编码
    warehouseCode: string;    // 领出仓库
    nomalInvtNum: number;     // 当前库存
    locationType: number;     // 储位级别
  }
  export interface Filter {
    pageSize: number;
    pageNum: number;
    filters: any;
  }
  export enum SubmitPlanFlag {
    UnSubmit,
    success
  }
  export class PickingDeliveryServiceClass {

    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private newConfig: HttpUtilNs.NewHttpConfig;
    private agreementFlagList: { value: number, label: string }[];

    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      this.agreementFlagList = [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ];
      this.newConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss,
        delayLoading: 0
      };
    }
    /**
     * 是否协议
     */
    public getAgreementFlagList(): Observable<any> {
      return Observable.of(this.agreementFlagList);
    }
    public getPickingOutList(filter: Filter): Observable<PickingDeliveryResT<any>> {
      return this.http.Post('/PickingOut/list', filter, this.defaultConfig);
    }
    /**出库单详情 id */
    public getOrderDetail(id: string): Observable<PickingDeliveryResT<PickingDeliveryItem>> {
      return this.http.Get('/PickingOut/item', { id: id }, this.defaultConfig);
    }
    public submitOrder(data: any): Observable<PickingDeliveryResT<PickingDeliveryItem>> {
      return this.http.Post('/PickingOut/out', data, this.defaultConfig);

    }
    public finishOrder(id: string):
      Observable<PickingDeliveryResT<PickingDeliveryItem>> {
      return this.http.Post('/PickingOut/finishBill', { id: id }, this.defaultConfig);
    }
    /**
     * erp同步
     * */
    public pickingErpSync(id: string): Observable<PickingDeliveryResT<any>> {
      return this.http.Post('/pickingOut/pickingOutErp', { id: id }, this.defaultConfig);
    }
    /**
     * 组包出库
     */
    public addPickingOutPackage(data): Observable<PickingDeliveryResT<any>> {
      return this.http.Post('/pickingOut/packageInsert', data, this.defaultConfig);
    }
    /**提交计划 */
    public submitPlan(data): Observable<PickingDeliveryResT<any>> {
      return this.http.newPost('/pickingOut/subPlan', data, this.newConfig);
    }

    /**改变打印状态 */
    public printAfter(data): Observable<PickingDeliveryResT<any>> {
      return this.http.newPost('/pickingOut/updateIsPrint', data, this.defaultConfig);
    }
    /**出库单  pickingNo */
    public getPickingDeliveryDetail(pickNo: string): Observable<PickingDeliveryResT<PickingDeliveryItem>> {
      return this.http.newGet('/PickingOut/itemByPickNo', { pickNo: pickNo }, this.defaultConfig);
    }
  }
}

@Injectable()
export class PickingDeliveryService extends PickingDeliveryServiceNs.PickingDeliveryServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
