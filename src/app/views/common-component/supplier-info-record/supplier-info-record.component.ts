import {Component, EventEmitter, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
enum ChangeType {
  BasicInfo = 1,
  Contact,
  File
}
@Component({
  selector: 'app-supplier-info-record',
  templateUrl: './supplier-info-record.component.html',
  styleUrls: ['./supplier-info-record.component.scss']
})
export class SupplierInfoRecordComponent implements OnInit, OnDestroy {
  @ViewChild('oldValueTpl') oldValueTpl: TemplateRef<any>;
  @ViewChild('newValueTpl') newValueTpl: TemplateRef<any>;
  @Input() supplierId: string;
  @Input() refresh: EventEmitter<any>;
  ChangeTypeEnum = ChangeType;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  refreshHandler: any;
  propertyMap: any;
  operationMap: any;
  infoModalShow: boolean;
  contactFieldList: {field: string; label: string, pipe?: string}[];
  fileFieldList: {field: string; label: string; pipe?: string}[];
  fieldList: any[];
  oldData: any;
  newData: any;
  constructor(private supplierInfoService: SupplierInfoService, private messageService: ShowMessageService) {
    this.infoModalShow = false;
    this.oldData = {};
    this.newData = {};
    this.dataList = [];
    this.fieldList = [];
    this.propertyMap = {
      name: '企业名称',
      socialCreditCode: '统一社会信用代码',
      grade: '信用等级',
      companyType: '企业类型',
      companyNature: '企业性质',
      registAreaCode: '企业注册地址',
      registDetailsAddress: '企业注册地址',
      workAreaCode: '企业办公地址',
      workDetailsAddress: '企业办公地址',
      setUpDate: '成立日期',
      registCapital: '注册资本',
      legalPerson: '法定代表人',
      postcode: '邮政编码',
      contactAddress: '通讯地址',
      collectingBank: '收款开户银行',
      collectingBankLineNum: '收款银行行号',
      collectingBankAccount: '收款银行账号',
      collectingBankAddress: '收款开户行地址',
      bankOfDeposit: '开户银行',
      bankOfDepositAccount: '银行账号',
      bankOfDepositAddress: '开户行地址',
      industry: '所属行业',
      scopeOfBusiness: '经营范围',
      cooperationScope: '与江铜合作范围',
      website: '公司网址',
    };
    this.contactFieldList = [
      { field: 'name' , label: '名称'},
      { field: 'position' , label: '职务'},
      { field: 'cellphone' , label: '手机'},
      { field: 'phone' , label: '电话'},
      { field: 'fax' , label: '传真'},
      { field: 'email' , label: '邮箱'},
      { field: 'isCommonlyUsed' , label: '常用联系人', pipe: 'commonlyUser'},
      { field: 'remark' , label: '备注'},
    ];
    this.fileFieldList = [
      {label: '证件名称', field: 'credentialName'},
      {label: '发证机构', field: 'issuingAgency'},
      {label: '证件类型', field: 'credentialType', pipe: 'qualFileType'},
      {label: '有效期起', field: 'validityPeriodStart', pipe: 'date:yyyy-MM-dd'},
      {label: '有效期止', field: 'validityPeriodEnd', pipe: 'date:yyyy-MM-dd'},
    ];
    this.fileFieldList = [];
    this.operationMap = {
      INSERT: '新增',
      DELETE: '删除',
      UPDATE: '更新'
    };
  }
  getList = () => {
    if (!this.supplierId) {
      return;
    }
    const filters = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: {
        supplierId: this.supplierId
      }
    };
    this.dataTableConfig.loading = true;
    this.supplierInfoService.getInfoChangeList(filters).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      this.dataTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list || [];
      this.dataTableConfig.total = resData.value.total;
      this.dataList.forEach((item, index: number) => {
        item['index'] = index;
        if (item.type === this.ChangeTypeEnum.BasicInfo) {
          item['operation'] = this.operationMap['UPDATE'];
          item['field'] = this.propertyMap[item.property];
          return;
        }
        if (item.type === this.ChangeTypeEnum.Contact ) {
          item['field'] = '联系人';
        } else {
          item['field'] = '资质文件';
        }
        item['operation'] = this.operationMap[item.property];
        item.originalValueObj = JSON.parse(item.originalValue);
        item.newValueObj = JSON.parse(item.value);
      });
    }, (error) => {
      this.dataTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public viewDetail(type: number, oldValue, newValue) {
    this.infoModalShow = true;
    this.oldData = Object.assign({}, oldValue);
    this.newData = Object.assign({}, newValue);
    if (type === this.ChangeTypeEnum.Contact) {
      this.fieldList = this.contactFieldList;
    } else {
      this.fieldList = this.fileFieldList;
    }
  }
  public closeModal() {
    this.infoModalShow = false;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  ngOnInit() {
    this.dataTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageNum: 1,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [
        { title: '变更时间', field: 'createDate', width: 100, pipe: 'date:yyyy-MM-dd HH:mm'},
        { title: '操作', field: 'operation', width: 60},
        { title: '属性', field: 'field', width: 120},
        { title: '原信息', tdTemplate: this.oldValueTpl, width: 120},
        { title: '变更后信息', tdTemplate: this.newValueTpl, width: 120},
      ]
    };
    this.getList();
    if (this.refresh) {
      this.refreshHandler = this.refresh.subscribe(() => {
        this.getList();
      });
    }
  }
  ngOnDestroy() {
    if (this.refreshHandler) {
      this.refreshHandler.unsubscribe();
    }
  }

}
