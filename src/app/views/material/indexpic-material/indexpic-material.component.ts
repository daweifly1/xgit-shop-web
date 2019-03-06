import { Component, OnInit } from '@angular/core';
import {UploadFile} from 'ng-zorro-antd';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {IndexpicService, IndexpicServiceNs} from '../../../core/trans/indexpic.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-indexpic-material',
  templateUrl: './indexpic-material.component.html',
  styleUrls: ['./indexpic-material.component.scss']
})
export class IndexpicMaterialComponent implements OnInit {

  fileList: any[] = [];
  fileUrl: string;
  IndexpicInfo: IndexpicServiceNs.IndexpicModel;

  previewImage = '';
  previewVisible = false;
  uploadUrl: string;
  constructor(private messageService: ShowMessageService,
              private indexpicService: IndexpicService) {
    this.fileUrl = environment.otherData.fileUrl;
  }

  handlePreview = (file: UploadFile) => {
    this.uploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
    this.IndexpicInfo = {
      id: '',
      imgUrl: '',
      name: '',
      status: '',
      type: ''
    };
  }
  getIndexpic() {
    this.indexpicService.getIndexpic().subscribe((resData: IndexpicServiceNs.IndexpicModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      const tmpFilelist = [];
      if (resData.value.imgUrl !== null) {
        tmpFilelist.push({
          uid: 1,
          name: resData.value.name,
          url: resData.value.imgUrl,
          thumbUrl: resData.value.imgUrl,
        });
      }
      this.fileList = tmpFilelist;
      console.log(this.fileList[0]);
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public editSubmit() {
    let observer: any = null;
    console.log(this.fileList[0]);
    if (this.fileList.length === 0) {
      this.messageService.showToastMessage('必须提交一张图片', 'error');
      return;
    }
    const data: IndexpicServiceNs.IndexpicModel = {
      imgUrl: this.fileUrl + this.fileList[0].response.value
    };
    observer = this.indexpicService.editIndexpic(data);
    observer.subscribe((resData: IndexpicServiceNs.IndexpicModelT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this.getIndexpic();
  }

}
