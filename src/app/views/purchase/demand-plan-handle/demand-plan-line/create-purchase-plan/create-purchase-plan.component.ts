import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {PurchaseServiceNs, PurchaseService} from '../../../../../core/trans/purchase.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {DictionaryService, DictionaryServiceNs} from '../../../../../core/common-services/dictionary.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'app-create-purchase-plan',
  templateUrl: './create-purchase-plan.component.html',
  styleUrls: ['./create-purchase-plan.component.scss']
})
export class CreatePurchasePlanComponent implements OnInit {
  @Input() createdPurchasePlanList: any;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('inputQuantityTpl') inputQuantityTpl: TemplateRef<any>;
  @ViewChild('demandDateTpl') demandDateTpl: TemplateRef<any>;
  public createPurchaseForm: FormGroup;
  public purchaseParams = {
    monthPlanIn: '',
    purchaseType: '',
    purchasePlanType: '',
    businessType: '',
    materialType: null,
    planner: '',
    departmentName: '',
  };
  public purchasePlanTypeList = [
    {value: 1, name: '月度计划'},
    {value: 2, name: '临时计划'},
    {value: 3, name: '急件计划'},
  ];
  public businessTypeList = [];
  public purchasePlanCreateTableConfig: UfastTableNs.TableConfig;
  public purchasePlanCreateList: PurchaseServiceNs.DemandPlanCreateData[] = [];
  private demandDataMap = this.purchaseService.purchasePlanDataMap;
  private submitParamsData: any;
  public lengthLimit = {
    precision: environment.otherData.materialNumDec,
    max: environment.otherData.materialNumMax
  };
  private isHasQuantityZero = false;

  constructor(private messageService: ShowMessageService,
              private purchaseService: PurchaseService,
              private dictionaryService: DictionaryService,
              private router: Router,
              private formBuilder: FormBuilder
  ) { }
  public getPurchasePlanList() {
    this.purchasePlanCreateList = [];
    this.createdPurchasePlanList.purchasePlanDetailsVOS.forEach((item, index) => {
      this.purchasePlanCreateList = [...this.purchasePlanCreateList, {
        index: index,
        lineNo: item[this.demandDataMap.lineNo.key],
        materialType: item[this.demandDataMap.materialType.key],
        materialCode: item[this.demandDataMap.materialCode.key],
        materialDescription: item[this.demandDataMap.materialDescription.key],
        unit: item[this.demandDataMap.unit.key],
        demandAmount: item[this.demandDataMap.demandAmount.key],
        purchaseAmount: item[this.demandDataMap.purchaseAmount.key],
        inventory: item[this.demandDataMap.inventory.key],
        safeInventory: item[this.demandDataMap.safeInventory.key],
        amountInPlan: item[this.demandDataMap.amountInPlan.key],
        useAmountInThreeMonth: item[this.demandDataMap.useAmountInThreeMonth.key],
        demandDate: item[this.demandDataMap.demandDate.key],
        targetPrice: item[this.demandDataMap.targetPricePlan.key],
        totalPrice: item[this.demandDataMap.totalPrice.key],
        planner: item[this.demandDataMap.planner.key]
      }];
    });
    this.purchaseParams.materialType = this.createdPurchasePlanList[this.demandDataMap.materialType.key];
    this.purchaseParams.planner = this.createdPurchasePlanList[this.demandDataMap.planner.key];
    this.purchaseParams.departmentName = this.createdPurchasePlanList[this.demandDataMap.departmentName.key];
  }
  private getBusinessTypeList() {
    this.dictionaryService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.BusinessType}).subscribe((resData) => {
      this.businessTypeList = [];
      if (resData.code !== 0) {
        return;
      }
      this.businessTypeList = resData.value || [];
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
    for (const key in this.createPurchaseForm.controls) {
      if (this.createPurchaseForm.controls[key]) {
        this.createPurchaseForm.controls[key].markAsDirty();
        this.createPurchaseForm.controls[key].updateValueAndValidity();
      }
    }
    if (this.createPurchaseForm.invalid) {
      return false;
    }
    let isHasQuantityError = false;
    let isHasDateError = false;
    this.purchasePlanCreateList.forEach((item) => {
      if (item.purchaseAmount === 0) {
        this.isHasQuantityZero = true;
      }
      if (!item.purchaseAmount && item.purchaseAmount !== 0) {
        isHasQuantityError = true;
        return;
      }
      if (!item.demandDate) {
        isHasDateError = true;
        return;
      }
    });
    if (isHasQuantityError) {
      this.messageService.showToastMessage('请填入采购数量', 'warning');
      return false;
    }
    if (isHasDateError) {
      this.messageService.showToastMessage('请填入需求日期', 'warning');
      return false;
    }
    this.submitParamsData = this.createdPurchasePlanList;
    this.submitParamsData[this.demandDataMap.businessType.key] = this.purchaseParams.businessType;
    this.submitParamsData[this.demandDataMap.monthPlanIn.key] = this.purchaseParams.monthPlanIn;
    this.submitParamsData[this.demandDataMap.purchaseType.key] = this.purchaseParams.purchaseType;
    this.submitParamsData[this.demandDataMap.purchasePlanType.key] = this.purchaseParams.purchasePlanType;
    this.purchasePlanCreateList.forEach((item) => {
      this.submitParamsData.purchasePlanDetailsVOS[item.index][this.demandDataMap.purchaseAmount.key] = item.purchaseAmount;
      this.submitParamsData.purchasePlanDetailsVOS[item.index][this.demandDataMap.demandDate.key] = item.demandDate;
    });
    return true;
  }
  public submitPurchasePlan() {
    if (!this.beforeSubmit()) {
      return;
    }
    if (!this.isHasQuantityZero) {
      this.handler();
      return;
    }
    this.messageService.showAlertMessage('', '含有采购数量为0的物料，是否继续', 'confirm').afterClose.subscribe((type) => {
      if (type !== 'onOk') {
        return;
      }
      this.handler();
    });
  }
  public handler() {
    this.messageService.showLoading();
    this.purchaseService.submitPurchasePlan(this.submitParamsData).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('提交成功', 'success');
      this.emitPage(true);
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
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
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }

  ngOnInit() {
    this.getBusinessTypeList();
    this.purchasePlanCreateTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'lineNo', width: 80},
        // {title: '行类型', field: 'materialType', width: 100, pipe: 'materialType2'},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料描述', field: 'materialDescription', width: 110},
        {title: '单位', field: 'unit', width: 100},
        {title: '需求数量', field: 'demandAmount', width: 140},
        {title: '采购数量', tdTemplate: this.inputQuantityTpl, thClassList: ['table-required-mark'], width: 140},
        {title: '库存现有量', field: 'inventory', width: 100},
        {title: '安全库存', field: 'safeInventory', width: 100},
        {title: '已申报计划', field: 'amountInPlan', width: 100},
        {title: '前3个月领用量', field: 'useAmountInThreeMonth', width: 120},
        {title: '需求日期', tdTemplate: this.demandDateTpl, thClassList: ['table-required-mark'], width: 200},
        {title: '计划价', field: 'targetPrice', width: 100},
        {title: '行总金额', field: 'totalPrice', width: 100},
        // {title: '计划员', field: 'planner', width: 100}
      ]
    };
    this.createPurchaseForm = this.formBuilder.group({
      purchasePlanType: [null, [Validators.required]],
      purchaseType: [null, [Validators.required]],
      monthPlanIn: [null, [Validators.required]],
      businessType: [null, [Validators.required]],
    });
    this.getPurchasePlanList();
  }

}
