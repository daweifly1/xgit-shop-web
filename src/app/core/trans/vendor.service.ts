import { Injectable, Injector } from '@angular/core';
import { HttpUtilService, HttpUtilNs} from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace VendorServiceNs {
  export interface VendorResModelT<T> extends HttpUtilNs.UfastHttpRes {
    value: any;
  }
  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }
  export interface VendorListResModelT<T> extends HttpUtilNs.UfastHttpRes {
    value: any;
  }
  export interface ContacterModel {
    companyId: string;
    id?: string;
    mail: string;
    master: boolean;
    name: string;
    position: string;
  }
  export interface VendorInfoModel {
    companyName: string;
    address: string;
    bank: string;
    bankAccount: string;
    business?: string;
    businessScope: string;
    businessType: string;
    companyType: string;
    createTime: string;
    establishDate: string;
    fax: string;
    id?: string;
    introduction: string;
    legalName: string;
    mailAddress: string;
    mobile: string;
    registeredCapital: number;
    shortName?: string;
    state: number;
    unifiedSocialCreditcode: string;
    website?: string;
    zipCode: string;
    connecters: ContacterModel[];
    checked?: boolean;
  }
  export interface VendorListResModel extends HttpUtilNs.UfastHttpRes {
    value: HttpUtilNs.UfastResListT<VendorInfoModel>;
  }
  export interface VendorResModel extends HttpUtilNs.UfastHttpRes {
    companyName: string;
    address: string;
    bank: string;
    bankAccount: string;
    business?: string;
    businessScope: string;
    businessType: string;
    companyType: string;
    createTime: string;
    establishDate: string;
    fax: string;
    id?: string;
    introduction: string;
    legalName: string;
    mailAddress: string;
    mobile: string;
    registeredCapital: number;
    shortName?: string;
    state: number;
    unifiedSocialCreditcode: string;
    website?: string;
    zipCode: string;
    connecters: ContacterModel[];
    checked?: boolean;
  }
  export class VendorServiceClass {
    private http: HttpUtilService;
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
    }
    public getVendorList(body: HttpUtilNs.UfastFilterBody): Observable<VendorListResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Web
      };
      return this.http.Post('/supplier/pageList', body, config);
    }
    public getVendor(id: string): Observable<VendorListResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Web
      };
      return this.http.Get('/supplier/view', {id: id}, config);
    }
    public addVendor(body: VendorInfoModel): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Web
      };
      return this.http.Post('/supplier/reg', body, config);
    }
    public updateVendor(body: VendorInfoModel): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {
        gateway: HttpUtilNs.GatewayKey.Web
      };
      return this.http.Post('/supplier/update', body, config);
    }
  }
}
@Injectable()
export class VendorService extends VendorServiceNs.VendorServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }

}
