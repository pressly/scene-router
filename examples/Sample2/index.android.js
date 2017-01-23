/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import { App } from './app'

export default class Sample2 extends Component {
  render() {
    return (
      <App />
    );
  }
}

AppRegistry.registerComponent('Sample2', () => Sample2);
