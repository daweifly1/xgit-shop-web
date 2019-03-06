import {Injectable, Injector, ComponentRef, ComponentFactoryResolver, EventEmitter} from '@angular/core';
import { ShowMessageService } from '../../widget/show-message/show-message';
/**
 * 注意：需要打印的组件要卸载模块装饰器的entryComponents数组中，否则无法动态加载
 * **/
declare let window: any;

export namespace LodopPrintServiceNs {

  export interface PrinterConfig {
    port: number;
    id: string;
    priority: number;
  }
  export enum PageSizeDir {
    Default,      // 默认值,打印方向由操作者自行选择或按打印机缺省设置
    Portrait,     // 纵向打印，固定纸张
    Landscape,    // 横向打印固定纸张
    PortraitFit   // 纵向打印，宽度固定，高度按打印内容的高度自适应
  }
  export interface PrintMargin {
    top: string;
    bottom: string;
    left: string;
    right: string;
  }
  export class LodopPrintServiceClass {

    private messageService: ShowMessageService;
    private compResolver: ComponentFactoryResolver;
    private tplCompHost: HTMLElement;
    lodop: any;
    printerConfigs: PrinterConfig[];
    private errorCount: number;
    private successConnt: number;
    private compRef: ComponentRef<any>;
    private lodopReturnEmitter: EventEmitter<any>;
    private printMargin: PrintMargin;
    constructor( private injector: Injector) {
      this.messageService = this.injector.get(ShowMessageService);
      this.compResolver = this.injector.get(ComponentFactoryResolver);
      this.printMargin = {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      };
      this.lodopReturnEmitter = new EventEmitter();
      this.tplCompHost = null;
      this.compRef = null;
      this.lodop = null;
      this.errorCount = 0;
      this.successConnt = 0;

      this.printerConfigs = [{
        port: 8001,
        id: 'lodop_script_1',
        priority: 1
      }, {
        port: 18000,
        id: 'lodop_script_2',
        priority: 2
      }, {
        port: 8000,
        id: 'lodop_script_3',
        priority: 3
      }];
    }
    public isInitSuccess(): boolean {
      return !!this.lodop;
    }
    /**
     * 初始化打印设置
     * **/
    public initPrinter(): Promise<any> {
      this.errorCount = 0;
      this.successConnt = 0;
      this.lodop = null;

      return new Promise<any>((resolve, reject) => {
        window['On_CLodop_Opened'] = (lodoper) => {
          this.lodop = lodoper;
          if (lodoper) {
            this.lodop.On_Return_Remain = true;
            this.lodop.On_Return = (taskId: string, value: any) => {

              this.lodopReturnEmitter.emit({
                taskId: taskId,
                value: value
              });
            };
            resolve();
          } else {
            reject('连接打印机失败');
          }
          window['On_CLodop_Opened'] = null;
        };
        this.printerConfigs.forEach((item: PrinterConfig, index: number) => {
          let script: HTMLScriptElement = <HTMLScriptElement>document.getElementById(item.id);
          if (script) {
            script.onerror = null;
            script.parentElement.removeChild(script);
            script = null;
          }
          script = document.createElement('script');
          script.id = item.id;
          script.src = `http://localhost:${item.port}/CLodopfuncs.js?priority=${item.priority}`;
          const head: HTMLHeadElement = <any>(document.head || document.getElementsByTagName('head')[0]);
          head.insertBefore(script, head.firstChild);

          script.onerror = (event: any) => {
            script.onerror = null;
            script.onload = null;
            this.errorCount++;
            if (this.errorCount === this.printerConfigs.length) {
              reject();
            }
          };
          script.onload = () => {
            this.successConnt++;
            script.onerror = null;
            script.onload = null;
            window.LODOP.SET_LICENSES('', 'C1DC8CE8F6CBCE6146213ABFCBCB0EA0', 'C94CEE276DB2187AE6B65D56B3FC2848', '');
          };
        });
      });
    }
    /**
     * 获取打印设备名称列表
     * **/
    public getPrinterDevList(): string[] {
      if (this.lodop === null) {
        return [];
      }

      const printerCount: number = this.lodop.GET_PRINTER_COUNT();
      const printerNameList: string[] = [];

      for (let i = 0; i < printerCount; i++) {
        printerNameList.push(this.lodop.GET_PRINTER_NAME(i));
      }

      return printerNameList;
    }
    /**
     * @getPageSizeList: 获取打印机纸张列表
     * @printer: 打印机序号或名称
     * @return：包含打印机名称数组
     * **/
    public getPageNameList(printer: string | number): string[] {
      if (this.lodop === null) {
        return [];
      }
      const splitStr = '\n';
      const printListStr = this.lodop.GET_PAGESIZES_LIST(printer, splitStr);
      if (printListStr === null || printListStr === undefined) {
        return [];
      } else {
        return printListStr.split(splitStr);
      }
    }
    /**
     * @setPageSize: 设置纸张尺寸和打印方向
     * @dir: 纸张方向(见PageSizeDir)
     * @widthMm: 纸张宽度（毫米），0表示无效
     * @heightMm: 纸张高度（毫米）, 0表示无效
     * @pageName: 纸张类型名称，使用getPageSizeList获得.当widthMm和heightMm都为0时，此参数才起作用
     * **/
    public setPageSize(dir: PageSizeDir, widthMm: number, heightMm: number, pageName: string) {
      if (this.lodop === null) {
        return;
      }
      this.lodop.SET_PRINT_PAGESIZE(dir, widthMm * 10, heightMm * 10, pageName);
    }
    /**
     * 设置打印设备
     * @name：打印设备的名称
     * **/
    public setPrinter(name: string): boolean {
      if (this.lodop === null) {
        return false;
      }
      return this.lodop.SET_PRINTER_INDEXA(name);
    }
    private subscribe(taskId): Promise<any> {
      return new Promise((resolve, reject) => {
        const subHandler: any = this.lodopReturnEmitter.subscribe((resObj: any) => {
          if (resObj.taskId !== taskId) {
            return;
          }
          subHandler.unsubscribe();
          if (resObj.value) {
            resolve('发送打印指令成功');
          } else {
            reject('打印失败');
          }
        });
      });

    }
    public setPrintMode(modeType: string, value: any) {
      this.lodop.SET_PRINT_MODE(modeType, value);
    }
    public initPrintTask(name?: string) {
      const timestamp = new Date().getTime();
      this.lodop.PRINT_INIT(name || 'brkwin_print_' + timestamp);
    }
    private getPrintHtml(component: any, data: any, dataField: string): string {

      if (this.compRef) {
        this.compRef.destroy();
      }
      this.compRef = this.compResolver.resolveComponentFactory(component).create(this.injector);
      (<any>this.compRef.instance)[dataField] = data;
      this.compRef.changeDetectorRef.detectChanges();
      const html = (this.compRef.location.nativeElement).innerHTML;
      this.compRef.destroy();
      return html;
    }
    public setPrintMargin(margin: PrintMargin) {
      this.printMargin = margin;
    }
    /***
     * 将打印内容发送到打印机
     * @component:组件
     * @data:需要传入组件内的数据（组件内要写成输入属性的形式）
     * @dataField:组件内data的字段名
     * **/
    public print(component: any, data: any, dataField: string = 'data'): Promise<string> {
      this.addContent(this.getPrintHtml(component, data, dataField));
      return this.subscribe(this.lodop.PRINT());
    }
    /***
     * 打印预览
     * 注意：只有打印预览的窗口关闭，promise才会返回
     * @component:组件
     * @data:需要传入组件内的数据（组件内要写成输入属性的形式）
     * @dataField:组件内data的字段名
     * **/
    public preview(component: any, data: any, dataField: string = 'data'): Promise<string> {
      this.addContent(this.getPrintHtml(component, data, dataField));
      return this.subscribe(this.lodop.PREVIEW());
    }
    private addContent(content: any) {
      if (this.lodop === null) {
        return false;
      }
      this.lodop.ADD_PRINT_HTM(this.printMargin.top, this.printMargin.left, '100%', '100%', content);
    }
    /**
     * */
    public printTable(component: any, data: any, dataField: string = 'data'): Promise<string> {
      this.lodop.ADD_PRINT_TABLE(0, 0, '100%', '100%', this.getPrintHtml(component, data, dataField));
      return this.subscribe(this.lodop.PRINT());
    }
    public previewTable(component: any, data: any, dataField: string = 'data'): Promise<string> {
      this.lodop.ADD_PRINT_TABLE(0, 0, '100%', '100%', this.getPrintHtml(component, data, dataField));
      return this.subscribe(this.lodop.PREVIEW());
    }
  }
}
@Injectable()
export class LodopPrintService extends LodopPrintServiceNs.LodopPrintServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
