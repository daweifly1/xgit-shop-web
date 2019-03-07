import {Component, OnInit} from '@angular/core';
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

  constructor(private goodsCategoryService: GoodsCategoryService, private messageService: ShowMessageService,
              private formBuilder: FormBuilder) {
    this.currentPage = this.tabPageType.ManagePage;
    this.showAdvancedSearch = false;
    this.filters = {};
    this.pageDataList = [];
    this.editData = '';
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
          field: 'productUnit',
          width: 150,
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
        temp['_this'] = temp;
        this.pageDataList.push(temp);
      });
      this.tableConfig.total = resData.value.total;
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
    this.filters = {};
    this.getPageList();
  }

  add() {
    this.editData = '';
    this.currentPage = this.tabPageType.EditPage;
  }

  onChildFinish() {
    return;
  }
}
