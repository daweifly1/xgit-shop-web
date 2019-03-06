import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';

@Component({
  selector: 'app-supplier-grade-info',
  templateUrl: './supplier-grade-info.component.html',
  styleUrls: ['./supplier-grade-info.component.scss']
})
export class SupplierGradeInfoComponent implements OnInit, OnDestroy {
  @Input() supplierId: string;
  @Input() gradeInfoList: any[];
  @Input() refresh: EventEmitter<any>;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  refreshHandler: any;
  constructor(private supplierInfoService: SupplierInfoService, private messageService: ShowMessageService) {
    this.dataList = [];
  }
  private getList() {
    if (!this.supplierId) {
      return;
    }
    const filters = {
      pageSize: 0,
      pageNum: 0,
      filters: {
        orgId: this.supplierId
      }
    };
    this.supplierInfoService.getGradeInfoList(filters).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list || [];
      this.dataList.forEach((item, index: number) => {
        item['index'] = index + 1;
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this.dataTableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        { title: '序号', field: 'index', width: 50},
        { title: '年份', field: 'year', width: 120},
        { title: '等级', field: 'grade', width: 120},
        { title: '备注', field: 'remark', width: 120},
      ]
    };
    this.getList();
    if (this.refresh) {
      this.refreshHandler = this.refresh.subscribe(() => {
        this.getList();
      });
    }
  }
  ngOnDestroy() {
    if (this.refreshHandler) {
      this.refreshHandler.unsubscribe();
    }
  }
}
