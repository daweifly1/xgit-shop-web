import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RegionalAllocationService } from '../../../../core/trans/regionalAllocation.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { FormGroup, FormBuilder, Validator, Validators } from '@angular/forms';
enum InputMaxLenEnum {
  Default = 50,
}
enum PageTypeEnum {
  ManagePage,
  AuditPage,
}
@Component({
  selector: 'app-detail-retion-allot',
  templateUrl: './detail-retion-allot.component.html',
  styleUrls: ['./detail-retion-allot.component.scss']
})
export class DetailRetionAllotComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  @Input() detailId: string;
  @Input() isAuditPage: boolean;
  @Output() finish: EventEmitter<any>;
  /**
   * 头部数据
   */
  headerFieldList: { name: string; field: string; pipe?: string }[];
  headerInfo: any;
  /**
   * 表格配置
   */
  tableConfig: UfastTableNs.TableConfig;
  /**
   * 表格数据
   */
  materialDetailList: any[];
  /**
   * 审核意见
   */
  auditForm: FormGroup;
  InputMaxLen = InputMaxLenEnum;

  constructor(
    private regionAllotService: RegionalAllocationService,
    private messageService: ShowMessageService,
    private formBuilder: FormBuilder
  ) {
    this.currentPage = this.tabPageType.ManagePage;
    this.finish = new EventEmitter<any>();
    this.headerFieldList = [
      { name: '调拨单号', field: 'allotOrder' },
      { name: '制单人', field: 'createName' },
      { name: '制单部门', field: 'deptName' },
      { name: '制单时间', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm' },
      { name: '调出仓库', field: 'outLocation' },
      { name: '调出库区', field: 'outArea' },
      { name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage' },
      { name: '调入仓库', field: 'inLocation' },
      { name: '调入库区', field: 'inArea' },
      { name: '是否协议调拨', field: 'agreementFlag', pipe: 'barcodeManage' },
      { name: '协议号', field: 'agreementCode' },
      { name: '领出物料凭证', field: '' },
      { name: '领入物料凭证', field: '' },
      { name: '领出过账状态', field: '' },
      { name: '领入过账状态', field: '' },
      { name: '调出状态', field: 'outState', pipe: 'inOutState'},
      { name: '调入状态', field: 'inState', pipe: 'inOutState'},
      // { name: '移动类型', field: 'moveType' },
      { name: '单据状态', field: 'billStatus', pipe: 'regionalAllocationBillStatus' },
      // { name: '审核意见', field: 'remark' }
    ];
    this.headerInfo = {};
    this.materialDetailList = [];

  }
  /**
   * 单据详情
   */
  getRegionAllotItem(id) {
    this.messageService.showLoading();
    this.regionAllotService.getRegionAllotDetail(id).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.headerInfo = resData.value.headerInfo;
      this.materialDetailList = resData.value.detailList;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public pass() {
    const data = {
      headerInfo: {
        id: this.detailId
      }
    };
    const headerInfo = {
      id: this.detailId
    };
    this.messageService.showLoading();
    this.regionAllotService.auditPass(data).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.onCancel();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public reject() {
    this.currentPage = this.tabPageType.AuditPage;
  }
  public rejectSubmit() {
    Object.keys(this.auditForm.controls).forEach((keys) => {
      this.auditForm.controls[keys].markAsDirty();
      this.auditForm.controls[keys].updateValueAndValidity();
    });
    if (this.auditForm.invalid) {
      return;
    }
    this.headerInfo.auditMessage = this.auditForm.value.auditOpinion;
    const data = {
      headerInfo: this.headerInfo,
      materialDataList: this.materialDetailList
    };
    this.messageService.showLoading();
    this.regionAllotService.reject(data).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.auditForm.reset();
      this.onCancel();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onCancel() {
    this.finish.emit();
  }

  ngOnInit() {
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '物料编码', field: 'materialNo', width: 100 },
        { title: '物料名称', width: 200, field: 'materialName' },
        { title: '单位', field: 'unit', width: 100 },
        // { title: '默认储位', field: 'locationCode', width: 200 },
        { title: '实际库存', field: 'enableNum', width: 100 },
        // { title: '意向占用', field: '', width: 100 },
        // { title: '发货占用', field: '', width: 100 },
        { title: '申请数量', field: 'amount', width: 100 },
        { title: '调出完成数', field: 'outAmount', width: 100 },
        { title: '调入完成数', field: 'inAmount', width: 100 },
        { title: '备注', field: 'remark', width: 100 }
      ]
    };
    this.auditForm = this.formBuilder.group({
      auditOpinion: [null, [Validators.required, Validators.maxLength(this.InputMaxLen.Default)]]
    });
    this.getRegionAllotItem(this.detailId);
  }

}
