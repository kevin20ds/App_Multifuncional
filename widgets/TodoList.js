import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TodoList({username}){
  const [text, setText] = useState('');
  const [todos, setTodos] = useState([]);

  const storageKey = username ? '@todos_'+username : '@todos_guest';

  useEffect(()=>{
    (async ()=>{
      const raw = await AsyncStorage.getItem(storageKey);
      if(raw) setTodos(JSON.parse(raw));
    })();
  }, []);

  const persist = async (newTodos)=>{
    setTodos(newTodos);
    await AsyncStorage.setItem(storageKey, JSON.stringify(newTodos));
  };

  const add = async ()=>{
    if(!text.trim()){ Alert.alert('Erro','Digite uma tarefa'); return; }
    const n = {id:Date.now().toString(), text: text.trim(), done:false};
    persist([n, ...todos]);
    setText('');
  };

  const toggle = async (id)=>{
    const updated = todos.map(t => t.id===id ? {...t, done: !t.done} : t);
    persist(updated);
  };

  const remove = async (id)=>{
    persist(todos.filter(t=>t.id!==id));
  };

  const edit = async (id)=>{
    const t = todos.find(x=>x.id===id);
    const newText = prompt ? prompt('Editar tarefa', t.text) : null;
    // prompt doesn't exist in RN - simple alert
    Alert.prompt && Alert.prompt('Editar', null, (val)=>{ if(val) persist(todos.map(x=> x.id===id ? {...x, text:val} : x)); }, 'plain-text', t.text);
  };

  return (
    <View>
      <View style={{flexDirection:'row', marginBottom:8}}>
        <TextInput placeholder='Nova tarefa' value={text} onChangeText={setText} style={styles.input} />
        <View style={{width:8}}/>
        <Button title='Adicionar' onPress={add} />
      </View>

      <FlatList data={todos} keyExtractor={item=>item.id} renderItem={({item})=>(
        <View style={styles.item}>
          <TouchableOpacity onPress={()=>toggle(item.id)} style={{flex:1}}>
            <Text style={{textDecorationLine: item.done ? 'line-through' : 'none'}}>{item.text}</Text>
          </TouchableOpacity>
          <Button title='Editar' onPress={()=>edit(item.id)} />
          <View style={{width:6}} />
          <Button title='Excluir' color='#cc0000' onPress={()=>remove(item.id)} />
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  input:{flex:1, borderWidth:1,borderColor:'#ddd',padding:8,borderRadius:6,backgroundColor:'#fff'},
  item:{flexDirection:'row', alignItems:'center', padding:8, borderBottomWidth:1, borderColor:'#eee'}
});
