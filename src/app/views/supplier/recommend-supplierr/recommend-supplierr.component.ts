import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {DictionaryService, DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
enum MaxInputLen {
  Product = 100,
  Explanation = 500,

}
@Component({
  selector: 'app-recommend-supplierr',
  templateUrl: './recommend-supplierr.component.html',
  styleUrls: ['./recommend-supplierr.component.scss']
})
export class RecommendSupplierrComponent implements OnInit {
  @Input() supplierId: string;
  @Output() finish: EventEmitter<any>;
  /**
   * true：管理科
   * false：厂矿
   * */
  @Input() isManager: boolean;
  @Input() source: number;
  MaxInputLenEnum = MaxInputLen;
  infoForm: FormGroup;
  supplierInfo: SupplierInfoNs.SupplierBasicInfo;
  fieldList: {field: string; name: string; pipe?: string}[];
  supplierScopeList: DictionaryServiceNs.DictItemModel[];
  RecommendTypeEnum = SupplierManageNs.RecommendSource;
  constructor(private formBuilder: FormBuilder, private supplierInfoService: SupplierInfoService,
              private supplierManageService: SupplierManageService, private messageService: ShowMessageService,
              private dictService: DictionaryService) {
    this.supplierScopeList = [];
    this.fieldList = [
      { field: 'name', name: '企业名称'},
      {field: 'contact', name: '联系人'},
      {field: 'contactPhone', name: '联系电话'},
      {field: 'contactMail', name: '邮箱'},
      { field: 'postcode', name: '邮政编码'},
      { field: 'contactAddress', name: '通讯地址'},
      { field: 'bankOfDeposit', name: '开户银行'},
      { field: 'bankOfDepositAccount', name: '银行账号'},
      { field: 'scopeOfBusiness', name: '经营范围'},
      { field: 'cooperationScope', name: '与江铜合作范围'},
    ];
    this.supplierInfo = <any>{};
    this.finish = new EventEmitter<any>();
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  private getSupplierInfo() {
    if (!this.supplierId) {
      return;
    }
    this.supplierInfoService.getSupplierBasicInfo(this.supplierId)
      .subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.supplierInfo = resData.value;
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public doSubmit() {
    Object.keys(this.infoForm.controls).forEach((key) => {
      this.infoForm.controls[key].markAsDirty();
      this.infoForm.controls[key].updateValueAndValidity();
    });
    if (this.infoForm.invalid) {
      return;
    }
    let source = this.source;
    if (!this.isManager && this.infoForm.value.recommendedFor === SupplierManageNs.RecommendSource.Common) {
      source = SupplierManageNs.RecommendSource.SelfToCommon;
    }
    const formData: SupplierManageNs.RecommendDataModel = this.infoForm.getRawValue();
    formData.supplierSupplyRangeVOS = [];
    formData.supplyRange = '';
    formData.supplierId = this.supplierId;
    formData.source = source;
    formData['supplierSupply'].forEach((id: string) => {
      const temp = this.supplierScopeList.find(item => item.id === id);
      formData.supplierSupplyRangeVOS.push({
        supplyRangeCode: temp.code,
        supplyRangeName: temp.name,
        recommendId: temp.id
      });
      formData.supplyRange += `${temp.name}|`;
    });
    formData['supplierSupply'] = undefined;
    formData.supplyRange = formData.supplyRange.substr(0, formData.supplyRange.length - 1);
    this.messageService.showLoading('');
    this.supplierManageService.recommendSupplier(formData).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.finish.emit();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onCancel() {
    this.finish.emit();
  }
  ngOnInit() {
    this.infoForm = this.formBuilder.group({
      materialType: [null, [Validators.required]],
      proposedProduct: [null, [Validators.required, Validators.maxLength(MaxInputLen.Product)]],
      supplierSupply: [null, [Validators.required]],
      recommendExplanation: [null, [Validators.required, Validators.maxLength(MaxInputLen.Explanation)]],
      recommendedFor:
        [SupplierManageNs.RecommendSource.Common, [Validators.required]]
    });
    this.getSupplierInfo();
    this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.SuppliyScope})
      .subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.supplierScopeList = resData.value;
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }

}
