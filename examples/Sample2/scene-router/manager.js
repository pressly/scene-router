// @flow

import React from 'react'
import route from 'trie-route'

import * as constants from './constants'
import { Scene } from './scene'

import type { SceneOptions, RouteOptions, Router, SceneResponse, RouterExtra } from './types'

// types //////////////////////////////////////////////////////////////////////

type SceneWrapProps = {
  sceneRef: (ref: any) => void,
  routeOptions: RouteOptions
}

// internal functions /////////////////////////////////////////////////////////

const mergeDefaultSceneOptions = (options: SceneOptions): SceneOptions => {
  return {
    side: constants.FromRight,
    threshold: 30,
    gesture: true,
    reset: false,
    backgroundColor: 'white',
    ...options
  }
}

// SceneManager ///////////////////////////////////////////////////////////////

export class SceneManager {
  router: Router
  response: ?SceneResponse

  constructor() {
    this.router = route.create()
  }

  register(scene: Function, options: SceneOptions) {
    this.router.path(options.path, (params: Object = {}, qs: Object = {}, extra: RouterExtra) => {
      this.response && this.response(scene, params, qs, extra.props, extra.options)
    })
  }

  request(path: string, props: ?Object = {}, options: SceneOptions) {
    this.router.process(path, { props, options })
  }

  // this callback will be set by Router class
  setSceneResponse(sceneResponse: SceneResponse) {
    this.response = sceneResponse
  }
}

export const sceneManager = new SceneManager()

// dcecorators /////////////////////////////////////////////////////////////////

export const scene = (opt: SceneOptions) => {
  opt = mergeDefaultSceneOptions(opt)

  return (Wrap: Function): Function => {

    const SceneWrap = (props: SceneWrapProps): React.Element<any> => {
      return (
        <Scene
          ref={props.sceneRef}
          WrapComponent={Wrap}
          sceneOptions={opt}/>
      )
    }

    sceneManager.register(SceneWrap, opt)

    return Wrap
  }
}