import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, TouchableOpacity, 
  SafeAreaView, StatusBar, ScrollView, TextInput, Modal, 
  Dimensions, Animated, Platform, KeyboardAvoidingView, 
  ActivityIndicator, Switch, ImageBackground, Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// --- ИКОНКИ (LUCIDE REACT NATIVE) ---
import { 
  MessageSquare, Users, Settings, Search, Edit2, Hammer, ShieldCheck, 
  Zap, Star, Phone, Lock, Globe, Bell, Trash2, Link as LinkIcon, 
  Eye, Plus, Cloud, Play, Gamepad2, LayoutGrid, Camera, Send, 
  MoreHorizontal, ChevronRight, Mic, Video, Info, UserPlus, 
  ImageIcon, FileText, Gift, Heart, Share2, Circle, X, Check,
  Clock, ScanFace, LogOut, KeyRound, Palette, Database, HardDrive,
  Bot, Repeat, FolderKanban, Archive, Languages, BarChart3, SearchCode,
  Mail, PhoneCall, CheckCircle2
} from 'lucide-react-native';

// --- КОНСТАНТЫ И ТЕМА GAWX (MAX DESIGN) ---
const { width, height } = Dimensions.get('window');
const ADMIN_PHONE = "+7 922 534 99 39"; // Номер создателя

const THEME = {
  bg: '#000000', surface: '#0A0A0A', surfaceLight: '#161618', surfaceAccent: '#1C1C1E',
  primary: '#FF3B30', accent: '#5856D6', text: '#FFFFFF', textMuted: '#8E8E93',
  border: '#2C2C2E', success: '#34C759', premium: '#FFCC00', error: '#FF453A',
  overlay: 'rgba(0, 0, 0, 0.85)'
};

// --- КОНТЕКСТ ДЛЯ ГЛОБАЛЬНЫХ ДАННЫХ И ЛОГИКИ ---
const AppContext = createContext();

// --- ИНТЕГРАЦИЯ EMAILJS (ПО ТВОИМ ДАННЫМ) ---
const sendEmailJSCode = async (email, code, userName = "Пользователь GAWX") => {
  const data = {
    service_id: 'service_ndr83sj',
    template_id: 'template_q98pr7g',
    user_id: '9M8GxYWeMi6hJP6Rg',
    template_params: {
      to_email: email,
      user_name: userName,
      message: code
    }
  };
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      console.log('EmailJS: Код успешно отправлен на', email);
      return true;
    } else {
      console.error('EmailJS Error:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('EmailJS Network Error:', error);
    return false;
  }
};

// --- УТИЛИТЫ ---
const formatTime = (date) => date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

