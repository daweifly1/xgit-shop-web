import { Component, OnInit, TemplateRef, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/ufast-table/ufast-table.component';
import { PickingApplyService, PickingApplyServiceNs } from '../../../../../core/trans/picking-apply.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import {environment} from '../../../../../../environments/environment';
enum AmountConfirmMax  {
  Default = 99999999.99
}
@Component({
  selector: 'app-detail-confirm',
  templateUrl: './detail-confirm.component.html',
  styleUrls: ['./detail-confirm.component.scss']
})
export class DetailConfirmComponent implements OnInit {
  amountConfirmMax = AmountConfirmMax;
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;
  @Input() isDistribution: number;
  @ViewChild('pickingOutNumTpl') pickingOutNumTpl: TemplateRef<any>;
  @ViewChild('protocolStockTpl') protocolStockTpl: TemplateRef<any>;
  @ViewChild('commonStockTpl') commonStockTpl: TemplateRef<any>;
  @ViewChild('agreeOperateTpl') agreeOperateTpl: TemplateRef<any>;
  /**
   * 详情
   */
  headerFieldList: { name: string; field: string; pipe?: string }[];
  headerInfo: any;
  /**
   * 物料
   */
  materialTableConfig: UfastTableNs.TableConfig;
  materialList: any[];

  /**
   *
   */
  stockModalShow: boolean;
  stockTableConfig: UfastTableNs.TableConfig;
  stockDataList: PickingApplyServiceNs.StockItem[];
  isNormalStock: boolean;
  stockFilter: any;
  selectedLine: any;
  stockModalTitle: string;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  availableNumErrorCode: number;

  constructor(private pickingApplyService: PickingApplyService,
    private messageService: ShowMessageService) {
    this.finish = new EventEmitter<any>();
    this.headerInfo = {};
    this.materialList = [];
    this.stockFilter = {};
    this.stockModalTitle = '普通库存';
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
    this.availableNumErrorCode = 26012;
  }
  public getDetailList() {
    this.headerInfo = {};
    this.materialList = [];
    this.messageService.showLoading();
    this.pickingApplyService.getPickingApplyConfirmDetail(this.detailId).subscribe(
      (resData: any) => {
        this.messageService.closeLoading();
        if (resData.code) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.headerInfo = resData.value;
        this.materialList = resData.value.pickingApplyDetailVOs;
        this.headerInfo.materialType = this.materialList[0].materialType;
        this.headerInfo.plannerName = this.materialList[0].planner;
        this.materialList.forEach((item) => {
          item['amountConfirm'] = item['amountConfirm'] || item['amountApply'];
          item['_this'] = item;
        });
      }, (error: any) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  /**
   * 显示库存模态框
   * normal: true正常库存， false协议库存
   * */
  public showStockModal(normal: boolean, item: any) {
    this.isNormalStock = normal;
    this.stockFilter['materialCode'] = item.materialCode;
    this.selectedLine = item;
    this.stockTableConfig.headers = [

      { title: '仓库编码', field: 'warehouseCode', width: 100 },
      { title: '库区编码', field: 'areaCode', width: 150 },
      { title: '储位编码', field: 'locationCode', width: 150 },
      { title: '库存数量', field: 'amount', width: 100 },
      { title: '保管员', field: 'keeperName', width: 120 }
    ];
    this.stockModalTitle = '普通库存';
    if (!normal) {
      this.stockModalTitle = '请选择库存';
      this.stockTableConfig.headers.unshift(...[
        { title: '操作', tdTemplate: this.agreeOperateTpl, width: 100 },
        { title: '协议号', field: 'agreementCode', width: 150 },
        { title: '供应商', field: 'supplierName', width: 150 },
      ]);
    }
    this.stockTableConfig = Object.assign({}, this.stockTableConfig);
    this.stockModalShow = true;
    this.getStockList();
  }
  public onCancelStock() {
    this.stockModalShow = false;
  }
  getStockList = () => {
    this.stockTableConfig.loading = true;
    const filter = {
      pageSize: this.stockTableConfig.pageSize,
      pageNum: this.stockTableConfig.pageNum,
      filters: this.stockFilter
    };
    let handler: any = null;
    if (this.isNormalStock) {
      handler = this.pickingApplyService.getNormalStockList(filter);
    } else {
      handler = this.pickingApplyService.getAgreementStockList(filter);
    }
    this.stockDataList = [];
    handler.subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
      this.stockTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.stockTableConfig.total = resData.value.total;
      this.stockDataList = resData.value.list;
      this.stockDataList.forEach((item) => {
        item['_this'] = item;
      });
    }, (error) => {
      this.stockTableConfig.loading = false;
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  public chooseStock(item: PickingApplyServiceNs.StockItem) {
    this.stockModalShow = false;
    if (!this.isNormalStock) {
      this.materialList[0]['agreementNo'] = item.agreementCode;
    } else {
      this.materialList[0]['agreementNo'] = undefined;
    }
  }
  public submitOrder(isSubmit) {
    const data = this.headerInfo;
    data.pickingApplyDetailVOs = [];
    this.materialList.forEach((item) => {
      // if (!item.amountConfirm) {
      //   this.messageService.showToastMessage('申请数量不能为空和0', 'warning');
      //   return;
      // }
      if (item.amountConfirm > item.availableNum) {
        this.messageService.showToastMessage('确认数量需要小于或等于可用库存', 'warning');
        return;
      }
      const temp = Object.assign({}, item);
      temp['_this'] = undefined;
      data.pickingApplyDetailVOs.push(temp);
    });
    if (isSubmit) {
      // 提交
      data.pickingApplyDetailVOs[0].status = 2;
    } else {
      // 保存
      data.pickingApplyDetailVOs[0].status = 1;
    }
    this.submitFun(data);

  }
  public submitFun(submitData) {
    this.messageService.showLoading();
    this.pickingApplyService.pickingApplyConfirm(submitData).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        if (resData.code === this.availableNumErrorCode) {
          this.getDetailList();
        }
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.onCancel();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onCancel() {
    this.finish.emit();
  }

  ngOnInit() {
    this.materialTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageNum: 10,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      checkAll: false,
      checkRowField: '_checked',
      loading: false,
      frontPagination: true,
      headers: [
        { title: '行号', field: 'rowNo', width: 80, fixed: true },
        { title: '物料编码', field: 'materialCode', width: 120 },
        { title: '物料名称', field: 'materialName', width: 280 },
        { title: '单位', field: 'unit', width: 100 },
        { title: '申请数量', field: 'amountApply', width: 100 },
        { title: '确认数量', tdTemplate: this.pickingOutNumTpl, width: 100 },
        { title: '保管员', width: 100, field: 'keeperName' },
        { title: '协议号', width: 100, field: 'agreementNo' },
        { title: '可用库存', width: 100, field: 'availableNum' },
        { title: '普通库存', tdTemplate: this.commonStockTpl, width: 120 },
        { title: '协议库存', tdTemplate: this.protocolStockTpl, width: 120 },
        { title: '出库单占用数', width: 120, field: 'applyOccupyNum' },
        { title: '是否条码管理', width: 120, field: 'barcodeFlag', pipe: 'barcodeManage' },
        { title: '需要日期', width: 120, field: 'needDate', pipe: 'date:yyyy-MM-dd' }
      ]
    };
    this.stockTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [5, 10, 15, 20, 25],
      loading: false,
      pageSize: 5,
      pageNum: 1,
      total: 0,
      headers: []
    };
    // if (this.isDistribution) {
      this.headerFieldList = [
        { name: '领料申请单号', field: 'applyNo' },
        { name: '业务实体', field: 'orgName' },
        { name: '是否配送', field: 'isDistribution', pipe: 'isDistribution' },
        { name: '物料类型', field: 'materialType', pipe: 'materialType2' },
        { name: '出库类型', field: 'type' },
        { name: '领料部门', field: 'applyDepartment' },
        { name: '工段', field: 'section' },
        { name: '计划员', field: 'plannerName' },
        { name: '申请人', field: 'applyName' },
        { name: '申请日期', field: 'applyDate', pipe: 'date:yyyy-MM-dd' },
        { name: '收货人', field: 'receiverName' },
        { name: '收货电话', field: 'receiverNumber' },
        { name: '收货地址', field: 'receiverAddress' },
        { name: '客户', field: 'customerName' },
      ];
    this.getDetailList();
  }

}
