import { Injectable, Injector } from '@angular/core';
import { HttpUtilNs, HttpUtilService } from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';

export namespace FactoryMineServiceNs {


  export interface UfastHttpAnyResModel extends HttpUtilNs.UfastHttpResT<any> {
  }

  // 物料提报列表
  export interface MaterialReportModel {
    materialDesc?: string; // 物料描述
    materialType?: string;     // 物料类别
    typeName?: string; // 分类
    name?: string;     // 物料名称
    formerName?: string; // 曾用名
    unit?: string;             // 计量单位
    specificationModel?: string; // 型号规格
    drawingNumber?: string; // 零件号/图号
    material?: string; // 材质
    brand?: string; // 品牌
    importOrDomestic?: string; // 进口国产
    importance?: string; // 重要度
    materialClassification?: string; // 物资分类
    reportUserName?: string; // 提报人
    startCreateDate?: string; // 提报时间
    status?: string; // 状态
    auditRemark?: string; // 拒绝原因
    auditUserName?: string; // 审批人
    auditDate?: string; // 审批时间

  }

  // 模板选取列表
  export interface ModelSelect {
    materialType?: string;     // 物料类别
    firstLevel?: string;       // 一级分类
    secondLevel?: string;     // 二级分类
    thirdLevel?: string;     // 三级分类
    materialName?: string;     // 物料名称
    unit?: string;     // 单位
  }
  // 物料提报新增
  export interface AddModel {
    materialDesc?: string;     // 物料描述
    materialType?: string;     // 物料类别
    thirdLevel?: string; // 分类
    name?: string;     // 物料名称
    formerName?: string; // 曾用名
    unit?: string;             // 计量单位
    deviceName?: string; // 主机名称
    deviceModel?: string; // 主机型号
    specificationModel?: string; // 型号规格
    drawingNumber?: string; // 零件号/图号
    material?: string; // 材质
    brand?: string; // 品牌
    importOrDomestic?: string; // 进口国产,下拉框
    importance?: string; // 重要度，下拉框
    materialClassification?: string; // 物资分类，下拉框
    assemblyOrPart?: string; // 总成
    // 部装

  }
  // 名称匹配列表
  export interface MaterialReportModel {
    materialType?: string; // 物料类型
    thirdLevel?: string;     // 分类
    materialDesc?: string; // 物料描述
    code?: string;     // 物料编号
    name?: string; // 物料名称
    unit?: string;             // 计量单位
    deviceName?: string; // 主机名称
    deviceModel?: string; // 主机型号
    specificationModel?: string; // 型号规格
    drawingNumber?: string; // 零件号/图号
    brand?: string; // 品牌
    importOrDomestic?: string; // 进口/国产
    isDelete?: string; // 状态
    assigned?: string; // 是否已分配

  }
  // 物料提报修改
  export interface MaterialReportDetail {
    code?: string; // 物料编码
    materialType?: string; // 物料类别
    materialClassId?: string; // 物料分类
    name?: string; // 物料名称
    specificationModel?: string; // 规格型号
    unit?: string; // 计量单位
    drawingNumber?: string; // 零件号/图号
    material?: string; // 材质
    brand?: string; // 品牌
    importOrDomestic?: string; // 进口或国产
    importance?: string; // 重要程度
    materialClassification?: string; // 物资分类
    auditRemark?: string; // 拒绝原因
  }
  // 厂矿物料列表
  export interface IndustrialMaterialModel {
    materialCode?: string;
    name?: string;
    materialType?: string;
    firstLevel?: string;
    secondLevel?: string;
    thirdLevel?: string;
    isDelete?: string;
    specificationModel?: string;
    drawingNumber?: string;
    material?: string;
    brand?: string;
    importOrDomestic?: string;
    materialClassification?: string;
  }

  // 厂矿物料详情
  export interface IndustrialMaterialDetail {
    materialCode?: string; // 物料编码
    materialType?: number; // 物料类别
    materialClassId?: string; // 物料分类
    deviceName?: string; // 设备名称
    name?: string; // 物料名称
    specificationModel?: string; // 规格型号
    unit?: string; // 计量单位
    drawingNumber?: string; // 零件号/图号
    material?: string; // 材质
    brand?: string; // 品牌
    importOrDomestic?: string; // 进口或国产
    importance?: string; // 重要程度
    materialClassification?: string; // 物资分类
    taxRate?: string; // 增值税税率
    planPrice?: string; // 计划价
    assemblyOrPart?: string; // 总成或部装
    shortDress?: string; // 允许溢短装
    divideWorkId?: string; // 分工管理
    supplyRange?: string; // 所属供应范围

    // 厂矿信息
    planner: string; // 计划员
    purchasingGroupId: string;
    purchasingGroupName: string; // 采购组
    planDec: string; // 计划分解
    oldCode: string; // 旧编码
    managementModel: number; // 管理模式
    // 储位表格信息
  }
  export enum AuditStatus {
    Wait,
    Pass,
    Reject
  }
  export enum MaterialStatus {
    Normal,
    Thaw
  }
  export enum MaterialTemplateType {
    Material = 1,
    DevicePart,
    Device,
    CommonDevicePart
  }




