// @flow

import React from 'react'

import type { SceneOptions, WrappedSceneProps } from './scene'

class SceneManager {
  register(WrappedScene: (props: WrappedSceneProps) => React.Element<any>, options: SceneOptions) {

  }
}


export const sceneManager = new SceneManager()
