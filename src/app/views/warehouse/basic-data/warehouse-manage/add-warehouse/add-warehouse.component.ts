import { Component, OnInit, ViewChild, TemplateRef, Output, Input, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder, ControlContainer, FormArray, FormControl } from '@angular/forms';
import { WarehouseServiceNs, WarehouseService } from '../../../../../core/trans/warehouse.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../../layout/layout.module';
import { Observable } from 'rxjs/Observable';
import { UfastValidatorsService } from '../../../../../core/infra/validators/validators.service';
interface WarehouseType {
  id?: number;
  typeName?: string;
}
interface KeeperNameType {
  name?: string;
  userId?: string;
}
enum MaxLenInputEnum {
  Code = 40,
  Remark = 40
}
@Component({
  selector: 'app-add-warehouse',
  templateUrl: './add-warehouse.component.html',
  styleUrls: ['./add-warehouse.component.scss']
})
export class AddWarehouseComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
  @Input() editData: any;
  newWarehouseForm: FormGroup;
  warehouseType: WarehouseType[];
  typeId: number;
  isVisiblekeeperName: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];
  filters: any;
  keeperNameFilter: KeeperNameType;
  flag: boolean;
  maxLenInputEnum = MaxLenInputEnum;
  constructor(private warehouseService: WarehouseService,
    private messageService: ShowMessageService, private formBuilder: FormBuilder,
    private ufastValidatorsService: UfastValidatorsService) {
    this.finish = new EventEmitter();
    this.warehouseType = [
      { id: 0, typeName: '普通仓库' },
      { id: 1, typeName: '协议仓库' }
    ];
    this.typeId = 0;
    this.isVisiblekeeperName = false;
    this.keeperNameDataList = [];
    this.filters = '';
    this.keeperNameFilter = {};
    this.flag = false;
  }

  public toggleManagePage() {
    this.newWarehouseForm.reset();
    this.emitFinish();
  }

  public emitFinish() {
    this.finish.emit();
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
        name: this.filters.name,
        // companyName: this.filters.companyName
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
    this.newWarehouseForm.controls['keeperName'].setValue(item);
    this.newWarehouseForm.controls['keeperId'].setValue(userId);
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
  public addWarehouse() {
    Object.keys(this.newWarehouseForm.controls).filter(
      item => typeof this.newWarehouseForm.controls[item].value === 'string').forEach((key: string) => {
        this.newWarehouseForm.controls[key].patchValue(this.newWarehouseForm.controls[key].value.trim());
      });
    this.newWarehouseForm.controls['type'].setValue(this.typeId);
    this.newWarehouseForm.controls['houseLevel'].setValue(1);
    this.newWarehouseForm.controls['pCode'].setValue(0);
    Object.keys(this.newWarehouseForm.controls).forEach((key: string) => {
      this.newWarehouseForm.controls[key].markAsDirty();
      this.newWarehouseForm.controls[key].updateValueAndValidity();
    });
    if (this.newWarehouseForm.invalid) {
      return;
    }
    if (this.editData === undefined) {
      const submit = this.warehouseService.addWarehouse(this.newWarehouseForm.value);
      this.subFunc(submit);
    } else {
      this.newWarehouseForm.addControl('id', this.formBuilder.control(this.editData.warehouseId, [Validators.required]));
      const submit = this.warehouseService.updateWarehouse(this.newWarehouseForm.value);
      this.subFunc(submit);
    }
  }
  public subFunc(submit) {
    this.messageService.showLoading();
    submit.subscribe(
      (resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showToastMessage( resData.message, 'error');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitFinish();
      }, (error: any) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }

  getWarehouseDetail = () => {
    this.flag = true;
    this.newWarehouseForm.patchValue(this.editData);
    this.newWarehouseForm.controls['code'].patchValue(this.editData.warehouseCode);
    this.newWarehouseForm.controls['code'].disable();
    this.newWarehouseForm.controls['type'].disable();
    this.typeId = this.editData.type;
  }
  getFormControl(name) {
    return this.newWarehouseForm.controls[name];
  }
  EngAndNum(control: FormControl): any {
    if (!control.value) {
      return true;
    }
    const reg = /^[\da-z]+$/i;
    return (!reg.test(control.value)) ? { engAndNum: true } : null;
  }
  ngOnInit() {

    this.newWarehouseForm = this.formBuilder.group({
      code: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Code),
      this.EngAndNum]],
      type: [null, Validators.required],
      remark: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Code)]],
      keeperName: [null, Validators.required],
      keeperId: [null, Validators.required],
      houseLevel: [null],
      pCode: [null]
    });
    // 保管员数据
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
    if (this.editData) {
      this.getWarehouseDetail();
    }
  }

}
