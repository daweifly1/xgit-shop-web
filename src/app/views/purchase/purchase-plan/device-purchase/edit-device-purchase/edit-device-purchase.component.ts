import {Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PurchaseServiceNs, PurchaseService} from '../../../../../core/trans/purchase.service';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {RightSideTableBoxNs} from '../../../../../layout/right-side-table-box/right-side-table-box.component';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
import {UploadModalService} from '../../../../../widget/upload-modal/upload-modal';
import {environment} from '../../../../../../environments/environment';
import {UserService} from '../../../../../core/common-services/user.service';
import {DeptService, DeptServiceNs} from '../../../../../core/common-services/dept.service';

enum EquipmentBudgetStatus {
  AgreeAudit = 2
}
enum EquipmentBudgetQuotaStatus {
  AgreeAudit = 2
}

@Component({
  selector: 'app-edit-device-purchase',
  templateUrl: './edit-device-purchase.component.html',
  styleUrls: ['./edit-device-purchase.component.scss']
})
export class EditDevicePurchaseComponent implements OnInit {
  @Input() devicePlanId: string;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('projectSelectedTpl') projectSelectedTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('demandAmountTpl') demandAmountTpl: TemplateRef<any>;
  @ViewChild('deviceModelTpl') deviceModelTpl: TemplateRef<any>;
  @ViewChild('technicalParametersTpl') technicalParametersTpl: TemplateRef<any>;
  @ViewChild('brandTpl') brandTpl: TemplateRef<any>;
  @ViewChild('unitPriceTpl') unitPriceTpl: TemplateRef<any>;
  @ViewChild('receiverTpl') receiverTpl: TemplateRef<any>;
  @ViewChild('remarkTpl') remarkTpl: TemplateRef<any>;
  @ViewChild('demandDateTpl') demandDateTpl: TemplateRef<any>;
  @ViewChild('upDownloadTpl') upDownloadTpl: TemplateRef<any>;
  @ViewChild('plannerSelectedTpl') plannerSelectedTpl: TemplateRef<any>;
  @ViewChild('departmentSelectedTpl') departmentSelectedTpl: TemplateRef<any>;
  public devicePurchaseForm: FormGroup;
  public devicePurchaseItem: PurchaseServiceNs.DevicePurchaseDetailData = {
    id: '',
    orgName: '',
    purchasePlanId: '',
    purchaseType: null,
    monthPlanIn: '',
    allocatePlanner: '',
    departmentName: '',
    projectCode: '',
    projectName: '',
    totalInvest: null,
    availableAmount: null,
    remainAmount: null,
    planInvest: null,
    remark: '',
    status: null,
    auditRemark: ''
  };
  public deviceDetailTableConfig: UfastTableNs.TableConfig;
  public deviceDetailList: PurchaseServiceNs.DevicePurchaseDetailTableData[] = [];
  public purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public isShowEquipProjectModal = false;
  public equipmentProjectList = [];
  public equipmentProjectTableConfig: UfastTableNs.TableConfig;
  public equipmentProjectFilter = {
    projectNo: '',
    projectName: '',
    status: EquipmentBudgetStatus.AgreeAudit,
    quotaStatus: EquipmentBudgetQuotaStatus.AgreeAudit
  };
  private budgetDataMap = this.purchaseService.budgetDataMap;
  private submitData = {};
  public isShowSaveBtn = true;

