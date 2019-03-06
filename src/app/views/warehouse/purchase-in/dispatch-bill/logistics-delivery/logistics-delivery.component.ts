import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../../layout/layout.module';
import { DispatchBillService, DispatchBillServiceNs } from '../../../../../core/trans/dispatch-bill.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { UploadFile } from 'ng-zorro-antd';
import {UfastValidatorsService} from '../../../../../core/infra/validators/validators.service';
import {MaxLenInputEnum} from '../edit-dispatch-bill/edit-dispatch-bill.component';
enum ContainerNumberMaxEnum {
  max = 9999999999
}
@Component({
  selector: 'app-logistics-delivery',
  templateUrl: './logistics-delivery.component.html',
  styleUrls: ['./logistics-delivery.component.scss']
})
export class LogisticsDeliveryComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  @Output() finish: EventEmitter<any>;
  @Input() invoiceNo: string;
  materialList: DispatchBillServiceNs.AnnualAgreementMaterialList[]; // 接口获取的物料信息
  informationForm: FormGroup; // 接口获取的发货信息，物流信息，在服务里定义类型
  fileList: any;   // 物流附件
  fileServiceUrl: string;
  previewImage: string;
  previewVisible: boolean;

  contractTypeList: DispatchBillServiceNs.ContractType[];
  deliveryTypeList: DispatchBillServiceNs.DeliveryTypeItem[];
  MaxLenInput = MaxLenInputEnum;
  uploadUrl: string;
  transportModeList: any[];
  containerNumberMax = ContainerNumberMaxEnum;
  constructor(private dispatchBillService: DispatchBillService,
    private messageService: ShowMessageService, private ufastValidatorsService: UfastValidatorsService,
    private formBuilder: FormBuilder) {
    this.uploadUrl = environment.baseUrl.bs + '/uploading/file';
    this.contractTypeList = [];
    this.deliveryTypeList = [];

    this.finish = new EventEmitter<any>();
    this.materialList = [];
    this.fileList = [];
    this.fileServiceUrl = environment.otherData.fileServiceUrl; // 文件服务器url
    this.previewImage = '';
    this.previewVisible = false;
    this.transportModeList = [];

  }
  public getTransportModeList() {
    this.dispatchBillService.getTransportModeList().subscribe((resData: any) => {
      this.transportModeList = resData;
    });
  }
  public emitFinish() {
    this.finish.emit();
  }
  uploadFileChange($event) {
    if ($event.type === 'progress' || $event.type === 'start') {
      return;
    }
    if ($event.file.status === 'removed') {
      this.fileList.length--;
      return;
    }
    if (this.fileList[0].response.code !== 0) {
      this.messageService.showAlertMessage('', '附件上传失败', 'error');
      this.fileList = [];
      return;
    }
    if (!/\.(jpg|png|jepg|gif|pdf|bmp)$/.test(this.fileList[0].response.value)) {
      this.messageService.showAlertMessage('', '图片格式错误', 'error');
      this.fileList = [];
      return;
    }
    this.informationForm.controls['logisticsAttach'].patchValue(this.fileList[0].response.value);

  }
  // 物流附件查看关闭
  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }
  public dispatch() {
    Object.keys(this.informationForm.controls).forEach((keys: string) => {
      this.informationForm.controls[keys].markAsDirty();
      this.informationForm.controls[keys].updateValueAndValidity();
    });
    if (this.informationForm.invalid) {
      return;
    }
    const data = this.informationForm.value;
    this.messageService.showLoading();
    this.dispatchBillService.batchDelivery(data, [this.invoiceNo]).subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.finish.emit();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public getDispatchBillDetail() {
    this.tableConfig.loading = true;
    this.dispatchBillService.getDispatchBillDetail(this.invoiceNo).subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      const temp = {};
      Object.keys(this.informationForm.controls).forEach((key: string) => {
        temp[key] = resData.value.invoiceInfo[key];
      });
      if (temp['deliveryDate']) {
        temp['deliveryDate'] = new Date(temp['deliveryDate']);
      }
      this.informationForm.patchValue(temp);
      this.materialList = resData.value.detailList;
      const tmpFilelist = [];
      if (resData.value.invoiceInfo.logisticsAttach !== null) {
        tmpFilelist.push({
          uid: 1,
          name: resData.value.invoiceInfo.logisticsAttach,
          url: this.fileServiceUrl + resData.value.invoiceInfo.logisticsAttach,
          thumbUrl: this.fileServiceUrl + resData.value.invoiceInfo.logisticsAttach,
        });

      }
      this.fileList = tmpFilelist;
      this.previewImage = this.fileServiceUrl + resData.value.invoiceInfo.logisticsAttach;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private getContractTypeList() {
    this.dispatchBillService.getContractType().subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.contractTypeList = resData.value;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private getDeliveryTypeList() {
    this.dispatchBillService.getDeliveryTypeList().subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.deliveryTypeList = resData.value;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  ngOnInit() {
    this.getContractTypeList();
    this.getDeliveryTypeList();
    this.getTransportModeList();
    this.tableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: false,
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        { title: '行号', field: 'lineNum', width: 60 },
        { title: '物料编码', field: 'materialsNo', width: 100 },
        { title: '物料名称', field: 'materialsName', width: 150 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '是否条码管理', field: 'ifCodeManage', width: 80, pipe: 'barcodeManage' },
        { title: '本次发货数量', field: 'deliveryCount', width: 100 }
      ]
    };
    this.informationForm = this.formBuilder.group({
      invoiceNo: [{ value: null, disabled: true }, [Validators.required]],
      supplierName: [{ value: null, disabled: true }, [Validators.required]],
      consignee: [{ value: null, disabled: true }, [Validators.required]],
      deliveryType: [{ value: null, disabled: true }, [Validators.required]],
      goodsReceivor: [{ value: null, disabled: true }, [Validators.required]],
      deliveryPhone: [{ value: null, disabled: true }, [Validators.required]],
      purchaseNo: [{ value: null, disabled: true }, [Validators.required]],
      contractType: [{ value: null, disabled: true }, [Validators.required]],
      deliveryAddress: [{ value: null, disabled: true }, [Validators.required]],
      logisticsNo: ['', [Validators.required, Validators.maxLength(this.MaxLenInput.LogisticsNo),
        this.ufastValidatorsService.noChineseValidator()]],
      logisticsContact: ['', [Validators.required, Validators.maxLength(this.MaxLenInput.Default)]],
      logisticsAttach: [''],
      logisticsContactIdCard: [null, [Validators.maxLength(this.MaxLenInput.IdCard), this.ufastValidatorsService.idNoValidator()]],
      logisticsCompany: ['', [Validators.required, Validators.maxLength(this.MaxLenInput.Default)]],
      logisticsPhone: ['', [Validators.required,  this.ufastValidatorsService.mobileOrTeleValidator()]],
      deliveryDate: ['', [Validators.required]],
      licensePlate: [null, [Validators.required
        , Validators.maxLength(this.MaxLenInput.LicensePlate)]],
        transportMode: [null, [Validators.required
          , Validators.maxLength(this.MaxLenInput.Default)]],
      containerNumber: [null, [Validators.required]]
    });
    this.getDispatchBillDetail();
  }

}
