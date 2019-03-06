import {Component, OnInit} from '@angular/core';
import {AuthService, AuthServiceNs} from '../../../core/common-services/auth.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';

enum TabPageType {
  ManagePage = 0,
  AddPage,
  EditPage
}

interface TypeItem {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  tabPageType: TabPageType;
  topNode: AuthServiceNs.SysAuthsItemModel;
  authDataList: AuthServiceNs.SysAuthsItemModel[];
  loading: boolean;
  targetAuth: AuthServiceNs.SysAuthsItemModel;
  parentAuth: AuthServiceNs.SysAuthsItemModel;
  addOrEditName: string;
  show = true;
  authType: TypeItem[] = [{id: 1, name: '菜单', selected: false}, {id: 2, name: '按钮', selected: false}];

  constructor(private authService: AuthService, private messageService: ShowMessageService) {
    this.tabPageType = TabPageType.ManagePage;
    this.loading = false;
    this.authDataList = [];
    this.addOrEditName = '';
  }

  ngOnInit() {
    this.getTreeList();
  }

  public trackById(index: number, item: any) {
    return item.id;
  }

  public getTreeList(auth?: AuthServiceNs.SysAuthsItemModel) {
    const id = auth ? auth.id + '' : '';
    this.loading = true;
    this.authService.getAuthList(id).subscribe((resData: AuthServiceNs.UfastHttpAnyResModel) => {
      this.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      if (auth) {
        auth.children = resData.value;
        auth.expand = true;
      } else {
        this.authDataList = resData.value;
        this.topNode = {};
        this.topNode.id = 0;
        this.topNode.children = [];
        this.topNode.children.concat(this.authDataList);
      }
    }, (error: any) => {
      this.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public expandAuth(auth: AuthServiceNs.SysAuthsItemModel) {
    if (auth.expand) {
      auth.expand = false;
    } else if (auth.children) {
      auth.expand = !auth.expand;
    } else {
      this.getTreeList(auth);
    }
  }

  public addOrEditAuth(type: number, target?: AuthServiceNs.SysAuthsItemModel | any) {
    if (!target) {
      target = {id: 0};
    }
    this.parentAuth = target;
    if (type === 1) {
      if (!this.targetAuth) {
        this.targetAuth = {};
      }
      // 添加下级
      this.targetAuth.id = null;
      this.targetAuth.type = 1;
      this.targetAuth.name = '';
      this.targetAuth.url = '';
      this.targetAuth.parentId = target.id;
    } else {
      this.targetAuth = target;
    }

    this.authType.forEach((item: TypeItem) => {
      if (item.id === this.targetAuth.type) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    this.tabPageType = type;
    console.log(this.targetAuth);
  }

  public deleteAuth(item: AuthServiceNs.SysAuthsItemModel, parent?: AuthServiceNs.SysAuthsItemModel) {
    this.messageService.showAlertMessage('', `您确定要删除${item.name}`, 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.authService.removeAuth(item.id).subscribe((resData: any) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          const list = parent ? parent.children : this.authDataList;
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

  public saveSubmit() {
    let isAdd = true;
    if (this.targetAuth.id) {
      isAdd = false;
    }
    this.authService.saveAuth(this.targetAuth).subscribe((resData: any) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
      } else {
        this.messageService.showToastMessage('操作成功', 'success');
        if (isAdd) {
          if (undefined === this.parentAuth.children) {
            this.parentAuth.children = [];
          }
          this.parentAuth.children.push(this.targetAuth);

          console.log(this.topNode);
        }
        this.toggleMainPage();
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public toggleMainPage() {
    this.tabPageType = TabPageType.ManagePage;
    this.addOrEditName = '';
    this.getTreeList();
  }

  public compareFn(c1: number, c2: number): boolean {
    return c1 && c2 ? c1 === c2 : false;
  }
}
