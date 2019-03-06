import { Component, OnInit, Input } from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {SupplierInfoNs} from '../../../../core/trans/supplier-info.service';

@Component({
  selector: 'app-supplier-contact-detail',
  templateUrl: './supplier-contact-detail.component.html',
  styleUrls: ['./supplier-contact-detail.component.scss']
})
export class SupplierContactDetailComponent implements OnInit {
  @Input()
  set contactDataList(value: SupplierInfoNs.SupplierContact[]) {
    this._contactDataList = value || [];
  }
  contactTableConfig: UfastTableNs.TableConfig;
  _contactDataList: SupplierInfoNs.SupplierContact[];
  constructor() {
    this._contactDataList = [];
  }

  ngOnInit() {
    this.contactTableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        { title: '名称', field: 'name', width: 100},
        { title: '职务', field: 'position', width: 100},
        { title: '手机', field: 'cellphone', width: 100},
        { title: '电话', field: 'phone', width: 100},
        { title: '传真', field: 'fax', width: 100},
        { title: '邮箱', field: 'email', width: 100},
        { title: '常用联系人', field: 'isCommonlyUsed', width: 100, pipe: 'commonlyUser'},
        { title: '备注', field: 'remark', width: 100},
      ]
    };
  }

}
