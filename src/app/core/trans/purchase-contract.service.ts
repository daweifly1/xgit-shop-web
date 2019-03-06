import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';


export namespace PurchaseContractServiceNs {
  export const contractDataMap = {
    id: {key: 'id', label: 'id'},
    contractCode: {key: 'contractNo', label: '合同编号'},
    status: {key: 'status', label: '状态'},
    contractType: {key: 'contractType', label: '合同类型'},
    supplierName: {key: 'supplierName', label: '供应商'},
    supplierId: {key: 'supplierId', label: '供应商Id'},
    createDate: {key: 'createDate', label: '创建日期'},
    createDateStart: {key: 'startCreateDate', label: '创建日期开始'},
    createDateEnd: {key: 'endCreateDate', label: '创建日期结束'},
    signature: {key: 'payerSignUser', label: '甲方签章人'},
    contractAmount: {key: 'totalAmount', label: '合同金额'},
    receiver: {key: 'receivingParty', label: '收货方'},
    receiverId: {key: 'receivingPartyId', label: '收货方ID'},
    consignor: {key: 'contractCode', label: '发货方'},
    businessType: {key: 'businessType', label: '业务类型'},
    orgName: {key: 'orgName', label: '业务实体'},
    orgId: {key: 'orgId', label: '业务实体Id'},
    salesmanName: {key: 'purchaseUser', label: '业务员'},
    contractStatus: {key: 'contractStatus', label: ''},
    contractName: {key: 'contractName', label: '合同名称'},
    contractModel: {key: 'clauseTemplate', label: '合同模板'},
    contractModelId: {key: 'clauseTemplateId', label: '合同模板Id'},
    contractUp: {key: 'contractUp', label: '合同抬头'},
    carryOver: {key: 'carryingMethod', label: '结转方式'},
    invoiceEntity: {key: 'billingUnit', label: '开票单位'},
    purchaseWay: {key: 'purchaseMethod', label: '采购方式'},
    freightType: {key: 'transportFees', label: '运杂费类型'},
    inputTax: {key: 'tax', label: '进项税码'},
    currency: {key: 'currencyCode', label: '币种'},
    totalAmount: {key: 'totalAmount', label: '合同总金额'},
    signDate: {key: 'signDate', label: '签约时间'},
    validDate: {key: 'validDate', label: '合同有效期'},
    creator: {key: 'createName', label: '创建人'},
    receiveAddress: {key: 'receivingPartyAddress', label: '收货地址'},
    abstract: {key: 'summary', label: '摘要'},
    remark: {key: 'remark', label: '备注'},
    lineNo: {key: 'indexNo', label: '行号'},
    materialType: {key: 'materialType', label: '物料类型'},
    materialCode: {key: 'materialNo', label: '物料编码'},
    materialDesc: {key: 'materialDesc', label: '物料描述'},
    materialName: {key: 'materialName', label: '物料名称'},
    materialModel: {key: 'materialModel', label: '规格型号'},
    technicalParameters: {key: 'technicalParameters', label: '技术参数'},
    manufacturer: {key: 'manufactureFactory', label: '生产厂家'},
    unit: {key: 'unit', label: '单位'},
    purchaseQuantity: {key: 'quantity', label: '数量'},
    unitPrice: {key: 'unitPrice', label: '含税单价'},
    lineAmount: {key: 'totalPrice', label: '金额'},
    deliveryDate: {key: 'deliveryDate', label: '交货时间'},
    qtyRcvTolerance: {key: 'moreOrLess', label: '溢短装%'},
    attachment: {key: 'annexName', label: '附件'},
    attachmentUrl: {key: 'annexUrl', label: '附件Url'},
    clauseTitle: {key: 'clauseTitle', label: '条'},
    clauseItem: {key: 'clauseContent', label: '款'},
    clauseTitleId: {key: 'clauseTitleId', label: '条Id'},
    clauseItemId: {key: 'clauseId', label: '款Id'},
    buyer: {key: 'contractUp', label: '甲方'},
    seller: {key: 'supplierName', label: '乙方'},
    signLocation: {key: 'signAddress', label: '签约地点'},
    companyName: {key: 'name', label: '公司名称'},
    buyerAddress: {key: 'detailAddress', label: '公司地址'},
    sellerAddress: {key: 'registDetailsAddress', label: '卖方地址'},
    sellerArea: {key: 'registAreaName', label: '卖方地址'},
    mobile: {key: 'phone', label: '手机号'},
    totalAmountCapital: {key: 'totalAmountForChinese', label: '合计（大写）'},
    legalRepresentative: {key: 'legalPerson', label: '法定代表人'},
    entrustedAgent: {key: 'proxyPerson', label: '委托代理人'},
    postalCode: {key: 'postcode', label: '邮政编码'},
    depositBank: {key: 'bankOfDeposit', label: '开户银行'},
    bankAccount: {key: 'bankOfDepositAccount', label: '银行账户'},
    taxpayerRegistration: {key: 'taxpayerRegistrationNumber', label: '纳税人登记号'},
    socialCreditCode: {key: 'socialCreditCode', label: '纳税人登记号'},
    invoiceEntityName: {key: 'invoiceName', label: '开票单位'},
    detailAddress: {key: 'detailAddress', label: '开票单位地址'},
    businessBody: {key: 'businessBody', label: '业务实体'},
    businessBodyId: {key: 'businessBodyId', label: '业务实体Id'},
    productInfo: {key: 'detailsVOS', label: '物料信息'},
    buyerInfo: {key: 'orgInfoVO', label: '甲方信息'},
    sellerInfo: {key: 'supplierBasicVO', label: '供应商信息（乙方）'},
    invoiceInfo: {key: 'invoiceOrgInfo', label: '开票单位信息'},
    clauseList: {key: 'contractClauseVOS', label: '条款列表'},
  };
  export enum MaterialType {
    Material = 1,
    Parts = 2,
    Device = 3
  }
  export enum CarryOverType {
    CarryByPrice = 1,
    CarryByTicket = 2,
    SettleByTargetPrice = 3
  }
  export enum ContractType {
    PurchaseContract = 1,
    AnnualAgreement = 2
  }
  export enum ContractStatus {
    Init,   // 初始态
    Saved,    // 保存
    WaitBuyerSign,    // 待甲方签章
    WaitSupplierSign,    // 待乙方签章
    Effectived,       // 已生效
    Invalid,        // 已作废
    // Canceling,      // 作废中
    // RefuseCancel    // 拒绝作废
  }
  export enum ContractCancelStatus {      // 申请作废状态
    UnapplyCancel,    // 未申请作废
    Auditing,         // 审核中
    AuditPass,        // 审核通过
    AuditRefuse       // 审核拒绝
  }
  export interface TabPageType {
    mainPage: number;
    detailPage?: number;
    editPage?: number;
  }
// 合同列表
  export interface ContractListData {
    id: string;
    contractCode: string;
    supplierName: string;
    contractAmount: string|number;
    receiver: string;
    businessType: number;
    contractType?: number;
    orgName: string;
    consignor?: string;
    salesmanName: string;
    createDate: any;
    status: number;
    annexUrl: string;
    returnStatus: number;
    erpSyncFlag: number;
  }
  export interface MaterialListData {
    index?: number;
    isChecked?: boolean;
    id: string;
    lineNo: number|string;
    materialType: number;
    materialCode: string;
    materialDesc: string;
    unit: string;
    purchaseQuantity: number;
    unitPrice: string|number;
    lineAmount: string|number;
    deliveryDate: any;
    remark: string;
    qtyRcvTolerance?: number;
  }
  export interface DeviceListData extends MaterialListData {
    materialModel: string;
    technicalParameters: string;
    manufacturer: string;
  }
  export interface ContractClauseData {
    seq?: number;
    type?: number;
    isChecked?: boolean;
    clauseTitle: string;
    clauseTitleId?: string;
    clauseItem: string;
    clauseItemId?: string;
  }
  export enum ClauseType {
    Title = 1,
    Content = 2
  }
  export enum ErpSyncFlag {
    Wait,
    Finish,
    Fail
  }


