import { ActionCode } from './../../../../../../environments/actionCode';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PurchaseServiceNs, PurchaseService} from '../../../../../core/trans/purchase.service';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';

@Component({
  selector: 'app-demand-detail',
  templateUrl: './demand-detail.component.html',
  styleUrls: ['./demand-detail.component.scss']
})
export class DemandDetailComponent implements OnInit {
  @Input() indexId: number|string;
  @Output() backToManiPage: EventEmitter<any> = new EventEmitter<any>();
  public demandDetailTableConfig: UfastTableNs.TableConfig;
  public demandDetailList: PurchaseServiceNs.DemandDetailTableData[] = [];
  public demandDetailData: PurchaseServiceNs.DemandListData = {
    orgName: '',
    demandId: '',
    applyDepartment: '',
    applicant: '',
    applyDate: '',
    remark: '',
    status: ''
  };
  public demandDataMap = this.purchaseService.demandDataMap;
  public demandDetailDataConfig: {name: string; field: string; pipe?: string}[] = [];
  public isShowObsoleteBtn = true;
  ActionCode = ActionCode;

  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService) { }
  public getDemandDetail() {
    const paramsData = {id: this.indexId};
    this.demandDetailList = [];
    this.purchaseService.getDemandPlanDetail(paramsData).then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      if (!resData.value) {
        return;
      }
      this.isShowObsoleteBtn = resData.value[this.demandDataMap.status.key] !== PurchaseServiceNs.DemandPlanStatus.HasObsoleted;
      this.demandDetailData = {
        orgName: resData.value[this.demandDataMap.orgName.key],
        demandId: resData.value[this.demandDataMap.demandId.key],
        applyDepartment: resData.value[this.demandDataMap.applyDepartment.key],
        applicant: resData.value[this.demandDataMap.applicant.key],
        applyDate: resData.value[this.demandDataMap.applyDate.key],
        remark: resData.value[this.demandDataMap.remark.key],
        applyType: resData.value[this.demandDataMap.applyType.key],
        urgencyFlag: resData.value[this.demandDataMap.urgencyFlag.key],
        status: resData.value[this.demandDataMap.status.key]
      };
      resData.value.detailList.forEach((item) => {
        console.log(item);
        this.demandDetailList = [...this.demandDetailList, {
          lineNo: item[this.demandDataMap.lineNo.key],
          materialCode: item[this.demandDataMap.materialCode.key],
          materialDescription: item[this.demandDataMap.materialDescription.key],
          unit: item[this.demandDataMap.unit.key],
          quantity: item[this.demandDataMap.quantity.key],
          demandDate: item[this.demandDataMap.demandDate.key],
          targetPrice: item[this.demandDataMap.targetPrice.key],
          lineTotalAmount: item[this.demandDataMap.lineTotalAmount.key],
        }];
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public obsoleteDemandPlan() {
    const paramsData = [this.indexId];
    this.messageService.showAlertMessage('', '是否作废该需求计划', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.purchaseService.cancelDemandPlan(paramsData).then((resData) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.emitPage(true);
        }, (error) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public emitPage(refresh) {
    this.backToManiPage.emit(refresh);
  }

  ngOnInit() {
    this.demandDetailTableConfig = {
      showCheckbox: false,
      showPagination: true,
      loading: false,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'lineNo', width: 40},
        {title: '物料编号', field: 'materialCode', width: 100},
        {title: '物料描述', field: 'materialDescription', width: 100},
        {title: '单位', field: 'unit', width: 60},
        {title: '数量', field: 'quantity', width: 60},
        {title: '需求日期', field: 'demandDate', pipe: 'date:yyyy-MM-dd', width: 100},
        {title: '计划价(元)', field: 'targetPrice', width: 100},
        {title: '行总金额', field: 'lineTotalAmount', width: 100}
      ]
    };
    this.demandDetailDataConfig = [
      {name: '业务实体', field: 'orgName'},
      {name: '需求申请单号', field: 'demandId'},
      {name: '申请部门', field: 'applyDepartment'},
      {name: '申请人', field: 'applicant'},
      {name: '申请日期', field: 'applyDate', pipe: 'date:yyyy-MM-dd'},
      {name: '需求申请类型', field: 'applyType', pipe: 'demandApplyType'},
      {name: '是否紧急', field: 'urgencyFlag', pipe: 'demandUrgencyFlag'},
      {name: '状态', field: 'status', pipe: 'demandPlanStatus'},
      {name: '备注', field: 'remark'},
    ];
    this.getDemandDetail();
  }

}
