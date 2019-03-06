import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NegotiationPlanService, NegotiationPlanServiceNs } from '../../../../../core/trans/negotiation-plan.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { environment, webServerUrl } from '../../../../../../environments/environment';
import { UserService, UserServiceNs } from '../../../../../core/common-services/user.service';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { HttpClient, HttpRequest } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
enum MaxInputEnum {
  Default = 50,
  NegotiationLeader = 30,
  Long = 200
}
@Component({
  selector: 'app-add-negotiation-plan',
  templateUrl: './add-negotiation-plan.component.html',
  styleUrls: ['./add-negotiation-plan.component.scss']
})
export class AddNegotiationPlanComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input()
  set detailId(value: string) {
    this._detailId = value;
    if (this._detailId) {
      this.getNegotiationPlanDetail();
    } else {
      this.negotiationPlanForm.patchValue({
        planNo: '系统生成',
        approvalNo: this._approvalNo,
        businessDepartment: null,
        negotiationDate: null,
        negotiationAddress: null,
        negotiationWay: null,
        negotiationForm: null,
        negotiationLeader: null,
        negotiationMember: null,
        negotiationAmout: null,
        createName: null,
        createDate: null,
        planTopic: null,
        purchaseMaterialIntro: null,
        previousPurchases: null,
        marketState: null,
        negotiationStrategy: null,
        remark: null,
        flowPurchaserName: null,
        flowPurchaserId: null
      });
      this.getUserInfo();
    }
  }
  @Input()
  set approvalNo(value: string) {
    this._approvalNo = value;
    this.negotiationPlanForm.patchValue({
      planNo: '系统生成',
      approvalNo: this._approvalNo,
      businessDepartment: null,
      businessDepartmentId: '',
      negotiationDate: null,
      negotiationAddress: null,
      negotiationWay: null,
      negotiationForm: null,
      negotiationLeader: null,
      negotiationMember: null,
      negotiationAmout: null,
      createName: null,
      createDate: null,
      planTopic: null,
      purchaseMaterialIntro: null,
      previousPurchases: null,
      marketState: null,
      negotiationStrategy: null,
      remark: null,
      flowPurchaserName: null,
      flowPurchaserId: null
    });
    // this.getUserInfo();
  }
  @ViewChild('chooseLeader') chooseLeader: TemplateRef<any>;
  @ViewChild('userOperationTpl')userOperationTpl: TemplateRef<any>;
  InputMaxLen = MaxInputEnum;
  negotiationPlanForm: FormGroup;
  moneyDec: number;
  moneyMin: number;
  moneyMax: number;
  userInfo: any;
  _approvalNo: string;
  href: string;
  _detailId: string;
  deptMemList: any[];
  isVisibleLeader: boolean;
  leaderTableConfig: UfastTableNs.TableConfig;
  isVisibleMember: boolean;
  memberTableConfig: UfastTableNs.TableConfig;

  showSelectUserModal: boolean;
  userTableConfig: UfastTableNs.TableConfig;
  userDataList: any[];
  constructor(
    private negotiationService: NegotiationPlanService,
    private formBuilder: FormBuilder,
    private messageService: ShowMessageService,
    private userService: UserService,
    private http: HttpClient, private activatedRouter: ActivatedRoute,
    private router: Router
  ) {
    this.userDataList = [];
    this.negotiationPlanForm = this.formBuilder.group({
      planNo: [{ value: '系统生成', disabled: true }],
      approvalNo: [{ value: this._approvalNo, disabled: true }],
      businessDepartment: [{ value: null, disabled: true }, Validators.required],
      businessDepartmentId: [null],
      negotiationDate: [null],
      negotiationAddress: [null],
      negotiationWay: [null],
      negotiationForm: [null],
      negotiationLeader: [null],
      negotiationMember: [null],
      negotiationAmout: [null, Validators.required],
      createName: [{ value: null, disabled: true }],
      createDate: [{ value: null, disabled: true }],
      planTopic: [null],
      purchaseMaterialIntro: [null],
      previousPurchases: [null],
      marketState: [null],
      negotiationStrategy: [null],
      remark: [null],
      flowPurchaserName: [null, Validators.required],
      flowPurchaserId: [null]
    });
    this.finish = new EventEmitter<any>();
    this.moneyDec = environment.otherData.moneyDec;
    this.moneyMin = environment.otherData.moneyMin;
    this.moneyMax = environment.otherData.moneyMax;
    this.href = webServerUrl + '/ius/profile/list';
    this.deptMemList = [];
    this.isVisibleLeader = false;
    this.isVisibleMember = false;
    this.userInfo = {};
  }
  disabledEnd = (plannedDate: Date) => {
    if (!plannedDate || !new Date()) {
      return false;
    }
    return plannedDate.getTime() <= new Date().getTime();
  }
  // 获取目前登录用户信息
  private getUserInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<UserServiceNs.UserInfoModel>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage('获取登录信息失败，将无法进行提交.', 'error');
        return;
      }
      this.userInfo = resData.value;
      this.negotiationPlanForm.patchValue(<any>{
        createName: this.userInfo.name,
        createDate: new Date(),
        businessDepartment: this.userInfo.deptName,
        businessDepartmentId: this.userInfo.deptId
      });
    }, (error) => {
      this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
    });
  }
  getUsers = () => {
    const filter = {
      pageNum: this.leaderTableConfig.pageNum,
      pageSize: this.leaderTableConfig.pageSize,
      filters: {
        deptId: this.userInfo.deptId
      }
    };
    const formData = new FormData();
    formData.append('x-user-id', this.userInfo.userId);
    let req = <any>{};
    req = new HttpRequest('POST', this.href, formData);
    req.body = filter;
    this.messageService.showLoading();
    this.http.request(req).subscribe((event: any) => {
      this.messageService.closeLoading();
      if (event.type === 4) {
        if (event.body.code !== 0) {
          this.messageService.showToastMessage(event.body.message, 'error');
          return;
        }
        this.deptMemList = [];
        this.memberTableConfig.checkAll = false;
        event.body.value.list.forEach((item) => {
          this.deptMemList.push({
            code: item.loginName,
            name: item.name
          });
        });
        this.leaderTableConfig.total = event.body.value.total;
        this.memberTableConfig.total = event.body.value.total;
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  showLeaderModel(): void {
    this.getUsers();
    this.isVisibleLeader = true;
  }
  handleCancelLeader(): void {
    this.isVisibleLeader = false;
  }
  public chooseLeaderFun(
    name: string) {
    this.negotiationPlanForm.patchValue({
      negotiationLeader: name
    });
    this.handleCancelLeader();
  }
  public clearLeader() {
    this.negotiationPlanForm.patchValue({
      negotiationLeader: null
    });
  }
  showMemberModal(): void {
    this.isVisibleMember = true;
    this.getUsers();
  }
  handleCancelMember(): void {
    this.isVisibleMember = false;
  }
  handleOkMember(): void {
    const nameArr = [];
    this.deptMemList.forEach((item) => {
      if (item[this.memberTableConfig.checkRowField]) {
        nameArr.push(item.name);
      }
    });
    this.negotiationPlanForm.patchValue({
      negotiationMember: nameArr.join('、')
    });
    this.handleCancelMember();
  }
  public clearMember() {
    this.negotiationPlanForm.patchValue({
      negotiationMember: null
    });
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.deptMemList.length; i < len; i++) {
      this.deptMemList[i][this.memberTableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.memberTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.memberTableConfig.checkAll = this.deptMemList.every((item) => {
        return item._checked === true;
      });
    }
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public getNegotiationPlanDetail() {
    this.negotiationService.getNegotiationPlanDetail(this._detailId).subscribe(
      (resData: NegotiationPlanServiceNs.UfastHttpResT<any>) => {
        this.negotiationPlanForm.patchValue(resData.value);
        this.userInfo.deptId = this.negotiationPlanForm.controls['businessDepartmentId'].value;
      });
  }
  public saveNegotiationPlan() {
    this.submitByType(NegotiationPlanServiceNs.SubmitType.Save);
  }
  public submitNegotiationPlan() {
    this.submitByType(NegotiationPlanServiceNs.SubmitType.Submit);
  }
  private submitByType(type: NegotiationPlanServiceNs.SubmitType) {
    Object.keys(this.negotiationPlanForm.controls).forEach(key => {
      this.negotiationPlanForm.controls[key].markAsDirty();
      this.negotiationPlanForm.controls[key].updateValueAndValidity();
    });
    if (this.negotiationPlanForm.invalid) {
      this.messageService.showToastMessage('请填写正确的谈判预案信息', 'error');
      return;
    }
    const submitData = this.negotiationPlanForm.getRawValue();
    submitData.status = type;
    if (this._detailId) {
      submitData['id'] = this._detailId;
    }
    this.negotiationService.addNegotiationPlan(submitData).subscribe((resData: NegotiationPlanServiceNs.UfastHttpResT<any>) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.onCancel();
    });
  }
  public onCancel() {
    this.router.navigate([], {relativeTo: this.activatedRouter}).then(() => {
      this.finish.emit();
    });
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
  public showSelectUser() {
    this.showSelectUserModal = !this.showSelectUserModal;
    this.getUserList();
  }
  public onCancelUser() {
    this.showSelectUserModal = !this.showSelectUserModal;
  }
  public onUserSelect(name: string, userId: string) {
    this.showSelectUserModal = !this.showSelectUserModal;
    this.negotiationPlanForm.get('flowPurchaserName').patchValue(name);
    this.negotiationPlanForm.get(`flowPurchaserId`).patchValue(userId);
  }
  public clearFlowUser() {
    this.negotiationPlanForm.get(`flowPurchaserName`).patchValue(null);
    this.negotiationPlanForm.get(`flowPurchaserId`).patchValue(null);
  }
  ngOnInit() {
    // this.getUserInfo();
    this.leaderTableConfig = {
      pageSize: 10,
      yScroll: 400,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '用户账号', field: 'code', width: 100 },
      { title: '用户名', field: 'name', width: 150 },
      { title: '操作', tdTemplate: this.chooseLeader, width: 60 }
      ]
    };
    this.memberTableConfig = {
      pageSize: 10,
      yScroll: 400,
      showCheckbox: true,
      checkRowField: '_checked',
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '用户账号', field: 'code', width: 100 },
      { title: '用户名', field: 'name', width: 150 },
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
        {title: '操作', tdTemplate: this.userOperationTpl, width: 100},
        {title: '用户名', field: 'name', width: 100},
        {title: '联系电话', field: 'mobile', width: 100},
      ]
    };
  }

}
