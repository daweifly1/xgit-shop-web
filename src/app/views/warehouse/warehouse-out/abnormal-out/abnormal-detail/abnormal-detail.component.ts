import { ActionCode } from './../../../../../../environments/actionCode';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import {
  AbnormalOutService,
  AbnormalOutServiceNs
} from '../../../../../core/trans/abnormalOut.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { LocationSelectorNs } from '../../../../../layout/trans/location-selector/location-selector.component';
import { PickingApplyServiceNs, PickingApplyService } from '../../../../../core/trans/picking-apply.service';
interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}
@Component({
  selector: 'app-abnormal-detail',
  templateUrl: './abnormal-detail.component.html',
  styleUrls: ['./abnormal-detail.component.scss']
})
export class AbnormalDetailComponent implements OnInit {
  tabPageType: TabPageType;
  @Input() selectRowId: string;
  @Output() finish: EventEmitter<any>;
  @Input() stockOut: boolean;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('locationCodeTpl') locationCodeTpl: TemplateRef<any>;
  @ViewChild('nowStockTpl') nowStockTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('stockOperateTpl') stockOperateTpl: TemplateRef<any>;
  abnormalOutDetail: any;
  materialInformationList: AbnormalOutServiceNs.AbnormalOutMaterialModel[];
  disabledFinish: boolean;
  headerFieldList: { name: string; field: string; pipe?: string }[];
  locationFilter: LocationSelectorNs.FilterDataModel;
  stockTableConfig: UfastTableNs.TableConfig;
  stockDataList: PickingApplyServiceNs.StockItem[];
  stockModalShow: boolean;
  stockFilter: any;
  selectedLine: any;
  ActionCode = ActionCode;
  constructor(private abnormalOutService: AbnormalOutService,
    private messageService: ShowMessageService,
    private pickingApplyService: PickingApplyService) {
    this.locationFilter = {};
    this.finish = new EventEmitter<any>();
    this.disabledFinish = true;
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.abnormalOutDetail = [];
    this.materialInformationList = [];
    this.headerFieldList = [
      { name: '出库单号', field: 'abnormalNo' },
      { name: '出库类型', field: 'type' },
      { name: '部门编码', field: 'innerOrder' },
      { name: '部门名称', field: 'innerOrderNote' },
      { name: '产生原因', field: 'reasonName' },
      { name: '调出仓库', field: 'outLocation' },
      { name: '调出库区', field: 'outArea' },
      { name: '承运物流', field: 'logistics' },
      { name: '承运人', field: 'logisticsPerson' },
      { name: '联系方式', field: 'logisticsPhone' },
      { name: '客户', field: 'agentName' },
      { name: '发运方式', field: 'deliveryTypeName' },
      { name: '运费结算方式', field: 'settleTypeName' },
      { name: '收货人', field: 'receiverName' },
      { name: '收货人联系方式', field: 'receiverPhone' },
      { name: '传真', field: 'receiverFax' },
      { name: '收货地址', field: 'address' },
      { name: '备注', field: 'note' },
      { name: '出库状态', field: 'status', pipe: 'stockOutStatus' },
      { name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage' },
      { name: '是否协议出库', field: 'agreementFlag', pipe: 'barcodeManage' },
      { name: '协议号', field: 'agreementCode' },
      { name: '制单部门', field: 'dept' },
      { name: '制单人', field: 'createName' },
      { name: '制单时间', field: 'applicationDate', pipe: 'date:yyyy-MM-dd HH:mm' },

    ];
    this.stockFilter = {};
    this.stockDataList = [];
    this.stockModalShow = false;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  public showStockModal(material: any) {
    this.stockModalShow = true;
    this.selectedLine = material;
    this.stockFilter['materialCode'] = material.materialsNo;
    // this.stockFilter['areaCode'] = this.abnormalOutDetail.outArea;
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
    if (this.abnormalOutDetail.agreementFlag) {
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
  public chooseStock(item: PickingApplyServiceNs.StockItem) {
    this.stockModalShow = false;
    this.materialInformationList.forEach((temp) => {
      if (temp.materialsNo === this.selectedLine.materialsNo) {
        temp.locationCode = item.locationCode;
      }
    });
    this.selectedLine.nomalInvtNum = item.amount;
  }

  // 获取详情页数据
  public getAbnormalOutDetail() {
    this.tableConfig.loading = true;
    this.abnormalOutService.getAbnormalOutDetail(this.selectRowId).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.abnormalOutDetail = resData.value.headerInfo;
      this.locationFilter.pCode = this.abnormalOutDetail.outArea;
      this.locationFilter.houseLevel = LocationSelectorNs.SelectedLevelEnum.Location;
      this.materialInformationList = resData.value.materialList;
      this.materialInformationList.forEach((item) => {
        item['_this'] = item;
        item['disabledFinish'] = item.status === AbnormalOutServiceNs.StockOutStatus.Finish ||
          item.status === AbnormalOutServiceNs.StockOutStatus.All;
      });
      this.disabledFinish = this.abnormalOutDetail.status === AbnormalOutServiceNs.StockOutStatus.Finish ||
        this.abnormalOutDetail.status === AbnormalOutServiceNs.StockOutStatus.All;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public statementFinish(disabled: boolean, materialsNo?: string) {
    if (disabled) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').
      afterClose.subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.abnormalOutService.statementFinish(this.abnormalOutDetail.abnormalNo, materialsNo).
          subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
            this.messageService.closeLoading();
            if (resData.code !== 0) {
              this.messageService.showAlertMessage('', resData.message, 'warning');
              return;
            }
            this.messageService.showToastMessage('操作成功!', 'success');
            if (materialsNo) {
              this.getAbnormalOutDetail();
            } else {
              this.emitFinish();
            }
          }, (error: any) => {
            this.messageService.closeLoading();
            this.messageService.showAlertMessage('', error.message, 'error');
          });
      });
  }
  public submitDelivery() {
    const headerInfo = Object.assign({
      businessOrder: this.abnormalOutDetail.abnormalNo,
      warehouseCode: this.abnormalOutDetail.outLocation,
    }, this.abnormalOutDetail);
    const detailList = [];
    this.materialInformationList.forEach((item) => {
      if (item['disabledFinish']) {
        return;
      }
      const temp = Object.assign({
        materialNo: item.materialsNo,
        realAmount: item.qty
      }, item);
      temp['_this'] = undefined;
      detailList.push(temp);
    });
    this.messageService.showLoading();
    this.abnormalOutService.addDelivery({ headerInfo: headerInfo, detailList: detailList })
      .subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'error');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitFinish();
      }, (error) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public emitFinish() {
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
      headers: [{ title: '操作', tdTemplate: this.operation, width: 60 },
      { title: '物料编码', field: 'materialsNo', width: 100 },
      { title: '物料描述', field: 'materialsDes', width: 150 },
      // { title: '分类', field: 'materialsType', width: 80 },
      { title: '单位', field: 'unit', width: 80 },
      // { title: '默认储位', field: 'locationCode', tdTemplate: this.stockOut ? this.locationCodeTpl : undefined, width: 150 },
      // { title: '默认储位', field: 'locationCode', width: 150 },
      // { title: '可用库存', field: 'enableNum', width: 100 },
      { title: '出库数量', field: 'qty', width: 100 },
      // { title: '当前库存', tdTemplate: this.nowStockTpl, width: 100 },
      { title: '实际出库数量', field: 'realQty', width: 100 },
      { title: '出库状态', field: 'status', width: 100, pipe: 'stockOutStatus' },
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
    if (this.stockOut) {
      this.tableConfig.headers.shift();
      this.tableConfig.headers.splice(5, 0, { title: '出库储位', field: 'locationCode', width: 150 });
      this.tableConfig.headers.splice(6, 0, { title: '当前库存', tdTemplate: this.nowStockTpl, width: 100 });
    }
    this.getAbnormalOutDetail();
  }

}
