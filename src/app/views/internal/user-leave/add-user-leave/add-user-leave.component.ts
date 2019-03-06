import { UserService } from './../../../../core/common-services/user.service';
import { Component, OnInit, EventEmitter, Output, Input, ViewChild, TemplateRef } from '@angular/core';
import { UserLeaveService } from '../../../../core/trans/internal/user-leave.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UfastTableNs } from '../../../../layout/layout.module';

@Component({
  selector: 'app-add-user-leave',
  templateUrl: './add-user-leave.component.html',
  styleUrls: ['./add-user-leave.component.scss']
})
export class AddUserLeaveComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  userLeaveForm: FormGroup;
  /**
   * 代理人相关
   */
  agentListTableConfig: UfastTableNs.TableConfig;
  agentList: any[];
  @ViewChild('chooseAgentTpl') chooseAgentTpl: TemplateRef<any>;
  agentVisible: boolean;
  @Input() detailId: string;
  constructor(private userLeaveService: UserLeaveService,
    private messageService: ShowMessageService,
    private formBuilder: FormBuilder,
    private userService: UserService) {
      this.finish = new EventEmitter<any>();
      this.agentList = [];
      this.agentVisible = false;
     }
     disabledStart = (startDate: Date) => {
      if (!startDate || !this.userLeaveForm.controls['endTime'].value) {
        return false;
      }
      return startDate.getTime() > new Date(this.userLeaveForm.controls['endTime'].value).getTime();
    }
    disabledEnd = (endDate: Date) => {
      if (!endDate || !this.userLeaveForm.controls['startTime'].value) {
        return false;
      }
      return endDate.getTime() <= new Date(this.userLeaveForm.controls['startTime'].value).getTime();
    }
    public showAgentModal() {
      this.agentVisible = true;
      this.getAgentList();
    }
    public getAgentList = () => {
      const filter = {
        pageNum: this.agentListTableConfig.pageNum,
        pageSize: this.agentListTableConfig.pageSize,
        filters: {}
      };
      this.agentListTableConfig.loading = true;
      this.userService.getUserList(filter).subscribe((resData) => {
        this.agentListTableConfig.loading = false;
        this.agentList = [];
        if (resData.code) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.agentListTableConfig.total = resData.value.total;
        resData.value.list.forEach((item) => {
          this.agentList.push({
            name: item.name,
            userId: item.userId
          });
        });
      }, (error) => {
        this.agentListTableConfig.loading = false;
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    }
    public selectAgentName(id, name) {
      this.userLeaveForm.patchValue({
        agentName: name,
        agentId: id
      });
      this.agentVisible = false;
    }
    public saveUserLeave() {
      let submitData = <any>{};
      let submitHandle = <any>{};
      Object.keys(this.userLeaveForm.controls).filter(
        item => typeof this.userLeaveForm.controls[item].value === 'string').forEach((key: string) => {
          this.userLeaveForm.controls[key].patchValue(this.userLeaveForm.controls[key].value.trim());
        });
        Object.keys(this.userLeaveForm.controls).forEach((keys: string) => {
          this.userLeaveForm.controls[keys].markAsDirty();
          this.userLeaveForm.controls[keys].updateValueAndValidity();
        });
        if (this.userLeaveForm.invalid) {
          this.messageService.showToastMessage('请正确填写信息', 'error');
          return;
        }
      submitData = this.userLeaveForm.getRawValue();
      if (this.detailId) {
        submitData.id = this.detailId;
        submitHandle = this.userLeaveService.editUserLeave(submitData);
      } else {
        submitHandle = this.userLeaveService.addUserLeave(submitData);
      }
      submitHandle.subscribe((resData) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitFinish();
      });
    }
    public emitFinish() {
      this.finish.emit();
    }
    // public startTimeChange(date) {
    //   this.userLeaveForm.patchValue({
    //     startTime: date
    //   });
    // }
    // public endTimeChange(date) {
    //   this.userLeaveForm.patchValue({
    //     endTime: date
    //   });
    // }
    public getUserLeaveDetail() {
      this.userLeaveService.getUserLeaveDetail(this.detailId).subscribe((resData) => {
        this.userLeaveForm.patchValue(resData.value);
      });
    }
  ngOnInit() {
    this.userLeaveForm = this.formBuilder.group({
      agentId: [null, Validators.required],
      agentName: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      state: [1]
    });
    this.agentListTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        { title: '用户名', field: 'name', width: 100 },
        { title: '用户ID', field: 'userId', width: 140 },
        { title: '操作', tdTemplate: this.chooseAgentTpl, width: 100 }
      ]
    };
    if (this.detailId) {
      this.getUserLeaveDetail();
    }
  }

}
