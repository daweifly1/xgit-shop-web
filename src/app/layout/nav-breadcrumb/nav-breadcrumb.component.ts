/**
 * 面包屑组件
 * 需配合MenuService服务中的menuNavChange一起使用
 * */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuServiceNs, MenuService} from '../../core/common-services/menu.service';

@Component({
  selector: 'app-nav-breadcrumb',
  templateUrl: './nav-breadcrumb.component.html',
  styleUrls: ['./nav-breadcrumb.component.scss']
})
export class NavBreadcrumbComponent implements OnInit, OnDestroy {

  menuList: MenuServiceNs.MenuAuthorizedItemModel[];
  private navUrlList: string[];
  private subHandler: any;

  constructor(private menuService: MenuService) {
    this.menuList = [];
    this.navUrlList = [];
  }

  public trackById(item: any, index: number) {
    return item.id;
  }

  ngOnInit() {
    this.subHandler = this.menuService.menuNavChange.subscribe((list: MenuServiceNs.MenuAuthorizedItemModel[]) => {
      this.menuList = list;
    });
  }

  ngOnDestroy() {
    this.subHandler.unsubscribe();
  }

}
