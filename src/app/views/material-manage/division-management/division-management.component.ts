import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { MaterialManageService, MaterialManageServiceNs } from '../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
import { MaterialDivisionManagementService } from '../../../core/trans/material/MaterialDivisionManagementService';
import { MaterialDivisionManagementVO } from '../../../core/vo/material/MaterialDivisionManagementVO';
import { SearchCommonVO } from '../../../core/vo/comm/SearchCommonVO';
import { ActionCode } from '../../../../environments/actionCode';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage,
  DetailPage
}

@Component({
  selector: 'app-division-management',
  templateUrl: './division-management.component.html',
  styleUrls: ['./division-management.component.scss']
})
export class DivisionManagementComponent implements OnInit {
  /**
   * 数据列表
   */
  dataList: MaterialDivisionManagementVO[];

  /**
   * 数据详情
   */
  dataItem: MaterialDivisionManagementVO;

  /**
   * 给页面使用页面类型的枚举
   */
  PageTypeEnum = PageTypeEnum;

  /**
   * 当前所属的页面类型
   */
  selectedPage: PageTypeEnum;

  /**
   * 是否高级搜索
   */
  fullSearchShow: boolean;

  /**
   * 默认搜索框展示的搜索项名称
   */
  searchPlaceholder: string;

  /**
   * 高级搜索的过滤条件
   */
  filters: MaterialDivisionManagementVO;

  /**
   * 页面操作栏的模板项
   */
  @ViewChild('operation') operationTpl: TemplateRef<any>;

  /**
   * dataTable表头及数据源的配置
   */
  tableConfig: UfastTableNs.TableConfig;

  /**
   * 权限
   */
  ActionCode = ActionCode;
  constructor(private divisionManagementService: MaterialDivisionManagementService, private messageService: ShowMessageService) {
    this.filters = new MaterialDivisionManagementVO();
    this.selectedPage = PageTypeEnum.ManagePage;
    this.searchPlaceholder = '分工管理';
    this.fullSearchShow = false;
  }

  /**
   * 开启、关闭高级搜索
   */
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }

  /**
   * 切换新增页面
   * @param {string} pid
   */
  public toAddPage(): void {
    this.dataItem = undefined;
    this.selectedPage = PageTypeEnum.AddPage;
  }

  /**
   * 切换管理列表页面
   */
  public backToList(): void {
    this.getDataList();
    this.selectedPage = PageTypeEnum.ManagePage;
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.dataList.length; i < len; i++) {
      this.dataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.dataList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }

  public update(id: string): void {
    const itemTemp = this.dataList.filter((item) => {
      return item.id === id;
    });
    this.selectedPage = PageTypeEnum.AddPage;
    this.dataItem = itemTemp[0];
  }

  public delItem(id: string): void {
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm')
      .afterClose.subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        const filter: MaterialDivisionManagementVO = new MaterialDivisionManagementVO();
        filter.id = id;
        const service = this.divisionManagementService.delete(filter);
        this.tableConfig.loading = true;
        this.backFn(service);
      });
  }

  public reset() {
    this.filters = {};
    this.getDataList();
  }

  public onSearch() {
    this.getDataList();
  }

  getDataList = () => {
    const condition: SearchCommonVO<MaterialDivisionManagementVO> = new SearchCommonVO<MaterialDivisionManagementVO>();
    const filters: MaterialDivisionManagementVO = new MaterialDivisionManagementVO();
    filters.divisionName = this.filters.divisionName;
    filters.salesmanId = this.filters.salesmanId;

    condition.pageNum = this.tableConfig.pageNum;
    condition.pageSize = this.tableConfig.pageSize;
    condition.filters = filters;
    this.tableConfig.checkAll = false;
    this.tableConfig.loading = true;
    this.divisionManagementService.list(condition)
      .subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
        this.tableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.dataList = resData.value.list;
        this.tableConfig.total = resData.value.total;
      }, (error) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }

  public backFn = (service: Observable<MaterialManageServiceNs.UfastHttpAnyResModel>) => {
    this.messageService.showLoading();
    service.subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.getDataList();
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-divisionManagement',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 80, fixed: true },
        { title: '序号', field: 'id', width: 150 },
        { title: '分工管理', field: 'divisionName', width: 150 },
        { title: '业务员', field: 'salesmanName', width: 150 }
      ]
    };
    this.getDataList();
  }

}
