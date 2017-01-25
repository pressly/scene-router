// @flow

export type GestureStatus
  = 'open' 
  | 'close' 
  | 'cancel'

export type Point = {
  x: number,
  y: number
}

export type SceneConfig = {
  path: string,
  side?: number,
  threshold?: number,
  gesture?: boolean,
  reset?: boolean,
  backgroundColor?: string
}

// this object type will be pass as `route` props to 
// user's scene
export type Route = {
  path: string,
  params: Object,
  qs: Object,
  props: Object,
  config: ?SceneConfig // this is just a raw information, it's good for debuging
                       // config will be set inside scene's render
}

export type RouterExtra = {
  path: string,
  props: Object,
  customSceneConfig: SceneConfig
}

export interface Router {
  path(path: string, callback: (params: Object, qs: Object, extra: RouterExtra) => void): void;
  process(path: string, extra: Object): void;
}

export type SceneResponse = (
  scene: Function, 
  route: Route, 
  originalSceneConfig: SceneConfig, 
  customSceneConfig: SceneConfig
) => void


