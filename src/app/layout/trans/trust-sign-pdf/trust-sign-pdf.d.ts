/**
 * CFCA TrustSignPDF 浏览器控件
 * 浏览器支持：IE6-IE11
 */
export interface TrustSignPdf {
  /**
   * 获取最后一次错误信息
   * */
  GetLastErrorDesc(): string;
  /**
   * 在控件创建之前，控制工具栏中是否显示“另存为”按钮。true：显示；false：隐藏。
   */
  showSaveAs: boolean;
  /**
   * 在控件创建之前，控制工具栏中是否显示“打印”按钮。true：显示；false：隐藏。
   */
  showPrint: boolean;

  /**
   * 在控件创建完成后，控制是否显示控件工具栏。
   */
  ToggleToolbar(value: boolean): void;

  /**
   * 在控件创建完成后，控制工具栏中是否显示“另存为”按钮。
   */
  ToggleButton_SaveAs(value: boolean): void;

  /**
   * 在控件创建完成后，控制工具栏中是否显示“打印”按钮
   * */
  ToggleButton_Print(value: boolean): void;

  /**
   * 打一个本地的PDF文件。
   */
  OpenLocalFile(path: string): void;

  /**
   * 下载并打一个服务器上的PDF文件，支持HTTP、HTTPS两个协议。
   */
  OpenWebFile(url: string, cookie?: string): void;

  /**
   * 把当前打开的文件上传到指定的服务器地址。
   */
  UploadCurrentFile(url: string, cookie?: string): any;

  /**
   * 获取当前打开文件的文件路径*/
  GetFilePath(): string;

  /**
   * 关闭当前文档
   * */
  CloseFile(): void;

  /**
   * 获取文档的总页数
   * */
  GetPageCount(): number;

  /**
   * 获取当前页码
   * 注意：此处返回的是实际物理页数，而不是文档页脚上显示的页码。
   */
  GetCurrentPageNo(): number;

  /**
   * 跳转到指定页
   * */
  GoToPage(pageNo: number): void;

  /**
   * 跳转到上一页
   * */
  GoToPrevPage(): void;

  /**
   * 下一页*/
  GoToNextPage(): void;

  /**
   * 第一页*/
  GoToFirstPage(): void;

  /**
   * 最后一页*/
  GoToLastPage(): void;

  /**
   * 缩小页面*/
  ZoomOut(): void;

  /**
   * 放大页面*/
  ZoomIn(): void;

  /**
   * 缩放到指定倍率。
   * 缩放倍率，最小值10，最大值6400。例如，传入80代表绽放到80%。
   两个特殊参数值含义：
   -1：代表“单页模式”显示。
   -2：代表“适合宽度”显示。
   */
  ZoomTo(rate: number): void;

  /**
   * 获取当前缩放倍率
   * 例如，返回100代表当前是100%显示。
   */
  ZoomValue(): number;

  /**---------------------证书操作--------------------*/

  /**
   * 从系统证书库中选择一张用于签名的证书。符合条件的证书如果有多张，则弹出证书选择框让用户选择，如果仅有一张，则默认选中。
   * 参数：
   strSubjectFilter：
   证书主题DN中包含的关键字，模糊匹配；如果传””则忽略此条件。
   strIssuerFilter：
   证书颁发者DN中包含的关键字，模糊匹配；如果传””则忽略此条件。
   例如，传入“CFCA”
   strCertSN：
   证书序列号，精确匹配；如果传””则忽略此条件。
   strAlgorithm：
   证书算法过滤条件，传入“RSA”或“SM2”，如果传””则忽略此条
   件。
   */
  SelectSignCert(strSubjectFilter: string, strIssuerFilter: string, strCertSN: string, strAlgorithm: string): void;

  /**
   * 设置一张用于签名的软证书。目前仅支持RSA算法pfx
   * strBase64PrivCert: Base64编码的pfx文
   * strPassword: Pfx文件的密码。
   * */
  SetSignCert(strBase64PrivCert: any, strPassword: string): void;

