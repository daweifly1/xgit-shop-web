export const sex = {
  0: '女',
  1: '男'
};
export const lockedStatus = {
  0: '启用',
  1: '锁定'
};
export const usableStatus = {
  0: '禁用',
  1: '启用'
};

export const businessType = {
  1: '生产商',
  2: '贸易商',
  3: '综合'
};
export const type = {
  1: '材设新闻',
  2: '采购文化',
  3: '政策法规',
  4: '图文欣赏',
  5: '公告',
  6: '废旧物资信息公示',
  7: '轮播图',
  8: '江铜采购指数',
  9: '公司动态',
  10: '招标公告',
  11: '中标公示',
  12: '优秀供应商',
  13: '帮助中心',
  14: '导航轮播图',
};
export const isPlan = {
  0: '否',
  1: '是'
};
export const state = {
  0: '待入库',
  1: '部分入库',
  2: '全部入库',
  3: '强制结单',
};
export const isSynsap = {
  0: '未同步',
  1: '同步'
};
export const entranceDevice = {
  0: '否',
  1: '是'
};
export const crucialDevice = {
  0: '否',
  1: '是'
};
export const invoiceState = {
  APPROVED: 'ERP已审批',
  APPROVEDPR: 'ERP业务批准',
  CANCEL: 'ERP已取消',
  CREATED: 'ERP已生成发票',
  NEW: 'ERP新建',
  PROCESSING: 'ERP审批中',
  RECREATE: 'ERP重新生成发票',
  REJECT: 'ERP已拒绝',
  SUBMIT: 'ERP已提交',
  // SAVED: '保存',
  // CHECKING: '审批中',
  PAID: 'ERP已做付款凭证',
  PREPAY: '已预付款核销',
  APPROVING: '审批中',
  REFUSED: '审批拒绝',
  COMPLETE: '审批完成'
};
export const erpSync = {
  0: '未同步',
  1: '同步中',
  2: '同步失败',
  3: '同步完成'
};
export const erpSyncOther = {
  0: '未同步',
  1: '已同步'
};
export const erpSyncOtherRes = {
  0: '同步失败',
  1: '同步成功'
};
// 出库状态
export const stockOutStatus = {
  0: '待出库',
  1: '部分出库',
  2: '全部出库',
  3: '强制结单',
};
export const inventoryState = {
  0: '未盘点',
  1: '盘点启动',
  2: '盘点结束'
};
export const InOrOutType = {
  0: '入库类型',
  1: '出库类型',
};
export const InOutType = {
  1: '入库',
  2: '出库',
};
export const barcodeStatus = {
  0: '已打印',
  1: '全部入库',
  2: '全部出库',
  3: '已拆分'
};
export const checkType = {
  0: '根据仓库',
  1: '根据保管员',
  2: '根据库区',
  3: '根据物料'
};
export const barcodeFlag = {
  0: '总条码',
  1: '分条码'
};
// 包装条码打印打印标志
export const printState = {
  0: '未打印',
  1: '部分打印',
  2: '已打印',
};
// 包装条码打印操作标志
export const packageCodeStatus = {
  0: '未完成',
  1: '部分完成',
  2: '已完成',
};
export const contractType = {
  1: '采购订单',
  2: '年度协议'
};
export const deliverGoodsType = {
  1: '采购订单发货',
  2: '年度协议发货'
};
export const stockInType = {
  1: '采购订单入库',
  2: '年度协议入库'
};
export const deliverGoodsStatus = {
  0: '待提交',
  1: '待发货',
  3: '部分扫码发货',
  4: '全部扫码发货',
  10: '已发货',
  11: '到货登记'
};
export const warehouseType = {
  0: '普通仓库',
  1: '协议仓库'
};
/*物料相关开始*/
export const materialType = {
  0: '材料',
  1: '设备/备件'
};
export const materialType2 = {
  1: '材料',
  2: '备件',
  3: '设备'
};
export const materialClassStatus = {
  'true': '失效',
  'false': '有效'
};
export const materialClassLevel = {
  '1': '一级',
  '2': '二级',
  '3': '三级'
};
export const unit = {
  '0': '吨',
  '1': '个',
  '2': '套'
};
export const auditStatus = {
  0: '待审核',
  1: '审核通过',
  2: '审核拒绝'
};
export const auditApproveStatus = {
  0: '待审批',
  1: '审批通过',
  2: '审批拒绝'
};
export const materialSettingStatus = {
  0: '正常',
  1: '冻结'
};
/*物料相关结束*/
export const agreementFlag = {
  1: '采购订单',
  2: '年度协议'
};
export const inventoryType = {
  0: '待入库',
  1: '部分入库',
  2: '全部入库',
  3: '强制结单'
};
export const billType = {
  0: '发货单',
  1: '收货单'
};
export const documentState = {
  0: '暂存',
  1: '待收货',
  2: '部分验收',
  3: '全部验收',
  4: '部分入库',
  10: '全部入库',
  11: '强制结单'
};
// 是否条码管理
export const barcodeManage = {
  0: '否',
  1: '是'
};
export const factoryMineStatus = {
  0: '正常',
  1: '冻结'
};
export const importOrDomestic = {
  '进口': '进口',
  '进口国产化': '进口国产化',
  '国产': '国产',
  '转口': '转口'
};
// 厂矿物资分类
export const materialClassification = {
  0: '保险件',
  1: '一般件',
  2: '常耗件',
};
// erp过账
export const erpFlag = {
  0: '未过账',
  1: '成功',
  2: '失败'
};
export const agreementType = {
  0: '代储代销',
  1: '单耗承包'
};
export const assemblyOrPart = {
  0: '总成',
  1: '部装'
};
export const shortDress = {
  0: '是',
  1: '否'
};
// 分工管理
export const divideWorkId = {
  1: '风机',
  2: '空压机',
  3: '汞',
  4: '阀',
  5: '铲运机',
};
export const assigned = {
  0: '未分配',
  1: '已分配'
};
export const nameMatchStatus = {
  0: '未冻结',
  1: '已冻结'
};
export const billTypeShow = {
  'JTFR': '其它入库',
  'JTFC': '其它出库',
  'JTQR': '期初入库',
  'CK': '领料出库',
  'RK': '采购入库',
  'TH': '采购退货',
  'JTQDIN': '调拨入库',     // 拼接
  'JTQDOUT': '调拨出库',
  'JTYK': '物料转移'
};
export const checkResultState = {
  0: '正常',
  1: '盘亏',
  2: '盘盈',
};
export const regionalAllocationBillStatus = {
  '1': '待提交',
  '2': '已提交',
  '3': '审核拒绝'
};
export const billStatus = {
  '1': '已提交',
  '2': '审核通过',
  '3': '审核拒绝'
};
export const inOutState = {
  0: '未完成',
  1: '部分完成',
  2: '已完成'
};
export const companyType = {
  1: '生产商',
  2: '贸易商',
  3: '集成'
};
/**
 * 是否是常用联系人*/
