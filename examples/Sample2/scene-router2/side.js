

import { Platform } from 'react-native'
import { window } from './dimensions'

export type SideType 
  = 'static'
  | 'from:right'
  | 'from:left'
  | 'from:top'
  | 'from:bottom'

export type Point = {
  x: number,
  y: number
}

const isAndroid = Platform.OS === 'android'
const toolbarHeight = isAndroid ? 25 : 0

export const Side = {
  Static:     'static',
  FromRight:  'from:right',
  FromLeft:   'from:left',
  FromTop:    'from:top',
  FromBottom: 'from:bottom'
}

export const calcSide = (side: SideType): Point => {
  let y
  let x

  switch (side) {
    case Side.FromLeft:
      y = window.height
      x = 0
      break

    case Side.FromRight:
      y = window.height
      x = 2 * window.width
      break

    case Side.FromTop:
      y = 0
      x = window.width
      break

    case Side.FromBottom:
      y = 2 * window.height
      x = window.width
      if (isAndroid) {
        y -= toolbarHeight
      }
      break

    case Side.Static:
      x = 0
      y = 0

    default:
      throw new Error('side is unknown')
  }

  return { y, x }
}