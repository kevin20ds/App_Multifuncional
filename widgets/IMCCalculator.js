import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function IMCCalculator(){
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  const calc = ()=>{
    const h = parseFloat(height.replace(',','.'));
    const w = parseFloat(weight.replace(',','.'));
    if(isNaN(h) || isNaN(w) || h<=0 || w<=0){ Alert.alert('Erro','Altura e peso inválidos'); return; }
    // height in meters expected
    const imc = w / (h*h);
    setResult(imc.toFixed(2));
  };

  return (
    <View>
      <TextInput placeholder='Altura (m) - ex: 1.75' value={height} onChangeText={setHeight} style={styles.input} keyboardType='numeric' />
      <TextInput placeholder='Peso (kg)' value={weight} onChangeText={setWeight} style={styles.input} keyboardType='numeric' />
      <Button title='Calcular IMC' onPress={calc} />
      {result && <Text style={{marginTop:8}}>Seu IMC: {result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input:{borderWidth:1,borderColor:'#ddd',padding:10,marginBottom:8,borderRadius:6,backgroundColor:'#fff'}
});
