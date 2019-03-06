import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../../layout/ufast-table/ufast-table.component';
import { ContractClauseListService, ContractClauseListServiceNs } from '../../../../../core/trans/purchase/contract-clause-list.service';

@Component({
  selector: 'app-detail-clause',
  templateUrl: './detail-clause.component.html',
  styleUrls: ['./detail-clause.component.scss']
})
export class DetailClauseComponent implements OnInit {
  @Input() detailId: string;
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  clauseInfo: ContractClauseListServiceNs.ClauseListData;
  public clauseDetailConfig: {
    name: string;
    field: string;
    pipe?: string;
    isFullSpan?: boolean;
  }[] = [];
  public clauseItemList: { clauseItemIndex: number; clauseItem: string; }[] = [];
  public clauseDataMap = ContractClauseListServiceNs.clauseDataMap;
  public clauseItemTableConfig: UfastTableNs.TableConfig;

  constructor(private messageService: ShowMessageService,
    private clauseListService: ContractClauseListService) {
      this.clauseInfo = {};
     }

  public getClauseDetail() {
    this.clauseListService.getClauseItem(this.detailId).subscribe((resData: ContractClauseListServiceNs.UfastHttpResT<any>) => {
      this.clauseInfo = resData.value;
      this.clauseItemList = resData.value.details;
      if (!this.clauseInfo.useType) {
        return;
      }
      if (this.clauseInfo.useType === ContractClauseListServiceNs.ClauseType.Contract) {
        this.clauseDetailConfig.splice(3, 1);
      }
    });

  }
  public emitPage() {
    this.backToMainPage.emit(false);
  }
  ngOnInit() {
    this.clauseDetailConfig = [
      { name: '类型', field: 'useType', pipe: 'clauseType' },
      { name: '编码', field: 'clauseNo' },
      { name: '序号', field: 'seq' },
      { name: '采购方式', field: 'purchaseMethod', pipe: 'purchaseWay' },
      { name: '条内容', field: 'content', isFullSpan: true },
    ];
    this.clauseItemTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '序号', field: 'seq', width: 100 },
        { title: '款内容', field: 'content', width: 400 },
      ]
    };
    this.getClauseDetail();
  }

}
