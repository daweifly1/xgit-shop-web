import { ActionCode } from './../../../../../environments/actionCode';
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {ApprovalFormService, ApprovalFormNs} from '../../../../core/trans/purchase/approval-form.service';
enum LineAuditPageType {
  MainPage,
  DetailPage,
  AuditPage
}
interface ActionStatus {
  approval: boolean;
}
@Component({
  selector: 'app-approval-line-audit',
  templateUrl: './approval-line-audit.component.html',
  styleUrls: ['./approval-line-audit.component.scss']
})
export class ApprovalLineAuditComponent implements OnInit {
  @ViewChild('approvalNoTpl')approvalNoTpl: TemplateRef<any>;
  @ViewChild('operationTpl')operationTpl: TemplateRef<any>;
  PageTypeEnum = LineAuditPageType;
  currentPage: LineAuditPageType;
  actionStatus: {[index: string]: ActionStatus};
  tableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  filterData: any;
  showAdvancedSearch: boolean;
  selectedId: string;
  selectedRowId: string;
  ActionCode = ActionCode;
  purchaseWayList: any[];
  constructor(private utilService: UfastUtilService, private messageService: ShowMessageService,
              private approvalFormService: ApprovalFormService) {
    this.showAdvancedSearch = false;
    this.filterData = {};
    this.currentPage = this.PageTypeEnum.MainPage;
    this.dataList = [];
    this.actionStatus = {};
    this.purchaseWayList = [
      {value: 3, label: '单一来源'},
      {value: 4, label: '竞争性谈判'}
    ];
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public resetSearch() {
    this.filterData = {};
    this.getDataList();
  }
  public viewApprovalFormDetail(id: string) {
    this.selectedId = id;
    this.currentPage = this.PageTypeEnum.DetailPage;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filterData.endDate) {
      return false;
    }
    return startDate.getTime() > this.filterData.endDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filterData.startDate) {
      return false;
    }
    return endDate.getTime() <= this.filterData.startDate.getTime();
  }
  public exitChildPage() {
    this.currentPage = this.PageTypeEnum.MainPage;
  }
  public onAudit(id: string) {
    this.selectedId = id;
    this.selectedRowId = id;
    this.currentPage = this.PageTypeEnum.AuditPage;
  }
  public approvalPass() {
    this.doApproval(this.selectedRowId, ApprovalFormNs.ApprovalRowStatus.Approved, '确定审核通过？');
  }
  public approvalReject() {
    this.doApproval(this.selectedRowId, ApprovalFormNs.ApprovalRowStatus.Refuse, '确定审核拒绝？');
  }
  private doApproval(id: string, action: ApprovalFormNs.ApprovalRowStatus, message) {
    this.messageService.showAlertMessage('', message, 'confirm').afterClose.subscribe((type) => {
      if (type !== 'onOk') {
        return;
      }
      this.approvalFormService.approvalDetailRow(id, action).subscribe((resData) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.getDataList();
        this.currentPage = this.PageTypeEnum.MainPage;
      });
    });
  }
  getDataList = () => {
    Object.keys(this.filterData).filter(key => typeof this.filterData[key] === 'string')
      .forEach((key) => {
        this.filterData[key] = this.filterData[key].trim();
      });
    this.filterData.startDate = this.utilService.getStartDate(this.filterData.startDate);
    this.filterData.endDate = this.utilService.getEndDate(this.filterData.endDate);
    const filterData: ApprovalFormNs.FilterData<any> = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filterData
    };
    this.approvalFormService.getRowAuditList(filterData).subscribe((resData) => {
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.actionStatus = {};
      this.dataList.forEach((item) => {
       if (item.changeMethodStatus === ApprovalFormNs.ApprovalRowStatus.Approved) {
          item['oldPurchaseMethod'] = item.purchaseMethod + 1;
        } else {
          item['oldPurchaseMethod'] = item.purchaseMethod;
          item.purchaseMethod = item.purchaseMethod - 1;
        }

        this.actionStatus[item.id] = {
          approval: item.changeMethodStatus === ApprovalFormNs.ApprovalRowStatus.WaitApprove
        };
      });
    });
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-approvalLineAudit',
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 100, fixed: true},
        {title: '审批表编号', tdTemplate: this.approvalNoTpl, width: 150, fixed: true},
        {title: '状态', field: 'changeMethodStatus', width: 120, pipe: 'approvalRowStatus'},
        {title: '原采购方式', field: 'oldPurchaseMethod', width: 120, pipe: 'purchaseWay'},
        {title: '新采购方式', field: 'purchaseMethod', width: 120, pipe: 'purchaseWay'},
        {title: '采购计划编号', field: 'purchasePlanNo', width: 140},
        {title: '采购计划行号', field: 'indexNo', width: 100},
        {title: '物料编码', field: 'materialCode', width: 120},
        {title: '物料名称', field: 'materialName', width: 160},
        {title: '属性描述', field: 'materialDesc', width: 140},
        // {title: '物料类型', field: 'materialType', width: 100, pipe: 'materialType2'},
        {title: '创建时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm'},
        {title: '单位', field: 'unit', width: 150},
        {title: '数量', field: 'originQuantity', width: 120},
        {title: '含税计划价', field: 'unitPrice', width: 120},
        {title: '总价', field: 'totalPrice', width: 120},
      ]
    };
    this.getDataList();
  }

}
