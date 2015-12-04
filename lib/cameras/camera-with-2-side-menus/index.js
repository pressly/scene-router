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

    this._currentOpeningSide = null;
    this._prevOpenedSide = null;

    this._isOpen = false;

    //Menus Lifecylce variables
    this._lifecyles = {
      rightMightOpen: false,
      leftMightOpen: false
    };
    this._value.addListener(this._updateLifeCyles.bind(this));


    // Menus that will be used later on in wrapCamera. These are here so they only instantiate once.
    const {
      userProps: {
        LeftMenu,
        RightMenu,
        openLeftMenuOffset,
        openRightMenuOffset
      }
    } = this.props;

    this._leftMenu = (
      <Menu key="leftMenu"
            ref="leftMenuRef"
            component={LeftMenu}
            style={{ width: Math.abs(openLeftMenuOffset), left: 0 }}
            props={{ closeMenu: this.closeMenu.bind(this) }}/>
    );

   this._rightMenu = (
      <Menu key="rightMenu"
            ref="rightMenuRef"
            component={RightMenu}
            style={{ width: Math.abs(openRightMenuOffset), right: 0 }}
            props={{ closeMenu: this.closeMenu.bind(this) }}/>
   );

    // Marks the currently active menu.
    this.state = { activeSide: null };
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
    let value = this._prevValue + gesture.dx;

    if (!this._currentOpeningSide) {
      if (value > 0) {
        this._currentOpeningSide = 'left';
      } else {
        this._currentOpeningSide = 'right';
      }
    } else {
      if (value > 0 && this._currentOpeningSide == 'right') {
        value = 0;
      } else if (value < 0 && this._currentOpeningSide == 'left') {
        value = 0;
      }
    }

    animationFunction(this._value, value).start(() => {
      const wasClosed = !this._isOpen;
      this._prevValue = this._value.__getValue();
      this._isOpen = true;

      // If the menu was originally closed, force a render so the views will reflect the correct ordering.
      if (wasClosed) {
        this.forceUpdate();
      }
    });
  }

  _handlePanResponderEnd(e, gesture) {
    const { userProps: { offsetUntilOpen } } = this.props;

    // Need to detect whether I need to open or close the menu on any sides.
    const { dx } = gesture;

    if (Math.abs(dx) > offsetUntilOpen) {
      if (dx < 0 && this._currentOpeningSide == 'right') {
        this.openMenu('right');
      } else if (dx > 0 && this._currentOpeningSide == 'left') {
        this.openMenu('left');
      }
    } else {
      this.closeMenu();
    }

    this._currentOpeningSide = null;
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

    const toValue =
      side === 'left'
        ? openLeftMenuOffset
        : openRightMenuOffset;

    animationFunction(this._value, toValue).start(() => {
      this._prevValue = this._value.__getValue();
      this._isOpen = true;
      this.setState({ activeSide: side });
    });

    this._prevOpenedSide = side;
  }

  closeMenu() {
    this.setState({ activeSide: null });
    animationFunction(this._value, 0).start(() => {
      this._prevValue = this._value.__getValue();
      this._isOpen = false;
      this._prevOpenedSide = null;
    });
  }

  wrapCamera(camera) {
    const { activeSide } = this.state;
    let orderedChildren;

    if (activeSide === 'left') {
      orderedChildren = [this._rightMenu, camera, this._leftMenu];
    } else if (activeSide === 'right') {
      orderedChildren = [this._leftMenu, camera, this._rightMenu];
    } else {
      // If user is currently opening the left side, move it above the right.
      if (this._currentOpeningSide === 'left') {
        orderedChildren = [this._rightMenu, this._leftMenu, camera];
      } else {
        orderedChildren = [this._leftMenu, this._rightMenu, camera];
      }
    }

    return (
      <View style={styles.menuWrapper}>
        { orderedChildren }
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
  constructor(baseProps) {
    super(baseProps);
    this.state = { props: baseProps.props };
  }

  getInternalRef() {
    return this.refs['menu'];
  }

  forceUpdateProps(props) {
    this.setState({ props });
  }

  render() {
    const { props } = this.state;
    const { component: Component, style } = this.props;

    return (
      <Animated.View style={[styles.menu, style]}>
        <Component ref="menu" {...props}/>
      </Animated.View>
    );
  }
}

module.exports = CameraWith2SideMenus;
