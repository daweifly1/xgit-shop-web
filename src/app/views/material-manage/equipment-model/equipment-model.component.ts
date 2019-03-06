import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MaterialManageService, MaterialManageServiceNs } from '../../../core/trans/materialManage.service';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { FormBuilder, FormControl, FormGroup, Validators, NgModel } from '@angular/forms';
import {ActionCode} from '../../../../environments/actionCode';
enum PageType {
  ManagePage = 0,
  AddPage = 1,
  EditPage = 2
}
enum MaxLenInputEnum {
  Default = 50
}
@Component({
  selector: 'app-equipment-model',
  templateUrl: './equipment-model.component.html',
  styleUrls: ['./equipment-model.component.scss']
})
export class EquipmentModelComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  tabPageType = PageType;
  selectedPage: number;
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  filters: any;
  fullSearchShow: boolean;
  equipmentModelDataList: any;
  materialClass: any;
  detailId: string;
  materialId: string;
  materialClassArry: any;
  ActionCode = ActionCode;
  constructor(private materialManageService: MaterialManageService, private messageService: ShowMessageService, private fb: FormBuilder) {
    this.selectedPage = this.tabPageType.ManagePage;
    this.filters = <any>{};
    this.fullSearchShow = false;
    this.equipmentModelDataList = [];
    this.materialClass = [];
    this.materialClassArry = [];

  }
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }
  public advanceSearchReset() {
    // Object.keys(this.filters).forEach((item: string) => {
    //   this.filters[item] = '';
    // });
    this.filters = {};
    this.getDataList();
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
    const param: { pId: string, materialType?: number } = { pId: pId, materialType: 3 };
    this.messageService.showLoading();
    this.materialManageService.getMaterialClassListNoPage(param).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'error');
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
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  getDataList = (pageNum?: number, pageSize?: number) => {
    this.equipmentModelDataList = [];
    this.tableConfig.loading = true;
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    if (this.materialClass) {
      this.filters.materialClassId = this.materialClass[this.materialClass.length - 1];
    }
    const filter = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize || pageSize,
      filters: this.filters
    };
    this.messageService.showLoading();
    this.materialManageService.getEquipmentModelList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.tableConfig.loading = false;
        this.messageService.showToastMessage( resData.message, 'error');
        return;
      }
      this.tableConfig.loading = false;
      resData.value.list.forEach((item) => {
        const temp = <any>{};
        if (item['materialVO']) {
          temp.firstLevel = item['materialVO'].firstLevel;
          temp.secondLevel = item['materialVO'].secondLevel;
          temp.thirdLevel = item['materialVO'].thirdLevel;
          temp.materialName = item['materialVO'].name;
          temp.id = item.id;
          temp.materialId = item.materialId;
          temp.fullClassName = item['materialVO'].fullClassName;
        }
        temp.modelName = item.modelName;
        this.equipmentModelDataList.push(temp);
      });
      this.tableConfig.total = resData.value.total;
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public toAddPage() {
    this.detailId = '';
    this.materialId = '';
    this.selectedPage = this.tabPageType.AddPage;
  }
  public edit(id: string, materialId: string) {
    this.detailId = id;
    this.materialId = materialId;
    this.selectedPage = this.tabPageType.EditPage;
  }
  backToList(): void {
    this.selectedPage = this.tabPageType.ManagePage;
    this.getDataList();
  }

  isSelectedThirdClass(control: FormControl): any {
    if (!control.value) {
      return true;
    }
    return (control.value.length < 3) ? { isSelectedThird: true } : null;
  }
  public delete(id) {
    this.messageService.showLoading();
    this.materialManageService.deleteEquipmentModel(id).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getDataList();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-equipmentModel',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operationTpl, width: 100, fixed: true },
      // { title: '一级分类', field: 'firstLevel', width: 100 },
      // { title: '二级分类', field: 'secondLevel', width: 100 },
      // { title: '三级分类', field: 'thirdLevel', width: 100 },
      { title: '物料分类', field: 'fullClassName', width: 300 },
      { title: '设备名称', field: 'materialName', width: 100 },
      { title: '设备型号', field: 'modelName', width: 150 }

      ]
    };
    this.getDataList();
  }

}
