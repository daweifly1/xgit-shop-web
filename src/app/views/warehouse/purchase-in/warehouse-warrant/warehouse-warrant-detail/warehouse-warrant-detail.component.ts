import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../../layout/layout.module';
import {WarehouseWarrantServiceNs, WarehouseWarrantService} from '../../../../../core/trans/warehouseWarrant.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import { environment } from '../../../../../../environments/environment';

enum DepthLevelEnum {
  warehouse,
  warehouseArea,
  location
}
enum ContractType {
  Purchase = 1,
  Agreement
}
@Component({
  selector: 'app-warehouse-warrant-detail',
  templateUrl: './warehouse-warrant-detail.component.html',
  styleUrls: ['./warehouse-warrant-detail.component.scss']
})
export class WarehouseWarrantDetailComponent implements OnInit {
  depthLevel = DepthLevelEnum;
  @Input() selectRowId: string;
  @Input() keeperId: string;
  @Input() detailPage: boolean;
  @Output() finish: EventEmitter<any>;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('chooseLocation') chooseLocation: TemplateRef<any>;
  @ViewChild('receivingTpl') receivingTpl: TemplateRef<any>;
  @ViewChild('locationTpl') locationTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;
  headerInfo: any; // 入库确认数据,在服务定义
  detailMaterial = [];
  locationDataList: any[];
  defaultLocation: any; // 选择储位的数据,赋值给此行物料的储位
  selectMaterialCode: string;
  infoFieldList: {field: string; name: string; pipe?: string; }[];
  locationFilters: any;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  constructor(private warehouseWarrantService: WarehouseWarrantService, private messageService: ShowMessageService) {
    this.finish = new EventEmitter<any>();
    this.headerInfo = [];
    this.selectMaterialCode = '';
    this.infoFieldList = [
      { name: '入库单号', field: 'inNo' },
      { name: '收货单号', field: 'invoiceNo' },
      { name: '发货类型', field: 'deliveryType', pipe: 'deliverGoodsType' },
      { name: '合同号', field: 'contractNo' },
      { name: '合同类型', field: 'inType', pipe: 'agreementFlag' },
      { name: '供应商', field: 'supplierName' },
      { name: '收货方', field: 'receiveName' },
      { name: '状态', field: 'status', pipe: 'inventoryType' },
      { name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage' },
      { name: '保管员', field: 'keeperName' },
    ];
    this.locationFilters = {};
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
  }

  public emitFinish() {
    this.finish.emit();
  }

  getDetailMaterialList = () => {
    this.tableConfig.loading = true;
    this.warehouseWarrantService.getWarehouseWarrantDetail(this.selectRowId).subscribe(
      (resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
        this.tableConfig.loading = false;
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.tableConfig.loading = false;
        this.headerInfo = resData.value;
        if (this.headerInfo.agreementFlag === ContractType.Agreement) {
          this.locationFilters = {
            type: 1
          };
        }
        resData.value.warehouseStockInDetailVOs.forEach((item) => {
          item['_this'] = item;
          item['amountIn'] = item['amountIn'] || 0;
          // this.detailMaterial.push(item);
          this.detailMaterial = [...this.detailMaterial, item];
        });
        this.tableConfig.total = resData.value.total;
      }, (error: any) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public confirmInventory() {
    const material = [];
    this.detailMaterial.forEach((item) => {
      const temp = {};
      temp['realAmount'] = item['amountNow'];
      temp['locationCode'] = item['locationCode'];
      temp['materialNo'] = item['materialCode'];
      temp['businessLineId'] = item['id'];
      temp['locationType'] = item['locationType'];
      material.push(temp);
    });
    const data = {
      detailList: material,
      headerInfo: {
        businessOrder: this.headerInfo.inNo,
        agreementCode: this.headerInfo.agreementFlag === ContractType.Agreement ? this.headerInfo.contractNo : undefined
      }
    };
    this.messageService.showLoading();
    this.warehouseWarrantService.putInStorage(data).subscribe((resData: WarehouseWarrantServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功!', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public onChooseLocation(data: any[], item) {
    item.locationType = data.length;
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
        { title: '行号', field: 'lineNum', width: 80 },
        {title: '物料编码', field: 'materialCode', width: 140},
        {title: '物料名称', field: 'materialName', width: 150},
        {title: '单位', field: 'unit', width: 80},
        {title: '验收数量', field: 'amountTotal', width: 80},
        {title: '本单已入库数量', field: 'amountIn', width: 120},
        {title: '储位', tdTemplate: this.locationTpl, width: 150}
      ]
    };
    if (!this.detailPage) {
      this.tableConfig.headers.splice(6, 0, {title: '本次入库数量', tdTemplate: this.receivingTpl, width: 100});
    }
    this.getDetailMaterialList();
  }

}
