import {Component, OnInit, EventEmitter, Output, TemplateRef, ViewChild, Input, AfterViewInit} from '@angular/core';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {DictionaryService, DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {map, switchMap} from 'rxjs/operators';
import {UfastValidatorsService} from '../../../core/infra/validators/validators.service';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {environment} from '../../../../environments/environment';
export enum SupplierInfoMaxInputLen {
  BankOfDeposit = 50,   // 开户行 ,
  BankOfDepositAccount = 50,   // 开户行帐号 ,
  BankOfDepositAddress = 100,   // 开户行地址 ,
  CollectingBank = 50,   // 收款银行 ,
  CollectingBankAccount = 50,   // 收款银行帐号 ,
  CollectingBankAddress = 100,   // 收款银行地址 ,
  CollectingBankLineNum = 50,   // 收款银行行号 ,
  ContactAddress = 100,   // 通讯地址 ,
  CooperationScope = 100,   // 合作范围 ,
  LegalPerson = 50,
  Name = 50,
  Postcode = 10,
  Profile = 500,
  RegistDetailsAddress = 50,   // 详细地址 ,
  ScopeOfBusiness = 200, // 经营范围 ,
  SocialCreditCode = 18,   // 统一社会信用代码 ,
  Website = 100,   // 公司网址 ,
  WorkDetailsAddress = 100,   // 工作详细地址
  Default = 50,
  Position = 30,
  ProposedProduct = 200
}
enum PageType {
  BasicInfoPage,
  ContactPage,
  QualFilePage ,     // 资质文件,
  GradeInfoPage,
  ContractRecordPage,
  QualityRecordPage,
  InfoChangePage,
  HistoryFilePage
}
export interface SupplierEditEvent {
  basicInfo: any;
  contactList: any[];
}
enum ContactPageType {
  TablePage,
  EditPage,
  AddPage
}
@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit, AfterViewInit {
  basicInfo: any;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  PageTypeEnum = PageType;
  currentPage: PageType;
  ContactPageEnum = ContactPageType;
  contactPage: ContactPageType;
  leftMenuList: {id: number; name: string; }[];
  infoForm: FormGroup;
  MaxInputLenEnum = SupplierInfoMaxInputLen;
  companyNatureList: DictionaryServiceNs.DictItemModel[];
  industryList: DictionaryServiceNs.DictItemModel[];
  contactTableConfig: UfastTableNs.TableConfig;
  contactList: SupplierInfoNs.SupplierContact[];
  supplierScopeList: DictionaryServiceNs.DictItemModel[];
  contactForm: FormGroup;
  editContactId: string;
  basicIsEdit: boolean;
  infoFieldList: any[];
  supplierId: string;
  disableSubmit: boolean;
  ProblemRecordType =  SupplierInfoNs.ProblemRecordType;
  maxMoney = environment.otherData.moneyMax;
  companyTypeList: DictionaryServiceNs.DictItemModel[];
  constructor(private messageService: ShowMessageService, private supplierInfoService: SupplierInfoService,
              private formBuilder: FormBuilder, private dictService: DictionaryService,
              private validorService: UfastValidatorsService, private supplierManageService: SupplierManageService) {
    this.disableSubmit = true;
    this.contactList = [];
    this.infoFieldList = [];
    this.basicIsEdit = false;
    this.leftMenuList = [
      {id: PageType.BasicInfoPage, name: '基本信息'},
      {id: PageType.ContactPage, name: '联系人信息'},
      {id: PageType.QualFilePage, name: '资质文件'},
      {id: PageType.GradeInfoPage, name: '评级信息'},
      {id: PageType.ContractRecordPage, name: '合同履行不良记录'},
      {id: PageType.QualityRecordPage, name: '质量问题处理记录'},
      {id: PageType.InfoChangePage, name: '信息变更记录'},
      {id: PageType.HistoryFilePage, name: '历史文件'},
    ];
    this.currentPage = this.PageTypeEnum.BasicInfoPage;
    this.contactPage = this.ContactPageEnum.TablePage;
    this.contactList = [];
    this.companyNatureList = [];
    this.industryList = [];
    this.supplierScopeList = [];
    this.basicInfo = {};
    this.companyTypeList = [];
  }
  public changeTab(page: number) {
    this.basicIsEdit = false;
    this.contactPage = this.ContactPageEnum.TablePage;
    if (page === this.PageTypeEnum.BasicInfoPage) {
      this.getSupplierBasic();
      return;
    }
    if (page === this.PageTypeEnum.ContactPage) {
      this.getContactList();
      return;
    }
  }
  private submitCheckQualFiel() {
    return this.supplierInfoService.getTempQualFile(this.supplierId).pipe(switchMap((resData) => {
      if (resData.code !== 0) {
        return Observable.throw({message: resData.message});
      }
      resData.value = resData.value || [];
      const fileTypeList = resData.value.map(item => item.credentialType);
      if (fileTypeList.indexOf(SupplierInfoNs.QualFileType.License) === -1 ||
        fileTypeList.indexOf(SupplierInfoNs.QualFileType.SurveyTable) === -1) {
        return Observable.throw({message: '必须上传营业执照和调查表'});
      }
      return Observable.of('');
    }));
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public onSubmit() {
    if (!this.basicIsEdit) {
      this.infoForm.patchValue(this.basicInfo);
    }
    Object.keys(this.infoForm.controls).forEach((key) => {
      this.infoForm.controls[key].markAsDirty();
      this.infoForm.controls[key].updateValueAndValidity();
    });
    if (this.infoForm.invalid) {
      this.messageService.showToastMessage('请完善基本信息', 'warning');
      return Observable.throw;
    }
    if (this.contactList.length < 2) {
      this.messageService.showToastMessage('请至少添加两位联系人', 'info');
      return;
    }
    this.submitCheckQualFiel().pipe(switchMap(() => {
      return this.messageService.showAlertMessage('', '确定提交当前信息?', 'confirm').afterClose;
    })).subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const submitData = {
        // supplierBasicVO: this.basicInfo,
        // supplierContactVOS: this.contactList,
        supplierId: this.supplierId
      };
      this.messageService.showLoading('');
      this.supplierManageService.supplierUpdateInfo(submitData).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.getSupplierBasic();
      }, (error) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    }, (error) => {
      this.messageService.showToastMessage(error.message, 'info');
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
  }
  /**
   * 切换到新增联系人页面
   * */
  public addContact() {
    this.contactPage = this.ContactPageEnum.AddPage;
    this.contactPage = this.ContactPageEnum.AddPage;
    this.contactForm.get('isCommonlyUsed').enable();
    this.contactForm.reset();
    this.contactForm.patchValue({isCommonlyUsed: 1});
  }
  /**
   * 编辑联系人
   * */
  public editContact(id: string) {
    this.contactForm.reset();
    const selectedEditContact: any = this.contactList.find(item => item.id === id);
    this.editContactId = id;
    this.contactForm.patchValue(selectedEditContact);
    if (selectedEditContact.isCommonlyUsed) {
      this.contactForm.get('isCommonlyUsed').disable();
    } else {
      this.contactForm.get('isCommonlyUsed').enable();
    }
    this.contactPage = this.ContactPageEnum.EditPage;
  }
  /**
   * 保存联系人
   * */
  public saveContact() {
    Object.keys(this.contactForm.controls).forEach((item) => {
      this.contactForm.controls[item].markAsDirty();
      this.contactForm.controls[item].updateValueAndValidity();
    });
    const tempContact: SupplierInfoNs.SupplierContact = this.contactForm.getRawValue();
    if (this.contactForm.invalid) {
      return;
    }
    tempContact.supplierId = this.supplierId;
    let submitHandler = null;
    if (this.contactPage === this.ContactPageEnum.AddPage) {
      submitHandler = this.supplierInfoService.addTempContact(tempContact);
    } else {
      tempContact.id = this.editContactId;
      submitHandler = this.supplierInfoService.updateTempContact(tempContact);
    }
    this.messageService.showLoading('');
    submitHandler.subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.contactPage = this.ContactPageEnum.TablePage;
      this.getContactList();
      this.getSupplierBasic();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public cancelAddEdit() {
    this.contactPage = this.ContactPageEnum.TablePage;
  }
  public delContact(id: string) {
    this.messageService.showAlertMessage('', '确定删除该联系人吗?', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.supplierInfoService.delTempContact(id, this.supplierId).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getContactList();
          this.getSupplierBasic();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  private getContactList() {
    this.supplierInfoService.getTempSupplierContact(this.supplierId)
      .subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.contactList = resData.value || [];
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public onBasicEdit() {
    this.basicIsEdit = !this.basicIsEdit;
    this.basicInfo.setUpDate = this.basicInfo.setUpDate ? new Date(this.basicInfo.setUpDate) : null;
    this.infoForm.patchValue(this.basicInfo);
  }
  public onBasicCancel() {
    this.basicIsEdit = !this.basicIsEdit;
  }
  public saveBasicInfo() {
    Object.keys(this.infoForm.controls).forEach((key) => {
      this.infoForm.controls[key].markAsDirty();
      this.infoForm.controls[key].updateValueAndValidity();
    });
    if (this.infoForm.invalid) {
      this.messageService.showToastMessage('请完善基本信息', 'warning');
      return;
    }
    this.messageService.showLoading('');
    const newInfo = this.infoForm.getRawValue();
    newInfo['id'] = this.basicInfo.id;
    this.supplierInfoService.updateTempSupplierBasic(newInfo).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getSupplierBasic();
      this.basicIsEdit = false;
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public getSupplierBasic() {
    this.basicInfo = {};
    this.supplierInfoService.getTempSupplierBasic(this.supplierId).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.basicInfo = resData.value || {};
      this.basicInfo.registAddressAll = `${this.basicInfo.registAreaName ?
        this.basicInfo.registAreaName : ''} ${this.basicInfo.registDetailsAddress ? this.basicInfo.registDetailsAddress : ''}`;
      this.basicInfo.workAddressAll = `${this.basicInfo.workAreaName ?
        this.basicInfo.workAreaName : ''} ${this.basicInfo.workDetailsAddress ? this.basicInfo.workDetailsAddress : ''}`;
      this.infoForm.patchValue(this.basicInfo);
      this.disableSubmit = this.basicInfo['submitStatus'] === 1;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this.infoFieldList = [
      { field: 'name', name: '企业名称'},
      { field: 'companyNature', name: '企业性质'},
      { field: 'socialCreditCode', name: '统一社会信用代码'},
      { field: 'companyType', name: '企业类型'},
      { field: 'grade', name: '信用等级'},
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
      name: [{value: null, disabled: true}, [Validators.required]],   // 公司名称 ,
      postcode: [null, [Validators.required]],   // 邮编 ,
      profile: [null, [Validators.required]],   // 公司简介 ,
      registAreaCode: [null, [Validators.required]],   // 注册地区编码 ,
      registCapital: [null, [Validators.required]],  // 注册资本 ,
      registDetailsAddress: [null, [Validators.required]],   // 详细地址 ,
      scopeOfBusiness: [null, [Validators.required]],   // 经营范围 ,
      setUpDate: [null, [Validators.required]],   // 成立时间 ,
      socialCreditCode: [{value: null, disabled: true}, [Validators.required]],   // 统一社会信用代码 ,
      website: [null],   // 公司网址 ,
      workAreaCode: [null, [Validators.required]],   // 办公地区编码 ,
      workDetailsAddress: [null, [Validators.required]],   // 工作详细地址
      // materialType: [null, [Validators.required]],      // 企业类别
      // proposedProduct: [null, [Validators.required]],    // 拟购产品
      // supplierSupply: [null, [Validators.required]],   // 供应范围
    });
    this.contactForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      position: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Position)]],
      cellphone: [null, [Validators.required, this.validorService.mobileValidator()]],
      phone: [null, [this.validorService.telephoneValidator()]],
      fax: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      email: [null, [Validators.required, this.validorService.emailValidator()]],
      remark: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      isCommonlyUsed: [null]
    });
    this.contactTableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 150, fixed: true},
        { title: '名称', field: 'name', width: 100},
        { title: '职务', field: 'position', width: 100},
        { title: '手机', field: 'cellphone', width: 100},
        { title: '电话', field: 'phone', width: 100},
        { title: '传真', field: 'fax', width: 100},
        { title: '邮箱', field: 'email', width: 100},
        { title: '常用联系人', field: 'isCommonlyUsed', width: 100, pipe: 'commonlyUser'},
        { title: '备注', field: 'remark', width: 100},
      ]
    };
    this.getDataDict();
    this.messageService.showLoading('');
    this.supplierInfoService.getLoginerBasicInfo().subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.supplierId = resData.value;
      this.getSupplierBasic();
      this.getContactList();
    }, () => {
      this.messageService.closeLoading();
    });
  }
  ngAfterViewInit() {
    this.infoForm.patchValue(this.basicInfo);
  }

}
