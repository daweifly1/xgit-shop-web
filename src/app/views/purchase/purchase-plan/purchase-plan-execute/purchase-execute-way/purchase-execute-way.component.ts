import {Component, EventEmitter, Input, OnInit, Output, AfterViewInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MapListPipe} from '../../../../../directives/pipe/map-list.pipe';
import {ApprovalFormNs} from '../../../../../core/trans/purchase/approval-form.service';
import {PurchaseConfirmationService} from '../../../../../core/trans/purchase-confirmation.service';
import {Router} from '@angular/router';
enum PageType {
  MainPage,
  NewApproval
}
@Component({
  selector: 'app-purchase-execute-way',
  templateUrl: './purchase-execute-way.component.html',
  styleUrls: ['./purchase-execute-way.component.scss']
})
export class PurchaseExecuteWayComponent implements OnInit, AfterViewInit {
  @Input() selectedPlan: any[];
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  PageTypeEnum = PageType;
  currentPage: PageType;
  public executeWayForm: FormGroup;
  public isAgreementPurchase = false;
  public isContinuousPurchase = false;
  purchaseMethodMap: {[index: string]: {value: number; label: string; }[]};
  purchaseType: {value: number; label: string; }[];
  mapListPipe: MapListPipe;
  purchaseInfo: any;
  constructor(private formBuilder: FormBuilder,
              private confirmService: PurchaseConfirmationService,
              private router: Router) {
    this.mapListPipe = new MapListPipe();
    this.currentPage = PageType.MainPage;
    const temp =  [
      {value: 1, label: '公开招标'},
      {value: 2, label: '邀请招标'},
      {value: 3, label: '单一来源'},
      {value: 4, label: '竞争性谈判'},
      {value: 5, label: '询比价'}
    ];
    this.purchaseMethodMap = {
      1: temp,      // 自主
      2: temp,      // 委托
      3: [          // 网购
        {value: 3, label: '单一来源'},
        {value: 4, label: '竞争性谈判'},
        {value: 5, label: '询比价'}
      ],
      4: [{value: 6, label: '年度协议采购'}],
      5: [{value: 7, label: '续购'}]
    };
  }
  public onBusinessType(value: number) {
    if (value === ApprovalFormNs.PurchaseBusinessType.Contract) {
      this.purchaseType = this.mapListPipe.transform('purchaseMode');
    } else {
      this.purchaseType = this.mapListPipe.transform('purchaseMode').filter(item => item.value < ApprovalFormNs.PurchaseMode.AnnulPlan);
    }
    this.executeWayForm.patchValue({
      purchaseType: null,
      purchaseMethod: null,
      agreementCode: null,
      contractCode: null
    });
  }
  public onpurchaseType(value: number) {
    this.executeWayForm.get('purchaseMethod').reset(null);
    this.isAgreementPurchase = false;
    this.isContinuousPurchase = false;
    this.executeWayForm.removeControl('agreementCode');
    this.executeWayForm.removeControl('contractCode');
    if (value < ApprovalFormNs.PurchaseMode.AnnulPlan) {
      return;
    }
    if (value === ApprovalFormNs.PurchaseMode.AnnulPlan) {
      this.isAgreementPurchase = true;
      this.executeWayForm.addControl('agreementCode', this.formBuilder.control(null, [Validators.required]));
    } else {
      this.isContinuousPurchase = true;
      this.executeWayForm.addControl('contractCode', this.formBuilder.control(null, [Validators.required]));
    }
  }
  public emitPage(refresh) {
    this.backToMainPage.emit(refresh);
  }
  public approvalFormFinish(value: boolean) {
    if (value) {
      this.backToMainPage.emit(true);
      return;
    }
    this.currentPage = this.PageTypeEnum.MainPage;
  }
  public selectExecuteWay() {
    Object.keys(this.executeWayForm.controls).forEach((key: string) => {
      this.executeWayForm.controls[key].markAsDirty();
      this.executeWayForm.controls[key].updateValueAndValidity();
    });
    if (this.executeWayForm.invalid) {
      return;
    }
    if (this.executeWayForm.controls['purchaseType'].value === ApprovalFormNs.PurchaseMode.ContinuePlan ||
      this.executeWayForm.controls['purchaseType'].value === ApprovalFormNs.PurchaseMode.AnnulPlan) {
      this.createConfirmForm();
      return;
    }
    this.purchaseInfo = this.executeWayForm.getRawValue();
    this.currentPage = this.PageTypeEnum.NewApproval;
  }
  private createConfirmForm() {
    const selectedIds = [];
    this.selectedPlan.forEach((item) => {
      selectedIds.push(item.id);
    });
    const paramsData = {
      businessType: this.executeWayForm.controls['businessType'].value,
      contractOrAgreementNo: this.isContinuousPurchase ? this.executeWayForm.controls['contractCode'].value :
        this.executeWayForm.controls['agreementCode'].value,
      purchaseMethod: this.executeWayForm.controls['purchaseMethod'].value,
      purchaseModel: this.executeWayForm.controls['purchaseType'].value,
      planIds: selectedIds
    };
    const req = this.isContinuousPurchase ? this.confirmService.createFromContinue(paramsData) :
      this.confirmService.createFromAgreement(paramsData);
    req.subscribe((resData) => {
      this.router.navigate(['/main/purchase/purchaseConfirmation'], {queryParams: {id: resData.value, toPage: 'editPage'}});
      this.emitPage(true);
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  ngOnInit() {
    this.executeWayForm = this.formBuilder.group({
      businessType: [null, [Validators.required]],
      purchaseType: [null, [Validators.required]],
      purchaseMethod: [null, [Validators.required]]
    });
    this.purchaseType = this.mapListPipe.transform('purchaseMode');
    this.executeWayForm.get('businessType').patchValue(ApprovalFormNs.PurchaseBusinessType.Contract);
  }
  ngAfterViewInit() {
  }
}
