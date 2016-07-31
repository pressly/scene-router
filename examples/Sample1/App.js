import React, { Component } from 'react'
import { View, Text, Dimensions } from 'react-native'

import { Area, AreaList, scene, Side, SceneStatus } from 'scene-router'

const window = Dimensions.get('window')

const wait = (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

const showSceneStatus = (name, sceneStatus) => {
  switch (sceneStatus) {
    case SceneStatus.Activating:
      console.log(name, 'Activating')
      break
    case SceneStatus.Activated:
      console.log(name, 'Activated')
      break
    case SceneStatus.Deactivating:
      console.log(name, 'Deactivating')
      break
    case SceneStatus.Deactivated:
      console.log(name, 'Deactivated')
      break
    case SceneStatus.MightActivate:
      console.log(name, 'MightActivate')
      break
    case SceneStatus.MightDeactivate:
      console.log(name, 'MightDeactivate')
      break
    default:
      console.log(name, 'unknown scene status')
  }
}

@scene({
  path: "/home",
  side: Side.R
})
class Home extends Component {

  componentDidMount() {
    console.log('home is created')
  }

  componentWillUnmount() {
    console.log('home is deleted')
  }

  render() {
    showSceneStatus('home', this.props.sceneStatus)

    return (
      <View style={{
        backgroundColor: 'red',
        flex: 1,
        height: window.height,
        width: window.width,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text>Home</Text>
      </View>
    )
  }
}

@scene({
  path: "/about",
  side: Side.R
})
class About extends Component {

  componentDidMount() {
    console.log('about is created')
  }

  componentWillUnmount() {
    console.log('about is deleted')
  }

  render() {
    showSceneStatus('about', this.props.sceneStatus)

    return (
      <View style={{
        backgroundColor: 'green',
        flex: 1,
        height: window.height,
        width: window.width,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text>About</Text>
      </View>
    )
  }
}

@scene({
  path: "/contact",
  side: Side.R
})
class Contact extends Component {

  componentDidMount() {
    console.log('contact is created')
  }

  componentWillUnmount() {
    console.log('contact is deleted')
  }

  render() {
    showSceneStatus('contact', this.props.sceneStatus)

    return (
      <View style={{
        backgroundColor: 'yellow',
        flex: 1,
        height: window.height,
        width: window.width,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text>Contact</Text>
      </View>
    )
  }
}

export default class App extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      areaRef: null
    }
  }

  async componentDidMount() {
    await wait(2000)

    this.state.areaRef.goto('/home', { opts: { animate: false } })

    await wait(2000)

    this.state.areaRef.goto('/about')

    await wait(2000)

    this.state.areaRef.goto('/contact')

    await wait(2000)

    // this.state.areaRef.goback('/home')

    this.state.areaRef.activeArea('hubs')

    await wait(2000)

    this.state.areaRef.goto('/about')

    await wait(2000)

    this.state.areaRef.activeArea('stream')
  }

  render() {
    return (
      <AreaList ref={(ref) => { this.state.areaRef = ref }}>
        <Area name="stream">
          <View style={{
              backgroundColor: 'blue',
              flex: 1,
              height: window.height,
              width: window.width,
              alignItems: 'center',
              justifyContent: 'center'}}>
              <Text>Stream Landing</Text>
          </View>
        </Area>
        <Area name="hubs">
          <View style={{
              backgroundColor: 'blue',
              flex: 1,
              height: window.height,
              width: window.width,
              alignItems: 'center',
              justifyContent: 'center'}}>
              <Text>Hubs Landing</Text>
          </View>
        </Area>
      </AreaList>
    )
  }
}
