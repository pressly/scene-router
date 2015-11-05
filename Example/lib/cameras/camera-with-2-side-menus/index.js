const React = require('react-native');
const Camera = require('../base');

const {
  View,
  Dimensions
} = React;

const window = Dimensions.get('window');

class CameraWith2SideMenus extends Camera {
  constructor(props, context) {
    super(props, context);
  }

  renderBack() {
    console.log('ok');
    return (
      <View style={{ flex:1, backgroundColor: 'black' }}></View>
    );
  }
}

module.exports = CameraWith2SideMenus;
