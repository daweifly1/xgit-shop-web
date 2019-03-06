import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace ContractClauseTemplateServiceNs {
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> { }
  export interface ClauseTemplateFilter {
    name?: string;
  }
  export interface ClauseTemplateDataList {
    id?: string;
  }
  export interface SelectClauseList {
    id?: string;
    seq?: string;
    content?: string;
    _checked?: boolean;
    highLight?: boolean;
  }
  export interface PurchaseTemplateDetailVOS {
    clauseId: string;
  }
  export class ContractClauseTemplateServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private newConfig: HttpUtilNs.NewHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      this.newConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
    }
    /**条款模板列表 */
    public getClauseTemplateDataList(filter: {
      pageNum: number,
      pageSize: number,
      filters: ContractClauseTemplateServiceNs.ClauseTemplateFilter
    }) {
      return this.http.newPost('/PurchaseTemplate/list', filter, this.defaultConfig);
    }
    /**条款模板新增 */
    public addClauseTemplate(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/PurchaseTemplate/insert', data, this.newConfig);
    }
    /**条款模板详情 */
    public getClauseTemplateContentDetail(id): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/PurchaseTemplate/searchTemplateClause', {id: id}, this.newConfig);
    }
    /**条款模板编辑用的详情 */
    public getClauseTemplateDetail(id): Observable<UfastHttpResT<any>> {
      return this.http.newGet('/PurchaseTemplate/item', {id: id}, this.newConfig);
    }
    /**条款模板编辑 */
    public updateClauseTemplate(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/PurchaseTemplate/update', data, this.newConfig);
    }
    /**条款模板详情合同用 */
    public getClauseTemplateContent(data): Observable<UfastHttpResT<any>> {
      return this.http.newPost('/PurchaseTemplate/searchClauseContent', data, this.newConfig);
    }
  }
}

@Injectable()
export class ContractClauseTemplateService extends ContractClauseTemplateServiceNs.ContractClauseTemplateServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }

}
