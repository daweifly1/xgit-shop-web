import { Component, OnInit, Input } from '@angular/core';
import {PrintServiceNs} from '../../core/trans/print.service';
import {LodopPrintService, LodopPrintServiceNs} from '../../core/infra/lodop-print.service';
import {localDataKeyObj} from '../../../environments/environment';
import {UfastUtilService} from '../../core/infra/ufast-util.service';
export namespace PrintOrderTplComNs {
  export interface DataModel {
    config: PrintServiceNs.TemplateItemModel;   // 模板配置
    data: {               // 需要打印的数据
      headerInfo: any;    // 单据头和尾数据
      dataList: any[];    // 列表数据
    }[];
    printTempBdDiction: any;    // 表体字典
    cacheHeaderFootDiction: any;  // 头尾字典
  }

  export interface FormatDataModel {
    contentSetting: any;
    pageSetting: any;
    footerColInfo: any;
    bodyColumnInfo: any;
    headerColInfo: any;
  }
}
@Component({
  selector: 'app-print-order-tpl',
  templateUrl: './print-order-tpl.component.html',
})
export class PrintOrderTplComponent implements OnInit {
  /**
   * 打印渲染模板时传入的数据
   * */
  @Input()
  set data(value: PrintOrderTplComNs.DataModel) {
    this._data = value;
    if (!this._formatData) {
      try {
        this.copyBodyOrHeader(JSON.parse(value.config.headerFooterColumnInfo), JSON.parse(value.config.bodyColumnInfo));
        this.contentSetting = JSON.parse(value.config.contentSetting);
        this.pageSetting = JSON.parse(value.config.pageSetting);
        this.setPrinter();
      } catch (e) {
      }
      this.setPreviewStyle(this._preview);
    }
  }
  /**
   * 直接在页面上显示模板时传入的数据
   * */
  @Input()
  set formatData(value: PrintOrderTplComNs.FormatDataModel) {
    this._formatData = value;
    this.contentSetting = value.contentSetting;
    this.pageSetting = value.pageSetting;
    this.bodyColumnInfo = value.bodyColumnInfo;
    this.headerColInfo = value.headerColInfo;
    this.footerColInfo = value.footerColInfo;
    this.setPrinter();
    this.setPreviewStyle(this._preview);
  }
  @Input()
  set preview(value: boolean) {
    this._preview = value;
    this.setPreviewStyle(value);
  }
  headerColInfo: any[];
  footerColInfo: any[];
  bodyColumnInfo: any[];
  pageSetting: {paperMargin: any; paperConfig: any; printDir: number };
  contentSetting: any;
  _data: PrintOrderTplComNs.DataModel;
  paperPadding: string;
  _formatData: PrintOrderTplComNs.FormatDataModel;
  _preview: boolean;
  previewStyle: any;
  constructor(private utilService: UfastUtilService, private lodopService: LodopPrintService) {
    this.preview = false;
    this._formatData = null;
    this.paperPadding = '';
    this.contentSetting = {};
    this.pageSetting = {
      paperMargin: {},
      paperConfig: {},
      printDir: LodopPrintServiceNs.PageSizeDir.Default
    };
  }
  /**
   * 打印前设置lodop打印页面
   * */
  private setPreviewStyle(value: boolean) {
    if (value) {
      this.previewStyle = this.pageSetting;
      this.previewStyle.borderWidth = '1px';
    } else {
      const defaultMargin = {top: 0, bottom: 0, left: 0, right: 0, unit: ''};
      this.previewStyle = {
        paperConfig: {
          width: '100%',
          height: '',
          unit: ''
        },
        paperMargin: this.pageSetting ? this.pageSetting.paperMargin : defaultMargin,
        borderWidth: '0'
      };
    }
  }
  /**
   * 打印前设置lodop打印参数
   * */
  private setPrinter () {
    this.lodopService.initPrintTask();
    const printer = this.utilService.getLocalData(localDataKeyObj.invoicePrinterKey);
    this.lodopService.setPrinter(printer);
    if (this.pageSetting.printDir === null || this.pageSetting.printDir === undefined) {
      this.pageSetting.printDir = LodopPrintServiceNs.PageSizeDir.Default;
    }
    this.lodopService.setPrintMargin({
      top: '0mm',
      left: '0mm',
      right: '0mm',
      bottom: '0mm'
    });
    const width = parseInt(this.pageSetting.paperConfig.width, 10);
    const height = parseInt(this.pageSetting.paperConfig.height, 10);
    this.lodopService.setPageSize(this.pageSetting.printDir, width, height, '');
    this.lodopService.setPrintMode('FULL_WIDTH_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('FULL_HEIGHT_FOR_OVERFLOW', false);
    this.lodopService.setPrintMode('RESELECT_PAGESIZE', true);

  }
  /**
   * 解析模板配置数据
   * */
  public copyBodyOrHeader(headAndFooter?: any[], body?: any[]) {
    if (headAndFooter) {
      this.headerColInfo = [];
      this.footerColInfo = [];
      headAndFooter.forEach((item: any) => {
        const obj = {};
        Object.keys(item).forEach((key: string) => {
          obj[key] = item[key];
        });
        if (item.isHeader) {
          this.headerColInfo.push(obj);
        } else {
          this.footerColInfo.push(obj);
        }
      });
    }
    if (body) {
      this.bodyColumnInfo = [];
      body.forEach((item: any) => {
        const obj = {};
        Object.keys(item).forEach((key: string) => {
          obj[key] = item[key];
        });
        this.bodyColumnInfo.push(obj);
      });
    }
  }
  ngOnInit() {
  }

}
