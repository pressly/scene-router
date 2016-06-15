import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'

import route from 'trie-route'

let registerScenes = []

const window = Dimensions.get('window')
const SIZE = 3

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: SIZE * window.width,
    height: SIZE * window.height,
    backgroundColor: 'transparent',
    top: -window.height,
    left: -window.width,
    overflow: 'hidden'
  },
  staticView: {
    position: 'absolute',
    overflow: 'hidden',
    width: window.width,
    height: window.height,
    top: window.height,
    left: window.width
  }
})

export class Area extends Component {
  constructor(props, context) {
    super(props, context)

    const router = route.create()

    registerScenes.forEach(({ Component, opts }) => {
      router.path(opts.path, (params, qs, extra) => {
        const scene = this.renderScene(Component, params, qs, opts, extra)
        this.state.scenes.push(scene)
        this.setState(this.state)
      })
    })

    this.state = {
      id: 0,
      router,
      scenes: [],
      stackRefs: []
    }

    //clear register scene
    registerScenes = null
  }

  goto(path, props, opts) {
    const { router } = this.state
    const err = router.process(path, { opts, props })
    if (err) {
      console.log(err)
    }
  }

  goback() {
    const ref = this.state.stackRefs.pop()
    this.state.scenes.pop()

    ref.close(() => {
      this.setState(this.state)
    })
  }

  renderScene (Component, params, qs, opts, extra) {
    const props = {
      route: {
        params,
        qs,
      },
      opts: {
        ...opts,
        ...extra.opts
      },
      ...extra.props,
      onClose: () => { this.goback() }
    }

    this.state.id++;

    let componentId = this.state.id

    return (
      <Component
        ref={(ref) => {
          //when a component is being deleted,
          //this function is called
          if (ref != null) {
            this.state.stackRefs.push(ref)
          }
        }}
        key={componentId}
        {...props}/>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.staticView}>
          {this.props.children}
        </View>
        {this.state.scenes}
      </View>
    )
  }
}

export const registerScene = (Component, opts) => {
  registerScenes.push({ Component, opts })
}
