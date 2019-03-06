import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import { delay } from 'q';
export namespace PickingApplyServiceNs {
  export interface PickingApplyResT<T> extends HttpUtilNs.UfastHttpRes {
    value: T;
  }
  export interface  PickingApplyOrder {
    addlyName: string;        // 申请人名称 ,
    applyDate: string;        // 申请日期 ,
    applyDepartment: string;  // 领料部门 ,
    applyId: string;          //  申请人ID ,
    applyNo: string;          // 领料申请单号 ,
    id: string;
    materialType: string;     // 物料类型 ,
    needDate: string;         // 需要日期 ,
    orgId: string;            // 业务实体ID ,
    orgName: string;          // 业务实体名称 ,
    outStatus: number;            // 出库状态（0未出库，1部分出库，2全部出库，3结单） ,
    plannerId: string;        // 计划员ID ,
    plannerName: string;      // 计划员名称 ,
    receiverAddress: string;   // 收货地址 ,
    receiverId: string;       // 收货人ID ,
    receiverName: string;     // 收货人名称 ,
    receiverNumber: string;    // 收货人电话 ,
    remark: string;           //  审核描述 ,
    section: string;          // 工段 ,
    status: number;             // 状态（0待审批，1审批通过，2审批拒绝） ,
    usage: string;           // 用途
    pickingApplyDetailVOs?: MaterialDetailForPickApply[];
    applyDepartmentCode?: string;
    type?: string;
  }
  export interface MaterialDetail {
    amountApply?: number;     // 申请数量
    amountOuted?: number;     // 已出库数量
    applyNo?: string;         // 申请单号
    id: string;               // 物料id
    materialCode: string;     // 物料编码
    materialName: string;     // 物料名称
    status?: number;
    unit: string;             // 单位
    materialType?: number;
    plannerName?: string;
    barcodeFlag?: number;

  }
  export interface MaterialDetailForPickApply extends MaterialDetail {
    rowNo: number;            // 行号,
    materialDesc?: string;     // 物料描述
  }
  export interface FactoryMaterialDetail {
    createDate: string;
    createId: string;
    factoryMaterialSpaceVOS: any;     // 储位信息 ,
    id: string;
    managementMode: number;           // 管理模式(0:条码管理1:物料编码管理) ,
    materialCode: string;             // 物料编码 ,
    materialId: string;               // 物料id ,
    materialVO: FactoryMaterialMaterialVO;   // 物料详情 ,
    oldCode: string;                      // 旧编码
    orgId: string;                  // 厂矿id（spaceid） ,
    orgName: string;                // 厂矿名称 ,
    planDec: string;               // 计划分解 ,
    planner: string;               // 计划员 ,
    purchasingGroupId: string;      // 采购组id ,
    purchasingGroupMebId: string;    // 采购组组员id ,
    purchasingGroupMebName: string;      // 采购组组员名称 ,
    purchasingGroupName: string;     // 采购组组名 ,
    updateDate: string;
    updateId: string;
  }
  export interface FactoryMaterialMaterialVO {
    assemblyOrPart: number;         // 总成或部装 ,
    brand: string;                 // 品牌 ,
    code: string;                 // 物料编码 ,
    createDate: string;
    deviceId: string;               // 备件的设备id ,
    divideWorkId: string;         // 分工管理id ,
    drawingNumber: string;        // 零件号/图号 ,
    firstLevel: string;           // 三级类别名称 ,
    firstType: string;            // 一级类别id ,
    importOrDomestic: number;     // 进口/国产 ,
    importance: number;           // 重要程度 ,
    isDelete: number;             //
    material: string;             // 材质,
    materialClassification: number;       // 物资分类 ,
    materialType: number;               // 物料类别（1：材料2：设备3：备件） ,
    name: string;                       // 物料名称
    planPrice: string;              // 计划价 ,
    remark: string;                 //
    secondLevel: string;           // 三级类别名称 ,
    secondType: string;             // 二级类别id ,
    shortDress: number;             // 短装 ,
    specificationModel: string;    // 规格型号 ,
    supplyRange: number;            // 供应范围 ,
    taxRate: number;               // 增值税率 ,
    thirdLevel: string;             // 三级类别名称 ,
    thirdType: string;              // 三级类别id ,
    unit: number;                   // 单位 ,
    materialDesc?: string;          // 物料描述
  }
  export interface StockItem {
    addId: string;  // 添加人ID ,
    addName: string;  // 添加人名称 ,
    agreementCode: string;  // 协议号 ,
    agreementFlag: number;  // 是否协议库存(0协议库存，1非协议库存) ,
    amount: number;   // 在库数量 ,
    areaCode: string;  // 库区 ,
    barCode: string;  // 条码 ,
    barcodeFlag: number;  // 是否条码管理(0条码管理，1非条码管理) ,
    barcodeStatus: string;  // 条码状态 ,
    businessOrder: string;
    cost: number;     // 消耗库存 ,
    createDate: string;  // 添加时间 ,
    id: string;
    keeperId: string;  // 保管员ID ,
    keeperName: string;  // 保管员名称 ,
    locationCode: string;  // 储位 ,
    materialCode: string;  // 物料编码 ,
    materialDesc: string;  // 物料描述 ,
    materialName: string;  // 物料名称 ,
    materialType: string;  // 物料类别 ,
    model: string;  // 主键ID ,
    priorLocationCode: string;
    remark: string;  // 备注 ,
    status: number;  // 状态(0正常库存1冻结库存) ,
    statusDesc: string;  // 状态(0正常库存1冻结库存) ,
    total: number;      // 总库存 ,
    unit: string;  // 单位 ,
    updateDate: string;  // 修改时间 ,
    updateId: string;  // 最后修改人ID ,
    updateName: string;  // 最后修改人名称 ,
    warehouseCode: string;  // 仓库编码
    warehouseRemark: string;
  }
  export interface PostListRes extends HttpUtilNs.UfastHttpRes {
    value: HttpUtilNs.UfastResListT<PickingApplyOrder>;
  }
  export interface AuditData {
    ids: string[];
    status: AuditStatus;
    remark: string;
  }
  export enum AuditStatus {
    Wait,
    Pass,
    Reject
  }
  export enum OrderStatus {
    UnStockOut,
    PartStockOut,
    AllStockOut,
    Finish
  }
  export interface Filter {
    pageNum: number;
    pageSize: number;
    filters: any;
  }
  export interface SubmitOrderData {
    addlyName: string;        // 申请人名称 ,
    applyDate: string;        // 申请日期 ,
    applyDepartment: string;  // 领料部门 ,
    applyNo?: string;          // 领料申请单号 ,
    materialType: string;     // 物料类型 ,
    needDate: string;         // 需要日期 ,
    orgName: string;          // 业务实体名称 ,
    applyId: string;
    plannerName: string;      // 计划员名称 ,
    receiverAddress: string;   // 收货地址 ,
    receiverName: string;     // 收货人名称 ,
    receiverNumber: string;    // 收货人电话 ,
    remark: string;           //  审核描述 ,
    section: string;          // 工段 ,
    usage: string;           // 用途
    pickingApplyDetailVOs?: MaterialDetail[];
  }
  export enum SubmitType {
    StashSave,
    Submit
  }
  /**领料申请状态 */
  export enum PickingApplyStatus {
    UnCommited,
    Commited
  }
  /**领料申请确认状态 */
  export enum PickingApplyConfirmStatus {
    UnConfirm = 1,
    Confirm,
    GenerateOutOrder,
    InDistribution,
    AllStockOut,
    PartStockOut
  }
  /**配送方式 */
  export enum IsDistribution {
    TakeTheir,
    Distribution
  }
  export interface PickingOutMaterial {
    agreementNo?: string;
    amountOut: number;
    keeperId?: string;
    keeperName?: string;
    materialCode: string;
    materialName: string;
    locationCode: string;
    barcodeFlag: number;
    rowNo: number;
  }
  export interface AddPickingOut {
    applyNo: string;
    detailVOList: PickingOutMaterial[];
  }
  export class PickingApplyServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private deliveryMethodList: { value: number, label: string }[];
    private orderStatusList: { value: number, label: string}[];
    private outTypeList: { value: number, label: string}[];
    private deliveryStatusList: { value: number, label: string}[];
    constructor(private injector: Injector) {
      this.http  = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      this.deliveryMethodList = [
        { value: 0, label: '自提' },
        { value: 1, label: '配送' }
      ];
      this.orderStatusList = [
        { value: 1, label: '未确认'},
        { value: 2, label: '已确认'},
        { value: 3, label: '已生成出库单'},
        // { value: 4, label: '配送中'},
        // { value: 5, label: '全部出库'},
        // { value: 6, label: '部分出库'}
      ];
      this.outTypeList = [
        { value: 0, label: '代储代销' },
        { value: 1, label: '单耗承包' }
      ];
      this.deliveryStatusList = [
        { value: 0, label: '待出库'},
        { value: 1, label: '部分出库'},
        { value: 2, label: '全部出库'},
        { value: 3, label: '强制结单'}
      ];
    }
    /**
     * 配送方式
     */
    public getDeliveryMethodList(): Observable<any> {
      return Observable.of(this.deliveryMethodList);
    }
    /**
     * 领料申请单据状态
     */
    public getOrderStatusList(): Observable<any> {
      return Observable.of(this.orderStatusList);
    }
    /**
     * 出库类别
     */
    public getOutTypeList(): Observable<any> {
      return Observable.of(this.outTypeList);
    }
    /**
     * 出库状态
     */
    public getDeliveryStatusList(): Observable<any> {
      return Observable.of(this.deliveryStatusList);
    }
    /**
     * 领料申请列表
     */
    public getOrderList(filter: Filter): Observable<PostListRes> {
      return this.http.Post('/pickingApply/list', filter, this.defaultConfig);
    }
    /**
     * 领料申请详情
     */
    public getOrderDetail(id: string): Observable<HttpUtilNs.UfastHttpResT<PickingApplyOrder>> {
      return this.http.Get('/pickingApply/itemWithStorage', {id}, this.defaultConfig);
    }

