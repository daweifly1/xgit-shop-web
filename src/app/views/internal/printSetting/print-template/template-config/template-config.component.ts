import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {PrintServiceNs, PrintService} from '../../../../../core/trans/print.service';
import { PrintOrderTplComNs, PrintOrderTplComponent } from '../../../../../layout/print-order-tpl/print-order-tpl.component';
import {LodopPrintService, LodopPrintServiceNs} from '../../../../../core/infra/lodop-print.service';
interface TplTableConfigItem {
  name: string;
  list: any[];
  diction: {};
  type: number;
}
interface PaperConfigItem {
  name: string;
  width: number;
  height: number;
  readonly: boolean;
  unit: string;
  id: number;
}
interface PaperMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
  unit: string;
}
interface PageSetting {
  paperConfig: PaperConfigItem;
  paperMargin: PaperMargin;
  printDir: number;
}
@Component({
  selector: 'app-template-config',
  templateUrl: './template-config.component.html',
  styleUrls: ['./template-config.component.scss']
})
export class TemplateConfigComponent implements OnInit {
  /**
   * 返回事件*/
  @Output()finish: EventEmitter<any>;
  /**
   * 打印配置数据
   * */
  @Input()templateData: any;
  /**
   * 模板id*/
  @Input()templateId: string;
  submitData: PrintServiceNs.TemplateItemModel;
  bodyColumnInfo: any[];
  contentSetting: any;
  headerColInfo: any[];
  footerColInfo: any[];
  titleFontSizeList: number[];
  contentFontSizeList: number[];
  headAndEndColNum: number[];
  showSetting: boolean;
  tplTableConfig: TplTableConfigItem[];
  selectedSetItem: TplTableConfigItem;

