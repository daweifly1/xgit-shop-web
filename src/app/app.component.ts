import {Component, OnInit} from '@angular/core';
import {ShowMessageService} from './widget/show-message/show-message';
@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>' +
  '<div *ngIf="loading" style="position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:1000;background:rgba(24,144,255,0.1);">' +
  '<div style="position:absolute;top: 50%;left:50%;margin:-16px 0 0 -16px;">' +
  '<nz-spin nzSize="large" [nzTip]="loadingMsg"></nz-spin></div></div>'
})
export class AppComponent implements OnInit {
  loading: boolean;
  loadingMsg: string;
  constructor(private messageService: ShowMessageService) {
    this.loading = false;
    this.loadingMsg = '';
  }
  ngOnInit() {
    this.messageService.loadEvent.subscribe((event) => {
      this.loading = event.loading;
      this.loadingMsg = event.message;
    });
  }
}
