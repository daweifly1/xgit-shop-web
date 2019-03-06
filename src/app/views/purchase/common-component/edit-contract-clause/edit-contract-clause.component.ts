import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PurchaseContractServiceNs} from '../../../../core/trans/purchase-contract.service';
import {ContractClauseTemplateService} from '../../../../core/trans/purchase/contract-clause-template.service';

@Component({
  selector: 'app-edit-contract-clause',
  templateUrl: './edit-contract-clause.component.html',
  styleUrls: ['./edit-contract-clause.component.scss']
})
export class EditContractClauseComponent implements OnInit {
  @Input() templateId: string;
  @Input() originClauseList?: PurchaseContractServiceNs.ContractClauseData[] = [];
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  public contractTemplateDetail: PurchaseContractServiceNs.ContractClauseData[] = [];

  constructor(private templateService: ContractClauseTemplateService) { }

  public getContractTemplateDetail() {
    if (this.originClauseList.length > 0) {
      this.contractTemplateDetail = JSON.parse(JSON.stringify(this.originClauseList));
      return;
    }
    const paramsData = {id: this.templateId};
    this.templateService.getClauseTemplateContent(paramsData).subscribe((resData) => {
      this.contractTemplateDetail = [];
      resData.value.forEach((item, index) => {
        this.contractTemplateDetail.push({
          seq: index + 1,
          clauseTitle: item.title,
          clauseItem: item.content.join('\n')
        });
      });
    });
  }
  public submitClause() {
    const detailFormat = [];
    this.contractTemplateDetail.forEach((item) => {
      detailFormat.push({
        content: item.clauseTitle,
        seq: item.seq,
        type: PurchaseContractServiceNs.ClauseType.Title,
        clauseVOS: [
          {content: item.clauseItem, type: PurchaseContractServiceNs.ClauseType.Content}
        ]
      });
    });
    this.emitPage(detailFormat);
  }
  public backToContract() {
    if (!this.originClauseList) {
      this.emitPage();
      return;
    }
    const detailFormat = [];
    this.originClauseList.forEach((item) => {
      detailFormat.push({
        content: item.clauseTitle,
        seq: item.seq,
        type: PurchaseContractServiceNs.ClauseType.Title,
        clauseVOS: [
          {content: item.clauseItem, type: PurchaseContractServiceNs.ClauseType.Content}
        ]
      });
    });
    this.emitPage(detailFormat);
  }
  private emitPage(data?: any) {
    this.backToMainPage.emit(data);
  }
  ngOnInit() {
    this.getContractTemplateDetail();
  }

}
