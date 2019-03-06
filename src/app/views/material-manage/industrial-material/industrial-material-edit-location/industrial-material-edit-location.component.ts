import { Component, OnInit, EventEmitter, Output, Input, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FactoryMineService, FactoryMineServiceNs } from '../../../../core/trans/factoryMine.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';

interface LocationType {
  name?: string;
  userId?: string;
}
@Component({
  selector: 'app-industrial-material-edit-location',
  templateUrl: './industrial-material-edit-location.component.html',
  styleUrls: ['./industrial-material-edit-location.component.scss']
})
export class IndustrialMaterialEditLocationComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Output() ok: EventEmitter<any>;
  @Input() detailId: string;
  @ViewChild('chooseLocation') chooseLocation: TemplateRef<any>;
  materialInfo: any;
  factoryInformation: any;
  managementModel: number;
  form: FormGroup;
  locationDataSet: {
    id: string,
    storageSpaceId: string,
    storageCode: string,
    keeperId: string,
    keeperName: string,
    isDefault: number,
    _checked: boolean,
    materialId: string
  }[];
  locationDataList: any[];
  locationFilter: LocationType;
  locationFlag: number;
  selectLocationId: string;   // 选中的储位行

  taxRate: number;
  assemblyOrPart: number;
  shortDress: number;
  placeholder: string;

  /**物料类别 */
  materialTypeList: any[];
  /**采购组 */
  purchasingGroupList: any[];
  constructor(private fb: FormBuilder,
    private messageService: ShowMessageService, private factoryMineService: FactoryMineService) {
    this.finish = new EventEmitter<any>();
    this.materialInfo = {};
    this.managementModel = 1;
    this.locationFlag = 1;
    this.locationDataSet = [
      {
        id: this.locationFlag + '',
        storageSpaceId: '',
        storageCode: '选择',
        keeperId: '',
        keeperName: '',
        isDefault: 0,
        _checked: false,
        materialId: this.detailId
      }
    ];
    this.selectLocationId = '';
    this.taxRate = 1;
    this.assemblyOrPart = 0;
    this.shortDress = 0;
    this.placeholder = '请选择储位';
    this.materialTypeList = [
      { value: '1', label: '材料' },
      { value: '2', label: '备件' },
      { value: '3', label: '设备' }
    ];
    this.purchasingGroupList = [
      { value: '1', label: '材料采购组' },
      { value: '2', label: '备件采购组' },
      { value: '3', label: '设备采购组' }
    ];
    this.factoryInformation = <any>{};
  }

  public trackByNewsId(index: number, item: any) {
    return item.id;
  }
  formatterPercent = value => `${value} %`;
  parserPercent = value => value.replace(' %', '');

  // 详情
  getItemData = () => {
    this.messageService.showLoading();
    this.factoryMineService.getIndustrialMaterialDetail(this.detailId).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.materialInfo = resData.value.materialVO;
      this.factoryInformation = resData.value;
      this.form.patchValue(resData.value);
      this.locationDataSet = resData.value.factoryMaterialSpaceVOS;
      this.locationDataSet.forEach((item) => {
        if (item.isDefault === 1) {
          item._checked = true;
        }
      });
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  /*曾用名table相关方法*/
  addRow(): void {
    this.locationFlag++;
    this.locationDataSet = [...this.locationDataSet, {
      id: this.locationFlag + '',
      storageSpaceId: ``,
      storageCode: '选择',
      keeperId: ``,
      keeperName: ``,
      isDefault: 0,
      _checked: false,
      materialId: this.detailId
    }];
  }
  deleteRow(i: number) {
    this.messageService.showAlertMessage('', '确定要删除吗', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.locationDataSet = this.locationDataSet.filter((item, index, array) => {
        return i !== index;
      });
    });

  }

  refreshStatus(event, id): void {
    this.locationDataSet.forEach((item) => {
      item._checked = false;
      item.isDefault = 0;
    });
    this.locationDataSet.forEach((item) => {
      if (item.id === id) {
        item._checked = true;
        item.isDefault = 1;
      }
    });
  }
  public save() {
    let keeperNameFlag = false;
    Object.keys(this.form.controls).forEach((key: string) => {
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    });
    if (this.form.invalid) {
      return;
    }
    if (this.locationDataSet.length === 0) {
      this.messageService.showToastMessage('请添加储位信息', 'warning');
      return;
    }
    this.locationDataSet.forEach((item) => {
      if (item.keeperName === '') {
        this.messageService.showToastMessage('请先选择储位', 'warning');
        keeperNameFlag = true;
        return;
      }
    });
    if (keeperNameFlag) {
      return;
    }
    const data = this.form.value;
    data.factoryMaterialSpaceVOS = this.locationDataSet;
    this.messageService.showLoading();
    this.factoryMineService.industrialMaterialEditLocation(data)
      .subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
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
  public emitFinish() {
    this.finish.emit();
  }
  public location(event) {
    event.forEach((item) => {
      this.locationDataSet.forEach((locationItem) => {
        if (item.code === locationItem.storageCode) {
          locationItem.keeperId = item.keeperId;
          locationItem.keeperName = item.keeperName;
          locationItem.storageSpaceId = item.id;
        }
      });
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      id: [{ value: this.detailId }],
      materialCode: [{ value: this.materialInfo.code }],
    });
    this.getItemData();
  }

}
