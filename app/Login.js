
'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  TextInput,
  Navigator
} from 'react-native';


var Login = React.createClass({
  getInitialState(){
    return {
      username:'',
      password:'',
    };
  },
login(){
  this.props.navigator.push(this.props.routes[1]);
},
  render() {
    return (
      
        <View style = {styles.container}>
          <TextInput 
            style = {styles.textinput} 
            placeholder = {this.state.username}
            value = {this.state.username}
            onChangeText={(text) => this.setState({username:text})}/>
          <TextInput 
            style = {styles.textinput} 
            placeholder = {this.state.password}
            value = {this.state.password}
            onChangeText={(text) => this.setState({password:text})}/>
          <TouchableHighlight onPress = {this.login}>
            <View style={styles.button}>
            <Text style ={styles.text}>login</Text>
            </View>
          </TouchableHighlight>
        </View>
          
       
    );
  },

});
var styles = StyleSheet.create({
   container: {
    flex:1,
    backgroundColor: '#F5FCFF',
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
    alignItems:'center',
    justifyContent:'center',
  },
  textinput:{
   alignSelf:'center',
   alignItems:'center',
   justifyContent:'center',
   height: 40, 
   borderColor: 'gray',
   borderWidth: 1,
   width:300,
  },
  button:{
   backgroundColor:'#99AAFF',
   borderRadius:5,
   borderWidth:1,
   borderColor:'#000033'
  },
  text: {
    fontSize:20,
  },
});

module.exports = Login;