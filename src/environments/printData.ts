// <!--printNeed 新模版名称类型接口字段-->
/**
 * 其它出库单 2001
 * **/
export const UnusualOut = {
  Name: '其它出库单',
  Type: 'UnusualOut',
  isEnable: true,
  Interface: '/abnormalOut/item',
  TemplateType: '2001',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'abnormalNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'type', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'innerOrder', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'innerOrderNote', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'reasonName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'outLocation', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'outArea', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'logistics', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'logisticsPerson', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'logisticsPhone', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'agentName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryTypeName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'settleTypeName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverPhone', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverFax', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'address', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'note', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'status', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'barcodeFlag', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'agreementFlag', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'agreementCode', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'createName', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'dept', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'applicationDate', isChecked: true, isHeader: false, isAloneRow: false }
    ],
    tbodyInfo: [
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsDes', isChecked: true },
      // { keyName: 'materialsType', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'defaultlocationCode', isChecked: true },
      // { keyName: 'enableNum', isChecked: true },
      { keyName: 'qty', isChecked: true },
      { keyName: 'realQty', isChecked: true },
      { keyName: 'status', isChecked: true }
    ]
  },
  TemplateUrl: 'view/print/templateTable.html',
  printTempBdDiction: {
    materialsNo: {
      Id: 'materialsNo',
      Key: 'materialsNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialsNo',
      widthRate: 1,
      testValue: 1
    },
    materialsDes: {
      Id: 'materialsDes',
      Key: 'materialsDes',
      Name: '物料描述',
      Alias: '',
      IsChecked: false,
      Value: 'materialsDes',
      widthRate: 4,
      testValue: '齿轮'
    },
    // materialsType: {
    //   Id: 'materialsType',
    //   Key: 'materialsType',
    //   Name: '物料分类',
    //   Alias: '',
    //   IsChecked: false,
    //   Value: 'materialsType',
    //   widthRate: 2.5,
    //   testValue: 'A分类'
    // },
    unit: {
      Id: 'unit',
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 2,
      testValue: 'EA'
    },
    defaultlocationCode: {
      Id: 'defaultlocationCode',
      Key: 'defaultlocationCode',
      Name: '默认储位',
      Alias: '',
      IsChecked: false,
      Value: 'defaultlocationCode',
      widthRate: 1
    },
    // enableNum: {
    //   Id: 'enableNum',
    //   Key: 'enableNum',
    //   Name: '可用库存',
    //   Alias: '',
    //   IsChecked: false,
    //   Value: 'enableNum',
    //   widthRate: 1
    // },
    qty: {
      Id: 'qty',
      Key: 'qty',
      Name: '出库数量',
      Alias: '',
      IsChecked: false,
      Value: 'qty',
      widthRate: 1,
      testValue: '1'
    },
    realQty: {
      Id: 'realQty',
      Key: 'realQty',
      Name: '实际出库数量',
      Alias: '',
      IsChecked: false,
      Value: 'realQty',
      widthRate: 2,
      testValue: '1'
    },
    status: {
      Id: 'status',
      Key: 'status',
      Name: '出库状态',
      Alias: '',
      IsChecked: false,
      Value: 'status',
      widthRate: 2,
      testValue: '20180101',
      pipe: 'stockOutStatus'
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      IsQrCode: true,
      Value: 'qrcode'
    },
    abnormalNo: {
      Key: 'abnormalNo',
      Name: '出库单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'abnormalNo'
    },
    type: {
      Key: 'type',
      Name: '出库类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'type'
    },
    innerOrder: {
      Key: 'innerOrder',
      Name: '部门编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'innerOrder'
    },
    innerOrderNote: {
      Key: 'innerOrderNote',
      Name: '部门名称',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'innerOrderNote'
    },
    reasonName: {
      Key: 'reasonName',
      Name: '产生原因',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'reasonName'
    },
    outLocation: {
      Key: 'outLocation',
      Name: '调出仓库',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'outLocation'
    },
    outArea: {
      Key: 'outArea',
      Name: '调出库区',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'outArea'
    },
    logistics: {
      Key: 'logistics',
      Name: '承运物流',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'logistics'
    },
    logisticsPerson: {
      Key: 'logisticsPerson',
      Name: '承运人',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'logisticsPerson'
    },
    logisticsPhone: {
      Key: 'logisticsPhone',
      Name: '联系方式',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'logisticsPhone'
    },
    agentName: {
      Key: 'agentName',
      Name: '客户',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'agentName'
    },
    deliveryTypeName: {
      Key: 'deliveryTypeName',
      Name: '发运方式',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'deliveryTypeName'
    },
    settleTypeName: {
      Key: 'settleTypeName',
      Name: '运费结算方式',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'settleTypeName'
    },
    receiverName: {
      Key: 'receiverName',
      Name: '收货人',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'receiverName'
    },
    receiverPhone: {
      Key: 'receiverPhone',
      Name: '收货人联系方式',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiverPhone'
    },
    receiverFax: {
      Key: 'receiverFax',
      Name: '传真',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'receiverFax'
    },
    address: {
      Key: 'address',
      Name: '收货地址',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'address'
    },
    note: {
      Key: 'note',
      Name: '备注',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'note'
    },
    status: {
      Key: 'status',
      Name: '出库状态',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'status',
      pipe: 'stockOutStatus'
    },
    barcodeFlag: {
      Key: 'barcodeFlag',
      Name: '是否条码管理',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'barcodeFlag',
      pipe: 'barcodeManage'
    },
    agreementFlag: {
      Key: 'agreementFlag',
      Name: '是否协议出库',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'agreementFlag',
      pipe: 'barcodeManage'
    },
    agreementCode: {
      Key: 'agreementCode',
      Name: '协议号',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'agreementCode'
    },
    createName: {
      Key: 'createName',
      Name: '制单人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createName'
    },
    dept: {
      Key: 'dept',
      Name: '制单部门',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'dept'
    },
    applicationDate: {
      Key: 'applicationDate',
      Name: '制单时间',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'applicationDate',
      pipe: 'date: yyyy-MM-dd HH:mm'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '1111111111111',
      abnormalNo: '12345678901234455667',
      type: '99999999999999999999',
      innerOrder: '0000001',
      innerOrderNote: 'ooo',
      reasonName: '否',
      outLocation: '调出仓库',
      outArea: '调出库区',
      status: 2,
      logistics: '否',
      logisticsPerson: '否',
      logisticsPhone: '1588878',
      agentName: '测试人员',
      deliveryTypeName: '测试人员',
      settleTypeName: '测试人员',
      receiverName: '测试人员',
      receiverPhone: '测试人员',
      receiverFax: '测试人员',
      address: '测试部',
      note: '备注12345',
      createName: '测试部',
      dept: '测试部',
      applicationDate: 1529913429589,
      barcodeFlag: 1,
      agreementFlag: 1,
      agreementCode: '协议号'
    },
    dataList: [{
      materialsNo: '95386',
      materialsDes: '测试物料1',
      // materialsType: '分类1',
      unit: '个',
      defaultlocationCode: '1-2-3',
      enableNum: 22,
      qty: 100,
      realQty: 100,
      status: 2
    }, {
      materialsNo: '910006',
      materialsDes: '测试物料2',
      // materialsType: '分类2',
      unit: '箱',
      defaultlocationCode: '1-2-3',
      enableNum: 22,
      qty: 200,
      realQty: 200,
      status: 2
    }]
  }
};
/**
 * 其它入库单 2003
 * **/
