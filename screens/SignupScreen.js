import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({onBack, onCreated}){
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCreate = async ()=>{
    if(!username || !email || !password){ Alert.alert('Erro','Preencha todos os campos'); return; }
    try{
      const key = '@user_'+username;
      const exists = await AsyncStorage.getItem(key);
      if(exists){ Alert.alert('Erro','Usuário já existe'); return; }
      const user = {username, email, password, todos: [], profile:{}};
      await AsyncStorage.setItem(key, JSON.stringify(user));
      await AsyncStorage.setItem('@current_user', JSON.stringify(user));
      Alert.alert('Sucesso','Conta criada');
      onCreated(user);
    }catch(e){ Alert.alert('Erro','Falha ao salvar'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput placeholder='Usuário' value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder='Email' value={email} onChangeText={setEmail} style={styles.input} keyboardType='email-address' />
      <TextInput placeholder='Senha' value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title='Criar Conta' onPress={handleCreate} />
      <View style={{height:12}} />
      <Button title='Voltar' onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{padding:20, marginTop:40},
  title:{fontSize:22, marginBottom:12},
  input:{borderWidth:1,borderColor:'#ddd',padding:10,marginBottom:12,borderRadius:6,backgroundColor:'#fff'}
});
