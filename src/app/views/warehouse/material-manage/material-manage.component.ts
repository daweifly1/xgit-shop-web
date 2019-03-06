import {Component, OnInit, AfterContentInit, ViewChild, TemplateRef, Input, Output, EventEmitter} from '@angular/core';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../layout/layout.module';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {MaterialManageServiceNs, MaterialManageService} from '../../../core/trans/materialManage.service';
import { materialize } from '../../../../../node_modules/rxjs/operators';

interface PageType {
  MainPage: number;
  AddMaterialPage: number;
  ViewLocationPage: number;
  MaterialDetailPage: number;
}
interface FilterItem {
  pageNum: number;
  pageSize: number;
  materialsNos: string;
  materialsTypeId: string;
  keyWords: string;
}
interface TypeItem {
  type: number;
  value: string;
}
@Component({
  selector: 'app-material-manage',
  templateUrl: './material-manage.component.html',
  styleUrls: ['./material-manage.component.scss']
})
export class MaterialManageComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  materialDataList: any[];
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('serialNumber') serialNumber: TemplateRef<any>;
  @Output()finish: EventEmitter<any>;
  @Input()searchText: string;

  PageType: PageType;
  selectedPage: number;
  selectedId: string;
  searchPlaceholder: string;
  advancedSearchShow: boolean;
  filters: FilterItem;
  material: TypeItem[];
  materialsId: string;
  constructor(private materialService: MaterialManageService,
     private messageService: ShowMessageService,
      private formBuilder: FormBuilder) {
    this.materialDataList = [];
    this.selectedId = '';
    this.PageType = {
      MainPage: 0,
      AddMaterialPage: 1,
      ViewLocationPage: 2,
      MaterialDetailPage: 3
    };
    this.selectedPage = this.PageType.MainPage;
    this.searchPlaceholder = '物料编码，多个逗号分隔';
    this.advancedSearchShow = false;
    this.material = [
      { type: 0, value: '未设置' },
      { type: 1, value: '动力总成件' },
      { type: 2, value: '斗齿' },
      { type: 3, value: '覆盖件' },
      { type: 4, value: '标准件' },
      { type: 5, value: '钢管' },
      { type: 6, value: '大型结构件' },
      { type: 7, value: '机加工件' },
      { type: 8, value: '发动机附件' },
      { type: 9, value: '辅料、工具' },
      { type: 10, value: '关键电器件' },
      { type: 11, value: '驾驶室及附件' },
      { type: 12, value: '滤芯' },
      { type: 13, value: '属具' },
      { type: 14, value: '四轮一带及附件' },
      { type: 15, value: '空调总成及附件' },
      { type: 16, value: '橡胶件' },
      { type: 17, value: '密封件' },
      { type: 18, value: '小型结构件' },
      { type: 19, value: '液压附件' },
      { type: 20, value: '液压总成件' },
      { type: 21, value: '油品' },
      { type: 22, value: '一般电器件' }
    ];
    this.filters = {
      pageNum: 1,
      pageSize: 10,
      materialsNos: '',
      materialsTypeId: '',
      keyWords: ''
    };
    this.materialsId = '';
  }

  public emitFinish() {
    this.finish.emit();
  }

  getMaterialList = () => {
    this.filters = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      materialsNos: this.filters.materialsNos,
      materialsTypeId: this.filters.materialsTypeId,
      keyWords: this.filters.keyWords
    };
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {
        materialsNos: this.filters.materialsNos,
        materialsTypeId: this.filters.materialsTypeId,
        keyWords: this.filters.keyWords
      }
    };
    this.tableConfig.loading = true;
    this.materialService.getMaterialList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  public materialDetail(materialsId) {
    this.selectedPage = this.PageType.MaterialDetailPage;
    this.materialsId = materialsId;
  }

  public onChildFinish() {
    this.selectedPage = this.PageType.MainPage;
    this.getMaterialList();
  }
  public search() {
    this.getMaterialList();
  }
  public searchTextChange(searchText) {
    this.filters.materialsNos = searchText;
  }
  public advancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchBtn() {
    this.getMaterialList();
  }
  public advancedSearchClose() {
    this.advancedSearchShow = false;
  }
  public advancedSearchReset() {
    this.filters.materialsNos = '';
    this.filters.materialsTypeId = '';
    this.filters.keyWords = '';
  }
  public refresh() {
    this.filters.materialsNos = '';
    this.filters.materialsTypeId = '';
    this.filters.keyWords = '';
    this.getMaterialList();
  }
  public addMaterial() {
    // this.selectedPage = this.PageType.AddMaterialPage;
  }
  public editMaterial() {

  }
  public deleteMaterial() {

  }
  public viewLocation() {

  }
  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-materialManage',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{
        title: '操作',
        tdTemplate: this.operation,
        width: 180,
        fixed: true
      }, {
        title: '物料编码',
        tdTemplate: this.serialNumber,
        width: 150,
      }, {
        title: '物料描述',
        field: 'materialsDes',
        width: 150,
      }, {
        title: '物料分类',
        field: 'materialsType',
        width: 150,
      }, {
        title: '基本计量',
        field: 'unit',
        width: 100,
      }, {
        title: '全国统一价',
        field: 'price',
        width: 100,
      }, {
        title: '标准价',
        field: 'standardPrice',
        width: 100,
      }, {
        title: '采购组',
        field: 'purchaseGroup',
        width: 100,
      }, {
        title: '进口件',
        field: 'entranceDevice',
        width: 100,
        pipe: 'entranceDevice'
      }, {
        title: '关键件',
        field: 'crucialDevice',
        width: 100,
        pipe: 'crucialDevice'
      }
      ]
    };
    this.getMaterialList();
  }

}
