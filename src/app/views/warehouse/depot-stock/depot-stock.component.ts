import { environment } from './../../../../environments/environment';
import { ActionCode } from './../../../../environments/actionCode';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../layout/layout.module';
import { InventoryService, InventoryServiceNs } from '../../../core/trans/inventory.service';
import { OtherwarehouseService, OtherWarehouseServiceNs } from '../../../core/trans/otherwarehouse.service';
import { WarehouseServiceNs, WarehouseService } from '../../../core/trans/warehouse.service';
import { UserService } from '../../../core/common-services/user.service';
import { LocationSelectorNs } from '../../../layout/trans/location-selector/location-selector.component';

interface TabPageType {
  ManagePage: number;
  DetailPage: number;
}

// 定义高级搜索所用到的字段模型
interface FilterItem {
  materialName?: string;
  materialNo?: string;
  warehouseCode?: string;
  areaCode?: string;
  locationCode?: string;
  keeperName?: string;
  planner?: string;
}
interface KeeperNameType {
  name?: string;
  userId?: string;
}

@Component({
  selector: 'app-depot-stock',
  templateUrl: './depot-stock.component.html',
  styleUrls: ['./depot-stock.component.scss']
})
export class DepotStockComponent implements OnInit {
  tabPageType: TabPageType;
  filters: FilterItem;
  selectedPage: number;
  selectedListIds: any[];
  tableConfig: UfastTableNs.TableConfig;
  DataList: any[];
  fullSearchShow: boolean;
  locationCode: string;
  materialNo: string;
  agreementCode: string;
  status: number;
  @ViewChild('materialNoTpl') materialNoTpl: TemplateRef<any>;
  // agreementFlag: number;
  ActionCode = ActionCode;
  exportUrl: string;
  exportParam: any;
  /**选择仓库 */
  isVisible: boolean;
  wareHouseTableConfig: UfastTableNs.TableConfig;
  wareHouseDataList: any[];
  @ViewChild('chooseWareHouse') chooseWareHouse: TemplateRef<any>;

