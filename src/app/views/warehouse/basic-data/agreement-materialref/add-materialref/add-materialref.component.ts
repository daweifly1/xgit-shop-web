import { FactoryMineService } from './../../../../../core/trans/factoryMine.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Output, Input, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { ShowMessageService } from './../../../../../widget/show-message/show-message';
import {
  AgreementMaterialrefService,
  AgreementMaterialrefServiceNs
} from './../../../../../core/trans/warehouse/agreement-materialref.service';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { unit } from '../../../../../../environments/map-data';


@Component({
  selector: 'app-add-materialref',
  templateUrl: './add-materialref.component.html',
  styleUrls: ['./add-materialref.component.scss']
})
export class AddMaterialrefComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;
  @ViewChild('chooseMaterial') chooseMaterial: TemplateRef<any>;
  materialForm: FormGroup;
  isVisibleMaterial: boolean;
  materialTableConfig: UfastTableNs.TableConfig;
  materialList: any[];
  materialFilter: any;
  originalOrSettlement: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private agreementMaterialrefService: AgreementMaterialrefService,
    private messageService: ShowMessageService,
    private factoryMineService: FactoryMineService) {
    this.finish = new EventEmitter<any>();
    this.isVisibleMaterial = false;
    this.materialList = [];
    this.materialFilter = {};
    this.originalOrSettlement = true;
  }
  showMaterialModal(): void {
    this.originalOrSettlement = true;
    this.isVisibleMaterial = true;
    this.getMaterialList();
  }
  showSettltmentMaterialModal(): void {
    this.originalOrSettlement = false;
    this.isVisibleMaterial = true;
    this.getMaterialList();
  }
  handleCancel(): void {
    this.isVisibleMaterial = false;
    this.materialFilter = {};
  }
  public chooseMaterialFun(code: string, desc: string, materialUnit: string) {
    if (this.originalOrSettlement) {
      this.materialForm.patchValue({
        materialCode: code,
        materialDesc: desc,
        unit: materialUnit
      });
    } else {
      this.materialForm.patchValue({
        settlementMaterialCode: code,
        settlementMaterialDesc: desc,
        settlementUnit: materialUnit
      });
    }
    this.handleCancel();

  }
  getMaterialList = () => {
    Object.keys(this.materialFilter).filter(item => typeof this.materialFilter[item] === 'string').forEach((key: string) => {
      this.materialFilter[key] = this.materialFilter[key].trim();
    });
    const filter = {
      pageNum: this.materialTableConfig.pageNum,
      pageSize: this.materialTableConfig.pageSize,
      filters: this.materialFilter
    };
    this.materialTableConfig.loading = true;
    this.materialList = [];
    this.factoryMineService.getMaterialList(filter).subscribe((resData: AgreementMaterialrefServiceNs.UfastHttpResT<any>) => {
      this.materialTableConfig.loading = false;
      if (resData.code) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.materialList = resData.value.list.map((item) => {
        const temp = <any>{};
        temp.materialCode = item['materialVO'].code;
        temp.materialDesc = item['materialVO'].materialDesc;
        temp.unit = item['materialVO'].unit;
        return temp;
      });
      this.materialTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.materialTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public getAgreementMaterialrefDetail() {
    this.agreementMaterialrefService.getAgreementMaterialrefDetail(this.detailId).subscribe(
      (resData: AgreementMaterialrefServiceNs.UfastHttpResT<any>) => {
        this.materialForm.patchValue(resData.value);
      });
  }
  public submitAgreementMaterialref() {
    Object.keys(this.materialForm.controls).filter(
      item => typeof this.materialForm.controls[item].value === 'string').forEach((key: string) => {
        this.materialForm.controls[key].patchValue(this.materialForm.controls[key].value.trim());
      });
    Object.keys(this.materialForm.controls).forEach((keys: string) => {
      this.materialForm.controls[keys].markAsDirty();
      this.materialForm.controls[keys].updateValueAndValidity();
    });
    if (this.materialForm.invalid) {
      return;
    }
    const submitData = this.materialForm.getRawValue();
    if (this.detailId) {
      submitData.id = this.detailId;
      this.submitFun(this.agreementMaterialrefService.addAgreementMaterialref(submitData));
    } else {
      this.submitFun(this.agreementMaterialrefService.addAgreementMaterialref(submitData));
    }
  }
  public submitFun(submit) {
    submit.subscribe(
      (resData: AgreementMaterialrefServiceNs.UfastHttpResT<any>) => {
        this.emitFinish();
        this.messageService.showToastMessage('操作成功', 'success');
      });
  }
  public emitFinish() {
    this.finish.emit();
  }

  ngOnInit() {
    this.materialForm = this.formBuilder.group({
      materialCode: [null, Validators.required],
      materialDesc: [{ value: null, disabled: true }, [Validators.required]],
      unit: [{ value: null, disabled: true }, [Validators.required]],
      settlementMaterialCode: [null, Validators.required],
      settlementMaterialDesc: [{ value: null, disabled: true }, [Validators.required]],
      settlementUnit: [{ value: null, disabled: true }, [Validators.required]]
    });
    this.materialTableConfig = {
      pageNum: 1,
      pageSize: 10,
      yScroll: 300,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      headers: [{ title: '物料编码', field: 'materialCode', width: 100 },
      { title: '物料描述', field: 'materialDesc', width: 150 },
      { title: '操作', tdTemplate: this.chooseMaterial, width: 60 }
      ]
    };
    if (this.detailId) {
      this.getAgreementMaterialrefDetail();
    }
  }

}
