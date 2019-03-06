import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import {WarehouseServiceNs, WarehouseService} from '../../../../../core/trans/warehouse.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../../layout/layout.module';
/**
 * 新增库区
 * **/
interface KeeperNameType {
  name?: string;
  userId?: string;
}
enum MaxLenInputEnum {
  Code = 40,
  Remark = 40
}
@Component({
  selector: 'app-add-warehouse-area',
  templateUrl: './add-warehouse-area.component.html',
  styleUrls: ['./add-warehouse-area.component.scss']
})
export class AddWarehouseAreaComponent implements OnInit {
  @Input()warehouseCode: string;
  @Input()warehouseId: string;
  @Output()finish: EventEmitter<any>;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
  @Input() editData: any;
  @Input() addData: any;
  newWarehouseAreaForm: FormGroup;
  isVisiblekeeperName: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];
  keeperNameFilter: KeeperNameType;
  filters: any;
  maxLenInputEnum = MaxLenInputEnum;
  constructor(private warehouseService: WarehouseService, private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.warehouseCode = '';
    this.finish = new EventEmitter();
    this.isVisiblekeeperName = false;
    this.keeperNameDataList = [];
    this.keeperNameFilter = {};
    this.filters = '';
  }
  public emitFinish() {
    this.finish.emit();
  }

  public toggleManagePage() {
    this.newWarehouseAreaForm.reset();
    this.emitFinish();
  }
  showVisiblekeeperNameModal(pageNum?: number): void {
    this.isVisiblekeeperName = true;
    this.getKeeperNameModalData(pageNum);

  }
  getKeeperNameModalData = (pageNum?: number) => {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        name: this.filters.name
      }
    };
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseKeeperNameFun(item: any, userId: string) {
    this.newWarehouseAreaForm.controls['keeperName'].setValue(item);
    this.newWarehouseAreaForm.controls['keeperId'].setValue(userId);
    this.handleCancelKeeperName();
  }
  public searchKeeperName(pageNum?: number) {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        name: this.keeperNameFilter.name
      }
    };
    this.warehouseService.getKeeperNameList(filter).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.keeperNameDataList = resData.value.list;
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }

  handleCancelKeeperName(): void {
    this.isVisiblekeeperName = false;
  }
  public submitWarehouseArea() {
    Object.keys(this.newWarehouseAreaForm.controls).filter(
      item => typeof this.newWarehouseAreaForm.controls[item].value === 'string').forEach((key: string) => {
      this.newWarehouseAreaForm.controls[key].patchValue(this.newWarehouseAreaForm.controls[key].value.trim());
    });
    this.newWarehouseAreaForm.controls['houseLevel'].setValue(2);
    Object.keys(this.newWarehouseAreaForm.controls).forEach((key: string) => {
      this.newWarehouseAreaForm.controls[key].markAsDirty();
      this.newWarehouseAreaForm.controls[key].updateValueAndValidity();
    });
    if (this.newWarehouseAreaForm.invalid) {
      return;
    }
    if (this.editData === undefined) {
      const submit = this.warehouseService.addWarehouseArea(this.newWarehouseAreaForm.value);
      this.subFunc(submit);
    } else {
      const submit = this.warehouseService.updateWarehouse(this.newWarehouseAreaForm.getRawValue());
      this.subFunc(submit);
    }
  }
  public subFunc(submit) {
    this.messageService.showLoading();
    submit.subscribe(
      (resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'warning');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitFinish();
      }, (error: any) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }

  getWarehouseAreaDetail = () => {
    if (this.editData === undefined) {
      this.newWarehouseAreaForm.controls['keeperName'].patchValue(this.addData.keeperName);
      this.newWarehouseAreaForm.controls['keeperId'].patchValue(this.addData.keeperId);
      return;
    }
    this.newWarehouseAreaForm.patchValue(this.editData);
    this.newWarehouseAreaForm.controls['pCode'].patchValue(this.warehouseCode);
    this.newWarehouseAreaForm.controls['code'].disable();
    this.newWarehouseAreaForm.controls['houseLevel'].patchValue(2);
  }
  getFormControl(name) {
    return this.newWarehouseAreaForm.controls[name];
  }
  EngAndNum(control: FormControl): any {
    if (!control.value) {
      return true;
    }
    const reg = /^[\da-z]+$/i;
    return (!reg.test(control.value)) ? { engAndNum: true } : null;
  }
  ngOnInit() {
    this.newWarehouseAreaForm = this.formBuilder.group({
      id: [null],
      pCode: [this.warehouseCode, Validators.required],
      code: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Code),
         this.EngAndNum]],
      remark: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Remark)]],
      keeperName: [null],
      keeperId: [null],
      houseLevel: [null],
      erpCode: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Code)]]
    });
    this.keeperNameTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 100,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '保管员名称', field: 'name', width: 100 },
      { title: '保管员编号', field: 'userId', width: 150 },
      { title: '操作', tdTemplate: this.chooseKeeperName, width: 60 }
      ]
    };
    this.getWarehouseAreaDetail();
  }

}
