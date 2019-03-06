import { Component, OnInit } from '@angular/core';
import {UfastTableNs} from '../../../layout/layout.module';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {InventoryService, InventoryServiceNs} from '../../../core/trans/inventory.service';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';

// 定义高级搜索所用到的字段模型
interface FilterItem {
  businessOrder: string;
  type: string;
  materialName: string;
  materialNo: string;
  createDateStart: string;
  createDateEnd: string;
}

@Component({
  selector: 'app-storage-records',
  templateUrl: './storage-records.component.html',
  styleUrls: ['./storage-records.component.scss']
})
export class StorageRecordsComponent implements OnInit {
  filters: any;
  selectedListIds: any[];
  tableConfig: UfastTableNs.TableConfig;
  DataList: any[];
  searchPlaceholder: string;
  fullSearchShow: boolean;
  dateFormat = 'yyyy-MM-dd';
  private inOutType = {1: 'IN', 2: 'OUT'};

  constructor(private messageService: ShowMessageService, private utilService: UfastUtilService,
              private inventoryService: InventoryService) {
    this.selectedListIds = [];
    this.DataList = [];
    this.searchPlaceholder = '业务单号';
    this.fullSearchShow = false;
    this.filters = {};
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.createDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.createDateEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.createDateStart) {
      return false;
    }
    return endDate.getTime() <= this.filters.createDateStart.getTime();
  }
  getList = (pageNum?: number) => {
    this.filters.createDateStart = this.filters.createDateStart ?
      this.utilService.getStartDate(this.filters.createDateStart) : undefined;
    this.filters.createDateEnd = this.filters.createDateEnd ?
      this.utilService.getEndDate(this.filters.createDateEnd) : undefined;
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: pageNum || this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {
        businessOrder: this.filters.businessOrder,
        type: this.filters.type || 0,
        materialName: this.filters.materialName,
        materialNo: this.filters.materialNo,
        createDateStart: this.filters.createDateStart,
        createDateEnd: this.filters.createDateEnd
      }
    };
    this.tableConfig.loading = true;
    this.inventoryService.getInOutRecordList(filter).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.DataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.DataList.forEach((item) => {
        item.barCodeShow = item.barCode === '0' ? '' : item.barCode;
        if (item.businessSingle !== 'JTQD') {   // 调拨单拼接，根据businessSingle和type判断是调拨出库还是调拨入库
          return;
        }
        item.businessSingle = item.businessSingle + this.inOutType[item.type];
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
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
    this.getList();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-storageRecords',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {title: '单据类型', field: 'type', width: 80, pipe: 'InOutType', fixed: true},
        {title: '业务单号', field: 'businessOrder', width: 180},
        {title: '条形码', field: 'barCodeShow', width: 160},
        {title: '物料编码', field: 'materialNo', width: 160},
        {title: '物料描述', field: 'materialName', width: 180},
        {title: '仓库', field: 'warehouseCode', width: 100},
        {title: '库区', field: 'areaCode', width: 120},
        {title: '储位', field: 'locationCode', width: 200},
        {title: '操作数量', field: 'amount', width: 80},
        {title: '计量单位', field: 'unit', width: 80},
        {title: '出入库类型', field: 'businessSingle', width: 100, pipe: 'billTypeShow'},
        {title: '操作时间', field: 'createDate', width: 150, pipe: 'date: yyyy-MM-dd HH:mm'},
        {title: '创建人', field: 'createrName', width: 70}
      ]
    };

    this.getList();
  }

}
