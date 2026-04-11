import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, FlatList, Image, Switch, SafeAreaView, StatusBar, Platform 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Users, Phone, MessageSquare, Settings, Search, Plus, 
  ChevronRight, PhoneOutgoing, PhoneIncoming, PhoneMissed, 
  Check, CheckCheck, Pin, Bell, Shield, Smartphone, 
  Folder, Battery, HardDrive, Palette, Globe, Briefcase, HelpCircle, Info, Link, Mail, Lock
} from 'lucide-react-native';

// --- КОНФИГУРАЦИЯ ЦВЕТОВ (Приятный Graphite/Slate дизайн) ---
const THEME = {
  bg: '#1c1c1e', 
  surface: '#2c2c2e',
  surfaceLight: '#3a3a3c',
  primary: '#e94560', // Акцентный красный GAWX
  text: '#ffffff',
  muted: '#8e8e93',
  border: '#38383a'
};

// --- ДАННЫЕ ИЗ ТВОИХ СКРИНШОТОВ ---
const CHATS = [
  { id: '1', name: 'Карина', msg: 'Сказала скинет про нее видео', time: '15:11', pinned: true, read: true },
  { id: '2', name: 'Максим', msg: 'Норм', time: '12:54', read: true },
  { id: '3', name: 'Оля', msg: 'оо', time: '12:51', read: true },
  { id: '4', name: 'GAWX Support', msg: 'Добро пожаловать в GAWX!', time: 'вчера', unread: 1 },
];

const CALLS = [
  { id: '1', name: 'Карина', type: 'incoming', time: 'Вчера', dur: '12 мин' },
  { id: '2', name: 'Максим', type: 'outgoing', time: 'Вчера', dur: '45 с' },
  { id: '3', name: 'Оля', type: 'missed', time: '09.04' },
];

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---
const NavIcon = ({ Icon, color, size = 24 }) => <Icon color={color} size={size} />;

const MenuItem = ({ icon: Icon, label, color = THEME.primary, onPress, showArrow = false }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Icon color={color} size={22} />
    </View>
    <Text style={[styles.menuLabel, { color: color === THEME.primary ? THEME.primary : THEME.text }]}>{label}</Text>
    {showArrow && <ChevronRight color={THEME.border} size={20} />}
  </TouchableOpacity>
);

// --- ЭКРАНЫ ---

// 1. Контакты / Начать общение
function ContactsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Контакты</Text>
        <TouchableOpacity style={styles.headerBtn}><Plus color={THEME.text} size={24} /></TouchableOpacity>
      </View>
      <View style={styles.searchBar}>
        <Search color={THEME.muted} size={18} />
        <TextInput placeholder="Найти по имени" placeholderTextColor={THEME.muted} style={styles.searchInput} />
      </View>
      <ScrollView>
        <MenuItem icon={Users} label="Создать группу" />
        <MenuItem icon={Phone} label="Создать групповой звонок" />
        <MenuItem icon={MessageSquare} label="Создать приватный канал" />
        <MenuItem icon={Phone} label="Найти по номеру" />
        <MenuItem icon={Link} label="Пригласить по ссылке" />
        
        <Text style={styles.sectionHeader}>А</Text>
        <View style={styles.contactRow}><View style={styles.avatarSmall}/><Text style={styles.contactName}>Артём</Text></View>
        <View style={styles.contactRow}><View style={styles.avatarSmall}/><Text style={styles.contactName}>Алина</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 2. Звонки
function CallsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Звонки</Text></View>
      <MenuItem icon={Phone} label="Позвонить контакту" />
      <MenuItem icon={Link} label="Создать ссылку на звонок" />
      
      <View style={styles.tabSwitcher}>
        <TouchableOpacity style={[styles.tabBtn, styles.tabActive]}><Text style={styles.tabText}>Все</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}><Text style={styles.tabTextMuted}>Пропущенные</Text></TouchableOpacity>
      </View>

      <FlatList
        data={CALLS}
        renderItem={({item}) => (
          <View style={styles.chatRow}>
            <View style={styles.avatar} />
            <View style={{flex: 1, marginLeft: 15}}>
              <Text style={[styles.chatName, item.type === 'missed' && {color: THEME.primary}]}>{item.name}</Text>
              <Text style={styles.chatMsg}>{item.type === 'incoming' ? 'Входящий' : 'Исходящий'} • {item.time}</Text>
            </View>
            <Info color={THEME.muted} size={20} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// 3. Чаты
function ChatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Чаты</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.headerBtn}><Text style={{color: THEME.text}}>...</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, {backgroundColor: THEME.primary}]}><Plus color="#fff" size={20}/></TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={CHATS}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.chatRow}>
            <View style={styles.avatar} />
            <View style={{flex: 1, marginLeft: 15}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.chatName}>{item.name}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {item.read && <CheckCheck size={14} color={THEME.primary} style={{marginRight: 4}}/>}
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
                <Text style={styles.chatMsg} numberOfLines={1}>{item.msg}</Text>
                {item.pinned && <Pin size={14} color={THEME.muted} />}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// 4. Настройки GAWX
