import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {GoodsAttributeService} from '../../../core/common-services/goods-attribute.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {FormBuilder} from '@angular/forms';
import {DictionaryServiceNs} from '../../../core/common-services/dictionary.service';

enum PageTypeEnum {
  ManagePage,
  EditPage,
  ChildAttrListPage,
  ChildParamListPage,
}

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss']
})
export class AttributeComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  // 过滤参数
  filters: any;
  // 页面类型
  tabPageType = PageTypeEnum;
  // 当前页
  currentPage: PageTypeEnum;
  // 分页的列表数据
  pageDataList: any[];
  // 编辑的记录
  editData: any;
  pageTitle: any;

  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('settingTpl') settingTpl: TemplateRef<any>;

  constructor(private  goodsAttributeService: GoodsAttributeService, private messageService: ShowMessageService,
              private formBuilder: FormBuilder) {
    this.currentPage = this.tabPageType.ManagePage;
    this.filters = {level: 0};
    this.pageDataList = [];
    this.editData = '';
    this.pageTitle = '商品类型';
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'shops-attr-cat',
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
        },
        {
          title: '编号',
          field: 'id',
          width: 150,
        },
        {
          title: '类型名称',
          field: 'name',
          width: 200,
        }, {
          title: '属性数量',
          field: 'attributeCount',
          width: 150,
        }, {
          title: '参数数量',
          field: 'paramCount',
          width: 150,
        }, {
          title: '设置',
          tdTemplate: this.settingTpl,
          width: 200,
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
      filters: this.filters
    };
    if (this.tableConfig.loading) {
      return;
    }
    this.tableConfig.loading = true;
    this.goodsAttributeService.getPageList(filter).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
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

  add() {
    this.editData = {};
    this.currentPage = this.tabPageType.EditPage;
  }

  onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getPageList();
  }

  edit(data: any) {
    this.editData = {id: data.id, name: data.name};
    this.currentPage = this.tabPageType.EditPage;
  }

  del(id: any) {

  }

  showAttrList(data: any, title: string) {
    this.pageTitle = title;
    this.editData = {id: data.id, name: data.name, type: 0};
    console.log(this.editData);
    this.currentPage = this.tabPageType.ChildAttrListPage;
  }

  showParamList(data: any) {
    this.editData = {id: data.id, name: data.name, type: 1};
    console.log(this.editData);
    this.currentPage = this.tabPageType.ChildParamListPage;
  }

  submit() {
    if (!this.editData.name) {
      return;
    }
    let submit = null;
    if (this.editData) {
      submit = this.goodsAttributeService.save(this.editData);
    }

    this.messageService.showLoading();
    submit.subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.getPageList();
      this.finish();
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  finish() {
    this.pageTitle = '商品类型';
    this.currentPage = this.tabPageType.ManagePage;
  }
}
