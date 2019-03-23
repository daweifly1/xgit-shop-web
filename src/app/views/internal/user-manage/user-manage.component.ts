import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService, UserServiceNs} from '../../../core/common-services/user.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {Observable} from 'rxjs/Observable';
import {UfastValidatorsService} from '../../../core/infra/validators/validators.service';
import {ScepterService, ScepterServiceNs} from '../../../core/common-services/scepter.service';
import {ActionCode} from '../../../../environments/actionCode';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';

enum TabPageType {
  ManagePage = 0,
  AddPage,
  EditPage
}

enum LockedStatus {
  Unlock,
  Lock
}

interface ActionStatus {
  edit: boolean;
  resetPassword: boolean;
  del: boolean;
  lock: boolean;
  unlock: boolean;
}

@Component({
  selector: 'app-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.scss']
})
export class UserManageComponent implements OnInit {

  tabPageIndex: number;
  tabPageType: TabPageType;

  userDataList: any[];
  userTableConfig: UfastTableNs.TableConfig;
  userInfoForm: FormGroup;
  departmentOptions: any[];
  roleIdList: ScepterServiceNs.RoleModel[];
  editUserInitDeptId: string;
  operateUserId: string;
  addOrEditTitle: string;
  selectedList: number[];
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  ActionCode = ActionCode;
  filterData: any;
  orderBy: string;
  showAdvancedSearch: boolean;
  actionStatus: { [index: string]: ActionStatus };
  /**上级 */
  superiorListTableConfig: UfastTableNs.TableConfig;
  superiorList: any[];
  @ViewChild('chooseSuperiorTpl') chooseSuperiorTpl: TemplateRef<any>;
  superiorVisible: boolean;

  constructor(private userService: UserService, private messageService: ShowMessageService,
              private formBuilder: FormBuilder, private validator: UfastValidatorsService,
              private scepterService: ScepterService
  ) {
    this.actionStatus = {};
    this.showAdvancedSearch = false;
    this.filterData = {};
    this.selectedList = [];
    this.tabPageType = TabPageType.ManagePage;
    this.userDataList = [];

    this.departmentOptions = [];
    this.roleIdList = [];
    this.superiorList = [];
    this.superiorVisible = false;
  }

  public trackByUserId(index: number, item: any) {
    return item.userId;
  }

  public checkTable(event: UfastTableNs.SelectedChange) {
    const checked = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
    if (event.index === -1) {
      this.userTableConfig.checkAll = checked;
      this.userDataList.forEach((item: any) => {
        item[this.userTableConfig.checkRowField] = checked;
      });
      return;
    }
    this.userTableConfig.checkAll = checked;
    if (checked) {
      for (let i = 0, len = this.userDataList.length; i < len; i++) {
        if (!this.userDataList[i][this.userTableConfig.checkRowField]) {
          this.userTableConfig.checkAll = false;
          break;
        }
      }
    } else {
      const sortChange = event.type === UfastTableNs.SelectedChangeType.SortChange ? true : false;
      if (sortChange) {
        this.orderBy = event.orderBy;
        this.getUserList();
      }
    }
  }

  getUserList = () => {
    const filter = {
      pageNum: this.userTableConfig.pageNum,
      pageSize: this.userTableConfig.pageSize,
      filters: this.filterData,
      orderBy: this.orderBy
    };
    this.userTableConfig.loading = true;
    this.userService.getUserList(filter).subscribe((resData: UserServiceNs.UfastHttpAnyResModel) => {
      this.userTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.userDataList = resData.value.list;
      this.userTableConfig.total = resData.value.total;
      this.actionStatus = {};
      this.userDataList.forEach((item) => {
        this.actionStatus[item.userId] = {
          edit: true,
          resetPassword: true,
          del: true,
          lock: item.locked === LockedStatus.Unlock,
          unlock: item.locked === LockedStatus.Lock
        };
      });
    }, (error: any) => {
      this.userTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public batchDelUser() {
    const userIdList = [];
    this.userDataList.forEach((item) => {
      if (item[this.userTableConfig.checkRowField]) {
        userIdList.push(item.userId);
      }
    });
    this.deleteUsers(userIdList);
  }

  public deleteUsers(userIdList: string[]) {

    if (userIdList.length === 0) {
      this.messageService.showToastMessage('请选择要删除的用户?', 'info');
      return;
    }
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.userService.removeUsers(userIdList), true);
    });
  }