export const UnusualIn = {
  Name: '其它入库单',
  Type: 'UnusualIn',
  isEnable: true,
  Interface: '/abnormalIn/item',
  TemplateType: '2003',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isQrCode: true, isAloneRow: false },
      { keyName: 'abnormalNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'type', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'innerOrder', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'innerOrderNote', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'sapOrderDesc', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'inLocation', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'inArea', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'state', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'barcodeFlag', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'note', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'createName', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'dept', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'applicationDate', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'agreementFlag', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'agreementCode', isChecked: true, isHeader: false, isAloneRow: false },
      { keyName: 'customerName', isChecked: true, isHeader: false, isAllowRow: false}

    ],
    tbodyInfo: [
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsDes', isChecked: true },
      { keyName: 'materialsType', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'qty', isChecked: true },
      { keyName: 'realQty', isChecked: true },
      { keyName: 'state', isChecked: true }
    ]
  },
  printTempBdDiction: {
    materialsNo: {
      Id: 'materialsNo',
      Key: 'materialsNo',
      Name: '物料编号',
      Alias: '',
      IsChecked: false,
      Value: 'materialsNo',
      widthRate: 1,
      testValue: 1
    },
    materialsDes: {
      Id: 'materialsDes',
      Key: 'materialsDes',
      Name: '物料描述',
      Alias: '',
      IsChecked: false,
      Value: 'materialsDes',
      widthRate: 2,
      testValue: '齿轮'
    },
    materialsType: {
      Id: 'materialsType',
      Key: 'materialsType',
      Name: '物料分类',
      Alias: '',
      IsChecked: false,
      Value: 'materialsType',
      widthRate: 2,
      testValue: 'A分类'
    },
    unit: {
      Id: 'unit',
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 1,
      testValue: 'EA'
    },
    qty: {
      Id: 'qty',
      Key: 'qty',
      Name: '入库数量',
      Alias: '',
      IsChecked: false,
      Value: 'qty',
      widthRate: 1,
      testValue: '1'
    },
    realQty: {
      Id: 'realQty',
      Key: 'realQty',
      Name: '实际入库数量',
      Alias: '',
      IsChecked: false,
      Value: 'realQty',
      widthRate: 2,
      testValue: '1'
    },
    state: {
      Id: 'state',
      Key: 'state',
      Name: '入库状态',
      Alias: '',
      IsChecked: false,
      Value: 'state',
      widthRate: 1,
      testValue: '20180101',
      pipe: 'inventoryType'
    },
    remark: {
      Key: 'remark',
      Name: '备注',
      Alias: '',
      IsChecked: false,
      widthRate: 1,
      testValue: '备注'
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    abnormalNo: {
      Key: 'abnormalNo',
      Name: '申请单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'abnormalNo'
    },
    type: {
      Key: 'type',
      Name: '入库类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'type',
    },
    innerOrder: {
      Key: 'innerOrder',
      Name: '部门编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'innerOrder'
    },
    innerOrderNote: {
      Key: 'innerOrderNote',
      Name: '部门名称',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'innerOrderNote'
    },
    sapOrderDesc: {
      Key: 'sapOrderDesc',
      Name: '同步状态',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'sapOrderDesc'
    },
    note: {
      Key: 'note',
      Name: '原因',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'note'
    },
    inLocation: {
      Key: 'inLocation',
      Name: '领入仓库',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'inLocation'
    },
    inArea: {
      Key: 'inArea',
      Name: '领入库区',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'inArea'
    },
    state: {
      Key: 'state',
      Name: '入库状态',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'state',
      pipe: 'inventoryType'
    },
    barcodeFlag: {
      Key: 'barcodeFlag',
      Name: '是否条码管理',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'barcodeFlag',
      pipe: 'barcodeManage'
    },
    createName: {
      Key: 'createName',
      Name: '制单人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createName'
    },
    dept: {
      Key: 'dept',
      Name: '制单部门',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'dept'
    },
    applicationDate: {
      Key: 'applicationDate',
      Name: '制单时间',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'applicationDate',
      pipe: 'date: yyyy-MM-dd HH:mm'
    },
    agreementFlag: {
      Key: 'agreementFlag',
      Name: '是否协议入库',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'agreementFlag',
      pipe: 'barcodeManage'
    },
    agreementCode: {
      Key: 'agreementCode',
      Name: '协议号',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'agreementCode'
    },
    customerName: {
      key: 'customerName',
      Name: '客户',
      IsAloneRow: false,
      IsChecked: false,
      IsHeader: true,
      Value: 'customerName'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '1111111111111',
      abnormalNo: '12345678901234455667',
      type: '99999999999999999999',
      innerOrder: '0000001',
      innerOrderNote: 'ooo',
      synsapStatus: '否',
      inLocation: '调出仓库',
      inArea: '调出库区',
      state: 2,
      barcodeFlag: 1,
      note: '否',
      createName: '测试人员',
      dept: '测试人员',
      applicationDate: new Date(),
      agreementFlag: 1,
      agreementCode: '协议号',
      customerName: '客户名称'
    },
    dataList: [{
      materialsNo: '95386',
      materialsDes: '测试物料1',
      materialsType: '分类1',
      unit: '个',
      qty: 100,
      realQty: 100,
      state: 1
    }, {
      materialsNo: '910006',
      materialsDes: '测试物料2',
      materialsType: '分类2',
      unit: '吨',
      qty: 300,
      realQty: 200,
      state: 2
    }]
  }
};
/**
 * 采购退货单 3002
 * **/
export const ReturnApply = {
  Name: '采购退货单',
  Type: 'ReturnApply',
  isEnable: true,
  Interface: '/refund/item',
  TemplateType: '3002',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isQrCode: true },
      { keyName: 'refundCode', isChecked: true, isHeader: true },
      { keyName: 'contractNo', isChecked: true, isHeader: true },
      { keyName: 'warehouseCode', isChecked: true, isHeader: true },
      { keyName: 'areaCode', isChecked: true, isHeader: true },
      { keyName: 'barcodeFlag', isChecked: true, isHeader: true },
      { keyName: 'status', isChecked: true, isHeader: true },
      { keyName: 'createName', isChecked: true, isHeader: true },
      { keyName: 'createDate', isChecked: true, isHeader: true },
      { keyName: 'erpStatus', isChecked: true, isHeader: true }
    ],
    tbodyInfo: [
      { keyName: 'materialNo', isChecked: true },
      { keyName: 'erpNo', isChecked: true },
      { keyName: 'planRefundAmount', isChecked: true },
      { keyName: 'exeRefundAmount', isChecked: true },
      { keyName: 'status', isChecked: true },
      { keyName: 'erpStatus', isChecked: true },
      { keyName: 'erpProcessMessage', isChecked: true },
      { keyName: 'reason', isChecked: true }
    ]
  },
  printTempBdDiction: {

    materialNo: {
      Id: 'materialNo',
      Key: 'materialNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialNo',
      widthRate: 1,
      testValue: 1
    },
    erpNo: {
      Id: 'erpNo',
      Key: 'erpNo',
      Name: '接收号',
      Alias: '',
      IsChecked: false,
      Value: 'erpNo',
      widthRate: 4,
      testValue: '0000'
    },
    planRefundAmount: {
      Id: 'planRefundAmount',
      Key: 'planRefundAmount',
      Name: '退货数量',
      Alias: '',
      IsChecked: false,
      Value: 'planRefundAmount',
      widthRate: 1,
      testValue: 'EA'
    },
    exeRefundAmount: {
      Id: 'exeRefundAmount',
      Key: 'exeRefundAmount',
      Name: '已出库数量',
      Alias: '',
      IsChecked: false,
      Value: 'exeRefundAmount',
      widthRate: 1,
      testValue: '1'
    },
    status: {
      Id: 'status',
      Key: 'status',
      Name: '出库状态',
      Alias: '',
      IsChecked: false,
      Value: 'status',
      widthRate: 1,
      testValue: '1',
      pipe: 'returnState'
    },
    erpStatus: {
      Id: 'erpStatus',
      Key: 'erpStatus',
      Name: 'ERP状态',
      Alias: '',
      IsChecked: false,
      Value: 'erpStatus',
      widthRate: 1,
      testValue: '1',
      pipe: 'erpSync'
    },
    erpProcessMessage: {
      Id: 'erpProcessMessage',
      Key: 'erpProcessMessage',
      Name: 'ERP返回信息',
      Alias: '',
      IsChecked: false,
      Value: 'erpProcessMessage',
      widthRate: 1,
      testValue: '1'
    },
    reason: {
      Id: 'reason',
      Key: 'reason',
      Name: '原因',
      Alias: '',
      IsChecked: false,
      Value: 'reason',
      widthRate: 1,
      testValue: '1'
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      IsQrCode: true,
      Value: 'refundCode'
    },
    refundCode: {
      Key: 'refundCode',
      Name: '退货单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'refundCode'
    },
    contractNo: {
      Key: 'contractNo',
      Name: '合同号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'contractNo'
    },
    warehouseCode: {
      Key: 'warehouseCode',
      Name: '仓库',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'warehouseCode'
    },
    areaCode: {
      Key: 'areaCode',
      Name: '库区',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'areaCode'
    },
    barcodeFlag: {
      Key: 'barcodeFlag',
      Name: '是否按条码管理',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'barcodeFlag',
      pipe: 'barcodeManage'
    },
    status: {
      Key: 'status',
      Name: '出库状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'status',
      pipe: 'returnState'
    },
    createName: {
      Key: 'createName',
      Name: '制单人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createName'
    },
    createDate: {
      Key: 'createDate',
      Name: '制单时间',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createDate',
      pipe: 'date:yyyy-MM-dd HH:mm'
    },
    erpStatus: {
      Key: 'erpStatus',
      Name: 'ERP状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'erpStatus',
      pipe: 'erpSync'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '1111111111111',
      refundCode: '12345678901234455667',
      contractNo: '99999999999999999999',
      warehouseCode: '0000001',
      areaCode: 'ooo',
      barcodeFlag: 1,
      status: 1,
      createName: 'xwb',
      erpStatus: 1,
      createDate: new Date(),
    },
    dataList: [{
      materialNo: '95386',
      erpNo: '12121',
      planRefundAmount: 1,
      exeRefundAmount: 1,
      status: 1,
      erpStatus: 1,
      erpProcessMessage: '1111',
      reason: '11111'
    }, {
      materialNo: '910006',
      erpNo: '21212',
      planRefundAmount: 2,
      exeRefundAmount: 2,
      status: 2,
      erpStatus: 2,
      erpProcessMessage: '22222',
      reason: '22222'
    }]
  }
};
/**
 * 盘点单 2008
 * **/
