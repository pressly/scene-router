// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import { Area } from './area'
import { sceneManager } from './manager'

import type { SceneOptions } from './types'

// types //////////////////////////////////////////////////////////////////////

// - `area` must be passed by all times,
// - if `action` is not pass, then Router will only change the area
// router will throw an exception if area does not exists.
// - options must be provided if `action` is 'goto'. options on 'goback'
// will be ignored.
// - `props` only being used by 'goto' and it's optional
type RouterProps = {
  area: string,
  action?: 'goto' | 'goback',
  options?: SceneOptions,
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

  sceneResponse = (scene: Function, params: Object, qs: Object, props: Object, options: SceneOptions) => {
    const ref = this.currentAreRef
    const routeOptions = {
      params,
      qs,
      props,
      options
    }
    if (ref) {
      ref.push(scene, routeOptions)
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
    const { area, action, options, props } = nextProps
    
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
        options && sceneManager.request(options.path, props, options)
      })
    } else {
      if (action === 'goto') {
        // we know that areaRef exists and we simply call method the route.
        // when the match happens, `sceneResponse` will be called.
        this.reOrder(area, () => {
          options && sceneManager.request(options.path, props, options)
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
    const { action, options, props } = this.props
    
    if (action === 'goto') {
      options && sceneManager.request(options.path, props, options)
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