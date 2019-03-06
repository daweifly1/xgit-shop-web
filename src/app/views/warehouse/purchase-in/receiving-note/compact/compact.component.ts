import { Component, EventEmitter, OnInit, TemplateRef, ViewChild, Input, Output } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { ReceivingNoteService, ReceivingNoteServiceNs } from '../../../../../core/trans/receiving-note.service';
import { UfastUtilService } from '../../../../../core/infra/ufast-util.service';
import { DispatchBillService, DispatchBillServiceNs } from '../../../../../core/trans/dispatch-bill.service';
import {environment} from '../../../../../../environments/environment';
enum ContractType {
  Purchase = 1,         // 采购订单
  Protocol = 2          // 年度协议
}
enum TabPageType {
  ContractPage,
  OrderPage
}
// 合同列表查询字段
interface ContractFiltersType {
  contractType?: string;
  purchaseNo?: string;
  goodsReceivor?: string;
  startContractDate?: string;
  endContractDate?: string;
  vendorName?: string;
}
interface ContractListType {
  id: number;
  type: string;
}

@Component({
  selector: 'app-compact',
  templateUrl: './compact.component.html',
  styleUrls: ['./compact.component.scss']
})
export class CompactComponent implements OnInit {

  tabPageType = TabPageType;
  currentPageType: number;
  contractTableConfig: UfastTableNs.TableConfig;
  contractList: ReceivingNoteServiceNs.ContractList[];
  contractFilters: any; // 就在Ts里定义，合同列表查询
  inputMaxLength = 100;

  @ViewChild('deliverTpl') deliverTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;

  contractTypeList: ContractListType[];
  advancedSearchShow: boolean;

  contractType: number;
  contractNo: string;
  searchInputLen = environment.otherData.searchInputMaxLen;
  constructor(private receivingNoteService: ReceivingNoteService,
    private messageService: ShowMessageService,
    private ufastUtilService: UfastUtilService,
    private dispatchBillService: DispatchBillService) {
    this.currentPageType = this.tabPageType.ContractPage;
    this.finish = new EventEmitter<any>();
    this.contractTypeList = [
      { id: 1, type: '采购订单' },
      { id: 2, type: '年度协议' }
    ];
    this.contractFilters = {};
    this.advancedSearchShow = false;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.contractFilters.endContractDate) {
      return false;
    }
    return startDate.getTime() > this.contractFilters.endContractDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.contractFilters.startContractDate) {
      return false;
    }
    return endDate.getTime() <= this.contractFilters.startContractDate.getTime();
  }
  public addDispatch(poHeaderId: string, contractType: number) {
    this.contractType = contractType;
    this.contractNo = poHeaderId;
    this.currentPageType = this.tabPageType.OrderPage;
  }
  getContractList = (pageNum?: number, pageSize?: number) => {
    Object.keys(this.contractFilters).filter(item => typeof this.contractFilters[item] === 'string').forEach((key: string) => {
      this.contractFilters[key] = this.contractFilters[key].trim();
    });
    this.contractFilters.startContractDate = this.contractFilters.startContractDate ?
    this.ufastUtilService.getStartDate(this.contractFilters.startContractDate) : undefined;
  this.contractFilters.endContractDate = this.contractFilters.endContractDate ?
    this.ufastUtilService.getEndDate(this.contractFilters.endContractDate) : undefined;
    const filter = {
      pageNum: this.contractTableConfig.pageNum || pageNum,
      pageSize: this.contractTableConfig.pageSize || pageSize,
      filters: this.contractFilters
    };
    this.contractTableConfig.loading = true;
    this.receivingNoteService.getContractList(filter).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.contractTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.contractList = resData.value.list;
      this.contractTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.contractTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public advancedSearchReset() {
    this.contractFilters = {};
    this.getContractList();
  }
  public toggleAdvancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public onChildFinish(exit: boolean) {
    if (exit) {
      this.emitFinish();
    } else {
      this.currentPageType = this.tabPageType.ContractPage;
    }
  }
  public emitFinish() {
    this.finish.emit();
  }
  ngOnInit() {
    this.contractTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 100, fixed: true },
        { title: '合同编号', field: 'purchaseNo', width: 200, fixed: true },
        { title: '发货状态', field: '', width: 100, pipe: 'deliverGoodsStatus' },
        { title: '合同类型', field: 'contractType', width: 150, pipe: 'contractType' },
        { title: '签约日期', field: 'contractDate', width: 150 },
        // { title: '交货日期', field: 'validDate', width: 150 },
        { title: '创建日期', field: 'contractDateTime', width: 150, pipe: 'date:yyyy-MM-dd HH:mm:ss' },
        { title: '供应商', field: 'vendorName', width: 200 },
        { title: '业务实体', field: 'name', width: 180 },
        { title: '收货方', field: 'shipToName', width: 180 },
        { title: '收单方', field: 'billReceivor', width: 180 }
      ]
    };
    // this.isVendor();
  }

}
