import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';

export namespace PackBarcodePatchServiceNs {

    export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
    }
    export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> {
    }

    export class PackBarcodePatchServiceClass {
        private http: HttpUtilService;
        private defaultConfig: HttpUtilNs.UfastHttpConfig;
        constructor(private injector: Injector) {
            this.http = this.injector.get(HttpUtilService);
            this.defaultConfig = {
              gateway: HttpUtilNs.GatewayKey.Ss
            };
        }

        public getPackBarcodePatchList(filter: {
            pageNum: number, pageSize: number, filters: any
        }): Observable<UfastHttpAnyResModel> {
            return this.http.Post('/barcode/list', filter, this.defaultConfig);
        }

        public updatePrintCount(barcodes: any): Observable<UfastHttpAnyResModel> {
            return this.http.Post('/barcode/updatePrintCount', {barcodes: barcodes}, this.defaultConfig);
        }
    }
}
@Injectable()
export class PackBarcodePatchService extends PackBarcodePatchServiceNs.PackBarcodePatchServiceClass {
    constructor(injector: Injector) {
        super(injector);
    }
}

