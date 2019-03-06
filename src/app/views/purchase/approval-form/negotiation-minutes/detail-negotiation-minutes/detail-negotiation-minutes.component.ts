
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { NegotiationMinutesService, NegotiationMinutesServiceNs } from './../../../../../core/trans/purchase/negotiation-minutes.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { environment } from '../../../../../../environments/environment';
enum TabIndexEnum {
  FirstOffer,
  FinalOffer,
}
interface TableConfig extends UfastTableNs.TableConfig {
  xScroll?: string;
}
@Component({
  selector: 'app-detail-negotiation-minutes',
  templateUrl: './detail-negotiation-minutes.component.html',
  styleUrls: ['./detail-negotiation-minutes.component.scss']
})
export class DetailNegotiationMinutesComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() isDetailPage: boolean;
  @Input() detailId: string;
  negotiationDetailInfo: any;
  fieldList: { field: string; name: string; pipe?: string }[];
  supplierTableConfig: UfastTableNs.TableConfig;
  supplierList: any[];
  firstQuotationList: NegotiationMinutesServiceNs.SupplierOfferData[];
  finalQuotationList: any[];
  tabIndex: number;
  supplierOfferInfo: any[];
  TabIndexType = TabIndexEnum;
  tableConfig: TableConfig;
  tableDataList: NegotiationMinutesServiceNs.SupplierOfferData[];
  downLoadUrl: string;

  constructor(
    private negotiationMinutesService: NegotiationMinutesService,
    private messageService: ShowMessageService
  ) {
    this.finish = new EventEmitter<any>();
    this.negotiationDetailInfo = [];
    this.fieldList = [
      { name: '纪要编号', field: 'id' },
      { name: '审定表编号', field: 'confirmNo' },
      { name: '谈判主题', field: 'negotiationTopic' },
      { name: '商务科室', field: 'businessDepartment' },
      { name: '谈判日期', field: 'negotiationDate', pipe: 'date:yyyy-MM-dd HH:mm:ss' },
      { name: '谈判地点', field: 'negotiationAddress' },
      { name: '谈判形式', field: 'negotiationForm' },
      { name: '谈判组长', field: 'negotiationLeader' },
      { name: '谈判成员', field: 'negotiationMember' }
    ];
    this.tabIndex = 0;
    this.firstQuotationList = [];
    this.finalQuotationList = [];
    this.supplierOfferInfo = [];
    this.tableDataList = [];
    this.downLoadUrl = '';
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public getNegotiationMinutesDetail() {
    this.negotiationMinutesService.getNegotiationMinutesDetail(this.detailId).subscribe(
      (resData: NegotiationMinutesServiceNs.UfastHttpResT<any>) => {
        this.negotiationDetailInfo = resData.value;
        this.supplierList = resData.value.purchaseSummarySupplierVOS;
        this.downLoadUrl = environment.otherData.fileServiceUrl + '/' + resData.value.attachment;
        this.firstQuotationList = resData.value.firstSummaryOfferVOS;
        this.firstQuotationList.forEach((item, index) => {
          item.rowNo = ++index;
        });
        this.finalQuotationList = resData.value.finalSummaryOfferVOS;
        this.finalQuotationList.forEach((item, index) => {
          item.rowNo = ++index;
        });
        this.initTabData();
      });
  }
  public changeTab(index: number) {
    this.initTabData();
  }
  private initTabData() {
    let basicWidth = 560;
    this.tableConfig = {
      checkAll: false,
      pageSize: 10,
      pageNum: 1,
      showCheckbox: false,
      showPagination: true,
      frontPagination: true,
      loading: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      xScroll: '560px',
      headers: [
        { title: '行号', field: 'rowNo', width: 50 },
        { title: '物料编码', field: 'materialCode', width: 150 },
        { title: '物料描述', field: 'materialDesc', width: 180 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '数量', field: 'quantity', width: 100 }
      ]
    };
    switch (this.tabIndex) {
      case TabIndexEnum.FirstOffer: this.tableDataList = this.firstQuotationList;
      basicWidth = 560;
        break;
      case TabIndexEnum.FinalOffer: this.tableDataList = this.finalQuotationList;
      basicWidth = 760;
        this.tableConfig.headers.push(
          { title: '成交供应商', field: 'supplierName', width: 100 },
          { title: '成交价格(元)', field: 'supplierPrice', width: 100 }
        );
        break;
      default: this.tableDataList = [];
    }
    if (this.tableDataList.length > 0) {
      this.tableConfig.xScroll = basicWidth + 160 * this.tableDataList[0].summaryOfferBodyDOS.length + 'px';
    } else {
      this.tableConfig.xScroll = basicWidth + 'px';
    }
  }
  public auditPass() {
    const auditData = {
      id: this.detailId,
      status: NegotiationMinutesServiceNs.NegotiationMinutesStatus.Pass
    };
    this.messageService.showAlertMessage('', '确定审批通过吗', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.negotiationMinutesService.audit(auditData), true);
    });
  }
  public auditReject() {
    const auditData = {
      id: this.detailId,
      status: NegotiationMinutesServiceNs.NegotiationMinutesStatus.Reject
    };
    this.messageService.showAlertMessage('', '确定审批拒绝吗', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.negotiationMinutesService.audit(auditData), true);
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: NegotiationMinutesServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.onCancel();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onCancel() {
    this.finish.emit();
  }

  ngOnInit() {
    this.supplierTableConfig = {
      pageSize: 10,
      pageNum: 1,
      showCheckbox: false,
      checkRowField: '_checked',
      checkAll: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '供应商', field: 'supplierName', width: 100, fixed: true },
        { title: '卖方代表人', field: 'seller_representative', width: 200 }
      ]
    };
    this.tableConfig = {
      checkAll: false,
      pageSize: 10,
      pageNum: 0,
      showCheckbox: false,
      showPagination: true,
      frontPagination: true,
      loading: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      xScroll: '560px',
      headers: [
        { title: '行号', field: 'rowNo', width: 50 },
        { title: '物料编码', field: 'materialCode', width: 150 },
        { title: '物料描述', field: 'materialDesc', width: 180 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '数量', field: 'quantity', width: 100 }
      ]
    };
    this.getNegotiationMinutesDetail();
  }

}
