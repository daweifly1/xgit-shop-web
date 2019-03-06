import { Component, Input, OnInit } from '@angular/core';
import { DevanningPrintServiceNs } from '../../../../core/trans/devanningPrint.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { NormalTicketTplComponent, TemplateDataDigger
 } from '../../../../layout/print-template/normal-ticket-tpl/normal-ticket-tpl.component';
import { PrintErrorService } from '../../../../widget/print-error/print-error';
import { LodopPrintService } from '../../../../core/infra/lodop-print.service';
import { BasisCodeService } from '../../../../core/trans/basisCode.service';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { ActivatedRoute } from '@angular/router';
import {environment} from '../../../../../environments/environment';
import {ActionCode} from '../../../../../environments/actionCode';

enum MaxInputLength {
  Default = 50
}
@Component({
  selector: 'app-package-code',
  templateUrl: './package-code.component.html',
  styleUrls: ['./package-code.component.scss']
})
export class PackageCodeComponent implements OnInit {
  ActionCode = ActionCode;
  searchText: string;
  tableConfig: UfastTableNs.TableConfig;
  packageCodePrintDataList: any[];
  orderHeaderInfo: any;
  show: boolean;
  printModelTitle: string;
  searchPlaceholder: string;
  orderNo: string;
  printData: TemplateDataDigger[];
  dynamicData: any[];

