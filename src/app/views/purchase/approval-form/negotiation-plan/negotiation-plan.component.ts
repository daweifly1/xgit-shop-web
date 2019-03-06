import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NegotiationPlanService, NegotiationPlanServiceNs } from '../../../../core/trans/negotiation-plan.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { ActionCode } from '../../../../../environments/actionCode';
import { UfastTableNs } from '../../../../layout/layout.module';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import {ActivatedRoute, Router} from '@angular/router';
import {WorkBoardServiceNs} from '../../../../core/trans/work-board.service';
enum PageTypeEnum {
  ManagePage,
  AddPage,
  EditPage,
  DetailPage,
}
interface ActionStatus {
  edit: boolean;
}
@Component({
  selector: 'app-negotiation-plan',
  templateUrl: './negotiation-plan.component.html',
  styleUrls: ['./negotiation-plan.component.scss']
})
export class NegotiationPlanComponent implements OnInit {
  tabPageType = PageTypeEnum;
  currentPage: PageTypeEnum;
  ActionCode = ActionCode;
  tableConfig: UfastTableNs.TableConfig;
  showAdvancedSearch: boolean;
  filters: any;
  negotiationPlanList: NegotiationPlanServiceNs.NegotiationPlanList[];
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('orderNoTpl') orderNoTpl: TemplateRef<any>;
  @ViewChild('planTopicTpl') planTopicTpl: TemplateRef<any>;
  @ViewChild('negotiationAddressTpl') negotiationAddressTpl: TemplateRef<any>;
  /**详情页传值 */
  detailId: string;
  /**审批表编号 */
  approvalNo: string;
  actionStatus: { [index: string]: ActionStatus };
  // 审批流数据设置
  auditFlowData: WorkBoardServiceNs.AuditFlowData;
  listenRouteHandler: any;
  constructor(private negotiationPlanService: NegotiationPlanService,
    private messageService: ShowMessageService,
    private utilService: UfastUtilService,
    private activatedRouter: ActivatedRoute,
    private router: Router) {
    this.auditFlowData = <any>{};
    this.currentPage = this.tabPageType.ManagePage;
    this.showAdvancedSearch = false;
    this.filters = <any>{};
    this.negotiationPlanList = [];
    this.approvalNo = '';
    this.actionStatus = {};
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.createDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.createDateEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.createDateStart) {
      return false;
    }
    return endDate.getTime() <= this.filters.createDateStart.getTime();
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public reset() {
    this.filters = {};
    this.getNegotiationPlanList();
  }
  getNegotiationPlanList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.createDateStart = this.filters.createDateStart ?
      this.utilService.getStartDate(this.filters.createDateStart) : undefined;
    this.filters.createDateEnd = this.filters.createDateEnd ?
      this.utilService.getEndDate(this.filters.createDateEnd) : undefined;
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.negotiationPlanService.getNegotiationPlanList(filter).subscribe((resData) => {
      this.negotiationPlanList = resData.value.list;
      this.negotiationPlanList.forEach((item) => {
        this.actionStatus[item.id] = {
          edit: item.status === NegotiationPlanServiceNs.NegotiationPlanStatus.Save
        };
      });
      this.tableConfig.total = resData.value.total;
    });
  }
  public edit(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public detail(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.DetailPage;
  }
  public childPageFinish() {
    this.auditFlowData = <any>{};
    this.currentPage = this.tabPageType.ManagePage;
    this.getNegotiationPlanList();
  }
  /**
   * 监听路由参数， 获取审批流参数*/
  private listenRouteParams() {
    this.listenRouteHandler = this.activatedRouter.queryParams.subscribe((data: any) => {
      if (!data || data['isAuditFlow'] !== WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow) {
        return;
      }
      this.auditFlowData = Object.assign({}, data);
      if (!data.billId) {
        this.messageService.showToastMessage('无效单据号', 'error');
        return;
      }
      this.detailId = this.auditFlowData.billId;
      this.currentPage = this.tabPageType.DetailPage;
    });
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-negotiationPlan',
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 120, fixed: true },
        { title: '预案编号', tdTemplate: this.orderNoTpl, width: 180, fixed: true },
        { title: '审批表编号', field: 'approvalNo', width: 180 },
        { title: '状态', field: 'status', width: 100, pipe: 'negotiationState' },
        { title: '预案主题', tdTemplate: this.planTopicTpl, width: 120 },
        { title: '总金额(元)', field: 'negotiationAmout', width: 100 },
        { title: '谈判日期', field: 'negotiationDate', width: 180, pipe: 'date:yyyy-MM-dd' },
        { title: '谈判地点', tdTemplate: this.negotiationAddressTpl, width: 120 },
        { title: '谈判方式', field: 'negotiationWay', width: 100 },
        { title: '谈判形式', field: 'negotiationForm', width: 120 },
        { title: '商务科室', field: 'businessDepartment', width: 100 },
        { title: '谈判组长', field: 'negotiationLeader', width: 120 },
        { title: '创建人', field: 'createName', width: 120 },
        { title: '创建时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' }
      ]
    };
    this.activatedRouter.queryParams.subscribe((params) => {
      const approvalNo = params ? params.approvalNo : '';
      if (!approvalNo) {
        return;
      }
      this.currentPage = Number(params.pageType);
      this.approvalNo = params.approvalNo;
      this.detailId = '';
    });
    this.getNegotiationPlanList();
    this.listenRouteParams();
  }

}
