import {Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../../../layout/layout.module';
import {PickingDeliveryService, PickingDeliveryServiceNs} from '../../../../../core/trans/picking-delivery.service';
import {PickingApplyService, PickingApplyServiceNs} from '../../../../../core/trans/picking-apply.service';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
import { environment } from '../../../../../../environments/environment';

interface DetailInfoField {
  name: string;
  field: string;
  pipe?: string;
}

@Component({
  selector: 'app-add-picking-delivery',
  templateUrl: './add-picking-delivery.component.html',
  styleUrls: ['./add-picking-delivery.component.scss']
})
export class AddPickingDeliveryComponent implements OnInit {

  @Output()finish: EventEmitter<any>;
  @Input()orderNo: string;
  orderInfo: PickingDeliveryServiceNs.PickingDeliveryItem;

  tableConfig: UfastTableNs.TableConfig;
  materialDataList: PickingDeliveryServiceNs.PickingDeliveryMaterial[];

  stockTableConfig: UfastTableNs.TableConfig;
  stockDataList: PickingApplyServiceNs.StockItem[];
  stockFilter: any;

  detailFieldList: DetailInfoField[];
  agreementField: DetailInfoField[];
  baseField: DetailInfoField[];
  locationFilter: any;
  stockModalShow: boolean;
  selectedLine: PickingDeliveryServiceNs.PickingDeliveryMaterial;

  @ViewChild('operateTpl')operateTpl: TemplateRef<any>;
  @ViewChild('deliveryNumTpl')deliveryNumTpl: TemplateRef<any>;
  @ViewChild('nowStockTpl')nowStockTpl: TemplateRef<any>;
  @ViewChild('stockOperateTpl')stockOperateTpl: TemplateRef<any>;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  stockFilterAreaCodeFlag: boolean; /**出库储位是否一致 */

  constructor(private messageService: ShowMessageService, private pickingDeliveryService: PickingDeliveryService,
                private pickingApplyService: PickingApplyService, private utilService: UfastUtilService
  ) {
    this.stockFilter = {};
    this.stockDataList = [];
    this.stockModalShow = false;
    this.finish = new EventEmitter<any>();
    this.locationFilter = {};
    this.baseField = [
      {name: '领料出库单号', field: 'pickingNo'},
      {name: '创建时间', field: 'createDate', pipe: 'date:yyyy-MM-dd'},
      {name: '业务实体', field: 'orgName'},
      {name: '出库类型', field: 'type'},
      {name: '领料部门', field: 'applyDepartment'},
      {name: '工段', field: 'section'},
      {name: '计划员', field: 'plannerName'},
      {name: '申请日期', field: 'createDate', pipe: 'date:yyyy-MM-dd'},
      {name: '保管员', field: 'keeperName'},
      {name: '状态', field: 'outStatus', pipe: 'stockOutStatus'},
      {name: '是否条码管理', field: 'barcodeFlag', pipe: 'barcodeManage'},
      {name: '收货人', field: 'receiverName'},
      {name: '收货人电话', field: 'receiverNumber'},
      {name: '收货地址', field: 'receiverAddress'},
      { name: '客户', field: 'customerName' },
      {name: '是否协议', field: 'agreementFlag', pipe: 'isAgreement'},
    ];
    this.agreementField = [
      {name: '协议类型', field: 'agreementType', pipe: 'agreementType'},
      {name: '协议号', field: 'agreementCode'},
      {name: '代储供应商', field: 'storageOrgName'},
    ];
    this.detailFieldList = [];
    this.materialDataList = [];
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = environment.otherData.materialNumMin;
    this.materialNumMax = environment.otherData.materialNumMax;
    /**true:过滤当前的库区  false:不过滤当前的库区*/
    this.stockFilterAreaCodeFlag = false;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public deleteMaterial() {
    const tempList = this.materialDataList.filter(item => !item[this.tableConfig.checkRowField]);
    if (this.materialDataList.length === tempList.length) {
      this.messageService.showToastMessage('请选择要删除的物料', 'warning');
    } else {
      this.materialDataList = tempList;
      this.checkMaterialAll();
    }
  }
  private checkMaterialAll() {
    if (this.materialDataList.length === 0) {
      this.tableConfig.checkAll = false;
      return;
    }
    this.tableConfig.checkAll = true;
    for (let i = 0, len = this.materialDataList.length; i < len; i++) {
      if (!this.materialDataList[i][this.tableConfig.checkRowField]) {
        this.tableConfig.checkAll = false;
        break;
      }
    }
  }
  public deleteByNO(materialCode: string) {
    this.materialDataList = this.materialDataList.filter(item => item.materialCode !== materialCode);
    this.checkMaterialAll();
  }
  public onSelectedOrder(event: UfastTableNs.SelectedChange) {

    const checked = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
    if (event.index === -1) {
      this.tableConfig.checkAll = checked;
      this.materialDataList.forEach((item: any) => {
        item[this.tableConfig.checkRowField] = checked;
      });
      return;
    }
    this.tableConfig.checkAll = checked;
    if (checked) {
      for (let i = 0, len = this.materialDataList.length; i < len; i++) {
        if (!this.materialDataList[i][this.tableConfig.checkRowField]) {
          this.tableConfig.checkAll = false;
          break;
        }
      }
    }
  }

  public submitOrder() {
    let locationCodeFlag = false;
    const data = [];
    this.materialDataList.forEach((item) => {
      if (!item['warehouseCode']) {
        locationCodeFlag = true;
        return;
      }
      const temp = <any>{};
      temp['pickNum'] = item['deliveryQty'];
      temp['pickingOutDtlId'] = item['id'];
      temp['locationCode'] = item['warehouseCode'];
      temp['warehouseCode'] = item['warehouseCode'];
      temp['locationType'] = item['locationType'];
      temp['businessLineId'] = item['id'];
      temp['agreementCode'] = this.orderInfo.agreementCode;
      data.push(temp);
    });
    if (locationCodeFlag) {
      this.messageService.showToastMessage('出库储位不能为空', 'warning');
      return;
    }
    if (data.length === 0) {
      this.messageService.showToastMessage('物料不能为空', 'warning');
      return;
    }
    this.messageService.showLoading('');
    this.pickingDeliveryService.submitOrder(data).subscribe((resData: PickingDeliveryServiceNs.PickingDeliveryResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.finish.emit();
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onCancel() {
    this.finish.emit();
  }
  public showStockModal(material: any) {
    this.stockModalShow = true;
    this.selectedLine = material;
    this.stockFilter['materialCode'] = material.materialCode;
    if (this.stockFilterAreaCodeFlag) {
      this.stockFilter['areaCode'] = material.warehouseName;
    }
    this.stockTableConfig = Object.assign({}, this.stockTableConfig);
    this.stockModalShow = true;
    this.getStockList();
  }
  public onCancelStock() {
    this.stockModalShow = false;
  }
  getStockList = () => {
    this.stockTableConfig.loading = true;
    const filter = {
      pageSize: this.stockTableConfig.pageSize,
      pageNum: this.stockTableConfig.pageNum,
      filters: this.stockFilter
    };
    let handler: any = null;
    if (this.orderInfo.agreementFlag) {
      handler = this.pickingApplyService.getAgreementStockList(filter);
    } else {
      handler = this.pickingApplyService.getNormalStockList(filter);
    }
    handler.subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
      this.stockTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.stockTableConfig.total = resData.value.total;
      this.stockDataList = resData.value.list;
      this.stockDataList.forEach((item) => {
        item['_this'] = item;
      });
    }, (error) => {
      this.stockTableConfig.loading = false;
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  public chooseStock(item: PickingApplyServiceNs.StockItem) {
    this.stockModalShow = false;
    this.selectedLine.nomalInvtNum = item.amount;
    const locationField = ['locationCode', 'areaCode', 'warehouseCode'];
    for (let i = 0, len = locationField.length; i < len; i++) {
      if (item[locationField[i]]) {
        this.selectedLine.locationType = len  - i;
        this.selectedLine.warehouseCode = item[locationField[i]];
        break;
      }
    }
  }
  private getOrderDetail() {
    this.materialDataList = [];
    this.pickingDeliveryService.getOrderDetail(this.orderNo).subscribe((resData: PickingDeliveryServiceNs.PickingDeliveryResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.orderInfo = resData.value;
      // this.stockFilter.areaCode = resData.value.warehouseName;
      resData.value.detailVOList.forEach((item) => {
        item['_this'] = item;
        item['deliveryQty'] = this.utilService.sub(item['amountApply'], item['pickNum']);
        this.materialDataList.push(item);
      });
      this.materialDataList = [...this.materialDataList];
      this.stockTableConfig.headers = [
        {title: '操作', tdTemplate: this.stockOperateTpl, width: 100},
        {title: '仓库编码', field: 'warehouseCode', width: 100},
        {title: '库区编码', field: 'areaCode', width: 150},
        {title: '储位编码', field: 'locationCode', width: 150},
        {title: '库存数量', field: 'amount', width: 100},
      ];
      if (this.orderInfo.agreementFlag === 1) {
        this.detailFieldList = this.baseField.concat(this.agreementField);
        this.locationFilter.type = 1;
        this.stockTableConfig.headers.push(...[
          { title: '协议号', field: 'agreementCode', width: 150},
          { title: '供应商', field: 'supplierName', width: 150}
        ]);
        this.stockFilter.agreementCode = this.orderInfo.agreementCode;
      } else {
        this.stockTableConfig.headers.push(...[
          { title: '保管员', field: 'keeperName', width: 120}
        ]);
        this.detailFieldList = this.baseField;
      }
      this.stockTableConfig = Object.assign({}, this.stockTableConfig);   // 触发表格组件输入属性变化检测
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this.tableConfig = {
      showCheckbox: true,
      checkRowField: '_checked',
      showPagination: true,
      loading: false,
      frontPagination: true,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      headers: [
        {title: '操作', tdTemplate: this.operateTpl, width: 100},
        {title: '行号', field: 'rowNo', width: 80},
        {title: '物料编码', field: 'materialCode', width: 160},
        {title: '物料名称', field: 'materialName', width: 150},
        {title: '单位', field: 'unit', width: 80},
        {title: '计划价', field: 'planPrice', width: 80},
        {title: '出库数量', field: 'amountApply', width: 100},
        {title: '已出库数量', field: 'pickNum', width: 100},
        {title: '本次出库数量', tdTemplate: this.deliveryNumTpl, width: 100},
        {title: '出库储位', field: 'warehouseCode', width: 160},
        {title: '当前库存', tdTemplate: this.nowStockTpl, width: 120},
        {title: '需要日期', field: 'needDate', width: 100, pipe: 'date: yyyy-MM-dd'},
      ]
    };

    this.stockTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [5, 10, 15, 20, 25],
      loading: false,
      pageSize: 5,
      pageNum: 1,
      total: 0,
      headers: []
    };
    this.getOrderDetail();
  }

}
