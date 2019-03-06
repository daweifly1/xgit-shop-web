import {Component, OnInit} from '@angular/core';
import {DeptServiceNs, DeptService} from '../../../core/common-services/dept.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {ActionCode} from '../../../../environments/actionCode';
export enum TabPageType {
  MainPage = 0,
  AddPage,
  EditPage,
}

@Component({
  selector: 'app-dept-manage',
  templateUrl: './dept-manage.component.html',
  styleUrls: ['./dept-manage.component.scss']
})
export class DeptManageComponent implements OnInit {
  tabPageType: TabPageType;
  deptDataList: DeptServiceNs.DeptItemModel[];
  loading: boolean;
  targetDept: DeptServiceNs.DeptItemModel;
  addOrEditName: string;
  show = true;
  ActionCode = ActionCode;
  constructor(private deptService: DeptService, private messageService: ShowMessageService) {
    this.tabPageType = TabPageType.MainPage;
    this.loading = false;
    this.deptDataList = [];
    this.addOrEditName = '';
  }
  public toggleMainPage() {
    this.tabPageType = TabPageType.MainPage;
    this.addOrEditName = '';
  }

  public trackById(index: number, item: any) {
    return item.id;
  }

  public expandDepts(dept: DeptServiceNs.DeptItemModel) {
    if (dept.expand) {
      dept.expand = false;
    } else if (dept.children) {
      dept.expand = !dept.expand;
    } else {
      this.getDepts(dept);
    }
  }

  public getDepts(dept?: DeptServiceNs.DeptItemModel) {

    const id = dept ? dept.id : '0';

    this.loading = true;
    this.deptService.getDeptList(id).subscribe((resData: DeptServiceNs.UfastHttpAnyResModel) => {
      this.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      if (dept) {
        dept.children = resData.value;
        dept.expand = true;
      } else {
        this.deptDataList = resData.value;
      }
    }, (error: any) => {
      this.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public addDept(name: string, parent?: DeptServiceNs.DeptItemModel) {
    const parentId = parent ? parent.id : '0';
    this.messageService.showLoading('');
    this.deptService.insertDept(parentId, name).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      const temp: DeptServiceNs.DeptItemModel = {
        id: resData.value,
        name: name,
        children: [],
        leaf: 1,
        parentId: parentId

      };
      if (parent) {
        parent.leaf = 0;
        parent.children ? parent.children.push(temp) : parent.children = [temp];
        parent.expand = true;
      } else {
        this.deptDataList.push(temp);
      }

      this.toggleMainPage();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public deleteDept(item: DeptServiceNs.DeptItemModel, parent?: DeptServiceNs.DeptItemModel) {
    this.messageService.showAlertMessage('', `您确定要删除${item.name}`, 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.deptService.removeDept(item.id).subscribe((resData: any) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          const list = parent ? parent.children : this.deptDataList;
          for (let i = 0, len = list.length; i < len; i++) {
            if (list[i].id === item.id) {
              list.splice(i, 1);
              break;
            }
          }
        }, (error: any) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });

  }

  public updateDept(dept: DeptServiceNs.DeptItemModel, name: string) {
    this.messageService.showLoading('');
    this.deptService.updateDept(dept.id, name).subscribe((resData: any) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
      } else {
        dept.name = name;
        this.messageService.showToastMessage('操作成功', 'success');
        this.toggleMainPage();
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public editOrAddSubmit() {
    if (this.addOrEditName.length === 0) {
      this.messageService.showToastMessage('请输入部门名称', 'warning');
      return;
    }
    if (this.tabPageType === TabPageType.EditPage) {
      this.updateDept(this.targetDept, this.addOrEditName);
    } else if (this.tabPageType === TabPageType.AddPage) {
      this.addDept(this.addOrEditName, this.targetDept);
    } else {
      return;
    }
  }

  public addOrEditDept(type: number, target?: DeptServiceNs.DeptItemModel) {
    this.targetDept = target;
    this.tabPageType = type;
    if (type === TabPageType.EditPage) {
      this.addOrEditName = target.name;
    }
  }

  ngOnInit() {
    this.getDepts();
  }

}
