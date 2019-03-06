import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { PickingApplyService, PickingApplyServiceNs } from '../../../../core/trans/picking-apply.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { PickingDelivery } from '../../../../../environments/printData';
import {PrintTplSelectorNs, PrintTplSelectorService} from '../../../../widget/print-tpl-selector/print-tpl-selector';
import { ActionCode } from '../../../../../environments/actionCode';

enum PageTypeEnum {
  ManagePage
}
@Component({
  selector: 'app-picking-package',
  templateUrl: './picking-package.component.html',
  styleUrls: ['./picking-package.component.scss']
})
export class PickingPackageComponent implements OnInit {
  PageType = PageTypeEnum;
  ActionCode = ActionCode;
  selectedPage: PageTypeEnum;
  /**
  * 高级搜索条件
  */
  filters: any;

  /**
  * 高级搜索
  */
  fullSearchShow: boolean;

  /**
  * 模板项
  */
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;

  /**
  * 表头数据
  */
  tableConfig: UfastTableNs.TableConfig;
  /**
  * 表数据
  */
  dataList: any[];
  /**
   * 单据状态
   */
  orderStatusList: any[];
  /**
   * 是否配送
   */
  deliveryMethodList: any[];
  /**
   * 出库类别
   */
  outTypeList: any[];
  sort: string;
  constructor(private pickingApplyService: PickingApplyService,
    private messageService: ShowMessageService,
    private printTplSelector: PrintTplSelectorService) {
    this.selectedPage = this.PageType.ManagePage;
    this.filters = {
      isDistribution: PickingApplyServiceNs.IsDistribution.Distribution,
      status: PickingApplyServiceNs.PickingApplyConfirmStatus.Confirm,
    };
    // 状态默认搜索已确认的
    this.fullSearchShow = false;
    this.dataList = [];
    this.sort = `nlssort(a.receiver_name,'NLS_SORT=SCHINESE_PINYIN_M'),nlssort(f.keeper_name,'NLS_SORT=SCHINESE_PINYIN_M'),nlssort(a.receiver_address,'NLS_SORT=SCHINESE_PINYIN_M')`;
  }
  /**
* 高级搜索显隐
*/
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }
  /**
  * 重置
  */
  public reset() {
    this.filters = {
      isDistribution: PickingApplyServiceNs.IsDistribution.Distribution,
      // status: PickingApplyServiceNs.PickingApplyConfirmStatus.Confirm
    };
    this.getDataList();
  }
  getDataList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const data = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters,
      sort: this.sort
    };
    this.tableConfig.loading = true;
    this.tableConfig.checkAll = false;

    this.pickingApplyService.getPickingOutPackageList(data).subscribe((resData: PickingApplyServiceNs.PickingApplyResT<any>) => {
      this.tableConfig.loading = false;
      this.dataList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.dataList.forEach((item) => {
        if (item.isPrint) {
          item['_trClass'] = ['td-color-class'];
        }
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.dataList.length; i < len; i++) {
      this.dataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.dataList.every((item, index, array) => {
        return item[this.tableConfig.checkRowField] === true;
      });
    }
  }
  public addPickingOut() {
    const data = this.dataList.filter(item => item[this.tableConfig.checkRowField]);
    if (!data.length) {
      this.messageService.showToastMessage('请选择数据', 'warning');
      return;
    }
    let statusFlag = false;
    data.forEach((item) => {
      if (item.status !== PickingApplyServiceNs.PickingApplyConfirmStatus.Confirm) {
        statusFlag = true;
        return;
      }
    });
    if (statusFlag) {
      this.messageService.showToastMessage('请选择已确认的数据', 'warning');
      return;
    }
    const applyDetailIds = [];
    data.forEach((item) => {
      applyDetailIds.push(item.id);
    });
    this.messageService.showLoading();
    this.pickingApplyService.addPickingOutPackage({ applyDetailIds: applyDetailIds }).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getDataList();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public print() {
    const data = this.dataList.filter(item => item[this.tableConfig.checkRowField]);
    if (!data.length) {
      this.messageService.showToastMessage('请选择数据', 'warning');
      return;
    }
    let statusFlag = false;
    data.forEach((item) => {
      if (item.status !== PickingApplyServiceNs.PickingApplyConfirmStatus.GenerateOutOrder) {
        statusFlag = true;
        return;
      }
    });
    if (statusFlag) {
      this.messageService.showToastMessage('已生成出库单的数据才可以打印', 'warning');
      return;
    }
    // 打印
    const distributionNums = [];
    data.forEach((item) => {
      distributionNums.push(item.distributionNum);
    });
    this.pickingApplyService.print({ distributionNums: distributionNums }).subscribe((resData: any) => {
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      const orderDataList = [];
      resData.value.forEach((item) => {
        item.forEach((ele) => {
          const temp = <any>{};
          temp.headerInfo = ele;
          temp.headerInfo.qrcode = ele.pickingNo;
          temp.dataList = ele.detailVOList;
          orderDataList.push(temp);
        });
      });
      this.printTplSelector.showTplSelector({
        printConfig: PickingDelivery,
        orderDataList: orderDataList
      }).subscribe((action: PrintTplSelectorNs.PrintActionType) => {
        if (action === PrintTplSelectorNs.PrintActionType.Error) {
          return;
        }
        const printData = {
          ids: [],
          isPrint: 1
        };
        data.forEach((item) => {
          printData.ids.push(item.id);
        });
        this.pickingApplyService.printAfter(printData).subscribe(() => {
          this.getDataList();
        });
      });
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });



  }
  public sortordChange() {
    this.getDataList();
  }
  public statusChange(status) {
    if (status === PickingApplyServiceNs.PickingApplyConfirmStatus.Confirm) {
      this.sort = `nlssort(a.receiver_name,'NLS_SORT=SCHINESE_PINYIN_M'),nlssort(f.keeper_name,'NLS_SORT=SCHINESE_PINYIN_M'),nlssort(a.receiver_address,'NLS_SORT=SCHINESE_PINYIN_M')`;
    }
    if (status === PickingApplyServiceNs.PickingApplyConfirmStatus.GenerateOutOrder) {
      this.sort = `picking_row_no desc,d.apply_no desc,d.row_no`;
    }
  }


  ngOnInit() {
    this.pickingApplyService.getOrderStatusList().subscribe((orderStatusList) => {
      this.orderStatusList = orderStatusList;
    });
    this.pickingApplyService.getDeliveryMethodList().subscribe((deliveryMethodList) => {
      this.deliveryMethodList = deliveryMethodList;
    });
    this.pickingApplyService.getOutTypeList().subscribe((outTypeList) => {
      this.outTypeList = outTypeList;
    });
    this.tableConfig = {
      id: 'warehouse-pickingPackage',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      checkRowField: '_checked',
      trClassListField: '_trClass',
      headers: [
        { title: '状态', field: 'status', width: 120, pipe: 'pickingApplyConfirmStatus', fixed: true },
        { title: '配送号', field: 'distributionNum', width: 160, fixed: true },
        { title: '领料出库单号', field: 'pickingNo', width: 160, fixed: true },
        { title: '出库行id', field: 'pickingRowNo', width: 160 },
        { title: '出库类型', field: 'type', width: 150 },
        { title: '领料部门', field: 'applyDepartment', width: 150 },
        { title: '工段', field: 'section', width: 150 },
        { title: '收货人', field: 'receiverName', width: 150 },
        { title: '收货地点', field: 'receiverAddress', width: 150 },
        { title: '保管员', field: 'keeperName', width: 150 },
        { title: '客户', field: 'customerName', width: 150 },
        { title: '需要日期', field: 'needDate', width: 150, pipe: 'date:yyyy-MM-dd' },
        { title: '物料类别', field: 'materialType', width: 100, pipe: 'materialType2' },
        { title: '物料编码', field: 'materialCode', width: 150 },
        { title: '物料名称', field: 'materialName', width: 240 },
        { title: '单位', field: 'unit', width: 100 },
        { title: '是否条码管理', field: 'managementMode', width: 130, pipe: 'barcodeManage' },
        { title: '确认数量', field: 'amountConfirm', width: 130 },
        { title: '协议号', field: 'agreementNo', width: 180 },
        { title: '业务实体', field: 'orgName', width: 150 },
        { title: '领料申请单号', field: 'applyNo', width: 170 },
        { title: '领料申请行号', field: 'rowNo', width: 120 },
        { title: '是否配送', field: 'isDistribution', width: 100, pipe: 'isDistribution' },
        { title: '出库状态', field: 'outStatus', width: 100, pipe: 'stockOutStatus' },
        { title: '打印状态', field: 'isPrint', width: 100, pipe: 'pickingOutIsPrint' }
      ]
    };
    this.getDataList();
  }

}
