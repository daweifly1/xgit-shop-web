import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { MaterialManageService, MaterialManageServiceNs } from '../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
import { ActionCode } from '../../../../environments/actionCode';
import { DictionaryService, DictionaryServiceNs} from '../../../core/common-services/dictionary.service';
import { environment } from '../../../../environments/environment';
import { UploadModalService } from './../../../widget/upload-modal/upload-modal';
enum PageType {
  ManagePage = 0,
  AddPage = 1,
  EditPage = 2,
  DetailPage = 3,
  SelectPage = 4
}
interface ButtonState {
  edit: boolean;
  thaw: boolean;
  freeze: boolean;
}

@Component({
  selector: 'app-material-setting',
  templateUrl: './material-setting.component.html',
  styleUrls: ['./material-setting.component.scss']
})
export class MaterialSettingComponent implements OnInit {
  tabPageType = PageType;
  selectedPage: number;

  fullSearchShow: boolean;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('codeTpl') codeTpl: TemplateRef<any>;
  @ViewChild('uploadTopTpl') uploadTopTpl: TemplateRef<any>;
  @ViewChild('uploadModalErrMsgTpl')uploadModalErrMsgTpl: TemplateRef<any>;
  tableConfig: UfastTableNs.TableConfig;

  public values: any[] = null;
  filters: any; // interface定义
  dataList: any; // 在服务里定义
  editId: string;
  materialClassArry: any[];
  materialClassId: any[];
  detailId: string;
  buttonState: {[index: string]: ButtonState};
  ActionCode = ActionCode;
  unitList: any[];
  downloadTplUrl: string;
  importErrMsgList: any[];
  constructor(private materialManageService: MaterialManageService,
     private messageService: ShowMessageService,
    private dictionaryService: DictionaryService, private uploadModalService: UploadModalService) {
    this.selectedPage = this.tabPageType.ManagePage;
    this.fullSearchShow = false;
    this.filters = {};
    this.materialClassId = [];
    this.buttonState = {};
    this.importErrMsgList = [];
  }
  public getUnitList() {
    this.messageService.showLoading();
    const data = {
      parentCode: DictionaryServiceNs.TypeCode.FactoryUnit
    };
    this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.unitList = resData.value;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }
  public advanceSearchReset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
    });
    this.materialClassId = [];
    this.getList();
  }

  public fullSearchClose() {
    this.fullSearchShow = false;
  }
  selectMaterialClassItem(selectedItem) {
    if (selectedItem.option.isLeaf) {
      return;
    }
    selectedItem.option.children.shift();
    this.getMaterialClass(selectedItem.option.value, selectedItem.option.children);
  }


  showMaterialClass(value) {
    if (value) {
      this.getMaterialClass('0', undefined);
    }
  }


  getMaterialClass(pId: string, materialClassArry?: any[]) {
    const param: { pId: string, materialType?: number } = { pId: pId };
    this.materialManageService.getMaterialClassListNoPage(param).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      const tempList = materialClassArry || [];
      resData.value.forEach((item) => {
        const materialClassObj: any = {};
        materialClassObj.value = item.id;
        materialClassObj.label = item.materialCalssName;
        if (item.childCount < 1) {
          materialClassObj.isLeaf = true;
        } else {
          materialClassObj.children = [{}];
        }
        tempList.push(materialClassObj);
      });
      if (!materialClassArry) {
        this.materialClassArry = tempList;
      }
    });
  }

  getList = (pageNum?: number, pageSize?: number) => {
    this.tableConfig.loading = true;
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    if (this.materialClassId) {
      this.filters.materialClassId = this.materialClassId[this.materialClassId.length - 1];
    }
    const filter = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize || pageSize,
      filters: this.filters
    };
    this.materialManageService.getMaterialSettingList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.tableConfig.loading = false;
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.dataList.forEach((item) => {
        this.buttonState[item.id] = {
          edit: item.isDelete === 0,
          freeze: item.isDelete === 0,
          thaw: item.isDelete === 1

        };
      });
    }, (error) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  public update(id) {
    this.editId = id;
    this.selectedPage = this.tabPageType.EditPage;
  }
  public freezeOrThaw(isDelete, id) {
    const message: string = isDelete === 0 ? '冻结' : '解冻';
    this.messageService.showAlertMessage('', `确定${message}该条信息吗?`, 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      if (isDelete === 0) {
        this.commonResDeal(this.materialManageService.freeze(id), true);
      } else {
        this.commonResDeal(this.materialManageService.thaw(id), true);
      }
    });
  }

  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    this.messageService.showLoading();
    observer.subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'error');
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public detail(id) {
    this.detailId = id;
    this.selectedPage = this.tabPageType.DetailPage;
  }
  toAddPage(): void {

    // this.selectedPage = this.tabPageType.AddPage;
    this.selectedPage = this.tabPageType.SelectPage;
  }

  backToList(): void {
    this.selectedPage = this.tabPageType.ManagePage;
    this.getList();
  }

  public leadInPlanPrice() {
    this.downloadTplUrl = environment.baseUrl.ss + '/material/downloadPlanPriceTemplate';
    this.importExcel('导入计划价', '/material/importPlanPrice');
  }
  private importExcel(title: string, path) {
    this.importErrMsgList = [];
    this.uploadModalService.showUploadModal({
      uploadUrl: environment.baseUrl.ss + path,
      title: title,
      okText: null,
      cancelText: null,
      maxFileNum: 1,
      fileType: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      topTpl: this.uploadTopTpl,
      addBtuText: '导入',
      onResponse: this.onUploadResponse,
      bottomTpl: this.uploadModalErrMsgTpl,
      modalWidth: 380
    });
  }
  onUploadResponse = (resData) => {
    if (resData.code !== 0) {
      this.importErrMsgList = resData.value || [];
      return false;
    }
    this.getList();
    return true;
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-materialSetting',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 150, fixed: true },
      { title: '物料编码', tdTemplate: this.codeTpl, width: 200, fixed: true },
      { title: '物料名称', field: 'name', width: 150, fixed: true },
      { title: '物料类别', field: 'materialType', width: 100, pipe: 'materialType2' },
      { title: '物料分类', field: 'fullClassName', width: 300},
      { title: '状态', field: 'isDelete', width: 100, pipe: 'materialSettingStatus' },
      { title: '型号规格', field: 'specificationModel', width: 150 },
      { title: '零件号/图号', field: 'drawingNumber', width: 150 },
      { title: '材质', field: 'material', width: 150 },
      { title: '品牌', field: 'brand', width: 150 },
      { title: '进口/国产', field: 'importOrDomestic', width: 150 },
      { title: '物资分类', field: 'materialClassification', width: 150 },

      ]
    };
    this.getList();
    this.getUnitList();
  }

}
