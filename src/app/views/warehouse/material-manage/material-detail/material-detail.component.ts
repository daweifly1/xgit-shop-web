import { Component, OnInit, AfterContentInit, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MaterialManageServiceNs, MaterialManageService } from '../../../../core/trans/materialManage.service';
import { isTemplateRef } from '../../../../../../node_modules/ng-zorro-antd/src/core/util/check';

interface PageType {
    MainPage: number;
    AddMaterialPage: number;
    ViewLocationPage: number;
    MaterialDetailPage: number;
}
@Component({
    selector: 'app-material-detail',
    templateUrl: './material-detail.component.html',
    styleUrls: ['./material-detail.component.scss']
})
export class MaterialDetailComponent implements OnInit {
    tableConfig: UfastTableNs.TableConfig;
    materialDataList: any;
    @ViewChild('operation') operation: TemplateRef<any>;
    @ViewChild('serialNumber') serialNumber: TemplateRef<any>;
    @Input() materialsId: string;
    @Output() finish: EventEmitter<any>;

    PageType: PageType;
    selectedPage: number;
    showMaterialInformationBar: boolean;
    showStorekeeperBar: boolean;
    constructor(private materialService: MaterialManageService,
        private messageService: ShowMessageService,
        private formBuilder: FormBuilder) {
        this.finish = new EventEmitter();
        this.materialDataList = '';
        this.PageType = {
            MainPage: 0,
            AddMaterialPage: 1,
            ViewLocationPage: 2,
            MaterialDetailPage: 3
        };
        this.selectedPage = this.PageType.MainPage;
        this.showMaterialInformationBar = true;
        this.showStorekeeperBar = true;
    }
    public showMaterialInformation() {
        this.showMaterialInformationBar = !this.showMaterialInformationBar;
    }
    public showStorekeeper() {
        this.showStorekeeperBar = !this.showStorekeeperBar;
    }
    public emitFinish() {
        this.finish.emit();
      }
    public toggleManagePage() {
        this.emitFinish();
    }



    getMaterialDetail = () => {
        this.tableConfig.loading = true;
        this.materialService.getMaterialDetial(this.materialsId).subscribe((resData: MaterialManageServiceNs.UfastHttpAnyResModel) => {
            this.tableConfig.loading = false;
            if (resData.code !== 0) {
                this.messageService.showAlertMessage('', resData.message, 'warning');
                return;
            }
            this.materialDataList = resData.value;
            this.tableConfig.total = resData.value.total;
        }, (error: any) => {
            this.tableConfig.loading = false;
            this.messageService.showAlertMessage('', error.message, 'error');
        });
    }

    ngOnInit() {
        this.tableConfig = {
          pageSize: 10,
          showCheckbox: true,
          showPagination: true,
          pageSizeOptions: [10, 20],
          pageNum: 1,
          total: 0,
          loading: false,
          headers: [{
            title: '操作',
            tdTemplate: this.operation,
            width: 180,
            fixed: true
          }, {
            title: '物料编码',
            tdTemplate: this.serialNumber,
            width: 150,
          }, {
            title: '物料描述',
            field: 'materialsDes',
            width: 150,
          }, {
            title: '物料分类',
            field: 'materialsType',
            width: 150,
          }, {
            title: '基本计量',
            field: 'unit',
            width: 100,
          }, {
            title: '全国统一价',
            field: 'price',
            width: 100,
          }, {
            title: '标准价',
            field: 'standardPrice',
            width: 100,
          }, {
            title: '采购组',
            field: 'purchaseGroup',
            width: 100,
          }, {
            title: '进口件',
            field: 'entranceDevice',
            width: 100,
            pipe: ''
          }, {
            title: '关键件',
            field: 'crucialDevice',
            width: 100,
          }
          ]
        };
        this.getMaterialDetail();
    }

}
