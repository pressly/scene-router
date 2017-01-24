// @flow

export type Point = {
  x: number,
  y: number
}

export type SceneOptions = {
  path: string,
  side?: number,
  threshold?: number,
  gesture?: boolean,
  reset?: boolean,
  backgroundColor?: string
}

export type RouterExtra = {
  props: Object,
  options: SceneOptions
}

export interface Router {
  path(path: string, callback: (params: Object, qs: Object, extra: RouterExtra) => void): void;
  process(path: string, extra: Object): void;
}

export type RouteOptions = {
  params: Object, 
  qs: Object, 
  props: Object, 
  options: SceneOptions
}

export type SceneResponse = (scene: Function, params: Object, qs: Object, props: Object, options: SceneOptions) => void