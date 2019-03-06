import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { SourcingQuotationService, SourcingQuotationServiceNs } from '../../../../../core/trans/purchase/sourcing-quotation.service';
import { UfastFormDetailNs } from '../../../../../layout/ufast-form-detail/ufast-form-detail.component';
import { UfastTableNs } from '../../../../../layout/ufast-table/ufast-table.component';
import { environment } from '../../../../../../environments/environment';
import { UfastValidatorsService } from '../../../../../core/infra/validators/validators.service';
import { UfastUtilService } from '../../../../../core/infra/ufast-util.service';
import { DictionaryService, DictionaryServiceNs } from '../../../../../core/common-services/dictionary.service';
import {UploadModalService} from '../../../../../widget/upload-modal/upload-modal';


export interface ActionStatus {
  save: boolean;
  submit: boolean;
  cancel: boolean;
}
export enum MsecEnum {
  Millisecond = 86400000
}
@Component({
  selector: 'app-edit-quotation',
  templateUrl: './edit-quotation.component.html',
  styleUrls: ['./edit-quotation.component.scss']
})
export class EditQuotationComponent implements OnInit {
  @Input() quotationId: string;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('uploadModalErrMsgTpl')uploadModalErrMsgTpl: TemplateRef<any>;
  public editQuotationForm: FormGroup;
  public enquiryDetail: SourcingQuotationServiceNs.EnquiryData = {
    enquiryCode: '',
    title: '',
    enquiryDate: '',
    quotationDateEnd: '',
    enquiryRequire: ''
  };
  public enquiryDateConfig: UfastFormDetailNs.DetailDataConfig[] = [];
  public materialTableConfig: UfastTableNs.TableConfig;
  public materialTableForm: FormGroup;
  private quotationMap = SourcingQuotationServiceNs.quotationDataMap;
  private materialMap = SourcingQuotationServiceNs.materialDataMap;
  private materialDataKey = ['id', 'lineNo', 'materialName', 'materialCode', 'drawingNumber', 'materialTexture', 'materialModel', 'brand',
    'materialFrom', 'technicalParameters', 'unit', 'purchaseQuantity', 'demandDate', 'useOrgName', 'remark', 'totalAmount',
    'attachmentUrl'];
  private materialInputKey = ['supplierModel', 'supplierTechParam', 'deliverDate',
    'transportWay', 'supplierBrand', 'quotationRemark', 'availableQuantity', 'supplierUnitPrice', 'tax'];
  public quotationMaterialList: SourcingQuotationServiceNs.QuotationMaterialData[] = [];
  public transportList: DictionaryServiceNs.DictItemModel[];
  public lengthLimit = {
    default: 50,
    maxLength: environment.otherData.searchInputMaxLen,
    precision: environment.otherData.materialNumDec,
    max: environment.otherData.materialNumMax,
    moneyMax: environment.otherData.moneyMax,
    moneyPrecision: environment.otherData.moneyDec,
    materialNumMin: environment.otherData.materialNumMin,
    moneyMin: environment.otherData.moneyMin
  };
  public submitParamsData: any = {};
  public actionStatus: ActionStatus = { save: true, submit: true, cancel: true };
  public rateList: { taxRateCode: string; taxRate: string; }[] = [];
  mesc = MsecEnum;
  batchData: { deliverDate?: Date, transportWay?: null, tax?: string };
  downTplUrl: string;
  importErrMsgList: any[];
  constructor(private formBuilder: FormBuilder, private uploadModalService: UploadModalService,
    private messageService: ShowMessageService,
    private quotationService: SourcingQuotationService,
    private validService: UfastValidatorsService,
    private ufastService: UfastUtilService,
    private dictService: DictionaryService) {
      this.batchData = {};
      this.importErrMsgList = [];
     }

