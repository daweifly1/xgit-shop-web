import { Component, EventEmitter, OnInit, Output, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { InventoryService, InventoryServiceNs } from '../../../../core/trans/inventory.service';
import { RightSideTableBoxNs, UfastTableNs } from '../../../../layout/layout.module';
enum InventoryWay {
  warehouse,
  keeper,
  areas,
  material
}
@Component({
  selector: 'app-addinventory',
  templateUrl: './addinventory.component.html',
  styleUrls: ['./addinventory.component.scss']
})

export class AddinventoryComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  rightTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;
  inventoryTypeForm: FormGroup;
  tableConfig: UfastTableNs.TableConfig;
  materialTableConfig: UfastTableNs.TableConfig;
  inventoryType = 0;
  dateFormat: 'yyyy-MM-dd';
  plannedDate: string;
  areasValue: string;
  wareHouseData: any[]; // 底部用于展示数据的列表
  materialDataList: any[]; // 点击选择物料显示侧边栏的物料

  areasOptionData: any[];
  wareHouseDataList: any[];
  previewMaterialShow: boolean; // 点击预览让选中仓库获取的数据显示隐藏
  warehouseCode: number;
  warehouseId: number;
  show: boolean;
  chooseWareHousePreview: boolean; // 用户点击下拉框选择仓库的时候设为true，此时可以预览数据
  selectedList: number[];

  inventoryWay = InventoryWay;

  /**
   * 选择仓库
   */
  warehouseTableConfig: UfastTableNs.TableConfig;
  isVisible: boolean;
  warehouseDataList: any[];
  @ViewChild('chooseWareHouse') chooseWareHouse: TemplateRef<any>;

  /**
   * 选择库区
  */
  warehouseAreaTableConfig: UfastTableNs.TableConfig;
  isVisibleReservoir: boolean;
  reservoirDataList: any[];

  /**
   * 选择保管员
  */
  keeperTableConfig: UfastTableNs.TableConfig;
  isVisibleKeeper: boolean;
  keeperDataList: any[];

  barcodeFlagList: any[];
  barcodeFlag: number;
  chooseMaterialList: any[];
  selectWarehouseCode: string;
  /**
   * 侧边栏物料搜索条件
   */
  materialFilter: any;

  constructor(private formBuilder: FormBuilder,
    private messageService: ShowMessageService,
    private inventoryService: InventoryService) {
    this.selectedList = [];
    this.finish = new EventEmitter<any>();
    this.wareHouseData = [];
    this.materialDataList = [];
    this.areasOptionData = [];
    this.wareHouseDataList = [];
    this.previewMaterialShow = false;
    this.chooseWareHousePreview = false;
    this.rightTableEmit = new EventEmitter();

    this.reservoirDataList = [];
    this.barcodeFlagList = [
      { label: '是', value: 1 },
      { label: '否', value: 0 },
    ];
    this.barcodeFlag = 0;
    this.selectWarehouseCode = '';
    this.materialFilter = <any>{};
  }
  disabledEnd = (plannedDate: Date) => {
    if (!plannedDate || !new Date()) {
      return false;
    }
    return plannedDate.getTime() <= new Date().getTime();
  }

  public emitFinish() {
    this.finish.emit();
  }

  public radioChange() {
    this.wareHouseDataList = [];
    this.inventoryTypeForm.reset();
    this.previewMaterialShow = false;
    this.chooseWareHousePreview = false;
    if (this.inventoryType === this.inventoryWay.keeper) {
      this.inventoryTypeForm.addControl('keeperName', this.formBuilder.control(null, [Validators.required]));
      this.inventoryTypeForm.addControl('keeperId', this.formBuilder.control(null, [Validators.required]));
      this.inventoryTypeForm.removeControl('areas');
    } else if (this.inventoryType === this.inventoryWay.areas) {
      this.inventoryTypeForm.addControl('areas', this.formBuilder.control(null, [Validators.required]));
      this.inventoryTypeForm.removeControl('keeperName');
      this.inventoryTypeForm.removeControl('keeperId');
    } else if (this.inventoryType === this.inventoryWay.warehouse) {
      this.inventoryTypeForm.removeControl('keeperName');
      this.inventoryTypeForm.removeControl('keeperId');
      this.inventoryTypeForm.removeControl('areas');
    } else if ( this.inventoryType === this.inventoryWay.material) {
      this.inventoryTypeForm.removeControl('keeperId');
      this.inventoryTypeForm.removeControl('areas');
      this.inventoryTypeForm.addControl('keeperName', this.formBuilder.control(null, [Validators.required]));
      // this.inventoryTypeForm.addControl('keeperId', this.formBuilder.control(null, [Validators.required]));

    }
  }

  // 获取仓库列表
  getWareHouseList = () => {
    this.wareHouseData = [];
    const data = {
      pageSize: this.warehouseTableConfig.pageSize,
      pageNum: this.warehouseTableConfig.pageNum,
      filters: {
        houseLevel: 1,
        pId: '0'
      }
    };
    this.messageService.showLoading();
    this.inventoryService.getWareHouseList(data).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      // this.wareHouseData = resData.value.list;
      resData.value.list.forEach((item) => {
        let temp = {};
        temp = item;
        temp['_this'] = temp;
        this.wareHouseData.push(temp);
      });
      this.warehouseTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackById(item: any, index: number) {
    return item.code;
  }
  // 选中仓库后获取里面的物料列表
  getMaterialList = () => {
    let filters = <any>{};
    filters = {
      keyWords: this.materialFilter.keyWords,
      warehouseCode: this.inventoryTypeForm.value.warehouseCode,
      barcodeFlag: this.inventoryTypeForm.value.barcodeFlag
    };
    if (this.inventoryType === this.inventoryWay.keeper) {
      filters.userIds = this.inventoryTypeForm.value.keeperId;
    }
    if (this.inventoryType === this.inventoryWay.areas) {
      filters.areaCodes = this.inventoryTypeForm.value.areas;
    }
    const filter = {
      pageNum: this.previewMaterialShow ? 0 : this.materialTableConfig.pageNum,
      pageSize: this.previewMaterialShow ? 0 : this.materialTableConfig.pageSize,
      filters: filters
    };
    if (this.previewMaterialShow) {
      this.wareHouseDataList = [];
    } else {
      this.materialDataList = [];
      this.materialTableConfig.loading = true;
      this.materialTableConfig.checkAll = false;
    }
    this.inventoryService.getCheckMaterialList(filter).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.materialTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      if (!this.previewMaterialShow) {
        this.materialDataList = resData.value.list;
        const selectedList = [];
        this.wareHouseDataList.forEach((item) => {
          selectedList.push(item['materialsNo']);
        });
        this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Checked, selectedList, true);
        this.materialTableConfig.total = resData.value.total;
      } else {
        this.wareHouseDataList = resData.value.list;
        this.tableConfig.total = resData.value.total;
      }

    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private checkChooseMaterial(type: number, idList: string[], updateOrigin: boolean = false, all: boolean = false) {
    const event: RightSideTableBoxNs.SelectedChangeEvent = {
      type: type,
      all: all,
      idList: idList,
      updateOrigin: updateOrigin
    };
    this.rightTableEmit.emit(event);
  }
  /**
   * 预览
  */
  public previewInventoryData() {
    if (!this.inventoryTypeForm.value.warehouseCode) {
      this.messageService.showToastMessage('请选择仓库', 'warning');
      return;
    }
    if (this.inventoryType === this.inventoryWay.keeper) {
      if (this.inventoryTypeForm.controls['keeperName'].invalid) {
        this.messageService.showToastMessage('请选择保管员', 'warning');
        return;
      }
    }
    if (this.inventoryType === this.inventoryWay.areas) {
      if (this.inventoryTypeForm.controls['areas'].invalid) {
        this.messageService.showToastMessage('请选择库区', 'warning');
        return;
      }
    }
    if (this.inventoryTypeForm.value.barcodeFlag === null) {
      this.messageService.showToastMessage('请选择是否条码管理', 'warning');
      return;
    }
    this.getMaterialList();
  }
  /**侧边栏物料 */
  public showMaterialList() {
    if (this.inventoryTypeForm.value.warehouseCode === null) {
      this.messageService.showAlertMessage('', '请先选择仓库', 'error');
      return;
    }
    if (this.inventoryTypeForm.value.barcodeFlag === null) {
      this.messageService.showToastMessage('请选择是否条码管理', 'warning');
      return;
    }
    this.show = !this.show;
    if (!this.wareHouseDataList.length) {
      this.getMaterialList();
    }
  }

  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      event.list.forEach((item: any, index: number) => {
        const value = this.wareHouseDataList.find(material => item.materialsNo === material.materialsNo);
        if (!value) {
          this.wareHouseDataList = [...this.wareHouseDataList, item];
        }
      });
    } else {
      event.list.forEach((item: any) => {
        this.wareHouseDataList = this.wareHouseDataList.filter(itemValue => itemValue.materialsNo !== item.materialsNo);
      });
    }
  }
  public materialCheckChange(event: UfastTableNs.SelectedChange) {
    if (event.index === -1) {
      this.wareHouseDataList.forEach((item: any) => {
        item[this.tableConfig.checkRowField] = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
      });
      return;
    }
    if (event.type === UfastTableNs.SelectedChangeType.Unchecked) {
      this.tableConfig.checkAll = false;
    } else {
      this.tableConfig.checkAll = this.wareHouseDataList.length === 0 ? false : true;
      for (let i = 0, len = this.wareHouseDataList.length; i < len; i++) {
        if (!this.wareHouseDataList[i][this.tableConfig.checkRowField]) {
          this.tableConfig.checkAll = false;
          break;
        }
      }
    }
  }

  public submitInventory() {
    Object.keys(this.inventoryTypeForm.controls).forEach((keys: string) => {
      this.inventoryTypeForm.controls[keys].markAsDirty();
      this.inventoryTypeForm.controls[keys].updateValueAndValidity();
    });

    if (this.inventoryTypeForm.invalid) {
      return;
    }
    if (!this.wareHouseDataList.length) {
      this.messageService.showToastMessage('没有物料，无法进行盘点', 'warning');
      return;
    }
    const data: any = {
      checkOrderDes: this.inventoryTypeForm.value.checkOrderDes,
      checkType: this.inventoryType,
      inventoryCheckDetailVOS: this.wareHouseDataList,
      plannedDate: this.inventoryTypeForm.value.plannedDate,
      warehouseCode: this.inventoryTypeForm.value.warehouseCode,
      warehouseId: this.inventoryTypeForm.value.warehouseId,
      userIds: this.inventoryTypeForm.value.keeperId,
      locationCodes: this.inventoryTypeForm.value.areas,
      barcodeFlag: this.inventoryTypeForm.value.barcodeFlag,
      keeperNames: this.inventoryTypeForm.value.keeperName
    };
    if (this.inventoryType === this.inventoryWay.material) {
      data.keeperNames = [];
      data.keeperName = this.inventoryTypeForm.value.keeperName;
    }
    let observer: any = null;
    observer = this.inventoryService.addInventory(data);
    this.messageService.showLoading();
    observer.subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  /**
   * 仓库
   */
  showWarehouseModal(): void {
    this.isVisible = true;
    this.getWareHouseList();
  }
  handleCancel(): void {
    this.isVisible = false;
  }
  public chooseWareHouseFun(code: string, id: string, ctx) {
    this.selectWarehouseCode = code;
    if (this.inventoryTypeForm.value.code !== code) {
      this.inventoryTypeForm.reset();
    }
    this.inventoryTypeForm.patchValue({
      warehouseCode: code,
      warehouseId: id,
      // keeperId: ctx.keeperId,
      // keeperName: ctx.keeperName
    });
    if (this.inventoryType === this.inventoryWay.material) {
      this.inventoryTypeForm.patchValue({
        keeperName: ctx.keeperName
      });
    }
    if (this.inventoryType === this.inventoryWay.material) {
      this.previewMaterialShow = false;
    } else {
      this.previewMaterialShow = true;
    }
    this.handleCancel();
  }
  /**
   * 库区
  */
  getAreaList = () => {
    this.reservoirDataList = [];
    this.warehouseAreaTableConfig.checkAll = false;
    const data = {
      pageSize: this.warehouseAreaTableConfig.pageSize,
      pageNum: this.warehouseAreaTableConfig.pageNum,
      filters: {
        houseLevel: 2,
        pCode: this.inventoryTypeForm.value.warehouseCode
      }
    };
    this.warehouseAreaTableConfig.loading = true;
    this.inventoryService.getWareHouseList(data).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.warehouseAreaTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.reservoirDataList = resData.value.list;
      this.warehouseAreaTableConfig.total = resData.value.total;
      if (this.inventoryTypeForm.controls['areas'].valid) {
        let selectArea = 0;
        this.inventoryTypeForm.controls['areas'].value.forEach((item) => {
          for (let i = 0, len = this.reservoirDataList.length; i < len; i ++) {
            if (item === this.reservoirDataList[i].code) {
              this.reservoirDataList[i]._checked = true;
              selectArea ++;
            }
          }
        });
        if (selectArea === this.reservoirDataList.length) {
          this.warehouseAreaTableConfig.checkAll = true;
        }
      }
    }, (error: any) => {
      this.warehouseAreaTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  showReservoirModal(pageNum?: number): void {
    if (this.inventoryTypeForm.value.warehouseCode === null) {
      this.messageService.showAlertMessage('', '请选择仓库', 'error');
      return;
    }
    this.isVisibleReservoir = true;
    this.getAreaList();
  }
  public chooseReservoirFun(code) {
    this.inventoryTypeForm.controls['areas'].setValue(code);
  }
  public areaChange() {
    this.wareHouseDataList = [];
  }
  handleCancelReservoir(): void {
    this.isVisibleReservoir = false;
  }
  handleOkReservoir(): void {
    const areasArr = [];
    this.reservoirDataList.forEach((item) => {
      if (item._checked) {
        areasArr.push(item.code);
      }
    });
    this.inventoryTypeForm.controls['areas'].patchValue(areasArr);
    this.handleCancelReservoir();
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.reservoirDataList.length; i < len; i++) {
      this.reservoirDataList[i][this.warehouseAreaTableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.warehouseAreaTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.warehouseAreaTableConfig.checkAll = this.reservoirDataList.every((item) => {
        return item._checked === true;
      });
    }
  }
  public barcodeFlagChange() {
    this.wareHouseDataList = [];
  }
  /**
   * 保管员
  */
  getKeeperList = () => {
    const data = {
      warehouseCode: this.selectWarehouseCode,
    };
    this.keeperTableConfig.checkAll = false;
    this.messageService.showLoading();
    this.inventoryService.getKeeperList(data).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.keeperDataList = resData.value;
      if (this.inventoryTypeForm.controls['keeperName'].valid) {
        let selectKeeper = 0;
        this.inventoryTypeForm.controls['keeperName'].value.forEach((item) => {
          for (let i = 0, len = this.keeperDataList.length; i < len; i ++) {
            if (item === this.keeperDataList[i].keeperName) {
              this.keeperDataList[i]._checked = true;
              selectKeeper ++;
            }
          }
        });
        if (selectKeeper === this.keeperDataList.length) {
          this.keeperTableConfig.checkAll = true;
        }
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public isAllChooseKeeper(isAllChoose: boolean): void {
    for (let i = 0, len = this.keeperDataList.length; i < len; i++) {
      this.keeperDataList[i][this.keeperTableConfig.checkRowField] = isAllChoose;
    }
  }

  public keeperChangeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.keeperTableConfig.checkAll ? this.isAllChooseKeeper(true) : this.isAllChooseKeeper(false);
    } else {
      this.keeperTableConfig.checkAll = this.keeperDataList.every((item) => {
        return item._checked === true;
      });
    }
  }
  showKeeperModal(): void {
    if (this.inventoryTypeForm.value.warehouseCode === null) {
      this.messageService.showAlertMessage('', '请选择仓库', 'error');
      return;
    }
    this.isVisibleKeeper = true;
    this.getKeeperList();
  }
  public keeperChange() {
    this.wareHouseDataList = [];
  }
  handleCancelKeeper(): void {
    this.isVisibleKeeper = false;
  }
  handleOkKeeper(): void {
    const keeperNameArr = [];
    const keeperIdArr = [];
    this.keeperDataList.forEach((item) => {
      if (item._checked) {
        keeperNameArr.push(item.keeperName);
        keeperIdArr.push(item.keeperId);
      }
    });
    this.inventoryTypeForm.controls['keeperName'].patchValue(keeperNameArr);
    this.inventoryTypeForm.controls['keeperId'].patchValue(keeperIdArr);
    this.handleCancelKeeper();
  }

  ngOnInit() {
    this.warehouseTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '仓库编号', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseWareHouse, width: 60 }
      ]
    };
    this.warehouseAreaTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '库区编号', field: 'code', width: 100 },
      { title: '库区描述', field: 'remark', width: 150 },
      ]
    };
    this.keeperTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: true,
      checkAll: false,
      showPagination: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '保管员', field: 'keeperName', width: 100 },
      ]
    };
    this.inventoryTypeForm = this.formBuilder.group({
      warehouseCode: [null, [Validators.required]],
      warehouseId: [null, Validators.required],
      checkOrderDes: [null, [Validators.required]],
      plannedDate: [null, [Validators.required]],
      barcodeFlag: [null, [Validators.required]]
    });
    // 选中的物料
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '盘点条码', field: 'barCode', width: 100 },
        { title: '物料编码', field: 'materialsNo', width: 100 },
        { title: '物料名称', field: 'materialsName', width: 150 },
        { title: '储位', field: 'locationCode', width: 80 },
        { title: '数量', field: 'amount', width: 80 },
        { title: '保管员', field: 'userName', width: 80 },
      ]
    };
    // 侧边栏物料
    this.materialTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 500,
      showCheckbox: true,
      showPagination: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '物料编码', field: 'materialsNo', width: 100 },
      { title: '物料描述', field: 'materialsName', width: 150 },
      { title: '现有库存', field: 'amount', width: 80 },
      ]
    };
  }

}
