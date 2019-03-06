import { inOutState } from './../../../../../../environments/map-data';
import { ShowMessageService } from './../../../../../widget/show-message/show-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { NegotiationMinutesService, NegotiationMinutesServiceNs } from '../../../../../core/trans/purchase/negotiation-minutes.service';
import { environment, webServerUrl } from '../../../../../../environments/environment';
import { UserService, UserServiceNs } from '../../../../../core/common-services/user.service';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { UploadModalService } from '../../../../../widget/upload-modal/upload-modal';
enum MaxInputEnum {
  Default = 50,
  Long = 200,
  NegotiationLeader = 30,
}
enum TabIndexEnum {
  FirstOffer,
  FinalOffer,
}
interface TableConfig extends UfastTableNs.TableConfig {
  xScroll?: string;
}
@Component({
  selector: 'app-add-negotiation-minutes',
  templateUrl: './add-negotiation-minutes.component.html',
  styleUrls: ['./add-negotiation-minutes.component.scss']
})
export class AddNegotiationMinutesComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input()
  set detailId(value: string) {
    this._detailId = value;
    if (this._detailId) {
      this.getNegotiationMinutesDetail();
    } else {
      this.getUserInfo();
      this.negotiationMinutesForm.patchValue({
        id: '系统生成',
      });
    }
  }
  @Input()
  set confirmNo(value: string) {
    this._confirmNo = value;
    this.negotiationMinutesForm.patchValue({
      confirmNo: this._confirmNo
    });
  }
  InputMaxLen = MaxInputEnum;
  negotiationMinutesForm: FormGroup;
  _confirmNo: string;
  _detailId: string;
  @ViewChild('chooseLeader') chooseLeader: TemplateRef<any>;
  @ViewChild('nameTpl') nameTpl: TemplateRef<any>;
  userInfo: any;
  userHref: string;
  deptMemList: any[];
  isVisibleLeader: boolean;
  leaderTableConfig: UfastTableNs.TableConfig;
  isVisibleMember: boolean;
  memberTableConfig: UfastTableNs.TableConfig;
  supplierTableConfig: UfastTableNs.TableConfig;
  supplierList: any[];
  firstQuotationTableConfig: TableConfig;
  firstQuotationList: NegotiationMinutesServiceNs.SupplierOfferData[];
  finalQuotationTableConfig: TableConfig;
  finalQuotationList: any[];
  tabIndex: number;
  supplierOfferInfo: any[];
  TabIndexType = TabIndexEnum;
  tableConfig: TableConfig;
  tableDataList: NegotiationMinutesServiceNs.SupplierOfferData[];
  isVisible: boolean;
  upLoadUrl: string;
  attachment: string;
  downLoadUrl: string;
  constructor(
    private negotiationMinutesService: NegotiationMinutesService,
    private formBuilder: FormBuilder,
    private messageService: ShowMessageService,
    private userService: UserService,
    private http: HttpClient,
    private uploadService: UploadModalService
  ) {
    this.finish = new EventEmitter<any>();
    this.negotiationMinutesForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      confirmNo: [{ value: null, disabled: true }],
      negotiationTopic: [null],
      businessDepartment: [{ value: null, disabled: true }],
      businessDepartmentId: [null],
      negotiationDate: [null],
      negotiationAddress: [null],
      negotiationForm: [null],
      negotiationLeader: [null],
      negotiationMember: [null],
      negotiationContent: [null],
      attachment: [null]
    });
    this.userHref = webServerUrl + '/ius/profile/list';
    this.deptMemList = [];
    this.isVisibleLeader = false;
    this.isVisibleMember = false;
    this.supplierList = [];
    this.tabIndex = 0;
    this.firstQuotationList = [];
    this.finalQuotationList = [];
    this.supplierOfferInfo = [];
    this.tableDataList = [];
    this.isVisible = false;
    this.upLoadUrl = environment.baseUrl.bs + '/uploading/file';
    this.attachment = '';
    this.downLoadUrl = environment.otherData.fileServiceUrl;
    this.userInfo = {};
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  // 获取目前登录用户信息
  private getUserInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<UserServiceNs.UserInfoModel>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage('获取登录信息失败，将无法进行提交.', 'error');
        return;
      }
      this.userInfo = resData.value;
      this.negotiationMinutesForm.patchValue({
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
    let filter = {};
    if (this.isVisibleLeader) {
      filter = {
        pageNum: this.leaderTableConfig.pageNum,
        pageSize: this.leaderTableConfig.pageSize,
        filters: {
          deptId: this.userInfo.deptId
        }
      };
    } else {
      filter = {
        pageNum: this.memberTableConfig.pageNum,
        pageSize: this.memberTableConfig.pageSize,
        filters: {
          deptId: this.userInfo.deptId
        }
      };
    }
    const formData = new FormData();
    formData.append('x-user-id', this.userInfo.userId);
    let req = <any>{};
    req = new HttpRequest('POST', this.userHref, formData);
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
        // 显示选中的谈判成员
        let memberLength = 0;
        if (!this.negotiationMinutesForm.controls['negotiationMember'].value) {
          return;
        }
        this.negotiationMinutesForm.controls['negotiationMember'].value.split('、').forEach((item) => {
          this.deptMemList.forEach((temp) => {
            if (item === temp.name) {
              temp[this.memberTableConfig.checkRowField] = true;
              memberLength ++;
            }
          });
        });
        if (memberLength === this.deptMemList.length) {
          this.memberTableConfig.checkAll = true;
        } else {
          this.memberTableConfig.checkAll = false;
        }
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
    this.negotiationMinutesForm.patchValue({
      negotiationLeader: name
    });
    this.handleCancelLeader();
  }
  public clearLeader() {
    this.negotiationMinutesForm.patchValue({
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
    this.negotiationMinutesForm.patchValue({
      negotiationMember: nameArr.join('、')
    });
    this.handleCancelMember();
  }
  public clearMember() {
    this.negotiationMinutesForm.patchValue({
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
  private getSupplierOfferInfo() {
    this.negotiationMinutesService.getSupplierOffer(this._confirmNo).subscribe(
      (resData: NegotiationMinutesServiceNs.UfastHttpResT<any>) => {
        // 供应商
        if (resData.value.purchaseSummarySupplierVOS) {
          resData.value.purchaseSummarySupplierVOS.forEach((item) => {
            let temp = <any>{};
            temp = item;
            temp['seller_representative'] = '';
            temp['_this'] = temp;
            this.supplierList.push(temp);
          });
          this.supplierList = [...this.supplierList];
        }
        if (!this.supplierList.length) {
          this.messageService.showToastMessage('供应为空，将无法保存与提交', 'error');
        }
        // 供应商首轮报价&最终报价
        this.firstQuotationList = resData.value.firstSummaryOfferVOS;
        if (this.firstQuotationList.length) {
          this.firstQuotationList.forEach((item, index) => {
            item.rowNo = ++index;
          });
        }
        this.finalQuotationList = resData.value.finalSummaryOfferVOS;
        if (this.finalQuotationList.length) {
          this.finalQuotationList.forEach((item, index) => {
            item.rowNo = ++index;
          });
        }

        this.initTabData();
      });
  }
  private initTabData() {
    let basicWidth = 560;
    this.tableConfig = {
      checkAll: false,
      pageSize: 10,
      pageNum: 1,
      showCheckbox: false,
      showPagination: true,
      frontPagination: true,
      loading: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      xScroll: '560px',
      headers: [
        { title: '行号', field: 'rowNo', width: 50 },
        { title: '物料编码', field: 'materialCode', width: 150 },
        { title: '物料描述', field: 'materialDesc', width: 180 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '数量', field: 'quantity', width: 100 }
      ]
    };
    switch (this.tabIndex) {
      case TabIndexEnum.FirstOffer: this.tableDataList = this.firstQuotationList;
        basicWidth = 560;
        break;
      case TabIndexEnum.FinalOffer: this.tableDataList = this.finalQuotationList;
        basicWidth = 760;
        this.tableConfig.headers.push(
          { title: '成交供应商', field: 'supplierName', width: 100 },
          { title: '成交价格(元)', field: 'supplierPrice', width: 100 }
        );
        break;
      default: this.tableDataList = [];
    }
    if (this.tableDataList.length > 0) {
      this.tableConfig.xScroll = basicWidth + 160 * this.tableDataList[0].summaryOfferBodyDOS.length + 'px';
    } else {
      this.tableConfig.xScroll = basicWidth + 'px';
    }
  }
  public upLoad() {
    this.uploadService.showUploadModal({
      title: '上传附件',
      maxFileNum: 1,
      placeHolder: ''
    }).subscribe((resData) => {
      this.negotiationMinutesForm.patchValue({
        attachment: resData[0].value
      });
      this.attachment = resData[0].value;
      this.downLoadUrl = environment.otherData.fileServiceUrl + '/' + this.attachment;
    });
  }
  public changeTab(index: number) {
    this.initTabData();
  }
  public getNegotiationMinutesDetail() {
    this.negotiationMinutesService.getNegotiationMinutesDetail(this._detailId).subscribe(
      (resData: NegotiationMinutesServiceNs.UfastHttpResT<any>) => {
        this.negotiationMinutesForm.patchValue(resData.value);
        this.userInfo.deptId = this.negotiationMinutesForm.controls['businessDepartmentId'].value;
        this.attachment = this.negotiationMinutesForm.controls['attachment'].value;
        this.downLoadUrl = this.downLoadUrl + '/' + this.attachment;
        resData.value.purchaseSummarySupplierVOS.forEach((item) => {
          let temp = <any>{};
          temp = item;
          temp['_this'] = temp;
          this.supplierList.push(temp);
        });
        this.supplierList = [...this.supplierList];
        this.firstQuotationList = resData.value.firstSummaryOfferVOS;
        this.firstQuotationList.forEach((item, index) => {
          item.rowNo = ++index;
        });
        this.finalQuotationList = resData.value.finalSummaryOfferVOS;
        this.finalQuotationList.forEach((item, index) => {
          item.rowNo = ++index;
        });
        this.initTabData();
      });
  }
  public saveNegotiationMinutes() {
    this.submitFun(NegotiationMinutesServiceNs.NegotiationMinutesStatus.Save);
  }
  public submitNegotiationMinutes() {
    this.submitFun(NegotiationMinutesServiceNs.NegotiationMinutesStatus.Submit);
  }
  public submitFun(status) {
    if (!this.supplierList.length) {
      this.messageService.showToastMessage('供应商为空，不能提交', 'error');
      return;
    }
    let submitData = <any>{};
    submitData = this.negotiationMinutesForm.getRawValue();
    submitData.status = status;
    submitData.id = this._detailId;
    submitData.purchaseSummarySupplierVOS = [];
    this.supplierList.forEach((item) => {
      const temp = Object.assign({}, item);
      temp['_this'] = undefined;
      submitData.purchaseSummarySupplierVOS.push(temp);
    });
    this.negotiationMinutesService.addNegotiationMinutes(submitData).subscribe(
      (resData: NegotiationMinutesServiceNs.UfastHttpResT<any>) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.onCancel();
      });
  }
  public onCancel() {
    this.finish.emit();
  }

  ngOnInit() {
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
      yScroll: 300,
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
    this.supplierTableConfig = {
      pageSize: 10,
      pageNum: 1,
      showCheckbox: false,
      checkRowField: '_checked',
      checkAll: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '供应商', field: 'supplierName', width: 100, fixed: true },
        { title: '卖方代表人', tdTemplate: this.nameTpl, width: 200 }
      ]
    };
    this.tableConfig = {
      checkAll: false,
      pageSize: 10,
      pageNum: 1,
      showCheckbox: false,
      showPagination: true,
      frontPagination: true,
      loading: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      xScroll: '560px',
      headers: [
        { title: '行号', field: 'rowNo', width: 50 },
        { title: '物料编码', field: 'materialCode', width: 150 },
        { title: '物料描述', field: 'materialDesc', width: 180 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '数量', field: 'quantity', width: 100 }
      ]
    };
    if (!this._detailId) {
      this.getSupplierOfferInfo();
    }
  }

}