  /**选择保管员 */
  isVisiblekeeperName: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];
  keeperNameFilter: KeeperNameType;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
    /**
   * 计划员相关
   */
  salesmanVisible: boolean;
  salesmanTableConfig: UfastTableNs.TableConfig;
  salesmanDataList: any[];
  @ViewChild('chooseSalesman') chooseSalesman: TemplateRef<any>;
  locations: any;

  constructor(private messageService: ShowMessageService,
    private inventoryService: InventoryService,
    private otherWareHouseService: OtherwarehouseService,
    private warehouseService: WarehouseService,
    private userService: UserService) {
    this.selectedListIds = [];
    this.DataList = [];
    this.locationCode = '';
    this.materialNo = '';
    this.fullSearchShow = false;
    this.filters = {};
    this.tabPageType = {
      ManagePage: 0,
      DetailPage: 1,
    };
    this.selectedPage = this.tabPageType.ManagePage;
    this.exportUrl = `${environment.baseUrl.ss}/warehouseInventory/exportAll`;
    this.exportParam = {
      pageSize: 0,
      pageNum: 0,
      filters: this.filters
    };
    this.isVisiblekeeperName = false;
    this.keeperNameFilter = {};
    this.salesmanVisible = false;
    this.salesmanDataList = [];
    this.locations = '';
  }

  getList = (pageNum?: number) => {
    this.DataList = [];
    this.tableConfig.checkAll = false;
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: pageNum || this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.inventoryService.getWarehouseInventoryList(filter).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.DataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public detailDepotStock(locationCode: string, materialNo: string, agreementCode: string, status: number) {
    this.selectedPage = this.tabPageType.DetailPage;
    this.locationCode = locationCode;
    this.materialNo = materialNo;
    this.materialNo = materialNo;
    this.agreementCode = agreementCode;
    this.status = status;
  }

  public onChildFinish() {
    this.getList();
    this.selectedPage = this.tabPageType.ManagePage;
  }

  // 高级搜索
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }

  public fullSearchClose() {
    this.fullSearchShow = false;
  }

  public fullSearchReset() {
    this.filters = {};
    this.locations = '';
    this.getList();
  }



  /**选择保管员 */
  showVisiblekeeperNameModal(): void {
    this.isVisiblekeeperName = true;
    this.getKeeperNameModalData();

  }
  getKeeperNameModalData = () => {
    const filter = {
      pageNum:  this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: this.keeperNameFilter
    };
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseKeeperNameFun(keeperName: any, userId: string) {
    this.filters.keeperName = keeperName;
    this.handleCancelKeeperName();
  }
  public searchKeeperName(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        name: this.keeperNameFilter.name
      }
    };
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }

  handleCancelKeeperName(): void {
    this.isVisiblekeeperName = false;
  }


  /**计划员 */
  public showSalesmanModel() {
    this.salesmanVisible = true;
    this.getSalesmanDataList();
  }
  public handleCancelSalesman() {
    this.salesmanVisible = false;
  }
  getSalesmanDataList = () => {
    const data = {
      pageNum: this.salesmanTableConfig.pageNum,
      pageSize: this.salesmanTableConfig.pageSize,
      filters: {
        roleName: '保管员'
      }
    };
    this.salesmanTableConfig.loading = true;
    this.userService.getUserList(data).subscribe((resData: any) => {
      this.salesmanTableConfig.loading = false;
      this.salesmanDataList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = {};
        temp = item;
        temp['_this'] = temp;
        this.salesmanDataList.push(temp);
      });
      this.salesmanTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.salesmanTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseSalesmanFun(item) {
    this.filters.planner = item.name;
    this.handleCancelSalesman();
  }

    /**选择仓库 */
    showWarehouseModal(): void {
      this.isVisible = true;
      this.getWareHouseList();
    }

    getWareHouseList = () => {
      const filter = {
        pageNum: this.wareHouseTableConfig.pageNum,
        pageSize: this.wareHouseTableConfig.pageSize,
        filters: {
          pCode: '0',
          houseLevel: 1,
        }
      };
      this.wareHouseTableConfig.loading = true;
      this.otherWareHouseService.getInWareHouseList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
        this.wareHouseTableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'warning');
        }
        this.wareHouseDataList = resData.value.list;
        this.wareHouseTableConfig.total = resData.value.total;
      }, (error: any) => {
        this.wareHouseTableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    }

    handleCancel(): void {
      this.isVisible = false;
    }
    public chooseWareHouseFun(code) {
      this.filters.warehouseCode = code;
      // this.locationFilter.pCode = code;
      this.handleCancel();
    }
  public location(event) {
    this.filters.warehouseCode = '';
    this.filters.areaCode = '';
    this.filters.locationCode = '';
    const level = event.length;
    if (!level) {
      return;
    }
    switch (level) {
      case 1: this.filters.warehouseCode = event[0].code;
      break;
      case 2: this.filters.warehouseCode = event[0].code;
      this.filters.areaCode = event[1].code;
      break;
      case 3: this.filters.warehouseCode = event[0].code;
      this.filters.areaCode = event[1].code;
      this.filters.locationCode = event[2].code;
    }
  }
  public locationChange(event) {
    if (!event) {
      this.filters.warehouseCode = '';
      this.filters.areaCode = '';
      this.filters.locationCode = '';
    }
  }


  ngOnInit() {
    this.tableConfig = {
      id: 'warhouse-depotStock',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '物料编码', tdTemplate: this.materialNoTpl, width: 110, fixed: true },
        { title: '物料描述', field: 'materialName', width: 200, fixed: true },
        { title: '物料分类', field: 'materialType', width: 120 },
        { title: '仓库编码', field: 'warehouseCode', width: 100 },
        { title: '库区', field: 'areaCode', width: 100 },
        { title: '储位', field: 'locationCode', width: 200 },
        { title: '协议号', field: 'agreementCode', width: 180 },
        { title: '库存数量', field: 'amount', width: 100 },
        { title: '计量单位', field: 'unit', width: 100 },
        { title: '保管员', field: 'keeperName', width: 120 },
        { title: '计划价(元)', field: 'planPrice', width: 120 },
        { title: '计划员', field: 'planner', width: 120 },
        { title: '库存状态', field: 'status', width: 120, pipe: 'inventoryStatus' }
      ]
    };
    this.wareHouseTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '仓库编码', field: 'code', width: 100 },
      { title: '仓库描述', field: 'remark', width: 150 },
      { title: '操作', tdTemplate: this.chooseWareHouse, width: 60 }
      ]
    };
    this.keeperNameTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '保管员名称', field: 'name', width: 100 },
      { title: '保管员编号', field: 'userId', width: 150 },
      { title: '操作', tdTemplate: this.chooseKeeperName, width: 60 }
      ]
    };
    this.salesmanTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{title: '计划员名称', field: 'name', width: 100},
      {title: '计划员编号', field: 'userId', width: 100},
        {title: '操作', tdTemplate: this.chooseSalesman, width: 60}
      ]
    };

    this.getList();
  }

}
