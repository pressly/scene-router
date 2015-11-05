const React = require('react-native');
const Camera = require('../base');
const TwoSideMenus = require('./two-side-menus');

const {
  Dimensions,
  StyleSheet,
  Component,
  View,
} = React;

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  menuWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: window.height,
    backgroundColor: 'transparent'
  }
})

class CameraWith2SideMenus extends Camera {
  constructor(props, context) {
    super(props, context);
  }

  _wrappedMenuController(sceneAsChild) {
    return (
      sceneAsChild
    );
  }

  renderBack() {
    const { userProps: { LeftMenu, RightMenu } } = this.props;

    return (
      <View style={styles.menuWrapper}>
        <LeftMenu key="leftMenu" ref="leftMenu"/>
        <RightMenu key="rightMenu" ref="rightMenu"/>
      </View>
    );
  }

  renderScenes(scenes) {
    const lastIndex = React.Children.count(scenes) - 1;
    return React.Children.map(scenes, (scene, index) => {
      if (index == lastIndex) {
        return this._wrappedMenuController(scene);
      }
      return scene;
    });
  }
}

module.exports = CameraWith2SideMenus;
