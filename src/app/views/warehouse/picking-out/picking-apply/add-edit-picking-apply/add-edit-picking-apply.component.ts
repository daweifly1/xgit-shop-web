import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { RightSideTableBoxNs, UfastTableNs } from '../../../../../layout/layout.module';
import {
  PickingApplyService,
  PickingApplyServiceNs
} from '../../../../../core/trans/picking-apply.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserServiceNs } from '../../../../../core/common-services/user.service';
import { UfastValidatorsService } from '../../../../../core/infra/validators/validators.service';
import { DictionaryService, DictionaryServiceNs } from '../../../../../core/common-services/dictionary.service';
import { WarehouseServiceNs, WarehouseService } from '../../../../../core/trans/warehouse.service';
import { environment } from '../../../../../../environments/environment';
import { OtherwarehouseService, OtherWarehouseServiceNs } from '../../../../../core/trans/otherwarehouse.service';
enum InputMaxLenEnum {
  BusinessEntity = 50,
  Consignee = 50,
  ConsigneeAddr = 50,
  Proposer = 50,
  Default = 50
}
interface DataDictItem {
  id: string;
  name: string;
}
enum ApplyEnum {
  Num = 99999999.99
}
interface KeeperNameType {
  name?: string;
}
enum OutTypeEnum {
  OutType = '让售例外出入库'
}
@Component({
  selector: 'app-add-edit-picking-apply',
  templateUrl: './add-edit-picking-apply.component.html',
  styleUrls: ['./add-edit-picking-apply.component.scss']
})
export class AddEditPickingApplyComponent implements OnInit {
  @Input() orderNo: string;   // 订单id
  @Output() finish: EventEmitter<any>;
  @ViewChild('tableOpTpl') tableOpTpl: TemplateRef<any>;
  @ViewChild('numTpl') numTpl: TemplateRef<any>;
  @ViewChild('needDateTpl') needDateTpl: TemplateRef<any>;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
  @ViewChild('chooseApplyDepartment') chooseApplyDepartment: TemplateRef<any>;
  @ViewChild('chooseReceiverName') chooseReceiverName: TemplateRef<any>;
  @ViewChild('chooseClient') chooseClient: TemplateRef<any>;
  isAddOrder: boolean;
  materialListConfig: UfastTableNs.TableConfig;
  materialDetailList: PickingApplyServiceNs.MaterialDetailForPickApply[];
  showMaterialBox: boolean;
  rightTableConfig: UfastTableNs.TableConfig;     // 右侧选择物料表配置
  rightDataList: PickingApplyServiceNs.MaterialDetailForPickApply[];
  rightTableChange: EventEmitter<any>;

  formGroup: FormGroup;
  InputMaxLen = InputMaxLenEnum;
  userInfo: UserServiceNs.UserInfoModel;

  filterMaterial: any;
  materialField: string;
  materialEmitter: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;

  materialTypeList: DataDictItem[];

