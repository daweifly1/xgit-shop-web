import { Component, OnInit } from '@angular/core';
import {PrintServiceNs, PrintService} from '../../../../core/trans/print.service';
import {PrintTmplate} from '../../../../../environments/printData';
interface PageTypeObj {
  Main: number;
  TemplateList: number;
}
@Component({
  selector: 'app-print-template',
  templateUrl: './print-template.component.html',
  styleUrls: ['./print-template.component.scss']
})
export class PrintTemplateComponent implements OnInit {
  printTempalte = PrintTmplate;
  pageTypeObj: PageTypeObj;
  curPageType: number;
  invoiceData: any;
  constructor(private printService: PrintService) {
    this.pageTypeObj = {
      Main: 0,
      TemplateList: 1
    };
    this.curPageType = this.pageTypeObj.Main;
  }
  public trackByIndex(item: any, index: number) {
    return index;
  }
  public onTemplate(item: any) {
    if (!item.isEnable) {
      return;
    }
    this.curPageType = this.pageTypeObj.TemplateList;
    this.invoiceData = item;
  }
  public returnMain() {
    this.curPageType = this.pageTypeObj.Main;
  }
  ngOnInit() {
  }

}
