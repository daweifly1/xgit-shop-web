import { Component, OnInit, AfterContentInit, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { WarehouseServiceNs, WarehouseService } from '../../../../core/trans/warehouse.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ActionCode } from '../../../../../environments/actionCode';

interface PageType {
  MainPage: number;
  AddWarehousePage: number;
  AddWarehouseAreaPage: number;
  WarehouseAreaManagePage: number;
  EditWarehousePage: number;
}
interface WarehouseType {
  id: string;
  type: string;
}interface WarehouseType {
  id: string;
  type: string;
}
interface WarehouseFilter {
  pageNum: number;
  pageSize: number;
  code: string;
  remark: string;
  houseLevel: string;
  pCode: string;
}
@Component({
  selector: 'app-warehouse-manage',
  templateUrl: './warehouse-manage.component.html',
  styleUrls: ['./warehouse-manage.component.scss']
})
export class WarehouseManageComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  warehouseDataList: WarehouseServiceNs.WarehouseModel[];
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('serialNumber') serialNumber: TemplateRef<any>;
  @Output() finish: EventEmitter<any>;
  @Input() searchText: string;

  PageType: PageType;
  selectedPage: number;
  newWarehouseForm: FormGroup;
  warehouseCode: string;
  warehouseId: string;
  selectedId: string;
  searchPlaceholder: string;
  advancedSearchShow: boolean;
  filters: WarehouseFilter;
  editData: any;  // 编辑数据
  addData: any; // 新增时默认保管员
  keeperName: string; // 仓库管理员名称
  ActionCode = ActionCode;
  constructor(private warehouseService: WarehouseService, private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.warehouseDataList = [];
    this.selectedId = '';
    this.PageType = {
      MainPage: 0,
      AddWarehousePage: 1,
      AddWarehouseAreaPage: 2,
      WarehouseAreaManagePage: 3,
      EditWarehousePage: 4
    };
    this.selectedPage = this.PageType.MainPage;
    this.advancedSearchShow = false;
    this.filters = {
      pageNum: 1,
      pageSize: 10,
      code: '',
      remark: '',
      houseLevel: '',
      pCode: ''
    };
  }



  getWarehouseList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const data = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {
        code: this.filters.code,
        remark: this.filters.remark,
        pCode: '0',
        houseLevel: '1'
      }
    };
    this.tableConfig.loading = true;
    this.warehouseService.getLocationList(data).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.warehouseDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public addWarehouse() {
    this.selectedPage = this.PageType.AddWarehousePage;
  }
  public editWarehouse(warehouseCode, warehouseId, remark, type, keeperName, keeperId) {
    this.warehouseCode = warehouseCode;
    this.warehouseId = warehouseId;
    this.editData = {
      warehouseCode,
      warehouseId,
      remark,
      type,
      keeperName,
      keeperId
    };
    this.selectedPage = this.PageType.EditWarehousePage;
  }
  public deleteWarehouse(id) {
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.warehouseService.deleteWarehouse(id), true);
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    this.messageService.showLoading();
    observer.subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getWarehouseList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'error');
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public addWarehouseArea(warehouseCode, warehouseId, keeperId, keeperName) {
    this.warehouseCode = warehouseCode;
    this.warehouseId = warehouseId;
    this.addData = {
      keeperId,
      keeperName
    };
    this.selectedPage = this.PageType.AddWarehouseAreaPage;
  }

  public warehouseAreaManage(id: string, code: string, keeperId: string, keeperName: string) {
    this.selectedPage = this.PageType.WarehouseAreaManagePage;
    this.selectedId = id;
    this.warehouseCode = code;
    this.addData = {
      keeperId,
      keeperName
    };
  }

  public onChildFinish() {
    this.selectedPage = this.PageType.MainPage;
    this.getWarehouseList();
  }
  public searchTextChange(searchText) {
    this.filters.code = searchText;
  }
  public advancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public advancedSearchClose() {
    this.advancedSearchShow = false;
  }
  public advancedSearchReset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
    });
    this.getWarehouseList();
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-warehouseManage',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{
        title: '操作',
        tdTemplate: this.operation,
        width: 100,
      }, {
        title: '仓库编码',
        tdTemplate: this.serialNumber,
        width: 100,
      }, {
        title: '仓库描述',
        field: 'remark',
        width: 100,
      }, {
        title: '类型',
        field: 'type',
        width: 100,
        pipe: 'warehouseType'
      }, {
        title: '保管员',
        field: 'keeperName',
        width: 100,
      }
      ]
    };
    this.getWarehouseList();
    this.newWarehouseForm = this.formBuilder.group({
      warehouseCode: [null, Validators.required],
      description: [null, Validators.required],
      isPlan: [null],
    });
  }

}
