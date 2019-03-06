import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {PurchaseServiceNs, PurchaseService} from '../../../../../core/trans/purchase.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {RightSideTableBoxNs} from '../../../../../layout/right-side-table-box/right-side-table-box.component';
import {DictionaryService, DictionaryServiceNs} from '../../../../../core/common-services/dictionary.service';
import {UploadModalService} from '../../../../../widget/upload-modal/upload-modal';
import {environment} from '../../../../../../environments/environment';
import {UserService} from '../../../../../core/common-services/user.service';
import {DeptService, DeptServiceNs} from '../../../../../core/common-services/dept.service';

@Component({
  selector: 'app-edit-material-purchase',
  templateUrl: './edit-material-purchase.component.html',
  styleUrls: ['./edit-material-purchase.component.scss']
})
export class EditMaterialPurchaseComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('purchaseAmountTpl') purchaseAmountTpl: TemplateRef<any>;
  @ViewChild('remarkTpl') remarkTpl: TemplateRef<any>;
  @ViewChild('receiverTpl') receiverTpl: TemplateRef<any>;
  @ViewChild('upDownloadTpl') upDownloadTpl: TemplateRef<any>;
  @ViewChild('demandDateTpl') demandDateTpl: TemplateRef<any>;
  @ViewChild('plannerSelectedTpl') plannerSelectedTpl: TemplateRef<any>;
  @ViewChild('departmentSelectedTpl') departmentSelectedTpl: TemplateRef<any>;
  @Input() purchasePlanId?: string|number;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  public purchasePlanItem: PurchaseServiceNs.PurchasePlanItemData = {
    orgId: '',
    orgName: '',
    purchasePlanId: '',
    businessType: '',
    purchasePlanType: null,
    purchaseType: null,
    materialType: null,
    monthPlanIn: '',
    allocatePlanner: '',
    departmentName: '',
    status: null,
    auditRemark: '',
    remark: ''
  };
  public purchasePlanEditForm: FormGroup;
  public purchasePlanItemTableConfig: UfastTableNs.TableConfig;
  public purchaseItemMaterialList: PurchaseServiceNs.PurchasePlanItemTableData[] = [];
    private itemMaterialKey = ['id', 'lineNo', 'materialCode', 'materialDescription', 'unit', 'purchaseAmount', 'inventory',
    'amountInPlan', 'useAmountInThreeMonth', 'demandDate', 'targetPricePlan', 'receiver', 'remark', 'auditRemark', 'attachment',
    'annexName'];
  private purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public businessTypeList = [];
  public purchasePlanTypeList = this.purchaseService.purchasePlanTypeList;
  public materialTypeList = this.purchaseService.materialTypeList;
  private submitParamsData: any;

  public materialTableConfig: UfastTableNs.TableConfig;
  public materialDataList: {
    materialCode: string;
    materialDescription: string;
    materialAmount: number|string;
    unit: string;
    useAmountInThreeMonth: number;
    amountInPlan: number;
    targetPricePlan: string|number; }[] = [];
  public materialTableFilter = {keyWords: '', materialType: null};
  public isShowMaterialTable = false;
  public materialTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent> =
    new EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>();

  public uploadUrl = '';
  public fileList = [];
  public isPlanRefused = false;
  public isCanTriggerChange = true;
  private originMaterialType = null;
  public lengthLimit = {
    default: 50,
    maxLength: environment.otherData.searchInputMaxLen,
    precision: environment.otherData.materialNumDec,
    max: environment.otherData.materialNumMax,
    min: environment.otherData.materialNumMin
  };
  public isShowPlannerListModal = false;
  public plannerListTableConfig: UfastTableNs.TableConfig;
  public plannerList: {name: string; userId: string; deptName: string; deptId: string; }[] = [];
  public isShowDepartmentListModal = false;
  public departmentListTableConfig: UfastTableNs.TableConfig;
  public departmentList: {name: string; id: string}[] = [];
  public downloadUrl = environment.otherData.fileServiceUrl;
  public batchData = {amount: null, demandDate: null};

  constructor(private formBuilder: FormBuilder,
              private purchaseService: PurchaseService,
              private messageService: ShowMessageService,
              private dictionaryService: DictionaryService,
              private uploadService: UploadModalService,
              private userService: UserService,
              private deptService: DeptService) { }

  public getPurchasePlanDetail() {
    this.messageService.showLoading();
    this.purchaseService.getPurchaseDetail(this.purchasePlanId).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      Object.keys(this.purchasePlanEditForm.controls).forEach((item) => {
        if (item === 'monthPlanIn') {
          this.purchasePlanEditForm.controls[item].patchValue(new Date(resData.value[this.purchaseDataMap[item].key]));
          return;
        }
        this.purchasePlanEditForm.controls[item].patchValue(resData.value[this.purchaseDataMap[item].key]);
      });
      this.purchasePlanItem.status = resData.value[this.purchaseDataMap.status.key];
      this.purchasePlanItem.auditRemark = resData.value[this.purchaseDataMap.auditRemark.key];
      this.isPlanRefused = this.purchasePlanItem.status === PurchaseServiceNs.PurchasePlanStatus.RefuseAudit ||
        this.purchasePlanItem.status === PurchaseServiceNs.PurchasePlanStatus.MaterialRefuseAudit;
      this.purchaseItemMaterialList = [];
      this.originMaterialType = resData.value[this.purchaseDataMap.materialType.key];
      resData.value.purchasePlanDetailsVOS.forEach((item, index) => {
        const detailItem = <any>{};
        this.itemMaterialKey.forEach((key) => {
          detailItem[key] = item[this.purchaseDataMap[key].key];
        });
        detailItem['index'] = index;
        detailItem['_this'] = detailItem;
        this.purchaseItemMaterialList.push(detailItem);
      });
      this.isCanTriggerChange = false;
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private getBusinessTypeList() {
    this.dictionaryService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.BusinessType}).subscribe((resData) => {
      if (resData.code !== 0) {
        return;
      }
      this.businessTypeList = resData.value || [];
    });
  }
  private getOrgInfo() {
    this.purchaseService.getOrgList().then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.purchasePlanEditForm.controls['orgName'].patchValue(resData.value ? resData.value.name : '');
      this.purchasePlanEditForm.controls['orgId'].patchValue(resData.value ? resData.value.id : '');
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public disabledDate = (current: Date): boolean => {
    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    return currentYear < thisYear || (currentYear === thisYear && currentMonth < thisMonth);
  }
  private beforeSubmit() {
    for (const key in this.purchasePlanEditForm.controls) {
      if (this.purchasePlanEditForm.controls[key]) {
        this.purchasePlanEditForm.controls[key].markAsDirty();
        this.purchasePlanEditForm.controls[key].updateValueAndValidity();
      }
    }
    if (this.purchasePlanEditForm.invalid) {
      return false;
    }
    const isHasQuantityError = this.purchaseItemMaterialList.some((item) => {
      return !item.purchaseAmount && item.purchaseAmount !== 0;
    });
    if (isHasQuantityError) {
      this.messageService.showToastMessage('请填入采购数量', 'warning');
      return false;
    }
    const isHasDateError = this.purchaseItemMaterialList.some((item) => {
      return !item.demandDate;
    });
    if (isHasDateError) {
      this.messageService.showToastMessage('请填入需求日期', 'warning');
      return false;
    }
    this.submitParamsData = {};
    this.submitParamsData.id = this.purchasePlanId || '';
    Object.keys(this.purchasePlanEditForm.controls).forEach((item) => {
      this.submitParamsData[this.purchaseDataMap[item].key] = this.purchasePlanEditForm.controls[item].value;
    });
    this.submitParamsData.purchasePlanDetailsVOS = [];
    this.purchaseItemMaterialList.forEach((item, index) => {
      const params = {};
      this.itemMaterialKey.forEach((key) => {
        params[this.purchaseDataMap[key].key] = item[key];
      });
      this.submitParamsData.purchasePlanDetailsVOS.push(params);
    });
    if (this.submitParamsData.purchasePlanDetailsVOS.length === 0) {
      this.messageService.showToastMessage('请选择物料', 'warning');
      return;
    }
    let purchaseAmountZero = 0;
    this.submitParamsData.purchasePlanDetailsVOS.forEach((item) => {
      if (!item['quantity']) { purchaseAmountZero ++;
      return; }
    });
    if (purchaseAmountZero) {
      this.messageService.showToastMessage('物料数量不能为0', 'error');
      return;
    }
    return true;
  }
  public savePurchasePlan() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.savePurchasePlan(this.submitParamsData).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('保存成功', 'success');
      this.emitPage(true);
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public submitPurchasePlan() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.submitPurchasePlan(this.submitParamsData).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('保存成功', 'success');
      this.emitPage(true);
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }
  private isAllChoose(isAllChoose: boolean): void {
    this.purchaseItemMaterialList.forEach((item) => {
      item[this.purchasePlanItemTableConfig.checkRowField] = isAllChoose;
    });
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.purchasePlanItemTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.purchasePlanItemTableConfig.checkAll = this.purchaseItemMaterialList.every((item) => {
        return item[this.purchasePlanItemTableConfig.checkRowField] === true;
      });
    }
  }
  public handleMaterialTypeChange(val) {
    if (!this.isCanTriggerChange && val === this.originMaterialType) {
      return;
    }
    this.isCanTriggerChange = true;
    this.materialTableFilter.materialType = val;
    this.materialDataList = [];
    this.purchaseItemMaterialList = [];
  }
  public showMaterialTable() {
    if (!this.purchasePlanEditForm.controls['materialType'].value) {
      this.messageService.showToastMessage('请选择物料类型', 'warning');
      return;
    }
    this.isShowMaterialTable = true;
    if (this.materialDataList.length) {
      this.checkMaterialList();
      return;
    }
    this.getMaterialList();
  }
  private checkMaterialList() {
    let sum = 0;
    this.materialTableConfig.checkAll = false;
    this.materialDataList.forEach((item) => {
      item[this.materialTableConfig.checkRowField] = false;
      const checkedItem = this.purchaseItemMaterialList.findIndex(material => material.materialCode === item.materialCode);
      if (checkedItem !== -1) {
        sum ++;
        item[this.materialTableConfig.checkRowField] = true;
        return;
      }
    });
    if (sum === this.materialDataList.length) {
      this.materialTableConfig.checkAll = true;
      return;
    }
  }
  public getMaterialList  = () => {
    const filters = {
      pageNum: this.materialTableConfig.pageNum,
      pageSize: this.materialTableConfig.pageSize,
      filters: this.materialTableFilter
    };
    filters.filters.keyWords = filters.filters.keyWords.trim();
    this.materialTableConfig.loading = true;
    this.materialTableConfig.checkAll = false;
    this.purchaseService.getMaterialList(filters).subscribe((resData) => {
      this.materialTableConfig.loading = false;
      this.materialDataList = [];
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.materialTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        this.materialDataList.push({
          materialAmount: item[this.purchaseDataMap.materialAmount.key],
          materialCode: item[this.purchaseDataMap.materialCodeSide.key],
          materialDescription: item[this.purchaseDataMap.materialDescription.key],
          unit: item[this.purchaseDataMap.unit.key],
          targetPricePlan: item[this.purchaseDataMap.targetPrice.key] || '',
          useAmountInThreeMonth: item[this.purchaseDataMap.useAmountInThreeMonth.key],
          amountInPlan: item[this.purchaseDataMap.amountInPlan.key]
        });
      });
      if (this.purchaseItemMaterialList.length === 0) {
        return;
      }
      this.checkMaterialList();
    }, (error) => {
      this.materialTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Unchecked) {
      event.list.forEach((item) => {
        this.purchaseItemMaterialList = this.purchaseItemMaterialList.filter((material) => material.materialCode !== item.materialCode);
      });
      return;
    }
    event.list.forEach((item, index) => {
      const isItemExisted = this.purchaseItemMaterialList.find((material) => material.materialCode === item.materialCode);
      if (isItemExisted) {
        return;
      }
      const newData = {
        index: this.purchaseItemMaterialList.length,
        id: null,
        lineNo: null,
        materialCode: item.materialCode,
        materialDescription: item.materialDescription,
        unit: item.unit,
        purchaseAmount: null,
        // inventory: item.materialAmount,
        amountInPlan: item.amountInPlan,
        // useAmountInThreeMonth: item.useAmountInThreeMonth,
        demandDate: '',
        targetPricePlan: item.targetPricePlan,
        receiver: '',
        remark: '',
        attachment: '',
        _this: null
      };
      newData._this = newData;
      const len = this.purchaseItemMaterialList.length;
      const preItem = len > 0 ? this.purchaseItemMaterialList[len - 1] : {lineNo: 0};
      let currentLineNo = null;
      currentLineNo = preItem.lineNo + 1;
      newData.lineNo = currentLineNo;
      this.purchaseItemMaterialList = [...this.purchaseItemMaterialList, <any>newData];
    });
  }
  public deleteMaterial(materialCode) {
    this.purchaseItemMaterialList = this.purchaseItemMaterialList.filter(item => item.materialCode !== materialCode);
  }
  public batchDeleteMaterial() {
    const isHasSelectedMaterial = this.purchaseItemMaterialList.some(item => item[this.purchasePlanItemTableConfig.checkRowField]);
    if (!isHasSelectedMaterial) {
      this.messageService.showToastMessage('请选择要删除的物料', 'warning');
      return;
    }
    this.purchasePlanItemTableConfig.checkAll = false;
    this.purchaseItemMaterialList = this.purchaseItemMaterialList.filter(item => !item[this.purchasePlanItemTableConfig.checkRowField]);
  }
  public handleBatchModifyAmount() {
    if (this.purchaseItemMaterialList.length === 0) {
      return;
    }
    this.purchaseItemMaterialList.forEach((item) => {
      item.purchaseAmount = this.batchData.amount;
    });
  }
  public handleBatchModifyDate() {
    if (this.purchaseItemMaterialList.length === 0) {
      return;
    }
    this.purchaseItemMaterialList.forEach((item) => {
      item.demandDate = this.batchData.demandDate;
    });
  }
  public showUploadModal(material) {
    const index = this.purchaseItemMaterialList.findIndex(item => item.materialCode === material.materialCode);
    this.uploadService.showUploadModal({
      title: '上传文件',
      maxFileNum: 1,
      placeHolder: ''
    }).subscribe((resData) => {
      this.purchaseItemMaterialList[index].attachment = resData[0].value;
      this.purchaseItemMaterialList[index].annexName = resData[0].fileName;
    });
  }
  public showPlannerModal() {
    this.isShowPlannerListModal = true;
    this.getPlannerList();
  }
  public getPlannerList = () => {
    const paramsData = {
      filters: {deptId: this.purchasePlanEditForm.controls['departmentNameId'].value},
      pageNum: this.plannerListTableConfig.pageNum,
      pageSize: this.plannerListTableConfig.pageSize
    };
    this.plannerListTableConfig.loading = true;
    this.userService.getUserList(paramsData).subscribe((resData) => {
      this.plannerListTableConfig.loading = false;
      this.plannerList = [];
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.plannerListTableConfig.total = resData.value.total || 0;
      resData.value.list.forEach((item) => {
        this.plannerList.push({
          name: item.name,
          userId: item.userId,
          deptName: item.deptName,
          deptId: item.deptId
        });
      });
    }, (error) => {
      this.plannerListTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public selectPlanner(id) {
    const planner = this.plannerList.find((item) => item.userId === id);
    this.purchasePlanEditForm.controls['allocatePlanner'].patchValue(planner.name);
    this.purchasePlanEditForm.controls['allocatePlannerId'].patchValue(id);
    this.purchasePlanEditForm.controls['departmentName'].patchValue(planner.deptName);
    this.purchasePlanEditForm.controls['departmentNameId'].patchValue(planner.deptId);
    this.isShowPlannerListModal = false;
  }
  public showDepartmentModal() {
    this.isShowDepartmentListModal = true;
    this.getDepartmentList();
  }
  public getDepartmentList = () => {
    const id = '0';
    this.departmentListTableConfig.loading = true;
    this.deptService.getDeptList(id).subscribe((resData: DeptServiceNs.UfastHttpAnyResModel) => {
      this.departmentListTableConfig.loading = false;
      this.departmentList = [];
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      resData.value.forEach((item) => {
        this.departmentList.push({name: item.name, id: item.id});
      });
    }, (error: any) => {
      this.departmentListTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public selectDepartment(id) {
    const department = this.departmentList.find((item) => item.id === id);
    if (this.purchasePlanEditForm.controls['departmentName'].value === department.name) {
      this.isShowDepartmentListModal = false;
      return;
    }
    this.purchasePlanEditForm.controls['departmentName'].patchValue(department.name);
    this.purchasePlanEditForm.controls['departmentNameId'].patchValue(department.id);
    this.purchasePlanEditForm.controls['allocatePlanner'].patchValue('');
    this.purchasePlanEditForm.controls['allocatePlannerId'].patchValue('');
    this.isShowDepartmentListModal = false;
  }

  ngOnInit() {
    this.getBusinessTypeList();
    this.purchasePlanItemTableConfig = {
      showCheckbox: true,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 80},
        {title: '行号', field: 'lineNo', width: 50},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料描述', field: 'materialDescription', width: 150},
        {title: '单位', field: 'unit', width: 100},
        {title: '数量', tdTemplate: this.purchaseAmountTpl,
          thClassList: ['table-required-mark'], width: 100},
        // {title: '库存现有量', field: 'inventory', width: 100},
        {title: '已申报计划', field: 'amountInPlan', width: 100},
        // {title: '前三个月领用量', field: 'useAmountInThreeMonth', width: 140},
        {title: '需求日期', tdTemplate: this.demandDateTpl, thClassList: ['table-required-mark'], width: 140},
        {title: '计划价', field: 'targetPricePlan', width: 100},
        {title: '通知接收人', tdTemplate: this.receiverTpl, width: 100},
        {title: '备注', tdTemplate: this.remarkTpl, width: 100},
        // {title: this.purchaseDataMap.status.label, field: 'status', width: 100},
        {title: '附件', tdTemplate: this.upDownloadTpl, width: 100},
      ]
    };
    this.materialTableConfig = {
      pageSize: 10,
      yScroll: 500,
      showCheckbox: true,
      showPagination: true,
      checkAll: false,
      checkRowField: 'isChecked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料描述', field: 'materialDescription', width: 150},
        // {title: '数量', field: 'materialAmount', width: 100}
      ]
    };
    this.purchasePlanEditForm = this.formBuilder.group({
      orgName: [{value: null, disabled: true}],
      orgId: [{value: null, disabled: true}],
      purchasePlanId: [{value: null, disabled: true}],
      businessType: [null, [Validators.required]],
      purchasePlanType: [null, [Validators.required]],
      purchaseType: [null, [Validators.required]],
      materialType: [null, [Validators.required]],
      monthPlanIn: [null, [Validators.required]],
      allocatePlanner: [null, [Validators.required]],
      allocatePlannerId: [{value: null, disabled: true}],
      departmentNameId: [{value: null, disabled: true}],
      departmentName: [null, [Validators.required]],
      remark: [null]
    });
    this.plannerListTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        {title: '用户名', field: 'name', width: 100},
        {title: '用户ID', field: 'userId', width: 140},
        {title: '操作', tdTemplate: this.plannerSelectedTpl, width: 100}
      ]
    };
    this.departmentListTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        {title: '科室', field: 'name', width: 100},
        // {title: '科室Id', field: 'id', width: 140},
        {title: '操作', tdTemplate: this.departmentSelectedTpl, width: 100}
      ]
    };
    if (this.purchasePlanId) {
      this.getPurchasePlanDetail();
    } else {
      this.getOrgInfo();
      this.purchasePlanEditForm.controls['purchasePlanId'].patchValue('系统生成');
    }
  }

}
