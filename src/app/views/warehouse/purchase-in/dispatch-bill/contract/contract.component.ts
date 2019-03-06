import { Component, EventEmitter, OnInit, TemplateRef, ViewChild, Input, Output } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import {
  DispatchBillService,
  DispatchBillServiceNs
} from '../../../../../core/trans/dispatch-bill.service';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
import {environment} from '../../../../../../environments/environment';
enum TabPageType {
  ContractPage,
  OrderPage
}
// 合同列表查询字段
interface ContractFiltersType {
  contractType?: string;
  purchaseNo?: string;
  goodsReceivor?: string;
  startDate?: string;
  endDate?: string;
}

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent implements OnInit {

  tabPageType = TabPageType;
  currentPageType: number;
  contractTableConfig: UfastTableNs.TableConfig;
  contractList: DispatchBillServiceNs.ContractItemModel[];
  contractFilters: any; // 就在Ts里定义，合同列表查询
  inputMaxLength = 100;

  @ViewChild('deliverTpl') deliverTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;

  contractTypeList: DispatchBillServiceNs.ContractType[]; // 在服务里定义数据模型，得到合同类型
  goodsReceivor: DispatchBillServiceNs.GoodsReceivor[]; // 收货方下拉框数据   可能不要
  advancedSearchShow: boolean;

  contractType: number;
  contractNo: string;
  searchInputLen = environment.otherData.searchInputMaxLen;
  contractInfo: any;
  constructor(private dispatchBillService: DispatchBillService,
    private messageService: ShowMessageService,
    private ufastUtilService: UfastUtilService) {
    this.currentPageType = this.tabPageType.ContractPage;
    this.finish = new EventEmitter<any>();
    this.contractTypeList = [
      {id: 1, type: '采购订单' },
      {id: 2, type: '年度协议'}
      ];
    this.goodsReceivor = [];
    this.contractFilters = {};
    this.advancedSearchShow = false;
    this.contractInfo = {};
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
  public addDispatch(no: string, type: number, fullName: string) {
    this.contractType = type;
    this.contractNo = no;
    this.contractInfo = {
      contractType: type,
      contractNo: no,
      fullName: fullName
    };
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
    this.dispatchBillService.getContractList(filter).subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
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
        { title: '创建日期', field: 'contractDateTime', width: 150, pipe: 'date:yyyy-MM-dd HH:mm:ss' },
        { title: '业务实体', field: 'name', width: 180 },
        { title: '供应商', field: 'vendorName', width: 180},
        { title: '收货方', field: 'shipToName', width: 180 },
        { title: '收单方', field: 'billReceivor', width: 180 }
      ]
    };
    // this.isVendor();
  }

}
