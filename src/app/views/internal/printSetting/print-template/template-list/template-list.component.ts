import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { PrintServiceNs, PrintService} from '../../../../../core/trans/print.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {ActionCode} from '../../../../../../environments/actionCode';

export interface TemplateConfigData {
  printDataDictionary: any;
  defaultTemplate: any;
}
interface PageTypeObj {
  Main: number;
  Add: number;
  Edit: number;
}
@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})
export class TemplateListComponent implements OnInit {
  ActionCode = ActionCode;
  @Output() finish: EventEmitter<any>;
  @Input() invoiceData: any;
  @ViewChild('defaultTpl')defaultTpl: TemplateRef<any>;
  @ViewChild('operationTpl')operationTpl: TemplateRef<any>;

  pageTypeObj: PageTypeObj;
  curPageType: number;
  tplTableConfig: UfastTableNs.TableConfig;
  templateList: PrintServiceNs.TemplateItemModel[];
  // templateList: any;
  filterBody: PrintServiceNs.TemplateQuery;
  showFullSearch: boolean;
  editOrAddData: any;
  selectedTplId: string;
  constructor(private printService: PrintService, private message: ShowMessageService) {
    this.finish = new EventEmitter();
    this.pageTypeObj = {
      Main: 0,
      Add: 1,
      Edit: 2
    };
    this.selectedTplId = null;
    this.showFullSearch = false;
    this.curPageType = this.pageTypeObj.Main;
    this.invoiceData = {};
    this.templateList = [];
    this.resetSearch();
  }
  public resetSearch() {
    this.filterBody = {
      CurPage: '1',
      PageSize: '0',
      TemplateType: ''
    };
  }
  public onFullSearch() {
    this.showFullSearch = !this.showFullSearch;
  }
  public onEdit(id: string) {
    this.selectedTplId = id;
    this.editOrAddData = this.invoiceData;
    this.curPageType = this.pageTypeObj.Edit;
  }
  public deleteTpl(id: string) {
    this.tplTableConfig.loading = true;
    this.printService.removeTemplate(id).subscribe((resData: PrintServiceNs.UfastHttpRes) => {
      this.tplTableConfig.loading = false;
      if (resData.code !== 0) {
        this.message.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.message.showToastMessage('操作成功', 'success');
      this.getTemplateList();
    }, (error: any) => {
      this.tplTableConfig.loading = false;
      this.message.showAlertMessage('', error.message, 'error');
    });
  }
  public setDefaultTpl(id: string) {
    this.printService.setDefTemplate(id).subscribe((resData: PrintServiceNs.UfastHttpRes) => {
      this.tplTableConfig.loading = false;
      if (resData.code !== 0) {
        this.message.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.message.showToastMessage('操作成功', 'success');
      this.getTemplateList();
    }, (error: any) => {
      this.tplTableConfig.loading = false;
      this.message.showAlertMessage('', error.message, 'error');
    });
  }
  public onAdd() {
    this.selectedTplId = null;
    this.editOrAddData = this.invoiceData;
    this.curPageType = this.pageTypeObj.Add;
  }
  public onChildFinish () {
    this.curPageType = this.pageTypeObj.Main;
    this.getTemplateList();
  }
  public exitPage() {
    this.finish.emit();
  }
  getTemplateList = () => {
    this.filterBody.TemplateType = this.invoiceData.TemplateType + '';
    this.tplTableConfig.loading = true;
    this.printService.getTemplateList(this.filterBody).subscribe((resData: PrintServiceNs.UfastHttpRes) => {
      this.tplTableConfig.loading = false;
      if (resData.code !== 0) {
        this.message.showAlertMessage('', resData.message, 'error');
      } else {
        this.templateList = resData.value;
      }
    }, (error: any) => {
      this.tplTableConfig.loading = false;
      this.message.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this. tplTableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      id: 'internal-templateList',
      headers: [
        {
          title: '模板名称',
          field: 'templateName',
          width: 300
        }, {
          title: '默认模板',
          width: 100,
          tdTemplate: this.defaultTpl
        }, {
          title: '操作',
          width: 200,
          tdTemplate: this.operationTpl
        }
      ]
    };
    this.getTemplateList();

  }

}
