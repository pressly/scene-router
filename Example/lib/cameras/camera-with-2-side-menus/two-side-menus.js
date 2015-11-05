const React = require('react-native');

const {
  Dimensions,
  StyleSheet,
  Component,
  PanResponder,
  View,
  Animated,
  TouchableWithoutFeedback
} = React;

const window = Dimensions.get('window');

const openLeftMenuOffset = window.width * 2 / 3;
const openRightMenuOffset = -openLeftMenuOffset;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  view: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'transparent',
    width: window.width,
    height: window.height
  }
});

class TwoSideMenus extends Component {
  constructor(props, context) {
    super(props, context);

    this._leftMenuOpacity = new Animated.Value(0);
    this._rightMenuOpacity = new Animated.Value(0);
    this._overlayOpacity = new Animated.Value(0);

    this._value = new Animated.Value(0);
    this._prevValue = 0;

    this._enabledLeftMenu = true;
    this._enabledRightMenu = true;

    this._isOpen = false;

    this._leftMenuRef = null;
    this._rightMenuRef = null;
    this._lifecyles = {
      rightMightOpen: false,
      leftMightOpen: false
    };
    this._value.addListener(this._updateLifeCyles.bind(this));
  }

  _callMenuMightOpen(ref) {
    if (ref && ref.menuMightOpen) {
      ref.menuMightOpen();
    }
  }

  _callMenuDidOpen(ref) {
    if (ref && ref.menuDidOpen) {
      ref.menuDidOpen();
    }
  }

  _callMenuDidClose(ref) {
    if (ref && ref.menuDidClose) {
      ref.menuDidClose();
    }
  }

  _updateLifeCyles(event) {
    const { value } = event;
    const { openLeftMenuOffset, openRightMenuOffset } = this.props;

    if (value < 0) {
      //right menu is opening
      if (!this._lifecyles.rightMightOpen && !this._isOpen) {
        this._lifecyles.rightMightOpen = true;
        this._callMenuMightOpen(this._rightMenuRef);
      }

      if (!this._isOpen && this._lifecyles.rightMightOpen && value == openRightMenuOffset) {
        this._callMenuDidOpen(this._rightMenuRef);
      }

    } else if (value > 0) {
      //left menu is opening
      if (!this._lifecyles.leftMightOpen && !this._isOpen) {
        this._lifecyles.leftMightOpen = true;
        this._callMenuMightOpen(this._leftMenuRef);
      }

      if (!this._isOpen && this._lifecyles.leftMightOpen && value == openLeftMenuOffset) {
        this._callMenuDidOpen(this._leftMenuRef);
      }

    } else {
      //something is closed let's find out which one
      if (this._lifecyles.rightMightOpen) {
        this._callMenuDidClose(this._rightMenuRef);
        this._lifecyles.rightMightOpen = false;
      } else if (this._lifecyles.leftMightOpen) {
        this._callMenuDidClose(this._leftMenuRef);
        this._lifecyles.leftMightOpen = false;
      }
    }
  }

  _handleMoveShouldSetPanResponder(e, gesture) {
    const { leftMenu, rightMenu, toleranceX, toleranceY } = this.props;

    const dx = gesture.dx;
    const dy = gesture.dy;

    //in these two conditions we are checking
    // - which side we are trying to show
    // - does the component for that menu available
    // - has some one disable the menu by calling enableMenu
    if (dx > 0 && (!leftMenu || !this._enabledLeftMenu)) {
      //we are not letting slider over to left if left menu doesn't pass
      return false;
    } else if (dx < 0 && (!rightMenu || !this._enabledRightMenu)) {
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

    if (value > 0) {
      value = value < openLeftMenuOffset? value : openLeftMenuOffset;
      this._showMenu('left');
    } else {
      value = value > openRightMenuOffset? value : openRightMenuOffset;
      this._showMenu('right');
    }

    this._value.setValue(value);
  }

  _handlePanResponderEnd(e, gesture) {
    const { offsetUntilOpen } = this.props;
    //i need to detect whether I need to open or close the menu on any sides.
    const dx = gesture.dx;
    const absDx = Math.abs(dx);

    if (absDx > offsetUntilOpen && !this._isOpen) {
      if (dx < 0) {
        this.openMenu('right');
      } else {
        this.openMenu('left');
      }
    } else {
      this.closeMenu();
    }
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
      animationFunction,
      openLeftMenuOffset,
      openRightMenuOffset
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
    const {
      animationFunction
    } = this.props;

    animationFunction(this._value, 0).start(() => {
      this._prevValue = this._value.__getValue();
      //deactivate overlay
      this._overlayOpacity.setValue(0);
      //hide both menus
      this._showMenu();

      this._isOpen = false;
    });
  }

  moreLifeCycles(leftMenuRef, rightMenuRef) {
    this._leftMenuRef = leftMenuRef;
    this._rightMenuRef = rightMenuRef;
  }

  componentWillMount() {
    this.responder = PanResponder.create({
      onStartShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
      onPanResponderMove: this._handlePanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderEnd.bind(this),
    });
  }

  _renderOverlay() {
    return (
      <Animated.View style={[styles.view, { opacity: this._overlayOpacity }]}>
        <TouchableWithoutFeedback onPress={() => { this.closeMenu() }}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}/>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }

  _renderContent() {
    const { animationStyle, gestures } = this.props;
    const panHandlers = gestures? this.responder.panHandlers : {};
    return (
      <Animated.View
        style={[styles.view, animationStyle(this._value)]}
        {...panHandlers}>
        {this.props.children}
        {this._renderOverlay()}
      </Animated.View>
    );
  }

  render() {
    const { leftMenu, rightMenu } = this.props;

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.view, { opacity: this._leftMenuOpacity }]}>
          {leftMenu}
        </Animated.View>
        <Animated.View style={[styles.view, { opacity: this._rightMenuOpacity }]}>
          {rightMenu}
        </Animated.View>
        {this._renderContent()}
      </View>
    );
  }
}

TwoSideMenus.propTypes = {
  gestures: React.PropTypes.bool,
  leftMenu: React.PropTypes.element,
  rightMenu: React.PropTypes.element,
  toleranceX: React.PropTypes.number,
  toleranceY: React.PropTypes.number,
  openLeftMenuOffset: React.PropTypes.number,
  openRightMenuOffset: React.PropTypes.number,
  offsetUntilOpen: React.PropTypes.number,
  animationStyle: React.PropTypes.func,
  animationFunction: React.PropTypes.func
};

TwoSideMenus.defaultProps = {
  gestures: true,
  toleranceX: 10,
  toleranceY: 10,
  openLeftMenuOffset: openLeftMenuOffset,
  openRightMenuOffset: openRightMenuOffset,
  offsetUntilOpen: 50,
  animationStyle: (value) => {
    return {
      transform: [
        {
          translateX: value,
        }
      ],
    };
  },
  animationFunction: (prop, value) => {
    return Animated.timing(
      prop,
      {
        toValue: value,
        duration: 300
      }
    );
  }
};

module.exports = TwoSideMenus;
