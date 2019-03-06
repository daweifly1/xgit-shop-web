import { ActionCode } from './../../../../../../environments/actionCode';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { BeginningWarehouseService, BeginningWarehouseServiceNs } from '../../../../../core/trans/beginningWarehouse.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { OtherwarehouseService, OtherWarehouseServiceNs } from '../../../../../core/trans/otherwarehouse.service';
import { LocationSelectorNs } from '../../../../../layout/trans/location-selector/location-selector.component';

interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}

@Component({
  selector: 'app-beginning-detail',
  templateUrl: './beginning-detail.component.html',
  styleUrls: ['./beginning-detail.component.scss']
})
export class BeginningDetailComponent implements OnInit {
  tabPageType: TabPageType;
  @Input() stockIn: boolean;
  @Output() finish: EventEmitter<any>;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('locationCodeTpl') locationCodeTpl: TemplateRef<any>;
  @Input() billNo: string;
  tableConfig: UfastTableNs.TableConfig;
  headerInfo: any;
  detailMaterialList: any[];
  locationFilter: LocationSelectorNs.FilterDataModel;
  disabledFinish: boolean;
  headerFieldList: { name: string; field: string; pipe?: string }[];
  ActionCode = ActionCode;
  constructor(private beginningWareHouseService: BeginningWarehouseService, private messageService: ShowMessageService,
    private otherWareHouseService: OtherwarehouseService
  ) {
    this.locationFilter = {};
    this.finish = new EventEmitter<any>();
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.detailMaterialList = [];
    this.headerInfo = {};
    this.headerFieldList = [
      { name: '入库单号', field: 'billNo' },
      { name: '仓库编号', field: 'inLocation' },
      { name: '库区编号', field: 'inArea' },
      { name: '制单部门', field: 'dept' },
      { name: '制单人', field: 'createName' },
      { name: '制单时间', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm' },
      { name: '入库状态', field: 'state', pipe: 'state' }
    ];
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public emitFinish() {
    this.finish.emit();
  }

  getDetailMaterialList = () => {
    const filter = {
      pageNum: 0,
      pageSize: 0,
      filters: {
        billNo: this.billNo
      }
    };
    this.tableConfig.loading = true;
    let submit = null;
    if (this.stockIn) {
      submit = this.beginningWareHouseService.getStockInDetailMaterialList(filter);
    } else {
      submit = this.beginningWareHouseService.getDetailMaterialList(filter);
    }
    submit.subscribe(
      (resData: BeginningWarehouseServiceNs.UfastHttpAnyResModel) => {
        this.tableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showToastMessage( resData.message, 'warning');
          return;
        }
        this.detailMaterialList = resData.value.list;
        this.tableConfig.total = resData.value.total;
        this.detailMaterialList.forEach((item) => {
          item['_this'] = item;
          item['locationCode'] = item['location'];
          item['disabledFinish'] = item.state === BeginningWarehouseServiceNs.StockInStatus.All ||
            item.state === BeginningWarehouseServiceNs.StockInStatus.Finish;
        });
      }, (error: any) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public submitStockIn() {
    const headerInfo = Object.assign({
      businessOrder: this.headerInfo.billNo,
      warehouseCode: this.headerInfo.inLocation,
    }, this.headerInfo);
    const detailList = [];
    for (let i = 0, len = this.detailMaterialList.length; i < len; i++) {
      const item = this.detailMaterialList[i];
      if (item.disabledFinish) {
        continue;
      }
      if (!item.locationCode) {
        this.messageService.showToastMessage(`请选择物料 ${item.materialsNo} 的储位`, 'warning');
        return;
      }
      const temp = Object.assign({
        materialNo: item.materialsNo,
        realAmount: item.totalQty
      }, item);
      temp['_this'] = undefined;
      detailList.push(temp);
    }
    this.messageService.showLoading('');
    this.otherWareHouseService.inboundReceive({ headerInfo: headerInfo, detailList: detailList })
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
        this.beginningWareHouseService.statementFinish(this.billNo, materialsNo).
          subscribe((resData: BeginningWarehouseServiceNs.UfastHttpResT<any>) => {
            this.messageService.closeLoading();
            if (resData.code !== 0) {
              this.messageService.showAlertMessage('', resData.message, 'warning');
              return;
            }
            this.messageService.showToastMessage('操作成功!', 'success');
            if (materialsNo) {
              this.getOrderInfo();
              this.getDetailMaterialList();
              return;
            }
            this.emitFinish();
          }, (error: any) => {
            this.messageService.closeLoading();
            this.messageService.showAlertMessage('', error.message, 'error');
          });
      });
  }
  private getOrderInfo() {
    this.beginningWareHouseService.getBeginningWarehouseList({
      pageNum: 1,
      pageSize: 1,
      filters: { billNo: this.billNo }
    }).subscribe((resData: BeginningWarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.headerInfo = resData.value.list[0] || {};
      this.locationFilter.pCode = this.headerInfo.inArea;
      this.locationFilter.houseLevel = LocationSelectorNs.SelectedLevelEnum.Location;
      this.disabledFinish = this.headerInfo.state === BeginningWarehouseServiceNs.StockInStatus.Finish ||
        this.headerInfo.state === BeginningWarehouseServiceNs.StockInStatus.All;
    }, (error) => {
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
      headers: [{ title: '操作', tdTemplate: this.operation, width: 60 },
      { title: '物料编码', field: 'materialsNo', width: 100 },
      { title: '物料描述', field: 'materialsDes', width: 150 },
      { title: '入库总数量', field: 'totalQty', width: 100 },
      { title: '最小包装', field: 'minPackQty', width: 80 },
      { title: '实际入库数', field: 'inNum', width: 100 },
      { title: '零件号/图号', field: 'orawyd', width: 100 },
      { title: 'VIN号', field: 'vinid', width: 100 },
      { title: '入库状态', field: 'state', width: 100, pipe: 'state' },
      { title: '原始入库时间', field: 'initDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' },
      ]
    };
    if (this.stockIn) {
      this.tableConfig.frontPagination = true;
      this.tableConfig.headers.shift();
      this.tableConfig.headers.splice(2, 0, {
        title: '储位', tdTemplate: this.locationCodeTpl, width: 180, thClassList: ['th-required']
      });
    }
    this.getDetailMaterialList();
    this.getOrderInfo();
  }

}
