import { Component, OnInit, AfterContentInit, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PackBarcodePatchServiceNs, PackBarcodePatchService } from '../../../../core/trans/packBarcodePatch.service';
import {
  NormalTicketTplComponent, TemplateDataDigger
} from '../../../../layout/print-template/normal-ticket-tpl/normal-ticket-tpl.component';
import { LodopPrintService, LodopPrintServiceNs } from '../../../../core/infra/lodop-print.service';
import { PrintErrorService } from '../../../../widget/print-error/print-error';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {map, catchError} from 'rxjs/operators';
import {BasisCodeService} from '../../../../core/trans/basisCode.service';
import {ActionCode} from '../../../../../environments/actionCode';

const PurchaseOrderType = 'SH';
interface PageType {
  MainPage: number;
  DetailPage: number;
  LeadInPage: number;
}
interface PrintBillItem {
  barcode: string;
  billNo: string;
}
@Component({
  selector: 'app-pack-barcode-patch',
  templateUrl: './pack-barcode-patch.component.html',
  styleUrls: ['./pack-barcode-patch.component.scss']
})
export class PackBarcodePatchComponent implements OnInit {
  ActionCode = ActionCode;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @Input() searchText: string;
  tableConfig: UfastTableNs.TableConfig;
  printConfigurationForm: FormGroup;
  printDataList: any;
  show: boolean;
  printModelTitle: string;
  printTpl: object;
  searchPlaceholder: string;
  advancedSearchShow: boolean;
  filters: any;
  barCodeType: any;
  printState: any;
  selectedList: any[];
  selectedListIds: number[];
  configurationList: any;
  startPrint: boolean;
  constructor(private packBarcodePatchService: PackBarcodePatchService,
    private messageService: ShowMessageService, private utilService: UfastUtilService,
    private formBuilder: FormBuilder,
    private lodopService: LodopPrintService,
    private printErrorService: PrintErrorService,
    private basisCodeService: BasisCodeService) {
    this.printDataList = [];
    this.selectedList = [];
    this.selectedListIds = [];
    this.show = false;
    this.printModelTitle = '条码打印配置';
    this.printTpl = [
      { type: 1, printTplName: '模板1' }
    ];
    this.barCodeType = [
      { type: 0, typeName: '总条码' },
      { type: 1, typeName: '分条码' }
    ];
    this.printState = [
      { type: 0, state: '已打印' },
      { type: 1, state: '全部入库' },
      { type: 2, state: '全部出库' },
      { type: 3, state: '已拆分' }
    ];
    this.advancedSearchShow = false;
    this.filters = {};
    this.searchPlaceholder = '物料编码';
    this.configurationList = {
      edition: true,
      vin: true,
      hasPackNumber: true
    };
    this.startPrint = false;
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.printDataList.length; i < len; i++) {
      this.printDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.printDataList.every((item) => {
        return item._checked === true;
      });
    }
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.endDate) {
      return false;
    }
    return startDate.getTime() > this.filters.endDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.beginDate) {
      return false;
    }
    return endDate.getTime() <= this.filters.beginDate.getTime();
  }
  getprintDataList = () => {
    this.getDataListHandler().subscribe(() => {});
  }
  private getDataListHandler() {
    this.printDataList = [];
    this.selectedList = [];
    this.tableConfig.checkAll = false;
    this.filters.startDate = this.filters.startDate ?
      this.utilService.getStartDate(this.filters.startDate) : undefined;
    this.filters.endDate = this.filters.endDate ?
      this.utilService.getEndDate(this.filters.endDate) : undefined;
    const filters = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    return this.packBarcodePatchService.getPackBarcodePatchList(filters)
      .pipe(map((resData: PackBarcodePatchServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.printDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }), catchError((error) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
      return Observable.of({
        code: 1
      });
    }));
  }
  public printConfiguration(event: Event) {
    event.stopPropagation();
    this.show = !this.show;
  }
  public advancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchClose() {
    this.advancedSearchShow = false;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getprintDataList();
  }
  private getCheckBarcodeBillNo(): PrintBillItem[] {
    const list: PrintBillItem[] = [];
    this.printDataList.forEach((item) => {
      if (item[this.tableConfig.checkRowField]) {
        list.push({barcode: item.barcode, billNo: item.billNo});
      }
    });
    return list;
  }

  public printBarcode(batch: boolean, isPreview: boolean, barcode?: string, billNo?: string) {
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }
    let dataList: PrintBillItem[] = [];
    if (!batch) {
      dataList.push({barcode: barcode, billNo: billNo});
    } else {
      dataList = this.getCheckBarcodeBillNo();
    }
    if (dataList.length === 0) {
      this.messageService.showToastMessage('请选择需要打印的条码', 'info');
      return;
    }
    this.getBarcodeInfo(dataList).subscribe((printData) => {
      if (isPreview) {
        this.lodopService.preview(NormalTicketTplComponent, printData, 'data');
      } else {
        this.lodopService.print(NormalTicketTplComponent, printData, 'data');
      }
    });
  }
  private getBarcodeInfo(barcodeList: PrintBillItem[]) {
    if (barcodeList.length === 0) {
      return;
    }
    const getListHandler = [];
    const billNoList = [];
    const getBillNoHandler = [];
    barcodeList.forEach((item) => {
      const handler = this.packBarcodePatchService.getPackBarcodePatchList({
        pageNum: 0,
        pageSize: 1,
        filters: { barcode: item.barcode }
      });
      getListHandler.push(handler);
      if (billNoList.indexOf(item.billNo) === -1 && item.billNo.startsWith(PurchaseOrderType)) {
        billNoList.push(item.billNo);
        getBillNoHandler.push(this.basisCodeService.getPackageCodePrint(item.billNo));
      }
    });
    let resHandler = null;
    if (getBillNoHandler.length !== 0) {
      resHandler = Observable.forkJoin([Observable.forkJoin(getListHandler), Observable.forkJoin(getBillNoHandler)]);
    } else {
      resHandler = Observable.forkJoin(getListHandler);
    }
    return resHandler.pipe(map((data: any) => {
        if (getBillNoHandler.length === 0) {
          return this.setPrintData(data, [], barcodeList);
        } else {
          return this.setPrintData(data[0], data[1], barcodeList);
        }
      }));
  }
  private setPrintData(barcodeDataList: any[], billNoList: any[], sourceList: PrintBillItem[]) {
    const printData: TemplateDataDigger[] = [];
    billNoList = billNoList.filter(resData => resData.code === 0);
    barcodeDataList.forEach((resData, index) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(`${sourceList[index].barcode}:${resData.message}`, 'error');
        return;
      }
      if (resData.value.list.length === 0) {
        this.messageService.showToastMessage(`${sourceList[index].barcode}:未查找到此条码信息,请刷新列表`, 'error');
        return;
      }
      const printDataItem: any = {
        hasPackNumber: this.configurationList.hasPackNumber,
        edition: this.configurationList.edition,
        vin: this.configurationList.vin,
        orderNo: resData.value.list[0].billNo,
        printDate: new Date()
      };
      Object.assign(printDataItem, resData.value.list[0]);
      if (sourceList[index].billNo.startsWith(PurchaseOrderType)) {
        const billNoData = billNoList.find(item => item.value.headerInfo['businessOrder'] === sourceList[index].billNo);
        printDataItem['supplierName'] = billNoData.value.headerInfo['supplierName'];
        printDataItem['contractNo'] = billNoData.value.headerInfo['purchaseNo'];
      }
      printData.push(printDataItem);
    });
    return printData;
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-packBarcodePatch',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      checkRowField: '_checked',
      headers: [{
        title: '操作',
        tdTemplate: this.operationTpl,
        width: 150,
        fixed: true
      }, {
        title: '物料编码',
        field: 'materialsNo',
        width: 100,
        fixed: true
      }, {
        title: '物料名称',
        field: 'materialsDes',
        width: 200,
        fixed: true
      }, {
        title: '原始数量',
        field: 'totalQty',
        width: 80,
      }, {
        title: '打印数量',
        field: 'currentQty',
        width: 80,
      }, {
        title: '补打次数',
        field: 'reprintCount',
        width: 80,
      }, {
        title: '状态',
        field: 'barcodeStatus',
        width: 100,
        pipe: 'barcodeStatus'
      }, {
        title: '序号',
        field: 'seq',
        width: 80,
      }, {
        title: '操作时间',
        field: 'printTime',
        width: 150,
        pipe: 'date:yyyy-MM-dd HH:mm'
      }, {
        title: '操作人',
        field: 'printName',
        width: 100,
      }, {
        title: '单据号',
        field: 'billNo',
        width: 170,
      }, {
        title: '条码',
        field: 'barcode',
        width: 170,
      }, {
        title: '条码类型',
        field: 'barcodeFlag',
        width: 100,
        pipe: 'barcodeFlag'
      }, {
        title: 'VIN码',
        field: 'vinid',
        width: 100,
      }, {
        title: '零件号/图号',
        field: 'orawyd',
        width: 100,
      }, {
        title: '条码描述',
        field: 'barcodeDesc',
        width: 100,
      }, {
        title: '规格描述',
        field: 'model',
        width: 100,
      }
      ]
    };
    this.filters = {
      billNo: this.filters.billNo || '',
      materialsNo: this.filters.materialsNo,
      barcode: this.filters.barcode || '',
      barcodeFlag: this.filters.barcodeFlag || '',
      barcodeStatus: this.filters.barcodeStatus || '',
      beginDate: this.filters.beginDate || '',
      endDate: this.filters.endDate || ''
    };
    this.printConfigurationForm = this.formBuilder.group({
      orawyd: [null],
      barcodeDesc: [null],
      model: [null],
      totalQty: [{ value: null, disabled: true }],
      currentQty: [null, Validators.required],
    });
    // this.getprintDataList();
  }

}
