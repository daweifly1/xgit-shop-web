import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../layout/ufast-table/ufast-table.component';
import { MaterialManageService, MaterialManageServiceNs } from '../../../core/trans/materialManage.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {ActionCode} from '../../../../environments/actionCode';
interface TabPageType {
  ManagePage: number;
  EditPage: number;
  ReportPage: number;
}
interface ButtonState {
  pass: boolean;
  reject: boolean;
  edit: boolean;
}
enum MaxLenInputEnum {
  Default = 50
}
@Component({
  selector: 'app-material-model-exam',
  templateUrl: './material-model-exam.component.html',
  styleUrls: ['./material-model-exam.component.scss']
})
export class MaterialModelExamComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  tabPageType: TabPageType;
  selectedPage: number;

  fullSearchShow: boolean;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('currComp')
  tableConfig: UfastTableNs.TableConfig;
  filters: any;
  dataList: any;
  isSparePart: boolean;
  materialClassArry: any[];
  choosedEquipmentList: any[];
  editItemId: string;
  materialClassId: any;

  public values: any[] = null;
  reportForm: FormGroup;
  reportData: any;
  reportFlag: number;
  buttonState: {[index: string]: ButtonState};
  ActionCode = ActionCode;

  constructor(private materialManageService: MaterialManageService, private messageService: ShowMessageService, private fb: FormBuilder) {
    this.tabPageType = {
      ManagePage: 0,
      EditPage: 1,
      ReportPage: 2,
    };
    this.selectedPage = this.tabPageType.ManagePage;
    this.fullSearchShow = false;
    this.filters = {};
    this.editItemId = '';
    this.materialClassId = [];
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
    this.materialClassId = [];
    this.getDataList();
  }
  public getDataList = (pageNum?: number, pageSize?: number) => {
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
    this.tableConfig.loading = true;
    this.materialManageService.getMaterialTempleteReportList(filter).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.dataList.forEach((item) => {
        item.aduitRemark = item.status === MaterialManageServiceNs.AuditStatus.Pass ? '' : item.aduitRemark;
        this.buttonState[item.id] = {
          pass: item.status === MaterialManageServiceNs.AuditStatus.Wait,
          reject: item.status === MaterialManageServiceNs.AuditStatus.Wait,
          edit: item.status !== MaterialManageServiceNs.AuditStatus.Pass
        };
      });
    }, (error) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public searchTextChange(searchText) {
    this.filters.materialName = searchText;
  }
  public advancedSearch() {
    this.getDataList();
  }

  // toAddPage(): void {
  //   this.selectedPage = this.tabPageType.AddPage;
  // }

  backToList(): void {
    this.selectedPage = this.tabPageType.ManagePage;
    this.getDataList();
  }

  update(id: string): void {
    if (!this.buttonState[id].edit) {
      return;
    }
    this.editItemId = id;
    this.selectedPage = this.tabPageType.EditPage;
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.dataList.length; i < len; i++) {
      this.dataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.dataList.every((item, index, array) => {
        return item._checked === true;
      });
    }
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

  public batchAuditPass() {
    const selectData = [];
    let audited = false;
    this.dataList.forEach((item) => {
      if (item._checked) {
        selectData.push(item);
      }
    });
    if (!selectData.length) {
      this.messageService.showToastMessage('请选择要通过的数据', 'warning');
      return;
    }
    selectData.forEach((item) => {
      if (item.status !== 0) {
        audited = true;
      }
      return;
    });
    if (audited) {
      this.messageService.showAlertMessage('', '所选数据包含已审核过的,请选择未审核的数据', 'error');
      return;
    }
    const ids = [];
    selectData.forEach((item) => {
      ids.push({ id: item.id });
    });
    // 批量通过
    const submit = this.materialManageService.materialTemplateReportBatchAuditPass(ids);
    this.fun(submit);
  }
  public batchAuditNotPass() {
    const selectData = [];
    let audited = false;
    this.dataList.forEach((item) => {
      if (item._checked) {
        selectData.push(item);
      }
    });
    if (!selectData.length) {
      this.messageService.showToastMessage('请选择要拒绝的数据', 'warning');
      return;
    }
    selectData.forEach((item) => {
      if (item.status !== 0) {
        audited = true;
      }
      return;
    });
    if (audited) {
      this.messageService.showAlertMessage('', '所选数据包含已审核过的,请选择未审核的数据', 'error');
      return;
    }
    // 批量拒绝
    this.reportData = selectData;
    this.selectedPage = this.tabPageType.ReportPage;
    this.reportFlag = 2;
  }
  public auditPass(id) {
    if (!this.buttonState[id].pass) {
      return;
    }
    const submit = this.materialManageService.materialTemplateReportAuditPass({ id: id });
    this.fun(submit);
  }
  public aduitNotPass(id) {
    if (!this.buttonState[id].reject) {
      return;
    }
    this.selectedPage = this.tabPageType.ReportPage;
    this.reportData = {};
    this.reportData.id = id;
    this.reportFlag = 1;
  }
  public confirm() {
    Object.keys(this.reportForm.controls).forEach((item) => {
      this.reportForm.controls[item].markAsDirty();
      this.reportForm.controls[item].updateValueAndValidity();
    });
    if (!this.reportForm.valid) {
      return;
    }
    if (this.reportFlag === 1) {
      this.reportData.aduitRemark = this.reportForm.value.auditRemark;
      const submit = this.materialManageService.materialTemplateReportAuditNotPass(this.reportData);
      this.fun(submit);
    } else {
      this.reportData.forEach((item) => {
        item.aduitRemark = this.reportForm.value.auditRemark;
        const submit = this.materialManageService.materialTemplateReportBatchAuditNotPass(this.reportData);
        this.fun(submit);
      });
    }
  }
  public fun(submit) {
    submit.subscribe((
      resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      if (this.reportFlag) {
        this.selectedPage = this.tabPageType.ManagePage;
      }
      this.getDataList();
      this.messageService.showToastMessage('操作成功', 'success');
      this.reportForm.reset();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public cancel() {
    this.selectedPage = this.tabPageType.ManagePage;
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'materialManage-materialTemplateAduit',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      checkRowField: '_checked',
      checkAll: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 150, fixed: true },
      { title: '物料名称', field: 'materialName', width: 150, fixed: true },
      { title: '物料类别', field: 'materialType', width: 150, pipe: 'materialTemplateType' },
      { title: '物料分类', field: 'fullClassName', width: 300 },
      { title: '计量单位', field: 'unit', width: 100 },
      { title: '状态', field: 'status', width: 150, pipe: 'auditStatus' },
      { title: '拒绝原因', field: 'aduitRemark', width: 180 },
      { title: '提报部门', field: 'reportDept', width: 150 },
      { title: '提报人', field: 'reportUserName', width: 150 },
      { title: '提交时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' }

      ]
    };
    this.reportForm = this.fb.group({
      auditRemark: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default)]]
    });
    this.getDataList();

  }

}
