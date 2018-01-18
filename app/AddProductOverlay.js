

import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';


var AddProductOverlay = React.createClass({

  addQuantity() {
    this.props.scannedProduct.quantity++;
    this.forceUpdate();
  },

  removeQuantity() {
    if (this.props.scannedProduct.quantity > 1) {
      this.props.scannedProduct.quantity--;
      this.forceUpdate();
    }
  },
  

  
  render() {

    if (this.props.scannedProduct == null) {
      return <View />;
    }

    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayMessage}>{this.props.scannedProduct.name}</Text>
        <Text style={styles.overlayMessage}>{this.props.scannedProduct.price_ttc}</Text>

        <View style={styles.quantity}>
          <TouchableHighlight
            onPress={this.removeQuantity}
            underlayColor="transparent"
            activeOpacity={0.5}>
            <View style={styles.newGame}>
              <Text style={styles.newGameText}>-</Text>
            </View>
          </TouchableHighlight>
          <Text style={styles.overlayMessage}>{this.props.scannedProduct.quantity}</Text>      
          <TouchableHighlight
            onPress={this.addQuantity}
            underlayColor="transparent"
            activeOpacity={0.5}>
            <View style={styles.newGame}>
              <Text style={styles.newGameText}>+</Text>
            </View>
          </TouchableHighlight>
        </View>

        <View style={styles.quantity}>
          <TouchableHighlight
            onPress={this.props.cancelOverlay}
            underlayColor="transparent"
            activeOpacity={0.5}>
            <View style={styles.newGame}>
              <Text style={styles.newGameText}>Annuler</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={this.props.addProduct}
            underlayColor="transparent"
            activeOpacity={0.5}>
            <View style={styles.newGame}>
              <Text style={styles.newGameText}>Ajouter</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    height: 200,
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
  },
   col6:{
    flex:1,
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
  }
});

module.exports = AddProductOverlay;