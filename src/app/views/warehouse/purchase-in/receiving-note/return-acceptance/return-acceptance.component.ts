import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../../layout/layout.module';
import { ReceivingNoteService, ReceivingNoteServiceNs } from '../../../../../core/trans/receiving-note.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { WarehouseWarrantService, WarehouseWarrantServiceNs } from '../../../../../core/trans/warehouseWarrant.service';
import { LocationSelectorNs } from '../../../../../layout/trans/location-selector/location-selector.component';
import { environment } from '../../../../../../environments/environment';
enum ContractTypeEnum {
  Purchase = 1,
  Protocol = 2
}
interface LocationType {
  name?: string;
  userId?: string;
}
enum BarcodeManage {
  UnBarcode,
  Barcode
}
@Component({
  selector: 'app-return-acceptance',
  templateUrl: './return-acceptance.component.html',
  styleUrls: ['./return-acceptance.component.scss']
})
export class ReturnAcceptanceComponent implements OnInit {
  ContractType = ContractTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  @Output() finish: EventEmitter<any>;
  @Input() invoiceNo: string;       // 订单号
  @Input() contractNo: string;      // 合同号
  @Input() contractType: number;    // 合同类型
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('chooseLocation') chooseLocation: TemplateRef<any>;
  @ViewChild('locationTpl') locationTpl: TemplateRef<any>;
  @ViewChild('receivingTpl') receivingTpl: TemplateRef<any>;
  materialTableConfig: UfastTableNs.TableConfig;
  materialDataList: ReceivingNoteServiceNs.MaterialList[]; // 侧边栏物料列表  服务中获取
  show: boolean;
  headerInfo: any;  // 在服务中定义,6个字段
  orderMaterialList: ReceivingNoteServiceNs.PurchaseOrderMaterialList[]; // 采购订单物料信息  在服务里定义material
  rightTableEmit: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent>;

  maxDeliveryCount: number;
  BarcodeManageEnum = BarcodeManage;
  BillType = ReceivingNoteServiceNs.BillType;
  locationSelectFilter: LocationSelectorNs.FilterDataModel;
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;

