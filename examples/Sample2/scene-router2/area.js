

import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import route from 'trie-route'

import { window } from './dimensions'
import { Scene } from './scene'
import { areaRegister } from './registration'

type Router = {
  path: Function,     //path(url: string, function(params, qs, extra))
  process: Function,  //process(url: string, { props, opts })
}

type AreaProps = {
  name: string,       // name uses to activate one Area between multiple ones
  children: any       // only single child must be pass to Area component
}

type AreaState = {
  sceneRefs: Array<any>,
  scenes: Array<Scene>
}

const sizeOfArea = 3
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: sizeOfArea * window.width,
    height: sizeOfArea * window.height,
    backgroundColor: 'transparent',
    transform: [{ translateX: -window.width }, { translateY: -window.height }],
    overflow: 'hidden'
  },
  staticView: {
    position: 'absolute',
    overflow: 'hidden',
    width: window.width,
    height: window.height,
    transform: [{ translateX: window.width }, { translateY: window.height }],
  }
})

export class Area extends Component {
  constructor(props: AreaProps, context: any) {
    super(props, context)

    this.state = {
      sceneRefs: [],
      scenes: []
    }

    areaRegister(ptops.name, this)
  }

  goto = (Scene: Function, params: Object, qs: Object, extra: Object) => {
    const scene = (
      <Scene 
        sceneRef={(ref) => this.state.scenes.push(ref)}
        route={{ params, qs, extra }}/>
    )

    this.state.scenes.push(scene)
    this.setState(this.state)
  }

  render() {
    return (
      <View style={style.container}>
        <View style={style.staticView}>
          {this.props.children}
        </View>
        { this.state.scenes }
      </View>
    )
  }
}