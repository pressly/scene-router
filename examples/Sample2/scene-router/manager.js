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

// what we have to do is,
const mergeCustomSceneOptions = (currentOpts: SceneOptions, userOpts: SceneOptions): SceneOptions => {
  // currentOpts is the one which was configured at scene decorator.
  // userOpts is the one which was passed by router to chnage the behaviour
  // so, we need to make sure to remove userOpts.path and merge it with currentOpts
  delete userOpts.path

  return {
    ...currentOpts,
    ...userOpts
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
      const sceneOptions = mergeCustomSceneOptions(opt, props.routeOptions.options)

      return (
        <Scene
          ref={props.sceneRef}
          WrapComponent={Wrap}
          sceneOptions={sceneOptions}
          routeOptions={props.routeOptions}/>
      )
    }

    sceneManager.register(SceneWrap, opt)

    return Wrap
  }
}