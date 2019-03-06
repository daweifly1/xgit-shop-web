import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {FactoryMineService, FactoryMineServiceNs} from '../../../../core/trans/factoryMine.service';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../layout/layout.module';
import { DictionaryService, DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';
enum MaterialType {
  Material,
  SparePart,
  Equipment
}
interface MaterialNameType {
  materialName?: string;
}
enum MaxLenInputEnum {
  Default = 50,
  UserdName = 20
}
enum MaterialTemplateType {
  Material = 1,
  DevicePart,
  Device,
  CommonDevicePart
}
@Component({
  selector: 'app-material-template-report-add',
  templateUrl: './material-template-report-add.component.html',
  styleUrls: ['./material-template-report-add.component.scss']
})


export class MaterialTemplateReportAddComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  @Output() formValue: EventEmitter<any>;
  @Input() bottomTemplete: TemplateRef<any>;
  @ViewChild('beforeUseTable') beforeUseTable: TemplateRef<any>;
  @Output() backToListPage: EventEmitter<any>;
  @Input() id: string;
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

    // 查询
    show: boolean;
    rightTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;
    isVisibleMaterialName: boolean;
    materialNameTableConfig: UfastTableNs.TableConfig;
    materialNameDataList: any[];
    materialNameFilter: MaterialNameType;
    MaterialTemplateTypeEnum = MaterialTemplateType;


  constructor(private factoryMineService: FactoryMineService, private messageService: ShowMessageService, private fb: FormBuilder,
    private dictionaryService: DictionaryService) {
    this.id = '';
    this.beforeNameIndex = 1;
    this.bottomTemplete = null;
    this.formValue = null;
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
    this.backToListPage = new EventEmitter<any>();

    this.show = false;
    this.rightTableEmit = new EventEmitter();
    this.materialNameFilter = {materialName: ''};
  }
  public getUnitList() {
    this.messageService.showLoading();
    const data = {
      parentCode: DictionaryServiceNs.TypeCode.FactoryUnit
    };
    this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
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


  getMaterialClass(pId: string, materialClassArry?: any[], isSparePart?: boolean) {
    const param: { pId: string, materialType?: number } = { pId: pId };
    if (isSparePart) {
      // param.materialType = MaterialType.SparePart;
      param.materialType  = this.MaterialTemplateTypeEnum.DevicePart;
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
    this.factoryMineService.getMaterialClassListNoPage(data).subscribe((resData) => {
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
    this.form.controls['materialClassId'].patchValue(
      this.form.value.materialClassId instanceof Array ? this.form.value.materialClassId : this.editMaterialClassId);
    if (this.form.controls['materialType'].value !== 2) {
      this.form.removeControl('deviceTemplateId');
    }
    Object.keys(this.form.controls).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });
    if (!this.form.valid) {
      return;
    }
    return { ...this.form.value, materialUserdNamesVOS: this.beforeNameDataSet };
  }

  getDataItem() {
    this.factoryMineService.getMaterialTemplateReportItem({ id: this.id }).subscribe((resData) => {
      this.itemData = resData.value;
      this.form.patchValue(this.itemData);
      this.editMaterialClassId = this.itemData.materialClassId;
      this.form.controls['materialClassId'].patchValue(this.itemData.firstLevel
        + '/' + this.itemData.secondLevel + '/' + this.itemData.thirdLevel);
      this.beforeNameDataSet = this.itemData.materialUserdNamesVOS;
      this.getMaterialEquipmentList(this.editMaterialClassId);
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
      data.materialType = 3;
    }
    this.factoryMineService.getMaterialEquimentList(data).subscribe((resData) => {
      const tempArray = resData.value;
        for (let i = 0, len = tempArray.length; i < len; i++) {
          this.choosedEquipmentList = [...this.choosedEquipmentList, { label: tempArray[i].materialName, value: tempArray[i].id }];
        }
    });
  }

  changeMaterialType(value: MaterialType) {
    this.materialClassArry = [];
    this.form.value.materialClassId = [];
    if (value === MaterialType.SparePart) {
      this.form.patchValue({
        'materialClassId': null
      });
      this.isSparePart = true;
    } else {
      this.isSparePart = false;
    }
  }

  // 获取侧边栏物料
  getMaterialNameList = () => {
    const filter = {
      pageNum: this.materialNameTableConfig.pageNum,
      pageSize: this.materialNameTableConfig.pageSize,
      filters: {
        firstType: this.form.value.materialClassId[0],
        secondType: this.form.value.materialClassId[1],
        thirdType: this.form.value.materialClassId[2],
        materialName: this.materialNameFilter.materialName
      }
    };
    this.materialNameDataList = [];
    this.materialNameTableConfig.loading = true;
    this.factoryMineService.getMaterialTempleteList(filter).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
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
    if (!this.form.value.materialClassId) {
      this.messageService.showToastMessage('请选择物料分类', 'warning');
      this.materialNameDataList = [];
      return;
    }
    this.isVisibleMaterialName = !this.isVisibleMaterialName;
    event.stopPropagation();
    if (this.form.value.materialClassId) {
      this.getMaterialNameList();
    }

  }

  back(): void {
    this.backToListPage.emit();
  }
  public save() {
    if (this.form.controls['materialType'].value !== 2) {
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
    data.materialUserdNamesVOS = this.beforeNameDataSet;
    if (data.materialClassId instanceof Array) {
      data.firstType = data.materialClassId[0];
      data.secondType = data.materialClassId[1];
      data.thirdType = data.materialClassId[2];
      data.materialClassId = data.thirdType;
    } else {
      data.materialClassId = this.editMaterialClassId;
    }
    let submit = null;
    if (this.id !== null) {
      data.id = this.id;
      submit = this.factoryMineService.updateMaterialTemplateReport(data);
    } else {
      submit = this.factoryMineService.addMaterialTemplateReport(data);
    }
    this.messageService.showLoading();
    submit.subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'error');
        return;
      }
      this.back();
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  ngOnInit(): void {
    this.getUnitList();
    this.form = this.fb.group({
      materialClassId: [null, [Validators.required, this.isSelectedThirdClass]],
      firstType: [null],
      secondType: [null],
      thirdType: [null],
      materialType: [null, [Validators.required]],
      materialName: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default)]],
      unit: [null, [Validators.required]],
      modelSpecification: [null, Validators.maxLength(this.maxLenInputEnum.Default)],
      remark: [null, Validators.maxLength(this.maxLenInputEnum.Default)],
      deviceTemplateId: [null, [Validators.required]]
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
          //   { title: '一级分类', field: 'firstLevel', width: 100 },
          // { title: '二级分类', field: 'secondLevel', width: 100 },
          // { title: '三级分类', field: 'thirdLevel', width: 100 },
          { title: '物料分类', field: 'fullClassName', width: 300},
          { title: '物料名称', field: 'materialName', width: 150 }
          ]
        };
    if (this.id !== null) {
      this.getDataItem();
    }

  }
}

