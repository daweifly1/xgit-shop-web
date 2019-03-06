/**
 * 转换文本中的空格和换行，以供textarea使用*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceChange'
})
export class SpaceChangePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value || typeof value !== 'string') {
      return value;
    }
    return value.replace(/(&emsp;)|(&nbsp;)/g, ' ').replace(/<br\/?>/, '\n');
  }

}
