import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, FlatList, Image, Switch, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Users, Phone, MessageSquare, Settings, Search, Plus, 
  ChevronRight, PhoneOutgoing, PhoneIncoming, PhoneMissed, 
  Check, CheckCheck, Pin, Info, Bell, Shield, Smartphone, 
  Folder, Battery, HardDrive, Palette, Globe, Briefcase, HelpCircle, Info as InfoIcon, Link
} from 'lucide-react-native';

// ==========================================
// 1. КОНФИГУРАЦИЯ И ДАННЫЕ (Фейковые данные для красоты)
// ==========================================

const COLORS = {
  bg: '#0a0a0a',
  surface: '#111111',
  surfaceLight: '#1a1a1a',
  primary: '#a04a44', // Тот самый красный из твоего дизайна
  primaryActive: '#ff3333',
  text: '#ffffff',
  textMuted: '#777777',
  textDark: '#444444',
  border: '#222222'
};

const DUMMY_CHATS = [
  { id: '1', name: 'Карина', msg: 'Сказала скинет про нее видео', time: '15:11', unread: 0, pinned: true, read: true },
  { id: '2', name: 'Максим', msg: 'Норм', time: '12:54', unread: 0, pinned: false, read: true },
  { id: '3', name: 'Оля', msg: 'оо', time: '12:51', unread: 0, pinned: false, read: true },
  { id: '4', name: 'Секретный Чат', msg: 'теперь в MAX. Напишите что-нибудь!', time: 'вчера', unread: 2, pinned: false, read: false },
  { id: '5', name: 'Влад', msg: 'Еще очень странные дела', time: '09.04', unread: 0, pinned: false, read: true },
];

const DUMMY_CALLS = [
  { id: '1', name: 'Карина', type: 'incoming', time: 'Вчера', duration: '2 мин' },
  { id: '2', name: 'Максим', type: 'outgoing', time: 'Вчера', duration: '15 с' },
  { id: '3', name: 'Оля', type: 'missed', time: '09.04', duration: 'Пропущенный' },
  { id: '4', name: 'Влад', type: 'missed', time: '08.04', duration: 'Пропущенный' },
];

// ==========================================
// 2. ГЛОБАЛЬНЫЕ КОМПОНЕНТЫ UI
// ==========================================

const Avatar = ({ name, size = 50 }) => (
  <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
    <Text style={[styles.avatarText, { fontSize: size / 2.5 }]}>{name.charAt(0)}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const SearchBar = ({ placeholder }) => (
  <View style={styles.searchSection}>
    <Search color={COLORS.textMuted} size={20} />
    <TextInput style={styles.searchInput} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} />
  </View>
);

// ==========================================
// 3. ЭКРАНЫ ПРИЛОЖЕНИЯ
// ==========================================

// --- ЭКРАН "КОНТАКТЫ" ---
function ContactsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Контакты</Text>
        <TouchableOpacity style={styles.iconButton}><Plus color={COLORS.text} size={24} /></TouchableOpacity>
      </View>
      <SearchBar placeholder="Найти по имени или номеру" />
      
      <ScrollView>
        {/* Меню "Начать общение" из твоего фото */}
        <TouchableOpacity style={styles.actionRow}>
          <Users color={COLORS.primary} size={24} />
          <Text style={styles.actionText}>Создать группу</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Phone color={COLORS.primary} size={24} />
          <Text style={styles.actionText}>Создать групповой звонок</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <MessageSquare color={COLORS.primary} size={24} />
          <Text style={styles.actionText}>Создать приватный канал</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Phone color={COLORS.primary} size={24} />
          <Text style={styles.actionText}>Найти по номеру</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Link color={COLORS.primary} size={24} />
          <Text style={styles.actionText}>Пригласить по ссылке</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionLetter}>A</Text>
        <View style={styles.contactItem}><Avatar name="Антон" size={40}/><Text style={styles.contactName}>Антон Смирнов</Text></View>
        <View style={styles.contactItem}><Avatar name="Алина" size={40}/><Text style={styles.contactName}>Алина (Работа)</Text></View>
        <Text style={styles.sectionLetter}>B</Text>
        <View style={styles.contactItem}><Avatar name="Влад" size={40}/><Text style={styles.contactName}>Влад</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ЭКРАН "ЗВОНКИ" ---
