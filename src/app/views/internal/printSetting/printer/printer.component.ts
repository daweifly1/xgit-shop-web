import { Component, OnInit } from '@angular/core';
import { localDataKeyObj, environment } from '../../../../../environments/environment';
import { LodopPrintService } from '../../../../core/infra/lodop-print.service';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import {PrintErrorService} from '../../../../widget/print-error/print-error';
interface PrinterItemModel {
  localKey: string;
  selected: string;
  paperType?: string;
}
interface PrinterSetting {
  barcode: PrinterItemModel;
  invoice: PrinterItemModel;
}
@Component({
  selector: 'app-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer.component.scss']
})
export class PrinterComponent implements OnInit {

  printSetting: PrinterSetting;
  printDevList: string[];
  constructor(private lodopService: LodopPrintService, private utilService: UfastUtilService,
              private messageService: ShowMessageService, private printErrorService: PrintErrorService
  ) {
    this.printDevList = [];
    this.printSetting = {
      barcode: {
        localKey: localDataKeyObj.barcodePrinterKey,
        selected: this.utilService.getLocalData(localDataKeyObj.barcodePrinterKey)
      },
      invoice: {
        localKey: localDataKeyObj.invoicePrinterKey,
        selected: this.utilService.getLocalData(localDataKeyObj.invoicePrinterKey)
      }
    };
  }

  public getPrintDevList() {
    this.printDevList = this.lodopService.getPrinterDevList();
  }
  public saveDev() {
    this.messageService.showLoading('');
    setTimeout(() => {
      this.messageService.closeLoading();
    }, 5000);
    Object.keys(this.printSetting).forEach((item: string) => {
      this.utilService.setLocalData(this.printSetting[item].localKey, this.printSetting[item].selected);
    });
    this.messageService.showToastMessage('保存成功', 'success');
  }
  public trackByDev(item: string, index: number) {
    return item;
  }
  private initSelected() {
    if (this.printDevList.length === 0) {
      return;
    }
    Object.keys(this.printSetting).forEach((item: string) => {
      if (!this.printSetting[item].selected) {
        this.printSetting[item].selected = this.printDevList[0];
      }
    });
  }
  ngOnInit() {
    // if (this.lodopService.isInitSuccess()) {
    //   this.getPrintDevList();
    //   this.initSelected();
    // } else {
    //   this.lodopService.initPrinter().then(() => {
    //     this.getPrintDevList();
    //     this.initSelected();
    //   }, () => {
    //     this.printErrorService.showInitError();
    //   });
    // }

  }
}
