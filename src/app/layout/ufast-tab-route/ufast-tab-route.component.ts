/**
 * 路由标签组件
 * */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  HostBinding,
  AfterViewChecked
} from '@angular/core';

import { Router} from '@angular/router';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { NzTabSetComponent} from 'ng-zorro-antd';
import {TabNumberChangeModal, UfastTabsetRouteService} from '../../core/infra/ufast-tabset-route.service';
import {CdkOverlayOrigin, CdkConnectedOverlay} from '@angular/cdk/overlay';
@Component({
  selector: 'app-tab-route',
  templateUrl: './ufast-tab-route.component.html',
  styleUrls: ['./ufast-tab-route.component.scss'],
  preserveWhitespaces: false,
})
export class  UfastTabRouteComponent implements OnDestroy, OnInit, AfterViewChecked {

  private _disabled = false;
  position: number | null = null;
  origin: number | null = null;

  @HostBinding('class.ant-tabs-tabpane')hostClassBind: boolean;
  /**
   * 是否禁用
   * */
  @Input()
  set nzDisabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  get nzDisabled(): boolean {
    return this._disabled;
  }

  /**
   * 点击事件
   * */
  @Output() nzClick = new EventEmitter<void>();
  /**
   * 标签选中事件
   * */
  @Output() nzSelect = new EventEmitter<void>();
  /**
   * 取消选中事件*/
  @Output() nzDeselect = new EventEmitter<void>();
  @ViewChild(TemplateRef) content: TemplateRef<void>;
  /**
   * 文本内容*/
  @Input()tabTitle: string;


  @ViewChild('titleTemplate')nzTitle: TemplateRef<any>;
  isTitleString = false;

  private _closed: boolean;
  /**
   * 标签关闭前执行的回调
   * 返回false则不会关闭
   * */
  @Input()closedHandle: () => boolean;
  /**
   * 是否展示关闭图标*/
  @Input() showClosable: boolean;
  private destroyed: boolean;
  url: string;
  @ViewChild(CdkOverlayOrigin) cdkOverlayOrigin: CdkOverlayOrigin;
  @ViewChild(CdkConnectedOverlay) cdkConnectedOverlay: CdkConnectedOverlay;
  menuWidth: string;
  menuOpen: boolean;
  menuOffsetX: number;
  menuOffsetY: number;
  menuList: {label: string; disabled: boolean; onContextmenu: Function; onClick: Function}[];
  constructor(private nzTabSetComponent: NzTabSetComponent, private router: Router,
              public tabsetService: UfastTabsetRouteService,
              private cdRef: ChangeDetectorRef) {
    this.hostClassBind = true;
    this.showClosable = true;
    this.url = this.tabsetService.clearUrlParams(this.router.url);
    this._closed = false;
    this.destroyed = false;
    this.closedHandle = function () {
      return true;
    };
    this.menuOpen = false;
    this.menuWidth = '130px';
    this.menuOffsetX = 0;
    this.menuOffsetY = 0;
    /**右键菜单*/
    this.menuList = [
      {label: '关闭其它标签页', disabled: true, onContextmenu: this.preventMenuEvent, onClick: this.closeOtherTab},
      {label: '关闭右侧标签页', disabled: true, onContextmenu: this.preventMenuEvent, onClick: this.closeRightTab},
      {label: '关闭左侧标签页', disabled: true, onContextmenu: this.preventMenuEvent, onClick: this.closeLeftTab},
    ];
  }
  /**
   * 关闭其他标签
   * */
  closeOtherTab = (event: MouseEvent, disabled: boolean) => {
    this.onMenuClickBack();
    if (disabled) {
      return;
    }
    Object.keys(this.tabsetService.cacheRouters).forEach((url) => {
      if (url === this.url) {
        return;
      }
      this.tabsetService.closeTab(url);
    });
  }
  /**
   * 关闭右侧标签
   * */
  closeRightTab = (event: MouseEvent, disabled: boolean) => {
    this.onMenuClickBack();
    if (disabled) {
      return;
    }
    Object.keys(this.tabsetService.cacheRouters).forEach((url) => {
      const index = this.tabsetService.getTabIndex(this.url);
      if (this.tabsetService.cacheRouters[url].index <= index) {
        return;
      }
      this.tabsetService.closeTab(url);
    });
  }
  /**
   * 关闭左侧标签
   * */
  closeLeftTab = (event: MouseEvent, disabled: boolean) => {
    this.onMenuClickBack();
    if (disabled) {
      return;
    }
    Object.keys(this.tabsetService.cacheRouters).forEach((url) => {
      const index = this.tabsetService.getTabIndex(this.url);
      if (this.tabsetService.cacheRouters[url].index >= index) {
        return;
      }
      this.tabsetService.closeTab(url);
    });
  }
  /**
   * 屏蔽右击事件
   * */
  preventMenuEvent = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }
  /**
   * 显示右键菜单时监听右击事件
   * */
  docRightClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.onMenuClickBack();
  }
  /**
   * 在当前tab上的右击事件
   * */
  public rightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.menuOffsetX = event.offsetX;
    this.menuOffsetY = 5 - event.offsetY;
    this.menuOpen = true;
    document.addEventListener('contextmenu', this.docRightClick);
    this.cdRef.detectChanges();

  }
  public onMenuClickBack() {
    this.menuOpen = false;
    document.removeEventListener('contextmenu', this.docRightClick);
    this.cdRef.detectChanges();
  }
  private setMenuDisabled() {
    const tabNumber = this.tabsetService.getTabNumber();
    const tabIndex = this.tabsetService.getTabIndex(this.url);
    this.menuList[0].disabled = tabNumber < 2;
    this.menuList[1].disabled = tabNumber < tabIndex + 2;
    this.menuList[2].disabled = tabIndex < 1;
  }
  ngOnInit(): void {
    this.nzTabSetComponent.addTab(<any>this);
    this.tabsetService.selectNewTab(this.url);
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
    this.tabsetService.tabNumberChange.subscribe((data: TabNumberChangeModal) => {
      this.setMenuDisabled();
    });
    this.setMenuDisabled();
  }

  ngOnDestroy(): void {
    this.nzTabSetComponent.removeTab(<any>this);
    if (!this.destroyed) {
      this.destroyed = true;
      this.tabsetService.closeTab(this.url);
    }

  }
  ngAfterViewChecked() {
  }

  public clickCloseTab(event: Event) {
    event.stopPropagation();
    if (this.closedHandle()) {
      this.destroyed = true;
      this.tabsetService.closeTab(this.url);
    }

  }


}