export const Inventory = {
  Name: '盘点单',
  Type: 'Inventory',
  isEnable: true,
  Interface: '/inventoryCheck/printItem',
  TemplateType: '2008',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isQrCode: true },
      { keyName: 'checkOrderNo', isChecked: true, isHeader: true },
      { keyName: 'checkType', isChecked: true, isHeader: true },
      { keyName: 'warehouseCode', isChecked: true, isHeader: true },
      { keyName: 'locationCodesStr', isChecked: true, isHeader: true },
      // 保管员字段没有
      // { keyName: 'custodian', isChecked: true, isHeader: true },
      { keyName: 'checkOrderDes', isChecked: true, isHeader: true },
      { keyName: 'status', isChecked: true, isHeader: true },
      { keyName: 'plannedDate', isChecked: true, isHeader: true },
      { keyName: 'createName', isChecked: true, isHeader: true },
      { keyName: 'createDate', isChecked: true, isHeader: true },
      { keyName: 'startName', isChecked: true, isHeader: true },

    ],
    tbodyInfo: [
      { keyName: 'barCode', isChecked: true },
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsDes', isChecked: true },
      { keyName: 'loactionCode', isChecked: true },
      { keyName: 'sysAmount', isChecked: true },
      { keyName: 'actAmount', isChecked: true },
      { keyName: 'depositaryName', isChecked: true },
      { keyName: 'resultType', isChecked: true },
      { keyName: 'inventoryUserName', isChecked: true }
    ]
  },
  printTempBdDiction: {
    barCode: {
      Id: 'barCode',
      Key: 'barCode',
      Name: '盘点条码',
      Alias: '',
      IsChecked: false,
      Value: 'barCode',
      widthRate: 1
    },
    materialsNo: {
      Id: 'materialsNo',
      Key: 'materialsNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialsNo',
      widthRate: 1
    },
    materialsDes: {
      Id: 'materialsDes',
      Key: 'materialsDes',
      Name: '物料描述',
      Alias: '',
      IsChecked: false,
      Value: 'materialsDes',
      widthRate: 4
    },
    loactionCode: {
      Id: 'loactionCode',
      Key: 'loactionCode',
      Name: '储位',
      Alias: '',
      IsChecked: false,
      Value: 'loactionCode',
      widthRate: 1
    },
    sysAmount: {
      Id: 'sysAmount',
      Key: 'sysAmount',
      Name: '原始数量',
      Alias: '',
      IsChecked: false,
      Value: 'sysAmount',
      widthRate: 1
    },
    actAmount: {
      Id: 'actAmount',
      Key: 'actAmount',
      Name: '盘点数量',
      Alias: '',
      IsChecked: false,
      Value: 'actAmount',
      widthRate: 1
    },
    depositaryName: {
      Id: 'depositaryName',
      Key: 'depositaryName',
      Name: '保管员',
      Alias: '',
      IsChecked: false,
      Value: 'depositaryName',
      widthRate: 1
    },
    resultType: {
      Id: 'resultType',
      Key: 'resultType',
      Name: '盘点状态',
      Alias: '',
      IsChecked: false,
      Value: 'resultType',
      pipe: 'inventoryState',
      widthRate: 1
    },
    inventoryUserName: {
      Id: 'inventoryUserName',
      Key: 'inventoryUserName',
      Name: '盘点人',
      Alias: '',
      IsChecked: false,
      Value: 'inventoryUserName',
      widthRate: 1
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      IsQrCode: true,
      Value: 'checkOrderNo'
    },
    checkOrderNo: {
      Key: 'checkOrderNo',
      Name: '盘点单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'checkOrderNo'
    },
    checkType: {
      Key: 'checkType',
      Name: '盘点类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'checkType',
      pipe: 'checkType'
    },
    warehouseCode: {
      Key: 'warehouseCode',
      Name: '仓库',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'warehouseCode'
    },
    locationCodesStr: {
      Key: 'locationCodesStr',
      Name: '库区',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'locationCodesStr'
    },
    // custodian: {
    //   Key: 'custodian',
    //   Name: '保管员',
    //   IsAloneRow: false,
    //   IsChecked: true,
    //   IsHeader: true,
    //   Value: 'custodian'
    // },
    checkOrderDes: {
      Key: 'checkOrderDes',
      Name: '盘点描述',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'checkOrderDes'
    },
    status: {
      Key: 'status',
      Name: '盘点状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'status',
      pipe: 'inventoryState'
    },
    plannedDate: {
      Key: 'plannedDate',
      Name: '计划盘点日期',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'plannedDate',
      pipe: 'date:yyyy-MM-dd'
    },
    createName: {
      Key: 'createName',
      Name: '创建人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createName'
    },
    createDate: {
      Key: 'createDate',
      Name: '创建日期',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: false,
      Value: 'createDate',
      pipe: 'date:yyyy-MM-dd HH:mm'
    },
    startName: {
      Key: 'startName',
      Name: '启动人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'startName'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '1111111111111',
      checkOrderNo: '12345678901234455667',
      checkType: '1',
      warehouseCode: '99999999999999999999',
      locationCodesStr: '0000001',
      // custodian: '保管员',
      checkOrderDes: '盘点描述',
      status: '1',
      plannedDate: '11111111',
      createName: '15515515151515',
      createDate: '155151515115',
      startName: '启动人'
    },
    dataList: [{
      barCode: '95386',
      materialsNo: '测试物料1',
      materialsDes: '分类1',
      loactionCode: '个',
      sysAmount: 100,
      actAmount: 100,
      depositaryName: 1,
      resultType: 2,
      inventoryUserName: 3,
    }, {
      barCode: '910006',
      materialsNo: '测试物料2',
      materialsDes: '分类2',
      loactionCode: '吨',
      sysAmount: 300,
      actAmount: 200,
      depositaryName: 2,
      resultType: 2,
      inventoryUserName: 3,
    }]
  }
};
/**
 * 期初入库单 2010
 * **/
