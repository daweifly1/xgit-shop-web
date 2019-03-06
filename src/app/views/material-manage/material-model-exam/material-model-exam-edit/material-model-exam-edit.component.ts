import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { MaterialManageService, MaterialManageServiceNs } from '../../../../core/trans/materialManage.service';
import { DictionaryService, DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';
enum MaterialType {
  Material,
  SparePart,
  Equipment
}
enum MaterialTemplateType {
  Material = 1,
  DevicePart,
  Device,
  CommonDevicePart
}
@Component({
  selector: 'app-material-model-exam-edit',
  templateUrl: './material-model-exam-edit.component.html',
  styleUrls: ['./material-model-exam-edit.component.scss']
})
export class MaterialModelExamEditComponent implements OnInit {
  @ViewChild('beforeUseTable') beforeUseTable: TemplateRef<any>;
  @Input() id: string;
  @Output() finish: EventEmitter<any>;
  isSparePart: boolean;
  choosedEquipmentList: any[];
  itemData: any;
  form: FormGroup;
  beforeNameIndex: number;
  materialClassArry: any[];

  beforeNameDataSet: {
    materialTemplateUsedName: string
  }[];
  unitList: any[];
  editMaterialClassId: string;
  MaterialTemplateTypeEnum = MaterialTemplateType;
  constructor(private fb: FormBuilder, private materialManageService: MaterialManageService, private messageService: ShowMessageService,
    private dictionaryService: DictionaryService) {
    this.finish = new EventEmitter<any>();
    this.id = '';
    this.beforeNameIndex = 1;
    this.materialClassArry = [];
    this.itemData = null;
    this.beforeNameDataSet = [
      {
        materialTemplateUsedName: ''
      }
    ];
    this.isSparePart = false;
    this.choosedEquipmentList = [];
    this.editMaterialClassId = '';
  }
  public getUnitList() {
    this.unitList = [];
    this.messageService.showLoading();
    const data = {
      parentCode: DictionaryServiceNs.TypeCode.FactoryUnit
    };
    this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.unitList = resData.value;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  getFormControl(name) {
    return this.form.controls[name];
  }

  isSelectedThirdClass(control: FormControl): any {
    if (!control.value) {
      return true;
    }
    return (control.value.length < 3) ? { isSelectedThird: true } : null;
  }

  selectMaterialClassItem(selectedItem) {
    if (selectedItem.option.isLeaf) {
      return;
    }
    selectedItem.option.children.shift();
    this.getMaterialClass(selectedItem.option.value, selectedItem.option.children, this.isSparePart);
  }


  showMaterialClass(value) {
    if (this.form.value.materialType === null) {
      this.messageService.showToastMessage('请先选择物料类别', 'warning');
      return;
    }
    if (value) {
      this.getMaterialClass('0', undefined, this.isSparePart);
    }
  }


  getMaterialClass(pId?: string, materialClassArry?: any[], isSparePart?: boolean) {
    const param: { pId: string, materialType?: number } = { pId: pId };
    if (isSparePart) {
      param.materialType = this.MaterialTemplateTypeEnum.DevicePart;
    }
    let data = {};
    // if (this.form.value.materialType === 1) {
    //   data = {
    //     pId: pId,
    //     materialType: 0
    //   };
    // } else {
    //   data = {
    //     pId: pId,
    //     materialType: 1
    //   };
    // }
    data = {
      pId: pId,
      materialType: this.form.controls['materialType'].value
    };
    this.messageService.showLoading();
    this.materialManageService.getMaterialClassListNoPage(data).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      const tempList = materialClassArry || [];
      resData.value.forEach((item) => {
        const materialClassObj: any = {};
        materialClassObj.value = item.id;
        materialClassObj.label = item.materialCalssName;
        if (item.childCount < 1) {
          materialClassObj.isLeaf = true;
        } else {
          materialClassObj.children = [{}];
        }
        tempList.push(materialClassObj);
      });
      if (!materialClassArry) {
        this.materialClassArry = tempList;
      }
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  public onChanges(values: any): void {
    if (values === null) {
      return;
    }
    this.isSparePart = true;
    if (this.isSparePart) {
      if (values.length !== 3) {
        return;
      }
      this.getMaterialEquipmentList(values);
    }
  }

  getDataItem() {
    this.messageService.showLoading();

    this.materialManageService.getMaterialTempleteReportItem({ id: this.id }).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.itemData = resData.value;
      this.form.patchValue(this.itemData);
      this.editMaterialClassId = this.itemData.materialClassId;
      // this.form.controls['materialClassId'].patchValue(this.itemData.firstLevel
      //   + '/' + this.itemData.secondLevel + '/' + this.itemData.thirdLevel);
        this.form.controls['materialClassId'].patchValue(this.itemData.fullClassName);
      this.beforeNameDataSet = this.itemData.materialUserdNamesVOS;
      this.form.patchValue({
        unit: resData.value.unit,
        unitCode: resData.value.unitCode
      });
      // this.getMaterialEquipmentList(this.editMaterialClassId);
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  getMaterialEquipmentList(id) {
    this.choosedEquipmentList = [];
    const selectMaterialClass = this.form.controls['materialClassId'];
    const data = <any>{};
    if (id instanceof Array) {
      // data.firstType = id[0];
      // data.secondType = id[1];
      // data.thirdType = id[2];
      data.materialClassId = id[2];
    }
    this.messageService.showLoading();
    this.materialManageService.getMaterialEquimentList(data).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      const tempArray = resData.value;
      for (let i = 0, len = tempArray.length; i < len; i++) {
        this.choosedEquipmentList = [...this.choosedEquipmentList, { label: tempArray[i].materialName, value: tempArray[i].id }];
      }
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  changeMaterialType(value: any) {
    this.materialClassArry = [];
    this.form.patchValue({
      materialClassId: null
    });
    this.getMaterialClass(this.form.value.materialType);
    if (value === this.MaterialTemplateTypeEnum.DevicePart) {
      this.isSparePart = true;
    } else {
      this.isSparePart = false;
    }
  }

  public trackByNewsId(index: number, item: any) {
    return item.id;
  }

  /*曾用名table相关方法*/
  addRow(): void {
    this.beforeNameIndex++;
    this.beforeNameDataSet = [...this.beforeNameDataSet, {
      materialTemplateUsedName: ``
    }];
  }

  deleteRow(i: number): void {
    this.beforeNameDataSet = this.beforeNameDataSet.filter((item, index, array) => {
      return i !== index;
    });
  }

  public save() {
    if (this.form.controls['materialType'].value !== this.MaterialTemplateTypeEnum.DevicePart) {
      this.form.removeControl('deviceTemplateId');
    }
    Object.keys(this.form.controls).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });
    if (!this.form.valid) {
      return;
    }
    const data = this.form.value;
    data.id = this.id;
    if (this.form.value.materialClassId instanceof Array) {
      // data.firstType = this.form.value.materialClassId[0];
      // data.secondType = this.form.value.materialClassId[1];
      // data.thirdType = this.form.value.materialClassId[2];
      data.materialClassId = this.form.value.materialClassId[2];
    } else {
      // data.firstType = this.itemData.firstType;
      // data.secondType = this.itemData.secondType;
      // data.thirdType = this.itemData.thirdType;
      data.materialClassId = this.editMaterialClassId;
    }
    data.materialType = Number(data.materialType);
    data.materialUserdNamesVOS = this.beforeNameDataSet;
    this.messageService.showLoading();
    this.materialManageService.updateMaterialTempleteReport(data).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public emitFinish() {
    this.finish.emit();
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  ngOnInit() {
    this.form = this.fb.group({
      materialClassId: [null, [Validators.required, this.isSelectedThirdClass]],
      materialType: [null, [Validators.required]],
      materialName: [null, [Validators.required]],
      unit: [null, [Validators.required]],
      unitCode: [null, [Validators.required]],
      modelSpecification: [null],
      remark: [null],
      deviceTemplateId: [null, [Validators.required]]
    });
    this.getDataItem();
    this.getUnitList();
  }

}
