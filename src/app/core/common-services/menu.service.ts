import {Injectable, Injector} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {map, filter as filter} from 'rxjs/operators';
import 'rxjs/add/operator/filter';
export namespace MenuServiceNs {
  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }
  /**
   * 菜单树节点结构
   * */
  export interface MenuAuthorizedItemModel {
    auths: { authDesc: string; authId: number; authName: string; parentId: number; }[];
    channel?: number;
    children: MenuAuthorizedItemModel[];
    code?: string;
    icon?: string;
    id?: number;
    leaf?: number;
    name: string;
    parentId?: number;
    seq?: number;
    showFlag?: number;
    state?: string;
    url: string;
    sourceUrl?: string;
  }
  export class MenuServiceClass {
    /** 菜单列表*/
    menuList: MenuAuthorizedItemModel[];
    /** 存放当前路由的每一级，所对应菜单树中的节点*/
    presentMenu: MenuAuthorizedItemModel[];
    /** 当路由改变时，发送presentMenu*/
    menuNavChange: BehaviorSubject<MenuAuthorizedItemModel[]>;
    private routerEvent: BehaviorSubject<any>;
    private http: HttpUtilService;
    private router: Router;
    private routerEventSub: any;
    constructor(injector: Injector) {
      this.http = injector.get(HttpUtilService);
      this.router = injector.get(Router);
      this.menuList = [];
      this.menuNavChange = new BehaviorSubject(this.menuList);
      this.routerEvent = new BehaviorSubject<any>(null);
      this.routerEventSub = null;
      this.router.events.pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          this.routerEvent.next(event);     // 存储路由事件，防止菜单未获取无法匹配路由的情况
        });
    }
    public menuNavObservabel(): BehaviorSubject<MenuAuthorizedItemModel[]> {
      return this.menuNavChange;
    }
    /**
     * 从菜单树中找到当前路由所在每一级菜单
     * */
    private checkMenu(url: string, menu: MenuAuthorizedItemModel[]) {

      for (let index = 0, len = menu.length; index < len; index++) {
        if (url.startsWith(menu[index].sourceUrl + '/')) {    // 根据url分段，匹配父级url
          this.presentMenu.push(menu[index]);
          this.checkMenu(url, menu[index].children);
          break;
        }

      }
    }
    /**
     * 监听路由事件，获取每级路由对应菜单树中节点*/
    private subscribeRouterEvent() {
      this.routerEventSub = this.routerEvent.pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          this.presentMenu = [];
          const tempUrl = event.urlAfterRedirects.endsWith('/') ? event.urlAfterRedirects : event.urlAfterRedirects + '/';
          this.checkMenu(tempUrl, this.menuList);
          if (this.presentMenu.length > 0) {
            this.menuNavChange.next(this.presentMenu);
          }
        });
    }
    /**
     * 获取菜单树
     * */
    public getMenuAuthorized(): Observable<HttpUtilNs.UfastHttpResT<MenuAuthorizedItemModel[]>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Get('/menu/authorized', null, config)
        .pipe(map((menuData: UfastHttpAnyResModel) => {
          if (menuData.code !== 0) {
            return menuData;
          }
          // 过滤非PC端菜单
          menuData.value = menuData.value.filter(item => item.channel === 0)
          this.menuList = menuData.value;
          this.menuList.forEach((item: MenuAuthorizedItemModel) => {
            this.modifyMenu(item);
          });
          if (!this.routerEventSub) {
            this.subscribeRouterEvent();
          }
          return menuData;
        }));
    }
    // public getMenuAuthorized(): Observable<HttpUtilNs.UfastHttpResT<MenuAuthorizedItemModel[]>> {
    //
    //   return this.http.get('ius', '/menu/authorized')
    //     .pipe(map((menuData: UfastHttpAnyResModel) => {
    //       if (menuData.code === 0) {
    //         this.modifyMenu(menuData.value);
    //         this.menuList = menuData.value;
    //       }
    //       return menuData;
    //     }));
    // }
    //
    /**
     * 遍历每个顶级菜单，为所有url添加main前缀，让所有路由都经过main（main-layout组件）
     * 并且把最后一级菜单列表中的第一个菜单路由作为其父级菜单路由
     * */
    private modifyMenu(menu: MenuAuthorizedItemModel) {
      // 让所有路由都经过main（main-layout组件）
      menu.url = menu.url.startsWith('/') ? '/main' + menu.url : '/main/' + menu.url;
      menu.sourceUrl = menu.url;
      if (menu.children.length === 0) {
        return menu.url;
      }
      for ( let i = 0, len = menu.children.length; i < len; i++) {
        this.modifyMenu(menu.children[i]);
      }
      // 修改父级菜单路由
      menu.url = menu.children[0].url;
    }
  }

}
@Injectable()
export class MenuService extends MenuServiceNs.MenuServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
