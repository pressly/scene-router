const React = require('react-native');
const Camera = require('../base');

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
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: window.height,
    backgroundColor: 'transparent'
  },
  menu: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: window.height,
    backgroundColor: 'transparent'
  },
  sceneContainer: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width * 3,
    height: window.height
  },
  overlay: {
    overflow: 'hidden',
    position: 'absolute',
    left: 0, // this value will be modified by this._position in base camera class
    top: 0, // this value will be modified by this._position in base camera class
    backgroundColor: 'transparent',
    width: window.width,
    height: window.height,
    transform: [{ translate: [0,0,1] }] // This is needed to push overlay to next z layer
  }
});

const isObjectEmpty = (obj) => {
  return Object.getOwnPropertyNames(obj).length === 0;
};

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

    this._value = new Animated.Value(0);
    this._leftMenuWidthAnim = new Animated.Value(0);
    this._rightMenuWidthAnim = new Animated.Value(0);
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
    const ref = this.refs[refName].getInternalRef();

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
      value = value < openLeftMenuOffset ? value : openLeftMenuOffset;
      this._showMenu('left', value);
    } else if (value < 0) {
      value = value > openRightMenuOffset ? value : openRightMenuOffset;
      this._showMenu('right', value);
    }

    //this._value.setValue(value);
  }

  _handlePanResponderEnd(e, gesture) {
    const { userProps: { offsetUntilOpen } } = this.props;
    //i need to detect whether I need to open or close the menu on any sides.
    const dx = gesture.dx;
    const absDx = Math.abs(dx);

    if (absDx > offsetUntilOpen) {
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

  _wrappedMenuController(sceneAsChild, width, active) {
    const { scenes, userProps: { gestures } } = this.props;
    const panHandlers = gestures && active? this._responder.panHandlers : {};

    let sceneProps = sceneAsChild.props.sceneProps;
    sceneProps.menu = {
      open: this.openMenu.bind(this),
      close: this.closeMenu.bind(this),
      enable: (side, props={}) => { this.enableMenu(side, true, props); },
      disable: (side) => { this.enableMenu(side, false); }
    };

    sceneProps.scene = {
      //this fuction tells where the scene is located, if it is 1 it means
      //that this is only one scene and goback won't work.
      //it can also be use to determie whether scene needs to go back or do something else.
      position: () => scenes.length
    };

    const scene = React.cloneElement(sceneAsChild, {
      sceneProps: sceneProps
    });

    console.log('isOpen', this._isOpen);
    const overlay = (active && this._isOpen)? this._renderOverlay() : null;
    const animationStyleFn = (active)? animationStyle(this._value) : {};

    return (
      <Animated.View
        key={scene.key}
        style={[styles.sceneContainer, { width }, animationStyleFn]}
        {...panHandlers}>
        {scene}
        {overlay}
      </Animated.View>
    );
  }

  _renderOverlay() {
    const value = this._position.__getValue();
    return (
      <View style={[styles.overlay, { top: -value.y, left: -value.x }]}>
        <TouchableWithoutFeedback onPress={() => { this.closeMenu() }}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}/>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _showMenu(side, menuOffset) {
    let menuAnimation;

    if (side === 'left') {
      menuAnimation = animationFunction(this._leftMenuWidthAnim, Math.abs(menuOffset));
      //this.refs.leftMenuRef.show();
      //this.refs.rightMenuRef.hide();
    } else {
      menuAnimation = animationFunction(this._rightMenuWidthAnim, Math.abs(menuOffset));
      //this.refs.leftMenuRef.hide();
      //this.refs.rightMenuRef.show();
    }

    Animated.parallel([
      animationFunction(this._value, menuOffset),
      menuAnimation
    ]).start(() => {
      const wasClosed = !this._isOpen;
      this._prevValue = this._value.__getValue();
      this._isOpen = true;

      // If we haven't opened the menu yet, force render for overlays, etc.
      if (wasClosed) {
        this.forceUpdate();
      }
    });
  }

  enableMenu(side, enable, props = {}) {
    switch(side) {
      case 'left':
        this._enabledLeftMenu = !!enable;
        if (!isObjectEmpty(props)) {
          this.refs['leftMenuRef'].forceUpdateProps(props);
        }
        break;
      case 'right':
        this._enabledRightMenu = !!enable;
        if (!isObjectEmpty(props)) {
          this.refs['rightMenuRef'].forceUpdateProps(props);
        }
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

    this._showMenu(side, toValue);
  }

  closeMenu() {
    Animated.parallel([
      animationFunction(this._value, 0),
      animationFunction(this._leftMenuWidthAnim, 0),
      animationFunction(this._rightMenuWidthAnim, 0)
    ]).start(() => {
      const wasOpened = this._isOpen;
      this._prevValue = this._value.__getValue();
      this._isOpen = false;

      // If we haven't closed the menu yet, force render to remove overlays, etc.
      if (wasOpened) {
        this.forceUpdate();
      }
    });
  }

  renderBack(camera) {
    const {
      userProps: {
        LeftMenu,
        openLeftMenuOffset,
        RightMenu,
        openRightMenuOffset
      }
    } = this.props;

    return (
      <View style={styles.menuWrapper}>
        {camera}
        <Menu
          key="leftMenu"
          ref="leftMenuRef"
          component={LeftMenu}
          widthAnimatedValue={this._leftMenuWidthAnim}
          props={{
            closeMenu: this.closeMenu.bind(this)
          }}/>
        <Menu
          key="rightMenu"
          ref="rightMenuRef"
          component={RightMenu}
          widthAnimatedValue={this._rightMenuWidthAnim}
          props={{
            closeMenu: this.closeMenu.bind(this)
          }}/>
      </View>
    );
  }

  renderScenes(scenes) {
    const numberOfScenes = React.Children.count(scenes);
    const lastIndex = numberOfScenes - 1;
    return React.Children.map(scenes, (scene, index) => {
      return this._wrappedMenuController(scene, window.width * (numberOfScenes + 1), index == lastIndex);
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

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      props: props.props
    };
  }

  getInternalRef() {
    return this.refs['menu'];
  }

  forceUpdateProps(props) {
    this.setState({
      props
    });
  }

  /*
   * We only want to update when visibility changes OR if the props
   * passed to the menu changes.
   */
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.props !== this.state.props;
  }

  render() {
    const { props } = this.state;
    const { component: Component, widthAnimatedValue } = this.props;

    return (
      <Animated.View style={[styles.menu, { width: widthAnimatedValue }]}>
        <View style={{ width: window.width }}>
          <Component ref="menu" {...props}/>
        </View>
      </Animated.View>
    );
  }
}

module.exports = CameraWith2SideMenus;
