import { Injectable, Injector } from '@angular/core';
import { DatePipe } from '@angular/common';


export namespace UfastUtilServiceNs {
  export class UfastUtilServiceClass {
    private localStorge: any;
    private datePipe: DatePipe;
    constructor(injector: Injector) {
      this.localStorge = window.localStorage;
      this.datePipe = new DatePipe('en-US');
    }

    /**
     * @formatDate:格式化日期
     * @value:需要格式化的时间戳或日期
     * @type:格式化的类型（同angular内置日期管道）
     * **/
    public formatDate(value: any, type: string) {
      return this.datePipe.transform(value, type);
    }
    // 除法
    public div(arg1, arg2): number {
      let t1 = 0, t2 = 0, r1, r2;
      try {
        t1 = arg1.toString().split('.')[1].length;
      } catch (e) {
      }
      try {
        t2 = arg2.toString().split('.')[1].length;
      } catch (e) {
      }

      r1 = Number((arg1 + '').replace('.', ''));
      r2 = Number((arg2 + '').replace('.', ''));
      return this.mul((r1 / r2), Math.pow(10, t2 - t1));

    }

    // 乘法
    public mul(arg1, arg2): number {
      let m = 0;
      const s1 = arg1.toString(), s2 = arg2.toString();
      try {
        m += s1.split('.')[1].length;
      } catch (e) {
      }
      try {
        m += s2.split('.')[1].length;
      } catch (e) {
      }
      return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
    }

    // 加法
    public add(arg1, arg2): number {
      let r1, r2, m;
      try {
        r1 = arg1.toString().split('.')[1].length;
      } catch (e) {
        r1 = 0;
      }
      try {
        r2 = arg2.toString().split('.')[1].length;
      } catch (e) {
        r2 = 0;
      }
      m = Math.pow(10, Math.max(r1, r2));
      return (this.mul(arg1, m) + this.mul(arg2, m)) / m;
    }

    // 减法
    public sub(arg1, arg2): number {
      let r1, r2, m, n;
      try {
        r1 = arg1.toString().split('.')[1].length;
      } catch (e) {
        r1 = 0;
      }
      try {
        r2 = arg2.toString().split('.')[1].length;
      } catch (e) {
        r2 = 0;
      }
      m = Math.pow(10, Math.max(r1, r2));
      n = (r1 >= r2) ? r1 : r2;
      return parseFloat(((this.mul(arg1, m) - this.mul(arg2, m)) / m).toFixed(n));
    }
    /**
     * @getStartDate:获取开始日期（某一天的00：00：00）
     * @dateValue:标准格式的日期字符串或时间戳
     * @返回值：日期对象
     * **/
    public getStartDate(dateValue: string | number): Date {
      if (!dateValue) {
        return <any>dateValue;
      }
      const date = new Date(<any>dateValue);
      const millSec = date.getTime() - date.getHours() * 3600 * 1000 -
        date.getMinutes() * 60 * 1000 - date.getSeconds() * 1000 - date.getMilliseconds();
      return new Date(millSec);
    }
    /**
     * @getEndDate:获取开始日期（某一天的最后1毫秒）
     * @dateValue:标准格式的日期字符串或时间戳
     * @返回值：日期对象
     * **/
    public getEndDate(dateValue: string | number): Date {
      if (!dateValue) {
        return <any>dateValue;
      }
     const time = this.getStartDate(dateValue).getTime() + 24 * 3600 * 1000 - 1;
     return new Date(time);
    }
    /**
     * localStorge接口封装
     * **/

    /**
     * 存储数据
     * @key:键
     * @data:任意类型的值
     * **/
    public setLocalData(key: string, data: any): void {
      this.localStorge.setItem(key, JSON.stringify(data));
    }
    /**
     * 获取数据
     * @key：键
     * @返回值：获取的数据
     * **/
    public getLocalData(key: string) {
      return JSON.parse(this.localStorge.getItem(key));
    }
    /**
     * 删除指定key对应的数据
     * **/
    public removeLocalData(key: string) {
      this.localStorge.removeItem(key);
    }
    /**
     * 清空本地存储
     * **/
    public clearLocalData(): void {
      this.localStorge.clear();
    }
    /**
     * 拆分
     * @total:总数量
     * @splitNum: 拆分份数
     * @precision: 分辨率
     * @return:
     *      avg: 平均数
     *      remain:  余数
     *      maxSplitNum: 最大可拆分数量
     * */
    public splitNumber(total: number, splitNum: number, precision: number): {avg: number; remain: number; maxSplitNum: number } {
      let tempTotal = total;
      const times = this.div(1, precision);
      if (splitNum > total) {
        tempTotal = this.mul(tempTotal, times);
      }
      const intTotal = Math.floor(tempTotal);
      let remain = this.add(this.sub(tempTotal, intTotal), intTotal % splitNum);
      let avg = this.div(this.sub(tempTotal, remain), splitNum);

      if (splitNum > total) {
        remain = this.div(remain, times);
        avg = this.div(avg, times);
      }
      return {
        avg: avg,
        remain: remain,
        maxSplitNum: this.div(total, precision)
      };
    }
  }
}


@Injectable()
export class UfastUtilService extends UfastUtilServiceNs.UfastUtilServiceClass {

  constructor(injector: Injector) {
    super(injector);
  }

}
