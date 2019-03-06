import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {FactoryMineService, FactoryMineServiceNs} from '../../../../core/trans/factoryMine.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import { DictionaryService, DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';

interface FilterItem {
  materialName?: string;
  materialType?: string;
}

interface TabPageType {
  ManagePage: number;
  AddPage: number;
}
enum MaterialType {
    Material = 1,
    SparePart = 2,
    Equipment = 3
  }
  enum MaterialTemplateType {
    Material = 1,
    DevicePart,
    Device,
    CommonDevicePart
  }

@Component({
  selector: 'app-material-edit',
  templateUrl: './edit-material.component.html',
  styleUrls: ['./edit-material.component.scss']
})
export class MaterialEditComponent implements OnInit {

  @Output()finish: EventEmitter<any>;
  @Input() editId: string;
  form: FormGroup;
  isSparePart: boolean;
  choosedEquipmentList: any[];
  materialClassArry: any[];
  editMaterialClassId: string;
  status: number; // 审核状态
  isVisible = false;
  deviceModelTableConfig: UfastTableNs.TableConfig;
  deviceModelDataList: any[];
  @ViewChild('chooseDeviceModel') chooseDeviceModel: TemplateRef<any>;
  currDeviceId = '';
  unitList: any[];
  MaterialTemplateTypeEnum = MaterialTemplateType;


  constructor(private fb: FormBuilder, private factoryMineService: FactoryMineService, private messageService: ShowMessageService,
    private dictionaryService: DictionaryService) {
    this.finish = new EventEmitter();
    this.isSparePart = false;
    this.choosedEquipmentList = [];
    this.editMaterialClassId = '';
  }
  getDetail  = () => {
    this.factoryMineService.getMaterialDetail(this.editId).subscribe((resData) => {
      if (resData.value.materialType === this.MaterialTemplateTypeEnum.DevicePart) {
        this.form.addControl('deviceModel', this.fb.control(null, Validators.required));
        this.form.addControl('deviceId', this.fb.control(null));
      }
      this.form.patchValue(resData.value);
      this.status = resData.value.status;
      this.editMaterialClassId = resData.value.materialClassId;
      this.currDeviceId = resData.value.deviceId || '';
      this.isSparePart = resData.value.materialType === this.MaterialTemplateTypeEnum.DevicePart;
      if (this.form.value.materialType === this.MaterialTemplateTypeEnum.DevicePart) {
        this.form.controls['deviceModel'].patchValue(resData.value.deviceModel, Validators.required);
      }
      // this.form.controls['materialClassId'].patchValue(
        // resData.value.firstLevel + '/' + resData.value.secondLevel + '/' + resData.value.thirdLevel);
        this.form.controls['materialClassId'].patchValue(
          resData.value.fullClassName);
          this.form.patchValue({
            materialClassId: resData.value.fullClassName,
            unit: resData.value.unit,
            unitCode: resData.value.unitCode,
            importance: Number(resData.value.importance)
          });
        this.form.controls['name'].disable();
        this.form.controls['materialType'].disable();
        this.form.controls['materialClassId'].disable();
        this.form.controls['unit'].disable();
    });
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


  getMaterialClass(pId: string, materialClassArry?: any[], isSparePart?: boolean) {
    const param: { pId: string, materialType?: number } = { pId: pId };
    if (isSparePart) {
      param.materialType = this.MaterialTemplateTypeEnum.DevicePart;
    }
    this.factoryMineService.getMaterialClassListNoPage(param).subscribe((resData) => {
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
    if (this.form.value.materialType === this.MaterialTemplateTypeEnum.DevicePart) {
      this.isSparePart = true;
    }
    if (this.isSparePart) {
      if (!values || values.length !== 3) {
        return;
      }
      // this.getMaterialEquipmentList(this.form.value.materialClassId);
    }
  }

  getMaterialEquipmentList(id) {
    if (id instanceof Array) {
      const index = id.length;
      id = id[index - 1];
    }
    this.factoryMineService.getMaterialEquimentList(id).subscribe((resData) => {
      const tempArray = resData.value;
        for (let i = 0, len = tempArray.length; i < len; i++) {
          this.choosedEquipmentList = [...this.choosedEquipmentList, { label: tempArray[i].materialName, value: tempArray[i].id }];
        }
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

  public goback() {
    this.emitFinish();
  }
  public emitFinish() {
    this.finish.emit();
  }
  public save() {
    this.form.controls['id'].patchValue(this.editId);
    Object.keys(this.form.controls).forEach((key: string) => {
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    });
    if (this.form.invalid) {
      return;
    }
    const data = this.form.value;
    if (data.materialClassId instanceof Array) {
        data.firstType = data.materialClassId[0];
        data.secondType = data.materialClassId[1];
        data.thirdType = data.materialClassId[2];
        data.materialClassId = data.materialClassId[2];
    } else {
        data.materialClassId = this.editMaterialClassId;
    }
    this.messageService.showLoading();
      this.factoryMineService.editMaterialReport(data).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'warning');
            return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showDeviceModelModal(): void {
    this.isVisible = true;
    this.getDeviceModelData();
  }
  public getDeviceModelData = () => {
    const filter = {
      pageNum: this.deviceModelTableConfig.pageNum,
      pageSize: this.deviceModelTableConfig.pageSize,
      filters: {
        materialId: this.currDeviceId
      }
    };
    this.factoryMineService.getUnitTypePage(filter).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.deviceModelDataList = resData.value.list;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseDeviceModelFun(item: any) {
    this.form.controls['deviceModel'].patchValue(item);
    this.isVisible = false;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  ngOnInit() {

    this.form = this.fb.group({
        id: [null, Validators.required],
        // code: [null, Validators.required],
        materialType: [null, Validators.required],
        materialClassId: [null, Validators.required],
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
        importance: [null, Validators.required],
        materialClassification: [null],
        auditRemark: [{value: null,  disabled: true}, []],
        deviceName: [{value: null,  disabled: true}],
        // deviceModel: [null],
        // deviceId: [null],
        // status: [null]
    });
    this.getDetail();
    this.deviceModelTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 100,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '设备型号', field: 'modelName', width: 100 },
        { title: '操作', tdTemplate: this.chooseDeviceModel, width: 60 }
      ]
    };
    this.getUnitList();

  }
}
