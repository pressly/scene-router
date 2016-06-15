import React, { Component } from 'react'
import { View, Text, Dimensions } from 'react-native'

import { Area, scene, Side, SceneStatus } from './lib'

const window = Dimensions.get('window')

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
    case SceneStatus.MightActivating:
      console.log(name, 'MightActivating')
      break
    case SceneStatus.MigthDeactivating:
      console.log(name, 'MigthDeactivating')
      break
    default:
      console.log(name, 'unknown scene status')
  }
}

// <View style={{
//   position: 'absolute',
//   overflow: 'hidden',
//   top: 120,
//   left: 20,
//   width: window.width,
//   height: window.height,
//   backgroundColor: 'red'
// }}/>

/*
  <Link path="/....." props={{}}
*/

/*
  options can be
  {
    path,
    side
  }
*/
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
        width: window.width
      }}></View>
    )
  }
}

@scene({
  path: "/about",
  side: Side.L
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
        width: window.width
      }}></View>
    )
  }
}

export default class App extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      areaRef: null
    }

    setTimeout(() => {
      console.log('')
      this.state.areaRef.goto('/about', {}, {})
    }, 2000)

    setTimeout(() => {
      console.log('')
      this.state.areaRef.goto('/home', {}, {})
    }, 4000)

    setTimeout(() => {
      console.log('')
      this.state.areaRef.goto('/about', {}, { side: Side.T })
    }, 6000)

    setTimeout(() => {
      console.log('')
      this.state.areaRef.goto('/home', {}, { side: Side.B })
    }, 8000)

    // setTimeout(() => {
    //   console.log('')
    //   this.state.areaRef.goback()
    // }, 6000)

    // setTimeout(() => {
    //   this.state.areaRef.goback()
    // }, 8000)

    /*
      about Activating
      about is created
      about Activated

      about Deactivating
      home Activating
      home is created
      about Deactivated
      home Activated

      home Deactivating
      about Activating
      about Activated
      home Deactivated
      home is deleted

    */
  }

  render() {
    return (
      <Area
        ref={(ref) => this.state.areaRef = ref }>

      <View style={{
          backgroundColor: 'blue',
          flex: 1,
          height: window.height,
          width: window.width
        }}
      />

      </Area>
    )
  }
}
