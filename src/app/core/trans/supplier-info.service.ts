import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';


export namespace SupplierInfoNs {
  export interface SupplierResModelT<T> extends HttpUtilNs.UfastHttpRes {
    value: T;
  }
  export interface CompanyTypeItem {
    id: number;
    name: string;
  }
  export interface RegisterInfo {
    companyName: string;
    socialCreditCode: string;
    account: string;
    password: string;
    userName: string;
    phone: string;
    verifyCode?: string;
    authId: string;
  }
  export interface SupplierAllInfo {
    businessType: number;
    createDate: any;
    createId: any;
    id: string;
    isDelete: number;
    materialType: number;
    orgId: string;
    orgName: string;
    proposedProduct: any;
    status: number;
    supplierBasicVO: SupplierBasicInfo;
    supplierId: string;
  }
  export interface SupplierBasicInfo {
    bankOfDeposit: string;   // 开户行 ,
    bankOfDepositAccount: string;   // 开户行帐号 ,
    bankOfDepositAddress: string;   // 开户行地址 ,
    collectingBank: string;   // 收款银行 ,
    collectingBankAccount: string;   // 收款银行帐号 ,
    collectingBankAddress: string;   // 收款银行地址 ,
    collectingBankLineNum: string;   // 收款银行行号 ,
    companyNature: string;   // 企业性质 ,
    companyType: string;  // 企业类型 ,
    contactAddress: string;   // 通讯地址 ,
    cooperationScope: string;   // 合作范围 ,
    createDate: string;
    createId: string;
    erpSupplierCode: string;   // erp供应商编码 ,
    erpSupplierId: string;   // erp供应商id ,
    id: string;
    industry: string;   // 所属行业 ,
    legalPerson: string;   // 法人 ,
    name: string;   // 公司名称 ,
    postcode: string;   // 邮编 ,
    profile: string;   // 公司简介 ,
    registAreaCode: string;   // 注册地区编码 ,
    registCapital: number;  // 注册资本 ,
    registDetailsAddress: string;   // 详细地址 ,
    scopeOfBusiness: string;   // 经营范围 ,
    setUpDate: string;   // 成立时间 ,
    socialCreditCode: string;   // 统一社会信用代码 ,
    updateDate: string;
    updateId: string;
    website: string;   // 公司网址 ,
    workAreaCode: string;   // 办公地区编码 ,
    workDetailsAddress: string;   // 工作详细地址
  }
  export interface SupplierContact {
    supplierId?: string; // 公司Id ,
    createDate?: string;
    fax?: string;
    isCommonlyUsed?: number;   // 是否是常用联系人
    id?: string;     // 主键 ,
    email?: string; // 邮件 ,
    cellphone?: string; // 手机 ,
    phone?: string;    // 电话
    name?: string; // 联系人名称 ,
    position?: string; // 职务
    remark?: string;
  }
  export interface QualFileItem {
    createDate?: string;  //
    credentialName: string;  // 证件名称 ,
    credentialType: number;   //  证件类型(1:营业执照2:调查表3：其他) ,
    fileName: string;  // 文件名称 ,
    fileUrl: string;  // 文件路径 ,
    id?: string;  //
    issuingAgency: string;  // 发证机构 ,
    remark?: string;  // 备注 ,
    supplierId?: string;  // 供应商id ,
    updateDate?: string;  //
    validityPeriodEnd: any;  // 有效期止 ,
    validityPeriodStart: any;  // 有效期始
  }
  export interface Filters<T> {
    pageSize: number;
    pageNum: number;
    filters: T;
  }
  export enum isCommonlyUser {
    Flase,
    True
  }
  export enum QualFileType {
    License = 1,
    SurveyTable,
    Other
  }
  export enum ProblemRecordType {
    ContractProblem = '0',
    QualityProblem = '1'
  }
  export interface ProblemRecordItem {
    content: string;
    title: string;
    handleResult: string;
    id?: string;
    recordType: any;
    recordTime: any;
    orgId?: string;
  }
  export class SupplierInfoServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    private fileTypeList: CompanyTypeItem[];
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Bs
      };
      this.fileTypeList = [
        {id: 1, name: '营业执照'},
        {id: 2, name: '调查表'},
        {id: 3, name: '其他'},
      ];
    }

    public registerSupplier(info: RegisterInfo): Observable<any> {
      return this.http.Post('/supplierFactory/regist', info, this.defaultConfig);
    }
    public getLoginerBasicInfo(): Observable<SupplierResModelT<SupplierAllInfo>> {
      return this.http.Get('/supplierFactory/loginSupplierInfo', null, this.defaultConfig);
    }
    public getSupplierBasicInfo(id: string): Observable<any> {
      return this.http.Get('/supplierBasic/item', {id: id}, this.defaultConfig);
    }
    public saveSupplierBasicInfo(data: SupplierBasicInfo): Observable<any> {
      return this.http.Post('/supplierBasic/save', data, this.defaultConfig);
    }
    public getContactBySupplier(supplierId: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/supplierContact/listBySupplierId', {supplierId: supplierId}, this.defaultConfig);
    }
    public getTempSupplierContact(supplierId: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/tempSupplierContact/listBySupplierId', {supplierId: supplierId}, this.defaultConfig);
    }
    public getTempSupplierBasic(supplierId: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/tempSupplierBasic/item', {id: supplierId}, this.defaultConfig);
    }
    public updateTempContact(data: SupplierContact): Observable<SupplierResModelT<any>> {
      return this.http.Post('/tempSupplierContact/update', data, this.defaultConfig);
    }
    public updateTempSupplierBasic(data: SupplierContact): Observable<SupplierResModelT<any>> {
      return this.http.Post('/tempSupplierBasic/update', data, this.defaultConfig);
    }
    public addTempContact(data: SupplierContact): Observable<SupplierResModelT<any>> {
      return this.http.Post('/tempSupplierContact/insert', data, this.defaultConfig);
    }
    public delTempContact(id: string, supplierId: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/tempSupplierContact/delete', {id: id, supplierId: supplierId}, this.defaultConfig);
    }
    /**
     * 供应商新增资质文件
     * */
    public addTempQualFile(data: QualFileItem): Observable<SupplierResModelT<any>> {
      return this.http.Post('/tempSupplierFile/insert', data, this.defaultConfig);
    }
    /**
     * 更新资质文件
     * */
    public updateTempQualFile(data: QualFileItem): Observable<SupplierResModelT<any>> {
      return this.http.Post('/tempSupplierFile/update', data, this.defaultConfig);
    }
    /**
     * 删除资质文件
     * */
    public delTempQualFile(id: string, supplierId: string): Observable<SupplierResModelT<any>> {
      return this.http.Post('/tempSupplierFile/delete', {id: id, supplierId: supplierId}, this.defaultConfig);
    }
    /**
     * 获取资质文件列表
     * */
    public getTempQualFile(supplierId: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/tempSupplierFile/listBySupplierId', {supplierId: supplierId}, this.defaultConfig);
    }
    /**
     * 管理科拉取资质文件列表
     * */
    public  getQualFileBySupplier(supplierId: string): Observable<SupplierResModelT<SupplierInfoNs.QualFileItem>> {
      return this.http.Get('/supplierFile/listBySupplierId', {supplierId: supplierId}, this.defaultConfig);
    }
    /**
     * 根据id获取供应商评级信息
     * */
    public getGradeInfoListById(id: string): Observable<SupplierResModelT<any>> {
      return this.http.Get('/supplierRatingInfo/item', {id: id}, this.defaultConfig);
    }
    /**
     * 获取供应商评级信息
     * */
    public getGradeInfoList(filters: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierRatingInfo/list', filters, this.defaultConfig);
    }
    /**
     * 获取历史文件列表
     * */
    public getHistoryList(filters: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierHistoryFile/list', filters, this.defaultConfig);
    }
    /**
     * 获取合同和质量问题记录列表
     * */
    public getProblemRecordList(filters: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierProblemRecord/list', filters, this.defaultConfig);
    }
    /**
     * 保存合同和质量问题记录
     * */
    public saveProblemRecord(data: ProblemRecordItem): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierProblemRecord/save', data, this.defaultConfig);
    }
    /**
     * 删除合同和质量问题记录*/
    public delProblemRecord(ids: string[]): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierProblemRecord/delete', {listId: ids}, this.defaultConfig);
    }
    /**
     * 获取信息变更记录列表
     * */
    public getInfoChangeList(filter: Filters<any>): Observable<SupplierResModelT<any>> {
      return this.http.Post('/supplierInfoChange/listAllDetails', filter, this.defaultConfig);
    }
    /**
     * 资质文件类型列表
     * */
    public getFileTypeList(): Observable<CompanyTypeItem[]> {
      return Observable.of(this.fileTypeList);
    }
  }
}
@Injectable()
export class SupplierInfoService extends SupplierInfoNs.SupplierInfoServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }
}
