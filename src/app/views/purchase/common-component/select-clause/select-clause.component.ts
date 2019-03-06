import {Component, Injectable, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {ContractClauseListService} from '../../../../core/trans/purchase/contract-clause-list.service';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ApprovalFormNs} from '../../../../core/trans/purchase/approval-form.service';

export namespace SelectClauseNs {
  export interface SelectedData {
    filters: Filters;
    selectedClauseId?: string;
    selectedClauseItemId?: string;
  }
  export enum ClauseType {
    ApprovalForm = 1,
    ConfirmForm,
    Contract
  }
  export interface Filters {
    purchaseWay: ApprovalFormNs.PurchaseWay;  // 采购方式
    type: ClauseType;   // 1、审批表； 2、审定表；3、合同
    clauseTitle?: string;
  }
  export interface ResultData {
    selectedClause: any;
    selectedClauseItem: any;
  }
}

@Injectable()
export class SelectClauseService {
  private filters: SelectClauseNs.Filters;
  private selectedClauseObj = {
    clauseId: '',
    clauseItemId: ''
  };
  private modalSubject: NzModalRef;
  private modalObservable: Observable<SelectClauseNs.ResultData>;
  private modalObserve: Observer<SelectClauseNs.ResultData>;
  constructor(private modalService: NzModalService) { }
  public showClauseModal(data: SelectClauseNs.SelectedData) {
    if (this.modalObservable) {
      return this.modalObservable;
    }
    this.filters = Object.assign({
      clause: data.selectedClauseId || ''
    }, data.filters);
    this.selectedClauseObj.clauseId = data.selectedClauseId || '';
    this.selectedClauseObj.clauseItemId = data.selectedClauseItemId || '';
    this.modalSubject = this.modalService.create({
      nzTitle: '选择条款',
      nzWidth: '700px',
      nzContent: SelectClauseComponent,
      nzFooter: null,
      nzOnCancel: this.closeClauseModal.bind(this)
    });
    this.modalObservable = Observable.create((observer) => {
      this.modalObserve = observer;
    });

    return this.modalObservable;
  }
  public getClauseData() {
    return {
      filters: this.filters,
      selectedObj: this.selectedClauseObj,
    };
  }
  public closeClauseModal() {
    if (!this.modalSubject) {
      return;
    }
    this.modalSubject.destroy('onCancel');
    this.modalSubject = null;
    this.modalObservable = null;
  }
  public _onOk(resData: SelectClauseNs.ResultData) {
    this.modalSubject.destroy('onOk');
    this.modalObserve.next(resData);
    this.modalObserve.complete();
    this.modalSubject = null;
    this.modalObservable = null;
  }
}

@Component({
  selector: 'app-select-clause',
  templateUrl: './select-clause.component.html',
  styleUrls: ['./select-clause.component.scss']
})
export class SelectClauseComponent implements OnInit {
  @ViewChild('clauseItemTpl') clauseItemTpl: TemplateRef<any>;
  @ViewChild('selectItemTpl') selectItemTpl: TemplateRef<any>;
  public clauseList = [];
  public isClauseLoading = false;
  public clauseItemList = [];
  public selected: SelectClauseNs.SelectedData = {
    filters: {purchaseWay: null, type: null, clauseTitle: ''},
    selectedClauseId: '',
    selectedClauseItemId: '',
  };
  private pageIndex = 1;
  private isNeedLoadMore = true;
  private searchText = '';
  public clauseTableConfig: UfastTableNs.TableConfig;
  constructor(private selectService: SelectClauseService,
              private messageService: ShowMessageService,
              private clauseService: ContractClauseListService) {
    const obj = this.selectService.getClauseData();
    this.selected.filters = obj.filters;
    this.selected.selectedClauseId = obj.selectedObj.clauseId || '';
    this.selected.selectedClauseItemId = obj.selectedObj.clauseItemId || '';
  }
  public searchClause(val) {
    this.searchText = val;
    this.pageIndex = 1;
    this.clauseList = [];
    this.isNeedLoadMore = true;
    this.getClauseList('search');
  }
  public getClauseList(type?: string) {
    if (!this.isNeedLoadMore && !type) {
      return;
    }
    const filters = {
      pageSize: 10,
      pageNum: this.pageIndex,
      filters: {
        content: this.searchText,
        purchaseMethod: this.selected.filters.purchaseWay,
        useType: this.selected.filters.type,
        clauseType: 1
      }
    };
    this.pageIndex ++;
    this.isClauseLoading = true;
    this.clauseService.getClauseList(filters).subscribe((resData) => {
      this.isClauseLoading = false;
      if (resData.value.list.length < 10) {
        this.isNeedLoadMore = false;
      }
      resData.value.list.forEach((item) => {
        this.clauseList = [...this.clauseList, item];
      });
    });
  }
  public getClauseItemList = () => {
    if (!this.selected.selectedClauseId) {
      this.messageService.showToastMessage('请选择条内容', 'warning');
      return;
    }
    const filters = {
      pageSize: this.clauseTableConfig.pageSize,
      pageNum: this.clauseTableConfig.pageNum,
      filters: {
        parentId: this.selected.selectedClauseId
      }
    };
    this.clauseService.getClauseList(filters).subscribe((resData) => {
      this.clauseItemList =  [];
      this.clauseTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        const temp = item;
        if (this.selected.selectedClauseItemId === item.id) {
          temp['isChecked'] = true;
        } else {
          temp['isChecked'] = false;
        }
        this.clauseItemList.push(temp);
      });
    });
  }
  public refreshStatus(ev) {
    const index = ev.index;
    const isSelected = ev.type === 0;
    if (!isSelected) {
      this.selected.selectedClauseItemId = '';
      return;
    }
    this.clauseItemList.forEach((item, itemIndex) => {
      if (index === itemIndex) {
        item.isChecked = true;
        this.selected.selectedClauseItemId = item.id;
        return;
      }
      item.isChecked = false;
    });
  }
  public handleClauseSelected(val) {
    this.selected.selectedClauseItemId = '';
    this.getClauseItemList();
  }
  public handleItemSelected(id) {
    this.selected.selectedClauseItemId = id;
    this.onModalOk();
  }
  public onModalCancel() {
    this.selectService.closeClauseModal();
  }
  public onModalOk() {
    if (!this.selected.selectedClauseId) {
      this.messageService.showToastMessage('请选择条内容', 'warning');
      return;
    }
    if (!this.selected.selectedClauseItemId) {
      this.messageService.showToastMessage('请选择款内容', 'warning');
      return;
    }
    const clauseTitleRes = this.clauseList.find((item) => item.id === this.selected.selectedClauseId);
    const clauseItemRes = this.clauseItemList.find((item) => item.id === this.selected.selectedClauseItemId);
    this.selectService._onOk({
      selectedClause: clauseTitleRes,
      selectedClauseItem: clauseItemRes
    });
  }

  ngOnInit() {
    this.clauseTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      checkAll: false,
      checkRowField: 'isChecked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        {title: '操作', tdTemplate: this.selectItemTpl, width: 50},
        {title: '序号', field: 'seq', width: 50},
        {title: '款内容', tdTemplate: this.clauseItemTpl, width: 300},
      ]
    };
    this.getClauseList();
    if (this.selected.selectedClauseId) {
      this.getClauseItemList();
    }
  }

}
