import {Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {
  @ViewChild('actionTpl')readonly actionTpl: TemplateRef<any>;
  /**
   * 使能属性
   * */
  @Input() enabled: boolean;
  /**
   * 点击事件
   * */
  @Output() clickAction: EventEmitter<any>;
  constructor() {
    this.clickAction = new EventEmitter<any>();
    this.enabled = true;
  }
  public onActionClick(event) {
    if (this.enabled) {
      this.clickAction.emit(event);
    }
  }
  ngOnInit() {
  }

}
