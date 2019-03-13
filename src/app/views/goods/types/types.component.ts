import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {FormBuilder} from '@angular/forms';
import {GoodsCategoryService} from '../../../core/common-services/goods-category.service';


enum PageTypeEnum {
  ManagePage,
  EditPage,
  ChildPage,
  DetailPage,
}

@Component({
  selector: 'app-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss']
})
export class TypesComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  // 过滤参数
  filters: any;
  // 高级搜索
  showAdvancedSearch: boolean;
  // 页面类型
  tabPageType = PageTypeEnum;
  // 当前页
  currentPage: PageTypeEnum;
  // 分页的列表数据
  pageDataList: any[];
  // 编辑的记录
  editData: any;

  // 过滤参数历史
  filtersParentHis: any;

  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;

  constructor(private goodsCategoryService: GoodsCategoryService, private messageService: ShowMessageService,
              private formBuilder: FormBuilder) {
    this.currentPage = this.tabPageType.ManagePage;
    this.showAdvancedSearch = false;
    this.filters = {level: 0};
    this.pageDataList = [];
    this.editData = '';
    this.filtersParentHis = {};
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'shops-types',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        {
          title: '分类编号',
          field: 'id',
          width: 150,
        },
        {
          title: '分类名称',
          field: 'name',
          width: 200,
        }, {
          title: '分类级别',
          field: 'level',
          width: 150,
          pipe: 'goodsCatLevelType'
        }, {
          title: '单位',
          field: 'goodsUnit',
          width: 150,
        }, {
          title: '是否显示',
          field: 'showStatus',
          width: 150,
          pipe: 'commonBoolean',
        },
        {
          title: '操作',
          tdTemplate: this.operationTpl,
          width: 200,
        }
      ]
    };
    this.getPageList();
  }

  // 分页查询
  getPageList() {
    this.pageDataList = [];
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    if (this.tableConfig.loading) {
      return;
    }
    this.tableConfig.loading = true;
    this.goodsCategoryService.getPageList(filter).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = item;
        this.pageDataList.push(temp);
      });
      this.tableConfig.total = resData.value.total;
      // console.log(this.pageDataList);
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  public advancedSearchClose() {
    this.showAdvancedSearch = false;
  }

  public advancedSearchReset() {
    let level: number;
    level = this.filters.level;
    this.filters = {level: level};
    this.getPageList();
  }

  add(level: number, parentId: number, parentName: string) {
    this.editData = {level: level, parentId: parentId, parentName: parentName};
    this.currentPage = this.tabPageType.EditPage;
  }

  onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getPageList();
  }

  edit(data: any, parentName: string) {
    // console.log(data);
    this.editData = data;
    this.editData.parentName = parentName;
    this.editData._this = null;
    // console.log(this.editData);
    this.currentPage = this.tabPageType.EditPage;
  }

  queryChildrenList(id: number, level: number, parentId: number) {
    this.filters = {parentId: id, level: level + 1};
    this.filtersParentHis[level + 1] = parentId;
    this.getPageList();
  }

  // 返回级查询
  backParent() {
    this.filters.parentId = this.filtersParentHis[this.filters.level];
    if (this.filters && this.filters.level > 0) {
      this.filters.level = this.filters.level - 1;
    }
    this.getPageList();
  }
}
