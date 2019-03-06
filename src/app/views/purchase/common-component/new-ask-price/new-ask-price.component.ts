import {Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {UfastValidatorsService} from '../../../../core/infra/validators/validators.service';
import {DictionaryService, DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';
import {SourcingInquiryNs, SourcingInquiryService} from '../../../../core/trans/purchase/sourcing-inquiry.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
enum MaxLenInput {
  Title = 200,
  InquireUserName = 50,
  InquireClaim = 400,
  RowRemark = 200,
  Default = 50
}
const InquireClaimText = '平台要求，展示默认数据；汇率说明';
@Component({
  selector: 'app-new-ask-price',
  templateUrl: './new-ask-price.component.html',
  styleUrls: ['./new-ask-price.component.scss']
})
export class NewAskPriceComponent implements OnInit {
  @Input()approvalId: string;
  @Input()isNew: boolean;
  @Input()inquiryId: string;
  @Input() isAgainAskPrice: boolean;
  @Output()finish: EventEmitter<any>;
  @ViewChild('transportWayTpl')transportWayTpl: TemplateRef<any>;
  @ViewChild('remarkTpl')remarkTpl: TemplateRef<any>;
  MaxLenInputEnum = MaxLenInput;
  orderForm: FormGroup;
  supplierTableConfig: UfastTableNs.TableConfig;
  materialRowTableConfig: UfastTableNs.TableConfig;
  supplierDataList: SourcingInquiryNs.InquirySupplierItem[];
  materialRowDataList: SourcingInquiryNs.InquiryMaterialRowItem[];
  transportList: DictionaryServiceNs.DictItemModel[];
  payMethodList: DictionaryServiceNs.DictItemModel[];
  orderInfo: SourcingInquiryNs.InquiryOrderDetail;
  constructor(private messageService: ShowMessageService, private formBuilder: FormBuilder,
              private ufastValidators: UfastValidatorsService, private dictService: DictionaryService,
              private inquiryService: SourcingInquiryService, private utilService: UfastUtilService) {
    this.finish = new EventEmitter<any>();
    this.supplierDataList = [];
    this.materialRowDataList = [];
    this.transportList = [];
    this.payMethodList = [];
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  private initInfo() {
    let handler = null;
    if (this.isNew) {
      handler = this.inquiryService.getInquiryNewData(this.approvalId);
    } else {
      handler = this.inquiryService.getInquiryDetail(this.inquiryId);
    }
    handler.subscribe((resData: SourcingInquiryNs.UfastHttpResT<any>) => {
      const tempInfo = {
        inquiryClaim: InquireClaimText
      };
      this.orderInfo = resData.value;
      if (this.isNew) {
        tempInfo['inquireDate'] = new Date();
      } else {
        this.orderInfo.inquireDate = new Date(this.orderInfo.inquireDate);
        this.orderInfo.quoteEndDate = new Date(this.orderInfo.quoteEndDate);
      }
      this.orderForm.patchValue(<any>this.orderInfo);
      this.orderForm.patchValue(tempInfo);
      this.supplierDataList = this.orderInfo.supplierVOS;
      this.materialRowDataList = this.orderInfo.detailVOS;
      this.materialRowDataList.forEach((item) => {
        item['_this'] = item;
      });
    });
  }
  private getDictData() {
    Observable.forkJoin([
      this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.PaymentMethod}),
      this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.TransportMethod})
    ]).subscribe((resData: any[]) => {
        const errorItem = resData.find(item => item.code !== 0);
        if (errorItem) {
          this.messageService.showToastMessage(errorItem.message, 'error');
          return;
        }
        this.payMethodList = resData[0].value;
        this.transportList = resData[1].value;
      }, (error) => {
        this.messageService.showToastMessage(error.message, 'error');
      });
  }
  private submitData(handler: Function) {
    Object.keys(this.orderForm.controls).forEach((key: string) => {
      this.orderForm.controls[key].markAsDirty();
      this.orderForm.controls[key].updateValueAndValidity();
    });
    if (this.orderForm.invalid) {
      this.messageService.showToastMessage('请填写正确的单据信息', 'warning');
      return null;
    }
    const submitData = Object.assign(this.orderInfo, this.orderForm.getRawValue());
    submitData.supplierVOS = this.supplierDataList;
    submitData.detailVOS = [];
    for (let i = 0, len = this.materialRowDataList.length; i < len; i++) {
      const temp = Object.assign({}, this.materialRowDataList[i]);
      temp['_this'] = undefined;
      if (!temp['transportMethod']) {
        this.messageService.showToastMessage(`第${temp.indexNo}行未选择运输方式`, 'warning');
        this.materialRowDataList[i]['transportError'] = true;
        return null;
      }
      submitData.detailVOS.push(temp);
    }
    handler.call(this.inquiryService, submitData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.finish.emit();
    });
  }
  public saveInfo() {
    this.submitData(this.inquiryService.saveInquiryOrder);
  }
  public confirmSend() {
    this.submitData(this.inquiryService.sendInquiryOrder);
  }
  public againSend() {
    this.submitData(this.inquiryService.againSendInquiry);
  }
  public onRowTransport(value, rowData) {
    rowData['transportError'] = false;
  }
  public exitPage() {
    this.finish.emit();
  }
  public disabledStartDate = (startDate: Date) => {
    if ((!this.isNew && !this.isAgainAskPrice) || !startDate) {
      return false;
    }
    return this.utilService.getEndDate(startDate.getTime()).getTime() <= new Date().getTime();
  }
  public disabledEndDate = (endDate: Date) => {
    const startDate = this.orderForm.get('inquireDate').value;
    if (!endDate || !startDate) {
      return false;
    }
    return endDate.getTime() <= this.utilService.getStartDate(startDate).getTime();
  }
  ngOnInit() {
    this.orderForm = this.formBuilder.group({
      inquiryNo: [{value: null, disabled: true}],
      title: [null, [Validators.maxLength(this.MaxLenInputEnum.Title), Validators.required]],
      inquireDate: [null, [Validators.required]],
      quoteEndDate: [null, [Validators.required]],
      inquireUserName: [{value: null, disabled: true}, [Validators.maxLength(this.MaxLenInputEnum.InquireUserName)]],
      inquireUserDept: [{value: null, disabled: true}],
      inquireUserPhone: [null, [this.ufastValidators.mobileValidator(), Validators.required]],
      inquiryMethod: [null, [Validators.required]],
      receiveQuoteFax: [null, [this.ufastValidators.mobileOrTeleValidator(), Validators.required]],
      inquiryClaim: [null, [Validators.maxLength(this.MaxLenInputEnum.InquireClaim)]],
      inquirySpecificClaim: [null, [Validators.maxLength(this.MaxLenInputEnum.InquireClaim)]],
      payMethod: [null, [Validators.required]],
      receiveQuoteAddress: [null, [Validators.maxLength(this.MaxLenInputEnum.Default)]]
    });
    this.materialRowTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'indexNo', width: 80},
        {title: '物料编码', field: 'materialNo', width: 150},
        {title: '物料名称', field: 'materialName', width: 180},
        {title: '属性描述', field: 'materialDesc', width: 180},
        {title: '技术参数', field: 'technicalParameters', width: 120},
        {title: '单位', field: 'unit', width: 80},
        {title: '数量', field: 'quantity', width: 100},
        {title: '需求时间', field: 'needDate', width: 120, pipe: 'date:yyyy-MM-dd'},
        {title: '使用单位', field: 'useOrgName', width: 140},
        {title: '运输方式', tdTemplate: this.transportWayTpl, width: 140, thClassList: ['required-sign']},
        {title: '品牌/厂家', field: 'brand', width: 140},
        {title: '备注', tdTemplate: this.remarkTpl, width: 180}
      ]
    };
    this.supplierTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '供应商编码', field: 'supplierNo', width: 100},
        {title: '供应商名称', field: 'supplierName', width: 170},
        {title: '联系方式', field: 'supplierContactPhone', width: 100},
      ]
    };
    this.getDictData();
    this.initInfo();
  }

}
