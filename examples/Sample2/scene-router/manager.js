// @flow

import React from 'react'
import route from 'trie-route'

import * as constants from './constants'
import { Scene } from './scene'

import type { SceneConfig, Route, Router, SceneResponse, RouterExtra } from './types'

// types //////////////////////////////////////////////////////////////////////

type SceneWrapProps = {
  sceneRef: (ref: any) => void,
  customSceneConfig: SceneConfig,
  route: Route
}

// internal functions /////////////////////////////////////////////////////////

const mergeDefaultSceneOptions = (options: SceneConfig): SceneConfig => {
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
const mergeCustomSceneOptions = (currentOpts: SceneConfig, userOpts: SceneConfig): SceneConfig => {
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

  register(SceneWrap: Function, originalSceneConfig: SceneConfig) {
    this.router.path(originalSceneConfig.path, (params: Object = {}, qs: Object = {}, extra: RouterExtra) => {
      const { path, props, customSceneConfig } = extra
      const route = {
        path,
        params,
        qs,
        props,
        config: null
      }
      this.response && this.response(SceneWrap, route, originalSceneConfig, customSceneConfig)
    })
  }

  request(path: string, props: ?Object = {}, customSceneConfig: SceneConfig) {
    this.router.process(path, { path, props, customSceneConfig })
  }

  // this callback will be set by Router class
  setSceneResponse(sceneResponse: SceneResponse) {
    this.response = sceneResponse
  }
}

export const sceneManager = new SceneManager()

// dcecorators /////////////////////////////////////////////////////////////////

export const scene = (originalSceneConfig: SceneConfig): Function => {
  originalSceneConfig = mergeDefaultSceneOptions(originalSceneConfig)

  return (WrapComponent: Function): Function => {
    const SceneWrap = (props: SceneWrapProps): React.Element<any> => {
      const { customSceneConfig, route } = props
      const sceneConfig = mergeCustomSceneOptions(originalSceneConfig, customSceneConfig)

      return (
        <Scene
          ref={props.sceneRef}
          WrapComponent={WrapComponent}
          sceneConfig={sceneConfig}
          route={route}/>
      )
    }

    sceneManager.register(SceneWrap, originalSceneConfig)

    return WrapComponent
  }
}