import { Component, Injectable, TemplateRef } from '@angular/core';
import { NzModalRef, NzModalService, UploadFile, UploadFileStatus } from 'ng-zorro-antd';
import { ShowMessageService } from '../show-message/show-message';
import { UploadChangeParam } from 'ng-zorro-antd/src/upload/interface';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { environment } from '../../../environments/environment';
import { HttpUtilNs } from '../../core/infra/http/http-util.service';
export namespace UploadModalNs {

  export interface UploadModal {
    title: string;        // 模态框标题
    okText?: string;      // 确认按钮文本   okText和cancelText都设置为null则不显示footer
    cancelText?: string;  // 取消按钮文本
    maxFileNum?: number;   // 最大上传数量
    uploadUrl?: string;   // 上传地址
    placeHolder?: string; // 上传按钮旁边的提示信息
    multiple?: boolean;   // 是否可以选择多个文件,
    listType?: string;     // 上传列表样式 text, picture 和 picture-card 默认text
    fileType?: string[] | RegExp;      // 限制文件类型 如 [text/plain,image/png]
    fileSize?: number;     // 限制单个文件的上传大小,单位:字节
    data?: Object;     // 上传携带的额外数据
    topTpl?: TemplateRef<any>;   // 上传文件上方模板
    bottomTpl?: TemplateRef<any>;
    onCancel?: () => void;         // 点击取消回调
    addBtuText?: string;        // 选择文件按钮文本,
    onResponse?: (resData: HttpUtilNs.UfastHttpResT<any>) => boolean;  // 上传文件请求返回后回调， 返回true:关闭modal
    modalWidth?: number;        // 模态框宽度，单位：520， 默认520px
  }
}
@Injectable()
export class UploadModalService {
  private uploadData: UploadModalNs.UploadModal;
  private modalSubject: NzModalRef;
  private modalObservable: Observable<any[]>;
  private modalObserve: Observer<any[]>;
  constructor(private modalService: NzModalService, private messageService: ShowMessageService) {
  }
  public showUploadModal(data: UploadModalNs.UploadModal) {
    this.uploadData = Object.assign({
      uploadUrl: environment.baseUrl.bs + '/uploading/file',
      okText: '确定',
      cancelText: '取消',
      multiple: false,
      placeHolder: '',
      maxFileNum: 1,
      listType: 'text',
      addBtuText: '添加',
      modalWidth: 520,
      onResponse: (res: any) => {
      }
    }, data);
    this.modalSubject = this.modalService.create({
      nzTitle: data.title,
      nzContent: UploadModalComponent,
      nzFooter: null,
      nzOnCancel: this.uploadData.onCancel,
      nzBodyStyle: { padding: 0 },
      nzWidth: this.uploadData.modalWidth
    });
    this.modalObservable = Observable.create((observer) => {
      this.modalObserve = observer;
    });

    return this.modalObservable;
  }
  public closeUploadModal() {
    if (!this.modalSubject) {
      return;
    }
    this.modalSubject.destroy('onCancel');
    this.modalSubject = null;
  }
  public getUploadData(): UploadModalNs.UploadModal {
    return this.uploadData;
  }
  public _onOk(resData: any[]) {
    this.modalSubject.destroy('onOk');
    this.modalObserve.next(resData);
    this.modalObserve.complete();
  }
}

@Component({
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss']
})
export class UploadModalComponent {
  uploadData: UploadModalNs.UploadModal;
  fileList: UploadFile[];
  constructor(private uploadService: UploadModalService, private messageService: ShowMessageService) {
    this.uploadData = this.uploadService.getUploadData();
    this.fileList = [];
  }
  onRemoveFile = (file: UploadFile) => {
    this.fileList = this.fileList.filter(item => item.uid !== file.uid);
    return true;
  }
  onBeforeUpload = (file: File) => {
    let typeFlag = true;
    if (this.uploadData.fileType instanceof Array) {
      typeFlag = this.uploadData.fileType.indexOf(file.type) !== -1;
    }
    if (this.uploadData.fileType instanceof RegExp) {
      typeFlag = this.uploadData.fileType.test(file.type);
    }
    if (!typeFlag) {
      this.messageService.showToastMessage('不支持此文件类型', 'warning');
      return false;
    }
    if (this.uploadData.fileSize && file.size > this.uploadData.fileSize) {
      this.messageService.showToastMessage('文件大小超出限制', 'warning');
      return false;
    }
    return true;
  }
  onUploadData = (file: UploadFile) => {
    return this.uploadData.data;
  }
  public onFileStatusChange(event: UploadChangeParam) {
    if (event.type === 'error') {
      this.fileList = this.fileList.filter(item => item.uid !== event.file.uid);
      this.messageService.showToastMessage('上传失败', 'error');
    }
    if (event.type === 'success') {
      event.file.response['fileName'] = event.file.name;
      if (this.uploadData.onResponse(event.file.response)) {
        this.uploadService.closeUploadModal();
      }
      if (event.file.response.code !== 0) {
        this.messageService.showToastMessage(event.file.response.message, 'error');
        this.fileList = [];
        return;
      }
      // this.messageService.showToastMessage(event.file.response.message, 'success');
    }
  }
  public onModalOk() {
    const resData: any[] = this.fileList.map(item => item.response);
    this.uploadService._onOk(resData);
  }
  public onModalCancel() {
    this.uploadService.closeUploadModal();
    if (this.uploadData.onCancel) {
      this.uploadData.onCancel();
    }
  }
}