export const commonlyUser = {
  0: '否',
  1: '是'
};
export const supplierStatus = {
  0: '已保存',
  1: '注册',
  2: '潜在',
  3: '临时',
  4: '合格',
  5: '备选',
  6: '暂停'
};
export const returnState = {
  1: '创建',
  2: '待出库',
  3: '部分出库',
  4: '全部出库',
  5: '强制结单'
};
export const supplierAuditStatus = {
  0: '待审核',
  1: '审核中',
  2: '审核通过',
  3: '审核拒绝',
  4: '管理科审核中',
  5: '管理科审核通过',
  6: '管理科审核拒绝',
  7: '待管理科审核'
};
export const certificatePast = {
  0: '',
  1: '是'
};
export const projectBudgetStatus = {
  0: '新建',
  1: '待审核',
  2: '审核通过',
  3: '审核拒绝',
  10: '完结'
};
export const projectBudgetQuotaStatus = {
  0: '初始',
  1: '待审核',
  2: '审核通过',
  3: '审核拒绝'
};
export const demandPlanStatus = {
  0: '初始',
  1: '已接受',
  2: '已作废'
};
export const demandHandleStatus = {
  0: '待处理',
  1: '已处理',
  2: '已作废'
};
export const demandApplyType = {
  1: '月度计划',
  2: '年修计划',
  3: '季度计划',
  4: '年度计划',
  5: '临时计划',
};
export const demandUrgencyFlag = {
  0: '不紧急',
  1: '紧急',
};
export const purchasePlanType = {
  1: '月度计划',
  2: '临时计划',
  3: '急件计划'
};
export const purchaseType = {
  1: '统购',
  2: '自购'
};
export const purchasePlanStatus = {
  0: '待提交',
  1: '待审核',
  2: '审核中',
  3: '审核通过',
  4: '审核拒绝',
  5: '已上报',
  6: '材设审核中',
  7: '材设审核通过',
  8: '材设审核拒绝',
};
export const purchaseAllotStatus = {
  0: '初始',
  1: '已下达商务科室',
  2: '待执行',
  3: '已流转',
  4: '已关闭',
  5: '已退回科室',
  6: '已退回管理科'
};
export const purchaseExecuteStatus = {
  2: '待执行',
  3: '已流转',
  4: '已关闭'
};
export const purchaseConfirmationStatus = {
  0: '待提交',
  1: '待审核',
  2: '审核中',
  3: '审核通过',
  4: '审核拒绝',
  5: '已作废'
};
export const purchaseConfirmationBackStatus = {
  0: '未申请退回',
  1: '审核中',
  2: '审核通过',
  3: '审核拒绝'
};
export const purchaseContractStatus = {
  0: '初始',
  1: '已保存',
  2: '待甲方签章',
  3: '待乙方签章',
  4: '已生效',
  5: '已退回'
};
export const purchaseContractCancelStatus = {
  0: '未申请',
  1: '审核中',
  2: '审核通过',
  3: '审核拒绝'
};
export const purchaseContractBusiness = {
  1: '创建合同',
  2: '创建年度协议'
};
export const purchaseContractType = {
  1: '采购合同',
  2: '年度协议'
};
export const contractCarryOverType = {
  1: '原价原转',
  2: '原票原转',
  3: '计划价结算'
};
export const clauseType = {
  1: '审批表',
  2: '审定表',
  3: '合同',
};
export const purchaseWay = {
  1: '公开招标',
  2: '邀请招标',
  3: '单一来源',
  4: '竞争性谈判',
  5: '询比价',
  6: '年度协议采购',
  7: '续购',
};
export const purchaseMode = {
  1: '自主',
  2: '委托',
  3: '网购',
  4: '年度协议采购',
  5: '续购'
};
/**
 * 供应商资质文件类型
 * */
