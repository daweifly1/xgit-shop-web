import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';
import {UserServiceNs} from './user.service';
import {AuthServiceNs} from './auth.service';

export namespace RoleServiceNs {

  import UfastHttpResT = UserServiceNs.UfastHttpResT;
  import SysAuthsItemModel = AuthServiceNs.SysAuthsItemModel;

  export interface RoleHttpAnyResModel<T> extends HttpUtilNs.UfastHttpResT<any> {
    value: T;
  }

  export interface SysRoleReqModel {
    // 角色ID
    id?: string;
    // 角色名称
    name?: string;
    // 9:系统默认，用户不能删除
    remark?: string;
    // 1：系统管理员，2普通角色
    type?: number;
    // 渠道（0初始化，1平台录入）
    channel?: number;
    // 所属工作空间ID
    spaceId?: string;
    // 所属部门ID（0表示角色与部门不关联）
    deptId?: string;
    //
    seqNo?: number;

    checked?: boolean;

    treeAuthList?: SysAuthsItemModel[];
  }

  export class RoleServiceClass {
    private http: HttpUtilService;

    private defaultConfig: HttpUtilNs.UfastHttpConfig = {};

    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig.gateway = HttpUtilNs.GatewayKey.Ius;
    }

    public getSysRoleList(filter): Observable<UfastHttpResT<SysRoleReqModel>> {
      return this.http.Post<UfastHttpResT<SysRoleReqModel>>('/sysRole/list', filter, this.defaultConfig);
    }

    /**新增保存 */
    public saveSysRole(data): Observable<UfastHttpResT<any>> {
      return this.http.Post<UfastHttpResT<any>>('/sysRole/save', data, this.defaultConfig);
    }

    /**详情 */
    public getSysRoleDetail(id: string): Observable<UfastHttpResT<SysRoleReqModel>> {
      return this.http.Get<UfastHttpResT<SysRoleReqModel>>('/sysRole/item', {id: id}, this.defaultConfig);
    }

    /**删除 */
    public deleteSysRole(ids: any[]): Observable<UfastHttpResT<any>> {
      return this.http.Post('/sysRole/delete', ids, this.defaultConfig);
    }
  }
}

@Injectable()
export class RoleService extends RoleServiceNs.RoleServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

