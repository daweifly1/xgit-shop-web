import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {GoodsAttributeService} from '../../../../core/common-services/goods-attribute.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {FormBuilder} from '@angular/forms';
import {DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';

enum PageTypeEnum {
  ManagePage,
  EditPage,
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @Input() productAttributeCategory: any;
  @Output() finish: EventEmitter<any>;

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

  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;


  constructor(private  goodsAttributeService: GoodsAttributeService, private messageService: ShowMessageService,
              private formBuilder: FormBuilder) {
    this.finish = new EventEmitter();
    this.currentPage = this.tabPageType.ManagePage;
    this.pageDataList = [];
    this.editData = '';
  }


  ngOnInit() {
    if (this.productAttributeCategory && this.productAttributeCategory.id) {
      this.filters = {productAttributeCategoryId: this.productAttributeCategory.id};
    }

    this.tableConfig = {
      id: 'shops-attr-list',
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
          width: 100,
        },
        {
          title: '编号',
          field: 'id',
          width: 100,
        },
        {
          title: '属性名称',
          field: 'name',
          width: 100,
        }, {
          title: '商品类型',
          field: 'productAttributeCategoryName',
          width: 100,
        }, {
          title: '属性是否可选',
          field: 'selectType',
          width: 150,
          pipe: 'attrSelectType',
        }, {
          title: '属性值的录入方式',
          field: 'inputType',
          width: 150,
          pipe: 'attrInputType',
        }, {
          title: '可选值列表',
          field: 'inputList',
          width: 150,
        }, {
          title: '排序',
          field: 'sort',
          width: 50,
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
    this.filters.type = 0;
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    if (this.tableConfig.loading) {
      return;
    }
    this.tableConfig.loading = true;
    this.goodsAttributeService.getAttrPageList(filter).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        if (this.productAttributeCategory) {
          temp.productAttributeCategoryName = this.productAttributeCategory.name;
        }
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

  back() {
    this.finish.emit();
  }

  add() {
    this.editData = {productAttributeCategoryId: this.productAttributeCategory.id};
    this.currentPage = this.tabPageType.EditPage;
  }

  edit(data) {
    this.editData = data;
    this.editData._this = null;
    this.currentPage = this.tabPageType.EditPage;
  }

  del(id: any) {
    let submit = null;
    if (this.editData) {
      submit = this.goodsAttributeService.deleteAttr([id]);
    }
    this.messageService.showLoading();
    submit.subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getPageList();
      this.cancel();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  submit() {
    let submit = null;
    if (this.editData) {
      submit = this.goodsAttributeService.saveAttr(this.editData);
    }
    this.messageService.showLoading();
    submit.subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getPageList();
      this.cancel();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  cancel() {
    this.editData = {productAttributeCategoryId: this.productAttributeCategory.id};
    this.currentPage = this.tabPageType.ManagePage;
  }
}
