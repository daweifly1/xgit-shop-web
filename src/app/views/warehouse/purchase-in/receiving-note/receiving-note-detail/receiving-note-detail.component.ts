import { ActionCode } from './../../../../../../environments/actionCode';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { ReceivingNoteService, ReceivingNoteServiceNs } from '../../../../../core/trans/receiving-note.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';


interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}
enum PageType {
  ManagePage = 0,
  AddPage = 1,
  EditPage = 2,
  DetailPage = 3
}

@Component({
  selector: 'app-receiving-note-detail',
  templateUrl: './receiving-note-detail.component.html',
  styleUrls: ['./receiving-note-detail.component.scss']
})
export class ReceivingNoteDetailComponent implements OnInit {
  tabPageType = PageType;
  tableConfig: UfastTableNs.TableConfig;
  @Output() finish: EventEmitter<any>;
  @Input() invoiceNo: string;
  detailHeaderInfo: any; // 接口获取的发货信息，物流信息
  detailMaterialList: any;  // 接口获取的物料详情
  fileList: any[] = [];  // 物流附件
  fileServiceUrl: string;
  previewImage: string;
  previewVisible: boolean;
  enabledFinish: boolean;
  ActionCode = ActionCode;
  showLogisticsInfo: boolean;
  constructor(private receivingNoteService: ReceivingNoteService,
    private messageService: ShowMessageService) {
    this.finish = new EventEmitter<any>();
    this.detailHeaderInfo = [];
    this.detailMaterialList = [];
  }
  getReceivingNoteDetail = () => {
    this.tableConfig.loading = true;
    this.receivingNoteService.getReceivingNoteDetail(this.invoiceNo).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.detailHeaderInfo = resData.value.invoiceInfo;
      this.detailMaterialList = resData.value.detailList;
      this.tableConfig.loading = false;
      this.enabledFinish = this.detailHeaderInfo.status !== ReceivingNoteServiceNs.BillStatus.AllStockIn &&
       this.detailHeaderInfo.status !== ReceivingNoteServiceNs.BillStatus.Finish;
      this.showLogisticsInfo = this.detailHeaderInfo.billType === ReceivingNoteServiceNs.BillType.Dispach;

      const tmpFilelist = [];
      if (this.detailHeaderInfo.logisticsAttach !== null) {
        tmpFilelist.push({
          uid: 1,
          name: this.detailHeaderInfo.logisticsAttach,
          url: this.fileServiceUrl + this.detailHeaderInfo.logisticsAttach,
          thumbUrl:  this.fileServiceUrl + this.detailHeaderInfo.logisticsAttach,
        });

      }
      this.fileList = tmpFilelist;
      this.previewImage = this.fileServiceUrl + this.detailHeaderInfo.logisticsAttach;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public emitFinish() {
    this.finish.emit();
  }

  public accountStatement() {
    this.tableConfig.loading = true;
    const materialsNoData = [];
    this.detailMaterialList.forEach((item) => {
      materialsNoData.push(item.materialsNo);
    });
    const data = {
      billNo: this.detailHeaderInfo.invoiceNo
    };
    this.receivingNoteService.accountStatement(data).subscribe
      ((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
        this.tableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.emitFinish();
        this.tableConfig.loading = false;
      }, (error: any) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }





  ngOnInit() {
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '行号', field: 'lineNum', width: 60 },
        { title: '物料编码', field: 'materialsNo', width: 100 },
        { title: '物料名称', field: 'materialsName', width: 150 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '发货数量', field: 'deliveryCount', width: 80 },
        { title: '已验收数量', field: 'billReceiptCount', width: 80 },
        { title: '入库数量', field: 'totalStoredCount', width: 80 }
      ]
    };
    this.getReceivingNoteDetail();
  }

}