function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileSection}>
          <Image source={{uri: 'https://i.pravatar.cc/150?u=artem'}} style={styles.largeAvatar} />
          <Text style={styles.profileName}>тёмв</Text>
          <Text style={styles.profileStatus}>в сети</Text>
        </View>

        <TouchableOpacity style={styles.inviteBanner}>
          <Link color={THEME.primary} size={20} />
          <Text style={styles.inviteText}>Пригласить друзей</Text>
        </TouchableOpacity>

        <View style={styles.settingsGroup}>
          <MenuItem icon={Bell} label="Уведомления и звук" color={THEME.text} showArrow />
          <MenuItem icon={Shield} label="Безопасность" color={THEME.text} showArrow />
          <MenuItem icon={Smartphone} label="Устройства" color={THEME.text} showArrow />
          <MenuItem icon={MessageSquare} label="Сообщения" color={THEME.text} showArrow />
          <MenuItem icon={Folder} label="Папки" color={THEME.text} showArrow />
        </View>

        <View style={styles.settingsGroup}>
          <MenuItem icon={Battery} label="Экономия батареи и сети" color={THEME.text} showArrow />
          <MenuItem icon={HardDrive} label="Память" color={THEME.text} showArrow />
        </View>

        <View style={styles.settingsGroup}>
          <MenuItem icon={Palette} label="Оформление" color={THEME.text} showArrow />
          <MenuItem icon={Globe} label="Язык приложения" color={THEME.text} showArrow />
        </View>

        <View style={styles.settingsGroup}>
          <MenuItem icon={HelpCircle} label="Помощь" color={THEME.text} showArrow />
          <MenuItem icon={Info} label="О приложении GAWX" color={THEME.text} showArrow />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- НАВИГАЦИЯ ---
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.muted,
      }}>
        <Tab.Screen name="Контакты" component={ContactsScreen} options={{tabBarIcon: (p) => <NavIcon Icon={Users} {...p}/>}} />
        <Tab.Screen name="Звонки" component={CallsScreen} options={{tabBarIcon: (p) => <NavIcon Icon={Phone} {...p}/>}} />
        <Tab.Screen name="Чаты" component={ChatsScreen} options={{tabBarIcon: (p) => <NavIcon Icon={MessageSquare} {...p}/>}} />
        <Tab.Screen name="Настройки" component={SettingsScreen} options={{tabBarIcon: (p) => <NavIcon Icon={Settings} {...p}/>}} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --- СТИЛИ ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, marginTop: 10 },
  headerTitle: { color: THEME.text, fontSize: 32, fontWeight: 'bold' },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.surface, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, margin: 15, paddingHorizontal: 15, borderRadius: 10, height: 40 },
  searchInput: { color: THEME.text, marginLeft: 10, flex: 1 },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  menuIconContainer: { width: 30, alignItems: 'center', marginRight: 15 },
  menuLabel: { fontSize: 17, flex: 1 },
  
  sectionHeader: { color: THEME.primary, fontWeight: 'bold', padding: 15, backgroundColor: THEME.surface },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 15 },
  contactName: { color: THEME.text, fontSize: 17, marginLeft: 15 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.surfaceLight },

  chatRow: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: THEME.surfaceLight },
  chatName: { color: THEME.text, fontSize: 17, fontWeight: '600' },
  chatMsg: { color: THEME.muted, fontSize: 15, marginTop: 2 },
  chatTime: { color: THEME.muted, fontSize: 13 },

  tabSwitcher: { flexDirection: 'row', padding: 15 },
  tabBtn: { marginRight: 20, paddingBottom: 5 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: THEME.primary },
  tabText: { color: THEME.text, fontSize: 16, fontWeight: '600' },
  tabTextMuted: { color: THEME.muted, fontSize: 16 },

  profileSection: { alignItems: 'center', padding: 30 },
  largeAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  profileName: { color: THEME.text, fontSize: 24, fontWeight: 'bold' },
  profileStatus: { color: THEME.primary, marginTop: 5 },
  inviteBanner: { flexDirection: 'row', backgroundColor: THEME.surface, margin: 15, padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inviteText: { color: THEME.primary, fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  settingsGroup: { backgroundColor: THEME.surface, marginHorizontal: 15, marginBottom: 15, borderRadius: 12, overflow: 'hidden' },
  tabBar: { backgroundColor: THEME.surface, borderTopWidth: 0, height: 60 }
});
