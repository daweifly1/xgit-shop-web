
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {MaterialManageService, MaterialManageServiceNs} from '../../../core/trans/materialManage.service';
import {FactoryMineService, FactoryMineServiceNs} from '../../../core/trans/factoryMine.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {ActionCode} from '../../../../environments/actionCode';
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
interface ButtonState {
  Edit: boolean;
}
@Component({
  selector: 'app-material-template-report',
  templateUrl: './material-template-report.component.html',
  styleUrls: ['./material-template-report.component.scss']
})
export class MaterialTemplateReportComponent implements OnInit {
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
  buttonState: {[index: string]: ButtonState};
  constructor(private materialManageService: MaterialManageService, private messageService: ShowMessageService,
     private factoryMineService: FactoryMineService) {
    this.selectedPage = TabPageType.ManagePage;
    this.dataList = [];
    this.searchPlaceholder = '物料名称';
    this.fullSearchShow = false;
    this.filters = {};
    this.materialClassArry = [];
    this.buttonState = {};
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
    if (!this.buttonState[id].Edit) {
      return;
    }
    this.editItemId = id;
    this.selectedPage = TabPageType.AddPage;
  }

  public reset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
    });
    this.materialClass = [];
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
    this.factoryMineService.getMaterialTemplateReportList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.tableConfig.loading = false;
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.dataList.forEach((item) => {
        item.aduitRemark = item.status === FactoryMineServiceNs.AuditStatus.Pass ? '' : item.aduitRemark;
        this.buttonState[item.id] = {
          Edit: item.status === FactoryMineServiceNs.AuditStatus.Reject
        };
      });
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-materialTemplateReport',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{title: '操作', tdTemplate: this.operation, width: 80, fixed: true},
      {title: '物料名称', field: 'materialName', width: 150, fixed: true},
        {title: '物料类别', field: 'materialType', width: 150, pipe: 'materialTemplateType'},
        // {title: '一级分类', field: 'firstLevel', width: 150},
        // {title: '二级分类', field: 'secondLevel', width: 150},
        // {title: '三级分类', field: 'thirdLevel', width: 150},
        { title: '物料分类', field: 'fullClassName', width: 300},
        {title: '单位', field: 'unit', width: 150},
        {title: '状态', field: 'status', width: 150, pipe: 'auditStatus'},
        {title: '拒绝原因', field: 'aduitRemark', width: 150},
        {title: '提报部门', field: 'reportDept', width: 150},
        {title: '提报人', field: 'reportUserName', width: 150},
        {title: '提报时间', field: 'createDate', width: 150, pipe: 'date: yyyy-MM-dd HH:mm'}
      ]
    };
    this.getDataList();
  }
}

