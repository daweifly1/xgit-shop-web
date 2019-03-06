import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FactoryMineService, FactoryMineServiceNs } from '../../../../core/trans/factoryMine.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
enum MaterialType {
  Material,
  SparePart,
  Equipment
}
@Component({
  selector: 'app-factory-material-detail',
  templateUrl: './industrial-material-detail.component.html',
  styleUrls: ['./industrial-material-detail.component.scss']
})
export class FactoryMaterialDetailComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;

  factoryInformation: any;
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
    /**
   * 详情字段
   */
  headerFieldList: { name: string; field: string; pipe?: string }[];
  materialInfo: any;
  constructor(private fb: FormBuilder,
    private messageService: ShowMessageService, private factoryMineService: FactoryMineService) {
    this.finish = new EventEmitter<any>();
    this.materialInfo = {};
    this.factoryInformation = {};
    this.headerFieldList = [
      { name: '物料编码', field: 'code' },
      { name: '物料类别', field: 'materialType', pipe: 'materialType2' },
      { name: '物料分类', field: 'fullClassName' },
      { name: '物料名称', field: 'name' },
      { name: '规格型号', field: 'specificationModel' },
      { name: '计量单位', field: 'unit' },
      { name: '零件号/图号', field: 'drawingNumber' },
      { name: '材质', field: 'material' },
      { name: '品牌', field: 'brand' },
      { name: '进口或国产', field: 'importOrDomestic' },
      { name: '重要程度', field: 'importance' },
      { name: '物资分类', field: 'materialClassification' },
      { name: '进项税', field: 'inputTaxRate' },
      { name: '销项税', field: 'outputTaxRate' },
      { name: '计划价(元)', field: 'planPrice' },
      { name: '总成或部装', field: 'assemblyOrPart', pipe: 'assemblyOrPart' },
      { name: '分工管理', field: 'divideWork' },
      { name: '允许溢短装', field: 'shortDress', pipe: 'shortDress' },
      { name: '所属供应范围', field: 'supplyRange' }
    ];

  }
  public trackByNewsId(index: number, item: any) {
    return item.id;
  }

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
      if (this.materialInfo.materialType === 2) {
        this.headerFieldList.push({ name: '设备名称', field: 'deviceName' });
        this.headerFieldList.push({ name: '设备型号', field: 'deviceModel' });
      }
      this.factoryInformation = resData.value;
      this.locationDataSet = resData.value.factoryMaterialSpaceVOS;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public emitFinish() {
    this.finish.emit();
  }
  ngOnInit() {
    this.getItemData();

  }

}
