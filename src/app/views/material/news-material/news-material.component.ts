import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {Observable} from 'rxjs/Observable';
import {NewsService, NewsServiceNs} from '../../../core/common-services/news.service';
import {UploadFile} from 'ng-zorro-antd';
import {UeditorConfig, UeditorUploadConfig} from '../../../../environments/ueditorConfig';
import {environment} from '../../../../environments/environment';
import {ActionCode} from '../../../../environments/actionCode';

enum TabPageType {
  ManagePage = 0,
  AddPage,
  EditPage,
  DetailPage
}

interface FilterItem {
  title: string;
}

@Component({
  selector: 'app-news-material',
  templateUrl: './news-material.component.html',
  styleUrls: ['./news-material.component.scss']
})
export class NewsMaterialComponent implements OnInit {
  tabPageType: TabPageType;
  filters: FilterItem;
  newsDataList: any[];
  newsTypeDataList: any[];
  newsTableConfig: any;
  selectedNewsIdList: string[];
  NewsInfoForm: FormGroup;
  newsIdList: NewsServiceNs.NewsModel[];
  addOrEditTitle: string;
  editorContent: string;
  responseAttachment: string;
  operateNewsId: string;
  newsInfo: NewsServiceNs.NewsInfoModel;
  fileList: any[] = [];
  previewImage = '';
  previewVisible = false;
  typeId: string;
  searchPlaceholder: string;
  option: Object;
  uEditorConfig: any;
  uEditorUploadConfig: any;
  fileServiceUrl: string;
  uploadImgUrl: string;
  ActionCode = ActionCode;
  attachRequired: boolean;
  imgTypeIdObj: { [index: string]: boolean };       // 必须要上传图片的资讯id对象
  constructor(private newsService: NewsService,
              private messageService: ShowMessageService,
              private formBuilder: FormBuilder
  ) {
    this.imgTypeIdObj = {
      '7': true,      // 轮播图
      '12': true,     // 优秀供应商
      '14': true      // 导航轮播图
    };
    this.uploadImgUrl = environment.baseUrl.bs + '/uploading/file';
    this.fileServiceUrl = environment.otherData.fileServiceUrl;
    this.uEditorConfig = Object.assign({}, UeditorConfig);
    this.uEditorUploadConfig = Object.assign({}, UeditorUploadConfig);

    this.tabPageType = TabPageType.ManagePage;
    this.newsDataList = [];
    this.newsTypeDataList = [];
    this.selectedNewsIdList = [];
    this.newsTableConfig = {
      pageSize: 10,
      showCheckBox: true,
      allChecked: false,
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      header: [
        {name: '标题', field: 'title', width: '285px'},
        {name: '分类', field: 'type', width: '80px', pipe: 'type'},
        {name: '更新时间', field: 'updateDate', width: '190px'},
        {name: '浏览次数', field: 'viewCount', width: '80px'},
        {name: '状态', field: 'ifShow', width: '50px'}
      ]
    };
    this.typeId = '1';
    this.searchPlaceholder = '标题';
    this.filters = {
      title: '',
    };

    this.newsIdList = [];
    this.editorContent = '';
    // 定义用于查看时表单的数据模型
    this.newsInfo = {
      title: '',
      attachment: '',   // 附件（附件的URL）
      type: null,
      intro: '',
      content: '',
      viewCount: null,
      fileName: ''
    };
  }

  public trackByTableHeader(index: number, item: any) {
    return item.field;
  }

  public trackByNewsId(index: number, item: any) {
    return item.id;
  }

  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  // 监听移除图片时触发的函数，让附件数量同步减一
  removeFile = (file: UploadFile) => {

    return false;
  };

  public editOrAddTypeChange(type) {
    this.attachRequired = !!this.imgTypeIdObj[type];
  }

