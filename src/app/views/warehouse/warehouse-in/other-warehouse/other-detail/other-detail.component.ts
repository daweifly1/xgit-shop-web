import { ActionCode } from './../../../../../../environments/actionCode';
import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../../layout/layout.module';
import {OtherwarehouseService, OtherWarehouseServiceNs} from '../../../../../core/trans/otherwarehouse.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {LocationSelectorNs} from '../../../../../layout/trans/location-selector/location-selector.component';

interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}

@Component({
  selector: 'app-other-detail',
  templateUrl: './other-detail.component.html',
  styleUrls: ['./other-detail.component.scss']
})
export class OtherDetailComponent implements OnInit {
  tabPageType: TabPageType;
  @Input()selectRowId: string;
  @Input() stockIn: boolean;
  @Output()finish: EventEmitter<any>;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('locationTpl') locationTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  otherDetailDataList: any[];
  mouseDetail: any;
  headerFieldList: {name: string; field: string; pipe?: string }[];
  disabledFinish: boolean;
  locationFilter: any;
  ActionCode = ActionCode;
  constructor(private otherWareHouseService: OtherwarehouseService,
              private messageService: ShowMessageService) {
    this.locationFilter = {};
    this.stockIn = false;
    this.finish = new EventEmitter<any>();
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.otherDetailDataList = [];
    this.mouseDetail = {};
    this.headerFieldList = [
      { name: '申请单号', field: 'abnormalNo'},
      { name: '制单人', field: 'createName'},
      { name: '制单部门', field: 'dept'},
      { name: '制单时间', field: 'applicationDate', pipe: 'date:yyyy-MM-dd HH:mm'},
      { name: '领入仓库', field: 'inLocation'},
      { name: '领入库区', field: 'inArea'},
      { name: '入库状态', field: 'state', pipe: 'inventoryType'},
      { name: '入库类型', field: 'type'},
      { name: '部门编号', field: 'innerOrder'},
      { name: '部门名称', field: 'innerOrderNote'},
      { name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage'},
      { name: '同步状态', field: 'sapOrderDesc'},
      { name: '是否协议入库', field: 'agreementFlag', pipe: 'barcodeManage'},
      { name: '协议号', field: 'agreementCode'},
      { name: '原因', field: 'note'},
      { name: '客户', field: 'customerName'}
    ];
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public emitFinish() {
    this.finish.emit();
  }
  public submitStockIn() {
    const headerInfo = Object.assign({
      businessOrder: this.mouseDetail.abnormalNo,
      warehouseCode: this.mouseDetail.inLocation,
    }, this.mouseDetail);
    headerInfo.abnormalNo = undefined;
    headerInfo.inLocation = undefined;
    const detailList = [];
    let flag = false;
   this.otherDetailDataList.forEach((item) => {
     if (item.disableFinish) {
       return;
     }
     if (!item.locationCode) {
       flag = true;
       return;
     }
    const temp = Object.assign({
      materialNo: item.materialsNo,
      realAmount: item.qty
    }, item);
    temp['_this'] = undefined;
    temp.materialsNo = undefined;
   detailList.push(temp);
   });
   if (flag) {
    this.messageService.showToastMessage('请选择储位', 'warning');
     return;
   }
    this.messageService.showLoading('');
    this.otherWareHouseService.inboundReceive({headerInfo: headerInfo, detailList: detailList})
      .subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('入库成功', 'success');
      this.emitFinish();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public getInventoryDetail() {
    this.tableConfig.loading = true;
    this.otherWareHouseService.getInMouseDetail(this.selectRowId).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.mouseDetail = resData.value.headerInfo;
      this.mouseDetail['sapOrderDesc'] = this.mouseDetail.sapOrder === null ? '未同步' : '已同步';
      this.mouseDetail['voucherNODesc'] = this.mouseDetail.voucherNO === null ? '未过账' : '已过账';
      this.disabledFinish = this.mouseDetail.state === OtherWarehouseServiceNs.StockInStatus.Finish ||
        this.mouseDetail.state === OtherWarehouseServiceNs.StockInStatus.All;
      this.locationFilter = {
        pCode: this.mouseDetail.inArea,
        houseLevel: LocationSelectorNs.SelectedLevelEnum.Location
      };
      this.otherDetailDataList = resData.value.detailList;
      this.otherDetailDataList.forEach((item) => {
        item.disableFinish = item.state === OtherWarehouseServiceNs.StockInStatus.Finish ||
          item.state === OtherWarehouseServiceNs.StockInStatus.All;
        item['_this'] = item;
        item.locationCode = item.defaultLocationCode || '';
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public statementFinish(disabled: boolean, materialNo?: string, ) {
    if (disabled) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').
    afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.otherWareHouseService.statementFinish(this.mouseDetail.abnormalNo, materialNo).
      subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.messageService.showToastMessage('操作成功!', 'success');
        if (!materialNo) {
          this.emitFinish();
        } else {
          this.getInventoryDetail();
        }
      }, (error: any) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
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
      headers: [{title: '操作', tdTemplate: this.operation, width: 60},
        {title: '物料编码', field: 'materialsNo', width: 100},
        {title: '物料描述', field: 'materialsDes', width: 150},
        {title: '分类', field: 'materialsType', width: 80},
        {title: '单位', field: 'unit', width: 80},
        {title: '入库数量', field: 'qty', width: 100},
        {title: '实际入库数量', field: 'realQty', width: 100},
        {title: '入库状态', field: 'state', width: 100, pipe: 'inventoryType'},
      ]
    };
    if (this.stockIn) {
      this.tableConfig.headers.shift();
      this.tableConfig.headers.splice(3, 0, { title: '储位', tdTemplate: this.locationTpl, width: 150});
    }
    this.getInventoryDetail();
  }

}
