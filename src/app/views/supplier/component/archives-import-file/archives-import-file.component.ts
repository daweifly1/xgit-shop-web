import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {environment} from '../../../../../environments/environment';
import {SupplierManageNs, SupplierManageService} from '../../../../core/trans/supplier-manage.service';

export enum ImportFileType {
  RateInfo,
  Supplier
}
@Component({
  selector: 'app-archives-import-file',
  templateUrl: './archives-import-file.component.html',
  styleUrls: ['./archives-import-file.component.scss']
})
export class ArchivesImportFileComponent implements OnInit {
  @Input()ImportType: ImportFileType;
  @Output()finish: EventEmitter<any>;
  infoForm: FormGroup;
  fileLabelObj: any;
  fileList: any[];
  affixList: any[];
  fileMineType: string;
  affixUploadUrl: string;
  dataList: any[];
  constructor(private formBuilder: FormBuilder, private messageService: ShowMessageService,
              private supplierManageService: SupplierManageService) {
    this.fileMineType = 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    this.finish = new EventEmitter<any>();
    this.affixUploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.affixList = [];
    this.fileList = [];
    this.fileLabelObj =  {};
    this.fileLabelObj[ImportFileType.RateInfo] = {
      label: '评级文件',
      actionUrl: `${environment.baseUrl.bs}/supplierFactory/importRating`,
      affixDownLoad: `${environment.baseUrl.bs}/supplierFactory/downloadRating`
    };
    this.fileLabelObj[ImportFileType.Supplier] = {
      label: '合格供应商文件',
      actionUrl: `${environment.baseUrl.bs}/supplierFactory/importSupplierState`,
      affixDownLoad: `${environment.baseUrl.bs}/supplierFactory/downloadSupplierState`
    };
  }
  public onFileUploadChange(event) {
    if (event.type === 'error') {
      this.fileList = [];
      this.infoForm.patchValue({
        fileUrl: null,
        fileName: null
      });
      this.dataList = [];
      this.messageService.showToastMessage('上传失败', 'error');
    }
    if (event.type === 'success') {
      if (event.file.response.code !== 0) {
        this.messageService.showToastMessage(event.file.response.message, 'error');
        this.fileList = [];
        this.infoForm.patchValue({
          fileUrl: null,
          fileName: null
        });
        this.dataList = [];
        return;
      }
      this.infoForm.patchValue(<any>{
        fileUrl: event.file.response.value.fileUrl,
        fileName: event.file.name
      });
      if (this.ImportType === ImportFileType.RateInfo) {
        this.dataList = event.file.response.value.supplierRatingInfoVOS;
      } else if (this.ImportType === ImportFileType.Supplier) {
        this.dataList = event.file.response.value.supplierFactoryVOS;
      } else {}
      this.messageService.showToastMessage('上传成功', 'success');
    }
  }
  public onAffixUploadChange(event) {
    if (event.type === 'error') {
      this.affixList = [];
      this.infoForm.patchValue({attachment: null});
      this.messageService.showToastMessage('上传失败', 'error');
    }
    if (event.type === 'success') {
      if (event.file.response.code !== 0) {
        this.messageService.showToastMessage(event.file.response.message, 'error');
        this.affixList = [];
        this.infoForm.patchValue({attachment: null});
        return;
      }
      this.infoForm.patchValue({attachment: event.file.response.value});
      this.messageService.showToastMessage('上传成功', 'success');
    }
  }
  onFileRemoveFile = (event) => {
    this.infoForm.patchValue({
      fileUrl: null,
      fileName: null
    });
    this.dataList = [];
    return true;
  }
  onFileRemoveAffix = (event) => {
    this.infoForm.patchValue({attachment: null});
    return true;
  }
  public emitFinish() {
    this.finish.emit();
  }
  public submitInfo() {
    if (this.infoForm.invalid) {
      this.messageService.showToastMessage(this.fileLabelObj[this.ImportType].label, 'warning');
      return;
    }
    const data: SupplierManageNs.ImportFileData = this.infoForm.getRawValue();
    let handler;
    if (this.ImportType === ImportFileType.Supplier) {
      data.supplierFactoryVOS = this.dataList;
      handler = this.supplierManageService.importSupplier(data);
    } else if (this.ImportType === ImportFileType.RateInfo) {
      data.supplierRatingInfoVOS = this.dataList;
      handler = this.supplierManageService.importRateInfo(data);
    } else {}
    handler.subscribe((res) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    });
  }
  ngOnInit() {
    this.infoForm = this.formBuilder.group({
      attachment: [null],
      fileName: [null],
      fileUrl: [null, [Validators.required]],
      remark: [null]
    });
  }

}
