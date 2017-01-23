import React, { Component } from 'react'
import { View, Text } from 'react-native'

const genColor = () => '#' + Math.floor(Math.random()*16777215).toString(16)

export class Area extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      label: ''
    }
  }

  setLabel(label) {
    this.setState({ label })
  }

  componentDidMount() {
    console.log('component did mount')
  }

  render() {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: genColor() }}>
        <Text>{this.state.label}</Text>
      </View>
    )
  }
}

export class AddArea extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      areas: []
    }

    let count = 0

    setTimeout(() => {
      this.state.areas.push(
        <Area ref={(ref) => console.log('ref') } key={count++}/>
      )
      this.setState(this.state, () => {
        console.log('set state')
      })
    }, 2000)
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        { this.state.areas }
      </View>
    )
  }
}