import {Injectable} from '@angular/core';
import {ValidationErrors} from '@angular/forms';

@Injectable()
export class UfastValidatorsRuleService {

  private Wi: number[];
  private ValideCode: number[];

  constructor() {
    this.Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
    this.ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  }

  public passwordRule(value: string): ValidationErrors {

    if (!value) {
      return null;
    }

    const regTure = /^[^\s]{6,20}$/;
    const regFalse = /^\d+$/;

    return regTure.test(value) && !regFalse.test(value) ? null : {message: '密码由6到20位大小写字母、数字或其他字符组成'};

  }

  public mobileRule(value: string): ValidationErrors {
    if (!value) {
      return null;
    }

    const phoneReg: any = /^1\d{10}$/;
    return phoneReg.test(value) ? null : {message: '请输入正确的手机号'};
  }

  public telephoneRule(value: string): ValidationErrors {
    if (!value) {
      return null;
    }

    const telephoneReg: RegExp = /^(0\d{2,3}-?)?\d{7,8}$/;
    return telephoneReg.test(value) ? null : {message: '请输入正确的电话号码'};
  }
  public mobileOrTelephoneRule(value: string): ValidationErrors {
    if (!value) {
      return null;
    }
    const phoneReg: any = /^1\d{10}$/;
    const telephoneReg: RegExp = /^(0\d{2,3}-?)?\d{7,8}$/;

    if (phoneReg.test(value)) {
      return null;
    }
    if (telephoneReg.test(value)) {
      return null;
    }
    return {message: '请输入正确的联系方式'};
  }
  public emailRule(value: string): ValidationErrors {
    if (!value) {
      return null;
    }

    const emailReg: RegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return emailReg.test(value) ? null : {message: '请输入正确的邮箱地址'};
  }

  public urlRule(value: string): ValidationErrors {
    if (!value) {
      return null;
    }

    const urlReg: RegExp = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_#-](\?)?)*)*$/i;
    return urlReg.test(value) ? null : {message: '请输入正确的网址'};
  }
  /**
   * 不能输入汉字*/
  public noChineseRule(value: string): ValidationErrors {
      if (!value) {
        return null;
      }
      const reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
      return (reg.test(value)) ? { isIncludesChinese: true } : null;
  }
  public blankRule(value: string): ValidationErrors {
    if (!value) {
      return null;
    }

    return value.indexOf(' ') === -1 ? null : {message: '不能输入空格'};
  }
  /**
   * 只能输数字
   */
  public onlyNumber(value: string): ValidationErrors {
    if (!value) {
      return null;
    }
    const reg = /^[0-9]*$/;
    return (reg.test(value)) ? null : {meseage: '只能输入数字'};
  }

  idNoRule = (value: string): ValidationErrors => {
    if (!value) {
      return null;
    }
    value += '';
    const res = {
      message: '请输入正确的身份证号码'
    };
    if (value.length === 15) {
      // 进行15位身份证的验证
      return this.isValidityBrithBy15IdCard(value) ? null : res;
    } else if (value.length === 18) {
      const a_idCard = value.split(''); // 得到身份证数组
      // 进行18位身份证的基本验证和第18位的验证
      return (this.isValidityBrithBy18IdCard(value) && this.isTrueValidateCodeBy18IdCard(a_idCard)) ? null : res;
    } else {
      return res;
    }

  }

  private isTrueValidateCodeBy18IdCard(a_idCard) {
    let sum = 0; // 声明加权求和变量
    if (a_idCard[17].toLowerCase() === 'x') {
      a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
    }
    for (let i = 0; i < 17; i++) {
      sum += this.Wi[i] * a_idCard[i]; // 加权求和
    }
    const valCodePosition = sum % 11; // 得到验证码所位置
    return a_idCard[17] + '' === this.ValideCode[valCodePosition] + '';
  }

  private isValidityBrithBy18IdCard(idCard18) {
    const year = idCard18.substring(6, 10);
    const month = idCard18.substring(10, 12);
    const day = idCard18.substring(12, 14);
    const temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 这里用getFullYear()获取年份，避免千年虫问题
    return !(temp_date.getFullYear() !== parseFloat(year) || temp_date.getMonth() !== parseFloat(month) - 1 ||
      temp_date.getDate() !== parseFloat(day));
  }

  private isValidityBrithBy15IdCard(idCard15) {
    const pattern = /^\d{15}$/;
    return pattern.test(idCard15);
  }

}
