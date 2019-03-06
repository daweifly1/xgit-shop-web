/**
 * 合同不良记录和质量问题处理记录
 * */
import {Component, EventEmitter, Input, OnDestroy, OnInit} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';

@Component({
  selector: 'app-contract-record',
  templateUrl: './contract-record.component.html',
  styleUrls: ['./contract-record.component.scss']
})
export class ContractRecordComponent implements OnInit, OnDestroy {
  @Input() supplierId: string;
  @Input() refresh: EventEmitter<any>;
  @Input() problemType: SupplierInfoNs.ProblemRecordType;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  refreshHandler: any;
  constructor(private supplierInfoService: SupplierInfoService, private messageService: ShowMessageService) {
    this.dataList = [];
  }
  getDataList = () => {
    if (!this.supplierId) {
      return;
    }
    const filters = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: {
        orgId : this.supplierId,
        recordType: this.problemType
      }
    };
    this.supplierInfoService.getProblemRecordList(filters).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list || [];
      this.dataTableConfig.total = resData.value.total;
      this.dataList.forEach((item, index: number) => {
        item['index'] = index + 1;
        item['operateTime'] = item['updateDate'] || item['createDate'];
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this.dataTableConfig = {
      showCheckbox: false,
      showPagination: true,
      total: 0,
      loading: false,
      pageSize: 10,
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      headers: [
        { title: '记录时间', field: 'recordTime', width: 120, pipe: 'date:yyyy-MM-dd'},
        { title: '标题', field: 'title', width: 120},
        { title: '内容', field: 'content', width: 120},
        { title: '处理结果', field: 'handleResult', width: 120},
        { title: '操作人', field: 'createName', width: 120},
        { title: '操作时间', field: 'operateTime', width: 120, pipe: 'date:yyyy-MM-dd HH:mm'}
      ]
    };
    this.getDataList();
    if (this.refresh) {
      this.refreshHandler = this.refresh.subscribe(() => {
        this.getDataList();
      });
    }
  }
  ngOnDestroy() {
    if (this.refreshHandler) {
      this.refreshHandler.unsubscribe();
    }
  }

}
