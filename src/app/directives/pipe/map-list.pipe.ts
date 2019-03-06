/**
 * 转换对象为数组，供ngFor使用*/
import {Pipe, PipeTransform} from '@angular/core';
import * as mapDataSets from '../../../environments/map-data';

export interface MapListData {
  value: number;
  label: string;
}

@Pipe({
  name: 'mapList'
})
export class MapListPipe implements PipeTransform {
  private mapDataSets = mapDataSets;

  transform(type: any, arg?: any): MapListData[] {
    const mapList: MapListData[] = [];
    Object.keys(this.mapDataSets[type]).forEach((item) => {
      mapList.push({
        value: Number(item),
        label: this.mapDataSets[type][item]
      });
    });
    return mapList;
  }

}
