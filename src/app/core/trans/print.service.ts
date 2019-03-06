import { Injectable, Injector } from '@angular/core';
import {HttpUtilService, HttpUtilNs} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';

export namespace PrintServiceNs {
  export interface UfastHttpRes extends HttpUtilNs.UfastHttpRes {
    value: any;
  }
  export interface TemplateItemModel {
    bodyFontSize: number;
    bodyColumnInfo?: string;
    bottomMessage: string;
    contentSetting: string;
    createDate: number;
    createId ?: string;
    createName?: string;
    footerColumnNum: number;
    headFontSize: number;
    headMessage: string;
    headType: number;
    headerColumnNum: number;
    headerFooterColumnInfo: string;
    id?: string;
    isBodyAutoLineWrap: boolean;
    isDefault: boolean;
    isDel: boolean;
    isHeadlineFontBold: boolean;
    isNote: boolean;
    isPrintLine: boolean;
    isPrintMinCode: boolean;
    isPrintPageSubtotal: boolean;
    isReceipt: boolean;
    lineHeight: number;
    orgId?: string;
    pageSetting: string;
    printColumn: string;
    printLineNum: number;
    templateName: string;
    templateType: string;
  }
  export interface TemplateQuery {
    CurPage: string;
    PageSize: string;
    TemplateType: string;
    [key: string]: string;
  }
  export class PrintServiceClass {
    private http: HttpUtilService;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
    }
    public getTemplateList(query: TemplateQuery): Observable<HttpUtilNs.UfastHttpResT<TemplateItemModel[]>> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      return this.http.Get('/printTemplate/list', query, config);
    }
    public getTemplateItem(id: string): Observable<HttpUtilNs.UfastHttpResT<TemplateItemModel>> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      return this.http.Get('/printTemplate/item', { id: id}, config);
    }
    public insertTemplate(data: TemplateItemModel): Observable<UfastHttpRes> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      return this.http.Post('/printTemplate/insert', data, config);
    }
    public updateTemplate(data: TemplateItemModel): Observable<UfastHttpRes> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      return this.http.Post('/printTemplate/update', data, config);
    }
    public removeTemplate(id: string): Observable<UfastHttpRes> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      return this.http.Post('/printTemplate/remove', {id: id}, config);
    }
    public setDefTemplate(id: string): Observable<UfastHttpRes> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
      return this.http.Post('/printTemplate/setDefault', {id: id}, config);
    }
  }
}

@Injectable()
export class PrintService extends PrintServiceNs.PrintServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }

}
