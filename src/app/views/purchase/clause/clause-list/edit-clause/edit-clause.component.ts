import { ShowMessageService } from './../../../../../widget/show-message/show-message';
import { ContractClauseListService, ContractClauseListServiceNs } from './../../../../../core/trans/purchase/contract-clause-list.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UfastValidatorsService } from '../../../../../core/infra/validators/validators.service';
import { UfastTableNs } from '../../../../../layout/layout.module';
enum ClauseType {
  ApprovalForm = 1,
  ExaminationTable,
  Contract
}
enum InputMaxLengthEnum {
  Default = 50,
  ClauseNo = 10,
  Seq = 4
}
@Component({
  selector: 'app-edit-clause',
  templateUrl: './edit-clause.component.html',
  styleUrls: ['./edit-clause.component.scss']
})
export class EditClauseComponent implements OnInit {
  @Input() detailId: string;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  public editClauseForm: FormGroup;
  ClauseType = ClauseType;
  public isContractType: boolean;
  InputMaxLength = InputMaxLengthEnum;
  tableConfig: UfastTableNs.TableConfig;

  constructor(private formBuilder: FormBuilder,
    private clauseListService: ContractClauseListService,
    private messageService: ShowMessageService,
    private ufastValidatorsService: UfastValidatorsService) {
    this.isContractType = true;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  addClause(): void {
    const clauseArr = this.editClauseForm.get('clauseArr') as FormArray;
    clauseArr.push(this.newClauseForm());
    this.editClauseForm.get('clauseArr')['controls'] = [...this.editClauseForm.get('clauseArr')['controls']];

  }
  public newClauseForm(data?: any) {
    const form = this.formBuilder.group({
      id: [null],
      parentId: [null],
      // useType: [null, Validators.required],
      // purchaseMethod: [null, Validators.required],
      seq: [null, [Validators.required, Validators.maxLength(this.InputMaxLength.Default), this.ufastValidatorsService.onlyNumber()]],
      content: [null, [Validators.required, Validators.maxLength(this.InputMaxLength.Default)]],
      remarks: [null],
    });
    if (data) {
      form.patchValue(data);
    }
    return form;
  }
  delClause(i): void {
    const clauseArr = this.editClauseForm.get('clauseArr') as FormArray;
    const index = (this.tableConfig.pageNum - 1) * this.tableConfig.pageSize + i;
    clauseArr.removeAt(index);
    this.editClauseForm.get('clauseArr')['controls'] = [...this.editClauseForm.get('clauseArr')['controls']];
  }

  public handleTypeChange(event) {
    if (event === ClauseType.Contract) {
      this.isContractType = false;
      this.editClauseForm.removeControl('purchaseMethod');
    } else {
      this.isContractType = true;
      this.editClauseForm.addControl('purchaseMethod', this.formBuilder.control(null, Validators.required));
    }
  }
  public getClauseTemplateDetail() {
    this.clauseListService.getClauseItem(this.detailId).subscribe((resData: ContractClauseListServiceNs.UfastHttpResT<any>) => {
      this.editClauseForm.patchValue(resData.value);
      const clauseArr = this.formBuilder.array([]);
      resData.value.details.forEach((item) => {
        clauseArr.push(this.newClauseForm(item));
      });
      this.editClauseForm.setControl('clauseArr', clauseArr);
    });
  }
  public saveClause() {
    Object.keys(this.editClauseForm.controls).filter(
      item => typeof this.editClauseForm.controls[item].value === 'string').forEach((key: string) => {
        this.editClauseForm.controls[key].patchValue(this.editClauseForm.controls[key].value.trim());
      });
    Object.keys(this.editClauseForm.controls).forEach((keys: string) => {
      this.editClauseForm.controls[keys].markAsDirty();
      this.editClauseForm.controls[keys].updateValueAndValidity();
    });
    const clauseArr: FormArray = this.editClauseForm.get('clauseArr') as FormArray;
    for (let i = 0; i < clauseArr.length; i++) {
      const clauseData = clauseArr.at(i);
      Object.keys(clauseData).forEach((keys: string) => {
        if (keys === 'controls') {
          Object.keys(clauseData[keys]).forEach((key: string) => {
            clauseData[keys][key].markAsDirty();
            clauseData[keys][key].updateValueAndValidity();
          });
          return;
        }
      });
    }
    for (let i = 0; i < clauseArr.length - 1 ; i++) {
      const clauseData = clauseArr.at(i);
      for (let j = i + 1; j < clauseArr.length; j++) {
        const clauseDataNext = clauseArr.at(j);
        if (Number(clauseData['controls']['seq'].value) === Number(clauseDataNext['controls']['seq'].value)) {
          this.messageService.showToastMessage('款序号不能重复', 'error');
          return;
        }
      }
    }
    if (this.editClauseForm.invalid) {
      this.messageService.showToastMessage('请正确填写条款信息', 'error');
      return;
    }
    let submitData = <any>{};
    const formData = this.editClauseForm.getRawValue();
    submitData = {
      useType: formData.useType,
      clauseNo: formData.clauseNo,
      seq: formData.seq,
      purchaseMethod: formData.purchaseMethod,
      content: formData.content,
      details: formData.clauseArr
    };
    if (this.detailId) {
      submitData.id = this.detailId;
      this.saveFun(this.clauseListService.editClauseList(submitData));
    } else {
      this.saveFun(this.clauseListService.addClauseList(submitData));
    }
  }
  public saveFun(submitHandle) {
    submitHandle.subscribe((resData: ContractClauseListServiceNs.UfastHttpResT<any>) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitPage();
    });
  }
  getFormControl(name) {
    return this.editClauseForm.controls[name];
  }
  public emitPage() {
    this.backToMainPage.emit();
  }
  ngOnInit() {
    this.tableConfig = {
      checkAll: false,
      pageSize: 10,
      pageNum: 1,
      showCheckbox: false,
      showPagination: true,
      frontPagination: true,
      loading: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      headers: []
    };
    this.editClauseForm = this.formBuilder.group({
      useType: [null, Validators.required],
      clauseNo: [null, [Validators.required, this.ufastValidatorsService.onlyNumber()]],
      seq: [null, [Validators.required, this.ufastValidatorsService.onlyNumber()]],
      purchaseMethod: [null, Validators.required],
      content: [null, Validators.required],
      clauseArr: this.formBuilder.array([])
    });
    this.addClause();
    if (this.detailId) {
      this.getClauseTemplateDetail();
    }
  }

}
