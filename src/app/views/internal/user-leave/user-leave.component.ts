import { ActionCode } from './../../../../environments/actionCode';
import { UfastUtilService } from './../../../core/infra/ufast-util.service';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UserLeaveService, UserLeaveServiceNs } from './../../../core/trans/internal/user-leave.service';
import { ShowMessageService } from './../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../layout/layout.module';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage
}
@Component({
  selector: 'app-user-leave',
  templateUrl: './user-leave.component.html',
  styleUrls: ['./user-leave.component.scss']
})
export class UserLeaveComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  userLeaveList: any[];
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  filters: any;
  showAdvancedSearch: boolean;
  detailId: string;
  ActionCode = ActionCode;

  constructor(
    private userLeaveService: UserLeaveService,
    private messageService: ShowMessageService,
    private ufastUtilService: UfastUtilService) {
    this.currentPage = this.tabPageType.ManagePage;
    this.userLeaveList = [];
    this.filters = {};
    this.showAdvancedSearch = false;
    this.detailId = '';
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.endTime) {
      return false;
    }
    return startDate.getTime() > this.filters.endTime.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.startTime) {
      return false;
    }
    return endDate.getTime() <= this.filters.startTime.getTime();
  }
  public getUserLeaveList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    if (this.filters.endTime) {
      this.filters.endTime = this.ufastUtilService.getEndDate(this.filters.endTime);
    }
    if (this.filters.startTime) {
      this.filters.startTime = this.ufastUtilService.getStartDate(this.filters.startTime);
    }
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.userLeaveService.getUserLeaveList(filter).subscribe((resData) => {
      this.userLeaveList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    });
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public reset() {
    this.filters = {};
    this.getUserLeaveList();
  }
  public addUserLeave() {
    this.detailId = '';
    this.currentPage = this.tabPageType.AddPage;
  }
  public editUserLeave(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getUserLeaveList();
  }

  public deleteUserLeave(id) {
    const deleteparam = <any>{id: id};
    let deleteHandle = <any>{};
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }

      deleteHandle = this.userLeaveService.deleteUserLeave(deleteparam);
      deleteHandle.subscribe((resData) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.getUserLeaveList();
      });
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'internal-userLeave',
      showCheckbox: false,
      checkAll: false,
      checkRowField: '_checked',
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 100 },
        { title: '代理人名称', field: 'agentName', width: 140 },
        { title: '开始时间', field: 'startTime', width: 140, pipe: 'date:yyyy-MM-dd HH:mm' },
        { title: '结束时间', field: 'endTime', width: 140, pipe: 'date:yyyy-MM-dd HH:mm' },
        { title: '状态', field: 'state', width: 60 , pipe: 'usableStatus'}
      ]
    };
    this.getUserLeaveList();
  }

}
