import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WorkBoardService, WorkBoardServiceNs} from '../../../core/trans/work-board.service';
export namespace PurchaseAuditProcessNs {
  export interface AuditProcessData {
    result: WorkBoardServiceNs.AuditDirection;      // 审批结果
    auditPerson: string;           // 审批人
    auditDept: string;              // 审批人部门
    auditDate: number;            // 审批日期
    auditRemark: string;          // 审批意见
    isApplyNode: boolean;         // 是否为申请节点
  }
}

@Component({
  selector: 'app-purchase-audit-process',
  templateUrl: './purchase-audit-process.component.html',
  styleUrls: ['./purchase-audit-process.component.scss']
})
export class PurchaseAuditProcessComponent implements OnInit {
  @Input()
  set show(value: boolean) {
    this._processShow = value;
    if (value && this.processId) {
      this.getAuditProcess();
    }
  }
  get show(): boolean {
    return this._processShow;
  }
  @Output() showChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() processId: string;
  public auditProcessList: PurchaseAuditProcessNs.AuditProcessData[] = [];
  public _processShow = false;
  public title = '审批记录';
  resultColor: any;
  constructor(private wordBoardService: WorkBoardService) {
    this.resultColor = {};
    this.resultColor[WorkBoardServiceNs.AuditDirection.Agree] = 'green';
    this.resultColor[WorkBoardServiceNs.AuditDirection.Reject] = 'red';
    this.resultColor[WorkBoardServiceNs.AuditDirection.WaitAudit] = 'blue';
  }

  public getAuditProcess() {
    this.wordBoardService.getApproveHistory(this.processId).subscribe((resData: any) => {
      this.auditProcessList = [];
      resData.value.forEach((item) => {
        this.auditProcessList.push({
          auditDept: item.nodeName,
          auditPerson: item.userName,
          auditDate: item.commentsRecord ? item.commentsRecord.time : null,
          auditRemark: item.commentsRecord ? item.commentsRecord.comments : '',
          result: item.commentsRecord ?
            (item.commentsRecord.params ? item.commentsRecord.params.direction : null) : WorkBoardServiceNs.AuditDirection.WaitAudit,
          isApplyNode: item.id === null
        });
      });
    });
  }
  public closeOnMask() {
    this.onClose();
  }
  public clickOnContent(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }
  public onClose() {
    this._processShow = false;
    this.showChange.emit(this._processShow);
    // this.closeProcess.emit();
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  ngOnInit() {
  }

}