  public materialTableConfig: UfastTableNs.TableConfig;
  public materialDataList: {
    materialCode: string;
    materialDescription: string;
    specificationModel: string;
    brand: string;
    unit: string;
    targetPrice: string|number; }[] = [];
  public materialTableFilter = {keyWords: '', materialType: PurchaseServiceNs.MaterialType.Device};
  public isShowMaterialTable = false;
  public materialTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent> =
    new EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>();
  public lengthLimit = {
    default: 50,
    maxLength: environment.otherData.searchInputMaxLen,
    precision: environment.otherData.materialNumDec,
    max: environment.otherData.materialNumMax,
    moneyMax: environment.otherData.moneyMax,
    moneyPrecision: environment.otherData.moneyDec
  };
  public isShowPlannerListModal = false;
  public plannerListTableConfig: UfastTableNs.TableConfig;
  public plannerList: {name: string; userId: string; deptName: string; deptId: string; }[] = [];
  public isShowDepartmentListModal = false;
  public departmentListTableConfig: UfastTableNs.TableConfig;
  public departmentList: {name: string; id: string}[] = [];
  private selectedDeptId = '';
  private selectedPlannerId = '';
  public downloadUrl = environment.otherData.fileServiceUrl;
  public isPlanRefused = false;
  public batchData = {amount: null, demandDate: null};

  constructor(private purchaseService: PurchaseService,
              private formBuilder: FormBuilder,
              private messageService: ShowMessageService,
              private ufastService: UfastUtilService,
              private uploadService: UploadModalService,
              private userService: UserService,
              private deptService: DeptService) { }

