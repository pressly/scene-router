import React, { Component, PropTypes, cloneElement, Children } from 'react'
import { View, StyleSheet } from 'react-native'

import { SceneStatus } from './constants'

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export class AreaList extends Component {
  static propsTypes = {
    active: PropTypes.string,
    onGestureClosed: PropTypes.func
  }

  static defaultProps = {
    onGestureClosed: () => {}
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      names: [],
      list: [],
      refs: {}
    }

    Children.forEach(props.children, (area, index) => {
      const { name, onGestureClosed } = area.props

      area = cloneElement(area, {
        key: name,
        ref: (ref) => {
          if (ref) {
            this.state.refs[name] = ref
          }
        },
        onGestureClosed: () => {
          onGestureClosed()
          props.onGestureClosed()
        }
      })

      this.state.names.unshift(name)
      this.state.list.unshift(area)
    })
  }

  getActiveRef() {
    const { refs, names } = this.state
    const activeName = names[names.length - 1]
    return refs[activeName]
  }

  goto(path, options) {
    const activeRef = this.getActiveRef()

    if (activeRef) {
      activeRef.goto(path, options)
    }
  }

  goback(path) {
    const activeRef = this.getActiveRef()

    if (activeRef) {
      activeRef.goback(path)
    }
  }

  activeArea(name) {
    const { names, list } = this.state
    const index = names.indexOf(name)

    let currentRef
    let nextRef

    if (index != -1) {
      currentRef = this.getActiveRef()
      currentRef.areaListActiveStatus(SceneStatus.Deactivating)

      this.rearangingArea(index)

      nextRef = this.getActiveRef()
      nextRef.areaListActiveStatus(SceneStatus.Activating)

      this.setState(this.state, () => {
        currentRef.areaListActiveStatus(SceneStatus.Deactivated)
        nextRef.areaListActiveStatus(SceneStatus.Activated)
      })
    }
  }

  //this method, simply replace the area from index with the last element.
  //by doing this, we are making the Area visibile in front.
  rearangingArea(index) {
    const { list, names } = this.state
    const lastItem = list.length - 1

    let areaListElement

    if (index == lastItem) {
      return
    }

    areaListElement = list[index]
    list[index] = list[lastItem]
    list[lastItem] = areaListElement

    areaListElement = names[index]
    names[index] = names[lastItem]
    names[lastItem] = areaListElement
  }

  render() {
    const { list } = this.state

    return (
      <View>
        {list}
      </View>
    )
  }
}