    /**
     * 新增--物料侧边栏
     */
    public getFactoryMaterilList(filter: Filter): Observable<PickingApplyResT<any>> {
      filter.filters.storageFlag = true;
      return this.http.Post('/factoryMaterial/listByOrgId', filter, this.defaultConfig);
    }
    /**
     * 领料申请新增
     */
    public insertOrder(data: SubmitOrderData): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingApply/insert', data, this.defaultConfig);
    }
    /**
     * 领料申请编辑
     */
    public updateOrder(data: SubmitOrderData): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingApply/update', data, this.defaultConfig);
    }
    /**
     * 删除
     */
    public batchDeleteOrder(ids: string[]): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingApply/remove', ids, this.defaultConfig);
    }
    /**
     * 领料申请确认列表
     */
    public getPickingApplyConfirmList(filters): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingApply/listLines', filters, this.defaultConfig);
    }
    /**
     * 领料申请确认详情
     */
    public getPickingApplyConfirmDetail(id: string): Observable<PickingApplyResT<any>> {
      return this.http.Get('/pickingApply/itemDetailWithStorage', {id: id}, this.defaultConfig);
    }
    /**
     * 领料申请确认保存/提交
     */
    public pickingApplyConfirm(data: SubmitOrderData): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingApply/updateConfirm', data, this.defaultConfig);
    }
    /**
     * 领料确认生成出库单
     */
    public addPickingOut(data): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingOut/insert', data, this.defaultConfig);
    }
    /**
     * 打印
     */
    public print(data): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingOut/listPrintData', data, this.defaultConfig);
    }
    /**
     * 领料组包列表
     */
    public getPickingOutPackageList(filters): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingApply/listLinesPackage', filters, this.defaultConfig);
    }
        /**
     * 组包出库
     */
    public addPickingOutPackage(data): Observable<PickingApplyResT<any>> {
      return this.http.Post('/pickingOut/packageInsert', data, this.defaultConfig);
    }
    // public batchAuditOrder(data: AuditData): Observable<PickingApplyResT<any>> {
    //   return this.http.Post('/pickingApply/audit', data, this.defaultConfig);
    // }
    // public batchFinishOrder(orderNo: string[]): Observable<PickingApplyResT<any>> {
    //   const data = orderNo.map(no => {
    //     return {billNo: no};
    //   });
    //   return this.http.Post('/pickingApply/manualFinish', data, this.defaultConfig);
    // }
    public getWorkSpaceName(): Observable<PickingApplyResT<any>> {
      return this.http.Get('/comm/getWorkSpaceName', null, this.defaultConfig);
    }
    public getAgreementStockList(data: Filter): Observable<PickingApplyResT<StockItem>> {
      return this.http.Post('/warehouseInventory/listForAgreement', data, this.defaultConfig);
    }
    public getNormalStockList(data: Filter): Observable<PickingApplyResT<StockItem>> {
      return this.http.Post('/warehouseInventory/listForNormal', data, this.defaultConfig);
    }

    /**收货人信息 */
    public getReceiverNameList(filter): Observable<PickingApplyResT<any>> {
      return this.http.newPost('/receiptPersonInfor/list', filter, this.defaultConfig);
    }
    /**客户信息 */
    public getClientList(filter): Observable<PickingApplyResT<any>> {
      return this.http.newPost('/customerInfor/list', filter, this.defaultConfig);
    }

    /**改变打印状态 */
    public printAfter(data): Observable<PickingApplyResT<any>> {
      return this.http.newPost('/pickingApplyDetail/update', data, this.defaultConfig);
    }

  }

}
@Injectable()
export class PickingApplyService extends PickingApplyServiceNs.PickingApplyServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }

}
