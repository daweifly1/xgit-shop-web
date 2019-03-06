import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialManageService, MaterialManageServiceNs } from '../../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { Services } from '@angular/core/src/view';
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
enum PageType {
  ManagePage = 0,
  DetailPage = 1
}
@Component({
  selector: 'app-material-setting-detail',
  templateUrl: './material-setting-detail.component.html',
  styleUrls: ['./material-setting-detail.component.scss']
})
export class MaterialSettingDetailComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;
  tabPageType = PageType;
  selectedPage: number;
  // form: FormGroup;
  supplyRangeType: SupplyRange[];
  divideWorkId: DivideWorkId[];
  taxRate: number;
  assemblyOrPart: number;
  shortDress: number;
  materialClassId: any;
  materialClassArry: any[];
  selectClassIdArry: string[];
  isSparePart: boolean;
  choosedEquipmentList: any[];
  editMaterialClassId: string;
  /**
   * 使用情况表格数据
   */
  serviceConditionData: any;
  /**
   * 查看使用情况传参：物料id
   */
  materialId: string;

  /**
   * 查看厂矿物料详情id
   */
  materialDetailId: string;

  /**
   * 详情字段
   */
  headerFieldList: { name: string; field: string; pipe?: string }[];
  detailData: any;

  constructor(private fb: FormBuilder,
    private messageService: ShowMessageService, private materialManageService: MaterialManageService) {
    this.finish = new EventEmitter<any>();
    this.divideWorkId = [
      { id: 1, name: '风机' },
      { id: 2, name: '空压机' },
      { id: 3, name: '汞' },
      { id: 4, name: '阀' },
      { id: 5, name: '铲运机' }
    ];
    this.supplyRangeType = [
      { id: 1, name: '风机' },
      { id: 2, name: '空压机' },
      { id: 3, name: '汞' },
      { id: 4, name: '阀' },
      { id: 5, name: '铲运机' }
    ];
    this.taxRate = 1;
    this.assemblyOrPart = 0;
    this.shortDress = 0;
    this.materialClassId = [];
    this.selectClassIdArry = [];
    this.isSparePart = false;
    this.choosedEquipmentList = [];
    this.editMaterialClassId = '';
    this.serviceConditionData = [];
    this.selectedPage = this.tabPageType.ManagePage;
    this.headerFieldList = [
      { name: '物料编码', field: 'code' },
      { name: '物料类别', field: 'materialType', pipe: 'materialType2' },
      { name: '物料分类', field: 'fullClassName' },
      { name: '物料名称', field: 'name' },
      { name: '型号规格规范', field: 'specificationModel' },
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
    this.detailData = {};
  }
  public trackByNewsId(index: number, item: any) {
    return item.id;
  }

  getItemData = () => {
    this.messageService.showLoading();
    this.materialManageService.getMaterialSettingItem(this.detailId).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialId = resData.value.id;
      this.detailData = resData.value;
      if (this.detailData.materialType === 2) {
        this.headerFieldList.push({ name: '设备名称', field: 'deviceName' });
        this.headerFieldList.push({ name: '设备型号', field: 'deviceModel' });
      }
      this.editMaterialClassId = resData.value.materialClassId;
      this.viewUsage();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public viewUsage() {
    // 拉取表格数据
    this.materialManageService.getServiceConditionList(
      { materialId: this.materialId }).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.serviceConditionData = resData.value;
      });

  }
  public materialDetail(id) {
    this.selectedPage = this.tabPageType.DetailPage;
    this.materialDetailId = id;
  }

  public emitFinish() {
    this.finish.emit();
  }
  backToList(): void {
    this.selectedPage = this.tabPageType.ManagePage;
  }
  ngOnInit() {
    this.getItemData();
  }

}
