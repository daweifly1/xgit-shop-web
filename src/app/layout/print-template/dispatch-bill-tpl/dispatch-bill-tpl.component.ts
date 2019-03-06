import { Component, OnInit, Input } from '@angular/core';
import { LodopPrintService, LodopPrintServiceNs } from '../../../core/infra/lodop-print.service';
import { localDataKeyObj } from '../../../../environments/environment';
import { UfastUtilService } from '../../../core/infra/ufast-util.service';
export interface DispatchBillTplData {
  invoiceNo: string; // 单号
  createDate: string; // 时间
  purchaseNo: string;  // 合同号
  goodsReceivor: string;   // 收货单位
  consignee: string;   // 收货人
  deliveryPhone: string; // 联系电话
  supplierName: string;  // 发货单位
  logisticsContact: string; // 联系人
  logisticsPhone: string; // 联系电话
}
@Component({
  selector: 'app-dispatch-bill-tpl',
  templateUrl: './dispatch-bill-tpl.component.html',
  styleUrls: ['./dispatch-bill-tpl.component.scss']
})
export class DispatchBillTplComponent implements OnInit {
  @Input()
  set data(value: DispatchBillTplData[]) {
    console.log(this.printData);
    this.setPrinter();
    this.printData = value;
  }
  printData: DispatchBillTplData[];

  constructor(
    private utilService: UfastUtilService,
    private lodopService: LodopPrintService
  ) {
    this.printData = [];
  }
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
