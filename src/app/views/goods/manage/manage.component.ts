import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {FormBuilder} from '@angular/forms';
import {GoodsService} from '../../../core/common-services/goods.service';
import {DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
import {environment} from '../../../../environments/environment';

enum PageTypeEnum {
  ManagePage,
  EditPage,
  DetailPage,
}

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
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

  commonBooleanList: any[];
  // 文件服务地址
  fileServiceUrl: string;

  orderBy: string;

  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('picTpl') picTpl: TemplateRef<any>;

  constructor(private goodsService: GoodsService, private messageService: ShowMessageService,
              private formBuilder: FormBuilder) {
    this.currentPage = this.tabPageType.ManagePage;
    this.showAdvancedSearch = false;
    this.filters = {level: 0};
    this.pageDataList = [];
    this.editData = '';
    this.commonBooleanList = [{label: '否', value: 0}, {label: '是', value: 1}];
    this.fileServiceUrl = environment.otherData.fileServiceUrl; // 文件服务器url
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
          title: '操作',
          tdTemplate: this.operationTpl,
          width: 200,
          fixed: true
        },
        {
          title: '编号',
          field: 'id',
          width: 150,
          fixed: true,
          toSort: true
        },
        {
          title: '商品名称',
          field: 'name',
          width: 200,
          fixed: true
        }, {
          title: '图片',
          tdTemplate: this.picTpl,
          width: 250,
          fixed: true
        }, {
          title: '货号',
          field: 'goodsSn',
          width: 150,
        }, {
          title: '价格',
          field: 'price',
          width: 150,
          pipe: 'currency:CNY'
        }, {
          title: '上架',
          field: 'publishStatus',
          width: 150,
          pipe: 'commonBoolean'
        }, {
          title: '新品',
          field: 'newStatus',
          width: 150,
          pipe: 'commonBoolean'
        }, {
          title: '推荐',
          field: 'recommandStatus',
          width: 150,
          pipe: 'commonBoolean'
        }, {
          title: '审核状态',
          field: 'verifyStatus',
          width: 150,
          pipe: 'commonBoolean'
        }
      ]
    };
    this.getPageList();
  }

  getPageList() {
    this.pageDataList = [];
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters,
      orderBy: this.orderBy
    };
    if (this.tableConfig.loading) {
      return;
    }
    this.tableConfig.loading = true;
    this.goodsService.getPageList(filter).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
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

  public checkTable(event: UfastTableNs.SelectedChange) {
    const sortChange = event.type === UfastTableNs.SelectedChangeType.SortChange ? true : false;
    if (sortChange) {
      this.orderBy = event.orderBy;
      this.getPageList();
    }
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


  onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getPageList();
  }


  editSku(id: any) {

  }

  del(id: any) {

  }

  edit(data) {
    this.goodsService.getItem(data.id).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.editData = resData.value;
      this.currentPage = this.tabPageType.EditPage;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  add() {
    this.editData = {};
    this.currentPage = this.tabPageType.EditPage;
  }
}
