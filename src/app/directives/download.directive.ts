/**
 * 下载导出指令
 * */
import {Directive, HostListener, Input} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Directive({
  selector: '[appDownload]'
})
export class DownloadDirective {
  /**
   * 下载链接*/
  @Input() downloadUrl: string;
  /**
   * 请求参数*/
  @Input() reqParam: any;
  /**
   * 下载后保存的文件名*/
  @Input() fileName: string;
  /**
   * 请求方法*/
  @Input() reqMethod: 'get'|'post';
  /**
   * disabled状态*/
  @Input() disabledDown: boolean;
  constructor(private http: HttpClient) {
    this.reqParam = {};
    this.disabledDown = false;
  }

  @HostListener('click')
  onClick() {
    if (this.disabledDown) {
      return;
    }
    this.downLoadFile();
  }


  private downLoadFile() {
    let handler = null;
    if (this.reqMethod === 'post') {
      handler = this.http.post(this.downloadUrl, this.reqParam, {responseType: 'arraybuffer'});
    } else {
      const params = new HttpParams({fromObject: this.reqParam || {}});
      handler = this.http.get(this.downloadUrl, { responseType: 'arraybuffer', params: params});
    }
    handler.subscribe((resData) => {
      const blob = new Blob([resData]);
      /*** 兼容ie 和 edge*/
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, this.fileName);
        return;
      }

      const url = (<any>URL).createObjectURL(blob);
      const fileLink = document.createElement('a');
      fileLink.download =  this.fileName;
      fileLink.href = url;
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
      (<any>URL).revokeObjectURL(url);
    }, (error) => {

    });
  }
}
