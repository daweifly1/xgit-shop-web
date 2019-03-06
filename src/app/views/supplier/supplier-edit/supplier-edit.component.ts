import {Component, EventEmitter, OnInit, Output, Input, AfterViewInit, ViewChild, TemplateRef} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DictionaryService, DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {Observable} from 'rxjs/Observable';
import {SupplierInfoMaxInputLen} from '../../companyInfo/basic-info/basic-info.component';
import {UfastValidatorsService} from '../../../core/infra/validators/validators.service';
import {UploadModalService} from '../../../widget/upload-modal/upload-modal';
import {environment} from '../../../../environments/environment';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
import { ActionCode } from '../../../../environments/actionCode';
enum PageType {
  BasicInfoPage,
  ContactPage,
  QualFilePage,      // 资质文件
  ContractRecordPage,
  QualityRecordPage,
}
export interface SupplierEditEvent {
  basicInfo: any;
  contactList: any[];
  qualFileList: any[];
}

@Component({
  selector: 'app-supplier-edit',
  templateUrl: './supplier-edit.component.html',
  styleUrls: ['./supplier-edit.component.scss']
})
export class SupplierEditComponent implements OnInit, AfterViewInit {
  @Output() finish: EventEmitter<any>;
  @Input() basicInfo: any;
  /**
   * true：不允许修改社会信用代码
   * */
  @Input() fixedCreditCode: boolean;
  /**
   *点击提交事件
   * */
  @Output() submitEvent: EventEmitter<SupplierEditEvent>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  ProblemRecordType = SupplierInfoNs.ProblemRecordType;
  PageTypeEnum = PageType;
  currentPage: PageType;
  leftMenuList: {id: number; name: string; }[];
  ActionCode = ActionCode;
  infoForm: FormGroup;
  MaxInputLenEnum = SupplierInfoMaxInputLen;
  companyNatureList: DictionaryServiceNs.DictItemModel[];
  industryList: DictionaryServiceNs.DictItemModel[];
  supplierScopeList: DictionaryServiceNs.DictItemModel[];
  contactTableForm: FormGroup;
  qualFileTableForm: FormGroup;
  uploadUrl: string;
  downloadUrl: string;
  viewQualFileUrl: string;
  viewQualFielModalShow: boolean;
  qualFileType: SupplierInfoNs.CompanyTypeItem[];
  maxMoney = environment.otherData.moneyMax;
  companyTypeList: DictionaryServiceNs.DictItemModel[];
  constructor(private messageService: ShowMessageService, private supplierInfoService: SupplierInfoService,
              private formBuilder: FormBuilder, private dictService: DictionaryService, private uploadModalService: UploadModalService,
              private validorService: UfastValidatorsService, private utilService: UfastUtilService) {
    this.finish = new EventEmitter<any>();
    this.submitEvent = new EventEmitter<SupplierEditEvent>();
    this.leftMenuList = [
      {id: PageType.BasicInfoPage, name: '基本信息'},
      {id: PageType.ContactPage, name: '联系人信息'},
      {id: PageType.QualFilePage, name: '资质文件'},
      {id: PageType.ContractRecordPage, name: '合同履行不良记录'},
      {id: PageType.QualityRecordPage, name: '质量问题处理记录'},
    ];
    this.currentPage = this.PageTypeEnum.BasicInfoPage;
    this.companyNatureList = [];
    this.industryList = [];
    this.supplierScopeList = [];
    this.uploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.downloadUrl = environment.otherData.fileServiceUrl;
    this.viewQualFielModalShow = false;
    this.qualFileType = [];
    this.companyTypeList = [];
  }
  public quitDetailPage() {
    this.finish.emit();
  }
  public trackByItem (index: number, item: any) {
    return item;
  }
  public onSubmit() {
    Object.keys(this.infoForm.controls).forEach((key) => {
      this.infoForm.controls[key].markAsDirty();
      this.infoForm.controls[key].updateValueAndValidity();
    });
    if (this.infoForm.invalid) {
      this.messageService.showToastMessage('请完善基本信息', 'warning');
      return;
    }
    if (this.contactTableForm.invalid ) {
      this.messageService.showToastMessage('请填写正确的联系人信息', 'warning');
      return;
    }
    const contactArr = this.contactTableForm.get('contactArr') as FormArray;
    if (contactArr.length < 2) {
      this.messageService.showToastMessage('请至少添加两位联系人', 'warning');
      return;
    }
    if (this.qualFileTableForm.invalid) {
      this.messageService.showToastMessage('请填写正确的资质文件信息', 'warning');
      return;
    }
    const qualFileArr = this.qualFileTableForm.get('qualFileArr') as FormArray;
    const qualFileList = qualFileArr.getRawValue();
    let licenseNum = 0;
    let surveyTableNum = 0;
    qualFileList.forEach((item) => {
      licenseNum += item.credentialType === SupplierInfoNs.QualFileType.License ? 1 : 0;
      surveyTableNum += item.credentialType === SupplierInfoNs.QualFileType.SurveyTable ? 1 : 0;
    });
    if (licenseNum !== 1 || surveyTableNum !== 1) {
      this.messageService.showToastMessage('必须上传一份营业执照和一份调查表', 'warning');
      return;
    }
    const credentialTypeList = qualFileList.map((item) => {
      item.validityPeriodStart = this.utilService.getStartDate(item.validityPeriodStart);
      item.validityPeriodEnd = this.utilService.getEndDate(item.validityPeriodEnd);
      return item.credentialType;
    });
    if (credentialTypeList.indexOf(SupplierInfoNs.QualFileType.License) === -1 ||
      credentialTypeList.indexOf(SupplierInfoNs.QualFileType.SurveyTable) === -1) {
      this.messageService.showToastMessage('必须上传营业执照和调查表', 'warning');
      return;
    }
    this.messageService.showAlertMessage('', '确定提交当前信息?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const contactList = contactArr.getRawValue();
      contactList.forEach((item) => {
        item.isCommonlyUsed = item.isCommonlyUsed ? 1 : 0;
      });
      this.submitEvent.emit({
        basicInfo: this.infoForm.getRawValue(),
        contactList: contactList,
        qualFileList: qualFileList
      });
    });
  }
  /**
   * 获取数据字典
   * */
  private getDataDict() {
    const observerComNature = this.dictService.getDataDictionarySearchList({parentCode : DictionaryServiceNs.TypeCode.CompanyNature});
    const observerIndustry = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.SupplierIndustry});
    const observerSupply = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.SuppliyScope});
    const observerCompanyType = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.CompanyType});
    const tempList = [this.companyNatureList, this.industryList, this.supplierScopeList, this.companyTypeList];
    Observable.forkJoin(observerComNature, observerIndustry, observerSupply, observerCompanyType)
      .subscribe((resData: any[]) => {
        resData.forEach((item, index: number) => {
          tempList[index].length = 0;
          if (item.code !== 0) {
            this.messageService.showToastMessage(item.message, 'error');
          }
          tempList[index].push(...item.value);
        });
      }, (error) => {
        tempList.forEach((item) => {item.length = 0; });
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    this.supplierInfoService.getFileTypeList().subscribe((value) => {
      this.qualFileType = value;
    });
  }
  /**
   * 新增联系人
   * */
  public addContact() {
    const contactArr = this.contactTableForm.get('contactArr') as FormArray;
    contactArr.push(this.newContactForm());
  }
  private newContactForm(data?: any) {
    const form = this.formBuilder.group({
      name: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      position: [null, [Validators.maxLength(this.MaxInputLenEnum.Position)]],
      cellphone: [null, [Validators.required, this.validorService.mobileValidator()]],
      phone: [null, [this.validorService.telephoneValidator()]],
      fax: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      email: [null, [Validators.required, this.validorService.emailValidator()]],
      remark: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      isCommonlyUsed: [null],
      id: [undefined]
    });
    if (data) {
      form.patchValue(data);
    }
    return form;
  }
  /**
   * 新增资质文件
   * */
  private newQualFile(data?: any) {
    const form = this.formBuilder.group({
      credentialName: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      credentialType: [null, [Validators.required]],
      issuingAgency: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      remark: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      validityPeriodEnd: [null, [Validators.required]],
      validityPeriodStart: [null, [Validators.required]],
      fileUrl: [null, [Validators.required]],
      id: [undefined]
    });
    if (data) {
      form.patchValue(data);
    }
    return form;
  }
  public delContactRow(i) {
    const contactArr = this.contactTableForm.get('contactArr') as FormArray;
    contactArr.removeAt(i);
  }
  private getContactList() {
    this.supplierInfoService.getContactBySupplier(this.basicInfo.id)
      .subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        const contactArr = this.contactTableForm.get('contactArr') as FormArray;
        resData.value.forEach((item) => {
          item.isCommonlyUsed = item.isCommonlyUsed === 1 ? true : false;
          contactArr.push(this.newContactForm(item));
        });
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public changeTab(page: PageType) {
  }
  /**
   * 获取资质文件列表
   * */
  private getQualFileList() {
    this.supplierInfoService.getQualFileBySupplier(this.basicInfo.id)
      .subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        const qualFileArr = this.qualFileTableForm.get('qualFileArr') as FormArray;
        resData.value.forEach((item) => {
          item.validityPeriodEnd = new Date(item.validityPeriodEnd);
          item.validityPeriodStart = new Date(item.validityPeriodStart);
          qualFileArr.push(this.newQualFile(item));
        });
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  /**
   *新增一行资质文件
   * */
  public addQualFile() {
    const contactArr = this.qualFileTableForm.get('qualFileArr') as FormArray;
    contactArr.push(this.newQualFile());
  }
  public delQualFileRow(index: number) {
    const contactArr = this.qualFileTableForm.get('qualFileArr') as FormArray;
    contactArr.removeAt(index);
  }
  /**
   * 上传资质文件
   * */
  public uploadQualFiel(index: number) {
    const contactArr = this.qualFileTableForm.get('qualFileArr') as FormArray;
    this.uploadModalService.showUploadModal({
      title: '上传文件',
      maxFileNum: 1,
      fileType: ['application/pdf'],
      placeHolder: '注:只支持pdf类型文件'
    }).subscribe((resData) => {
      contactArr.at(index).patchValue({
        fileUrl: resData[0].value
      });
    });
  }
  /**
   * 预览资质文件
   * */
  public viewQualFiel(url: string) {
    this.viewQualFileUrl = this.downloadUrl + url;
    this.viewQualFielModalShow = true;
  }
  public cancelViewFile() {
    this.viewQualFielModalShow = false;
  }
  /**
   * 修改默认联系人*/
  public changeDefaultContact(value: boolean, index: number) {
    if (!value) {
      return;
    }
    const contactArr = this.contactTableForm.get('contactArr') as FormArray;
    contactArr.controls.forEach((item, itemIndex: number) => {
      if (index === itemIndex) {
        return;
      }
      item.patchValue({isCommonlyUsed: false});
    });
  }
  public onDefaultContact(event: Event, value: boolean) {
    if (value) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
  ngOnInit() {
    this.infoForm = this.formBuilder.group({
      bankOfDeposit: [null, [Validators.required]],
      bankOfDepositAccount: [null, [Validators.required]],   // 开户行帐号 ,
      bankOfDepositAddress: [null, [Validators.required]],   // 开户行地址 ,
      collectingBank: [null, [Validators.required]],   // 收款银行 ,
      collectingBankAccount: [null, [Validators.required]],   // 收款银行帐号 ,
      collectingBankAddress: [null, [Validators.required]],  // 收款银行地址 ,
      collectingBankLineNum: [null, [Validators.required]],   // 收款银行行号 ,
      companyNature: [null, [Validators.required]],   // 企业性质 ,
      companyType: [null, [Validators.required]],  // 企业类型 ,
      contactAddress: [null, [Validators.required]],   // 通讯地址 ,
      cooperationScope: [null, [Validators.required]],   // 合作范围 ,
      industry: [null],  // 所属行业 ,
      legalPerson: [null, [Validators.required]],   // 法人 ,
      name: [{value: null, disabled: this.fixedCreditCode}, [Validators.required]],   // 公司名称 ,
      postcode: [null, [Validators.required]],   // 邮编 ,
      profile: [null, [Validators.required]],   // 公司简介 ,
      registAreaCode: [null, [Validators.required]],   // 注册地区编码 ,
      registCapital: [null, [Validators.required]],  // 注册资本 ,
      registDetailsAddress: [null, [Validators.required]],   // 详细地址 ,
      scopeOfBusiness: [null, [Validators.required]],   // 经营范围 ,
      setUpDate: [null, [Validators.required]],   // 成立时间 ,
      socialCreditCode: [{value: null, disabled: this.fixedCreditCode}, [Validators.required]],   // 统一社会信用代码 ,
      website: [null],   // 公司网址 ,
      workAreaCode: [null, [Validators.required]],   // 办公地区编码 ,
      workDetailsAddress: [null, [Validators.required]],   // 工作详细地址
      // materialType: [null, [Validators.required]],      // 企业类别
      // proposedProduct: [null, [Validators.required]],    // 拟购产品
      // supplierSupply: [null, [Validators.required]],   // 供应范围
    });
    this.contactTableForm = this.formBuilder.group({
      contactArr: this.formBuilder.array([])
    });
    this.qualFileTableForm = this.formBuilder.group({
      qualFileArr: this.formBuilder.array([])
    });
    this.getDataDict();
    this.getContactList();
    this.getQualFileList();
  }
  ngAfterViewInit() {
    this.basicInfo.setUpDate = new Date(this.basicInfo.setUpDate);
    this.infoForm.patchValue(this.basicInfo);
  }
}