  // 查看、修改时填充表单数据并切换对应的标签的内容
  public addOrEditNewsTab(type: number, item?: NewsServiceNs.NewsInfoModel) {
    this.tabPageType = type;
    this.editorContent = '';
    this.responseAttachment = '';
    if (type === TabPageType.DetailPage) {
      this.newsService.getNewsDetail(item.id).subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'warning');
          return;
        }
        this.newsInfo = {
          title: resData.value.title,
          attachment: resData.value.attachment,
          intro: resData.value.intro,
          viewCount: resData.value.viewCount,
          type: resData.value.type,
          fileName: resData.value.fileName,
          content: resData.value.content
        };
        const tmpFilelist = [];
        if (resData.value.attachment !== null) {
          tmpFilelist.push({
            uid: 1,
            name: resData.value.fileName,
            url: this.fileServiceUrl + resData.value.attachment,
            thumbUrl: this.fileServiceUrl + resData.value.attachment,
          });
        }
        this.fileList = tmpFilelist;
      }, (error: any) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
      return;
    }
    if (type === TabPageType.EditPage) {

      this.operateNewsId = item.id;
      this.newsService.getNewsDetail(item.id).subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'warning');
        }
        this.NewsInfoForm.patchValue({
          intro: resData.value.intro,
          title: resData.value.title,
          type: this.typeId + ''
        });
        this.NewsInfoForm.controls['type'].disable();
        const tmpFilelist = [];
        if (resData.value.attachment !== null) {
          tmpFilelist.push({
            uid: 1,
            name: resData.value.fileName,
            url: this.fileServiceUrl + resData.value.attachment,
            thumbUrl: this.fileServiceUrl + resData.value.attachment,
          });
        }
        this.fileList = tmpFilelist;
        this.editorContent = resData.value.content;
        this.responseAttachment = resData.value.attachment;
      }, (error: any) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    } else if (type === TabPageType.AddPage) {
      this.NewsInfoForm.controls['type'].enable();
      this.addOrEditTitle = '新增';
      this.editorContent = '';
      this.fileList = [];
    } else {
      return;
    }
  }

  public checkNewsTableAll(value: boolean) {
    this.selectedNewsIdList = [];

    for (let i = 0, len = this.newsDataList.length; i < len; i++) {
      this.newsDataList[i].checked = value;
      if (value) {
        this.selectedNewsIdList.push(this.newsDataList[i].id);
      }
    }
  }

  public checkNewsTableSingle(value: boolean, item: any) {
    if (value) {
      this.selectedNewsIdList.push(item.id);
      if (this.selectedNewsIdList.length === this.newsDataList.length) {
        this.newsTableConfig.allChecked = true;
      }
    } else {
      this.newsTableConfig.allChecked = false;
      this.deleteIdSelected(item.id);
    }
  }

  // 单选框取消选中
  private deleteIdSelected(id: string) {
    for (let i = 0, len = this.selectedNewsIdList.length; i < len; i++) {
      if (this.selectedNewsIdList[i] === id) {
        this.selectedNewsIdList.splice(i, 1);
        break;
      }
    }
  }

  public refresh() {
    this.filters.title = '';
    this.getNewsList();
  }

  // 展示新闻列表
  public getNewsList(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.newsTableConfig.pageNum,
      pageSize: this.newsTableConfig.pageSize,
      filters: {type: this.typeId, title: this.filters.title.trim()}
    };
    this.newsTableConfig.loading = true;
    this.newsService.getNewsList(filter).subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      this.newsTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.newsDataList = resData.value.list;
      this.newsTableConfig.total = resData.value.total;

    }, (error: any) => {
      this.newsTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public getNewsListPageSize(pageSize?: number) {
    const filter = {
      pageNum: this.newsTableConfig.pageNum,
      pageSize: pageSize || this.newsTableConfig.pageSize,
      filters: {type: this.typeId, title: this.filters.title}
    };
    this.newsTableConfig.loading = true;
    this.newsService.getNewsList(filter).subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      this.newsTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.newsDataList = resData.value.list;
      this.newsTableConfig.total = resData.value.total;

    }, (error: any) => {
      this.newsTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 获取资讯分类列表
  private getNewsTypeList() {
    this.newsService.getNewsTypeList().subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.newsTypeDataList = resData.value;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public getNewsTypeChange(value) {
    this.filters.title = '';
    this.getNewsList();
    this.newsTableConfig.allChecked = false;
    this.newsTableConfig.header = [
      {name: '标题', field: 'title', width: '285px'},
      {name: '图片', field: 'attachment', width: '150px'},
      {name: '分类', field: 'type', width: '80px', pipe: 'type'},
      {name: '更新时间', field: 'updateDate', width: '190px'},
      {name: '浏览次数', field: 'viewCount', width: '80px'},
      {name: '状态', field: 'ifShow', width: '50px'}
    ];
    if (!this.imgTypeIdObj[this.typeId]) {
      this.newsTableConfig.header.splice(1, 1);   // 删除图片列
    }
  }

  // 删除新闻
  public deleteNews() {
    if (this.selectedNewsIdList.length === 0) {
      this.messageService.showToastMessage('请选择要删除的信息', 'info');
      return;
    }
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.newsService.deleteNews(this.selectedNewsIdList)
        .subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
          if (resData.code === 0) {
            if (this.newsDataList.length === this.selectedNewsIdList.length) {
              this.selectedNewsIdList = [];
              this.newsDataList = [];
              this.newsTableConfig.allChecked = false;
              this.getNewsList(this.newsTableConfig.pageNum);
              return;
            }
            for (let i = 0, len = this.selectedNewsIdList.length; i < len; i++) {
              for (let j = 0, lenAll = this.newsDataList.length; j < lenAll; j++) {
                if (this.selectedNewsIdList[i] === this.newsDataList[j].title) {
                  this.newsDataList.slice(j, 1);
                  break;
                }
              }
            }
            this.selectedNewsIdList = [];
            this.newsTableConfig.allChecked = false;
            this.getNewsList(this.newsTableConfig.pageNum);
          } else {
            this.messageService.showAlertMessage('', resData.message, 'warning');
          }
        }, (error) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
    });
  }

  public toggleManagePage() {
    this.newsIdList = [];
    this.NewsInfoForm.reset({editorContent: ''});
    this.tabPageType = TabPageType.ManagePage;
    this.editorContent = '';
  }

  // 弹框提示
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getNewsList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 商品的上下架切换
  public showNews(ifShow: number, item: any) {

    if (ifShow === item.ifShow) {
      return;
    }
    const message: string = ifShow === 1 ? '上架' : '下架';
    this.messageService.showAlertMessage('', `确定${message}该条信息吗?`, 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const enable = ifShow === 1 ? true : false;
      this.commonResDeal(this.newsService.enableNews(item.id, enable), true);
    });

  }

  // 设置商品置顶
  public setTop(ifTop: number, item: any) {

    if (ifTop === item.ifTop) {
      return;
    }
    const message: string = item.ifTop === 1 ? '取消置顶' : '置顶';

    this.messageService.showAlertMessage('', `确定${message}该条信息吗?`, 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      if (ifTop === 1) {
        this.commonResDeal(this.newsService.ifTopNews(item.id), true);
      } else if (ifTop === 0) {
        this.commonResDeal(this.newsService.cancelTopNews(ifTop, item.id), true);
      }
    });

  }

  // 新增、修改表单的内容并提交到后台
  public addOrEditSubmit() {
    for (const key of Object.keys(this.NewsInfoForm.controls)) {
      this.NewsInfoForm.controls[key].markAsDirty();
      this.NewsInfoForm.controls[key].updateValueAndValidity();
    }
    if (this.NewsInfoForm.invalid) {
      return;
    }
    const filePath = this.fileList.length ? (this.fileList[0].response ? this.fileList[0].response.value : this.responseAttachment) : '';
    if (this.imgTypeIdObj[this.NewsInfoForm.value.type] && !filePath) {
      this.messageService.showToastMessage('请上传附件!', 'warning');
      return;
    }
    let observer: any = null;
    // 当附件数量小于等于1时方能进行新增和修改
    if (!filePath && this.fileList.length > 1) {
      this.messageService.showToastMessage('附件数量不能大于1', 'error');
      return;
    }
    const data: NewsServiceNs.NewsInfoModel = {
      title: this.NewsInfoForm.value.title,
      intro: this.NewsInfoForm.value.intro,
      attachment: filePath,
      type: this.NewsInfoForm.value.type,
      content: this.editorContent,
      id: this.operateNewsId,
      fileName: this.fileList.length ? this.fileList[0].name : ''
    };
    if (this.tabPageType === TabPageType.AddPage) {
      observer = this.newsService.addNews(data);
    } else if (this.tabPageType === TabPageType.EditPage) {
      observer = this.newsService.editNews(data);
    } else {
      return;
    }
    this.messageService.showLoading();
    observer.subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.value, 'warning');
        return;
      }
      this.typeId = (data.type || this.typeId) + '';
      this.getNewsTypeChange(this.typeId);
      this.toggleManagePage();
      this.messageService.showToastMessage('操作成功', 'success');
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.NewsInfoForm = this.formBuilder.group({
      title: [null, [Validators.required, Validators.maxLength(40)]],
      intro: [null, [Validators.maxLength(200)]],
      type: [null, [Validators.required]]
    });
    this.getNewsTypeList();
    this.getNewsList();
  }
}
