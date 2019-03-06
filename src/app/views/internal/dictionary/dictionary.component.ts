import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { DictionaryService, DictionaryServiceNs } from '../../../core/common-services/dictionary.service';
import { UfastTableNs } from '../../../layout/layout.module';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {ActionCode} from '../../../../environments/actionCode';
enum PageTypeEnum {
  ManagePage,
  AddParamTypePage,
  AddParamPage,
  EditPage,
  DetailPage,
}
@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss']
})
export class DictionaryComponent implements OnInit {
  tabPageType = PageTypeEnum;
  ActionCode = ActionCode;
  currentPage: PageTypeEnum;
  showAdvancedSearch: boolean;
  filters: any;
  dataDictionaryList: any[];
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('parameterTypeTpl') parameterTypeTpl: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  /**
   * 参数类型表单
   */
  // newDictionaryForm: FormGroup;
  /**
   * 修改数据
   */
  editData: any;
  /**
   * 上级参数类型和pId
   */
  paramTypeData: any;

  constructor(private dictionaryService: DictionaryService, private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.currentPage = this.tabPageType.ManagePage; this.showAdvancedSearch = false;
    this.filters = {};
    this.dataDictionaryList = [];
    this.editData = '';
    this.paramTypeData = '';
  }
  getDataDictionaryList = () => {
    this.dataDictionaryList = [];
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.pId = '0';
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.dictionaryService.getdataDictionaryList(filter).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = <any>{};
        temp = item;
        temp['_this'] = temp;
        this.dataDictionaryList.push(temp);
      });
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public advancedSearchClose() {
    this.showAdvancedSearch = false;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getDataDictionaryList();
  }
  public onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getDataDictionaryList();
  }
  public add() {
    this.editData = '';
    this.currentPage = this.tabPageType.AddParamTypePage;
  }
  public addParam(data) {
    this.paramTypeData = data;
    this.editData = '';
    this.currentPage = this.tabPageType.AddParamPage;
  }
  public edit(data) {
    this.currentPage = this.tabPageType.EditPage;
    this.editData = data;
  }
  public detail(data) {
    this.currentPage = this.tabPageType.DetailPage;
    this.paramTypeData = data;
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'internal-dictionary',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{
        title: '操作',
        tdTemplate: this.operationTpl,
        width: 200,
      }, {
        title: '参数类型',
        tdTemplate: this.parameterTypeTpl,
        width: 150,
      }, {
        title: '类型编码',
        field: 'code',
        width: 150,
      }, {
        title: '所属组',
        field: 'groupName',
        width: 150
      }, {
        title: '备注',
        field: 'remark',
        width: 150,
      }
      ]
    };
    this.getDataDictionaryList();
  }

}
