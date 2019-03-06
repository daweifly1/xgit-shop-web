import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { FactoryMineService, FactoryMineServiceNs } from '../../../core/trans/factoryMine.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { MaterialManageServiceNs } from '../../../core/trans/materialManage.service';
import {ActionCode} from '../../../../environments/actionCode';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';

interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
  MaterialSelectPage: number;
  NameMatchPage: number;
}
interface FilterModel {
  name?: string;  // 物料名称
  code?: string;  // 物料编码
  materialType?: string; // 类别
  // materialClassId?: string; // 物料分类
  firstType?: string;   // 一级分类
  secondType?: string;   // 二级分类
  thirdType?: string;   // 三级分类
  drawingNumber?: string; // 零件号/图号
  material?: string;      // 材质
  brand?: string; // 品牌
  unit?: string;  // 单位
  startCreateDate?: any;
  endCreateDate?: any;
  materialClassId?: string;
}
interface ButtonState {
  Edit: boolean;
}
@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss']
})
export class MaterialComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  tabPageType: TabPageType;
  selectedPage: number;
  materialList: any;
  filters: FilterModel;
  tableConfig: UfastTableNs.TableConfig;
  fullSearchShow: boolean;
  @ViewChild('operation') operation: TemplateRef<any>;
  editId: string;

  isSparePart: boolean;
  materialClassArry: any[];
  choosedEquipmentList: any[];
  materialClass: any;

  public values: any[] = null;
  materialName: string; // 档案分配要传的名字
  buttonState: { [index: string]: ButtonState };
  ActionCode = ActionCode;
  constructor(private factoryMineService: FactoryMineService, private messageService: ShowMessageService,
              private ufastUtilService: UfastUtilService) {
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
      MaterialSelectPage: 4,
      NameMatchPage: 5
    };
    this.selectedPage = this.tabPageType.ManagePage;
    this.materialList = [];
    this.fullSearchShow = false;
    this.filters = {};
    this.editId = '';

    this.materialClass = [];
    this.materialName = '';
    this.buttonState = {};
  }

  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }

  public fullSearchClose() {
    this.fullSearchShow = false;
  }

  public advanceSearchReset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
    });
    this.materialClass = [];
    this.getDataList();
  }
  public getDataList = (pageNum?: number, pageSize?: number) => {
    this.materialList = [];
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    if (this.filters.startCreateDate) {
      this.filters.startCreateDate = this.ufastUtilService.getStartDate(this.filters.startCreateDate);
    }
    if (this.filters.endCreateDate) {
      this.filters.endCreateDate = this.ufastUtilService.getEndDate(this.filters.endCreateDate);
    }
    if (this.materialClass) {
      this.filters.materialClassId = this.materialClass[this.materialClass.length - 1];
    }
    this.tableConfig.loading = true;
    const filter = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize || pageSize,
      filters: this.filters
    };
    this.factoryMineService.getMaterialReportList(filter).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.tableConfig.loading = false;
      this.materialList = resData.value.list;
      this.materialList.forEach((item) => {
        item.auditRemark = item.status === MaterialManageServiceNs.AuditStatus.Pass ? '' : item.auditRemark;
        this.buttonState[item.id] = {
          Edit: item.status === MaterialManageServiceNs.AuditStatus.Reject
        };
      });
      this.tableConfig.total = resData.value.total;
    }, (error) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public onChildPageFinish() {
    this.selectedPage = this.tabPageType.ManagePage;
    this.getDataList();
  }



  selectMaterialClassItem(selectedItem) {
    if (selectedItem.option.isLeaf) {
      return;
    }
    selectedItem.option.children.shift();
    this.getMaterialClass(selectedItem.option.value, selectedItem.option.children);
  }
  public add() {
    this.selectedPage = this.tabPageType.MaterialSelectPage;
  }
  public update(id) {
    if (!this.buttonState[id].Edit) {
      return;
    }
    this.editId = id;
    this.selectedPage = this.tabPageType.EditPage;
  }
  public allot() {
    this.selectedPage = this.tabPageType.NameMatchPage;
  }


  showMaterialClass(value) {
    if (value) {
      this.getMaterialClass('0', undefined);
    }
  }


  getMaterialClass(pId: string, materialClassArry?: any[]) {
    const param: { pId: string, materialType?: number } = { pId: pId };
    this.factoryMineService.getMaterialClassListNoPage(param).subscribe((resData) => {
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



  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-materialReport',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 100, fixed: true },
      { title: '物料描述', field: 'materialDesc', width: 150 },
      { title: '物料类别', field: 'materialType', width: 150, pipe: 'materialType2' },
      { title: '物料分类', field: 'fullClassName', width: 300 },
      { title: '物料名称', field: 'name', width: 140 },
      // { title: '曾用名', field: 'formerName', width: 100 },
      { title: '计量单位', field: 'unit', width: 100 },
      { title: '型号规格', field: 'specificationModel', width: 150 },
      { title: '零件号/图号', field: 'drawingNumber', width: 150 },
      { title: '材质', field: 'material', width: 150 },
      { title: '品牌', field: 'brand', width: 150 },
      { title: '进口/国产', field: 'importOrDomestic', width: 150 },
      { title: '重要度', field: 'importance', width: 150 },
      { title: '物资分类', field: 'materialClassification', width: 150 },
      { title: '提报人', field: 'reportUserName', width: 150 },
      { title: '提报时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' },
      { title: '状态', field: 'status', width: 150, pipe: 'auditStatus' },
      { title: '拒绝原因', field: 'auditRemark', width: 150 },
      { title: '审批人', field: 'auditUserName', width: 150 },
      { title: '审批时间', field: 'auditDate', width: 150, pipe: 'date: yyyy-MM-dd HH:mm' },

      ]
    };
    this.getDataList();


  }

}
