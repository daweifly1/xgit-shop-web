import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CdkOverlayOrigin, CdkConnectedOverlay} from '@angular/cdk/overlay';
export namespace PurchaseStepsNs {
  export interface PurchaseStep {
    mainStep: string;
    subStep: string;
  }
  export const steps = {
    approveForm: '001',       // 审批表
    purchaseSource: '002',    // 询报价
    confirmation: '003',      // 审定表
    contract: '004',          // 合同
    handleMaterial: '005',    // 收发货
    pay: '006',               // 付款
  };
  export const subSteps = {
    // 审定表：编辑， 审批， 审批完成
    editApproveForm: '001001',
    auditApproveForm: '001002',
    completeApproveForm: '001003',
    // 询报价：询价， 报价， 价格预处理
    enquiry: '002001',
    quotation: '002002',
    pricePreHandle: '002003',
    // 审定表： 编辑， 维护合同， 审批中， 审批完成
    editConfirmation: '003001',
    editContract: '003002',
    auditConfirmation: '003003',
    completeConfirmation: '003004',
    // 合同： 甲方签章， 乙方签章， 签署完毕
    buyerSign: '004001',
    supplierSign: '004002',
    completeSign: '004003',
    // 收发货： 发货， 验收， 入库
    dispatchMaterial: '005001',
    checkMaterial: '005002',
    inWarehouse: '005003',
    // 付款： 发票联系人， 材设复核， 财务复核， 付款结算
    invoiceTicket: '006001',
    materialCheck: '006002',
    accountCheck: '006003',
    payAndSettle: '006004'
  };
}

@Component({
  selector: 'app-purchase-steps',
  templateUrl: './purchase-steps.component.html',
  styleUrls: ['./purchase-steps.component.scss']
})
export class PurchaseStepsComponent implements OnInit {
  // @Input() mainStep: string;
  // @Input() subStep: string;
  @Input()
  set mainStep(value: string) {
    if (value) {
      this.stepObj.mainStep = value;
    }
  }
  get mainStep(): string {
    return this.stepObj.mainStep;
  }
  @Input()
  set subStep(value: string) {
    if (value) {
      this.stepObj.subStep = value;
      this.getCurrStepIndex();
    }
  }
  get subStep(): string {
    return this.stepObj.subStep;
  }
  @ViewChild(CdkOverlayOrigin) cdkOverlayOrigin: CdkOverlayOrigin;
  @ViewChild(CdkConnectedOverlay) cdkConnectedOverlay: CdkConnectedOverlay;
  private steps = PurchaseStepsNs.steps;
  private subSteps = PurchaseStepsNs.subSteps;
  public currIndex = 0;
  public allPurchaseSteps = [
    {
      name: '审批表',
      value: this.steps.approveForm,
      index: 0,
      subSteps: [
        {name: '编辑', value: this.subSteps.editApproveForm},
        {name: '审批中', value: this.subSteps.auditApproveForm},
        {name: '审批完成', value: this.subSteps.completeApproveForm},
      ]
    },
    {
      name: '询报价',
      value: this.steps.purchaseSource,
      index: 1,
      subSteps: [
        {name: '询价', value: this.subSteps.enquiry},
        {name: '报价', value: this.subSteps.quotation},
        {name: '价格预处理', value: this.subSteps.pricePreHandle},
      ]
    },
    {
      name: '审定表',
      value: this.steps.confirmation,
      index: 2,
      subSteps: [
        {name: '编辑', value: this.subSteps.editConfirmation},
        {name: '维护合同', value: this.subSteps.editContract},
        {name: '审批中', value: this.subSteps.auditConfirmation},
        {name: '审批完成', value: this.subSteps.completeConfirmation},
      ]
    },
    {
      name: '合同',
      value: this.steps.contract,
      index: 3,
      subSteps: [
        {name: '甲方签章', value: this.subSteps.buyerSign},
        {name: '乙方签章', value: this.subSteps.supplierSign},
        {name: '签章完毕', value: this.subSteps.completeSign},
      ]
    },
    {
      name: '收发货',
      value: this.steps.handleMaterial,
      index: 4,
      subSteps: [
        {name: '发货', value: this.subSteps.dispatchMaterial},
        {name: '验收', value: this.subSteps.checkMaterial},
        {name: '入库', value: this.subSteps.inWarehouse},
      ]
    },
    {
      name: '付款',
      value: this.steps.pay,
      index: 5,
      isExpanded: false,
      subSteps: [
        {name: '发票联系单', value: this.subSteps.invoiceTicket},
        {name: '材设复核', value: this.subSteps.materialCheck},
        {name: '财务复核', value: this.subSteps.accountCheck},
        {name: '付款结算', value: this.subSteps.payAndSettle},
      ]
    },
  ];
  public activeStep = {
    mainStepIndex: 0,
    subStepIndex: 0
  };
  public isShowSubSteps = false;
  public subStepsOffset = {x: 0, y: 0, width: '100%'};
  public stepObj: PurchaseStepsNs.PurchaseStep = {mainStep: '', subStep: ''};
  constructor() { }

  public getCurrStepIndex() {
    this.activeStep.mainStepIndex = this.allPurchaseSteps.findIndex((item) => item.value === this.mainStep);
    this.activeStep.subStepIndex = this.allPurchaseSteps[this.activeStep.mainStepIndex].subSteps
      .findIndex(item => item.value === this.subStep);
  }
  public showSubSteps(index, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (index === 0) {
      this.subStepsOffset.x = -70;
      this.subStepsOffset.y = 0;
    } else if (index === 5) {
      this.subStepsOffset.x = ev.target.offsetLeft;
      this.subStepsOffset.y = 80;
    } else {
      this.subStepsOffset.x = ev.target.offsetLeft - 200;
      this.subStepsOffset.y = 0;
    }
    // this.subStepsOffset.y = 140;
    this.currIndex = index;
    this.isShowSubSteps = true;
  }
  public onSubStepClickBack() {
    this.isShowSubSteps = false;
  }
  ngOnInit() {
  }

}
