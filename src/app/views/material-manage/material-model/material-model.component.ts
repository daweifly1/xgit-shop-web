import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { MaterialManageService, MaterialManageServiceNs } from '../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { ActionCode} from '../../../../environments/actionCode';
interface FilterItem {
  materialName?: string;
  materialType?: string;
  firstType?: string;
  secondType?: string;
  thirdType?: string;
  materialClassId?: string;
}

enum TabPageType {
  ManagePage,
  AddPage,
  EditPage,
  DetailPage
}

@Component({
  selector: 'app-material-model',
  templateUrl: './material-model.component.html',
  styleUrls: ['./material-model.component.scss']
})
export class MaterialModelComponent implements OnInit {
  selectedPage: TabPageType;
  filters: FilterItem;
  dataList: MaterialManageServiceNs.MaterialTempleteModel[];
  fullSearchShow: boolean;
  searchPlaceholder: string;
  editItemId: string;
  @ViewChild('operation') operation: TemplateRef<any>;

  tableConfig: UfastTableNs.TableConfig;
  materialClassArry: any;
  materialClass: any;
  ActionCode = ActionCode;

  constructor(private materialManageService: MaterialManageService, private messageService: ShowMessageService) {
    this.selectedPage = TabPageType.ManagePage;
    this.dataList = [];
    this.searchPlaceholder = '物料名称';
    this.fullSearchShow = false;
    this.filters = {};
    this.materialClassArry = [];
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

  selectMaterialClassItem(selectedItem) {
    if (selectedItem.option.isLeaf) {
      return;
    }
    selectedItem.option.children.shift();
    this.getMaterialClass(selectedItem.option.value, selectedItem.option.children);
  }

  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }

  toAddPage(): void {
    this.editItemId = null;
    this.selectedPage = TabPageType.AddPage;
  }

  backToList(): void {
    this.selectedPage = TabPageType.ManagePage;
    this.getDataList();
  }

  update(id: string): void {
    this.editItemId = id;
    this.selectedPage = TabPageType.AddPage;
  }

  public reset() {
    this.filters = {};
    this.materialClass = '';
    this.getDataList();
  }

  public getDataList = () => {
    this.tableConfig.loading = true;
    if (this.materialClass) {
      this.filters.materialClassId = this.materialClass[this.materialClass.length - 1];
    }
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.materialManageService.getMaterialTempleteList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-materialTemplate',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 80, fixed: true },
      { title: '物料类别', field: 'materialType', width: 150, pipe: 'materialTemplateType' },
      { title: '物料名称', field: 'materialName', width: 150 },
      { title: '物料分类', field: 'fullClassName', width: 300},
      { title: '型号规格规范', field: 'modelSpecification', width: 150 },
      { title: '计量单位', field: 'unit', width: 150 }
      ]
    };
    this.getDataList();
  }
}