export const BeginningIn = {
  Name: '期初入库单',
  Type: 'BeginningIn',
  isEnable: true,
  Interface: '/initialInventory/item',
  TemplateType: '2010',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isQrCode: true },
      { keyName: 'billNo', isChecked: true, isHeader: true },
      { keyName: 'inLocation', isChecked: true, isHeader: true },
      { keyName: 'inArea', isChecked: true, isHeader: true },
      { keyName: 'state', isChecked: true, isHeader: true },
      { keyName: 'dept', isChecked: true, isHeader: true },
      { keyName: 'createName', isChecked: true, isHeader: true },
      { keyName: 'createDate', isChecked: true, isHeader: true }
    ],
    tbodyInfo: [
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsDes', isChecked: true },
      { keyName: 'totalQty', isChecked: true },
      { keyName: 'minPackQty', isChecked: true },
      { keyName: 'inNum', isChecked: true },
      { keyName: 'orawyd', isChecked: true },
      { keyName: 'vinId', isChecked: true },
      { keyName: 'state', isChecked: true },
      { keyName: 'initDate', isChecked: true }
    ]
  },
  printTempBdDiction: {
    materialsNo: {
      Id: 'materialsNo',
      Key: 'materialsNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialsNo',
      widthRate: 1,
      testValue: '1'
    },
    materialsDes: {
      Id: 'materialsDes',
      Key: 'materialsDes',
      Name: '物料描述',
      Alias: '',
      IsChecked: false,
      Value: 'materialsDes',
      widthRate: 1,
      testValue: '1'
    },
    totalQty: {
      Id: 'totalQty',
      Key: 'totalQty',
      Name: '入库总数量',
      Alias: '',
      IsChecked: false,
      Value: 'totalQty',
      widthRate: 4,
      testValue: '1'
    },
    minPackQty: {
      Id: 'minPackQty',
      Key: 'minPackQty',
      Name: '最小包装',
      Alias: '',
      IsChecked: false,
      Value: 'minPackQty',
      widthRate: 1,
      testValue: '1'
    },
    inNum: {
      Id: 'inNum',
      Key: 'inNum',
      Name: '实际入库数',
      Alias: '',
      IsChecked: false,
      Value: 'inNum',
      widthRate: 1,
      testValue: '1'
    },
    orawyd: {
      Id: 'orawyd',
      Key: 'orawyd',
      Name: '零件号/图号',
      Alias: '',
      IsChecked: false,
      Value: 'orawyd',
      widthRate: 1,
      testValue: '1'
    },
    vinId: {
      Id: 'vinId',
      Key: 'vinId',
      Name: 'VIN号',
      Alias: '',
      IsChecked: false,
      Value: 'vinid',
      widthRate: 1,
      testValue: '1'
    },
    state: {
      Id: 'state',
      Key: 'state',
      Name: '入库状态',
      Alias: '',
      IsChecked: false,
      Value: 'state',
      widthRate: 1,
      testValue: '1',
      pipe: 'state'
    },
    initDate: {
      Id: 'initDate',
      Key: 'initDate',
      Name: '原始入库时间',
      Alias: '',
      IsChecked: false,
      Value: 'initDate',
      widthRate: 1,
      testValue: '1',
      pipe: 'date:yyyy-MM-dd HH:mm'
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      IsQrCode: true,
      Value: 'qrcode'
    },
    billNo: {
      Key: 'billNo',
      Name: '入库单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      IsQrCode: true,
      Value: 'billNo'
    },
    inLocation: {
      Key: 'inLocation',
      Name: '仓库编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'inLocation'
    },
    inArea: {
      Key: 'inArea',
      Name: '库区编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'inArea'
    },
    state: {
      Key: 'state',
      Name: '入库状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'state',
      pipe: 'state'
    },
    createName: {
      Key: 'createName',
      Name: '制单人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: false,
      Value: 'createName'
    },
    dept: {
      Key: 'dept',
      Name: '制单部门',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'dept'
    },
    createDate: {
      Key: 'createDate',
      Name: '制单时间',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createDate',
      pipe: 'date: yyyy-MM-dd HH:mm'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '1111111111111',
      billNo: '12345678901234455667',
      inLocation: '0001cangku',
      inArea: '0001kuqu',
      state: 0,
      createName: 1529913429589,
      dept: '测试部',
      createDate: new Date(),
    },
    dataList: [{
      materialsNo: '95386',
      materialsDes: '测试物料1',
      totalQty: 10,
      minPackQty: 10,
      inNum: 22,
      orawyd: 100,
      vinid: 100,
      state: 0,
      initDate: new Date()
    }, {
      materialsNo: '95386',
      materialsDes: '测试物料1',
      totalQty: 10,
      minPackQty: 10,
      inNum: 22,
      orawyd: 100,
      vinid: 100,
      state: 0,
      initDate: new Date()
    }]
  }
};
export const RegionAllocation = {
  Name: '调拨单',
  Type: 'RegionAllocation',
  isEnable: true,
  Interface: '/regionAllot/item',
  TemplateType: '2005',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isQrCode: true },
      { keyName: 'allotOrder', isChecked: true, isHeader: true },
      { keyName: 'createName', isChecked: true, isHeader: true },
      { keyName: 'deptName', isChecked: true, isHeader: true },
      { keyName: 'createDate', isChecked: true, isHeader: true },
      { keyName: 'outLocation', isChecked: true, isHeader: true },
      { keyName: 'outArea', isChecked: true, isHeader: true },
      { keyName: 'barcodeFlag', isChecked: true, isHeader: true },
      { keyName: 'inLocation', isChecked: true, isHeader: true },
      { keyName: 'inArea', isChecked: true, isHeader: true },
      { keyName: 'agreementFlag', isChecked: true, isHeader: true },
      { keyName: 'agreementCode', isChecked: true, isHeader: true },
      /**还差4个字段 */
      { keyName: 'outState', isChecked: true, isHeader: true },
      { keyName: 'inState', isChecked: true, isHeader: true },
      { keyName: 'billStatus', isChecked: true, isHeader: true }
    ],
    tbodyInfo: [
      { keyName: 'materialNo', isChecked: true },
      { keyName: 'materialName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'enableNum', isChecked: true },
      { keyName: 'amount', isChecked: true },
      { keyName: 'outAmount', isChecked: true },
      { keyName: 'inAmount', isChecked: true },
      { keyName: 'remark', isChecked: true }
    ]
  },
  printTempBdDiction: {
    materialNo: {
      Id: 'materialNo',
      Key: 'materialNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialNo',
      widthRate: 1,
      testValue: '1'
    },
    materialName: {
      Id: 'materialName',
      Key: 'materialName',
      Name: '物料描述',
      Alias: '',
      IsChecked: false,
      Value: 'materialName',
      widthRate: 1,
      testValue: '1'
    },
    unit: {
      Id: 'unit',
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 4,
      testValue: '1'
    },
    enableNum: {
      Id: 'enableNum',
      Key: 'enableNum',
      Name: '实际库存',
      Alias: '',
      IsChecked: false,
      Value: 'enableNum',
      widthRate: 1,
      testValue: '1'
    },
    amount: {
      Id: 'amount',
      Key: 'amount',
      Name: '申请数量',
      Alias: '',
      IsChecked: false,
      Value: 'amount',
      widthRate: 1,
      testValue: '1'
    },
    outAmount: {
      Id: 'outAmount',
      Key: 'outAmount',
      Name: '调出完成数',
      Alias: '',
      IsChecked: false,
      Value: 'outAmount',
      widthRate: 1,
      testValue: '1'
    },
    inAmount: {
      Id: 'inAmount',
      Key: 'inAmount',
      Name: '调入完成数',
      Alias: '',
      IsChecked: false,
      Value: 'inAmount',
      widthRate: 1,
      testValue: '1'
    },
    remark: {
      Id: 'remark',
      Key: 'remark',
      Name: '备注',
      Alias: '',
      IsChecked: false,
      Value: 'remark',
      widthRate: 1
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    allotOrder: {
      Key: 'allotOrder',
      Name: '调拨单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      IsQrCode: true,
      Value: 'allotOrder'
    },
    createName: {
      Key: 'createName',
      Name: '制单人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: false,
      Value: 'createName'
    },
    deptName: {
      Key: 'deptName',
      Name: '制单部门',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deptName'
    },
    createDate: {
      Key: 'crcreateDateeateBillDate',
      Name: '制单时间',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createDate',
      pipe: 'date: yyyy-MM-dd HH:mm'
    },
    outLocation: {
      Key: 'outLocation',
      Name: '调出仓库',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'outLocation'
    },
    outArea: {
      Key: 'outArea',
      Name: '调出库区',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'outArea'
    },
    barcodeFlag: {
      Key: 'barcodeFlag',
      Name: '是否条码管理',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'barcodeFlag',
      pipe: 'barcodeManage'
    },
    inLocation: {
      Key: 'inLocation',
      Name: '调入仓库',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'inLocation'
    },
    inArea: {
      Key: 'inArea',
      Name: '调入库区',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'inArea'
    },
    agreementFlag: {
      Key: 'agreementFlag',
      Name: '是否协议调拨',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'agreementFlag',
      pipe: 'barcodeManage'
    },
    agreementCode: {
      Key: 'agreementCode',
      Name: '协议号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'agreementCode'
    },
    outState: {
      Key: 'outState',
      Name: '调出状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'outState',
      pipe: 'inOutState'
    },
    inState: {
      Key: 'inState',
      Name: '调入状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'inState',
      pipe: 'inOutState'
    },
    billStatus: {
      Key: 'billStatus',
      Name: '单据状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'billStatus',
      pipe: 'regionalAllocationBillStatus'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '12345678999999999',
      allotOrder: '123456789',
      createName: 1,
      deptName: '3333333333333333',
      createDate: '1538223891587',
      outLocation: '江西铜业',
      outArea: '江西铜业',
      barcodeFlag: 1,
      inLocation: '江西铜业',
      inArea: 1,
      agreementFlag: 1,
      agreementCode: '协议号',
      outState: 1,
      inState: 1,
      billStatus: 1
    },
    dataList: [{
      lineNum: 1,
      materialNo: '111',
      materialName: '拖拉机',
      unit: '个',
      enableNum: 111,
      amount: 222,
      outAmount: 333,
      inAmount: 444,
      remark: '备注'
    }, {
      lineNum: 2,
      materialNo: '111',
      materialName: '拖拉机',
      unit: '个',
      enableNum: 111,
      amount: 222,
      outAmount: 333,
      inAmount: 444,
      remark: '备注'
    }]
  }
};
export const InvoiceContact = {
  Name: '发票联系单',
  Type: 'InvoiceContact',
  isEnable: true,
  Interface: '/invoice/view',
  TemplateType: '3005',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'id', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'supplierName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'invoiceBillId', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'billNum', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'billAmount', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'rowAmount', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'taxAmount', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'billAccountNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'billBank', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'billBankAddress', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'transportFees', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'prepayments', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'warranty', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deduction', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'billCreateDate', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'warranty', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'description', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'approver', isChecked: true, isHeader: true, isAloneRow: false },
    ],
    tbodyInfo: [
      { keyName: 'rowNo', isChecked: true },
      { keyName: 'purchaseType', isChecked: true },
      { keyName: 'purchaseNo', isChecked: true },
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'quantity', isChecked: true },
      { keyName: 'toMatchQuantity', isChecked: true },
      { keyName: 'billWithoutaxPrice', isChecked: true },
      { keyName: 'rowAmount', isChecked: true },
      { keyName: 'taxCode', isChecked: true },
      { keyName: 'taxAmount', isChecked: true },
      { keyName: 'currencyType', isChecked: true },
      { keyName: 'unitPriceWithtax', isChecked: true },
      { keyName: 'totalAmount', isChecked: true },
      { keyName: 'unitPriceWithouttax', isChecked: true },
      { keyName: 'processor', isChecked: true },
    ]
  },
  printTempBdDiction: {
    rowNo: {
      Id: 'rowNo',
      Key: 'rowNo',
      Name: ' 行号',
      Alias: '',
      IsChecked: false,
      Value: 'rowNo',
      widthRate: 1
    },
    purchaseType: {
      Id: 'purchaseType',
      Key: 'purchaseType',
      Name: ' 类型',
      Alias: '',
      IsChecked: false,
      Value: 'VO_purchaseType',
      widthRate: 1
    },
    purchaseNo: {
      Id: 'purchaseNo',
      Key: 'purchaseNo',
      Name: ' 采购订单号',
      Alias: '',
      IsChecked: false,
      Value: 'VO_purchaseNo',
      widthRate: 1
    },
    materialsNo: {
      Id: 'materialsNo',
      Key: 'materialsNo',
      Name: ' 物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'VO_materialsNo',
      widthRate: 1
    },
    materialsName: {
      Id: 'materialsName',
      Key: 'materialsName',
      Name: '物料说明',
      Alias: '',
      IsChecked: false,
      Value: 'VO_materialsName',
      widthRate: 1
    },
    unit: {
      Id: 'unit',
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'VO_unit',
      widthRate: 1
    },
    quantity: {
      Id: 'quantity',
      Key: 'quantity',
      Name: '入库数量',
      Alias: '',
      IsChecked: false,
      Value: 'VO_quantity',
      widthRate: 1
    },
    toMatchQuantity: {
      Id: 'toMatchQuantity',
      Key: 'toMatchQuantity',
      Name: '本次开票数量',
      Alias: '',
      IsChecked: false,
      Value: 'VO_toMatchQuantity',
      widthRate: 1
    },
    billWithoutaxPrice: {
      Id: 'billWithoutaxPrice',
      Key: 'billWithoutaxPrice',
      Name: '开票不含税单价',
      Alias: '',
      IsChecked: false,
      Value: 'billWithoutaxPrice',
      widthRate: 1
    },
    rowAmount: {
      Id: 'rowAmount',
      Key: 'rowAmount',
      Name: '行金额',
      Alias: '',
      IsChecked: false,
      Value: 'rowAmount',
      widthRate: 1
    },
    taxCode: {
      Id: 'taxCode',
      Key: 'taxCode',
      Name: '税码',
      Alias: '',
      IsChecked: false,
      Value: 'VO_taxCode',
      widthRate: 1
    },
    taxAmount: {
      Id: 'taxAmount',
      Key: 'taxAmount',
      Name: '税额',
      Alias: '',
      IsChecked: false,
      Value: 'taxAmount',
      widthRate: 1
    },
    currencyType: {
      Id: 'currencyType',
      Key: 'currencyType',
      Name: '币种',
      Alias: '',
      IsChecked: false,
      Value: 'VO_currencyType',
      widthRate: 1
    },
    unitPriceWithtax: {
      Id: 'unitPriceWithtax',
      Key: 'unitPriceWithtax',
      Name: '实际开票含税单价',
      Alias: '',
      IsChecked: false,
      Value: 'unitPriceWithtax',
      widthRate: 1
    },
    totalAmount: {
      Id: 'totalAmount',
      Key: 'totalAmount',
      Name: '总金额',
      Alias: '',
      IsChecked: false,
      Value: 'totalAmount',
      widthRate: 1
    },
    unitPriceWithouttax: {
      Id: 'unitPriceWithouttax',
      Key: 'unitPriceWithouttax',
      Name: '采购订单单价',
      Alias: '',
      IsChecked: false,
      Value: 'VO_unitPriceWithouttax',
      widthRate: 1
    },
    processor: {
      Id: 'processor',
      Key: 'processor',
      Name: '采购业务员',
      Alias: '',
      IsChecked: false,
      Value: 'VO_processor',
      widthRate: 1
    },
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    id: {
      Key: 'id',
      Name: '发票联系单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'id'
    },
    supplierName: {
      Key: 'supplierName',
      Name: '供应商',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'supplierName'
    },
    invoiceBillId: {
      Key: 'invoiceBillId',
      Name: '发票编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'invoiceBillId'
    },
    billNum: {
      Key: 'billNum',
      Name: '发票张数',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'billNum'
    },
    billAmount: {
      Key: 'billAmount',
      Name: '发票金额',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'billAmount'
    },
    rowAmount: {
      Key: 'rowAmount',
      Name: '发票行金额合计',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'rowAmount'
    },
    taxAmount: {
      Key: 'taxAmount',
      Name: '发票税额合计',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'taxAmount'
    },
    billAccountNo: {
      Key: 'billAccountNo',
      Name: '收款单位账号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'billAccountNo'
    },
    billBank: {
      Key: 'billBank',
      Name: '收款单位开户行',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'billBank'
    },
    billBankAddress: {
      Key: 'billBankAddress',
      Name: '收款单位开户行地址',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'billBankAddress'
    },
    transportFees: {
      Key: 'transportFees',
      Name: '运杂费',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'transportFees'
    },
    prepayments: {
      Key: 'prepayments',
      Name: '减：预付款',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'prepayments'
    },
    warranty: {
      Key: 'warranty',
      Name: '暂扣：质保金',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'warranty'
    },
    deduction: {
      Key: 'deduction',
      Name: '减：扣款项',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deduction'
    },
    billCreateDate: {
      Key: 'billCreateDate',
      Name: '发票日期',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'billCreateDate'
    },
    approver: {
      Key: 'approver',
      Name: '待审批人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'approver'
    },
    description: {
      Key: 'description',
      Name: '描述 ',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'description'
    },
  },
  testData: {
    headerInfo: {
      qrcode: '1111111111111',
      id: '123456789',
      supplierName: '公司',
      invoiceBillId: '3333333333333333',
      billNum: 55,
      billAmount: 9999,
      rowAmount: 1000,
      taxAmount: 100,
      billAccountNo: '999999999999999',
      billBank: '中国银行',
      billBankAddress: '南京',
      transportFees: 1000,
      prepayments: 5000,
      warranty: 2000,
      deduction: 10,
      billCreateDate: 1533626253246,
      description: '描述',
      approver: '测试',
    },
    dataList: [{
      rowNo: '95386',
      purchaseType: '111',
      purchaseNo: '接收单',
      materialsNo: 100,
      materialsName: '22222222222222',
      unit: '333333333333',
      quantity: 11,
      toMatchQuantity: 100,
      billWithoutaxPrice: 2,
      rowAmount: 100,
      taxCode: '1111',
      taxAmount: '1111',
      currencyType: '1111',
      unitPriceWithtax: '1111',
      totalAmount: '1111',
      unitPriceWithouttax: '1111',
      processor: '1111',
    }, {
      rowNo: '95386',
      purchaseType: '111',
      purchaseNo: '接收单',
      materialsNo: 100,
      materialsName: '22222222222222',
      unit: '333333333333',
      quantity: 11,
      toMatchQuantity: 100,
      billWithoutaxPrice: 2,
      rowAmount: 100,
      taxCode: '1111',
      taxAmount: '1111',
      currencyType: '1111',
      unitPriceWithtax: '1111',
      totalAmount: '1111',
      unitPriceWithouttax: '1111',
      processor: '1111',
    }]
  }
};
/**
 * 发货单 3100
 * **/
