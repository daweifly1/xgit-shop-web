import {Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MapPipe} from '../../../../directives/pipe/map.pipe';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {SupplierManageService} from '../../../../core/trans/supplier-manage.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {ApprovalFormNs, ApprovalFormService} from '../../../../core/trans/purchase/approval-form.service';
import {UserService, UserServiceNs} from '../../../../core/common-services/user.service';
import {environment} from '../../../../../environments/environment';
import {SelectClauseNs, SelectClauseService} from '../select-clause/select-clause.component';
import {PurchaseStepsNs} from '../purchase-steps/purchase-steps.component';
enum MaxLenInput {
  PurchaseSource = 300,
  Remark = 400
}
@Component({
  selector: 'app-new-approval-form',
  templateUrl: './new-approval-form.component.html',
  styleUrls: ['./new-approval-form.component.scss']
})
export class NewApprovalFormComponent implements OnInit {
  @Input() isNew: boolean;
  @Input() formId: string;
  @Input()rowData: any[];
  @Input()purchaseInfo: any;
  @Output()finish: EventEmitter<boolean>;
  @ViewChild('operationPlanTpl')operationPlanTpl: TemplateRef<any>;
  @ViewChild('operationSupTpl')operationSupTpl: TemplateRef<any>;
  @ViewChild('operationRgithSupTpl')operationRgithSupTpl: TemplateRef<any>;
  @ViewChild('userOperationTpl')userOperationTpl: TemplateRef<any>;
  MaxLenInputEnum = MaxLenInput;
  infoForm: FormGroup;
  mapPipe: MapPipe;
  purchasePlanTableConfig: UfastTableNs.TableConfig;
  supplierTableConfig: UfastTableNs.TableConfig;
  supplierDataList: any[];
  supplierModalShow: boolean;

