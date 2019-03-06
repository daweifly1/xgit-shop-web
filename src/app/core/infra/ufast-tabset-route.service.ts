
import { Injectable, EventEmitter } from '@angular/core';
import {RouteReuseStrategy, NavigationEnd, ActivatedRouteSnapshot, DetachedRouteHandle, Router, Route} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {environment} from '../../../environments/environment';
/**
 * angular路由复用策略，https://www.angular.cn/api/router/RouteReuseStrategy
 * */
export class UfastReuseStrategy extends RouteReuseStrategy {
  /**
   * 路由组件缓存数组
   * */
  public static _cacheRouters: { [key: string]: CacheRouterModel } = {};

  /**
   * 是否允许路由复用
   * */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (route.data && route.data[ 'cache' ] === false) {
      return false;
    }
    const config: Route = route.routeConfig;
    return config && !config.loadChildren;
  }
  /**
   * 离开当前路由时触发，存储路由,
   * */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const path: string = this.getRoutePath(route);
    const cacheRoute: CacheRouterModel = UfastReuseStrategy._cacheRouters[path];
    if (cacheRoute) {   // 路由tab被打开，存储路由快照
      UfastReuseStrategy._cacheRouters[path].handle = handle;
      UfastReuseStrategy._cacheRouters[path].snapshot = route;
    } else {
      return;
    }
    /**
     * 解决重定向路由时遇到的问题
     * 代码参考：https://github.com/angular/angular/issues/13869#issuecomment-301632612
     * */
    const config: Route = route.routeConfig;
    if (config) {
      const childRoute: ActivatedRouteSnapshot = route.firstChild;
      const futureRedirectTo = childRoute ? childRoute.url.map(function(urlSegment) {
        return urlSegment.path;
      }).join('/') : '';
      const childRouteConfigs: Route[] = config.children;
      if (childRouteConfigs) {
        let redirectConfigIndex: number;
        const redirectConfig: Route = childRouteConfigs.find(function(childRouteConfig, index) {
          if (childRouteConfig.path === '' && !!childRouteConfig.redirectTo) {
            redirectConfigIndex = index;
            return true;
          }
          return false;
        });
        if (redirectConfig) {
          if (futureRedirectTo !== '') {
            redirectConfig.redirectTo = futureRedirectTo;
          } else {
            childRouteConfigs.splice(redirectConfigIndex, 1);
          }
        } else if (futureRedirectTo !== '') {
          childRouteConfigs.push({
            path: '',
            redirectTo: futureRedirectTo,
            pathMatch: 'full'
          });
        }
      }
    }
  }

  /**
   * 是否允许还原路由
   * */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!UfastReuseStrategy._cacheRouters[this.getRoutePath(route)];
  }

  /**
   * 获取已存储的路由
   * */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    const config: Route = route.routeConfig;
    if (!config || config.loadChildren) {
      return false;
    }
    const cacheRoute = UfastReuseStrategy._cacheRouters[this.getRoutePath(route)];
    return cacheRoute ? cacheRoute.handle : null;
  }
  /**
   * 进入路由触发，是否同一路由时复用路由
   * */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
  /**
   * 获取完整的路由
   * 代码参考：https://github.com/angular/angular/issues/13869#issuecomment-301632612
   * */
  getRoutePath(route: ActivatedRouteSnapshot): string {
    let namedOutletCount = 0;
    return route.pathFromRoot.reduce((path, routeInfo) => {
        const config: Route = routeInfo.routeConfig;
        if (config) {
          if (config.outlet && config.outlet !== 'primary') {
            path += `(${config.outlet}:`;
            namedOutletCount++;
          } else {
            path += '/';
          }
          return path += config.path;
        }
        return path;
      }, '') + (namedOutletCount ? new Array(namedOutletCount + 1).join(')') : '');
  }
}


