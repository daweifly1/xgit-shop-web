import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseContractService, PurchaseContractServiceNs } from '../../../../core/trans/purchase-contract.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { UploadModalService } from '../../../../widget/upload-modal/upload-modal';
import { environment } from '../../../../../environments/environment';
import { NzModalService } from 'ng-zorro-antd';
import { DictionaryService, DictionaryServiceNs } from '../../../../core/common-services/dictionary.service';
import { PurchaseStepsNs } from '../purchase-steps/purchase-steps.component';
import { ContractClauseTemplateService } from '../../../../core/trans/purchase/contract-clause-template.service';

export interface TypeList {
  value: string;
  label: string;
}
export interface TabPageType {
  mainPage: number;
  maintainPage: number;
}
enum MaxInputLen {
  SignLocation = 100,
  ReceiveAddress = 100,
  Abstract = 100,
  Remark = 500
}
enum ContractTypeEnum {
Purchase = 1,
Agreement
}
@Component({
  selector: 'app-edit-contract',
  templateUrl: './edit-contract.component.html',
  styleUrls: ['./edit-contract.component.scss']
})
export class EditContractComponent implements OnInit {
  @Input() contractId: string;
  /**
   * 合同类型：
   * annualAgreement 年度协议
   * contract 采购合同
   */
  @Input() contractType: string;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('remarkMaterialTpl') remarkMaterialTpl: TemplateRef<any>;
  @ViewChild('remarkDeviceTpl') remarkDeviceTpl: TemplateRef<any>;
  @ViewChild('qtyRcvToleranceTpl') qtyRcvToleranceTpl: TemplateRef<any>;
  @ViewChild('selectAddressTpl') selectAddressTpl: TemplateRef<any>;
  @ViewChild('selectTemplateTpl') selectTemplateTpl: TemplateRef<any>;
  public editContractForm: FormGroup;
  public materialPartsTableConfig: UfastTableNs.TableConfig;
  public deviceTableConfig: UfastTableNs.TableConfig;
  public materialPartsList: PurchaseContractServiceNs.MaterialListData[] = [];
  public deviceList: PurchaseContractServiceNs.DeviceListData[] = [];
  private contractDataMap = PurchaseContractServiceNs.contractDataMap;
  public contractModelList: TypeList[] = [];
  public freightTypeList: TypeList[] = [];
  public isPurchaseContract = true;
  public isDeviceType = false;
  public isShowBatchModal = false;
  public qtyRcvTolerance = null;
  public downloadUrl = environment.otherData.fileServiceUrl;
  private originList = [];
  private paramsData = {};
  private invoiceInfo = { orgName: '', receiverName: '' };
  private originBusiness = { name: '', id: '' };
  public isShowAddressModal = false;
  public addressTableConfig: UfastTableNs.TableConfig;
  public addressList = [];
  public contractModelDetail = [];
  public contractModelDetailTemp: PurchaseContractServiceNs.ContractClauseData[] = [];
  public isShowTemplateModal = false;
  public templateList: { code: string; name: string; id?: string; }[] = [];
  public templateTableConfig: UfastTableNs.TableConfig;
  private contractDetailKeys = ['id', 'carryOver', 'freightType', 'signDate', 'signLocation', 'validDate', 'signature', 'receiveAddress',
    'abstract', 'invoiceEntity', 'attachmentUrl', 'remark', 'contractModel', 'contractModelId', 'attachment'];
  private deviceMaterialKeys = ['index', 'id', 'lineNo', 'materialType', 'materialCode', 'materialDesc', 'materialModel', 'manufacturer',
    'technicalParameters', 'unit', 'purchaseQuantity', 'unitPrice', 'lineAmount', 'deliveryDate', 'remark'];
  private materialKeys = ['index', 'id', 'lineNo', 'materialType', 'materialCode', 'materialDesc', 'unit', 'purchaseQuantity', 'unitPrice',
    'lineAmount', 'deliveryDate', 'remark', 'qtyRcvTolerance', 'isChecked'];
  public purchaseSteps: PurchaseStepsNs.PurchaseStep = {
    mainStep: PurchaseStepsNs.steps.confirmation,
    subStep: PurchaseStepsNs.subSteps.editContract
  };
  public lenghtLimit = {
    default: 50
  };
  public tabPageType = {
    mainPage: 0,
    clausePage: 1,
  };
  public selectedPage = 0;
  MaxInputLenEnum = MaxInputLen;
  ContractType = ContractTypeEnum;
  constructor(private formBuilder: FormBuilder,
    private contractService: PurchaseContractService,
    private messageService: ShowMessageService,
    private uploadService: UploadModalService,
    private modalService: NzModalService,
    private dictionaryService: DictionaryService,
    private templateService: ContractClauseTemplateService) { }

