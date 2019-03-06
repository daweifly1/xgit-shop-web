import { Component, OnInit, Input } from '@angular/core';
import {LodopPrintService, LodopPrintServiceNs} from '../../../core/infra/lodop-print.service';
import {localDataKeyObj} from '../../../../environments/environment';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
export interface TemplateDataDigger {
  title?: string;
  orderNo?: string;
  materialsNo: string;
  materialsDes: string;
  edition?: string;
  vin: boolean;
  vinid?: string;
  barcode: string;
  telephone?: string;
  company?: string;
  printDate: any;
  locationDesc: string;
  currentQty?: number;
  totalQty: number;
  seq: number;
  childCount: number;
  barcodeFlag: number;
  hasPackNumber?: boolean;
  supplierName?: string;
  contractNo?: string;
}
@Component({
  selector: 'app-normal-ticket-tpl',
  templateUrl: './normal-ticket-tpl.component.html',
})
export class NormalTicketTplComponent implements OnInit {
  @Input()
  set data(value: TemplateDataDigger[]) {
    this.setPrinter();
  this.printData = value;
  }
  printData: TemplateDataDigger[];
  constructor(private utilService: UfastUtilService, private lodopService: LodopPrintService) { }
  private setPrinter () {
    this.lodopService.initPrintTask();
    const printer = this.utilService.getLocalData(localDataKeyObj.barcodePrinterKey);
    this.lodopService.setPrinter(printer);
    this.lodopService.setPrintMargin({
      top: '0mm',
      left: '0mm',
      right: '0mm',
      bottom: '0mm'
    });
    this.lodopService.setPageSize(LodopPrintServiceNs.PageSizeDir.Default, 100, 70, '');
    this.lodopService.setPrintMode('FULL_WIDTH_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('FULL_HEIGHT_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('RESELECT_PAGESIZE', true);
  }
  ngOnInit() {
  }

}
