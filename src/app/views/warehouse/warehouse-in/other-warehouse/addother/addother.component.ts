import { PickingApplyService } from './../../../../../core/trans/picking-apply.service';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../../layout/layout.module';
import { OtherwarehouseService, OtherWarehouseServiceNs } from '../../../../../core/trans/otherwarehouse.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { NewsServiceNs } from '../../../../../core/common-services/news.service';
import { UserService, UserServiceNs } from '../../../../../core/common-services/user.service';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}
enum InputMaxLenEnum {
  Default = 50
}
enum AgreementFlagEnum {
  False = 0,
  True = 1
}
enum TypeEnum {
  OutType = '让售例外出入库'
}
@Component({
  selector: 'app-addother',
  templateUrl: './addother.component.html',
  styleUrls: ['./addother.component.scss']
})
export class AddotherComponent implements OnInit {
  otherWareHouseForm: FormGroup;
  userInfo: any;
  selectedSideMaterialList: number[];
  tableConfig: UfastTableNs.TableConfig;
  materialTableConfig: UfastTableNs.TableConfig;
  inWareHouseTableConfig: UfastTableNs.TableConfig;
  reservoirTableConfig: UfastTableNs.TableConfig;
  leftList: any[];
  materialDataList: any[];
  inWareHouseDataList: any[];
  reservoirDataList: any[];
  InMouseTypeData: any[];
  tabPageType: TabPageType;
  applyDate: any;
  show: boolean;
  isVisible: boolean;
  isVisibleReservoir: boolean;
  // 物料导入变量
  isToLeadVisible: boolean;
  errorMessage: any;
  formData: any;
  leadInUrl: any;
  fileList: any[] = [];
  href: any;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('inMouseNum') inMouseNum: TemplateRef<any>;
  @ViewChild('chooseWareHouse') chooseWareHouse: TemplateRef<any>;
  @ViewChild('chooseReservoir') chooseReservoir: TemplateRef<any>;
  @ViewChild('chooseInnerOrder') chooseInnerOrder: TemplateRef<any>;
  @ViewChild('chooseClient') chooseClient: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  selectedList: number[];
  InputMaxLen = InputMaxLenEnum;

  rightTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;
  materialsObj: { [index: string]: { qty: number } };
  barcodeFlagList: any[];
  materialFilter: any;
  innerOrderVisible: boolean;
  innerOrderTableConfig: UfastTableNs.TableConfig;
  innerOrderDataList: any[];
  isAgreementCodeRequired = false;
  currWarehouseType = null;
  isRequired: boolean;
  materialNumDec: number;
  materialNumMin: number;
    /**客户 */
    clientRequired: boolean;
    isVisibleClient: boolean;
    clientTableConfig: UfastTableNs.TableConfig;
    clientList: any[];
    clientFilter: any;
    StorageType = TypeEnum;
  constructor(private formBuilder: FormBuilder,
    private messageService: ShowMessageService,
    private otherWareHouseService: OtherwarehouseService,
    private userService: UserService,
    private http: HttpClient,
    private dataService: PickingApplyService) {
    this.materialFilter = {};
    this.barcodeFlagList = [
      { label: '否', value: 0 },
      { label: '是', value: 1 },
    ];
    this.materialsObj = {};
    this.show = false;
    this.userInfo = [];
    this.selectedList = [];
    this.selectedSideMaterialList = [];
    this.leftList = [];
    this.materialDataList = [];
    this.inWareHouseDataList = [];
    this.reservoirDataList = [];
    this.InMouseTypeData = [];
    this.finish = new EventEmitter<any>();
    this.href = environment.baseUrl.ss + '/abnormalIn/download';
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.rightTableEmit = new EventEmitter();
    // 物料导入
    this.isToLeadVisible = false;
    this.errorMessage = [];
    this.formData = new FormData();
    this.leadInUrl = environment.baseUrl.ss + '/abnormalIn/import';

    this.innerOrderVisible = false;
    this.innerOrderDataList = [];
    this.isRequired = false;
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.clientRequired = false;
    this.isVisibleClient = false;
    this.clientList = [];
    this.clientFilter = {};
  }
  public emitFinish() {
    this.finish.emit();
  }
  public clearInnerOrder() {
    this.otherWareHouseForm.patchValue({
      innerOrder: '',
      innerOrderNote: ''
    });
  }

