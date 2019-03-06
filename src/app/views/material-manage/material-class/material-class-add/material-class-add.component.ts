import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MaterialManageService, MaterialManageServiceNs } from '../../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
enum MaxLenInputEnum {
  Default = 50
}
@Component({
  selector: 'app-material-class-add',
  templateUrl: './material-class-add.component.html',
  styleUrls: ['./material-class-add.component.scss']
})
export class MaterialClassAddComponent implements OnInit {
  form: FormGroup;
  @Output() backToListPage: EventEmitter<any>;
  @Input() pId: string;
  @Input() dataItem: MaterialManageServiceNs.MaterialClassModel;
  @Input() materialType: number;
  @Input() categoryParent: string;
  @Input() level: number;
  maxLenInputEnum = MaxLenInputEnum;

  constructor(private fb: FormBuilder, private materialManageService: MaterialManageService,
    private messageService: ShowMessageService) {
    this.backToListPage = new EventEmitter<any>();
    this.pId = '0';
    this.dataItem = null;
  }

  back(): void {
    this.backToListPage.emit();
  }



  submitForm(): void {
    Object.keys(this.form.value).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });

    if (!this.form.valid) {
      return;
    }
    this.messageService.showLoading('正在提交');
    this.saveData();
  }

  saveData() {
    if (this.form.value.materialType) {
      this.form.value.materialType = Number(this.form.value.materialType);
    }

    const param: MaterialManageServiceNs.MaterialClassModel = this.form.getRawValue();
    param.pId = this.pId;
    param.level = this.level;
    let service: any = this.materialManageService.insertMaterialClass(param);

    if (!!this.dataItem) {
      const updataParam = { ...param, id: this.dataItem.id };
      service = this.materialManageService.updateMaterialClass(updataParam);
    }
    this.messageService.showLoading();
    service.subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.categoryParent = '';
      this.backToListPage.emit(true);
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message
        , 'error');
    });
  }
  getFormControl(name) {
    return this.form.controls[name];
  }
  isIncludesSpecialSymbol(control: FormControl): any {
    if (!control.value) {
      return true;
    }
    return (control.value.match('/')) ? { isIncludesSpecialSymbol: true } : null;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  ngOnInit() {
    if (this.materialType === null) {
      this.form = this.fb.group({
        materialType: [null, [Validators.required]],
        categoryParent: [{ value: null, disabled: true }],
        materialCalssName: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default), this.isIncludesSpecialSymbol]],
        materialClassDesc: [null, [Validators.maxLength(this.maxLenInputEnum.Default)]]
      });
    } else {
      this.form = this.fb.group({
        materialType: [{ value: this.materialType, disabled: true }],
        categoryParent: [{ value: this.categoryParent, disabled: true }],
        materialCalssName: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default)]],
        materialClassDesc: [null, [Validators.maxLength(this.maxLenInputEnum.Default)]]
      });
    }
    if (this.dataItem) {
      this.form = this.fb.group({
        materialType: [{ value: this.dataItem.materialType, disabled: true }],
        materialCalssName: [this.dataItem.materialCalssName, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default)]],
        materialClassDesc: [this.dataItem.materialClassDesc, Validators.maxLength(this.maxLenInputEnum.Default)]
      });
    }
  }

}
