import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { WarehouseServiceNs, WarehouseService } from '../../../../../core/trans/warehouse.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { UfastTableNs, RightSideTableBoxNs } from '../../../../../layout/layout.module';
/**
 * 新增储位
 * **/
interface KeeperNameType {
  name?: string;
  userId?: string;
}
enum MaxLenInputEnum {
  Default = 40
}
@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent implements OnInit {
  maxLenInputEnum = MaxLenInputEnum;
  @Input() areaCode: string;     // 库区编号
  @Input() warehouseCode: string;  // 仓库code
  @Input() areaId: string;       // 库区id
  @Output() finish: EventEmitter<any>;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
  @Input() defaultKeeper: any;   // 默认保管员
  newLocationForm: any;
  isVisiblekeeperName: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];
  filters: any;
  keeperNameFilter: KeeperNameType;
  placeholder: string;
  constructor(private warehouseService: WarehouseService, private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.finish = new EventEmitter();
    this.isVisiblekeeperName = false;
    this.keeperNameDataList = [];
    this.filters = '';
    this.keeperNameFilter = {};
    this.placeholder = '请输入整数';
  }

  public emitFinish() {
    this.finish.emit();
  }

  public toggleManagePage() {
    this.newLocationForm.reset();
    this.emitFinish();
  }

  public submitLocation() {
    Object.keys(this.newLocationForm.controls).filter(
      item => typeof this.newLocationForm.controls[item].value === 'string').forEach((key: string) => {
      this.newLocationForm.controls[key].patchValue(this.newLocationForm.controls[key].value.trim());
    });
    Object.keys(this.newLocationForm.controls).forEach((key: string) => {
      this.newLocationForm.controls[key].markAsDirty();
      this.newLocationForm.controls[key].updateValueAndValidity();
    });
    if (this.newLocationForm.invalid) {
      return;
    }
    this.messageService.showLoading();
    this.warehouseService.addLocation(this.newLocationForm.value).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  showVisiblekeeperNameModal(pageNum?: number): void {
    this.isVisiblekeeperName = true;
    this.getKeeperNameModalData(pageNum);

  }
  getKeeperNameModalData = (pageNum?: number, pageSize?: number) => {
    const filter = {
      pageNum: pageNum || this.keeperNameTableConfig.pageNum,
      pageSize: pageSize || this.keeperNameTableConfig.pageSize,
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
    this.newLocationForm.controls['keeperName'].setValue(item);
    this.newLocationForm.controls['keeperId'].setValue(userId);
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
  getFormControl(name) {
    return this.newLocationForm.controls[name];
  }
  EngAndNum(control: FormControl): any {
    if (!control.value) {
      return true;
    }
    const reg = /^[\da-z]+$/i;
    return (!reg.test(control.value)) ? { engAndNum: true } : null;
  }
  ngOnInit() {
    this.newLocationForm = this.formBuilder.group({
      areaNo: [this.areaCode, Validators.required],
      shelfNo: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default), this.EngAndNum]],
      shelfType: [null, [Validators.required, Validators.maxLength(this.maxLenInputEnum.Default)]],
      beginRowNo: [null, Validators.required],
      endRowNo: [null, Validators.required],
      floorNum: [null, Validators.required],
      columnNum: [null, Validators.required],
      locationNum: [null, Validators.required],
      warehouseAreaId: [this.areaId],
      warehouseCode: [this.warehouseCode],
      keeperName: [this.defaultKeeper.keeperName, Validators.required],
      keeperId: [this.defaultKeeper.keeperId, Validators.required],
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
  }

}
