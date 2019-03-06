import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { FactoryMineService, FactoryMineServiceNs } from '../../../../core/trans/factoryMine.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';

@Component({
  selector: 'app-name-match',
  templateUrl: './name-match.component.html',
  styleUrls: ['./name-match.component.scss']
})
export class NameMatchComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() materialName: string;
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('operation') operation: TemplateRef<any>;
  materialList: any;
  filters: any;
  fullSearchShow: boolean;
  materialClassArry: any;
  materialClass: any;


  constructor(private factoryMineService: FactoryMineService, private messageService: ShowMessageService) {
    this.finish = new EventEmitter();
    this.materialList = [];
    this.filters = <any>{};
    this.fullSearchShow = false;
    this.materialClassArry = [];
  }

 getDataList = (pageNum?: number, pageSize?: number) => {
    this.materialList = [];
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    if (this.materialName) {
      this.filters.name = this.materialName;
    }
    if (this.materialClass) {
      this.filters.materialClassId = this.materialClass[this.materialClass.length - 1];
    }
    const filter = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize || pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.factoryMineService.getNameMatchList(filter).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.tableConfig.loading = false;
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.tableConfig.loading = false;
      this.materialList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    });
  }
  showMaterialClass(value) {
    if (value) {
      this.getMaterialClass('0', undefined);
    }
  }
  selectMaterialClassItem(selectedItem) {
    if (selectedItem.option.isLeaf) {
      return;
    }
    selectedItem.option.children.shift();
    this.getMaterialClass(selectedItem.option.value, selectedItem.option.children);
  }
  getMaterialClass(pId: string, materialClassArry?: any[], ) {
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
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }
  public advancedSearchReset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
    });
    this.materialClass = [];
    this.getDataList();
  }
  public fullSearchClose() {
    this.fullSearchShow = false;
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.materialList.length; i < len; i++) {
      this.materialList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.materialList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }
  public distributionFun(data) {
    this.messageService.showLoading();
    this.factoryMineService.distribution(data).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public distribution(id, isDelete) {
    if (isDelete) {
      this.messageService.showToastMessage('冻结数据不可以分配', 'warning');
      return;
    }
    const selectDataId = [];
    selectDataId.push(id);
    const data = {
      materialIds: selectDataId
    };
    this.distributionFun(data);
  }
  public distributionBatch() {
    const selectDataId = [];
    this.materialList.forEach((item) => {
      if (item._checked === true) {
        selectDataId.push(item);
      }
    });
    if (selectDataId.length === 0) {
      this.messageService.showToastMessage('请选择要提报的数据', 'warning');
      return;
    }
    let assigned = false;
    selectDataId.forEach((item) => {
      if (item.assigned) {
        this.messageService.showToastMessage('所选数据包含已分配的', 'warning');
        assigned = true;
        return;
      }
    });
    if (assigned) {
      return;
    }
    const data = [];
    selectDataId.forEach((item) => {
      data.push(item.id);
    });
    this.distributionFun({ materialIds: data });
  }


  public goback() {
    this.emitFinish();
  }
  public emitFinish() {
    this.finish.emit();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-materialReport-nameMatch',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 100, fixed: true },
      { title: '物料编号', field: 'code', width: 250 },
      { title: '物料名称', field: 'name', width: 140 },
      { title: '物料类型', field: 'materialType', width: 150, pipe: 'materialType2' },
      { title: '物料分类', field: 'fullClassName', width: 300 },
      { title: '物料描述', field: 'materialDesc', width: 250 },
      { title: '计量单位', field: 'unit', width: 100 },
      { title: '主机名称', field: 'deviceName', width: 100 },
      { title: '主机型号', field: 'deviceModel', width: 100 },
      { title: '型号规格', field: 'specificationModel', width: 100 },
      { title: '零件号/图号', field: 'drawingNumber', width: 150 },
      { title: '品牌', field: 'brand', width: 150 },
      { title: '进口/国产', field: 'importOrDomestic', width: 150 },
      { title: '状态', field: 'isDelete', width: 150, pipe: 'nameMatchStatus' },
      { title: '是否已分配', field: 'assigned', width: 150, pipe: 'assigned' },
      ]
    };
    this.getDataList();


  }
}
