import {Component, OnInit, Input, Output, EventEmitter, TemplateRef} from '@angular/core';
import {SupplierManageNs, SupplierManageService} from '../../../../core/trans/supplier-manage.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
@Component({
  selector: 'app-recommend-info',
  templateUrl: './recommend-info.component.html',
  styleUrls: ['./recommend-info.component.scss']
})
export class RecommendInfoComponent implements OnInit {
  @Input()supplierCode: string;
  @Input()id: string;
  @Input()operationTpl: TemplateRef<any>;
  @Output()finish: EventEmitter<any>;
  fieldList: {field: string; name: string; pipe?: string}[];
  basicInfo: any;
  recommendInfo: any;
  recommendFieldList: {field: string; name: string; pipe?: string}[];
  constructor(private supplierManageService: SupplierManageService, private messageService: ShowMessageService) {
    this.finish = new EventEmitter();
    this.recommendInfo = {};
    this.basicInfo = {};
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
    this.recommendFieldList = [
      { field: 'materialType', name: '企业类别', pipe: 'materialType2'},
      { field: 'supplyRange', name: '限定供应范围'},
      { field: 'proposedProduct', name: '拟购产品'},
      { field: 'recommendedFor', name: '推荐为', pipe: 'supplierType'},
      { field: 'recommendExplanation', name: '推荐说明'},
    ];
  }
  public returnMainPage() {
    this.finish.emit();
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  ngOnInit() {
    this.supplierManageService.getRecommendSupplierInfo(this.supplierCode)
      .subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.basicInfo = resData.value || {};
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    this.supplierManageService.getRecommendInfo(this.id).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.recommendInfo = resData.value || {};
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

}
