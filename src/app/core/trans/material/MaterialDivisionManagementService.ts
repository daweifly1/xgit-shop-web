import {HttpUtilNs, HttpUtilService} from '../../infra/http/http-util.service';
import {Injectable, Injector} from '@angular/core';
import {MaterialDivisionManagementVO} from '../../vo/material/MaterialDivisionManagementVO';
import {Observable} from 'rxjs/Observable';
import UfastHttpResT = HttpUtilNs.UfastHttpResT;
import {SearchCommonVO} from '../../vo/comm/SearchCommonVO';
import {PageInfo} from '../../vo/comm/PageInfo';
import {ActionResult} from '../../vo/comm/ActionResult';

@Injectable()
/**
 * 分工管理
 */
export class MaterialDivisionManagementService {
  private http: HttpUtilService;
  private httpConfig: HttpUtilNs.UfastHttpConfig;

  constructor(private injector: Injector) {
    this.http = this.injector.get(HttpUtilService);
    this.httpConfig = {
      gateway: HttpUtilNs.GatewayKey.Ss
    };
  }

  public insert(data: MaterialDivisionManagementVO): Observable<UfastHttpResT<any>> {
    return this.http.Post('/MaterialDivisionManagement/insert', data, this.httpConfig);
  }

  public update(data: MaterialDivisionManagementVO): Observable<UfastHttpResT<any>> {
    return this.http.Post('/MaterialDivisionManagement/update', data, this.httpConfig);
  }

  public delete(data: MaterialDivisionManagementVO): Observable<UfastHttpResT<any>> {
    return this.http.Post('/MaterialDivisionManagement/delete', data, this.httpConfig);
  }

  public list(condition: SearchCommonVO<MaterialDivisionManagementVO>): Observable<ActionResult<PageInfo<MaterialDivisionManagementVO>>> {
    return this.http.Post('/MaterialDivisionManagement/list', condition, this.httpConfig);
  }

  public item(materialsId: string): Observable<ActionResult<MaterialDivisionManagementVO>> {
    const urlParams = {
      id: materialsId
    };
    return this.http.Get('/MaterialDivisionManagement/item', urlParams, this.httpConfig);
  }

}
