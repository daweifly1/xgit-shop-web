import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { DispatchBillService, DispatchBillServiceNs } from '../../../../../core/trans/dispatch-bill.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { environment } from '../../../../../../environments/environment';
import { UploadFile } from 'ng-zorro-antd';


interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}

@Component({
  selector: 'app-dispatch-bill-detail',
  templateUrl: './dispatch-bill-detail.component.html',
  styleUrls: ['./dispatch-bill-detail.component.scss']
})
export class DispatchBillDetailComponent implements OnInit {
  tabPageType: TabPageType;
  tableConfig: UfastTableNs.TableConfig;
  @Output() finish: EventEmitter<any>;
  @Input() invoiceNo: string;
  detailHeaderInfo: any; // 接口获取的发货信息，物流信息
  detailMaterialList: any;  // 接口获取的物料详情
  fileList: any[] = [];  // 物流附件
  fileServiceUrl: string;
  previewImage: string;
  previewVisible: boolean;
  constructor(private dispatchBillService: DispatchBillService,
    private messageService: ShowMessageService) {
    this.finish = new EventEmitter<any>();
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.detailHeaderInfo = [];
    this.detailMaterialList = [];
    this.fileServiceUrl = environment.otherData.fileServiceUrl; // 文件服务器url
    this.previewImage = '';
    this.previewVisible = false;
  }

  getDispatchBillDetail = () => {
    this.tableConfig.loading = true;
    this.dispatchBillService.getDispatchBillDetail(this.invoiceNo).subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
        this.tableConfig.loading = false;
        if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'warning');
            return;
        }
      this.detailHeaderInfo = resData.value.invoiceInfo;
      this.detailMaterialList = resData.value.detailList;
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

  // 物流附件查看关闭
  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }
  removeFile = (file: UploadFile) => {
    return false;
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
        { title: '是否条码管理', field: 'ifCodeManage', width: 80, pipe: 'barcodeManage' },
        { title: '本次发货数量', field: 'deliveryCount', width: 80 }
      ]
    };
    this.getDispatchBillDetail();
  }

}
