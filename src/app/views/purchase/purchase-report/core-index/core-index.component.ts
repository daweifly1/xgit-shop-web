import { Component, OnInit } from '@angular/core';
import { CoreIndexService } from './../../../../core/trans/purchase/core-index.service';
import { graphic, echarts, numeral } from 'echarts';
import { BrowserTransferStateModule } from '@angular/platform-browser';
enum TabEnum {
  Purchase,
  Material,
  Spare
}
@Component({
  selector: 'app-core-index',
  templateUrl: './core-index.component.html',
  styleUrls: ['./core-index.component.scss']
})
export class CoreIndexComponent implements OnInit {
  tabIndex: number; // 差异趋势索引
  PurchaseTabEnum = TabEnum;
  purchaseOptions: any; // 采购差异趋势
  materialPurchaseOptions: any; // 材料采购差异趋势
  sparePurchaseOptions: any; // 备件采购差异趋势
  barOptions: any; // 条形统计图
  stockFinanceOptions: any; // 合计库存金额
  materialStockFinanceOptions: any; // 合计库存金额
  spareStockFinanceOptions: any; // 合计库存金额
  completionRateOptions: any; // 计划完成度
  contractQuantityOptions: any; // 合同数量
  settlementAmountOptions: any; // 结算数量
  pieOptions: any; // 饼图
  constructor(private coreIndexService: CoreIndexService) {
    this.tabIndex = 0;
  }
  public getOptions() {
    const dataAxis = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const data = [2200, 1820, 1910, 2340, 2900, 3300, 3100, 1230, 4420, 3210, 900, 1490];
    const yMax = 5000;
    const dataShadow = [];
    for (let i = 0; i < data.length; i++) {
      dataShadow.push(yMax);
    }
    /**条折混合 */
    this.purchaseOptions = {
      title: {
        text: '采购差异趋势图',
        color: '#999',
        x: 'center',
        y: 'top',
        textAlign: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          // dataView: { show: true, readOnly: false }, // 数据视图
          // magicType: { show: true, type: ['line', 'bar'] },   // 折线条形图切换
          // restore: { show: true },   // 刷新
          // saveAsImage: { show: true } // 保存为图
        }
      },
      calculable: true,
      legend: {
        data: ['材料', '备件', '总累计'],
        top: 'bottom'
      },
      xAxis: [
        {
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '单位：万元',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '材料',
          type: 'bar',
          stack: '差异',
          itemStyle: {
            normal: {
              color: '#00A6ED'
            }
          },
          data: [ 2243.27, 2621.53, 2082.62, 2543.90, 2526.45, 2382.26, 2570.34, 3143.82, 3073.92, 3870.40, 3370.82, 3727.91]
        },
        {
          name: '备件',
          type: 'bar',
          stack: '差异',
          itemStyle: {
            normal: {
              color: '#F6511D'
            }
          },
          data: [280.03, 156.35, 116.41, 269.50, 229.20, 331.27, 341.21, 369.15, 361.57, 735.99, 506.00, 1091.82]
        },
        {
          name: '总累计',
          type: 'line',
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#B3D469'
            }
          },
          data: [2523.30, 5301.18, 7500.21, 10313.61, 13069.26, 15782.79, 18694.34, 22207.31, 25642.80, 30249.19, 34126.01, 38945.74]
        }
      ]
    };
    this.materialPurchaseOptions = {
      title: {
        text: '材料采购差异趋势图',
        color: '#999',
        x: 'center',
        y: 'top',
        textAlign: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          // dataView: { show: true, readOnly: false },
          // magicType: { show: true, type: ['line', 'bar'] },
          // restore: { show: true },
          // saveAsImage: { show: true }
        }
      },
      calculable: true,
      legend: {
        data: ['材料',  '材料累计'],
        top: 'bottom'
      },
      xAxis: [
        {
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '单位: 万元',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '材料',
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#00A6ED'
            }
          },
          data: [ 2243.27, 2621.53, 2082.62, 2543.90, 2526.45, 2382.26, 2570.34, 3143.82, 3073.92, 3870.40, 3370.82, 3727.91]
        },
        {
          name: '材料累计',
          type: 'line',
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#F6511D'
            }
          },
          data: [2243.27, 4864.80, 6947.42, 9491.32, 12017.77, 14400.03, 16970.37, 20114.19, 23188.11, 27058.51, 30429.33, 34157.23]
        }
      ]
    };
    this.sparePurchaseOptions = {
      title: {
        text: '备件差异趋势图',
        color: '#999',
        x: 'center',
        y: 'top',
        textAlign: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          // dataView: { show: true, readOnly: false },
          // magicType: { show: true, type: ['line', 'bar'] },
          // restore: { show: true },
          // saveAsImage: { show: true }
        }
      },
      calculable: true,
      legend: {
        data: ['备件',  '备件累计'],
        top: 'bottom'
      },
      xAxis: [
        {
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '单位: 万元',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '备件',
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#00A6ED'
            }
          },
          data: [280.03, 156.35, 116.41, 269.50, 229.20, 331.27, 341.21, 369.15, 361.57, 735.99, 506.00, 1091.82]
        },
        {
          name: '备件累计',
          type: 'line',
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#F6511D'
            }
          },
          data: [280.03, 436.38, 552.79, 822.30, 1051.49, 1382.76, 1723.97, 2093.12, 2454.69, 3190.68, 3696.69, 4788.51]
        }
      ]
    };
    /**折线图 */
    this.stockFinanceOptions = {
      title: {
        text: '合计库存金额图表',
        color: '#999',
        x: 'center',
        y: 'top',
        textAlign: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          // dataView: { show: true, readOnly: false },
          // magicType: { show: true, type: ['line', 'bar'] },
          // restore: { show: true },
          // saveAsImage: { show: true }
        }
      },
      calculable: true,
      legend: {
        data: ['合计',  '目标值'],
        top: 'bottom'
      },
      xAxis: [
        {
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '单位: 亿元',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '合计',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00A6ED'
            }
          },
          data: [ 5.1, 5.1, 5.1, 5.0, 5.0, 5.0, 4.9, 4.8, 4.7, 4.6, 4.6, 4.7]
        },
        {
          name: '目标值',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#F6511D'
            }
          },
          data: [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0]
        }
      ]
    };
    this.materialStockFinanceOptions = {
      title: {
        text: '材料库存金额图表',
        color: '#999',
        x: 'center',
        y: 'top',
        textAlign: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          // dataView: { show: true, readOnly: false },
          // magicType: { show: true, type: ['line', 'bar'] },
          // restore: { show: true },
          // saveAsImage: { show: true }
        }
      },
      calculable: true,
      legend: {
        data: ['材料',  '目标值'],
        top: 'bottom'
      },
      xAxis: [
        {
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '单位: 亿元',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '材料',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00A6ED'
            }
          },
          data: [ 1.3, 1.2, 1.2, 1.1, 1.0, 0.9, 0.9, 0.9, 0.9, 0.8, 0.9, 0.9]
        },
        {
          name: '目标值',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#F6511D'
            }
          },
          data: [1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1]
        }
      ]
    };
    this.spareStockFinanceOptions = {
      title: {
        text: '备件库存金额图表',
        color: '#999',
        x: 'center',
        y: 'top',
        textAlign: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          // dataView: { show: true, readOnly: false },
          // magicType: { show: true, type: ['line', 'bar'] },
          // restore: { show: true },
          // saveAsImage: { show: true }
        }
      },
      calculable: true,
      legend: {
        data: ['备件',  '目标值'],
        top: 'bottom'
      },
      xAxis: [
        {
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '单位: 亿元',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '备件',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00A6ED'
            }
          },
          data: [ 3.9, 3.9, 3.9, 3.9, 4.0, 4.0, 4.1, 3.9, 3.8, 3.8, 3.7, 3.8]
        },
        {
          name: '目标值',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#F6511D'
            }
          },
          data: [3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8]
        }
      ]
    };
    /**扇形图 */
    this.completionRateOptions = {
      tooltip: {
        trigger: 'item',
        formatter: '{d}%',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['设备', '材料', '备件']
      },
      series: [
        {
          type: 'pie',
          show: true,
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: 25, name: '设备' },
            { value: 25, name: '材料' },
            { value: 50, name: '备件' },
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    this.contractQuantityOptions = {
      tooltip: {
        trigger: 'item',
        formatter: '{d}%',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['设备合同', '设备材料', '设备备件']
      },
      series: [
        {
          type: 'pie',
          show: true,
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: 25, name: '设备合同' },
            { value: 25, name: '设备材料' },
            { value: 50, name: '设备备件' },
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    this.settlementAmountOptions = {
      tooltip: {
        trigger: 'item',
        formatter: '{d}%',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['设备结算', '材料结算', '备件结算']
      },
      series: [
        {
          type: 'pie',
          show: true,
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: 25, name: '设备结算' },
            { value: 25, name: '材料结算' },
            { value: 50, name: '备件结算' },
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    this.pieOptions = this.completionRateOptions;
  }
  public changeTab(index) {
  }
  public completionRate() {
    this.pieOptions = this.completionRateOptions;
  }
  public contractQuantity() {
    this.pieOptions = this.contractQuantityOptions;
  }
  public settlementAmount() {
    this.pieOptions = this.settlementAmountOptions;
  }
  ngOnInit() {
    this.getOptions();
  }

}
