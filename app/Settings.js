/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
'use strict';
import React, { Component } from 'react';
import {
  Text,
  Navigator,
  View,
  StyleSheet,
  Dimensions,
  ListView,
  TouchableHighlight
} from 'react-native';
var ListViewPrinter = require('./ListViewPrinter');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
var Settings = React.createClass({
getInitialState(){
  return {
      dataSource:ds.cloneWithRows(['Printer','contact']),
    };
},
  _onForward(title,ViewNavi) {
     
     return this.props.navigator.push(this.props.routes[3]);
  
  },
   renderRow(rowData){
      return  (
         <TouchableHighlight 
           onPress = {() => {this._onForward('List  Printer',ListViewPrinter);}}>
              <View style={styles.row}>
                <Text style={styles.text}>{rowData}</Text>
              </View>
       </TouchableHighlight>
      );  
    
  },
  render() { 
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
        />
    </View>
    );
  },
});

const styles = StyleSheet.create({
    container: {
    marginTop:50,
    flex:1,
    backgroundColor: '#F5FCFF',
    width:Dimensions.get('window').width,
  },
  row: {
    flex:1,
    flexWrap:'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding:20,
    backgroundColor: '#F6F6F6',
    borderWidth:2,
    marginHorizontal:10,
    marginBottom:5,
    
  },
  text: {
    flex: 1,
    flexDirection:'column',
    fontSize: 20,
    fontWeight: 'bold'
  },
   newGame: {
    backgroundColor: '#887765',
    padding: 20,
    borderRadius: 5,
  },
  newGameText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'AvenirNext-DemiBold',
  },
});

module.exports = Settings;