  private getContractDetail() {
    this.contractService.getContractDetail(this.contractId).subscribe((resData) => {
      const temp = {};
      Object.keys(this.editContractForm.controls).forEach((key) => {
        temp[key] = resData.value[this.contractDataMap[key].key];
      });
      this.originBusiness.name = resData.value[this.contractDataMap.businessBody.key];
      this.originBusiness.id = resData.value[this.contractDataMap.businessBodyId.key];
      this.editContractForm.patchValue(temp);
      if (this.editContractForm.controls['signDate'].value) {
        this.editContractForm.controls['signDate'].patchValue(new Date(this.editContractForm.controls['signDate'].value));
        this.editContractForm.controls['validDate'].patchValue(new Date(this.editContractForm.controls['validDate'].value));
      } else {
        this.editContractForm.controls['signDate'].patchValue(new Date());
        const yearAfter = new Date().setFullYear(new Date().getFullYear() + 1);
        this.editContractForm.controls['validDate'].patchValue(yearAfter);
      }
      this.contractModelDetail = [];
      if (resData.value.contractClauseVOS) {
        resData.value.contractClauseVOS.forEach((item) => {
          this.contractModelDetail.push({
            content: item.clauseTitle,
            seq: item.seq,
            type: PurchaseContractServiceNs.ClauseType.Title,
            clauseVOS: [{
              content: item.clauseContent,
              type: PurchaseContractServiceNs.ClauseType.Content,
            }]
          });
        });
      }
      this.originList = resData.value.detailsVOS || [];
      this.isDeviceType = this.editContractForm.controls['materialType'].value === PurchaseContractServiceNs.MaterialType.Device;
      this.isPurchaseContract = this.editContractForm.controls['contractType'].value ===
        PurchaseContractServiceNs.ContractType.PurchaseContract;
      let listName = '';
      let keysName = '';
      if (this.isDeviceType) {
        listName = 'deviceList';
        keysName = 'deviceMaterialKeys';
      } else {
        listName = 'materialPartsList';
        keysName = 'materialKeys';
      }
      resData.value.detailsVOS.forEach((item, index) => {
        const detailItem: any = {};
        this[keysName].forEach((key) => {
          if (key === 'index') {
            detailItem[key] = index;
            return;
          }
          if (key === 'isChecked') {
            detailItem[key] = false;
            return;
          }
          detailItem[key] = item[this.contractDataMap[key].key];
        });
        this[listName] = [...this[listName], detailItem];
      });
      let totalAmount = 0;
      if (this.isDeviceType) {
        this.deviceList.forEach((item) => {
          totalAmount += Number(item.lineAmount);
        });
      } else {
        this.materialPartsList.forEach((item) => {
          totalAmount += Number(item.lineAmount);
        });
      }
      this.editContractForm.patchValue({
        totalAmount: totalAmount
      });

    });
  }
  private getFreightTypeList() {
    this.dictionaryService.getDataDictionarySearchList({ parentCode: DictionaryServiceNs.TypeCode.TRANSPORTFEES }).subscribe((resData) => {
      this.freightTypeList = [];
      if (resData.code !== 0) {
        return;
      }
      resData.value.forEach((item) => {
        this.freightTypeList.push({
          value: item.code,
          label: item.name,
        });
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public handleCarryOverChange(val) {
    if (val === PurchaseContractServiceNs.CarryOverType.CarryByTicket) {
      this.editContractForm.controls['businessBody'].patchValue(this.editContractForm.controls['receiver'].value);
      this.editContractForm.controls['businessBodyId'].patchValue(this.editContractForm.controls['receiverId'].value);
      const receiverId = this.editContractForm.controls['receiverId'].value;
      this.getOrgInfo(receiverId, 'receiverName');
      return;
    }
    this.editContractForm.controls['businessBody'].patchValue(this.originBusiness.name);
    this.editContractForm.controls['businessBodyId'].patchValue(this.originBusiness.id);
    const orgId = this.editContractForm.controls['orgId'].value;
    this.getOrgInfo(orgId, 'orgName');
  }
  private getOrgInfo(id, type) {
    if (type === 'orgName' && this.invoiceInfo.orgName) {
      this.editContractForm.controls['invoiceEntity'].patchValue(this.invoiceInfo.orgName);
      return;
    }
    if (type === 'receiverName' && this.invoiceInfo.receiverName) {
      this.editContractForm.controls['invoiceEntity'].patchValue(this.invoiceInfo.receiverName);
      return;
    }
    this.contractService.getOrgInfo(id).subscribe((resData) => {
      if (type === 'orgName') {
        this.invoiceInfo.orgName = resData.value.invoiceName;
        this.editContractForm.controls['invoiceEntity'].patchValue(resData.value.invoiceName);
        return;
      }
      this.invoiceInfo.receiverName = resData.value.invoiceName;
      this.editContractForm.controls['invoiceEntity'].patchValue(resData.value.invoiceName);
    });
  }
  public openBatchModal() {
    const isHasMaterialChecked = this.materialPartsList.some(item => item.isChecked);
    if (!isHasMaterialChecked) {
      this.messageService.showToastMessage('请选择要修改的物料', 'warning');
      return;
    }
    this.isShowBatchModal = true;
  }
  public batchSetQtyRcvTolerance() {
    this.materialPartsList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      item.qtyRcvTolerance = this.qtyRcvTolerance;
    });
    this.isShowBatchModal = false;
  }
  private isAllChoose(isAllChoose: boolean): void {
    this.materialPartsList.forEach((item) => {
      item[this.materialPartsTableConfig.checkRowField] = isAllChoose;
    });
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.materialPartsTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.materialPartsTableConfig.checkAll = this.materialPartsList.every((item) => {
        return item[this.materialPartsTableConfig.checkRowField] === true;
      });
    }
  }
  private beforeSubmit() {
    Object.keys(this.editContractForm.controls).forEach((item) => {
      this.editContractForm.controls[item].markAsDirty();
      this.editContractForm.controls[item].updateValueAndValidity();
    });
    if (this.editContractForm.invalid) {
      return false;
    }
    if (this.isDeviceType) {
      this.deviceList.forEach((item, index) => {
        this.originList[index][this.contractDataMap.remark.key] = item.remark;
      });
    } else {
      this.materialPartsList.forEach((item, index) => {
        this.originList[index][this.contractDataMap.remark.key] = item.remark;
        this.originList[index][this.contractDataMap.qtyRcvTolerance.key] = item.qtyRcvTolerance;
      });
    }
    this.paramsData = {};
    this.contractDetailKeys.forEach((key) => {
      if (key === 'id') {
        this.paramsData[this.contractDataMap.id.key] = this.contractId;
        return;
      }
      this.paramsData[this.contractDataMap[key].key] = this.editContractForm.controls[key].value;
    });
    this.paramsData['detailsVOS'] = this.originList;
    this.paramsData['contractClauseVOS'] = this.contractModelDetail;
    return true;
  }
  public submitContract() {
    if (!this.beforeSubmit()) {
      return;
    }
    this.contractService.saveContract(this.paramsData).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitPage(true);
    });
  }
  public showUploadModal() {
    this.uploadService.showUploadModal({
      title: '上传文件',
      maxFileNum: 1,
      fileType: ['application/pdf'],
      placeHolder: '注:只支持pdf类型文件'
    }).subscribe((resData) => {
      this.editContractForm.patchValue({
        attachmentUrl: resData[0].value,
        attachment: resData[0].fileName
      });
    });
  }
  public showAddressModal() {
    this.isShowAddressModal = true;
    if (this.addressList.length > 0) {
      return;
    }
    this.getAddressInfoList();
  }
  public getAddressInfoList = () => {
    const paramsData = {
      filters: {
        orgId: this.editContractForm.controls['receiverId'].value || '',
      },
      pageSize: this.addressTableConfig.pageSize,
      pageNum: this.addressTableConfig.pageNum
    };
    this.contractService.getAddressInfo(paramsData).subscribe((resData) => {
      this.addressList = resData.value.list || [];
    });
  }
  public selectAddress(val) {
    this.editContractForm.controls['receiveAddress'].patchValue(val);
    this.isShowAddressModal = false;
  }
  public showTemplateModal() {
    this.isShowTemplateModal = true;
    if (this.templateList.length > 0) {
      return;
    }
    this.getTemplateList();
  }
  public getTemplateList = () => {
    const paramsData = {
      filters: {},
      pageSize: this.templateTableConfig.pageSize,
      pageNum: this.templateTableConfig.pageNum
    };
    this.templateService.getClauseTemplateDataList(paramsData).subscribe((resData) => {
      this.templateList = [];
      this.templateTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        this.templateList.push({
          name: item.templateName,
          code: item.templateNo,
          id: item.id,
        });
      });
    });
  }
  public selectTemplate(id, name) {
    this.editContractForm.controls['contractModel'].patchValue(name);
    this.editContractForm.controls['contractModelId'].patchValue(id);
    this.contractModelDetail = [];
    this.isShowTemplateModal = false;
  }
  public showContractModal() {
    const contractTemplate = this.editContractForm.controls['contractModel'].value;
    if (!contractTemplate) {
      this.messageService.showToastMessage('请选择合同模板', 'warning');
      return;
    }
    this.contractModelDetailTemp = [];
    if (this.contractModelDetail.length === 0) {
      this.selectedPage = this.tabPageType.clausePage;
      return;
    }
    this.contractModelDetail.forEach((item) => {
      this.contractModelDetailTemp.push({
        seq: item.seq,
        clauseTitle: item.content,
        clauseItem: item.clauseVOS[0].content
      });
    });
    this.selectedPage = this.tabPageType.clausePage;
  }
  public onChildEmit(data) {
    this.contractModelDetail = [];
    if (data) {
      this.contractModelDetail = data;
    }
    this.selectedPage = this.tabPageType.mainPage;
  }

  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  ngOnInit() {
    this.editContractForm = this.formBuilder.group({
      contractCode: [{ value: null, disabled: true }],
      contractName: [{ value: null, disabled: true }],
      contractModel: [null, [Validators.required]],
      contractModelId: [null],
      orgName: [{ value: null, disabled: true }],
      orgId: [null],
      businessBody: [{ value: null, disabled: true }],
      businessBodyId: [null],
      supplierName: [{ value: null, disabled: true }],
      contractUp: [{ value: null, disabled: true }],
      receiver: [{ value: null, disabled: true }],
      receiverId: [null],
      carryOver: [null, [Validators.required]],
      invoiceEntity: [{ value: null, disabled: true }],
      businessType: [{ value: null, disabled: true }],
      contractType: [{ value: null, disabled: true }],
      purchaseWay: [{ value: null, disabled: true }],
      freightType: [null, [Validators.required]],
      inputTax: [{ value: null, disabled: true }],
      currency: [{ value: null, disabled: true }],
      totalAmount: [{ value: null, disabled: true }],
      materialType: [{ value: null, disabled: true }],
      signDate: [null, [Validators.required]],
      signLocation: [null, [Validators.required]],
      validDate: [null, [Validators.required]],
      salesmanName: [{ value: null, disabled: true }],
      signature: [null, [Validators.required]],
      creator: [{ value: null, disabled: true }],
      createDate: [{ value: null, disabled: true }],
      receiveAddress: [null, [Validators.required]],
      abstract: [null, [Validators.required]],
      attachmentUrl: [null],
      attachment: [null],
      remark: [null],
    });
    this.materialPartsTableConfig = {
      showCheckbox: true,
      pageSize: 10,
      showPagination: true,
      frontPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      checkRowField: 'isChecked',
      checkAll: false,
      headers: [
        { title: '行号', field: 'lineNo', width: 100 },
        // {title: this.contractDataMap.materialType.label, field: 'materialType', pipe: 'materialType2', width: 100},
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '物料描述', field: 'materialDesc', width: 100 },
        { title: '单位', field: 'unit', width: 100 },
        { title: '含税单价', field: 'unitPrice', width: 100 },
        { title: '数量', field: 'purchaseQuantity', width: 100 },
        { title: '金额', field: 'lineAmount', width: 100 },
        { title: '交货时间', field: 'deliveryDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: '备注', tdTemplate: this.remarkMaterialTpl, width: 100 },
        { title: '溢短装%', tdTemplate: this.qtyRcvToleranceTpl, width: 100 },
      ]
    };
    this.deviceTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      frontPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        { title: '行号', field: 'lineNo', width: 100 },
        // {title: this.contractDataMap.materialType.label, field: 'materialType', pipe: 'materialType2', width: 100},
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '物料描述', field: 'materialDesc', width: 100 },
        { title: '规格型号', field: 'materialDesc', width: 100 },
        { title: '技术参数', field: 'materialDesc', width: 100 },
        { title: '生产厂家', field: 'materialDesc', width: 100 },
        { title: '单位', field: 'unit', width: 100 },
        { title: '含税单价', field: 'unitPrice', width: 100 },
        { title: '数量', field: 'purchaseQuantity', width: 100 },
        { title: '金额', field: 'lineAmount', width: 100 },
        { title: '交货时间', field: 'deliveryDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: '备注', tdTemplate: this.remarkDeviceTpl, width: 100 },
      ]
    };
    this.addressTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        { title: '地址', field: 'receiveAddress', width: 200 },
        { title: '操作', tdTemplate: this.selectAddressTpl, width: 50 },
      ]
    };
    this.templateTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        { title: '模板编码', field: 'code', width: 100 },
        { title: '模板名称', field: 'name', width: 200 },
        { title: '操作', tdTemplate: this.selectTemplateTpl, width: 80 },
      ]
    };
    this.getContractDetail();
    this.getFreightTypeList();
  }

}
