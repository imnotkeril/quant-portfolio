import React from 'react';
import {
  Heatmap as ReactEchartsHeatmap,
  HeatmapSeries
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import ReactECharts from 'echarts-for-react';
import { COLORS } from '../../../constants/colors';

// Register necessary ECharts components
echarts.use([
  GridComponent,
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent,
  LegendComponent,
  ReactEchartsHeatmap,
  CanvasRenderer
]);

export interface HeatmapDataPoint {
  x: number | string;
  y: number | string;
  value: number;
}

interface HeatmapProps {
  data: HeatmapDataPoint[];
  xAxis: (string | number)[];
  yAxis: (string | number)[];
  height?: number;
  width?: string;
  className?: string;
  title?: string;
  colorRange?: string[];
  showLabels?: boolean;
  label?: {
    show?: boolean;
    formatter?: string | ((params: any) => string);
  };
  tooltip?: {
    formatter?: string | ((params: any) => string);
  };
  visualMap?: {
    min?: number;
    max?: number;
    calculable?: boolean;
    orient?: 'horizontal' | 'vertical';
    left?: string | number;
    bottom?: string | number;
    text?: string[];
  };
}

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  xAxis,
  yAxis,
  height = 400,
  width = '100%',
  className,
  title,
  colorRange = [COLORS.NEGATIVE, COLORS.NEUTRAL_GRAY, COLORS.POSITIVE],
  showLabels = true,
  label = {
    show: true,
    formatter: '{c}'
  },
  tooltip = {
    formatter: params => `${params.name} (${params.data[0]}, ${params.data[1]}): ${params.data[2]}`
  },
  visualMap = {
    min: Math.min(...data.map(item => item.value)),
    max: Math.max(...data.map(item => item.value)),
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%'
  }
}) => {
  // Transform data for ECharts
  const echartsData = data.map(item => [
    typeof item.x === 'string' ? xAxis.indexOf(item.x) : item.x,
    typeof item.y === 'string' ? yAxis.indexOf(item.y) : item.y,
    item.value
  ]);

  // ECharts option object
  const option = {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: {
        color: COLORS.TEXT_LIGHT
      }
    } : undefined,
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: tooltip.formatter,
      backgroundColor: COLORS.BACKGROUND,
      borderColor: COLORS.DIVIDER,
      textStyle: {
        color: COLORS.TEXT_LIGHT
      }
    },
    grid: {
      top: title ? 60 : 30,
      bottom: 90,
      left: 60,
      right: 20,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxis,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: COLORS.DIVIDER
        }
      },
      axisLabel: {
        color: COLORS.TEXT_LIGHT
      }
    },
    yAxis: {
      type: 'category',
      data: yAxis,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: COLORS.DIVIDER
        }
      },
      axisLabel: {
        color: COLORS.TEXT_LIGHT
      }
    },
    visualMap: {
      min: visualMap.min,
      max: visualMap.max,
      calculable: visualMap.calculable,
      orient: visualMap.orient,
      left: visualMap.left,
      bottom: visualMap.bottom,
      inRange: {
        color: colorRange
      },
      text: visualMap.text,
      textStyle: {
        color: COLORS.TEXT_LIGHT
      }
    },
    series: [{
      name: 'Heatmap',
      type: 'heatmap',
      data: echartsData,
      label: {
        show: showLabels && label.show,
        formatter: label.formatter,
        color: COLORS.TEXT_LIGHT
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div style={{ height, width }} className={className}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        theme="dark"
      />
    </div>
  );
};

export default Heatmap;