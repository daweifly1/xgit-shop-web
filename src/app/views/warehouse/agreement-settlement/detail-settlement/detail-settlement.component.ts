import { Component, OnInit, TemplateRef, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { AgreementSettlementService, AgreementSettlementServiceNs } from './../../../../core/trans/warehouse/agreement-settlement.service';
import { ShowMessageService } from './../../../../widget/show-message/show-message';
@Component({
  selector: 'app-detail-settlement',
  templateUrl: './detail-settlement.component.html',
  styleUrls: ['./detail-settlement.component.scss']
})
export class DetailSettlementComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() detailId: string;
  headerFieldList: { name: string; field: string; pipe?: string }[];
  headerInfo: any;
  materialTableConfig: UfastTableNs.TableConfig;
  materialList: any[];
  constructor(private agreementSettlementService: AgreementSettlementService,
    private messageService: ShowMessageService) {
    this.finish = new EventEmitter<any>();
    this.headerFieldList = [
      { name: '单据编号', field: 'code' },
      { name: '协议号', field: 'agreementCode' },
      { name: '单据日期', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm' },
      { name: '领料部门', field: 'applyDepartment' },
      { name: '工段', field: 'section' },
      { name: '录入人员', field: 'recordUserName' },
      { name: '代储供应商', field: 'vendorName' },
    ];
    this.headerInfo = {};
    this.materialList = [];
  }
  public getAgreementSettlementDetail() {
    this.agreementSettlementService.getAgreementSettlementDetail(this.detailId).subscribe(
      (resData: AgreementSettlementServiceNs.UfastHttpResT<any>) => {
        this.headerInfo = resData.value;
        this.materialList = resData.value.detailVOList;
      });
  }
  public emitFinish() {
    this.finish.emit();
  }

  ngOnInit() {
    this.materialTableConfig = {
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        { title: '出库单号', field: 'pickingNo', width: 160 },
        { title: '出库时间', field: 'pickingDate', width: 130, pipe: 'date: yyyy-MM-dd HH:mm' },
        { title: '物料编码', field: 'materialCode', width: 120 },
        { title: '物料描述', field: 'materialDesc', width: 140 },
        { title: '单位', field: 'unit', width: 60 },
        { title: '出库数量', field: 'outAmount', width: 100 },
        { title: '已结算数量', field: 'totleSettlementAmount', width: 120 },
        // { title: '本次结算数量', field: 'settlementAmount', width: 110 },
        { title: '结算物料编码', field: 'settlementMaterialCode', width: 120 },
        { title: '结算物料描述', field: 'settlementMaterialDesc', width: 140 },
        { title: '结算单位', field: 'settlementUnit', width: 80 }
      ]
    };
    this.getAgreementSettlementDetail();
  }

}
