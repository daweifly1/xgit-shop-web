import {Component, Input, OnInit} from '@angular/core';
export namespace UfastFormDetailNs {
  export interface DetailDataConfig {
    name: string;
    field: string;
    pipe?: string;
    isFullSpan?: boolean;
  }
}

export interface SpanConfig {
  rowSpan: number;
  labelSpan: number;
  valueSpan: number;
}

@Component({
  selector: 'app-ufast-form-detail',
  templateUrl: './ufast-form-detail.component.html',
  styleUrls: ['./ufast-form-detail.component.scss']
})
export class UfastFormDetailComponent implements OnInit {
  @Input()detailDataConfig: UfastFormDetailNs.DetailDataConfig[];
  @Input()detailData: any;
  public fullSpan: SpanConfig = {rowSpan: 24, labelSpan: 3, valueSpan: 21};
  public spanConfig: SpanConfig = {rowSpan: 8, labelSpan: 8, valueSpan: 16};
  public isNeedFullSpan = false;

  constructor() { }

  public trackByItem(index: number, item: any) {
    return item;
  }

  ngOnInit() {
    this.isNeedFullSpan = this.detailDataConfig.some((item) => {
      return item.isFullSpan;
    });
    if (!this.isNeedFullSpan) {
      return;
    }
    this.spanConfig = {rowSpan: 6, labelSpan: 9, valueSpan: 15};
  }

}
