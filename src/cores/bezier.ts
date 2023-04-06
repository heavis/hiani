/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

const float32ArraySupported = typeof Float32Array === 'function';

function A (aA1: number, aA2: number) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1: number, aA2: number) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1: number)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
// at为t，aA1表示x1或者x2,aA2表示y1或者y2
// 其形式和p0 * Math.pow(1 - t, 3) + p1 * 3 * t * Math.pow(1 - t, 2) + p2 * 3 * Math.pow(t, 2) * (1 - t) + p3 * Math.pow(t, 3)一致
function calcBezier (aT: number, aA1: number, aA2: number) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
// 求曲线方程的一阶导函数
function getSlope (aT: number, aA1: number, aA2: number) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

// 二分球根法：
// 求得的根t，位于aA和aB之间, mX1、mX2分别对应p1、p2的X坐标
// https://zhuanlan.zhihu.com/p/112845185
function binarySubdivide (aX: number, aA: number, aB: number, mX1: number, mX2: number) {
  var currentX, currentT, i = 0; 
  do {
    currentT = aA + (aB - aA) / 2.0;
    // 假设f(t) = 0，求解方程的根。其f(t)=calcBezier(t) - ax
    // f(t)为递增函数
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
    // 如果currentX小于等于最小精度(SUBDIVISION_PRECISION)或者超过迭代次数SUBDIVISION_MAX_ITERATIONS，则终止
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX: number, aGuessT: number, mX1: number, mX2: number) {
 // NEWTON_ITERATIONS为4， 只进行了4次迭代， 根据精度和性能之间做了平衡。
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   // 计算t值对应位置的斜率
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   // 假设f(t) = 0，求解方程的根。其f(t)=calcBezier(t) - ax
   // 牛顿-拉佛森方法: Xn-1 = Xn - f(t) / f'(t)，应用到求贝塞尔曲线的根：Tn = Tn+1 - (calcBezier(t) - ax) / getSlope(t)
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 // 这里只迭代了4次，求得近似值
 return aGuessT;
}

function LinearEasing (x: number) {
  return x;
}

export function bezier (mX1: number, mY1: number, mX2: number, mY2: number) {
    // 判断x轴的值是否在[0,1]范围
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }
  // 如果两个点在一条线上，则使用线性动画
  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  // kSplineTableSize为11，kSampleStepSize为1.0 / (11 - 1.0) = 0.1;
  // Precompute samples table
  // sampleValues存储样本值的目的是提升性能，不用每次都计算。
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  // i从0到10，sampleValues长度为11
  for (var i = 0; i < kSplineTableSize; ++i) {
    // i * kSampleStepSize的范围0到1(10 * 0.1);
    // sampleValues[0] = calcBezier(0, mX1, mX2);
    // sampleValues[1] = calcBezier(0.1, mX1, mX2);
    // ...
    // sampleValues[9] = calcBezier(0.9, mX1, mX2);
    // sampleValues[10] = calcBezier(1, mX1, mX2);
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  // 已知X值，根据X值求解T值
  function getTForX (aX: number) {
    var intervalStart = 0.0;
    var currentSample = 1;
    // lastSample为10
    var lastSample = kSplineTableSize - 1;
    // sampleValues[i]表示i从0以0.1为step，每一步对应的曲线的X坐标值，直到X坐标值小于等于aX
    // 假如aX=0.4，则sampleValues[currentSample]<=aX为止
    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      // intervalStart为到aX经过的step步骤
      intervalStart += kSampleStepSize; // kSampleStepSize为0.1
    }
    //TODO:currentSample为什么要减1？sampleValues[currentSample]大于了ax，所以要--，使得sampleValues[currentSample]<=ax
    --currentSample;

    // Interpolate to provide an initial guess for t
    // ax-sampleValues[currentSample]为两者之间的差值，而(sampleValues[currentSample + 1] - sampleValues[currentSample])一个步骤之间的总差值。
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    // guessForT为预计的初始T值，很粗糙的一个值，接下来会基于该值求根(t值)。
    var guessForT = intervalStart + dist * kSampleStepSize;
    // 预测的T值对应位置的斜率
    var initialSlope = getSlope(guessForT, mX1, mX2);
    // 当斜率大于0.05729°时，使用newtonRaphsonIterate算法预测T值。0.05729是一个很小的斜率
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) { // 当斜率为0，则直接返回
      return guessForT;
    } else { // 当斜率小于0.05729并且不等于0时，使用binarySubdivide
      // 求得的根t，位于intervalStart和intervalStart + kSampleStepSize之间, mX1、mX2分别对应p1、p2的X坐标
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x: number) {
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0 || x === 1) {
      return x;
    }

    return calcBezier(getTForX(x), mY1, mY2);
  };
};