function CallsScreen() {
  const [activeTab, setActiveTab] = useState('all'); // all или missed

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={[styles.headerTitle, {paddingHorizontal: 15, paddingTop: 10}]}>Звонки</Text>
      
      <View style={styles.callActionsBox}>
        <TouchableOpacity style={styles.actionRow}>
          <PhoneOutgoing color={COLORS.primary} size={22} />
          <Text style={styles.actionText}>Позвонить контакту</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Link color={COLORS.primary} size={22} />
          <Text style={styles.actionText}>Создать групповой звонок</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.callTabs}>
        <TouchableOpacity onPress={() => setActiveTab('all')} style={[styles.callTabBtn, activeTab === 'all' && styles.callTabActive]}>
          <Text style={[styles.callTabText, activeTab === 'all' && styles.callTabTextActive]}>Все</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('missed')} style={[styles.callTabBtn, activeTab === 'missed' && styles.callTabActive]}>
          <Text style={[styles.callTabText, activeTab === 'missed' && styles.callTabTextActive]}>Пропущенные</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_CALLS.filter(c => activeTab === 'all' ? true : c.type === 'missed')}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.callItem}>
            <Avatar name={item.name} size={50} />
            <View style={styles.callItemInfo}>
              <Text style={[styles.callName, item.type === 'missed' && {color: COLORS.primary}]}>{item.name}</Text>
              <View style={styles.callDetailsRow}>
                {item.type === 'incoming' && <PhoneIncoming size={14} color={COLORS.textMuted} />}
                {item.type === 'outgoing' && <PhoneOutgoing size={14} color={COLORS.textMuted} />}
                {item.type === 'missed' && <PhoneMissed size={14} color={COLORS.primary} />}
                <Text style={styles.callTimeText}> {item.duration} • {item.time}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.infoBtn}>
              <InfoIcon size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// --- ЭКРАН "ЧАТЫ" ---
function ChatsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Чаты</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.iconButton}><Text style={{color: COLORS.textMuted}}>...</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, {backgroundColor: COLORS.primary, borderRadius: 20}]}>
            <Plus color={COLORS.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.chatItem}>
            <Avatar name={item.name} size={55} />
            <View style={styles.chatItemCenter}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatMsg} numberOfLines={1}>{item.msg}</Text>
            </View>
            <View style={styles.chatItemRight}>
              <View style={styles.chatTimeRow}>
                {item.read ? <CheckCheck size={14} color={COLORS.primary} style={{marginRight: 4}}/> : null}
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
              <View style={styles.chatBadgeRow}>
                {item.pinned && <Pin size={14} color={COLORS.textMuted} style={{marginTop: 5}}/>}
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// --- ЭКРАН "НАСТРОЙКИ" ---
function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const SettingRow = ({ icon, label, hasArrow = true, switchValue, onSwitch }) => (
    <TouchableOpacity style={styles.settingRow} disabled={!!onSwitch}>
      <View style={styles.settingIconBox}>{icon}</View>
      <Text style={styles.settingLabel}>{label}</Text>
      {hasArrow && !onSwitch && <ChevronRight size={20} color={COLORS.textDark} />}
      {onSwitch && <Switch value={switchValue} onValueChange={onSwitch} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#fff" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        {/* Профиль как на скрине */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarLarge}>
            <Image 
              source={{uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}} 
              style={{width: 100, height: 100, borderRadius: 50}} 
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={{color: '#fff', fontSize: 12}}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>тёмв</Text>
        </View>

        <TouchableOpacity style={styles.inviteBox}>
          <Link color={COLORS.primary} size={20} style={{marginRight: 10}} />
          <Text style={{color: COLORS.primary, fontSize: 16, fontWeight: 'bold'}}>Пригласить друзей</Text>
        </TouchableOpacity>

        <View style={styles.settingsBlock}>
          <SettingRow icon={<Bell color={COLORS.textMuted} size={22}/>} label="Уведомления и звук" />
          <SettingRow icon={<Shield color={COLORS.textMuted} size={22}/>} label="Безопасность" />
          <SettingRow icon={<Smartphone color={COLORS.textMuted} size={22}/>} label="Устройства" />
          <SettingRow icon={<MessageSquare color={COLORS.textMuted} size={22}/>} label="Сообщения" />
          <SettingRow icon={<Folder color={COLORS.textMuted} size={22}/>} label="Папки" />
        </View>

        <View style={styles.settingsBlock}>
          <SettingRow icon={<Battery color={COLORS.textMuted} size={22}/>} label="Экономия батареи и сети" />
          <SettingRow icon={<HardDrive color={COLORS.textMuted} size={22}/>} label="Память" />
        </View>

        <View style={styles.settingsBlock}>
          <SettingRow icon={<Palette color={COLORS.textMuted} size={22}/>} label="Оформление" />
          <SettingRow icon={<Globe color={COLORS.textMuted} size={22}/>} label="Язык приложения" />
          <SettingRow icon={<Settings color={COLORS.textMuted} size={22}/>} label="Темная тема" onSwitch={setIsDarkMode} switchValue={isDarkMode} />
        </View>

        <View style={styles.settingsBlock}>
          <SettingRow icon={<Briefcase color={COLORS.textMuted} size={22}/>} label="MAX для бизнеса" />
        </View>

        <View style={styles.settingsBlock}>
          <SettingRow icon={<HelpCircle color={COLORS.textMuted} size={22}/>} label="Помощь" />
          <SettingRow icon={<InfoIcon color={COLORS.textMuted} size={22}/>} label="О приложении" />
        </View>
        <View style={{height: 50}} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 4. ГЛАВНЫЙ НАВИГАТОР (Корпус приложения)
// ==========================================

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: { fontSize: 11, marginBottom: 5, fontWeight: '500' },
            tabBarIconStyle: { marginTop: 5 }
          }}
        >
          <Tab.Screen 
            name="Контакты" 
            component={ContactsScreen} 
            options={{ tabBarIcon: ({color}) => <Users color={color} size={24} /> }} 
          />
          <Tab.Screen 
            name="Звонки" 
            component={CallsScreen} 
            options={{ tabBarIcon: ({color}) => <Phone color={color} size={24} /> }} 
          />
          <Tab.Screen 
            name="Чаты" 
            component={ChatsScreen} 
            options={{ tabBarIcon: ({color}) => <MessageSquare color={color} size={24} /> }} 
          />
          <Tab.Screen 
            name="Настройки" 
            component={SettingsScreen} 
            options={{ tabBarIcon: ({color}) => <Settings color={color} size={24} /> }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

// ==========================================
// 5. СТИЛИ (Дизайн система GAWX Ultimate)
// ==========================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  headerTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 20, marginLeft: 10 },
  
  // Компоненты
  avatarContainer: { backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  avatarText: { color: COLORS.text, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 70 },
  
  // Поиск и экшены
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 15, marginVertical: 10, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, color: COLORS.text, marginLeft: 10, fontSize: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20 },
  actionText: { color: COLORS.primary, fontSize: 17, marginLeft: 15, fontWeight: '500' },
  sectionLetter: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold', marginLeft: 20, marginTop: 15, marginBottom: 5 },
  
  // Списки (Контакты/Чаты)
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  contactName: { color: COLORS.text, fontSize: 17, marginLeft: 15 },
  chatItem: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 12, alignItems: 'center' },
  chatItemCenter: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  chatName: { color: COLORS.text, fontSize: 17, fontWeight: '600', marginBottom: 4 },
  chatMsg: { color: COLORS.textMuted, fontSize: 15 },
  chatItemRight: { alignItems: 'flex-end', justifyContent: 'center' },
  chatTimeRow: { flexDirection: 'row', alignItems: 'center' },
  chatTime: { color: COLORS.textMuted, fontSize: 12 },
  chatBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  unreadBadge: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  unreadText: { color: COLORS.text, fontSize: 12, fontWeight: 'bold' },
  
  // Звонки
  callActionsBox: { marginVertical: 10 },
  callTabs: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 10 },
  callTabBtn: { marginRight: 20, paddingBottom: 5 },
  callTabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  callTabText: { color: COLORS.textMuted, fontSize: 16, fontWeight: '500' },
  callTabTextActive: { color: COLORS.text },
  callItem: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 12, alignItems: 'center' },
  callItemInfo: { flex: 1, marginLeft: 15 },
  callName: { color: COLORS.text, fontSize: 17, fontWeight: '600', marginBottom: 4 },
  callDetailsRow: { flexDirection: 'row', alignItems: 'center' },
  callTimeText: { color: COLORS.textMuted, fontSize: 14 },
  infoBtn: { padding: 10 },

  // Настройки
  profileHeader: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  profileAvatarLarge: { position: 'relative' },
  editAvatarBtn: { position: 'absolute', right: 0, bottom: 0, backgroundColor: COLORS.surfaceLight, borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.bg },
  profileName: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  inviteBox: { flexDirection: 'row', backgroundColor: '#1a1212', marginHorizontal: 15, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  settingsBlock: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 15, marginBottom: 15, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  settingIconBox: { width: 30, alignItems: 'center', marginRight: 15 },
  settingLabel: { flex: 1, color: COLORS.text, fontSize: 16 },
  
  // Нижнее меню
  tabBar: { backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.surfaceLight, height: 65, paddingBottom: Platform.OS === 'ios' ? 20 : 5, paddingTop: 5 }
});
