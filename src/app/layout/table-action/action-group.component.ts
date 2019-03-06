/**
 * 配合action组件使用，超过指定数量的action会被自动隐藏，以悬浮框的形式展示
 * */
import {
  Component,
  OnInit,
  ContentChildren,
  Input,
  AfterContentInit,
  QueryList,
  Output, EventEmitter,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { ActionComponent } from './action/action.component';
import {Subscription} from 'rxjs/Subscription';
@Component({
  selector: 'app-action-group',
  templateUrl: './action-group.component.html',
  styleUrls: ['./action-group.component.scss']
})
export class ActionGroupComponent implements OnInit, AfterContentInit, OnDestroy {
  /**
   * 显示按钮的个数，超过的部分会被隐藏到...
   * */
  @Input()
  set showActionNum(value: number) {
    this._showActionNum = value;
  }
  /**
   * 是否显示悬浮框，可双向绑定
   * */
  @Input()
  set isShowActionPopover(value: boolean) {
    this._isShowActionPopover = value;
  }
  @Output() isShowActionPopoverChange: EventEmitter<any>;
  @ContentChildren(ActionComponent) actionList: QueryList<ActionComponent>;

  _showActionNum: number;
  showActionList: ActionComponent[];
  hideActionList: ActionComponent[];
  actionObservable: any;
  _isShowActionPopover: boolean;
  private subscription: Subscription;
  constructor(private cdRef: ChangeDetectorRef) {
    this.isShowActionPopoverChange = new EventEmitter<any>();
    this._showActionNum = 3;
    this.showActionList = [];
    this.hideActionList = [];
    this.subscription = new Subscription();
  }
  public trackById(index: number, item: any) {
    return item;
  }
  public onVisibleChange(value) {
    this.isShowActionPopoverChange.emit(value);
  }
  private unsubscribeChildClick() {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
  }
  /**
   * action组件的发射clickAction事件时，隐藏悬浮框
   * */
  private listenChildClick() {
    this.unsubscribeChildClick();
    this.hideActionList.forEach((item) => {
      const handler = item.clickAction.subscribe(() => {
        this._isShowActionPopover = false;
        this.isShowActionPopoverChange.emit(false);
        this.cdRef.detectChanges();
      });
      this.subscription.add(handler);
    });
  }
  ngAfterContentInit() {
    if (this.actionObservable) {
      this.actionObservable.unsubscribe();
    }
    this.actionList.changes.subscribe((valueList: QueryList<ActionComponent>) => {
      this.showActionList = valueList.toArray().slice(0, this._showActionNum);
      this.hideActionList = valueList.toArray().slice(this._showActionNum);
      this.listenChildClick();
    });
    this.showActionList = this.actionList.toArray().slice(0, this._showActionNum);
    this.hideActionList = this.actionList.toArray().slice(this._showActionNum);
    this.listenChildClick();
  }
  ngOnInit() {
  }
  ngOnDestroy() {
    this.unsubscribeChildClick();
  }
}
