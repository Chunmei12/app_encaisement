/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
'use strict';
import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ListView,
  AlertIOS,
  NativeModules,
  NativeAppEventEmitter,
  AsyncStorage
} from 'react-native';
var PrinterManager = NativeModules.PrinterManager;



var ListPrinter = React.createClass({

  _onForward(title,ViewNavi) {
    this.props.navigator.push({
      title: title,
      // component:ListViewPrinter,
    });
  },

  getInitialState() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return { 
      printers: [],
      selectedPrinter: {},
      dataSource: ds.cloneWithRows([]),
      searched: 0
    }
  },

  componentDidMount() {
    console.log("mount");

    var subscription = NativeAppEventEmitter.addListener(
      'foundPrinter',
      (printer) => {
        this.state.printers.push(printer);
        this.setState({dataSource: this.state.dataSource.cloneWithRows(this.state.printers)})
      }
    );
  },

  componentWillUnmount() {
    console.log("unmount");
  //  subscription.remove();
  },

  getListPrinter() {
    PrinterManager.searchDevice(this.state.searched);
    this.setState({
      printers: [],
      searched: this.state.searched + 1,
      dataSource: this.state.dataSource.cloneWithRows(this.state.printers)
    });
  },

  setSelectedPrinter(rowData) {
    try {
      this.setState({selectedPrinter: rowData});
      // AsyncStorage.removeItem('@MySuperStore:ipTarget');
      AsyncStorage.setItem('@MySuperStore:ipTarget', rowData.name);
    } catch (error) {
      // Error saving data
    }
  },

  renderRow(rowData){
      return  (
       <TouchableHighlight onPress={() => this.setSelectedPrinter(rowData)}>
              <View style={styles.row}>
                <Text style={styles.text}>{rowData.name}</Text>
              </View>
       </TouchableHighlight>
      );  
    
  },
  render() { 
    return (
      <View style={styles.container}>
        <View style={styles.selected}>
          <Text style={styles.textSelected}>SELECTED PRINTER: {this.state.selectedPrinter.name}</Text>
          <TouchableHighlight onPress={this.getListPrinter}>
            <View style={styles.reload}>
              <Text>Reload</Text>
            </View>
          </TouchableHighlight>
        </View>
        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
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
  list: {
    flex: 12,
  },
  selected: {
    flex: 1, 
    flexDirection: 'row',
    marginTop: 64,
  },
  textSelected: {
    flex: 6,
    fontSize: 16
  },
  reload: {
    flex: 1,
  },
  row: {
    flex:1,
    flexWrap:'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding:20,
    backgroundColor: '#F5FCFF',
    marginHorizontal:10,
    marginBottom:5,
    borderColor: '#989EA4',
    borderBottomWidth:1,
    borderTopWidth:1,
    // boderTopColor: '#989EA4',
  },
  text: {
    flex: 1,
    height: 30,
    flexDirection:'column',
    fontSize: 30,
    fontWeight: 'bold',
    color:'#989EA4',
    //textShadowColor:'#646A6E'
  },
});

module.exports = ListPrinter;