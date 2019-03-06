import { Component, OnInit, EventEmitter, Output, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MaterialManageService, MaterialManageServiceNs } from '../../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { EquipmentModelService, EquipmentModelServiceNs } from '../../../../core/trans/material/equipment-model.service';

enum MaxLenInputEnum {
  Default = 50
}
@Component({
  selector: 'app-equipment-model-add',
  templateUrl: './equipment-model-add.component.html',
  styleUrls: ['./equipment-model-add.component.scss']
})
export class EquipmentModelAddComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;
  @Input() materialId: string;
  form: FormGroup;
  materialClassArry: any[];
  equipmentTableData: {
    rowNo: number,
    deviceModel: string;
  }[];
  beforeIndex: number;
  materialList: any;
  modelNameItem: any;
  isVisible: boolean;
  deviceNameTableConfig: UfastTableNs.TableConfig;
  @ViewChild('chooseDeviceName') chooseDeviceName: TemplateRef<any>;
  deviceNameDataList: any[] = [];
  deviceType: string;
  tableConfig: UfastTableNs.TableConfig;
  materialFilter: any = {};       // 设备名称查询
  selectedDeviceName: any;      // 选中的设备名称
  editMaterialClassId: string;
  constructor(private fb: FormBuilder, private materialManageService: MaterialManageService,
    private messageService: ShowMessageService,
    private equipmentService: EquipmentModelService) {
    this.finish = new EventEmitter<any>();
    this.materialClassArry = [];
    this.beforeIndex = 1;
    this.equipmentTableData = [
      {
        rowNo: this.beforeIndex,
        deviceModel: ''
      }
    ];
    this.materialList = [];
    this.modelNameItem = {};
    this.materialFilter = {
      materialType: 3
    };
    this.detailId = '';
    this.selectedDeviceName = {};
    this.editMaterialClassId = '';
  }
  public emitFinish() {
    this.finish.emit();
  }
  addDeviceName(): void {
    const deviceNameArr = this.form.get('deviceNameArr') as FormArray;
    deviceNameArr.push(this.newDeviceForm());
    this.form.get('deviceNameArr')['controls'] = [...this.form.get('deviceNameArr')['controls']];
  }
  public newDeviceForm(data?: any) {
    const form = this.fb.group({
      deviceModel: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default)]]
    });
    if (data) {
      form.patchValue(data);
    }
    return form;
  }
  delDeviceName(i): void {
    const deviceNameArr = this.form.get('deviceNameArr') as FormArray;
    const index = (this.tableConfig.pageNum - 1) * this.tableConfig.pageSize + i;
    deviceNameArr.removeAt(index);
    this.form.get('deviceNameArr')['controls'] = [...this.form.get('deviceNameArr')['controls']];
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
    this.getMaterialClass(selectedItem.option.value, selectedItem.option.children);
  }


  showMaterialClass(value) {
    if (value) {
      this.getMaterialClass('0', undefined);
    }
  }


  getMaterialClass(pId: string, materialClassArry?: any[], isSparePart?: boolean) {
    const param: { pId: string, materialType?: number } = { pId: pId };
    let data = {};
    data = {
      pId: pId,
      materialType: 3
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


  public changes(event) {
    // if (event) {
    //   this.deviceType = event;
    // }
    console.log(this.form);
    this.form.patchValue({
      materialName: null,
      materialId: null
    });
    console.log(this.form);
    // if (this.selectedDeviceName) {
    //   this.form.patchValue({
    //     materialName: this.selectedDeviceName.name,
    //     materialId: this.selectedDeviceName.id
    //   });
    // }

  }
  public clearMaterialClass() {
    this.form.controls['materialClass'].patchValue(null);
    this.deviceType = '';
  }

  public materialName(materialClassId) {
    const data = {
      materialClassId: materialClassId[2],
      materialType: 3
    };
    this.materialManageService.getMaterialNameList(data).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
      }
      this.materialList = resData.value;

    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackByNewsId(index: number, item: any) {
    return item.id;
  }
  showDeviceName(): void {
    this.isVisible = !this.isVisible;
    this.getDeviceNameData();
  }
  getDeviceNameData = (pageNum?: number, pageSize?: number) => {
    console.log(this.deviceType);
    // this.materialFilter.materialType = 3;
    let materialClass = null;
    if (this.form.controls['materialClass'].valid) {
      console.log('11');
       materialClass = this.form.controls['materialClass'].value;
      this.materialFilter.materialClassId = materialClass[2];
    }
    if (materialClass instanceof Array) {
      this.materialFilter.materialClassId = materialClass[2];
    } else {
      this.materialFilter.materialClassId = this.deviceType;
    }
    const filter = {
      pageNum: pageNum || this.deviceNameTableConfig.pageNum,
      pageSize: pageSize || this.deviceNameTableConfig.pageSize,
      filters: this.materialFilter
    };
    this.deviceNameTableConfig.loading = true;
    this.materialManageService.getMaterialSettingList(filter).subscribe((resData) => {
      this.deviceNameTableConfig.loading = false;
      this.deviceNameDataList = [];
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.deviceNameDataList.push(temp);
      });
      this.deviceNameDataList = [...this.deviceNameDataList];
      this.deviceNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.deviceNameTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancel(): void {
    this.isVisible = false;
    this.materialFilter = {
      materialType: 3
    };
  }
  public chooseDeviceNameFun(ctx) {
    if (this.form.controls['materialClass'].valid) {
      this.form.patchValue({
        materialName: ctx.name,
        materialId: ctx.id
      });
    }
    // this.selectedDeviceName = ctx;
    if (this.form.controls['materialClass'].invalid) {
      this.form.patchValue({
        materialClass: ctx.fullClassName,
        materialName: ctx.name,
        materialId: ctx.id
      });
    }
    // this.materialFilter.name = this.form.controls['materialName'].value;
    // this.deviceType = [ctx.firstType, ctx.secondType, ctx.thirdType];
    this.deviceType = ctx.materialClassId;
    this.handleCancel();
  }

  public save() {
    Object.keys(this.form.controls).filter(
      item => typeof this.form.controls[item].value === 'string').forEach((key: string) => {
        this.form.controls[key].patchValue(this.form.controls[key].value.trim());
      });
    Object.keys(this.form.controls).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });
    const deviceNameArr: FormArray = this.form.get('deviceNameArr') as FormArray;
    if (!deviceNameArr.length) {
      this.messageService.showToastMessage('至少要有一条设备型号', 'error');
      return;
    }
    for (let i = 0; i < deviceNameArr.length; i++) {
      const deviceData = deviceNameArr.at(i);
      Object.keys(deviceData).forEach((keys: string) => {
        if (keys === 'controls') {
          Object.keys(deviceData[keys]).forEach((key: string) => {
            deviceData[keys][key].markAsDirty();
            deviceData[keys][key].updateValueAndValidity();
          });
          return;
        }
      });
    }
    for (let i = 0; i < deviceNameArr.length - 1; i++) {
      const deviceData = deviceNameArr.at(i);
      for (let j = i + 1; j < deviceNameArr.length; j++) {
        const deviceDataNext = deviceNameArr.at(j);
        if (deviceData['controls']['deviceModel'].value === deviceDataNext['controls']['deviceModel'].value) {
          this.messageService.showToastMessage('设备型号不能重复', 'error');
          return;
        }
      }
    }
    if (!this.form.valid) {
      this.messageService.showToastMessage('请正确填写页面信息', 'error');
      return;
    }
    const materialNames = [];
    this.form.controls['deviceNameArr'].value.forEach((item) => {
      materialNames.push(item.deviceModel);
    });
    const submitData = <any>{
      // firstType: this.deviceType[0],
      // secondType: this.deviceType[1],
      // thirdType: this.deviceType[2],
      materialId: this.form.controls['materialId'].value,
      modelNames: materialNames,
    };
    this.messageService.showLoading();
    if (this.detailId) {
      this.submitFun(this.equipmentService.editEquipmentModel(submitData));
    } else {
      this.submitFun(this.equipmentService.addEquipmentModel(submitData));
    }

  }
  public submitFun(submit) {
    submit.subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.value, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public getDetail() {
    this.equipmentService.getEquipmentModelItem(this.materialId).subscribe((resData: EquipmentModelServiceNs.UfastHttpAnyResModel) => {
      const materialInfo = resData.value.materialVO;
      this.form.patchValue({
        materialClass: [materialInfo.fullClassName],
        materialName: materialInfo.name,
        materialId: materialInfo.id
      });
      this.editMaterialClassId = materialInfo.materialClassId;
      const deviceNameArr = this.fb.array([]);
      resData.value.modelNames.forEach((modelName) => {
        deviceNameArr.push((this.newDeviceForm({ deviceModel: modelName })));
      });
      this.form.setControl('deviceNameArr', deviceNameArr);
    });
  }


  ngOnInit() {
    if (this.detailId) {
      this.form = this.fb.group({
        materialClass: [{ value: null, disabled: true }, [Validators.required, this.isSelectedThirdClass]],
        materialName: [{ value: null, disabled: true }, [Validators.required]],
        materialId: [{ value: null, disabled: true }, [Validators.required]],
        deviceNameArr: this.fb.array([])
      });
    } else {
      this.form = this.fb.group({
        materialClass: [null, [Validators.required, this.isSelectedThirdClass]],
        materialName: [null, [Validators.required]],
        materialId: [null, [Validators.required]],
        deviceNameArr: this.fb.array([])
      });
    }
    this.deviceNameTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [
        { title: '设备名称', field: 'name', width: 150 },
        { title: '操作', tdTemplate: this.chooseDeviceName, width: 60 }
      ]
    };
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
    this.addDeviceName();
    if (this.detailId) {
      this.getDetail();
    }
  }

}
