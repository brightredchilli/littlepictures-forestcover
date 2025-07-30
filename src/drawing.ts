import { Point, Shape } from './math.ts';
import * as d3 from 'd3';

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
    .attr('stroke', 'red')
    .attr('fill', 'none');
}

export const circlePoints = (fn: PointGenerator, radius: number): Shape => {
  const step = (2 * Math.PI) / 1000;

  let pts: Point[] = [];
  for (let theta = 0; theta < 2 * Math.PI; theta += step) {
    const r = radius + fn(theta) * (radius / 2);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    pts.push([x, y]);
  }
  return pts;
}


export type PointGenerator = (a:number) => number;

export const randPointGenerator:() => PointGenerator = () => {
  let a_var = Math.random() * 100;
  let b_var = Math.random() * 100;
  let c_var = Math.random();

  return (a: number) => {
  return Math.sin(a_var + a) + 
    2 + Math.cos(b_var + a) + 
    Math.sin(Math.sin(a) + c_var);
  };
}
