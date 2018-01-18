import React, { Component } from 'react';
import {
  StyleSheet,
  TabBarIOS,
  Text,
  View,
  Navigator,
  Dimensions
} from 'react-native';
var Cart = require('./Cart');
var Settings = require('./Settings');
var tabbarview = React.createClass({
  getInitialState: function() {
    return {
      selectedTab: 'setting',
      notifCount: 0,
      presses: 0,
    };
  },
 
  _renderContent: function(color: string, pageText: string, num?: number) {
    return (
      <View style={[styles.tabContent, {backgroundColor: color}]}>
        <Text style={styles.tabText}>{pageText}</Text>
        <Text style={styles.tabText}>{num} re-renders of the {pageText}</Text>
      </View>
    );
  },

  render: function() {
    return (
      <TabBarIOS
        unselectedTintColor="yellow"
        tintColor="white"
        barTintColor="darkslateblue">
        <TabBarIOS.Item
          title="setting"
          // icon={{uri:"./img/icon.png", scale: 3}}
          systemIcon= "more"
          selected={this.state.selectedTab === 'setting'}
          onPress={() => {
            this.setState({
              selectedTab: 'setting',
            });
          }}>
          <Settings routes = {this.props.routes} navigator ={ this.props.navigator}/>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          // icon={baricon}
          systemIcon= "history"
          title="commande"
          badge={this.state.notifCount > 0 ? this.state.notifCount : undefined}
          selected={this.state.selectedTab === 'commande'}
          onPress={() => {
            this.setState({
              selectedTab: 'commande',
              notifCount: this.state.notifCount + 1,
            });
          }}>
          {this._renderContent('#783E33', 'commande', this.state.notifCount)}
        </TabBarIOS.Item>
        <TabBarIOS.Item
          // icon={baricon}
          systemIcon= "bookmarks"
          renderAsOriginal
          title="order"
          selected={this.state.selectedTab === 'order'}
          onPress={() => {
            this.setState({
              selectedTab: 'order',
              presses: this.state.presses + 1
            });
          }}>
          <View style={styles.bar}>
        <Cart routes = {this.props.routes} navigator ={ this.props.navigator}/>
          </View>
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  },

});
var styles = StyleSheet.create({
   container: {
    flex:1,
    backgroundColor: '#F5FCFF',
    width:Dimensions.get('window').width,
    marginBottom:50,
    
  },
  tabContent: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  bar: {
    flex:1,
    flexWrap:'wrap',
    marginBottom:50
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
});
module.exports = tabbarview;