  constructor(private receivingNoteService: ReceivingNoteService, private warehouseWarrantService: WarehouseWarrantService,
    private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.materialDataList = [];
    this.finish = new EventEmitter<any>();
    this.orderMaterialList = [];
    this.show = false;
    this.headerInfo = <any>{};
    this.rightTableEmit = new EventEmitter();
    this.maxDeliveryCount = 0;
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = 0;
    this.materialNumMax = environment.otherData.materialNumMax;
  }
  getReceivingNoteDetail = () => {
    this.tableConfig.loading = true;
    this.receivingNoteService.getReceivingNoteDetail(this.invoiceNo).subscribe(
      (resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.tableConfig.loading = false;
        this.headerInfo = resData.value.invoiceInfo;
        if (this.headerInfo.contractType === 1) {
          this.locationSelectFilter = {
            type: 0
          };
        } else {
          this.locationSelectFilter = {
            type: 1
          };
        }
        this.orderMaterialList = [];
        resData.value.detailList.forEach((item, index) => {
          const temp = item;
          temp['_this'] = temp;
          temp['_lineId'] = index;
          temp['storedCount'] = 0;
          temp['qtyRcvTolerance'] = item['qtyRcvTolerance'] || 0;
          temp['hasReceiptedAmount'] = item['hasReceiptedAmount'] || 0;
          this.orderMaterialList = [...this.orderMaterialList, temp];
        });
      }, (error: any) => {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }

  public getLocation(id) {
    this.tableConfig.loading = true;
    this.receivingNoteService.getLocation(id).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.tableConfig.loading = false;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public emitFinish() {
    this.finish.emit();
  }

  // 获取侧边栏物料
  getMaterialList = () => {
    const filter = {
      pageNum: this.materialTableConfig.pageNum,
      pageSize: this.materialTableConfig.pageSize,
      filters: {}
    };
    this.materialDataList = [];
    this.materialTableConfig.loading = true;
    this.receivingNoteService.getMaterialSettingList(filter).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.materialTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      resData.value.list.forEach((item) => {
        const temp = <any>{};
        temp['code'] = item.materialVO.code;
        temp['name'] = item.materialVO.name;
        temp['unit'] = item.materialVO.unit;
        temp['barcodeFlag'] = item.managementMode;
        temp['locationCode'] = item.factoryMaterialSpaceVOS.storageCode;
        temp['keeperId'] = item.factoryMaterialSpaceVOS.keeperId;
        temp['keeperName'] = item.factoryMaterialSpaceVOS.keeperName;
        this.materialDataList.push(temp);
      });
      this.materialTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.materialTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showMaterial(event: Event) {
    this.show = !this.show;
    event.stopPropagation();
    if (!this.materialDataList.length) {
      this.getMaterialList();
    }
  }
  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      event.list.forEach((item: any, index: number) => {
        const value = this.orderMaterialList.find(material => item.code === material.materialCode);
        if (!value) {
          const data = {
            materialCode: item.code,
            materialDesc: item.name,
            unitMeasLookupCode: item.unit,
            barcodeFlag: item.barcodeFlag,
            deliveryCount: 0,
            locationCode: item.locationCode,
            keeperId: item.keeperId,
            keeperName: item.keeperName

          };
          data['_this'] = data;
          this.orderMaterialList.push(data);
        }
      });
    } else {
      event.list.forEach((item: any) => {
        const i = this.orderMaterialList.findIndex(itemValue => itemValue.materialCode === item.code);
        this.orderMaterialList.splice(i, 1);
      });
    }
  }

  public delete() {
    const selectData = [];
    this.orderMaterialList.forEach((item) => {
      if (item.checked) {
        selectData.push(item['_lineId']);
      }
    });
    if (selectData.length === 0) {
      this.messageService.showToastMessage('请选择要删除的物料', 'warning');
      return;
    }
    selectData.forEach((item) => {
      this.deleteFun(item);
    });
  }
  public deleteFun(lineId: any) {
    this.orderMaterialList = this.orderMaterialList.filter((item, index) => {
      if (item['_lineId'] === lineId) {
        // this.orderMaterialList.splice(index, 1);
        this.checkChooseMaterial(item.materialsNo);
        this.tableConfig.checkAll = false;
      }
      return item['_lineId'] !== lineId;
    });
  }
  public clear(barcodeFlag: BarcodeManage) {
    const newList = [];
    let checkedLen = 0;
    this.orderMaterialList.forEach((item, index) => {
      if (item.ifCodeManage !== barcodeFlag) {
        newList.push(item);
        checkedLen += item[this.tableConfig.checkRowField] ? 1 : 0;
      } else {
        this.checkChooseMaterial(item.materialCode);
      }
    });
    this.tableConfig.checkAll = checkedLen === 0 ? false : checkedLen === newList.length;
    this.orderMaterialList = newList;
  }

  private checkChooseMaterial(materialsNo: string) {
    this.materialDataList.forEach((item) => {
      if (item.code === materialsNo) {
        item._checked = false;
        this.materialTableConfig.checkAll = false;
      }
    });
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.orderMaterialList.length; i < len; i++) {
      this.orderMaterialList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.orderMaterialList.every((item, index, array) => {
        return item.checked === true;
      });
    }
  }
  public submitReturnAcceptance() {
    const materialList = [];
    let sumReceiptCount = 0;
    this.orderMaterialList.forEach((item) => {
      if (item[this.tableConfig.checkRowField]) {
        const temp = Object.assign({}, item);
        temp['_this'] = undefined;
        temp['_lineId'] = undefined;
        temp['receiptCount'] = item.storedCount;
        if (!temp['receiptCount']) {
          sumReceiptCount++;
        }
        temp['storedCount'] = undefined;
        materialList.push(temp);
      }
    });
    if (!materialList.length) {
      this.messageService.showToastMessage('请选择要退回的物料', 'warning');
      return;
    }
    if (sumReceiptCount) {
      this.messageService.showToastMessage('选择的数据中，本次退回数量不能为0', 'warning');
      return;
    }
    const invoiceInfo = {
      invoiceNo: this.invoiceNo
    };
    this.receivingNoteService.returnAcceptance(invoiceInfo, materialList)
      .subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitFinish();
      });
  }
  public onOkLocation(event: LocationSelectorNs.FilterDataModel[], material: any) {
    material.locationType = event.length;
  }

  ngOnInit() {
    const tableHeaders: UfastTableNs.TableHeader[] = [
      { title: '操作', tdTemplate: this.operationTpl, width: 70, fixed: true },
      { title: '行号', field: 'lineNum', width: 60 },
      { title: '物料编码', field: 'materialsNo', width: 100 },
      { title: '物料名称', field: 'materialsName', width: 200 },
      { title: '单位', field: 'unit', width: 50 },
      { title: '发货数量', field: 'deliveryCount', width: 90 },
      { title: '已验收数量', field: 'billReceiptCount', width: 90 },
      { title: '本次退回数量', tdTemplate: this.receivingTpl, width: 100 },
      { title: '允差(%)', field: 'qtyRcvTolerance', width: 80 },
      { title: '合同行总已验收', field: 'hasReceiptedAmount', width: 120 },
      { title: '保管员', field: 'keeperName', width: 100 },
      { title: '接收人', field: 'noteToReceiver', width: 100 },
    ];
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      checkAll: false,
      checkRowField: 'checked',
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: tableHeaders
    };
    // 物料侧边栏
    this.materialTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: true,
      showPagination: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '物料编码', field: 'code', width: 100 },
      { title: '物料名称', field: 'name', width: 150 }
      ]
    };
    this.getReceivingNoteDetail();
  }

}
