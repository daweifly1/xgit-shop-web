import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter, Input } from '@angular/core';
import { DictionaryService, DictionaryServiceNs } from '../../../../core/common-services/dictionary.service';
import { UfastTableNs } from '../../../../layout/layout.module';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {ActionCode} from '../../../../../environments/actionCode';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage
}
@Component({
  selector: 'app-param',
  templateUrl: './param.component.html',
  styleUrls: ['./param.component.scss']
})
export class ParamComponent implements OnInit {
  tabPageType = PageTypeEnum;
  ActionCode = ActionCode;
  currentPage: PageTypeEnum;
  showAdvancedSearch: boolean;
  filters: any;
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  @Input() paramTypeData: any;
  /**
   * 列表数据
   */
  paramList: any[];
  /**
   * 修改
   */
  editData: any;
  constructor(private dictionaryService: DictionaryService, private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.currentPage = this.tabPageType.ManagePage; this.showAdvancedSearch = false;
    this.filters = {};
    this.paramList = [];
    this.finish = new EventEmitter();
    this.editData = '';
  }
  getParamList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.paramList = [];
    this.filters.pId = this.paramTypeData.id;
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
        this.paramList.push(temp);
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
    this.getParamList();
  }
  public onChildFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getParamList();
  }
  public add() {
    this.editData = '';
    this.currentPage = this.tabPageType.AddPage;
  }
  public edit(data) {
    this.currentPage = this.tabPageType.EditPage;
    this.editData = data;
  }
  public emitFinish() {
    this.finish.emit();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'internal-param',
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
        title: '参数名称',
        field: 'name',
        width: 150,
      }, {
        title: '参数编码',
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
    this.getParamList();
  }

}
