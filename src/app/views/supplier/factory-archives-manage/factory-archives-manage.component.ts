import { ActionCode } from './../../../../environments/actionCode';
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {DictionaryService, DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
import {SupplierManageNs, SupplierManageService} from '../../../core/trans/supplier-manage.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {Observable} from 'rxjs/Observable';
import {SupplierEditEvent} from '../supplier-edit/supplier-edit.component';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {UploadModalService} from '../../../widget/upload-modal/upload-modal';
import {ImportFileType} from '../component/archives-import-file/archives-import-file.component';
enum ArchivePageType {
  MainPage,
  DetailPage,
  EditPage,
  ToSelefPage,
  RecommendComPage,
  ImportPage
}
interface ActionStatus {
  edit: boolean;
  statusChange: boolean;
  creditCodeChange: boolean;
  gradeImport: boolean;
  supplierImport: boolean;
  recommendCommon: boolean;
}
@Component({
  selector: 'app-factory-archives-manage',
  templateUrl: './factory-archives-manage.component.html',
  styleUrls: ['./factory-archives-manage.component.scss']
})
export class FactoryArchivesManageComponent implements OnInit {
  @ViewChild('codeTpl') codeTpl: TemplateRef<any>;
  @ViewChild('operateTpl') operateTpl: TemplateRef<any>;
  @ViewChild('uploadTopTpl')uploadTopTpl: TemplateRef<any>;
  PageTypeEnum = ArchivePageType;
  currentPage: ArchivePageType;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  supplyScopeList: DictionaryServiceNs.DictItemModel[];
  companyNatureList: DictionaryServiceNs.DictItemModel[];
  supplierStatusList: SupplierManageNs.SelectItemModel[];
  advancedSearchShow: boolean;
  actionStatus: { [index: string]: ActionStatus };
  filters: any;
  supplierBasic: any;
  showStatusModal: boolean;
  statusForm: FormGroup;
  statusOptional: any[];
  selectedId: string;
  fixedCreditCode: boolean;
  operationSupplierId: string;
  recommendSource = SupplierManageNs.RecommendSource.SelfToCommon;
  downloadTplUrl: string;
  ActionCode = ActionCode;
  importType: ImportFileType;
  compantTypeList: DictionaryServiceNs.DictItemModel[];
  constructor(private messageService: ShowMessageService, private supplierInfoService: SupplierInfoService,
              private dictService: DictionaryService, private supplierManageService: SupplierManageService,
              private formBuilder: FormBuilder, private router: Router, private uploadModalService: UploadModalService) {
    this.supplierBasic = {};
    this.currentPage = this.PageTypeEnum.MainPage;
    this.actionStatus = {};
    this.advancedSearchShow = false;
    this.supplyScopeList = [];
    this.companyNatureList = [];
    this.supplierStatusList = [];
    this.filters = {};
    this.showStatusModal = false;
    this.downloadTplUrl = environment.baseUrl.bs + '/supplierFactory/downloadSupplierState';
    this.importType = ImportFileType.Supplier;
    this.compantTypeList = [];
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getDataList();
  }
  public advancedSearchBtn() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public onChangeStatus(id) {
    this.showStatusModal = true;
    this.selectedId = id;
    this.statusForm.reset();
  }
  public onCancelStatus() {
    this.showStatusModal = !this.showStatusModal;
  }
  public goEditPage(id: string) {
    this.getSupplierBasic(id, this.PageTypeEnum.EditPage);
    this.fixedCreditCode = true;
  }
  public goEditUpdateCredit(id: string) {
    this.fixedCreditCode = false;
    this.getSupplierBasic(id, this.PageTypeEnum.EditPage);
  }
  public goDetialPage(id: string) {
    this.getSupplierBasic(id, this.PageTypeEnum.DetailPage);
  }
  private getSupplierBasic(id: string, toPageType) {
    this.supplierBasic = {};
    this.messageService.showLoading('');
    this.supplierManageService.getArchivesItem(id)
      .subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.supplierBasic = resData.value;
        this.currentPage = toPageType;
      }, (error) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }

  private getDataDict() {
    const observerComNature = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.CompanyNature});
    const observerIndustry = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.SuppliyScope});
    const observerCompantType = this.dictService.getDataDictionarySearchList({parentCode: DictionaryServiceNs.TypeCode.CompanyType});
    const tempList = [this.companyNatureList, this.supplyScopeList, this.compantTypeList];
    Observable.forkJoin(observerComNature, observerIndustry, observerCompantType)
      .subscribe((resData: any[]) => {
        resData.forEach((item, index: number) => {
          tempList[index].length = 0;
          if (item.code !== 0) {
            this.messageService.showToastMessage(item.message, 'error');
          }
          tempList[index].push(...item.value);
        });
      }, (error) => {
        tempList.forEach((item) => {
          item.length = 0;
        });
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    this.supplierManageService.getSupplierStatusList().subscribe((resData) => {
      this.supplierStatusList = resData.filter(item => item.id >= SupplierManageNs.SupplierStatus.Temporary);
      this.statusOptional = resData.filter(item => item.id >= SupplierManageNs.SupplierStatus.Standby);
    });
  }

  public trackByItem(index: number, item: any) {
    return item;
  }
  public onStatusOk() {
    Object.keys(this.statusForm.controls).forEach((key) => {
      this.statusForm.controls[key].markAsDirty();
      this.statusForm.controls[key].updateValueAndValidity();
    });
    if (this.statusForm.invalid) {
      return;
    }
    const formValue = this.statusForm.getRawValue();
    let submitHander = null;
    switch (formValue.status) {
      case SupplierManageNs.SupplierStatus.Standby:
        submitHander = this.supplierManageService.setAlternative(this.selectedId, formValue.time);
        break;
      case SupplierManageNs.SupplierStatus.Pause:
        submitHander = this.supplierManageService.setPause(this.selectedId, formValue.time);
        break;
      default:
        break;
    }
    this.messageService.showLoading('');
    this.onCancelStatus();
    submitHander.subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getDataList();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  getDataList = () => {
    const data = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: this.filters
    };
    this.actionStatus = {};
    this.dataList = [];
    this.dataTableConfig.loading = true;
    this.supplierManageService.factoryArchivesList(data).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.dataTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.dataTableConfig.total = resData.value.total;
      this.dataList.forEach((item) => {
        if (item.qualityProblemNum === 0) {
          item.qualityProblemNum = undefined;
        }
        if (item.contractViolationNum === 0) {
          item.contractViolationNum = undefined;
        }
        this.actionStatus[item.id] = {
          edit: true,
          statusChange: item.status !== SupplierManageNs.SupplierStatus.Pause,
          creditCodeChange: true,
          gradeImport: true,
          supplierImport: true,
          recommendCommon: true
        };
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
      this.dataTableConfig.loading = false;
    });
  }
  public returnMainPage() {
    this.currentPage = this.PageTypeEnum.MainPage;
    this.getDataList();
  }
  public onSupplierInfoSubmit(data: SupplierEditEvent) {
    const submitData = {
      supplierBasicVO: data.basicInfo,
      supplierContactVOS: data.contactList,
      supplierFileVOS: data.qualFileList,
      supplierId: this.supplierBasic.id
    };
    // submitData.supplierBasicVO.supplierSupplyRangeVOS = [];
    // submitData.supplierBasicVO.supplyRange = '';
    // submitData.supplierBasicVO['supplierSupply'].forEach((id: string) => {
    //   const temp = this.supplyScopeList.find(item => item.id === id);
    //   submitData.supplierBasicVO.supplierSupplyRangeVOS.push({
    //     supplyRangeCode: temp.code,
    //     supplyRangeName: temp.name,
    //     recommendId: temp.id
    //   });
    //   submitData.supplierBasicVO.supplyRange += `${temp.name}|`;
    // });
    // submitData.supplierBasicVO['supplierSupply'] = undefined;
    // submitData.supplierBasicVO.supplyRange = submitData.supplierBasicVO.supplyRange
    //   .substr(0, submitData.supplierBasicVO.supplyRange.length - 1);
    let submitHandler = null;
    if (this.fixedCreditCode) {
      submitHandler = this.supplierManageService.updateSupplierInfo(submitData);
    } else {
      submitHandler = this.supplierManageService.changeSocialCreditCode(submitData);
    }
    this.messageService.showLoading('');
    submitHandler.subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.returnMainPage();
      this.getDataList();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  /**
   * 挑选潜在供应商*/
  public selectedSupplier() {
    this.router.navigateByUrl('/main/supplier/lurkingSupplier');
  }
  public selectSelfSuppleir() {
    this.currentPage = this.PageTypeEnum.ToSelefPage;
  }
  public recommendCommon(supplierId: string) {
    this.operationSupplierId = supplierId;
    this.currentPage = this.PageTypeEnum.RecommendComPage;
  }
  /**
   * 合格供应商导入*/
  public importSupplier() {
    // this.downloadTplUrl = environment.baseUrl.bs + '/supplierFactory/downloadSupplierState';
    // this.importExcel('合格供应商导入', '/supplierFactory/importSupplierState');
    this.importType = ImportFileType.Supplier;
    this.currentPage = this.PageTypeEnum.ImportPage;
  }
  private importExcel(title: string, path) {
    this.uploadModalService.showUploadModal({
      uploadUrl: environment.baseUrl.bs + path,
      title: title,
      okText: null,
      cancelText: null,
      maxFileNum: 1,
      fileType: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      topTpl: this.uploadTopTpl,
      addBtuText: '导入',
      onResponse: this.onUploadResponse,
      modalWidth: 380
    });
  }
  onUploadResponse = (resData) => {
    if (resData.code === 0) {
      this.getDataList();
      return true;
    }
    return false;
  }
  ngOnInit() {
    this.dataTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      id: 'supplier-factoryArchivesManage',
      headers: [
        {title: '操作', tdTemplate: this.operateTpl, width: 230, fixed: true},
        {title: '代码', tdTemplate: this.codeTpl, width: 170, fixed: true},
        {title: '公司名称', field: 'name', width: 150},
        {title: '类别', field: 'materialType', width: 100, pipe: 'materialType2'},
        {title: '状态', field: 'status', width: 100, pipe: 'supplierStatus'},
        {title: '等级', field: 'grade', width: 100},
        {title: '合同违约', field: 'contractViolationNum', width: 100},
        {title: '质量问题', field: 'qualityProblemNum', width: 100},
        {title: '限定供应范围', field: 'supplyRange', width: 150},
        {title: '企业性质', field: 'companyNature', width: 100},
        {title: '企业类型', field: 'companyType', width: 100},
        {title: '证书过期', field: 'certStatus', width: 100, pipe: 'certificatePast'},
        {title: '办公地址', field: 'contactAddress', width: 180},
      ]
    };
    this.getDataDict();
    this.getDataList();
    this.statusForm = this.formBuilder.group({
      status: [null, [Validators.required]],
      time: [null, [Validators.required]]
    });
  }

}
