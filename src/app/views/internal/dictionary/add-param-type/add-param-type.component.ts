import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DictionaryService, DictionaryServiceNs } from '../../../../core/common-services/dictionary.service';
import { UfastTableNs } from '../../../../layout/layout.module';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
enum MaxLenInputEnum {
  Default = 50
}
@Component({
  selector: 'app-add-param-type',
  templateUrl: './add-param-type.component.html',
  styleUrls: ['./add-param-type.component.scss']
})
export class AddParamTypeComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  paramTypeForm: FormGroup;
  InputMaxLen = MaxLenInputEnum;
  @Input() editData: any;

  constructor(private dictionaryService: DictionaryService, private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.finish = new EventEmitter();
  }
  public emitFinish() {
    this.finish.emit();
  }
  public submit() {
    Object.keys(this.paramTypeForm.controls).forEach((key: string) => {
      this.paramTypeForm.controls[key].markAsDirty();
      this.paramTypeForm.controls[key].updateValueAndValidity();
    });
    if (this.paramTypeForm.invalid) {
      return;
    }
    let submit = null;
    this.paramTypeForm.controls['pId'].patchValue('0');
    if (this.editData) {
      submit = this.dictionaryService.editParamType(this.paramTypeForm.value);
    } else {
      submit = this.dictionaryService.addParamType(this.paramTypeForm.value);
    }
    this.messageService.showLoading();
    submit.subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  ngOnInit() {

    this.paramTypeForm = this.formBuilder.group({
      code: [null, [Validators.required, Validators.maxLength(this.InputMaxLen.Default)]],
      name: [null, [Validators.required, Validators.maxLength(this.InputMaxLen.Default)]],
      groupName: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      remark: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      pId: [null],
    });
    if (this.editData) {
      this.paramTypeForm.patchValue(this.editData);
      this.paramTypeForm.controls['code'].disable();
      this.paramTypeForm.addControl('id', this.formBuilder.control(this.editData.id));
    } else {
      this.paramTypeForm.reset();
    }
  }

}
