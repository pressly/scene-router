/**
* Copyright 2014, Ali Najafizadeh.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*
*/

function Vector2D(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

Vector2D.prototype = {
  constructor: Vector2D,
  equal: function (vect) {
      return this == vect || ( this.x === vect.x && this.y === vect.y );
  },
  assign: function (x, y) {
    this.x = x;
    this.y = y;

    return this;
  },
  copyTo: function (vect) {
    vect.x = this.x;
    vect.y = this.y;

    return this;
  },
  copyFrom: function (vect) {
    this.x = vect.x;
    this.y = vect.y;

    return this;
  },
  add: function (vect) {
    this.x += vect.x;
    this.y += vect.y;

    return this;
  },
  sub: function (vect) {
    this.x -= vect.x;
    this.y -= vect.y;

    return this;
  },
  normalise : function () {
    var m = this.magnitude();

    this.x = this.x / m;
    this.y = this.y / m;

    return this;
  },
  reverse : function () {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  },
  div: function (value) {
    this.x /= value;
    this.y /= value;

    return this;
  },
  magnitude : function () {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
  },
  dot : function (v) {
    return (this.x * v.x) + (this.y * v.y) ;
  },
  distance: function (vect) {
      var xd = vect.x - this.x,
          yd = vect.y - this.y;

      return Math.sqrt(xd * xd + yd * yd);
  },
  angleDegree : function () {
    return this.angleRadian() * Vector2D.TO_DEGREES;
  },
  angleRadian : function () {
    return Math.atan2(this.y, this.x);
  },
  toString: function () {
    return "[" + this.x + ", " + this.y + "]";
  },
  toJSON: function () {
    return [this.x, this.y];
  },
  clone: function () {
    return new Vector2D(this.x, this.y);
  }
};

Vector2D.TO_DEGREES = 180 / Math.PI;
Vector2D.TO_RADIANS = Math.PI / 180

module.exports = Vector2D;
