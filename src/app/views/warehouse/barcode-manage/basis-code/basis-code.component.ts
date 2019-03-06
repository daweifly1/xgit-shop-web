import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { PackBarcodePatchService } from '../../../../core/trans/packBarcodePatch.service';
import { UfastTableNs } from '../../../../layout/layout.module';
import { BasisCodeService, BasisCodeServiceNs } from '../../../../core/trans/basisCode.service';
import { LodopPrintService } from '../../../../core/infra/lodop-print.service';
import { PrintErrorService } from '../../../../widget/print-error/print-error';
import {
  NormalTicketTplComponent, TemplateDataDigger
} from '../../../../layout/print-template/normal-ticket-tpl/normal-ticket-tpl.component';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import {ActionCode} from '../../../../../environments/actionCode';

// 定义高级搜索所用到的字段模型
interface FilterItem {
  materialsNos?: string;
  billNo?: string;
  createName?: string;
  dateBegin?: any;
  dateEnd?: any;
}

@Component({
  selector: 'app-basis-code',
  templateUrl: './basis-code.component.html',
  styleUrls: ['./basis-code.component.scss']
})
export class BasisCodeComponent implements OnInit {
  ActionCode = ActionCode;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @Input() searchText: string;
  filters: FilterItem;
  dateFormat: 'yyyy-MM-dd';
  tableConfig: UfastTableNs.TableConfig;
  printConfigurationForm: FormGroup;
  basisCodePrintDataList: any;
  show: boolean;
  printModelTitle: string;
  printTpl: any;
  selectedList: any[];
  selectedListIds: any[];
  searchPlaceholder: string;
  advancedSearchShow: boolean;
  barCodeType: any;
  printState: any;
  printData: TemplateDataDigger[];
  configuration: any;
  configurationList: any;
  /**
   * 打印配置
   */
  printConfig: any;
  constructor(private packBarcodePatchService: PackBarcodePatchService,
    private basisCodeService: BasisCodeService, private utilService: UfastUtilService,
    private messageService: ShowMessageService, private formBuilder: FormBuilder,
    private lodopService: LodopPrintService,
    private printErrorService: PrintErrorService) {
    this.basisCodePrintDataList = [];
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
      { type: 1, state: '已入库' },
      { type: 2, state: '已出库' },
      { type: 3, state: '已拆分' }
    ];
    this.selectedList = [];
    this.selectedListIds = [];
    this.advancedSearchShow = false;
    this.searchPlaceholder = '物料编码';
    this.filters = {
      materialsNos: '',
      billNo: '',
      createName: '',
      dateBegin: '',
      dateEnd: '',
    };
    this.printData = [];
    this.configuration = [];
    this.configurationList = {
      totalBarcode: false,
      edition: true,
      vin: true,
      hasPackNumber: true
    };
    this.printConfig = {
      model: '',
      specDesc: '',
      sumNum: undefined,
      packageNum: undefined,
      totalBarcode: false,
      barcode: true,
      vin: true,
      printPackNum: true
    };
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.basisCodePrintDataList.length; i < len; i++) {
      this.basisCodePrintDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.basisCodePrintDataList.every((item) => {
        return item._checked === true;
      });
    }
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.dateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.dateEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.dateBegin) {
      return false;
    }
    return endDate.getTime() <= this.filters.dateBegin.getTime();
  }
  getBasisCodePrintList = () => {
    this.printData = [];
    this.tableConfig.checkAll = false;
    this.selectedList = [];
    this.filters.dateBegin = this.filters.dateBegin ?
      this.utilService.getStartDate(this.filters.dateBegin) : undefined;
    this.filters.dateEnd = this.filters.dateEnd ?
      this.utilService.getEndDate(this.filters.dateEnd) : undefined;
    const filters = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.basisCodeService.getInitInventoryPrintList(filters).subscribe((
      resData: BasisCodeServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'warning');
        return;
      }
      this.basisCodePrintDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public printConfiguration(event: Event) {
    event.stopPropagation();
    this.show = !this.show;
  }

  public preview(id?: any, btn?: string) {
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }
    id = id.split(',');
    this.tableConfig.loading = true;
    this.basisCodeService.getInitInventoryBatchPrint(id).subscribe((
      resData: BasisCodeServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'warning');
        return;
      }
      resData.value.forEach((item) => {
        if (!this.configurationList.totalQty && item.barcodeFlag === 0) {
          return;
        }
        this.printData.push({
          orderNo: item.billNo,
          materialsNo: item.materialsNo,
          materialsDes: item.materialsDes,
          vin: this.configurationList.vin,
          vinid: item.vinid,
          barcode: item.barcode,
          printDate: item.printTime,
          locationDesc: item.locationDesc,
          currentQty: item.currentQty,
          totalQty: item.totalQty,
          seq: item.seq,
          childCount: item.childCount,
          barcodeFlag: item.barcodeFlag,
          hasPackNumber: this.configurationList.hasPackNumber,
          edition: this.configurationList.edition
        });
      });
      // this.printData = resData.value;
      // this.printData.forEach((item) => {
      //   item.hasPackNumber = this.configurationList.hasPackNumber;
      //   item.edition = this.configurationList.edition;
      //   item.vin = this.configurationList.vin;
      //   item['orderNo'] = item['billNo'];
      // });
      // this.configuration.forEach((item) => {
      //   console.log(item);
      //   for (let i = 0; i < this.printData.length; i++) {
      //     console.log(this.printData[i]);
      //     this.printData[i][item] = this.configurationList.item;
      //   }
      // });
      // this.printData[0].printDate = new Date();
      if (btn === 'preview') {
        this.lodopService.preview(NormalTicketTplComponent, this.printData, 'data');
        this.getBasisCodePrintList();
      }
      if (btn === 'print') {
        this.lodopService.print(NormalTicketTplComponent, this.printData, 'data');
        this.getBasisCodePrintList();
      }
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public batchPreview(btn: string) {
    this.basisCodePrintDataList.forEach((item) => {
      if (item._checked) {
        this.selectedList.push(item.id);
      }
    });
    if (!this.selectedList.length) {
      this.messageService.showAlertMessage('', '请选择要打印的数据', 'error');
      return;
    }
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }
    this.tableConfig.loading = true;
    this.basisCodeService.getInitInventoryBatchPrint(this.selectedList).subscribe((
      resData: BasisCodeServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      resData.value.forEach((item) => {
        if (!this.configurationList.totalQty && item.barcodeFlag === 0) {
          return;
        }
        this.printData.push({
          orderNo: item.billNo,
          materialsNo: item.materialsNo,
          materialsDes: item.materialsDes,
          vin: this.configurationList.vin,
          vinid: item.vinid,
          barcode: item.barcode,
          printDate: item.printTime,
          locationDesc: item.locationDesc,
          currentQty: item.currentQty,
          totalQty: item.totalQty,
          seq: item.seq,
          childCount: item.childCount,
          barcodeFlag: item.barcodeFlag,
          hasPackNumber: this.configurationList.hasPackNumber,
          edition: this.configurationList.edition
        });
      });
      // this.printData = resData.value;
      // this.printData.forEach((item) => {
      //   item.hasPackNumber = this.configurationList.hasPackNumber;
      //   item.edition = this.configurationList.edition;
      //   item.vin = this.configurationList.vin;
      //   item['orderNo'] = item['billNo'];
      // });
      // this.configuration.forEach((item) => {
      //   console.log(item);
      //   for (let i = 0; i < this.printData.length; i++) {
      //     console.log(this.printData[i]);
      //     this.printData[i][item] = this.configurationList.item;
      //   }
      // });
      this.printData[0].printDate = new Date();
      // this.printData.forEach((item) => {
      //   item['orderNo'] = item['billNo'];
      // });
      if (btn === 'preview') {
        this.lodopService.preview(NormalTicketTplComponent, this.printData, 'data');
        this.getBasisCodePrintList();
      }
      if (btn === 'print') {
        this.lodopService.print(NormalTicketTplComponent, this.printData, 'data');
        this.getBasisCodePrintList();
      }
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public advancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchClose() {
    this.advancedSearchShow = false;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getBasisCodePrintList();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-beginningBarcode',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operationTpl, width: 120, fixed: true },
      { title: '物料编码', field: 'materialsNo', width: 120 },
      { title: '入库单号', field: 'mainNo', width: 180 },
      { title: '物料名称', field: 'materialsDes', width: 160 },
      { title: '库存数量', field: 'totalQty', width: 80 },
      { title: '最小包装数量', field: 'minPackQty', width: 80 },
      { title: '零件号/图号', field: 'orawyd', width: 70 },
      { title: 'VIN号', field: 'vinid', width: 70 },
      { title: '导入人', field: 'createName', width: 70 },
      { title: '导入时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' },
      ]
    };
    this.printConfigurationForm = this.formBuilder.group({
      orawyd: [null],
      barcodeDesc: [null],
      model: [null],
      totalQty: [{ value: null, disabled: true }],
      currentQty: [null, Validators.required],
    });
    this.getBasisCodePrintList();
  }

}
