/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { View, AppRegistry } from 'react-native';

// import { App } from './app'
//import { AddArea } from './addarea'
import { App } from './test'

export default class Sample2 extends Component {
  render() {
    return (
      <App />
    );
  }
}

AppRegistry.registerComponent('Sample2', () => Sample2);
