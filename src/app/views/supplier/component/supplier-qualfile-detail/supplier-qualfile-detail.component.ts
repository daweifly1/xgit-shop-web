import {Component, OnInit, TemplateRef, ViewChild, Input} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {SupplierInfoNs} from '../../../../core/trans/supplier-info.service';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-supplier-qualfile-detail',
  templateUrl: './supplier-qualfile-detail.component.html',
  styleUrls: ['./supplier-qualfile-detail.component.scss']
})
export class SupplierQualfileDetailComponent implements OnInit {
  @Input()
  set qualFileList(value: SupplierInfoNs.QualFileItem[]) {
    this.dataList = value;
  }
  @ViewChild('affixTpl') affixTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  downloadUrl: string;
  viewUrl: string;
  viewModalShow: boolean;
  constructor() {
    this.viewModalShow = false;
    this.dataList = [];
    this.downloadUrl = environment.otherData.fileServiceUrl;
  }
  public viewFile(url: string) {
    this.viewUrl = this.downloadUrl + url;
    this.viewModalShow = true;
  }
  public cancelView() {
    this.viewModalShow = false;
  }
  ngOnInit() {
    this.tableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        { title: '证件名称', field: 'credentialName', width: 100},
        { title: '发证机构', field: 'issuingAgency', width: 100},
        { title: '证件类型', field: 'credentialType', width: 100, pipe: 'qualFileType'},
        { title: '有效期起', field: 'validityPeriodStart', width: 100, pipe: 'date:yyyy-MM-dd'},
        { title: '有效期止', field: 'validityPeriodEnd', width: 100, pipe: 'date:yyyy-MM-dd'},
        { title: '附件', tdTemplate: this.affixTpl, width: 100},
        { title: '备注', field: 'remark', width: 100},
      ]
    };
  }

}
