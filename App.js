import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, PhoneAuthProvider, signInWithCredential, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Phone, MessageSquare, Users, Settings, Send, ShieldCheck } from 'lucide-react-native';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAY96OYOpqFgCI-Bxtt0Q3xj1BtzdnmWMI",
  authDomain: "dogx-base.firebaseapp.com",
  databaseURL: "https://dogx-base-default-rtdb.firebaseio.com",
  projectId: "dogx-base",
  storageBucket: "dogx-base.firebasestorage.app",
  messagingSenderId: "81713249793",
  appId: "1:81713249793:web:540bb07ec6bf97b9a78a00"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const Tab = createBottomTabNavigator();

// --- SCREENS ---

// 1. Экран Чата (Реальное время)
function ChatDetail({ route }) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const { chatId } = route?.params || { chatId: 'global_chat' };

  useEffect(() => {
    const msgRef = ref(db, `messages/${chatId}`);
    return onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.values(data) : [];
      setMessages(list.reverse());
    });
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;
    const msgRef = ref(db, `messages/${chatId}`);
    push(msgRef, {
      text: msg,
      sender: auth.currentUser?.phoneNumber || 'Anon',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setMsg('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <FlatList 
        inverted
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={[styles.msgBubble, item.sender === auth.currentUser?.phoneNumber ? styles.myMsg : styles.theirMsg]}>
            <Text style={styles.msgText}>{item.text}</Text>
            <Text style={styles.msgTime}>{item.time}</Text>
          </View>
        )}
      />
      <View style={styles.inputArea}>
        <TextInput style={styles.chatInput} value={msg} onChangeText={setMsg} placeholder="Введите сообщение..." placeholderTextColor="#444" />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}><Send color="#fff" size={20} /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// 2. Список Чатов
function ChatsScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chatListItem}>
        <View style={styles.avatar}><Text style={{color: '#fff'}}>GA</Text></View>
        <View style={{flex: 1}}>
          <Text style={styles.chatName}>GAWX Support 🔒</Text>
          <Text style={styles.chatLastMsg}>Система готова к работе.</Text>
        </View>
        <Text style={styles.chatTime}>Now</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: Code

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  if (!user) {
    return (
      <View style={styles.loginFull}>
        <ShieldCheck color="#ff0000" size={80} style={{marginBottom: 20}} />
        <Text style={styles.logoText}>GAWX</Text>
        <Text style={styles.subText}>ULTIMATE MESSENGER</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder={step === 1 ? "+7 (999) 000-00-00" : "000000"} 
          placeholderTextColor="#333"
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        
        <TouchableOpacity style={styles.loginBtn} onPress={() => setStep(2)}>
          <Text style={styles.btnText}>{step === 1 ? "ПОЛУЧИТЬ КОД" : "ПОДТВЕРДИТЬ"}</Text>
        </TouchableOpacity>
        
        {/* Фейковая кнопка для обхода в тестах */}
        <TouchableOpacity onPress={() => setUser({phoneNumber: '+79991234567'})} style={{marginTop: 20}}>
          <Text style={{color: '#222'}}>Demo Bypass</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
        headerTintColor: '#fff',
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#ff0000',
        tabBarInactiveTintColor: '#333',
        tabBarShowLabel: false,
      }}>
        <Tab.Screen name="Contacts" component={ChatsScreen} options={{ tabBarIcon: ({color}) => <Users color={color} /> }} />
        <Tab.Screen name="Calls" component={ChatsScreen} options={{ tabBarIcon: ({color}) => <Phone color={color} /> }} />
        <Tab.Screen name="Chats" component={ChatDetail} options={{ tabBarIcon: ({color}) => <MessageSquare color={color} /> }} />
        <Tab.Screen name="Settings" component={ChatsScreen} options={{ tabBarIcon: ({color}) => <Settings color={color} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --- STYLES (GAWX DESIGN SYSTEM) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loginFull: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 60, fontWeight: '900', letterSpacing: 10 },
  subText: { color: '#ff0000', fontSize: 12, fontWeight: 'bold', marginBottom: 50, letterSpacing: 3 },
  input: { width: '80%', backgroundColor: '#0f0f0f', color: '#fff', padding: 20, borderRadius: 15, borderBottomWidth: 2, borderBottomColor: '#ff0000', marginBottom: 20, fontSize: 18, textAlign: 'center' },
  loginBtn: { width: '80%', backgroundColor: '#ff0000', padding: 20, borderRadius: 15, alignItems: 'center', shadowColor: '#ff0000', shadowRadius: 15, elevation: 10 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  tabBar: { backgroundColor: '#0a0a0a', borderTopWidth: 1, borderTopColor: '#1a1a1a', height: 70 },
  chatListItem: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#111', alignItems: 'center' },
  avatar: { width: 55, height: 55, borderRadius: 20, backgroundColor: '#1a1a1a', marginRight: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  chatName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatLastMsg: { color: '#555', fontSize: 14, marginTop: 4 },
  chatTime: { color: '#333', fontSize: 12 },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#0f0f0f', alignItems: 'center' },
  chatInput: { flex: 1, color: '#fff', padding: 10 },
  sendBtn: { backgroundColor: '#ff0000', padding: 10, borderRadius: 10, marginLeft: 10 },
  msgBubble: { padding: 12, borderRadius: 15, marginVertical: 5, maxWidth: '80%', marginHorizontal: 15 },
  myMsg: { alignSelf: 'flex-end', backgroundColor: '#ff0000' },
  theirMsg: { alignSelf: 'flex-start', backgroundColor: '#1a1a1a' },
  msgText: { color: '#fff', fontSize: 16 },
  msgTime: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'right', marginTop: 5 }
});
