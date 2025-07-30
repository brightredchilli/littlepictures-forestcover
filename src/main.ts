import './main.css'
import * as d3 from 'd3';
import { data, records } from './data';
import { CoverDrawer } from './cover_drawer.ts';
import { download } from './util.ts';
import { Shape } from './math.ts';
import { svgContainer } from './drawing.ts';
import { drawDebugChart } from './drawing.ts';


const svgWidth = 1000;
const svgHeight = 1100;

let bg = d3.color(d3.interpolateYlGn(0.0))!.hex();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="bg-[${bg}] text-slate-800 mx-auto md:w-[800px] aspect-[4/6] flex flex-col">
      <svg id="svgbox" class="max-w-full" viewBox="0 0 ${svgWidth} ${svgHeight}" flex-none>
      <defs>
             <filter id="filter1" x="0" y="0">
                 <feOffset result="offOut" in="SourceAlpha" dx="-2" dy="-2" />
                 <feGaussianBlur result="blurOut" in="offOut" stdDeviation="1" />
                 <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
          </filter>
      </defs>
        <rect width="${svgWidth}" height="${svgHeight}" style="fill:#D0CBBE;" />

        <g id="blob" transform="translate(${svgWidth/2}, ${svgHeight/2})"></g>
        <g id="legend" transform="translate(${svgWidth - 150}, ${svgHeight - 50})"></g>
      </svg>

      <div class="bg-[#F1EEE0] text-slate-800 grow pl-8 pb-10">
      <h1 class="text-5xl font-bold pt-8">
      global forest cover loss
      </h1>

      <h2 class="text-2xl font-semibold pt-2">
      1992-2015
      </h2>

      <p class="font-semibold pt-1">
      Shows the total loss in global forest cover from 1992 to 2015. The size and color of
      the areas represent the area of global forest cover for each year.
      </p>
      </div>
  </div>
`
import shapes from './shapes.json'
let drawer: CoverDrawer;

const draw = (load_from_file: boolean = true) => {
  if (load_from_file) {
    drawer = new CoverDrawer({ radius: 150, shapes: shapes as Shape[]});
  } else {
    drawer = new CoverDrawer({ radius: 150, data: data});
  }

  try {
    drawer.run();
  }
  catch(e) {
    throw `oops: ${e} ${drawer.index}/${drawer.data.length}`;
  }
  svgContainer({ svgWidth, svgHeight, drawer, records });
}


draw(true);


document.addEventListener('keydown', (e) => {
  if (e.key == ' ') {
    draw(false);
  } else if (e.key == 'k') {
    drawDebugChart();
  } else if (e.key == 'd') {
    let s = JSON.stringify(drawer.shapes);
    download(s, 'shapes.json');
  } else if (e.key == '') {
  }
});
