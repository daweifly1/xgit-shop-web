import {Component, OnInit, Output, EventEmitter, Input, ViewChild, TemplateRef} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {SupplierInfoNs, SupplierInfoService} from '../../../../core/trans/supplier-info.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../../environments/environment';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
enum FilePage {
  MainPage,
  EditPage,
  AddPage
}
enum MaxInputLen {
  Default = 50
}
@Component({
  selector: 'app-qual-file',
  templateUrl: './qual-file.component.html',
  styleUrls: ['./qual-file.component.scss']
})
export class QualFileComponent implements OnInit {
  @Output() updateEvent: EventEmitter<any>;
  @Input()
  set supplierId(value: string) {
    this._supplierId = value;
  }
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('affixTpl') affixTpl: TemplateRef<any>;
  MaxInputLenEnum = MaxInputLen;
  FilePageEnum = FilePage;
  currentPage: FilePage;
  fileInfoForm: FormGroup;
  tableConfig: UfastTableNs.TableConfig;
  dataList: SupplierInfoNs.QualFileItem[];
  _supplierId: string;
  fileTypeList: {id: number; name: string; disabled?: boolean}[];
  uploadUrl: string;
  fileList: any[];
  fileMineType: string;
  selectedFile: SupplierInfoNs.QualFileItem;
  downloadUrl: string;
  viewFileUrl: string;
  viewFileModalShow: boolean;
  downloadTplUrl: string;
  constructor(private messageService: ShowMessageService, private supplierInfoService: SupplierInfoService,
              private formBuild: FormBuilder, private utilService: UfastUtilService) {
    this.currentPage = this.FilePageEnum.MainPage;
    this.updateEvent = new EventEmitter<any>();
    this.fileTypeList = [
      {id: 1, name: '营业执照'},
      {id: 2, name: '调查表'},
      {id: 3, name: '其它证书'}
      ];
    this.fileList = [];
    this.fileMineType = 'application/pdf';
    this.uploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.downloadUrl = environment.otherData.fileServiceUrl;
    this.downloadTplUrl = environment.baseUrl.bs + '/supplierFactory/downloadSurvey';
  }
  disabledStart = (startDate: Date) => {
    const formValue = this.fileInfoForm.getRawValue();
    if (!startDate || !formValue.validityPeriodEnd) {
      return false;
    }
    return startDate.getTime() > formValue.validityPeriodEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    const formValue = this.fileInfoForm.getRawValue();
    if (!endDate || !formValue.validityPeriodStart) {
      return false;
    }
    return endDate.getTime() <= formValue.validityPeriodStart.getTime();
  }
  public viewFile(url: string) {
    this.viewFileUrl = this.downloadUrl + url;
    this.viewFileModalShow = true;
  }
  public cancelViewFile() {
    this.viewFileModalShow = false;
  }
  public addQualFile() {
    this.fileList = [];
    this.fileInfoForm.reset();
    this.currentPage = this.FilePageEnum.AddPage;
  }
  public editFile(id: string) {
    this.currentPage = this.FilePageEnum.EditPage;
    this.selectedFile = this.dataList.find(item => item.id === id);
    Object.assign(this.selectedFile, {
      validityPeriodEnd: new Date(this.selectedFile.validityPeriodEnd),
      validityPeriodStart: new Date(this.selectedFile.validityPeriodStart)
    });
    this.fileList = [{
      url: this.downloadUrl + this.selectedFile.fileUrl,
      name: this.selectedFile.credentialName
    }];
    this.fileInfoForm.patchValue(<any>this.selectedFile);
  }
  public delFile(id: string) {
    this.messageService.showAlertMessage('', '确定删除吗?', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.supplierInfoService.delTempQualFile(id, this._supplierId).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getDataList();
          this.updateEvent.emit();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public saveFileInfo() {
    console.log(this.fileList);
    Object.keys(this.fileInfoForm.controls).forEach((item) => {
      this.fileInfoForm.controls[item].markAsDirty();
      this.fileInfoForm.controls[item].updateValueAndValidity();
    });
    if (this.fileInfoForm.invalid) {
      return;
    }
    const fileData: SupplierInfoNs.QualFileItem = this.fileInfoForm.getRawValue();
    fileData.validityPeriodStart = this.utilService.getStartDate(fileData.validityPeriodStart);
    fileData.validityPeriodEnd = this.utilService.getEndDate(fileData.validityPeriodEnd);
    fileData.supplierId = this._supplierId;
    let submitHandler = null;
    if (this.currentPage === this.FilePageEnum.EditPage) {
      submitHandler = this.supplierInfoService.updateTempQualFile(fileData);
      fileData.id = this.selectedFile.id;
    } else {
      submitHandler = this.supplierInfoService.addTempQualFile(fileData);
    }
    this.messageService.showLoading('');
    submitHandler.subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.updateEvent.emit();
      this.currentPage = this.FilePageEnum.MainPage;
      this.getDataList();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public cancelPage() {
    this.currentPage = this.FilePageEnum.MainPage;
  }
  public getDataList() {
    this.tableConfig.loading = true;
    this.dataList = [];
    this.supplierInfoService.getTempQualFile(this._supplierId).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value || [];
      this.dataList.forEach((item) => {
        if (item.credentialType === SupplierInfoNs.QualFileType.Other) {
          return;
        }
        const targetFile =  this.fileTypeList.find(file => file.id === item.credentialType);
        targetFile.disabled = true;
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
      this.tableConfig.loading = false;
    });
  }
  public onFileUploadChange(event) {
    if (event.type === 'error') {
      this.fileList = [];
      this.messageService.showToastMessage('上传失败', 'error');
    }
    if (event.type === 'success') {
      if (event.file.response.code !== 0) {
        this.messageService.showToastMessage(event.file.response.message, 'error');
        this.fileList = [];
        return;
      }
      this.messageService.showToastMessage('上传成功', 'success');
      this.fileInfoForm.patchValue({fileUrl: event.file.response.value});
    }
  }
  onFileRemove = (event) => {
    this.fileInfoForm.patchValue({fileUrl: null});
    return true;
  }
  ngOnInit() {
    this.tableConfig = {
      showCheckbox: false,
      showPagination: false,
      total: 0,
      loading: false,
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 150, fixed: true},
        { title: '证件名称', field: 'credentialName', width: 100},
        { title: '发证机构', field: 'issuingAgency', width: 100},
        { title: '证件类型', field: 'credentialType', width: 100, pipe: 'qualFileType'},
        { title: '有效期起', field: 'validityPeriodStart', width: 100, pipe: 'date:yyyy-MM-dd'},
        { title: '有效期止', field: 'validityPeriodEnd', width: 100, pipe: 'date:yyyy-MM-dd'},
        { title: '附件', tdTemplate: this.affixTpl, width: 100},
        { title: '备注', field: 'remark', width: 100},
      ]
    };
    this.fileInfoForm = this.formBuild.group({
      credentialName: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      credentialType: [null, [Validators.required]],
      issuingAgency: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      remark: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      validityPeriodEnd: [null, [Validators.required]],
      validityPeriodStart: [null, [Validators.required]],
      fileUrl: [null, [Validators.required]]
    });
    this.getDataList();
  }

}
