
import React, { Component } from 'react'
import { View } from 'react-native'

import { getHistory, History } from './history'
import type { SceneOptions } from './history' 

type SceneProps = {
  WrapComponent: Function
}

export class Scene extends Component {
  constructor(props: SceneProps, context: any) {
    super(props, context)
  }

  render() {
    const {
      WrapComponent
    } = this.props

    return (
      <View>
        <WrapComponent />
      </View>
    )
  }
}

export const scene = (options: SceneOptions) => (Wrap: Function): Function => {
  const history: History = getHistory()
  
  history.registerScene((props: Object = {}) => {
    return (
      <Scene
        WrapComponent={Wrap}
      />
    )
  }, options)
  
  return Wrap
}