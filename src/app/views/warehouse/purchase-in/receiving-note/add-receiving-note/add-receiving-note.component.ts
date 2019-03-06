import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import {Form, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../../layout/layout.module';
import { ReceivingNoteService, ReceivingNoteServiceNs } from '../../../../../core/trans/receiving-note.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpRequest } from '@angular/common/http';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
enum ContractTypeEnum {
  Purchase = 1,
  Protocol = 2
}
interface LocationType {
  name?: string;
  userId?: string;
}
enum DepthLevelEnum {
  warehouse,
  warehouseArea,
  location
}
@Component({
  selector: 'app-add-receiving-note',
  templateUrl: './add-receiving-note.component.html',
  styleUrls: ['./add-receiving-note.component.scss']
})
export class AddReceivingNoteComponent implements OnInit {
  ContractType = ContractTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  @Output() finish: EventEmitter<any>;
  @Input() invoiceNo: string;       // 订单号
  @Input() contractNo: string;      // 合同号
  @Input() contractType: number;    // 合同类型
  @Input() addOrder: boolean;       // true：新增，false：编辑
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
  filters: any;
  /**
   * 导入物料
   */
  isToLeadVisible: boolean;
  errorMessage: any;
  formData: any;
  leadInUrl: any;
  fileList: any[];
  href: string;
  materialField = 'materialCode';
  orderForm: FormGroup;
  barcodeFlagList: any[];
  materialNumDec: number;
  materialNumMin: number;
  materialNumMax: number;
  constructor(private receivingNoteService: ReceivingNoteService, private utilService: UfastUtilService,
    private messageService: ShowMessageService, private formBuilder: FormBuilder, private http: HttpClient,
    private cdRef: ChangeDetectorRef) {

    this.materialDataList = [];
    this.finish = new EventEmitter<any>();
    this.orderMaterialList = [];
    this.show = false;
    this.headerInfo = <any>{};
    this.rightTableEmit = new EventEmitter();
    this.maxDeliveryCount = 0;
    this.filters = {};

    this.isToLeadVisible = false;
    this.fileList = [];
    this.errorMessage = [];
    this.formData = new FormData();
    this.leadInUrl = environment.baseUrl.ss + '/warehouseInvoice/import';
    this.href = environment.baseUrl.ss + '/warehouseInvoice/download';
    this.barcodeFlagList = [
      { label: '否', value: 0 },
      { label: '是', value: 1 },
    ];
    this.materialNumDec = environment.otherData.materialNumDec;
    this.materialNumMin = 0;
    this.materialNumMax = environment.otherData.materialNumMax;

  }
  public onBarcodeFlag(value: number) {
    this.clear(value);
    this.filters.managementMode = value;
    this.getMaterialList();
  }
  getReceivingNoteDetail = () => {
    this.tableConfig.loading = true;
    this.receivingNoteService.getContractDetail(this.contractNo).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.headerInfo = resData.value;
      this.orderForm.patchValue(this.headerInfo);
      resData.value.purchaseContractDetailVOs.forEach((item) => {
        const maxDeliveryCount = this.contractType === this.ContractType.Purchase ?
          this.utilService.sub(item['quantity'], item['finishAmount']) : 0;
        const temp = <any>{};
        temp['_this'] = temp;
        temp['_lineId'] = Symbol();
        temp['materialCode'] = item['materialCode'];
        temp['materialDesc'] = item['materialDesc'];
        temp['unitMeasLookupCode'] = item['unitMeasLookupCode'];
        temp['barcodeFlag'] = item['barcodeFlag'];
        temp['locationCode'] = item['locationCode'];
        temp['keeperId'] = item['keeperId'];
        temp['keeperName'] = item['keeperName'];
        temp['quantity'] = item['quantity'];
        temp['receiptCount'] = item['receiptCount'] || 0;
        temp['unDeliveryCount'] = maxDeliveryCount;
        temp['billReceiptCount'] = item['finishAmount'];
        temp['lineNum'] = parseInt(item['lineNum'], 10);
        temp['uomCode'] = item['uomCode'];
        temp['purchaseLineId'] = item['poLineId'];
        temp['qtyRcvTolerance'] = item['qtyRcvTolerance'];
        temp['hasReceiptedAmount'] = item['hasReceiptedAmount'];
        temp['noteToReceiver'] = item['noteToReceiver'];
        this.orderMaterialList.push(temp);
      });
      this.orderMaterialList = [...this.orderMaterialList];
      this.tableConfig.total = resData.value.purchaseContractDetailVOs.length;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public emitFinish(value) {
    this.finish.emit(value);
  }


  // 获取侧边栏物料
  getMaterialList = () => {
    const filter = {
      pageNum: this.materialTableConfig.pageNum,
      pageSize: this.materialTableConfig.pageSize,
      filters: this.filters
    };
    this.materialDataList = [];
    this.materialTableConfig.loading = true;
    this.receivingNoteService.getMaterialSettingList(filter).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.materialTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialDataList = resData.value.list.map((item) => {
        const temp = <any>{};
        temp['_this'] = temp;
        temp['materialCode'] = item.materialVO.code;
        temp['name'] = item.materialVO.materialDesc;
        temp['unit'] = item.materialVO.unit;
        temp['barcodeFlag'] = item.managementMode;
        if (item.factoryMaterialSpaceVOS && item.factoryMaterialSpaceVOS[0]) {
          temp.locationCode = item.factoryMaterialSpaceVOS[0].storageCode;
          temp.keeperId = item.factoryMaterialSpaceVOS[0].keeperId;
          temp.keeperName = item.factoryMaterialSpaceVOS[0].keeperName;
        }
        return temp;
      });
      const selectedList = [];
      this.orderMaterialList.forEach((item) => {
        selectedList.push(item[this.materialField]);
      });
      this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Checked, selectedList, true);
      this.materialTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.materialTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showMaterial(event: Event) {
    if (this.orderForm.controls['ifCodeManage'].invalid) {
      this.messageService.showToastMessage('请选择是否条码管理', 'warning');
      this.orderForm.controls['ifCodeManage'].markAsDirty();
      this.orderForm.controls['ifCodeManage'].updateValueAndValidity();
      return;
    }
    this.show = !this.show;
    event.stopPropagation();
    if (!this.materialDataList.length) {
      this.getMaterialList();
    }
  }
  public chooseMaterial(event: RightSideTableBoxNs.SelectedChange<any>) {
    let maxLineNum = 0;
    this.orderMaterialList.forEach((item) => {
      if (item.lineNum > maxLineNum) {
        maxLineNum = item.lineNum;
      }
    });
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      this.tableConfig.checkAll = false;
      event.list.forEach((item: any, index: number) => {
        const value = this.orderMaterialList.find(material => item.materialCode === material.materialCode);
        if (!value) {
          const data = {
            materialCode: item.materialCode,
            materialDesc: item.name,
            unitMeasLookupCode: item.unit,
            barcodeFlag: item.barcodeFlag,
            receiptCount: 0,
            locationCode: item.locationCode,
            keeperId: item.keeperId,
            keeperName: item.keeperName,
            lineNum: ++maxLineNum,
            qtyRcvTolerance: 0,
            hasReceiptedAmount: 0,
            noteToReceiver: item.noteToReceiver
          };
          data['_this'] = data;
          data['_lineId'] = Symbol();
          this.orderMaterialList.push(data);
        }
      });
      this.orderMaterialList = [...this.orderMaterialList];
    } else {
      event.list.forEach((item: any) => {
        const i = this.orderMaterialList.findIndex(itemValue => itemValue.materialCode === item.materialCode);
        this.orderMaterialList.splice(i, 1);
      });
    }
  }
  private checkChooseMaterial(type: number, idList: string[], updateOrigin: boolean = false, all: boolean = false) {
    const event: RightSideTableBoxNs.SelectedChangeEvent = {
      type: type,
      all: all,
      idList: idList,
      updateOrigin: updateOrigin
    };
    this.rightTableEmit.emit(event);
  }
  /**
   * 批量删除订单中的物料
   * */
  public delete() {
    const selectData = [];
    this.orderMaterialList.forEach((item) => {
      if (item.checked) {
        selectData.push(item);
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
  /**
   * 删除单个物料并和物料选择表关联
   * */
  public deleteFun(material: any) {
    const idList: string[] = [];
    this.orderMaterialList = this.orderMaterialList.filter((item) => {
      if (material === item) {
        idList.push(item['materialCode']);
      }
      return material !== item;
    });
    if (!this.orderMaterialList.length) {
      this.tableConfig.checkAll = false;
    }
    this.cdRef.detectChanges();
    this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, idList);
  }
  public clear(barcodeFlag: number) {
    const newList = [];
    this.orderMaterialList.forEach((item, index) => {
      if (item.barcodeFlag !== barcodeFlag) {
        this.checkChooseMaterial(RightSideTableBoxNs.SelectedChangeType.Unchecked, [item[this.materialField]]);
      } else {
        newList.push(item);
      }
    });
    this.orderMaterialList = newList;
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
      this.tableConfig.checkAll = this.orderMaterialList.every((item) => {
        return item.checked === true;
      });
    }
  }

  public submitReceivingNote() {
    Object.keys(this.orderForm.controls).forEach((key: string) => {
      this.orderForm.controls[key].markAsDirty();
      this.orderForm.controls[key].updateValueAndValidity();
    });
    if (this.orderForm.invalid) {
      return false;
    }
    const materialList = [];
    let receiptCount = 0;
    this.orderMaterialList.forEach((item) => {
      if (item[this.tableConfig.checkRowField]) {
        materialList.push({
          materialsNo: item.materialCode,
          materialsName: item.materialDesc,
          unit: item.unitMeasLookupCode,
          ifCodeManage: item.barcodeFlag,
          locationCode: item.locationCode,
          keeperId: item.keeperId,
          keeperName: item.keeperName,
          receiptCount: item.receiptCount,
          billReceiptCount: item.billReceiptCount,
          orderCount: item.quantity,
          lineNum: item.lineNum,
          uomCode: item['uomCode'],
          purchaseLineId: item['purchaseLineId'],
          noteToReceiver: item['noteToReceiver']
        });
        if (!item.receiptCount) {
          receiptCount ++;
        }
      }
    });
    if (!materialList.length) {
      this.messageService.showToastMessage('请选择要验收的物料', 'warning');
      return;
    }
    if (receiptCount) {
      this.messageService.showToastMessage('选择的数据中，本次验收数量不能为0', 'warning');
      return;
    }

    const submitHeadInfo: any = {};
    submitHeadInfo.deliveryType = this.contractType;
    submitHeadInfo.purchaseNo = this.headerInfo.purchaseNo;
    submitHeadInfo.supplierName = this.headerInfo.vendorName;
    submitHeadInfo.goodsReceivor = this.headerInfo.shipToName;
    submitHeadInfo.contractType = this.contractType;
    submitHeadInfo['purchaseHeaderId'] = this.headerInfo['poHeaderId'];
    submitHeadInfo.ifCodeManage = this.orderForm.value.ifCodeManage;
    // let locationFlag = false;
    // if (locationFlag) {
    //   this.messageService.showToastMessage('默认储位不为空', 'warning');
    //   return;
    // }
    submitHeadInfo.billType = 1;
    this.messageService.showLoading();
    this.receivingNoteService.acceptanceReceipt(submitHeadInfo, materialList)
      .subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish(true);
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public location(event) {
    event.forEach((item) => {
      this.orderMaterialList.forEach((locationItem) => {
        if (item.code === locationItem.locationCode) {
          locationItem.keeperId = item.keeperId;
          locationItem.keeperName = item.keeperName;
        }
      });
    });
  }

  showToLeadModal(): void {
    this.isToLeadVisible = true;
  }

  beforeUpload = (file): boolean => {
    this.fileList.push(file);
    return false;
  }

  handleOk(): void {
    if (!this.fileList.length) {
      this.messageService.showToastMessage('请选择文件', 'warning');
      return;
    }
    if (this.errorMessage.length !== 0) {
      this.messageService.showAlertMessage('', '请重新选择文件', 'error');
      this.messageService.closeLoading();
      return;
    }
    this.fileList.forEach((file: any) => {
      this.formData.append('files[]', file);
    });
    this.messageService.showLoading();
    const req = new HttpRequest('POST', this.leadInUrl, this.formData, {});
    this.http.request(req).subscribe((event: any) => {

      this.messageService.closeLoading();
      if (event.type === 4) {
        if (event.body.code !== 0) {
          this.messageService.showAlertMessage('', event.body.message, 'error');
          this.formData = new FormData;
          return;
        }
        this.fileList = [];
        this.isToLeadVisible = false;
        let lineNum = 0;
        this.orderMaterialList.forEach((item) => {
          if (item.lineNum > lineNum) {
            lineNum = item.lineNum;
          }
        });
        event.body.value.forEach((item) => {
          let temp = <any>{};
          temp = item;
          temp['_this'] = temp;
          temp['materialCode'] = item['materialsNo'];
          temp['materialDesc'] = item['materialsDes'];
          temp['unitMeasLookupCode'] = item['unit'];
          temp['receiptCount'] = item['qty'];
          temp['locationCode'] = ' ';
          temp['lineNum'] = ++lineNum;
          temp['qtyRcvTolerance'] = 0;
          temp['hasReceiptedAmount'] = 0;
          temp['noteToReceiver'] = item['noteToReceiver'];
          this.orderMaterialList.push(temp);
        });
        this.orderMaterialList = [...this.orderMaterialList];
        this.formData = new FormData;
      }
    }, (err: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', 'upload failed.', 'error');
    });
  }

  handleToLeadCancel(): void {
    this.isToLeadVisible = false;
  }

  ngOnInit() {
    this.orderForm = this.formBuilder.group({
      ifCodeManage: [null, Validators.required]
    });
    const tableHeaders: UfastTableNs.TableHeader[] = [
      { title: '操作', tdTemplate: this.operationTpl, width: 100, fixed: true },
      { title: '行号', field: 'lineNum', width: 60 },
      { title: '物料编码', field: 'materialCode', width: 100 },
      { title: '物料描述', field: 'materialDesc', width: 200 },
      { title: '单位', field: 'unitMeasLookupCode', width: 80 },
      { title: '是否条码管理', field: 'barcodeFlag', width: 120, pipe: 'barcodeManage' },
      { title: '本次验收数量', tdTemplate: this.receivingTpl, width: 150 },
      { title: '允差(%)', field: 'qtyRcvTolerance', width: 80 },
      { title: '合同行总已验收', field: 'hasReceiptedAmount', width: 120 },
      // { title: '默认储位', tdTemplate: this.locationTpl, width: 250 },
      { title: '接收人', field: 'noteToReceiver', width: 100 },
      { title: '保管员', field: 'keeperName', width: 100 }
    ];
    if (this.contractType === this.ContractType.Purchase) {
      tableHeaders.push(
        { title: '订单数量', field: 'quantity', width: 100 },
        { title: '已发货数量', field: 'billReceiptCount', width: 100 }
      );
    }
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      checkAll: false,
      checkRowField: 'checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: tableHeaders
    };
    // 物料侧边栏
    this.materialTableConfig = {
      pageSize: 10,
      yScroll: 400,
      showCheckbox: true,
      showPagination: true,
      checkAll: false,
      checkRowField: '_checked',
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{ title: '物料编码', field: 'materialCode', width: 100 },
      { title: '物料名称', field: 'name', width: 150 }
      ]
    };
    if (this.addOrder) {
      this.getReceivingNoteDetail();
    }
  }

}
