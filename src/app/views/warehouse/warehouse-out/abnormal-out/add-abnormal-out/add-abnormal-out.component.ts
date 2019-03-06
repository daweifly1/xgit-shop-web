import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../../layout/layout.module';
import { AbnormalOutService, AbnormalOutServiceNs } from '../../../../../core/trans/abnormalOut.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { UfastValidatorsService } from '../../../../../core/infra/validators/validators.service';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpRequest } from '@angular/common/http';


interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}
interface FiltersType {
  companyType: string;
  companyName: string;
}
interface ClientFiltersType {
  dealerCode: string;
  companyName: string;
}
enum InputMaxLenght {
  Default = 50
}
enum AgreementFlagEnum {
  False = 0,
  True = 1
}
@Component({
  selector: 'app-add-abnormal-out',
  templateUrl: './add-abnormal-out.component.html',
  styleUrls: ['./add-abnormal-out.component.scss']
})
export class AddAbnormalOutComponent implements OnInit {
  abnormalOutForm: FormGroup;
  reasonNameData: AbnormalOutServiceNs.ReasonNameDataModel[];
  shippingMethod: AbnormalOutServiceNs.ShippingMethodModel[];
  freightSettlementMethod: AbnormalOutServiceNs.FreightSettlementMethodModel[];
  transportLogisticsTableConfig: UfastTableNs.TableConfig;
  transportLogisticsDataList: AbnormalOutServiceNs.TransportLogisticsModel[];
  isVisible: boolean;
  isVisibleReservoir: boolean;
  isVisibleTransportLogistics: boolean;
  isVisibleClient: boolean;
  searchPlaceholder: string;
  filters: FiltersType;
  tableConfig: UfastTableNs.TableConfig;
  outWareHouseTableConfig: UfastTableNs.TableConfig;
  warehouseAreaTableConfig: UfastTableNs.TableConfig;
  clientTableConfig: UfastTableNs.TableConfig;
  clientFilters: ClientFiltersType;
  clientDataList: AbnormalOutServiceNs.ClientModel[];
  clientSearchPlaceholder: {
    dealerCodePlaceholder: string,
    companyNamePlaceholder: string
  };
  materialTableConfig: UfastTableNs.TableConfig;
  materialDataList: AbnormalOutServiceNs.AbnormalOutMaterialModel[];
  outWareHouseDataList: AbnormalOutServiceNs.OutLocationModel[];
  reservoirDataList: AbnormalOutServiceNs.ReservoirModel[];
  abnormalOutTypeData: AbnormalOutServiceNs.AbnormalOutTypeModel[];
  typeId: string;
  tabPageType: TabPageType;
  show: boolean;
  leftList: any[];
  rightTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;
  materialsObj: { [index: string]: { qty: number } };
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('inMouseNum') inMouseNum: TemplateRef<any>;
  @ViewChild('chooseWareHouse') chooseWareHouse: TemplateRef<any>;
  @ViewChild('chooseReservoir') chooseReservoir: TemplateRef<any>;
  @ViewChild('chooseTransportLogistics') chooseTransportLogistics: TemplateRef<any>;
  @ViewChild('chooseClient') chooseClient: TemplateRef<any>;
  @ViewChild('chooseInnerOrder') chooseInnerOrder: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  InputMaxLen = InputMaxLenght;
  barcodeFlagList: any[];
  materialFilter: any;
  /**
   * 物料导入变量
   */
  isToLeadVisible: boolean;
  errorMessage: any;
  formData: any;
  leadInUrl: any;
  fileList: any[];
  href: any;
  innerOrderVisible: boolean;
  innerOrderTableConfig: UfastTableNs.TableConfig;
  innerOrderDataList: any[];
  isAgreementCodeRequired = false;
  currWarehouseType = null;
  isRequired: boolean;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  constructor(private formBuilder: FormBuilder,
    private messageService: ShowMessageService,
    private abnormalOutService: AbnormalOutService,
    private validatorsService: UfastValidatorsService,
    private http: HttpClient) {
    this.materialFilter = {};
    this.barcodeFlagList = [
      { label: '否', value: 0 },
      { label: '是', value: 1 },
    ];
    this.reasonNameData = [];
    this.shippingMethod = [];
    this.freightSettlementMethod = [];
    this.transportLogisticsDataList = [];
    this.searchPlaceholder = '请输入公司名称';
    this.filters = {
      companyType: '3',
      companyName: ''
    };
    this.clientFilters = {
      dealerCode: '',
      companyName: ''
    };
    this.clientDataList = [];
    this.clientSearchPlaceholder = {
      dealerCodePlaceholder: '请输入客户编号',
      companyNamePlaceholder: '请输入客户名称'
    };
    this.materialDataList = [];
    this.outWareHouseDataList = [];
    this.reservoirDataList = [];
    this.abnormalOutTypeData = [];
    this.finish = new EventEmitter<any>();
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.leftList = [];
    this.materialsObj = {};
    this.rightTableEmit = new EventEmitter();

    this.isToLeadVisible = false;
    this.errorMessage = [];
    this.formData = new FormData();
    this.href = environment.baseUrl.ss + '/abnormalOut/download';
    this.leadInUrl = environment.baseUrl.ss + '/abnormalOut/import';
    this.fileList = [];
    this.innerOrderVisible = false;
    this.innerOrderDataList = [];
    this.isRequired = false;
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
  }
  public clearInnerOrder() {
    this.abnormalOutForm.patchValue({
      innerOrder: null,
      innerOrderNote: null
    });

  }

