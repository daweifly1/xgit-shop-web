import { Component, OnInit, Input, ViewChild, AfterViewChecked, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
/**
 * 缩略文本内容组件
 * 必须在app-clip-text上设置css属性width,height，line-height属性，
 * height/line-height=最大显示的行数。
 * 可以使用max-height代替height，已达到自适应高度的目的
 */
@Component({
  selector: 'app-clip-text',
  templateUrl: './clip-text.component.html',
  styleUrls: ['./clip-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClipTextComponent implements OnInit, AfterViewChecked {
  /**
   * 内容
   */
  @Input()
  set content(value: string) {
    this._content = value;
    this.contentChanged = true;
  }
  /**
   * 点的背景颜色
   * */
  @Input()dotsBgColor: string;
  @ViewChild('segmentWrapEle') segmentWrapEle: ElementRef;
  _content: string;
  showDots: boolean;
  contentChanged: boolean;
  constructor(private cdRef: ChangeDetectorRef) {
    this.contentChanged = false;
    this.showDots = false;
    this._content = '';
    this.dotsBgColor = '#fff';
   }

  ngOnInit() {
  }
  ngAfterViewChecked() {
    if (!this.contentChanged) {
      return;
    }

    if (this.segmentWrapEle.nativeElement.scrollHeight > this.segmentWrapEle.nativeElement.offsetHeight ||
      this.segmentWrapEle.nativeElement.scrollWidth > this.segmentWrapEle.nativeElement.offsetWidth) {
        setTimeout(() => {
          this.showDots = true;
          this.contentChanged = false;
          this.cdRef.detectChanges();
        }, 0);
    }
  }
}
