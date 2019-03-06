import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeReform',
  pure: true // 如果你的管道不受外界影响，只受参数的影响请遵守FP原则，设置为纯管道
})
export class TypeReformPipe implements PipeTransform {

  transform(value: number, args?: any): string {
    switch (value) {
      case 1: return '材设新闻';
      case 2: return '采购文化';
      case 3: return '政策法规';
      case 4: return '图文欣赏';
      case 5: return '公告';
      case 6: return '废旧物资信息公示';
      case 7: return '轮播图';
      case 8: return '江铜采购指数';
      case 9: return '公司动态';
      case 10: return '招标公告';
      case 11: return '中标公示';
      case 12: return '优秀供应商';
      case 13: return '帮助中心';
      case 14: return '导航轮播图';
      default: return '材设新闻';
    }
  }

}
