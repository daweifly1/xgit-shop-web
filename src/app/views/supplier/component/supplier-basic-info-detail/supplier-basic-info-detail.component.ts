import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-supplier-basic-info-detail',
  templateUrl: './supplier-basic-info-detail.component.html',
  styleUrls: ['./supplier-basic-info-detail.component.scss']
})
export class SupplierBasicInfoDetailComponent implements OnInit {
  @Input()
  set basicInfo(value: any) {
    this._basicInfo = value || {};
    this._basicInfo.registAddressAll = `${this._basicInfo.registAreaName ?
      this._basicInfo.registAreaName : ''} ${this._basicInfo.registDetailsAddress ? this._basicInfo.registDetailsAddress : ''}`;
    this._basicInfo.workAddressAll = `${this._basicInfo.workAreaName ?
      this._basicInfo.workAreaName : ''} ${this._basicInfo.workDetailsAddress ? this._basicInfo.workDetailsAddress : ''}`;
  }
  @Input()
  set colNum(value: 1|2) {
    this._colNum = value || 2;
  }
  @Input()
  set hideFieldList(value: string[]) {
    this._hideFieldList = value || [];
    if (this.infoFieldList.length === 0) {
      return;
    }
    this.calcField();
  }
  @Input()
  set lightFieldList(value: string[]) {
    this._lightFieldList = value || [];
    if (this.infoFieldList.length === 0) {
      return;
    }
    this.calcField();
  }
  _colNum: number;
  infoFieldList: {field: string; name: string; pipe?: string; hide?: boolean; light?: boolean; } [];
  _basicInfo: any;
  _hideFieldList: string[];
  _lightFieldList: string[];
  profileLight: boolean;
  profileHide: boolean;
  constructor() {
    this.profileLight = false;
    this.profileHide = false;
    this.infoFieldList = [];
    this._basicInfo = {};
    this._colNum = 2;
    this._hideFieldList = [];
    this._lightFieldList = [];
  }
  private calcField() {
    this.infoFieldList.forEach((item) => {
      if (item.field === 'registAddressAll') {
        item.hide = this._hideFieldList.indexOf('registAreaName') !== -1 && this._hideFieldList.indexOf('registDetailsAddress') !== -1;
        item.light = this._lightFieldList.indexOf('registAreaName') !== -1 || this._lightFieldList.indexOf('registDetailsAddress') !== -1;
        return;
      }
      if (item.field === 'workAddressAll') {
        item.hide = this._hideFieldList.indexOf('workAreaName') !== -1 && this._hideFieldList.indexOf('workDetailsAddress') !== -1;
        item.light = this._lightFieldList.indexOf('workAreaName') !== -1 || this._lightFieldList.indexOf('workDetailsAddress') !== -1;
        return;
      }
      item.hide = this._hideFieldList.indexOf(item.field) !== -1;
      item.light = this._lightFieldList.indexOf(item.field) !== -1;
    });
    this.profileLight = this._lightFieldList.indexOf('profile') !== -1;
    this.profileHide = this._hideFieldList.indexOf('profile') !== -1;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  ngOnInit() {
    this.infoFieldList = [
      { field: 'name', name: '企业名称'},
      { field: 'companyNature', name: '企业性质'},
      { field: 'socialCreditCode', name: '统一社会信用代码'},
      { field: 'companyType', name: '企业类型'},
      { field: 'grade', name: '信用等级'},
      { field: 'materialType', name: '企业类别', pipe: 'materialType2'},
      { field: 'supplyRange', name: '限定供应范围'},
      { field: 'proposedProduct', name: '拟购产品'},
      { field: 'registAddressAll', name: '企业注册地址'},
      { field: 'workAddressAll', name: '企业办公地址'},
      { field: 'setUpDate', name: '成立日期', pipe: 'date:yyyy-MM-dd'},
      { field: 'registCapital', name: '注册资本(万元)'},
      { field: 'legalPerson', name: '法定代表人'},
      { field: 'postcode', name: '邮政编码'},
      { field: 'contactAddress', name: '通讯地址'},
      { field: 'collectingBank', name: '收款开户银行'},
      { field: 'collectingBankLineNum', name: '收款银行行号'},
      { field: 'collectingBankAccount', name: '收款银行账号'},
      { field: 'collectingBankAddress', name: '收款开户行地址'},
      { field: 'bankOfDeposit', name: '开户银行'},
      { field: 'bankOfDepositAccount', name: '银行账号'},
      { field: 'bankOfDepositAddress', name: '开户行地址'},
      { field: 'industry', name: '所属行业'},
      { field: 'scopeOfBusiness', name: '经营范围'},
      { field: 'cooperationScope', name: '与江铜合作范围'},
      { field: 'website', name: '公司网址'},
    ];
    this.calcField();
  }

}