  export class PurchaseContractServiceClass {
    private http: HttpUtilService;
    private paramConfig: HttpUtilNs.UfastHttpConfig = {};
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.paramConfig.gateway = HttpUtilNs.GatewayKey.Ps;
    }
    /**
     * 合同列表
     */
    public getContractList(paramsData) {
      return this.http.newPost('/PurchaseContract/list', paramsData, this.paramConfig);
    }
    /**
     * 甲方签章
     */
    public buyerSignContract(id: string, annexUrl: string) {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        isCatchError: false,
        isCatchUfastError: false
      };
      return this.http.newPost('/PurchaseContract/paySign', {id: id, annexUrl: annexUrl}, config);
    }
    /**
     * 乙方签章
     */
    public supplierSignContract(id: string, annexUrl: string) {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        isCatchError: false,
        isCatchUfastError: false
      };
      return this.http.newPost('/PurchaseContract/shipperSign', {id: id, annexUrl: annexUrl}, config);
    }
    /**
     * 合同详情（用于编辑）
     */
    public getContractDetail(id) {
      return this.http.newGet('/PurchaseContract/itemWithDetail', {id: id}, this.paramConfig);
    }
    /**
     * 合同详情(详情展示)
     */
    public getContractDetailInfo(id) {
      return this.http.newGet('/PurchaseContract/itemInfo', {id: id}, this.paramConfig);
    }
    /**
     * 合同详情(详情展示)
     */
    public saveContract(paramsData) {
      return this.http.newPost('/PurchaseContract/save', paramsData, this.paramConfig);
    }
    /**
     * 合同模板列表
     */
    public getContractModelList(paramsData) {
      return this.http.Post('', paramsData, this.paramConfig);
    }
    /**
     * 合同模板详情
     */
    public getContractModelDetail(id) {
      return this.http.Post('', {id: id}, this.paramConfig);
    }
    /**
     * 根据条获取相应的款信息
     */
    public getContractItem(id) {
      return this.http.Get('', {id: id}, this.paramConfig);
    }
    /**
     * 根据业务实体详细信息
     */
    public getOrgInfo(orgId) {
      const paramConfig: HttpUtilNs.UfastHttpConfig = {};
      paramConfig.gateway = HttpUtilNs.GatewayKey.Bs;
      return this.http.newGet('/OrgInfo/getOrgInfo', {orgId: orgId}, paramConfig);
    }
    /**
     * 获取收货方地址
     */
    public getAddressInfo(paramsData) {
      const paramConfig: HttpUtilNs.UfastHttpConfig = {};
      paramConfig.gateway = HttpUtilNs.GatewayKey.Bs;
      return this.http.newPost('/OrgReceiveAddress/list', paramsData, paramConfig);
    }
    /**
     * 生成合同pdf
     * */
    public createContactPdfPath(id: string) {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      return this.http.newGet(`/cfca/createcontractpdf/${id}`, null, config);
    }
    /**
     * 申请作废合同*/
    public applyCancelContract(id: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost(`/PurchaseContract/cancelContract/${id}`, null, config);
    }
    /**
     * 同意作废合同*/
    public agreeCancelContract(id: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost(`/PurchaseContract/approvecancelcontract/${id}`, null, config);
    }
    /**
     * 拒绝作废合同*/
    public rejectCancelContract(id: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost(`/PurchaseContract/refuseCancelContract/${id}`, null, config);
    }
    /**ERP同步 */
    public erpSync(id) {
      return this.http.newPost('/PurchaseContract/contractErp', {ids: id}, this.paramConfig);
    }
    /**申请作废批量 */
    public sendBackContract(contractId, detailIds) {
      return this.http.newPost(`/PurchaseContract/returnContract?contractId=${contractId}`, detailIds, this.paramConfig);
    }

      /**退回审核详情 */
      public getReturnAuditContractDetail(id) {
        return this.http.newGet('/PurchaseContract/itemWhenReturn', {id: id}, this.paramConfig);
      }
  }
}
@Injectable()
export class PurchaseContractService extends PurchaseContractServiceNs.PurchaseContractServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
