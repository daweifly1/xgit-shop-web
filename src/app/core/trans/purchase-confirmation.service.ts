import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace PurchaseConfirmationServiceNS {
  export const confirmationDataMap = {
    id: {key: 'id', label: 'id'},
    confirmationCode: {key: 'confirmationNo', label: '审定表编号'},
    approveCode: {key: 'purchaseApproveNo', label: '审批表编号'},
    purchaseSummary: {key: 'summary', label: '采购概况说明'},
    payNature: {key: 'payNature', label: '付款性质'},
    contractAmount: {key: 'totalAmount', label: '合同金额'},
    contractVersion: {key: 'contractVersion', label: '合同版本'},
    creator: {key: 'createName', label: '创建人'},
    createDate: {key: 'createDate', label: '创建时间'},
    createDateStart: {key: 'startCreateDate', label: '创建时间开始'},
    createDateEnd: {key: 'endCreateDate', label: '创建时间结束'},
    status: {key: 'status', label: '状态'},
    attachment: {key: 'annexName', label: '附件'},
    attachmentUrl: {key: 'annexUrl', label: '附件Url'},
    contractOrAgreementNo: {key: 'contractOrAgreementNo', label: '年度协议/合同号'},
    supplier: {key: 'supplierName', label: '供应商'},
    contractNo: {key: 'contractOrAgreementNo', label: '续购合同号'},
    purchaseWay: {key: 'purchaseMethod', label: '采购方式'},
    purchaseWayCode: {key: 'purchaseMethodCode', label: '采购方式编码'},
    agreementNo: {key: 'contractOrAgreementNo', label: '年度协议号'},
    clauseTitle: {key: 'clauseTitle', label: '条内容'},
    clauseTitleId: {key: 'clauseTitleNo', label: '条内容编号'},
    clauseItem: {key: 'clauseContent', label: '款内容'},
    clauseItemId: {key: 'clauseNo', label: '款内容编号'},
    totalAmount: {key: 'totalAmount', label: '金额总计(元)'},
    lineNo: {key: 'indexNo', label: '行号'},
    materialType: {key: 'materialType', label: '物料类型'},
    materialCode: {key: 'materialNo', label: '物料编码'},
    materialDesc: {key: 'materialDesc', label: '物料描述'},
    unit: {key: 'unit', label: '单位'},
    purchaseQuantity: {key: 'quantity', label: '数量'},
    unitPrice: {key: 'unitPrice', label: '确定单价'},
    currency: {key: 'currencyCode', label: '币种'},
    tax: {key: 'tax', label: '税率(%)'},
    lineTotalPrice: {key: 'totalPrice', label: '总价'},
    manufacturer: {key: 'manufactureFactory', label: '生产厂家'},
    materialModel: {key: 'materialModel', label: '规格型号'},
    lifeTime: {key: 'lifeTime', label: '设计使用寿命'},
    useOrgName: {key: 'useOrgName', label: '使用单位'},
    contractCode: {key: 'contractNo', label: '合同编码'},
    orgName: {key: 'orgName', label: '业务实体'},
    materialList: {key: 'detailVOS', label: '物料列表'},
    contractList: {key: 'contractVOS', label: '合同列表'},
    deliveryDate: {key: 'deliveryDate', label: '交货日期'},
    carryingMethod: {key: 'carryingMethod', label: '结转方式'},
    signDate: {key: 'signDate', label: '签约时间'},
    processId: {key: 'processId', label: ''},
    flowPurchaserName: {key: 'flowPurchaserName', label: '采购管理科审批人'},
    flowPurchaserId: {key: 'flowPurchaserId', label: ''}
  };
  export enum ConfirmationStatus {
    WaitingSubmit = 0,
    WaitingAudit = 1,
    InAudit = 2,
    AgreeAudit = 3,
    RefuseAudit = 4,
    Invalid = 5
  }
  export enum PurchaseWay {
    AnualAgreement = 6,
    BuyAgain = 7
  }
  export enum ConfirmationAuditStatus {     // 申请退回状态
    UnapplyReturn,    // 未申请退回
    Auditing,         // 审核中
    AuditPass,        // 审核通过
    AuditRefuse       // 审核拒绝
  }
  export enum MaterialType {
    Device = 3
  }
  export interface ConfirmationListData {
    id?: string;
    confirmationCode: string;
    approveCode: string;
    purchaseSummary: string;
    payNature: string;
    contractAmount?: number;
    contractVersion: string;
    creator: string;
    createDate: string|number;
    status: number;
    attachment: string;
    attachmentUrl: string;
    contractOrAgreementNo: string;
  }
  export interface ConfirmationDetailData extends ConfirmationListData {
    clauseTitle: string;
    clauseItem: string;
    totalAmount: number;
    purchaseWay: string|number;
    processId?: string;
    flowPurchaserName?: string;
  }
  export interface MaterialLineData {
    index?: number;
    id?: string;
    lineNo: number;
    materialType: number;
    materialCode: string;
    materialDesc: string;
    unit: string;
    purchaseQuantity: string;
    unitPrice: string;
    currency: string;
    tax: number;
    lineTotalPrice: number;
    supplier: string;
    manufacturer?: string;
    materialModel?: string;
    lifeTime: string;
    useOrgName: string;
    priceRecordVOS?: any[];
    deliveryDate?: any;
    contractNo?: string;
    subtota?: boolean;
  }
  export interface ContractData {
    id: number;
    index?: number;
    seqNo?: number;
    lineNo: number;
    contractCode: string;
    orgName: string;
    supplier: string;
    materialType: number;
    tax: number|string;
    contractAmount: number|string;
    carryingMethod?: number;
    signDate?: any;
  }
  export class PurchaseConfirmationServiceClass {
    private http: HttpUtilService;
    private paramConfig: HttpUtilNs.NewHttpConfig = {};
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.paramConfig.gateway = HttpUtilNs.GatewayKey.Ps;
    }

    /**
     * 审定表列表
     */
    public getConfirmationList(paramsData) {
      return this.http.newPost('/PurchaseConfirmation/list', paramsData, this.paramConfig);
    }
    /**
     * 审定表详情
     */
    public getConfirmationDetail(id) {
      return this.http.newGet('/PurchaseConfirmation/itemWithDetail', {id: id}, this.paramConfig);
    }
    /**
     * 审定表查询合同列表
     */
    public getContractInfoByConfirm(id) {
      return this.http.newGet('/PurchaseContract/listByConfirmId', {confirmId: id}, this.paramConfig);
    }
    /**
     * 审定表保存
     */
    public saveConfirmation(paramsData) {
      return this.http.newPost('/PurchaseConfirmation/save', paramsData, this.paramConfig);
    }
    /**
     * 审定表提交
     */
    public submitConfirmation(paramsData) {
      return this.http.newPost('/PurchaseConfirmation/submit', paramsData, this.paramConfig);
    }
    /**
     * 审定表审核通过
     */
    public agreeConfirmationAudit(id) {
      return this.http.newPost('/PurchaseConfirmation/auditPass', {id: id}, this.paramConfig);
    }
    /**
     * 审定表审核拒绝
     */
    public refuseConfirmationAudit(id: string) {
      return this.http.newPost('/PurchaseConfirmation/auditRefuse', {id: id}, this.paramConfig);
    }
    /**
     * 审定表删除
     */
    public deleteConfirmation(id) {
      return this.http.newGet('/PurchaseConfirmation/delete', {id: id}, this.paramConfig);
    }
    /**
     * 作废审定表*/
    public cancelAllConfirmtion(id: string): Observable<any> {
      return this.http.newPost('/PurchaseConfirmation/returnConfirm', {id: id}, this.paramConfig);
    }
    /**
     * 申请退回*/
    public applyReturn(returnData): Observable<any> {
      return this.http.newPost('/PurchaseConfirmation/applyReturn', returnData, this.paramConfig);
    }
    /**
     * 允许退回*/
    public allowReturn(id: string): Observable<any> {
      return this.http.newPost('/PurchaseConfirmation/allowReturn', {id: id}, this.paramConfig);
    }
    /**
     * 拒绝退回*/
    public refuseReturn(id: string): Observable<any> {
      return this.http.newPost('/PurchaseConfirmation/refuseReturn', {id: id}, this.paramConfig);
    }
    /**
     * 退回审定表物料行*/
    public backRows(ids: string[], confirmId: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        params: {confirmId: confirmId},
        delayLoading: 0
      };
      return this.http.newPost('/PurchaseConfirmDetails/returnDetails', ids, config);
    }
    /**
     * 重新生成合同*/
    public reCreateContract(confirmId: string): Observable<any> {
      return this.http.newPost('/PurchaseConfirmation/createContract', {id : confirmId}, this.paramConfig);
    }
    /**
     * 续购生成审定表
     */
    public createFromContinue(paramsData) {
      return this.http.newPost('/PurchaseConfirmation/continueFromPlan', paramsData, this.paramConfig);
    }
    /**
     * 续购生成审定表
     */
    public createFromAgreement(paramsData) {
      return this.http.newPost('/PurchaseConfirmation/continueFromPlan', paramsData, this.paramConfig);
    }
    /**批量退回 */
    public returnContract(confirmId, params) {
      const data = {
        confirmId: confirmId,
        ids: params.ids
      };
      return this.http.newPost(`/PurchaseConfirmDetails/returnDetails`, data, this.paramConfig);
    }
  }
}

@Injectable()
export class PurchaseConfirmationService extends PurchaseConfirmationServiceNS.PurchaseConfirmationServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
