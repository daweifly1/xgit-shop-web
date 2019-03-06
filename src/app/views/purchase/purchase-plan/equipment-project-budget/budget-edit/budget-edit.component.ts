import { UfastValidatorsService } from './../../../../../core/infra/validators/validators.service';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, ValidationErrors} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
import {PurchaseService, PurchaseServiceNs} from '../../../../../core/trans/purchase.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {DictionaryService, DictionaryServiceNs} from '../../../../../core/common-services/dictionary.service';
import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'app-budget-edit',
  templateUrl: './budget-edit.component.html',
  styleUrls: ['./budget-edit.component.scss']
})
export class BudgetEditComponent implements OnInit {
  @Output() goBackToMainPage: EventEmitter<any>;
  @Input() projectId: any;
  public budgetEditValidateForm: FormGroup;
  private paramsData = {};
  private paramsKeys = ['id', 'projectCode', 'projectName', 'beginYear', 'belongYear', 'totalInvest',
    'managerDepartment', 'projectType', 'availableInvest', 'remark', 'managerDepartmentId', 'projectTypeId',
    'projectTypeCode', 'seqNo'];
  public budgetItemMap = this.purchaseService.budgetDataMap;
  public orgList = [];
  public projectTypeList = [];
  public projectDeptList = [];
  public textLength = {
    default: 50,
    code: 20,
    typeCode: 3,
    seqNo: 2,
  };
  public decimals = {
    precision: environment.otherData.materialNumDec,
    min: environment.otherData.materialNumMin,
    max: environment.otherData.materialNumMax
  };
  constructor(private formBuilder: FormBuilder,
              private ufastUtilService: UfastUtilService,
              private purchaseService: PurchaseService,
              private messageService: ShowMessageService,
              private dictionaryService: DictionaryService,
            private ufastValidatorsService: UfastValidatorsService) {
    this.goBackToMainPage = new EventEmitter<any>();
  }
  private getProjectTypeList() {
    this.purchaseService.getProjectTypeList().subscribe((resData) => {
      this.projectTypeList = resData.value || [];
    });
  }
  private getProjectDeptList() {
    this.purchaseService.getProjectDeptList().subscribe((resData) => {
      this.projectDeptList = resData.value || [];
    });
  }
  private getOrgList() {
    this.purchaseService.getOrgList().then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.budgetEditValidateForm.controls['orgName'].patchValue(resData.value ? resData.value.name : '');
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private getBudgetDetail() {
    this.purchaseService.getPurchaseBudgetItem(this.projectId).then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      Object.keys(this.budgetEditValidateForm.controls).forEach((key) => {
        this.budgetEditValidateForm.controls[key].patchValue(resData.value[this.budgetItemMap[key].key]);
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private beforeSubmit() {
    for (const key in this.budgetEditValidateForm.controls) {
      if (this.budgetEditValidateForm.controls[key]) {
        this.budgetEditValidateForm.controls[key].markAsDirty();
        this.budgetEditValidateForm.controls[key].updateValueAndValidity();
      }
    }
    if (this.budgetEditValidateForm.invalid) {
      return false;
    }
    const availableInvest = this.budgetEditValidateForm.get('availableInvest').value || 0;
    const inPlanInvest = this.budgetEditValidateForm.get('inPlanInvest').value || 0;
    const totalInvest = this.budgetEditValidateForm.get('totalInvest').value || 0;
    const isInvestInvalid = parseFloat(totalInvest) < this.ufastUtilService.add(availableInvest, inPlanInvest);
    if (totalInvest === 0) {
      this.messageService.showToastMessage('项目总投资不可为0', 'error');
      return;
    }
    if (isInvestInvalid) {
      this.messageService.showToastMessage('项目总投资额不得小于可用投资额和已提报投资额', 'error');
      return false;
    }
    const belongYear = this.budgetEditValidateForm.get('belongYear').value || '';
    const beginYear = this.budgetEditValidateForm.get('beginYear').value || '';
    const isYearInvalid = parseFloat(beginYear) > parseFloat(belongYear);
    if (isYearInvalid) {
      this.messageService.showToastMessage('所属年份不得小于起始年份', 'error');
      return false;
    }
    this.paramsKeys.forEach((key) => {
      if (key === 'id') {
        this.paramsData[this.budgetItemMap[key].key] = this.projectId || '';
        return;
      }
      this.paramsData[this.budgetItemMap[key].key] = this.budgetEditValidateForm.controls[key].value;
    });
    return true;
  }
  public saveProjectBudget() {

    if (!this.beforeSubmit()) {
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.savePurchaseBudget(this.paramsData).then((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('保存成功', 'success');
      this.emitPage(true);
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public submitProjectBudget() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.submitPurchaseBudget(this.paramsData).then((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('提交成功', 'success');
      this.emitPage(true);
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public emitPage(refresh) {
    this.resetForm();
    this.goBackToMainPage.emit(refresh);
  }
  private resetForm(): void {
    this.budgetEditValidateForm.reset();
    for (const key in this.budgetEditValidateForm.controls) {
      if (this.budgetEditValidateForm[key]) {
        this.budgetEditValidateForm.controls[key].markAsPristine();
        this.budgetEditValidateForm.controls[key].updateValueAndValidity();
      }
    }
  }
  private yearFormatValidate = (control: FormControl) => Observable.create((observer: Observer<ValidationErrors>) => {
    const yearReg = new RegExp(/[0-9]{4}/);
    const yearVal = control.value || '';
    if (yearVal.length === 4 && yearReg.test(yearVal)) {
      observer.next(null);
      observer.complete();
    } else {
      observer.next({ error: true, formatError: true});
      observer.complete();
    }
  })
  private codeFormatValidate = (control: FormControl) => Observable.create((observer: Observer<ValidationErrors>) => {
    const codeReg = new RegExp(/^[0-9a-zA-Z]+$/);
    if (codeReg.test(control.value)) {
      observer.next(null);
      observer.complete();
    } else {
      observer.next({ error: true, codeError: true});
      observer.complete();
    }
  })
  public trackByItem(index: number, item: any) {
    return item;
  }
  public typeChange(event) {
    let types = <any>{};
    types = this.projectTypeList.filter((item) => {
      return item.code === event;
    });
    if (types.length === 0) {
      return;
    }
    this.budgetEditValidateForm.patchValue({
      projectType: types[0].name
    });
  }
  public deptChange(event) {
    let dept = <any>{};
    dept = this.projectDeptList.filter((item) => {
      return item.code === event;
    });
    if (dept.length === 0) {
      return;
    }
    this.budgetEditValidateForm.patchValue({
      managerDepartment: dept[0].name
    });
  }
  ngOnInit() {
    this.budgetEditValidateForm = this.formBuilder.group({
      orgName: [{value: '', disabled: true}],
      projectCode: [{ value: '系统生成', disabled: true }, [Validators.required, Validators.maxLength(this.textLength.code)]
      , [this.codeFormatValidate]],
      projectName: ['', [Validators.required, Validators.maxLength(this.textLength.default)]],
      beginYear: ['', [Validators.required], [this.yearFormatValidate]],
      belongYear: ['', [Validators.required], [this.yearFormatValidate]],
      totalInvest: ['', [Validators.required]],
      managerDepartmentId: ['', [Validators.required]],
      managerDepartment: ['', [Validators.maxLength(this.textLength.default)]],
      projectTypeId: ['', [Validators.required]],
      projectType: ['', [Validators.required]],
      projectTypeCode: ['', [Validators.required], [this.codeFormatValidate]],
      seqNo: ['', [Validators.required, this.ufastValidatorsService.onlyNumber()]],
      inPlanInvest: [{value: '', disabled: true}],
      availableInvest: ['', [Validators.required]],
      remark: ['', [Validators.maxLength(this.textLength.default)]]
    });
    console.log(this.budgetEditValidateForm);
    this.getProjectTypeList();
    this.getProjectDeptList();
    this.getOrgList();
    if (this.projectId) {
      this.getBudgetDetail();
    }
  }

}
