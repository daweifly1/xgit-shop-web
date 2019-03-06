import { ActionCode } from './../../../../../environments/actionCode';
import {Component, OnInit, Output, Input, EventEmitter, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {SupplierManageNs, SupplierManageService} from '../../../../core/trans/supplier-manage.service';
import {Observable} from 'rxjs/Observable';
import {SupplierInfoNs} from '../../../../core/trans/supplier-info.service';
import {environment} from '../../../../../environments/environment';
enum PageType {
  BasicInfoPage,
  ContactPage,
  QualFilePage      // 资质文件
}
@Component({
  selector: 'app-modify-detail',
  templateUrl: './modify-detail.component.html',
  styleUrls: ['./modify-detail.component.scss']
})
export class ModifyDetailComponent implements OnInit {
  @Input() id: string;
  @Output() finish: EventEmitter<any>;
  @Input() headerTpl: TemplateRef<any>;
  @ViewChild('fileAffixTpl') fileAffixTpl: TemplateRef<any>;
  leftMenuList: {id: number; name: string; }[];
  PageTypeEnum = PageType;
  currentPage: PageType;
  newBasicInfo: any;
  oldBasicInfo: any;
  changedBasicField: string[];
  hideBasicField: string[];

  contactTableConfig: UfastTableNs.TableConfig;
  oldContactList: SupplierInfoNs.SupplierContact[];
  newContactList: SupplierInfoNs.SupplierContact[];
  contactChangeMap: any;

  fileTableConfig: UfastTableNs.TableConfig;
  oldFileList: SupplierInfoNs.QualFileItem[];
  newFileList: SupplierInfoNs.QualFileItem[];
  fileChangeMap: any;
  downloadUrl: string;
  viewQualFileUrl: string;
  viewQualFielModalShow: boolean;
  ActionCode = ActionCode;
  constructor(private messageService: ShowMessageService, private supplierManageService: SupplierManageService) {
    this.oldContactList = [];
    this.newContactList = [];
    this.contactChangeMap = {};
    this.finish = new EventEmitter<any>();
    this.leftMenuList = [
      {id: PageType.BasicInfoPage, name: '基本信息'},
      {id: PageType.ContactPage, name: '联系人信息'},
      {id: PageType.QualFilePage, name: '资质文件'},
    ];
    this.currentPage = this.PageTypeEnum.BasicInfoPage;
    this.newBasicInfo = {};
    this.oldBasicInfo = {};
    this.changedBasicField = [];
    this.hideBasicField = [];
    this.contactTableConfig = <any>{
      headers: []
    };
    this.fileTableConfig = <any>{
      headers: []
    };
    this.oldFileList = [];
    this.newFileList = [];
    this.downloadUrl = environment.otherData.fileServiceUrl;
    this.viewQualFielModalShow = false;
  }
  public quitDetailPage() {
    this.finish.emit();
  }
  public onBasicShowChange(value: boolean) {
    if (!value) {
      this.hideBasicField = [];
      return;
    }
    this.hideBasicField = Object.keys(this.oldBasicInfo).filter( key => this.changedBasicField.indexOf(key) === -1);
  }
  public modifyAuditPass() {
    this.doAudit('确定审核通过吗?', () => {
      return this.supplierManageService.modifyAuditPass(this.id);
    });
  }
  public modifyAuditReject() {
    this.doAudit('确定审核拒绝吗?', () => {
      return this.supplierManageService.modifyAuditReject(this.id);
    });
  }
  private doAudit(message: string, callback: () => Observable<any>) {
    this.messageService.showAlertMessage('', message, 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        callback().subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.finish.emit();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  private getModifyInfoDetail() {
    this.messageService.showLoading();
    this.supplierManageService.getModifyDetail(this.id).subscribe((resData: SupplierManageNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      const changeInfoMap = resData.value.changeInfoMap || {};
      if  (changeInfoMap.registAreaCode) {
        changeInfoMap.registAreaName = changeInfoMap.registAreaCode;
        delete changeInfoMap.registAreaCode;
      }
      if (changeInfoMap.workAreaCode) {
        changeInfoMap.workAreaName = changeInfoMap.workAreaCode;
        delete changeInfoMap.workAreaCode;

      }
      this.oldBasicInfo = resData.value.supplierBasicVO;
      this.newBasicInfo = Object.assign(Object.assign({}, this.oldBasicInfo), changeInfoMap);
      this.changedBasicField = Object.keys(changeInfoMap);

      this.oldContactList = resData.value.oldSupplierContactVOS || [];
      this.newContactList = resData.value.newSupplierContactVOS || [];
      this.contactChangeMap = {};
      this.findChange(this.oldContactList, this.newContactList, this.contactChangeMap);

      this.oldFileList = resData.value.oldSupplierFileVOS || [];
      this.newFileList = resData.value.newSupplierFileVOS || [];
      this.fileChangeMap = {};
      this.findChange(this.oldFileList, this.newFileList, this.fileChangeMap);
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
      this.messageService.closeLoading();
    });
  }
  private findChange(oldDataList: any[], newDataList: any[], changeMap: any) {
    oldDataList.forEach((item: any, index: number) => {
      item.index = index + 1;
    });
    newDataList.forEach((newItem, index: number) => {
      const oldItem = oldDataList.find( item => newItem.id === item.id) || {};
      newItem.id = newItem.id || Symbol();
      changeMap[newItem.id] = {};
      Object.keys(newItem).forEach((key) => {
        newItem[key] = newItem[key] || (newItem[key] === 0 ? 0 : undefined);
        changeMap[newItem.id][key] = oldItem[key] !== newItem[key];
      });
      newItem['index'] = index + 1;
      newItem['isNew'] = true;
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public viewQualFile(url: string) {
    this.viewQualFileUrl = this.downloadUrl + url;
    console.log(this.viewQualFileUrl);
    this.viewQualFielModalShow = true;
  }
  public cancelViewFile() {
    this.viewQualFielModalShow = false;
  }
  ngOnInit() {
    this.contactTableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        { title: '序号', field: 'index', width: 40},
        { title: '名称', field: 'name', width: 100},
        { title: '职务', field: 'position', width: 100},
        { title: '手机', field: 'cellphone', width: 100},
        { title: '电话', field: 'phone', width: 100},
        { title: '传真', field: 'fax', width: 100},
        { title: '邮箱', field: 'email', width: 100},
        { title: '常用联系人', field: 'isCommonlyUsed', width: 100, pipe: 'commonlyUser'},
        { title: '备注', field: 'remark', width: 100},
      ]
    };
    this.fileTableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        { title: '序号', field: 'index', width: 40},
        { title: '证件名称', field: 'credentialName', width: 100},
        { title: '发证机构', field: 'issuingAgency', width: 100},
        { title: '证件类型', field: 'credentialType', width: 100, pipe: 'qualFileType'},
        { title: '有效期起', field: 'validityPeriodStart', width: 100, pipe: 'date:yyyy-MM-dd'},
        { title: '有效期止', field: 'validityPeriodEnd', width: 100, pipe: 'date:yyyy-MM-dd'},
        { title: '附件', tdTemplate: this.fileAffixTpl, width: 100},
        { title: '备注', field: 'remark', width: 100},
      ]
    };
    this.getModifyInfoDetail();
  }

}