  export class FactoryMineServiceClass {
    private http: HttpUtilService;
    private defaultConfig: HttpUtilNs.UfastHttpConfig;

    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.defaultConfig = {
        gateway: HttpUtilNs.GatewayKey.Ss
      };
    }

    // 物料提报列表
    public getMaterialReportList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/listByOrgId', filter, this.defaultConfig);
    }
    // 物料模板选取列表
    public getMaterialTempleteList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/MaterialTemplate/list', filter, this.defaultConfig);
    }



    /*物料分类*/
    public getMaterialClassListNoPage(filter): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialClass/list', filter, this.defaultConfig);
    }
    // 根据选中的物料模板id查询新增数据
    public getMaterialTempleteItem(param: { id: string }): Observable<UfastHttpAnyResModel> {
      return this.http.Get<UfastHttpAnyResModel>('/MaterialTemplate/item', param, this.defaultConfig);
    }
    // 根据设备id查询设备名称
    public getUnitType(filter): Observable<UfastHttpAnyResModel> {
      return this.http.Get('/materialDeviceModel/listByMaterialId', filter, this.defaultConfig);
    }
    public getUnitTypePage(filter): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialDeviceModel/list', filter, this.defaultConfig);
    }
    // 提报
    public addMaterialReport(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/insert', data, this.defaultConfig);
    }
    // 批量提报
    public batchAddMaterialReport(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/batchInsert', data, this.defaultConfig);
    }

    // 名称匹配列表
    public getNameMatchList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/material/nameMatchedList', filter, this.defaultConfig);
    }
    // 分配
    public distribution(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/factoryMaterial/allot', data, this.defaultConfig);
    }

    // 提报详情
    public getMaterialDetail(id: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      const data = {
        id
      };
      return this.http.Get('/materialReport/item', data, config);
    }

    public getMaterialEquimentList(id): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      // const filter = { materialClassId: id };
      return this.http.Post('/MaterialTemplate/listNotPage', id, config);
    }

    // 物料提报修改
    public editMaterialReport(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialReport/update', data, this.defaultConfig);
    }

    // 厂矿物料列表
    public getMaterialList(filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/factoryMaterial/listByOrgId', filter, this.defaultConfig);
    }
    // 厂矿物料详情
    public getIndustrialMaterialDetail(id: string): Observable<UfastHttpAnyResModel> {
      const config: HttpUtilNs.UfastHttpConfig = {};
      config.gateway = HttpUtilNs.GatewayKey.Ss;
      const data = {
        id
      };
      return this.http.Get('/factoryMaterial/item', data, config);
    }

    // 储位
    public getLocationList(filter: {
      filters: any
    }): Observable<UfastHttpAnyResModel> {
      return this.http.Post<UfastHttpAnyResModel>('/warehouse/list', filter, this.defaultConfig);
    }

    // 厂矿物料修改
    public industrialMaterialEdit(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/factoryMaterial/update', data, this.defaultConfig);
    }
    // 厂矿物料修改--维护储位
    public industrialMaterialEditLocation(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/factoryMaterial/updateStorage', data, this.defaultConfig);
    }
    // 物料模板提报列表
    public getMaterialTemplateReportList(
      filter: { filters: any, pageNum: number, pageSize: number }): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialTemplateReport/listByOrgId', filter, this.defaultConfig);
    }
    // 物料模板提报新增
    public addMaterialTemplateReport(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialTemplateReport/insert', data, this.defaultConfig);
    }
    // 物料模板提报详情
    public getMaterialTemplateReportItem(param: { id: string }): Observable<UfastHttpAnyResModel> {
      return this.http.Get<UfastHttpAnyResModel>('/materialTemplateReport/item', param, this.defaultConfig);
    }
    // 物料模板提报修改
    public updateMaterialTemplateReport(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/materialTemplateReport/update', data, this.defaultConfig);
    }

    // 冻结
    public freeze(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id
      };
      return this.http.Get('/factoryMaterial/freeze', data, this.defaultConfig);
    }

    // 解冻
    public thaw(id: string): Observable<UfastHttpAnyResModel> {
      const data = {
        id
      };
      return this.http.Get('/factoryMaterial/thaw', data, this.defaultConfig);
    }
    /**
     * 厂矿分工相关
     */
    // 列表
    public getDivisionDataList(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/MaterialDivisionManagement/list', data, this.defaultConfig);
    }

    // 新增
    public insertDivisionData(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/MaterialDivisionManagement/insert', data, this.defaultConfig);
    }

    // 详情
    public getDivisionItem(id: string): Observable<UfastHttpAnyResModel> {
      return this.http.Get<UfastHttpAnyResModel>('/MaterialDivisionManagement/item', {id: id}, this.defaultConfig);
    }
    // 编辑
    public updateDivisionData(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/MaterialDivisionManagement/update', data, this.defaultConfig);
    }
    // 删除
    public deleteDivisionData(data): Observable<UfastHttpAnyResModel> {
      return this.http.Post('/MaterialDivisionManagement/delete', data, this.defaultConfig);
    }

  }
}

@Injectable()
export class FactoryMineService extends FactoryMineServiceNs.FactoryMineServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }
}

