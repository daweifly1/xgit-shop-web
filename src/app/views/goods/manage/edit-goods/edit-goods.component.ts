import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {GoodsService} from '../../../../core/common-services/goods.service';
import {environment} from '../../../../../environments/environment';
import {GoodsAttributeService} from '../../../../core/common-services/goods-attribute.service';
import {DictionaryServiceNs} from '../../../../core/common-services/dictionary.service';
import {UploadFile} from 'ng-zorro-antd';
import {UeditorConfig, UeditorUploadConfig} from '../../../../../environments/ueditorConfig';

enum PageTypeEnum {
  Step1Page,
  Step2Page,
  Step3Page,
}

@Component({
  selector: 'app-edit-goods',
  templateUrl: './edit-goods.component.html',
  styleUrls: ['./edit-goods.component.scss']
})
export class EditGoodsComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input() editData: any;

  paramTypeForm: FormGroup;
  fileList: any[] = [];
  previewImage = '';
  previewVisible = false;
  // 文件服务地址
  fileServiceUrl: string;

  uploadImgUrl: string;

  pageTypeEnum: any;

  // 页面类型
  tabPageType: PageTypeEnum;
  // 属性类型选择列表
  attrCatlist: any[];

  // 可以选的商品属性
  selectGoodsAttr: any[];
  // 可选的商品参数
  selectGoodsParam: any[];
  // 选中的商品属性图片
  selectGoodsAttrPics: any[];
  // 可手动添加的商品属性
  addProductAttrValue: '';

  // 选中的商品属性
  selectedProductAttr: any[];

  uEditorConfig: any;
  uEditorUploadConfig: any;


  constructor(private goodsService: GoodsService, private goodsAttributeService: GoodsAttributeService,
              private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.finish = new EventEmitter();
    this.uploadImgUrl = environment.baseUrl.bs + '/uploading/file';
    this.pageTypeEnum = PageTypeEnum;
    this.selectedProductAttr = [];

    this.uEditorConfig = Object.assign({}, UeditorConfig);
    this.uEditorUploadConfig = Object.assign({}, UeditorUploadConfig);
  }

  ngOnInit() {
    this.paramTypeForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.maxLength(50)]],
      brandId: [null, [Validators.maxLength(10)]],
      goodsCategoryId: [null, [Validators.maxLength(20)]],
      description: [null, [Validators.maxLength(300)]],
      subTitle: [null, [Validators.maxLength(10)]],
      goodsSn: [null, [Validators.maxLength(50)]],
      price: [null, [Validators.maxLength(10)]],
      originalPrice: [null, [Validators.maxLength(10)]],
      stock: [null, [Validators.maxLength(10)]],
      unit: [null, [Validators.maxLength(10)]],
      weight: [null, [Validators.maxLength(20)]],
      sort: [null, [Validators.maxLength(20)]],
      giftGrowth: [null, [Validators.maxLength(10)]],
      giftPoint: [null, [Validators.maxLength(10)]],
      usePointLimit: [null, [Validators.maxLength(50)]],
      previewStatus: [null, [Validators.maxLength(1)]],
      publishStatus: [null, [Validators.maxLength(50)]],
      newStatus: [null, [Validators.maxLength(1)]],
      recommandStatus: [null, [Validators.maxLength(1)]],
      serviceIds: [null, [Validators.maxLength(10)]],
      detailTitle: [null, [Validators.maxLength(50)]],
      detailDesc: [null, [Validators.maxLength(100)]],
      keywords: [null, [Validators.maxLength(50)]],
      note: [null, [Validators.maxLength(200)]],
      goodsAttributeCategoryId: [null, [Validators.maxLength(10)]],
      tmpAdd: [null, [Validators.maxLength(10)]],
      skuCode: [null, [Validators.maxLength(10)]],
      skuPrice: [null, [Validators.maxLength(10)]],
      skuStock: [null, [Validators.maxLength(10)]],
      checkBox: [null, [Validators.maxLength(2)]]

    });

    this.tabPageType = PageTypeEnum.Step1Page;
    if (this.editData) {
      this.paramTypeForm.patchValue(this.editData);
      this.paramTypeForm.addControl('id', this.formBuilder.control(this.editData.id));
    } else {
      this.paramTypeForm.reset();
    }

    this.fileServiceUrl = environment.otherData.fileServiceUrl; // 文件服务器url
    this.fileList = null;
    if (this.editData) {
      this.paramTypeForm.patchValue(this.editData);
      this.paramTypeForm.addControl('id', this.formBuilder.control(this.editData.id));
      const tmpFilelist = [];
      if (this.editData.icon) {
        this.previewImage = this.fileServiceUrl + this.editData.icon;

        tmpFilelist.push({
          uid: 1,
          name: this.editData.icon,
          url: this.fileServiceUrl + this.editData.icon,
          thumbUrl: this.fileServiceUrl + this.editData.icon,
        });
      }
      this.fileList = tmpFilelist;
    } else {
      this.paramTypeForm.reset();
    }

    if (!this.editData.skuStockList) {
      this.editData.skuStockList = [];
    }
  }

  emitFinish() {
    this.paramTypeForm.reset();
    this.finish.emit();
  }


  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }

  saveStep1() {
    this.tabPageType = PageTypeEnum.Step2Page;
  }

  backStep1() {
    this.tabPageType = PageTypeEnum.Step1Page;
  }

  saveStep2() {
    this.goodsAttributeService.getPageList({pageNum: 1, pageSize: 100}).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.attrCatlist = resData.value.list;
      this.tabPageType = PageTypeEnum.Step3Page;
      this.handleGoodsAttrChange();
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  backStep2() {
    this.tabPageType = PageTypeEnum.Step2Page;
  }

  handleGoodsAttrChange() {
    this.getGoodsAttrList(0, this.editData.goodsAttributeCategoryId);
    this.getGoodsAttrList(1, this.editData.goodsAttributeCategoryId);
  }

  private getGoodsAttrList(type: number, value: any) {
    const param = {pageNum: 1, pageSize: 100, filters: {type: type, goodsAttributeCategoryId: value}};
    if (0 === type) {
      this.goodsAttributeService.getAttrPageList(param).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'warning');
            return;
          }
          const list = resData.value.list;

          this.selectGoodsAttr = [];
          for (let i = 0; i < list.length; i++) {
            let options = [];
            let values = [];
            const color = list[i].filterType;
            if (list[i].handAddStatus === 1) {
              // 编辑状态下获取手动添加编辑属性
              options = this.getEditAttrOptions(list[i].id);
            }
            // 编辑状态下获取选中属性
            values = this.getEditAttrValues(i);
            const inputList = [];
            const inputListTmp = list[i].inputList.split(',');
            if (options && options.length > 0) {
              for (let ii = 0; ii < options.length; ii++) {
                inputListTmp.push(options[ii]);
              }
            }
            for (let ii = 0; ii < inputListTmp.length; ii++) {
              let check = false;
              if (values.indexOf(inputListTmp[ii]) > -1) {
                check = true;
              }
              inputList.push(
                {
                  id: inputListTmp[ii],
                  checked: check
                }
              );
            }

            this.selectGoodsAttr.push({
              id: list[i].id,
              name: list[i].name,
              handAddStatus: list[i].handAddStatus,
              inputList: inputList,
              values: values,
              options: options,
              color: color,
              tmpAdd: ''
            });
          }
          // 编辑模式下刷新商品属性图片
          this.refreshProductAttrPics();

        }, (error: any) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        }
      );
    } else {
      this.goodsAttributeService.getParamPageList(param).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'warning');
            return;
          }
          const list = resData.value.list;
          this.selectGoodsParam = [];
          for (let i = 0; i < list.length; i++) {
            const value2 = this.getEditParamValue(list[i].id);
            this.selectGoodsParam.push({
              id: list[i].id,
              name: list[i].name,
              value: value2,
              inputType: list[i].inputType,
              inputList: list[i].inputList
            });
          }

        }, (error: any) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        }
      );
    }
  }

  private getEditAttrOptions(id: any) {
    if (!this.editData.goodsAttributeValueVOList) {
      return [];
    }
    const options = [];
    for (let i = 0; i < this.editData.goodsAttributeValueVOList.length; i++) {
      const attrValue = this.editData.goodsAttributeValueVOList[i];
      if (attrValue.goodsAttributeId === id) {
        const strArr = attrValue.value.split(',');
        for (let j = 0; j < strArr.length; j++) {
          options.push(strArr[j]);
        }
        break;
      }
    }
    return options;
  }

  private getEditAttrValues(index: number) {
    if (!this.editData.skuStockList) {
      return [];
    }
    const values = [];
    if (index === 0) {
      for (let i = 0; i < this.editData.skuStockList.length; i++) {
        const sku = this.editData.skuStockList[i];
        if (sku.sp1 != null && values.indexOf(sku.sp1) === -1) {
          values.push(sku.sp1);
        }
      }
    } else if (index === 1) {
      for (let i = 0; i < this.editData.skuStockList.length; i++) {
        const sku = this.editData.skuStockList[i];
        if (sku.sp2 != null && values.indexOf(sku.sp2) === -1) {
          values.push(sku.sp2);
        }
      }
    } else {
      for (let i = 0; i < this.editData.skuStockList.length; i++) {
        const sku = this.editData.skuStockList[i];
        if (sku.sp3 != null && values.indexOf(sku.sp3) === -1) {
          values.push(sku.sp3);
        }
      }
    }
    return values;
  }

  private refreshProductAttrPics() {
    this.selectGoodsAttrPics = [];
    // 所有颜色属性都可以传图片，sku保存时候根据颜色属性给pic赋值
    if (this.selectGoodsAttr && this.selectGoodsAttr.length >= 1) {
      for (let i = 0; i < this.selectGoodsAttr.length; i++) {
        if (this.selectGoodsAttr[i].color === 1) {
          const values = this.selectGoodsAttr[i].inputList;
          for (let ii = 0; ii < values.length; ii++) {
            const fileList = [];
            let f = true;
            if (this.editData.goodsAttributeImgs && this.editData.goodsAttributeImgs.length) {
              for (let j = 0; j < this.editData.goodsAttributeImgs.length; j++) {
                const color = this.editData.goodsAttributeImgs[j].color;
                if (values[ii].id === color && this.editData.goodsAttributeImgs[j].pic) {
                  fileList.push(
                    {
                      uid: this.editData.goodsAttributeImgs[j].id,
                      name: this.editData.goodsAttributeImgs[j].pic,
                      url: this.fileServiceUrl + this.editData.goodsAttributeImgs[j].pic,
                      thumbUrl: this.fileServiceUrl + this.editData.goodsAttributeImgs[j].pic,
                    }
                  );
                  f = false;
                  this.selectGoodsAttrPics.push({color: values[ii].id, pic: this.editData.goodsAttributeImgs[j].pic, fileList: fileList});
                  break;
                }
              }
            }
            if (f) {
              this.selectGoodsAttrPics.push({color: values[ii].id, pic: null, fileList: []});
            }
          }
          break;
        }
      }
    }
  }


  getEditParamValue(id: any) {
    if (!this.editData.goodsAttributeValueVOList) {
      return null;
    }
    for (let i = 0; i < this.editData.goodsAttributeValueVOList.length; i++) {
      if (id === this.editData.goodsAttributeValueVOList[i].goodsAttributeId) {
        return this.editData.goodsAttributeValueVOList[i].value;
      }
    }
    return null;
  }

  addInputListArr(index: number) {
    if (this.selectGoodsAttr[index].tmpAdd) {
      const add = this.selectGoodsAttr[index].tmpAdd.trim();
      for (let i = 0; i < this.selectGoodsAttr[index].inputList.length; i++) {
        if (this.selectGoodsAttr[index].inputList[i].id === add) {
          return;
        }
      }
      this.selectGoodsAttr[index].inputList.push({
        id: add,
        checked: false
      });
    }
  }

  delSku(i: number) {
    if (this.editData.skuStockList) {
      this.editData.skuStockList.splice(i, 1);
    }
  }

  refreshSkuList() {
    if (this.selectGoodsAttr.length > 3) {
      this.messageService.showAlertMessage('', '不支持3层以上规格', 'error');
    }
    const skuList = [];
    let c = 0;
    if (this.selectGoodsAttr.length === 1) {
      for (let j = 0; j < this.selectGoodsAttr[0].inputList.length; j++) {
        if (this.selectGoodsAttr[0].inputList[j].checked) {
          const skuCode = c;
          skuList.push({
            sp1: this.selectGoodsAttr[0].inputList[j].id,
            skuCode: skuCode,
            price: 0,
            stock: 0,
            lowStock: 0
          });
          c++;
        }
      }
    } else if (this.selectGoodsAttr.length === 2) {
      for (let j = 0; j < this.selectGoodsAttr[0].inputList.length; j++) {
        for (let k = 0; k < this.selectGoodsAttr[1].inputList.length; k++) {
          if (this.selectGoodsAttr[0].inputList[j].checked && this.selectGoodsAttr[1].inputList[k].checked) {
            const skuCode = c;
            skuList.push({
              sp1: this.selectGoodsAttr[0].inputList[j].id,
              sp2: this.selectGoodsAttr[1].inputList[k].id,
              skuCode: skuCode,
              price: 0,
              stock: 0,
              lowStock: 0
            });
            c++;
          }
        }
      }
    } else if (this.selectGoodsAttr.length === 3) {
      for (let j = 0; j < this.selectGoodsAttr[0].inputList.length; j++) {
        for (let k = 0; k < this.selectGoodsAttr[1].inputList.length; k++) {
          for (let m = 0; m < this.selectGoodsAttr[2].inputList.length; m++) {
            if (this.selectGoodsAttr[0].inputList[j].checked && this.selectGoodsAttr[1].inputList[k].checked
              && this.selectGoodsAttr[2].inputList[m].checked) {
              const skuCode = c;
              skuList.push({
                sp1: this.selectGoodsAttr[0].inputList[j].id,
                sp2: this.selectGoodsAttr[1].inputList[k].id,
                sp3: this.selectGoodsAttr[2].inputList[m].id,
                skuCode: skuCode,
                price: 0,
                stock: 0,
                lowStock: 0
              });
              c++;
            }
          }
        }
      }
    }
    this.editData.skuStockList = skuList;
    this.refreshProductAttrPics();
  }

  shareGoodsPriceStocke() {
    if (!this.editData.price) {
      this.messageService.showAlertMessage('', '商品中价格未设置', 'error');
    }
    if (!this.editData.stock) {
      this.messageService.showAlertMessage('', '商品中库存未设置', 'error');
    }
    if (this.editData.skuStockList && this.editData.skuStockList.length > 0) {
      const len = Math.floor(this.editData.skuStockList.length);
      const stock = Math.floor(this.editData.stock / len);
      const m = this.editData.stock % len;

      for (let j = 0; j < this.editData.skuStockList.length; j++) {
        this.editData.skuStockList[j].price = this.editData.price;
        if (j === 0) {
          this.editData.skuStockList[j].stock = Math.floor(stock + m);
        } else {
          this.editData.skuStockList[j].stock = stock;
        }
      }
    }
  }

  submit() {
    this.paramTypeForm.addControl('id', this.formBuilder.control(this.editData.id));
    Object.keys(this.paramTypeForm.controls).forEach((key: string) => {
      this.paramTypeForm.controls[key].markAsDirty();
      this.paramTypeForm.controls[key].updateValueAndValidity();
    });
    if (this.paramTypeForm.invalid) {
      return;
    }
    this.editData.goodsAttributeImgs = this.selectGoodsAttrPics;
    for (let j = 0; j < this.editData.goodsAttributeImgs.length; j++) {
      if (!this.editData.goodsAttributeImgs[j].pic) {
        if (this.editData.goodsAttributeImgs[j].fileList && this.editData.goodsAttributeImgs[j].fileList.length
          && this.editData.goodsAttributeImgs[j].fileList.length > 0) {
          if (this.editData.goodsAttributeImgs[j].fileList[0].response) {
            this.editData.goodsAttributeImgs[j].pic = this.editData.goodsAttributeImgs[j].fileList[0].response.value;
          }
        }
      }
      this.editData.goodsAttributeImgs[j].fileList = null;
    }
    this.editData._this = null;
    let submit = null;
    if (this.paramTypeForm.value) {
      submit = this.goodsService.save(this.editData);
    }
    this.messageService.showLoading();
    submit.subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.emitFinish();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
}
