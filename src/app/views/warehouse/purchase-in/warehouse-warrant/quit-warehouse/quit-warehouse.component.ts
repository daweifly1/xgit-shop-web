import {Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import {WarehouseWarrantService, WarehouseWarrantServiceNs} from '../../../../../core/trans/warehouseWarrant.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../../../layout/layout.module';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-quit-warehouse',
  templateUrl: './quit-warehouse.component.html',
  styleUrls: ['./quit-warehouse.component.scss']
})
export class QuitWarehouseComponent implements OnInit {

  @Input()orderId: string;
  @Output()finish: EventEmitter<any>;
  @ViewChild('stockOutTpl')stockOutTpl: TemplateRef<any>;
  infoFieldList: {field: string; name: string; pipe?: string; }[];
  orderDetail: any;
  tableConfig: UfastTableNs.TableConfig;
  materialList: any[];
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  constructor(private warehouseWarrantService: WarehouseWarrantService, private messageService: ShowMessageService) {
    this.finish = new EventEmitter<any>();
    this.orderDetail = {};
    this.materialList = [];
    this.infoFieldList = [
      { name: '入库单号', field: 'inNo' },
      { name: '收货单号', field: 'invoiceNo' },
      { name: '发货类型', field: 'deliveryType', pipe: 'deliverGoodsType' },
      { name: '合同号', field: 'contractNo' },
      { name: '合同类型', field: 'agreementFlag', pipe: 'agreementFlag' },
      { name: '供应商', field: 'supplierName' },
      { name: '收货方', field: 'receiveName' },
      { name: '状态', field: 'status', pipe: 'inventoryType' },
      { name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage' },
      { name: '保管员', field: 'keeperName' },
    ];
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public getOrder() {

    this.warehouseWarrantService.getWarehouseWarrantDetail(this.orderId).subscribe(
      (resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.orderDetail = resData.value;

        resData.value.warehouseStockInDetailVOs.forEach((item) => {
          item['_this'] = item;
          item['stockOut'] = 0;
        });
        this.materialList =  resData.value.warehouseStockInDetailVOs;
        this.tableConfig.total = resData.value.total;
      }, (error: any) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public exitPage() {
    this.finish.emit();
  }
  public exitStockOut() {}
  ngOnInit() {
    this.tableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        // { title: '行号', field: '', width: 100 },
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料名称', field: 'materialName', width: 150},
        {title: '单位', field: 'unit', width: 80},
        {title: '验收数量', field: 'amountTotal', width: 80},
        // {title: '本次入库数量', tdTemplate: this.receivingTpl, width: 100},
        {title: '状态', field: 'status', width: 100},
        {title: '本单已入库数量', field: 'amountIn', width: 120},
        {title: '储位', field: 'locationCode', width: 150}
      ]
    };
    this.getOrder();
  }

}
