import {Component, OnInit, AfterContentInit, ViewChild, TemplateRef, Input, Output, EventEmitter} from '@angular/core';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../../layout/layout.module';
import {WarehouseWarrantServiceNs, WarehouseWarrantService} from '../../../../core/trans/warehouseWarrant.service';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
import { WarehouseStockIn} from '../../../../../environments/printData';
import { PrintTplSelectorService} from '../../../../widget/print-tpl-selector/print-tpl-selector';
import { ActionCode } from '../../../../../environments/actionCode';

enum TabPageType {
  MainPage = 0,
  DetailPage = 1,
  StockOutPage
}

interface FiltersType {
  supplierName?: string;
  agreementFlag?: string;
  contractNo?: string;
  receiveName?: string;
  status?: string;
  inNo?: string;
}
enum InventoryStatus {
  Undone,
  Part,
  All,
  Finish
}
interface ActionStatus {
  stockIn: boolean;
  finish: boolean;
  print: boolean;
  exitStockOut: boolean;
  erpSync: boolean;
}
@Component({
  selector: 'app-warehouse-warrant',
  templateUrl: './warehouse-warrant.component.html',
  styleUrls: ['./warehouse-warrant.component.scss']
})
export class WarehouseWarrantComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('orderNoTpl') orderNoTpl: TemplateRef<any>;
  selectedPage: number;
  pageType = TabPageType;
  warehouseWarrantList: any[]; // 在服务中定义列表类型
  filters: any;
  advancedSearchShow: boolean;
  inventoryStatus: any;  // 入库状态
  contractType: any; // 合同类型
  id: string;
  keeperId: string;
  detailPage: boolean;
  InStatus = InventoryStatus;
  actionStatus: {[index: string]: ActionStatus};
  ActionCode = ActionCode;
  constructor(private warehouseWarrantService: WarehouseWarrantService,
              private messageService: ShowMessageService, private ufastUtilService: UfastUtilService,
            private printTplSelector: PrintTplSelectorService) {
    this.selectedPage = this.pageType.MainPage;
    this.warehouseWarrantList = [];
    this.filters = {};
    this.advancedSearchShow = false;
    this.actionStatus = {};
    this.contractType = [
      {id: 1, name: '采购订单'},
      {id: 2, name: '年度协议'},
    ];
    this.id = '';
  }

  getWarehouseWarrantList = (pageNum?: number, pageSize?: number) => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize || pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.actionStatus = {};
    this.warehouseWarrantList = [];
    this.warehouseWarrantService.getWarehouseWarrantList(filter).subscribe((resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.tableConfig.loading = false;
      this.warehouseWarrantList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.tableConfig.checkAll = false;
      this.warehouseWarrantList.forEach((item) => {
        if (item['erpSyncFlag'] === null) {
          item['erpSyncFlag'] = WarehouseWarrantServiceNs.ErpSyncFlag.UnSync;
        }
        this.actionStatus[item.id] = {
          print: true,
          finish: item.status !== InventoryStatus.Finish && item.status !== InventoryStatus.All,
          exitStockOut: true,
          stockIn: item.status === InventoryStatus.Undone || item.status === InventoryStatus.Part,
          erpSync: (item.status === InventoryStatus.Finish || item.status === InventoryStatus.All) &&
          (item['erpSyncFlag'] === WarehouseWarrantServiceNs.ErpSyncFlag.UnSync ||
            item['erpSyncFlag'] === WarehouseWarrantServiceNs.ErpSyncFlag.SyncFailed)
             && item.inType === WarehouseWarrantServiceNs.CompactType.order
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public toggleAdvancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }

  public advancedSearchReset() {
    this.filters = {};
    this.getWarehouseWarrantList();
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.warehouseWarrantList.length; i < len; i++) {
      this.warehouseWarrantList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.warehouseWarrantList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }
  public stockOut(id: string, status: number) {
    this.id = id;
    this.selectedPage = this.pageType.StockOutPage;
  }
  public accountStatement(no: string, status: number, id: string) {
    if (!this.actionStatus[id].finish) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const data = {
        billNo: no
      };
      this.warehouseWarrantService.accountStatement(data).subscribe((resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
        this.tableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.messageService.showToastMessage('操作成功!', 'success');
        this.getWarehouseWarrantList();
      }, (error: any) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    });
  }
  public doErpSync(id: string) {
    this.messageService.showAlertMessage('', '确定要执行ERP同步吗？', 'confirm')
      .afterClose.subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.warehouseWarrantService.erpSync(id).subscribe((resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getWarehouseWarrantList();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public delete(id: string) {

    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.warehouseWarrantService.delete([id]).subscribe((resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
        this.tableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.messageService.showToastMessage('操作成功!', 'success');
        this.getWarehouseWarrantList();
      }, (error: any) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    });
  }

  public detail(id: string, detailPage: boolean, status?: number, keeperId?: string) {
    if (!detailPage && !this.actionStatus[id].stockIn) {
      return;
    }
    this.selectedPage = this.pageType.DetailPage;
    this.id = id;
    this.keeperId = keeperId;
    this.detailPage = detailPage;
  }


  public onChildFinish() {
    this.selectedPage = this.pageType.MainPage;
    this.getWarehouseWarrantList();
  }

  public print(id: string) {
    this.warehouseWarrantService.getWarehouseWarrantDetail(id).subscribe((resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value['qrcode'] = resData.value.inNo;
      this.printTplSelector.showTplSelector(
        {
          printConfig: WarehouseStockIn,
          headerInfo: resData.value,
          dataList: resData.value.warehouseStockInDetailVOs
        });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-warehouseWarrant',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      checkRowField: '_checked',
      checkAll: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 120, fixed: true},
        {title: '入库单号', tdTemplate: this.orderNoTpl, width: 180, fixed: true},
        {title: '入库类型', field: 'inType', width: 120, pipe: 'stockInType'},
        {title: '入库状态', field: 'status', width: 100, pipe: 'inventoryType'},
        {title: '合同号', field: 'contractNo', width: 180},
        {title: '合同类型', field: 'inType', width: 150, pipe: 'agreementFlag'},
        {title: '供应商', field: 'supplierName', width: 200},
        {title: '收货方', field: 'receiveName', width: 150},
        {title: 'ERP同步', field: 'erpSyncFlag', width: 100, pipe: 'erpSync'},
        {title: '制单时间', field: 'createDate', width: 180, pipe: 'date:yyyy-MM-dd HH:mm'},
        {title: '制单人', field: 'createName', width: 200},
        {title: '保管员', field: 'keeperName', width: 100}
      ]
    };
    this.getWarehouseWarrantList();
    this.warehouseWarrantService.getInventoryStatus().subscribe((inventoryStatus) => {
      this.inventoryStatus = inventoryStatus;
    });
  }

}
