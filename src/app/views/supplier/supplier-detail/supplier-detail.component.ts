import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {SupplierInfoNs, SupplierInfoService} from '../../../core/trans/supplier-info.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
enum PageType {
  BasicInfoPage,
  ContactPage,
  QualFilePage,      // 资质文件
  GradeInfoPage,
  ContractRecordPage,
  QualityRecordPage,
  InfoChangePage,
  HistoryFilePage,
}
@Component({
  selector: 'app-supplier-detail',
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.scss']
})
export class SupplierDetailComponent implements OnInit {
  @Input() supplierId: string;
  @Input()
  set supplierBasicInfo(value: any) {
    this.basicInfo = value || {};
  }
  @Input() headerTpl: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  PageTypeEnum = PageType;
  currentPage: PageType;
  leftMenuList: {id: number; name: string; }[];
  basicInfo: any;
  concactList: any[];
  quanFileList: SupplierInfoNs.QualFileItem[];
  ProblemRecordType =  SupplierInfoNs.ProblemRecordType;
  constructor(private messageService: ShowMessageService, private supplierInfoService: SupplierInfoService) {
    this.finish = new EventEmitter<any>();
    this.leftMenuList = [
      {id: PageType.BasicInfoPage, name: '基本信息'},
      {id: PageType.ContactPage, name: '联系人信息'},
      {id: PageType.QualFilePage, name: '资质文件'},
      {id: PageType.GradeInfoPage, name: '评级信息'},
      {id: PageType.ContractRecordPage, name: '合同履行不良记录'},
      {id: PageType.QualityRecordPage, name: '质量问题处理记录'},
      {id: PageType.InfoChangePage, name: '信息变更记录'},
      {id: PageType.HistoryFilePage, name: '历史文件'},
    ];
    this.basicInfo = {};
    this.currentPage = this.PageTypeEnum.BasicInfoPage;
    this.quanFileList = [];
  }
  public changeTab(page: PageType) {
    if (page === this.PageTypeEnum.BasicInfoPage) {
      this.getSupplierBasic();
    } else if (page === this.PageTypeEnum.ContactPage) {
      this.getContactList();
    } else if (page === this.PageTypeEnum.QualFilePage) {
      this.getQualFileList();
    } else {}
  }
  private getSupplierBasic() {
    if (this.basicInfo.id) {
      return;
    }
    if (!this.supplierId) {
      return;
    }
    this.basicInfo = {};
    this.supplierInfoService.getSupplierBasicInfo(this.supplierId).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.basicInfo = resData.value;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private getContactList() {
    const supplierId = this.supplierId || this.basicInfo.id;
    this.concactList = [];
    this.supplierInfoService.getContactBySupplier(supplierId).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.concactList = resData.value;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public quitDetailPage() {
    this.finish.emit();
  }
  public getQualFileList() {
    this.quanFileList = [];
    const supplierId = this.supplierId || this.basicInfo.id;
    this.supplierInfoService.getQualFileBySupplier(supplierId).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.quanFileList = resData.value;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this.getSupplierBasic();
  }

}
