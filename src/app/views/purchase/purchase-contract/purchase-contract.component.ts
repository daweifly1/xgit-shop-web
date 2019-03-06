import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PurchaseContractServiceNs, PurchaseContractService } from '../../../core/trans/purchase-contract.service';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { UfastUtilService } from '../../../core/infra/ufast-util.service';
import { ActionCode } from '../../../../environments/actionCode';
import { SignPdfResult } from '../../../layout/trans/trust-sign-pdf/trust-sign-pdf.component';
import { environment } from '../../../../environments/environment';
enum TabPageTypeEnum {
  MainPage,
  DetailPage,
  EditPage,
  SignSealPage,
  AuditCancelPage,
  ContractDetailPage,
}
enum ContractDetailPageEnum {
  DetailPage = 1,
  ApplyReturn,
  ReturnAudit
}
export interface ActionStatus {
  download: boolean;
  sign: boolean;
  applyCancel: boolean;
  auditCancel: boolean;
  erpSync: boolean;
}

@Component({
  selector: 'app-purchase-contract',
  templateUrl: './purchase-contract.component.html',
  styleUrls: ['./purchase-contract.component.scss']
})
export class PurchaseContractComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public TabPageType = TabPageTypeEnum;
  selectedPage = this.TabPageType.MainPage;
  public filters = <any>{};
  public contractList: PurchaseContractServiceNs.ContractListData[] = [];
  public contractTableConfig: UfastTableNs.TableConfig;
  public isShowAdvancedSearch = false;
  public currId = '';
  public actionStatus: { [id: string]: ActionStatus } = {};
  public ActionCode = ActionCode;
  selectedContractUrl: string;
  baseDownloadUrl = environment.baseUrl.ps + '/cfca/createcontractpdf/';
  ftpService = environment.otherData.fileServiceUrl;
  isContractDetailPage: number;
  ContractDetailPage = ContractDetailPageEnum;
  constructor(private contractService: PurchaseContractService,
    private messageService: ShowMessageService,
    private ufastService: UfastUtilService) {
    this.isContractDetailPage = this.ContractDetailPage.DetailPage;
  }
  public getContractList = () => {
    const filters = {};
    Object.keys(this.filters).forEach((item) => {
      if (item === 'createDateStart') {
        filters[item] = this.ufastService.getStartDate(this.filters[item]);
        return;
      }
      if (item === 'createDateEnd') {
        filters[item] = this.ufastService.getEndDate(this.filters[item]);
        return;
      }
      if (typeof filters[item] !== 'number') {
        filters[item] = this.filters[item];
        return;
      }
      filters[item] = this.filters[item].trim();
    });
    const paramsData = {
      pageSize: this.contractTableConfig.pageSize,
      pageNum: this.contractTableConfig.pageNum,
      filters: filters
    };
    this.contractService.getContractList(paramsData).subscribe((resData) => {
      this.contractList = [];
      this.contractTableConfig.total = resData.value.pageInfo.total;
      this.contractList = resData.value.pageInfo.list;
      this.actionStatus = {};
      this.contractList.forEach((item) => {
        this.actionStatus[item.id] = {
          download: !!item.annexUrl,
          sign: ((item.status === PurchaseContractServiceNs.ContractStatus.WaitBuyerSign && !resData.value.isSupplier) ||
            (item.status === PurchaseContractServiceNs.ContractStatus.WaitSupplierSign && resData.value.isSupplier))
            && (item.returnStatus !== PurchaseContractServiceNs.ContractCancelStatus.Auditing),
          // applyCancel: (item.returnStatus === PurchaseContractServiceNs.ContractCancelStatus.UnapplyCancel ||
          //               item.returnStatus === null || item.returnStatus === PurchaseContractServiceNs.ContractCancelStatus.AuditRefuse),
          applyCancel: item.status !== PurchaseContractServiceNs.ContractStatus.Invalid
           && item.returnStatus !== PurchaseContractServiceNs.ContractCancelStatus.Auditing,
          auditCancel: item.returnStatus === PurchaseContractServiceNs.ContractCancelStatus.Auditing,
          erpSync: (item.status === PurchaseContractServiceNs.ContractStatus.Effectived) &&
            (item.returnStatus === PurchaseContractServiceNs.ContractCancelStatus.UnapplyCancel ||
              item.returnStatus === PurchaseContractServiceNs.ContractCancelStatus.AuditRefuse) &&
            (item.erpSyncFlag !== PurchaseContractServiceNs.ErpSyncFlag.Finish)
        };
      });
    });
  }
  public onApplyCancel(id: string) {
    this.currId = id;
    this.isContractDetailPage = this.ContractDetailPage.ApplyReturn;
    this.selectedPage = this.TabPageType.ContractDetailPage;
  }
  public onCancelAudit(id: string) {
    this.currId = id;
    this.isContractDetailPage = this.ContractDetailPage.ReturnAudit;
    this.selectedPage = this.TabPageType.AuditCancelPage;
  }
  public passCancel() {
    this.doAuditCancel('通过', this.contractService.agreeCancelContract.bind(this.contractService));
  }
  public rejectCancel() {
    this.doAuditCancel('拒绝', this.contractService.rejectCancelContract.bind(this.contractService));
  }
  private doAuditCancel(msg: string, handler: Function) {
    this.messageService.showAlertMessage('', `确定审核${msg}?`, 'confirm').afterClose
      .subscribe((type) => {
        if (type !== 'onOk') {
          return;
        }
        handler(this.currId).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.onChildEmit(true);
        });
      });
  }
  public showAdvancedSearch() {
    this.isShowAdvancedSearch = true;
  }
  public closeAdvancedSearch() {
    this.isShowAdvancedSearch = false;
  }
  public resetSearch() {
    this.filters = {};
    this.getContractList();
  }
  public showDetail(id) {
    this.currId = id;
    this.selectedPage = this.TabPageType.DetailPage;
  }
  public exitSignPage(data: SignPdfResult) {
    if (data === null) {
      this.selectedPage = this.TabPageType.MainPage;
      return;
    }
    if (data && !data.success) {
      return;
    }
    const dataItem = this.contractList.find(item => item.id === this.currId);
    let reqHandler: any = null;
    if (dataItem.status === PurchaseContractServiceNs.ContractStatus.WaitBuyerSign) {
      reqHandler = this.contractService.buyerSignContract(this.currId, data.filePath);
    } else {
      reqHandler = this.contractService.supplierSignContract(this.currId, data.filePath);
    }
    reqHandler.subscribe((resData: any) => {
      if (resData.code !== 0) {
        alert(`签章失败:${resData.message}`);
        return;
      }
      this.messageService.showToastMessage('签章成功', 'success');
      this.getContractList();
      this.selectedPage = this.TabPageType.MainPage;
    }, (error) => {
      alert(error.message);
    });
  }
  public signContract(id: string, annexUrl?: string) {
    this.currId = id;
    this.selectedPage = this.TabPageType.SignSealPage;
    this.selectedContractUrl = annexUrl ? (this.ftpService + annexUrl) : (this.baseDownloadUrl + id);
  }
  public onChildEmit(refresh) {
    this.selectedPage = this.TabPageType.MainPage;
    if (refresh) {
      this.getContractList();
    }
  }
  public editContract(id) {
    this.currId = id;
    this.selectedPage = this.TabPageType.EditPage;
  }
  public disabledEndDate = (endDate) => {
    if (!this.filters.createDateStart) {
      return false;
    }
    return endDate.getTime() < this.filters.createDateStart.getTime();
  }
  public disabledStartDate = (startDate) => {
    if (!this.filters.createDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.createDateEnd.getTime();
  }
  public doErpSync(id) {
    const ids = [];
    ids.push(id);
    this.contractService.erpSync(ids).subscribe((resData: any) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.getContractList();
    });

  }
  public contractDetail(id) {
    this.currId = id;
    this.isContractDetailPage = this.ContractDetailPage.DetailPage;
    this.selectedPage = this.TabPageType.ContractDetailPage;
  }
  ngOnInit() {
    this.contractTableConfig = {
      id: 'purchase-contract',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 190, fixed: true },
        { title: '合同编号', tdTemplate: this.showDetailTpl, width: 150, fixed: true },
        { title: '状态', field: 'status', pipe: 'purchaseContractStatus', width: 100 },
        { title: '申请退回状态', field: 'returnStatus', pipe: 'purchaseContractCancelStatus', width: 120 },
        { title: '供应商', field: 'supplierName', width: 100 },
        { title: '合同金额', field: 'totalAmount', width: 100 },
        { title: '收货方', field: 'receivingParty', width: 100 },
        { title: '合同类型', field: 'contractType', pipe: 'purchaseContractType', width: 100 },
        { title: '业务实体', field: 'orgName', width: 100 },
        // {title: '发货方', field: 'contractCode', width: 100},
        { title: '业务员', field: 'purchaseUser', width: 100 },
        { title: '创建日期', field: 'createDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: 'ERP同步', field: 'erpSyncFlag', pipe: 'erpSyncFlag', width: 100 },
        { title: 'ERP同步信息', field: 'erpSyncMessage', width: 120 }
      ]
    };
    this.getContractList();
  }

}
