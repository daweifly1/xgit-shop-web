
import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../../infra/http/http-util.service';

export namespace ContractClauseListServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {}
  export const clauseDataMap = {
    id: {key: 'id', label: 'id'},
    clauseList: {key: 'clauseNo', label: '款列表'},
    clauseIndex: {key: 'clauseNo', label: '序号'},
    clauseCode: {key: 'clauseCode', label: '条目编码'},
    clauseTitle: {key: 'clauseTitle', label: '条内容'},
    clauseTitleId: {key: 'clauseTitleId', label: '条内容Id'},
    clauseItemIndex: {key: 'clauseItemIndex', label: '款内容序号'},
    clauseItem: {key: 'clauseItem', label: '款内容'},
    clauseItemId: {key: 'clauseItemId', label: '款内容Id'},
    type: {key: 'type', label: '类型'},
    purchaseWay: {key: 'purchaseWay', label: '采购方式'},
    remark: {key: 'remark', label: '备注'}
  };
  export enum ClauseType {
    Approval = 1,
    Confirmation = 2,
    Contract = 3
  }
  export interface ClauseListData {
    id?: string;
    useType?: number|string;
    clauseNo?: number|string;
    seq?: string;
    purchaseMethod?: string;
    content?: number|string;
    details?: string;
  }
  export enum ContentType {
    bar = 1
  }

  export class ContractClauseListServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig = {};
    private newConfig: HttpUtilNs.NewHttpConfig = {};
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig.gateway = HttpUtilNs.GatewayKey.Ps;
      this.newConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
    }

    /**
     * 条款维护列表
     */
    public getClauseList(paramsData) {
      return this.http.newPost('/PurchaseClause/list', paramsData, this.defaultConfig);
    }
    /**
     * 条款维护详情
     */
    public getClauseItem(id) {
      return this.http.newGet('/PurchaseClause/item', {id: id}, this.defaultConfig);
    }
    /**
     * 条款维护新增
     */
    public addClauseList(data) {
      return this.http.newPost('/PurchaseClause/insert', data, this.newConfig);
    }
    /**
     * 条款维护编辑
     */
    public editClauseList(data) {
      return this.http.newPost('/PurchaseClause/update', data, this.newConfig);
    }
    /**
     * 删除
     */
    public delClause(id) {
      return this.http.newGet('/PurchaseClause/delete', {id: id}, this.newConfig);
    }
  }
}

@Injectable()
export class ContractClauseListService extends ContractClauseListServiceNs.ContractClauseListServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }

}

