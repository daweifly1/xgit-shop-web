import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace DictionaryServiceNs {
  export enum TypeCode {
    CompanyNature = 'COMPANY_NATURE',           // 企业性质
    SupplierIndustry = 'SUPPLIER_INDUSTRY',     // 供应商所属行业,
    SuppliyScope = 'SUPPLY_SCOPE',               // 限定供应范围
    ProjectType = 'PROJECT_TYPE',               // 项目类别
    SuppliesCategories = 'SUPPLIES_CATEGORIES',  // 物资大类
    FactoryManagement = 'FACTORY_MANAGEMENT',     // 分工管理
    BusinessType = 'BUSINESS_TYPE',                // 业务类型
    ApplyDepartment = 'APPLY_DEPARTMENT',          // 领料部门
    FactoryUnit = 'FACTORY_UNIT',                  // 单位
    SUPPLYSCOPE = 'SUPPLY_SCOPE',                   // 供应范围
    TRANSPORTFEES = 'TRANSPORT_FEES',                   // 运杂费类型
    PaymentMethod = 'PAYMENT_METHOD',               // 付款方式,
    TransportMethod = 'TRANSPORT_METHOD',           // 运输方式
    INPUTTAX = 'INPUT_TAX',                          // 进项税
    OUTPUTTAX  = 'OUTPUT_TAX',                     // 销项税
    CompanyType = 'COMPANY_TYPE',                 // 企业类型

  }
  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }
  export interface  DictItemModel {
    code?: string;
    createDate?: string;
    groupName?: string;
    id?: string;
    name?: string;
    pId?: string;
    parentCode?: string;
    parentName?: string;
    privated?: number;
    remark?: string;
    valid?: number;
  }
  export interface  AreaInfoItemModel {
    code: string;
    name: string;
  }
  export interface TableConfig {
    id?: string;
    tableCol: string;
    tableName: string;
  }
  export class DictionaryServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
    }
    /**
     * 数据字典列表,参数类型pId: 0
     */
    public getdataDictionaryList(filter): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/dataDictionary/list', filter, this.defaultConfig);
    }
    /**
     * 新增参数类型
     */
    public addParamType(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/dataDictionary/add', form, this.defaultConfig);
    }
    /**
     * 修改参数类型
     */
    public editParamType(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/dataDictionary/update', form, this.defaultConfig);
    }
    public getDataDictionaryItem(id: string): Observable<any> {
      return this.http.Get('/dataDictionary/item', {id: id}, this.defaultConfig);
    }
    public getDataDictionarySearchList(data: DictItemModel): Observable<any> {
      return this.http.Post('/dataDictionary/searchList', data, this.defaultConfig);
    }
    /**
     * 根据地区编码查询地区详情
     * */
    public getAreaInfo(code: string): Observable<any> {
      return this.http.Get('/area/info', {id: code}, {
        gateway: HttpUtilNs.GatewayKey.Bs
      });
    }
    /**
     * 获取地区列表
     * */
    public getAreaList(code?: string): Observable<any> {
      const param = code ? {id: code} : null;
      return this.http.Get('/area/list', param, {
        gateway: HttpUtilNs.GatewayKey.Bs
      });
    }
    /**
     * 获取表格配置项*/
    public getTableConfig(id: string): Observable<HttpUtilNs.UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Bs;
      return this.http.Get('/tableSetting/view', {tableName: id}, config);
    }
    /**
     * 设置表格配置项*/
    public setTableConfig(tableConfig: TableConfig): Observable<HttpUtilNs.UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Bs;
      return this.http.Post('/tableSetting/save', tableConfig , config);
    }
  }
}
@Injectable()
export class DictionaryService extends DictionaryServiceNs.DictionaryServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

