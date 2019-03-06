import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { FactoryMineService, FactoryMineServiceNs } from '../../../core/trans/factoryMine.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
import {ActionCode} from '../../../../environments/actionCode';

enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage
}
interface ActionStatus {
  edit: boolean;
  del: boolean;
}
@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.scss']
})
export class DivisionComponent implements OnInit {
  PageType = PageTypeEnum;
  selectedPage: PageTypeEnum;
  ActionCode = ActionCode;

  /**
   * 高级搜索条件
   */
  filters: any;

  /**
   * 高级搜索
   */
  fullSearchShow: boolean;

  /**
   * 模板项
   */
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;

  /**
   * 表头数据
   */
  tableConfig: UfastTableNs.TableConfig;
  /**
   * 表数据
   */
  dataList: any;
  /**
   * 编辑详情共用id
   */
  detailId: string;
  /**
   * 操作按钮
   */
  actionStatus: { [index: string]: ActionStatus };


  constructor(private factoryMineService: FactoryMineService, private messageService: ShowMessageService) {
    this.selectedPage = this.PageType.ManagePage;
    this.filters = {};
    this.fullSearchShow = false;
    this.dataList = [];
    this.detailId = '';
  }
  /**
   * 高级搜索显隐
   */
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }
  /**
   * 重置
   */
  public reset() {
    this.filters = {};
    this.getDataList();
  }
  getDataList = () => {
    const data = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.factoryMineService.getDivisionDataList(data).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      this.dataList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      //  this.dataList.forEach((item) => {
      //    this.actionStatus[item.id] = {
      //      edit: true,
      //      del: true
      //    };
      //  });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onChildPageFinish(): void {
    this.selectedPage = this.PageType.ManagePage;
    this.getDataList();
  }
  public add() {
    this.detailId = '';
    this.selectedPage = this.PageType.AddPage;
  }
  public edit(id) {
    this.detailId = id;
    this.selectedPage = this.PageType.EditPage;
  }
  public delete(id) {
    this.messageService.showAlertMessage('', '确定要删除吗', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.tableConfig.loading = true;
      const data = { id: id };
      this.backFn(this.factoryMineService.deleteDivisionData(data));
    });
  }
  public backFn = (service: Observable<FactoryMineServiceNs.UfastHttpAnyResModel>) => {
    this.messageService.showLoading();
    service.subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getDataList();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-division',
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
        { title: '物资大类编码', field: 'id', width: 160 },
        { title: '物资大类', field: 'divisionName', width: 140 },
        { title: '计划员编码', field: 'salesmanId', width: 160 },
        { title: '计划员', field: 'salesmanName', width: 140 },
        { title: '保管员编码', field: 'keeperId', width: 160 },
        { title: '保管员', field: 'keeperName', width: 140 }
      ]
    };
    this.getDataList();
  }

}
