import { Component, OnInit, Input } from '@angular/core';
import {LodopPrintService, LodopPrintServiceNs} from '../../../core/infra/lodop-print.service';
import {localDataKeyObj} from '../../../../environments/environment';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
export interface InvoiceContactOrder {
  orderNo: string;      // 单号
  invoiceDate: any;      //  日期
  goodsPrice: number;   // 物资价款
  transportFees: number; // 运杂费
  prepayments: number;   // 预付款
  warranty: number;     // 质保金
  deduction: number;    // 扣款项
  total: number;        // 合计
  invoiceBillId: string;    // 发票号
  billNum: number;        // 附件张数
  purchaseNos: string;    // 合同号
  payee: string;          // 收款单位全称
  payeeAddress: string;   // 收款单位地址
  billBankAddress: string;  // 收款单位开户行地址
  billAccountNo: string;    // 收款单位账号
  deptGovernor?: string;         // 部门主管
  sectionLeader?: string;           // 科室负责人
  agent?: string;            // 经办人
  approver?: string;         // 审批人
  rechecker?: string;        // 复审人
  printDir?: LodopPrintServiceNs.PageSizeDir;     // 打印方向
}
@Component({
  selector: 'app-invoice-contact-tpl',
  templateUrl: './invoice-contact-tpl.component.html',
})
export class InvoiceContactTplComponent implements OnInit {
  @Input()
  set data(value: InvoiceContactOrder) {
    this._data = value;
    this.setPrinter();
  }
  _data: InvoiceContactOrder;
  width = 290;
  height = 140;
  constructor(private lodopService: LodopPrintService, private utilService: UfastUtilService) { }
  private setPrinter () {
    this.lodopService.initPrintTask();
    const printer = this.utilService.getLocalData(localDataKeyObj.invoicePrinterKey);
    this.lodopService.setPrinter(printer);
    if (this._data.printDir === LodopPrintServiceNs.PageSizeDir.Landscape) {
      [this.width, this.height] = [this.height, this.width];
    } else {
      this._data.printDir = LodopPrintServiceNs.PageSizeDir.Default;
    }

    this.lodopService.setPageSize(this._data.printDir, this.width,
      this.height, '');
    this.lodopService.setPrintMode('FULL_WIDTH_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('FULL_HEIGHT_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('RESELECT_PAGESIZE', true);
    this.lodopService.setPrintMargin({
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    });
  }
  ngOnInit() {
  }

}
