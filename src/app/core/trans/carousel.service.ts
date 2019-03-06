import {Injectable, Injector} from '@angular/core';
import {HttpUtilNs, HttpUtilService} from '../infra/http/http-util.service';
import {Observable} from 'rxjs/Observable';
import { attachEmbeddedView } from '../../../../node_modules/@angular/core/src/view';


export namespace CarouselServiceNs {
  export interface CarouselResModelT<T> extends HttpUtilNs.UfastHttpRes {
    value: any;
  }

  export interface CarouselModel {
    id?: any;
    title: any;
    type: any;
    baseImg?: any;
    attachment?: any;
    content?: any;
    createDate?: string;
    updateDate?: string;
    viewCount?: string;
    checked?: boolean;
    code?: any;
    fileName?: string;
  }

  export interface GetCarouselResModel extends HttpUtilNs.UfastHttpResT<CarouselModel[]> {
  }


  export interface EditCarouselModel {
    id: string;
    title: any;
    type: number;
    attachment: any;
    content?: any;
    createDate?: string;
    updateDate?: string;
    viewCount?: string;
  }

  export interface GetMenusAuthsResModel extends HttpUtilNs.UfastHttpRes {
    auths: number[];
    menus: number[];
  }

  export interface AddMenusAuthsModel {
    authIds: number[];
    menuIds: number[];
    channel?: number[];
    roleId: string;
  }


  export class CarouselServiceClass {
    private http: HttpUtilService;

    constructor(injector: Injector) {
      this.http = injector.get(HttpUtilService);
    }

    // 展示数据
    public getMaterialList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<CarouselResModelT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post<CarouselResModelT<any>>('/information/list', filter, config);
    }

    // 新增数据
    public addCarousel(data: { title: any, type: any, attachment?: any }): Observable<CarouselResModelT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post<CarouselResModelT<any>>('/information/insert', data, config);
    }

    // 更新数据
    public updateCarouselInfo(carousel: CarouselModel): Observable<CarouselResModelT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post('/information/update', carousel, config);
    }

    // 删除数据
    public deleteCarousel(data: string[]): Observable<CarouselResModelT<any>> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post('/information/remove', data, config);
    }

    // 上下架
    public ifShowCarousel(ifShow: number, id: string) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      const body = {
        ifShow: ifShow,
        id: id
      };
      return this.http.Post<CarouselResModelT<any>>('/information/update', body, config);
    }

    // 置顶
    public ifTopCarousel(id: string) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post<CarouselResModelT<any>>('/information/top', {id: id}, config);
    }

    // 取消置顶
    public cancelTopCarousel(id: string) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post<CarouselResModelT<any>>('/information/cancelTop', {id: id}, config);
    }

    // 查看
    public getCarouselDetail(id: string) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Get<CarouselResModelT<any>>('/information/item', {id: id}, config);
    }

    // 修改
    public editCarousel(id: any, data: CarouselModel) {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Web;
      return this.http.Post<CarouselResModelT<any>>('/information/update', {
        id: id,
        title: data.title,
        type: data.type,
        attachment: data.attachment,
        content: data.content,
        fileName: data.fileName
      }, config);
    }

  }
}

@Injectable()
export class CarouselService extends CarouselServiceNs.CarouselServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}
