import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {PurchaseContractService, PurchaseContractServiceNs} from '../../../../core/trans/purchase-contract.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';

@Component({
  selector: 'app-detail-contract',
  templateUrl: './detail-contract.component.html',
  styleUrls: ['./detail-contract.component.scss']
})
export class DetailContractComponent implements OnInit {
  @Input() footerActionTpl: TemplateRef<any>;
  @Input() contractId: string;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  public indexArr = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三'];
  public contractDataMap = PurchaseContractServiceNs.contractDataMap;
  public contractHeaderInfo = {
    contractName: '',
    buyer: '',
    seller: '',
    contractCode: '',
    signDate: '',
    signLocation: '',
    totalAmount: '',
    totalAmountCapital: '',
    currency: ''
  };
  public productInfo = [];
  public clauseList = [];
  public dealInfo = {
    buyerInfo: {
      companyName: '',
      buyerAddress: '',
      legalRepresentative: '',
      entrustedAgent: '',
      mobile: '',
      postalCode: '',
    },
    invoiceInfo: {
      invoiceEntityName: '',
      detailAddress: '',
      depositBank: '',
      bankAccount: '',
      taxpayerRegistration: '',
    },
    sellerInfo: {
      companyName: '',
      sellerAddress: '',
      sellerArea: '',
      legalRepresentative: '',
      entrustedAgent: '',
      mobile: '',
      depositBank: '',
      bankAccount: '',
      socialCreditCode: '',
      postalCode: ''
    }
  };
  public otherInfo = {
    firstTitle: '一、物料信息',
    confirmMsg: '本合同上述条款经买卖双方仔细阅读并无异议',
    invoiceMsg: '增值税发票开票信息'
  };
  public isDeviceType = false;

  constructor(private contractService: PurchaseContractService,
              private messageService: ShowMessageService) { }

  public getContractDetailInfo() {
    this.contractService.getContractDetailInfo(this.contractId).subscribe((resData) => {
      Object.keys(this.contractHeaderInfo).forEach((item) => {
        this.contractHeaderInfo[item] = resData.value[this.contractDataMap[item].key];
      });
      resData.value[this.contractDataMap.productInfo.key].forEach((item) => {
        this.productInfo = [...this.productInfo, {
          lineNo: item[this.contractDataMap.lineNo.key],
          materialCode: item[this.contractDataMap.materialCode.key],
          materialName: item[this.contractDataMap.materialName.key],
          manufacturer: item[this.contractDataMap.manufacturer.key],
          materialModel: item[this.contractDataMap.materialModel.key],
          unit: item[this.contractDataMap.unit.key],
          purchaseQuantity: item[this.contractDataMap.purchaseQuantity.key],
          unitPrice: item[this.contractDataMap.unitPrice.key],
          lineAmount: item[this.contractDataMap.lineAmount.key],
          deliveryDate: item[this.contractDataMap.deliveryDate.key],
          remark: item[this.contractDataMap.remark.key],
        }];
        this.isDeviceType = item[this.contractDataMap.materialType.key] === PurchaseContractServiceNs.MaterialType.Device;
      });
      resData.value[this.contractDataMap.clauseList.key].forEach((item) => {
        this.clauseList.push({
          clauseTitle: item[this.contractDataMap.clauseTitle.key],
          clauseItem: item[this.contractDataMap.clauseItem.key]
        });
      });
      if (resData.value[this.contractDataMap.sellerInfo.key]) {
        Object.keys(this.dealInfo.sellerInfo).forEach((item) => {
          this.dealInfo.sellerInfo[item] = resData.value[this.contractDataMap.sellerInfo.key][this.contractDataMap[item].key];
        });
      }
      if ( resData.value[this.contractDataMap.buyerInfo.key]) {
        Object.keys(this.dealInfo.buyerInfo).forEach((item) => {
          this.dealInfo.buyerInfo[item] = resData.value[this.contractDataMap.buyerInfo.key][this.contractDataMap[item].key];
        });
      }
      if (resData.value[this.contractDataMap.invoiceInfo.key]) {
        Object.keys(this.dealInfo.invoiceInfo).forEach((item) => {
          this.dealInfo.invoiceInfo[item] = resData.value[this.contractDataMap.invoiceInfo.key][this.contractDataMap[item].key];
        });
      }
    });
  }

  public emitPage() {
    this.backToMainPage.emit();
  }

  ngOnInit() {
    this.getContractDetailInfo();
  }

}
