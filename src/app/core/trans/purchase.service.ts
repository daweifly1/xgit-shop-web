import { Injectable, Injector } from '@angular/core';
import { HttpUtilService, HttpUtilNs} from '../infra/http/http-util.service';
import { Observable } from 'rxjs/Observable';
export namespace PurchaseServiceNs {
  export interface EquipmentProjectBudgetData {
    id: string|number;
    orgName: string;
    orgId?: string|number;
    projectCode: number|string;
    projectName: string;
    beginYear: number|string;
    belongYear: number|string;
    totalInvest: string|number;
    inPlanInvest?: string|number;
    usedInvest?: string|number;
    availableInvest: string|number;
    managerDepartmentId?: string;
    managerDepartment?: string;
    projectTypeId?: number|string;
    projectTypeCode?: number|string;
    projectType: number|string;
    status: number|string;
    quotaStatus: number|string;
    remark?: string;
    rejectReason?: string;
    modifyReason?: string;
    seqNo?: string;
  }
  export interface UfastHttpResT<T> extends HttpUtilNs.UfastHttpResT<T> { }
  export interface InvestModifyData {
    index: number|string;
    id: string|number;
    createDate: string;
    totalInvest: number|string;
    availableInvest: number|string;
    quotaStatus: number|string;
    applicant: string;
    modifyReason: string;
    rejectReason: string;
  }
  export enum ProjectStatus {
    NewBudget = 0,
    WaitForAudit = 1,
    AgreeAudit = 2,
    RefuseAudit = 3,
    Complete = 10
  }
  export enum ProjectQuotaStatus {
    NewBudget = 0,
    WaitingForAudit = 1,
    AgreeAudit = 2,
    RefuseAudit = 3
  }
  export enum DemandPlanStatus {
    NewPlan = 0,
    HasReceived = 1,
    HasObsoleted = 2
  }
  export enum PurchasePlanStatus {
    WaitSubmit = 0,
    WaitAudit = 1,
    InAudit = 2,
    AgreeAudit = 3,
    RefuseAudit = 4,
    HasReported = 5,
    MaterialInAudit = 6,
    MaterialAgreeAudit = 7,
    MaterialRefuseAudit = 8,
  }
  export enum PurchasePlanType {
    MonthlyPlan = 1,
    TempPlan = 2,
    UrgencyPlan = 3
  }
  export enum MaterialType {
    Material = 1,
    SpaceParts = 2,
    Device = 3
  }
  export enum AllotStatus {
    InitStatus,             // 初始
    HasAssignDepartment,     // 已下达商务科室
    HasAssignPlanner,       // 待执行
    HasAllocated,           // 已流转
    HasClosed,              // 已关闭
    HasReturnDept,          // 已退回科室
    HasReturnManage         // 已退回管理科
  }
  export interface DemandListData {
    id?: string;
    orgName: string;
    demandId: number|string;
    applyDate: string;
    applyDepartment: string;
    applicant: string;
    status: number|string;
    remark: string;
    applyType?: number;
    urgencyFlag?: number;
  }
  export interface DemandDetailTableData {
    lineNo: number;
    materialCode: number|string;
    materialDescription: string;
    unit: string;
    quantity: number|string;
    demandDate: string;
    targetPrice: string;
    lineTotalAmount: string;
  }
  export interface DemandPlanLineData {
    id?: number|string;
    lineNo: number;
    planner: string;
    applyDate: string;
    demandId: string;
    demandPlanLineNo: number;
    demandDepartment: string;
    lineType: string|number;
    materialCode: string;
    materialDescription: string;
    unit: string;
    quantity: number;
    demandDate: string;
    targetPrice: number|string;
    lineTotalAmount: number|string;
    handleStatus: number|string;
    handleDate: string;
    isChecked?: boolean;
    applyType?: number;
    urgencyFlag?: number;
  }
  export interface DemandPlanCreateData {
    index?: number;
    lineNo: number;
    materialType: string;
    materialCode: string;
    materialDescription: string;
    unit: string;
    demandAmount: number;
    purchaseAmount: number;
    inventory: number;
    safeInventory: number;
    amountInPlan: number;
    useAmountInThreeMonth: number;
    demandDate: string;
    targetPrice: number|string;
    totalPrice: string|number;
    planner: string;
  }
  export interface PurchasePlanData extends PurchasePlanItemData {
    id: number|string;
    totalCount: number;
    totalAmount: number;
    totalPrice: string|number;
    allocatePlannerDate: string;
    allocateDepartmentDate: string;
    status: number|string;
    isChecked?: boolean;
  }
  export interface PurchasePlanItemData {
    index?: number;
    orgName: string;
    orgId?: string|number;
    purchasePlanId?: string;
    monthPlanIn: string;
    businessType: string|number;
    purchasePlanType: string|number;
    purchaseType: string|number;
    materialType?: string|number;
    allocatePlanner: string;
    departmentName?: string;
    allocateDepartment?: string;
    remark?: string;
    auditRemark?: string;
    demandDate?: string;
    status?: number|string;
  }
  export interface PurchasePlanItemTableData {
    index?: number;
    lineNo?: number;
    id: number|string;
    materialCode: string;
    materialDescription: string;
    unit: string;
    purchaseAmount: number;
    inventory?: number;
    amountInPlan: number;
    useAmountInThreeMonth?: number;
    demandDate: string|Date;
    targetPricePlan: string|number;
    receiver: string;
    remark: string;
    auditRemark?: string;
    attachment?: string;
    annexName?: string;
    _this?: any;
  }
  export interface PurchasePlanAllotData {
    id?: string;
    isChecked?: boolean;
    allocateDepartment: string;
    salesmanName: string;
    orgName: string;
    materialCode: string;
    materialName: string;
    materialDescription: string;
    technicalParameters: string;
    deviceDesc: string;
    unit: string;
    purchaseAmount: number|string;
    demandDate: string|Date;
    allotStatus: number;
    allocateDepartmentDate: string;
    allocateSalesmanDate: string|number;
    factoryPlanner: string;
    purchasePlanId: string;
    lineNo: number;
    monthPlanIn: string;
    businessType: string;
    purchasePlanType: string|number;
    materialType: number;
    purchaseType: number;
    projectCode: string|number;
    projectName: string;
    auditDate: string|Date;
  }
  export interface DevicePurchaseDate {
    id?: string;
    orgName: string;
    purchasePlanId: string|number;
    monthPlanIn: string;
    status: number;
    reportStatus: number;
    purchaseType: string|number;
    materialType: string|number;
    projectCode: string;
    projectName: string;
    remark: string;
    createDate?: string;
    isChecked?: boolean;
  }
  export interface DevicePurchaseDetailData {
    id?: string;
    orgName: string;
    orgId?: string;
    purchasePlanId: string;
    purchaseType: number;
    monthPlanIn: string|Date;
    allocatePlanner: string;
    departmentName: string;
    projectCode: string;
    projectName: string;
    totalInvest: string|number;
    availableAmount: string|number;
    remainAmount?: string|number;
    planInvest: string|number;
    remark: string;
    status?: number;
    auditRemark?: string;
  }
  export interface DevicePurchaseDetailTableData {
    index?: number;
    id?: string;
    lineNo: number;
    materialCode: string;
    materialDescription: string;
    unit: string;
    materialModel: string;
    technicalParameters: string;
    brand: string;
    demandAmount: number|string;
    demandDate: string|Date;
    unitPriceAbout: string|number;
    receiver: string;
    remark: string;
    lineTotalPrice: string|number;
    attachment?: string;
    _this?: any;
    annexName?: string;
  }
  export interface PurchaseExecuteData {
    isChecked?: boolean;
    id: string;
    orgName: string;
    purchasePlanId: string;
    lineNo: number;
    monthPlanIn: string;
    businessType: string;
    purchasePlanType: number;
    materialType: number;
    materialCode: string;
    materialDescription: string;
    materialModel: string;
    technicalParameters: string;
    deviceDesc: string;
    unit: string;
    purchaseAmount: number;
    demandDate: string|Date;
    purchaseType: number;
    factoryPlanner: string;
    salesmanName: string;
    allocateDepartment: string;
    projectCode: string;
    projectName: string;
    allotStatus: number;
    agreementCode: string;
    contractCode: string;
  }
  export class PurchaseServiceClass {
    private paramConfig: HttpUtilNs.UfastHttpConfig = {};
    public budgetDataMap = {
      id: {key: 'id', label: '项目ID'},
      projectCode: {key: 'projectNo', label: '项目编码'},
      projectName: {key: 'projectName', label: '项目名称'},
      projectType: {key: 'projectType', label: '项目类别'},
      orgName: {key: 'orgName', label: '业务实体'},
      orgId: {key: 'orgId', label: '业务实体Id'},
      beginYear: {key: 'beginYear', label: '开始年份'},
      belongYear: {key: 'belongYear', label: '所属年份'},
      availableInvest: {key: 'availableAmount', label: '当年可用投资'},
      remainInvest: {key: 'remainingAmount', label: '当年剩余投资'},
      usedInvest: {key: 'usedAmount', label: '当年已用投资'},
      inPlanInvest: {key: 'totalReportAmount', label: '已提报计划投资'},
      status: {key: 'status', label: '状态'},
      quotaStatus: {key: 'quotaStatus', label: '额度状态'},
      totalInvest: {key: 'totalAmount', label: '项目总投资'},
      managerDepartment: {key: 'managerDepartment', label: '项目经营部'},
      remark: {key: 'remarks', label: '备注'},
      modifyReason: {key: 'reason', label: '调整原因'},
      rejectReason: {key: 'auditRemarks', label: '拒绝原因'},
      applicant: {key: 'creator', label: '申请人'},
      createDate: {key: 'createDate', label: '申请时间'},
      managerDepartmentId: {key: 'managerDepartmentId', label: '项目经营部Id'},
      projectTypeId: {key: 'projectTypeId', label: '项目类别代码'},
      projectTypeCode: {key: 'projectTypeCode', label: '项目类别编号'},
      seqNo: {key: 'seqNo', label: '具体项目序号'},
    };
    public demandDataMap = {
      id: {key: 'id', label: 'id'},
      demandId: {key: 'applyNo', label: '需求申请单号'},
      orgName: {key: 'orgName', label: '业务实体'},
      orgId: {key: 'orgId', label: '业务实体Id'},
      createDate: {key: 'createDate', label: '创建日期'},
      applyDate: {key: 'applyDate', label: '申请日期'},
      applyDepartment: {key: 'applyDepartment', label: '申请部门'},
      applicant: {key: 'applicant', label: '申请人'},
      status: {key: 'status', label: '审批状态'},
      remark: {key: 'remarks', label: '备注'},
      monthPlanIn: {key: 'requirementId', label: '计划月份'},
      lineNo: {key: 'lineNum', label: '行号'},
      materialCode: {key: 'materialsCode', label: '物料编码'},
      materialDescription: {key: 'materialsDesc', label: '物料描述'},
      unit: {key: 'unit', label: '单位'},
      quantity: {key: 'count', label: '数量'},
      demandDate: {key: 'needDate', label: '需求日期'},
      targetPrice: {key: 'planUnitPrice', label: '计划价格'},
      lineTotalAmount: {key: 'totalPrice', label: '行总金额'},
      planner: {key: 'planner', label: '计划员'},
      demandPlanLineNo: {key: 'lineNo', label: '需求计划行号'},
      demandDepartment: {key: 'applyDepartment', label: '计划部门'},
      lineType: {key: 'materialsType', label: '物料类型'},
      demandQuantity: {key: 'lineNo', label: '需求数量'},
      purchaseQuantity: {key: 'lineNo', label: '采购数量'},
      inventoryQuantity: {key: 'lineNo', label: '库存现有量'},
      safeInventory: {key: 'lineNo', label: '安全库存'},
      quantityPlanIn: {key: 'lineNo', label: '已申报计划'},
      threeMonthConsumed: {key: 'lineNo', label: '前三个月领用量'},
      handleStatus: {key: 'handleStatus', label: '处理状态'},
      handleDate: {key: 'operateDate', label: '处理时间'},
      applyType: {key: 'applyType', label: '需求申请类型'},
      urgencyFlag: {key: 'urgencyFlag', label: '是否紧急'},
    };
    public purchasePlanDataMap = {
      id: {key: 'id', label: 'ID'},
      orgName: {key: 'orgName', label: '业务实体'},
      orgId: {key: 'orgId', label: '业务实体Id'},
      purchasePlanId: {key: 'purchasePlanNo', label: '采购计划编号'},
      monthPlanIn: {key: 'planMonth', label: '计划月份'},
      businessType: {key: 'businessType', label: '业务类型'},
      purchasePlanType: {key: 'purchasePlanType', label: '采购计划类型'},
      purchaseType: {key: 'purchaseWay', label: '采购方式'},
      totalCount: {key: 'totalCount', label: '条目总数'},
      totalAmount: {key: 'totalQuantity', label: '总数量'},
      totalPrice: {key: 'totalPrice', label: '总计划价'},
      departmentName: {key: 'departmentName', label: '所属部门'},
      departmentNameId: {key: 'departmentNameId', label: '所属部门'},
      allocatePlanner: {key: 'plannerName', label: '计划员'},
      allocatePlannerId: {key: 'plannerId', label: '计划员Id'},
      allocateDepartment: {key: 'businessDepartmentName', label: '商务科室'},
      allocateDepartmentDate: {key: 'businessDepartmentDate', label: '下达商务科室时间'},
      allocatePlannerDate: {key: 'id', label: '下达计划员时间'},
      status: {key: 'status', label: '状态'},
      materialCode: {key: 'materialNo', label: '物料编码'},
      materialCodeSide: {key: 'code', label: '物料编码'},
      materialDescription: {key: 'materialDesc', label: '物料描述'},
      materialModel: {key: 'materialModel', label: '型号规格'},
      materialName: {key: 'materialName', label: '物料名称'},
      unit: {key: 'unit', label: '单位'},
      purchaseAmount: {key: 'quantity', label: '采购数量'},
      inventory: {key: 'inventoryNum', label: '库存现有量'},
      amountInPlan: {key: 'applyPurchaseNum', label: '已申报计划'},
      useAmountInThreeMonth: {key: 'threeMonthReceiveNum', label: '前三个月领用量'},
      demandDate: {key: 'needDate', label: '需求日期'},
      targetPrice: {key: 'planPrice', label: '计划价'},
      targetPricePlan: {key: 'unitPrice', label: '计划价'},
      receiver: {key: 'recipient', label: '通知接收人'},
      remark: {key: 'remark', label: '备注'},
      materialAmount: {key: 'inventoryNum', label: '物料数量'},
      materialType: {key: 'materialType', label: '物料类型'},
      lineNo: {key: 'indexNo', label: '行号'},
      planner: {key: 'plannerName', label: '计划员'},
      plannerId: {key: 'plannerNameId', label: '计划员Id'},
      demandAmount: {key: 'quantity', label: '需求数量'},
      safeInventory: {key: 'safeInventoryNum', label: '安全库存'},
      technicalParameters: {key: 'technicalParameters', label: '技术参数'},
      auditDate: {key: 'createDate', label: '审批时间'},
      auditStartDate: {key: 'startCreateDate', label: '审批时间'},
      auditEndDate: {key: 'endCreateDate', label: '审批时间'},
      projectCode: {key: 'projectCode', label: '项目编码'},
      projectName: {key: 'projectName', label: '项目名称'},
      deviceDesc: {key: 'deviceDesc', label: '主机描述'},
      allotStatus: {key: 'allotStatus', label: '计划行状态'},
      factoryPlanner: {key: 'factoryPlanner', label: '二级单位计划员'},
      salesmanName: {key: 'salesmanName', label: '业务员'},
      allocateSalesmanDate: {key: 'salesmanDate', label: '下达业务员时间'},
      isHasDepartment: {key: 'businessDeptFlag', label: '是否有商务科室'},
      isHasPlanner: {key: 'plannerFlag', label: '是否有计划员'},
      auditStatus: {key: 'auditStatus', label: '审批状态'},
      reportStatus: {key: 'plannerFlag', label: '上报状态'},
      createDate: {key: 'createDate', label: '创建日期'},
      createDateStart: {key: 'startCreateDate', label: '创建日期开始'},
      createDateEnd: {key: 'endCreateDate', label: '创建日期截止'},
      totalInvest: {key: 'totalAmount', parentKey: 'purchaseBudgetVO', label: '项目总投资(万)'},
      availableAmount: {key: 'availableAmount', parentKey: 'purchaseBudgetVO', label: '项目可用投资(万)'},
      remainAmount: {key: 'remainingAmount', parentKey: 'purchaseBudgetVO', label: '当年剩余投资(万)'},
      planInvest: {key: 'totalAmount', label: '本计划单总金额'},
      deviceModel: {key: 'deviceModel', label: '型号规格'},
      brand: {key: 'brand', label: '品牌厂家'},
      lineTotalPrice: {key: 'totalPrice', label: '行总金额'},
      unitPriceAbout: {key: 'unitPrice', label: '概算单价'},
      auditRemark: {key: 'auditRemark', label: '拒绝原因'},
      attachment: {key: 'annexUrl', label: '附件'},
      annexName: {key: 'annexName', label: '附件名称'},
      agreementCode: {key: 'agreementCode', label: '协议号'},
      contractCode: {key: 'contractNo', label: '前购合同号'},
      isAgreement: {key: '', label: '可协议'},
      isBuyAgain: {key: '', label: '可续购'},
      specificationModel: {key: 'specificationModel', label: '型号规格'}
    };
    public purchasePlanTypeList = [
      {label: '月度计划', value: 1},
      {label: '临时计划', value: 2},
      {label: '急件计划', value: 3},
    ];
    public materialTypeList = [
      {label: '材料', value: 1},
      {label: '备件', value: 2}
    ];
    public allMaterialTypeList = [
      {label: '材料', value: 1},
      {label: '备件', value: 2},
      {label: '设备', value: 3}
    ];
    public purchasePlanAuditStatusList = [
      // {label: '待提交', value: 0},
      // {label: '待审核', value: 1},
      // {label: '审核中', value: 2},
      // {label: '审核通过', value: 3},
      // {label: '审核拒绝', value: 4},
      {label: '已上报', value: 5},
      {label: '材设审核中', value: 6},
      {label: '材设审核通过', value: 7},
      {label: '材设审核拒绝', value: 8},
    ];
    private http: HttpUtilService;
    private newConfig: HttpUtilNs.NewHttpConfig = {};
    constructor(private injector: Injector) {
      this.http = this.injector.get(HttpUtilService);
      this.paramConfig.gateway = HttpUtilNs.GatewayKey.Ps;
      this.newConfig = {
        gateway: HttpUtilNs.GatewayKey.Ps,
        delayLoading: 0
      };
    }
    public getPurchaseBudgetList(filters): Promise<any> {
      return this.http.Post('/purchaseBudget/list', filters, this.paramConfig).toPromise();
    }
    public getPurchaseBudgetItem(projectId) {
      return this.http.Get('/purchaseBudget/item', {id: projectId}, this.paramConfig).toPromise();
    }
    public submitPurchaseBudget(filters) {
      return this.http.Post('/purchaseBudget/push', filters, this.paramConfig).toPromise();
    }
    public savePurchaseBudget(filters) {
      return this.http.Post('/purchaseBudget/save', filters, this.paramConfig).toPromise();
    }
    public passPurchaseBudget(projectId) {
      return this.http.Post('/purchaseBudget/pass', {id: projectId}, this.paramConfig).toPromise();
    }
    public refusePurchaseBudget(filters) {
      return this.http.Post('/purchaseBudget/refuse', filters, this.paramConfig).toPromise();
    }
    public modifyPurchaseBudget(filters) {
      return this.http.Post('/purchaseBudget/modifyQuota', filters, this.paramConfig).toPromise();
    }
    public finishPurchaseBudget(filters) {
      return this.http.Post('/purchaseBudget/finish', filters, this.paramConfig).toPromise();
    }
    public getProjectTypeList() {
      return this.http.newGet('/erpParam/getProjectTypeList', null, this.paramConfig);
    }
    public getProjectDeptList() {
      return this.http.newGet('/erpParam/getProjectDeptList', null, this.paramConfig);
    }
    public getOrgList(): Promise<any> {
      const paramConfig: HttpUtilNs.UfastHttpConfig = {};
      paramConfig.gateway = HttpUtilNs.GatewayKey.Ius;
      return this.http.Get('/workspace/info', null, paramConfig).toPromise();
    }
    public getDemandPlanList(filters) {
      return this.http.Post('/purchaseDemandPlan/list', filters, this.paramConfig).toPromise();
    }
    public getDemandPlanDetail(filters) {
      return this.http.Get('/purchaseDemandPlan/item', filters, this.paramConfig).toPromise();
    }
    public cancelDemandPlan(filters) {
      return this.http.Post('/purchaseDemandPlan/cancel', filters, this.paramConfig).toPromise();
    }
    public getDemandPlanLineList(filters) {
      return this.http.Post('/purchaseDemandPlan/lineList', filters, this.paramConfig).toPromise();
    }
    public modifyPlanner(filters) {
      return this.http.Post('/purchaseDemandPlan/modifyPlanner', filters, this.paramConfig).toPromise();
    }
    public createPurchasePlanList(filters) {
      return this.http.Post('/purchasePlanHead/createPurchasePlan', filters, this.paramConfig);
    }
    public savePurchasePlan(filters) {
      return this.http.Post('/purchasePlanHead/save', filters, this.paramConfig);
    }
    public submitPurchasePlan(filters) {
      return this.http.Post('/purchasePlanHead/submit', filters, this.paramConfig);
    }
    public getPurchaseList(filters) {
      return this.http.Post('/purchasePlanHead/listAll', filters, this.paramConfig);
    }
    public getPurchaseDetail(id) {
      return this.http.Get('/purchasePlanHead/itemWithDetails', {id: id}, this.paramConfig);
    }
    public getPurchaseDetailByNo(id) {
      return this.http.Get('/purchasePlanHead/itemWithDetailsByNo', {no: id}, this.paramConfig);
    }
    public agreeMaterialAudit(filters) {
      return this.http.Post('/purchasePlanHead/materialAuditPass', filters, this.paramConfig);
    }
    public refuseMaterialAudit(filters) {
      return this.http.Post('/purchasePlanHead/materialAuditRefused', filters, this.paramConfig);
    }
    public getMaterialPurchaseList(filters) {
      return this.http.Post('/purchasePlanHead/materialPurchasePlanList', filters, this.paramConfig);
    }
    public agreeFactoryAudit(filters) {
      return this.http.Post('/purchasePlanHead/factoryAuditPass', filters, this.paramConfig);
    }
    public refuseFactoryAudit(filters) {
      return this.http.Post('/purchasePlanHead/factoryAuditRefused', filters, this.paramConfig);
    }
    public reportFactoryPurchasePlan(filters) {
      return this.http.Post('/purchasePlanHead/factoryReport', filters, this.paramConfig);
    }
    public getPurchaseAllotList(filters) {
      return this.http.Post('/purchasePlanDetailsExtend/listAllotDetails', filters, this.paramConfig);
    }
    public getDevicePurchaseList(filters) {
      return this.http.Post('/purchasePlanHead/devicePurchasePlanList', filters, this.paramConfig);
    }
    public allotPlaner(paramsData) {
      return this.http.Post('/purchasePlanDetailsExtend/allotPlanner', paramsData, this.paramConfig);
    }
    public allotDepartment(paramsData) {
      return this.http.Post('/purchasePlanDetailsExtend/allotBusinessDept', paramsData, this.paramConfig);
    }
    public assignPlanner(paramsData) {
      return this.http.Post('/purchasePlanDetailsExtend/forwardPlanner', paramsData, this.paramConfig);
    }
    public assignDepartment(paramsData) {
      return this.http.Post('/purchasePlanDetailsExtend/forwardBusinessDept', paramsData, this.paramConfig);
    }
    public getPurchaseExecuteList(paramsData) {
      return this.http.Post('/purchasePlanDetailsExtend/listExecuteDetails', paramsData, this.paramConfig);
    }
    public getPurchaseExecuteDetail(purchasePlanId) {
      return this.http.Get('/purchasePlanDetailsExtend/itemByPurchasePlanNo', {purchasePlanNo: purchasePlanId}, this.paramConfig);
    }
    public dividePurchasePlan(paramsData) {
      return this.http.Post('/purchasePlanDetailsExtend/divide', paramsData, this.paramConfig);
    }
    public getMaterialList(filters) {
      const paramConfig: HttpUtilNs.UfastHttpConfig = {};
      paramConfig.gateway = HttpUtilNs.GatewayKey.Ss;
      return this.http.Post('/factoryMaterial/listForPurchase', filters, paramConfig);
    }
    /**退回科室 */
    public planReturnToDept(ids) {
      return this.http.newPost('/purchasePlanDetailsExtend/returnToDept', ids, this.newConfig);
    }
    /**退回管理科 */
    public planReturnToManage(ids) {
      return this.http.newPost('/purchasePlanDetailsExtend/returnToManage', ids, this.newConfig);
    }
    /**退回厂矿 */
    public planReturnToFactory(ids) {
      return this.http.newPost('/purchasePlanDetailsExtend/returnToFactory', ids, this.newConfig);
    }
  }
}
@Injectable()
export class PurchaseService extends PurchaseServiceNs.PurchaseServiceClass {
  constructor(injector: Injector) {
    super(injector);
  }

}
