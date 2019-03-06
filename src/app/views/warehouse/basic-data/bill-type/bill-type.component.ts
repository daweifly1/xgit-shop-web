import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { Observable } from 'rxjs/Observable';
import { BillTypeService, BillTypeServiceNs } from '../../../../core/trans/billType.service';
import { ActionCode } from '../../../../../environments/actionCode';
interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
}

@Component({
  selector: 'app-bill-type',
  templateUrl: './bill-type.component.html',
  styleUrls: ['./bill-type.component.scss']
})
export class BillTypeComponent implements OnInit {
  tabPageType: TabPageType;
  selectedPage: number;
  tableConfig: UfastTableNs.TableConfig;
  billTypeDataList: any[];
  detailId: string;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('abnormalNo') abnormalNo: TemplateRef<any>;
  ActionCode = ActionCode;

  constructor(private messageService: ShowMessageService,
    private billTypeService: BillTypeService) {
    this.detailId = '';
    this.billTypeDataList = [];
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
    };
    this.selectedPage = this.tabPageType.ManagePage;
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.billTypeDataList.length; i < len; i++) {
      this.billTypeDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.billTypeDataList.every((item) => {
        return item._checked === true;
      });
    }
  }

  getList = () => {
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {}
    };
    this.tableConfig.loading = true;
    this.billTypeService.getBillTypeList(filter).subscribe((resData: BillTypeServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.billTypeDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    this.messageService.showLoading();
    observer.subscribe((resData: BillTypeServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'error');
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  /**删除 */
  public deleteBillType(item: any) {
    item = item.split(',');
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.billTypeService.deleteBillType(item), true);
    });
  }

  /**批量删除 */
  public deleteBatchBillType() {
    const delList = [];
    this.billTypeDataList.forEach((item) => {
      if (item._checked) {
        delList.push(item.id);
      }
    });
    if (!delList.length) {
      this.messageService.showToastMessage('请选择要删除的数据', 'warning');
      return;
    }
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.billTypeService.deleteBillType(delList), true);
    });
  }

  public addWarehouse() {
    this.selectedPage = this.tabPageType.AddPage;
  }

  public editWarehouse(id: string) {
    this.selectedPage = this.tabPageType.EditPage;
    this.detailId = id;
  }

  public onChildFinish() {
    this.getList();
    this.selectedPage = this.tabPageType.ManagePage;
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-billType',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 80 },
      { title: '单据类型', field: 'type', width: 150 },
      // { title: '移动类型', field: 'moveType', width: 150 },
      { title: '是否传ERP', field: 'isSynsap', width: 100, pipe: 'isSynsapErp' },
      { title: '创建人', field: 'createName', width: 100 },
      { title: '创建时间', field: 'createDate', width: 100, pipe: 'date:yyyy-MM-dd HH:mm' }
      ]
    };
    this.getList();
  }


}
