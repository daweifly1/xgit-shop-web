import { Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { PurchaseOutService } from '../.././../../../core/trans/purchase-out.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { UfastUtilService } from '../../../../../core/infra/ufast-util.service';
enum PageTypeEnum {
  ManagePage,
  AddPage
}
@Component({
  selector: 'app-stock-record-select',
  templateUrl: './stock-record-select.component.html',
  styleUrls: ['./stock-record-select.component.scss']
})
export class StockRecordSelectComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  @Output() finish: EventEmitter<any>;
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  /**
   * 列表数据
   */
  stockRecordDataList: any;
  /**
   * 搜索
   */
  filters: any;
  /**
   * 高级搜索显隐
   */
  showAdvancedSearch: boolean;
  /**
   * 是否条码管理
   */
  barcodeFlagList: any[];
  /**
   * 选中的出入库记录数据
   */
  selectRecordSelect: any[];
  /**
   * 新增页传参
   */
  editId: string;
  constructor(private messageService: ShowMessageService,
    private purchaseOutService: PurchaseOutService, private utilService: UfastUtilService) {
    this.currentPage = this.tabPageType.ManagePage;
    this.finish = new EventEmitter<any>();
    this.stockRecordDataList = [];
    this.filters = {
      barcodeFlag: 1
    };
    this.showAdvancedSearch = false;
    this.editId = '';
    // this.barcodeFlagList = [
    //   { label: '否', value: 0 },
    //   { label: '是', value: 1 }
    // ];
    this.selectRecordSelect = [];
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.endCreateDate) {
      return false;
    }
    return startDate.getTime() > this.filters.endCreateDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.startCreateDate) {
      return false;
    }
    return endDate.getTime() <= this.filters.startCreateDate.getTime();
  }
  getStockRecordDataList = () => {
    if (!this.filters.contractNo) {
      this.messageService.showToastMessage('请输入合同号查询', 'warning');
      return;
    }
    this.tableConfig.checkAll = false;
    this.stockRecordDataList = [];
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.startCreateDate = this.filters.startCreateDate ?
      this.utilService.getStartDate(this.filters.startCreateDate) : undefined;
    this.filters.endCreateDate = this.filters.endCreateDate ?
      this.utilService.getEndDate(this.filters.endCreateDate) : undefined;
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.purchaseOutService.getStockRecordList(filter).subscribe((resData: any) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.stockRecordDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public reset() {
    this.filters = {};
    this.getStockRecordDataList();
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  /**
   * 选择
   */
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.stockRecordDataList.length; i < len; i++) {
      this.stockRecordDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.stockRecordDataList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }
  public confirm() {
    this.selectRecordSelect = [];
    this.stockRecordDataList.forEach((item) => {
      if (item._checked) {
        this.selectRecordSelect.push(item);
        return;
      }
    });
    if (!this.selectRecordSelect.length) {
      this.messageService.showToastMessage('请选择要退货的数据', 'warning');
      return;
    }
    for (let i = 0, len = this.selectRecordSelect.length - 1; i < len; i++) {
      const temp = this.selectRecordSelect[i].materialCode;
      if (temp === this.selectRecordSelect[++i].materialCode) {
        this.messageService.showToastMessage('一个退货单不允许有重复的物料', 'warning');
        return;
      }
    }
      this.currentPage = this.tabPageType.AddPage;
  }
  public emitFinish() {
    this.finish.emit();
  }
  public childPageFinish(value: boolean) {
    if (value) {
      this.emitFinish();
    } else {
      this.currentPage = this.tabPageType.ManagePage;
      this.getStockRecordDataList();
    }
  }


  ngOnInit() {
    this.tableConfig = {
      pageSize: 10,
      pageNum: 1,
      showCheckbox: true,
      checkRowField: '_checked',
      checkAll: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [
        { title: '合同号', field: 'contractNo', width: 200, fixed: true },
        { title: '接收号', field: 'erpNo', width: 100 },
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '入库数量', field: 'amountIn', width: 100 },
        { title: '入库单号', field: 'billNo', width: 160 },
        { title: 'ERP入库行id', field: 'erpDeliveryTrxId', width: 240 },
        { title: '已退货数量', field: 'amountOut', width: 100 },
        // { title: '制单时间', field: 'endCreateDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' },
      ]
    };
    this.purchaseOutService.getBarcodeList().subscribe((barcodeList) => {
      this.barcodeFlagList = barcodeList;
    });
    this.getStockRecordDataList();
  }

}