export const DispatchBill = {
  Name: '发货单',
  Type: 'DispatchBill',
  isEnable: true,
  Interface: '/warehouseInvoice/view',
  TemplateType: '3100',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'invoiceNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'purchaseNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'contractType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'supplierName', isChecked: true, isHeader: true, isAloneRow: true },
      { keyName: 'goodsReceivor', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'consignee', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryPhone', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryAddress', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'logisticsNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'logisticsCompany', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryDate', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'logisticsContact', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'logisticsPhone', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'transportMode', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'containerNumber', isChecked: true, isHeader: true, isAloneRow: false},
      { keyName: 'licensePlate', isChecked: true, isHeader: true, isAloneRow: false }
    ],
    tbodyInfo: [
      { keyName: 'lineNum', isChecked: true },
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'ifCodeManage', isChecked: true },
      { keyName: 'deliveryCount', isChecked: true }
    ]
  },
  printTempBdDiction: {
    lineNum: {
      Key: 'lineNum',
      Name: '行号',
      Alias: '',
      IsChecked: false,
      Value: 'lineNum',
      widthRate: 1
    },
    materialsNo: {
      Key: 'materialsNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialsNo',
      widthRate: 1
    },
    materialsName: {
      Key: 'materialsName',
      Name: '物料名称',
      Alias: '',
      IsChecked: false,
      Value: 'materialsName',
      widthRate: 1
    },
    unit: {
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 1
    },
    ifCodeManage: {
      Key: 'ifCodeManage',
      Name: '是否条码管理',
      Alias: '',
      IsChecked: false,
      Value: 'ifCodeManage',
      widthRate: 1,
      pipe: 'barcodeManage'
    },
    deliveryCount: {
      Key: 'deliveryCount',
      Name: '本次发货数量',
      Alias: '',
      IsChecked: false,
      Value: 'deliveryCount',
      widthRate: 1
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    invoiceNo: {
      Key: 'invoiceNo',
      Name: '发货单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'invoiceNo'
    },
    deliveryType: {
      Key: 'deliveryType',
      Name: '发货类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deliveryType',
      pipe: 'deliverGoodsType'
    },
    purchaseNo: {
      Key: 'purchaseNo',
      Name: '合同编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'purchaseNo'
    },
    supplierName: {
      Key: 'supplierName',
      Name: '供应商',
      IsAloneRow: true,
      IsChecked: true,
      IsHeader: true,
      Value: 'supplierName'
    },
    goodsReceivor: {
      Key: 'goodsReceivor',
      Name: '收货方',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'goodsReceivor'
    },
    contractType: {
      Key: 'contractType',
      Name: '合同类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'contractType',
      pipe: 'contractType'
    },
    consignee: {
      Key: 'consignee',
      Name: '收货人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'consignee'
    },
    deliveryPhone: {
      Key: 'deliveryPhone',
      Name: '收货人电话',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deliveryPhone'
    },
    deliveryAddress: {
      Key: 'deliveryAddress',
      Name: '收货地址',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deliveryAddress'
    },
    logisticsNo: {
      Key: 'logisticsNo',
      Name: '物流单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'logisticsNo'
    },
    logisticsCompany: {
      Key: 'logisticsCompany',
      Name: '物流公司',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'logisticsCompany'
    },
    deliveryDate: {
      Key: 'deliveryDate',
      Name: '发货时间',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deliveryDate',
      pipe: 'date:yyyy-MM-dd HH:mm'
    },
    logisticsContact: {
      Key: 'logisticsContact',
      Name: '物流联系人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'logisticsContact'
    },
    logisticsPhone: {
      Key: 'logisticsPhone',
      Name: '物流联系电话',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'logisticsPhone'
    },
    transportMode: {
      Key: 'transportMode',
      Name: '运输方式',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'transportMode',
      pipe: 'transportMode'
    },
    containerNumber: {
      Key: 'containerNumber',
      Name: '发运箱数',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'containerNumber'
    },
    licensePlate: {
      Key: 'licensePlate',
      Name: '车牌号码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'licensePlate'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '12345678999999999',
      invoiceNo: '123456789',
      deliveryType: 1,
      purchaseNo: '3333333333333333',
      supplierName: 'bkr',
      goodsReceivor: 'jxty',
      contractType: 1,
      consignee: 100,
      deliveryPhone: '999999999999999',
      deliveryAddress: '中国银行',
      logisticsNo: '99999999999',
      logisticsCompany: 'shunfeng',
      deliveryDate: '1538271907989',
      logisticsContact: '小李',
      logisticsPhone: '11011',
      transportMode: 1,
      containerNumber: 8,
      licensePlate: '京A123456'
    },
    dataList: [
      {
        lineNum: 1,
        materialsNo: '111',
        materialsName: '拖拉机',
        unit: 100,
        ifCodeManage: 0,
        deliveryCount: 111
      }, {
        lineNum: 2,
        materialsNo: '111',
        materialsName: '拖拉机',
        unit: 100,
        ifCodeManage: 1,
        deliveryCount: 111
      }
    ]
  }
};
/**
 * 收货单 3101
 * **/
