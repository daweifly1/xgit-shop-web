import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace DeptServiceNs {

  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }

  export interface DeptItemModel {
    code?: string;
    id: string;
    leaf: number;
    name: string;
    parentId: string;
    seq?: any;
    spaceId?: string;
    level?: number;
    children?: DeptItemModel[];
    expand?: boolean;
  }

  export class DeptServiceClass {
    private http: HttpUtilService;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
    }

    public getDeptList(id: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Get('/department/list', {id: id}, config);
    }
    public removeDept(id: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post('/department/remove', {id: id}, config);
    }

    public insertDept(parentId: string, name: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post('/department/insert', {
        name: name,
        parentId: parentId
      }, config);
    }

    public updateDept(id: string, name: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Post('/department/update', {
        id: id,
        name: name
      }, config);
    }

    // public getDeptList(id: string): Observable<UfastHttpAnyResModel> {
    //   return this.http.get('ius', '/department/list', {id: id});
    // }
    //
    // public removeDept(id: string): Observable<UfastHttpAnyResModel> {
    //   return this.http.post('ius', '/department/remove', {
    //     id: id
    //   });
    // }
    //
    // public insertDept(parentId: string, name: string): Observable<UfastHttpAnyResModel> {
    //   return this.http.post('ius', '/department/insert', {
    //     name: name,
    //     parentId: parentId
    //   });
    // }
    //
    // public updateDept(id: string, name: string): Observable<UfastHttpAnyResModel> {
    //   return this.http.post('ius', '/department/update', {
    //     id: id,
    //     name: name
    //   });
    // }
    /**
     * 获取当前企业信息
     */
    public getLoginOrgInfo() {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Bs;
      return this.http.newGet('/OrgInfo/loginItem', null, config);
    }
    /**
     * 维护当前企业信息
     */
    public editLoginOrgInfo(paramsData) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Bs;
      return this.http.newPost('/OrgInfo/update', paramsData, config);
    }
  }
}
@Injectable()
export class DeptService extends DeptServiceNs.DeptServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

