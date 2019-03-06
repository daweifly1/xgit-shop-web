import { Component, OnInit, EventEmitter, Output, Input, ViewChild, TemplateRef } from '@angular/core';
import { ShowMessageService } from './../../../../widget/show-message/show-message';
import { AgreementSettlementService, AgreementSettlementServiceNs } from './../../../../core/trans/warehouse/agreement-settlement.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UfastTableNs } from '../../../../layout/layout.module';
import { environment } from '../../../../../environments/environment';
import { UserService, UserServiceNs } from '../../../../core/common-services/user.service';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-add-settlement',
  templateUrl: './add-settlement.component.html',
  styleUrls: ['./add-settlement.component.scss']
})
export class AddSettlementComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @ViewChild('chooseAgreement') chooseAgreement: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('settlementAmountTpl') settlementAmountTpl: TemplateRef<any>;
  @Input() detailId: string;
  agreementForm: FormGroup;
  materialList: any[];
  materialTableConfig: UfastTableNs.TableConfig;
  isVisibleAgreement: boolean;
  agreementTableConfig: UfastTableNs.TableConfig;
  agreementFilter: any;
  agreementList: any[];
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  headerFieldList: { name: string; field: string; pipe?: string }[];
  headerInfo: any;

  constructor(private agreementSettlementService: AgreementSettlementService,
    private messageService: ShowMessageService,
    private formBuilder: FormBuilder,
    private userService: UserService) {
    this.finish = new EventEmitter<any>();
    this.materialList = [];
    this.agreementFilter = {};
    this.agreementList = [];
    this.isVisibleAgreement = false;
    this.materialNumDec = environment.otherData.materialNumDec;
    // this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMin = 0;
    this.materialNumMax = environment.otherData.materialNumMax;
    this.headerFieldList = [
      { name: '单据编号', field: 'code' },
      { name: '协议号', field: 'agreementCode' },
      { name: '单据日期', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm' },
      { name: '领料部门', field: 'applyDepartment' },
      { name: '工段', field: 'section' },
      { name: '录入人员', field: 'recordUserName' },
      { name: '代储供应商', field: 'vendorName' },

    ];
    this.headerInfo = {};

  }
  private getUserInfo() {
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<UserServiceNs.UserInfoModel>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage('获取登录信息失败，将无法进行提交.', 'error');
        return;
      }
      this.agreementForm.patchValue({
        recordUserName: resData.value.name,
        createDate: new Date()
      });
    }, (error) => {
      this.messageService.showAlertMessage('', '获取登录信息失败，将无法进行提交.', 'error');
    });
  }
  public getAgreementList() {
    const filter = {
      pageNum: this.agreementTableConfig.pageNum,
      pageSize: this.agreementTableConfig.pageSize,
      filters: this.agreementFilter
    };
    this.agreementList = [];
    this.agreementSettlementService.getAgreementList(filter).subscribe((resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.agreementList.push(temp);
      });
      this.agreementTableConfig.total = resData.value.total;
    });
  }
  showAgreementModal(): void {
    this.isVisibleAgreement = true;
    this.getAgreementList();
  }
  handleCancel(): void {
    this.isVisibleAgreement = false;
    this.agreementFilter = {};
  }
  public chooseAgreementFun(ctx: any) {
    this.agreementForm.patchValue({
      agreementCode: ctx.agreementCode,
      vendorName: ctx.vendorName,
      vendorId: ctx.vendorId,
      applyDepartment: ctx.applyDepartment,
      section: ctx.section
    });
    this.materialList = [];
    this.getPickingOutInfo(ctx.agreementCode);
    this.handleCancel();
  }
  public getPickingOutInfo(agreementCode) {
    this.agreementSettlementService.getPickingOutInfo(agreementCode).subscribe(
      (resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
        this.materialList = resData.value.detailVOList;
        this.materialList.forEach((item, index) => {
          item['delId'] = index;
          item['totleSettlementAmount'] = item['totleSettlementAmount'] || 0;
          item['settlementAmount'] = item['settlementAmount'] || this.materialNumMin;
          item['_this'] = item;
          item['diabledFinish'] = item.status === AgreementSettlementServiceNs.MaterialStatus.add;
        });
        this.materialTableConfig.total = this.materialList.length;
      });
  }
  public delMaterial(delId) {
    this.materialList = this.materialList.filter(item => item.delId !== delId);
    this.messageService.showToastMessage('操作成功', 'success');
  }
  public finishMaterial(id) {
    const ids = [];
    ids.push(id);
    this.messageService.showAlertMessage('', '确定要完结吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.agreementSettlementService.finishMaterial(ids), true);
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getAgreementSettlementDetail();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public getAgreementSettlementDetail() {
    this.agreementSettlementService.getAgreementSettlementDetail(this.detailId).subscribe(
      (resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
        this.headerInfo = resData.value;
        this.materialList = resData.value.detailVOList;
        this.materialList.forEach((item, index) => {
          item['delId'] = index;
          item['totleSettlementAmount'] = item['totleSettlementAmount'] || 0;
          item['settlementAmount'] = this.materialNumMin;
          item['disabledFinish'] = item.status === AgreementSettlementServiceNs.MaterialStatus.finish;
          item['_this'] = item;
        });
        this.materialList = [...this.materialList];
        this.materialTableConfig.total = this.materialList.length;
      });
  }
  public submitAgreementSettlement() {
    let submitData = <any>{};
    if (!this.detailId) {
      submitData = {};
      Object.keys(this.agreementForm.controls).filter(
        item => typeof this.agreementForm.controls[item].value === 'string').forEach((key: string) => {
          this.agreementForm.controls[key].patchValue(this.agreementForm.controls[key].value.trim());
        });
      Object.keys(this.agreementForm.controls).forEach((keys: string) => {
        this.agreementForm.controls[keys].markAsDirty();
        this.agreementForm.controls[keys].updateValueAndValidity();
      });
      if (this.agreementForm.invalid) {
        this.messageService.showToastMessage('请正确填写信息', 'error');
        return;
      }
      submitData = this.agreementForm.getRawValue();
    } else {
      submitData = {};
      submitData = this.headerInfo;
    }
    if (!this.materialList.length) {
      this.messageService.showToastMessage('物料信息不能为空', 'error');
      return;
    }
    submitData.detailVOList = [];
    this.materialList.forEach((item) => {
      const temp = Object.assign({}, item);
      temp['_this'] = undefined;
      submitData.detailVOList.push(temp);
    });
    this.agreementSettlementService.addAgreementSettlement(submitData).subscribe(
      (resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
        this.emitFinish();
        this.messageService.showToastMessage('操作成功', 'success');
      });

  }
  public emitFinish() {
    this.finish.emit();
  }

  ngOnInit() {
    this.agreementForm = this.formBuilder.group({
      code: [{ value: '系统生成', disabled: true }],
      agreementCode: [null, Validators.required],
      vendorName: [{ value: null, disabled: true }, [Validators.required]],
      vendorId: [{ value: null, disabled: true }, [Validators.required]],
      applyDepartment: [{ value: null, disabled: true }, [Validators.required]],
      section: [{ value: null, disabled: true }],
      createDate: [{ value: null, disabled: true }, [Validators.required]],
      recordUserName: [{ value: null, disabled: true }, [Validators.required]]
    });
    this.agreementTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '协议号', field: 'agreementCode', width: 100 },
      { title: '供应商', field: 'vendorName', width: 150 },
      { title: '操作', tdTemplate: this.chooseAgreement, width: 60 }
      ]
    };
    this.materialTableConfig = {
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 100 },
        { title: '出库单号', field: 'pickingNo', width: 160 },
        { title: '出库时间', field: 'pickingDate', width: 130, pipe: 'date: yyyy-MM-dd HH:mm' },
        { title: '物料编码', field: 'materialCode', width: 120 },
        { title: '物料描述', field: 'materialDesc', width: 140 },
        { title: '单位', field: 'unit', width: 60 },
        { title: '出库数量', field: 'outAmount', width: 110 },
        { title: '已结算数量', field: 'totleSettlementAmount', width: 120 },
        { title: '本次结算数量', tdTemplate: this.settlementAmountTpl, field: 'settlementAmount', width: 110 },
        { title: '结算物料编码', field: 'settlementMaterialCode', width: 120 },
        { title: '结算物料描述', field: 'settlementMaterialDesc', width: 140 },
        { title: '结算单位', field: 'settlementUnit', width: 80 },
        { title: '状态', field: 'status', width: 80, pipe: 'agreementSettlementMaterialStatus' }
      ]
    };
    if (!this.detailId) {
      this.getUserInfo();
    } else {
      this.getAgreementSettlementDetail();
    }

  }

}