  public getQuotationDetail() {
    this.quotationService.getQuotationDetail(this.quotationId).subscribe((resData) => {
      Object.keys(this.enquiryDetail).forEach((key) => {
        this.enquiryDetail[key] = resData.value[this.quotationMap[key].key];
      });
      Object.keys(this.editQuotationForm.controls).forEach((key) => {
        if (key === 'quotationValidDate') {
          this.editQuotationForm.controls[key].patchValue(resData.value[this.quotationMap[key].key] ?
            new Date(resData.value[this.quotationMap[key].key]) : null);
          return;
        }
        this.editQuotationForm.controls[key].patchValue(resData.value[this.quotationMap[key].key]);
      });
      const statusTemp = resData.value[this.quotationMap.quotationStatus.key];
      this.actionStatus.save = (statusTemp === SourcingQuotationServiceNs.QuotationStatus.Init) ||
        (statusTemp === SourcingQuotationServiceNs.QuotationStatus.Read);
      this.actionStatus.submit = (statusTemp === SourcingQuotationServiceNs.QuotationStatus.Init) ||
        (statusTemp === SourcingQuotationServiceNs.QuotationStatus.Read) ||
        (statusTemp === SourcingQuotationServiceNs.QuotationStatus.PartQuota) ||
        (statusTemp === SourcingQuotationServiceNs.QuotationStatus.FullQuota);
      this.actionStatus.cancel = (statusTemp === SourcingQuotationServiceNs.QuotationStatus.Init) ||
        (statusTemp === SourcingQuotationServiceNs.QuotationStatus.Read) ||
        (statusTemp === SourcingQuotationServiceNs.QuotationStatus.PartQuota) ||
        (statusTemp === SourcingQuotationServiceNs.QuotationStatus.FullQuota);
      this.quotationMaterialList = [];
      let arrTemp: any;
      resData.value[this.materialMap.detailVOS.key].forEach((item) => {
        const detailItem: any = {};
        this.materialDataKey.forEach((key) => {
          if (key === 'totalAmount') {
            detailItem[key] = this.ufastService.mul((item[this.materialMap.supplierUnitPrice.key] || 0),
              (item[this.materialMap.availableQuantity.key] || 0));
            return;
          }
          detailItem[key] = item[this.materialMap[key].key];
        });
        this.materialInputKey.forEach((key) => {
          if (key === 'deliverDate') {
            if (item[item[this.materialMap[key].key]]) {
              detailItem[key] = new Date(item[this.materialMap[key].key]);
            } else {
              detailItem[key] = new Date();
            }
            return;
          }
          detailItem[key] = item[this.materialMap[key].key];
        });
        detailItem['availableQuantity'] = detailItem['availableQuantity'] || detailItem['purchaseQuantity'];
         arrTemp = this.materialTableForm.get('materialArr') as FormArray;
        arrTemp.push(this.getNewMaterial(detailItem));
      });
      this.materialTableConfig.total = arrTemp.length;
      this.materialTableForm.get('materialArr')['controls'] = [...this.materialTableForm.get('materialArr')['controls']];
    });
  }
  public getNewMaterial(data?: any) {
    const materialDataForm: FormGroup = this.formBuilder.group({
      id: [null],
      lineNo: [null],
      materialName: [null],
      materialCode: [null],
      drawingNumber: [null],
      materialTexture: [null],
      materialModel: [null],
      brand: [null],
      materialFrom: [null],
      technicalParameters: [null],
      supplierModel: [null],
      supplierTechParam: [null],
      unit: [null],
      purchaseQuantity: [null],
      demandDate: [null],
      deliverDate: [null, [Validators.required]],
      transportWay: [null, [Validators.required]],
      supplierBrand: [null, [Validators.required]],
      quotationRemark: [null],
      useOrgName: [null],
      remark: [null],
      availableQuantity: [null, [Validators.required]],
      supplierUnitPrice: [null, [Validators.required]],
      totalAmount: [null],
      tax: [null, [Validators.required]],
      attachmentUrl: [null],
      disabled: [null],
    });
    if (data) {
      this.materialDataKey.forEach((key) => {
        materialDataForm.controls[key].patchValue(data[key]);
      });
      this.materialInputKey.forEach((key) => {
        materialDataForm.controls[key].patchValue(data[key]);
      });
      materialDataForm.controls['disabled'].patchValue(false);
    }
    return materialDataForm;
  }
  public abandonQuota(item: FormGroup) {
    Object.keys(item.controls).forEach((key) => {
      if (key === 'disabled') {
        item.controls[key].patchValue(true);
        return;
      }
      item.controls[key].disable();
    });
    this.materialInputKey.forEach((key) => {
      // if (key === 'detailStatus') {
      //   item.controls[key].patchValue(3);
      //   return;
      // }
      item.controls[key].patchValue('');
    });
  }
  public cancelAbandon(item: FormGroup) {
    Object.keys(item.controls).forEach((key) => {
      if (key === 'disabled') {
        item.controls[key].patchValue(false);
        return;
      }
      item.controls[key].enable();
    });
  }
  public handleQuantityChange(val, item) {
    this.calcTotalAmount(val || 0, item.controls['supplierUnitPrice'].value || 0, item);
  }
  public handlePriceChange(val, item) {
    this.calcTotalAmount(item.controls['availableQuantity'].value || 0, val || 0, item);
  }
  public calcTotalAmount(quantity, price, item) {
    const sum = this.ufastService.mul(quantity, price);
    item.controls['totalAmount'].patchValue(sum);
  }
  private beforeSubmit() {
    Object.keys(this.editQuotationForm.controls).filter(
      item => typeof this.editQuotationForm.controls[item].value === 'string').forEach((key: string) => {
        this.editQuotationForm.controls[key].patchValue(this.editQuotationForm.controls[key].value.trim());
      });
    Object.keys(this.editQuotationForm.controls).forEach((key) => {
      this.editQuotationForm.controls[key].markAsDirty();
      this.editQuotationForm.controls[key].updateValueAndValidity();
    });
    if (this.editQuotationForm.invalid) {
      return false;
    }
    this.materialTableForm.controls['materialArr']['controls'].forEach((item) => {
      if (item.controls['disabled'].value) {
        return;
      }
      Object.keys(item.controls).forEach((key) => {
        item.controls[key].markAsDirty();
        item.controls[key].updateValueAndValidity();
      });
    });
    if (this.materialTableForm.invalid) {
      this.messageService.showToastMessage('请完善物料信息', 'warning');
      return false;
    }
    this.submitParamsData = {
      purchaseQuotaVO: {},
      detailVOS: []
    };
    Object.keys(this.editQuotationForm.controls).forEach((key) => {
      this.submitParamsData.purchaseQuotaVO[this.quotationMap[key].key] = this.editQuotationForm.controls[key].value;
    });
    this.submitParamsData.purchaseQuotaVO['id'] = this.quotationId;
    this.materialTableForm.controls['materialArr']['controls'].forEach((item) => {
      const detailItems: any = {};
      this.materialInputKey.forEach((key) => {
        if (key !== 'tax') {
          detailItems[this.materialMap[key].key] = item.controls[key].value;
          return;
        }
        const obj = this.rateList.find((rateItem) => rateItem.taxRateCode === item.controls[key].value);
        if (!obj) {
          // detailItems['taxCode'] = '';
          // detailItems['taxRate'] = '';
          return;
        }
        detailItems[this.materialMap.taxRate.key] = obj.taxRate;
        detailItems[this.materialMap[key].key] = item.controls[key].value;
      });
      detailItems['id'] = item.controls['id'].value;
      this.submitParamsData.detailVOS.push(detailItems);
    });
    return true;
  }
  public submitForm() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.submitParamsData.purchaseQuotaVO[this.quotationMap.quotationStatus.key] = SourcingQuotationServiceNs.QuotationStatus.PartQuota;
    this.quotationService.editQuotation(this.submitParamsData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitPage(true);
    });
  }
  public saveForm() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.submitParamsData.purchaseQuotaVO[this.quotationMap.quotationStatus.key] = SourcingQuotationServiceNs.QuotationStatus.Read;
    this.quotationService.editQuotation(this.submitParamsData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitPage(true);
    });
  }
  public cancelQuota() {
    this.messageService.showAlertMessage('', '确认是否放弃报价', 'confirm').afterClose.subscribe((type) => {
      if (type !== 'onOk') {
        return;
      }
      this.quotationService.cancelQuotation(this.quotationId).subscribe((resData) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitPage(true);
      });
    });
  }
  /**运输方式选项 */
  private getDictData() {
    this.dictService.getDataDictionarySearchList({ parentCode: DictionaryServiceNs.TypeCode.TransportMethod })
      .subscribe((resData) => {
        if (resData.code !== 0) {
          return;
        }
        this.transportList = resData.value;
      }, (error) => {
        this.messageService.showToastMessage(error.message, 'error');
      });
  }
  // public disabledDate = (current: Date): boolean => {
  //   const quotationDateEnd = this.ufastService.getStartDate(this.enquiryDetail.quotationDateEnd);
  //   return current.getTime() > new Date(quotationDateEnd.getTime() + this.mesc.Millisecond).getTime();
  // }
  private getRateList() {
    this.quotationService.getRateList().subscribe((resData) => {
      this.rateList = resData.value || [];
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }

  /**批量修改交货日期、运输方式、税码 */
  public batchModify(element) {
    const materialArr = this.materialTableForm.get('materialArr') as FormArray;
    if (!materialArr.length) {
      return;
    }
    materialArr['controls'].forEach((item) => {
      item['controls'][element].patchValue(this.batchData[element]);
    });
    this.materialTableForm.get('materialArr')['controls'] = [...this.materialTableForm.get('materialArr')['controls']];
  }
  public onImport() {
    this.importErrMsgList = [];
    this.uploadModalService.showUploadModal({
      uploadUrl: `${environment.baseUrl.ps}/PurchaseQuota/import/${this.quotationId}`,
      title: '导入报价',
      okText: null,
      cancelText: null,
      maxFileNum: 1,
      fileType: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      addBtuText: '导入',
      modalWidth: 380,
      bottomTpl: this.uploadModalErrMsgTpl,
      onResponse: (resData) => {
        if (resData.code !== 0) {
          this.importErrMsgList = resData.value || [];
          return false;
        }
        return true;
      }
    });
  }
  ngOnInit() {
    this.editQuotationForm = this.formBuilder.group({
      quotationValidDate: [null, [Validators.required]],
      isAgreeForward: [null, [Validators.required]],
      contact: [null, [Validators.required]],
      contactTel: [null, [Validators.required, this.validService.mobileOrTeleValidator()]],
      currency: [null, [Validators.required]],
      quotationExplain: [null],
    });
    this.materialTableForm = this.formBuilder.group({
      materialArr: this.formBuilder.array([])
    });
    this.materialTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: false,
      frontPagination: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: []
    };
    this.enquiryDateConfig = [
      { name: '询价单号', field: 'enquiryCode' },
      { name: '标题', field: 'title' },
      { name: '询价日期', field: 'enquiryDate', pipe: 'date: yyyy-MM-dd' },
      { name: '报价截止日期', field: 'quotationDateEnd', pipe: 'date: yyyy-MM-dd' },
      { name: '询价要求', field: 'enquiryRequire', isFullSpan: true }
    ];
    this.getQuotationDetail();
    this.getDictData();
    this.getRateList();
    this.downTplUrl = `${environment.baseUrl.ps}/PurchaseQuota/export/${this.quotationId}`;
  }

}
