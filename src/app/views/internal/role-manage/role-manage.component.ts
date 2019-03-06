import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScepterServiceNs, ScepterService } from '../../../core/common-services/scepter.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
import {ActionCode} from '../../../../environments/actionCode';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';

// enableProdMode();
@Component({
  selector: 'app-role-manage-page',
  templateUrl: './role-manage.component.html',
  styleUrls: ['./role-manage.component.scss']
})
export class RoleManageComponent implements OnInit {

  rolesList: ScepterServiceNs.RoleModel[];
  allChecked: boolean;
  selectedRolesId: string[];
  addRoleForm: FormGroup;
  tabPage: 'addRole' | 'editRole' | 'privilege' | '';
  tabIndex: number;
  addRoleData: any;

  authTree: ScepterServiceNs.MenuShownItemModel[];

  authCodeObj: any;
  menuCodeObj: any;
  menuIndeterminateObj: any;
  privilegeRole: ScepterServiceNs.RoleModel;
  ActionCode = ActionCode;
  constructor(private scepterService: ScepterService, private showMessageService: ShowMessageService,
    private formBuilder: FormBuilder
  ) {
    this.privilegeRole = null;
    this.authCodeObj = {};
    this.menuCodeObj = {};
    this.menuIndeterminateObj = {};

    this.authTree = [{
      auths: [],
      name: '',
      url: '',
      children: []
    }];

    this.addRoleData = {
      name: '',
      remark: ''
    };
    this.tabIndex = 0;
    this.tabPage = '';
    this.rolesList = [];
    this.selectedRolesId = [];
    this.allChecked = false;

  }

  private getRolesList() {
    this.scepterService.getRoles()
      .subscribe((resData: ScepterServiceNs.ScepterResModelT<any>) => {
        if (resData.code === 0) {
          this.rolesList = resData.value;
          return;
        }
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
      }, (error: any) => {
        this.showMessageService.showAlertMessage('错误', error.message, 'error');
      });
  }

  public checkAll(value: boolean) {
    this.selectedRolesId = [];
    for (let i = 0, len = this.rolesList.length; i < len; i++) {
      this.rolesList[i].checked = value;
      if (value) {
        this.selectedRolesId.push(this.rolesList[i].id);
      }
    }

  }

  public checkSingle(value: boolean, role: ScepterServiceNs.RoleModel) {
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

  public deleteSingle(index: number, role: ScepterServiceNs.RoleModel) {
    const modalCtrl = this.showMessageService.showAlertMessage('', '您确定要删除吗？', 'confirm');
    modalCtrl.afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.scepterService.deleteRoles([role.id])
        .subscribe((resData: ScepterServiceNs.ScepterResModelT<any>) => {
          if (resData.code !== 0) {
            this.showMessageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.getRolesList();
        }, (error) => {
          this.showMessageService.showAlertMessage('', error.message, 'error');
        });
    });

  }

