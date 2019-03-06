import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {MaterialManageService, MaterialManageServiceNs} from '../../../core/trans/materialManage.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';

import {Observable} from 'rxjs/Observable';
import {ActionCode} from '../../../../environments/actionCode';
import { Action } from 'rxjs/scheduler/Action';
interface FilterItem {
  materialCalssName?: string;
  materialType?: string;
  pId?: string;
}

enum TabPageType {
  ManagePage,
  AddPage,
  EditPage,
  DetailPage
}

interface ButtonState {
  edit: boolean;
  add: boolean;
  view: boolean;
  start: boolean;
  forbidden: boolean;
  del: boolean;
}

@Component({
  selector: 'app-material-class',
  templateUrl: './material-class.component.html',
  styleUrls: ['./material-class.component.scss']
})
export class MaterialClassComponent implements OnInit {
  tabPageType: TabPageType;
  selectedPage: TabPageType;
  fullSearchShow: boolean;
  searchPlaceholder: string;
  filters: FilterItem;
  dataList: MaterialManageServiceNs.MaterialClassModel[];
  dataItem: MaterialManageServiceNs.MaterialClassModel;
  pId: string;

  @ViewChild('operation') operationTpl: TemplateRef<any>;

  tableConfig: UfastTableNs.TableConfig;
  viewChildFlag: boolean;
  cacheFilters: any[];
  materialType: string;  // 上级物料类别
  categoryParent: string; // 上级物料分类

  buttonState: {[index: string]: ButtonState};
  ActionCode = ActionCode;
  level: number;    // 当前物料级别
  constructor(private materialManageService: MaterialManageService, private messageService: ShowMessageService) {
    this.cacheFilters = [];

    this.viewChildFlag = true;
    this.filters = {
      pId: '0'
    };
    this.selectedPage = TabPageType.ManagePage;
    this.searchPlaceholder = '分类名称';
    this.fullSearchShow = false;
    this.pId = '0';
    this.materialType = null;

    this.buttonState = {};
    this.level = 1;
  }


  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }

  public toAddPage(pid = '0', materialType?: string, level?: number): void {
    this.dataItem = undefined;
    this.pId = pid;
    this.materialType = materialType;
    this.selectedPage = TabPageType.AddPage;
    // this.level = 1;
    this.level = level || 1;
  }

  public backToList(): void {
    this.getDataList();
    this.selectedPage = TabPageType.ManagePage;
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
      this.tableConfig.checkAll = this.dataList.every((item) => {
        return item._checked === true;
      });
    }
  }

  public update(id: string): void {
    if (!this.buttonState[id].edit) {
      return;
    }
    const itemTemp = this.dataList.filter((item) => {
      return item.id === id;
    });
    this.selectedPage = TabPageType.AddPage;
    this.dataItem = itemTemp[0];
  }


  public batchDel(): void {
    let ids: any;
    ids = this.dataList.filter((item) => {
      return item._checked;
    }).map((item) => {
      return item;
    });

    if (ids.length < 1) {
      this.messageService.showToastMessage('请选择数据', 'warning');
      return;
    }
    let flag: boolean;
    flag = false;
    ids.forEach((item) => {
      if (item.isDel) {
        flag = true;
        return;
      }
    });
    if (flag) {
      this.messageService.showToastMessage('请选择有效数据', 'warning');
      return;
    }
    this.messageService.showAlertMessage('', '确定要禁用吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.tableConfig.loading = true;
      let data: string[];
      data = ids.filter((item) => {
        return item._checked;
      }).map((item) => {
        return item.id;
      });
      this.backFn(this.materialManageService.delBatchMaterialClass({ids: data}));
    });
  }
  public startItem(id: string) {
    this.messageService.showAlertMessage('', '确定要启用吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const data = {
        id
      };
      this.commonResDeal(this.materialManageService.startMaterialClass(data), true);
    });
  }
  public forbiddenItem(id: string) {
    this.messageService.showAlertMessage('', '确定要禁用吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const data = {
        id
      };
      this.commonResDeal(this.materialManageService.forbiddenMaterialClass(data), true);
    });
  }
  public startBatch() {
    let ids: any;
    ids = this.dataList.filter((item) => {
      return item._checked;
    }).map((item) => {
      return item;
    });
    if (ids.length < 1) {
      this.messageService.showToastMessage('请选择数据', 'warning');
      return;
    }
    let flag: boolean;
    flag = false;
    ids.forEach((item) => {
      if (!item.isDel) {
        flag = true;
        return;
      }
    });
    if (flag) {
      this.messageService.showToastMessage('请选择失效的数据', 'warning');
      return;
    }
    this.messageService.showAlertMessage('', '确定要启用吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.tableConfig.loading = true;
      let data: string[];
      data = ids.filter((item) => {
        return item._checked;
      }).map((item) => {
        return item.id;
      });
      this.backFn(this.materialManageService.startBatchMaterialClass({ids: data}));
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    this.messageService.showLoading();
    observer.subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
        if (resData.code === 0) {
            this.messageService.showToastMessage('操作成功', 'success');
            if (refresh) {
                this.getDataList();
            }
        } else {
            this.messageService.showToastMessage(resData.message, 'warning');
        }
    }, (error: any) => {
      this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
    });
}

  public reset() {
    this.filters = {
      pId: '0'
    };
    this.getDataList();
  }

  public addChildClass(id: string, materialType: string, materialClassName: string, level?: number): void {
    if (!this.buttonState[id].add) {
      return;
    }
    this.pId = id;
    this.materialType = materialType;
    this.categoryParent = materialClassName;
    this.level = ++ level;
    this.toAddPage(id, materialType, this.level);
  }

  public backUpperLeavel(): void {
    this.filters = this.cacheFilters.pop();
    this.viewChildFlag = false;
    this.getDataList();
  }

  public viewChildren(id: string) {
    if (!this.buttonState[id].view) {
      return;
    }
    this.pId = id;
    this.viewChildFlag = true;
    this.cacheFilters.push(Object.assign({}, this.filters));
    this.filters = {pId: id};
    this.getDataList();
  }

  public onSearch() {
    this.cacheFilters = [];
    this.viewChildFlag = false;
    this.filters.pId = undefined;
    const validLen = Object.keys(this.filters).filter(key => this.filters[key]).length;
    if (validLen === 0) {
      this.filters.pId = '0';
    }
    this.getDataList();
  }

 getDataList = () => {
    this.tableConfig.checkAll = false;
    this.tableConfig.loading = true;
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
  });
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.materialManageService.getMaterialClassList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.dataList = [];
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.dataList.forEach((item) => {
        this.buttonState[item.id] = {
          edit: item.isDel !== true,
          add: item.isDel === false && item.level !== 3,
          view: item.childCount !== 0,
          start: item.isDel,
          forbidden: !item.isDel,
          del: item.isDel === false
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public backFn = (service: Observable<MaterialManageServiceNs.UfastHttpAnyResModel>) => {
    service.subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.getDataList();
      this.messageService.showToastMessage('操作成功', 'success');
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-materialClass',
      checkAll: false,
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{title: '操作', tdTemplate: this.operationTpl, width: 180, fixed: true},
        {title: '分类名称', field: 'materialCalssName', width: 150},
        {title: '物料类别', field: 'materialType', width: 140, pipe: 'materialTemplateType'},
        {title: '描述', field: 'materialClassDesc', width: 100},
        {title: '状态', field: 'isDel', pipe: 'materialClassStatus', width: 100},
        {title: '物料级别', field: 'level', pipe: 'materialClassLevel', width: 100}
      ]
    };
    this.getDataList();
  }

}