export interface CacheRouterModel {
  snapshot: ActivatedRouteSnapshot;
  handle: any;
  index: number;
  destroyed: boolean;
}
export enum TabAction {
  New,    // 新增
  Close   // 关闭
}
export interface TabNumberChangeModal {
  index: number;
  tabNumber: number;
  action: TabAction;
}
@Injectable()
export class UfastTabsetRouteService {
  /**
   * 当前选中的tab*/
  selectedIndex: number;
  /**
   * tab数量
   * */
  tabNumber: number;
  /**
   * 路由组件缓存
   * */
  cacheRouters: { [key: string]: CacheRouterModel };
  /**
   * 缓存数量
   * */
  cacheRouterNumber: number;
  /**
   * 选中tab改变事件
   * */
  selectedIndexChange: EventEmitter<number>;
  /**
   * 禁用菜单
   * */
  disabledMenu: boolean;
  /**
   * 打开和关闭tab事件
   * */
  tabNumberChange: EventEmitter<TabNumberChangeModal>;
  constructor( private router: Router) {
    this.tabNumberChange = new EventEmitter<TabNumberChangeModal>();
    this.cacheRouters = UfastReuseStrategy._cacheRouters;
    this.tabNumber = 0;
    this.cacheRouterNumber = 0;
    this.selectedIndexChange = new EventEmitter<number>();
    this.selectedIndex = 0;

    (<Observable<any>>this.router.events.filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const url = this.clearUrlParams(event.urlAfterRedirects);
      const cacheRoute: CacheRouterModel = this.cacheRouters[url];
      if (cacheRoute) {
        if (cacheRoute.index !== undefined) {
          this.changeSelectedIndex(cacheRoute.index);   // 切换到当前路由对应的已打开标签
        }
      } else {
        /*** 创建路由组件缓存对象*/
        this.cacheRouters[url] = {
          index: undefined,
          snapshot: undefined,
          handle: undefined,
          destroyed: false
        };
        this.cacheRouterNumber++;
      }

    });

  }
  /**
   * 获取路由并清除url参数
   * */
  public clearUrlParams(fullPath: string): string {
    const queryIndex = fullPath.indexOf('?');
    const url = queryIndex === -1 ? fullPath : fullPath.substring(0, queryIndex);
    const semIndex = url.indexOf(';');
    return semIndex === -1 ? url : url.substring(0, semIndex);
  }
  public changeSelectedIndex(index: number): void {
    this.selectedIndex = index;
  }
  /**
   * url导航。在当前模块未加载完成时，锁住菜单
   * */
  public navigateByUrl(url: string): Promise<any> {
    if (this.disabledMenu) {
      return Promise.reject('');
    }
    if (environment.production) {
      this.disabledMenu = true;
    }
    return this.router.navigateByUrl(url);
  }
  /**
   * 切换到指定标签
   * */
  public onSelectedIndexChange(index: number): void {
    const nowUrl = this.clearUrlParams(this.router.url);
    this.selectedIndexChange.emit(index);
    for (const key in this.cacheRouters) {
      if ( index === this.cacheRouters[key].index) {      // 匹配已缓存的url
        if (nowUrl === key) {
          this.router.navigateByUrl(this.router.url);     // 保存url上的查询参数
        } else {
          this.router.navigateByUrl(key);
        }
        break;
      }
    }
    this.disabledMenu = false;
  }
  /**
   * 打开新的tab
   * */
  public selectNewTab(url: string): void {
    const index = this.tabNumber;
    /**创建缓存对象*/
    this.cacheRouters[url] = {
      index: index,
      handle: undefined,
      snapshot: undefined,
      destroyed: false
    };
    this.changeSelectedIndex(this.tabNumber++);
    this.tabNumberChange.emit({
      index: index,
      tabNumber: this.tabNumber,
      action: TabAction.New
    });

  }
  /**
   * 根据url查找tab*/
  public getTabIndex(url: string): number {

    return this.cacheRouters[url] ? this.cacheRouters[url].index : -1;
  }
  /**
   * 获取打开的tab数量*/
  public getTabNumber(): number {
    return this.tabNumber;
  }
  /**
   * 关闭tab*/
  public closeTab(url: string): void {
    let prevUrl = '';
    let nextUrl = '';
    const nowUrlCache: CacheRouterModel = this.cacheRouters[url];
    // 防止组件钩子函数重复调用closeTab
    if (nowUrlCache.destroyed) {
      return;
    }
    nowUrlCache.destroyed = true;
    for (const item in this.cacheRouters) {
      if (!this.cacheRouters.hasOwnProperty(item)) {
        continue;
      }
      const tempCacheRoute: CacheRouterModel = this.cacheRouters[item];
      if (tempCacheRoute.index > nowUrlCache.index) {
        if (tempCacheRoute.index === nowUrlCache.index + 1) {
          nextUrl = item;
        }
        tempCacheRoute.index--;
      } else if (tempCacheRoute.index + 1 === nowUrlCache.index) {
        prevUrl = item;
      } else {}
    }

    if (this.selectedIndex === nowUrlCache.index) {
      let toUrl = '';
      if (nextUrl.length > 0) {
        toUrl = nextUrl;
        this.changeSelectedIndex(nowUrlCache.index);
      } else if (prevUrl.length > 0) {
        toUrl = prevUrl;
        this.changeSelectedIndex(this.selectedIndex - 1);
      } else {
        return;
      }
      this.router.navigateByUrl(toUrl).then(() => {
        this.destroyCacheUrl(url);
      });
    } else if (this.selectedIndex > this.cacheRouters[url].index) {
      this.changeSelectedIndex(this.selectedIndex - 1);
      this.destroyCacheUrl(url);
    } else {
      this.destroyCacheUrl(url);
    }
    this.tabNumberChange.emit({
      index: undefined,
      tabNumber: this.tabNumber,
      action: TabAction.Close
    });
  }

  private destroyCacheUrl(url: string): void {
    if (this.cacheRouters[url].handle) {
      this.cacheRouters[url].handle.componentRef.destroy();
    }

    this.cacheRouterNumber--;
    this.tabNumber --;
    delete this.cacheRouters[url];
  }


}