  currMaxRowNo: number; // 当前所选物料的最大行号
  /**
   * 配送方式
   */
  deliveryMethodList: any[];
  deliveryMethod: number;
  applyMax = ApplyEnum;
  /**物料搜索条件保管员 */
  isVisiblekeeperName: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];
  filters: any;
  keeperNameFilter: KeeperNameType;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  storageTypeList: any[];
  isRequired: boolean;
  applyDepartmentVisible: boolean;
  applyDepartmentTableConfig: UfastTableNs.TableConfig;
  applyDepartmentDataList: any[];
  /**收货人 */
  isVisibleReceiverName: boolean;
  receiverNameTableConfig: UfastTableNs.TableConfig;
  receiverNameList: any[];
  receiverNameFilter: any;
  /**客户 */
  clientRequired: boolean;
  isVisibleClient: boolean;
  clientTableConfig: UfastTableNs.TableConfig;
  clientList: any[];
  clientFilter: any;
  OutType = OutTypeEnum;

  constructor(private dataService: PickingApplyService, private messageService: ShowMessageService,
    private formBuilder: FormBuilder, private userService: UserService, private ufastValidatorsService: UfastValidatorsService,
    private dictionaryService: DictionaryService,
    private warehouseService: WarehouseService,
    private otherWarehouseService: OtherwarehouseService
  ) {
    this.isAddOrder = false;
    this.materialTypeList = [
      { id: '1', name: '材料' },
      { id: '2', name: '备件' },
      { id: '3', name: '设备' }
    ];
    this.materialField = 'materialCode';
    this.materialEmitter = new EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>();
    this.filterMaterial = {};

    this.userInfo = null;
    this.orderNo = null;
    this.finish = new EventEmitter<any>();
    this.materialDetailList = [];
    this.showMaterialBox = false;
    this.rightDataList = [];
    this.rightTableChange = new EventEmitter<any>();
    this.currMaxRowNo = 0;
    this.deliveryMethod = 0;
    this.isVisiblekeeperName = false;
    this.keeperNameDataList = [];
    this.filters = '';
    this.keeperNameFilter = {};
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
    this.storageTypeList = [];
    this.isRequired = false;
    this.applyDepartmentVisible = false;
    this.applyDepartmentDataList = [];
    this.isVisibleReceiverName = false;
    this.receiverNameList = [];
    this.receiverNameFilter = {};
    this.clientRequired = false;
    this.isVisibleClient = false;
    this.clientList = [];
    this.clientFilter = {};
  }
  public getStorageTypeList() {
    const filter = {
      pageNum: 0,
      pageSize: 0,
      filters: {}
    };
    this.otherWarehouseService.getBillTypeConfigList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.storageTypeList = resData.value.list;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public typeChange(event) {
    this.formGroup.patchValue({
      applyDepartmentCode: '',
      applyDepartment: '',
      receiverName: '',
      receiverNumber: '',
      receiverAddress: ''
    });
    const typeItem = this.storageTypeList.filter((item) => {
      return item.id === event;
    });
    if (!typeItem.length) {
      return;
    }
    this.formGroup.controls['type'].patchValue(typeItem[0].type);
    if (this.formGroup.controls['type'].value === this.OutType.OutType) {
      this.clientRequired = true;
    } else {
      this.clientRequired = false;
    }
    if (typeItem[0].isSynsap) {
      this.isRequired = true;
      this.formGroup.controls['applyDepartmentCode'].setValidators([Validators.required]);
      this.formGroup.controls['applyDepartment'].setValidators([Validators.required]);
    }
    if (!typeItem[0].isSynsap) {
      this.isRequired = false;
      this.formGroup.controls['applyDepartmentCode'].clearValidators();
      this.formGroup.controls['applyDepartment'].clearValidators();
      this.formGroup.controls['applyDepartmentCode'].updateValueAndValidity();
    }
    if (this.clientRequired) {
      this.formGroup.controls['customerId'].setValidators([Validators.required]);
      this.formGroup.controls['customerName'].setValidators([Validators.required]);
    } else {
      this.formGroup.controls['customerId'].clearValidators();
      this.formGroup.controls['customerName'].clearValidators();
    }
  }
  showApplyDepartmentModal(): void {
    if (this.formGroup.controls['typeId'].invalid) {
      this.messageService.showToastMessage('请选择出库类型', 'warning');
      return;
    }
    this.applyDepartmentVisible = true;
    this.getApplyDepartmentDataList();
  }
  getApplyDepartmentDataList = () => {
    this.applyDepartmentDataList = [];
    this.applyDepartmentTableConfig.loading = true;
    this.otherWarehouseService.getInType(this.formGroup.controls['typeId'].value).subscribe((resData: any) => {
      this.applyDepartmentTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.applyDepartmentDataList = [];
      resData.value.detailList.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.applyDepartmentDataList.push(temp);
      });
    }, (error: any) => {
      this.applyDepartmentTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancelApplyDepartment(): void {
    this.applyDepartmentVisible = false;
  }
  public chooseApplyDepartmentFun(ctx) {
    this.formGroup.patchValue({
      applyDepartmentCode: ctx.innerOrder,
      applyDepartment: ctx.innerOrderNote,
      receiverName: '',
      receiverNumber: '',
      receiverAddress: ''
    });
    this.handleCancelApplyDepartment();
  }
  public clearApplyDepartment() {
    this.formGroup.patchValue({
      applyDepartmentCode: '',
      applyDepartment: ''
    });
    if (this.isRequired) {
      this.formGroup.patchValue({
        receiverName: '',
        receiverNumber: '',
        receiverAddress: ''
      });
    }
  }

  /**
   * 需要日期
   */
  disabledEnd = (needDate: Date) => {
    if (!needDate || !this.formGroup.getRawValue().applyDate) {
      return false;
    }
    return needDate.getTime() <= this.formGroup.getRawValue().applyDate.getTime();
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public onMainChecked(event: UfastTableNs.SelectedChange) {
    const checked = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
    if (event.index === -1) {
      this.materialListConfig.checkAll = checked;
      this.materialDetailList.forEach((item: any) => {
        item[this.materialListConfig.checkRowField] = checked;
      });
      return;
    }
    this.materialListConfig.checkAll = checked;
    if (checked) {
      for (let i = 0, len = this.materialDetailList.length; i < len; i++) {
        if (!this.materialDetailList[this.materialListConfig.checkRowField]) {
          this.materialListConfig.checkAll = false;
          break;
        }
      }
    }
  }
  public clearKeeperName() {
    this.filterMaterial.keeperName = '';
    this.filterMaterial.keeperId = '';

  }
  public onCancel() {
    this.finish.emit();
  }
  /**物料类型发生变化时，选中的物料 */
  public materialTypeChange() {
    this.materialDetailList = [];
  }
  public onChooseMaterial() {
    this.showMaterialBox = !this.showMaterialBox;
    if (this.showMaterialBox) {
      this.getFactoryMaterialList();
    }
  }
  /**
   * @checkChooseMaterial: 左侧物料删除时，发射事件
   * **/
  private checkChooseMaterial(type: number, idList: string[], updateOrigin: boolean = false, all: boolean = false) {
    const event: RightSideTableBoxNs.SelectedChangeEvent = {
      type: type,
      all: all,
      idList: idList,
      updateOrigin: updateOrigin
    };
    this.materialEmitter.emit(event);
  }

  /**
   * 订阅右边栏表格组件的check事件
   */
  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      this.materialListConfig.checkAll = false;
      event.list.forEach((item: any, index: number) => {
        const hasExistItem = this.materialDetailList.find(material => item[this.materialField] === material[this.materialField]);
        if (hasExistItem) {
          return;
        }
        item.amountApply = 0;
        item.needDate = new Date();
        item.materialType = item.materialType;
        item.plannerName = item.plannerName;
        item.barcodeFlag = item.barcodeFlag;
        item['_this'] = item;
        item.rowNo = ++this.currMaxRowNo;
        this.materialDetailList = [...this.materialDetailList, item];
      });
    } else {
      event.list.forEach((item: any) => {
        this.materialDetailList = this.materialDetailList.filter(itemValue => itemValue[this.materialField] !== item[this.materialField]);
        this.currMaxRowNo = 0;
        this.materialDetailList.forEach((materialItem) => {
          materialItem.rowNo = ++this.currMaxRowNo;
        });
      });
    }
  }
  private reflowRowNo() {
    if (!this.isAddOrder) {
      return;
    }
    this.materialDetailList.forEach((item, index: number) => {
      item.rowNo = index + 1;
    });
    this.currMaxRowNo = this.materialDetailList.length;
  }
  public deleteMaterialOne(materialCode: string) {
    const idList: string[] = [];
    this.materialDetailList = this.materialDetailList.filter((item) => {
      return (item.materialCode !== materialCode);
    });
    if (this.materialDetailList.length === 0) {
      this.materialListConfig.checkAll = false;
    }
    this.reflowRowNo();
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, idList);
  }
  /**
   * @delteMaterial:删除选中得物料
   * **/
  public deleteMaterial() {
    const idList: string[] = [];
    this.materialDetailList = this.materialDetailList.filter((item) => {
      if (item[this.materialListConfig.checkRowField]) {
        idList.push(item[this.materialField]);
      }
      return !item[this.materialListConfig.checkRowField];
    });

    if (this.materialDetailList.length === 0) {
      this.materialListConfig.checkAll = false;
    }
    if (idList.length > 0) {
      this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, idList);
    } else {
      this.messageService.showToastMessage('请选择要删除的物料', 'warning');
    }
    this.reflowRowNo();
  }
  getFactoryMaterialList = () => {
    Object.keys(this.filterMaterial).filter(item => typeof this.filterMaterial[item] === 'string').forEach((key: string) => {
      this.filterMaterial[key] = this.filterMaterial[key].trim();
    });
    this.filterMaterial.materialType = this.formGroup.value.materialType;
    const filter = {
      pageNum: this.rightTableConfig.pageNum,
      pageSize: this.rightTableConfig.pageSize,
      filters: this.filterMaterial
    };
    this.rightTableConfig.loading = true;
    this.rightDataList = [];
    this.dataService.getFactoryMaterilList(filter)
      .subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
        this.rightTableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.rightTableConfig.total = resData.value.total;
        this.rightDataList = resData.value.list.map((item: PickingApplyServiceNs.FactoryMaterialDetail, index) => {
          item.materialVO = item.materialVO || <any>{
            code: new Date().getTime() + index
          };
          const temp: PickingApplyServiceNs.MaterialDetailForPickApply = {
            id: item.materialId,
            materialCode: item.materialVO.code,
            materialName: item.materialVO.materialDesc,
            amountApply: 0,
            unit: <any>item.materialVO.unit,     // todo 后端单位类型没统一
            rowNo: 0,
            materialType: item.materialVO.materialType,
            plannerName: item.planner,
            barcodeFlag: item.managementMode
          };
          return temp;
        });
        const selectedList = [];
        this.materialDetailList.forEach((item) => {
          selectedList.push(item[this.materialField]);
        });
        this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Checked, selectedList, true);
      }, (error) => {
        this.rightTableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  private getUserInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<UserServiceNs.UserInfoModel>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
        return;
      }
      this.userInfo = resData.value;
      this.formGroup.patchValue({
        applyName: this.userInfo.name
      });
      this.clientFilter.organizationId = this.userInfo.spaceId;
    }, (error) => {
      this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
    });
  }
  getFormControl(name) {
    return this.formGroup.controls[name];
  }
  public saveOrder() {
    this.submitByType(PickingApplyServiceNs.SubmitType.StashSave);
  }
  public submitOrder() {
    this.submitByType(PickingApplyServiceNs.SubmitType.Submit);
  }
  private submitByType(type: PickingApplyServiceNs.SubmitType) {
    Object.keys(this.formGroup.controls).forEach(key => {
      this.formGroup.controls[key].markAsDirty();
      this.formGroup.controls[key].updateValueAndValidity();
    });
    if (this.formGroup.invalid) {
      return;
    }
    if (this.materialDetailList.length === 0) {
      this.messageService.showToastMessage('物料不能为空', 'warning');
      return;
    }
    const submitData = this.formGroup.getRawValue();
    submitData.pickingApplyDetailVOs = [];
    for (let i = 0, len = this.materialDetailList.length; i < len; i++) {
      const temp = Object.assign({}, this.materialDetailList[i]);
      temp['_this'] = undefined;
      if (temp.amountApply <= 0) {
        this.messageService.showToastMessage('不可以存在申请数量为0的物料', 'warning');
        return;
      }
      submitData.pickingApplyDetailVOs.push(temp);
    }

    let submitHandler = null;
    if (type) {
      if (this.isAddOrder) {
        submitData.applyNo = undefined;
        submitData.status = 1;
        submitHandler = this.dataService.insertOrder(submitData);
      } else {
        submitData['id'] = this.orderNo;
        submitData.status = 1;
        submitHandler = this.dataService.updateOrder(submitData);
      }
    } else {
      if (this.isAddOrder) {
        submitData.applyNo = undefined;
        submitData.status = 0;
        submitHandler = this.dataService.insertOrder(submitData);
      } else {
        submitData['id'] = this.orderNo;
        submitData.status = 0;
        submitHandler = this.dataService.updateOrder(submitData);
      }
    }

    this.messageService.showLoading();
    submitHandler.subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.finish.emit();
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private getOrderDetail() {
    this.dataService.getOrderDetail(this.orderNo)
      .subscribe((resData: PickingApplyServiceNs.PickingApplyResT<PickingApplyServiceNs.PickingApplyOrder>) => {
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        if (resData.value.applyDepartmentCode) {
          this.isRequired = true;
          this.formGroup.controls['applyDepartmentCode'].setValidators([Validators.required]);
          this.formGroup.controls['applyDepartment'].setValidators([Validators.required]);
        } else {
          this.isRequired = false;
          this.formGroup.controls['applyDepartmentCode'].clearValidators();
          this.formGroup.controls['applyDepartment'].clearValidators();
          this.formGroup.controls['applyDepartmentCode'].updateValueAndValidity();
        }
        if (resData.value.type === this.OutType.OutType) {
          this.clientRequired = true;
          this.formGroup.controls['customerId'].setValidators([Validators.required]);
          this.formGroup.controls['customerName'].setValidators([Validators.required]);
        } else {
          this.clientRequired = false;
          this.formGroup.controls['customerId'].clearValidators();
          this.formGroup.controls['customerName'].clearValidators();
        }
        const fieldList = ['applyNo', 'orgName', 'type', 'typeId', 'applyDepartmentCode', 'applyDepartment',
          'section', 'isDistribution',
          'receiverName', 'receiverNumber', 'receiverAddress', 'applyName', 'applyDate', 'customerId', 'customerName'];
        const temp = {};
        fieldList.forEach((key: string) => {
          temp[key] = resData.value[key];
        });
        temp['applyDate'] = new Date(temp['applyDate']);
        this.formGroup.patchValue(temp);
        // this.formGroup.patchValue(resData.value);
        // this.formGroup.controls['applyDate'].patchValue(new Date());
        this.materialDetailList = resData.value.pickingApplyDetailVOs;
        this.materialDetailList.forEach((item) => {
          item['plannerName'] = item['planner'];
          item['_this'] = item;
          this.currMaxRowNo = item.rowNo > this.currMaxRowNo ? item.rowNo : this.currMaxRowNo;
        });
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public getCompanyName() {
    this.dataService.getWorkSpaceName().subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.formGroup.patchValue({
        orgName: resData.value
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public deliveryMethodChange(event) {
    this.deliveryMethod = event;
    if (event) {
      this.formGroup.controls['receiverName'].setValidators([Validators.required,
      Validators.maxLength(this.InputMaxLen.Default)]);
      this.formGroup.controls['receiverNumber'].setValidators([Validators.required, this.ufastValidatorsService.mobileOrTeleValidator()]);
      this.formGroup.controls['receiverAddress'].setValidators([Validators.required,
      Validators.maxLength(this.InputMaxLen.Default), this.ufastValidatorsService.blankValidator()]);
    } else {
      this.formGroup.controls['receiverName'].setValidators([
        Validators.maxLength(this.InputMaxLen.Default)]);
      this.formGroup.controls['receiverNumber'].setValidators([this.ufastValidatorsService.mobileOrTeleValidator()]);
      this.formGroup.controls['receiverAddress'].setValidators([
        Validators.maxLength(this.InputMaxLen.Default)]);
      // this.formGroup.controls['receiverName'].clearValidators();
      // this.formGroup.controls['receiverNumber'].clearValidators();
      // this.formGroup.controls['receiverAddress'].updateValueAndValidity();
    }
  }
  showVisiblekeeperNameModal(pageNum?: number): void {
    this.isVisiblekeeperName = true;
    this.getKeeperNameModalData(pageNum);

  }
  getKeeperNameModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        name: this.filters.name,
      }
    };
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseKeeperNameFun(item: any, userId: string) {
    this.filterMaterial.keeperName = item;
    this.filterMaterial.keeperId = userId;
    this.handleCancelKeeperName();
  }
  public searchKeeperName(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        name: this.keeperNameFilter.name
      }
    };
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }

  handleCancelKeeperName(): void {
    this.isVisiblekeeperName = false;
  }
  getReceiverNameList = () => {
    Object.keys(this.receiverNameFilter).filter(item => typeof this.receiverNameFilter[item] === 'string').forEach((key: string) => {
      this.receiverNameFilter[key] = this.receiverNameFilter[key].trim();
    });

    // if (this.isRequired) {
    this.receiverNameFilter.departmentCode = this.formGroup.controls['applyDepartmentCode'].value;
    // }
    const filter = {
      pageNum: this.receiverNameTableConfig.pageNum,
      pageSize: this.receiverNameTableConfig.pageSize,
      filters: this.receiverNameFilter
    };
    this.receiverNameList = [];
    this.dataService.getReceiverNameList(filter).subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.receiverNameList.push(temp);
      });
      this.receiverNameTableConfig.total = resData.value.total;
    });
  }
  showReceiverNameModal(): void {
    if (this.formGroup.controls['type'].invalid) {
      this.messageService.showToastMessage('请先选择出库类型', 'warning');
      return;
    }
    if (this.isRequired && !this.formGroup.controls['applyDepartmentCode'].value) {
      this.messageService.showToastMessage('请先选择部门编号', 'warning');
      return;
    }
    if (this.formGroup.controls['isDistribution'].invalid) {
      this.messageService.showToastMessage('请先选择配送方式', 'warning');
      return;
    }
    this.isVisibleReceiverName = true;
    this.getReceiverNameList();
  }
  public chooseReceiverNameFun(ctx: any) {
    this.formGroup.patchValue({
      receiverName: ctx.receiptContactName,
      receiverNumber: ctx.receiptContactPhone,
      receiverAddress: ctx.receiptAddress,
    });
    this.handleCancelReceiverName();
  }
  handleCancelReceiverName(): void {
    this.isVisibleReceiverName = false;
    this.receiverNameFilter = {};
  }
  public clearReceiverName() {
    this.formGroup.patchValue({
      receiverName: ''
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

    this.dataService.getClientList(filter).subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
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
    if (this.formGroup.controls['type'].invalid) {
      this.messageService.showToastMessage('请先选择出库类型', 'warning');
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
    this.formGroup.patchValue({
      customerId: ctx.accountNumber,
      customerName: ctx.partyName,
    });
    this.handleCancelClient();
  }
  public clearCustomerName() {
    this.formGroup.patchValue({
      customerId: '',
      customerName: ''
    });
  }
  ngOnInit() {
    this.getStorageTypeList();
    this.materialListConfig = {
      checkAll: false,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      pageSize: 10,
      checkRowField: '_checkML',
      loading: false,
      frontPagination: true,
      headers: [
        { title: '操作', tdTemplate: this.tableOpTpl, width: 100, fixed: true },
        { title: '行号', field: 'rowNo', width: 80, fixed: true },
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '物料名称', width: 200, field: 'materialName' },
        { title: '单位', field: 'unit', width: 100 },
        { title: '物料类别', field: 'materialType', width: 100, pipe: 'materialType2' },
        { title: '申请数量', tdTemplate: this.numTpl, width: 100 },
        { title: '需要日期', tdTemplate: this.needDateTpl, width: 150 },
        { title: '计划员', field: 'plannerName', width: 100 },
        { title: '是否条码管理', field: 'barcodeFlag', width: 120, pipe: 'barcodeManage' }
      ]
    };
    this.rightTableConfig = {
      checkAll: false,
      showCheckbox: true,
      checkRowField: '_checkMR',
      showPagination: true,
      pageSize: 10,
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      loading: false,
      yScroll: 500,
      headers: [
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '物料名称', field: 'materialName', width: 150 }
      ]
    };
    this.formGroup = this.formBuilder.group({
      applyNo: [{ value: '系统生成', disabled: true }, [Validators.required]],
      orgName: [{ value: null, disabled: true }, [Validators.required, Validators.maxLength(this.InputMaxLen.BusinessEntity)]],
      type: [null, Validators.required],
      typeId: [null, Validators.required],
      applyDepartmentCode: [null],
      applyDepartment: [{ value: null, disabled: true }],
      section: [null],
      isDistribution: [0, [Validators.required]],
      // plannerName: [null, [Validators.required, Validators.maxLength(this.InputMaxLen.Default),
      // this.ufastValidatorsService.blankValidator()]],
      // needDate: [null, [Validators.required]],
      receiverName: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      receiverNumber: [null, [this.ufastValidatorsService.mobileOrTeleValidator()]],
      receiverAddress: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      applyName: [{ value: null, disabled: true }, [Validators.required, Validators.maxLength(this.InputMaxLen.Proposer)]],
      applyDate: [{ value: new Date(), disabled: true }, [Validators.required]],
      customerId: [null],
      customerName: [null]
    });
    if (!this.orderNo) {      //  新增
      this.isAddOrder = true;
      this.getUserInfo();
      this.getCompanyName();
    } else {
      this.getOrderDetail();
    }
    this.dataService.getDeliveryMethodList().subscribe((deliveryMethodList) => {
      this.deliveryMethodList = deliveryMethodList;
    });
    this.keeperNameTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '保管员名称', field: 'name', width: 100 },
      { title: '保管员编号', field: 'userId', width: 150 },
      { title: '操作', tdTemplate: this.chooseKeeperName, width: 60 }
      ]
    };
    this.applyDepartmentTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '部门编号', field: 'innerOrder', width: 100 },
      { title: '部门名称', field: 'innerOrderNote', width: 150 },
      { title: '操作', tdTemplate: this.chooseApplyDepartment, width: 60 }
      ]
    };
    this.receiverNameTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '收货人', field: 'receiptContactName', width: 100 },
      { title: '收货人电话', field: 'receiptContactPhone', width: 150 },
      { title: '收货人地址', field: 'receiptAddress', width: 150 },
      { title: '操作', tdTemplate: this.chooseReceiverName, width: 60 }
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
