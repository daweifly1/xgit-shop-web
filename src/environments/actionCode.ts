export const ActionCode = {
  /******************系统管理***********************/
/**组织架构**/
deptManageAdd: 1103, // 新增部门
deptManageEdit: 1104, // 编辑部门
deptManageDel: 1105, // 删除部门


/**用户管理**/
userManageAdd: 1301, // 新增用户
userManageDel: 1306, // 删除用户
userManageEdit: 1308, // 编辑用户
userManageResetPd: 1010, // 重置密码
userManageEnable: 1310, // 锁定和启用

/**角色权限管理**/
roleManageAdd: 1401, // 新增角色
roleManageDel: 1402, // 删除角色
roleManageEdit: 1404, // 编辑角色
roleManageSetAuth: 1415, // 设置权限

/**数据字典**/
dictionaryAdd: 2001, // 新增
dictionaryEdit: 2002, // 编辑
dictionaryAddParam: 2003, // 新增参数
dictionaryEditParam: 2004, // 编辑参数

/**打印模板**/
printTplAdd: 2101, // 新增模板
printTplDel: 2102, // 删除模板
printTplEdit: 2103, // 编辑模板
printTplSetDef: 2104, // 设置默认模板

/**企业管理**/
orgInfoEdit: 0, // 编辑内部企业信息

/**员工请假 */
userLeaveAdd: 0, // 新增
userLeaveEdit: 0, // 编辑
// userLeaveAdd: 2201, // 新增
// userLeaveEdit: 2202, // 编辑


/*****************门户网站管理*****************/
/***资讯管理**/
infoAdd: 400101, // 新增
infoDel: 400102, // 删除
infoEdit: 400103, // 编辑
infoEnable: 400104, // 上下架
infoSticky: 400105, // 置顶

/*****************云结算*********************/
/**发票联系单**/
invoiceAdd: 310101, // 新增
invoiceDel: 310102, // 删除
invoiceEdit: 310103, // 编辑
invoicePrint: 310104, // 打印

/****************仓储管理******************/
/**仓库管理***/
warehouseAdd: 200101,         // 新增仓库
warehouseEdit: 200102,         // 编辑仓库
warehouseDel: 200103,       // 删除仓库
warehouseAreaAdd: 200104,         // 新增库区
warehouseAreaEdit: 200105,         // 编辑库区
warehouseAreaDel: 200106,         // 删除库区
locationAdd: 200107,         // 新增储位
locationEdit: 200108,         // 编辑储位
locationDel: 200109,         // 删除储位
warehousePlacePrint: 200110,         // 打印储位

/**单据类型**/
billTypeAdd: 200301,         // 新增
billTypeEdit: 200302,         // 编辑
billTypeDel : 200303,         // 删除

/**代储物料关系 */
agreementMaterialrefAdd: 0,    // 新增
agreementMaterialrefEdit: 0,    // 编辑
agreementMaterialrefDel: 0,    // 删除

/**代储代销 */
agreementSettlementAdd: 0,     // 新增
agreementSettlementEdit: 0,     // 编辑
agreementSettlementDel: 0,     // 删除
agreementSettlementSubmitPlan: 0,     // 提交计划

// /**代储物料关系 */
// agreementMaterialrefAdd: 200601         //新增
// agreementMaterialrefEdit:   200602         //编辑
// agreementMaterialrefDel:    200603         //删除

// /**代储代销 */
// agreementSettlementAdd: 200604         //新增
// agreementSettlementEdit: 200605         //编辑
// agreementSettlementDel: 200606         //删除
// agreementSettlementSubmitPlan: 200607         //提交计划


/**采购退货 */
purchaseOutAdd: 201901,         // 新增
purchaseOutEdit: 201902,         // 编辑
purchaseOutFinish: 201903,         // 结单
purchaseOutDel: 201904,         // 删除
purchaseOutDelivery: 201905,         // 出库
purchaseOutPrint: 201906,         // 打印
purchaseOutErpSync: 201907,         // ERP同步

/**其它出库**/
unusualOutAdd: 201101,         // 新增出库单
unusualOutEdit: 201102,         // 编辑
unusualOutDel: 201103,         // 删除
unusualOutDelivery: 201104,         // 出库
unusualOutFinish: 201105,         // 结单
unusualOutPrint: 201106,         // 打印
unusualOutErpSync: 201107,         // ERP同步

/**其它入库**/
unusualInAdd: 201001,         // 申请入库
unusualInEdit: 201002,         // 编辑
unusualInDel: 201003,         // 删除
unusualInPutInStorage: 201004,         // 入库
unusualInFinish: 201005,         // 结单
unusualInPrint: 201006,         // 打印
unusualInErpSync: 201007,         // ERP同步

/**期初入库**/
beginningInImport: 200401,         // 导入
beginningInPutInStorage: 200402,         // 入库
beginningInFinish: 200403,         // 结单
beginningInPrint: 200404,         // 打印

/**收货单**/
receivingNoteAdd: 201501,         // 新增
receivingNoteReceive: 201502,         // 验收
receivingNotePutInStorage: 201503,         // 入库
receivingNoteFinish: 201504,         // 结单
receivingNotePrint: 201505,         // 打印单据
receivingNotePrintBarcode: 201506,         // 打印条码

/**发货单**/
dispatchBillAdd: 201401,         // 新增
dispatchBillDel: 201402,         // 删除
dispatchBillEdit: 201403,         // 编辑
dispatchBillPrint: 201404,         // 打印
dispatchBillDeliver: 201405,         // 发货
dispatchBillPrintBarcode: 201406,         // 打印条码

/**采购入库**/
warehouseWarrantPrint: 201601,         // 打印
warehouseWarrantErpSync: 201602,         // ERP同步

/**领料申请**/
pickingApplyAdd: 201701,         // 新增
pickingApplyDel: 201702,         // 删除
pickingApplyEdit: 201703,         // 编辑

/**领料申请确认 */
pickingApplyConfirm: 201704,         // 确认
pickingApplyGenerateStockOut: 201705,         // 生成出库单

/**领料组包 */
pickingPackageDistribution: 201706,         // 组包配送/生成出库单
pickingPackagePrint: 201707,         // 打印

/**领料出库**/
pickingDelivery: 201801,         // 出库
pickingDeliveryFinish: 201802,         // 结单
pickingDeliveryPrint: 201803,         // 打印
pickingDeliveryErpSync: 201804,         // ERP同步
pickingDeliverySubmitPlan: 0,          // 提交计划
// pickingDeliverySubmitPlan: 201805,          // 提交计划

/**包装条码 */
packageBarcodePrint: 200701,         // 打印

/**条码补打 */
packageBarcodePatchPrint: 200901,         // 打印

/**期初条码 */
beginningBarcodePrint: 200501,         // 打印

/**拆箱打印 */
devanningPrint: 200801,         // 打印

/**库存查询 */
depotStockExportAll: 0,           // 导出
// depotStockExportAll: 200201,           // 导出

/**盘点单**/
inventoryAdd: 201201,         // 新增
inventoryDel: 201202,         // 删除
inventoryEnable: 201203,         // 启动和关闭
inventoryCheck: 201204,         // 盘点
inventoryPrint: 201205,         // 打印

/**调拨单**/
regionalAllocationAdd: 201301,         // 新增
regionalAllocationEdit: 201302,         // 编辑
regionalAllocationDelivery: 201303,         // 出库
regionAllocationPutInStorage: 201304,         // 入库
regionAllocationDel: 201305,         // 删除
regionAllocationPrint: 201306,         // 打印
regionAllocationErpSync: 201307,         // 领入过账、领出过账


/*******************物料管理**************************/
/**物料分类 **/
materialClassAdd: 110201,                   // 新增物料分类
materialClassEdit: 110202,                  // 编辑物料分类
materialClassEnable: 110203,                // 启用、禁用

/**物料模板 **/
materialModelAdd: 110301,                   // 新增物料模板
materialModelEdit: 110302,                  // 编辑物料模板

/**物料模板审核 **/
materialModelAudit: 110501,                 // 物料模板审核
materialModelAuditEdit: 110502,              // 编辑物料模板审核

/**设备型号 **/
equipmentModelAdd: 110701,                   // 新增设备型号
equipmentModelEdit: 110702,                  // 编辑设备型号
equipmentModelDel: 110703,                   // 删除设备型号
equipmentModelLeadIn: 110704,                // 导入

/**物料档案（材设） **/
materialSettingAdd: 110101,                  // 新增物料材设
materialSettingEdit: 110102,                 // 编辑物料材设
materialSettingFreeze: 110103,               // 冻结、解冻
materialSettingLeadIn: 110104,               // 导入计划价

/**材设分工 **/
divisionManagementAdd: 110801,               // 新增分工管理
divisionManagementEdit: 110802,              // 编辑分工管理
divisionManagementDel: 110803,               // 删除分工管理

/**物料提报审核 **/
materialReportAudit: 110601,                 // 审核

/**物料提报 **/
materialReportAdd: 110602,                       // 新增
materialReportEdit: 110603,                      // 编辑
materialReportAllot: 110604,                     // 档案分类

/**物料档案（厂矿）**/
industrialMaterialEdit: 110401,                 // 编辑
industrialMaterialFreeze: 110402,               // 冻结、解冻
industrialMaterialLocation: 110403,             // 维护储位

/**物料模板 **/
materialTemplateReportAdd: 110504,             // 物料模板提报新增
materialTemplateReportEdit: 110505,            // 物料模板提报编辑

/**厂矿分工 **/
factoryDivisionAdd: 110804,              // 厂矿分工新增
factoryDivisionEdit: 110805,             // 厂矿分工编辑
factoryDivisionDel: 110806,              // 厂矿分工删除



  /*******************供应商管理**************************/
  /**信息管理 */
  basiciInfoSubmit: 0,        // 提交

  /**基本信息 */
  basicInfoEdit: 0,          // 编辑

  /**联系人信息 */
  contractInfoAdd: 0,        // 联系人信息新增
  contractInfoEdit: 0,       // 联系人信息编辑
  contractInfoDel: 0,        // 联系人信息删除

  /**资质文件 */
  qualificationFileAdd: 0,    // 资质文件新增
  qualificationFileEdit: 0,    // 资质文件编辑
  qualificationFileDel: 0,      // 资质文件删除

  /**合同履行不良记录 */
  badContractRecordAdd: 0,      // 新增
  badContractRecordEdit: 0,     // 编辑
  badContractRecordDel: 0,      // 删除
  /**质量问题处理记录 */
  qualityProblemHandlingRecordAdd: 0,    // 新增
  qualityProblemHandlingRecordEdit: 0,   // 编辑
  qualityProblemHandlingRecordDel: 0,    // 删除


  /**档案列表-材设 **/
  archivesManageEdit: 0,                  // 编辑
  archivesManageSocialCreditCodeChange: 0,     // 社会信用代码变更
  archivesManageStatusChange: 0,           // 状态变更
  archivesManageRatingImport: 0,           // 评级导入
  archivesManageQualifiedSupplierImport: 0,    // 合格供应商导入

  /**档案列表-厂矿 */
  factoryArchivesManageEdit: 0,          // 编辑
  factoryArchivesManageStatusChange: 0,  // 状态变更
  factoryArchivesManageRecommengAsUnifiedPurchase: 0,   //  推荐为统购
  factoryArchivesManageUnifyTransitionSelf: 0,     // 统购转自购
  factoryArchivesManageSelectPotentialSupplier: 0,    // 挑选潜在供应商
  factoryArchivesManageQualifiedSupplierImport: 0,      // 合格供应商导入

  /**注册审核 */
  registrationAuditSetToPotential: 0,          // 设为潜在
  registrationAuditSetToRegister: 0,           // 设为注册
  registrationAuditRecommend: 0,               // 推荐

  /**推荐审核 */
  recommendAudit: 0,                 // 审核通过&审核拒绝
  /**修改审核 */
  modifyAudit: 0,                    // 通过&拒绝
  /**评审资料 */
  reviewFileDel: 0,                  // 删除
  /**潜在供应商列表 */
  lurkingSupplierRecommend: 0,      // 推荐

    // /**信息管理 */
    // basiciInfoSubmit: 101301         //提交

    // /**基本信息 */
    // basicInfoEdit: 100101         //编辑

    // /**联系人信息 */
    // contractInfoAdd: 100201         //新增
    // contractInfoEdit: 100202         //编辑
    // contractInfoDel: 100203         //删除

    // /**资质文件 */
    // qualificationFileAdd: 100501         //新增
    // qualificationFileEdit: 100502         //编辑
    // qualificationFileDel: 100503         //删除

  //     /**档案列表-材设 **/
  // archivesManageEdit: 101001         //编辑
  // archivesManageSocialCreditCodeChange: 101002         //社会信用代码变更
  // archivesManageStatusChange:       101003         //状态变更
  // archivesManageRatingImport: 101004         //评级导入
  // archivesManageQualifiedSupplierImport: 101005         //合格供应商导入

  // /**档案列表-厂矿 */
  // factoryArchivesManageEdit: 100601         //编辑
  // factoryArchivesManageStatusChange: 100602         //状态变更
  // factoryArchivesManageRecommengAsUnifiedPurchase: 100603         //推荐为统购
  // factoryArchivesManageUnifyTransitionSelf: 100604         //统购转自购
  // factoryArchivesManageSelectPotentialSupplier: 100605         //挑选潜在供应商
  // factoryArchivesManageQualifiedSupplierImport: 100606         //合格供应商导入

  // /**注册审核 */
  // registrationAuditSetToPotential: 100701         //设为潜在
  // registrationAuditSetToRegister: 100702         //设为注册
  // registrationAuditRecommend: 100703         //推荐

  // /**推荐审核 */
  // recommendAudit: 100801         //审核通过&审核拒绝

  // /**修改审核 */
  // modifyAudit: 100901         //通过&拒绝

  // /**评审资料 */
  // reviewFileDel: 101101         //删除

  // /**潜在供应商 */
  // lurkingSupplierRecommend: 101201         //推荐



  /*******************采购管理**************************/
  /**设备项目预算 **/
  equipmentProjectBudgetAdd: 0,                           // 新增
  equipmentProjectBudgetEdit: 0,                         // 编辑
  equipmentProjectBudgetModify: 0,                      // 调额度
  equipmentProjectBudgetAudit: 0,                      // 审核

  /**需求计划 **/
  demandPlanObsolete: 0,                       // 作废
  demandLinePlanLineCreate: 0,                 // 生成采购计划
  demandLinePlanModifyPlanner: 0,              // 修改计划员

  /**厂矿采购计划 **/
  factoryPurchasePlanAdd: 0,                        // 新增
  factoryPurchasePlanReport: 0,                     // 上报计划
  factoryPruchasePlanReprotDispatch: 0,          // 上报急件
  factoryPurchasePlanEdit: 0,                       // 编辑
  factoryPurchasePlanAudit: 0,                      // 审核

  /**材设采购计划 **/
  purchasePlanAudit: 0,                              // 审核
  purchasePlanAssignDepartment: 0,                   // 分配科室
  purchasePlanAssignPlanner: 0,                      // 分配计划员
  purchasePlanAllotDepartment: 0,                    // 下达科室
  purchasePlanAllotPlanner: 0,                       // 下达计划员
  purchasePlanDivide: 0,                             // 拆分
  purchasePlanExecute: 0,                            // 执行(审批表新建)
  purchasePlanExecuteReturnList: 0,                  // 退回
  purchasePlanAllotReturnToManage: 0,                    // 退回管理科
  purchasePlanAllotReturnToFactory: 0,                    // 退回厂矿

  /**审批表 */
  approvalFormEdit: 0,                           // 编辑
  approvalFormAudit: 0,                           // 审批
  approvalFormAskPrice: 0,                        // 询价
  approvalFormDealPrice: 0,                       // 价格处理
  approvalFormViewPrice: 0,                       // 查看报价
  approvalFormCreatePrice: 0,                     // 生成报价
  approvalFormCancellation: 0,                    // 作废
  approveApplyReturn: 0,                          // 申请退回
  approvalFormSwitchPurchaseWay: 0,               // 转换采购方式
  approvalLineAudit: 0,    // 行审核

  /**谈判预案 */
  negotiationPlanAdd: 0,                            // 新增
  negotiationPlanEdit: 0,                            // 编辑
  negotiationPlanAudit: 0,                           // 审批

  /**谈判纪要 */
  negotiationMinutesAdd: 0,                          // 新增
  negotiationMinutesEdit: 0,                        // 编辑
  negotiationMinutesAudit: 0,                       // 审核

  /** 审定表 **/
  confirmationEdit: 0,                            // 审定表编辑
  confirmationAudit: 0,                           // 审定表审核
  confirmationDelete: 0,                          // 审定表作废
  confirmationBack: 0,                            // 审定表退回
  confirmationAuditBack: 0,                       // 退回审核

  /**采购合同 **/
  contractSign: 0,                            // 签章
  contractDownload: 0,                        // 下载
  contractApplyCancel: 0,                     // 申请作废合同
  contractAuditCancel: 0,                     // 合同作废审核
  contractErpSync: 0,                         // ERP同步

  /** 条款列表 **/
  clauseListAdd: 0,                            // 新增
  clauseListEdit: 0,                        // 编辑
  clauseListDel: 0,                         // 删除

  /**合同条款模板 */
  contractClauseTemplateAdd: 0,                 // 新增
  contractClauseTemplateEdit: 0,                 // 编辑

  /**询价单 */
  inquiryListEdit: 0,                    // 编辑
  inquiryListDealBid: 0,                 // 中标处理
  inquiryListAgainAskPrice: 0,            // 再次询价
  inquiryListCompareQuota: 0,             // 报价对比
  inquiryListIsAheadGetQuote: 0,          // 获取报价、提前获取报价
  inquiryListConversionPurchaseway: 0,    // 转换采购方式



  /**报价单 */
  quotation: 0,          // 报价

    // /**设备项目预算 **/
    // equipmentProjectBudgetAdd: 300101,         //新增
    // equipmentProjectBudgetEdit: 300102,         //编辑
    // equipmentProjectBudgetModify: 300103,         //调额度
    // equipmentProjectBudgetAudit: 300104,         //审批

    // /**需求计划 **/
    // demandPlanObsolete: 300201,         //作废
    // demandLinePlanLineCreate: 300202,         //生成采购计划
    // demandLinePlanModifyPlanner: 300203,         //修改计划员

    // /**厂矿采购计划 **/
    // factoryPurchasePlanAdd: 300401,        //新增
    // factoryPurchasePlanReport: 300402,         //上报计划
    // factoryPruchasePlanReprotDispatch: 300403,         //上报急件
    // factoryPurchasePlanEdit: 300404,         //编辑
    // factoryPurchasePlanAudit: 300405,         //审核

    // factoryPurchasePlanAdd: 300401,         //新增
    // factoryPurchasePlanReport: 300402,         //上报计划
    // factoryPruchasePlanReprotDispatch: 300403,         //上报急件
    // factoryPurchasePlanEdit: 300404,         //编辑
    // factoryPurchasePlanAudit: 300405,         //审核

    // purchasePlanAllotDepartment: 300406,         //下达科室
    // purchasePlanAllotPlanner: 300407,         //下达计划员
    // purchasePlanDivide: 300408,         //拆分
    // purchasePlanExecute: 300409,         //执行
    // purchasePlanExecuteReturnList:300410,         //退回
    // purchasePlanAllotReturnToManage: 300411,         //  退回管理科
        // purchasePlanAllotReturnToFactory: 300412,         //  退回厂矿


    // /**审批表 */
    // approvalFormEdit: 300501,         //编辑
    // approvalFormAudit: 300502,         //审批
    // approvalFormAskPrice: 300503,         //询价
    // approvalFormDealPrice: 300504,         //价格处理
    // approvalFormViewPrice: 300505,         //查看报价
    // approvalFormCreatePrice: 300506,         //生成报价
    // approvalFormCancellation: 300507,        //作废
    // approvalFormSwitchPurchaseWay: 300508,         //转换采购方式
    // approvalLineAudit: 300509,         //通过&拒绝

    // /**谈判预案 */
    // negotiationPlanAdd: 301101,         //新增
    // negotiationPlanEdit: 301102,         //编辑
    // negotiationPlanAudit: 301103,         //审批

    // /**谈判纪要 */
    // negotiationMinutesAdd: 301201,         //新增
    // negotiationMinutesEdit: 301202,         //编辑
    // negotiationMinutesAudit: 301203,         //审核

    // /** 审定表 **/
    // confirmationEdit: 300801,         //编辑
    // confirmationAudit: 300802,         //审核
    // confirmationDelete: 300803,         //删除

    // /**采购合同 **/
    // contractSign: 300901,                            // 签章
    // contractDownload: 300902,                        // 下载
    // contractApplyCancel: 300903,                     // 申请作废合同
    // contractAuditCancel: 300904,                     // 合同作废审核
    // contractErpSync: 300905,                         // ERP同步

    // /** 条款列表 **/
    // clauseListAdd: 301001,         //新增
    // clauseListEdit: 301002,         //编辑
    // clauseListDel: 301003,         //删除

    // /**合同条款模板 */
    // contractClauseTemplateAdd: 301004,         //新增
    // contractClauseTemplateEdit: 301005,         //编辑

    // /**询价单 */
    // inquiryListEdit: 300601,         //编辑
    // inquiryListDealBid: 300602,         //中标处理
    // inquiryListAgainAskPrice: 300603,         //再次询价
    // inquiryListCompareQuota: 300604,         //报价对比
    // inquiryListIsAheadGetQuote: 300605,         //获取报价，提前获取报价
    // inquiryListConversionPurchaseway: 300606,         //转换采购方式

    // /**报价单 */
    // quotation: 300701         //报价






};