export const ReceivingBill = {
  Name: '收货单',
  Type: 'ReceivingBill',
  isEnable: true,
  Interface: '/warehouseInvoice/view',
  TemplateType: '3101',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'invoiceNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'purchaseNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'contractType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'status', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'supplierName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'goodsReceivor', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'businessEntity', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'creatorName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'ifCodeManage', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'createDate', isChecked: true, isHeader: true, isAloneRow: false }
    ],
    tbodyInfo: [
      { keyName: 'lineNum', isChecked: true },
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      // { keyName: 'orderCount', isChecked: true },
      { keyName: 'deliveryCount', isChecked: true },
      { keyName: 'billReceiptCount', isChecked: true }
    ]
  },
  printTempBdDiction: {
    lineNum: {
      Key: 'lineNum',
      Name: '行号',
      Alias: '',
      IsChecked: false,
      Value: 'lineNum',
      widthRate: 1
    },
    materialsNo: {
      Key: 'materialsNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialsNo',
      widthRate: 1
    },
    materialsName: {
      Key: 'materialsName',
      Name: '物料名称',
      Alias: '',
      IsChecked: false,
      Value: 'materialsName',
      widthRate: 1
    },
    unit: {
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 1
    },
    // orderCount: {
    //   Key: 'orderCount',
    //   Name: '订单数量',
    //   Alias: '',
    //   IsChecked: false,
    //   Value: 'orderCount',
    //   widthRate: 1
    // },
    deliveryCount: {
      Key: 'deliveryCount',
      Name: '发货数量',
      Alias: '',
      IsChecked: false,
      Value: 'deliveryCount',
      widthRate: 1
    },
    billReceiptCount: {
      Key: 'billReceiptCount',
      Name: '已验收数量',
      Alias: '',
      IsChecked: false,
      Value: 'billReceiptCount',
      widthRate: 1
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    invoiceNo: {
      Key: 'invoiceNo',
      Name: '收货单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'invoiceNo'
    },
    deliveryType: {
      Key: 'deliveryType',
      Name: '发货类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deliveryType',
      pipe: 'deliverGoodsType'
    },
    purchaseNo: {
      Key: 'purchaseNo',
      Name: '合同编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'purchaseNo'
    },
    status: {
      Key: 'status',
      Name: '单据状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'status',
      pipe: 'documentState'
    },
    supplierName: {
      Key: 'supplierName',
      Name: '供应商',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'supplierName'
    },
    goodsReceivor: {
      Key: 'goodsReceivor',
      Name: '收货方',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'goodsReceivor'
    },
    contractType: {
      Key: 'contractType',
      Name: '合同类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'contractType',
      pipe: 'agreementFlag'
    },
    ifCodeManage: {
      Key: 'ifCodeManage',
      Name: '是否条码管理',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'ifCodeManage',
      pipe: 'barcodeManage'
    },
    businessEntity: {
      Key: 'businessEntity',
      Name: '业务实体',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'businessEntity'
    },
    creatorName: {
      Key: 'creatorName',
      Name: '制单人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'creatorName'
    },
    createDate: {
      Key: 'createDate',
      Name: '制单时间',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createDate',
      pipe: 'date: yyyy-MM-dd HH:mm'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '12345678999999999',
      invoiceNo: '123456789',
      deliveryType: 1,
      purchaseNo: '3333333333333333',
      status: 1,
      supplierName: '江西铜业',
      goodsReceivor: '江西铜业',
      contractType: 1,
      businessEntity: '江西铜业',
      ifCodeManage: 1,
      creatorName: '江西铜业',
      createDate: '1538223891587',
    },
    dataList: [{
      lineNum: 1,
      materialsNo: '111',
      materialsName: '拖拉机',
      unit: '个',
      // orderCount: 1000,
      deliveryCount: 111,
      billReceiptCount: 111
    }, {
      lineNum: 2,
      materialsNo: '111',
      materialsName: '拖拉机',
      unit: '个',
      // orderCount: 1000,
      deliveryCount: 111,
      billReceiptCount: 111
    }]
  }
};
/**
 * 领料申请 3102
 * **/
export const PickingApply = {
  Name: '领料申请单',
  Type: 'PickingApply',
  isEnable: false,
  Interface: '/pickingApply/item',
  TemplateType: '3102',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'applyNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'orgName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'usage', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'materialType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'applyDepartment', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'section', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'plannerName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'needDate', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverNumber', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverAddress', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'applyName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'applyDate', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'status', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'outStatus', isChecked: true, isHeader: true, isAloneRow: false }
    ],
    tbodyInfo: [
      { keyName: 'rowNo', isChecked: true },
      { keyName: 'materialCode', isChecked: true },
      { keyName: 'materialName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'amountApply', isChecked: true },
      { keyName: 'amountOuted', isChecked: true },
      { keyName: 'status', isChecked: true }
    ]
  },
  printTempBdDiction: {
    rowNo: {
      Key: 'rowNo',
      Name: '行号',
      Alias: '',
      IsChecked: false,
      Value: 'rowNo',
      widthRate: 1
    },
    materialCode: {
      Key: 'materialCode',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialCode',
      widthRate: 1
    },
    materialName: {
      Key: 'materialName',
      Name: '物料名称',
      Alias: '',
      IsChecked: false,
      Value: 'materialName',
      widthRate: 1
    },
    unit: {
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 1
    },
    amountApply: {
      Key: 'amountApply',
      Name: '申请数量',
      Alias: '',
      IsChecked: false,
      Value: 'amountApply',
      widthRate: 1
    },
    amountOuted: {
      Key: 'amountOuted',
      Name: '已出库数量',
      Alias: '',
      IsChecked: false,
      Value: 'amountOuted',
      widthRate: 1
    },
    status: {
      Key: 'status',
      Name: '出库状态',
      Alias: '',
      IsChecked: false,
      Value: 'status',
      widthRate: 1,
      pipe: 'stockOutStatus'
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    applyNo: {
      Key: 'applyNo',
      Name: '领料申请单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'applyNo'
    },
    orgName: {
      Key: 'orgName',
      Name: '业务实体',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'orgName'
    },
    usage: {
      Key: 'usage',
      Name: '用途',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'usage'
    },
    materialType: {
      Key: 'materialType',
      Name: '物料类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'materialType',
      pipe: 'materialType2'
    },
    applyDepartment: {
      Key: 'applyDepartment',
      Name: '领料部门',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'applyDepartment'
    },
    section: {
      Key: 'section',
      Name: '工段',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'section'
    },
    plannerName: {
      Key: 'plannerName',
      Name: '计划员',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'plannerName'
    },
    needDate: {
      Key: 'needDate',
      Name: '需要日期',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'needDate',
      pipe: 'date:yyyy-MM-dd'
    },
    receiverName: {
      Key: 'receiverName',
      Name: '收货人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiverName'
    },
    receiverNumber: {
      Key: 'receiverNumber',
      Name: '收货人电话',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiverNumber'
    },
    receiverAddress: {
      Key: 'receiverAddress',
      Name: '收货地址',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiverAddress'
    },
    applyName: {
      Key: 'applyName',
      Name: '申请人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'applyName'
    },
    applyDate: {
      Key: 'applyDate',
      Name: '申请日期',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'applyDate',
      pipe: 'date:yyyy-MM-dd'
    },
    status: {
      Key: 'status',
      Name: '审批状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'status',
      pipe: 'auditApproveStatus'
    },
    outStatus: {
      Key: 'outStatus',
      Name: '出库状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'outStatus',
      pipe: 'stockOutStatus'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '12345678999999999',
      applyNo: '123456789',
      orgName: '公司',
      usage: '3333333333333333',
      materialType: 1,
      applyDepartment: 'bkr',
      section: 9999,
      plannerName: 1000,
      needDate: '1538223891587',
      receiverName: '999999999999999',
      receiverNumber: '11011',
      receiverAddress: '中国银行',
      applyName: '中国银行',
      applyDate: '1538223891587',
      status: 1,
      outStatus: 1
    },
    dataList: [{
      rowNo: 1,
      materialCode: '111',
      materialName: '拖拉机',
      unit: '个',
      amountApply: 1000,
      amountOuted: 111,
      status: 1
    }, {
      rowNo: 2,
      materialCode: '111',
      materialName: '拖拉机',
      unit: '个',
      amountApply: 1000,
      amountOuted: 111,
      status: 1
    }]
  }
};
/**
 * 领料出库 3103
 * **/
