import {Component, OnInit} from '@angular/core';
import {RoleService, RoleServiceNs} from '../../../core/common-services/role.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ScepterServiceNs} from '../../../core/common-services/scepter.service';
import {AuthServiceNs} from '../../../core/common-services/auth.service';
import SysAuthsItemModel = AuthServiceNs.SysAuthsItemModel;

@Component({
  selector: 'app-auth-role-manage',
  templateUrl: './auth-role-manage.component.html',
  styleUrls: ['./auth-role-manage.component.scss']
})
export class AuthRoleManageComponent implements OnInit {
  rolesList: RoleServiceNs.SysRoleReqModel[];
  selectedRolesId: string[];
  privilegeRole: RoleServiceNs.SysRoleReqModel;
  authTree: SysAuthsItemModel[];

  tabPage: 'addRole' | 'editRole' | 'privilege' | '';
  tabIndex: number;
  allChecked: any;
  trackByRole: any;
  addRoleForm: FormGroup;
  menuCodeObj: any;
  authCodeObj: any;

  constructor(private roleService: RoleService, private showMessageService: ShowMessageService,
              private formBuilder: FormBuilder) {
    this.tabPage = '';
    this.tabIndex = 0;
    this.privilegeRole = {};
  }

  ngOnInit() {
    this.getPageList();
    this.addRoleForm = this.formBuilder.group({
      roleName: ['', [Validators.required, Validators.maxLength(20)]],
      roleRemark: ['', [Validators.maxLength(50)]]
    });
  }

  public switchTab(type: 'addRole' | 'editRole' | 'privilege' | '', role: ScepterServiceNs.RoleModel = {name: '', remark: ''}) {
    this.tabPage = type;
    this.tabIndex = 1;
    this.privilegeRole = {};
    if (type === 'editRole' || type === 'addRole') {
      this.privilegeRole.name = role.name;
      this.privilegeRole.remark = role.remark;
      this.privilegeRole.id = role.id || undefined;
    } else {
      this.getDetail(role.id);
    }
  }

  private getDetail(roleId: string) {
    this.roleService.getSysRoleDetail(roleId)
      .subscribe((resData: RoleServiceNs.RoleHttpAnyResModel<any>) => {
        if (resData.code === 0) {
          this.privilegeRole = resData.value;
          this.authTree = this.privilegeRole.treeAuthList;
          return;
        }
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
      }, (error: any) => {
        this.showMessageService.showAlertMessage('错误', error.message, 'error');
      });
  }


