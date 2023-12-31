import { Point, Shape } from './math.ts';
import * as d3 from 'd3';
import { CoverDrawer } from './cover_drawer.ts';
import { centralizePoints, circlePoints, getFnSamples } from './math.ts';

const legendKm2Based = (km2: number, shapeAreaPx: number, areaKm: number) => {
  const baseKm = shapeAreaPx / areaKm; // px2/km2
  const areaPx = baseKm * km2;
  const radiusPx = Math.sqrt(areaPx / Math.PI);

  return { r: radiusPx, km: km2 };
}

const legendPxBased = (px: number, shapeAreaPx: number, areaKm: number) => {
  let base = areaKm / shapeAreaPx; // km2/px2
  let areaPx = Math.PI * (px * px);
  let shapeAreaKm = Math.round(base * areaPx);
  return { r: px, km: shapeAreaKm };
}

type SvgContainerArgs = {
  svgWidth: number,
  svgHeight: number,
  drawer: CoverDrawer,
  records: { value: number, simplified: number }[]
}

export const svgContainer = (s: SvgContainerArgs) => {
  const { svgWidth, svgHeight, drawer, records } = s;
  const svg = d3.selectAll('#svgbox');

  const line = d3.line()
    .x(d => d[0])
    .y(d => d[1]);

  const t = d3.transition()
    .duration(250)
    .ease(d3.easeSinOut);

  svg.selectAll('g#blob')
    .selectAll('path')
    .data(drawer.shapes)
    .join('path')
      // .attr('filter', (_s, i) => `drop-shadow(1px 1px 1px ${d3.interpolateYlGn((records[i].simplified) + 0.2)})`)
      .transition(t)
      .attr('d', line)
      .attr('fill', (_s, i) => d3.interpolateYlGn((records[i].simplified)));
  
  const legend = legendKm2Based(100000, drawer.areas[0], records[0].value);

  const legendGroup = svg.selectAll('g#legend');
  legendGroup.selectAll('circle')
    .data([legend])
    .join('circle')
    .attr('r', x => x.r)
    .attr('fill', d3.interpolateYlGn(1.0));

  legendGroup.selectAll('text')
    .data([legend])
    .join('text')
    .attr('transform', x => `translate(${x.r + 5}, 5)`)
    .html((x) => `${x.km} km²`)
}

export const randPointGenerator2 = () => {
  let a_var = Math.random() * 100;
  let b_var = Math.random() * 100;
  let c_var = Math.random() * 10;

  return (a: number) => {
   return Math.sin(a);
  };
}

// draws a vertically centered lined chart
export const drawChart = (g: d3.Selection<SVGGElement, any, HTMLElement, any>, width: number, height: number, samples: Point[]) => {
  const x = d3.scaleLinear([0, 2 * Math.PI], [0, width]);
  const y = d3.scaleLinear([-2, 2], [height, 0]);
  g.append("g")
    // .attr("transform", `translate(0,500)`)
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("transform", `translate(0, ${-height / 2})`)
    .call(d3.axisLeft(y));

  const line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1]))(samples);

  g.append('path')
    .attr("transform", `translate(0, ${-height / 2})`)
    .attr('d', line)
    .attr('stroke', 'black')
    .attr('fill', 'none');
}

export const drawDebugChart = () => {
  let fn = randPointGenerator2();

  let points = centralizePoints(circlePoints(fn, 100));
  let circle = circlePoints(() => 1, 100);
  const line = d3.line()
    .x(d => d[0])
    .y(d => d[1]);
  const svg = d3.selectAll('#svgbox');
  svg.selectAll('g#blob')
    .selectAll('path')
    .data([points, circle])
    .join('path')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', (_, i) => i == 0 ? 'black' : 'red')
      .attr('stroke-dasharray', (_, i) => i == 0 ? 'none' : '4,4');


  let lastChart = document.querySelector('g#chart');
  if (lastChart != null) {
    lastChart.remove();
  }

  let g = svg.append('g').attr('id', 'chart').attr('transform', `translate(50, 700)`);
  let pts = getFnSamples(fn)
  drawChart(g, 500, 400, pts) 
}
