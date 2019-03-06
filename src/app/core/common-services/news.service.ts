import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';


export namespace NewsServiceNs {
  export interface NewsResModelT<T> extends HttpUtilNs.UfastHttpRes {
    value: any;
  }

  export interface NewsModel {
    title: string;
    attachment?: string;
    type: number;
    ifShow?: boolean;
    content: string;
    createDate?: string;
    updateDate?: string;
  }

  export interface GetNewsResModel extends HttpUtilNs.UfastHttpResT<NewsModel[]> {
  }

  export interface NewsInfoModel {
    id?: string;
    title?: string;
    attachment?: any;   // 附件（附件的URL）
    type?: number;
    intro?: string;
    content?: string;
    ifShow?: number;
    viewCount?: number;
    fileName?: string;  // 附件上传时记录附件的名字
  }

  export class NewsServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;
    constructor(private injector: Injector) {
      this.http = injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Bs
      };
    }

    public getNewsList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<NewsResModelT<any>> {
      return this.http.Post<NewsResModelT<any>>('/information/list', filter, this.defaultConfig);
    }

    // 获取资讯分类列表
    public getNewsTypeList(): Observable<NewsResModelT<any>> {
      return this.http.Get<NewsResModelT<any>>('/information/typeList', null, this.defaultConfig);
    }

    public addNews(NewsData: NewsInfoModel) {
      return this.http.Post<NewsResModelT<any>>('/information/insert', NewsData, this.defaultConfig);
    }

    public getNewsDetail(id: string) {
      return this.http.Get<NewsResModelT<any>>('/information/item', {id: id}, this.defaultConfig);
    }

    public deleteNews(newsIds: string[]) {
      return this.http.Post<NewsResModelT<any>>('/information/remove', newsIds, this.defaultConfig);
    }

    public editNews(NewsData: NewsInfoModel) {
      return this.http.Post<NewsResModelT<any>>('/information/update', NewsData, this.defaultConfig);
    }
    public enableNews(id: string, enable: boolean) {
      const path = enable ? '/information/up' : '/information/down';
      return this.http.Post(path, {id: id}, this.defaultConfig);
    }
    public ifTopNews(id: string) {
      return this.http.Post<NewsResModelT<any>>('/information/top', {id: id}, this.defaultConfig);
    }

    public cancelTopNews(ifTop: number, id: string) {
      const body = {
        ifTop: ifTop,
        id: id
      };
      return this.http.Post<NewsResModelT<any>>('/information/cancelTop', body, this.defaultConfig);
    }

    public upLoader() {
      return this.http.Post<NewsResModelT<any>>('/uploading/file', null, this.defaultConfig);
    }
  }
}
@Injectable()
export class NewsService extends NewsServiceNs.NewsServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
