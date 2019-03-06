import {Component, EventEmitter, Input, OnInit, Output, ViewChild, TemplateRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {MaterialDivisionManagementVO} from '../../../../core/vo/material/MaterialDivisionManagementVO';
import {MaterialDivisionManagementService} from '../../../../core/trans/material/MaterialDivisionManagementService';
import { UfastTableNs } from '../../../../layout/layout.module';
import { UserService } from '../../../../core/common-services/user.service';
enum InputMaxLength {
  Default = 50
}
@Component({
  selector: 'app-division-management-add',
  templateUrl: './division-management-add.html',
  styleUrls: ['./division-management-add.scss']
})
export class DivisionManagementAddComponent implements OnInit {
  InputMaxLen = InputMaxLength;
  form: FormGroup;
  @Output() backToListPage: EventEmitter<any>;
  @Input() dataItem: MaterialDivisionManagementVO;
  @ViewChild('chooseSalesman') chooseSalesman: TemplateRef<any>;
  /**
   * 计划员相关
   */
  salesmanVisible: boolean;
  salesmanTableConfig: UfastTableNs.TableConfig;
  salesmanDataList: any[];
  constructor(private fb: FormBuilder, private divisionManagementService: MaterialDivisionManagementService,
              private messageService: ShowMessageService,
              private userService: UserService) {
    this.backToListPage = new EventEmitter<any>();
    this.dataItem = null;
    this.salesmanVisible = false;
    this.salesmanDataList = [];
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

  ngOnInit() {
    this.form = this.fb.group({
      divisionName: [null, [Validators.required, Validators.maxLength(this.InputMaxLen.Default)]],
      salesmanId: [null, [Validators.required]],
      salesmanName: [null, Validators.required]
    });
    this.salesmanTableConfig = {
      pageSize: 10,
      yScroll: 100,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [{title: '业务员名称', field: 'name', width: 100},
      {title: '业务员编号', field: 'userId', width: 100},
        {title: '操作', tdTemplate: this.chooseSalesman, width: 60}
      ]
    };

    if (this.dataItem) {
      this.setFormValue(this.dataItem);
    }
  }

  /**
   * 填充表单数据
   * @param {MaterialDivisionManagementVO} dataItem
   */
  setFormValue(dataItem: MaterialDivisionManagementVO) {
    this.form.patchValue(
      {
        divisionName: dataItem.divisionName + '',
        salesmanId: dataItem.salesmanId,
        salesmanName: dataItem.salesmanName
      }
    );
  }

  /**
   * 表单提交、验证
   */
  submitForm(): void {
    Object.keys(this.form.value).forEach((item) => {
      this.form.controls[item].markAsDirty();
      this.form.controls[item].updateValueAndValidity();
    });
    if (!this.form.valid) {
      return;
    }
    this.saveData();
  }

  /**
   * 数据保存
   */
  saveData() {
    // if (this.form.value.salesmanId) {
    //   this.form.value.salesmanId = Number(this.form.value.salesmanId);
    // }
    const param = this.form.value;

    let service: any = this.divisionManagementService.insert(param);
    if (!!this.dataItem) {
      const updataParam = {...param, id: this.dataItem.id};
      service = this.divisionManagementService.update(updataParam);
    }
    this.messageService.showLoading();
    service.subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage( resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.back();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  /**
   * 触发返回列表事件
   */
  back(): void {
    this.backToListPage.emit();
  }
}