export const PickingDelivery = {
  Name: '领料出库单',
  Type: 'PickingDelivery',
  isEnable: true,
  Interface: '/pickingOut/item',
  TemplateType: '3103',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'pickingNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'type', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'applyDepartment', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'section', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'keeperName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'outStatus', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'orgName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'plannerName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'barcodeFlag', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'isDistribution', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'distributionNum', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'createName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'createDate', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverNumber', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiverAddress', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'customerName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'agreementFlag', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'agreementType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'agreementCode', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'storageOrgName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'erpFlag', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'erpOutNo', isChecked: true, isHeader: true, isAloneRow: false },

    ],
    tbodyInfo: [
      { keyName: 'rowNo', isChecked: true },
      { keyName: 'materialCode', isChecked: true },
      { keyName: 'materialName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'planPrice', isChecked: true},
      { keyName: 'warehouseCode', isChecked: true },
      { keyName: 'amountApply', isChecked: true },
      { keyName: 'pickNum', isChecked: true },
      { keyName: 'status', isChecked: true },
      { keyName: 'needDate', isChecked: true },
      { keyName: 'actualQuantity', isChecked: true }
    ]
  },
  printTempBdDiction: {
    rowNo: {
      Key: 'rowNo',
      Name: '行号',
      Alias: '',
      IsChecked: false,
      Value: 'rowNo',
      widthRate: 1
    },
    materialCode: {
      Key: 'materialCode',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialCode',
      widthRate: 1
    },
    materialName: {
      Key: 'materialName',
      Name: '物料名称',
      Alias: '',
      IsChecked: false,
      Value: 'materialName',
      widthRate: 1
    },
    unit: {
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 1
    },
    planPrice: {
      key: 'planPrice',
      Name: '计划价',
      Alias: '',
      IsChecked: false,
      Value: 'planPrice',
      widthRate: 1
    },
    warehouseCode: {
      Key: 'warehouseCode',
      Name: '储位',
      Alias: '',
      IsChecked: false,
      Value: 'warehouseCode',
      widthRate: 1
    },
    amountApply: {
      Key: 'amountApply',
      Name: '出库数量',
      Alias: '',
      IsChecked: false,
      Value: 'amountApply',
      widthRate: 1
    },
    pickNum: {
      Key: 'pickNum',
      Name: '已出库数量',
      Alias: '',
      IsChecked: false,
      Value: 'pickNum',
      widthRate: 1
    },
    status: {
      Key: 'status',
      Name: '状态',
      Alias: '',
      IsChecked: false,
      Value: 'status',
      widthRate: 1,
      pipe: 'stockOutStatus'
    },
    needDate: {
      Key: 'needDate',
      Name: '需要日期',
      Alias: '',
      IsChecked: false,
      Value: 'needDate',
      widthRate: 1,
      pipe: 'date:yyyy-MM-dd'
    },
    actualQuantity: {
      Key: 'actualQuantity',
      Name: '实发数量',
      Alias: '',
      IsChecked: false,
      Value: 'actualQuantity',
      widthRate: 1,
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    pickingNo: {
      Key: 'pickingNo',
      Name: '领料出库单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'pickingNo'
    },
    type: {
      Key: 'type',
      Name: '出库类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'type'
    },
    applyDepartment: {
      Key: 'applyDepartment',
      Name: '领料部门',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'applyDepartment'
    },
    section: {
      Key: 'section',
      Name: '工段',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'section'
    },
    keeperName: {
      Key: 'keeperName',
      Name: '保管员',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'keeperName'
    },
    outStatus: {
      Key: 'outStatus',
      Name: '出库状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'outStatus',
      pipe: 'stockOutStatus'
    },
    orgName: {
      Key: 'orgName',
      Name: '业务实体',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'orgName'
    },
    plannerName: {
      Key: 'plannerName',
      Name: '计划员',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'plannerName'
    },
    barcodeFlag: {
      Key: 'barcodeFlag',
      Name: '是否条码管理',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'barcodeFlag',
      pipe: 'barcodeManage'
    },
    isDistribution: {
      Key: 'isDistribution',
      Name: '是否配送',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'isDistribution',
      pipe: 'isDistribution'
    },
    distributionNum: {
      Key: 'distributionNum',
      Name: '领料配送单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'distributionNum'
    },
    createName: {
      Key: 'createName',
      Name: '添加人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createName'
    },
    createDate: {
      Key: 'createDate',
      Name: '申请日期',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createDate',
      pipe: 'date:yyyy-MM-dd'
    },
    receiverName: {
      Key: 'receiverName',
      Name: '收货人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiverName'
    },
    receiverNumber: {
      Key: 'receiverNumber',
      Name: '收货人电话',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiverNumber'
    },
    receiverAddress: {
      Key: 'receiverAddress',
      Name: '收货地址',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiverAddress'
    },
    customerName: {
      Key: 'customerName',
      Name: '客户',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'customerName'
    },
    agreementFlag: {
      Key: 'agreementFlag',
      Name: '是否协议',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'agreementFlag',
      pipe: 'isAgreement'
    },
    agreementType: {
      Key: 'agreementType',
      Name: '协议类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'agreementType',
      pipe: 'agreementType'
    },
    agreementCode: {
      Key: 'agreementCode',
      Name: '协议号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'agreementCode'
    },
    storageOrgName: {
      Key: 'storageOrgName',
      Name: '代储供应商',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'storageOrgName'
    },
    erpFlag: {
      Key: 'erpFlag',
      Name: 'ERP同步',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'erpFlag',
      pipe: 'pickingOutSearchErpSync'
    },
    erpOutNo: {
      Key: 'erpOutNo',
      Name: 'ERP出库单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'erpOutNo'
    },
  },
  testData: {
    headerInfo: {
      qrcode: '12345678999999999',
      pickingNo: '123456789',
      type: '入库类型',
      applyDepartment: 'bkr',
      section: 9999,
      keeperName: '徐',
      outStatus: 0,
      receiverName: '999999999999999',
      receiverNumber: '11011',
      receiverAddress: '中国银行',
      customerName: '大客户',
      orgName: '公司',
      plannerName: 1000,
      barcodeFlag: 1,
      isDistribution: 1,
      distributionNum: '1111',
      createName: '文',
      createDate: '1538223891587',
      agreementFlag: 0,
      agreementType: 0,
      agreementCode: 'xy',
      storageOrgName: '代储代销',
      erpFlag: 0,
      erpOutNo: '1111'
    },
    dataList: [{
      rowNo: 1,
      materialCode: '111',
      materialName: '拖拉机',
      unit: '个',
      planPrice: 1,
      warehouseCode: '仓库1',
      amountApply: 111,
      pickNum: 111,
      status: 1,
      needDate: '1538223891587',
      actualQuantity: 2
    }, {
      rowNo: 2,
      materialCode: '111',
      materialName: '拖拉机',
      unit: '个',
      planPrice: 2,
      warehouseCode: '仓库1',
      amountApply: 111,
      pickNum: 111,
      status: 1,
      needDate: '1538223891587',
      actualQuantity: 2
    }]
  }
};
/**
 * 入库单 3104
 */
