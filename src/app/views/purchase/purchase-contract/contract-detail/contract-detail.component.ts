import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { PurchaseContractService, PurchaseContractServiceNs } from '../../../../core/trans/purchase-contract.service';
import { environment } from '../../../../../environments/environment';
enum TabPageTypeEnum {
  MainPage,
  contractTemplatePage,
  ReturnAuditPage
}
enum ContractDetailPageEnum {
  DetailPage = 1,
  ApplyReturn,
  ReturnAudit
}
@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss']
})
export class ContractDetailComponent implements OnInit {
  public TabPageType = TabPageTypeEnum;
  public selectedPage = TabPageTypeEnum.MainPage;
  @Input() detailId: string;
  @Input() IsDetailPage: number;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  contractInfo: any;
  contractDetailConfig: {
    name: string;
    field: string;
    pipe?: string;
    isFullSpan?: boolean;
  }[] = [];
  contractList: any[];
  contractTableConfig: UfastTableNs.TableConfig;
  downloadUrl = environment.otherData.fileServiceUrl;
  contractModelDetailTemp: any[] = [];
  public isShowTemplateModal = false;
  contractModelDetail: any;
  ContractDetailPage = ContractDetailPageEnum;
  constructor(private messageService: ShowMessageService, private contractService: PurchaseContractService) {
    this.contractDetailConfig = [
      { name: '合同编号', field: 'contractNo' },
      { name: '合同名称', field: 'contractName' },
      // { name: '合同模板', field: 'clauseTemplate' },
      { name: '业务实体', field: 'businessBody' },
      { name: '供应商', field: 'supplierName' },
      { name: '合同抬头', field: 'contractUp' },
      { name: '收货方', field: 'receivingParty' },
      { name: '结转方式', field: 'carryingMethod', pipe: 'contractCarryOverType' },
      { name: '开票单位', field: 'billingUnit' },
      { name: '业务类型', field: 'businessType', pipe: 'purchaseContractBusiness' },
      { name: '合同类型', field: 'contractType', pipe: 'purchaseContractType' },
      { name: '采购方式', field: 'purchaseMethod', pipe: 'purchaseWay' },
      { name: '运杂费类型', field: 'transportFees' },
      { name: '进项税码', field: 'tax' },
      { name: '币种', field: 'currencyCode' },
      { name: '合同总金额', field: 'totalAmount' },
      { name: '物料类型', field: 'materialType', pipe: 'materialType2' },
      { name: '签约时间', field: 'signDate', pipe: 'date: yyyy-MM-dd' },

      { name: '合同有效期', field: 'validDate', pipe: 'date: yyyy-MM-dd' },
      { name: '业务员', field: 'purchaseUser' },
      { name: '签章人', field: 'payerSignUser' },
      // { name: '附件', field: 'annexUrl'},
      { name: '创建人', field: 'createName' },
      { name: '创建日期', field: 'createDate', pipe: 'date: yyyy-MM-dd' },
      { name: '签约地址', field: 'signAddress', isFullSpan: true },
      { name: '收货地址', field: 'receivingPartyAddress', isFullSpan: true },
      { name: '摘要', field: 'summary', isFullSpan: true },
      { name: '备注', field: 'remark', isFullSpan: true }
    ];
    this.contractInfo = {};
    this.contractList = [];
    this.contractModelDetail = [];
  }
  public getContractDetail() {
    if (this.IsDetailPage === this.ContractDetailPage.ReturnAudit) {
      this.detailFunc(this.contractService.getReturnAuditContractDetail(this.detailId));
    } else {
      this.detailFunc(this.contractService.getContractDetail(this.detailId));
    }
  }
  public detailFunc(handler) {
    handler.subscribe((resData: any) => {
      this.contractInfo = resData.value;
      this.contractList = resData.value.detailsVOS;
      this.contractList.forEach((item, index) => {
        item.lineNo = item.indexNo;
      });
      if (resData.value.contractClauseVOS) {
        resData.value.contractClauseVOS.forEach((item) => {
          this.contractModelDetail.push({
            seq: item.seq,
            clauseTitle: item.clauseTitle,
            clauseContent: item.clauseContent,
          });
        });
      }
    });
  }
  public showContractModal() {
    const contractTemplate = this.contractInfo.clauseTemplate;
    this.contractModelDetailTemp = [];
    this.contractModelDetail.forEach((item) => {
      this.contractModelDetailTemp.push({
        seq: item.seq,
        clauseTitle: item.clauseTitle,
        clauseContent: item.clauseContent
      });
    });
    this.selectedPage = this.TabPageType.contractTemplatePage;

  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.contractList.length; i < len; i++) {
      this.contractList[i][this.contractTableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.contractTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.contractTableConfig.checkAll = this.contractList.every((item) => {
        return item.checked === true;
      });
    }
  }
  public backToContract() {
    this.selectedPage = this.TabPageType.MainPage;
  }
  public emitPage() {
    this.backToMainPage.emit(false);
  }
  public sendBack() {
    const backData = [];
    this.contractList.forEach((item) => {
      if (item[this.contractTableConfig.checkRowField]) {
        backData.push(item);
      }
    });
    if (!backData.length) {
      this.messageService.showToastMessage('请选择要退回的数据', 'warning');
      return;
    }
    const submitData = <any>{};
    submitData.detailIds = [];
    const detailIds = [];
    backData.forEach((item) => {
      submitData.detailIds.push(item.id);
      detailIds.push(item.id);
    });
    this.contractService.sendBackContract(this.detailId, detailIds).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.backToMainPage.emit(true);
    });
  }
  public passCancel() {
    this.doAuditCancel('通过', this.contractService.agreeCancelContract.bind(this.contractService));
  }
  public rejectCancel() {
    this.doAuditCancel('拒绝', this.contractService.rejectCancelContract.bind(this.contractService));
  }
  private doAuditCancel(msg: string, handler: Function) {
    this.messageService.showAlertMessage('', `确定审核${msg}?`, 'confirm').afterClose
      .subscribe((type) => {
        if (type !== 'onOk') {
          return;
        }
        handler(this.detailId).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.backToMainPage.emit(true);
        });
      });
  }
  ngOnInit() {
    this.getContractDetail();
    this.contractTableConfig = {
      showCheckbox: true,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      checkRowField: 'checked',
      headers: [
        { title: '行号', field: 'lineNo', width: 100 },
        // {title: this.contractDataMap.materialType.label, field: 'materialType', pipe: 'materialType2', width: 100},
        { title: '物料编码', field: 'materialNo', width: 100 },
        { title: '物料描述', field: 'materialDesc', width: 100 },
        { title: '单位', field: 'unit', width: 100 },
        { title: '含税单价', field: 'unitPrice', width: 100 },
        { title: '数量', field: 'quantity', width: 100 },
        { title: '金额', field: 'totalPrice', width: 100 },
        { title: '交货时间', field: 'deliveryDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: '备注', field: 'remark', width: 100 },
        { title: '溢短装%', field: 'moreOrLess', width: 100 }
      ]
    };
    if (this.IsDetailPage === this.ContractDetailPage.ApplyReturn) {
      this.contractTableConfig.showCheckbox = true;
    } else {
      this.contractTableConfig.showCheckbox = false;
    }
  }

}
