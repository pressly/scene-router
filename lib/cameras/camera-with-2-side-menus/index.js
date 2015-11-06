const React = require('react-native');
const Camera = require('../base');
const TwoSideMenus = require('./two-side-menus');

const {
  Dimensions,
  StyleSheet,
  Component,
  View,
  PanResponder,
  Animated,
  TouchableWithoutFeedback
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
  },
  view: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'transparent',
    width: window.width,
    height: window.height
  },
  overlay: {
    position: 'absolute',
    left: 0, // this value will be modified by this._position in base canera class
    top: 0, // this value will be modified by this._position in base canera class
    backgroundColor: 'transparent',
    width: window.width,
    height: window.height
  }
});

const animationFunction = (prop, value) => {
  return Animated.timing(
    prop,
    {
      toValue: value,
      duration: 300
    }
  );
};

const animationStyle = (value) => {
  return {
    transform: [
      {
        translateX: value,
      }
    ],
  };
};

class CameraWith2SideMenus extends Camera {
  constructor(props, context) {
    super(props, context);

    //////////////////////////////
    // Menu
    this._responder = null;
    this._leftMenuOpacity = new Animated.Value(0);
    this._rightMenuOpacity = new Animated.Value(0);
    this._overlayOpacity = new Animated.Value(0);

    this._value = new Animated.Value(0);
    this._prevValue = 0;

    this._enabledLeftMenu = true;
    this._enabledRightMenu = true;

    this._whichSide = null;

    this._isOpen = false;

    //Menus Lifecylce variables
    this._lifecyles = {
      rightMightOpen: false,
      leftMightOpen: false
    };
    this._value.addListener(this._updateLifeCyles.bind(this));
  }

  //we use this function to make sure we are getting the right ref
  //whether it's wrapped by redux or not.
  _getMenuRef(side) {
    const refName = side == 'left'? 'leftMenuRef' : 'rightMenuRef';
    const ref = this.refs[refName];

    if (ref && ref.getWrappedInstance) {
      return ref.getWrappedInstance();
    }

    return ref;
  }

  _callMenuMightOpen(side) {
    const ref = this._getMenuRef(side);
    if (ref && ref.menuMightOpen) {
      ref.menuMightOpen();
    }
  }

  _callMenuDidOpen(side) {
    const ref = this._getMenuRef(side);
    if (ref && ref.menuDidOpen) {
      ref.menuDidOpen();
    }
  }

  _callMenuDidClose(side) {
    const ref = this._getMenuRef(side);
    if (ref && ref.menuDidClose) {
      ref.menuDidClose();
    }
  }

  _updateLifeCyles(event) {
    const { value } = event;
    const {
      userProps: {
        openLeftMenuOffset,
        openRightMenuOffset
      }
    } = this.props;

    if (value < 0) {
      //right menu is opening
      if (!this._lifecyles.rightMightOpen && !this._isOpen) {
        this._lifecyles.rightMightOpen = true;
        this._callMenuMightOpen('right');
      }

      if (!this._isOpen && this._lifecyles.rightMightOpen && value == openRightMenuOffset) {
        this._callMenuDidOpen('right');
      }

    } else if (value > 0) {
      //left menu is opening
      if (!this._lifecyles.leftMightOpen && !this._isOpen) {
        this._lifecyles.leftMightOpen = true;
        this._callMenuMightOpen('left');
      }

      if (!this._isOpen && this._lifecyles.leftMightOpen && value == openLeftMenuOffset) {
        this._callMenuDidOpen('left');
      }

    } else {
      //something is closed let's find out which one
      if (this._lifecyles.rightMightOpen) {
        this._callMenuDidClose('right');
        this._lifecyles.rightMightOpen = false;
      } else if (this._lifecyles.leftMightOpen) {
        this._callMenuDidClose('left');
        this._lifecyles.leftMightOpen = false;
      }
    }
  }

  _handleMoveShouldSetPanResponder(e, gesture) {
    const {
      userProps: {
        LeftMenu, RightMenu, toleranceX, toleranceY
      }
    } = this.props;

    const dx = gesture.dx;
    const dy = gesture.dy;

    //in these two conditions we are checking
    // - which side we are trying to show
    // - does the component for that menu available
    // - has some one disable the menu by calling enableMenu
    if (dx > 0 && (!LeftMenu || !this._enabledLeftMenu)) {
      //we are not letting slider over to left if left menu doesn't pass
      return false;
    } else if (dx < 0 && (!RightMenu || !this._enabledRightMenu)) {
      //we are not letting slider over to right if right menu doesn't pass
      return false;
    }

    return (
      Math.round(Math.abs(dx)) > toleranceX &&
      Math.round(Math.abs(dy)) < toleranceY
    );
  }

