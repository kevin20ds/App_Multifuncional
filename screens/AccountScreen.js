import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen({user, onBack, onUpdateUser}){
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  const save = async ()=>{
    if(!username || !email){ Alert.alert('Erro','Preencha campos'); return; }
    try{
      const key = '@user_'+username;
      // load original
      const originalKey = '@user_'+user.username;
      const raw = await AsyncStorage.getItem(originalKey);
      let stored = raw ? JSON.parse(raw) : {};
      stored.username = username;
      stored.email = email;
      // remove old key if username changed
      if(user.username !== username){
        await AsyncStorage.removeItem(originalKey);
      }
      await AsyncStorage.setItem(key, JSON.stringify(stored));
      await AsyncStorage.setItem('@current_user', JSON.stringify(stored));
      Alert.alert('Sucesso','Dados atualizados');
      onUpdateUser(stored);
      onBack();
    }catch(e){ Alert.alert('Erro','Falha ao salvar'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Conta</Text>
      <Text>Usuário atual: {user?.username}</Text>
      <TextInput value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType='email-address' />
      <Button title='Salvar Alterações' onPress={save} />
      <View style={{height:8}}/>
      <Button title='Voltar' onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{padding:16, marginTop:24},
  title:{fontSize:20, marginBottom:8},
  input:{borderWidth:1,borderColor:'#ddd',padding:10,marginBottom:12,borderRadius:6,backgroundColor:'#fff'}
});
