import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {DeptService} from '../../../core/common-services/dept.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {ActionCode} from '../../../../environments/actionCode';
import {UfastValidatorsService} from '../../../core/infra/validators/validators.service';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-copper-company',
  templateUrl: './copper-company.component.html',
  styleUrls: ['./copper-company.component.scss']
})
export class CopperCompanyComponent implements OnInit {
  public editCompanyForm: FormGroup;
  public isEditCompany = false;
  public actionCode = ActionCode;
  public lengthLimit = {default: 50};

  constructor(private deptService: DeptService,
              private messageService: ShowMessageService,
              private formBuilder: FormBuilder,
              private validatorsService: UfastValidatorsService) { }

  private getLoginOrgInfo() {
    this.deptService.getLoginOrgInfo().subscribe((resData) => {
      Object.keys(this.editCompanyForm.controls).forEach((item) => {
        this.editCompanyForm.controls[item].patchValue(resData.value[item]);
      });
    });
  }
  public beginEditOrgInfo() {
    this.isEditCompany = true;
    this.disableCompanyForm(false);
  }
  private disableCompanyForm(bool) {
    if (bool) {
      Object.keys(this.editCompanyForm.controls).forEach((item) => {
        if (item === 'orgId') {
          return;
        }
        this.editCompanyForm.controls[item].disable();
      });
      return;
    }
    Object.keys(this.editCompanyForm.controls).forEach((item) => {
      if (item === 'orgId') {
        return;
      }
      this.editCompanyForm.controls[item].enable();
    });
  }
  public finishEditOrgInfo() {
    this.isEditCompany = false;
    this.disableCompanyForm(true);
    this.getLoginOrgInfo();
  }
  public editOrgInfo() {
    Object.keys(this.editCompanyForm.controls).forEach((key) => {
      this.editCompanyForm.controls[key].markAsDirty();
      this.editCompanyForm.controls[key].updateValueAndValidity();
    });
    if (this.editCompanyForm.invalid) {
      return;
    }
    const paramsData = this.editCompanyForm.getRawValue();
    this.deptService.editLoginOrgInfo(paramsData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.finishEditOrgInfo();
    });
  }
  private registrationValid = (control: FormControl) => Observable.create((observer: Observer<ValidationErrors>) => {
    const reg = new RegExp(/[0-9a-zA-Z]{18}/);
    const val = control.value;
    if (reg.test(val)) {
      observer.next(null);
      observer.complete();
    } else {
      observer.next({ error: true, registrationError: true});
      observer.complete();
    }
  })

  ngOnInit() {
    this.editCompanyForm = this.formBuilder.group({
      orgId: [{value: null, disabled: true}],
      code: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      shortName: [{value: null, disabled: true}, [Validators.maxLength(this.lengthLimit.default)]],
      organizationId: [{value: null, disabled: true}, [Validators.maxLength(this.lengthLimit.default)]],
      taxpayerRegistrationNumber: [{value: null, disabled: true}, [Validators.required], [this.registrationValid]],
      name: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      invoiceName: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      legalPerson: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      phone: [{value: null, disabled: true}, [Validators.required, this.validatorsService.mobileOrTeleValidator()]],
      postcode: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      addressCode: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      detailAddress: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      bankOfDeposit: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      bankOfDepositAccount: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.lengthLimit.default)]],
      bankOfDepositAddress: [{value: null, disabled: true}, [Validators.required]],
    });
    this.getLoginOrgInfo();
  }

}