  MaxInputLen = MaxInputLength;
  selectedBarcode: any;
  printConfig: any;
  packageList: { vinId: string; singleNum: number; }[];
  supplierName: string;    //  打印供应商名称
  contractNo: string;       //  打印合同编号
  precision: number;
  maxSplitNum: number;
  materialNumDec: number;
  constructor(private basisCodeService: BasisCodeService,
    private messageService: ShowMessageService,
    private lodopService: LodopPrintService,
    private printErrorService: PrintErrorService,
    private utilService: UfastUtilService,
    private route: ActivatedRoute) {
    this.precision = environment.otherData.materialNumMin;
    this.materialNumDec = environment.otherData.materialNumDec;
    this.maxSplitNum = 0;
    this.printConfig = {
      model: '',
      specDesc: '',
      sumNum: '',
      packageNum: '',
      totalBarcode: false,
      barcode: true,
      vin: true,
      printPackNum: true
    };
    this.packageCodePrintDataList = [];
    this.show = false;
    this.printModelTitle = '条码打印配置';
    this.searchPlaceholder = '单据号';
    this.dynamicData = [];
    this.printData = [];
    this.packageList = [];
    this.orderNo = '';
    this.supplierName = '';
    this.contractNo = '';
  }
  public onRowSelected(value: UfastTableNs.SelectedChange) {
    if (value.type === UfastTableNs.SelectedChangeType.Unchecked) {
      this.packageList = [];
      this.maxSplitNum = 0;
      this.printConfig.packageNum = 0;
      this.printConfig.sumNum = 0;
      this.selectedBarcode = null;
      return;
    }

    const selectIndex = this.utilService.add(value.index,
      (this.utilService.mul(this.utilService.sub(this.tableConfig.pageNum, 1), this.tableConfig.pageSize)));
    this.selectedBarcode = this.packageCodePrintDataList[selectIndex];
    this.packageCodePrintDataList.forEach((item) => {
      item[this.tableConfig.checkRowField] = false;
    });
    this.selectedBarcode[this.tableConfig.checkRowField] = true;
    this.printConfig.sumNum = this.selectedBarcode.minPackQty;
    this.printConfig.packageNum = 1;
    this.maxSplitNum = this.utilService.div(this.printConfig.sumNum, this.precision);
    this.splitPackage();
  }
  public splitPackage() {
    if (this.printConfig.packageNum === 0) {
      return;
    }
    const splitData = this.utilService.splitNumber(this.printConfig.sumNum, this.printConfig.packageNum, this.precision);
    this.packageList = [];

    for (let i = 0; i < this.printConfig.packageNum; i++) {
      this.packageList.push({
        singleNum: splitData.avg,
        vinId: ''
      });
    }
    this.packageList[this.printConfig.packageNum - 1].singleNum = this.utilService.add(splitData.avg, splitData.remain);

  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  getPackageCodePrintList = () => {
    this.tableConfig.loading = true;
    this.packageCodePrintDataList = [];
    this.printConfig = {
      model: '',
      specDesc: '',
      sumNum: '',
      packageNum: '',
      totalBarcode: false,
      barcode: true,
      vin: true,
      printPackNum: true
    };
    this.basisCodeService.getPackageCodePrint(this.orderNo.trim()).subscribe((
      resData: DevanningPrintServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      if (resData.value === null) {
        return;
      }
      resData.value.detailList.forEach((item) => {
        const temp = <any>{};
        // const minPackQty = item['amount'] - item['printNum'];
        const minPackQty = this.utilService.sub(item['amount'], item['printNum']);
        temp['printState'] = item['printState'];
        temp['materialNo'] = item['materialNo'];
        temp['materialName'] = item['materialName'];
        temp['amount'] = item['amount'];
        temp['minPackQty'] = minPackQty;
        temp['warehouseCode'] = item['warehouseCode'];
        temp['status'] = item['status'];
        temp['businessLineId'] = item['businessLineId'];
        this.packageCodePrintDataList.push(temp);
      });
      this.packageCodePrintDataList = [...this.packageCodePrintDataList];
      this.tableConfig.total = this.packageCodePrintDataList.length;
      this.packageCodePrintDataList.forEach((item) => {
        if (item.printState === 2) {
          item[this.tableConfig.checkRowDisabledField] = true;
        }
      });
      this.orderHeaderInfo = resData.value.headerInfo;
      // this.printConfig = {};
      this.packageList = [];
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public onClick(event: Event) {
    this.show = !this.show;
    event.stopPropagation();
  }
  /**
   * 打印
   */
  public printBarcode() {
    if (!this.selectedBarcode) {
      this.messageService.showToastMessage('没有可打印的条码', 'warning');
      return;
    }

    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }

    if (!this.checkData()) {
      return;
    }
    this.reqSplitBarcode(() => {
      this.lodopService.print(NormalTicketTplComponent, this.printData, 'data');
      this.getPackageCodePrintList();
      this.printConfig = {
        model: '',
        specDesc: '',
        sumNum: '',
        packageNum: '',
        totalBarcode: false,
        barcode: true,
        vin: true,
        printPackNum: true
      };
    });

  }
  /**
   * 预览
   */
  public previewBarcode() {
    if (!this.selectedBarcode) {
      this.messageService.showToastMessage('没有可打印的条码', 'warning');
      return;
    }
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }

    if (!this.checkData()) {
      return;
    }
    this.reqSplitBarcode(() => {
      this.lodopService.preview(NormalTicketTplComponent, this.printData, 'data');
      this.getPackageCodePrintList();
      this.printConfig = {
        model: '',
        specDesc: '',
        sumNum: '',
        packageNum: '',
        totalBarcode: false,
        barcode: true,
        vin: true,
        printPackNum: true
      };
    });
  }

  private checkData(): boolean {
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return false;
    }
    if (this.packageList.length === 0) {
      return false;
    }
    let sum = 0;
    this.packageList.forEach((item) => {
      if (!item.singleNum)  {
        this.messageService.showToastMessage('每包数量不能为空和0', 'warning');
        return false;
      }

      sum = this.utilService.add(sum, item.singleNum);
    });
    if (sum !== this.printConfig.sumNum) {
      this.messageService.showToastMessage('每包数量之和必须等于总数量', 'warning');
      return false;
    }
    return true;
  }
  private reqSplitBarcode(callback: Function) {
    const data = {
      billNo: this.orderNo,
      materialsNo: this.selectedBarcode.materialNo,
      materialsDes: this.selectedBarcode.materialName,
      billType: this.selectedBarcode.businessSingle,
      billLineId: this.selectedBarcode.businessLineId,
      totalQty: this.printConfig.sumNum,
      detailList: this.packageList.map((item) => {
        return {
          barcodeDesc: '',
          currentQty: item.singleNum,
          vinid: item.vinId,
          orawyd: this.printConfig.specDesc,
          model: this.printConfig.model
        };
      })
    };

    this.basisCodeService.printPackageBarcode(data).subscribe((resData: DevanningPrintServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.printData = [];
      resData.value.forEach((item) => {
        if (!this.printConfig.totalBarcode && item.barcodeFlag === 0) {
          return;
        }
        this.printData.push({
          orderNo: this.orderNo,
          materialsNo: item.materialsNo,
          materialsDes: item.materialsDes,
          vin: this.printConfig.vin,
          vinid: item.vinid,
          barcode: item.barcode,
          printDate: item.createTime,
          locationDesc: item.locationDesc,
          currentQty: item.currentQty,
          totalQty: item.totalQty,
          seq: item.seq,
          childCount: item.childCount,
          barcodeFlag: item.barcodeFlag,
          edition: this.printConfig.barcode,
          hasPackNumber: this.printConfig.printPackNum,
          supplierName: this.orderHeaderInfo.supplierName,
          contractNo: this.orderHeaderInfo.purchaseNo
        });
      });
      callback();
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-packageCode',
      pageSize: 10,
      showCheckbox: true,
      checkAll: false,
      showPagination: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      disabledCheckAll: true,
      checkRowDisabledField: '_disableRowChecked',
      frontPagination: true,
      splitPage: true,
      headers: [
        { title: '打印标志', field: 'printState', width: 120, fixed: true, pipe: 'printState' },
        { title: '物料编码', field: 'materialNo', width: 150, fixed: true },
        { title: '物料名称', field: 'materialName', width: 160, fixed: true },
        { title: '数量', field: 'amount', width: 80 },
        { title: '未打数量', field: 'minPackQty', width: 110 },
        // { title: '仓库', field: 'warehouseCode', width: 70 },
        { title: '操作标志', field: 'printState', width: 100, pipe: 'packageCodeStatus' },
      ]
    };
    this.route.queryParams.subscribe((params) => {
      const paramOrderNo = params ? params.order : '';
      if (!paramOrderNo) {
        return;
      }
      this.orderNo = paramOrderNo;
      this.getPackageCodePrintList();
    });
  }

}
