// @flow

import React, { Component } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { window } from 'react-native-dimensions'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: window.width,
    height: window.height    
  }
})

type AnimationFn = (curr: SceneState, next: SceneState) => Animated.CompositeAnimation

type Animations = {
  open: AnimationFn,
  close: AnimationFn
}

type SceneProps = {
  state: () => SceneState,
  animations: Animations,
  children?: Array<React.Element<any>>
}

type SceneState = {
  position: Animated.ValueXY,
  opacity: Animated.Value
}

class Scene extends Component {
  props: SceneProps
  state: SceneState

  constructor(props: SceneProps, context: any) {
    super(props, context)

    const { position, opacity } = props.state()

    this.state = {
      position, 
      opacity
    }
  }
  
  render() {
    const { children } = this.props
    const { position, opacity } = this.state

    return (
      <Animated.View style={[
        styles.container,
        {
          transform: position.getTranslateTransform(),
          opacity: opacity
        }
      ]}>
        { children }
      </Animated.View>
    )
  }
}

type SceneOptions = {
  path: string,
  gesture: boolean,
  state: () => SceneState,
  animations: Animations
}

export const scene = (options: SceneOptions) => (SceneWrapper: Function): React.Element<any> => {
  return (
    <Scene 
      state={options.state} 
      animations={options.animations}
      gesture={options.gesture}>
      <SceneWrapper />
    </Scene>
  )
}
