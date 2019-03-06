
import { Component, OnInit, EventEmitter, Output, Input, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialManageService, MaterialManageServiceNs } from '../../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { InvoiceService, InvoiceServiceNs } from '../../../../core/trans/invoice.service';
import { UfastTableNs } from '../../../../layout/layout.module';
import { environment } from '../../../../../environments/environment';
import { MaterialDivisionManagementService } from '../../../../core/trans/material/MaterialDivisionManagementService';
import { DictionaryService, DictionaryServiceNs } from '../../../../core/common-services/dictionary.service';
interface DivideWorkId {
  id: number;
  name: string;
}
interface SupplyRange {
  id: number;
  name: string;
}
enum MaterialType {
  Material,
  SparePart,
  Equipment
}
enum MaxLenInputEnum {
  Default = 50,
  Large = 100
}
enum MaxPlanPriceEnum {
  Default = 99999999.99
}
@Component({
  selector: 'app-material-setting-add',
  templateUrl: './material-setting-add.component.html',
  styleUrls: ['./material-setting-add.component.scss']
})
export class MaterialSettingAddComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  maxPlanPriceEnum = MaxPlanPriceEnum;
  @Output() finish: EventEmitter<any>;
  @Input() editId: string;
  @Input() selectMaterial: any;
  form: FormGroup;
  supplyRangeType: SupplyRange[];
  divideWorkId: DivideWorkId[];
  taxCodeDateList: any[];
  // taxRate: number;
  assemblyOrPart: number;
  shortDress: number;
  materialClassId: any;
  materialClassArry: any[];
  selectClassIdArry: string[];
  isSparePart: boolean;
  choosedEquipmentList: any[];
  editMaterialClassId: string;
  unitType: any[];
  /**
   * 选择设备型号
   */
  isVisible: boolean;
  deviceModelTableConfig: UfastTableNs.TableConfig;
  deviceModelDataList: any[];
  submitMaterialClassId: string;  // 新增备件时的物料分类
  @ViewChild('chooseDeviceModel') chooseDeviceModel: TemplateRef<any>;
  @ViewChild('chooseDivision') chooseDivision: TemplateRef<any>;
  moneyDec: number;
  @ViewChild('chooseSupplyRange') chooseSupplyRange: TemplateRef<any>;
  @ViewChild('chooseInputTaxRate') chooseInputTaxRate: TemplateRef<any>;
  moneyMin: number;
  moneyMax: number;
  /**
   * 分工管理相关
   */
  divisionVisible: boolean;
  divisionTableConfig: UfastTableNs.TableConfig;
  divisionDataList: any[];
  /**
   * 所属供应范围相关
   */
  supplyRangeList: any[];
  supplyRangeVisible: boolean;
  supplyRangeTableConfig: UfastTableNs.TableConfig;
  /**
   * 进项税相关
   */
  inputTaxRateList: any[];
  outputTaxRateList: any[];
  constructor(private fb: FormBuilder,
    private messageService: ShowMessageService, private materialManageService: MaterialManageService,
    private invoiceService: InvoiceService, private materialDivisionManagementService: MaterialDivisionManagementService,
    private dictionaryService: DictionaryService) {
    this.finish = new EventEmitter<any>();
    this.supplyRangeType = [
      { id: 1, name: '风机' },
      { id: 2, name: '空压机' },
      { id: 3, name: '汞' },
      { id: 4, name: '阀' },
      { id: 5, name: '铲运机' }
    ];
    // this.taxRate = 1;
    this.taxCodeDateList = [];
    this.assemblyOrPart = 0;
    this.shortDress = 0;
    this.materialClassId = [];
    this.selectClassIdArry = [];
    this.isSparePart = false;
    this.choosedEquipmentList = [];
    this.editMaterialClassId = '';
    this.isVisible = false;
    this.deviceModelDataList = [];
    this.moneyDec = environment.otherData.moneyDec;
    this.moneyMin = environment.otherData.moneyMin;
    this.moneyMax = environment.otherData.moneyMax;
    this.divisionDataList = [];
    this.supplyRangeList = [];


    this.inputTaxRateList = [];
    this.outputTaxRateList = [];
    this.submitMaterialClassId = '';
  }
  formatterPercent = value => `${value} %`;
  parserPercent = value => value.replace(' %', '');

  public trackByNewsId(index: number, item: any) {
    return item.id;
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
    if (value) {
      this.getMaterialClass('0', undefined, this.isSparePart);
    }
  }


  getMaterialClass(pId?: string, materialClassArry?: any[], isSparePart?: boolean) {
    const param: { pId: string, materialType?: number } = { pId: pId };
    // if (this.form.value['materialType'] === 1) {
    //   param.materialType = 0;
    // } else {
    //   param.materialType = 1;
    // }
    param.materialType = this.form.controls['materialType'].value;
    // if (isSparePart) {
    //   param.materialType = MaterialType.SparePart;
    // }
    this.materialManageService.getMaterialClassListNoPage(param).subscribe((resData) => {
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
    if (this.form.value.materialType === 2) {
      this.isSparePart = true;
    }
    if (this.isSparePart) {
      if (values.length !== 3) {
        return;
      }
      this.getMaterialEquipmentList(values);
    }
  }

  getMaterialEquipmentList(id) {
    this.choosedEquipmentList = [];
    const data = <any>{};
    if (id instanceof Array) {
      // data.firstType = id[0];
      // data.secondType = id[1];
      // data.thirdType = id[2];
      data.materialClassId = id[2];
    }
    data.materialType = '3';
    this.materialManageService.getMaterialEquimentList(data).subscribe((resData) => {
      this.choosedEquipmentList = resData.value;
      // const tempArray = resData.value;
      // for (let i = 0, len = tempArray.length; i < len; i++) {
      //   this.choosedEquipmentList = [...this.choosedEquipmentList, { label: tempArray[i].materialName, value: tempArray[i].id }];
      // }
    });
  }

  changeMaterialType(value: MaterialType) {
    if (value === MaterialType.SparePart) {
      this.form.patchValue({
        'materialClassId': null
      });
      this.isSparePart = true;
    } else {
      this.isSparePart = false;
    }
  }


  public getItemData()  {
    this.materialManageService.getMaterialSettingItem(this.editId).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.form.patchValue(resData.value);
      this.submitMaterialClassId = resData.value.materialClassId;
      this.form.patchValue({
        materialClassId: resData.value.fullClassName,
        unit: resData.value.unit,
        unitCode: resData.value.unitCode,
        inputTaxRate: resData.value.inputTaxRate || '进项税16%',
        outputTaxRate: resData.value.outputTaxRate ||  '销项税16%',
        importance: Number(resData.value.importance) || 2,
        deviceModel: resData.value.deviceModel,
        deviceId: resData.value.deviceId
      });
      if (this.form.controls['materialType'].value === 2) {
        this.form.controls['deviceId'].clearValidators();
        this.form.controls['deviceModel'].clearValidators();
        this.form.controls['divideWorkId'].clearValidators();
        this.form.controls['divideWork'].clearValidators();
        this.form.controls['deviceId'].disable();
        this.form.controls['deviceModel'].disable();
      }
      // this.form.controls['deviceModel'].patchValue(resData.value.deviceModel);
      // this.form.controls['deviceId'].patchValue(resData.value.deviceId);
      this.editMaterialClassId = resData.value.thirdType;
      // this.form.controls['supplyRange'].patchValue(resData.value.supplyRange);
      if (this.form.value.materialType === 2) {
        this.getMaterialEquipmentList({
          firstType: resData.value.firstType,
          secondType: resData.value.secondType,
          thirdType: resData.value.thirdType,
        });
      }
      // this.form.patchValue({
      //   materialClassId: resData.value.fullClassName
      // });
      this.assemblyOrPart = resData.value.assemblyOrPart || 0;
      this.shortDress = resData.value.shortDress || 0;
    });
    this.form.controls['code'].disable();
    this.form.controls['materialType'].disable();
    this.form.controls['materialClassId'].disable();
    this.form.controls['name'].disable();
    // this.form.controls['deviceId'].disable();
    this.form.controls['unit'].disable();
    const data = {
      firstType: this.form.value.firstType,
      secondType: this.form.value.secondType,
      thirdType: this.form.value.thirdType
    };
    this.getMaterialEquipmentList(data);

  }

  public emitFinish(value) {
    this.finish.emit(value);
  }
  public save() {
    if (this.form.controls['materialType'].value !== 2) {
      this.form.removeControl('deviceId');
      this.form.removeControl('deviceModel');
    }
    this.form.controls['assemblyOrPart'].patchValue(this.assemblyOrPart);
    this.form.controls['shortDress'].patchValue(this.shortDress);
    Object.keys(this.form.controls).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });
    if (this.form.invalid) {
      this.messageService.showToastMessage('请正确填写物料信息', 'warning');
      return;
    }
    // if (this.selectMaterial) {
    //   if (this.form.value.materialClassId instanceof Array) {
    //     this.form.value.materialClassId.pop();
    //   } else {
    //     this.form.value.materialClassId = this.selectMaterial[0].materialClassId;
    //   }
    // }
    const data = this.form.getRawValue();
    if (this.form.controls['materialType'].value === 2) {
      const temp = this.choosedEquipmentList.filter((item) => {
        return item.id === data.deviceId;
      });
      if (temp.length) {
        data.deviceName = temp[0].materialName;
      }
      data.materialClassId = this.submitMaterialClassId;
    }
    data.materialClassId = this.submitMaterialClassId;
    let submit = null;
    if (this.editId) {
      data.id = this.editId;
      submit = this.materialManageService.updateMaterialSetting(data);
    } else {
      submit = this.materialManageService.addMaterialSetting(data);
    }
    this.messageService.showLoading();
    submit.subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish(true);
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  showDeviceModelModal(): void {
    this.isVisible = true;
    this.getDeviceModelData();
  }
  getDeviceModelData = () => {
    const filter = {
      pageNum: this.deviceModelTableConfig.pageNum,
      pageSize: this.deviceModelTableConfig.pageSize,
      filters: {
        materialId: this.form.controls['deviceId'].value
      }
    };
    this.materialManageService.getUnitType(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.deviceModelDataList = resData.value.list || [];
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancel(): void {
    this.isVisible = false;
}
chooseDeviceModelFun(item: any) {
  this.form.controls['deviceModel'].patchValue(item);
  this.handleCancel();
}
 getDivideWorkList = () => {
  const filter = {
    pageNum: this.divisionTableConfig.pageNum,
    pageSize: this.divisionTableConfig.pageSize,
    filters: {}
  };
  this.divisionTableConfig.loading = true;
  this.materialDivisionManagementService.list(filter).subscribe((resData: any) => {
    this.divisionTableConfig.loading = false;
    this.divisionDataList = [];
    if (resData.code) {
      this.messageService.showToastMessage(resData.message, 'error');
      return;
    }
    resData.value.list.forEach((item) => {
      let temp = <any>{};
      temp = item;
      temp['_this'] = temp;
      this.divisionDataList.push(temp);
    });
    this.divisionTableConfig.total = resData.value.total;
  }, (error) => {
    this.divisionTableConfig.loading = false;
    this.messageService.showAlertMessage('', error.message, 'error');
  });
}
showDivisionModal(): void {
  this.divisionVisible = true;
  this.getDivideWorkList();
}
handleCancelDivision(): void {
  this.divisionVisible = false;
}
public chooseDivisionFun(ctx) {
  this.form.patchValue({
    divideWork: ctx.divisionName,
    divideWorkId: ctx.id
  });
  this.handleCancelDivision();
}
public clearDivision() {
  this.form.patchValue({
    divideWork: '',
    divideWorkId: ''
  });
}
getSupplyRangeList = () => {
  const data = {
    parentCode: DictionaryServiceNs.TypeCode.SUPPLYSCOPE
  };
  this.supplyRangeTableConfig.loading = true;
  this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
    this.supplyRangeTableConfig.loading = false;
    this.supplyRangeList = [];
    if (resData.code) {
      this.messageService.showToastMessage(resData.message, 'error');
      return;
    }
    resData.value.forEach((item) => {
      let temp = <any>{};
      temp = item;
      temp['_this'] = temp;
      this.supplyRangeList.push(temp);
    });
  }, (error: any) => {
    this.supplyRangeTableConfig.loading = false;
    this.messageService.showAlertMessage('', error.message, 'error');
  });
}
showSupplyRangeModal(): void {
  this.supplyRangeVisible = true;
  this.getSupplyRangeList();
}
handleCancelSupplyRange(): void {
  this.supplyRangeVisible = false;
}
public chooseSupplyRangeFun(ctx) {
  this.form.patchValue({
    supplyRange: ctx.name,
    supplyRangeCode: ctx.code
  });
  this.handleCancelSupplyRange();
}
public clearSupplyRange() {
  this.form.patchValue({
    supplyRange: '',
    supplyRangeCode: ''
  });
}
 public getInputTaxRateList() {
   const data = {
     parentCode: DictionaryServiceNs.TypeCode.INPUTTAX
   };
   this.messageService.showLoading();
   this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
    this.messageService.closeLoading();
    if (resData.code) {
      this.messageService.showToastMessage(resData.message, 'error');
      return;
    }
     this.inputTaxRateList = resData.value;
   }, (error: any) => {
    this.messageService.closeLoading();
    this.messageService.showAlertMessage('', error.message, 'error');
  });

 }

 public getOutputTaxRateList() {
  const data = {
    parentCode: DictionaryServiceNs.TypeCode.OUTPUTTAX
  };
  this.messageService.showLoading();
  this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
   this.messageService.closeLoading();
   if (resData.code) {
     this.messageService.showToastMessage(resData.message, 'error');
     return;
   }

    this.outputTaxRateList = resData.value;
  }, (error: any) => {
   this.messageService.closeLoading();
   this.messageService.showAlertMessage('', error.message, 'error');
 });

}
public trackByItem(index: number, item: any) {
  return item;
}
public deviceIdChange(deviceId: string) {
  const temp = this.choosedEquipmentList.filter((item) => {
    return item.id === deviceId;
  });
  this.form.patchValue({
    materialClassId: temp[0]['fullClassName'],
    firstType: temp[0]['firstType'],
    secondType: temp[0]['secondType'],
    thirdType: temp[0]['thirdType'],
    deviceModel: ''
  });
  this.submitMaterialClassId = temp[0]['materialClassId'];
}
  ngOnInit() {
    this.form = this.fb.group({
      code: [{ value: '系统生成', disabled: true }, [Validators.required]],
      materialType: [null, Validators.required],
      materialClassId: [null, [Validators.required, this.isSelectedThirdClass]],
      firstType: [null],
      secondType: [null],
      thirdType: [null],
      name: [null, Validators.required],
      specificationModel: [null],
      unit: [null, Validators.required],
      unitCode: [null, Validators.required],
      drawingNumber: [null],
      material: [null],
      brand: [null],
      importOrDomestic: [null],
      importance: [{value: 2, disabled: false}, [Validators.required]],
      materialClassification: [null],
      // taxRate: [null, Validators.required],
      inputTaxRate: [{value: '进项税16%', disabled: false}, [Validators.required]],
      outputTaxRate: [{value: '销项税16%', disabled: false}, [Validators.required]],
      planPrice: [{value: null, disabled: true}, Validators.required],
      assemblyOrPart: [this.assemblyOrPart],
      shortDress: [this.shortDress],
      divideWorkId: [null],
      divideWork: [null],
      supplyRange: [null],
      supplyRangeCode: [null],
      deviceId: [null, Validators.required],
      deviceModel: [null, Validators.required]
    });
    if (this.editId !== undefined) {
      this.getItemData();
    }
    // this.getTaxCodeList();
    if (this.selectMaterial) {
      this.form.patchValue(this.selectMaterial[0]);
      this.form.controls['materialType'].disable();
      this.form.controls['materialClassId'].patchValue(
        this.selectMaterial[0].fullClassName);
        this.submitMaterialClassId = this.selectMaterial[0].materialClassId;
      this.form.controls['name'].patchValue(this.selectMaterial[0].materialName);
      this.form.controls['materialClassId'].disable();
      this.form.controls['name'].disable();
      this.form.controls['specificationModel'].patchValue(this.selectMaterial[0].modelSpecification);
      this.form.controls['deviceId'].patchValue(this.selectMaterial[0].deviceTemplateId);
      // this.form.controls['deviceId'].disable();
      this.form.controls['unit'].disable();
      this.getMaterialClass();
      const data = [];
      data[0] = this.selectMaterial[0].firstType;
      data[1] = this.selectMaterial[0].secondType;
      data[2] = this.selectMaterial[0].thirdType;
      this.getMaterialEquipmentList(data);

    }
    this.deviceModelTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '设备型号', field: 'modelName', width: 100 },
      { title: '操作', tdTemplate: this.chooseDeviceModel, width: 60 }
      ]
    };
    this.divisionTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '分工管理', field: 'divisionName', width: 100 },
      { title: '操作', tdTemplate: this.chooseDivision, width: 60 }
      ]
    };
    this.supplyRangeTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [{ title: '供应范围', field: 'name', width: 100 },
      { title: '操作', tdTemplate: this.chooseSupplyRange, width: 60 }
      ]
    };
    this.getInputTaxRateList();
    this.getOutputTaxRateList();
  }

}
