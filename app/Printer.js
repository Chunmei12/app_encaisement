

import React, { Component } from 'react';
import { NativeModules } from 'react-native';
var PrinterManager = NativeModules.PrinterManager;
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  AsyncStorage,
} from 'react-native';


var Printer = React.createClass({
   componentDidMount: function() {
        AsyncStorage.getItem("@MySuperStore:ipTarget").then((ipTarget) => {
            this.setState({"ipTarget": ipTarget});
        }).done();
   },

  goToPrinter(){
    var products = this.props.products;
    var totalTtc = this.props.totalTtc;
    var totalRemise = this.props.totalRemise;
    var totalNet = this.props.totalNet;
    var Remise = this.props.Remise;

    if (this.state.ipTarget)
      PrinterManager.generateReceipt({ipTarget: this.state.ipTarget, actions: [{"addLine": 1},
                                                                              {"subHeader": ['TABLE 3', '5 COUVERTS']},
                                                                              {"addDash": true},
                                                                              {"products": products},
                                                                              {"addDash": true},
                                                                              {"amount": {"totalTtc": totalTtc, "totalRemise": totalRemise, "Remise": Remise, "totalNet": totalNet}},
                                                                              {"addDash": true},
                                                                              {"subFooter": ['7/01/07 16:58 6153 05 0191 134', '1ST# 21 OP# 001 TE# 01 TR# 747']},
                                                                              {"addDash": true},
                                                                              {"footer": ['MERCI DE VOTRE VISITE', 'A BIENTOT']},
                                                                            ] 
      });
    else {
      alert('Printer not set');
    }
          

  },
  
  render() {

    return (
          <TouchableHighlight
            onPress={this.goToPrinter}
            underlayColor="transparent"
            activeOpacity={0.5}>
            <View style={styles.newGame}>
              <Text style={styles.newGameText}>printer</Text>
            </View>
          </TouchableHighlight>
     
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

module.exports = Printer;