import { ActionCode } from './../../../../environments/actionCode';
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {environment} from '../../../../environments/environment';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
interface ActionStatus {
  download: boolean;
  del: boolean;
}
@Component({
  selector: 'app-review-file',
  templateUrl: './review-file.component.html',
  styleUrls: ['./review-file.component.scss']
})
export class ReviewFileComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('affixTpl') affixTpl: TemplateRef<any>;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  filters: any;
  advancedSearchShow: boolean;
  actionStatus: {[index: string]: ActionStatus};
  downloadUrl: string;
  ActionCode = ActionCode;
  constructor(private messageService: ShowMessageService, private supplierManageService: SupplierManageService,
              private utilService: UfastUtilService) {
    this.dataList = [];
    this.filters = {};
    this.advancedSearchShow = false;
    this.actionStatus = {};
    this.downloadUrl = environment.otherData.fileServiceUrl;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getList();
  }
  public advancedSearchBtn() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.importTimeEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.importTimeEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.importTimeStart) {
      return false;
    }
    return endDate.getTime() <= this.filters.importTimeStart.getTime();
  }
  getList = () => {
    this.filters.importTimeStart =
      this.utilService.getStartDate(this.filters.importTimeStart);
    this.filters.importTimeEnd =
      this.utilService.getEndDate(this.filters.importTimeEnd);
    const filterData = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: this.filters
    };
    this.dataTableConfig.loading = true;
    this.actionStatus = {};
    this.dataList = [];
    this.supplierManageService.getReviewList(filterData).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.dataTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.dataList.forEach((item) => {
        this.actionStatus[item.id] = {
          del: true,
          download: true
        };
      });
      this.dataTableConfig.total = resData.value.total;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
      this.dataTableConfig.loading = false;
    });
  }
  public delFileItem(id: string) {
    this.messageService.showAlertMessage('', '确定要删除吗？', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.supplierManageService.delReviewItem(id).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getList();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  ngOnInit() {
    this.dataTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      id: 'supplier-reviewFile',
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 50},
        {title: '操作人', field: 'createName', width: 80},
        {title: '导入日期', field: 'importTime', width: 100, pipe: 'date:yyyy-MM-dd HH:mm'},
        {title: '类型', field: 'importSource', width: 100},
        {title: '附件', tdTemplate: this.affixTpl, width: 100},
        {title: '备注', field: 'remark', width: 150},
      ]
    };
    this.getList();
  }

}
