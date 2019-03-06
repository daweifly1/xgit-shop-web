import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MaterialCurrCompComponent } from '../../material-curr-comp/material-curr-comp.component';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { MaterialManageService, MaterialManageServiceNs } from '../../../../core/trans/materialManage.service';
import { Observable } from 'rxjs/Observable';

enum MaterialTemplateType {
  Material = 1,
  DevicePart,
  Device,
  CommonDevicePart
}
@Component({
  selector: 'app-material-add',
  templateUrl: './material-add.component.html',
  styleUrls: ['./material-add.component.scss']
})
export class MaterialAddComponent implements OnInit {
  isSaved: boolean;
  formValue: any;

  @Output() backToListPage: EventEmitter<any>;
  @Input() id: string;
  @ViewChild('currComp')
  currComp: MaterialCurrCompComponent;
  MaterialTemplateTypeEnum = MaterialTemplateType;

  constructor(private materialManageService: MaterialManageService, private messageService: ShowMessageService) {
    this.isSaved = false;
    this.formValue = null;
    this.backToListPage = new EventEmitter<any>();
  }


  save(): void {
    this.formValue = this.currComp.outPutFormValue();
    // if (this.formValue.materialUserdNamesVOS.length === 1) {
    //   this.formValue.materialUserdNamesVOS = null;
    // }
    // this.formValue.materialUserdNamesVOS.forEach((item) => {
    //   if (item.materialTemplateUsedName)
    // })
    if (this.formValue) {
      if (this.formValue.materialClassId instanceof Array) {
        this.formValue.materialClassId = this.formValue.materialClassId[2];
      } else {
        // this.formValue.materialClassId = this.editMaterialClassId;
      }
      this.formValue.unit = this.formValue.unit;
      this.formValue.materialType = Number(this.formValue.materialType);
      const param: MaterialManageServiceNs.MaterialTempModel = this.formValue;
      if (param.materialType === this.MaterialTemplateTypeEnum.DevicePart) {
        param.materialClassId = '';
      }
      if (this.id === null) {
        // const param: MaterialManageServiceNs.MaterialTempModel = this.formValue;
        this.backFn(this.materialManageService.insertMaterialTempleteList(param));
      } else {
        // const param: MaterialManageServiceNs.MaterialTempModel = this.formValue;
        param.id = this.id;
        param.deviceTemplateId = this.formValue.deviceTemplateId;
        this.backFn(this.materialManageService.updateMaterialTempleteItem(param));
      }
    }
    this.isSaved = true;
  }

  back(): void {
    this.backToListPage.emit();
  }

  public backFn = (service: Observable<MaterialManageServiceNs.UfastHttpAnyResModel>) => {
    this.messageService.showLoading();
    service.subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.back();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit(): void {
    if (this.id) {
      const param = {
        id: this.id
      };
    }
  }
}
