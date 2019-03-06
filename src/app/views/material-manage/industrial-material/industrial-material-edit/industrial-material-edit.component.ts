import { managementMode } from './../../../../../environments/map-data';
import { Component, OnInit, EventEmitter, Output, Input, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FactoryMineService, FactoryMineServiceNs } from '../../../../core/trans/factoryMine.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { UserService } from '../../../../core/common-services/user.service';
enum MaterialType {
  Material,
  SparePart,
  Equipment
}
interface MaterialInfo {
  materialCode?: string; // 物料编码
  materialType?: number; // 物料类别
  materialClassId?: string; // 物料分类
  deviceName?: string; // 设备名称
  name?: string; // 物料名称
  specificationModel?: string; // 规格型号
  unit?: string; // 计量单位
  drawingNumber?: string; // 零件号/图号
  material?: string; // 材质
  brand?: string; // 品牌
  importOrDomestic?: string; // 进口或国产
  importance?: string; // 重要程度
  materialClassification?: string; // 物资分类
  taxRate?: string; // 增值税税率
  planPrice?: string; // 计划价
  assemblyOrPart?: string; // 总成或部装
  shortDress?: string; // 允许溢短装
  divideWorkId?: string; // 分工管理
  supplyRange?: string; // 所属供应范围
  // 提前采购期
}
interface LocationType {
  name?: string;
  userId?: string;
}
enum MaxLenInputEnum {
  Default = 20,
}
@Component({
  selector: 'app-industrial-material-edit',
  templateUrl: './industrial-material-edit.component.html',
  styleUrls: ['./industrial-material-edit.component.scss']
})
export class IndustrialMaterialEditComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Output() ok: EventEmitter<any>;
  @Input() detailId: string;
  @ViewChild('chooseLocation') chooseLocation: TemplateRef<any>;
  @ViewChild('chooseSalesman') chooseSalesman: TemplateRef<any>;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
  @ViewChild('chooseDivision') chooseDivision: TemplateRef<any>;
  materialInfo: any;
  managementModel: number;
  form: FormGroup;
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
  /**
   * 分工管理下拉数据
   */
  factoryManagementList: any[];
  /**
 * 计划员相关
 */
  salesmanVisible: boolean;
  salesmanTableConfig: UfastTableNs.TableConfig;
  salesmanDataList: any[];
  /**
  * 保管员相关
  */
  keeperNameVisible: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];
  maxLenInputEnum = MaxLenInputEnum;
  /**
   * 分工管理相关
   */
  divisionVisible: boolean;
  divisionTableConfig: UfastTableNs.TableConfig;
  divisionDataList: any[];
  constructor(private fb: FormBuilder,
    private messageService: ShowMessageService, private factoryMineService: FactoryMineService,
    private userService: UserService) {
    this.finish = new EventEmitter<any>();
    this.materialInfo = {};
    this.managementModel = 1;
    this.locationFlag = 1;
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
    this.factoryManagementList = [];
    this.salesmanVisible = false;
    this.salesmanDataList = [];
    this.keeperNameVisible = false;
    this.keeperNameDataList = [];
    this.divisionVisible = false;
    this.divisionDataList = [];
  }
  /**
   * 获取分工管理下拉框数据
   */
  public showSalesmanModel() {
    this.salesmanVisible = true;
    this.getSalesmanDataList();
  }
  public handleCancelSalesman() {
    this.salesmanVisible = false;
  }
  getSalesmanDataList = () => {
    const data = {
      pageNum: this.salesmanTableConfig.pageNum,
      pageSize: this.salesmanTableConfig.pageSize,
      filters: {
        roleName: '保管员'
      }
    };
    this.salesmanTableConfig.loading = true;
    this.userService.getUserList(data).subscribe((resData: any) => {
      this.salesmanTableConfig.loading = false;
      this.salesmanDataList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = {};
        temp = item;
        temp['_this'] = temp;
        this.salesmanDataList.push(temp);
      });
      this.salesmanTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.salesmanTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseSalesmanFun(item) {
    this.form.controls['plannerId'].patchValue(item.userId);
    this.form.controls['planner'].patchValue(item.name);
    this.handleCancelSalesman();
  }

  public showKeeperNameModel() {
    this.keeperNameVisible = true;
    this.getKeeperNameDataList();
  }
  public handleCancelKeeperName() {
    this.keeperNameVisible = false;
  }
  getKeeperNameDataList = () => {
    const data = {
      pageNum: this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        roleName: '保管员'
      }
    };
    this.keeperNameTableConfig.loading = true;
    this.userService.getUserList(data).subscribe((resData: any) => {
      this.keeperNameTableConfig.loading = false;
      this.keeperNameDataList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = {};
        temp = item;
        temp['_this'] = temp;
        this.keeperNameDataList.push(temp);
      });
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.keeperNameTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseKeeperNameFun(item) {
    this.form.controls['keeperId'].patchValue(item.userId);
    this.form.controls['keeperName'].patchValue(item.name);
    this.handleCancelKeeperName();
  }
  getFactoryManagementList = () => {
    this.divisionTableConfig.loading = true;
    const filter = {
      pageNum: this.divisionTableConfig.pageNum,
      pageSize: this.divisionTableConfig.pageSize,
      filters: {}
    };
    this.factoryMineService.getDivisionDataList(filter).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.divisionTableConfig.loading = false;
      this.factoryManagementList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.factoryManagementList.push(temp);
      });
      this.factoryManagementList = resData.value.list;
      this.divisionTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.divisionTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public divisionChange(id) {
    if (!id) {
      return;
    }
    this.messageService.showLoading();
    this.factoryMineService.getDivisionItem(id).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.form.patchValue({
        planner: resData.value.salesmanName,
        plannerId: resData.value.salesmanId,
        keeperName: resData.value.keeperName,
        keeperId: resData.value.keeperId
      });
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackById(index: number, item: any) {
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
      this.form.patchValue(resData.value);
        this.managementModel = resData.value.managementMode;
      this.form.get('divisionId').valueChanges.subscribe((data) => {
        this.divisionChange(data);
      });
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public save() {
    this.form.controls['managementMode'].patchValue(this.managementModel);
    if (this.form.controls['managementMode'].invalid) {
      this.messageService.showToastMessage('请选择物料管理模式', 'warning');
      return;
    }
    Object.keys(this.form.controls).forEach((key: string) => {
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    });
    if (this.form.invalid) {
      return;
    }
    const data = this.form.value;
    this.messageService.showLoading();
    this.factoryMineService.industrialMaterialEdit(data)
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
  showDivisionModal(): void {
    this.divisionVisible = true;
    this.getFactoryManagementList();
  }
  handleCancelDivision(): void {
    this.divisionVisible = false;
  }
  public chooseDivisionFun(ctx) {
    this.form.patchValue(<any>{
      divisionId: ctx.id,
      divisionName: ctx.divisionName
    });
    this.handleCancelDivision();
  }
  public clearDivision() {
    this.form.patchValue({
      divisionId: '',
      divisionName: ''
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  ngOnInit() {
    this.form = this.fb.group({
      id: [{ value: this.detailId }],
      materialCode: [{ value: this.materialInfo.code }],
      // purchasingGroupName: [null],
      purchasingGroupId: [null],
      planDec: [null],
      oldCode: [null],
      managementMode: [{ value: null }, [Validators.required]],
      divisionId: [null],
      divisionName: [null],
      planner: [null, [Validators.required]],
      plannerId: [null, [Validators.required]],
      keeperName: [null, [Validators.required]],
      keeperId: [null, [Validators.required]]
    });
    this.getItemData();
    this.salesmanTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '计划员名称', field: 'name', width: 100 },
      { title: '计划员编号', field: 'userId', width: 100 },
      { title: '操作', tdTemplate: this.chooseSalesman, width: 60 }
      ]
    };
    this.keeperNameTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '保管员名称', field: 'name', width: 100 },
      { title: '保管员编号', field: 'userId', width: 100 },
      { title: '操作', tdTemplate: this.chooseKeeperName, width: 60 }
      ]
    };
    this.divisionTableConfig = {
      pageSize: 10,
      yScroll: 100,
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

  }

}
