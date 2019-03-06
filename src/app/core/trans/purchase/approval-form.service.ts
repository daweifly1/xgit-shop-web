import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
import {p} from '@angular/core/src/render3';

export namespace ApprovalFormNs {
  export enum PurchaseBusinessType {
    Contract = 1,
    Protocol
  }
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
  }
  export interface FilterData<T> {
    pageSize: number;
    pageNum: number;
    filters: T;
  }
  /**
   * 采购方式*/
  export enum PurchaseWay {
    OpenTender = 1,     //  公开招标
    InviteTender,       // 邀请招标
    SingleSource,       // 单一来源
    Compete,         // 竞争性谈判
    Inquiry,          // 询比价
    AnnulPlan,        // 年度协议
    ContinuePlan      // 续购协议
  }
  /**
   * 采购模式*/
  export enum PurchaseMode {
    Self = 1,       // 自主1
    Entrust,       // 委托2
    Online,       // 网购3
    AnnulPlan,     // 年度协议4
    ContinuePlan   // 续购协议5
  }
  /**
   * 审批状态*/
  export enum ApprovalStatus {
    Init = 1, // 新建1
    WaitApprove,  // 待审核2
    ApprovePass, // 审核通过3
    WaitDealPrice,  // 待价格处理4
    Complete,  // 处理完成
    Cancel, // 作废6
    Refuse,  // 已拒绝7
    WaitPrice,  // 8寻源中,等待确认价格
    PartConfirm  // 9部分生成审定表
  }
  /**
   * 采购方式变更状态*/
  export enum PurchaseMethodChangeStatus {
    NoChange,         // 未申请
    WaitApprove,       // 待审核
    Approved,         // 审核通过
    Refuse            // 审核拒绝
  }
  /**
   * 申请退回状态*/
  export enum PurchaseApproveReturnStatus {
    NoChange,         // 未申请
    WaitApprove,       // 待审核
    Approved,         // 审核通过
    Refuse            // 审核拒绝
  }
  /**
   * 审批行状态*/
  export enum ApprovalRowStatus {
    NoChange,       // 无转换记录
    WaitApprove,     // 待审核
    Approved,       // 已通过
    Refuse         // 已拒绝
  }

  /**
   * 审批类型 */
  export enum AuditType {
    AuditDefault = 0, // 默认审核
    AuditChangeMethod = 1,       // 审核更改采购方式
    AuditApplyReturn = 2         // 审核退回申请
  }
  export enum RowDealStatus {
    WaitDeal = 1, // 待处理
    Dealed,       // 已处理
    Back          // 已退回
  }
  /**
   * 审批表列表项*/
  export interface ApprovalFormItem {
    approveNo: string;
    businessType: number;
    clauseContent: string;
    clauseNo: string;
    createDate: any;
    creatorId: string;
    creatorName: string;
    id: string;
    orgId: string;
    priceType: number;
    purchaseDetail: any;
    purchaseMethod: number;
    purchaseSource: string;
    purchaseType: number;
    remark: string;
    status: number;
    returnStatus: number;
    strategy: number;
    totalPrice: number;
    changeMethodStatus: number;
  }
  /**
   * 确定数量、拆分传参*/
  export interface SplitDetialItem {
    priceRecordId: string;
    quantity: number;
  }
  export interface ApprovalFormDealRowData {
    priceRecordVOList: any[];
    purchaseApproveFullDetailVO: any;
  }
  export class ApprovalFormClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.NewHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway : HttpUtilNs.GatewayKey.Ps
      };
    }
    /**
     * 保存、新建、修改审批表*/
    public saveApproveForm(data: any): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost('/PurchaseApprove/save', data, config);
    }
    /**
     * 审批表列表接口*/
    public getApprovalFormList(filterData: FilterData<any>): Observable<any> {
      return this.http.newPost('/PurchaseApprove/list', filterData, this.defaultConfig);
    }
    /**
     * 获取审批表详情*/
    public getApprovalFormDetail(id: string): Observable<any> {
      return this.http.newGet('/PurchaseApprove/item', {id: id}, this.defaultConfig);
    }
    /**
     * 作废审批表*/
    public cancelApprovalForm(id: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {approveid: id}
      };
      return this.http.newPost('/purchaseapprove/cancelApprove', null, config);
    }
    /**
     * 获取审批表价格处理行信息*/
    public getApproveDealPrice(approveId: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        params: {approveid: approveId}
      };
      return this.http.newPost('/PurchaseApprove/dealprice', null, config);
    }
    /**
     * 改变审批表状态*/
    public modifyApproveStatus(approveId: string, status: ApprovalStatus): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {
          approveid: approveId,
          status: status + ''
        }
      };
      return this.http.newPost('/PurchaseApprove/review', null, config);
    }
    /**
     * 审核审批表转换采购方式*/
    public auditChangeMethod(approveId: string, status: number|string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {
          approveid: approveId,
          status: status + ''
        }
      };
      return this.http.newPost('/purchaseapprove/auditMethod', null, config);
    }
    /**
     * 退回申请审核*/
    public auditApplyReturnStatus(approveId: string, status: number): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {
          id: approveId,
          status: status + ''
        }
      };
      return this.http.newPost('/purchaseapprove/auditReturn', null, config);
    }
    /**
     * 确定数量、拆分行*/
    public splitRowDetail(id: string, list: SplitDetialItem[]): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
      };
      return this.http.newPost(`/PurchaseApprove/splitdetail/${id}`, list, config);
    }
    /**
     * 生成审定表*/
    public createApprovalOkForm(approveId: string, detailIdList: string[]): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {approveId: approveId}
      };
      return this.http.newPost('/purchaseConfirmation/createByApprove', detailIdList, config);
    }
    /**
     * 审批表转换采购方式*/
    public switchApprovalFormWay(id: string, way: ApprovalFormNs.PurchaseWay): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {approveid: id, method: way + ''}
      };
      return this.http.newPost('/purchaseapprove/changemethod', null, config);
    }
    /**
     * 审批通过后申请退回*/
    public approveApplyReturn(param: any): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
      };
      return this.http.newPost('/purchaseapprove/applyReturn', param, config);
    }
    /**
     * 计划行转采购方式*/
    public switchApprovalRowWay(detailid: string, way: ApprovalFormNs.PurchaseWay): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {detailid: detailid, method: way + ''}
      };
      return this.http.newPost('/PurchaseApproveDetail/changemethod', null, config);
    }
    /**
     * 退回计划行*/
    public backApprovalRow(detailIdList: string[], originIdList: string[]): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
      return this.http.newPost('/PurchaseApproveDetail/backdetail', {detailIds: detailIdList, originIds: originIdList}, config);
    }
    /**
     * 行审核列表*/
    public getRowAuditList(filterData: FilterData<any>): Observable<any> {
      return this.http.newPost('/PurchaseApproveDetail/changemethodlist', filterData, this.defaultConfig);
    }
    /**
     * 行审核*/
    public approvalDetailRow(detailId: string, status: ApprovalRowStatus): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0,
        params: {detailid: detailId, status: status + ''}
      };
      return this.http.newPost('/PurchaseApproveDetail/approvemethod', null, config);
    }
    public createPriceTest(id): Observable<any> {
      return this.http.newGet('/purchaseapprove/createprice', {approveid: id}, this.defaultConfig);
    }
    /**
     * 供应商报价汇总*/
    public getSupplierSumPrice(approvalId: string): Observable<any> {
      return this.http.newPost(`/purchaseapprove/supplierpriceinfo/${approvalId}`, null, this.defaultConfig);
    }
    /**
     * 行审核详情*/
    public getRowAuditDetail(id: string): Observable<any> {
      return this.http.newGet('/PurchaseApprove/itemChangeMethod', {detailId: id}, this.defaultConfig);
    }
  }

}
@Injectable()
export class ApprovalFormService extends ApprovalFormNs.ApprovalFormClass {

  constructor( injector: Injector) {
    super(injector);
  }

}
