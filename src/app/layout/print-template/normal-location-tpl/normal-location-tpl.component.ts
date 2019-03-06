import { Component, OnInit, Input } from '@angular/core';
import {LodopPrintService, LodopPrintServiceNs} from '../../../core/infra/lodop-print.service';
import {localDataKeyObj} from '../../../../environments/environment';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
export interface LocationTplData {
  locationCode: string;
  areaCode?: string;     // 库区
  warehouseCode?: string;  // 仓库
  rowNo: string;        // 行
  columnNo: string;     // 列
  floorNo: string;      // 层
  seqNo?: string;        // 位
  shelfType?: string;    // 货架描述
  hasArea: boolean;
  hasShelfDes: boolean;
  hasSeq: boolean;
  hasWareHouse: boolean;
}
@Component({
  selector: 'app-normal-location-tpl',
  templateUrl: './normal-location-tpl.component.html',
})
export class NormalLocationTplComponent implements OnInit {
  @Input()
  set data(value: LocationTplData[]) {
    this.setPrinter();
    this.printData = value;
  }
  printData: LocationTplData[];
  constructor(private utilService: UfastUtilService, private lodopService: LodopPrintService) {
    this.printData = [];
  }
  private setPrinter () {
    this.lodopService.initPrintTask();
    const printer = this.utilService.getLocalData(localDataKeyObj.barcodePrinterKey);
    this.lodopService.setPrinter(printer);
    this.lodopService.setPageSize(LodopPrintServiceNs.PageSizeDir.Default, 100, 70, '');
    this.lodopService.setPrintMode('FULL_WIDTH_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('FULL_HEIGHT_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('RESELECT_PAGESIZE', true);
  }
  ngOnInit() {
  }

}
