// @flow

import route from 'trie-route'

interface Router {
  path(path: string, callback: (params: ?Object, qs: ?Object, extra: ?Object) => void): void;
  process(path: string, extra: Object): void;
}

export type Side
  = 'static' 
  | 'from-left' 
  | 'from-right' 
  | 'from-top' 
  | 'from-bottom'

export type SceneOptions = {
  path: string,
  side: Side,
  reset: boolean,
  gesture: boolean,
  threshold: number,
  backgroundColor: string
}

export type RouteOptions = {
  side: Side,
  reset: boolean,
  gesture: boolean,
  threshold: number,
  backgroundColor: string
}

export type RouteCallback = (scene: Function, params: ?Object, qs: ?Object, extra: ?Object) => void

export class History {
  registerScene(scene: Function, options: SceneOptions): void {
    throw new Error('registerScene must be implemented')
  }

  route(path: string, props: Object, options: RouteOptions): void {
    throw new Error('registerScene must be implemented')
  }

  setRouteCallback(callback: RouteCallback) {
    throw new Error('setRouteCallback must be implemented')
  }
}

class DefaultHistory extends History {
  router: Router
  callback: RouteCallback

  constructor() {
    super()

    this.router = route.create()
  }

  registerScene(scene: Function, options: SceneOptions): void {
    this.route.path(options.path, (params: ?Object, qs: ?Object, extra: ?Object) => {
      this.callback(scene, params, qs, extra)
    })
  }

  route(path: string, props: Object, options: RouteOptions): void {
    const err = this.router.process(path, { props, options })
    if (err) {
      console.log(err)
    }
  }

  setRouteCallback(callback: RouteCallback) {
    this.callback = callback
  }
}

let internalHistory: History = new DefaultHistory()

export const setHistory = (history: History): void => {
  internalHistory = history
}

export const getHistory = (): History => {
  return internalHistory
}