import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {OtherwarehouseService, OtherWarehouseServiceNs} from '../../../../../core/trans/otherwarehouse.service';
import {UfastTableNs} from '../../../../../layout/layout.module';
import {NewsServiceNs} from '../../../../../core/common-services/news.service';
import { environment } from '../../../../../../environments/environment';
interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}

@Component({
  selector: 'app-other-edit',
  templateUrl: './other-edit.component.html',
  styleUrls: ['./other-edit.component.scss']
})
export class OtherEditComponent implements OnInit {

  tabPageType: TabPageType;
  @Input()selectRowId: string;
  @Output()finish: EventEmitter<any>;
  @ViewChild('operation') operation: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  OtherDetailDataList: any[];
  HeaderInfoDataList: any[];
  mouseDetail: any;
  headerFieldList: {name: string; field: string; pipe?: string }[];
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  constructor(private otherWareHouseService: OtherwarehouseService,
              private messageService: ShowMessageService) {
    this.finish = new EventEmitter<any>();
    this.headerFieldList = [
      { name: '申请单号', field: 'abnormalNo'},
      { name: '制单人', field: 'createName'},
      { name: '制单部门', field: 'dept'},
      { name: '制单时间', field: 'applicationDate', pipe: 'date:yyyy-MM-dd HH:mm'},
      { name: '领入仓库', field: 'inLocation'},
      { name: '领入库区', field: 'inArea'},
      { name: '入库状态', field: 'state', pipe: 'inventoryType'},
      { name: '入库类型', field: 'type'},
      { name: '部门编号', field: 'innerOrder'},
      { name: '部门名称', field: 'innerOrderNote'},
      { name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage'},
      { name: '同步状态', field: 'sapOrderDesc'},
      { name: '是否协议入库', field: 'agreementFlag', pipe: 'barcodeManage'},
      { name: '协议号', field: 'agreementCode'},
      { name: '原因', field: 'note'},
      { name: '客户', field: 'customerName'}
    ];
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.OtherDetailDataList = [];
    this.HeaderInfoDataList = [];
    this.mouseDetail = '';
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
  }

  public emitFinish() {
    this.finish.emit();
  }
  public trackByItem(item: any, index: number) {
    return item.id;
  }
  public getMouseDetail() {
    this.tableConfig.loading = true;
    this.otherWareHouseService.getInMouseDetail(this.selectRowId).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.mouseDetail = resData.value.headerInfo;
      this.mouseDetail['sapOrderDesc'] = this.mouseDetail.sapOrder === null ? '未同步' : '已同步';
      this.mouseDetail['voucherNODesc'] = this.mouseDetail.voucherNO === null ? '未过账' : '已过账';
      this.OtherDetailDataList = resData.value.detailList;

      this.OtherDetailDataList.forEach((item: any, index: number) => {
        item.index = index;
        item['disabledNum'] = item.state === OtherWarehouseServiceNs.StockInStatus.Finish;
      });
      this.HeaderInfoDataList = resData.value.headerInfo;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public submitWarehouse() {
    const detailList: any[] = [];
    let flag = false;
    this.OtherDetailDataList.forEach((item: any) => {
      detailList.push({
        realQty: item['realQty'],
        materialsNo: item['materialsNo'],
        materialsType: item['materialsType'],
        price: item['price'],
        qty: item['qty'],
        state: item['state'],
        unit: item['unit'],
        id: item['id'],
        abnormalNo: item['abnormalNo']
      });
      if (!item['qty']) {
        flag = true;
        return;
      }
    });
    if (flag) {
      this.messageService.showToastMessage('入库数量不能为空和0', 'warning');
      return;
    }
    const headerInfo: any = this.HeaderInfoDataList;
    let observer: any = null;
    observer = this.otherWareHouseService.updateWareHouse(detailList, headerInfo);
    this.messageService.showLoading();
    observer.subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
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
        {title: '物料编码', field: 'materialsNo', width: 100},
        {title: '物料描述', field: 'materialsDes', width: 150},
        {title: '分类', field: 'materialsType', width: 80},
        {title: '单位', field: 'unit', width: 80},
        {title: '入库数量', tdTemplate: this.operation, field: 'qty', width: 100},
        {title: '实际入库数量', field: 'realQty', width: 100},
        {title: '入库状态', field: 'state', width: 100, pipe: 'state'},
      ]
    };
    this.getMouseDetail();
  }

}
