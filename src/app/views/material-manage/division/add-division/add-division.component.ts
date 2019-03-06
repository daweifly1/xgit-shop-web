import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FactoryMineService, FactoryMineServiceNs } from '../../../../core/trans/factoryMine.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { DictionaryService, DictionaryServiceNs } from '../../../../core/common-services/dictionary.service';
import { UserService } from '../../../../core/common-services/user.service';
import { UfastTableNs } from '../../../../layout/layout.module';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
@Component({
  selector: 'app-add-division',
  templateUrl: './add-division.component.html',
  styleUrls: ['./add-division.component.scss']
})
export class AddDivisionComponent implements OnInit {
  form: FormGroup;
  @Output() finish: EventEmitter<any>;
  @ViewChild('chooseSalesman') chooseSalesman: TemplateRef<any>;
  @ViewChild('chooseKeeperName') chooseKeeperName: TemplateRef<any>;
  @Input() detailId: string;
  /**
   * 物资大类下拉框数据
   */
  divisionNameList: any[];
  /**
   * 计划员相关
   */
  salesmanVisible: boolean;
  salesmanTableConfig: UfastTableNs.TableConfig;
  salesmanDataList: any[];
   /**
   * 保管员相关
   */
  keeperNameVisible: boolean;
  keeperNameTableConfig: UfastTableNs.TableConfig;
  keeperNameDataList: any[];



  constructor(private fb: FormBuilder, private factoryMineService: FactoryMineService,
    private messageService: ShowMessageService,
    private dictionaryService: DictionaryService,
    private userService: UserService) {
    this.finish = new EventEmitter<any>();
    this.divisionNameList = [];
    this.salesmanVisible = false;
    this.salesmanDataList = [];
    this.keeperNameVisible = false;
    this.keeperNameDataList = [];
  }
  public trackById(index: number, item: any) {
    return item.id;
  }
  public getDivisionDetail() {
    this.messageService.showLoading();
    const data = {
      parentCode: DictionaryServiceNs.TypeCode.SuppliesCategories
    };
    Observable.forkJoin (this.dictionaryService.getDataDictionarySearchList(data), this.factoryMineService.getDivisionItem(this.detailId))
      .subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel[]) => {
        this.messageService.closeLoading();
        if (resData[0].code !== 0 || resData[1].code !== 0) {
          this.messageService.showToastMessage(resData[0].code !== 0 ? resData[0].message : resData[1].message, 'error');
          return;
        }
        this.divisionNameList = resData[0].value || [];
        if (!this.divisionNameList.find(item => item.name === resData[1].value.divisionName)) {
          this.divisionNameList.unshift({name: resData[1].value.divisionName});
        }
        this.form.patchValue(resData[1].value);
      }, (error: any) => {
        this.messageService.closeLoading();
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }
  public getDivisionNameList() {
    this.messageService.showLoading();
    const data = {
      parentCode: DictionaryServiceNs.TypeCode.SuppliesCategories
    };
    this.dictionaryService.getDataDictionarySearchList(data).subscribe((resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.divisionNameList = resData.value;
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showSalesmanModel() {
    this.salesmanVisible = true;
    this.getSalesmanDataList();
  }
  public handleCancelSalesman() {
    this.salesmanVisible = false;
  }
  getSalesmanDataList = () => {
    const data = {
      pageNum: this.salesmanTableConfig.pageNum,
      pageSize: this.salesmanTableConfig.pageSize,
      filters: {
        roleName: '保管员'
      }
    };
    this.salesmanTableConfig.loading = true;
    this.userService.getUserList(data).subscribe((resData: any) => {
      this.salesmanTableConfig.loading = false;
      this.salesmanDataList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = {};
        temp = item;
        temp['_this'] = temp;
        this.salesmanDataList.push(temp);
      });
      this.salesmanTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.salesmanTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseSalesmanFun(item) {
    this.form.controls['salesmanId'].patchValue(item.userId);
    this.form.controls['salesmanName'].patchValue(item.name);
    this.handleCancelSalesman();
  }

  public showKeeperNameModel() {
    this.keeperNameVisible = true;
    this.getKeeperNameDataList();
  }
  public handleCancelKeeperName() {
    this.keeperNameVisible = false;
  }
  getKeeperNameDataList = () => {
    const data = {
      pageNum: this.keeperNameTableConfig.pageNum,
      pageSize: this.keeperNameTableConfig.pageSize,
      filters: {
        roleName: '保管员'
      }
    };
    this.keeperNameTableConfig.loading = true;
    this.userService.getUserList(data).subscribe((resData: any) => {
      this.keeperNameDataList = [];
      this.keeperNameTableConfig.loading = false;
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        let temp = {};
        temp = item;
        temp['_this'] = temp;
        this.keeperNameDataList.push(temp);
      });
      this.keeperNameTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.keeperNameTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public chooseKeeperNameFun(item) {
    this.form.controls['keeperId'].patchValue(item.userId);
    this.form.controls['keeperName'].patchValue(item.name);
    this.handleCancelKeeperName();
  }
  submitForm(): void {
    Object.keys(this.form.controls).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });
    if (!this.form.valid) {
      return;
    }
    this.messageService.showLoading('正在提交');
    this.saveData();
  }
  saveData() {
    const data = this.form.getRawValue();
    let submit = null;
    if (this.detailId) {
      data.id = this.detailId;
      submit = this.factoryMineService.updateDivisionData(data);
    } else {
      submit = this.factoryMineService.insertDivisionData(data);
    }
    this.messageService.showLoading();
    submit.subscribe(
      (resData: FactoryMineServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.back();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  back(): void {
    this.finish.emit();
  }

  ngOnInit() {
    this.form = this.fb.group({
      divisionName: [null, [Validators.required]],
      salesmanId: [null, [Validators.required]],
      salesmanName: [null, [Validators.required]],
      keeperId: [null, [Validators.required]],
      keeperName: [null, [Validators.required]]
    });
    this.salesmanTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{title: '计划员名称', field: 'name', width: 100},
      {title: '计划员编号', field: 'userId', width: 100},
        {title: '操作', tdTemplate: this.chooseSalesman, width: 60}
      ]
    };
    this.keeperNameTableConfig = {
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{title: '保管员名称', field: 'name', width: 100},
      {title: '保管员编号', field: 'userId', width: 100},
        {title: '操作', tdTemplate: this.chooseKeeperName, width: 60}
      ]
    };
    if (this.detailId) {
      this.getDivisionDetail();
    } else {
      this.getDivisionNameList();
    }

  }

}