  public deleteSelected() {
    if (this.selectedRolesId.length === 0) {
      this.showMessageService.showToastMessage('请选择要删除的角色', 'info');
      return;
    }

    const modalCtrl = this.showMessageService.showAlertMessage('', '您确定要删除吗？', 'confirm');

    modalCtrl.afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.scepterService.deleteRoles(this.selectedRolesId)
        .subscribe((resData: ScepterServiceNs.ScepterResModelT<any>) => {
          if (resData.code !== 0) {
            this.showMessageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.selectedRolesId = [];
          this.showMessageService.showToastMessage('操作成功', 'success');
          this.getRolesList();
        }, (error) => {
          this.showMessageService.showAlertMessage('', error.message, 'error');
        });
    });

  }

  public trackByRole(index, role: ScepterServiceNs.RoleModel) {
    return role.id;
  }

  public switchTab(type: 'addRole' | 'editRole' | 'privilege' | '', role: ScepterServiceNs.RoleModel = { name: '', remark: '' }) {
    this.tabPage = type;
    this.tabIndex = 1;
    if (type === 'editRole' || type === 'addRole') {
      this.addRoleData.name = role.name;
      this.addRoleData.remark = role.remark;
      this.addRoleData.id = role.id || undefined;
    } else {
      this.setAuthInit(role.id);
      this.privilegeRole = role;
    }

  }

  public cancelTabPage() {
    this.tabIndex = 0;

    if (this.tabPage === 'privilege') {
      this.authTree = [{
        auths: [],
        name: '',
        url: '',
        children: []
      }];
      this.authCodeObj = {};
      this.menuCodeObj = {};
      this.privilegeRole = null;
    } else {
      for (const key of Object.keys(this.addRoleForm.controls)) {
        this.addRoleForm.controls[key].reset();
      }
    }

    this.tabPage = '';
  }

  public addRoleSubmit() {
    let sub: any = null;

    for (const key of Object.keys(this.addRoleForm.controls)) {
      this.addRoleForm.controls[key].markAsDirty();
      this.addRoleForm.controls[key].updateValueAndValidity();
    }
    if (this.addRoleForm.invalid) {
      return;
    }
    if (this.tabPage === 'addRole') {
      sub = this.scepterService.addRole(this.addRoleData);
    } else {
      sub = this.scepterService.editRoles(this.addRoleData);
    }
    sub.subscribe((resData: ScepterServiceNs.ScepterResModelT<any>) => {
      if (resData.code === 0) {
        this.getRolesList();
      } else {
        this.showMessageService.showAlertMessage('', resData.message, 'warning');
      }
    }, (error) => {
      this.showMessageService.showAlertMessage('', error.message, 'error');
    });
    this.cancelTabPage();

  }

  // public tabChange() {
  //   if (this.tabIndex === 0) {
  //     this.cancelTabPage();
  //   }
  // }

  private setAuthInit(roleId: string) {


    Observable.forkJoin([this.scepterService.getMenuShown(), this.scepterService.getMenusAuths(roleId)])
      .subscribe((resData: ScepterServiceNs.ScepterResModelT<any>[]) => {
        if (resData[0].code !== 0 || resData[1].code !== 0) {
          const message = resData[0].code !== 0 ? resData[0].message : resData[1].message;
          this.showMessageService.showAlertMessage('', message, 'warning');
          return;
        }
        this.authTree = resData[0].value;

        for (let i = 0, lenI = resData[1].value.menus.length; i < lenI; i++) {
          this.menuCodeObj[resData[1].value.menus[i]] = true;
        }

        for (let i = 0, lenI = resData[1].value.auths.length; i < lenI; i++) {
          this.authCodeObj[resData[1].value.auths[i]] = true;
        }

        for (let i = 0, len = resData[0].value.length; i < len; i++) {
          this.initAuthCheckAll(resData[0].value[i]);
        }

      }, (error) => {
        this.showMessageService.showAlertMessage('', error.message, 'error');
      });

  }

  private initAuthCheckAll(nodeTree: ScepterServiceNs.MenuShownItemModel) {
    if (!nodeTree.children || nodeTree.children.length === 0) {
      return;
    }
    let prev: boolean = this.menuCodeObj[nodeTree.children[0].id] || false;

    for (let index = 0, len = nodeTree.children.length; index < len; index++) {
      this.initAuthCheckAll(nodeTree.children[index]);
      this.menuCodeObj[nodeTree.children[index].id] = this.menuCodeObj[nodeTree.children[index].id] || false;
      if (prev !== this.menuCodeObj[nodeTree.children[index].id]) {

        this.menuIndeterminateObj[nodeTree.id] = true;
        break;
      }
      prev = this.menuCodeObj[nodeTree.children[index].id];
    }
  }

  public setAuthSubmit() {
    const reqData = {
      authIds: [],
      menuIds: [],
      roleId: this.privilegeRole.id,
    };
    for (const keyMenu in this.menuCodeObj) {
      if (this.menuCodeObj[keyMenu]) {
        reqData.menuIds.push(parseInt(keyMenu, 10));
      }
    }
    for (const keyAuth in this.authCodeObj) {
      if (this.authCodeObj[keyAuth]) {
        reqData.authIds.push(parseInt(keyAuth, 10));
      }
    }
    this.scepterService.addMenusAuths(reqData)
      .subscribe((resData: ScepterServiceNs.ScepterResModelT<any>) => {
        if (resData.code !== 0) {
          this.showMessageService.showAlertMessage('', resData.message, 'warning');
          return;
        }
        this.showMessageService.showToastMessage('设置成功', 'success');
        this.cancelTabPage();
      }, (error) => {
        this.showMessageService.showAlertMessage('', error.message, 'error');
      });
  }

  /**
   * menuNodes:目标节点到最外层父节点
   * **/
  public checkAllMenuState(value: boolean, menuNodes: ScepterServiceNs.MenuShownItemModel[]) {
    const length: number = menuNodes.length;


    if (!value) {
      this.menuIndeterminateObj[menuNodes[0].id] = value;
    }

    this.checkChildMenu(menuNodes[0], value);

    for (let index = 1; index < length; index++) {
      this.checkSiblingMenu(menuNodes[index]);
    }

  }

  public checkAllAuthState(value: boolean, menuNodes: ScepterServiceNs.MenuShownItemModel[]) {
    if (value) {
      this.menuCodeObj[menuNodes[0].id] = true;
    }

    for (let index = 1, len = menuNodes.length; index < len; index++) {
      this.checkSiblingMenu(menuNodes[index]);
    }
  }

  /**遍历兄弟节点**/
  private checkSiblingMenu(parentNode: ScepterServiceNs.MenuShownItemModel) {


    let prev: boolean = this.menuCodeObj[parentNode.children[0].id] || false,
      indeterminate = false,
      index = 0;
    const len = parentNode.children.length;

    this.menuCodeObj[parentNode.id] = false;

    for (; index < len; index++) {
      this.menuCodeObj[parentNode.children[index].id] = this.menuCodeObj[parentNode.children[index].id] || false;
      if (!indeterminate && prev !== this.menuCodeObj[parentNode.children[index].id]) {
        this.menuIndeterminateObj[parentNode.id] = true;
        this.menuCodeObj[parentNode.id] = true;
        indeterminate = true;
        break;
      }
      prev = this.menuCodeObj[parentNode.children[index].id];
    }

    if (index === len) {
      if (this.menuCodeObj[parentNode.children[0].id]) {
        this.menuCodeObj[parentNode.id] = true;
      } else {
        this.menuCodeObj[parentNode.id] = false;
      }
      this.menuIndeterminateObj[parentNode.id] = false;
    }


  }

  /**遍历子节点**/
  private checkChildMenu(node: ScepterServiceNs.MenuShownItemModel, value) {
    if (!node.children) {
      return;
    }
    if (node.children.length === 0) {
      if (!node.auths || node.auths.length === 0) {
        return;
      }
      node.auths.forEach((item) => {
        this.authCodeObj[item.authId] = value;
      });
    } else {
      for (let index = 0, len = node.children.length; index < len; index++) {
        this.menuCodeObj[node.children[index].id] = value;
        this.checkChildMenu(node.children[index], value);
      }
    }
  }

  ngOnInit() {
    this.getRolesList();
    this.addRoleForm = this.formBuilder.group({
      roleName: ['', [Validators.required, Validators.maxLength(20)]],
      roleRemark: ['', [Validators.maxLength(50)]]
    });
  }

}
