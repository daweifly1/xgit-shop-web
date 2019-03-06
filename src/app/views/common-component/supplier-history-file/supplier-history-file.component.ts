import {Component, EventEmitter, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-supplier-history-file',
  templateUrl: './supplier-history-file.component.html',
  styleUrls: ['./supplier-history-file.component.scss']
})
export class SupplierHistoryFileComponent implements OnInit, OnDestroy {
  @Input() supplierId: string;
  @Input() refresh: EventEmitter<any>;
  @ViewChild('affixTpl') affixTpl: TemplateRef<any>;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  refreshHandler: any;
  downloadUrl: string;
  viewFileModalShow: boolean;
  viewFileUrl: string;
  constructor(private supplierInfoService: SupplierInfoService, private messageService: ShowMessageService) {
    this.dataList = [];
    this.downloadUrl = environment.otherData.fileServiceUrl;
  }
  public cancelViewFile() {
    this.viewFileModalShow = false;
  }
  public viewFile(url: string) {
    this.viewFileModalShow = true;
    this.viewFileUrl = this.downloadUrl + url;
  }
  getList = () => {
    if (!this.supplierId) {
      return;
    }
    const filters = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: {
        supplierId: this.supplierId
      }
    };
    this.supplierInfoService.getHistoryList(filters).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list || [];
      this.dataTableConfig.total = resData.value.total;
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
      showPagination: true,
      total: 0,
      loading: false,
      pageSize: 10,
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      headers: [
        { title: '序号', field: 'index', width: 50},
        { title: '上传时间', field: 'createDate', width: 120, pipe: 'date:yyyy-MM-dd HH:mm'},
        { title: '证件名称', field: 'credentialName', width: 120},
        { title: '发证机构', field: 'issuingAgency', width: 120},
        { title: '证件类型', field: 'credentialType', width: 120, pipe: 'qualFileType'},
        { title: '有效期起', field: 'validityPeriodStart', width: 120, pipe: 'date:yyyy-MM-dd'},
        { title: '有效期止', field: 'validityPeriodEnd', width: 120, pipe: 'date:yyyy-MM-dd'},
        { title: '附件', tdTemplate: this.affixTpl, width: 120},
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