  deleteSelected() {
    if (this.selectedRolesId.length < 1) {
      this.showMessageService.showAlertMessage('', '未选中记录', 'error');
    }
    const modalCtrl = this.showMessageService.showAlertMessage('', '您确定要删除吗？', 'confirm');
    modalCtrl.afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.roleService.deleteSysRole(this.selectedRolesId)
        .subscribe((resData: any) => {
          if (resData.code !== 0) {
            this.showMessageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.getPageList();
        }, (error) => {
          this.showMessageService.showAlertMessage('', error.message, 'error');
        });
    });
  }

  checkAll(value: boolean) {
    this.selectedRolesId = [];
    this.rolesList.forEach((x) => {
      x.checked = value;
      if (value) {
        this.selectedRolesId.push(x.id);
      }
    });
  }

  public checkSingle(value: boolean, role: ScepterServiceNs.RoleModel) {
    if (!this.selectedRolesId) {
      this.selectedRolesId = [];
    }
    if (value) {
      this.selectedRolesId.push(role.id);
      if (this.selectedRolesId.length === this.rolesList.length) {
        this.allChecked = true;
      }
    } else {
      this.allChecked = false;
      this.deleteIdSelected(role.id);
    }
  }

  private deleteIdSelected(roleId: string) {
    for (let i = 0, len = this.selectedRolesId.length; i < len; i++) {
      if (this.selectedRolesId[i] === roleId) {
        this.selectedRolesId.splice(i, 1);
        break;
      }
    }
  }

  deleteSingle(roleIndex: number, role: RoleServiceNs.SysRoleReqModel) {
    const modalCtrl = this.showMessageService.showAlertMessage('', '您确定要删除吗？', 'confirm');
    modalCtrl.afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.roleService.deleteSysRole([role.id])
        .subscribe((resData: any) => {
          if (resData.code !== 0) {
            this.showMessageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.getPageList();
        }, (error) => {
          this.showMessageService.showAlertMessage('', error.message, 'error');
        });
    });
  }

  addRoleSubmit() {
    let sub: any = null;
    for (const key of Object.keys(this.addRoleForm.controls)) {
      this.addRoleForm.controls[key].markAsDirty();
      this.addRoleForm.controls[key].updateValueAndValidity();
    }
    console.log(this.addRoleForm);
    if (this.addRoleForm.invalid) {
      return;
    }
    console.log(this.privilegeRole);
    sub = this.roleService.saveSysRole(this.privilegeRole);
    sub.subscribe((resData: RoleServiceNs.RoleHttpAnyResModel<any>) => {
      if (resData.code === 0) {
        this.getPageList();
      } else {
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
      }
    }, (error) => {
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
    this.cancelTabPage();
  }

  cancelTabPage() {
    this.tabIndex = 0;
    this.privilegeRole = null;
    if (this.tabPage === 'privilege') {
      this.authCodeObj = {};
      this.menuCodeObj = {};
    } else {
      for (const key of Object.keys(this.addRoleForm.controls)) {
        this.addRoleForm.controls[key].reset();
      }
    }
    this.tabPage = '';
  }

  checkAllMenuState(value: boolean, top: SysAuthsItemModel, side: SysAuthsItemModel, menu: SysAuthsItemModel, four: SysAuthsItemModel) {
    if (four) {
      four.checked = value;
    } else if (menu) {
      menu.checked = value;
      this.checkChildMenu(menu, value);
    } else if (side) {
      side.checked = value;
      this.checkChildMenu(side, value);
    } else {
      top.checked = value;
      this.checkChildMenu(top, value);
    }
    // 判断 indeterminate
    this.checkIndeterminateFromTop(four);
    this.checkIndeterminateFromTop(menu);
    this.checkIndeterminateFromTop(side);
    this.checkIndeterminateFromTop(top);
    console.log(this.privilegeRole);
    return;
  }

  private checkIndeterminateFromTop(menu: SysAuthsItemModel) {
    if (menu) {
      let menuChildrenCheckSize = 0;
      let indeterminate = false;
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach((x) => {
            if (x.indeterminate && x.checked) {
              menu.indeterminate = true;
              menu.checked = true;
              indeterminate = true;
              return;
            }
            if (x.checked) {
              menuChildrenCheckSize++;
            }
          }
        );
        if (indeterminate) {
          menu.checked = true;
          return true;
        }
        if (menuChildrenCheckSize > 0) {
          menu.checked = true;
        } else {
          menu.checked = false;
        }
        if (menuChildrenCheckSize > 0 && menuChildrenCheckSize < menu.children.length) {
          menu.checked = true;
          menu.indeterminate = true;
        } else {
          menu.indeterminate = false;
        }
      } else {
        menu.indeterminate = false;
      }
    }
  }

  /**遍历子节点**/
  private checkChildMenu(node: SysAuthsItemModel, value) {
    if (!node.children) {
      return;
    }
    if (node.children.length === 0) {
      return;
    } else {
      for (let index = 0, len = node.children.length; index < len; index++) {
        node.children[index].checked = value;
        if (!value) {
          node.children[index].indeterminate = false;
        }
        this.checkChildMenu(node.children[index], value);
      }
    }
  }

  setAuthSubmit() {
    let sub: any = null;
    sub = this.roleService.saveSysRole(this.privilegeRole);
    sub.subscribe((resData: RoleServiceNs.RoleHttpAnyResModel<any>) => {
      if (resData.code === 0) {
        this.cancelTabPage();
      } else {
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
      }
    }, (error) => {
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
  }

  private getPageList() {
    this.roleService.getSysRoleList({})
      .subscribe((resData: RoleServiceNs.RoleHttpAnyResModel<any>) => {
        if (resData.code === 0) {
          this.rolesList = resData.value.list;
          return;
        }
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
      }, (error: any) => {
        this.showMessageService.showAlertMessage('错误', error.message, 'error');
      });
  }

}
