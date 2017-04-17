// @flow

import React, { Component } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { window } from 'react-native-dimensions'

import { sceneManager } from './manager'

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

export type SceneOptions = {
  path: string,
  gesture: boolean,
  state: () => SceneState,
  animations: Animations
}

export type WrappedSceneProps = {
  //TODO: need to define props which passes to scene as props.route such as params, path that matched
}

export const scene = (options: SceneOptions) => (SceneWrapper: Function): Function => {
  const WrappedScene = (props: WrappedSceneProps): React.Element<any> => {
    return (
      <Scene 
        state={options.state} 
        animations={options.animations}
        gesture={options.gesture}>
        <SceneWrapper route={props}/>
      </Scene>
    )
  }

  sceneManager.register(WrappedScene, options)

  return SceneWrapper
}
