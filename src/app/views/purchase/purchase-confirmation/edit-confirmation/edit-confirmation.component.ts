import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { SelectClauseService, SelectClauseNs } from '../../common-component/select-clause/select-clause.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { PurchaseConfirmationService, PurchaseConfirmationServiceNS } from '../../../../core/trans/purchase-confirmation.service';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { UploadModalService } from '../../../../widget/upload-modal/upload-modal';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { PurchaseStepsNs } from '../../common-component/purchase-steps/purchase-steps.component';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { UserService } from '../../../../core/common-services/user.service';
enum MaxLenInput {
  Manufacturer = 50,
  MaterialModel = 50,
  LifeTime = 15
}
export interface TabPageType {
  editConfirmationPage: number;
  editContractPage: number;
  detailContractPage: number;
}
interface ActionStatus {
  backRow: boolean;
}
@Component({
  selector: 'app-edit-confirmation',
  templateUrl: './edit-confirmation.component.html',
  styleUrls: ['./edit-confirmation.component.scss']
})
export class EditConfirmationComponent implements OnInit {
  @Input()
  set confirmationId(value: string) {
    if (value) {
      this.currId = value;
      this.getConfirmationDetail();
    }
  }
  get confirmationId(): string {
    return this.currId;
  }
  @Input() isNewOrder: boolean;
  @Input() isReturnPass: boolean;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('contractOperateTpl') contractOperateTpl: TemplateRef<any>;
  @ViewChild('manufacturerTpl') manufacturerTpl: TemplateRef<any>;
  @ViewChild('materialModelTpl') materialModelTpl: TemplateRef<any>;
  @ViewChild('lifeTimeTpl') lifeTimeTpl: TemplateRef<any>;
  @ViewChild('priceTpl') priceTpl: TemplateRef<any>;
  @ViewChild('deliveryDateTpl') deliveryDateTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('userOperationTpl') userOperationTpl: TemplateRef<any>;
  MaxLenInputEnum = MaxLenInput;
  public selectedPage = 0;
  public tabPageType: TabPageType = {
    editConfirmationPage: 0,
    editContractPage: 1,
    detailContractPage: 2
  };
  public editConfirmationForm: FormGroup;
  private confirmationDataMap = PurchaseConfirmationServiceNS.confirmationDataMap;
  public materialLineList: PurchaseConfirmationServiceNS.MaterialLineData[] = [];
  public materialTableConfig: UfastTableNs.TableConfig;
  public contractList: PurchaseConfirmationServiceNS.ContractData[] = [];
  public contractTableConfig: UfastTableNs.TableConfig;
  public isAgreement = false;
  public isBuyAgain = false;
  public currContractId = '';
  private paramsData: any = {};
  private isDeviceType = false;
  public downloadUrl = environment.otherData.fileServiceUrl;
  public tabIndex = 0;
  private currId = '';
  private selectedClauseIds = {
    titleId: '',
    itemId: ''
  };
  public purchaseSteps: PurchaseStepsNs.PurchaseStep = {
    mainStep: PurchaseStepsNs.steps.confirmation,
    subStep: PurchaseStepsNs.subSteps.editConfirmation
  };
  public lengthLimit = {
    default: 50,
    precision: environment.otherData.materialNumDec,
    priceMax: environment.otherData.moneyMax,
    pricePrecision: environment.otherData.moneyDec
  };
  public actionStatus: { [id: string]: ActionStatus } = {};
  countContract: number;
  showSelectUserModal: boolean;
  userTableConfig: UfastTableNs.TableConfig;
  userDataList: any[];
  status: number;
  returnSubmitData: any;
  constructor(private selectedClauseService: SelectClauseService, private userService: UserService,
    private messageService: ShowMessageService,
    private formBuilder: FormBuilder,
    private confirmationService: PurchaseConfirmationService,
    private uploadService: UploadModalService,
    private route: ActivatedRoute,
    private ufastService: UfastUtilService) {
    this.userDataList = [];
    this.returnSubmitData = {
      ids: []
    };
  }

