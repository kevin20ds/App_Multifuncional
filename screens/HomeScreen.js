import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import IMCCalculator from '../widgets/IMCCalculator';
import TodoList from '../widgets/TodoList';

export default function HomeScreen({user, onOpenAccount, onLogout}){
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Bem-vindo{user && (' '+user.username)}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>IMC do Aplicativo</Text>
        <IMCCalculator />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lista de Tarefas</Text>
        <TodoList username={user ? user.username : null} />
      </View>

      <View style={{marginTop:12}}>
        <Button title='Gerenciar Conta' onPress={onOpenAccount} />
        <View style={{height:8}} />
        <Button title='Logout' onPress={onLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:16},
  header:{fontSize:20, marginBottom:12},
  card:{backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:12, shadowColor:'#000', shadowOpacity:0.06, elevation:2},
  cardTitle:{fontWeight:'700', marginBottom:8}
});
