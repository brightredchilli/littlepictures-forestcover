import { Point, Shape, averageShapes, centralizePoints, area, randPointGenerator, circlePoints } from "./math";

import * as d3 from 'd3';

enum S {
  INITIALIZE,
  NEXT,
  REDUCE_RADIUS,
  GEN_SHAPE,
  EVAL_SHAPE,
  AVG_SHAPE,
  END
}

const MAIN_RUN_COUNT_MAX = 10000;


type CoverDrawerRadiusOption = {
  radius: number
}

type CoverDrawerDataOption =  CoverDrawerRadiusOption & {
  data: number[]
}

type CoverDrawerShapesOption =  CoverDrawerRadiusOption & {
  shapes: Shape[]
}

export class CoverDrawer {
  shapes: Shape[];
  areas: number[];
  currentShape: Shape;
  previousShape: Shape;

  index: number;

  data: number[];

  state: S;

  radius: number;

  baseRatio: number;

  genCount: number;

  debug: boolean;

  constructor(p: CoverDrawerDataOption | CoverDrawerShapesOption) {
    if ('data' in p) {
      this.data = p.data;
    } else {
      this.data = [];
    }
    if ('shapes' in p) {
      this.shapes = p.shapes;
      this.areas = p.shapes.map(s => area(s))
      this.index = p.shapes.length;
      this.state = S.END;
    } else {
      this.shapes = [];
      this.areas = [];
      this.index = 0;
      this.state = S.INITIALIZE;
    }
    this.currentShape = [];
    this.previousShape = [];
    this.radius = p.radius;
    this.baseRatio = 0;
    this.genCount = 0;
    this.debug = false;
  }

  run() {
    let mainCount = 0;
    this.log('started running drawer');
    while (this.state != S.END && mainCount < MAIN_RUN_COUNT_MAX) {
      mainCount++;
      if (this.state == S.INITIALIZE) {
        this.initialize();
      }

      if (this.state == S.NEXT) {
        this.next();
      }

      if (this.state == S.GEN_SHAPE) {
        this.genShape();
      }

      if (this.state == S.EVAL_SHAPE) {
        this.evalShape();
      }

      if (this.state == S.AVG_SHAPE) {
        this.avgShape();
      }

      if (this.state == S.REDUCE_RADIUS) {
        this.reduceRadius();
      }
    }

    if (mainCount == MAIN_RUN_COUNT_MAX) {
      throw 'exceded MAIN_RUN_COUNT_MAX';
    }

    this.log('finished running drawer');
  }

  initialize() {
    this.previousShape = this.generateShape();
    this.currentShape = this.previousShape;
    this.baseRatio = this.data[this.index] / area(this.currentShape);
    this.state = S.EVAL_SHAPE;
  }

  next() {
    this.log('next');
    this.index++;
    this.genCount = 0;
    if (this.index < this.data.length) {
      if (this.data[this.index - 1] < this.data[this.index]) {
        this.previousShape = this.shapes[this.shapes.length - 2];
        this.state = S.GEN_SHAPE;
      } else {
        this.state = S.REDUCE_RADIUS;
      }
    } else {
      this.state = S.END;
    }
  }

  genShape() {
    this.genCount++;
    if (this.genCount < 100) {
      this.currentShape = this.generateShape();
      this.state = S.EVAL_SHAPE;
    } else {
      this.state = S.REDUCE_RADIUS;
    }
    this.log(`genShape ${this.currentRatio()}`);
  }

  evalShape() {
    if (this.previousShapeContainsCurrentShape()) {
      if (this.shapeMeetsTargetRatio()) {
        this.shapes.push(this.currentShape);
        this.previousShape = this.currentShape;
        this.areas.push(area(this.currentShape));
        this.state = S.NEXT;
          this.log('evalShape - next');
      } else {
        if (this.currentRatio() < this.targetRatio()) {
          this.state = S.AVG_SHAPE;
          this.log('evalShape - avgShape');
        } else {
          this.log('evalShape - genShape cur ratio > target ratio');
          this.state = S.GEN_SHAPE;
        }
      }
    } else {
      this.log('evalShape - genShape');
      this.state = S.GEN_SHAPE;
    }
  }

  avgShape() {
    this.log('avgShape');
    let avgCount = 0;
    let high  = this.previousShape;
    let low = this.currentShape;
    let highRatio = area(high) * this.baseRatio;
    let lowRatio = area(low) * this.baseRatio;
    while (!this.shapeMeetsTargetRatio() && avgCount < 1000) {
      this.log(`avgShape - cur=${this.currentRatio()} tar=${this.targetRatio()}, (${lowRatio}, ${highRatio})`);
      if (this.currentRatio() < this.targetRatio()) {
        low = this.currentShape;
        lowRatio = this.currentRatio();
      } else {
        high  = this.currentShape;
        highRatio  = this.currentRatio();
      }
      this.currentShape = averageShapes(high, low);
      avgCount++;
			}

    if (avgCount == 100) {
      this.state = S.GEN_SHAPE;
    } else  {
      this.log(`avgShape - cur=${this.currentRatio()} tar=${this.targetRatio()}`);
      this.state = S.EVAL_SHAPE;
    }
  }

  reduceRadius() {
    this.log('reduceRadius');
    this.radius -= 5;
    if (this.radius < 0) {
      throw 'radius less than 0';
    }
    this.state = S.GEN_SHAPE;
  }

  previousShapeContainsCurrentShape() {
    return true;
    for (let p of this.currentShape) {
      if (!d3.polygonContains(this.previousShape, p)) {
        return false;
      }
    }
    return true;
  }

  generateShape(): Shape {
    let gen = randPointGenerator();
    return centralizePoints(circlePoints(gen, this.radius));
  }

  shapeMeetsTargetRatio() {
    return Math.abs(this.currentRatio() - this.targetRatio()) < 0.01;
  }

  currentRatio() {
    return area(this.currentShape) * this.baseRatio;
  }

  targetRatio() {
    return this.data[this.index];
  }

  log(str: string) {
    if (this.debug == false) { return }
    console.log(str);
  }
}


