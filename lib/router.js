// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import { Area } from './area'
import { sceneManager } from './manager'
import * as constants from './constants'

import type { SceneConfig, Route, SceneRejecter } from './types'

// types //////////////////////////////////////////////////////////////////////

// - `area` must be passed by all times,
// - if `action` is not pass, then Router will only change the area
// router will throw an exception if area does not exists.
// - config must be provided if `action` is 'goto'. config on 'goback'
// will be ignored.
// - `props` only being used by 'goto' and it's optional
// - `error` is a function which will be called if path does not found
type RouterProps = {
  area: string,
  action?: 'goto' | 'goback',
  config?: SceneConfig,
  props?: Object,
  children?: React.Element<*>,
  error?: SceneRejecter
}

type RouterState = {
  areas: Array<React.Element<*>>,
  names: Array<string>,
  areaRefs: Map<string, Area>,
  firstAreaName: string
}

// Router Component ///////////////////////////////////////////////////////////

let idCount: number = 0

export class Router extends Component {
  props: RouterProps
  state: RouterState

  constructor(props: RouterProps, context: any) {
    super(props, context)

    sceneManager.setSceneResolver(this.sceneResolver)
    sceneManager.setSceneRejecter(this.sceneRejecter)

    const area = (
      <Area key={`area:${idCount++}`} ref={this.registerAreaRef}>
        {props.children}
      </Area>
    )

    this.state = {
      areas: [area],
      names: [props.area],
      areaRefs: new Map(),
      firstAreaName: props.area
    }
  }

  registerAreaRef = (areaRef: Area) => {
    const { area } = this.props
    if (areaRef) {
      this.state.areaRefs.set(area, areaRef)
    }
  }

  get currentAreaName(): string {
    const { names } = this.state
    return names[names.length - 1]
  }

  get currentAreRef(): ?Area {
    const { areaRefs } = this.state
    return areaRefs.get(this.currentAreaName)
  }

  // we need this method to drill down to current area
  // and current scene and call `updateSceneStatus`
  // it is mainly used for updating status once area is being chnaged.
  updateSceneStatus(status: number) {
    let sceneRef: any
    const currArea = this.currentAreRef
    if (currArea) {
      sceneRef = currArea.currentSceneRef
      if (sceneRef) {
        sceneRef.updateSceneStatus(status)
      }
    }
  }

  sceneRejecter = (err: string) => {
    const { error } = this.props
    error && error(err)
  }

  sceneResolver = (scene: Function, 
                   route: Route, 
                   originalSceneConfig: SceneConfig, 
                   customSceneConfig: SceneConfig) => {
    const ref = this.currentAreRef
    if (ref) {
      ref.push(scene, route, originalSceneConfig, customSceneConfig)
    }
  }

  reOrder = (name: string, done: Function) => {
    const index = this.state.names.indexOf(name)
    if (index === -1) {
      throw new Error('should not happen, but happened anyway! FUCK!')
    }

    let lastItem = this.state.areas.length - 1

    if (this.state.names[lastItem] === name) {
      return done()
    }

    this.updateSceneStatus(constants.Inactive)

    let swap: any = this.state.names[lastItem]
    this.state.names[lastItem] = this.state.names[index]
    this.state.names[index] = swap

    swap = this.state.areas[lastItem]
    this.state.areas[lastItem] = this.state.areas[index]
    this.state.areas[index] = swap

    this.setState(this.state, () => {
      this.updateSceneStatus(constants.Active)
      done()
    })
  }

  componentWillReceiveProps(nextProps: RouterProps) {
    const { area, action, config, props } = nextProps
    const currentAreaName = this.props.area

    let areaRef: ?Area = this.state.areaRefs.get(area)
    if (!areaRef) {
      if (action !== 'goto') {
        throw new Error(`you can't call '${String(action)}' on area that doesn't exist`)
      }

      this.updateSceneStatus(constants.Inactive)

      // create a new Area
      this.state.areas.push(<Area key={`area:${idCount++}`} ref={this.registerAreaRef}/>)
      this.state.names.push(area)

      this.setState(this.state, () => {
        // so by now, area is set, so we can call the sceneManager to process the path
        // if a route is found, `sceneResolver` will be called.
        // NOTE: because `config` will always be an object, we need extra condition
        //       to make sure it has right information. that's why you see 
        //       `config && config.path && ...`
        config && config.path && sceneManager.request(config.path, props, config)
      })
    } else {
      if (action === 'goto') {
        const requireReset = area === this.state.firstAreaName && currentAreaName !== area

        // we know that areaRef exists and we simply call `reOrder` to switch to requested area
        // when the match happens, `sceneResolver` will be called.
        this.reOrder(area, () => {
          // NOTE: because `config` will always be an object, we need extra condition
          //       to make sure it has right information. that's why you see 
          //       `config && config.path && ...`          
          config && config.path && sceneManager.request(config.path, props, config)
          if (requireReset) {
            this.state.names.forEach((name: string) => {
              if (name !== this.state.firstAreaName) {
                const ref = this.state.areaRefs.get(name)
                if (ref) {
                  ref.resetAllScenes(() => {
                  })
                }
              }
            })
          }
        })
      } else {
        // if the type is `goback`, then we simply call the pop on areaRef
        // obviously, pop does more than just a pop. It does the animation and hide the
        // previous scene and call `updateSceneState` on both previous and current scenes.
        this.reOrder(area, () => {
          areaRef && areaRef.pop()
        })
      }
    }
  }

  shouldComponentUpdate(nextProps: RouterProps, nextState: RouterState) {
    // TODO: reverting it back to normal
    // we need to find a way to intercept going into a route.
    // e.g. shouldRoute(nextRoute): boolean
    // this method should also be called when gesture close happening
    // and nextRoute will be prevRoute.
    
    /*
    const currConfig = this.props.config
    const nextConfig = nextProps.config

    if (currConfig && nextConfig) {
      // if the previous path is the same as next path,
      // then you don't want to do the render opration.
      // This can be more optimized, for checking props as well.
      // but for now it's sufficent enough
      return currConfig.path !== nextConfig.path
    }
    */

    return true
  }

  componentDidMount() {
    const { action, config, props } = this.props
    
    if (action === 'goto') {
      config && sceneManager.request(config.path, props, config)
    }
  }

  render() {
    const { areas } = this.state

    return (
      <View>
        {areas}
      </View>
    )
  }
}