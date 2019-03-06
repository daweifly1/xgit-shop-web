/*****
 开发环境配置
 开发构建命令(以下命令等效)：
 ng build --target=development --environment=dev
 ng build --dev --e=dev
 ng build --dev
 ng build
 ****/

export const webServerUrl = 'http://127.0.0.1:4202/site';
export const gatewayKey = {
  Ius: 'ius',
  /**
   * 资讯配置
   */
  Web: 'web',
  /**
   * 基础服务
   */
  Bs: 'bs',
  /**
   * 仓储
   */
  Ss: 'ss',
  /**
   * 采购
   * */
  Ps: 'ps',
  /**
   * 审批流
   * */
  Flow: 'flow'
};

export const environment = {
  production: false,
  baseUrl: {
    ius: `${webServerUrl}/ius`,
    web: `${webServerUrl}/web`,
    bs: `${webServerUrl}/bs`,
    ps: `${webServerUrl}/ps`,
    ss: `${webServerUrl}/ss`,
    flow: `${webServerUrl}/flow`
  },
  otherData: {
    sysRole: 0,
    sysSite: '0',
    fileUrl: `${webServerUrl}/fileService`,
    fileServiceUrl: `${webServerUrl}/img/`,    // 文件服务器
    signPluginDownloadUrl: `${webServerUrl}/img/jxtyPublicFile/TrustSignPDFPlugin.Standard.exe`,     // 签章控件下载地址
    defaultPath: '/main/workBoard',                  // 门户地址
    searchInputMaxLen: 200,
    moneyDec: 2,                                // 金额小数位数
    moneyMin: 0.01,                             // 金额最小值
    moneyMax: 9999999999.99,                    // 金额最大值
    materialNumDec: 5,                          // 物料数量小数位数
    materialNumMin: 0.00001,                    // 物料数量最小值
    materialNumMax: 9999999999.99999,            // 物料数量最大值
    managerId: '81',
    factoryId: '82',
    signTimestampServer: '10.99.102.199',
    supplierRelationshipUrl: `http://std.tianyancha.com/cloud-std-security/aut/login.json?
    username=18501404386&authId=2650&sign=ebbab93a859a31b77df8d8b41ec40d43&redirectUrl=/found/`
  }
};
export const localDataKeyObj = {
  barcodePrinterKey: 'jx_copper_selected_barcode_printer',
  invoicePrinterKey: 'jx_copper_selected_invoice_printer',
  invoiceContactPrintDir: 'invoice_contact_print_Dir'
};
