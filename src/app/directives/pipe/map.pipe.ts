/**
 * 表格组件使用的公共管道
 * */
import {Pipe, PipeTransform} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import * as mapDataSets from '../../../environments/map-data';

@Pipe({
  name: 'map'
})
export class MapPipe implements PipeTransform {
  private datePipe: DatePipe = new DatePipe('en-US');
  private currencyPipe: CurrencyPipe = new CurrencyPipe('zh-Hans');
  private mapObj = mapDataSets;

  transform(value: any, arg?: any): any {
    if (arg === undefined) {
      return value;
    }
    let type: string = arg;
    let param = '';

    if (arg.indexOf(':') !== -1) {
      type = arg.substring(0, arg.indexOf(':'));
      param = arg.substring(arg.indexOf(':') + 1, arg.length);
    }

    switch (type) {
      case 'date':
        return this.datePipe.transform(value, param);
      case 'currency':
        return this.currencyPipe.transform(value, param);
      default:
        return this.mapObj[type][value];
    }
  }

}
