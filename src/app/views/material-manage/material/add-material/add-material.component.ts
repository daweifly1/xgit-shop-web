import { Component, EventEmitter, Input, OnInit, Output, ViewChild, TemplateRef } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { FactoryMineService, FactoryMineServiceNs } from '../../../../core/trans/factoryMine.service';
import { MaterialManageService, MaterialManageServiceNs } from '../../../../core/trans/materialManage.service';
interface TabPageType {
  ManagePage: number;
  NameMatchPage: number;
}
enum MaxLenInputEnum {
  Default = 50
}
@Component({
  selector: 'app-factory-material-add',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.scss']
})
export class FactoryMaterialAddComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  tabPageType: TabPageType;
  selectedPage: number;
  @Output() finish: EventEmitter<any>;
  @Output() materialName: string;
  @Input() materialInfo: any;
  beforeNameIndex: number;
  beforeNameDataSet: any[];
  // beforeNameDataSet: {
  //   id?: string;
  //   materialId?: string;
  //   materialDesc?: string;
  //   materialType?: string;
  //   firstLevel?: string;
  //   secondLevel?: string;
  //   thirdLevel?: string;
  //   firstType?: string;
  //   secondType?: string;
  //   thirdType?: string;
  //   materialClassId?: string;
  //   name?: string;
  //   formerNameArray?: any;
  //   formerName?: string; // 曾用名
  //   unit?: string;
  //   unitCode?: string;
  //   deviceName?: string; // 主机名称
  //   deviceId?: string; // 主机ID
  //   deviceModel?: string; // 主机型号
  //   originalSpecificationModel?: string; // 型号规格规范
  //   specificationModel?: string; // 型号规格
  //   drawingNumber?: string; // 零件号/图号
  //   material?: string; // 材质
  //   brand?: string; // 品牌
  //   importOrDomestic?: string; // 进口国产,下拉框
  //   importance?: string; // 重要度，下拉框
  //   materialClassification?: string; // 物资分类，下拉框
  //   assemblyOrPart?: string; // 总成
  //   _checked?: boolean;
  //   fullClassName?: string;   // 分类，x/x/x
  // }[];
  unitType: any;
  tableConfig: {
    materialDesc?: string;
    materialType: string;
    typeName: string;
    name: string;
    formerName: string; // 曾用名
    unit: string;
    deviceName: string; // 主机名称
    deviceModel: string; // 主机型号
    specificationModel: string; // 型号规格
    drawingNumber: string; // 零件号/图号
    material: string; // 材质
    brand: string; // 品牌
    importOrDomestic: string; // 进口国产,下拉框
    importance: string; // 重要度，下拉框
    materialClassification: string; // 物资分类，下拉框
    assemblyOrPart: number; // 总成
    _checked: boolean;
  };
  allChecked = false;
  indeterminate = false;
  flag: number;
  deviceNameList: any[];

  /**
 * 选择设备型号
 */
  choosedEquipmentList: any[];
  submitMaterialClassId: string;  // 新增备件时的物料分类
  isVisible: boolean;
  deviceModelTableConfig: UfastTableNs.TableConfig;
  deviceModelDataList: any[];
  @ViewChild('chooseDeviceModel') chooseDeviceModel: TemplateRef<any>;
  selectData: any;

  constructor(private factoryMinService: FactoryMineService, private messageService: ShowMessageService,
    private materialManageService: MaterialManageService) {
    this.tabPageType = {
      ManagePage: 0,
      NameMatchPage: 1
    };
    this.selectedPage = this.tabPageType.ManagePage;
    this.finish = new EventEmitter<any>();
    this.beforeNameIndex = 1;
    this.unitType = [];
    this.flag = 1;
    this.tableConfig = <any>{};
    this.beforeNameDataSet = <any>[];
    this.deviceNameList = [];
    this.choosedEquipmentList = [];
    this.submitMaterialClassId = '';
  }
  getUnitType = (deviceId) => {
    const filter = {
      materialId: deviceId
    };
    this.factoryMinService.getUnitTypePage(filter).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.unitType = resData.value.list || [];
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
      return;
    });
  }
  getData = () => {
    this.materialInfo.forEach((item) => {
      // if (item['materialType'] === FactoryMineServiceNs.MaterialTemplateType.DevicePart) {
      //   this.beforeNameDataSet = [...this.beforeNameDataSet, {
      //     id: item['id'],
      //     materialId: item['deviceTemplateVO'].id,
      //     materialDesc: item['materialName'] + '|' + item['unit'] + '|' + (item['modelSpecification'] || ''),
      //     materialType: item['materialType'],
      //     firstLevel: item['firstLevel'],
      //     secondLevel: item['secondLevel'],
      //     thirdLevel: item['thirdLevel'],
      //     firstType: item['firstType'],
      //     secondType: item['secondType'],
      //     thirdType: item['thirdType'],
      //     name: item['materialName'],
      //     formerNameArray: item['materialUserdNamesVOS'],
      //     formerName: ``,
      //     unit: item['unit'],
      //     deviceName: ``,
      //     // deviceName: item['deviceTemplateVO']['materialName'],
      //     // deviceId: item['deviceTemplateVO']['id'],
      //     deviceId: ``,
      //     deviceModel: ``,
      //     originalSpecificationModel: item['modelSpecification'] || '',
      //     specificationModel: item['modelSpecification'] || '',
      //     drawingNumber: ``,
      //     material: ``,
      //     brand: ``,
      //     importOrDomestic: ``,
      //     importance: `2`,
      //     materialClassification: ``,
      //     assemblyOrPart: ``,
      //     _checked: false
      //   }];
      // }
      if (item['materialType'] === FactoryMineServiceNs.MaterialTemplateType.DevicePart) {
        this.beforeNameDataSet = [...this.beforeNameDataSet, {
          id: item['id'],
          materialId: null,
          // materialDesc: item['materialName'] + '|' + item['unit'] + '|' + (item['modelSpecification'] || ''),
          materialType: item['materialType'],
          firstLevel: null,
          secondLevel: null,
          thirdLevel: null,
          firstType: null,
          secondType: null,
          thirdType: null,
          materialClassId: item['materialClassId'],
          fullClassName: null,
          name: item['materialName'],
          formerNameArray: item['materialUserdNamesVOS'],
          formerName: null,
          unit: item['unit'],
          unitCode: item['unitCode'],
          deviceName: null,
          // deviceName: item['deviceTemplateVO']['materialName'],
          // deviceId: item['deviceTemplateVO']['id'],
          deviceId: null,
          deviceModel: null,
          originalSpecificationModel: item['modelSpecification'] || null,
          specificationModel: item['modelSpecification'] || null,
          drawingNumber: null,
          material: null,
          brand: null,
          importOrDomestic: null,
          importance: 2,
          materialClassification: null,
          assemblyOrPart: 0,
          _checked: false
        }];
      } else {
        this.beforeNameDataSet = [...this.beforeNameDataSet, {
          id: item['id'],
          // materialDesc: item['materialName'] + '|' + item['unit'] + '|' + (item['modelSpecification'] || ''),
          materialType: item['materialType'],
          firstLevel: item['firstLevel'],
          secondLevel: item['secondLevel'],
          thirdLevel: item['thirdLevel'],
          firstType: item['firstType'],
          secondType: item['secondType'],
          thirdType: item['thirdType'],
          materialClassId: item['materialClassId'],
          fullClassName: item['fullClassName'],
          name: item['materialName'],
          // formerNameArray: item['materialUserdNamesVOS'].materialTemplateUsedName,
          formerNameArray: item['materialUserdNamesVOS'],
          formerName: null,
          unit: item['unit'],
          unitCode: item['unitCode'],
          originalSpecificationModel: item['modelSpecification'],
          specificationModel: item['modelSpecification'],
          drawingNumber: null,
          material: null,
          brand: null,
          importOrDomestic: null,
          importance: 2,
          materialClassification: null,
          assemblyOrPart: 0,
          _checked: false
        }];
      }
    });

  }

  // table相关方法
  addRow(): void {
    this.beforeNameIndex++;
    this.beforeNameDataSet = [...this.beforeNameDataSet, {
      id: this.flag + '',
      // materialDesc: null,
      materialType: null,
      firstLevel: null,
      secondLevel: null,
      thirdLevel: null,
      firstType: null,
      secondType: null,
      thirdType: null,
      materialClassId: null,
      fullClassName: null,
      name: `选择`,
      formerNameArray: null,
      formerName: null,
      unit: null,
      unitCode: null,
      deviceName: null,
      deviceModel: null,
      originalSpecificationModel: null,
      specificationModel: null,
      drawingNumber: null,
      material: null,
      brand: null,
      importOrDomestic: null,
      importance: null,
      materialClassification: null,
      assemblyOrPart: null,
      _checked: false
    }];
    this.flag++;
  }

  deleteRow(i: number): void {
    this.beforeNameDataSet = this.beforeNameDataSet.filter((item, index, array) => {
      return i !== index;
    });
  }
  public deleteBranch() {
    const selectData = [];
    this.beforeNameDataSet.forEach((item) => {
      if (item._checked === true) {
        selectData.push(item);
      }
    });
    if (selectData.length === 0) {
      this.messageService.showToastMessage('请选择要删除的数据', 'warning');
      return;
    }
    selectData.forEach((item) => {
      this.beforeNameDataSet = this.beforeNameDataSet.filter((value) => {
        return value.id !== item.id;
      });
    });
  }


  refreshStatus(): void {
    this.allChecked = this.beforeNameDataSet.every((item) => {
      return item._checked === true;
    });
  }

  checkAll(value: boolean): void {
    this.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    this.beforeNameDataSet.forEach(data => data._checked = value);
    this.refreshStatus();
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.beforeNameDataSet.length; i < len; i++) {
      this.beforeNameDataSet[i]._checked = isAllChoose;
    }
  }



  public goback(value) {
    this.emitFinish(value);
  }
  public emitFinish(value) {
    this.finish.emit(value);

  }
  public onChildPageFinish() {
    this.selectedPage = this.tabPageType.ManagePage;
  }
  public nameMatch(name: string) {
    if (name === '选择') {
      this.messageService.showToastMessage('请选择物料名称', 'warning');
      return;
    }
    this.materialName = name;
    this.selectedPage = this.tabPageType.NameMatchPage;
  }
  public handInBatch() {
    const selectData = [];
    this.beforeNameDataSet.forEach((item) => {
      if (item._checked === true) {
        selectData.push(item);
      }
    });
    if (selectData.length === 0) {
      this.messageService.showToastMessage('请选择要提报的数据', 'warning');
      return;
    }
    let nameFlag = false;
    selectData.forEach((item) => {
      if (item.name === '选择') {
        nameFlag = true;
        return;
      }
      // item.materialDesc = item.name + '-'
      //   + item.unit + '-' + item.specificationModel + '-' + item.material + '-' + item.brand;

    });
    if (nameFlag) {
      this.messageService.showToastMessage('请先选择物料名称', 'warning');
      return;
    }

    let importanceFlag = false;
    let specificationModelFlag = false;
    selectData.forEach((item) => {
      if (!item.importance) {
        importanceFlag = true;
        return;
      }
      if (!item.specificationModel && !item.drawingNumber) {
        specificationModelFlag = true;
        return;
      }
    });
    if (importanceFlag) {
      this.messageService.showToastMessage('重要程度必填', 'warning');
      return;
    }
    if (specificationModelFlag) {
      this.messageService.showToastMessage('型号规格,零件号/图号至少填一项', 'warning');
      return;
    }
    let deviceModelFlag = false;
    selectData.forEach((item) => {
      if ((item.materialType === 2) && !item.deviceModel) {
        deviceModelFlag = true;
        return;
      }
    });
    if (deviceModelFlag) {
      this.messageService.showToastMessage('物料类别为专用备件的主机型号必填', 'warning');
      return;
    }
    this.messageService.showLoading();
    this.factoryMinService.batchAddMaterialReport(selectData).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.emitFinish(true);
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public handIn(id: string) {
    if (id.length === 0) {
      this.messageService.showToastMessage('请选择物料名称', 'warning');
      return;
    }
    let data = {};
    this.beforeNameDataSet.forEach((item) => {
      if (item.id === id) {
        data = item;
      }
    });
    if (data['name'] === '选择') {
      this.messageService.showToastMessage('请选择物料名称', 'warning');
      return;
    }
    if (!data['importance']) {
      this.messageService.showToastMessage('重要程度必填', 'warning');
      return;
    }
    if (data['materialType'] === 2 && !data['deviceModel']) {
      this.messageService.showToastMessage('主机型号必填', 'warning');
      return;
    }
    if (!data['specificationModel'] && !data['drawingNumber']) {
      this.messageService.showToastMessage('型号规格,零件号/图号至少填一项', 'warning');
      return;
    }
    if (data['materialType'] !== 2) {
      data['deviceName'] = '';
      data['deviceModel'] = '';
      data['deviceId'] = '';
    }
    // data['materialDesc'] = data['name'] + '|'
    //   + data['deviceName'] + '&' + data['deviceModel'] + '|' + data['specificationModel'] + '|'
    //   + data['drawingNumber'] + '|' + data['material'] + '|' + data['importOrDomestic'] + '|' + data['brand'];
    this.messageService.showLoading();
    this.factoryMinService.addMaterialReport(data).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.emitFinish(true);
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  getDeviceName = () => {
    this.deviceNameList = [];
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  getMaterialEquipmentList(id?: any) {
    this.choosedEquipmentList = [];
    const data = <any>{};
    if (id instanceof Array) {
      data.firstType = id[0];
      data.secondType = id[1];
      data.thirdType = id[2];
    }
    data.materialType = '3';
    this.materialManageService.getMaterialEquimentList(data).subscribe((resData) => {
      this.choosedEquipmentList = resData.value;
    });
  }
  public deviceIdChange(deviceId: string, data) {
    const temp = this.choosedEquipmentList.filter((item) => {
      return item.id === deviceId;
    });
    data.deviceName = temp[0].materialName;
    data.fullClassName = temp[0].fullClassName;
    data.deviceModel = '';
    data.materialClassId = temp[0].materialClassId;
  }

  showDeviceModelModal(data): void {
    this.selectData = data;
    if (!this.selectData.deviceId) {
      this.messageService.showToastMessage('请先选择主机名称', 'warning');
      return;
    }
    this.isVisible = true;
    this.getDeviceModelData(data);
  }
  getDeviceModelData = (data?: any) => {
    const filter = {
      pageNum: this.deviceModelTableConfig.pageNum,
      pageSize: this.deviceModelTableConfig.pageSize,
      filters: {
        materialId: data.deviceId
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
    this.selectData.deviceModel = item;
    this.handleCancel();
  }


  ngOnInit(): void {
    this.getData();
    this.getMaterialEquipmentList();
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
  }
}