export const WarehouseStockIn = {
  Name: '入库单',
  Type: 'WarehouseStockIn',
  isEnable: true,
  Interface: '/WarehouseStockIn/item',
  TemplateType: '3104',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'inNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'invoiceNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'contractNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'inType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'supplierName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'receiveName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'status', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'barcodeFlag', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'keeperName', isChecked: true, isHeader: true, isAloneRow: false }
    ],
    tbodyInfo: [
      { keyName: 'lineNum', isChecked: true },
      { keyName: 'materialCode', isChecked: true },
      { keyName: 'materialName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      { keyName: 'amountTotal', isChecked: true },
      { keyName: 'amountIn', isChecked: true },
      { keyName: 'locationCode', isChecked: true }
    ]
  },
  printTempBdDiction: {
    lineNum: {
      Key: 'lineNum',
      Name: '行号',
      Alias: '',
      IsChecked: false,
      Value: 'lineNum',
      widthRate: 1
    },
    materialCode: {
      Key: 'materialCode',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialCode',
      widthRate: 1
    },
    materialName: {
      Key: 'materialName',
      Name: '物料名称',
      Alias: '',
      IsChecked: false,
      Value: 'materialName',
      widthRate: 1
    },
    unit: {
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 1
    },
    amountTotal: {
      Key: 'amountTotal',
      Name: '验收数量',
      Alias: '',
      IsChecked: false,
      Value: 'amountTotal',
      widthRate: 1
    },
    amountIn: {
      Key: 'amountIn',
      Name: '本单已入库数量',
      Alias: '',
      IsChecked: false,
      Value: 'amountIn',
      widthRate: 1
    },
    locationCode: {
      Key: 'locationCode',
      Name: '储位',
      Alias: '',
      IsChecked: false,
      Value: 'locationCode',
      widthRate: 1
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    inNo: {
      Key: 'inNo',
      Name: '入库单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'inNo'
    },
    invoiceNo: {
      Key: 'invoiceNo',
      Name: '收货单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'invoiceNo'
    },
    deliveryType: {
      Key: 'deliveryType',
      Name: '发货类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deliveryType',
      pipe: 'deliverGoodsType'
    },
    contractNo: {
      Key: 'contractNo',
      Name: '合同编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'contractNo'
    },
    inType: {
      Key: 'inType',
      Name: '合同类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'inType',
      pipe: 'agreementFlag'
    },
    supplierName: {
      Key: 'supplierName',
      Name: '供应商',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'supplierName'
    },
    receiveName: {
      Key: 'receiveName',
      Name: '收货方',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'receiveName'
    },
    status: {
      Key: 'status',
      Name: '状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'status',
      pipe: 'inventoryType'
    },
    barcodeFlag: {
      Key: 'barcodeFlag',
      Name: '是否条码管理',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'barcodeFlag',
      pipe: 'barcodeManage'
    },
    keeperName: {
      Key: 'keeperName',
      Name: '保管员',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'keeperName'
    }
  },
  testData: {
    headerInfo: {
      qrcode: '12345678999999999',
      inNo: '123456789',
      invoiceNo: '123456789',
      deliveryType: 1,
      contractNo: '3333333333333333',
      inType: 1,
      supplierName: '江西铜业',
      receiveName: '江西铜业2',
      status: 1,
      barcodeFlag: 1,
      keeperName: 'xxxxxx',
    },
    dataList: [{
      lineNum: 1,
      materialCode: '111',
      materialName: '拖拉机',
      unit: '个',
      amountTotal: 1000,
      amountIn: 111,
      locationCode: 111
    }, {
      lineNum: 2,
      materialCode: '111',
      materialName: '拖拉机2',
      unit: '个',
      amountTotal: 1000,
      amountIn: 111,
      locationCode: 111
    }]
  }
};
/**
 * 入库通知单 3105
 * **/
export const warehouseWarrantNotice = {
  Name: '入库通知单',
  Type: 'ReceivingBill',
  isEnable: true,
  Interface: '/warehouseInvoice/view',
  TemplateType: '3105',
  defaultTemplate: {
    headerInfo: [
      { keyName: 'qrcode', isChecked: true, isHeader: true, isAloneRow: false, isQrCode: true },
      { keyName: 'invoiceNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'deliveryType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'purchaseNo', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'contractType', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'status', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'supplierName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'goodsReceivor', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'businessEntity', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'creatorName', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'ifCodeManage', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'createDate', isChecked: true, isHeader: true, isAloneRow: false },
      { keyName: 'keeperName', isChecked: true, isHeader: true, isAloneRow: false }
    ],
    tbodyInfo: [
      { keyName: 'lineNum', isChecked: true },
      { keyName: 'materialsNo', isChecked: true },
      { keyName: 'materialsName', isChecked: true },
      { keyName: 'unit', isChecked: true },
      // { keyName: 'orderCount', isChecked: true },
      { keyName: 'deliveryCount', isChecked: true },
      { keyName: 'billReceiptCount', isChecked: true },
      { keyName: 'totalStoredCount', isChecked: true}
    ]
  },
  printTempBdDiction: {
    lineNum: {
      Key: 'lineNum',
      Name: '行号',
      Alias: '',
      IsChecked: false,
      Value: 'lineNum',
      widthRate: 1
    },
    materialsNo: {
      Key: 'materialsNo',
      Name: '物料编码',
      Alias: '',
      IsChecked: false,
      Value: 'materialsNo',
      widthRate: 1
    },
    materialsName: {
      Key: 'materialsName',
      Name: '物料名称',
      Alias: '',
      IsChecked: false,
      Value: 'materialsName',
      widthRate: 1
    },
    unit: {
      Key: 'unit',
      Name: '单位',
      Alias: '',
      IsChecked: false,
      Value: 'unit',
      widthRate: 1
    },
    // orderCount: {
    //   Key: 'orderCount',
    //   Name: '订单数量',
    //   Alias: '',
    //   IsChecked: false,
    //   Value: 'orderCount',
    //   widthRate: 1
    // },
    deliveryCount: {
      Key: 'deliveryCount',
      Name: '发货数量',
      Alias: '',
      IsChecked: false,
      Value: 'deliveryCount',
      widthRate: 1
    },
    billReceiptCount: {
      Key: 'billReceiptCount',
      Name: '已验收数量',
      Alias: '',
      IsChecked: false,
      Value: 'billReceiptCount',
      widthRate: 1
    },
    totalStoredCount: {
      Key: 'totalStoredCount',
      Name: '入库数量',
      Alias: '',
      IsChecked: false,
      Value: 'totalStoredCount',
      widthRate: 1
    }
  },
  cacheHeaderFootDiction: {
    qrcode: {
      Key: 'qrcode',
      Name: '二维码',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'qrcode'
    },
    invoiceNo: {
      Key: 'invoiceNo',
      Name: '收货单号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'invoiceNo'
    },
    deliveryType: {
      Key: 'deliveryType',
      Name: '发货类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'deliveryType',
      pipe: 'deliverGoodsType'
    },
    purchaseNo: {
      Key: 'purchaseNo',
      Name: '合同编号',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'purchaseNo'
    },
    status: {
      Key: 'status',
      Name: '单据状态',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'status',
      pipe: 'documentState'
    },
    supplierName: {
      Key: 'supplierName',
      Name: '供应商',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'supplierName'
    },
    goodsReceivor: {
      Key: 'goodsReceivor',
      Name: '收货方',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'goodsReceivor'
    },
    contractType: {
      Key: 'contractType',
      Name: '合同类型',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'contractType',
      pipe: 'agreementFlag'
    },
    ifCodeManage: {
      Key: 'ifCodeManage',
      Name: '是否条码管理',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'ifCodeManage',
      pipe: 'barcodeManage'
    },
    businessEntity: {
      Key: 'businessEntity',
      Name: '业务实体',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'businessEntity'
    },
    creatorName: {
      Key: 'creatorName',
      Name: '制单人',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'creatorName'
    },
    createDate: {
      Key: 'createDate',
      Name: '制单时间',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'createDate',
      pipe: 'date: yyyy-MM-dd HH:mm'
    },
    keeperName: {
      Key: 'keeperName',
      Name: '保管员',
      IsAloneRow: false,
      IsChecked: true,
      IsHeader: true,
      Value: 'keeperName'
    },
  },
  testData: {
    headerInfo: {
      qrcode: '12345678999999999',
      invoiceNo: '123456789',
      deliveryType: 1,
      purchaseNo: '3333333333333333',
      status: 1,
      supplierName: '江西铜业',
      goodsReceivor: '江西铜业',
      contractType: 1,
      businessEntity: '江西铜业',
      ifCodeManage: 1,
      creatorName: '江西铜业',
      createDate: '1538223891587',
      keeperName: '保管员'
    },
    dataList: [{
      lineNum: 1,
      materialsNo: '111',
      materialsName: '拖拉机',
      unit: '个',
      // orderCount: 1000,
      deliveryCount: 111,
      billReceiptCount: 111,
      totalStoredCount: 88
    }, {
      lineNum: 2,
      materialsNo: '111',
      materialsName: '拖拉机',
      unit: '个',
      // orderCount: 1000,
      deliveryCount: 111,
      billReceiptCount: 111,
      totalStoredCount: 99
    }]
  }
};
/**
 * 打印模板列表
 * **/
export const PrintTmplate = [
  {
    title: '入库单模板',
    color: '#00c609',
    list: [BeginningIn, UnusualIn, WarehouseStockIn]
  }, {
    title: '出库单模板',
    color: '#e80000',
    list: [UnusualOut, PickingDelivery, ReturnApply]
  }, {
    title: '其他模板',
    color: '#0084e8',
    list: [Inventory, DispatchBill, ReceivingBill, RegionAllocation, warehouseWarrantNotice]
  }
];


