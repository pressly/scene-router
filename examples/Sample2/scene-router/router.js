// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import { Area } from './area'
import { sceneManager } from './manager'

import type { SceneConfig, Route } from './types'

// types //////////////////////////////////////////////////////////////////////

// - `area` must be passed by all times,
// - if `action` is not pass, then Router will only change the area
// router will throw an exception if area does not exists.
// - config must be provided if `action` is 'goto'. config on 'goback'
// will be ignored.
// - `props` only being used by 'goto' and it's optional
type RouterProps = {
  area: string,
  action?: 'goto' | 'goback',
  config?: SceneConfig,
  props?: Object 
}

type RouterState = {
  areas: Array<React.Element<*>>,
  names: Array<string>,
  areaRefs: Map<string, Area>
}

// Router Component ///////////////////////////////////////////////////////////

let idCount: number = 0

export class Router extends Component {
  props: RouterProps
  state: RouterState

  constructor(props: RouterProps, context: any) {
    super(props, context)

    sceneManager.setSceneResponse(this.sceneResponse)

    this.state = {
      areas: [<Area key={`area:${idCount++}`} ref={this.registerAreaRef}/>],
      names: [props.area],
      areaRefs: new Map()
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

  sceneResponse = (scene: Function, 
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

    let swap: any = this.state.names[lastItem]
    this.state.names[lastItem] = this.state.names[index]
    this.state.names[index] = swap

    swap = this.state.areas[lastItem]
    this.state.areas[lastItem] = this.state.areas[index]
    this.state.areas[index] = swap

    this.setState(this.state, done)
  }

  componentWillReceiveProps(nextProps: RouterProps) {
    const { area, action, config, props } = nextProps
    
    let areaRef: ?Area = this.state.areaRefs.get(area)
    if (!areaRef) {
      if (action !== 'goto') {
        throw new Error(`you can't call '${String(action)}' on area that doesn't exist`)
      }

      // create a new Area
      this.state.areas.push(<Area key={`area:${idCount++}`} ref={this.registerAreaRef}/>)
      this.state.names.push(area)

      this.setState(this.state, () => {
        // so by now, area is set, so we can call the sceneManager to process the path
        // if a route is found, `sceneResponse` will be called.
        config && sceneManager.request(config.path, props, config)
      })
    } else {
      if (action === 'goto') {
        // we know that areaRef exists and we simply call `reOrder` to switch to requested area
        // when the match happens, `sceneResponse` will be called.
        this.reOrder(area, () => {
          config && sceneManager.request(config.path, props, config)
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
    // TODO: we need to optimize this to increase the performance,
    // for now it's good enough
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