export const qualFileType = {
  1: '营业执照',
  2: '调查表',
  3: '其他证书'
};
export const supplierType = {
  1: '统购供应商',
  2: '自购供应商'
};
export const erpProcessMessage = {
  0: '失败',
  1: '成功'
};
export const managementMode = {
  0: '非条码',
  1: '条码'
};
export const isSynsapErp = {
  0: '否',
  1: '是'
};
export const receiveStockStatus = {
  0: '待入库',
  4: '部分入库',
  10: '全部入库',
  11: '强制结单'
};
export const isDistribution = {
  0: '自提',
  1: '配送'
};
export const pickingApplyStatus = {
  0: '未提交',
  1: '已提交'
};
export const pickingApplyConfirmStatus = {
  1: '未确认',
  2: '已确认',
  3: '已生成出库单',
  4: '配送中',
  5: '全部出库',
  6: '部分出库'
};
export const isAgreement = {
  0: '否',
  1: '是'
};
export const transportMode = {
  1: '铁运',
  2: '汽运'
};
export const inventoryStatus = {
  0: '正常库存',
  1: '冻结库存'
};
export const supplierRecommend = {
  0: '否',
  1: '是'
};
/**谈判预案 */
export const negotiationStyle = {
  1: '直接谈判',
  2: '间接谈判',
  3: '横向谈判',
  4: '纵向谈判'
};
export const negotiationForm = {
  1: '会议'
};
export const negotiationState = {
  0: '已保存',
  1: '待审核',
  2: '审批通过',
  3: '审批拒绝'
};
export const purchasePriceType = {
  1: '概算价',
  2: '计划价',
  3: '上期采购价',
  4: '其它估算价格',
};
export const purchaseDealStrategy = {
  1: '单项最低价',
  2: '组包最低价'
};
export const purchaseApprovalStatus = {
  1: '已保存',
  2: '待审核',
  3: '审批通过',
  4: '待价格处理',
  5: '处理完成',
  6: '作废',
  7: '审核拒绝',
  8: '寻源中,等待确认价格',
  9: '部分生成审定表'
};
export const templateType = {
  1: '个人模板',
  2: '通用模板'
};
export const purchaseRowDealStatus = {
  1: '待处理',
  2: '已处理',
  3: '待退回',
  4: '已生成审定表'
};
/** 审批行状态*/
export const approvalRowStatus = {
  0: '无转换记录',
  1: '待审核',
  2: '已通过',
  3: '已拒绝'
};
export const negotiationMinutesStatus = {
  0: '已保存',
  1: '待审核',
  2: '审批通过',
  3: '审批拒绝'
};
export const inquiryMethod = {
  1: '线上询价',
  2: '线下询价'
};
export const purchaseInquiryStatus = {
  0: '待发送',
  1: '待报价',
  2: '已获取报价',
  3: '已确认报价',
  4: '已再次询价'
};
export const purchaseAuditProcess = {
  0: '同意',
  1: '拒绝',
  9: '待审核'
};
export const yesOrNo = {
  0: '否',
  1: '是'
};
export const purchaseQuotationStatus = {
  1: '未阅',
  2: '未报价',
  3: '部分报价',
  4: '全部报价',
  5: '报价结束',
  6: '已放弃',
  /*  7: '未中标',
    8: '部分中标',
    9: '全部中标'*/
};
export const agreementSettlementStatus = {
  0: '新建',
  1: '已生成计划'
};
export const agreementSettlementMaterialStatus = {
  0: '新建',
  1: '完结'
};
export const pickingOutSubmitPlanFlag = {
  0: '未生成计划',
  1: '成功'
};
export const pickingOutIsPrint = {
  1: '已打印',
  0: '未打印'
};
export const pickingOutSearchErpSync = {
  0: '未同步',
  1: '同步成功',
  2: '同步失败',
};
export const materialTemplateType = {
  1: '材料',
  3: '设备',
  2: '专用备件',
  4: '通用备件',
};
export const purchaseMethodChangeStatus = {
  0: '未申请',
  1: '待审核',
  2: '已通过',
  3: '已拒绝'
};
export const erpSyncFlag = {
  0: '未同步',
  1: '同步成功',
  2: '同步失败'
};
export const purchaseApproveApplyReturnStatus = {
  0: '未申请',
  1: '待审核',
  2: '已通过',
  3: '已拒绝'
};

export const authType = {
  0: '其他',
  1: '菜单',
  2: '按钮'
};

export const goodsCatLevelType = {
  0: '一级',
  1: '二级',
  2: '三级'
};
// 通用布尔量
export const commonBoolean = {
  0: '否',
  1: '是'
};

export const attrSelectType = {
  0: '唯一',
  1: '单选',
  2: '多选'
};

export const attrInputType = {
  0: '手工录入',
  1: '从列表中选取'
};


