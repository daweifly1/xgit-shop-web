import {Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import { RegionalAllocationService } from '../../../../core/trans/regionalAllocation.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import {LocationSelectorNs} from '../../../../layout/trans/location-selector/location-selector.component';
import {PickingApplyServiceNs, PickingApplyService} from '../../../../core/trans/picking-apply.service';

@Component({
  selector: 'app-receive-retion-allot',
  templateUrl: './receive-retion-allot.component.html',
  styleUrls: ['./receive-retion-allot.component.scss']
})

export class ReceiveRetionAllotComponent implements OnInit {
  @ViewChild('locationTpl') locationTpl: TemplateRef<any>;
  @ViewChild('nowStockTpl') nowStockTpl: TemplateRef<any>;
  @ViewChild('stockOperateTpl') stockOperateTpl: TemplateRef<any>;
  @Input() detailId: string;
  @Input() isOutboundPage?: boolean;
  @Input() isInboundPage?: boolean;
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
  private type = '';
  public locationSelectFilter: LocationSelectorNs.FilterDataModel = {pCode: '', houseLevel: 0};
  stockTableConfig: UfastTableNs.TableConfig;
  stockDataList: any[];
  stockFilter: any;
  stockModalShow: boolean;
  selectedLine: any;
  locationCodeView: any;

  constructor(
    private regionAllotService: RegionalAllocationService,
    private messageService: ShowMessageService,
    private pickingApplyService: PickingApplyService
  ) {
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
      // { name: '移动类型', field: 'moveType' },
      { name: '单据状态', field: 'billStatus', pipe: 'regionalAllocationBillStatus' },
      // { name: '审核意见', field: 'remark' }
    ];
    this.headerInfo = {};
    this.materialDetailList = [];
    this.stockFilter = {};
    this.stockDataList = [];
    this.stockModalShow = false;

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
      this.materialDetailList = resData.value.detailList || [];
      this.materialDetailList.forEach((item, index) => {
        item['_this'] = item;
        item.index = index;
        // item.locationCode = item.defaultlocationCode;
        if (this.isOutboundPage) {
          item.locationCode = item.outLocationCode;
          item.realAmount = item.amount || (item.realAmount || 0);
          return;
        }
        if (this.isInboundPage) {
          item.locationCode = item.defaultlocationCode;
        }
        item.realAmount = item.amount || (item.realAmount || 0);
      });
      if (this.isOutboundPage) {
        this.locationSelectFilter.pCode = this.headerInfo.outArea;
        this.locationSelectFilter.houseLevel = 3;
        return;
      }
      this.locationSelectFilter.pCode = this.headerInfo.inArea;
      this.locationSelectFilter.houseLevel = 3;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onOkLocation(event: LocationSelectorNs.FilterDataModel[], index: number) {
    this.materialDetailList[index].locationType = 3;
  }
  private checkLocation() {
    return this.materialDetailList.every((item) => {
      return !!item.locationCode;
    });
  }
  public outbound() {
    if (!this.checkLocation()) {
      this.messageService.showToastMessage('请选择出库储位', 'warning');
      return;
    }
    const detailList = [];
    this.materialDetailList.forEach((item) => {
      const temp = Object.assign({}, item);
      temp['_this'] = undefined;
      detailList.push(temp);
    });
    const data = {
      headerInfo: {
        businessOrder: this.headerInfo.allotOrder,
        agreementFlag: this.headerInfo.agreementFlag,
        agreementCode: this.headerInfo.agreementCode || ''
      },
      detailList: detailList
    };
    this.messageService.showAlertMessage('', '确定要出库吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.messageService.showLoading();
      this.regionAllotService.outbound(data).subscribe((resData) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.onCancel();
      }, (error) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    });
  }
  public inbound() {
    if (!this.checkLocation()) {
      this.messageService.showToastMessage('请选择入库储位', 'warning');
      return;
    }
    const detailList = [];
    this.materialDetailList.forEach((item) => {
      const temp = Object.assign({}, item);
      temp['_this'] = undefined;
      detailList.push(temp);
    });
    const data = {
      headerInfo: {
        businessOrder: this.headerInfo.allotOrder,
        agreementFlag: this.headerInfo.agreementFlag,
        agreementCode: this.headerInfo.agreementCode || ''
      },
      detailList: detailList
    };
    this.messageService.showAlertMessage('', '确定要入库吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.messageService.showLoading();
      this.regionAllotService.inbound(data).subscribe((resData) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.onCancel();
      }, (error) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    });
  }
  public onCancel() {
    this.finish.emit();
  }
  public showStockModal(material: any) {
    this.stockModalShow = true;
    this.selectedLine = material;
    this.stockFilter['materialCode'] = material.materialNo;
    this.stockFilter['areaCode'] = this.headerInfo.outArea;


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
  public chooseStock(chooseData: PickingApplyServiceNs.StockItem) {
    this.stockModalShow = false;
    this.materialDetailList.forEach((item) => {
      if (item.materialNo === this.selectedLine.materialNo) {
        item.locationCode = chooseData.locationCode;
      }
    });
    // this.selectedLine.nomalInvtNum = item.amount;
    // const locationField = ['locationCode', 'areaCode', 'warehouseCode'];
    // for (let i = 0, len = locationField.length; i < len; i++) {
    //   if (item[locationField[i]]) {
    //     this.selectedLine.locationType = len  - i;
    //     this.selectedLine.warehouseCode = item[locationField[i]];
    //     break;
    //   }
    // }
  }

  ngOnInit() {
    this.type = this.isInboundPage ? '入库' : (this.isOutboundPage ? '出库' : '');

    this.tableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        { title: '物料编码', field: 'materialNo', width: 100 },
        { title: '物料名称', width: 200, field: 'materialName' },
        { title: '单位', field: 'unit', width: 100 },
        // { title: this.type + '储位', tdTemplate: this.locationTpl, width: 200 },
        // { title: '实际库存', field: 'enableNum', width: 100 },
        // { title: '当前库存', tdTemplate: this.nowStockTpl, width: 100 },
        { title: '申请数量', field: 'amount', width: 100 },
        { title: this.type + '数量', field: 'realAmount', width: 100 },
        { title: '调出完成数', field: 'outAmount', width: 100 },
        { title: '调入完成数', field: 'inAmount', width: 100 },
        { title: '备注', field: 'remark', width: 100 }
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
      headers: [
        {title: '操作', tdTemplate: this.stockOperateTpl, width: 100},
        {title: '仓库编码', field: 'warehouseCode', width: 100},
        {title: '库区编码', field: 'areaCode', width: 150},
        {title: '储位编码', field: 'locationCode', width: 150},
        {title: '库存数量', field: 'amount', width: 100},
      ]
    };
    if (this.isInboundPage) {
      this.tableConfig.headers.splice(3, 0, {
        title: '入库储位', tdTemplate: this.locationTpl, width: 200
      },
      { title: '实际库存', field: 'enableNum', width: 100 });
    }
    if (this.isOutboundPage) {
      this.tableConfig.headers.splice(3, 0, {
        title: '出库储位', field: 'locationCode', width: 200
      },
      { title: '当前库存', tdTemplate: this.nowStockTpl, width: 100 });
    }
    this.getRegionAllotItem(this.detailId);
  }

}

