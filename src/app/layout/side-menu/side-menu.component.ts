/**
 * 左侧菜单组件
 * */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MenuServiceNs} from '../../core/common-services/menu.service';
import {NavigationEnd, Router} from '@angular/router';
import {UfastTabsetRouteService} from '../../core/infra/ufast-tabset-route.service';

@Component({
  selector: 'app-side-menu',
  styleUrls: ['./side-menu.component.scss'],
  templateUrl: './side-menu.component.html'
})
export class SideMenuComponent {
  /**
   * 菜单数据
   * */
  @Input() sideMenu: MenuServiceNs.MenuAuthorizedItemModel;
  /**
   * 宽度
   * */
  @Input() width: string;
  /**
   * 打开关闭，可双向绑定
   * */
  @Input() isCollapsed: boolean;
  @Output() isCollapsedChange: EventEmitter<boolean>;
  @Input() isNeedSideNavShow: boolean;
  /**
   * 显示loading遮罩层，可双向绑定
   * */
  @Input() loading: boolean;
  @Output() loadingChange: EventEmitter<boolean>;
  selectedItem: string;
  selectedMenu: MenuServiceNs.MenuAuthorizedItemModel;
  isCollapsedList: boolean;
  prevFinished: boolean;
  constructor(public router: Router, public tabsetService: UfastTabsetRouteService) {
    this.loading = false;
    this.loadingChange = new EventEmitter();
    this.prevFinished = true;
    this.isCollapsedChange = new EventEmitter();
    this.isCollapsed = false;
    this.width = '210px';
    this.isNeedSideNavShow = false;
    this.isCollapsedList = false;
    this.selectedMenu = {
      auths: <any> [],
      children: <any>[],
      name: '',
      url: ''
    };
    this.sideMenu = {url: '', name: '', children: [], auths: []};
    this.router.events
      .subscribe((event: NavigationEnd) => {
        if (event instanceof  NavigationEnd) {
          this.selectedItem = this.tabsetService.clearUrlParams(event.urlAfterRedirects);
          this.loading = false;
          this.loadingChange.emit(false);
        }
      });
  }
  public toggleCollapsed () {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }
  public navigate (menu: MenuServiceNs.MenuAuthorizedItemModel, checked: boolean) {
    if (!menu) {
      return;
    }
    if (menu.url.toLocaleLowerCase().includes('http')) {
      window.open(menu.url.replace('/main/', ''));
      return;
    }
    this.selectedMenu = menu;
    if (menu.children && menu.children.length > 0) {
      this.isNeedSideNavShow = true;
      this.selectedMenu = menu;
      return;
    }
    this.isNeedSideNavShow = false;
    const target = menu.url;
    if (target !== this.router.url) {
      this.loading = true;
      this.loadingChange.emit(true);
    }
    if (checked) {
      return;
    }
    this.tabsetService.navigateByUrl(target).then(() => {
      this.selectedItem = menu.url;
    }, () => {});
  }
  // public hideSideNav() {
  //   this.isNeedSideNavShow = false;
  // }
}
