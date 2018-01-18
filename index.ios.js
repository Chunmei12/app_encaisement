'use strict';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  Dimensions,
  TouchableHighlight,
  TextInput
} from 'react-native';

var React = require('react');
var ReactNative = require('react-native');
var Cart = require('./app/Cart');
var TabBar = require('./app/TabBar');
var Login = require('./app/Login');
var Cart = require('./app/Cart');
var Settings = require('./app/Settings');
var ListViewPrinter = require('./app/ListViewPrinter');
const routes = [
  {title: 'Login', component:Login,index: 0},
  {title: 'TabBar', component:TabBar,index: 1},
  {title: 'Settings', component:Settings,index: 2},
  {title: 'ListViewPrinter', component:ListViewPrinter,index: 3},
  {title: 'Cart', component:Cart,index: 10},
];


var parpos = React.createClass({
  getInitialState(){
    return {
      selectedroute:routes[0],
      selectednavigator:null
    };
  },

  
  render() {
    return (
      <Navigator
        initialRoute={routes[0]}
        initialRouteStack={routes}
        renderScene={(route, navigator) =>
          <route.component routes={routes} navigator={navigator} />
        }
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={{
            LeftButton: (route, navigator, index, navState) =>
            { 
              return (
                <TouchableHighlight onPress={() => navigator.pop()}>
                  <Text>Back2</Text>
                </TouchableHighlight>); 
            },
            RightButton: (route, navigator, index, navState) =>
              { return (<Text>Done</Text>); },
            Title: (route, navigator, index, navState) =>
              { return (<Text>{route.title}</Text>); },
            }}
              style={styles.test1}
          />
        }
      />
    );
  }

});

var styles = StyleSheet.create({
    test1: {
      backgroundColor: 'dodgerblue',
    },
});

module.exports = parpos;
AppRegistry.registerComponent('parapos', () => parpos);