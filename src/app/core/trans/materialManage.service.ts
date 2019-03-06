import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';

export namespace MaterialManageServiceNs {


  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }

  export interface MaterialClassModel {
    id?: string;
    materialCalssName?: string;
    materialType: number;
    materialClassDesc?: string;
    status?: number;
    pId?: string;
    _checked?: boolean;
    isDel?: boolean;
    childCount?: number;
    level?: number;
  }

  export interface MaterialTempModel {
    materialType: number;
    materialClassId: string;
    materialName: string;
    unit: string;
    modelSpecification: string;
    remark: string;
    id?: string;
    deviceTemplateId?: string;
  }

  export interface MaterialTempleteModel {
    id?: string;
    status?: number;
    aduitRemark?: string;
  }
  export enum AuditStatus {
    Wait,
    Pass,
    Reject
  }


  export class MaterialManageServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;

    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
    }


    public getMaterialList(filter: {
      pageNum: number, pageSize: number, filters: any
    }): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post('/materials/list', filter, config);
    }

    public getMaterialDetial(materialsId: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      const data = {
        materialsId: materialsId + ''
      };
      return this.http.Get('/materials/item', data, config);
    }

    /*物料分类相关*/
    public getMaterialClassList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialClass/listPageInfo', filter, this.defaultConfig);
    }

    public getMaterialClassListNoPage(filter: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialClass/list', filter, this.defaultConfig);
    }

    public insertMaterialClass(data: MaterialClassModel): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/materialClass/insert', data, this.defaultConfig);
    }

    public updateMaterialClass(data: MaterialClassModel): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/materialClass/update', data, this.defaultConfig);
    }

    public startMaterialClass(data: { id: string }): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/materialClass/enable', data, this.defaultConfig);
    }

    public forbiddenMaterialClass(data: { id: string }): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/materialClass/remove', data, this.defaultConfig);
    }

    public startBatchMaterialClass(data: { ids: string[] }): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/materialClass/batchEnable', data, this.defaultConfig);
    }

    public delMaterialClass(data: { id: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/materialClass/remove', data, this.defaultConfig);
    }

    public delBatchMaterialClass(data: { ids: string[] }): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/materialClass/batchRemove', data, this.defaultConfig);
    }

    /*物料模板列表相关*/
    public getMaterialTempleteList(filter: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/MaterialTemplate/list', filter, this.defaultConfig);
    }
    public getMaterialEquimentList(id): Observable<UfastHttpAnyResModel> {
      // const filter = { materialClassId: id };
      return this.http.Post('/MaterialTemplate/listNotPage', id, this.defaultConfig);
    }

    public insertMaterialTempleteList(data: MaterialTempModel): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplate/insert', data, this.defaultConfig);
    }

    public getMaterialTempleteItem(param: { id: string }): Observable<UfastHttpAnyResModel> {
      return this.http.Get<UfastHttpAnyResModel>('/MaterialTemplate/item', param, this.defaultConfig);
    }
    public getMaterialClassItem(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id: id.toString()
      };
      return this.http.Get('/materialClass/item', data, this.defaultConfig);
    }

    public updateMaterialTempleteItem(data: MaterialClassModel): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplate/update', data, this.defaultConfig);
    }

    public auditPass(data: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplate/auditPass', data, this.defaultConfig);
    }

    public auditNotPass(data: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplate/auditNotPass', data, this.defaultConfig);
    }

    // 物料模板审核列表
    public getMaterialTempleteReportList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialTemplateReport/list', filter, this.defaultConfig);
    }
    // 物料模板审核详情
    public getMaterialTempleteReportItem(param: { id: string }): Observable<UfastHttpAnyResModel> {
      return this.http.Get<UfastHttpAnyResModel>('/MaterialTemplateReport/item', param, this.defaultConfig);
    }
    // 物料模板审核编辑
    public updateMaterialTempleteReport(data: MaterialClassModel): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplateReport/update', data, this.defaultConfig);
    }
    // 物料模板审核通过
    public materialTemplateReportAuditPass(data: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplateReport/auditPass', data, this.defaultConfig);
    }
// 物料模板审核拒绝
    public materialTemplateReportAuditNotPass(data: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplateReport/auditNotPass', data, this.defaultConfig);
    }

    public materialTemplateReportBatchAuditPass(data: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplateReport/batchAuditPass', data, this.defaultConfig);
    }

    public materialTemplateReportBatchAuditNotPass(data: any): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/MaterialTemplateReport/batchAuditNotPass', data, this.defaultConfig);
    }
    // 物料--材设
    public getMaterialSettingList(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/material/list', data, this.defaultConfig);
    }

    public addMaterialSetting(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/material/insert', form, this.defaultConfig);
    }

    public getMaterialSettingItem(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id
      };
      return this.http.Get('/material/item', data, this.defaultConfig);
    }

    // 查询使用单位
    public getServiceConditionList(id): Observable<UfastHttpAnyResModel> {
      return this.http.Get('/factoryMaterial/listByMaterial', id, this.defaultConfig);
    }
    // 查询物料厂矿详情
    public getIndustrialMaterialDetail(id: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      const data = {
        id
      };
      return this.http.Get('/factoryMaterial/item', data, config);
    }

    // 物料材设修改
    public updateMaterialSetting(form): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/material/update', form, this.defaultConfig);
    }

    public freeze(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id
      };
      return this.http.Get('/material/freeze', data, this.defaultConfig);
    }

    public thaw(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id
      };
      return this.http.Get('/material/thaw', data, this.defaultConfig);
    }

    // 设备型号列表
    public getEquipmentModelList(filter: {
      pageNum: number, pageSize: number, filters: any
    }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialDeviceModel/list', filter, this.defaultConfig);
    }
    // 设备型号新增
    public addEquipmentModel(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialDeviceModel/insert', data, this.defaultConfig);
    }
    // 设备名称下拉框数据
    public getMaterialNameList(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/material/listDeviceInfo', data, this.defaultConfig);
    }
    // 设备型号详情
    public getEquipmentModelItem(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id
      };
      return this.http.Get('/materialDeviceModel/item', data, this.defaultConfig);
    }
    // 设备型号修改
    public editEquipmentModel(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialDeviceModel/update', data, this.defaultConfig);
    }
    // 删除
    public deleteEquipmentModel(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id
      };
      return this.http.Get('/materialDeviceModel/delete', data, this.defaultConfig);
    }

    // 物料提报审核列表
    public getMaterialReportList(filter: {
      pageNum: number, pageSize: number, filters: any
    }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/list', filter, this.defaultConfig);
    }

    // 物料提报审核通过
    public materialReportAuditPass(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/auditPass', data, this.defaultConfig);
    }

    public materialReportAuditNotPass(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/auditNotPass', data, this.defaultConfig);
    }
    // 批量通过
    public materialReportBatchAuditPass(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/batchAuditPass', data, this.defaultConfig);
    }
    // 批量拒绝
    public materialReportBatchAuditNotPass(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/batchAuditNotPass', data, this.defaultConfig);
    }
    public getUnitType(filter): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialDeviceModel/list', filter, this.defaultConfig);
    }
  }
}

@Injectable()
export class MaterialManageService extends MaterialManageServiceNs.MaterialManageServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

