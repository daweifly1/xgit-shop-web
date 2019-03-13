import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {GoodsCategoryService} from '../../../../core/common-services/goods-category.service';
import {DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';
import {environment} from '../../../../../environments/environment';
import {UploadFile} from 'ng-zorro-antd';

@Component({
  selector: 'app-edit-type',
  templateUrl: './edit-type.component.html',
  styleUrls: ['./edit-type.component.scss']
})
export class EditTypeComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() editData: any;
  paramTypeForm: FormGroup;
  level1List: any[];
  uploadImgUrl: string;
  fileList: any[] = [];
  previewImage = '';
  previewVisible = false;
  // 文件服务地址
  fileServiceUrl: string;

  constructor(private goodsCategoryService: GoodsCategoryService,
              private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.finish = new EventEmitter();
  }

  ngOnInit() {
    this.paramTypeForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.maxLength(50)]],
      level: [null, [Validators.maxLength(2)]],
      goodsCount: [null, [Validators.maxLength(10)]],
      goodsUnit: [null, [Validators.maxLength(10)]],
      navStatus: [null, [Validators.required, Validators.maxLength(2)]],
      showStatus: [null, [Validators.required, Validators.maxLength(2)]],
      sort: [null, [Validators.maxLength(50)]],
      icon: [null, [Validators.maxLength(100)]],
      keywords: [null, [Validators.maxLength(200)]],
      description: [null, [Validators.maxLength(500)]]
    });
    this.fileServiceUrl = environment.otherData.fileServiceUrl; // 文件服务器url
    this.fileList = null;
    if (this.editData) {
      this.paramTypeForm.patchValue(this.editData);
      this.paramTypeForm.addControl('id', this.formBuilder.control(this.editData.id));
      const tmpFilelist = [];
      if (this.editData.icon) {
        this.previewImage = this.fileServiceUrl + this.editData.icon;

        tmpFilelist.push({
          uid: 1,
          name: this.editData.icon,
          url: this.fileServiceUrl + this.editData.icon,
          thumbUrl: this.fileServiceUrl + this.editData.icon,
        });
      }
      this.fileList = tmpFilelist;
    } else {
      this.paramTypeForm.reset();
    }
    this.uploadImgUrl = environment.baseUrl.bs + '/uploading/file';
  }

  submit() {
    this.paramTypeForm.addControl('id', this.formBuilder.control(this.editData.id));
    Object.keys(this.paramTypeForm.controls).forEach((key: string) => {
      this.paramTypeForm.controls[key].markAsDirty();
      this.paramTypeForm.controls[key].updateValueAndValidity();
    });
    if (this.paramTypeForm.invalid) {
      return;
    }
    const filePath = this.fileList.length ? (this.fileList[0].response ? this.fileList[0].response.value : '') : '';
    // 当附件数量小于等于1时方能进行新增和修改
    if (this.fileList.length > 1) {
      this.messageService.showToastMessage('附件数量不能大于1', 'error');
      return;
    }
    if (this.fileList.length > 0) {
      this.editData.icon = filePath;
    }

    let submit = null;
    if (this.editData) {
      submit = this.goodsCategoryService.save(this.editData);
    }

    this.messageService.showLoading();
    submit.subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  emitFinish() {
    this.paramTypeForm.reset();
    this.finish.emit();
  }

  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }
}
