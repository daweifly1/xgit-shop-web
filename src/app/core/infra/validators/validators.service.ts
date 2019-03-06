import {Injectable} from '@angular/core';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {UfastValidatorsRuleService} from './validatorsRule.service';

@Injectable()
export class UfastValidatorsService {
  constructor(private vrService: UfastValidatorsRuleService) {
  }
  /**
   * 密码校验校验
   * **/
  public passwordValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.passwordRule);
  }
  /**
   * 手机号码校验
   * **/
  public mobileValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.mobileRule);
  }
  /**
   * 电话号码校验
   * **/
  public telephoneValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.telephoneRule);
  }
  /**
   * 手机和电话号码校验
   * **/
  public mobileOrTeleValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.mobileOrTelephoneRule);
  }
  /**
   * url校验
   * **/
  public urlValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.urlRule);
  }
  /**
   * 电子邮箱校验
   * **/
  public emailValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.emailRule);
  }
  /**
   * 身份证校验
   * **/
  public idNoValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.idNoRule);
  }
  /**
   * 空格校验
   */
  public blankValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.blankRule);
  }
  /**
  * 汉字
  * */
  public noChineseValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.noChineseRule);
  }
  /**
   * 数字校验
   */
  public onlyNumber(): ValidatorFn {
    return this.commonUtil(this.vrService.onlyNumber);
  }
  private commonUtil(ruleFun: (value: string) => ValidationErrors): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      return ruleFun(control.value);
    };
  }


}
