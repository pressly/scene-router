// @flow

import { Platform, Dimensions } from 'react-native'

// Scene Status ///////////////////////////////////////////////////////////////

export const Active               = 1
export const Inactive             = 2
export const MightActive          = 3
export const MightInactive        = 4

// Scene Animation Side ///////////////////////////////////////////////////////

export const FromLeft             = 5
export const FromRight            = 6
export const FromTop              = 7
export const FromBottom           = 8
export const Static               = 9

// window and screen //////////////////////////////////////////////////////////

export const isAndroid = Platform.OS === 'android'

export const window = (() => {
  let window = Dimensions.get('window')
  window.softMenuHeight = 0

  if (isAndroid) {
    let screen = Dimensions.get('screen')
    window.softMenuHeight = screen.height - window.height
  }

  return window
})()