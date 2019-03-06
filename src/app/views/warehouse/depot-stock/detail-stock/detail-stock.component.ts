import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {InventoryService, InventoryServiceNs} from '../../../../core/trans/inventory.service';
import {UfastTableNs} from '../../../../layout/layout.module';

@Component({
  selector: 'app-detail-stock',
  templateUrl: './detail-stock.component.html',
  styleUrls: ['./detail-stock.component.scss']
})
export class DetailStockComponent implements OnInit {
  @Input()InlocationCode: string;
  @Input()InmaterialNo: string;
  @Input()InagreementCode: string;
  @Input()Instatus: number;
  // @Input()AgreementFlag: number;
  @Output()finish: EventEmitter<any>;
  tableConfig: UfastTableNs.TableConfig;
  StockDetailDataList: any[];
  depotStockData: any;

  constructor(private messageService: ShowMessageService,
              private inventoryService: InventoryService) {
    this.finish = new EventEmitter<any>();
    this.StockDetailDataList = [];
    this.depotStockData = '';
  }

  public emitFinish() {
    this.finish.emit();
  }

  getWareHouseInventoryDetail = (pageNum?: number) => {
    this.tableConfig.loading = true;
    const filter = {
      pageNum: pageNum || this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {
        locationCode: this.InlocationCode,
        materialCode: this.InmaterialNo,
        agreementCode: this.InagreementCode,
        status: this.Instatus
      }
    };
    this.inventoryService.getWarehouseInventoryDetail(filter).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.StockDetailDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
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
        {title: '物料条码', field: 'barCode', width: 130},
        {title: '物料描述', field: 'materialName', width: 150},
        {title: '物料分类', field: 'materialType', width: 80},
        {title: '库存数量', field: 'amount', width: 80},
        {title: '计量单位', field: 'unit', width: 100},
        {title: '协议号', field: 'agreementCode', width: 100},
      ]
    };
    // if (this.AgreementFlag) {
    //   this.tableConfig.headers.push({title: '协议号', field: 'agreementCode', width: 100});
    // }
  }

}
