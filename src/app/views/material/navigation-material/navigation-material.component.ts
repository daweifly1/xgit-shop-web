import { Component, OnInit } from '@angular/core';
import { NavigationServiceNs, NavigationService } from '../../../core/trans/navigation.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { UploadFile } from 'ng-zorro-antd';
import {environment} from '../../../../environments/environment';

export enum TabPageType {
  MainPage = 0,
  AddPage,
  EditPage,
}

@Component({
  selector: 'app-navigation-material',
  templateUrl: './navigation-material.component.html',
  styleUrls: ['./navigation-material.component.scss']
})
export class NavigationMaterialComponent implements OnInit {
  tabPageType: TabPageType;
  navigationDataList: NavigationServiceNs.NavigationModel[] = [];
  loading: boolean = false;
  targetNavigation: NavigationServiceNs.NavigationModel;
  addOrEditName: string = '';
  // addOrEditImg: any;
  addUrl: string = '';
  pId: string = '0';
  fileList: any[] = [];
  fileUrl = environment.otherData.fileUrl;
  constructor(private navigationService: NavigationService, private messageService: ShowMessageService) {
    this.tabPageType = TabPageType.MainPage;
  }
  public toggleMainPage() {
    this.tabPageType = TabPageType.MainPage;
    this.addOrEditName = '';
  }

  public trackById(index: number, item: any) {
    return item.id;
  }

  public expandNavigations(navigation: NavigationServiceNs.NavigationModel) {
    this.pId = navigation.id;
    if (navigation.expand) {
      navigation.expand = false;
    }
    else if (navigation.children) {
      navigation.expand = !navigation.expand;
    }
    else {
      this.getNavigations(navigation);
    }
  }

  public getNavigations(navigation?: NavigationServiceNs.NavigationModel) {
    const id = navigation ? this.pId : '0';
    this.loading = true;
    this.navigationService.getNavigationList(id).subscribe((resData: NavigationServiceNs.UfastHttpAnyResModel) => {
      this.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      if (navigation) {
        navigation.children = resData.value;
        navigation.expand = true;
      } else {

        this.navigationDataList = resData.value;
      }
    }, (error: any) => {
      this.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public addNavigation(name: string, parent?: NavigationServiceNs.NavigationModel) {

    const parentId = parent ? parent.id : '0';
    // img = this.addOrEditImg;
    this.navigationService.insertNavigation(parentId, name, this.addUrl).subscribe((resData: any) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      const temp: NavigationServiceNs.NavigationModel = {
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
        this.navigationDataList.push(temp);
      }

      this.toggleMainPage();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
    this.getNavigations();
  }

  public deleteNavigation(item: NavigationServiceNs.NavigationModel, parent?: NavigationServiceNs.NavigationModel) {
    this.messageService.showAlertMessage('', `您确定要删除${parent.children[0].name}吗`, 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.navigationService.removeNavigation(item.id).subscribe((resData: any) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          const list = parent ? parent.children : this.navigationDataList;
          for (let i = 0, len = list.length; i < len; i++) {
            if (list[i].id === item.id) {
              list.splice(i, 1);
              break;
            }
          }
          if (parent.children.length == 0) {
            this.oneLevelMenu();
          }
        }, (error: any) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });

  }

  //当二级菜单为空时，修改此一级菜单的leaf为1
  public oneLevelMenu() {
    this.navigationService.oneLevelMenu(this.targetNavigation.id, 1).subscribe((resData: any) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;

      }
      this.getNavigations();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }

  public updateNavigation(navigation: NavigationServiceNs.NavigationModel, name: string, url?: string) {
    // img = this.addOrEditImg;
    url = this.addUrl;
    this.navigationService.updateNavigation(navigation.id, name, url).subscribe((resData: any) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
      } else {
        navigation.name = name;
        this.messageService.showToastMessage('操作成功', 'success');
        this.toggleMainPage();
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
    this.getNavigations();
  }

  public editOrAddSubmit() {
    if (this.fileList.length <= 1) {
      if (this.addOrEditName.length === 0) {
        return;
      }
      if (this.tabPageType === TabPageType.EditPage) {
        this.updateNavigation(this.targetNavigation, this.addOrEditName, this.addUrl);
      }
      else if (this.tabPageType === TabPageType.AddPage) {
        this.addNavigation(this.addOrEditName, this.targetNavigation);
      }
      else {
        return;
      }
    }
    else {
      this.messageService.showToastMessage('附件数量不能大于1', 'error');
      return;
    }
    this.getNavigations();
  }

  public addOrEditNavigation(type: number, target: NavigationServiceNs.NavigationModel) {
    const tmpFilelist = [];
    this.fileList = tmpFilelist;
    this.targetNavigation = target;
    this.tabPageType = type;
    if (type === TabPageType.EditPage) {
      this.addOrEditName = target.name;
      this.addUrl = target.url;
    }
  }

  removeFile = (file: UploadFile) => {
    this.fileList.length--;
    return true;
  }

  uploadFileChange(event) {
    if (event.file.status === 'removed') {
      if (event.fileList.length === 0) {
        this.fileList = [];
      }
    } else if (event.file.status === 'done' && event.fileList.length > 0) {
      const annexList = [];
      event.fileList.forEach(element => {
        annexList.push({
          name: element.name,
          thumbUrl: this.fileUrl + element.response.value,
        });
      });
      this.fileList = annexList;
      // this.addOrEditImg = this.fileList[0].thumbUrl;
      this.navigationService.insertNavigation(this.pId, this.addOrEditName, this.addUrl);
      this.navigationService.updateNavigation(this.pId, this.addOrEditName, this.addUrl);
    }
  }

  ngOnInit() {
    this.getNavigations();
  }

}