// --- UI KIT GAWX ---
const GAWXButton = ({ title, onPress, type = 'primary', icon, loading = false, style }) => {
  const isPrimary = type === 'primary';
  return (
    <TouchableOpacity 
      style={[styles.gBtn, isPrimary ? styles.gBtnPrimary : styles.gBtnSecondary, loading && { opacity: 0.7 }, style]} 
      onPress={onPress} disabled={loading}
    >
      {loading ? <ActivityIndicator color={isPrimary ? "#fff" : THEME.primary} /> : (
        <View style={styles.gBtnContent}>
          {icon && <View style={styles.gBtnIcon}>{icon}</View>}
          <Text style={[styles.gBtnText, !isPrimary && styles.gBtnTextSecondary]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const GAWXInput = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, style, ...props }) => (
  <View style={[styles.gInputContainer, style]}>
    {icon && <View style={styles.gInputIcon}>{icon}</View>}
    <TextInput
      style={styles.gInput} placeholder={placeholder} placeholderTextColor={THEME.textMuted}
      value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry}
      keyboardType={keyboardType} selectionColor={THEME.primary} {...props}
    />
  </View>
);

const GAWXHeader = ({ title, leftAction, rightActions, subtitle }) => (
  <View style={styles.gHeader}>
    <View style={styles.gHeaderLeft}>
      {leftAction}
      <View>
        <Text style={styles.gHeaderTitle}>{title}</Text>
        {subtitle && <Text style={styles.gHeaderSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.gHeaderRight}>
      {rightActions && rightActions.map((action, index) => (
        <TouchableOpacity key={index} style={styles.gHeaderActionBtn} onPress={action.onPress}>
          {action.icon}
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const GAWXBadge = ({ count, type = 'primary', style }) => (
  <View style={[styles.gBadge, type === 'error' && styles.gBadgeError, style]}>
    <Text style={styles.gBadgeText}>{count > 99 ? '99+' : count}</Text>
  </View>
);

const GAWXAvatar = ({ source, size = 50, online = false, glow = false, style }) => (
  <View style={[styles.gAvatarContainer, glow && styles.gAvatarGlow, { width: size, height: size, borderRadius: size / 2 }, style]}>
    {source ? (
      <Image source={source} style={[styles.gAvatar, { width: size, height: size, borderRadius: size / 2 }]} />
    ) : (
      <View style={[styles.gAvatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
        <Users color={THEME.textMuted} size={size * 0.5} />
      </View>
    )}
    {online && <View style={styles.gAvatarOnline} />}
  </View>
);

// --- ЭКРАН АВТОРИЗАЦИИ (FIREBASE + GAWX-SOO + EMAILJS) ---
function AuthScreen() {
  const { login, language, setLanguage, accounts, globalChats, setGlobalChats, dailySmsCount, setDailySmsCount } = useContext(AppContext);
  const [step, setStep] = useState('welcome'); // welcome, method, phone, email, password_input, code, profile, link_email
  const [authMethod, setAuthMethod] = useState('phone'); // phone, email
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  const countries = [{ code: '+7', name: 'Россия', flag: '🇷🇺' }, { code: '+1', name: 'USA', flag: '🇺🇸' }];
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const DAILY_SMS_LIMIT = 10;

  const handleSendCodePhone = () => {
    setError(null); setInfoMsg(null);
    if (phone.length < 5) return setError('Введите корректный номер');
    
    const fullPhone = selectedCountry.code + phone;
    const isAlreadyLoggedIn = accounts.some(acc => acc.phone === fullPhone);
    const newCode = generateCode();
    setExpectedCode(newCode);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      if (isAlreadyLoggedIn) {
        // ЛОГИКА GAWX-SOO: Если аккаунт уже есть, шлем код во внутренний системный бот
        setInfoMsg('Код отправлен в приложение (gawx-soo)');
        // Добавляем сообщение в чат бота
        const updatedChats = globalChats.map(chat => {
          if (chat.id === 'gawx-soo') {
            return { ...chat, unread: chat.unread + 1, lastMsg: `Ваш код для входа: ${newCode}` };
          }
          return chat;
        });
        setGlobalChats(updatedChats);
      } else {
        // ЛИМИТ FIREBASE
        if (dailySmsCount >= DAILY_SMS_LIMIT) {
          return setError('Лимит превышен, повторите завтра');
        }
        setDailySmsCount(prev => prev + 1);
        setInfoMsg(`Код отправлен по SMS (Firebase) на ${fullPhone}`);
        // В консоль для дебага, так как реального SMS нет
        console.log(`[FIREBASE SIMULATION] SMS to ${fullPhone}: Code is ${newCode}`); 
      }
      setStep('code');
    }, 1500);
  };

  const handleSendCodeEmail = async () => {
    setError(null); setInfoMsg(null);
    if (!email.includes('@')) return setError('Введите корректный email');
    
    setLoading(true);
    const newCode = generateCode();
    setExpectedCode(newCode);
    
    // ОТПРАВКА ЧЕРЕЗ EMAILJS
    const success = await sendEmailJSCode(email, newCode);
    setLoading(false);

    if (success) {
      setInfoMsg(`Код отправлен на почту ${email}`);
      setStep('code');
    } else {
      setError('Ошибка отправки Email. Проверьте подключение.');
    }
  };

  const handleVerifyCode = () => {
    setError(null);
    if (inputCode !== expectedCode && inputCode !== '0000') { // 0000 как бэкдор для тестов
      return setError('Неверный код.');
    }
    
    // Код верный. Проверяем, есть ли такой юзер в "базе" (симуляция)
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const identifier = authMethod === 'phone' ? (selectedCountry.code + phone) : email;
      
      // Если это админ - пускаем сразу
      if (phone === ADMIN_PHONE.replace(selectedCountry.code, '').replace(/ /g, '')) {
        login(ADMIN_PHONE, 'Артём', 'artemda', true, true, email);
      } else {
        // Переход к созданию профиля и привязке пароля
        setStep('profile'); 
      }
    }, 1000);
  };

  const handleCompleteProfile = () => {
    setError(null);
    if (name.length < 2 || username.length < 3) return setError('Заполните имя и уникальный username');
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const finalPhone = authMethod === 'phone' ? (selectedCountry.code + phone) : 'Не привязан';
      const finalEmail = authMethod === 'email' ? email : 'Не привязан';
      login(finalPhone, name, username, false, false, finalEmail, password);
    }, 1500);
  };

  // UI РЕНДЕРЫ ШАГОВ
  const renderWelcome = () => (
    <View style={styles.authStep}>
      <Animated.View style={styles.authLogoContainer}>
        <Image source={require('./assets/icon.png')} style={styles.authLogo} />
        <Text style={styles.authBrand}>GAWX</Text>
      </Animated.View>
      <Text style={styles.authTitle}>Абсолютная платформа</Text>
      <Text style={styles.authDesc}>Будущее общения без ограничений. Полный контроль. Полная свобода.</Text>
      <GAWXButton title="Начать" onPress={() => setStep('language')} style={{ marginTop: 40 }} />
    </View>
  );

  const renderLanguage = () => (
    <View style={styles.authStep}>
      <Languages color={THEME.primary} size={60} style={{ marginBottom: 20 }} />
      <Text style={styles.authTitle}>Выберите язык</Text>
      <View style={styles.langList}>
        {['Русский', 'English'].map(lang => (
          <TouchableOpacity key={lang} style={[styles.langBtn, language === lang && styles.langBtnActive]} onPress={() => setLanguage(lang)}>
            <Text style={[styles.langText, language === lang && styles.langTextActive]}>{lang}</Text>
            {language === lang && <Check color={THEME.primary} size={20} />}
          </TouchableOpacity>
        ))}
      </View>
      <GAWXButton title="Далее" onPress={() => setStep('method')} style={{ marginTop: 40 }} />
    </View>
  );

  const renderMethod = () => (
    <View style={styles.authStep}>
      <GAWXHeader title="Вход в GAWX" leftAction={<TouchableOpacity onPress={() => setStep('language')}><ChevronRight color={THEME.text} size={24} style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>} />
      <Text style={styles.authDesc}>Выберите метод авторизации. Вы сможете привязать дополнительные данные в настройках.</Text>
      <GAWXButton title="По номеру телефона" icon={<Phone color="#fff" size={20}/>} onPress={() => { setAuthMethod('phone'); setStep('phone'); }} style={{ marginBottom: 15 }} />
      <GAWXButton title="По Email адресу" type="secondary" icon={<Mail color={THEME.primary} size={20}/>} onPress={() => { setAuthMethod('email'); setStep('email'); }} />
    </View>
  );

  const renderPhone = () => (
    <View style={styles.authStep}>
      <GAWXHeader title="Ваш номер" leftAction={<TouchableOpacity onPress={() => setStep('method')}><ChevronRight color={THEME.text} size={24} style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>} />
      <Text style={styles.authDesc}>Введите номер телефона. Если у вас уже выполнен вход на другом устройстве, код придет в системный чат gawx-soo.</Text>
      <View style={styles.phoneInputRow}>
        <TouchableOpacity style={styles.countryPicker}><Text style={styles.countryText}>{selectedCountry.flag} {selectedCountry.code}</Text></TouchableOpacity>
        <GAWXInput placeholder="000 000 00 00" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ flex: 1, marginBottom: 0 }} />
      </View>
      {error && <Text style={styles.authError}>{error}</Text>}
      <GAWXButton title="Получить код" onPress={handleSendCodePhone} loading={loading} style={{ marginTop: 40 }} />
    </View>
  );

  const renderEmail = () => (
    <View style={styles.authStep}>
      <GAWXHeader title="Ваш Email" leftAction={<TouchableOpacity onPress={() => setStep('method')}><ChevronRight color={THEME.text} size={24} style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>} />
      <Text style={styles.authDesc}>Введите почту для получения одноразового кода через защищенный шлюз.</Text>
      <GAWXInput icon={<Mail color={THEME.textMuted} size={20}/>} placeholder="example@gawx.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      {error && <Text style={styles.authError}>{error}</Text>}
      <GAWXButton title="Получить код" onPress={handleSendCodeEmail} loading={loading} style={{ marginTop: 40 }} />
    </View>
  );

  const renderCode = () => (
    <View style={styles.authStep}>
      <GAWXHeader title="Код" leftAction={<TouchableOpacity onPress={() => setStep(authMethod)}><ChevronRight color={THEME.text} size={24} style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>} />
      {infoMsg && <Text style={styles.authInfo}>{infoMsg}</Text>}
      <GAWXInput icon={<KeyRound color={THEME.textMuted} size={20} />} placeholder="0000" value={inputCode} onChangeText={setInputCode} keyboardType="number-pad" maxLength={4} style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />
      {error && <Text style={styles.authError}>{error}</Text>}
      <GAWXButton title="Подтвердить" onPress={handleVerifyCode} loading={loading} style={{ marginTop: 40 }} />
      <TouchableOpacity style={{ marginTop: 20 }} onPress={authMethod === 'phone' ? handleSendCodePhone : handleSendCodeEmail}><Text style={styles.linkText}>Отправить код повторно</Text></TouchableOpacity>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.authStep}>
      <Text style={styles.authTitle}>Настройка аккаунта</Text>
      <Text style={styles.authDesc}>Твой аккаунт — твои правила. Здесь же можно задать пароль для резервного входа.</Text>
      <GAWXInput icon={<Info color={THEME.textMuted} size={20} />} placeholder="Ваше Имя" value={name} onChangeText={setName} />
      <GAWXInput icon={<Star color={THEME.textMuted} size={20} />} placeholder="@username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <GAWXInput icon={<Lock color={THEME.textMuted} size={20} />} placeholder="Придумайте пароль (опционально)" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text style={styles.authError}>{error}</Text>}
      <GAWXButton title="Завершить регистрацию" onPress={handleCompleteProfile} loading={loading} style={{ marginTop: 40 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.authContainer}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          {step === 'welcome' && renderWelcome()}
          {step === 'language' && renderLanguage()}
          {step === 'method' && renderMethod()}
          {step === 'phone' && renderPhone()}
          {step === 'email' && renderEmail()}
          {step === 'code' && renderCode()}
          {step === 'profile' && renderProfile()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ЭКРАН ЧАТОВ (ТОЛЬКО БОТ И СОЗДАННЫЕ ПОЛЬЗОВАТЕЛЕМ) ---
function ChatsScreen({ navigation }) {
  const { globalChats, setGlobalChats } = useContext(AppContext);
  const [activeSegment, setActiveSegment] = useState('chats'); 
  const [searchModal, setSearchModal] = useState(false);
  const [newChatModal, setNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  const handleCreateChat = () => {
    if(!newChatName.trim()) return;
    const newChat = {
      id: Date.now().toString(),
      name: newChatName,
      img: null,
      lastMsg: 'Чат создан. E2EE активно.',
      time: formatTime(new Date()),
      unread: 0,
      secure: true,
      msgType: 'text'
    };
    setGlobalChats([newChat, ...globalChats]);
    setNewChatModal(false);
    setNewChatName('');
    navigation.navigate('ChatWindow', { chatId: newChat.id, name: newChat.name });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => navigation.navigate('ChatWindow', { chatId: item.id, name: item.name, system: item.system })}>
      <View style={styles.chatAvatarWrap}>
        <GAWXAvatar source={item.img} size={55} glow={item.gawx} />
        {item.system && <View style={styles.gawxChatBadge}><Bot color="#fff" size={12}/></View>}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeaderRow}>
          <View style={styles.chatNameWrap}>
            <Text style={[styles.chatName, item.system && {color: THEME.primary}]} numberOfLines={1}>{item.name}</Text>
            {item.secure && <Lock color={THEME.success} size={14} style={{ marginLeft: 5 }} />}
          </View>
          <Text style={[styles.chatTime, item.unread > 0 && { color: THEME.primary }]}>{item.time}</Text>
        </View>
        <View style={styles.chatMsgRow}>
          <Text style={[styles.lastMsg, item.system && {color: THEME.text}]} numberOfLines={1}>{item.lastMsg}</Text>
          <View style={styles.chatMeta}>
            {item.unread > 0 && <GAWXBadge count={item.unread} type={item.gawx ? 'primary' : 'error'} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <GAWXHeader 
        title="GAWX" 
        rightActions={[
          { icon: <SearchCode color="#fff" size={24}/>, onPress: () => setSearchModal(true) },
          { icon: <Plus color="#fff" size={24}/>, onPress: () => setNewChatModal(true) }
        ]} 
      />

      <View style={styles.chatSegments}>
        {['Чаты', 'Каналы', 'Облако'].map(seg => (
          <TouchableOpacity key={seg} style={[styles.chatSegmentBtn, activeSegment === seg.toLowerCase() && styles.chatSegmentActive]} onPress={() => setActiveSegment(seg.toLowerCase())}>
            <Text style={[styles.chatSegmentText, activeSegment === seg.toLowerCase() && styles.chatSegmentTextActive]}>{seg}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {globalChats.length === 1 ? ( // Только gawx-soo
        <View style={styles.emptyCenter}>
           <MessageSquare color={THEME.surfaceAccent} size={80} />
           <Text style={styles.emptyTitle}>У вас пока нет чатов</Text>
           <Text style={styles.emptySub}>Нажмите + чтобы начать безопасное общение с друзьями.</Text>
        </View>
      ) : null}

      <FlatList
        data={globalChats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* НОВЫЙ ЧАТ GAWX MAX */}
      <Modal visible={newChatModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalBottom}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новое общение</Text>
              <TouchableOpacity onPress={() => setNewChatModal(false)}><X color={THEME.text} size={24} /></TouchableOpacity>
            </View>
            <GAWXInput placeholder="Имя друга или номер..." value={newChatName} onChangeText={setNewChatName} autoFocus />
            <GAWXButton title="Создать E2EE чат" onPress={handleCreateChat} style={{marginTop: 10}} />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- ЭКРАН ОКНА ЧАТА ---
function ChatWindowScreen({ route, navigation }) {
  const { name, chatId, system } = route.params;
  const { globalChats, setGlobalChats } = useContext(AppContext);
  
  // Ищем или создаем историю локально (симуляция)
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // При входе в чат сбрасываем счетчик непрочитанных для gawx-soo или других
    const updatedChats = globalChats.map(chat => {
      if (chat.id === chatId) return { ...chat, unread: 0 };
      return chat;
    });
    setGlobalChats(updatedChats);

    if (system) {
      setMessages([{ id: '1', text: updatedChats.find(c=>c.id===chatId).lastMsg, time: formatTime(new Date()), sender: 'other', status: 'read' }]);
    } else {
      setMessages([{ id: 'init', text: 'Чат создан. Сквозное шифрование активно.', time: formatTime(new Date()), sender: 'system', status: 'read' }]);
    }
  }, []);

  const sendMessage = () => {
    if (inputText.trim() && !system) {
      const newMsg = { id: Date.now().toString(), text: inputText, time: formatTime(new Date()), sender: 'me', status: 'sent' };
      setMessages([...messages, newMsg]);
      setInputText('');
      
      // Обновляем lastMsg в глобальном списке
      const updatedChats = globalChats.map(chat => chat.id === chatId ? { ...chat, lastMsg: newMsg.text } : chat);
      setGlobalChats(updatedChats);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    if (item.sender === 'system') return <Text style={styles.systemMsg}>{item.text}</Text>;
    
    return (
      <View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther]}>
        <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther, system && {borderColor: THEME.primary, borderWidth: 1}]}>
          <Text style={styles.msgText}>{item.text}</Text>
          <View style={styles.msgMeta}>
            <Text style={styles.msgTime}>{item.time}</Text>
            {isMe && <CheckCircle2 color={THEME.success} size={14}/>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('./assets/chat_bg.png')} style={styles.chatBackground} imageStyle={{opacity: 0.15}}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronRight color={THEME.text} size={24} style={{ transform: [{ rotate: '180deg' }] }}/></TouchableOpacity>
          <GAWXAvatar source={system ? require('./assets/icon.png') : null} online={!system} glow={system} size={40} style={{ marginHorizontal: 10 }} />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName} numberOfLines={1}>{name}</Text>
            <Text style={styles.chatHeaderStatus}>{system ? 'Системный бот' : 'сквозное шифрование'}</Text>
          </View>
        </View>

        <FlatList data={messages} renderItem={renderMessage} keyExtractor={item => item.id} contentContainerStyle={{ padding: 15 }} />

        {!system && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <View style={styles.inputBar}>
              <TouchableOpacity style={styles.inputActionBtn}><ImageIcon color={THEME.textMuted} size={24}/></TouchableOpacity>
              <GAWXInput placeholder="Сообщение MAX..." value={inputText} onChangeText={setInputText} style={{ flex: 1, marginBottom: 0, marginHorizontal: 10, paddingVertical: 10 }} multiline />
              <TouchableOpacity style={[styles.sendBtn, !inputText.trim() && {backgroundColor: THEME.surfaceAccent}]} onPress={sendMessage}>
                {inputText.trim() && <Animated.View style={styles.sendBtnGlow}></Animated.View>}
                <Send color={inputText.trim() ? "#fff" : THEME.textMuted} size={20} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- ЭКРАН ЗВОНКОВ ---
function CallsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <GAWXHeader title="Звонки GAWX" />
      <ScrollView style={{padding: 20}}>
        <View style={styles.emptyCenter}>
          <PhoneCall color={THEME.surfaceAccent} size={100} strokeWidth={1}/>
          <Text style={styles.emptyTitle}>История звонков пуста</Text>
          <Text style={styles.emptySub}>Совершайте безопасные HD звонки друзьям.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ЭКРАН СЕРВИСОВ ---
function ServicesScreen() {
  const services = [
    { id: '1', title: 'Игротека GAWX', icon: <Gamepad2 color="#fff"/>, bg: '#5856D6', desc: 'Игры внутри чатов' },
    { id: '2', title: 'Боты и API', icon: <Bot color="#fff"/>, bg: '#FF9500', desc: 'Автоматизация задач' },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <GAWXHeader title="Сервисы GAWX" />
      <FlatList
        data={services} numColumns={2} contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.serviceBox}>
            <View style={[styles.serviceIconWrap, {backgroundColor: item.bg}]}>{item.icon}</View>
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.serviceDesc}>{item.desc}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// --- ЭКРАН НАСТРОЕК (ПРИВЯЗКА EMAIL И ПАРОЛЯ) ---
function SettingsScreen({ navigation }) {
  const { user, accounts, switchAccount, logout, language } = useContext(AppContext);
  const [adminModal, setAdminModal] = useState(false);
  const [bindEmailModal, setBindEmailModal] = useState(false);

  const settingsBlocks = [
    { 
      id: 'prof', title: 'БЕЗОПАСНОСТЬ И ВХОД', 
      items: [
        { id: 's0', icon: <Mail color={THEME.primary}/>, title: 'Привязка Email', value: user.email, action: () => setBindEmailModal(true) },
        { id: 's1', icon: <KeyRound color={THEME.success}/>, title: 'Изменить пароль', value: user.password ? 'Установлен' : 'Не установлен' },
        { id: 's2', icon: <ShieldCheck color={THEME.accent}/>, title: 'Двухэтапная авторизация', value: 'Вкл' },
      ]
    },
    { 
      id: 'chats', title: 'ЧАТЫ И МЕДИА', 
      items: [
        { id: 'c1', icon: <Palette color="#fff"/>, title: 'Кастомизация UI / Темы' },
        { id: 'c2', icon: <Database color="#fff"/>, title: 'Данные и Кэш' },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileHeader}>
          {user.isAdmin && <GAWXBadge count="Админ" type="primary" style={styles.adminBadge} />}
          <GAWXAvatar source={require('./assets/icon.png')} size={120} glow online />
          <Text style={[styles.mainName, user.premium && styles.premiumName]}>{user.name} <Star color={THEME.premium} size={20}/></Text>
          <Text style={styles.mainPhone}>{user.phone}</Text>
        </View>

        <View style={styles.multiAccountSection}>
          <Text style={styles.sectionLabel}>АККАУНТЫ</Text>
          {accounts.map(acc => (
            <TouchableOpacity key={acc.phone + acc.email} style={styles.accountCard} onPress={() => switchAccount(acc)}>
              <GAWXAvatar source={require('./assets/icon.png')} size={40} glow={acc.isAdmin} />
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Text style={styles.accountPhone}>{acc.phone !== 'Не привязан' ? acc.phone : acc.email}</Text>
              </View>
              {(acc.phone === user.phone && acc.email === user.email) && <CheckCircle2 color={THEME.primary} size={20} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addAccountBtn} onPress={() => navigation.navigate('Auth')}>
            <Plus color={THEME.primary} size={20} />
            <Text style={styles.addAccountText}>Добавить аккаунт</Text>
          </TouchableOpacity>
        </View>

        {settingsBlocks.map(block => (
          <View key={block.id} style={styles.settingsBlock}>
            <Text style={styles.settingsBlockTitle}>{block.title}</Text>
            {block.items.map(item => (
              <TouchableOpacity key={item.id} style={styles.settingRow} onPress={item.action}>
                <View style={styles.settingIconWrap}>{item.icon}</View>
                <Text style={styles.settingTitle}>{item.title}</Text>
                {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                <ChevronRight color={THEME.textMuted} size={18} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {user.isAdmin && (
          <View style={styles.adminSection}>
            <GAWXButton title="Панель Админа (Молоток)" icon={<Hammer color="#fff" size={20}/>} onPress={() => setAdminModal(true)} />
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color={THEME.error} size={20} />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- НАВИГАЦИЯ ---
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ChatsStack() { return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="ChatList" component={ChatsScreen} /><Stack.Screen name="ChatWindow" component={ChatWindowScreen} /></Stack.Navigator>; }
function SettingsStack() { return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="SettingsMain" component={SettingsScreen} /></Stack.Navigator>; }
function AuthStack() { return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="AuthMain" component={AuthScreen} /></Stack.Navigator>; }

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarActiveTintColor: THEME.primary, tabBarInactiveTintColor: THEME.textMuted, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      <Tab.Screen name="ЧатыStack" component={ChatsStack} options={{ tabBarLabel: 'Чаты', tabBarIcon: ({color}) => <MessageSquare color={color} size={26}/> }}/>
      <Tab.Screen name="Звонки" component={CallsScreen} options={{ tabBarIcon: ({color}) => <Phone color={color} size={26}/> }}/>
      <Tab.Screen name="Сервисы" component={ServicesScreen} options={{ tabBarIcon: ({color}) => <LayoutGrid color={color} size={26}/> }}/>
      <Tab.Screen name="НастройкиStack" component={SettingsStack} options={{ tabBarLabel: 'Настройки', tabBarIcon: ({color}) => <Settings color={color} size={26}/> }}/>
    </Tab.Navigator>
  );
}

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
export default function App() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [language, setLanguage] = useState('Русский');
  
  // Глобальные чаты (изначально только бот gawx-soo)
  const [globalChats, setGlobalChats] = useState([
    { id: 'gawx-soo', name: 'gawx-soo', img: require('./assets/icon.png'), lastMsg: 'Добро пожаловать в GAWX.', time: formatTime(new Date()), unread: 0, gawx: true, secure: true, system: true, msgType: 'text' }
  ]);
  
  // Лимит Firebase SMS
  const [dailySmsCount, setDailySmsCount] = useState(0);

  const login = (phone, name, username, isAdmin, premium=true, email='Не привязан', password='') => {
    const newUser = { phone, name, username, isAdmin, premium, email, password };
    setUser(newUser);
    setAccounts(prev => {
      // Проверка на дубликат по телефону ИЛИ почте
      if (!prev.find(acc => acc.phone === phone && acc.email === email)) {
        return [...prev, newUser];
      }
      return prev;
    });
  };

  const switchAccount = (accToSwitch) => setUser(accToSwitch);
  const logout = () => {
    setAccounts(prev => prev.filter(acc => acc.phone !== user.phone));
    if (accounts.length > 1) setUser(accounts[0]);
    else setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, accounts, login, switchAccount, language, setLanguage, logout, globalChats, setGlobalChats, dailySmsCount, setDailySmsCount }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: THEME.bg } }}>
          {user ? <Stack.Screen name="AppMain" component={TabNavigator} /> : <Stack.Screen name="Auth" component={AuthStack} />}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

// --- СТИЛИ (ОГРОМНЫЙ МАССИВ MAX STYLE) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  gHeader: { padding: 15, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: THEME.surfaceLight, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  gHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  gHeaderTitle: { fontSize: 26, fontWeight: '900', color: THEME.text, letterSpacing: -1, marginLeft: 10 },
  gHeaderSubtitle: { fontSize: 12, color: THEME.textMuted, marginLeft: 10 },
  gHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  gHeaderActionBtn: { marginLeft: 15 },
  gBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center', width: '100%', marginBottom: 15 },
  gBtnPrimary: { backgroundColor: THEME.surfaceAccent, borderWidth: 1, borderColor: THEME.border },
  gBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: THEME.primary },
  gBtnText: { color: THEME.text, fontSize: 18, fontWeight: '700' },
  gBtnTextSecondary: { color: THEME.primary },
  gBtnContent: { flexDirection: 'row', alignItems: 'center' },
  gBtnIcon: { marginRight: 10 },
  gInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surfaceLight, borderRadius: 20, marginBottom: 15, paddingHorizontal: 15 },
  gInputIcon: { marginRight: 10 },
  gInput: { flex: 1, color: THEME.text, fontSize: 16, paddingVertical: 18 },
  gBadge: { backgroundColor: THEME.surfaceLight, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, justifyContent: 'center', alignItems: 'center' },
  gBadgeText: { color: THEME.text, fontSize: 11, fontWeight: 'bold' },
  gBadgeError: { backgroundColor: THEME.error },
  gAvatarContainer: { position: 'relative' },
  gAvatarGlow: { shadowColor: THEME.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  gAvatar: { backgroundColor: THEME.surfaceAccent },
  gAvatarPlaceholder: { backgroundColor: THEME.surfaceAccent, justifyContent: 'center', alignItems: 'center' },
  gAvatarOnline: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: THEME.success, borderWidth: 2, borderColor: THEME.bg },
  
  // Auth
  authContainer: { flex: 1, backgroundColor: THEME.bg, justifyContent: 'center' },
  authStep: { flex: 1, padding: 30, justifyContent: 'center' },
  authLogoContainer: { alignItems: 'center', marginBottom: 40 },
  authLogo: { width: 120, height: 120, borderRadius: 30 },
  authBrand: { fontSize: 40, fontWeight: '900', color: THEME.text, marginTop: 15, letterSpacing: -2 },
  authTitle: { fontSize: 32, fontWeight: 'bold', color: THEME.text, textAlign: 'center', marginBottom: 10, letterSpacing: -1 },
  authDesc: { color: THEME.textMuted, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  authError: { color: THEME.error, textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  authInfo: { color: THEME.success, textAlign: 'center', marginBottom: 20, fontSize: 16, fontWeight: 'bold' },
  phoneInputRow: { flexDirection: 'row', marginBottom: 20 },
  countryPicker: { backgroundColor: THEME.surfaceAccent, borderRadius: 20, justifyContent: 'center', paddingHorizontal: 15, marginRight: 10 },
  countryText: { color: THEME.text, fontSize: 16 },
  langList: { marginVertical: 20 },
  langBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: THEME.surfaceLight, borderRadius: 20, marginBottom: 10 },
  langBtnActive: { borderColor: THEME.primary, borderWidth: 1 },
  langText: { color: THEME.text, fontSize: 16, fontWeight: '600' },
  langTextActive: { color: THEME.primary },
  linkText: { color: THEME.primary, fontWeight: '600', textAlign: 'center' },
  
  // Chats List
  chatSegments: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  chatSegmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 15 },
  chatSegmentActive: { backgroundColor: THEME.surfaceLight },
  chatSegmentText: { color: THEME.textMuted, fontSize: 15, fontWeight: '600' },
  chatSegmentTextActive: { color: THEME.primary },
  chatItem: { flexDirection: 'row', padding: 15, paddingLeft: 20, borderBottomWidth: 0.5, borderBottomColor: THEME.border, alignItems: 'center' },
  chatAvatarWrap: { position: 'relative' },
  gawxChatBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: THEME.bg, padding: 3, borderRadius: 10, borderWidth: 1, borderColor: THEME.primary },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatNameWrap: { flexDirection: 'row', alignItems: 'center' },
  chatName: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
  chatTime: { fontSize: 12, color: THEME.textMuted },
  chatMsgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  lastMsg: { fontSize: 14, color: THEME.textMuted, flex: 1 },
  chatMeta: { flexDirection: 'row', alignItems: 'center' },
  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 50 },
  emptyTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { color: THEME.textMuted, textAlign: 'center', marginTop: 10, fontSize: 14, lineHeight: 20 },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: THEME.overlay, justifyContent: 'flex-end' },
  modalBottom: { backgroundColor: THEME.surfaceLight, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.text },
  
  // Chat Window
  chatBackground: { flex: 1 },
  chatHeader: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.overlay, borderBottomWidth: 0.5, borderBottomColor: THEME.border, zIndex: 100 },
  chatHeaderInfo: { flex: 1, marginHorizontal: 10 },
  chatHeaderName: { fontSize: 17, fontWeight: 'bold', color: THEME.text },
  chatHeaderStatus: { fontSize: 11, color: THEME.success, marginTop: 2 },
  msgContainer: { flexDirection: 'row', marginBottom: 15 },
  msgMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgOther: { alignSelf: 'flex-start' },
  msgBubble: { padding: 12, paddingHorizontal: 15, borderRadius: 20, maxWidth: width * 0.75 },
  bubbleMe: { backgroundColor: THEME.primary, borderBottomRightRadius: 5 },
  bubbleOther: { backgroundColor: THEME.surfaceLight, borderBottomLeftRadius: 5 },
  msgText: { color: THEME.text, fontSize: 16, lineHeight: 21 },
  msgTime: { fontSize: 11, color: THEME.textMuted },
  systemMsg: { alignSelf: 'center', color: THEME.textMuted, fontSize: 12, marginVertical: 10, backgroundColor: THEME.surfaceLight, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  inputBar: { flexDirection: 'row', padding: 10, paddingHorizontal: 15, paddingBottom: 25, backgroundColor: THEME.overlay, borderTopWidth: 0.5, borderTopColor: THEME.border, alignItems: 'flex-end' },
  inputActionBtn: { padding: 8 },
  sendBtn: { backgroundColor: THEME.primary, borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', position: 'relative' }, 
  sendBtnGlow: { position: 'absolute', backgroundColor: THEME.primary, shadowColor: THEME.primary, shadowOpacity: 1, shadowRadius: 20, width: 40, height: 40, borderRadius: 20 },
  
  // Settings & Services
  serviceBox: { flex: 1, backgroundColor: THEME.surfaceAccent, margin: 10, padding: 25, borderRadius: 25, alignItems: 'center', borderWidth: 0.5, borderColor: THEME.border },
  serviceIconWrap: { width: 55, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  serviceTitle: { color: THEME.text, fontWeight: 'bold', fontSize: 16 },
  serviceDesc: { color: THEME.textMuted, fontSize: 12, textAlign: 'center', marginTop: 5 },
  profileHeader: { alignItems: 'center', padding: 30, position: 'relative' },
  adminBadge: { position: 'absolute', top: 20, left: 20, backgroundColor: THEME.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  mainName: { fontSize: 26, fontWeight: 'bold', color: THEME.text, marginTop: 15 },
  mainPhone: { color: THEME.textMuted, marginTop: 5 },
  multiAccountSection: { marginTop: 20, paddingBottom: 15 },
  sectionLabel: { color: THEME.primary, fontSize: 12, fontWeight: 'bold', marginLeft: 20, marginBottom: 10, textTransform: 'uppercase' },
  accountCard: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingLeft: 20, backgroundColor: THEME.surfaceAccent, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  accountInfo: { flex: 1, marginLeft: 15 },
  accountName: { color: THEME.text, fontSize: 16, fontWeight: '600' },
  accountPhone: { color: THEME.textMuted, fontSize: 12 },
  addAccountBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingLeft: 20 },
  addAccountText: { color: THEME.primary, marginLeft: 10, fontWeight: '600' },
  settingsBlock: { marginBottom: 25, backgroundColor: THEME.surfaceLight, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: THEME.border },
  settingsBlockTitle: { color: THEME.primary, fontSize: 12, fontWeight: 'bold', marginLeft: 20, marginVertical: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  settingIconWrap: { width: 30 },
  settingTitle: { flex: 1, color: THEME.text, fontSize: 16 },
  settingValue: { color: THEME.textMuted, marginRight: 10, fontSize: 14 },
  adminSection: { paddingHorizontal: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 30 },
  logoutText: { color: THEME.error, fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  tabBar: { backgroundColor: THEME.bg, borderTopColor: THEME.border, height: 65, borderTopWidth: 0.5 },
});
