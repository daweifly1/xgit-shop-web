import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { BillTypeService, BillTypeServiceNs } from '../../../../../core/trans/billType.service';
import { UfastValidatorsService } from '../../../../../core/infra/validators/validators.service';
enum MaxLenInputEnum {
  InnerOrder = 30,
  InnerOrderNote = 50
}
@Component({
  selector: 'app-add-bill',
  templateUrl: './add-bill.component.html',
  styleUrls: ['./add-bill.component.scss']
})
export class AddBillComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;
  // inOrOutType: string; /**出入库类型 */
  FormGroup: FormGroup;
  controlArray: Array<{ id: number, controlInstance: string, controlInstanceNum: string }> = [];
  /**是否传erp */
  isSync: number;

  DeptForm: FormGroup;


  constructor(private formBuilder: FormBuilder,
    private messageService: ShowMessageService,
    private billTypeService: BillTypeService,
    private ufastValidatorsService: UfastValidatorsService) {
    this.finish = new EventEmitter<any>();

    this.isSync = 0;
  }
  public isSynsChange(event) {
    if (event) {
      this.DeptForm.addControl('deptArr', this.formBuilder.array([]));
      this.addDept();
      this.FormGroup.addControl('erpBillTypeCode', this.formBuilder.control(null,
        [Validators.maxLength(this.maxLenInputEnum.InnerOrder), this.ufastValidatorsService.blankValidator()]));
      this.FormGroup.addControl('erpBillTypeName', this.formBuilder.control(null,
        [Validators.required, Validators.maxLength(this.maxLenInputEnum.InnerOrder), this.ufastValidatorsService.blankValidator()]));
    } else {
      this.FormGroup.removeControl('erpBillTypeCode');
      this.FormGroup.removeControl('erpBillTypeName');
      this.DeptForm.removeControl('deptArr');
    }
  }
  addDept(): void {

    const deptArr = this.DeptForm.get('deptArr') as FormArray;
    deptArr.push(this.newDeptForm());
  }
  public newDeptForm(data?: any) {
    const form = this.formBuilder.group({
      innerOrder: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.InnerOrder), this.isIncludesChinese]],
      innerOrderNote: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.InnerOrderNote)]]
    });
    if (data) {
      form.patchValue(data);
    }
    return form;
  }
  delDept(i): void {
    const deptArr = this.DeptForm.get('deptArr') as FormArray;
    deptArr.removeAt(i);
  }

  public emitFinish() {
    this.finish.emit();
  }

  public submitBillType() {
    Object.keys(this.FormGroup.controls).filter(
      item => typeof this.FormGroup.controls[item].value === 'string').forEach((key: string) => {
        this.FormGroup.controls[key].patchValue(this.FormGroup.controls[key].value.trim());
      });
    Object.keys(this.FormGroup.controls).forEach((keys: string) => {
      this.FormGroup.controls[keys].markAsDirty();
      this.FormGroup.controls[keys].updateValueAndValidity();
    });
    if (this.isSync) {
      const arr: FormArray = this.DeptForm.get('deptArr') as FormArray;
      const len = arr.length;
      for ( let i = 0; i < len; i++) {
        const innerOrderData = arr.at(i);
        Object.keys(innerOrderData).forEach((keys: string) => {
          if (keys === 'controls') {
            Object.keys(innerOrderData[keys]).forEach((key: string) => {
              innerOrderData[keys][key].markAsDirty();
              innerOrderData[keys][key].updateValueAndValidity();
            });
            return;
          }
        });
      }
    }
    if (this.FormGroup.invalid) {
      return;
    }
    if (this.DeptForm.invalid) {
      return;
    }
    const detailList: any[] = [];
    let data = <any>{};
    if (this.isSync) {
      this.DeptForm.controls['deptArr'].value.forEach((item) => {
        detailList.push({
          innerOrder: item.innerOrder,
          innerOrderNote: item.innerOrderNote
        });
      });
      data = {
        detailList: detailList,
        isSynsap: this.isSync,
        type: this.FormGroup.controls['type'].value,
        erpBillTypeCode: this.FormGroup.controls['erpBillTypeCode'].value,
        erpBillTypeName: this.FormGroup.controls['erpBillTypeName'].value,
      };
    } else {
      data = {
        detailList: detailList,
        isSynsap: this.isSync,
        type: this.FormGroup.controls['type'].value,

      };
    }

    // if (!detailList.length) {
    //   this.messageService.showToastMessage('部门不能为空', 'error');
    //   return;
    // }
    let submit: any;
    if (this.detailId) {
      data.id = this.detailId;
      if (!this.isSync) {
        data.erpBillTypeCode = '';
        data.erpBillTypeName = '';
      }
      submit = this.billTypeService.updateBillType(data);
    } else {
      submit = this.billTypeService.addBillType(data);
    }
    this.subFunc(submit);
  }
  public subFunc(submit) {
    this.messageService.showLoading();
    submit.subscribe((resData: BillTypeServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  public getBillTypeDetail() {
    this.messageService.showLoading();
    this.billTypeService.getBillTypeDetail(this.detailId).subscribe((resData: BillTypeServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.FormGroup.controls['type'].patchValue(resData.value.type);
      this.isSync = resData.value.isSynsap;
      if (this.isSync) {
        this.FormGroup.addControl('erpBillTypeCode', this.formBuilder.control(null,
          [Validators.maxLength(this.maxLenInputEnum.InnerOrder), this.ufastValidatorsService.blankValidator()]));
        this.FormGroup.addControl('erpBillTypeName', this.formBuilder.control(null,
          [Validators.required, Validators.maxLength(this.maxLenInputEnum.InnerOrder), this.ufastValidatorsService.blankValidator()]));
        this.FormGroup.patchValue({
          erpBillTypeCode: resData.value.erpBillTypeCode,
          erpBillTypeName: resData.value.erpBillTypeName
        });
        resData.value.detailList.forEach((item) => {
          const deptArr = this.DeptForm.get('deptArr') as FormArray;
          deptArr.push(this.newDeptForm(item));
        });
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  getFormControl(name) {
    return this.FormGroup.controls[name];
  }
  isIncludesChinese(control: FormControl): any {
    if (!control.value) {
      return true;
    }
    const reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return (reg.test(control.value)) ? { isIncludesChinese: true } : null;
  }


  ngOnInit() {
    this.FormGroup = this.formBuilder.group({
      type: [null, [Validators.required, this.ufastValidatorsService.blankValidator()]],
      isSynsap: [null]
    });
    this.DeptForm = this.formBuilder.group({
      deptArr: this.formBuilder.array([])
    });
    if (this.isSync) {
      this.FormGroup.addControl('deptArray', this.formBuilder.array([], Validators.required));
    }
    // this.addField();
    if (this.detailId) {
      this.getBillTypeDetail();
    }
  }

}
