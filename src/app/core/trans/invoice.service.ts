import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';


export namespace InvoiceServiceNs {
  export enum InvoiveSatus {
    APPROVED = 'APPROVED', // 'ERP已审批',
    APPROVEDPR = 'APPROVEDPR', // 'ERP业务批准',
    CANCEL = 'CANCEL',  // 'ERP已取消',
    CREATED = 'CREATED',  // 'ERP已生成发票',
    NEW = 'NEW', // 'ERP新建',
    PROCESSING = 'PROCESSING',  // 'ERP审批中',
    RECREATE = 'RECREATE',  // 'ERP重新生成发票',
    REJECT = 'REJECT',  // 'ERP已拒绝',
    SUBMIT = 'SUBMIT',  // '已提交',
    SAVED = 'SAVED', // '保存',
    CHECKING = 'CHECKING',  // '审批中',
    PAID = 'PAID',  // '已做付款凭证',
    PREPAY = 'PREPAY',  // '已预付款核销',
    APPROVING = 'APPROVING', // '审批中',
    REFUSED = 'REFUSED', // '审批拒绝',
    COMPLETE = 'COMPLETE', // '审批完成'
  }
  export interface UfastHttpResT<T> {
    code: number;
    message: string;
    value: T;
  }

  export interface InvoiceChildModel {
    rowNo?: string; // 行号
    acceptRowNo?: string;
    contractType?: string; // 类型
    materialsName?: string; // 物料说明
    purchaseNo?: string;   // 采购订单号（合同）
    materialsNo?: string;  // 物料编码
    unit?: string; // 单位
    quantity?: number; //  入库数量
    rowAmount: number; // 行金额
    taxCode: string; // 税码
    taxAmount: number; // 税额
    totalAmount?: number; // 总金额
    unitPriceWithouttax?: number;  // 采购订单单价（不含税）
    unitPriceWithtax?: number;  // 实际开票含税单价
    processor?: string;  // 采购业务员
    id?: number;
  }

  // 新建和编辑发票联系单接收模型
  export interface EditInvoiceChildAcceptModel {
    rowNo: string; // 行号
    acceptNo?: string; //  接收号
    acceptRowNo?: string; //  接收行号
    purchaseNo?: string; //  采购合同
    billWithoutaxPrice: string; //  开票不含税单价
    id?: string; // 主键
    currencyType?: string; // 币种
    invoiceId?: string; //  发票单号
    quantity: number; //  开票数量
    rowAmount: number; //   行金额
    taxAmount: number; //   税额
    taxCode: string; //   税码
  }

  // 新建和编辑发票联系单
  export interface EditInvoiceChildModel {
    approver?: string; // 审批人
    billAccountNo?: string; // 收款单位账号
    billAmount: string; // 发票金额
    billBank?: string; // 收款单位开户行
    billBankAddress?: string; // 收款单位开户行地址
    billCreateDate?: string; // 发票日期
    billNum?: number; //  发票张数
    deduction?: number; //  扣款项
    description?: string; //  描述
    erpId?: string; //  erp单号
    id?: string; // 单号
    invoiceBillId: string; // 发票单号
    prepayments?: number;   //  预付款
    rowAmount?: number;  //  行金额总计
    state?: string; //  状态
    supplierName: string; //   供应商名称
    transportFees: number; //  运杂费
    taxAmount: number; // 税额
    warranty?: number; //  质保金
    salesmanErpCode?: string; //  业务员erpCode
  }

  export class InvoiceServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps
      };
    }

    public getInvoiceList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/invoice/pageList', filter, this.defaultConfig);
    }

    public getInvoiceDetail(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/invoice/view', {id: id}, this.defaultConfig);
    }

    public getChildInvoice(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/acceptance/pageList', filter, this.defaultConfig);
    }

    public addInvoice(invoiceAcceptanceVOs: EditInvoiceChildAcceptModel[],
                      invoiceVO: EditInvoiceChildModel): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/invoice/add', {
        invoiceAcceptanceVOs: invoiceAcceptanceVOs,
        invoiceVO: invoiceVO
      }, this.defaultConfig);
    }

    public editInvoice(invoiceAcceptanceVOs: EditInvoiceChildAcceptModel[],
                      invoiceVO: EditInvoiceChildModel): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/invoice/update', {
        invoiceAcceptanceVOs: invoiceAcceptanceVOs,
        invoiceVO: invoiceVO
      }, this.defaultConfig);
    }

    public getSupplierDetail(id: string): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Bs;
      return this.http.Get<UfastHttpResT<any>>('/supplier/getByErpCode', {erpCode: id}, config);
    }

    public deleteInvoice(id: string): Observable<UfastHttpResT<any>> {
      return this.http.Get('/invoice/delete', {id: id}, this.defaultConfig);
    }

    public getPayQuery(erpId: string): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/erpinvoice/getPayInfos', {erpBillId: erpId}, this.defaultConfig);
    }

    // 获取税码
    public getTaxCode(): Observable<UfastHttpResT<any>> {
      return this.http.Get<UfastHttpResT<any>>('/rate/getRateList', null, this.defaultConfig);
    }

    // 提交审批
    public submitApproval(invoiceAcceptanceVOs: EditInvoiceChildAcceptModel[],
                          invoiceVO: EditInvoiceChildModel): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/invoice/submitErp', {
        invoiceAcceptanceVOs: invoiceAcceptanceVOs,
        invoiceVO: invoiceVO
      }, this.defaultConfig);
    }

    // 打印模板列表
    public printTpl(CurPage: string, PageSize: string, TemplateType: string): Observable<UfastHttpResT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Get<UfastHttpResT<any>>('/printTemplate/list', {
        CurPage,
        PageSize,
        TemplateType
      }, config);
    }
    public updateStateToFinish(id: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      return this.http.newGet('/invoice/syncErp', {id: id}, config);
    }
    public updateStateToRefused(id: string): Observable<any> {
      const config: HttpUtilNs.NewHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps
      };
      return this.http.newGet('/invoice/updateStateToRefused', {id: id}, config);
    }
  }
}
@Injectable()
export class InvoiceService extends InvoiceServiceNs.InvoiceServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
