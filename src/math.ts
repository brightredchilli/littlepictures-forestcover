import { polygonHull as d3PolygonHull, ticks as d3Ticks, zip, polygonCentroid, polygonArea } from 'd3';

export type Point = [number, number];
export type Shape = Point[];

export const polygonHull = (arr: Point[]) => {
  let h = d3PolygonHull(arr)!;
  h.push(h[0]);
  return h;
}

export const distance = (a: Point, b: Point) => {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};

export const getFnSamples = (fn: (a:number) => number) => {
  const numSamples = 1000;
  const samplexs = d3Ticks(0, 2 * Math.PI, numSamples);
  const sampleys = samplexs.map(fn);
  const data = zip(samplexs, sampleys) as Point[];
  return data;
}

const randPoint = (a: number, b: number): [number, number] => {
  return [Math.random() * a, Math.random() * b];
}

export const centralizePoints = (pts: Point[]): Point[] => {
  let [centerX, centerY] = polygonCentroid(pts);
  return pts.map(p => [p[0] - centerX, p[1] - centerY]);
}

export const cartesianToPolar = (pts: Point[]): Point[] => {
  // let t = Math.atan2(p[0], p[1]);
  return pts.map(p => [Math.sqrt(Math.pow(p[0],2) + Math.pow(p[1], 2)), Math.atan2(p[1], p[0])]);
}

export const polarToCartesian = (pts: Point[]): Point[] => {
  // let t = Math.atan2(p[0], p[1]);
  return pts.map(p => [p[0] * Math.cos(p[1]), p[0] * Math.sin(p[1])]);
}

export const averageShapes = (a: Shape, b: Shape): Shape => {
  // take advantage of the knowledge that these shapes are based from 0.
  // if we take the polar coordinates, we can lerp between the radii
  //
  let polarA = cartesianToPolar(a);
  let polarB = cartesianToPolar(b);

  let polarAvg: Shape = zip(polarA, polarB).map((a) => [(a[0][0] + a[1][0]) / 2, a[0][1]]);

  return polarToCartesian(polarAvg);
}

export const area = (a: Shape) => {
  return Math.abs(polygonArea(a));
}
