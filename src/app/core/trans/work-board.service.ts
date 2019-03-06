import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace WorkBoardServiceNs {
  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }
  export interface AuditFlowData {
    processInstanceId: string;
    isAudit: AuditFlowRouteParam;
    taskId: string;
    billId?: string;
    isAuditFlow?: AuditFlowRouteParam;
    // toEndCondition?: AuditEndCondition;
  }
  export enum AuditFlowRouteParam {
    Audit = '1',
    View = '0',
    IsAuditFlow = 'auditflow'
  }
  export enum AuditDirection {
    Agree = 0,
    Reject = 1,
    WaitAudit = 9
  }
  export enum AuditEndCondition {
    PassCondition = '0',
    RejectCondition = '1'
  }
  export interface AuditData {
    comments: string;   // 审批意见
    params: {direction: AuditDirection, amount: number};
    toCompleteTasks: {processInstanceId: string; taskId: string}[];
  }
  export interface ApproveInfo {
    userConditions: any[];
    endConditions: any[];
  }
  export class WorkBoardServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.NewHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Flow
      };
    }
    /**
     * 判断审批同意时是否需要更新状态*/
    public isNeedPreAgree(endConditions: any[], totalAmount: number): boolean {
      for (let i = 0, len = endConditions.length; i < len; i++) {
        let direction: any;
        const amountList = [];
        for (let j = 0; j < endConditions[i].length; j++) {
          const item = endConditions[i][j];
          if (item['keyValue']['key'] === 'direction') {
            direction = item['keyValue']['value'];
          } else {
            amountList.push(item);
          }
        }
        if (direction !== (AuditDirection.Agree + '') && direction !== null) {
          continue;
        }
        if (amountList.length === 0) {
          return true;
        }
        const failItem = amountList.find((amountObj) => {
          const amountCondition = amountObj['condition'],
            amount = Number(amountObj['keyValue']['value']);
          if (amountCondition === 'eq' && totalAmount === amount) {
            return true;
          } else if (amountCondition === 'ge' && totalAmount >= amount) {
            return true;
          } else if (amountCondition === 'le' && totalAmount <= amount) {
            return true;
          } else if (amountCondition === 'ne' && totalAmount !== amount) {
            return true;
          } else if (amountCondition === 'gt' && totalAmount > amount) {
            return true;
          } else if (amountCondition === 'lt' && totalAmount < amount) {
            return true;
          } else {
            return false;
          }
        });
        if (!failItem) {
          return false;
        }
        return true;
      }
      return false;

    }
    /**
     * 获取审批单据列表
     * */
    public getDataList(filter): Observable<UfastHttpAnyResModel> {
      return this.http.newPost<UfastHttpAnyResModel>('/approveFlow/getToApproveList', filter, this.defaultConfig);
    }
    /**
     * 审批单据
     * */
    public auditOrder(data: AuditData): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.NewHttpConfig = {
        delayLoading: 0,
        gateway: HttpUtilNs.GatewayKey.Flow
      };
      return this.http.newPost('/approveFlow/completeTask', data, config);
    }
    /**
     * 获取审批单据信息*/
    public getApproveInfo(processInstanceId: string): Observable<any> {
      return this.http.newGet('/approveFlow/getToApproveInfo', {processInstanceId: processInstanceId}, this.defaultConfig);
    }
    /**
     * 获取审批历史
     * */
    public getApproveHistory(processInstanceId: string, allNodesFlag: boolean = true): Observable<any> {
      return this.http.newPost('/approveFlow/getHistoryInfos',
        {allNodesFlag: allNodesFlag, processInstanceId: processInstanceId}, this.defaultConfig);
    }
  }
}
@Injectable()
export class WorkBoardService extends WorkBoardServiceNs.WorkBoardServiceClass {

constructor(injector: Injector) {
  super(injector);
 }

}
