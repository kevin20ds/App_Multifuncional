import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({onSignup, onLogin}){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async ()=>{
    if(!username || !password){ Alert.alert('Erro','Preencha usuário e senha'); return; }
    try{
      const key = '@user_'+username;
      const raw = await AsyncStorage.getItem(key);
      if(!raw){ Alert.alert('Erro','Usuário não encontrado'); return; }
      const user = JSON.parse(raw);
      if(user.password !== password){ Alert.alert('Erro','Senha incorreta'); return; }
      await AsyncStorage.setItem('@current_user', JSON.stringify(user));
      Alert.alert('Sucesso','Login realizado');
      onLogin(user);
    }catch(e){ Alert.alert('Erro','Falha ao acessar armazenamento'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <TextInput placeholder='Usuário' value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder='Senha' value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title='Login' onPress={handleLogin} />
      <View style={{height:12}} />
      <Button title='Criar conta' onPress={onSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{padding:20, marginTop:60},
  title:{fontSize:26, marginBottom:12},
  input:{borderWidth:1,borderColor:'#ddd',padding:10,marginBottom:12,borderRadius:6,backgroundColor:'#fff'}
});
