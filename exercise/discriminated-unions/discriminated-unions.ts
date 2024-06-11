// Write a program that calculates the total area of different shapes using
// discriminated unions. Include support for at least squares, rectangles, and
// circles. The functionality to calculate the area of each shape should exist
// in a single function and the function should select the appropriate
// calculation based on the disciminator.
//
// The area of a square: side^2
// The area of a rectangle: width * height
// The area of a circle: Math.PI * radius^2
//
// Make these assertions to check your code:
// - Square with side length of 5 has an area of 25
// - Rectangle with width of 4 and height of 6 has an area of 24
// - Circle with radius of 3 has an area of Math.PI * 9

import { strict as assert } from 'assert';

interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  width: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

type Shape = Circle | Square | Rectangle;

const getSize = (shape: Shape): number => {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * Math.sqrt(shape.radius);
    case 'square':
      return Math.sqrt(shape.width);
    case 'rectangle':
      return shape.width * shape.height;
  }
};

const circle: Shape = { kind: 'circle', radius: 5 };
const square: Shape = { kind: 'square', width: 5 };
const rectangle: Shape = { kind: 'rectangle', width: 5, height: 5 };

console.log(getSize(circle));
console.log(getSize(square));
console.log(getSize(rectangle));
