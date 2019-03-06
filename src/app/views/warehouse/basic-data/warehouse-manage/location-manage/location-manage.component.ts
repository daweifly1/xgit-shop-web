import { Component, OnInit, Output, Input, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { WarehouseServiceNs, WarehouseService } from '../../../../../core/trans/warehouse.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  NormalLocationTplComponent,
  LocationTplData
} from '../../../../../layout/print-template/normal-location-tpl/normal-location-tpl.component';
import { PrintErrorService } from '../../../../../widget/print-error/print-error';
import { LodopPrintService } from '../../../../../core/infra/lodop-print.service';
import { Observable } from 'rxjs/Observable';
import {ActionCode} from '../../../../../../environments/actionCode';
/**
 *储位管理
 * **/
interface LocationPageTypeEnum {
  locationList: number;
  addLocation: number;
  editLocation: number;
}
 interface LocationFilter {
  pageNum?: number;
  pageSize?: number;
  code?: string;
  remark?: string;
  houseLevel?: string;
  pCode?: string;

}
interface KeeperNameType {
  name?: string;
  userId?: string;
}

@Component({
  selector: 'app-location-manage',
  templateUrl: './location-manage.component.html',
  styleUrls: ['./location-manage.component.scss']
})
export class LocationManageComponent implements OnInit {
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('serialNumber') serialNumber: TemplateRef<any>;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  @Input() areaId: string;          // 库区id
  @Input() areaCode: string;        // 库区编号
  @Input() warehouseCode: string;   // 仓库编号
  @Input() searchText: string;
  @Input() defaultKeeper: any;  // 默认保管员
  locationPageType: number;
  locationPageTypeEnum: LocationPageTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  selectedList: any[];
  locationDataList: any[];
  selectWarehouseAreaId: string;
  selectWarehouseCode: string;
  locationEditForm: FormGroup;
  locationCode: string;
  shelfNo: string;
  shelfType: string;
  searchPlaceholder: string;
  advancedSearchShow: boolean;
  filters: LocationFilter;
  printData: LocationTplData[];
  show: boolean;
  printModelTitle: string;
  printConfigurationData: any;
  selectedData: any;
  isVisiblekeeperName: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];
  name: any;
  keeperNameFilter: KeeperNameType;
  ActionCode = ActionCode;
  constructor(private warehouseService: WarehouseService, private messageService: ShowMessageService, private formBuilder: FormBuilder,
    private lodopService: LodopPrintService,
    private printErrorService: PrintErrorService) {
    // this.areaId = '';
    // this.areaCode = '';
    this.finish = new EventEmitter();
    this.locationPageTypeEnum = {
      locationList: 0,
      addLocation: 1,
      editLocation: 2
    };
    this.locationPageType = this.locationPageTypeEnum.locationList;
    this.selectedList = [];
    this.locationDataList = [];
    this.selectWarehouseAreaId = '';
    this.selectWarehouseCode = '';
    this.locationCode = '';
    this.shelfNo = '';
    this.shelfType = '';
    this.advancedSearchShow = false;
    this.filters = {};
    this.show = false;
    this.printModelTitle = '打印配置';
    this.printConfigurationData = {
      hasWareHouse: true,
      hasArea: true,
      hasShelfDes: true,
      hasSeq: true
    };
    this.selectedData = {};
    this.printData = [];
    this.isVisiblekeeperName = false;
    this.keeperNameDataList = [];
    this.name = '';
    this.keeperNameFilter = {};
  }

  getLocationList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const data = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {
        code: this.filters.code,
        remark: this.filters.remark,
        pCode: this.areaCode,
        houseLevel: '3'
      }
    };
    this.tableConfig.loading = true;
    this.warehouseService.getLocationList(data).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.locationDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.tableConfig.checkAll = false;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public goback() {
    this.emitFinish();
  }
  public emitFinish() {
    this.finish.emit();
  }
  public onChildPageFinish() {
    this.locationPageType = this.locationPageTypeEnum.locationList;
    this.getLocationList();
  }
  public backToList() {
    this.locationPageType = this.locationPageTypeEnum.locationList;
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.locationDataList.length; i < len; i++) {
      this.locationDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.locationDataList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }
  public addLocation() {
    this.locationPageType = this.locationPageTypeEnum.addLocation;
    this.selectWarehouseAreaId = this.areaId;
    this.selectWarehouseCode = this.warehouseCode;
  }
  public editLocation(locationCode, id, remark, areaId, keeperName, keeperId) {
    this.locationEditForm = this.formBuilder.group({
      code: [{ value: locationCode, disabled: true }],
      id: [id, Validators],
      remark: [this.locationEditForm.value.remark, Validators.required],
      keeperName: [this.locationEditForm.value.keeperName, Validators.required],
      keeperId: [this.locationEditForm.value.keeperId, Validators.required],
      houseLevel: [3],
      pCode: [this.areaCode]
    });
    this.locationPageType = this.locationPageTypeEnum.editLocation;
    this.locationEditForm.patchValue({
      warehouseAreaId: this.areaId,
      code: locationCode,
      id: id,
      remark: remark,
      keeperName,
      keeperId,
      pCode: this.areaCode
    });

    this.locationCode = locationCode;
  }

  public deleteWarehouse(id) {
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.warehouseService.deleteWarehouse(id), true);
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    this.messageService.showLoading();
    observer.subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getLocationList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'error');
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public toggleManagePage() {
    this.locationEditForm.reset();
    this.emitFinish();
  }
  public updateLocation() {
    Object.keys(this.locationEditForm.controls).forEach((key: string) => {
      this.locationEditForm.controls[key].markAsDirty();
      this.locationEditForm.controls[key].updateValueAndValidity();
    });
    if (this.locationEditForm.invalid) {
      return;
    }
    const data = this.locationEditForm.getRawValue();
    this.messageService.showLoading();
    this.warehouseService.editLocation(data).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.locationPageType = this.locationPageTypeEnum.locationList;
      this.getLocationList();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public searchTextChange(searchText) {
    this.filters.code = searchText;
  }
  public advancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchClose() {
    this.advancedSearchShow = false;
  }
  public advancedSearchReset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
  });
  this.getLocationList();
  }
  public printConfiguration(event: Event) {
    event.stopPropagation();
    this.show = !this.show;
  }
  public print(locationCode, btn) {
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }
    this.locationDataList.forEach((item: any) => {
      if (item.code === locationCode) {
        this.selectedData = item;
      }
    });
    this.printData[0] = this.selectedData;
    const temp = this.selectedData.code.split('-');
    this.printData[0].locationCode = locationCode;
    this.printData[0].rowNo = temp[1];
    this.printData[0].floorNo = temp[2];
    this.printData[0].columnNo = temp[3];
    this.printData[0].seqNo = temp[4];
    this.printData.forEach((item: any) => {
      item.hasWareHouse = this.printConfigurationData.hasWareHouse;
      item.hasArea = this.printConfigurationData.hasArea;
      item.hasShelfDes = this.printConfigurationData.hasShelfDes;
      item.hasSeq = this.printConfigurationData.hasSeq;
      item.warehouseCode = this.warehouseCode;
      item.areaCode = this.areaCode;
    });
    if (btn === 'preview') {
      this.lodopService.preview(NormalLocationTplComponent, this.printData, 'data');
    }
    if (btn === 'print') {
      this.lodopService.print(NormalLocationTplComponent, this.printData, 'data');
    }
  }
  public batchPrint(btn) {
    const selectedDataList = [];
    this.locationDataList.forEach((item) => {
      if (item._checked) {
        selectedDataList.push(item);
      }
    });
    if (selectedDataList.length === 0) {
      this.messageService.showAlertMessage('', '请选择要打印的数据', 'warning');
      return;
    }
    selectedDataList.forEach((item) => {
      const temp = item.code.split('-');
      item.locationCode = item.code;
      item.rowNo = temp[1];
      item.floorNo = temp[2];
      item.columnNo = temp[3];
      item.seqNo = temp [4];
    });
    this.printData = selectedDataList;
    this.printData.forEach((item: any) => {
      item.hasWareHouse = this.printConfigurationData.hasWareHouse;
      item.hasArea = this.printConfigurationData.hasArea;
      item.hasShelfDes = this.printConfigurationData.hasShelfDes;
      item.hasSeq = this.printConfigurationData.hasSeq;
      item.warehouseCode = this.warehouseCode;
      item.areaCode = this.areaCode;
    });
    if (btn === 'preview') {
      this.lodopService.preview(NormalLocationTplComponent, this.printData, 'data');
    }
    if (btn === 'print') {
      this.lodopService.print(NormalLocationTplComponent, this.printData, 'data');
    }
  }
  showVisiblekeeperNameModal(pageNum?: number): void {
    this.isVisiblekeeperName = true;
    this.getKeeperNameModalData(pageNum);

  }
  getKeeperNameModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        name: this.name
      }
    };
    this.messageService.showLoading();
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseKeeperNameFun(item: any, userId: string) {
    this.locationEditForm.controls['keeperName'].setValue(item);
    this.locationEditForm.controls['keeperId'].setValue(userId);
    this.handleCancelKeeperName();
  }
  public searchKeeperName(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        name: this.keeperNameFilter.name
      }
    };
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }

  handleCancelKeeperName(): void {
    this.isVisiblekeeperName = false;
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-location',
      pageSize: 10,
      showCheckbox: true,
      checkAll: false,
      checkRowField: '_checked',
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{
        title: '操作',
        tdTemplate: this.operation,
        width: 150,
      }, {
        title: '储位编码',
        field: 'code',
        width: 150,
      }, {
        title: '储位描述',
        field: 'remark',
        width: 150,
      }
      ]
    };
    this.getLocationList();

    this.locationEditForm = this.formBuilder.group({
      warehouseAreaId: [this.areaId, Validators.required],
      locationCode: [null],
      remark: [null, Validators.required],
      keeperName: [null],
      keeperId: [null]
    });
    this.keeperNameTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 100,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '保管员名称', field: 'name', width: 100 },
      { title: '保管员编号', field: 'userId', width: 150 },
      { title: '操作', tdTemplate: this.chooseKeeperName, width: 60 }
      ]
    };
  }

}
