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

export default class Area extends Component {
  constructor(props, context) {
    super(props, context)

    const router = route.create()

    registerScenes.forEach(({ Component, opts }) => {
      router.path(opts.path, (params, qs, extra) => {
        const scene = this.renderScene(Component, params, qs, opts, extra)
        const { scenes } = this.state

        scenes.push(scene)

        //by using this we are making sure the timing issue.
        //you can't call the setState when the component has't been mounted.
        //this condition makes it happen.
        if (this.state.scenes.length == 0) {
          this.setState(this.state)
        }
      })
    })

    this.state = {
      id: 0,
      router,
      scenes: []
    }

    //clear register scene
    registerScenes = null

    this.goto(router, props.path, props.opts, props.props)
  }

  goto = (router, path, opts, props) => {
    const err = router.process(path, { opts, props })
    if (err) {
      console.log(err)
    }
  }

  goback = () => {
    console.log('goback')
  }

  renderScene = (Component, params, qs, opts, extra) => {
    const props = {
      route: {
        params,
        qs,
      },
      opts: {
        ...opts,
        ...extra.opts
      },
      ...extra.props
    }

    this.state.id++;

    return (
      <Component key={this.state.id} {...props}/>
    )
  }

  componentWillReceiveProps(nextProps) {
    const { path, opts, props, goback } = nextProps
    const { router } = this.state

    if (!goback) {
      this.goto(router, path, opts, props)
    } else {
      this.goback()
    }
  }

  render() {
    const { scenes } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.staticView}>
          {this.props.children}
        </View>
        {scenes}
      </View>
    )
  }
}

Area.propTypes = {
  path: PropTypes.string,
  opts: PropTypes.object,
  props: PropTypes.object,
  goback: PropTypes.bool
}

Area.defaultProps = {
  path: "",
  opts: {},
  props: {},
  goback: false
}

export const registerScene = (Component, opts) => {
  registerScenes.push({ Component, opts })
}