  _handlePanResponderMove(e, gesture) {
    const {
      userProps: {
        openLeftMenuOffset,
        openRightMenuOffset
      }
    } = this.props;
    let value = this._prevValue + gesture.dx;

    if (!this._whichSide) {
      if (value > 0) {
        this._whichSide = 'left';
      } else {
        this._whichSide = 'right';
      }
    } else {
      if (value > 0 && this._whichSide == 'right') {
        value = 0;
      } else if (value < 0 && this._whichSide == 'left') {
        value = 0;
      }
    }

    if (value > 0) {
      value = value < openLeftMenuOffset? value : openLeftMenuOffset;
      this._showMenu('left');
    } else if (value < 0) {
      value = value > openRightMenuOffset? value : openRightMenuOffset;
      this._showMenu('right');
    }

    this._value.setValue(value);
  }

  _handlePanResponderEnd(e, gesture) {
    const { userProps: { offsetUntilOpen } } = this.props;
    //i need to detect whether I need to open or close the menu on any sides.
    const dx = gesture.dx;
    const absDx = Math.abs(dx);

    if (absDx > offsetUntilOpen && !this._isOpen) {
      if (dx < 0 && this._whichSide == 'right') {
        this.openMenu('right');
      } else if (dx > 0 && this._whichSide == 'left') {
        this.openMenu('left');
      }
    } else {
      this.closeMenu();
    }

    this._whichSide = null;
  }

  _wrappedMenuController(sceneAsChild) {
    const { userProps: { gestures } } = this.props;
    const panHandlers = gestures? this._responder.panHandlers : {};

    let sceneProps = sceneAsChild.props.sceneProps;
    sceneProps.menu = {
      open: this.openMenu.bind(this),
      close: this.closeMenu.bind(this),
      enable: (side) => { this.enableMenu(side, true); },
      disable: (side) => { this.enableMenu(side, false); }
    };

    const scene = React.cloneElement(sceneAsChild, {
      sceneProps: sceneProps
    });

    return (
      <Animated.View
        style={[styles.view, animationStyle(this._value)]}
        {...panHandlers}>
        {scene}
        {this._renderOverlay()}
      </Animated.View>
    );
  }

  _renderOverlay() {
    const value = this._position.__getValue();
    return (
      <Animated.View style={[styles.overlay, { opacity: this._overlayOpacity, top: -value.y, left: -value.x }]}>
        <TouchableWithoutFeedback onPress={() => { this.closeMenu() }}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}/>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }

  _showMenu(side) {
    let leftOpacityValue = 0,
        rightOpacityMenu = 0;

    if (side == 'left') {
      leftOpacityValue = 1;
      rightOpacityMenu = 0;
    } else if (side == 'right') {
      leftOpacityValue = 0;
      rightOpacityMenu = 1;
    }

    this._leftMenuOpacity.setValue(leftOpacityValue);
    this._rightMenuOpacity.setValue(rightOpacityMenu);
  }

  enableMenu(side, enable) {
    switch(side) {
      case 'left':
        this._enabledLeftMenu = !!enable;
        break;
      case 'right':
        this._enabledRightMenu = !!enable;
        break;
      default:
        //do nothing
    }
  }

  openMenu(side) {
    const {
      userProps: {
        openLeftMenuOffset,
        openRightMenuOffset
      }
    } = this.props;

    let toValue;
    if (side === 'left') {
      toValue = openLeftMenuOffset;
    } else {
      toValue = openRightMenuOffset;
    }

    this._showMenu(side);

    animationFunction(this._value, toValue).start(() => {
      this._prevValue = this._value.__getValue();
      //activate overaly
      this._overlayOpacity.setValue(1);

      this._isOpen = true;
    });
  }

  closeMenu() {
    animationFunction(this._value, 0).start(() => {
      this._prevValue = this._value.__getValue();
      //deactivate overlay
      this._overlayOpacity.setValue(0);
      //hide both menus
      this._showMenu();

      this._isOpen = false;
    });
  }

  renderBack() {
    const { userProps: { LeftMenu, RightMenu } } = this.props;

    return (
      <View style={styles.menuWrapper}>
        <Animated.View style={{ opacity: this._leftMenuOpacity }}>
          <LeftMenu key="leftMenu" ref="leftMenuRef"/>
        </Animated.View>
        <Animated.View style={{ opacity: this._rightMenuOpacity }}>
          <RightMenu key="rightMenu" ref="rightMenuRef"/>
        </Animated.View>
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

  componentWillMount() {
    this._responder = PanResponder.create({
      onStartShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
      onPanResponderMove: this._handlePanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderEnd.bind(this),
    });
  }
}

module.exports = CameraWith2SideMenus;
