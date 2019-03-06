import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import {UfastTableNs} from '../../../../../layout/layout.module';
import {WarehouseServiceNs, WarehouseService} from '../../../../../core/trans/warehouse.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {ActionCode} from '../../../../../../environments/actionCode';
import { ThrowStmt } from '@angular/compiler';
/**
 * 库区管理
 * **/
interface AreaPageTypeEnum {
  areaList: number;
  addArea: number;
  addLocation: number;
  areaDetail: number;
  editArea: number;
}
 interface WarehouseAreaFilter {
  pageNum?: number;
  pageSize?: number;
  warehouseId?: string;
  code?: string;
  remark?: string;
  houseLevel?: string;
  pCode?: string;
}
@Component({
  selector: 'app-warehouse-area-manage',
  templateUrl: './warehouse-area-manage.component.html',
  styleUrls: ['./warehouse-area-manage.component.scss']
})
export class WarehouseAreaManageComponent implements OnInit {
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('serialNumber') serialNumber: TemplateRef<any>;
  @Output()finish: EventEmitter<any>;
  @Input()warehouseId: string;
  @Input()warehouseCode: string;
  @Input()areaCode: string;
  @Input()areaId: string;
  @Input()searchText: string;
  @Input()addData: any;
  currentPageType: number;
  pageTypeEnum: AreaPageTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  warehouseAreaDataList: WarehouseServiceNs.WarehouseAreaModel[];
  selectAreaId: string;
  selectAreaCode: string;
  searchPlaceholder: string;
  advancedSearchShow: boolean;
  filters: WarehouseAreaFilter;
  editData: any;
  defaultKeeper: any;
  ActionCode = ActionCode;
  constructor(private warehouseService: WarehouseService, private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.finish = new EventEmitter();
    this.warehouseId = '';
    this.areaCode = '';
    this.areaId = '';
    this.pageTypeEnum = {
      areaList: 0,
      addArea: 1,
      addLocation: 2,
      areaDetail: 3,
      editArea: 4
    };
    this.currentPageType = this.pageTypeEnum.areaList;
    this.warehouseAreaDataList = [];
    this.selectAreaId = '';
    this.selectAreaCode = '';
    this.advancedSearchShow = false;
    this.filters = {};
  }

  getWarehouseAreaList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    const data = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: {
        code: this.filters.code,
        remark: this.filters.remark,
        pCode: this.warehouseCode,
        houseLevel: '2'
      }
    };
    this.tableConfig.loading = true;
    this.warehouseService.getLocationList(data).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.tableConfig.loading = false;
      this.warehouseAreaDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public goback() {
    this.emitFinish();
  }
  public emitFinish() {
    this.finish.emit();
  }
  public onChildPageFinish() {
    this.currentPageType = this.pageTypeEnum.areaList;
    this.getWarehouseAreaList();
  }
  public addWarehouseArea() {
    this.currentPageType = this.pageTypeEnum.addArea;
  }
  public addLocation(areaCode, areaId, keeperId, keeperName) {
    this.currentPageType = this.pageTypeEnum.addLocation;
    this.selectAreaCode = areaCode;
    this.selectAreaId = areaId;
    this.defaultKeeper = {
      keeperId,
      keeperName
    };
  }
  public editWarehouseArea(code, id, remark, keeperName, keeperId, erpCode) {
    this.editData = {
      code,
      id,
      remark,
      keeperName,
      keeperId,
      erpCode,
      pCode: this.warehouseCode
    };
    this.currentPageType = this.pageTypeEnum.editArea;
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
          this.getWarehouseAreaList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'error');
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public locationManage(areaCode, id, keeperId, keeperName) {
    this.currentPageType = this.pageTypeEnum.areaDetail;
    this.selectAreaId = id;
    this.selectAreaCode = areaCode;
    this.defaultKeeper = {
      keeperId,
      keeperName
    };
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
    this.getWarehouseAreaList();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-warehouseArea',
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
        width: 150,
      }, {
        title: '库区编码',
        tdTemplate: this.serialNumber,
        width: 150,
      }, {
        title: '库区描述',
        field: 'remark',
        width: 150,
      }, {
        title: '保管员',
        field: 'keeperName',
        width: 150,
      }
      ]
    };
    this.getWarehouseAreaList();
  }

}
