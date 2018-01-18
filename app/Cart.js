/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ListView,
  AlertIOS,
  TextInput,
} from 'react-native';
import Camera from 'react-native-camera';
var AddProductOverlay = require('./AddProductOverlay');
var Printer = require('./Printer');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var chars = [];
var pressed = false;

var Cart = React.createClass({
  
  getInitialState() {
    return { scan: true, 
            scannedProduct: null,
            res: new Array() ,
            dataSource:ds.cloneWithRows(['']),
            total:0,
            remisetotal:0,
            remise:0,
            net:0,
            pressed: false,
    }
  },

  componentDidMount() {
    this.refs.barcodeInput.focus();
  },
  
  cancelOverlay() {
    this.setState({
      scannedProduct: null,
      scan: true
    })
    this.refs.barcodeInput.focus();
  },

  addProduct() {
    this.state.scannedProduct.totalTtc = (Number(this.state.scannedProduct.quantity)*Number(this.state.scannedProduct.price_ttc)).toFixed(2);
    this.state.res.push(this.state.scannedProduct);
    this.state.dataSource = ds.cloneWithRows(this.state.res);
    this.state.total=Number(this.state.total)+Number(this.state.scannedProduct.price_ttc)*Number(this.state.scannedProduct.quantity);
    this.state.net=this.state.total;
    this.state.scannedProduct = null;
    this.forceUpdate();
    this.state.scan = true;
    this.refs.barcodeInput.focus();
  },

  renderRow(rowData) {
    if (this.state.res.length <=0){
      return <View />
    } else{
      return  (
        <View style={styles.orderstyle}>
          <Text style={styles.col1}>{rowData.quantity}x</Text>
          <Text style={styles.col2}>{rowData.name}</Text>
          <Text style={styles.col3}>{rowData.price_ttc}</Text>
          <Text style={styles.col4}>{rowData.totalTtc }</Text>
        </View>
      );
    }
  },

  changeremise() {
    AlertIOS.prompt(
      'Enter remise',
      'Enter your remise to reduce the cost',
      [
        {text: 'Cancel', onPress: () => this.refs.barcodeInput.focus(), style: 'cancel'},
        {text: 'OK', onPress: remise => {
          this.setState({
            remisetotal: Number(this.state.total)*Number(remise)/100,
            net: Number(this.state.total)-Number(this.state.total)*Number(remise)/100,
            remise: remise,
          })
          this.refs.barcodeInput.focus();
        }},
      ],
      'plain-text',
    );
  },

  handleKeyDown(e) {
  
        if (e.nativeEvent.key >= 0 && e.nativeEvent.key <= 9) {
            chars.push(e.nativeEvent.key);
        }
        console.log(e.nativeEvent.key + ":" + chars.join("|"));
        if (pressed == false) {
            setTimeout(() => {
                if (chars.length >= 10) {
                    var barcode = chars.join(""); 
                    this.barcodeResult({'data': barcode});
                }
                chars = [];
                pressed = false;
                this.refs.barcodeInput.focus();
                this.refs.barcodeInput.clear(0);
            }, 500);
        }
        pressed = true;

  },


  render() { 
    return (
      <View style={styles.container}>
          <Camera
            ref={(cam) => {
              this.camera = cam;
            }}
            style={styles.preview}
            aspect={Camera.constants.Aspect.fill}
            onBarCodeRead={this.barcodeResult}>
        </Camera>
      

        <TextInput
          ref='barcodeInput'
          style={styles.additionalTextInput}
          keyboardType="numeric"
          onKeyPress={this.handleKeyDown}
        />

        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
        />

        <View style={styles.remiseview}>
          <Text style={styles.col6}>Total TTC: {this.state.total.toFixed(2)}€</Text>   
          <Text style={styles.col6}>--------------------------------------------------------</Text>   
          <Text style={styles.col5} >Total remise: {this.state.remisetotal.toFixed(2)}€  (-{this.state.remise}%)</Text>
          <Text style={styles.col5} >Net à payé: {this.state.net.toFixed(2)}€</Text>
        </View>
         
        <AddProductOverlay 
          scannedProduct={this.state.scannedProduct}
          cancelOverlay={this.cancelOverlay}  
          addProduct={ this.addProduct }
        />
        <TouchableHighlight
          onPress={this.changeremise}
          underlayColor="transparent"
          activeOpacity={0.5}>
            <View style={styles.remise}>
              <Text style={styles.newGameText}>remise</Text>
            </View>
        </TouchableHighlight>
        <Printer 
            products={this.state.res}
            totalTtc={this.state.total.toFixed(2)}
            totalRemise={this.state.remisetotal.toFixed(2)}
            totalNet={this.state.net.toFixed(2)}
            Remise = {this.state.remise}
        />
    </View>
    );
  },

  barcodeResult(res) {

    if (this.state.scan) {
      // var barcode = res.data;
      // fetch('http://192.168.1.45:3000/product/barcode/' + barcode, {method: 'GET',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjVlMDVmOWUxYTk5MmJkNjc3MWE1NTgiLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNDY3NjUxOTYwLCJpYXQiOjE0Njc1NjU1NjB9.GC3X2wJe8QfGPy41hx4bc_A264kR4ggmunzAndkIK8s',
      //   }})
      //   .then((response) => response.json())
      //   .then((responseJson) => {
      //     this.state.scannedProduct = responseJson;
      //     this.state.scannedProduct.quantity = 1;
      //   })
      //   .catch((error) => {
      //     console.warn(error);
      //   });

           this.state.scannedProduct = { _id: '57557de2ac3904b102a4a08c',
                                   name: 'Dexeryl Creme',
                                   buying_price: '0',
                                   price: '4.58',
                                   vat: 
                                   { _id: '56210ba9ba2194581f537401',
                                     pourcentage: '20',
                                     __v: 0,
                                     created_at: '2015-10-16T14:37:29.768Z',
                                     updated_at: '2015-10-16T14:37:29.768Z' },
                                   __v: 0,
                                   price_ttc: '5.50',
                                   category: null,
                                   manufacturer: 
                                   { _id: '5776ba2d624db9b002e1a268',
                                     name: 'Autre',
                                     __v: 0,
                                     created_at: '2016-07-01T18:45:01.947Z',
                                     updated_at: '2016-07-01T18:45:01.946Z' },
                                   barcode: '3400934044595',
                                   created_at: '2016-06-06T13:42:58.371Z',
                                   updated_at: '2016-07-01T18:46:49.535Z',
                                   deleted: false,
                                   packQuantity: 0,
                                   packManagement: false,
                                   stockQuantity: 0,
                                   stockManagement: false,
                                   quantity: 1 }
      this.state.scan = false;
    }

    this.forceUpdate();
  }

});

