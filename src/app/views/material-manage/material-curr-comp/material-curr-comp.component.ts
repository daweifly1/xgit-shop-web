import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { MaterialManageService, MaterialManageServiceNs } from '../../../core/trans/materialManage.service';
import { UfastTableNs, RightSideTableBoxNs } from '../../../layout/layout.module';
import { DictionaryService, DictionaryServiceNs } from '../../../core/common-services/dictionary.service';


interface MaterialClassModel {
  value: string;
  label: string;
  isLeaf?: boolean;
  children?: MaterialClassModel[];
}

enum MaterialType {
  Material,
  SparePart,
  Equipment
}
interface MaterialNameType {
  materialName?: string;
  materialClassId?: string;
  materialType?: number;
}
enum MaxLenInputEnum {
  Default = 50,
  Large = 100
}
enum MaterialTemplateType {
  Material = 1,
  DevicePart,
  Device,
  CommonDevicePart
}
@Component({
  selector: 'app-material-curr-comp',
  templateUrl: './material-curr-comp.component.html',
  styleUrls: ['./material-curr-comp.component.scss']
})
export class MaterialCurrCompComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  @Output() formValue: EventEmitter<any>;
  @Input() bottomTemplete: TemplateRef<any>;
  @ViewChild('beforeUseTable') beforeUseTable: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('chooseUnit') chooseUnit: TemplateRef<any>;
  @Input() id: string;
  isSparePart: boolean;
  choosedEquipmentList: any[];
  itemData: any;
  form: FormGroup;
  beforeNameIndex: number;
  materialClassArry: any[];

  beforeNameDataSet: {
    materialTemplateUsedName?: string
  }[];

  editMaterialClassId: string;

  // 查询
  show: boolean;
  rightTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;
  isVisibleMaterialName: boolean;
  materialNameTableConfig: UfastTableNs.TableConfig;
  materialNameDataList: any[];
  materialNameFilter: MaterialNameType;
  MaterialTemplateTypeEnum = MaterialTemplateType;
  materialTemplateType: Number;
  isVisibleUnit: boolean;
  unitTableConfig: UfastTableNs.TableConfig;
  unitFilter: any;
  unitList: any[];

  constructor(private fb: FormBuilder,
    private materialManageService: MaterialManageService, private messageService: ShowMessageService,
    private dictionaryService: DictionaryService) {
    this.id = '';
    this.beforeNameIndex = 1;
    this.bottomTemplete = null;
    this.formValue = null;
    this.materialClassArry = [];
    this.itemData = null;
    this.beforeNameDataSet = [
    ];
    this.isSparePart = false;
    this.choosedEquipmentList = [];
    this.editMaterialClassId = '';

    this.show = false;
    this.rightTableEmit = new EventEmitter();
    this.materialNameFilter = { materialName: '' };
    this.isVisibleUnit = false;
    this.unitFilter = {};
  }
  getUnitList = () => {
    // this.messageService.showLoading();
    const data = {
      parentCode: DictionaryServiceNs.TypeCode.FactoryUnit
    };
    this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      // this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.unitList = resData.value;
      this.unitTableConfig.total = this.unitList.length;
    }, (error: any) => {
      // this.messageService.closeLoading();
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
        this.messageService.showToastMessage(resData.message, 'error');
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

  outPutFormValue() {
    // this.form.controls['materialClassId'].patchValue(
    //   this.form.value.materialClassId instanceof Array ? this.form.value.materialClassId : this.editMaterialClassId);
    if (this.form.controls['materialType'].value === this.MaterialTemplateTypeEnum.DevicePart) {
      this.form.removeControl('materialClassId');
    } else {
      this.form.addControl('materialClassId', this.fb.control(null,
        [Validators.required, this.isSelectedThirdClass]));
    }
    Object.keys(this.form.controls).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });
    if (!this.form.valid) {
      return;
    }
    let materialClassName = '';
    if (this.form.controls['materialType'].value !== this.MaterialTemplateTypeEnum.DevicePart) {
      materialClassName = this.form.controls['materialClassId'].value;
    }
    const componentForm = { ...this.form.value, materialUserdNamesVOS: this.beforeNameDataSet };
    if (materialClassName.includes('/')) {
      componentForm.materialClassId = this.editMaterialClassId;
    }
    // return { ...this.form.value, materialUserdNamesVOS: this.beforeNameDataSet };
    return componentForm;
  }

  getDataItem() {
    this.messageService.showLoading();
    this.materialManageService.getMaterialTempleteItem({ id: this.id }).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.itemData = resData.value;
      this.form.patchValue(this.itemData);
      this.editMaterialClassId = this.itemData.materialClassId;
      if (this.form.controls['materialType'].value !== this.MaterialTemplateTypeEnum.DevicePart) {
        this.form.controls['materialClassId'].patchValue(this.itemData.fullClassName);
      }
      this.beforeNameDataSet = this.itemData.materialUserdNamesVOS;
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
      data.materialClassId = id[2];
      data.materialType = 3;
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

  changeMaterialType(value) {
    this.materialTemplateType = value;
    if (this.materialTemplateType === MaterialTemplateType.DevicePart) {
      this.form.removeControl('materialClassId');
    } else {
      this.form.addControl('materialClassId', this.fb.control(null,
        [Validators.required, this.isSelectedThirdClass]));
    }
    this.materialClassArry = [];
    this.form.value.materialClassId = [];
    // this.getMaterialClass();
    if (value === MaterialType.SparePart) {
      this.form.patchValue({
        'materialClassId': null
      });
      this.isSparePart = true;
    } else {
      this.form.patchValue({
        'materialClassId': null
      });
      this.isSparePart = false;
    }
    if (value === this.MaterialTemplateTypeEnum.Material) {
      this.form.controls['modelSpecification'].setValidators([Validators.required, Validators.maxLength(this.maxLenInputEnum.Large)]);
      this.form.controls['modelSpecification'].updateValueAndValidity();
    } else {
      this.form.controls['modelSpecification'].setValidators([Validators.maxLength(this.maxLenInputEnum.Large)]);
      this.form.controls['modelSpecification'].updateValueAndValidity();
    }
  }


  // 获取侧边栏物料
  getMaterialNameList = () => {
    const filter = {
      pageNum: this.materialNameTableConfig.pageNum,
      pageSize: this.materialNameTableConfig.pageSize,
      filters: this.materialNameFilter
    };
    this.materialNameDataList = [];
    this.materialNameTableConfig.loading = true;
    this.materialManageService.getMaterialTempleteList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.materialNameTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialNameDataList = resData.value.list;
      this.materialNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.materialNameTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showMaterialName(event: Event) {
    this.isVisibleMaterialName = !this.isVisibleMaterialName;
    this.materialNameFilter = {};
    if (this.form.controls['materialType'].valid) {
      this.materialNameFilter.materialType = this.form.controls['materialType'].value;
    }
    if (this.form.controls['materialName'].valid) {
      this.materialNameFilter.materialName = this.form.controls['materialName'].value;
    }
    if (this.materialNameFilter.materialType !== this.MaterialTemplateTypeEnum.DevicePart) {
      if (this.form.controls['materialClassId'].valid) {
        this.materialNameFilter.materialClassId = this.form.controls['materialClassId'].value[2];
      }
    }
    this.getMaterialNameList();

  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  showUnitModal(): void {
    this.isVisibleUnit = true;
    this.getUnitList();
  }
  handleCancelUnit(): void {
    this.isVisibleUnit = false;
    this.unitFilter = {};
  }
  public chooseUnitFun(name: string, code: string) {
    this.form.patchValue({
      unit: name,
      unitCode: code
    });
    this.handleCancelUnit();
  }



  ngOnInit() {
    this.form = this.fb.group({
      materialClassId: [null, [Validators.required, this.isSelectedThirdClass]],
      materialType: [null, [Validators.required]],
      materialName: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default)]],
      unit: [null, [Validators.required]],
      unitCode: [null, [Validators.required]],
      modelSpecification: [null],
      remark: [null, Validators.maxLength(this.maxLenInputEnum.Large)],
      // deviceTemplateId: [null, [Validators.required]]
    });
    // 查询侧边栏
    this.materialNameTableConfig = {
      pageSize: 10,
      yScroll: 500,
      showCheckbox: false,
      showPagination: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        { title: '物料分类', field: 'fullClassName', width: 300 },
        { title: '物料名称', field: 'materialName', width: 150 },
        { title: '单位', field: 'unit', width: 150 }
      ]
    };
    this.unitTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        //   { title: '一级分类', field: 'firstLevel', width: 100 },
        // { title: '二级分类', field: 'secondLevel', width: 100 },
        // { title: '三级分类', field: 'thirdLevel', width: 100 },
        { title: '操作', tdTemplate: this.operationTpl, width: 100 },
        { title: '单位', field: 'name', width: 300 },
      ]
    };
    if (this.id !== null) {
      this.getDataItem();
    }


  }

}
