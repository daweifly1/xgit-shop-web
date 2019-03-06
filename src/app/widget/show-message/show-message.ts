import {Injectable, EventEmitter} from '@angular/core';
import {NzMessageService, NzModalRef, NzModalService} from 'ng-zorro-antd';
import {NavigationEnd, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
@Injectable()
export class ShowMessageService {
  modalCtrl: NzModalRef[];
  loadEvent: EventEmitter<{loading: boolean; message?: string}>;
  private loading: boolean;
  constructor(private nzModalService: NzModalService, private router: Router, private toastService: NzMessageService) {
    this.modalCtrl = [];
    this.loadEvent = new EventEmitter();

    (<Observable<any>>this.router.events.filter((event: any) => event instanceof NavigationEnd)).subscribe((event: any) => {
      for (let i = 0, len = this.modalCtrl.length; i < len; i++) {
        this.modalCtrl[i].destroy('onCancel');
      }
      this.modalCtrl = [];
    });
    this.loading = false;
  }

  public showAlertMessage(title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' | 'confirm'): NzModalRef {

    let modalRef: NzModalRef = null;
    const options: any = {
      nzTitle: title,
      nzContent: message,
      nzOnOk: () => {
        modalRef.destroy('onOk');
      },
      nzOnCancel: () => {
        modalRef.destroy('onCancel');
      }
    };

    if (type === 'info') {
      modalRef = this.nzModalService.info(options);
    } else if (type === 'success') {
      modalRef = this.nzModalService.success(options);
    } else if (type === 'error') {
      modalRef = this.nzModalService.error(options);
    } else if (type === 'warning') {
      modalRef = this.nzModalService.warning(options);
    } else if (type === 'confirm') {
      modalRef = this.nzModalService.confirm(options);
    } else {
      return null;
    }
    this.modalCtrl.push(modalRef);

    modalRef.afterClose.subscribe(() => {
      for (let i = 0, len = this.modalCtrl.length; i < len; i++) {
        if (this.modalCtrl[i] === modalRef) {
          this.modalCtrl.splice(i, 1);
          break;
        }
      }
    });
    return modalRef;
  }
  /**
   * 显示全局loading
   * **/
  public showLoading(message?: string) {
    this.loading = true;
    this.loadEvent.emit({
      loading: this.loading,
      message: message
    });
  }
  /**
   * 关闭全局loading
   * **/
  public closeLoading() {
    this.loading = false;
    this.loadEvent.emit({
      loading: this.loading,
    });
  }
  public loadingIsShow(): boolean {
    return this.loading;
  }
  public showToastMessage(message: string, type: 'success' | 'info' | 'warning' | 'loading' | 'error', duration: number = 2000): Function {
    const nzMessage = this.toastService.create(<string>type, message, {nzDuration: duration});
    return () => {
      this.toastService.remove(nzMessage.messageId);
    };
  }

}
