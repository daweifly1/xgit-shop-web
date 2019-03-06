import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ShowMessageService} from '../../widget/show-message/show-message';
import { UfastTableNs } from '../../layout/layout.module';
import { WorkBoardService, WorkBoardServiceNs } from './../../core/trans/work-board.service';
import {UserService} from '../../core/common-services/user.service';
import {NewsService} from '../../core/common-services/news.service';
import { graphic, echarts, numeral } from 'echarts';
enum PageTypeEnum {
  ManagePage
}
interface ActionStatus {
  deal: boolean;
  view: boolean;
}
@Component({
  templateUrl: './work-board.component.html',
  styleUrls: ['work-board.component.scss']
})
export class WorkBoardComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  currentPage: PageTypeEnum;
  tabPageType = PageTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  filters: any;
  actionStatus: {[index: string]: ActionStatus};
  userInfo: any;
  noticeList: any[];
  infoList: any[];
      /**图表 */
      barOptions: any;
      detecEventChanges = true;
      barchart: any;
  constructor(private activeRoute: ActivatedRoute, private messageService: ShowMessageService,
    private workBoardService: WorkBoardService, private router: Router, private userService: UserService,
              private newService: NewsService,
              private route: ActivatedRoute,
  ) {
    this.infoList = [];
    this.noticeList = [];
    this.actionStatus = {};
    this.currentPage = this.tabPageType.ManagePage;
    this.dataList = [];
    this.filters = {};
    this.userInfo = {};
  }
  getDataList = () => {
    this.filters.titles = ['title', 'billId', 'purchaseType', 'amount', 'url', 'pkId'];
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.dataList = [];
    this.workBoardService.getDataList(filter).subscribe((resData: WorkBoardServiceNs.UfastHttpAnyResModel) => {
      this.dataList = resData.value.taskList;
      this.tableConfig.total = resData.value.totalCount;
      this.actionStatus = {};
      this.dataList.forEach((item) => {
        Object.keys(item.titleParams || {}).forEach((key) => {
          item[key] = item.titleParams[key];
        });
        this.actionStatus[item.taskId] = {
          deal: true,
          view: true
        };
      });
    });
  }
  public transactItem(taskId: string, processInstanceId: string, pkId: string, url: string) {
    if (!pkId) {
      this.messageService.showToastMessage('无效的单据号', 'warning');
      return;
    }
    this.router.navigate([`/main${url}`], {queryParams: {
        taskId: taskId, processInstanceId: processInstanceId, billId: pkId,
        isAudit: WorkBoardServiceNs.AuditFlowRouteParam.Audit, isAuditFlow: WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow
      }});
  }
  public viewDetail(taskId: string, processInstanceId: string, pkId: string, url: string) {
    if (!pkId) {
      this.messageService.showToastMessage('无效的单据号', 'warning');
      return;
    }
    this.router.navigate([`/main${url}`], {queryParams: {
        taskId: taskId, processInstanceId: processInstanceId, billId: pkId,
        isAudit: WorkBoardServiceNs.AuditFlowRouteParam.View, isAuditFlow: WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow
      }});
  }
  onCloseTab = () => {
    return true;
  }
  private getNewData(type: string, targetList: any[]) {
    const filter = {
      pageSize: 10,
      pageNum: 1,
      filters: {type: type}
    };
    this.newService.getNewsList(filter).subscribe((resData: any) => {
      if (resData.code !== 0) {
        return;
      }
      targetList.push(...resData.value.list);
    });
  }
  public getOptions() {
    const dataAxis = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const data = [2200, 1820, 1910, 2340, 2900, 3300, 3100, 1230, 4420, 3210, 900, 1490];
    const yMax = 5000;
    const dataShadow = [];
    for (let i = 0; i < data.length; i++) {
      dataShadow.push(yMax);
    }
    this.barOptions = {
      title: {
        text: '月度合同签订情况',
        // color: '#999',
        x: 'center',
        y: 'top',
        textAlign: 'center',
        textStyle: { // 设置主标题风格
          // Color: '#383B3C', // 设置主标题字体颜色
        }
      },
      xAxis: [
        {
          show: true,                  // ---是否显示
          position: 'bottom',          // ---x轴位置
          data: dataAxis,
          axisLabel: {
            inside: false,
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          z: 10
        }
      ],
      yAxis: [
        {
          name: '单位：元',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#383B3C'
            }
          },
          axisLabel: {
            textStyle: {
              // color: '#999' // 坐标轴数字颜色
            }
          }
        }
      ],
      dataZoom: [
        {
          type: 'inside'
        }
      ],
      series: [
        {
          type: 'bar',
          barWidth: 20,
          itemStyle: {
            normal: {
              color: '#00A6ED',
              label: {
                show: true, // 开启显示
                position: 'top', // 在上方显示
                textStyle: { // 数值样式
                  color: '#383B3C',
                  fontSize: 16
                },
              },
            },
          },
          data: data,
        }
      ]
    };
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'work-boardTable',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 100 },
        // { title: '状态', field: 'status', width: 80 },
        { title: '类型', field: 'title', width: 100 },
        { title: '单据号', field: 'billId', width: 180 },
        { title: '采购方式', field: 'purchaseType', width: 100 },
        { title: '金额（元）', field: 'amount', width: 80 },
        // { title: '下一步审批人', field: '', width: 120 },
        { title: '创建人', field: 'startUserName', width: 100 },
        { title: '创建时间', field: 'startTime', width: 120, pipe: 'date:yyyy-MM-dd HH:mm' },
      ]
    };
    this.getDataList();
    this.userService.getLogin().subscribe((resData) => {
      if (resData.code !== 0) {
        return;
      }
      this.userInfo = resData.value;
    }, () => {});
    this.getNewData('5', this.noticeList);
    this.getOptions();
    // this.route.queryParams.subscribe((params) => {
    //   this.currentPage = this.tabPageType.ManagePage;
    // });
  }
}
