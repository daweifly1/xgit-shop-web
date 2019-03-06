import {Component, Injectable, OnInit} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {environment} from '../../../environments/environment';

@Injectable()
export class PrintErrorService {
  constructor(private modalService: NzModalService) {
  }
  public showInitError(maskCloseable: boolean = false): NzModalRef {
    return this.modalService.create({
      nzTitle: null,
      nzContent: PrintErrorComponent,
      nzMaskClosable: maskCloseable,
      nzOkLoading: false,
      nzClosable: false,
      nzCancelText: null,
      nzOnOk: () => {}
    });
  }
}

@Component({
  templateUrl: './print-error.component.html',
})
export class PrintErrorComponent {
  href: string;
  constructor() {
    this.href = environment.baseUrl.ss + '/initialInventory/downPrintDrives';
  }
}
