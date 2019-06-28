import {Injectable, Injector} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {environment, gatewayKey} from '../../../../environments/environment';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {catchError, switchMap, take} from 'rxjs/operators';
import {interval} from 'rxjs/observable/interval';
import {empty} from 'rxjs/observable/empty';

export namespace HttpUtilNs {
  export interface UfastResListT<T> {
    endRow: number;
    firstPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
    lastPage: number;
    nextPage: number;
    pageNum: number;
    pageSize: number;
    pages: number;
    prePage: number;
    size: number;
    startRow: number;
    total: number;
    orderBy?: string;
    navigatePages: number;
    navigatepageNums: number[];
    list: T[];
  }
  export interface UfastHttpRes {
    status: number;
    message: string;
  }
  export interface UfastFilterBody {
    filters: { [key: string]: any };
    pageSize: number;
    pageNum: number;
  }
  export interface UfastHttpResT<T> {
    status: number;
    message: string;
    value: T;
  }
  export const GatewayKey = gatewayKey;

  export interface UfastHttpConfig {
    gateway?: string;
    headers?: HttpHeaders;
    params?: { [param: string]: string } | undefined;
  }
  export interface NewHttpConfig extends UfastHttpConfig {
    delayLoading?: number;    // 指定请求发出多少毫秒后显示loading，-1：不显示，0：立即显示,默认：300
    isCatchError?: boolean;    // 是否捕获异常,默认:true
    isCatchUfastError?: boolean;    // 是否捕获code !== 0，默认：true
  }
  export class HttpUtilServiceClass {
    private http: HttpClient;
    private defaultNewHttpConfig: NewHttpConfig;
    private messageService: ShowMessageService;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpClient);
      this.messageService = this.injector.get(ShowMessageService);
      this.defaultNewHttpConfig = {
        gateway: GatewayKey.Ps,
        delayLoading: 300,
        isCatchError: true,
        isCatchUfastError: true
      };
    }

    public getFullUrl(baseUrlName: string, path: string): string {

      return environment.baseUrl[baseUrlName] + path;
    }

    private setOptions(params?: any, headers?: HttpHeaders,
                       observe: 'body' | 'event' = 'body',
                       reportProgress: boolean = false) {
      const options: any = {
        headers: headers,
        params: new HttpParams({
          fromObject: params
        }),
        observe: observe,
        reportProgress: reportProgress
      };
      return options;
    }



    public Get<T>(path: string, params?: { [param: string]: any } | undefined, config?: UfastHttpConfig | undefined): Observable<any> {
      let baseUrlName = GatewayKey.Ss;
      let headers = null;
      if (!!config) {
        if (!!config.gateway) {
          baseUrlName = config.gateway;
        }
        if (!!config.headers) {
          headers = config.headers;
        }
      }
      return this.http.get<T>(this.getFullUrl(baseUrlName, path), this.setOptions(params, headers));
    }
    public Post<T>(path: string, body?: any, config?: UfastHttpConfig | undefined): Observable<any> {
      let baseUrlName = GatewayKey.Ss;
      let headers = null;
      let params = null;
      if (!!config) {
        if (!!config.gateway) {
          baseUrlName = config.gateway;
        }
        if (!!config.headers) {
          headers = config.headers;
        }
        if (!!config.params) {
          params = config.params;
        }
      }
      return this.http.post<T>(this.getFullUrl(baseUrlName, path), body, this.setOptions(params, headers));
    }
    private closeLoading(delayLoading: number, loaderSub: any) {
      if (delayLoading !== -1) {
        this.messageService.closeLoading();
      }
      if (loaderSub) {
        loaderSub.unsubscribe();
      }
    }
    private doNewHttp(methodHandler: Function, config: NewHttpConfig): Observable<any> {
      const tempConfig = Object.assign({}, this.defaultNewHttpConfig);
      config = Object.assign(tempConfig, config);
      let loaderSub = null;
      if (config.delayLoading !== -1) {
        loaderSub = interval(config.delayLoading).pipe(take(1))
          .subscribe(() => {
            this.messageService.showLoading('');
          });
      }
      return methodHandler().pipe(switchMap((data: UfastHttpResT<any>) => {
        this.closeLoading(config.delayLoading, loaderSub);
        if (data.status !== 0 && config.isCatchUfastError) {
          this.messageService.showToastMessage(data.message, 'error');
          return empty();
        }
        return Observable.of(data);
      })).pipe(catchError((error) => {
        this.closeLoading(config.delayLoading, loaderSub);
        if (config.isCatchError) {
          this.messageService.showAlertMessage('', error.message, 'error');
          return empty();
        }
        return Observable.throw(error);
      }));
    }
    /**
     * 新增post请求接口
     * */
    public newPost<T>(path: string, body?: any, config: NewHttpConfig = this.defaultNewHttpConfig): Observable<any> {
      let baseUrlName = null;
      let headers = null;
      let params = null;
      if (!!config.gateway) {
        baseUrlName = config.gateway;
      }
      if (!!config.headers) {
        headers = config.headers;
      }
      if (!!config.params) {
        params = config.params;
      }
      const handler = () => {
        return this.http.post<T>(this.getFullUrl(baseUrlName, path), body, this.setOptions(params, headers));
      };
      return this.doNewHttp(handler, config);
    }
    /**
     * 新增get请求
     * */
    public newGet<T>(path: string, params?: { [param: string]: string }, config: UfastHttpConfig = this.defaultNewHttpConfig)
      : Observable<any> {
      let baseUrlName = null;
      let headers = null;
      if (!!config) {
        if (!!config.gateway) {
          baseUrlName = config.gateway;
        }
        if (!!config.headers) {
          headers = config.headers;
        }
      }
      const handler = () => {
        return this.http.get<T>(this.getFullUrl(baseUrlName, path), this.setOptions(params, headers));
      };
      return this.doNewHttp(handler, config);
    }
    public Put<T>(path: string, body?: any, config?: UfastHttpConfig | undefined): Observable<any> {
      let baseUrlName = GatewayKey.Ss;
      let headers = null;
      let params = null;
      if (!!config) {
        if (!!config.gateway) {
          baseUrlName = config.gateway;
        }
        if (!!config.headers) {
          headers = config.headers;
        }
        if (!!config.params) {
          params = config.params;
        }
      }
      return this.http.put<T>(this.getFullUrl(baseUrlName, path), body, this.setOptions(params, headers));
    }

    public Delete<T>(path: string, params?: { [param: string]: string } | undefined,
                     config?: UfastHttpConfig | undefined): Observable<any> {
      let baseUrlName = GatewayKey.Ss;
      let headers = null;
      if (!!config) {
        if (!!config.gateway) {
          baseUrlName = config.gateway;
        }
        if (!!config.headers) {
          headers = config.headers;
        }
      }
      return this.http.delete<T>(this.getFullUrl(baseUrlName, path), this.setOptions(params, headers));
    }

    public Head<T>(path: string, params?: { [param: string]: string } | undefined,
                     config?: UfastHttpConfig | undefined): Observable<any> {
      let baseUrlName = GatewayKey.Ss;
      let headers = null;
      if (!!config) {
        if (!!config.gateway) {
          baseUrlName = config.gateway;
        }
        if (!!config.headers) {
          headers = config.headers;
        }
      }
      return this.http.head<T>(this.getFullUrl(baseUrlName, path), this.setOptions(params, headers));
    }

    public Options<T>(path: string, params?: { [param: string]: string } | undefined,
                   config?: UfastHttpConfig | undefined): Observable<any> {
      let baseUrlName = GatewayKey.Ss;
      let headers = null;
      if (!!config) {
        if (!!config.gateway) {
          baseUrlName = config.gateway;
        }
        if (!!config.headers) {
          headers = config.headers;
        }
      }
      return this.http.options<T>(this.getFullUrl(baseUrlName, path), this.setOptions(params, headers));
    }
  }
}
@Injectable()
export class HttpUtilService extends HttpUtilNs.HttpUtilServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}



