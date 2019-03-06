import { Component, EventEmitter, Input, OnInit, Output, ViewChild, TemplateRef } from '@angular/core';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { InventoryService, InventoryServiceNs } from '../../../../core/trans/inventory.service';
import { environment } from '../../../../../environments/environment';
import { UploadModalService } from '../../../../widget/upload-modal/upload-modal';

interface TabPageType {
  ManagePage: number;
  AddPage: number;
  DetailPage: number;
}

@Component({
  selector: 'app-detailinventory',
  templateUrl: './detailinventory.component.html',
  styleUrls: ['./detailinventory.component.scss']
})
export class DetailinventoryComponent implements OnInit {

  tabPageType: TabPageType;
  @Input() selectRowId: string;
  @Input() selectCheckOrderNo: string;
  @Input() detailPage: boolean;
  @Output() finish: EventEmitter<any>;
  @ViewChild('actAmountTpl') actAmountTpl: TemplateRef<any>;
  @ViewChild('uploadModalErrMsgTpl') uploadModalErrMsgTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  materialDataList: any[];
  InventoryDetail: any;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  importUrl: string;
  importParam: any;
  importErrMsgList: any[];
  constructor(private inventoryService: InventoryService,
    private messageService: ShowMessageService, private uploadModalService: UploadModalService) {
    this.importErrMsgList = [];
    this.finish = new EventEmitter<any>();
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      DetailPage: 2,
    };
    this.materialDataList = [];
    this.InventoryDetail = {};
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
    this.importUrl = `${environment.baseUrl.ss}/inventoryCheck/export`;
    this.importParam = {
      pageSize: 0,
      pageNum: 0,
      filters: {}
    };
  }

  public emitFinish() {
    this.finish.emit();
  }

  // 获取盘点单详情
  public getInventoryDetail() {
    this.inventoryService.getInventoryDetail(this.selectRowId).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.InventoryDetail = resData.value;
      resData.value.inventoryCheckDetailVOS.forEach((item) => {
        let temp = {};
        temp = item;
        temp['_this'] = temp;
        if (!this.detailPage) {
          temp['actAmount'] = item['sysAmount'];
        }
        this.materialDataList.push(temp);
      });
      this.materialDataList = [...this.materialDataList];
      this.importParam.filters = this.InventoryDetail;
      this.importParam.filters.inventoryCheckDetailVOS = [];
      this.InventoryDetail.inventoryCheckDetailVOS.forEach((item) => {
        const temp = Object.assign({}, item);
        temp['_this'] = undefined;
        this.importParam.filters.inventoryCheckDetailVOS.push(temp);
      });
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  getMaterialList = () => {
    this.materialDataList = [];
    let filter = <any>{};
    filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {
        checkOrderNo: this.selectCheckOrderNo
      }
    };
    if (!this.detailPage) {
      filter.filters.state = 0;
    }
    this.messageService.showLoading();
    this.inventoryService.getMaterialList(filter).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = [];
        temp = item;
        if (!this.detailPage) {
          temp['actAmount'] = temp['sysAmount'];
        }
        temp['_this'] = temp;
        this.materialDataList.push(temp);
      });
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public inventory() {
    const materialList = [];
    this.materialDataList.forEach((item) => {
      const temp = {
        id: item.id,
        sysAmount: item.sysAmount,
        actAmount: item.actAmount
      };
      materialList.push(temp);
    });
    this.messageService.showLoading();
    this.inventoryService.inventory(materialList).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public importMaterial() {
    this.importErrMsgList = [];
    this.uploadModalService.showUploadModal({
      title: '导入文件',
      uploadUrl: `${environment.baseUrl.ss}/inventoryCheck/import`,
      data: { checkOrder: this.selectCheckOrderNo },
      maxFileNum: 1,
      fileType: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      bottomTpl: this.uploadModalErrMsgTpl,
      onResponse: (resData) => {
        if (resData.code !== 0) {
          this.importErrMsgList = resData.value || [];
          return false;
        }
        return true;
      }
    }).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>[]) => {
      if (resData[0].code !== 0) {
        return;
      }
      resData[0].value.forEach((item, index: number) => {
        if (item.id === this.materialDataList[index].id) {
          this.materialDataList[index]['actAmount'] = item['actAmount'];
          return;
        }
        const target = this.materialDataList.find(material => material.id === item.id);
        if (!target) {
          this.messageService.showToastMessage(`未查找到物料${item.materialsNo}`, 'error');
          return;
        }
        target['actAmount'] = item['actAmount'];
      });
    });
  }
  ngOnInit() {
    const tableHeaders: UfastTableNs.TableHeader[] = [
      { title: '盘点条码', field: 'barCode', width: 100 },
      { title: '物料编码', field: 'materialsNo', width: 150 },
      { title: '物料描述', field: 'materialsDes', width: 150 },
      { title: '储位', field: 'loactionCode', width: 100 },
      { title: '原始数量', field: 'sysAmount', width: 100 },
      { title: '保管员', field: 'depositaryName', width: 100 },
      { title: '盘点状态', field: 'resultType', width: 100, pipe: 'checkResultState' },
      { title: '盘点人', field: 'inventoryUserName', width: 100 }
    ];
    if (this.detailPage) {
      tableHeaders.splice(5, 0,
        { title: '盘点数量', field: 'actAmount', width: 100 },
      );
    } else {
      tableHeaders.splice(5, 0, {
        title: '盘点数量', tdTemplate: this.actAmountTpl, width: 100
      });
    }
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: tableHeaders
    };
    this.getInventoryDetail();
    // this.getMaterialList();
  }

}
