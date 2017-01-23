// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import { Area } from './area'
import { sceneManager } from './manager'
import type { SceneOptions } from './scene'

// types //////////////////////////////////////////////////////////////////////

type RouterProps = {
  area: string,
  action: 'goto' | 'goback',
  options?: SceneOptions,
  props?: Object,
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

  get currentAreRef(): ?Area {
    const { names, areaRefs } = this.state
    const lastName = names[names.length - 1]
    return areaRefs.get(lastName)
  }

  sceneResponse = (scene: Function, params: ?Object, qs: ?Object, props: ?Object, options: SceneOptions) => {
    const ref = this.currentAreRef
    if (ref) {
      ref.push(scene)
    }
  }

  reorder = (name: string, done: Function) => {
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
        throw new Error(`you can't call '${action}' on area that doesn't exist`)
      }

      // create a new Area
      this.state.areas.push(<Area key={`area:${idCount++}`} ref={this.registerAreaRef}/>)
      this.state.names.push(area)

      this.setState(this.state, () => {
        // so by now, area is set, so we can call the sceneManager to process the path
        options && sceneManager.request(options.path, props, options)
      })
    } else {
      if (action === 'goto') {
        // we know that areaRef exists and we simply call mathc the route.
        // when the match happens, `sceneResponse` will be called.
        this.reorder(area, () => {
          options && sceneManager.request(options.path, props, options)
        })
      } else {
        // if the type is `goback`, then we simply call the pop on areaRef
        // obviously, pop does more than just a pop. It does the animation and hide the
        // previous scene and call `updateSceneState` on both previous and current scenes.
        this.reorder(area, () => {
          areaRef && areaRef.pop()
        })
      }
    }
  }

  shouldComponentUpdate(nextProps: RouterProps, nextState: RouterState) {
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