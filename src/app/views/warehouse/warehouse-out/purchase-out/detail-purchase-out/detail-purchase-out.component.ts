import { Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { PurchaseOutService, PurchaseOutServiceNs } from '../.././../../../core/trans/purchase-out.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { UfastUtilService } from '../../../../../core/infra/ufast-util.service';
import { LocationSelectorNs } from '../../../../../layout/trans/location-selector/location-selector.component';
import { environment } from '../../../../../../environments/environment';
import { PickingApplyServiceNs, PickingApplyService } from '../../../../../core/trans/picking-apply.service';
@Component({
  selector: 'app-detail-purchase-out',
  templateUrl: './detail-purchase-out.component.html',
  styleUrls: ['./detail-purchase-out.component.scss']
})
export class DetailPurchaseOutComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;
  @Input() isStockOut: boolean;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('locationCodeTpl') locationCodeTpl: TemplateRef<any>;
  @ViewChild('stockOutAmoutTpl') stockOutAmoutTpl: TemplateRef<any>;
  @ViewChild('stockOperateTpl') stockOperateTpl: TemplateRef<any>;
  @ViewChild('nowStockTpl') nowStockTpl: TemplateRef<any>;
  headerFieldList: { name: string; field: string; pipe?: string }[];
  headerInfo: any;
  tableConfig: UfastTableNs.TableConfig;
  materialInformationList: any[];
  disabledFinish: boolean;
  locationFilter: any;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  stockTableConfig: UfastTableNs.TableConfig;
  stockDataList: PickingApplyServiceNs.StockItem[];
  stockModalShow: boolean;
  stockFilter: any;
  selectedLine: any;
  constructor(private messageService: ShowMessageService,
    private purchaseOutService: PurchaseOutService, private utilService: UfastUtilService,
    private pickingApplyService: PickingApplyService) {
    this.finish = new EventEmitter<any>();
    this.headerFieldList = [
      { name: '退货单号', field: 'refundCode' },
      { name: '合同号', field: 'contractNo' },
      { name: '仓库', field: 'warehouseCode' },
      { name: '库区', field: 'areaCode' },
      { name: '是否按条码管理', field: 'barcodeFlag', pipe: 'barcodeManage' },
      { name: '出库状态', field: 'status', pipe: 'returnState' },
      { name: '制单人', field: 'createName' },
      { name: '制单时间', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm' },
      { name: 'ERP状态', field: 'erpStatus', pipe: 'erpSync' }
    ];
    this.headerInfo = {};
    this.materialInformationList = [];
    this.disabledFinish = true;
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
    this.stockFilter = {};
    this.stockDataList = [];
    this.stockModalShow = false;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  public emitFinish() {
    this.finish.emit();
  }
  public onSelectedLocation(data, ctx) {
    ctx['keeperName'] = data[0].keeperName;
    ctx['keeperId'] = data[0].keeperId;
  }
  public getPurchaseOutDetail() {
    this.headerInfo = {};
    this.materialInformationList = [];
    this.tableConfig.loading = true;
    this.purchaseOutService.getPurchaseOutDetail(this.detailId).subscribe((resData: any) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      // 头部数据
      this.headerInfo = resData.value;
      this.locationFilter = {
        pCode: this.headerInfo.areaCode,
        houseLevel: LocationSelectorNs.SelectedLevelEnum.Location
      };
      // 物料数据
      this.materialInformationList = [];
      resData.value.detailVOList.forEach((item) => {
        let temp = {};
        temp = item;
        temp['keeperName'] = item['storekeeper'];
        temp['locationAmount'] = item['locationAmount'] || item['materialAmount'];
        this.materialInformationList.push(temp);
      });
      this.materialInformationList.forEach((item) => {
        item['amountOut'] = this.utilService.sub(item['planRefundAmount'], item['exeRefundAmount']);
        item['_this'] = item;
        item['disabledFinish'] = item.status ===
          PurchaseOutServiceNs.StockOutStatus.All || item.status === PurchaseOutServiceNs.StockOutStatus.Finish || item.status ===
          PurchaseOutServiceNs.StockOutStatus.Undone;

      });
      this.disabledFinish = this.headerInfo.status === PurchaseOutServiceNs.StockOutStatus.Finish ||
        this.headerInfo.status === PurchaseOutServiceNs.StockOutStatus.All || this.headerInfo.status ===
        PurchaseOutServiceNs.StockOutStatus.Undone;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public statementFinish(disabled: boolean, id?: string) {
    if (disabled) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.messageService.showLoading();
      let submit = null;
      const detailVOIdList = [];
      let data = {};
      if (id) {
        detailVOIdList.push(id);
        data = {
          id: this.detailId,
          detailVOIdList
        };
        submit = this.purchaseOutService.statementFinish(data);
      } else {
        data = {
          id: this.detailId,
          detailVOIdList
        };
        submit = this.purchaseOutService.statementFinish(data);
      }
      submit.subscribe((resData: any) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        if (id) {
          this.getPurchaseOutDetail();
        } else {
          this.emitFinish();
        }

      }, (error: any) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    });
  }
  public showStockModal(material: any) {
    this.stockModalShow = true;
    this.selectedLine = material;
    this.stockFilter['materialCode'] = material.materialNo;
    this.stockFilter['areaCode'] = this.headerInfo.areaCode;
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
    if (this.headerInfo.agreementFlag) {
      handler = this.pickingApplyService.getAgreementStockList(filter);
    } else {
      handler = this.pickingApplyService.getNormalStockList(filter);
    }
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
  public chooseStock(item) {
    this.stockModalShow = false;
    this.materialInformationList.forEach((temp) => {
      if (temp.materialsNo === this.selectedLine.materialsNo) {
        temp.locationCode = item.locationCode;
        temp.keeperId = item.keeperId;
        temp.keeperName = item.keeperName;
      }
    });
  }
  // 出库接口
  public submitDelivery() {
    const data: PurchaseOutServiceNs.PurchaseStockOut = {
      refundCode: this.headerInfo.refundCode,
      barcodeFlag: this.headerInfo.barcodeFlag,
      detailVOList: []
    };
    let amountOutFlag = false;
    let locationCodeFlag = false;
    this.materialInformationList.forEach((item) => {
      if (!item.amountOut) {
        amountOutFlag = true;
        return;
      }
      if (!item.locationCode) {
        locationCodeFlag = true;
        return;
      }
      data.detailVOList.push({
        id: item.id,
        materialNo: item.materialNo,
        amountOut: item.amountOut,
        keeperName: item.keeperName,
        keeperId: item.keeperId,
        locationCode: item.locationCode
      });
    });
    if (amountOutFlag) {
      this.messageService.showToastMessage('出库数量不能为0或空', 'warning');
      return;
    }
    if (locationCodeFlag) {
      this.messageService.showToastMessage('储位不能为空', 'warning');
      return;
    }
    this.messageService.showLoading('');
    this.purchaseOutService.purchaseExitStockOut(data).subscribe((resData: PurchaseOutServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.finish.emit();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
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
      headers: [{ title: '操作', tdTemplate: this.operationTpl, width: 60 },
      { title: '物料编码', field: 'materialNo', width: 100 },
      { title: '接收号', field: 'erpNo', width: 100 },
      { title: '退货数量', field: 'planRefundAmount', width: 80 },
      // { title: '出库数量', tdTemplate: this.stockOutAmoutTpl, width: 80 },
      { title: '已出库数量', field: 'exeRefundAmount', width: 100 },
      { title: '出库状态', field: 'status', width: 100, pipe: 'returnState' },
      { title: 'ERP状态', field: 'erpStatus', width: 100, pipe: 'erpSyncOtherRes' },
      { title: 'ERP返回信息', field: 'erpProcessMessage', width: 100 },
      { title: '原因', field: 'reason', width: 100 },
      ]
    };
    if (this.isStockOut) {
      this.tableConfig.headers.shift();
      // this.tableConfig.headers.splice(3, 0, {
      //   title: '出库数量', tdTemplate: this.stockOutAmoutTpl, width: 80
      // });
      this.tableConfig.headers.splice(3, 0, {
        title: '出库数量', field: 'amountOut', width: 80
      }, { title: '当前库存', tdTemplate: this.nowStockTpl, width: 150 },
        // {title: '默认储位', tdTemplate: this.locationCodeTpl, width: 150 },
        { title: '默认储位', field: 'locationCode', width: 150 }, { title: '保管员', field: 'keeperName', width: 100 });
    }
    this.stockTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [5, 10, 15, 20, 25],
      loading: false,
      pageSize: 5,
      pageNum: 1,
      total: 0,
      headers: [
        { title: '操作', tdTemplate: this.stockOperateTpl, width: 100 },
        { title: '仓库编码', field: 'warehouseCode', width: 100 },
        { title: '库区编码', field: 'areaCode', width: 150 },
        { title: '储位编码', field: 'locationCode', width: 150 },
        { title: '库存数量', field: 'amount', width: 100 },
      ]
    };
    this.getPurchaseOutDetail();
  }

}