  public getConfirmationDetail() {
    this.materialLineList = [];
    this.contractList = [];
    this.confirmationService.getConfirmationDetail(this.confirmationId).subscribe((resData) => {
      this.countContract = resData.value.countContract;
      this.status = resData.value.status;
      Object.keys(this.editConfirmationForm.controls).forEach((key) => {
        this.editConfirmationForm.controls[key].patchValue(resData.value[this.confirmationDataMap[key].key]);
      });
      this.isAgreement = resData.value[this.confirmationDataMap.purchaseWay.key] ===
        PurchaseConfirmationServiceNS.PurchaseWay.AnualAgreement;
      this.isBuyAgain = resData.value[this.confirmationDataMap.purchaseWay.key] === PurchaseConfirmationServiceNS.PurchaseWay.BuyAgain;
      this.materialLineList = [];
      this.actionStatus = {};
      // this.status = resData.value.status;
      if (!resData.value.groupVOS && resData.value.detailVOS) {
        resData.value.detailVOS.forEach((item, index) => {
          item.indexNo = ++index;
          this.materialLineList.push(item);
        });
      }
      if (resData.value.groupVOS) {
        resData.value[this.confirmationDataMap.materialList.key].forEach(
          (item, index) => {
            this.materialLineList.push({
              index: index,
              lineNo: item[this.confirmationDataMap.lineNo.key],
              contractNo: item.contractNo,
              id: item[this.confirmationDataMap.id.key],
              materialType: item[this.confirmationDataMap.materialType.key],
              materialCode: item[this.confirmationDataMap.materialCode.key],
              materialDesc: item[this.confirmationDataMap.materialDesc.key],
              unit: item[this.confirmationDataMap.unit.key],
              purchaseQuantity: item[this.confirmationDataMap.purchaseQuantity.key],
              unitPrice: item[this.confirmationDataMap.unitPrice.key],
              currency: item[this.confirmationDataMap.currency.key],
              tax: item[this.confirmationDataMap.tax.key],
              lineTotalPrice: item[this.confirmationDataMap.lineTotalPrice.key],
              supplier: item[this.confirmationDataMap.supplier.key],
              manufacturer: item[this.confirmationDataMap.manufacturer.key] || '',
              materialModel: item[this.confirmationDataMap.materialModel.key],
              lifeTime: item[this.confirmationDataMap.lifeTime.key] || '',
              useOrgName: item[this.confirmationDataMap.useOrgName.key],
              deliveryDate: item['deliveryDate'] ? new Date(item['deliveryDate']) : null,
              subtota: false
            });
            const material = <any>{};
            Object.keys(this.confirmationDataMap).forEach((ele) => {
              material[ele] = null;
            });
            material.materialCode = item.materialNo;
            material.materialDesc = '小计';
            material.contractNo = item.contractNo;
            material.purchaseQuantity = item.quantity;
            material.supplier = item.supplierName;
            material.subtota = true;
            material.lineTotalPrice = item.totalPrice;
            this.materialLineList.push(material);
            // this.actionStatus[item.id] = {
            //   backRow: item.countContract
            // };
          });
      }
      this.materialLineList.forEach((item) => {
        item['_this'] = item;
        this.actionStatus[item.id] = {
          backRow: item.contractNo !== ''
        };
      });
      this.isDeviceType = this.materialLineList[0] ?
        this.materialLineList[0].materialType === PurchaseConfirmationServiceNS.MaterialType.Device : false;
      if (this.isDeviceType) {
        this.materialTableConfig.headers.splice(4, 0,
          { title: '生产厂家', tdTemplate: this.manufacturerTpl, width: 100 },
          { title: '规格型号', tdTemplate: this.materialModelTpl, thClassList: ['table-required-mark'], width: 100 });
      }
      if (this.isAgreement) {
        this.materialTableConfig.headers.splice(6, 0,
          { title: '确定单价', tdTemplate: this.priceTpl, width: 100, thClassList: ['table-required-mark'] },
          { title: '交货日期', tdTemplate: this.deliveryDateTpl, width: 200, thClassList: ['table-required-mark'] });
        this.materialLineList.forEach((item) => {
          item.lineTotalPrice = this.ufastService.mul((item.unitPrice || 0), item.purchaseQuantity || 0);
        });
      } else {
        this.materialTableConfig.headers.splice(6, 0,
          { title: '确定单价', field: 'unitPrice', width: 100 },
          { title: '交货日期', field: 'deliveryDate', width: 100, pipe: 'date:yyyy-MM-dd' });
      }
      this.materialTableConfig = Object.assign({}, this.materialTableConfig);
    });
  }
  public getContractInfo() {
    // if (this.contractList.length > 0) {
    //   return;
    // }
    this.confirmationService.getContractInfoByConfirm(this.confirmationId).subscribe((resData) => {
      this.contractList = [];
      resData.value.forEach((item, index) => {
        this.contractList.push({
          id: item[this.confirmationDataMap.id.key],
          seqNo: index + 1,
          lineNo: item[this.confirmationDataMap.lineNo.key],
          contractCode: item[this.confirmationDataMap.contractCode.key],
          orgName: item[this.confirmationDataMap.orgName.key],
          supplier: item[this.confirmationDataMap.supplier.key],
          materialType: item[this.confirmationDataMap.materialType.key],
          tax: item[this.confirmationDataMap.tax.key],
          contractAmount: item[this.confirmationDataMap.contractAmount.key],
          carryingMethod: item[this.confirmationDataMap.carryingMethod.key],
          signDate: item[this.confirmationDataMap.signDate.key]
        });
      });
    });
  }
  public beforeSubmit() {
    Object.keys(this.editConfirmationForm.controls).forEach((key) => {
      this.editConfirmationForm.controls[key].markAsDirty();
      this.editConfirmationForm.controls[key].updateValueAndValidity();
    });
    if (this.editConfirmationForm.invalid) {
      return false;
    }
    this.paramsData = {};
    this.paramsData['id'] = this.currId;
    this.paramsData[this.confirmationDataMap.contractVersion.key] = this.editConfirmationForm.controls['contractVersion'].value;
    this.paramsData[this.confirmationDataMap.payNature.key] = this.editConfirmationForm.controls['payNature'].value;
    this.paramsData[this.confirmationDataMap.clauseItem.key] = this.editConfirmationForm.controls['clauseItem'].value;
    this.paramsData[this.confirmationDataMap.clauseTitle.key] = this.editConfirmationForm.controls['clauseTitle'].value;
    this.paramsData[this.confirmationDataMap.purchaseSummary.key] = this.editConfirmationForm.controls['purchaseSummary'].value;
    this.paramsData[this.confirmationDataMap.attachmentUrl.key] = this.editConfirmationForm.controls['attachmentUrl'].value;
    this.paramsData[this.confirmationDataMap.attachment.key] = this.editConfirmationForm.controls['attachment'].value;
    this.paramsData['flowPurchaserId'] = this.editConfirmationForm.controls['flowPurchaserId'].value;
    this.paramsData['flowPurchaserName'] = this.editConfirmationForm.controls['flowPurchaserName'].value;
    // if (!this.isDeviceType) {
    //   return true;
    // }
    this.paramsData[this.confirmationDataMap.materialList.key] = [];
    const verifyFieldList = [];
    if (this.isDeviceType) {
      verifyFieldList.push(
        { field: 'materialModel', msg: '规格型号必填' },
        { field: 'unitPrice', msg: '确认单价必填' },
      );
    }
    if (this.isAgreement) {
      verifyFieldList.push({ field: 'deliveryDate', msg: '交货日期必填' });
    }
    const validMaterialList = [];
    this.materialLineList.forEach((item) => {
      if (item.id) {
        validMaterialList.push(item);
      }
    });
    for (let i = 0, len = validMaterialList.length; i < len; i++) {
      const item = validMaterialList[i];
      const temp = {};
      temp['id'] = validMaterialList[i].id;
      const error = verifyFieldList.find(fieldObj => !item[fieldObj.field]);
      if (error) {
        this.messageService.showToastMessage(error.msg, 'warning');
        return false;
      }
      temp[this.confirmationDataMap.materialModel.key] = item.materialModel;
      temp[this.confirmationDataMap.manufacturer.key] = item.manufacturer || '';
      temp[this.confirmationDataMap.lifeTime.key] = item.lifeTime;
      temp['unitPrice'] = item['unitPrice'];
      temp['deliveryDate'] = item['deliveryDate'];
      temp['totalPrice'] = item['lineTotalPrice'];
      this.paramsData[this.confirmationDataMap.materialList.key].push(temp);
    }
    return true;
  }
  public saveConfirmation() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.confirmationService.saveConfirmation(this.paramsData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitPage(true);
    });
  }
  public submitConfirmation() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.confirmationService.submitConfirmation(this.paramsData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitPage(true);
    });
  }
  public showUploadModal() {
    this.uploadService.showUploadModal({
      title: '上传文件',
      maxFileNum: 1,
      placeHolder: ''
    }).subscribe((resData) => {
      this.editConfirmationForm.controls['attachmentUrl'].patchValue(resData[0].value);
      this.editConfirmationForm.controls['attachment'].patchValue(resData[0].fileName);
    });
  }
  public showSelectedClauseModal() {
    const paramsData: SelectClauseNs.SelectedData = {
      filters: {
        purchaseWay: this.editConfirmationForm.controls['purchaseWay'].value || '',
        type: SelectClauseNs.ClauseType.ConfirmForm
      },
      selectedClauseId: this.selectedClauseIds.titleId,
      selectedClauseItemId: this.selectedClauseIds.itemId
    };
    this.selectedClauseService.showClauseModal(paramsData).subscribe((resData) => {
      this.editConfirmationForm.controls['clauseTitle'].patchValue(resData.selectedClause.content);
      this.editConfirmationForm.controls['clauseItem'].patchValue(resData.selectedClauseItem.content);
      this.selectedClauseIds.titleId = resData.selectedClause.id;
      this.selectedClauseIds.itemId = resData.selectedClauseItem.id;
    });
  }
  public showContractDetail(id) {
    this.currContractId = id;
    this.selectedPage = this.tabPageType.detailContractPage;
  }
  public editContract(id) {
    this.currContractId = id;
    this.selectedPage = this.tabPageType.editContractPage;
  }
  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }
  public onContractEmit(refresh) {
    this.selectedPage = this.tabPageType.editConfirmationPage;
    if (refresh) {
      this.getContractInfo();
    }
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public unitPriceChange(unitPrice, index) {
    /**物料行合计 */
    const item = this.materialLineList[(this.materialTableConfig.pageNum - 1) * this.materialTableConfig.pageSize + index];
    item.lineTotalPrice = this.ufastService.mul(unitPrice, item.purchaseQuantity);
    /**头部总金额 */
    let total = 0;
    this.materialLineList.forEach((temp) => {
      total = this.ufastService.add(total, temp.lineTotalPrice);
    });
    this.editConfirmationForm.patchValue({
      contractAmount: total
    });
  }
  public onRowBack(id) {
    this.doRowBack([id]);
  }
  private doRowBack(ids: string[]) {
    if (ids.length === 0) {
      return;
    }
    this.messageService.showAlertMessage('', '确定退回?', 'confirm').afterClose
      .subscribe((type) => {
        if (type !== 'onOk') {
          return;
        }
        this.confirmationService.backRows(ids, this.confirmationId).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.getConfirmationDetail();
        });
      });
  }
  public reNewConfirmation() {
    this.confirmationService.reCreateContract(this.confirmationId).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitPage(true);
    });
  }
  public showSelectUser() {
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
    this.editConfirmationForm.get('flowPurchaserName').patchValue(name);
    this.editConfirmationForm.get(`flowPurchaserId`).patchValue(userId);
  }
  public clearFlowUser() {
    this.editConfirmationForm.get(`flowPurchaserName`).patchValue(null);
    this.editConfirmationForm.get(`flowPurchaserId`).patchValue(null);
  }
  public returnContract() {
    this.returnSubmitData.ids = [];
    this.materialLineList.forEach((item) => {
      if (item[this.materialTableConfig.checkRowField]) {
        this.returnSubmitData.ids.push(item.id);
      }
    });
    if (!this.returnSubmitData.ids.length) {
      this.messageService.showToastMessage('请选择要退回的数据', 'warning');
      return;
    }
    this.confirmationService.returnContract(this.currId, this.returnSubmitData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.getConfirmationDetail();
    });
  }
  public confirmReturnModal() {
    this.confirmationService.returnContract(this.currId, this.returnSubmitData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.getConfirmationDetail();
    });
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.materialLineList.length; i < len; i++) {
      if (!this.materialLineList[i][this.materialTableConfig.checkRowDisabledField]) {
        this.materialLineList[i][this.materialTableConfig.checkRowField] = isAllChoose;
      }

    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.materialTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.materialTableConfig.checkAll = this.materialLineList.every((item) => {
        return item[this.materialTableConfig.checkRowField] === true;
      });
    }
  }
  ngOnInit() {
    this.editConfirmationForm = this.formBuilder.group({
      confirmationCode: [{ value: null, disabled: true }],
      approveCode: [{ value: null, disabled: true }],
      attachmentUrl: [null],
      attachment: [null],
      contractVersion: [null, [Validators.required]],
      contractAmount: [{ value: null, disabled: true }],
      contractOrAgreementNo: [{ value: null, disabled: true }],
      payNature: [null, [Validators.required]],
      purchaseWay: [{ value: null, disabled: true }],
      clauseTitle: [null, [Validators.required]],
      clauseItem: [null, [Validators.required]],
      purchaseSummary: [null, [Validators.required]],
      creator: [{ value: null, disabled: true }],
      createDate: [{ value: null, disabled: true }],
      flowPurchaserId: [null],
      flowPurchaserName: [null, [Validators.required]]
    });
    this.materialTableConfig = {
      showCheckbox: true,
      checkRowField: 'checked',
      checkRowDisabledField: 'subtota',
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '行号', field: 'lineNo', width: 50 },
        { title: '合同编号', field: 'contractNo', width: 150 },
        { title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 100 },
        { title: '物料编码', field: 'materialCode', width: 160 },
        { title: '物料描述', field: 'materialDesc', width: 200 },
        { title: '设计使用寿命', tdTemplate: this.lifeTimeTpl, width: 110 },
        { title: '数量', field: 'purchaseQuantity', width: 100 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '币种', field: 'currency', width: 100 },
        { title: '税率(%)', field: 'tax', width: 100 },
        { title: '总价', field: 'lineTotalPrice', width: 100 },
        { title: '供应商', field: 'supplier', width: 100 },
        { title: '使用单位', field: 'useOrgName', width: 100 }
      ]
    };
    // if (this.isReturnPass) {
    //   this.materialTableConfig.showCheckbox = true;
    //   this.materialTableConfig.checkRowDisabledField = 'subtota';
    //   // this.materialTableConfig.headers.unshift({ title: '操作', tdTemplate: this.operationTpl, width: 80 });
    // }
    this.contractTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '操作', tdTemplate: this.contractOperateTpl, width: 80 },
        { title: '序号', field: 'seqNo', width: 50 },
        { title: '合同编码', field: 'contractCode', width: 100 },
        { title: '业务实体', field: 'orgName', width: 100 },
        { title: '供应商', field: 'supplier', width: 150 },
        { title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 80 },
        { title: '税率', field: 'tax', width: 100 },
        { title: '合同总价', field: 'contractAmount', width: 100 },
        { title: '结转方式', field: 'carryingMethod', width: 120, pipe: 'contractCarryOverType' },
        { title: '签约时间', field: 'signDate', width: 120, pipe: 'date:yyyy-MM-dd' }
      ]
    };

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
        { title: '操作', tdTemplate: this.userOperationTpl, width: 100 },
        { title: '用户名', field: 'name', width: 100 },
        { title: '联系电话', field: 'mobile', width: 100 },
      ]
    };
  }

}
