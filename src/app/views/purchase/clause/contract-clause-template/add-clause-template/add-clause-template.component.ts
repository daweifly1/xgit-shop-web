
import { Component, OnInit, Output, Input, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import {
  ContractClauseTemplateService, ContractClauseTemplateServiceNs
} from '../../../../../core/trans/purchase/contract-clause-template.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { ContractClauseListService } from '../../../../../core/trans/purchase/contract-clause-list.service';
import { UfastValidatorsService } from '../../../../../core/infra/validators/validators.service';
import { Observable } from 'rxjs/Observable';
import { valueFunctionProp } from 'ng-zorro-antd/src/core/util/convert';
enum MaxInputEnum {
  TemplateNo = 20,
  TemplateName = 15,
  Default = 50
}
@Component({
  selector: 'app-add-clause-template',
  templateUrl: './add-clause-template.component.html',
  styleUrls: ['./add-clause-template.component.scss']
})
export class AddClauseTemplateComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('contentTpl') contentTpl: TemplateRef<any>;
  @ViewChild('rightContentTpl') rightContentTpl: TemplateRef<any>;
  @Input() detailId: string;
  InputMaxLen = MaxInputEnum;
  clauseTemplateForm: FormGroup;
  clauseLeftTableConfig: UfastTableNs.TableConfig;
  clauseLeftDataList: ContractClauseTemplateServiceNs.SelectClauseList[];
  clauseRightTableConfig: UfastTableNs.TableConfig;
  clauseRightDataList: any[];
  clauseLeftItemId: string;
  clauseIdList: Object;
  constructor(
    private clauseTemplateService: ContractClauseTemplateService,
    private messageService: ShowMessageService,
    private formBuilder: FormBuilder,
    private clauseListService: ContractClauseListService,
    private ufastValidatorsService: UfastValidatorsService
  ) {
    this.finish = new EventEmitter<any>();
    this.clauseLeftDataList = [];
    this.clauseRightDataList = [];
    this.clauseLeftItemId = '';
    this.clauseIdList = {};
  }
  public isAllChooseLeft(isAllChoose: boolean): void {
    if (!isAllChoose) {
      this.clauseRightTableConfig.checkAll = false;
      this.clauseLeftDataList.forEach((item) => {

        if (this.clauseLeftItemId === item.id) {
          this.clauseRightDataList.forEach((right) => {
            right[this.clauseRightTableConfig.checkRowField] = false;
          });
        }
        item[this.clauseLeftTableConfig.checkRowField] = false;
        this.clauseIdList[item.id] = [];
      });
    } else {
      this.clauseLeftDataList.forEach((item) => {
        if (!this.clauseIdList[item.id]) {
          this.clauseIdList[item.id] = [];
        }
        item[this.clauseLeftTableConfig.checkRowField] = true;
      });
    }
  }
  public changeSelectLeft(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.isAllChooseLeft(this.clauseLeftTableConfig.checkAll);
      return;
    }
    this.clauseLeftTableConfig.checkAll = this.clauseLeftDataList.every((item, index, array) => {
      return item._checked === true;
    });
    if (value.type === UfastTableNs.SelectedChangeType.Checked) {

      if (!this.clauseIdList[this.clauseLeftDataList[value.index].id]) {
        this.clauseIdList[this.clauseLeftDataList[value.index].id] = [];
        return;
      }
    } else {
      if (this.clauseLeftItemId !== this.clauseLeftDataList[value.index].id) {
        return;
      }
      this.clauseRightTableConfig.checkAll = false;
      this.clauseRightDataList.forEach((right) => {
        right[this.clauseRightTableConfig.checkRowField] = false;
      });
      delete this.clauseIdList[this.clauseLeftDataList[value.index].id];
    }
  }

  public isAllChooseRight(isAllChoose: boolean): void {
    if (isAllChoose) {
      this.clauseLeftDataList.forEach((item) => {
        if (item.id === this.clauseLeftItemId) {
          if (!item[this.clauseLeftTableConfig.checkRowField]) {
            item[this.clauseLeftTableConfig.checkRowField] = true;
            this.clauseIdList[this.clauseLeftItemId] = [];
          }
        }
      });
      this.clauseRightDataList.forEach((item) => {
        item[this.clauseRightTableConfig.checkRowField] = true;
        if (this.clauseIdList[this.clauseLeftItemId].indexOf(item.id) !== -1) {
          return;
        } else {
          this.clauseIdList[this.clauseLeftItemId].push(item.id);
        }
      });
    } else {
      this.clauseRightDataList.forEach((item) => {
        item[this.clauseRightTableConfig.checkRowField] = false;
      });
      this.clauseIdList[this.clauseLeftItemId] = [];
    }
  }
  public changeSelectRight(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.isAllChooseRight(this.clauseRightTableConfig.checkAll);
      return;
    }
    this.clauseRightTableConfig.checkAll = this.clauseRightDataList.every((item, index, array) => {
      return item._checked === true;
    });
    if (value.type === UfastTableNs.SelectedChangeType.Checked) {
      this.clauseLeftDataList.forEach((item) => {
        if (item.id === this.clauseLeftItemId) {
          if (item[this.clauseLeftTableConfig.checkRowField]) {
            return;
          } else {
            item[this.clauseLeftTableConfig.checkRowField] = true;
            this.clauseIdList[this.clauseLeftItemId] = [];
          }
        }
      });
      if (this.clauseIdList[this.clauseLeftItemId].indexOf(this.clauseRightDataList[value.index].id) !== -1) {
        return;
      } else {
        this.clauseIdList[this.clauseLeftItemId].push(this.clauseRightDataList[value.index].id);
      }
    } else {
      const index = this.clauseIdList[this.clauseLeftItemId].indexOf(this.clauseRightDataList[value.index].id);
      this.clauseIdList[this.clauseLeftItemId].splice(index, 1);
    }
  }
  getClauseLeftDataList = () => {
    const filter = {
      pageNum: this.clauseLeftTableConfig.pageNum,
      pageSize: this.clauseLeftTableConfig.pageSize,
      filters: {
        clauseType: 1
      }
    };
    this.clauseLeftDataList = [];
    this.clauseLeftTableConfig.checkAll = false;
    this.clauseListService.getClauseList(filter).subscribe((resData: any) => {
      resData.value.list.forEach((item) => {
        const temp = item;
        temp['highLight'] = false;
        this.clauseLeftDataList.push(temp);
      });
      this.view(this.clauseLeftDataList[0].id);
      this.clauseLeftTableConfig.total = resData.value.total;
      this.clauseLeftTableConfig.checkAll = true;
      this.clauseLeftDataList.forEach((item) => {
        if (this.clauseIdList[item.id]) {
          item[this.clauseLeftTableConfig.checkRowField] = true;
        } else {
          item[this.clauseLeftTableConfig.checkRowField] = false;
          this.clauseLeftTableConfig.checkAll = false;
        }
      });
    });
  }
  getClauseRightDataList = () => {
    if (!this.clauseLeftItemId) {
      this.messageService.showToastMessage('请查看条内容', 'warning');
      return;
    }
    // 根据clauseItemId查右表格数据
    const filter = {
      pageNum: this.clauseRightTableConfig.pageNum,
      pageSize: this.clauseRightTableConfig.pageSize,
      filters: {
        clauseType: 2,
        parentId: this.clauseLeftItemId
      }
    };
    this.clauseRightDataList = [];
    this.clauseRightTableConfig.checkAll = false;
    this.clauseListService.getClauseList(filter).subscribe((resData: any) => {
      this.clauseRightDataList = resData.value.list;
      this.clauseRightTableConfig.total = resData.value.total;
      if (this.clauseIdList[this.clauseLeftItemId]) {
        this.clauseIdList[this.clauseLeftItemId].forEach((id) => {
          let selectIndex = -1;
          this.clauseRightDataList.filter((item, index) => {
            if (item.id === id) {
              selectIndex = index;
              return;
            }
          });
          if (selectIndex !== -1) {
            this.clauseRightDataList[selectIndex][this.clauseRightTableConfig.checkRowField] = true;
          }
        });
      }
      this.clauseRightTableConfig.checkAll = true;
      this.clauseRightDataList.forEach((item) => {
        if (!item[this.clauseRightTableConfig.checkRowField]) {
          this.clauseRightTableConfig.checkAll = false;
          return;
        }
      });
    });
  }
  public view(id) {
    console.log('lalalalla');
    this.clauseLeftDataList.forEach((item) => {
      item.highLight = false;
    });
    this.clauseLeftDataList.forEach((item) => {
      if (item.id === id) {
        item.highLight = true;
      }
    });
    this.clauseLeftItemId = id;
    if (this.clauseLeftItemId) {
      this.getClauseRightDataList();
    }

  }
  public saveClauseTemplate() {
    Object.keys(this.clauseTemplateForm.controls).forEach(key => {
      this.clauseTemplateForm.controls[key].markAsDirty();
      this.clauseTemplateForm.controls[key].updateValueAndValidity();
    });
    if (this.clauseTemplateForm.invalid) {
      return;
    }
    if (!Object.keys(this.clauseIdList).length) {
      this.messageService.showToastMessage('至少选择一条条内容', 'warning');
      return;
    }
    const submitData = this.clauseTemplateForm.getRawValue();
    submitData.purchaseTemplateDetailVOS = [];
    Object.keys(this.clauseIdList).forEach((key) => {
      submitData.purchaseTemplateDetailVOS.push({ clauseId: key });
      this.clauseIdList[key].forEach((id) => {
        submitData.purchaseTemplateDetailVOS.push({ clauseId: id });
      });
    });
    if (this.detailId) {
      submitData.id = this.detailId;
      this.clauseTemplateService.updateClauseTemplate(submitData).subscribe(
        (resData: ContractClauseTemplateServiceNs.UfastHttpResT<any>) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.onCancel();
        });
    } else {
      this.clauseTemplateService.addClauseTemplate(submitData).subscribe((resData: ContractClauseTemplateServiceNs.UfastHttpResT<any>) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.onCancel();
      });
    }
  }
  public onCancel() {
    this.finish.emit();
  }
  public getClauseTemplateDetail() {
    this.clauseTemplateService.getClauseTemplateContentDetail(this.detailId).subscribe(
      (resData: ContractClauseTemplateServiceNs.UfastHttpResT<any>) => {
        this.clauseTemplateForm.patchValue(resData.value);
        resData.value.purchaseClauseVOS.forEach((item) => {
          this.clauseIdList[item.id] = [];
          item.details.forEach((temp) => {
            if (this.clauseIdList[item.id].indexOf(temp.id) !== -1) {
              return;
            } else {
              this.clauseIdList[item.id].push(temp.id);
            }
          });
        });
        this.getClauseLeftDataList();
      });
  }

  ngOnInit() {
    this.clauseTemplateForm = this.formBuilder.group({
      templateNo: [null, [Validators.required, this.ufastValidatorsService.onlyNumber()]],
      templateName: [null, Validators.required],
      templateType: [null, Validators.required],
    });
    this.clauseLeftTableConfig = {
      pageNum: 1,
      pageSize: 10,
      showCheckbox: true,
      checkAll: false,
      checkRowField: '_checked',
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [
        // { title: '操作', tdTemplate: this.operationTpl, width: 100, fixed: true },
        { title: '序号', field: 'seq', width: 80 },
        { title: '条内容', tdTemplate: this.contentTpl, width: 300 }
      ]
    };
    this.clauseRightTableConfig = {
      pageNum: 1,
      pageSize: 10,
      showCheckbox: true,
      checkAll: false,
      checkRowField: '_checked',
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [
        { title: '序号', field: 'seq', width: 80 },
        { title: '款内容', tdTemplate: this.rightContentTpl, width: 300 }
      ]
    };
    if (this.detailId) {
      this.getClauseTemplateDetail();
    } else {
      this.getClauseLeftDataList();
    }
  }

}
