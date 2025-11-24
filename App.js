import React, {useState, useEffect} from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import AccountScreen from './screens/AccountScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App(){
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login'); // 'login','signup','home','account'

  useEffect(()=>{ // try auto-login
    (async ()=>{
      try{
        const u = await AsyncStorage.getItem('@current_user');
        if(u) {
          setUser(JSON.parse(u));
          setScreen('home');
        }
      }catch(e){}
    })();
  },[]);

  const handleLogout = async ()=>{
    await AsyncStorage.removeItem('@current_user');
    setUser(null);
    setScreen('login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen==='login' && <LoginScreen onSignup={()=>setScreen('signup')} onLogin={(u)=>{setUser(u); setScreen('home');}} />}
      {screen==='signup' && <SignupScreen onBack={()=>setScreen('login')} onCreated={(u)=>{setUser(u); setScreen('home');}} />}
      {screen==='home' && <HomeScreen user={user} onOpenAccount={()=>setScreen('account')} onLogout={handleLogout} />}
      {screen==='account' && <AccountScreen user={user} onBack={()=>setScreen('home')} onUpdateUser={(u)=>setUser(u)} />}
      <View style={styles.footer}><Text style={{fontSize:12,color:'#666'}}>React Native - IMC + Todo App (simple)</Text></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:'#f7f7fb'},
  footer:{alignItems:'center', padding:8}
});
