import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace NavigationServiceNs {

    export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
    }

    export interface NavigationModel {
        code?: string;
        id?: string;
        pId?: string;
        leaf?: number;
        name: string;
        url?: string;
        img?: string;
        remark?: string;
        status?: string;
        parentId: string;
        seq?: any;
        spaceId?: string;
        level?: number;
        children?: NavigationModel[];
        expand?: boolean;
    }

    export class NavigationServiceClass {
        private http: HttpUtilService;
        constructor(private injector: Injector) {
            this.http = this.injector.get(HttpUtilService);
        }

        public getNavigationList(id: string): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Web;
            return this.http.Get('/menu/list', {id: id}, config);
        }
        public removeNavigation(id: any): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Web;
            return this.http.Post('/menu/remove', [id], config);
        }

        public insertNavigation(pId: string, name: string, url: string): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Web;
            return this.http.Post('/menu/insert', {
                pId: pId,
                name: name,
                url: url
                // img: img
            }, config);
        }

        public updateNavigation(id: string, name: string, url: string): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Web;
            return this.http.Post('/menu/update', {
                id: id,
                name: name,
                // img: img,
                url: url
            }, config);
        }

        public oneLevelMenu(id: string, leaf: number): Observable<UfastHttpAnyResModel> {
            const config: HttpUtilNs.UfastHttpConfig = {};
            config.gateway = HttpUtilNs.GatewayKey.Web;
            return this.http.Post('/menu/update', {
                id: id,
                leaf: leaf
            }, config);
        }

    }
}
@Injectable()
export class NavigationService extends NavigationServiceNs.NavigationServiceClass {
    constructor(injector: Injector) {
        super(injector);
    }
}