  // 获取目前登录用户信息
  public getPersonalInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpAnyResModel) => {
      if (resData.code === 0) {
        this.userInfo = resData.value;
      } else {
        this.messageService.showAlertMessage('', resData.message, 'warning');
      }
    });
  }

  public materialCheckChange(event: UfastTableNs.SelectedChange) {
    if (event.index === -1) {
      this.leftList.forEach((item: any) => {
        item[this.tableConfig.checkRowField] = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
      });
      return;
    }
    if (event.type === UfastTableNs.SelectedChangeType.Unchecked) {
      this.tableConfig.checkAll = false;
    } else {
      this.tableConfig.checkAll = this.leftList.length === 0 ? false : true;
      for (let i = 0, len = this.leftList.length; i < len; i++) {
        if (!this.leftList[i][this.tableConfig.checkRowField]) {
          this.tableConfig.checkAll = false;
          break;
        }
      }
    }
  }
  public showMaterial(event: Event) {
    if (this.otherWareHouseForm.controls['inArea'].invalid) {
      this.messageService.showToastMessage('请选择领入库区', 'warning');
      return;
    }
    if (this.isAgreementCodeRequired && !this.otherWareHouseForm.controls['agreementCode'].value.trim()) {
      this.messageService.showToastMessage('请填写协议号', 'warning');
      return;
    }
    this.show = !this.show;
    this.getMaterialList();
  }
  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      this.tableConfig.checkAll = false;
      event.list.forEach((item: any, index: number) => {
        const value = this.leftList.find(material => item.materialsNo === material.materialsNo);
        if (!value) {
          if (this.materialsObj[item.materialsNo]) {
            this.materialsObj[item.materialsNo].qty = 1;
          } else {
            this.materialsObj[item.materialsNo] = { qty: 1 };
          }
          this.leftList = [...this.leftList, item];
        }
      });
    } else {
      event.list.forEach((item: any) => {
        this.leftList = this.leftList.filter(itemValue => itemValue.materialsNo !== item.materialsNo);
      });
    }
  }
  public deleteMaterials() {
    const idList: string[] = [];
    this.leftList = this.leftList.filter((item: any) => {
      if (item[this.tableConfig.checkRowField]) {
        idList.push(item.materialsNo);
      }
      return !item[this.tableConfig.checkRowField];
    });
    if (idList.length === 0) {
      this.messageService.showToastMessage('请选择需要删除的物料', 'warning');
      return;
    }
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, idList);
  }
  // 本地删除已选中的物料
  public deleteCheckMaterial(item: any) {
    this.leftList = this.leftList.filter(value => value.materialsNo !== item);
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, [item]);
    if (!this.leftList.length) {
      this.tableConfig.checkAll = false;
    }
    this.messageService.showToastMessage('删除成功!', 'success');
  }

  public qtyChange(materialsNo, event) {
    const value = this.leftList.find(material => materialsNo === material.materialsNo);
    if (value) {
      value.qty = event;
    }
  }

  // 显示领入仓库模态框
  showModal(): void {
    this.isVisible = true;
    this.getInWareHouseList();
    this.reservoirTableConfig.headers[0].title = '仓库编码';
    this.reservoirTableConfig.headers[1].title = '仓库描述';
  }

  getInWareHouseList = () => {
    const filter = {
      pageNum: this.inWareHouseTableConfig.pageNum,
      pageSize: this.inWareHouseTableConfig.pageSize,
      filters: {
        pCode: '0',
        houseLevel: 1,
      }
    };
    this.inWareHouseTableConfig.loading = true;
    this.otherWareHouseService.getInWareHouseList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.inWareHouseTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.inWareHouseDataList = resData.value.list;
      this.inWareHouseTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.inWareHouseTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // 显示选择库区模态框
  showReservoirModal(): void {
    if (this.otherWareHouseForm.controls['inLocation'].invalid) {
      this.messageService.showToastMessage('请选择领入仓库', 'warning');
      return;
    }
    this.reservoirTableConfig.headers[0].title = '库区编码';
    this.reservoirTableConfig.headers[1].title = '库区描述';
    this.isVisibleReservoir = true;
    this.getWarehouseAreaList();
  }
  getWarehouseAreaList = () => {
    const filter = {
      pageNum: this.reservoirTableConfig.pageNum,
      pageSize: this.reservoirTableConfig.pageSize,
      filters: {
        pCode: this.otherWareHouseForm.controls['inLocation'].value,
        houseLevel: 2,
        type: this.currWarehouseType
      }
    };
    this.reservoirTableConfig.loading = true;
    this.otherWareHouseService.getCodeAreaWareHouseList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.reservoirTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.reservoirDataList = resData.value.list;
      this.reservoirTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.reservoirTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }

  handleCancelReservoir(): void {
    this.isVisibleReservoir = false;
  }

  // 选择领入仓库
  public chooseWareHouseFun(code: string, type: number) {
    this.currWarehouseType = type;
    this.otherWareHouseForm.controls['inLocation'].setValue(code);
    this.otherWareHouseForm.patchValue({
      inLocation: code,
      inArea: null,
      agreementFlag: type
    });
    this.isAgreementCodeRequired = type === AgreementFlagEnum.True;
    if (!this.isAgreementCodeRequired) {
      this.otherWareHouseForm.controls['agreementCode'].patchValue('');
    }
    this.handleCancel();
  }

  // 选择领入库区
  public chooseReservoirFun(item: any) {
    this.otherWareHouseForm.controls['inArea'].setValue(item);
    this.handleCancelReservoir();
  }

  // 显示导入物料模态框
  showToLeadModal(pageNum?: number): void {
    if (this.otherWareHouseForm.controls['inArea'].invalid) {
      this.messageService.showToastMessage('请选择领入库区', 'warning');
      return;
    }
    if (this.isAgreementCodeRequired && !this.otherWareHouseForm.controls['agreementCode'].value.trim()) {
      this.messageService.showToastMessage('请填写协议号', 'warning');
      return;
    }
    this.isToLeadVisible = true;
  }

  beforeUpload = (file): boolean => {
    this.fileList.push(file);
    return false;
  }
  public clearFileList() {
    this.fileList = [];
  }
  public handleOk(): void {
    if (this.fileList.length === 0) {
      this.messageService.showToastMessage('请选择文件', 'warning');
      return;
    }
    if (this.errorMessage.length !== 0) {
      this.messageService.showAlertMessage('', '请重新选择文件', 'error');
      return;
    }
    this.formData = new FormData;
    this.fileList.forEach((file: any) => {
      this.formData.append('files[]', file);
    });
    this.formData.append('barcodeFlag', this.otherWareHouseForm.value.barcodeFlag);
    this.formData.append('warehouseCode', this.otherWareHouseForm.value.inLocation);
    this.formData.append('areaCode', this.otherWareHouseForm.value.inArea);
    this.formData.append('agreementCode', this.otherWareHouseForm.value.agreementCode.trim());

    const req = new HttpRequest('POST', this.leadInUrl, this.formData, {});
    this.messageService.showLoading();
    this.http.request(req).subscribe((event: any) => {
      this.messageService.closeLoading();
      if (event.type === 4) {
        if (event.body.code !== 0) {
          this.messageService.showToastMessage(event.body.message, 'error');
          return;
        }
        this.fileList = [];
        this.isToLeadVisible = false;
        this.leftList = event.body.value;
        this.materialsObj = {};
        this.leftList.forEach((item) => {
          this.materialsObj[item.materialsNo] = { qty: item.qty };
        });
        this.formData = new FormData;
      }
    }, err => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', 'upload failed.', 'error');
    });
  }

  handleToLeadCancel(): void {
    this.isToLeadVisible = false;
  }

  private checkChooseMaterial(type: number, idList: string[], updateOrigin: boolean = false, all: boolean = false) {
    const event: RightSideTableBoxNs.SelectedChangeEvent = {
      type: type,
      all: all,
      idList: idList,
      updateOrigin: updateOrigin
    };
    this.rightTableEmit.emit(event);
  }

  getMaterialList = () => {
    this.materialFilter.agreementCode = this.otherWareHouseForm.controls['agreementCode'].value.trim();
    const filter = {
      pageNum: this.materialTableConfig.pageNum,
      pageSize: this.materialTableConfig.pageSize,
      filters: this.materialFilter
    };

    this.materialTableConfig.loading = true;
    this.materialDataList = [];
    this.otherWareHouseService.getMaterialList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.materialTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialDataList = resData.value.list.map((item) => {
        const temp = <any>{};
        temp.materialsNo = item['materialVO'].code;
        temp.materialsDes = item['materialVO'].materialDesc;
        temp.unit = item['materialVO'].unit;
        temp.materialsType = item['materialVO'].fullClassName;
        return temp;
      });
      this.materialTableConfig.total = resData.value.total;

      const idList = this.leftList.map((item) => {
        return item.materialsNo;
      });
      this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Checked, idList, true);
    }, (error: any) => {
      this.materialTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 获取入库类型列表
  public getListType() {
    const filter = {
      pageNum: 0,
      pageSize: 0,
      filters: {}
      // filters: {inOut: 1}
    };
    this.otherWareHouseService.getBillTypeConfigList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.InMouseTypeData = resData.value.list;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public typeChange(event) {
    this.otherWareHouseForm.patchValue({
      innerOrder: null,
      innerOrderNote: null
    });
    let types = <any>{};
    types = this.InMouseTypeData.filter((item) => {
      return item.id === event;
    });
    if (types[0].isSynsap) {
      this.isRequired = true;
      this.otherWareHouseForm.controls['innerOrder'].setValidators([Validators.required, Validators.maxLength(this.InputMaxLen.Default)]);
      this.otherWareHouseForm.controls['innerOrderNote'].setValidators(
        [Validators.required, Validators.maxLength(this.InputMaxLen.Default)]);
    }
    if (!types[0].isSynsap) {
      this.isRequired = false;
      this.otherWareHouseForm.controls['innerOrder'].clearValidators();
      this.otherWareHouseForm.controls['innerOrderNote'].clearValidators();
      this.otherWareHouseForm.controls['innerOrder'].updateValueAndValidity();
    }
    if (types[0].type === this.StorageType.OutType) {
      this.clientRequired = true;
    } else {
      this.clientRequired = false;
    }
    if (this.clientRequired) {
      this.otherWareHouseForm.controls['customerId'].setValidators([Validators.required]);
      this.otherWareHouseForm.controls['customerName'].setValidators([Validators.required]);
    } else {
      this.otherWareHouseForm.patchValue({
        customerId: '',
        customerName: ''
      });
      this.otherWareHouseForm.controls['customerId'].clearValidators();
      this.otherWareHouseForm.controls['customerName'].clearValidators();
    }
    this.otherWareHouseForm.controls['customerName'].updateValueAndValidity();
  }
  showInnerOrderModal(): void {
    if (this.otherWareHouseForm.controls['typeId'].invalid) {
      this.messageService.showToastMessage('请选择入库类型', 'warning');
      return;
    }
    this.innerOrderVisible = true;
    this.getInnderOrderDataList();
  }
  getInnderOrderDataList = () => {
    this.innerOrderDataList = [];
    this.innerOrderTableConfig.loading = true;
    this.otherWareHouseService.getInType(this.otherWareHouseForm.controls['typeId'].value).subscribe((resData: any) => {
      this.innerOrderTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.innerOrderDataList = [];
      resData.value.detailList.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.innerOrderDataList.push(temp);
      });
    }, (error: any) => {
      this.innerOrderTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancelInnerOrder(): void {
    this.innerOrderVisible = false;
  }
  public chooseInnerOrderFun(ctx) {
    this.otherWareHouseForm.patchValue({
      innerOrder: ctx.innerOrder,
      innerOrderNote: ctx.innerOrderNote
    });
    this.handleCancelInnerOrder();
  }
  public onBarcodeFlag(data) {
    this.materialFilter.managementMode = data;
    this.leftList = [];
    this.materialsObj = {};
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, null, true, true);
    this.getMaterialList();
  }
  public submitWarehouse() {
    for (const key of Object.keys(this.otherWareHouseForm.controls)) {
      this.otherWareHouseForm.controls[key].markAsDirty();
      this.otherWareHouseForm.controls[key].updateValueAndValidity();
    }

    if (this.otherWareHouseForm.invalid) {
      return;
    }
    const detailList: OtherWarehouseServiceNs.AddOtherMaterialModel[] = [];
    this.leftList.forEach((item: any) => {
      detailList.push({
        amount: item['amount'],
        amountAfterAdjust: item['amountAfterAdjust'],
        applyQty: item['applyQty'],
        barCode: item['barCode'],
        deliveryNum: item['deliveryNum'],
        enableNum: item['enableNum'],
        intentionNum: item['intentionNum'],
        isChecked: item['isChecked'],
        locationCode: item['locationCode'],
        materialsDes: item['materialsDes'],
        materialsId: item['materialsId'],
        materialsNo: item['materialsNo'],
        materialsType: item['materialsType'],
        price: item['price'],
        priceSchemeId: item['priceSchemeId'],
        priceSchemeName: item['priceSchemeName'],
        // qty: item['qty'],
        qty: item['qty'] ? item['qty'] : 1,
        requestDeliveryDate: item['requestDeliveryDate'],
        unit: item['unit']
      });
    });
    if (detailList.length === 0) {
      this.messageService.showToastMessage('物料不能为空', 'warning');
      return;
    }
    if (this.isAgreementCodeRequired && !this.otherWareHouseForm.value.agreementCode.trim()) {
      this.messageService.showToastMessage('请填写协议号', 'error');
      return;
    }
    const headerInfoData = this.otherWareHouseForm.getRawValue();
    const headerInfo: OtherWarehouseServiceNs.AddOtherHeaderModel = {
      applyDate: this.applyDate,
      createId: this.userInfo.userId,
      createName: this.userInfo.name,
      deptId: this.userInfo.deptId,
      dept: this.userInfo.deptName,
      inArea: headerInfoData.inArea,
      inLocation: headerInfoData.inLocation,
      innerOrder: headerInfoData.innerOrder,
      innerOrderNote: headerInfoData.innerOrderNote,
      note: headerInfoData.note,
      barcodeFlag: headerInfoData.barcodeFlag,
      typeId: headerInfoData.typeId,
      agreementCode: headerInfoData.agreementCode.trim(),
      agreementFlag: headerInfoData.agreementFlag,
      customerId: headerInfoData.customerId,
      customerName: headerInfoData.customerName
    };
    if (detailList.length === 0) {
      this.messageService.showToastMessage('请选择物料!', 'error');
      return;
    }
    this.messageService.showLoading();
    this.otherWareHouseService.addWareHouse(detailList, headerInfo).subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  getClientList = () => {
    Object.keys(this.clientFilter).filter(item => typeof this.clientFilter[item] === 'string').forEach((key: string) => {
      this.clientFilter[key] = this.clientFilter[key].trim();
    });
    const filter = {
      pageNum: this.clientTableConfig.pageNum,
      pageSize: this.clientTableConfig.pageSize,
      filters: this.clientFilter
    };
    this.clientList = [];

    this.dataService.getClientList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.clientList.push(temp);
      });
      this.clientTableConfig.total = resData.value.total;
    });
  }
  showClientModal(): void {
    if (this.otherWareHouseForm.controls['typeId'].invalid) {
      this.messageService.showToastMessage('请先选择入库类型', 'warning');
      return;
    }
    this.isVisibleClient = true;
    this.getClientList();
  }
  handleCancelClient(): void {
    this.isVisibleClient = false;
    this.clientFilter = {
      organizationId: environment.otherData.factoryId
    };
  }
  public chooseClientFun(ctx: any) {
    this.otherWareHouseForm.patchValue({
      customerId: ctx.accountNumber,
      customerName: ctx.partyName,
    });
    this.handleCancelClient();
  }
  public clearCustomerName() {
    this.otherWareHouseForm.patchValue({
      customerId: '',
      customerName: ''
    });
  }

  ngOnInit() {
    this.getPersonalInfo();
    this.getListType();
    this.applyDate = new Date();
    this.otherWareHouseForm = this.formBuilder.group({
      inLocation: [null, [Validators.required]],
      innerOrder: [null],
      inArea: [null, [Validators.required]],
      applyDate: [null],
      typeId: [null, [Validators.required]],
      note: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      innerOrderNote: [{ value: null, disabled: true }],
      barcodeFlag: [1, [Validators.required]],
      agreementFlag: [{ value: null, disabled: true }],
      agreementCode: [''],
      customerId: [null],
      customerName: [null]
    });
    this.materialFilter.managementMode = this.otherWareHouseForm.value.barcodeFlag;
    // 选中的物料
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      checkRowField: 'checked',
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 60 },
      { title: '物料编码', field: 'materialsNo', width: 100 },
      { title: '物料描述', field: 'materialsDes', width: 150 },
      { title: '分类', field: 'materialsType', width: 100 },
      { title: '单位', field: 'unit', width: 80 },
      { title: '入库数量', tdTemplate: this.inMouseNum, width: 100 },
      ]
    };

    // 正在选择的物料
    this.materialTableConfig = {
      pageSize: 10,
      yScroll: 500,
      showCheckbox: true,
      showPagination: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '物料编码', field: 'materialsNo', width: 100 },
      { title: '物料描述', field: 'materialsDes', width: 150 }
      ]
    };

    // 领入仓库模态框
    this.inWareHouseTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '仓库编码', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseWareHouse, width: 60 }
      ]
    };

    // 选择库区模态框
    this.reservoirTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '仓库编码', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseReservoir, width: 60 }
      ]
    };
    this.innerOrderTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      frontPagination: true,
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '部门编号', field: 'innerOrder', width: 100 },
      { title: '部门名称', field: 'innerOrderNote', width: 150 },
      { title: '操作', tdTemplate: this.chooseInnerOrder, width: 60 }
      ]
    };
    this.clientTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '名称', field: 'partyName', width: 100 },
      { title: '操作', tdTemplate: this.chooseClient, width: 60 }
      ]
    };
  }

}
