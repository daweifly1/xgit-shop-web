import { Component, OnInit, AfterContentInit, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BeginningWarehouseServiceNs, BeginningWarehouseService } from '../../../../core/trans/beginningWarehouse.service';
import { Observable } from 'rxjs/Observable';
import { BeginningIn } from '../../../../../environments/printData';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { ActionCode } from '../../../../../environments/actionCode';
import { PrintTplSelectorService } from '../../../../widget/print-tpl-selector/print-tpl-selector';

interface PageType {
  MainPage: number;
  DetailPage: number;
  LeadInPage: number;
}
interface ActionStatus {

  finish: boolean;
  print: boolean;
  stockIn: boolean;
}
@Component({
  selector: 'app-beginning-warehouse',
  templateUrl: './beginning-warehouse.component.html',
  styleUrls: ['./beginning-warehouse.component.scss']
})
export class BeginningWarehouseComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  beginningWarehouseDataList: any[];
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('serialNumber') serialNumber: TemplateRef<any>;
  @ViewChild('chooseWareHouse') chooseWareHouse: TemplateRef<any>;
  @ViewChild('chooseReservoir') chooseReservoir: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  @Input() searchText: string;

  PageType: PageType;
  selectedPage: number;
  newWarehouseForm: FormGroup;
  warehouseCode: string;
  warehouseId: string;
  advancedSearchShow: boolean;
  filters: any;
  selectedBillNo: string;
  leadInForm: FormGroup;
  isWarehouseVisible: boolean;
  outWareHouseDataList: BeginningWarehouseServiceNs.OutLocationModel[];
  outWareHouseTableConfig: UfastTableNs.TableConfig;
  isVisibleReservoir: boolean;
  warehouseAreaTableConfig: UfastTableNs.TableConfig;
  reservoirDataList: BeginningWarehouseServiceNs.ReservoirModel[];
  fileList: any[] = [];
  errorMessage: any;
  href: any;
  leadInUrl: any;
  actionStatus: { [index: string]: ActionStatus };
  stockIn: boolean;
  barcodeFlagList: any[];
  ActionCode = ActionCode;
  inventoryStatusList: { value: number, label: string }[];
  constructor(private beginningWarehouseService: BeginningWarehouseService,
    private utilService: UfastUtilService,
    private messageService: ShowMessageService,
    private formBuilder: FormBuilder,
    private printService: PrintTplSelectorService,
    private http: HttpClient) {
    this.barcodeFlagList = [
      { label: '否', value: 0 },
      { label: '是', value: 1 },
    ];
    this.beginningWarehouseDataList = [];
    this.PageType = {
      MainPage: 0,
      DetailPage: 1,
      LeadInPage: 2
    };
    this.selectedPage = this.PageType.MainPage;
    this.advancedSearchShow = false;
    this.filters = {};
    this.isWarehouseVisible = false;
    this.outWareHouseDataList = [];
    this.isVisibleReservoir = false;
    this.errorMessage = [];
    this.href = environment.baseUrl.ss + '/initialInventory/download';
    this.leadInUrl = environment.baseUrl.ss + '/initialInventory/import';
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public emitFinish() {
    this.finish.emit();
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.createDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.createDateEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.createDateStart) {
      return false;
    }
    return endDate.getTime() <= this.filters.createDateStart.getTime();
  }
  getBeginningWarehouseList = () => {
    this.filters.createDateStart = this.filters.createDateStart ?
      this.utilService.getStartDate(this.filters.createDateStart) : undefined;
    this.filters.createDateEnd = this.filters.createDateEnd ?
      this.utilService.getEndDate(this.filters.createDateEnd) : undefined;
    const filters = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.actionStatus = {};
    this.beginningWarehouseDataList = [];
    this.beginningWarehouseService.getBeginningWarehouseList(filters).subscribe((
      resData: BeginningWarehouseServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.beginningWarehouseDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.beginningWarehouseDataList.forEach((item) => {
        const allOrFinish = item.state !== BeginningWarehouseServiceNs.StockInStatus.Finish &&
          item.state !== BeginningWarehouseServiceNs.StockInStatus.All;
        item['_this'] = item;
        this.actionStatus[item.billNo] = {
          print: true,
          finish: allOrFinish,
          stockIn: allOrFinish && item.barcodeFlag === BeginningWarehouseServiceNs.BarcodeFlag.UnBarcode
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public warehouseDetail(stockIn: boolean, billNo: string) {
    if (stockIn && !this.actionStatus[billNo].stockIn) {
      return;
    }
    this.stockIn = stockIn;
    this.selectedPage = this.PageType.DetailPage;
    this.selectedBillNo = billNo;

  }
  public leadIn() {
    this.errorMessage = [];
    this.selectedPage = this.PageType.LeadInPage;
  }
  // 显示调出仓库模态框-
  showWarehouseModal(pageNum?: number): void {
    this.isWarehouseVisible = true;
    this.getWarehouseModalData(pageNum);
  }
  public warehouseChange() {
    this.leadInForm.controls['areaCode'].patchValue('');
  }

  getWarehouseModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.outWareHouseTableConfig.pageNum,
      pageSize: this.outWareHouseTableConfig.pageSize,
      filters: {
        houselLevel: '1',
        pCode: '0',
        type: 0
      }
    };
    this.beginningWarehouseService.getOutWareHouseList(filter).subscribe((resData: BeginningWarehouseServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.outWareHouseDataList = resData.value.list;
      this.outWareHouseTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 选择调出仓库-
  public chooseWareHouseFun(item: any) {
    this.leadInForm.controls['warehouseCode'].setValue(item);
    this.warehouseHandleCancel();
  }
  public warehouseHandleCancel() {
    this.isWarehouseVisible = false;
  }

  // 显示选择库区模态框
  showReservoirModal(pageNum?: number): void {
    if (this.leadInForm.value.warehouseCode === null) {
      this.messageService.showAlertMessage('', '请选择仓库编号', 'error');
      return;
    }
    this.isVisibleReservoir = true;
    this.getWarehouseAreaModalData(pageNum);
  }
  getWarehouseAreaModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.warehouseAreaTableConfig.pageNum,
      pageSize: this.warehouseAreaTableConfig.pageSize,
      filters: {
        houselLevel: '2',
        pCode: this.leadInForm.controls['warehouseCode'].value
      }
    };
    this.beginningWarehouseService.getOutWareHouseList(filter).subscribe((resData: BeginningWarehouseServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.reservoirDataList = resData.value.list;
      this.warehouseAreaTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  // 选择调出库区
  public chooseReservoirFun(item: any) {
    this.leadInForm.controls['areaCode'].setValue(item);
    this.handleCancelReservoir();
  }

  handleCancelReservoir(): void {
    this.isVisibleReservoir = false;
  }

  beforeUpload = (file): boolean => {
    this.errorMessage = [];
    this.fileList.push(file);
    return false;
  }
  removeFile = (file) => {
    this.fileList = [];
    this.errorMessage = [];
    return false;
  }

  public leadingIn() {
    for (const key of Object.keys(this.leadInForm.controls)) {
      this.leadInForm.controls[key].markAsDirty();
      this.leadInForm.controls[key].updateValueAndValidity();
    }
    if (this.leadInForm.invalid) {
      return;
    }
    if (!this.fileList.length) {
      this.messageService.showToastMessage('请选择文件', 'warning');
      return;
    }
    if (this.errorMessage.length) {
      this.messageService.showAlertMessage('', '请重新选择文件', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('x-location', this.leadInForm.value.warehouseCode);
    formData.append('x-area', this.leadInForm.value.areaCode);
    this.fileList.forEach((file: any) => {
      formData.append('files[]', file);
    });
    const req = new HttpRequest('POST', this.leadInUrl, formData, {
    });
    this.http.request(req).subscribe((event: any) => {
      this.messageService.showLoading();
      if (event.type === 4) {
        this.messageService.closeLoading();
        if (event.body.code !== 0) {
          this.errorMessage = event.body.value || [];
          this.messageService.showToastMessage(event.body.message, 'error');
          return;
        }
        this.leadInForm.reset();
        this.fileList = [];
        this.messageService.showToastMessage('操作成功', 'success');
        this.selectedPage = this.PageType.MainPage;
        this.getBeginningWarehouseList();
      }
    }, error => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public toggleManagePage() {
    this.leadInForm.reset();
    this.fileList = [];
    this.selectedPage = this.PageType.MainPage;
  }


  public onChildFinish() {
    this.selectedPage = this.PageType.MainPage;
    this.getBeginningWarehouseList();
  }
  public advancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchClose() {
    this.advancedSearchShow = false;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getBeginningWarehouseList();
  }

  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: BeginningWarehouseServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getBeginningWarehouseList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public statementFinish(billNo: string) {
    if (!this.actionStatus[billNo].finish) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').
      afterClose.subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.commonResDeal(this.beginningWarehouseService.statementFinish(billNo, null), true);
      });
  }

  showPrintModal(headerInfo: any): void {
    const filter = {
      pageNum: 0,
      pageSize: 0,
      filters: {
        billNo: headerInfo.billNo
      }
    };
    this.messageService.showLoading('');
    this.beginningWarehouseService.getDetailMaterialList(filter)
      .subscribe((resData: BeginningWarehouseServiceNs.UfastHttpAnyResModel) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        headerInfo.qrcode = headerInfo.billNo;
        this.printService.showTplSelector({
          dataList: resData.value.list,
          headerInfo: headerInfo,
          printConfig: BeginningIn
        });
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
        this.messageService.closeLoading();
      });
  }
  ngOnInit() {
    this.beginningWarehouseService.getInventoryStatusList().subscribe((inventoryStatusList) => {
      this.inventoryStatusList = inventoryStatusList;
    });
    this.tableConfig = {
      id: 'warehouse-beggingWarehouse',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{
        title: '操作',
        tdTemplate: this.operationTpl,
        width: 150,
      }, {
        title: '入库单号',
        tdTemplate: this.serialNumber,
        width: 200,
      }, {
        title: '仓库编号',
        field: 'inLocation',
        width: 150,
      }, {
        title: '制单人',
        field: 'createName',
        width: 150,
      }, {
        title: '制单时间',
        field: 'createDate',
        width: 150,
        pipe: 'date:yyyy-MM-dd HH:mm'
      }, {
        title: '入库状态',
        field: 'state',
        width: 120,
        pipe: 'state'
      }, {
        title: '是否条码管理',
        field: 'barcodeFlag',
        width: 100,
        pipe: 'barcodeManage'
      }
      ]
    };
    // 调出仓库模态框数据
    this.outWareHouseTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 100,
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

    // 调出库区模态框数据
    this.warehouseAreaTableConfig = {
      pageSize: 10,
      yScroll: 100,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '库区编号', field: 'code', width: 100 },
      { title: '库区描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseReservoir, width: 60 }
      ]
    };
    this.getBeginningWarehouseList();
    this.newWarehouseForm = this.formBuilder.group({
      warehouseCode: [null, Validators.required],
      description: [null, Validators.required],
      isPlan: [null],
    });
    this.leadInForm = this.formBuilder.group({
      warehouseCode: [null, Validators.required],
      areaCode: [null, Validators.required],
    });
  }

}