const styles = StyleSheet.create({
  container: {
    marginBottom:50,
    flex:1,
    flexWrap:'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  orderstyle: {
    flexDirection:'row',
    backgroundColor: '#F5FCFF',
    flexWrap:'wrap',
    width:500,
  },
  col1:{
    flex:1,
    alignSelf:'auto',
  },
  col2:{
    flex:2,
    alignSelf:'auto',
  },
  col3:{
    flex:1,
    alignSelf:'auto',
  },
  col4:{
    flex:1,
    alignSelf:'auto',
  },
  remiseview: {
    flexDirection:'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width:500,
    backgroundColor: '#F5FCFF',
  },
  col5:{
    flex:1,
    alignSelf:'auto',
  },
   col6:{
    flex:1,
    alignSelf:'auto',
    // textDecorationLine: 'line-through'
  },

  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(221, 221, 221, 0.8)',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayMessage: {
    fontSize: 40,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    fontFamily: 'AvenirNext-DemiBold',
    textAlign: 'center',
  },
  newGame: {
    backgroundColor: '#887765',
    padding: 20,
    borderRadius: 5,
  },
    remise: {
    flex:1,
    justifyContent:'flex-end',
    backgroundColor: '#887765',
    padding: 20,
    borderRadius: 5,
  },
  newGameText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'AvenirNext-DemiBold',
  },
  quantity: {
    flex: 1,
    flexDirection: 'row'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 80,
    marginTop: 20,
    width: Dimensions.get('window').width,
    borderWidth: 8.5,
    borderColor: 'green',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40,
    height:400,
  },
  additionalTextInput: {
    backgroundColor: 'red',
    height: 0,
  },
});

module.exports = Cart;