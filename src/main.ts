import './main.css'
import * as d3 from 'd3';
import { data, records } from './data';

import { Point, polygonHull, getFnSamples, centralizePoints, 
         cartesianToPolar, polarToCartesian, averageShapes } from './math.ts';
import { drawChart, circlePoints, randPointGenerator } from './drawing.ts';
import { CoverDrawer } from './cover_drawer.ts';

const svgWidth = 1000;
const svgHeight = 900;

let bg = d3.color(d3.interpolateYlGn(0.0))!.hex();


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="bg-[${bg}] text-slate-800 mx-auto w-[800px] aspect-[5/6] flex flex-col">
      <svg id="svgbox" class="max-w-full" viewBox="0 0 ${svgWidth} ${svgHeight}" flex-none>
        <rect width="${svgWidth}" height="${svgHeight}" style="fill:#D0CBBE;" />
      </svg>

      <div class="bg-[#F1EEE0] text-slate-800 grow pl-8">
      <h1 class="text-5xl font-bold pt-5">
      forest cover loss
      </h1>

      <h2 class="text-2xl font-semibold pt-2">
      1992-2015
      </h1>
      </div>
  </div>
`

let drawer = new CoverDrawer(150, data);
try {
  drawer.run();
}
catch(e) {
  console.log(`oops: ${e} ${drawer.index}/${drawer.data.length}`);
}

const svg = d3.select('#svgbox');



const legendKm2Based = (km2: number) => {
  const baseKm = drawer.areas[0] / records[0].value; // px2/km2
  const areaPx = baseKm * km2;
  const radiusPx = Math.sqrt(areaPx / Math.PI);

  return { r: radiusPx, km: km2 };
}

const legendPxBased = (px: number) => {
  let base = records[0].value / drawer.areas[0]; // km2/px2
  let areaPx = Math.PI * (px * px);
  let areaKm = Math.round(base * areaPx);

  return { r: px, km: areaKm };
}

// const { r, km } = legendPxBased(10);
const { r, km } = legendKm2Based(100000);

let legend = svg.append('g').attr('transform', `translate(${svgWidth - 150}, ${svgHeight - 50})`);
legend.append('circle')
  .attr('r', r)
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('fill', d3.interpolateYlGn(1.0));

legend.append('text')
  .html(`${km} km²`)
  .attr('transform', `translate(${r + 5}, 5)`)
  .attr('fill', d3.interpolateYlGn(1.0))
  .classed('text-l', true);
  // .attr('fill', d3.interpolateYlGn(1.0));


const g = svg.append('g').attr('transform', `translate(${svgWidth/2}, ${svgHeight/2})`);

const line = d3.line()
  .x(d => d[0])
  .y(d => d[1]);

drawer.shapes.forEach((s, i) => {
  // let c = d3.interpolateYlGn(data[i] * (100/80));
  let c = d3.interpolateYlGn(Math.pow(data[i] * (100/80), 2));
  g.append('path')
    .attr('d', line(s))
    .attr('fill', c);
});

document.addEventListener('keydown', (e) => {
  if (e.key == ' ') {
  } else if (e.key == 'k') {
  }
});