  // 获取产生原因列表
  public getReasonNameListType() {
    const data = {
      parentCode: 'OOFROMTYPE'
    };
    this.abnormalOutService.getBillTypeConfigList(data).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.reasonNameData = resData.value;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 获取发运方式列表
  public getShippingMethodListType() {
    const data = {
      parentCode: 'FYFS'
    };
    this.abnormalOutService.getBillTypeConfigList(data).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.shippingMethod = resData.value;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  // 获取运费结算方式列表
  public getFreightSettlementMethodListType() {
    const data = {
      parentCode: 'JSFS'
    };
    this.abnormalOutService.getBillTypeConfigList(data).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.freightSettlementMethod = resData.value;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 获取出库类型列表
  public getAbnormalOutType() {
    const filter = {
      pageNum: 0,
      pageSize: 0,
      filters: {}
      // filters: {
      //   inOut: 1
      // }
    };
    this.abnormalOutService.getAbnormalOutTypeList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.abnormalOutTypeData = resData.value.list;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  public emitFinish() {
    this.finish.emit();
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
  public showMaterial() {
    if (this.abnormalOutForm.value.outArea === null) {
      this.messageService.showToastMessage('请选择调出库区', 'error');
      return;
    }
    if (this.isAgreementCodeRequired && !this.abnormalOutForm.value.agreementCode.trim()) {
      this.messageService.showToastMessage('请填写协议号', 'error');
      return;
    }
    this.show = !this.show;
    if (!this.leftList.length) {
      this.getMaterialList();
    }
  }
  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      event.list.forEach((item: any, index: number) => {
        const value = this.leftList.find(material => item.materialsNo === material.materialsNo);
        if (!value) {
          if (this.materialsObj[item.materialsNo]) {
            this.materialsObj[item.materialsNo].qty = 1;
          } else {
            this.materialsObj[item.materialsNo] = { qty: 1 };
          }
          item.qty = this.materialsObj[item.materialsNo].qty;
          this.leftList = [...this.leftList, item];
        }

      });
    } else {
      event.list.forEach((item: any) => {
        this.leftList = this.leftList.filter(itemValue => itemValue.materialsNo !== item.materialsNo);
      });
    }
  }
  public deteleMaterials() {
    const idList: string[] = [];
    this.leftList = this.leftList.filter((item: any) => {
      if (item[this.tableConfig.checkRowField]) {
        idList.push(item.materialsNo);
      }
      return !item[this.tableConfig.checkRowField];
    });
    if (idList.length === 0) {
      this.messageService.showToastMessage('请选择需要删除的物料', 'info');
      return;
    }
    if (!this.leftList.length) {
      this.tableConfig.checkAll = false;
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

  private checkChooseMaterial(type: number, idList: string[], updateOrigin: boolean = false, all: boolean = false) {
    const event: RightSideTableBoxNs.SelectedChangeEvent = {
      type: type,
      all: all,
      idList: idList,
      updateOrigin: updateOrigin
    };
    this.rightTableEmit.emit(event);
  }


  // 获取侧边栏物料列表
  getMaterialList = () => {
    this.materialFilter.warehouseCode = this.abnormalOutForm.controls['outLocation'].value;
    this.materialFilter.areaCode = this.abnormalOutForm.controls['outArea'].value;
    this.materialFilter.barcodeFlag = this.abnormalOutForm.controls['barcodeFlag'].value;
    if (typeof this.abnormalOutForm.controls['agreementCode'].value === 'string') {
      this.abnormalOutForm.controls['agreementCode'].patchValue(this.abnormalOutForm.controls['agreementCode'].value.trim());
    }
    this.materialFilter.agreementCode = this.abnormalOutForm.controls['agreementCode'].value || undefined;
    const filter = {
      pageNum: this.materialTableConfig.pageNum,
      pageSize: this.materialTableConfig.pageSize,
      filters: this.materialFilter
    };
    this.materialTableConfig.loading = true;
    this.materialDataList = [];
    this.abnormalOutService.getMaterialList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      this.materialTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialDataList = resData.value.list.map((item) => {
        const temp = {};
        temp['materialsNo'] = item['materialCode'];
        temp['materialsDes'] = item['materialName'];
        // temp['materialsType'] = item['materialType'];
        temp['unit'] = item['unit'];
        temp['locationCode'] = item['locationCode'];
        temp['defaultlocationCode'] = item['defaultlocationCode'];
        temp['enableNum'] = item['amount'];
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


  // 显示调出仓库模态框-
  showWarehouseModal(pageNum?: number): void {
    this.isVisible = true;
    this.getWarehouseModalData(pageNum);
  }

  getWarehouseModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.outWareHouseTableConfig.pageNum,
      pageSize: this.outWareHouseTableConfig.pageSize,
      filters: {
        pCode: '0',
        houseLevel: 1,
      }
    };
    this.abnormalOutService.getOutWareHouseList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.outWareHouseDataList = resData.value.list;
      this.outWareHouseTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // 显示选择库区模态框
  showReservoirModal(pageNum?: number): void {
    if (this.abnormalOutForm.controls['outLocation'].invalid) {
      this.messageService.showToastMessage('请选择调出仓库', 'error');
      return;
    }
    this.isVisibleReservoir = true;
    this.getWarehouseAreaModalData(pageNum);
  }
  getWarehouseAreaModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.warehouseAreaTableConfig.pageNum,
      pageSize: this.warehouseAreaTableConfig.pageSize,
      filters: {
        houseLevel: 2,
        pCode: this.abnormalOutForm.controls['outLocation'].value,
        type: this.currWarehouseType
      }
    };
    this.abnormalOutService.getCodeAreaWareHouseList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.reservoirDataList = resData.value.list;
      this.warehouseAreaTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  handleCancelReservoir(): void {
    this.isVisibleReservoir = false;
  }

  // 承运物流模态框
  showTransportLogisticsModal(pageNum?: number): void {
    this.isVisibleTransportLogistics = true;
    this.getTransportLogisticsModalData(pageNum);

  }
  getTransportLogisticsModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.transportLogisticsTableConfig.pageNum,
      pageSize: this.transportLogisticsTableConfig.pageSize,
      filters: {
        companyType: this.filters.companyType,
        companyName: this.filters.companyName
      }
    };
    this.abnormalOutService.getTransportLogisticsList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.transportLogisticsDataList = resData.value.list;
      this.transportLogisticsTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  handleCancelTransportLogistics(): void {
    this.isVisibleTransportLogistics = false;
  }

  /**
   * 选择客户模态框
   * **/
  showClientModal(pageNum?: number): void {
    this.isVisibleClient = true;
    this.getClientModalData(pageNum);

  }
  getClientModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.clientTableConfig.pageNum,
      pageSize: this.clientTableConfig.pageSize,
      filters: {
        dealerCode: this.clientFilters.dealerCode,
        companyName: this.clientFilters.companyName
      }
    };
    this.abnormalOutService.getClientList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.clientDataList = resData.value.list;
      this.clientTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  handleCancelClient(): void {
    this.isVisibleClient = false;
  }

  // 选择调出仓库-
  public chooseWareHouseFun(item: any, type: number) {
    this.currWarehouseType = type;
    this.abnormalOutForm.patchValue({
      outLocation: item,
      outArea: null,
      agreementFlag: type,
      agreementCode: ''
    });
    this.isAgreementCodeRequired = (type === AgreementFlagEnum.True);
    if (!this.isAgreementCodeRequired) {
      this.abnormalOutForm.controls['agreementCode'].patchValue('');
    }
    this.leftList = [];
    this.handleCancel();
  }

  // 选择调出库区
  public chooseReservoirFun(item: any) {
    this.abnormalOutForm.patchValue({
      outArea: item,
      agreementCode: ''
    });
    this.leftList = [];
    this.handleCancelReservoir();
  }

  // 选择承运物流
  public chooseTransportLogisticsFun(item: any) {
    this.abnormalOutForm.controls['logistics'].setValue(item);
    this.handleCancelTransportLogistics();
  }

  // 点击搜索，承运物流列表更新
  public searchTransportLogistics(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.transportLogisticsTableConfig.pageNum,
      pageSize: this.transportLogisticsTableConfig.pageSize,
      filters: {
        companyType: this.filters.companyType,
        companyName: this.filters.companyName
      }
    };
    this.abnormalOutService.getTransportLogisticsList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.transportLogisticsDataList = resData.value.list;
      this.transportLogisticsTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }


  // 选择客户
  public chooseClientFun(item: any) {
    this.abnormalOutForm.controls['agentName'].setValue(item);
    this.handleCancelClient();
  }

  // 点击搜索，客户列表更新
  public searchClient(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.clientTableConfig.pageNum,
      pageSize: this.clientTableConfig.pageSize,
      filters: {
        dealerCode: this.clientFilters.dealerCode,
        companyName: this.clientFilters.companyName
      }
    };
    this.abnormalOutService.getClientList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.clientDataList = resData.value.list;
      this.transportLogisticsTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public abnormalOutTypeChange(event) {
    this.abnormalOutForm.patchValue({
      innerOrder: null,
      innerOrderNote: null
    });
    let types = <any>{};
    types = this.abnormalOutTypeData.filter((item) => {
      return item.id === event;
    });
    if (types[0].isSynsap) {
      this.isRequired = true;
      this.abnormalOutForm.controls['innerOrder'].setValidators([Validators.required, Validators.maxLength(this.InputMaxLen.Default)]);
      this.abnormalOutForm.controls['innerOrderNote'].setValidators(
        [Validators.required, Validators.maxLength(this.InputMaxLen.Default)]);
    }
    if (!types[0].isSynsap) {
      this.isRequired = false;
      this.abnormalOutForm.controls['innerOrder'].clearValidators();
      this.abnormalOutForm.controls['innerOrderNote'].clearValidators();
      this.abnormalOutForm.controls['innerOrder'].updateValueAndValidity();
    }
  }
  /**选择部门编号 */
  showInnerOrderModal(): void {
    if (this.abnormalOutForm.controls['typeId'].invalid) {
      this.messageService.showToastMessage('请选择出库类型', 'warning');
      return;
    }
    this.innerOrderVisible = true;
    this.getInnderOrderDataList();
  }
  getInnderOrderDataList = () => {
    this.innerOrderDataList = [];
    this.innerOrderTableConfig.loading = true;
    this.abnormalOutService.getBillType(this.abnormalOutForm.controls['typeId'].value).subscribe((resData: any) => {
      this.innerOrderTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.innerOrderDataList = [];
      resData.value.detailList.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp ['_this'] = temp;
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
    this.abnormalOutForm.patchValue({
      innerOrder: ctx.innerOrder,
      innerOrderNote: ctx.innerOrderNote
    });
    this.handleCancelInnerOrder();
  }
  public qtyChange(materialsNo, event) {
    const value = this.leftList.find(material => materialsNo === material.materialsNo);
    if (value) {
      value.qty = event;
    }
  }
  public submitWarehouse() {
    for (const key of Object.keys(this.abnormalOutForm.controls)) {
      this.abnormalOutForm.controls[key].markAsDirty();
      this.abnormalOutForm.controls[key].updateValueAndValidity();
    }
    if (this.abnormalOutForm.invalid) {
      return;
    }
    const detailList: AbnormalOutServiceNs.AbnormalOutMaterialModel[] = [];
    const fieldList = ['amount', 'amountAfterAdjust', 'applyQty', 'barCode', 'deliveryNum', 'enableNum', 'intentionNum',
      'isChecked', 'locationCode', 'materialsDes', 'materialsId', 'materialsNo', 'price', 'priceSchemeId',
      'priceSchemeName', 'qty', 'requestDeliveryDate', 'sourcePrice', 'unit', 'defaultlocationCode'];
      let flag = false;
    this.leftList.forEach((item: any) => {
      if (!item.qty) {
        flag = true;
        return;
      }
      const obj = {};
      fieldList.forEach((key) => {
        obj[key] = item[key];
      });
      detailList.push(obj);
    });
    if (flag) {
      this.messageService.showToastMessage('出库数量不能为0和空', 'warning');
      return;
    }
    if (detailList.length === 0) {
      this.messageService.showToastMessage('物料不能为空', 'warning');
      return;
    }
    if (this.isAgreementCodeRequired && !this.abnormalOutForm.value.agreementCode.trim()) {
      this.messageService.showToastMessage('请填写协议号', 'error');
      return;
    }
    const headerInfo = this.abnormalOutForm.getRawValue();
    this.messageService.showLoading();
    this.abnormalOutService.addWareHouse(detailList, headerInfo)
      .subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
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
  public onBarcodeFlag(data) {
    this.materialFilter.barcodeFlag = data;
    this.leftList = [];
    this.materialsObj = {};
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, null, true, true);
    this.getMaterialList();
  }
  // 显示导入物料模态框
  showToLeadModal(pageNum?: number): void {
    if (this.abnormalOutForm.controls['outArea'].invalid) {
      this.messageService.showToastMessage('请选择调出库区', 'error');
      return;
    }
    if (this.isAgreementCodeRequired && !this.abnormalOutForm.value.agreementCode.trim()) {
      this.messageService.showToastMessage('请填写协议号', 'error');
      return;
    }
    this.isToLeadVisible = true;
  }
  beforeUpload = (file): boolean => {
    this.fileList.push(file);
    return false;
  }

  handleOk(): void {
    this.messageService.showLoading();
    if (this.errorMessage.length !== 0) {
      this.messageService.showAlertMessage('', '请重新选择文件', 'error');
      this.messageService.closeLoading();
      return;
    }
    this.fileList.forEach((file: any) => {
      this.formData.append('files[]', file);
    });
    this.formData.append('barcodeFlag', this.abnormalOutForm.value.barcodeFlag);
    this.formData.append('warehouseCode', this.abnormalOutForm.value.outLocation);
    this.formData.append('areaCode', this.abnormalOutForm.value.outArea);
    this.formData.append('agreementCode', this.abnormalOutForm.value.agreementCode.trim());
    const req = new HttpRequest('POST', this.leadInUrl, this.formData, {});
    this.http.request(req).subscribe((event: any) => {
      if (event.type === 4) {
        if (event.body.code !== 0) {
          this.messageService.showAlertMessage('', event.body.message, 'error');
          this.formData = new FormData;
          this.messageService.closeLoading();
          return;
        }
        this.fileList = [];
        this.leftList = event.body.value;
        this.materialsObj = {};
        this.isToLeadVisible = false;
        this.leftList.forEach((item) => {
          this.materialsObj[item.materialsNo] = { qty: item.qty };
        });
        this.formData = new FormData;
        this.messageService.closeLoading();
      }
    }, err => {
      this.messageService.showAlertMessage('', 'upload failed.', 'error');
      this.messageService.closeLoading();
    });
  }
  handleToLeadCancel(): void {
    this.isToLeadVisible = false;
  }
  public agreementCodeChange() {
    this.leftList = [];
  }
  ngOnInit() {
    // 新增表单数据
    this.abnormalOutForm = this.formBuilder.group({
      typeId: [null, [Validators.required]],
      innerOrder: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      innerOrderNote: [{ value: null, disabled: true }, [Validators.maxLength(this.InputMaxLen.Default)]],
      receiverFax: [null],
      reasonName: [null],
      outLocation: [null, [Validators.required]],
      outArea: [null, [Validators.required]],
      logistics: [null],
      logisticsPerson: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      logisticsPhone: [null, [this.validatorsService.mobileOrTeleValidator()]],
      agentName: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      deliveryTypeName: [null],
      settleTypeName: [null],
      receiverName: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      receiverPhone: [null, [this.validatorsService.mobileOrTeleValidator()]],
      address: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      note: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      createId: [null],
      applyDate: [{ value: new Date, disabled: true }],
      barcodeFlag: [1, [Validators.required]],
      agreementFlag: [{value: null, disabled: true}],
      agreementCode: ['']
    });

    // 选中的物料
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      checkRowField: 'checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 60 },
      { title: '物料编码', field: 'materialsNo', width: 100 },
      { title: '物料描述', field: 'materialsDes', width: 150 },
      // { title: '分类', field: 'materialsType', width: 80 },
      { title: '单位', field: 'unit', width: 80 },
      { title: '默认储位', field: 'defaultlocationCode', width: 80 },
      { title: '可用库存', field: 'enableNum', width: 80 },
      { title: '出库数量', tdTemplate: this.inMouseNum, field: 'qty', width: 100 },
      ]
    };

    // 物料侧边栏
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
      { title: '物料描述', field: 'materialsDes', width: 150 },
      { title: '数量', field: 'enableNum', width: 150 }
      ]
    };

    // 调出仓库模态框数据
    this.outWareHouseTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '仓库编号', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseWareHouse, width: 60 }
      ]
    };

    // 调出库区模态框数据
    this.warehouseAreaTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '库区编号', field: 'code', width: 100 },
      { title: '库区描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseReservoir, width: 60 }
      ]
    };

    // 承运物流模态框数据
    this.transportLogisticsTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '公司名称', field: 'companyName', width: 100 },
      { title: '公司编号', field: 'orgCode', width: 150 },
      { title: '操作', tdTemplate: this.chooseTransportLogistics, width: 60 }
      ]
    };

    // 客户模态框数据
    this.clientTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '客户编号', field: 'dealerCode', width: 100 },
      { title: '客户名称', field: 'companyName', width: 150 },
      { title: '操作', tdTemplate: this.chooseClient, width: 60 }
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
      headers: [{title: '部门编号', field: 'innerOrder', width: 100},
        {title: '部门名称', field: 'innerOrderNote', width: 150},
        {title: '操作', tdTemplate: this.chooseInnerOrder, width: 60}
      ]
    };

    this.getReasonNameListType();
    this.getShippingMethodListType();
    this.getFreightSettlementMethodListType();
    this.getAbnormalOutType();
  }

}
