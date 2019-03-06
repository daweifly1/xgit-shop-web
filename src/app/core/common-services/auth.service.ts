import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace AuthServiceNs {

  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }

  export interface SysAuthsItemModel {
    // pk
    id?: number;
    // 名称
    name?: string;
    // 编码
    code?: string;
    // 父节点id
    parentId?: number;
    // 顺序
    seq?: number;
    // 图标
    icon?: string;
    // 状态，0无效，1生效
    showFlag?: number;
    // 对应的url，若是菜单则为空
    url?: string;
    // 频道，保留字段
    channel?: number;
    // 是否叶子节点，默认否
    leaf?: number;
    // 类型，1,菜单 2按钮
    type?: number;
    children?: SysAuthsItemModel[];
    expand?: boolean;
    checked?: boolean;
    // 选中但是子节点未全部选中
    indeterminate?: boolean;
  }

  export class AuthServiceClass {
    private http: HttpUtilService;

    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
    }

    public getAuthList(id: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post('/sysAuths/treeList', {id: id}, config);
    }

    public removeAuth(id: number): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post('/sysAuths/remove', {id: id}, config);
    }

    public insertAuth(parentId: string, name: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post('/sysAuths/save', {
        name: name,
        parentId: parentId
      }, config);
    }

    public saveAuth(model: SysAuthsItemModel): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post('/sysAuths/save', model, config);
    }
  }
}

@Injectable()
export class AuthService extends AuthServiceNs.AuthServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

