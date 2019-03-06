import { Component, EventEmitter, OnInit, ViewChild, TemplateRef, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegionalAllocationService, RegionalAllocationServiceNs } from '../../../../core/trans/regionalAllocation.service';
import { UserService, UserServiceNs } from '../../../../core/common-services/user.service';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../layout/layout.module';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpRequest } from '@angular/common/http';
enum MaxLenInputEnum {
  Default = 50
}
enum MaxApplyEnum {
  ApplyNum = 99999999.99
}
enum AgreementFlagEnum {
  False = 0,
  True = 1
}
@Component({
  selector: 'app-add-region-allot',
  templateUrl: './add-region-allot.component.html',
  styleUrls: ['./add-region-allot.component.scss']
})
export class AddRegionAllotComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @ViewChild('chooseWarehouse') chooseWarehouse: TemplateRef<any>;
  @ViewChild('chooseArea') chooseArea: TemplateRef<any>;
  @ViewChild('chooseInWarehouse') chooseInWarehouse: TemplateRef<any>;
  @ViewChild('chooseInArea') chooseInArea: TemplateRef<any>;
  @Input() editId: string;
  InputMaxLen = MaxLenInputEnum;
  ApplyMaxNum = MaxApplyEnum;
  /**
   * 表头数据
   */
  formGroup: FormGroup;
  /**
   * 物料表格配置
   */
  tableConfig: UfastTableNs.TableConfig;
  /**
   * 选择的物料
   */
  materialDataList: any[];
  /**
   * 选择调出仓库
   */
  isOutWarehouseVisible: boolean;
  outWarehouseTableConfig: UfastTableNs.TableConfig;
  outWarehouseDataList: any[];
  /**
 * 选择调出库区
 */
  isOutAreaVisible: boolean;
  outAreaTableConfig: UfastTableNs.TableConfig;
  outAreaDataList: any[];

  /**
 * 选择调入仓库
 */
  isInWarehouseVisible: boolean;
  inWarehouseTableConfig: UfastTableNs.TableConfig;
  inWarehouseDataList: any[];

  /**
* 选择调入库区
*/
  isInAreaVisible: boolean;
  inAreaTableConfig: UfastTableNs.TableConfig;
  inAreaDataList: any[];
  barcodeFlagList: any[];
  agreementFlagList = [
    { value: 0, label: '否' },
    { value: 1, label: '是' }
  ];

  @ViewChild('tableOpTpl') tableOpTpl: TemplateRef<any>;
  @ViewChild('inventoryTpl') inventoryTpl: TemplateRef<any>;
  @ViewChild('numTpl') numTpl: TemplateRef<any>;
  @ViewChild('noteTpl') noteTpl: TemplateRef<any>;
  /**
   * 侧边栏显隐
   */
  show: boolean;
  /**
   * 侧边栏配置
   */
  materialDataConfig: UfastTableNs.TableConfig;
  /**
   * 侧边栏数据
   */
  materialData: any[];
  /**
   * 侧边栏搜索数据
  */
  materialFilter: any;
  rightTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;
  materialsObj: { [index: string]: { amount: number } };
  materialField: string;
  /**
   * 编辑--表头
   */
  headerFieldList: { name: string; field: string; pipe?: string }[];
  headerInfo: any;
  /**
   * 导入物料
   */
  isToLeadVisible: boolean;
  errorMessage: any;
  formData: any;
  leadInUrl: any;
  fileList: any[];
  href: any;
  /**
   * 调出仓库的仓库类型
   */
  warehouseType: number;
  isAgreementCodeRequired = false;
  materialNumDec: number;
  materialNumMin: number;
  constructor(
    private regionAllotService: RegionalAllocationService, private formBuilder: FormBuilder,
    private messageService: ShowMessageService,
    private userService: UserService,
    private http: HttpClient) {
    this.finish = new EventEmitter<any>();
    this.rightTableEmit = new EventEmitter();
    this.materialDataList = [];
    this.show = false;
    this.materialData = [];
    this.materialFilter = {};
    this.materialField = 'materialsNo';
    this.isOutWarehouseVisible = false;
    this.isOutAreaVisible = false;
    this.isInWarehouseVisible = false;
    this.isInAreaVisible = false;
    this.barcodeFlagList = [
      { label: '否', value: 0 },
      { label: '是', value: 1 }
    ];
    this.headerFieldList = [
      { name: '调拨单号', field: 'allotOrder' },
      { name: '制单人', field: 'createName' },
      { name: '制单部门', field: 'deptName' },
      { name: '制单时间', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm' },
      { name: '调出仓库', field: 'outLocation' },
      { name: '调出库区', field: 'outArea' },
      { name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage' },
      { name: '调入仓库', field: 'inLocation' },
      { name: '调入库区', field: 'inArea' },
      { name: '是否协议调拨', field: 'agreementFlag', pipe: 'barcodeManage' },
      { name: '协议号', field: 'agreementCode' },
      { name: '领出物料凭证', field: '' },
      { name: '领入物料凭证', field: '' },
      { name: '领出过账状态', field: '' },
      { name: '领入过账状态', field: '' },
      // { name: '移动类型', field: 'moveType' },
      { name: '单据状态', field: 'billStatus', pipe: 'regionalAllocationBillStatus' },
      // { name: '审核意见', field: 'remark' }
    ];
    this.headerInfo = {};
    this.isToLeadVisible = false;
    this.errorMessage = [];
    this.formData = new FormData();
    this.href = environment.baseUrl.ss + '/regionAllot/download';
    this.leadInUrl = environment.baseUrl.ss + '/regionAllot/import';
    this.fileList = [];
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
  }
  private getUserInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<UserServiceNs.UserInfoModel>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
        return;
      }
      this.formGroup.patchValue({
        applyName: resData.value.name,
        deptName: resData.value.deptName
      });
    }, (error) => {
      this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
    });
  }
  public onBarcodeFlag(data) {
    this.materialFilter.barcodeFlag = data;
    this.materialDataList = [];
    this.materialData = [];
    this.materialsObj = {};
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, null, true, true);
  }
  /**
   * 显示侧边栏物料表
   */
  public showMaterial() {
    if (this.formGroup.controls['outArea'].invalid) {
      this.messageService.showToastMessage('请选择调出库区', 'error');
      return;
    }
    if (this.formGroup.controls['barcodeFlag'].invalid) {
      this.messageService.showToastMessage('请选择是否条码管理', 'error');
      return;
    }
    if ((this.formGroup.controls['agreementFlag'].value === AgreementFlagEnum.True) &&
      (!this.formGroup.controls['agreementCode'].value.trim())) {
      this.messageService.showToastMessage('请填写协议号', 'error');
      return;
    }
    this.show = !this.show;
    if (!this.materialData.length) {
      this.getMaterialList();
    } else {
      this.checkMaterialList();
    }
  }
  private checkMaterialList() {
    this.materialData.forEach((item) => {
      item._checked = false;
      const checkedItem = this.materialDataList.findIndex(material => material.materialNo === item.materialsNo);

      if (checkedItem !== -1) {
        item._checked = true;
        return;
      }
    });
  }
  public agreementCodeChange() {
    this.materialDataList = [];
    this.materialData = [];
  }
  /**
   * 侧边栏物料列表
   **/
  public getMaterialList = () => {
    if (!this.editId) {
      this.materialFilter.warehouseCode = this.formGroup.controls['outLocation'].value;
      this.materialFilter.areaCode = this.formGroup.controls['outArea'].value;
      if (this.formGroup.controls['agreementCode'].value) {
        this.materialFilter.agreementCode = this.formGroup.controls['agreementCode'].value.trim();
      }
    } else {
      this.materialFilter.warehouseCode = this.headerInfo.outLocation;
      this.materialFilter.areaCode = this.headerInfo.outArea;
      this.materialFilter.agreementCode = this.headerInfo.agreementCode;
    }

    const filter = {
      pageNum: this.materialDataConfig.pageNum,
      pageSize: this.materialDataConfig.pageSize,
      filters: this.materialFilter
    };
    this.materialDataConfig.loading = true;
    this.regionAllotService.getMaterialList(filter).subscribe((resData: RegionalAllocationServiceNs.UfastHttpResT<any>) => {
      this.materialDataConfig.loading = false;
      this.materialData = [];
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialData = resData.value.list.map((item) => {
        const temp = {};
        temp['materialsNo'] = item['materialCode'];
        temp['materialsDes'] = item['materialName'];
        temp['materialsType'] = item['materialType'];
        temp['unit'] = item['unit'];
        temp['locationCode'] = item['locationCode'];
        temp['enableNum'] = item['amount'];
        return temp;
      });
      this.materialDataConfig.total = resData.value.total;
      const selectedList = this.materialDataList.map((item) => {
        return item.materialsNo;
      });
      this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Checked, selectedList, true);
      this.checkMaterialList();

    }, (error: any) => {
      this.materialDataConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.materialDataList.length; i < len; i++) {
      this.materialDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.materialDataList.every((item, index, array) => {
        return item[this.tableConfig.checkRowField] === true;
      });
    }
  }


  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      event.list.forEach((item: any, index: number) => {
        const value = this.materialDataList.find(material => item.materialsNo === material.materialNo);
        if (!value) {
          const data = {
            materialNo: item.materialsNo,
            materialName: item.materialsDes,
            unit: item.unit,
            locationCode: item.locationCode,
            enableNum: item.enableNum,
            amount: 0,
            remark: '',
            maxAmount: item.enableNum
            // unitMeasLookupCode: item.unit,
            // barcodeFlag: item.barcodeFlag,
            // receiptCount: 0,
            // locationCode: item.locationCode,
            // keeperId: item.keeperId,
            // keeperName: item.keeperName,
          };
          data['_this'] = data;
          data['_lineId'] = Symbol();
          this.materialDataList = [...this.materialDataList, data];
        }
      });
    } else {
      event.list.forEach((item: any) => {
        this.materialDataList = this.materialDataList.filter(itemValue => itemValue.materialNo !== item.materialsNo);
      });
    }
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
  public delMaterialOne(materialNo) {
    const idList: string[] = [];
    this.materialDataList = this.materialDataList.filter((item) => {
      if (materialNo === item.materialNo) {
        idList.push(item[this.materialField]);
      }
      return materialNo !== item.materialNo;
    });
    if (this.materialDataList.length === 0) {
      this.tableConfig.checkAll = false;
    }
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, idList);
  }
  public batchDelMaterial() {
    const isHasSelected = this.materialDataList.some(item => item[this.tableConfig.checkRowField]);
    if (!isHasSelected) {
      this.messageService.showToastMessage('请选择要删除的物料', 'warning');
      return;
    }
    this.materialDataList = this.materialDataList.filter(item => !item[this.tableConfig.checkRowField]);
    this.tableConfig.checkAll = false;
  }
  /**
   * 单据详情
   */
  getRegionAllotItem(id) {
    this.messageService.showLoading();
    this.regionAllotService.getRegionAllotDetail(id).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.headerInfo = resData.value.headerInfo;
      this.formGroup.controls['outLocation'].patchValue(resData.value.headerInfo.outLocation);
      this.formGroup.controls['outArea'].patchValue(resData.value.headerInfo.outArea);
      // this.formGroup.controls['barcodeFlag'].patchValue(resData.value.headerInfo.barcodeFlag);
      this.formGroup.controls['barcodeFlag'].patchValue('1');
      this.formGroup.controls['agreementFlag'].patchValue(resData.value.headerInfo.agreementFlag);
      this.formGroup.controls['agreementCode'].patchValue(resData.value.headerInfo.agreementCode);
      resData.value.detailList.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['maxAmount'] = item['enableNum'];
        temp['_this'] = temp;
        this.materialDataList = [...this.materialDataList, temp];
      });
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onCancel() {
    this.finish.emit();
  }
  /**
   * 选择仓库
   */
  showWarehouseModal(): void {
    this.isOutWarehouseVisible = true;
    this.getWarehouseModalData();
  }
  getWarehouseModalData = () => {
    const filter = {
      pageNum: this.outWarehouseTableConfig.pageNum,
      pageSize: this.outWarehouseTableConfig.pageSize,
      filters: {
        pCode: '0',
        houseLevel: 1,
        // type: 0
      }
    };
    this.outWarehouseTableConfig.loading = true;
    this.regionAllotService.getWarehouseList(filter).subscribe((resData: RegionalAllocationServiceNs.UfastHttpResT<any>) => {
      this.outWarehouseTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.outWarehouseDataList = resData.value.list;
      this.outWarehouseTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.outWarehouseTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancel(): void {
    this.isOutWarehouseVisible = false;
  }
  public chooseWarehouseFun(code: string, type: number) {
    const originOutLocation = this.formGroup.controls['outLocation'].value;
    if (originOutLocation === code) {
      this.handleCancel();
      return;
    }
    this.formGroup.patchValue({
      outLocation: code,
      agreementCode: ''
    });
    this.materialDataList = [];
    this.materialData = [];
    if (this.warehouseType !== type) {
      this.formGroup.controls['inLocation'].patchValue('');
      this.formGroup.controls['inArea'].patchValue('');
    }
    this.warehouseType = type;
    this.formGroup.controls['outArea'].patchValue('');
    if (type === AgreementFlagEnum.True) {
      this.isAgreementCodeRequired = true;
      this.formGroup.controls['agreementFlag'].patchValue(AgreementFlagEnum.True);
      this.formGroup.controls['agreementCode'].enable();
    } else {
      this.isAgreementCodeRequired = false;
      this.formGroup.controls['agreementFlag'].patchValue(AgreementFlagEnum.False);
      this.formGroup.controls['agreementCode'].patchValue('');
      this.formGroup.controls['agreementCode'].disable();
    }
    this.handleCancel();
  }
  /**
 * 选择库区
 */
  showAreaModal(): void {
    if (this.formGroup.controls['outLocation'].invalid) {
      this.messageService.showToastMessage('请选择调出仓库', 'error');
      return;
    }
    this.isOutAreaVisible = true;
    this.getAreaModalData();
  }
  getAreaModalData = () => {
    const filter = {
      pageNum: this.outAreaTableConfig.pageNum,
      pageSize: this.outAreaTableConfig.pageSize,
      filters: {
        pCode: this.formGroup.controls['outLocation'].value,
        houseLevel: 2,
        type: this.warehouseType
      }
    };
    this.outAreaTableConfig.loading = true;
    this.regionAllotService.getWarehouseList(filter).subscribe((resData: RegionalAllocationServiceNs.UfastHttpResT<any>) => {
      this.outAreaTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.outAreaDataList = resData.value.list;
      this.outAreaTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.outAreaTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancelArea(): void {
    this.isOutAreaVisible = false;
  }
  public chooseAreaFun(item: any) {
    const outAreaTemp = this.formGroup.controls['outArea'].value;
    if (outAreaTemp !== item) {
      this.materialDataList = [];
      this.materialData = [];
    }
    this.formGroup.patchValue({
      outArea: item,
      agreementCode: ''
    });
    this.handleCancelArea();
  }

  /**
 * 选择调入仓库
 */
  showInWarehouseModal(): void {
    this.isInWarehouseVisible = true;
    this.getInWarehouseModalData();
  }
  getInWarehouseModalData = () => {
    if (this.formGroup.controls['outLocation'].invalid) {
      this.messageService.showToastMessage('请选择调出仓库', 'error');
      return;
    }
    const filter = {
      pageNum: this.inWarehouseTableConfig.pageNum,
      pageSize: this.inWarehouseTableConfig.pageSize,
      filters: {
        pCode: '0',
        houseLevel: 1,
        type: this.warehouseType
      }
    };
    this.inWarehouseTableConfig.loading = true;
    this.regionAllotService.getWarehouseList(filter).subscribe((resData: RegionalAllocationServiceNs.UfastHttpResT<any>) => {
      this.inWarehouseTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.inWarehouseDataList = resData.value.list;
      this.inWarehouseTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.inWarehouseTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancelInWarehouse(): void {
    this.isInWarehouseVisible = false;
  }
  public chooseInWarehouseFun(item: any) {
    this.formGroup.patchValue({
      inLocation: item,
    });
    this.formGroup.controls['inArea'].patchValue('');
    this.handleCancelInWarehouse();
  }

  /**
* 选择调入库区
*/
  showInAreaModal(): void {
    if (this.formGroup.controls['inLocation'].invalid) {
      this.messageService.showToastMessage('请选择调入仓库', 'error');
      return;
    }
    this.isInAreaVisible = true;
    this.getInAreaModalData();
  }
  getInAreaModalData = () => {
    const filter = {
      pageNum: this.inAreaTableConfig.pageNum,
      pageSize: this.inAreaTableConfig.pageSize,
      filters: {
        pCode: this.formGroup.controls['inLocation'].value,
        houseLevel: 2,
        type: this.warehouseType
      }
    };
    this.inAreaTableConfig.loading = true;
    this.regionAllotService.getWarehouseList(filter).subscribe((resData: RegionalAllocationServiceNs.UfastHttpResT<any>) => {
      this.inAreaTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.inAreaDataList = resData.value.list;
      this.inAreaTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.inAreaTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancelInArea(): void {
    this.isInAreaVisible = false;
  }
  public chooseInAreaFun(item: any) {
    this.formGroup.patchValue({
      inArea: item,
    });
    this.handleCancelInArea();
  }

  public submit() {
    if (!this.editId) {
      Object.keys(this.formGroup.controls).forEach((keys) => {
        this.formGroup.controls[keys].markAsDirty();
        this.formGroup.controls[keys].updateValueAndValidity();
      });
      if (this.formGroup.invalid) {
        return;
      }
      if (this.formGroup.controls['agreementFlag'].value === AgreementFlagEnum.True &&
        !this.formGroup.controls['agreementCode'].value.trim()) {
        this.messageService.showToastMessage('协议号不可为空', 'warning');
        return;
      }
      this.headerInfo = this.formGroup.getRawValue();
    }
    if (!this.materialDataList.length) {
      this.messageService.showToastMessage('请选择物料', 'warning');
      return;
    }
    const detailList = [];
    let isHasAmountError = false;
    for (let i = 0, len = this.materialDataList.length; i < len; i++) {
      const item = this.materialDataList[i];
      if (!item.amount) {
        isHasAmountError = true;
      }
      const temp = {
        materialNo: item.materialNo,
        materialName: item.materialName,
        unit: item.unit,
        locationCode: item.locationCode,
        amount: item.amount,
        remark: item.remark
      };
      detailList.push(temp);
    }
    if (isHasAmountError) {
      this.messageService.showToastMessage('申请数量不能为空和0', 'warning');
      return;
    }
    const data = {
      headerInfo: this.headerInfo,
      detailList
    };
    let submit = null;
    if (this.editId) {
      data.headerInfo.id = this.editId;
      submit = this.regionAllotService.editRegionAllot(data);
    } else {
      submit = this.regionAllotService.addRegionAllot(data);
    }
    this.messageService.showLoading();
    submit.subscribe((resData: RegionalAllocationServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.onCancel();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public submitAudit() {
    if (!this.editId) {
      Object.keys(this.formGroup.controls).forEach((keys) => {
        this.formGroup.controls[keys].markAsDirty();
        this.formGroup.controls[keys].updateValueAndValidity();
      });
      if (this.formGroup.invalid) {
        return;
      }
      if ((this.formGroup.controls['agreementFlag'].value === AgreementFlagEnum.True) &&
        (!this.formGroup.controls['agreementCode'].value.trim())) {
        this.messageService.showToastMessage('协议号不可为空', 'error');
        return;
      }
      this.headerInfo = this.formGroup.getRawValue();
    }
    if (this.editId) {
      this.headerInfo.id = this.editId;
    }
    if (!this.materialDataList.length) {
      this.messageService.showToastMessage('请选择物料', 'error');
      return;
    }
    const detailList = [];
    let isHasAmountError = false;
    for (let i = 0, len = this.materialDataList.length; i < len; i++) {
      const item = this.materialDataList[i];
      if (item.amount <= 0) {
        isHasAmountError = true;
      }
      const temp = {
        materialNo: item.materialNo,
        materialName: item.materialName,
        unit: item.unit,
        locationCode: item.locationCode,
        amount: item.amount,
        remark: item.remark
      };
      detailList.push(temp);
    }
    if (isHasAmountError) {
      this.messageService.showToastMessage('申请数量不能为空和0', 'warning');
      return;
    }
    const data = {
      headerInfo: this.headerInfo,
      detailList
    };
    this.messageService.showLoading();
    this.regionAllotService.auditPass(data).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.onCancel();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 显示导入物料模态框
  showToLeadModal(pageNum?: number): void {
    if (this.formGroup.controls['outArea'].invalid) {
      this.messageService.showToastMessage('请选择调出库区', 'error');
      return;
    }
    if (this.formGroup.controls['barcodeFlag'].invalid) {
      this.messageService.showToastMessage('请选择是否条码管理', 'error');
      return;
    }
    if ((this.formGroup.controls['agreementFlag'].value === AgreementFlagEnum.True) &&
      (!this.formGroup.controls['agreementCode'].value.trim())) {
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
    if (!this.fileList.length) {
      this.messageService.showToastMessage('请选择要导入的文件', 'warning');
      return;
    }
    this.messageService.showLoading();
    this.fileList.forEach((file: any) => {
      this.formData.append('files[]', file);
    });
    this.formData.append('barcodeFlag', this.formGroup.value.barcodeFlag);
    this.formData.append('warehouseCode', this.formGroup.value.outLocation);
    this.formData.append('areaCode', this.formGroup.value.outArea);
    if (this.editId) {
      this.formData.append('agreementCode', this.headerInfo.agreementCode);
    } else {
      this.formData.append('agreementCode', this.formGroup.value.agreementCode.trim());
    }
    const req = new HttpRequest('POST', this.leadInUrl, this.formData, {});
    this.http.request(req).subscribe((event: any) => {
      if (event.type === 4) {
        this.messageService.closeLoading();
        if (event.body.code !== 0) {
          this.errorMessage = event.body.value || [];
          this.messageService.showToastMessage(event.body.message, 'error');
          this.formData = new FormData;
          return;
        }
        this.fileList = [];
        this.materialDataList = event.body.value;
        this.materialsObj = {};
        this.isToLeadVisible = false;
        this.materialDataList.forEach((item) => {
          item._this = item;
          this.materialsObj[item.materialNo] = { amount: item.amount };
        });
        this.formData = new FormData;
        this.messageService.closeLoading();
        this.messageService.showToastMessage('操作成功', 'success');
      }
    }, err => {
      this.messageService.showAlertMessage('', 'upload failed.', 'error');
      this.messageService.closeLoading();
    });
  }
  removeFile = (file) => {
    this.fileList = [];
    this.errorMessage = [];
    return false;
  }
  handleToLeadCancel(): void {
    this.isToLeadVisible = false;
  }
  ngOnInit() {
    this.outWarehouseTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '仓库编号', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 100 },
      { title: '操作', tdTemplate: this.chooseWarehouse, width: 100 }]
    };
    this.outAreaTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '库区编号', field: 'code', width: 100 },
      { title: '库区描述', field: 'remark', width: 100 },
      { title: '操作', tdTemplate: this.chooseArea, width: 100 }]
    };
    this.inWarehouseTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '仓库编号', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 100 },
      { title: '操作', tdTemplate: this.chooseInWarehouse, width: 100 }]
    };
    this.inAreaTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '库区编号', field: 'code', width: 100 },
      { title: '库区描述', field: 'remark', width: 100 },
      { title: '操作', tdTemplate: this.chooseInArea, width: 100 }]
    };
    const tableHeaders: UfastTableNs.TableHeader[] = [
      { title: '操作', tdTemplate: this.tableOpTpl, width: 100, fixed: true },
      { title: '物料编码', field: 'materialCode', width: 100 },
      { title: '物料名称', width: 200, field: 'materialName' },
      { title: '单位', field: 'unit', width: 100 },
      { title: '默认储位', field: 'locationCode', width: 100 },
      { title: '实际库存', field: 'enableNum', width: 100 },
      // { title: '意向占用', field: 'unit', width: 100 },
      // { title: '发货占用', field: 'unit', width: 100 },
      { title: '申请数量', tdTemplate: this.numTpl, width: 100 },
      { title: '备注', tdTemplate: this.noteTpl, width: 100 }
    ];
    this.formGroup = this.formBuilder.group({
      outLocation: [null, Validators.required],
      outArea: [null, Validators.required],
      inLocation: [null, Validators.required],
      inArea: [null, Validators.required],
      barcodeFlag: [null, Validators.required],
      // name: [null, Validators.required],
      applyName: [{ value: null, disabled: true }],
      applyDate: [{ value: new Date, disabled: true }],
      deptName: [{ value: null, disabled: true }],
      agreementFlag: [{ value: null, disabled: true }],
      agreementCode: [''],
    });
    this.tableConfig = {
      checkAll: false,
      showCheckbox: true,
      showPagination: true,
      checkRowField: '_checkML',
      loading: false,
      frontPagination: true,
      pageNum: 1,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      headers: [
        { title: '操作', tdTemplate: this.tableOpTpl, width: 100, fixed: true },
        { title: '物料编码', field: 'materialNo', width: 100 },
        { title: '物料名称', width: 200, field: 'materialName' },
        { title: '单位', field: 'unit', width: 100 },
        // { title: '默认储位', field: 'locationCode', width: 100 },
        { title: '实际库存', field: 'enableNum', width: 100 },
        // { title: '意向占用', field: '', width: 100 },
        // { title: '发货占用', field: '', width: 100 },
        { title: '申请数量', tdTemplate: this.numTpl, width: 100 },
        { title: '备注', tdTemplate: this.noteTpl, width: 150 },
      ]
    };
    this.materialDataConfig = {
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
    this.getUserInfo();
    if (this.editId) {
      this.formGroup.addControl('allotOrder', this.formBuilder.control(null));
      this.formGroup.controls['allotOrder'].disable();
      this.getRegionAllotItem(this.editId);
      // this.tableConfig.headers.push(
      //   { title: '调出完成数', field: '', width: 100 },
      //   { title: '调入完成数', field: '', width: 100 }
      // );
    }
  }

}