  /**
   * 获取SelectSignCert()或SetSignCert()函数所指定证书的信息。
   * 参数：
   strInfoType：
   信息类型，支持以下种类：
   "SubjectCN"：证书持有者CN。
   "SubjectDN"：证书持有者DN。
   "IssuerDN"：证书颁发者DN。
   "SerialNumber"：证书序列号。
   "ValidFrom"：证书有效起始日期（本地时间）。
   "ValidTo"：证书有效截止日期（本地时间）。
   "UTCValidFrom"：证书有效起始日期（UTC时间）。
   "UTCValidTo"：证书有效截止日期（UTC时间）。
   "CSPName"：证书所在CSP名称。
   "CertAlgorithm"：证书算法，“RSA”或“SM2”。
   "CertContent"：Base64编码的公钥证书。
   返回值：
   pstrInfoContent：
   返回证书的对应信息内容。
   */
  GetSignCertInfo(strInfoType: string): string;

  /**
   * 触发用户操作，调用此函数后，系统光标变成十字光标，等待用户在
   PDF文档合适位置拖拽一个用于放置签名的矩形区域。
   用户拖拽完成后，控件会发出NotifyDragRect事件，通知JavaScript用
   户当前选择的矩形区域所在页码，及矩形区域左上角和右下角的页内
   坐标。
   此函数通常和SignFile_Text()函数配合使用
   * */
  DragToPlaceSignature(): void;

  /**
   * 触发用户操作，调用此函数后，系统光标变成印章光标，等待用户在
   PDF文档的合适位置点击选择一个用于放置签名的中心点，以此点为
   中心放置印章图像。
   用户拖拽完成后，控件会发出NotifyClickPoint事件，通知JavaScript用
   户当前选择的点所在页码，及点的页内坐标。
   此函数通常和SignFile_Image()或SignFile_KeyImage()函数配合使用。
   * */
  ClickToPlaceSignature(): void;

  /**
   * 取消鼠标光标的签名状态。
   当调用DragToPlaceSignature()或ClickToPlaceSignature()函数，控件进入
   签名状态（鼠标光标变成十字光标或印章光标），可以调用
   ResetMouseAction()函数重置鼠标光标退出签名状态。
   * */
  ResetMouseAction(): void;

  /**
   * 描述：
   对PDF文档进行签名，签名外观是文本类型。
   使用前三个参数，在系统中筛选一张用于签名的证书；
   传入的页码及坐标决定签名的位置；
   使用传入的文本生成签名的外观。
   参数：
   ulPageNo：
   签名所在的页码，起始页码为1。
   x0：
   签名外观矩形左上角的点在文档中的坐标x0。
   y0：
   签名外观矩形左上角的点在文档中的坐标y0。
   x1：
   签名外观矩形右下角的点在文档中的坐标x1。
   y1：
   签名外观矩形右下角的点在文档中的坐标y1。
   strText1：
   用于生成签名外观的文本1，可以传入签名者的名字。
   例如：“李明”。
   strText2：
   可选参数，用于生成签名外观的文本2，可以传入签名者的公司名称。
   例如：“中国金融认证中心”。
   * */
  SignFile_Text(ulPageNo: number, x0: number, y0: number, x1: number, y1: number, strText1: string, strText2: string): void;

  /**
   * 描述：
   对PDF文档进行签名，签名外观是图像类型的。
   使用前三个参数，在系统中筛选一张用于签名的证书；
   传入的页码及坐标决定签名的位置；
   参数：
   ulPageNo：
   签名所在的页码，起始页码为1。
   x：
   签名外观图像中心点在文档中的坐标x。
   y：
   签名外观图像中心点在文档中的坐标y。
   strAppearanceImage：
   Base64编码的图片，必须是png格式的图片。
   * */
  SignFile_Image(ulPageNo: number, x: number, y: number, strAppearanceImage: string): void;

  /**
   * 描述：
   对PDF文档进行签名，使用USB Key中的图像作为签名的外观。
   使用USBKey中的数字证书对文档进行签名。
   传入的页码及坐标决定签名的位置；
   参数：
   ulPageNo：
   签名所在的页码，起始页码为1。
   x：
   签名外观图像中心点在文档中的坐标x。
   y：
   签名外观图像中心点在文档中的坐标y。
   * */
  SignFile_KeyImage(ulPageNo: number, x: number, y: number): void;

  /**
   *
   * */
  SignField_Text(strFieldName: string, strText1: string, strText2: string): void;

  SignField_Image(strFieldName: string, strAppearanceImage: string): void;

  SignField_KeyImage(strFieldName: string): void;
  SetPKCS11Module(module: string): void;
  SetTimestampServer(url: string): void;
  GetVersion(): string;
}