  TableCellTypeEnum = {
    Header: 0,
    Footer: 1,
    Body: 2
  };
  paperConfigList: PaperConfigItem[];
  pageSetting: PageSetting;
  tplViewData: PrintOrderTplComNs.DataModel;
  tplViewFormatData: PrintOrderTplComNs.FormatDataModel;
  printDirList: any[];
  constructor(private printService: PrintService, private messageService: ShowMessageService,
                private lodopService: LodopPrintService
  ) {
    this.showSetting = false;
    this.finish = new EventEmitter<any>();
    this.templateData = {};
    this.headerColInfo = [];
    this.footerColInfo = [];
    this.templateId = null;
    this.titleFontSizeList = [12, 14, 16, 18, 20, 22, 24, 26];
    this.contentFontSizeList = [12, 14, 16, 18];
    this.headAndEndColNum = [1, 2, 3];
    this.printDirList = [{
      label: '默认',
      value: LodopPrintServiceNs.PageSizeDir.Default
    }, {
      label: '纵向',
      value: LodopPrintServiceNs.PageSizeDir.Portrait
    }, {
      label: '横向',
      value: LodopPrintServiceNs.PageSizeDir.Landscape
    }];
    this.paperConfigList = [{
      name: '三等分',
      width: 210,
      height: 93,
      readonly: true,
      unit: 'mm',
      id: 1
    }, {
      name: '二等分',
      width: 210,
      height: 139,
      readonly: true,
      unit: 'mm',
      id: 2
    }, {
      name: 'A4',
      width: 210,
      height: 297,
      readonly: true,
      unit: 'mm',
      id: 3
    }, {
      name: '自定义',
      width: 215,
      height: 93,
      readonly: false,
      unit: 'mm',
      id: 4
    }];
    this.tplTableConfig = [
      {
        name: '表头',
        list: this.headerColInfo,
        diction: {},
        type: this.TableCellTypeEnum.Header
      }, {
        name: '表体',
        list: this.bodyColumnInfo,
        diction: {},
        type: this.TableCellTypeEnum.Body
      }, {
        name: '表尾',
        list: this.footerColInfo,
        diction: {},
        type: this.TableCellTypeEnum.Footer
      }
    ];
    this.selectedSetItem = this.tplTableConfig[0];
  }
  public trackByItem(item: any, index: number) {
    return item;
  }
  /**
   * 复制表体和头尾信息*/
  public copyBodyOrHeader(headAndFooterList?: any[], bodyList?: any[]) {
      this.headerColInfo = [];
      this.footerColInfo = [];

      this.templateData.defaultTemplate.headerInfo.forEach((item: any) => {
        let newHeaderOrFooter = Object.assign({}, item);
        if (headAndFooterList) {
          const targetItem =  headAndFooterList.find(newItem => newItem.keyName === item.keyName);
          if (targetItem) {
            newHeaderOrFooter = Object.assign(newHeaderOrFooter, targetItem);
          } else {
            newHeaderOrFooter.isChecked = false;
          }
        }
        if (item.isHeader) {
          this.headerColInfo.push(newHeaderOrFooter);
        } else {
          this.footerColInfo.push(newHeaderOrFooter);
        }
      });
      this.bodyColumnInfo = [];
      this.templateData.defaultTemplate.tbodyInfo.forEach((item: any) => {
        let newBody = Object.assign({}, item);
        if (bodyList) {
          const targetBody = bodyList.find(newItem => newItem.keyName === item.keyName);
          if (targetBody) {
            newBody = Object.assign(newBody, targetBody);
          } else {
            newBody.isChecked = false;
          }
        }

        this.bodyColumnInfo.push(newBody);
      });
    this.tplTableConfig[0].list = this.headerColInfo;
    this.tplTableConfig[1].list = this.bodyColumnInfo;
    this.tplTableConfig[2].list = this.footerColInfo;
  }
  public onCancel() {
    this.finish.emit();
  }
  public onColSetting(item: any) {
    this.showSetting = true;
    this.selectedSetItem = item;
 }
  public onSetModalCancel() {
    this.showSetting = false;
  }
  public toTopOne(index: number) {
    if (index === 0) {
      return;
    }
    const temp = this.selectedSetItem.list.splice(index, 1);
    this.selectedSetItem.list.splice(index - 1, 0 , temp[0]);
  }
  public toBottomOne(index: number) {
    if (index === this.selectedSetItem.list.length - 1) {
      return ;
    }
    const temp = this.selectedSetItem.list.splice(index, 1);
    this.selectedSetItem.list.splice(index + 1, 0 , temp[0]);
  }
  public headerToFooter(index: number) {
    const temp = this.selectedSetItem.list.splice(index, 1);
    temp[0].isHeader = false;
    this.footerColInfo.push(temp[0]);
  }
  public footerToHeader(index: number) {
    const temp = this.selectedSetItem.list.splice(index, 1);
    temp[0].isHeader = true;
    this.headerColInfo.push(temp[0]);
  }
  private parsePageSetting(setting: PageSetting) {
    this.pageSetting = setting;
    for (let i = 0, len = this.paperConfigList.length; i < len; i++) {
      if (this.paperConfigList[i].id === this.pageSetting.paperConfig.id) {
        this.paperConfigList[i].width = this.pageSetting.paperConfig.width;
        this.paperConfigList[i].height = this.pageSetting.paperConfig.height;
        this.pageSetting.paperConfig = this.paperConfigList[i];
        break;
      }
    }
  }
  private setSubmitData() {
    this.submitData.contentSetting = JSON.stringify(this.contentSetting);
    this.submitData.pageSetting = JSON.stringify(this.pageSetting);
    this.submitData.bodyColumnInfo = JSON.stringify(this.bodyColumnInfo);
    const headerAndFooterList = [];
    headerAndFooterList.push(...this.headerColInfo, ...this.footerColInfo);
    this.submitData.headerFooterColumnInfo = JSON.stringify(headerAndFooterList);
  }
  public submitTpl() {
    if (!this.submitData.templateName) {
      this.messageService.showToastMessage('请输入模板名称', 'warning');
      return;
    }
    this.setSubmitData();
    let observe: any;
    if (this.templateId) {
      observe = this.printService.updateTemplate(this.submitData);
    } else {
      observe = this.printService.insertTemplate(this.submitData);
    }
    observe.subscribe((resData: PrintServiceNs.UfastHttpRes) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.finish.emit();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private setViewTplData () {
    this.tplViewFormatData = {
      contentSetting: this.contentSetting,
      pageSetting: this.pageSetting,
      bodyColumnInfo: this.bodyColumnInfo,
      headerColInfo: this.headerColInfo,
      footerColInfo: this.footerColInfo
    };
    this.tplViewData = {
      config: this.submitData,
      data: [this.templateData.testData],
      printTempBdDiction: this.templateData.printTempBdDiction,
      cacheHeaderFootDiction: this.templateData.cacheHeaderFootDiction
    };
  }
  public previewPrint() {
    if (!this.lodopService.isInitSuccess()) {
      this.messageService.showAlertMessage('', '打印插件初始化失败', 'error');
      return;
    }
    const printDataConfig: PrintOrderTplComNs.DataModel = {
      config: this.submitData,
      data: [this.templateData.testData],
      printTempBdDiction: this.templateData.printTempBdDiction,
      cacheHeaderFootDiction: this.templateData.cacheHeaderFootDiction
    };
    this.setSubmitData();
    this.lodopService.preview(PrintOrderTplComponent, printDataConfig, 'data');
  }
  /**
   * 定义表尾，转换空格和换行
   * */
  public onCustomFooter(data: string) {
    if (!data) {
      this.submitData.bottomMessage = data;
      return;
    }
    this.submitData.bottomMessage = data.replace(/\r\n/g, '<br/>')
      .replace(/\n/g, '<br/>')
      .replace(/\s/g, '&emsp;');
  }
  ngOnInit() {
    this.submitData = {
      bodyFontSize: 14,
      bottomMessage: '',
      contentSetting: '',
      createDate: undefined,
      footerColumnNum: 2,
      headFontSize: 20,
      headMessage: this.templateData.Name,
      headType: 0,
      headerColumnNum: 2,
      headerFooterColumnInfo: '',
      isBodyAutoLineWrap: true,
      isDefault: false,
      isDel: false,
      isHeadlineFontBold: true,
      isNote: false,
      isPrintLine: false,
      isPrintMinCode: false,
      isPrintPageSubtotal: false,
      isReceipt: false,
      lineHeight: 7,
      pageSetting: '',
      printColumn: undefined,
      printLineNum: 7,
      templateName: '',
      templateType: this.templateData.TemplateType
    };
    this.contentSetting = {
      fontSize: 14,
      rowHigh: 7,
      headAndFooterHigh: 6,
      tableHeadColNum: 2,
      tableEndColNum: 2
    };
    this.pageSetting = {
      paperMargin: {
        top: 3,
        bottom: 1,
        left: 2,
        right: 2,
        unit: 'mm'
      },
      paperConfig: this.paperConfigList[2],
      printDir: LodopPrintServiceNs.PageSizeDir.Default
    };

    this.copyBodyOrHeader();
    this.setViewTplData();
    if (this.templateId) {
      this.printService.getTemplateItem(this.templateId).subscribe((resData: PrintServiceNs.UfastHttpRes) => {
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.submitData = resData.value;
        this.copyBodyOrHeader(JSON.parse(this.submitData.headerFooterColumnInfo), JSON.parse(this.submitData.bodyColumnInfo));
        this.parsePageSetting(JSON.parse(this.submitData.pageSetting));
        this.contentSetting = JSON.parse(this.submitData.contentSetting);
        this.setViewTplData();
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    }
    this.tplTableConfig[0].diction = this.templateData.cacheHeaderFootDiction;
    this.tplTableConfig[1].diction = this.templateData.printTempBdDiction;
    this.tplTableConfig[2].diction = this.templateData.cacheHeaderFootDiction;
  }
}
