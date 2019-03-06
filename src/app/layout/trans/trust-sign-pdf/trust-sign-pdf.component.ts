/**
 * CFCA TrustSignPDF 浏览器控件
 * 浏览器支持：IE6-IE11
 * 签章控件加载出来后不能使用框架的模态框，可使用浏览器原生alert
 */
import {Component, OnInit, ViewChild, ElementRef, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {TrustSignPdf} from './trust-sign-pdf';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {environment} from '../../../../environments/environment';
export interface SignPdfResult {
  success: boolean;   // false： 失败或取消
  filePath: string;   // 上传的签章后的文件路径
  message: string;
}
interface ActionStatus {
  startSign: boolean;
  resetCursor: boolean;
  resetFile: boolean;
}
@Component({
  selector: 'app-trust-sign-pdf',
  templateUrl: './trust-sign-pdf.component.html',
  styleUrls: ['./trust-sign-pdf.component.scss']
})
export class TrustSignPdfComponent implements OnInit, OnDestroy {
  /**
   * pdf文件路径
   * */
  @Input()pdfUrl: string;
  /**
   * 签章完成事件
   * */
  @Output()finish: EventEmitter<SignPdfResult>;
  @ViewChild('signWrapEle')signWrapEle: ElementRef;
  browserSupport: boolean;
  isX64: boolean;
  pdfCtrl: TrustSignPdf;
  signPdfCtrlSign: string;
  signPdfCtrlId: string;
  eventScriptList: any[];
  actionStatus: ActionStatus;
  uploadUrl: string;
  devMessageModalShow: boolean;
  TimestampServer = environment.otherData.signTimestampServer;
  pluginDownloadUrl = environment.otherData.signPluginDownloadUrl;
  constructor(private messageService: ShowMessageService, private cdRef: ChangeDetectorRef) {
    this.uploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.signPdfCtrlSign = `sign_${new Date().getTime()}`;
    this.signPdfCtrlId = this.signPdfCtrlSign + '_id';
    this.finish = new EventEmitter<SignPdfResult>();
    this.eventScriptList = [];
    this.isX64 = true;
    this.devMessageModalShow = false;
    this.actionStatus = <any>{};
    if (navigator.appName.indexOf('Internet') > 0 || navigator.appVersion.indexOf('Trident') >= 0) {
      this.browserSupport = true;
      if ((<any>navigator).cpuClass === 'x86') {
        this.isX64 = false;
      }
      this.setCtrlEvent();
    } else {
      this.browserSupport = false;
      this.messageService.showAlertMessage('', '此浏览器不支持签章功能，请使用Internet Explorer浏览器签章。', 'warning');
      return;
    }
    this.messageService.showLoading('正在加载控件，请稍等');
    /**
     * 3秒后检测控件是否加载成功*/
    setTimeout(() => {
      if (this.pdfCtrl) {
        return;
      }
      this.messageService.closeLoading();
      this.devMessageModalShow = true;
      // this.messageService.showToastMessage('未安装签章控件', 'warning');
    }, 3000);
  }
  /**
   * 控件准备就绪事件
   * */
  public onCtrlReady() {
    this.actionStatus = {
      resetCursor: this.browserSupport,
      startSign: this.browserSupport,
      resetFile: this.browserSupport
    };
    this.messageService.closeLoading();
    this.pdfCtrl = window[this.signPdfCtrlId];
    try {
      // this.pdfCtrl.SetPKCS11Module('UlanPKCS11.dll|CFCA_UKEY_P11.dll');
      // this.pdfCtrl.SetPKCS11Module('CFCA_CNGC_P11.dll');
      this.pdfCtrl.SetPKCS11Module('CFCA_JXCC_P11.dll');
      // TODO: 设置签章时间戳
      // this.pdfCtrl.SetTimestampServer(this.TimestampServer);
      this.pdfCtrl.OpenWebFile(this.pdfUrl);
    } catch (e) {
      alert(this.pdfCtrl.GetLastErrorDesc());
    }
  }
  /**
   *用户拖拽选择签名矩形框事件
   * */
  public onDragRect(nPageNo, x0, y0, x1, y1) {
  }
  /**
   * 用户点击选择签名位置中心点事件
   * */
  public onClickPoint(nPageNo: number, x: number, y: number) {
    try {
      this.actionStatus.startSign = true;
      this.pdfCtrl.SignFile_KeyImage(nPageNo, x, y);
    } catch (e) {
      alert(this.pdfCtrl.GetLastErrorDesc());
    }
  }

  /**
   * 用户点击“待签名域”事件
   * */
  public onClickField(strFieldName) {
  }
  /**
   * 设置签章控件事件script标签
   * */
  private setCtrlEvent() {
    if (!this.browserSupport) {
      return;
    }
    const head = document.getElementsByTagName('head');
    head[0].appendChild(this.createEventScript('NotifyCtrlReady', ''));
    head[0].appendChild(this.createEventScript('NotifyDragRect', 'nPageNo, x0, y0, x1, y1'));
    head[0].appendChild(this.createEventScript('NotifyClickPoint', 'nPageNo, x, y'));
    head[0].appendChild(this.createEventScript('NotifyClickField', 'strFieldName'));
    window[this.signPdfCtrlSign] = {
      NotifyCtrlReady: this.onCtrlReady.bind(this),
      NotifyDragRect: this.onDragRect.bind(this),
      NotifyClickPoint: this.onClickPoint.bind(this),
      NotifyClickField: this.onClickField.bind(this)
    };
  }
  private createEventScript(eventName: string, param: string) {
    const script: any =  document.createElement('script');
    script.setAttribute('for', this.signPdfCtrlId);
    script.type = 'text/javascript';
    script.language = 'javascript';
    script.event = `${eventName}(${param})`;
    script.text = `if (window['${this.signPdfCtrlSign}'] && window['${this.signPdfCtrlSign}']['${eventName}'])
    { window['${this.signPdfCtrlSign}']['${eventName}'](${param})}`;
    this.eventScriptList.push(script);
    return script;
  }
  private createPdfCtrl() {
    if (!this.isX64) {
        this.signWrapEle.nativeElement.innerHTML = `<object id="${this.signPdfCtrlId}"
 codebase="TrustSignPDFPlugin.Standard.x86.cab#version=3,2,0,8"
 classid="clsid:6F60FE31-F827-4295-8AC4-775EF7478A6A" width="100%" height="100%"><param name="showToolbar" value=true></object>`;
    } else {
        this.signWrapEle.nativeElement.innerHTML = `<object id="${this.signPdfCtrlId}"
 codebase="TrustSignPDFPlugin.Standard.x64.cab#version=3,2,0,8"
 classid="clsid:6F60FE31-F827-4295-8AC4-775EF7478A6A" width="100%" height="100%"><param name="showToolbar" value=true></object>`;
    }
  }
  /**
   * 退出*/
  public quitSign() {
    this.finish.emit(null);
  }
  /**
   * 完成签名*/
  public finishSign() {
    if (!this.browserSupport || !this.pdfCtrl) {
      return;
    }
    if (!confirm('确定签章吗？')) {
      return;
    }
    let res: any;
    try {
      res = this.pdfCtrl.UploadCurrentFile(this.uploadUrl);
    } catch (e) {
      alert(this.pdfCtrl.GetLastErrorDesc());
      return;
    }
    res = JSON.parse(res);
    console.log(res);
    if (res.code !== 0) {
      this.messageService.showToastMessage(res.message, 'error');
      return;
    }
    this.finish.emit({
      success: true,
      message: res.message,
      filePath: res.value
    });
  }
  /**
  * 触发签名
  * */
  public startSign() {
    if (!this.actionStatus.startSign) {
      return;
    }
    try {
      this.pdfCtrl.ClickToPlaceSignature();
      this.actionStatus.startSign = false;
    } catch (e) {
      alert(this.pdfCtrl.GetLastErrorDesc());
    }
  }
  /**
   * 重置光标
   * */
  public resetCursor() {
    if (!this.actionStatus.resetCursor) {
      return;
    }
    try {
      this.pdfCtrl.ResetMouseAction();
      this.actionStatus.startSign = true;
    } catch (e) {
      console.error(e)
      alert(this.pdfCtrl.GetLastErrorDesc());
    }
  }
  public closeDownloadModal() {
    this.devMessageModalShow = false;
  }
  ngOnInit() {
    this.createPdfCtrl();
  }
  ngOnDestroy () {
    const head = document.getElementsByTagName('head')[0];
    this.eventScriptList.forEach((item) => {
      head.removeChild(item);
    });
  }
}
