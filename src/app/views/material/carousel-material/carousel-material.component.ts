import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { CarouselService, CarouselServiceNs } from '../../../core/trans/carousel.service';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../../environments/environment';
import {UploadFile} from 'ng-zorro-antd';
import {UeditorUploadConfig, UeditorConfig} from '../../../../environments/ueditorConfig';
enum TabPageType {
  ManagePage = 0,
  AddPage,
  EditPage
}

interface MaterialItem {
  seq?: number;
  title?: string;
  type?: string;
  attachment: any;
  updateTime?: string;
  status?: number;
  ifShow: number;
  [key: string]: any;
}

@Component({
  selector: 'app-carousel-material-page',
  templateUrl: './carousel-material.component.html',
  styleUrls: ['./carousel-material.component.scss']
})
export class CarouselMaterialComponent implements OnInit {
  materialList: MaterialItem[];
  carouselTableConfig: any;
  selectedCarouselIdList: string[] = [];
  carouselForm: FormGroup;
  detailForm: FormGroup;

  tabIndex: number;
  selectedCarouselId: string[] = [];

  tabPageIndex: number;
  tabPageType: any = 10;
  allChecked: any = false;
  addCarouselData: any;
  tabPage: any;
  editorContent: any = '';
  fileList: any[] = [];
  detailInfo: CarouselServiceNs.CarouselModel;
  editInfo: {id: string};
  option: Object;
  previewImage: string;
  previewVisible:  boolean;
  attachment: string;
  fileServiceUrl: string;
  uEditorConfig: any;
  uEditorUploadConfig: any;
  uploadUrl: string;
  constructor(private formBuilder: FormBuilder,
    private showMessageService: ShowMessageService,
    private carouselService: CarouselService
  ) {
    this.uploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.uEditorConfig = Object.assign({}, UeditorConfig);
    this.uEditorUploadConfig = Object.assign({}, UeditorUploadConfig);
    this.fileServiceUrl = environment.otherData.fileServiceUrl;
    this.addCarouselData = {
      title: '',
      baseImg: '',
      type: '',
      content: ''
    };

    this.detailInfo = {
      title: '',
      baseImg: '',
      type: null,
      content: '',
      viewCount: null
    };

    this.carouselTableConfig = {
      pageNum: 1,
      pageSize: 20,
      showCheckBox: true,
      allChecked: false,
      total: 0,
      loading: false,
    };
    this.tabIndex = 0;
    this.tabPageIndex = 0;
    this.previewImage = '';
    this.previewVisible = false;
    this.attachment = '';


  }
  // 修复修改时附件的问题，删除上一个图，不会被清空
  uploadFileChange($event) {
    if ($event.type === 'progress' || $event.type === 'start') {
      return;
    }
    if ($event.file.status === 'removed') {
      this.fileList.length--;
      return;
    }
    if (this.fileList[0].response.code !== 0) {
      this.showMessageService.showAlertMessage('', '附件上传失败', 'error');
      this.fileList = [];
      return;
    }
    if ( !/\.(jpg|png|jepg)$/.test(this.fileList[0].response.value)) {
      this.showMessageService.showAlertMessage('', '请上传图片', 'error');
      this.fileList = [];
      return;
    }
  }


  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: CarouselServiceNs.CarouselResModelT<any>) => {
      if (resData.code === 0) {
        this.showMessageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getMaterList();
        }
      } else {
        this.showMessageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 展示表单数据
  private getMaterList(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.carouselTableConfig.pageNum,
      pageSize: this.carouselTableConfig.pageSize,
      filters: { type: 7 }
    };
    this.carouselService.getMaterialList(filter).subscribe((resData: CarouselServiceNs.CarouselResModelT<any>) => {
      if (resData.code !== 0) {
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialList = resData.value.list;
    }, (error: any) => {
      this.carouselTableConfig.loading = false;
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 全选
  public checkAll(value) {
    this.selectedCarouselIdList = [];
    for (let i = 0, len = this.materialList.length; i < len; i++) {
      this.materialList[i].checked = value;
      if (value) {
        this.selectedCarouselIdList.push(this.materialList[i].id);
      }
    }

  }

  // 单选
  public checkSingle(value: boolean, data) {
    if (value) {
      this.selectedCarouselIdList.push(data.id);
      if (this.selectedCarouselIdList.length === this.materialList.length) {

        this.carouselTableConfig.allChecked = true;
      }
    } else {
      this.carouselTableConfig.allChecked = false;
      this.selectedCarouselIdList.splice(this.selectedCarouselIdList.findIndex(item => data.id === data.id), 1);
    }
  }


  public switchTab(type: 'Carousel' | 'addCarousel' | 'editCarousel' | 'lookOver' | '', carousel: CarouselServiceNs.CarouselModel = {
    title: '',
    type: '',
    baseImg: '',
    content: ''
  }) {
    this.tabPage = type;
    this.tabIndex = 1;
    this.editorContent = '';
    if (type === 'Carousel' || type === 'lookOver' || type === 'editCarousel') {
    this.getCarouselDetail(carousel.id);
    this.detailForm.patchValue({
      title: carousel.title,
      type: carousel.type,
      attachment: carousel.baseImg
    });
      const tmpFilelist = [];
      if (carousel.baseImg !== null) {
        tmpFilelist.push({
          uid: 1,
          name: carousel.fileName,
          url: this.fileServiceUrl + carousel.attachment,
          thumbUrl:  this.fileServiceUrl + carousel.attachment,
        });

      }
      this.fileList = tmpFilelist;
      this.previewImage = this.fileList[0].url || this.fileList[0].thumbUrl;
    }
    if (type === 'addCarousel') {
      this.fileList = [];
    }
  }

  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }

  // 删除
  public deleteCarousel() {

    if (this.selectedCarouselIdList.length === 0) {
      this.showMessageService.showAlertMessage('', '请选择要删除的轮播图信息', 'info');
      return;
    }

    const modalCtrl = this.showMessageService.showAlertMessage('', '您确定要删除吗？', 'confirm');

    modalCtrl.afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.carouselService.deleteCarousel(this.selectedCarouselIdList)
        .subscribe((resData: CarouselServiceNs.CarouselResModelT<any>) => {
          if (resData.code === 0) {

            if (this.materialList.length === this.selectedCarouselId.length) {
              this.selectedCarouselId = [];
              this.materialList = [];
              this.carouselTableConfig.allChecked = false;
              return;
            }

            for (let i = 0, len = this.selectedCarouselId.length; i < len; i++) {
              for (let j = 0, lenAll = this.materialList.length; j < lenAll; j++) {
                if (this.selectedCarouselId[i] === this.materialList[j].title) {
                  this.materialList.slice(j, 1);
                  break;
                }
              }
            }
            this.selectedCarouselIdList = [];
            this.carouselTableConfig.allChecked = false;
            this.getMaterList();
          } else {
            this.showMessageService.showAlertMessage('', resData.message, 'warning');
          }
        }, (error) => {
          this.showMessageService.showAlertMessage('', error.message, 'error');
        });
    });
  }

  public goback() {
    this.toggleManagePage();
  }

  // 上下架
  public ifshowCarousel(ifShow: number, item: any) {
    if (ifShow) {
      ifShow = 0;
    } else {
      ifShow = 1;
    }
    const message: string = ifShow === 1 ? '上架' : '下架';

    this.showMessageService.showAlertMessage('', `确定${message}吗?`, 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.carouselService.ifShowCarousel(ifShow, item.id), true);
    });

  }

  // 置顶
  public setTop(ifTop: number, item: any) {
    console.log(ifTop);
    const message: string = item.ifTop !== 0 ? '取消置顶' : '置顶';

    this.showMessageService.showAlertMessage('', `确定${message}该条信息吗?`, 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      if (ifTop === 0) {
        this.commonResDeal(this.carouselService.ifTopCarousel(item.id), true);
      } else if (ifTop !== 0) {
        this.commonResDeal(this.carouselService.cancelTopCarousel(item.id), true);
      }
    });

  }

  // 新增页保存数据
  public add() {
    for (const key of Object.keys(this.carouselForm.controls)) {
      this.carouselForm.controls[key].markAsDirty();
      this.carouselForm.controls[key].updateValueAndValidity();
    }
    if (this.fileList.length === 0) {
      this.showMessageService.showToastMessage('请上传图片', 'error');
      return;
    }
    if (this.carouselForm.invalid) {
      return;
    }
    const data: CarouselServiceNs.CarouselModel = {
      title: this.carouselForm.value.title,
      attachment: this.fileList[0].response.value,
      type: 7,   // type:7  表示轮播图
      content: this.editorContent,
      fileName: this.fileList[0].name
      // content: this.carouselForm.value.content
    };
    let observer: any = null;
    // 当附件数量小于等于1时方能进行新增和修改
    if (this.fileList.length <= 1) {
      observer = this.carouselService.addCarousel(data);
    } else {
      this.showMessageService.showToastMessage('附件数量不能大于1', 'error');
      return;
    }
    observer.subscribe((resData: CarouselServiceNs.CarouselModel) => {
      if (resData.code === 0) {
        this.showMessageService.showToastMessage('操作成功', 'success');
        this.getMaterList(1);
        this.toggleManagePage();
      }
    }, (error: any) => {
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
    this.toggleManagePage();

  }

  // 修改页保存数据
  public editSubmit(id) {
    for (const key of Object.keys(this.detailForm.controls)) {
      this.detailForm.controls[key].markAsDirty();
      this.detailForm.controls[key].updateValueAndValidity();
    }
    if (this.fileList.length === 0) {
      this.showMessageService.showToastMessage('请上传图片', 'error');
      return;
    }
    if (this.detailForm.invalid) {
      return;
    }
    const data: CarouselServiceNs.CarouselModel = {
      title: this.detailForm.value.title,
      attachment: this.fileList.length ?
  (this.fileList[0].response ? this.fileList[0].response.value : this.attachment) : '',
      type: 7,   // type:7  表示轮播图
      content: this.editorContent,
      fileName: this.fileList.length ? this.fileList[0].name : ''
    };

    let observer: any = null;
    // 当附件数量小于等于1时方能进行新增和修改
    if (this.fileList.length <= 1) {
      observer = this.carouselService.editCarousel(id, data);
    } else {
      this.showMessageService.showToastMessage('附件数量不能大于1', 'error');
      return;
    }
    observer.subscribe((resData: CarouselServiceNs.CarouselModel) => {
      if (resData.code === 0) {
        this.showMessageService.showToastMessage('操作成功', 'success');
        this.getMaterList(1);
        this.toggleManagePage();
      }
    }, (error: any) => {
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
    this.toggleManagePage();
  }

  // 获取数据详情
  private getCarouselDetail(id: any) {
    this.carouselService.getCarouselDetail(id).subscribe((resData: CarouselServiceNs.CarouselResModelT<any>) => {
      if (resData.code !== 0) {
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.detailInfo = {
        title: resData.value.title,
        baseImg: resData.value.baseImg,
        viewCount: resData.value.viewCount,
        content: resData.value.content,
        type: resData.value.type
      };
      this.editInfo = {
        id: id
      };
      this.editorContent = resData.value.content;
      this.attachment = resData.value.attachment;
    }, (error: any) => {
      this.carouselTableConfig.loading = false;
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
  }

  public toggleManagePage() {
    this.carouselForm.reset();
    this.tabPage = TabPageType.ManagePage;
    this.tabIndex = 0;
  }



  ngOnInit() {
    this.getMaterList();
    this.carouselForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(20)]],
      type: ['']
    });

    this.detailForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(20)]],
      type: [''],
      attachment: ['', [Validators.required]],

    });
  }

}
