import { Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { PurchaseOutService } from '../.././../../../core/trans/purchase-out.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { UfastUtilService } from '../../../../../core/infra/ufast-util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
enum InputMaxLenght {
  Default = 50
}
@Component({
  selector: 'app-add-purchase-out',
  templateUrl: './add-purchase-out.component.html',
  styleUrls: ['./add-purchase-out.component.scss']
})
export class AddPurchaseOutComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() stockRecordData: any[];
  @Input() editId: string;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('chooseWareHouse') chooseWareHouse: TemplateRef<any>;
  @ViewChild('chooseArea') chooseArea: TemplateRef<any>;
  @ViewChild('planRefundAmountTpl') planRefundAmountTpl: TemplateRef<any>;
  @ViewChild('reasonTpl') reasonTpl: TemplateRef<any>;
  /**
   * 头部数据
   */
  purchaseOutForm: FormGroup;
  InputMaxLen = InputMaxLenght;
  /**
   * 物料
   */
  tableConfig: UfastTableNs.TableConfig;
  materialList: any[];
  /**
   * 选择仓库
   */
  isVisible: boolean;
  warehouseTableConfig: UfastTableNs.TableConfig;
  warehouseDataList: any[];
  /**
   * 选择库区
   */
  isVisibleArea: boolean;
  areaTableConfig: UfastTableNs.TableConfig;
  areaDataList: any[];
  /**
   * 是否条码管理
   */
  barcodeFlagList: any[];
  materialNumDec: number;
  materialNumMin: number;
  constructor(private messageService: ShowMessageService,
    private purchaseOutService: PurchaseOutService, private utilService: UfastUtilService,
    private formBuilder: FormBuilder) {
    this.finish = new EventEmitter<any>();
    this.materialList = [];
    this.isVisible = false;
    this.warehouseDataList = [];
    this.isVisibleArea = false;
    this.areaDataList = [];
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
  }
  getAddData = () => {
    this.materialList = [];
    this.purchaseOutForm.controls['contractNo'].patchValue(this.stockRecordData[0].contractNo);
    this.purchaseOutForm.controls['barcodeFlag'].patchValue(this.stockRecordData[0].barcodeFlag);
    this.stockRecordData.forEach((item) => {
      item._checked = false;
      let temp = [];
      temp = item;
      temp['planRefundAmountMax'] = this.utilService.sub(item['amountIn'], item['amountOut']);
      temp['materialNo'] = item['materialCode'];
      temp['erpNo'] = item['erpNo'];
      temp['amountIn'] = item['amountIn'],
      temp['planRefundAmount'] = temp['planRefundAmountMax'];
      temp['stockeInNo'] = item['billNo'];
      temp['erpDeliveryTrxId'] = item['erpDeliveryTrxId'];
      temp['stockInDetailId'] = item['id'];
      temp['reason'] = '';
      temp['exeRefundAmount'] = item['amountOut'];
      temp['_this'] = temp;
      this.materialList.push(temp);
    });
  }
  public getDetailData() {
    this.messageService.showLoading();
    this.purchaseOutService.getPurchaseOutDetail(this.editId).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.purchaseOutForm.patchValue(resData.value);
      this.purchaseOutForm.addControl('id', this.formBuilder.control(resData.value.id));
      this.materialList = [];
      resData.value.detailVOList.forEach((item) => {
        const temp = [];
        temp['materialNo'] = item['materialNo'];
        temp['erpNo'] = item['erpNo'];
        temp['amountIn'] = item['amountIn'];
        temp['planRefundAmount'] = item['planRefundAmount'];
        temp['stockeInNo'] = item['stockeInNo'];
        temp['erpDeliveryTrxId'] = item['erpDeliveryTrxId'];
        temp['stockInDetailId'] = item['stockInDetailId'];
        temp['reason'] = item['reason'];
        temp['exeRefundAmount'] = item['exeRefundAmount'];
        temp['_this'] = temp;
        this.materialList.push(temp);
      });
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  /**
   * 调出仓库
   */
  showWarehouseModal(): void {
    this.isVisible = true;
    this.getWarehouseModalData();
  }
  getWarehouseModalData = () => {
    const filter = {
      pageNum: this.warehouseTableConfig.pageNum,
      pageSize: this.warehouseTableConfig.pageSize,
      filters: {
        pCode: '0',
        houseLevel: 1,
        type: 0
      }
    };
    this.warehouseTableConfig.loading = true;
    this.purchaseOutService.getOutWareHouseList(filter).subscribe((resData: any) => {
      this.warehouseTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.warehouseDataList = resData.value.list;
      this.warehouseTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.warehouseTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancel(): void {
    this.isVisible = false;
  }
  public chooseWarehouseFun(code: any) {
    this.purchaseOutForm.controls['warehouseCode'].patchValue(code);
    this.handleCancel();
  }
  public warehouseChange() {
    this.purchaseOutForm.controls['areaCode'].patchValue('');
  }
  /**
   * 调出库区
   */
  showAreaModal(): void {
    if (this.purchaseOutForm.controls['warehouseCode'].invalid) {
      this.messageService.showToastMessage('请选择调出仓库', 'error');
      return;
    }
    this.isVisibleArea = true;
    this.getAreaModalData();
  }
  getAreaModalData = () => {
    const filter = {
      pageNum: this.areaTableConfig.pageNum,
      pageSize: this.areaTableConfig.pageSize,
      filters: {
        houseLevel: 2,
        pCode: this.purchaseOutForm.controls['warehouseCode'].value,
        type: 0
      }
    };
    this.areaTableConfig.loading = true;
    this.purchaseOutService.getOutWareHouseList(filter).subscribe((resData: any) => {
      this.areaTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.areaDataList = resData.value.list;
      this.areaTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.areaTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  handleCancelArea(): void {
    this.isVisibleArea = false;
  }
  public chooseAreaFun(code: any) {
    this.purchaseOutForm.controls['areaCode'].patchValue(code);
    this.handleCancelArea();
  }
  public del(id) {
    this.materialList = this.materialList.filter(item => item.id !== id);
    this.messageService.showToastMessage('操作成功', 'success');
  }
  public savePurchaseOut() {
    Object.keys(this.purchaseOutForm.controls).forEach((key) => {
      this.purchaseOutForm.controls[key].markAsDirty();
      this.purchaseOutForm.controls[key].updateValueAndValidity();
    });
    if (this.purchaseOutForm.invalid) {
      return;
    }
    let data = <any>{};
    data = this.purchaseOutForm.getRawValue();
    data.detailVOList = [];
    let flag = false;
    if (!this.materialList.length) {
      this.messageService.showToastMessage('物料不能为空', 'warning');
      return;
    }
    this.materialList.forEach((item) => {
      if (!item['planRefundAmount']) {
        flag = true;
        return;
      }
      const temp = {};
      temp['materialNo'] = item['materialNo'];
      temp['erpNo'] = item['erpNo'];
      temp['amountIn'] = item['amountIn'];
      temp['stockeInNo'] = item['stockeInNo'];
      temp['stockInDetailId'] = item['stockInDetailId'];
      temp['erpDeliveryTrxId'] = item['erpDeliveryTrxId'];
      temp['planRefundAmount'] = item['planRefundAmount'];
      temp['reason'] = item['reason'];
      temp['exeRefundAmount'] = item['exeRefundAmount'];
      data.detailVOList.push(temp);
    });
    if (flag) {
      this.messageService.showToastMessage('退货数量不为空和0', 'warning');
      return;
    }
    this.messageService.showLoading();
    this.purchaseOutService.addSavePurchaseOut(data).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.emitFinish(true);
      this.purchaseOutForm.reset();
      this.materialList = [];
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public submitPurchaseOut() {
    Object.keys(this.purchaseOutForm.controls).forEach((key) => {
      this.purchaseOutForm.controls[key].markAsDirty();
      this.purchaseOutForm.controls[key].updateValueAndValidity();
    });
    if (this.purchaseOutForm.invalid) {
      return;
    }
    let data = <any>{};
    data = this.purchaseOutForm.getRawValue();
    data.detailVOList = [];
    if (!this.materialList.length) {
      this.messageService.showToastMessage('物料不能为空', 'warning');
      return;
    }
    let flag = false;
    this.materialList.forEach((item) => {
      if (!item['planRefundAmount']) {
        flag = true;
        return;
      }
      const temp = {};
      temp['materialNo'] = item['materialNo'];
      temp['erpNo'] = item['erpNo'];
      temp['amountIn'] = item['amountIn'];
      temp['stockeInNo'] = item['stockeInNo'];
      temp['stockInDetailId'] = item['stockInDetailId'];
      temp['erpDeliveryTrxId'] = item['erpDeliveryTrxId'];
      temp['planRefundAmount'] = item['planRefundAmount'];
      temp['reason'] = item['reason'];
      temp['exeRefundAmount'] = item['exeRefundAmount'];
      data.detailVOList.push(temp);
    });
    if (flag) {
      this.messageService.showToastMessage('退货数量不为空和0', 'warning');
      return;
    }
    this.messageService.showLoading();
    this.purchaseOutService.addSubmitPurchaseOut(data).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.emitFinish(true);
      this.purchaseOutForm.reset();
      this.materialList = [];
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public emitFinish(value) {
    this.finish.emit(value);
  }

  ngOnInit() {
    this.purchaseOutForm = this.formBuilder.group({
      refundCode: [{ value: '系统生成', disabled: true }],
      contractNo: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      barcodeFlag: [null, [Validators.maxLength(this.InputMaxLen.Default)]],
      warehouseCode: [null, [Validators.required]],
      areaCode: [null, [Validators.required]],
      reason: [null, [Validators.required]]
    });
    this.tableConfig = {
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
        { title: '操作', tdTemplate: this.operationTpl, width: 100, fixed: true },
        { title: '物料编码', field: 'materialNo', width: 100, fixed: true },
        { title: '接收号', field: 'erpNo', width: 100, fixed: true },
        { title: '入库数量', field: 'amountIn', width: 100 },
        { title: '入库单号', field: 'stockeInNo', width: 150 },
        { title: 'ERP入库行id', field: 'stockInDetailId', width: 200 },
        { title: '退货数量', tdTemplate: this.planRefundAmountTpl, width: 100 },
        { title: '退货原因', tdTemplate: this.reasonTpl, width: 100 },
        { title: '已退货数量', field: 'exeRefundAmount', width: 100 }
      ]
    };
    // 调出仓库模态框数据
    this.warehouseTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 100,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '仓库编号', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseWareHouse, width: 60 }
      ]
    };
    // 调出库区模态框数据
    this.areaTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 100,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '库区编号', field: 'code', width: 100 },
      { title: '库区描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseArea, width: 60 }
      ]
    };
    this.purchaseOutService.getBarcodeList().subscribe((barcodeList) => {
      this.barcodeFlagList = barcodeList;
    });
    if (!this.editId) {
      this.getAddData();
    } else {
      this.getDetailData();
    }
  }

}