  private getOrgInfo() {
    this.purchaseService.getOrgList().then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.devicePurchaseItem.orgName = resData.value ? resData.value.name : '';
      this.devicePurchaseItem.orgId = resData.value ? resData.value.id : '';
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private getDevicePurchaseDetail() {
    this.messageService.showLoading();
    this.deviceDetailList = [];
    this.purchaseService.getPurchaseDetail(this.devicePlanId).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      Object.keys(this.devicePurchaseItem).forEach((item) => {
        if (this.purchaseDataMap[item].parentKey) {
          this.devicePurchaseItem[item] = resData.value[this.purchaseDataMap[item].parentKey][this.purchaseDataMap[item].key];
          return;
        }
        if (item === 'monthPlanIn') {
          this.devicePurchaseItem[item] = resData.value[this.purchaseDataMap[item].key] ?
            new Date(resData.value[this.purchaseDataMap[item].key]) : null;
          return;
        }
        this.devicePurchaseItem[item] = resData.value[this.purchaseDataMap[item].key];
      });
      this.selectedPlannerId = resData.value[this.purchaseDataMap.allocatePlannerId.key];
      this.selectedDeptId = resData.value[this.purchaseDataMap.departmentNameId.key];
      this.isShowSaveBtn = this.devicePurchaseItem.status !== PurchaseServiceNs.PurchasePlanStatus.RefuseAudit &&
        this.devicePurchaseItem.status !== PurchaseServiceNs.PurchasePlanStatus.MaterialRefuseAudit;
      this.isPlanRefused = this.devicePurchaseItem.status === PurchaseServiceNs.PurchasePlanStatus.RefuseAudit ||
        this.devicePurchaseItem.status === PurchaseServiceNs.PurchasePlanStatus.MaterialRefuseAudit;
      this.deviceDetailList = [];
      resData.value.purchasePlanDetailsVOS.forEach((item, index) => {
        const detailItem = {
          index: index,
          id: item[this.purchaseDataMap.id.key],
          lineNo: item[this.purchaseDataMap.lineNo.key],
          materialCode: item[this.purchaseDataMap.materialCode.key],
          materialDescription: item[this.purchaseDataMap.materialDescription.key],
          unit: item[this.purchaseDataMap.unit.key],
          materialModel: item[this.purchaseDataMap.materialModel.key],
          technicalParameters: item[this.purchaseDataMap.technicalParameters.key],
          brand: item[this.purchaseDataMap.brand.key],
          demandAmount: item[this.purchaseDataMap.demandAmount.key],
          demandDate: item[this.purchaseDataMap.demandDate.key],
          unitPriceAbout: item[this.purchaseDataMap.unitPriceAbout.key],
          receiver: item[this.purchaseDataMap.receiver.key],
          remark: item[this.purchaseDataMap.remark.key],
          lineTotalPrice: item[this.purchaseDataMap.lineTotalPrice.key],
          attachment: item[this.purchaseDataMap.attachment.key],
          annexName: item[this.purchaseDataMap.annexName.key],
          _this: null
        };
        detailItem._this = <any>detailItem;
        this.deviceDetailList.push(detailItem);
      });
      this.calcPlanTotalPrice();
    }, (error) => {
      this.messageService.closeLoading();
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
  public showEquipmentProjectModal() {
    this.isShowEquipProjectModal = true;
    this.getEquipmentProjectList();
  }
  public getEquipmentProjectList = () => {
    const paramsData = {
      filters: this.equipmentProjectFilter,
      pageSize: this.equipmentProjectTableConfig.pageSize,
      pageNum: this.equipmentProjectTableConfig.pageNum,
    };
    this.equipmentProjectList = [];
    this.equipmentProjectTableConfig.loading = true;
    this.purchaseService.getPurchaseBudgetList(paramsData).then((resData) => {
      this.equipmentProjectTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.equipmentProjectTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        const projectItem = {
          orgName: item[this.budgetDataMap.orgName.key],
          projectCode: item[this.budgetDataMap.projectCode.key],
          projectName: item[this.budgetDataMap.projectName.key],
          beginYear: item[this.budgetDataMap.beginYear.key],
          belongYear: item[this.budgetDataMap.belongYear.key],
          totalInvest: item[this.budgetDataMap.totalInvest.key],
          availableInvest: item[this.budgetDataMap.availableInvest.key],
          remainInvest: item[this.budgetDataMap.remainInvest.key],
          projectType: item[this.budgetDataMap.projectType.key],
        };
        projectItem['_this'] = projectItem;
        this.equipmentProjectList.push(projectItem);
      });
    }, (error) => {
      this.equipmentProjectTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public selectEquipmentProject(project) {
    this.devicePurchaseItem.projectCode = project.projectCode;
    this.devicePurchaseItem.projectName = project.projectName;
    this.devicePurchaseItem.totalInvest = project.totalInvest;
    this.devicePurchaseItem.availableAmount = project.availableInvest;
    this.devicePurchaseItem.remainAmount = project.remainInvest;
    this.devicePurchaseItem.planInvest = project.planInvest;
    this.isShowEquipProjectModal = false;
  }
  public handleUnitPriceChange(item) {
    if (item.demandAmount === null || item.unitPriceAbout === null) {
      return;
    }
    item.lineTotalPrice = this.ufastService.mul(item.demandAmount, item.unitPriceAbout);
    this.calcPlanTotalPrice();
  }
  public handleAmountChange(item) {
    if (item.demandAmount === null || item.unitPriceAbout === null) {
      return;
    }
    item.lineTotalPrice = this.ufastService.mul(item.demandAmount, item.unitPriceAbout);
    this.calcPlanTotalPrice();
  }
  private calcPlanTotalPrice() {
    let sum = 0;
    this.deviceDetailList.forEach((item) => {
      if (!item.lineTotalPrice) {
        return;
      }
      sum = this.ufastService.add(sum, item.lineTotalPrice);
    });
    this.devicePurchaseItem.planInvest = this.ufastService.div(sum, 10000);
  }
  private beforeSubmit() {
    for (const key in this.devicePurchaseForm.controls) {
      if (this.devicePurchaseForm.controls[key]) {
        this.devicePurchaseForm.controls[key].markAsDirty();
        this.devicePurchaseForm.controls[key].updateValueAndValidity();
      }
    }
    if (this.devicePurchaseForm.invalid) {
      return false;
    }
    if (this.deviceDetailList.length === 0) {
      this.messageService.showToastMessage('请选择物料', 'error');
      return false;
    }
    let isHasTechnicalParametersError = false;
    let isHasAmountError = false;
    let isHasDemandDateError = false;
    let isHasUnitPriceError = false;
    this.submitData = {};
    this.submitData[this.purchaseDataMap.orgName.key] = this.devicePurchaseItem.orgName;
    this.submitData[this.purchaseDataMap.orgId.key] = this.devicePurchaseItem.orgId;
    this.submitData[this.purchaseDataMap.id.key] = this.devicePlanId ? this.devicePurchaseItem.id : '';
    this.submitData[this.purchaseDataMap.purchasePlanId.key] = this.devicePlanId ? this.devicePurchaseItem.purchasePlanId : '';
    this.submitData[this.purchaseDataMap.purchaseType.key] = this.devicePurchaseItem.purchaseType;
    this.submitData[this.purchaseDataMap.monthPlanIn.key] = this.devicePurchaseItem.monthPlanIn;
    this.submitData[this.purchaseDataMap.allocatePlanner.key] = this.devicePurchaseItem.allocatePlanner;
    this.submitData[this.purchaseDataMap.allocatePlannerId.key] = this.selectedPlannerId;
    this.submitData[this.purchaseDataMap.departmentNameId.key] = this.selectedDeptId;
    this.submitData[this.purchaseDataMap.departmentName.key] = this.devicePurchaseItem.departmentName;
    this.submitData[this.purchaseDataMap.projectCode.key] = this.devicePurchaseItem.projectCode;
    this.submitData[this.purchaseDataMap.projectName.key] = this.devicePurchaseItem.projectName;
    this.submitData[this.purchaseDataMap.materialType.key] = PurchaseServiceNs.MaterialType.Device;
    this.submitData[this.purchaseDataMap.remark.key] = this.devicePurchaseItem.remark;
    this.submitData['purchasePlanDetailsVOS'] = [];
    this.deviceDetailList.forEach((item, index) => {
      const params = {};
      if (!item.technicalParameters) {
        isHasTechnicalParametersError = true;
        return;
      }
      if (!item.demandAmount) {
        isHasAmountError = true;
        return;
      }
      if (!item.demandDate) {
        isHasDemandDateError = true;
        return;
      }
      if (!item.unitPriceAbout) {
        isHasUnitPriceError = true;
        return;
      }
      params[this.purchaseDataMap.id.key] = item.id || '';
      params[this.purchaseDataMap.lineNo.key] = item.lineNo;
      params[this.purchaseDataMap.materialCode.key] = item.materialCode;
      params[this.purchaseDataMap.materialDescription.key] = item.materialDescription;
      params[this.purchaseDataMap.unit.key] = item.unit;
      params[this.purchaseDataMap.materialModel.key] = item.materialModel;
      params[this.purchaseDataMap.technicalParameters.key] = item.technicalParameters;
      params[this.purchaseDataMap.brand.key] = item.brand;
      params[this.purchaseDataMap.demandAmount.key] = item.demandAmount;
      params[this.purchaseDataMap.demandDate.key] = item.demandDate;
      params[this.purchaseDataMap.unitPriceAbout.key] = item.unitPriceAbout;
      params[this.purchaseDataMap.receiver.key] = item.receiver;
      params[this.purchaseDataMap.remark.key] = item.remark;
      params[this.purchaseDataMap.lineTotalPrice.key] = item.lineTotalPrice;
      params[this.purchaseDataMap.attachment.key] = item.attachment;
      params[this.purchaseDataMap.annexName.key] = item.annexName;
      this.submitData['purchasePlanDetailsVOS'].push(params);
    });
    if (isHasTechnicalParametersError) {
      this.messageService.showToastMessage('请填写技术参数', 'error');
      return false;
    }
    if (isHasAmountError) {
      this.messageService.showToastMessage('请填写需求数量', 'error');
      return false;
    }
    if (isHasDemandDateError) {
      this.messageService.showToastMessage('请填写需求日期', 'error');
      return false;
    }
    if (isHasUnitPriceError) {
      this.messageService.showToastMessage('请填写概算单价', 'error');
      return false;
    }
    if (isHasTechnicalParametersError) {
      this.messageService.showToastMessage('请填写技术参数', 'error');
      return false;
    }
    return true;
  }
  public savePurchasePlan() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.savePurchasePlan(this.submitData).subscribe((resData) => {
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
    this.purchaseService.submitPurchasePlan(this.submitData).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('提交成功', 'success');
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
    this.deviceDetailList.forEach((item) => {
      item[this.deviceDetailTableConfig.checkRowField] = isAllChoose;
    });
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.deviceDetailTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.deviceDetailTableConfig.checkAll = this.deviceDetailList.every((item) => {
        return item[this.deviceDetailTableConfig.checkRowField] === true;
      });
    }
  }
  public showMaterialTable() {
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
      const checkedItem = this.deviceDetailList.findIndex(material => material.materialCode === item.materialCode);
      if (checkedItem !== -1) {
        sum ++;
        item[this.materialTableConfig.checkRowField] = true;
        return;
      }
    });
    if (sum === this.materialDataList.length) {
      this.materialTableConfig.checkAll = true;
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
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.materialTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        this.materialDataList.push({
          materialCode: item[this.purchaseDataMap.materialCodeSide.key] || '',
          materialDescription: item[this.purchaseDataMap.materialDescription.key] || '',
          specificationModel: item[this.purchaseDataMap.specificationModel.key] || '',
          unit: item[this.purchaseDataMap.unit.key] || '',
          brand: item[this.purchaseDataMap.brand.key] || '',
          targetPrice: item[this.purchaseDataMap.targetPrice.key]
        });
      });
      if (this.deviceDetailList.length === 0) {
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
        this.deviceDetailList = this.deviceDetailList.filter((material) => material.materialCode !== item.materialCode);
      });
      return;
    }
    event.list.forEach((item, index) => {
      const isItemExisted = this.deviceDetailList.find((material) => material.materialCode === item.materialCode);
      if (isItemExisted) {
        return;
      }
      const newData: PurchaseServiceNs.DevicePurchaseDetailTableData = {
        index: this.deviceDetailList.length,
        id: null,
        lineNo: null,
        materialCode: item.materialCode,
        materialDescription: item.materialDescription,
        unit: item.unit,
        materialModel: item.specificationModel,
        technicalParameters: '',
        brand: item.brand,
        demandAmount: null,
        demandDate: null,
        unitPriceAbout: item.targetPrice,
        receiver: '',
        lineTotalPrice: null,
        remark: '',
        attachment: '',
        _this: null
      };
      newData._this = newData;
      const len = this.deviceDetailList.length;
      const preItem = len > 0 ? this.deviceDetailList[len - 1] : {lineNo: 0};
      let currentLineNo = null;
      currentLineNo = preItem.lineNo + 1;
      newData.lineNo = currentLineNo;
      this.deviceDetailList = [...this.deviceDetailList, newData];
    });
  }
  public deleteMaterial(materialCode) {
    this.deviceDetailList = this.deviceDetailList.filter(item => item.materialCode !== materialCode);
  }
  public batchDeleteMaterial() {
    const isHasSelectedMaterial = this.deviceDetailList.some(item => item[this.deviceDetailTableConfig.checkRowField]);
    if (!isHasSelectedMaterial) {
      this.messageService.showToastMessage('请选择要删除的物料', 'warning');
      return;
    }
    this.deviceDetailTableConfig.checkAll = false;
    this.deviceDetailList = this.deviceDetailList.filter(item => !item[this.deviceDetailTableConfig.checkRowField]);
  }
  public handleBatchModifyAmount() {
    if (this.deviceDetailList.length === 0) {
      return;
    }
    this.deviceDetailList.forEach((item) => {
      item.demandAmount = this.batchData.amount;
    });
  }
  public handleBatchModifyDate() {
    if (this.deviceDetailList.length === 0) {
      return;
    }
    this.deviceDetailList.forEach((item) => {
      item.demandDate = this.batchData.demandDate;
    });
  }
  public showUploadModal(material) {
    const index = this.deviceDetailList.findIndex(item => item.materialCode === material.materialCode);
    this.uploadService.showUploadModal({
      title: '上传文件',
      maxFileNum: 1,
      placeHolder: ''
    }).subscribe((resData) => {
      this.deviceDetailList[index].attachment = resData[0].value;
      this.deviceDetailList[index].annexName = resData[0].fileName;
    });
  }
  public showPlannerModal() {
    this.isShowPlannerListModal = true;
    this.getPlannerList();
  }
  public getPlannerList = () => {
    const paramsData = {
      filters: {deptId: this.selectedDeptId},
      pageNum: this.plannerListTableConfig.pageNum,
      pageSize: this.plannerListTableConfig.pageSize
    };
    this.plannerListTableConfig.loading = true;
    this.userService.getUserList(paramsData).subscribe((resData) => {
      this.plannerList = [];
      this.plannerListTableConfig.loading = false;
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
    this.devicePurchaseForm.controls['allocatePlanner'].patchValue(planner.name);
    this.devicePurchaseForm.controls['departmentName'].patchValue(planner.deptName);
    this.selectedDeptId = planner.deptId;
    this.selectedPlannerId = id;
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
    if (this.devicePurchaseForm.controls['departmentName'].value === department.name) {
      this.isShowDepartmentListModal = false;
      return;
    }
    this.devicePurchaseForm.controls['departmentName'].patchValue(department.name);
    this.selectedDeptId = department.id;
    this.devicePurchaseForm.controls['allocatePlanner'].patchValue('');
    this.selectedPlannerId = '';
    this.isShowDepartmentListModal = false;
  }


  ngOnInit() {
    this.devicePurchaseForm = this.formBuilder.group({
      orgName: [{value: null, disabled: true}],
      purchasePlanId: [{value: null, disabled: true}],
      purchaseType: [null, [Validators.required]],
      monthPlanIn: [null, [Validators.required]],
      allocatePlanner: [null, [Validators.required]],
      departmentName: [null, [Validators.required]],
      projectCode: [null, [Validators.required]],
      projectName: [{value: null, disabled: true}],
      totalInvest: [{value: null, disabled: true}],
      remainAmount: [{value: null, disabled: true}],
      planInvest: [{value: null, disabled: true}],
      remark: [null]
    });
    this.deviceDetailTableConfig = {
      showCheckbox: true,
      pageSize: 10,
      showPagination: true,
      frontPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 100},
        {title: '行号', field: 'lineNo', width: 100},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料描述', field: 'materialDescription', width: 140},
        {title: '型号规格', tdTemplate: this.deviceModelTpl, width: 120},
        {title: '技术参数', tdTemplate: this.technicalParametersTpl, thClassList: ['table-required-mark'], width: 120},
        {title: '单位', field: 'unit', width: 100},
        {title: '品牌厂家', tdTemplate: this.brandTpl, width: 120},
        {title: '需求数量', tdTemplate: this.demandAmountTpl, thClassList: ['table-required-mark'], width: 120},
        {title: '需求日期', tdTemplate: this.demandDateTpl, thClassList: ['table-required-mark'], width: 140},
        {title: '概算单价', tdTemplate: this.unitPriceTpl, thClassList: ['table-required-mark'], width: 120},
        {title: '通知接收人', tdTemplate: this.receiverTpl, width: 120},
        {title: '备注', tdTemplate: this.remarkTpl, width: 100},
        {title: '行总金额', field: 'lineTotalPrice', width: 80},
        {title: '附件', tdTemplate: this.upDownloadTpl, width: 100},
      ]
    };
    this.equipmentProjectTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '项目编码', field: 'projectCode', width: 100},
        {title: '项目名称', field: 'projectName', width: 120},
        {title: '开始年份', field: 'beginYear', width: 100},
        {title: '所属年份', field: 'belongYear', width: 100},
        {title: '项目总投资', field: 'totalInvest', width: 100},
        {title: '当年可用投资', field: 'availableInvest', width: 140},
        {title: '项目类别', field: 'projectType', width: 100},
        {title: '选择', tdTemplate: this.projectSelectedTpl, fixed: true, width: 100},
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
      ]
    };
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
    if (this.devicePlanId) {
      this.getDevicePurchaseDetail();
    } else {
      this.getOrgInfo();
      this.devicePurchaseItem.purchasePlanId = '系统生成';
    }
  }

}