  allSupTableConfig: UfastTableNs.TableConfig;
  allSupDataList: any[];
  filterSuppleir: any;
  userInfo: UserServiceNs.UserInfoModel;
  moneyNumDec = environment.otherData.moneyDec;
  moneyNumMax = environment.otherData.moneyMax;
  purchaseSteps: PurchaseStepsNs.PurchaseStep = {
    mainStep: PurchaseStepsNs.steps.approveForm,
    subStep: PurchaseStepsNs.subSteps.editApproveForm
  };
  materialNoList: string[];
  materialNoSet: Set<string>;
  supplierTableList: any[];
  supplierTableRightField: string;
  purchaseWaySupplierNum: {[index: string]: {min: number; max: number; message: string; }};
  banSelectSupplier: boolean;
  showSelectUserModal: boolean;
  userTableConfig: UfastTableNs.TableConfig;
  userDataList: any[];
  userFieldPrefix: string;
  constructor(private formBuilder: FormBuilder, private supplierManage: SupplierManageService, private userService: UserService,
              private messageService: ShowMessageService, private approvalFormService: ApprovalFormService,
              private selectClauseService: SelectClauseService) {
    this.userDataList = [];
    this.banSelectSupplier = false;
    this.purchaseWaySupplierNum = {};
    this.purchaseWaySupplierNum[ApprovalFormNs.PurchaseWay.OpenTender] = { min: 0, max: 0, message: ''};
    this.purchaseWaySupplierNum[ApprovalFormNs.PurchaseWay.InviteTender] = { min: 3, max: Infinity, message: '采购方式:邀请招标,至少选择三家供应商'};
    this.purchaseWaySupplierNum[ApprovalFormNs.PurchaseWay.SingleSource] = { min: 1, max: 1, message: '采购方式:单一来源，必须且只能选择一家供应商'};
    this.purchaseWaySupplierNum[ApprovalFormNs.PurchaseWay.Compete] = { min: 2, max: Infinity, message: '采购方式:竞争性谈判，至少选择两家供应商'};
    this.purchaseWaySupplierNum[ApprovalFormNs.PurchaseWay.Inquiry] = { min: 3, max: Infinity, message: '采购方式:询比价，至少选择三家供应商'};

    this.finish = new EventEmitter<boolean>();
    this.mapPipe = new MapPipe();
    this.supplierDataList = [];
    this.allSupDataList = [];
    this.supplierModalShow = false;
    this.filterSuppleir = {};
    this.supplierTableList = [];
    this.supplierTableRightField = '_right';
    this.showSelectUserModal = false;
  }
  public exitPage() {
    this.finish.emit(false);
  }
  private initNewInfo() {

    let planSource = '';
    this.rowData.forEach((item, index: number) => {
      item['originPlanDetailId'] = item.id;
      item['purchasePlanDetailId'] = item.id;
      item['materialCode'] = item.materialNo;
      item.rowNo = index + 1;
      if (planSource.search(`${item.orgName}、`) === -1) {
        planSource += `${item.orgName}、`;
      }
      this.materialNoList.push(item['materialCode']);
      this.materialNoSet.add(item['materialCode']);
    });
    planSource = planSource.substr(0, planSource.length - 1);
    const info = {
      approveNo: '系统生成',
      createDate: new Date(),
      status: ApprovalFormNs.ApprovalStatus.Init,
      purchaseSource: planSource
    };
    this.infoForm.patchValue(Object.assign(info, this.purchaseInfo));
    this.banSelectSupplier = this.purchaseInfo.purchaseMethod === ApprovalFormNs.PurchaseWay.OpenTender;
    this.getUserInfo();
  }
  public onSelectClause() {
    this.selectClauseService.showClauseModal({filters: {
      purchaseWay: this.purchaseInfo.purchaseMethod, type: SelectClauseNs.ClauseType.ApprovalForm
    }}).subscribe((resData) => {
      this.infoForm.patchValue({
        clauseNo: `${resData.selectedClause.clauseNo}|${resData.selectedClauseItem.seq}`,
        clauseContent: `${resData.selectedClause.content}\n${resData.selectedClauseItem.content}`
      });
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public delSup(rowNo: number) {
    this.supplierDataList.splice(rowNo - 1, 1);
    this.supplierTableList = [];
    this.supplierDataList.forEach((item, index: number) => {
      item.rowNo = index + 1;
      this.resetSupplierTable(item, index);
    });
  }
  public delRow(rowNo: number) {
    if (this.rowData.length === 1) {
      this.messageService.showToastMessage('计划行不能为空', 'warning');
      return;
    }
    this.rowData.splice(rowNo - 1, 1);
    let planSource = '';
    this.materialNoSet.clear();
    this.rowData = this.rowData.map((item, index: number) => {
      this.materialNoSet.add(item['materialCode']);
      item.rowNo = index + 1;
      if (planSource.search(`${item.orgName}、`) === -1) {
        planSource += `${item.orgName}、`;
      }
      return item;
    });
    this.infoForm.patchValue({
      purchaseSource: planSource
    });
  }
  public addSupplier() {
    this.supplierModalShow = true;
    this.getAllSupplierList();
  }
  public supplierRelationship() {
    window.open(environment.otherData.supplierRelationshipUrl);
  }
  public onCancelSupplier() {
    this.supplierModalShow = false;
  }
  private addOrDelSupplier(supplier, checked: boolean) {
    const index = this.supplierDataList.findIndex(item => item.supplierId === supplier.supplierId);
    if (checked) {
      if (index !== -1) {
        return;
      }
      supplier['rowNo'] = this.supplierDataList.length + 1;
      this.supplierDataList.push(supplier);
    } else {
      if (index === -1) {
        return;
      }
      this.supplierDataList.splice(index, 1);
      this.supplierDataList.forEach((item, i) => {
        item['rowNo'] = i + 1;
      });
    }
  }
  public selectedRelation(event: UfastTableNs.SelectedChange) {
    const checked = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
    if (event.index === -1) {
      this.allSupTableConfig.checkAll = checked;
      this.allSupDataList.forEach((item: any) => {
        item[this.allSupTableConfig.checkRowField] = checked;
        this.addOrDelSupplier(item, checked);
      });
      this.supplierTableList = [];
      this.supplierDataList.forEach((item, i) => {
        this.resetSupplierTable(item, i);
      });
      return;
    }
    this.allSupTableConfig.checkAll = checked;
    if (checked) {
      for (let i = 0, len = this.allSupDataList.length; i < len; i++) {
        if (!this.allSupDataList[this.allSupTableConfig.checkRowField]) {
          this.allSupTableConfig.checkAll = false;
          break;
        }
      }
    }
    this.addOrDelSupplier(this.allSupDataList[event.index], checked);
    this.supplierTableList = [];
    this.supplierDataList.forEach((item, i) => {
      this.resetSupplierTable(item, i);
    });
  }
  getAllSupplierList = () => {
    this.filterSuppleir['materialNos'] = Array.from(this.materialNoSet);
    // this.filterSuppleir['purchaseWay'] = this.rowData[0].purchaseWay;
    const filter = {
      pageSize: this.allSupTableConfig.pageSize,
      pageNum: this.allSupTableConfig.pageNum,
      filters: this.filterSuppleir
    };
    this.allSupTableConfig.loading = true;
    this.allSupTableConfig.checkAll = false;
    this.supplierManage.getSupplierFilterScope(filter).subscribe((resData) => {
      this.allSupTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.allSupDataList = resData.value.list;
      this.allSupTableConfig.total = resData.value.total;
      let checkedLen = 0;
      this.allSupDataList.forEach((item) => {
        // item.supplierId = item.supplierId;
        // item.supplierERPCode = item.supplierERPCode;
        item.supplierName = item.name;
        item[this.allSupTableConfig.checkRowField] =
          !!this.supplierDataList.find(supplier => supplier.supplierId === item.supplierId);
        checkedLen += item[this.allSupTableConfig.checkRowField] ? 1 : 0;
      });
      if (checkedLen === this.allSupDataList.length && checkedLen > 0) {
        this.allSupTableConfig.checkAll = true;
      }
    }, (error) => {
      this.allSupTableConfig.loading = true;
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  public doSubmitFormData(status?: ApprovalFormNs.ApprovalStatus) {
    Object.keys(this.infoForm.controls).forEach((key) => {
      this.infoForm.controls[key].markAsDirty();
      this.infoForm.controls[key].updateValueAndValidity();
    });
    if (this.infoForm.invalid) {
      this.messageService.showToastMessage('请填写正确的计划执行信息', 'warning');
      return;
    }
    if (this.rowData.length === 0) {
      this.messageService.showToastMessage('计划行不能为空', 'warning');
      return;
    }
    const info = this.infoForm.getRawValue();
    const supplierNum = this.supplierDataList.length;
    const supplierNumObj = this.purchaseWaySupplierNum[info.purchaseMethod];
    if (supplierNum < supplierNumObj.min || supplierNum > supplierNumObj.max) {
      this.messageService.showToastMessage(supplierNumObj.message, 'warning');
      return;
    }
    info['purchaseApproveDetailVOList'] = this.rowData;
    info['purchaseApproveSupplierVOList'] = this.supplierDataList;
    info.status = status || info.status;
    this.approvalFormService.saveApproveForm(info).subscribe((resData: ApprovalFormNs.UfastHttpResT<any>) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.finish.emit(true);
    });
  }
  public saveForm() {
    this.doSubmitFormData(ApprovalFormNs.ApprovalStatus.Init);
  }
  public submitForm() {
    this.doSubmitFormData(ApprovalFormNs.ApprovalStatus.WaitApprove);
  }
  private getUserInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.AuthAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.userInfo = resData.value;
      this.infoForm.patchValue({creatorName: resData.value.name});
    }, (error) => {
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  private getFormDetail() {
    this.approvalFormService.getApprovalFormDetail(this.formId).subscribe((resData: ApprovalFormNs.UfastHttpResT<any>) => {
      this.rowData = resData.value.purchaseApproveFullDetailVOList;
      this.rowData.forEach((item) => {
        this.materialNoList.push(item['materialCode']);
        this.materialNoSet.add(item['materialCode']);
      });

      this.supplierDataList = resData.value.purchaseApproveSupplierVOList;

      this.supplierTableList = [];
      this.supplierDataList.forEach((item, index) => {
        this.resetSupplierTable(item, index);
      });
      this.banSelectSupplier = resData.value.purchaseMethod === ApprovalFormNs.PurchaseWay.OpenTender;
      this.infoForm.patchValue(resData.value);
      this.purchaseInfo = resData.value;
    });
  }
  private resetSupplierTable(supplier: any, index: number) {
      const temp = Object.assign({}, supplier);
      if (index % 2 === 0) {
        this.supplierTableList.push(temp);
      } else {
        Object.keys(supplier).forEach((key: string) => {
          this.supplierTableList[(index - 1) / 2][key + this.supplierTableRightField] = supplier[key];
        });
      }
  }
  public showSelectUser(fieldPrefix: string) {
    this.userFieldPrefix = fieldPrefix;
    this.showSelectUserModal = !this.showSelectUserModal;
    this.getUserList();
  }
  public onCancelUser() {
    this.showSelectUserModal = !this.showSelectUserModal;
  }
  getUserList = () => {
    const filter = {
      filters: {},
      pageSize: this.userTableConfig.pageSize,
      pageNum: this.userTableConfig.pageNum
    };
    this.userService.getUserList(filter).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.userTableConfig.total = resData.value.total;
      this.userDataList = resData.value.list;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onUserSelect(name: string, userId: string) {
    this.showSelectUserModal = !this.showSelectUserModal;
    this.infoForm.get(`${this.userFieldPrefix}Name`).patchValue(name);
    this.infoForm.get(`${this.userFieldPrefix}Id`).patchValue(userId);
  }
  public clearFlowUser(fieldPrefix: string) {
    this.infoForm.get(`${fieldPrefix}Name`).patchValue(null);
    this.infoForm.get(`${fieldPrefix}Id`).patchValue(null);
  }
  ngOnInit() {
    this.infoForm = this.formBuilder.group({
      id: [null],
      approveNo: [{value: null , disabled: true}, [Validators.required]],
      purchaseType: [{value: null , disabled: true}, [Validators.required]],
      purchaseMethod: [{value: null , disabled: true}, [Validators.required]],
      priceType: [null, [Validators.required]],
      totalPrice: [null, [Validators.required]],
      businessType: [{value: null , disabled: true}, [Validators.required]],
      creatorName: [{value: null , disabled: true}, [Validators.required]],
      createDate : [{value: null , disabled: true}, [Validators.required]],
      status: [{value: null , disabled: true}, [Validators.required]],
      strategy: [null, [Validators.required]],
      purchaseSource: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.MaxLenInputEnum.PurchaseSource)]],
      clauseNo: [null, [Validators.required]],
      clauseContent : [null, [Validators.required]],
      remark: [null, [Validators.maxLength(this.MaxLenInputEnum.Remark)]],
      flowSupplierName: [null, [Validators.required]],
      flowSupplierId: [null, [Validators.required]],
      flowPurchaserId: [null, [Validators.required]],
      flowPurchaserName: [null, [Validators.required]]
    });
    this.purchasePlanTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '操作', tdTemplate: this.operationPlanTpl, fixed: true, width: 60},
        {title: '行号', field: 'rowNo', width: 60, fixed: true},
        {title: '采购计划编号', field: 'purchasePlanNo', width: 170},
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '采购计划行号', field: 'indexNo', width: 80},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料名称', field: 'materialName', width: 140},
        {title: '属性描述', field: 'materialDesc', width: 140},
        {title: '单位', field: 'unit', width: 100},
        {title: '采购数量', field: 'quantity', width: 100},
        {title: '采购含税价(元)', field: 'unitPrice', width: 120},
        {title: '总价(元)', field: 'totalPrice', width: 100},
      ]
    };
    this.supplierTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '操作', tdTemplate: this.operationSupTpl, width: 40},
        {title: '行号', field: 'rowNo', width: 40},
        {title: '供应商编码', field: 'supplierERPCode', width: 100},
        {title: '供应商名称', field: 'supplierName', width: 170},

        {title: '操作', tdTemplate: this.operationRgithSupTpl, width: 40},
        {title: '行号', field: 'rowNo' + this.supplierTableRightField, width: 40},
        {title: '供应商编码', field: 'supplierERPCode' + this.supplierTableRightField, width: 100},
        {title: '供应商名称', field: 'supplierName' + this.supplierTableRightField, width: 170},
      ]
    };
    this.allSupTableConfig = {
      showCheckbox: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        {title: '供应商编码', field: 'supplierERPCode', width: 80},
        {title: '供应商名称', field: 'supplierName', width: 150},
        {title: '供应范围', field: 'supplyRange', width: 150}
      ]
    };
    this.materialNoList = [];
    this.materialNoSet = new Set<string>();
    if (this.isNew) {
      this.initNewInfo();
    } else {
      this.getFormDetail();
    }
    this.userTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        {title: '操作', tdTemplate: this.userOperationTpl, width: 100},
        {title: '用户名', field: 'name', width: 100},
        {title: '联系电话', field: 'mobile', width: 100},
      ]
    };
  }

}