  public resetPd(userId) {
    this.messageService.showAlertMessage('', '确定重置密码吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.userService.resetPassword([userId]));
    });
  }

  public lockUser(userId: string, locked: number) {
    locked = 1 - locked;
    const message: string = locked === 0 ? '启用' : '锁定';

    this.messageService.showAlertMessage('', `确定${message}该用户吗?`, 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.userService.lockUsers(locked, [userId]), true);
    });

  }

  public addOrEditUserTab(type: number, userId?: string) {
    this.tabPageType = type;
    this.tabPageIndex = 1;

    this.userInfoForm.reset();
    this.roleIdList = [];
    this.departmentOptions = [];

    if (type === TabPageType.EditPage) {
      this.addOrEditTitle = '编辑';
      this.operateUserId = userId;
      this.getRoleIds();
      this.userInfoForm.get('loginName').disable();
      this.userService.getUserDetail(userId).subscribe((resData: UserServiceNs.UfastHttpAnyResModel) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'warning');
        }
        this.userInfoForm.patchValue(<any>{
          name: resData.value.name,
          loginName: resData.value.loginName,
          nickname: resData.value.nickname,
          mobile: resData.value.mobile,
          telephone: resData.value.telephone,
          email: resData.value.email,
          code: resData.value.code,
          erpCode: resData.value.erpCode,
          locked: resData.value.locked,
          sex: resData.value.locked,
          roleIds: resData.value.roleIds,
          deptId: resData.value.deptName,
          superiorId: resData.value.superiorId,
          superiorName: resData.value.superiorName
        });
        this.editUserInitDeptId = resData.value.deptId;
      }, (error: any) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });


    } else if (type === TabPageType.AddPage) {
      this.addOrEditTitle = '新增';
      this.getRoleIds();
      this.userInfoForm.get('loginName').enable();
      this.userInfoForm.patchValue({
        locked: 0,
        sex: 1
      });
    } else {
      return;
    }
  }

  public toggleManagePage() {
    this.tabPageType = TabPageType.ManagePage;
    this.tabPageIndex = 0;
    this.operateUserId = '';
  }

  private commonResDeal(observer: Observable<any>, refresh: boolean = true) {
    observer.subscribe((resData: UserServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      if (refresh) {
        this.getUserList();
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public showDepartment(value: any) {

    if (value) {
      if (this.departmentOptions.length === 0) {
        this.getDepartmentList('0');
      }
    }
  }

  public selectDepartmentItem(itemDetail: any) {
    if (itemDetail.option.isLeaf) {
      return;
    }
    itemDetail.option.children.shift();
    this.getDepartmentList(itemDetail.option.value, itemDetail.option.children);

  }

  private getDepartmentList(id: string, targetList?: any[]) {
    this.userService.getDepartment(id).subscribe((resData: UserServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }

      const modelList: UserServiceNs.DepartmentModel[] = <UserServiceNs.DepartmentModel[]>resData.value;
      const tempList = targetList || [];

      for (let i = 0, len = modelList.length; i < len; i++) {
        const temp = {
          label: modelList[i].name,
          value: modelList[i].id,
          isLeaf: modelList[i].leaf === 0 ? false : true,
          children: modelList[i].leaf === 0 ? [{}] : undefined
        };
        tempList.push(temp);
      }
      if (!targetList) {
        this.departmentOptions = tempList;
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public getRoleIds() {
    this.scepterService.getRoles().subscribe((resData: ScepterServiceNs.ScepterResModelT<ScepterServiceNs.RoleModel[]>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
        return;
      }
      this.roleIdList = resData.value;

    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });


  }

  public addOrEditSubmit() {
    Object.keys(this.userInfoForm.controls).forEach((key: string) => {
      this.userInfoForm.controls[key].markAsDirty();
      this.userInfoForm.controls[key].updateValueAndValidity();
    });

    if (this.userInfoForm.invalid) {
      return;
    }
    const userInfo = this.userInfoForm.getRawValue();
    const data: UserServiceNs.UserInfoModel = {
      loginName: userInfo.loginName,
      name: userInfo.name,
      code: userInfo.code,
      erpCode: userInfo.erpCode,
      nickname: userInfo.nickname,
      sex: userInfo.sex,
      locked: userInfo.locked,
      mobile: userInfo.mobile,
      telephone: userInfo.telephone,
      email: userInfo.email,
      roleIds: userInfo.roleIds,
      deptId: userInfo.deptId instanceof Array ? userInfo.deptId[userInfo.deptId.length - 1] : this.editUserInitDeptId,
      userId: this.operateUserId,
      superiorId: userInfo.superiorId,
      superiorName: userInfo.superiorName
    };

    let observer: any = null;
    if (this.tabPageType === TabPageType.AddPage) {
      observer = this.userService.addUser(data);
    } else if (this.tabPageType === TabPageType.EditPage) {
      observer = this.userService.updateUserInfo(data);
    } else {
      return;
    }

    observer.subscribe((resData: UserServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.getUserList();
      this.toggleManagePage();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  public resetSearch() {
    this.filterData = {};
    this.getUserList();
  }

  /**上级 */
  public showSuperiorModal() {
    this.superiorVisible = true;
    this.getSuperiorList();
  }

  public getSuperiorList = () => {
    const filter = {
      pageNum: this.superiorListTableConfig.pageNum,
      pageSize: this.superiorListTableConfig.pageSize,
      filters: {
        // deptId: this.userInfoForm.controls['deptId'].value
      }
    };
    this.superiorListTableConfig.loading = true;
    this.userService.getUserList(filter).subscribe((resData) => {
      this.superiorListTableConfig.loading = false;
      this.superiorList = [];
      if (resData.code) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.superiorListTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        this.superiorList.push({
          name: item.name,
          userId: item.userId
        });
      });
    }, (error) => {
      this.superiorListTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public selectSuperior(id, name) {
    this.userInfoForm.patchValue({
      superiorName: name,
      superiorId: id
    });
    this.superiorVisible = false;
  }

  public clearInnerOrder() {
    this.userInfoForm.patchValue({
      superiorName: '',
      superiorId: ''
    });
  }

  ngOnInit() {
    this.userInfoForm = this.formBuilder.group({
      loginName: [null, [Validators.required, Validators.maxLength(20)]],
      name: [null, [Validators.required, Validators.maxLength(20)]],
      code: [null, [Validators.required, Validators.maxLength(20)]],
      erpCode: [null, [Validators.required, Validators.maxLength(20)]],
      nickname: [null, Validators.maxLength(20)],
      sex: [null, Validators.required],
      deptId: [[], [Validators.required]],
      roleIds: [[], [Validators.required]],
      telephone: [null, [this.validator.telephoneValidator()]],
      mobile: [null, [Validators.maxLength(11), Validators.minLength(11)]],
      email: [null, [this.validator.emailValidator()]],
      locked: [null, Validators.required],
      superiorName: [null],
      superiorId: [null]
    });
    this.userTableConfig = {
      id: 'internal-userManageList',
      pageNum: 1,
      pageSize: 10,
      showCheckbox: true,
      checkAll: false,
      checkRowField: '_checked',
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      orderBy: '',
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 180, fixed: true},
        {title: '用户账号', field: 'loginName', width: 150, fixed: true, toSort: true},
        {title: '用户名', field: 'name', width: 150, toSort: true},
        {title: '昵称', field: 'nickname', width: 150, toSort: true},
        {title: '性别', field: 'sex', width: 60, pipe: 'sex'},
        {title: '状态', field: 'locked', width: 60, pipe: 'lockedStatus'},
        {title: '联系电话', field: 'telephone', width: 100},
        {title: '手机号', field: 'mobile', width: 100},
        {title: '所属部门', field: 'deptName', width: 130},
        {title: '电子邮箱', field: 'email', width: 120},
        {title: '用户类型', field: 'roleNames', width: 120},
        {title: '最后登录时间', field: 'lastLoginTime', width: 150, pipe: 'date:yyyy-MM-dd HH:mm:ss'}
      ]
    };
    this.superiorListTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        {title: '用户名', field: 'name', width: 100},
        {title: '用户ID', field: 'userId', width: 140},
        {title: '操作', tdTemplate: this.chooseSuperiorTpl, width: 100}
      ]
    };
    this.getUserList();
  }

}
