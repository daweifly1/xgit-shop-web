import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace SupplierManageNs {
  export interface SupplierResModelT<T> extends HttpUtilNs.UfastHttpRes {
    value: T;
  }
  export interface Filters<T> {
    pageSize: number;
    pageNum: number;
    filters: T;
  }
  export interface SelectItemModel {
    id: number;
    name: string;
  }
  export interface RecommendDataModel {
    materialType: number;
    proposedProduct: string;
    recommendExplanation: string;
    recommendedFor: number;
    source: RecommendSource;
    supplierId: string;
    supplierSupplyRangeVOS: {recommendId: string; supplyRangeCode: string; supplyRangeName: string}[];
    supplyRange: string;
  }
  export enum SupplierStatus {
    Save,         // 已保存
    Register,     // 注册
    Lurking,      // 潜在
    Temporary,    // 临时
    Qualified,    // 合格
    Standby,      // 备选
    Pause         // 暂停
  }
  export enum RecommendSource {
    Common = 1,         // 统购推荐
    Self ,           // 自购推荐
    SelfToCommon    // 自购转统购
  }
  export enum SupplierAuditStatus {
    WaitAudit,      // 待审核
    Auditing,       // 审核中
    AuditPass,      // 审核通过
    AuditReject,     // 审核拒绝
    ManageAuditing,   // 管理科审核中
    ManageAuditPass,  // 管理科审核通过
    ManageAuditReject, // 管理科审核拒绝
    WaitAudit2       // 待管理科审核
  }
  export interface ImportFileData {
    attachment?: string;
    remark?: string;
    fileName: string;
    fileUrl: string;
    supplierRatingInfoVOS?: any[];
    supplierFactoryVOS?: any[];
  }
  export class SupplierManageServiceClass {
    private http: HttpUtilService;
    private supplierStatusList: SelectItemModel[];
    private supplierAuditStatusList: SelectItemModel[];
    private defaultConfig: HttpUtilNs.UfastHttpConfig;

    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Bs
      };
      this.supplierStatusList = [
        {id: 0, name: '已保存'},
        {id: 1, name: '注册'},
        {id: 2, name: '潜在'},
        {id: 3, name: '临时'},
        {id: 4, name: '合格'},
        {id: 5, name: '备选'},
        {id: 6, name: '暂停'},
      ];
      this.supplierAuditStatusList = [
        {id: 0, name: '待审核'},
        {id: 1, name: '审核中'},
        {id: 2, name: '审核通过'},
        {id: 3, name: '审核未通过'},
      ];
    }

    /**
     * 注册审核列表
     * */
    public getRegisterAndPotentList(filter: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/registAndPotentialList', filter, this.defaultConfig);
    }

    /**
     * 管理科推荐审核列表
     * */
    public getManageRecommendAuditList(filter: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supRecommend/manageRecommendList', filter, this.defaultConfig);
    }

    /**
     * 供应商状态列表
     * */
    public getSupplierStatusList(): Observable<SelectItemModel[]> {
      return Observable.of(this.supplierStatusList);
    }

    /**
     * 审核状态列表
     * */
    public getSupplierAuditStatusList(): Observable<SelectItemModel[]> {
      return Observable.of(this.supplierAuditStatusList);
    }

    /**
     * 设置为潜在
     * */
    public setPotentialStatus(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/statusChangeProcess/setPotential', id, this.defaultConfig);
    }

    /**
     * 设置为注册
     * */
    public setRegistStatus(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/statusChangeProcess/setRegist', id, this.defaultConfig);
    }

    /**
     * 设为临时
     * */
    public setPauseStatus(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/statusChangeProcess/setPause', {}, this.defaultConfig);
    }

    /**
     * 设为备选状态
     * */
    public setAlternative(id: string, time: number): Observable<SupplierResModelT<any>> {
      return this.http.Post('/statusChangeProcess/setAlternative', {
        id: id,
        t: time
      }, this.defaultConfig);
    }

    /**
     * 设为暂停
     * */
    public setPause(id: string, time: number): Observable<SupplierResModelT<any>> {
      return this.http.Post('/statusChangeProcess/setPause', {id: id, t: time}, this.defaultConfig);
    }

    /**
     * 推荐
     * */
    public recommendSupplier(data: RecommendDataModel): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supRecommend/recommend', data, this.defaultConfig);
    }

    /**
     * 推荐审核列表供应商基础信息
     * */
    public getRecommendSupplierInfo(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/supRecommend/itemByRecId', {id: id}, this.defaultConfig);
    }
    /**
     *获取推荐表信息*/
    public getRecommendInfo(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/supRecommend/item', {id: id}, this.defaultConfig);
    }
    /**
     * 管理科获取供应商档案列表
     * */
    public getArchivesList(data: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/managementSectionList', data, this.defaultConfig);
    }

    /**
     * 获取档案列表供应商详情
     * */
    public getArchivesItem(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/supplierBasic/fullItem', {supplierFactoryId: id}, this.defaultConfig);
    }

    /**
     * 管理员修改供应商信息（不修改社会信用代码）
     * */
    public updateSupplierInfo(data): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierInfoChange/updateSupplierInfo', data, this.defaultConfig);
    }

    /**
     * 供应商修改信息接口
     * */
    public supplierUpdateInfo(data): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/submitSupplierInfo', data, this.defaultConfig);
    }

    /**
     * 管理员修改供应商信息（修改社会信用代码）
     * */
    public changeSocialCreditCode(data): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/changeSocialCreditCode', data, this.defaultConfig);
    }

    /**
     * 供应商推荐审核通过
     * */
    public recommendAuditPass(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supRecommend/purchaseAuditPass', {id: id}, this.defaultConfig);
    }

    /**
     * 供应商推荐审核拒绝
     * */
    public recommendAuditReject(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supRecommend/purchaseAuditNotPass', {id: id}, this.defaultConfig);
    }

    /**
     * 供应商修改审核列表
     * */
    public getSupplierModifyAuditList(data: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierInfoChange/infoChangeList', data, this.defaultConfig);
    }

    /**
     * 供应商修改审核详情
     * */
    public getModifyDetail(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/supplierInfoChange/itemChangeInfo', {id: id}, this.defaultConfig);
    }

    /**
     * 修改审核通过
     * */
    public modifyAuditPass(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierInfoChange/auditPass', id, this.defaultConfig);
    }

    /**
     * 修改审核拒绝
     * */
    public modifyAuditReject(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierInfoChange/auditNotPass', {id: id}, this.defaultConfig);
    }

    /**
     * 获取评审资料列表
     * */
    public getReviewList(filters: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierReviewDataImport/list', filters, this.defaultConfig);
    }

    /**
     * 删除评审资料
     * */
    public delReviewItem(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierReviewDataImport/delete', {listId: [id]}, this.defaultConfig);
    }

    /**
     * 厂矿获取供应商档案列表*/
    public factoryArchivesList(filters: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/factoryMineList', filters, this.defaultConfig);
    }

    /**
     * 获取潜在供应商列表*/
    public getPotentialSupplierList(filters: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/potentialList', filters, this.defaultConfig);
    }

    /**
     * 厂矿挑选供应商*/
    public factorySelectSupplier(ids: string[]): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/potentialSupplierToFactory', ids, this.defaultConfig);
    }
    /**
     * 统购转自购*/
    public supplierCommonToSelf(ids: string[]): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierFactory/purchaseToSelf', ids, this.defaultConfig);
    }
    /**
     * 过滤供应范围查询供应商*/
    public getSupplierFilterScope(data: Filters<{materialNos: string[]; purchaseWay: number; }>): Observable<SupplierResModelT<any>> {
      return this.http.newPost('/supplierFactory/listForPurchase', data, this.defaultConfig);
    }
    /**
     * 导入评级信息*/
    public importRateInfo(data: ImportFileData): Observable<any> {
      return this.http.newPost('/supplierRatingInfo/save', data, this.defaultConfig);
    }
    /**
     * 导入合格供应商*/
    public importSupplier(data: ImportFileData): Observable<any> {
      return this.http.newPost('/supplierFactory/updateSupplierState', data, this.defaultConfig);
    }
  }
}
@Injectable()
export class SupplierManageService extends SupplierManageNs.SupplierManageServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
