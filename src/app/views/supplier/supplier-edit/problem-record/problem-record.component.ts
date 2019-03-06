import { ActionCode } from './../../../../../environments/actionCode';
import {Component, OnInit, TemplateRef, ViewChild, Input} from '@angular/core';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {SupplierInfoNs, SupplierInfoService} from '../../../../core/trans/supplier-info.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService, UserServiceNs} from '../../../../core/common-services/user.service';
import {environment} from '../../../../../environments/environment';
enum MaxInputLen {
  Default = 50
}
enum RecordPageType {
  MainPage,
  EditPage,
  AddPage
}
@Component({
  selector: 'app-problem-record',
  templateUrl: './problem-record.component.html',
  styleUrls: ['./problem-record.component.scss']
})
export class ProblemRecordComponent implements OnInit {
  @Input() supplierId: string;
  @Input() problemRecordType: SupplierInfoNs.ProblemRecordType;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('affixTpl') affixTpl: TemplateRef<any>;
  MaxInputLenEnum = MaxInputLen;
  PageTypeEnum = RecordPageType;
  ActionCode = ActionCode;
  currentPage: RecordPageType;
  dataTableConfig: UfastTableNs.TableConfig;
  dataList: any[];
  recordForm: FormGroup;
  operatorName: string;
  fileList: any[];
  uploadUrl: string;
  downloadUrl: string;
  constructor(private messageService: ShowMessageService, private supplierInfoService: SupplierInfoService,
              private formBuilder: FormBuilder, private userService: UserService) {
    this.currentPage = this.PageTypeEnum.MainPage;
    this.dataList = [];
    this.fileList = [];
    this.uploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.downloadUrl = environment.otherData.fileServiceUrl;
  }
  getList = () => {
    if (!this.supplierId) {
      return;
    }
    const filters = {
      pageSize: this.dataTableConfig.pageSize,
      pageNum: this.dataTableConfig.pageNum,
      filters: {
        orgId : this.supplierId,
        recordType: this.problemRecordType
      }
    };
    this.supplierInfoService.getProblemRecordList(filters).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list || [];
      this.dataList.forEach((item) => {
        item['operateTime'] = item['updateDate'] || item['createDate'];
      });
      this.dataTableConfig.total = resData.value.total;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public addRecord() {
    this.currentPage = this.PageTypeEnum.AddPage;
    this.recordForm.reset();
  }
  public editRecord(id: string) {
    const editItem = this.dataList.find(item => item.id === id);
    this.recordForm.reset();
    this.fileList = [];
    editItem.recordTime = new Date(editItem.recordTime);
    this.recordForm.patchValue(editItem);
    this.currentPage = this.PageTypeEnum.EditPage;
    if (editItem.attachment) {
      this.fileList = [{
        url: this.downloadUrl + editItem.attachment,
        name: editItem.attachment
      }];
    }
  }
  public deleteRecord(id: string) {
    this.messageService.showAlertMessage('', '确定删除吗?', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.supplierInfoService.delProblemRecord([id]).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getList();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public saveRecord() {
    Object.keys(this.recordForm.controls).forEach((key) => {
      this.recordForm.controls[key].markAsDirty();
      this.recordForm.controls[key].updateValueAndValidity();
    });
    if (this.recordForm.invalid) {
      return;
    }
    const data: SupplierInfoNs.ProblemRecordItem = this.recordForm.getRawValue();
    data.recordType = this.problemRecordType;
    data.orgId = this.supplierId;
    this.messageService.showLoading('');
    this.supplierInfoService.saveProblemRecord(data).subscribe((resData: SupplierInfoNs.SupplierResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getList();
      this.currentPage = this.PageTypeEnum.MainPage;
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public cancelAddEdit() {
    this.currentPage = this.PageTypeEnum.MainPage;
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
      this.recordForm.patchValue({attachment: event.file.response.value});
    }
  }
  onFileRemove = (event) => {
    this.recordForm.patchValue({attachment: null});
    return true;
  }
  ngOnInit() {
    this.dataTableConfig = {
      showCheckbox: false,
      showPagination: true,
      total: 0,
      loading: false,
      pageSize: 10,
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      headers: [
        { title: '操作', tdTemplate: this.operationTpl, width: 100},
        { title: '记录时间', field: 'recordTime', width: 120, pipe: 'date:yyyy-MM-dd'},
        { title: '标题', field: 'title', width: 120},
        { title: '内容', field: 'content', width: 120},
        { title: '处理结果', field: 'handleResult', width: 120},
        { title: '操作人', field: 'createName', width: 120},
        { title: '操作时间', field: 'operateTime', width: 120, pipe: 'date:yyyy-MM-dd HH:mm'},
        { title: '备注', field: 'remark', width: 120},
        { title: '附件', tdTemplate: this.affixTpl, width: 120}
      ]
    };
    this.recordForm = this.formBuilder.group({
      content: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      title: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      handleResult: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      recordTime: [null, [Validators.required]],
      id: [null],
      attachment: [null],
      remark: [null]
    });
    this.getList();
    this.userService.getLogin().subscribe((resData: UserServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.operatorName = resData.value.name;
    }, () => {});
  }

}
