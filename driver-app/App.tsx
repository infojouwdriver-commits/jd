import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import DriverMap from './src/DriverMap';
import FleetLocation from './src/FleetLocation';
import {stopFleetPublishing} from './src/native-fleet-runtime';
import TripPanel from './src/TripPanel';
import TripHistory from './src/TripHistory';
import {createActionGate} from './src/action-gate';
import {assertNativeCryptoReady} from './src/native-crypto-preflight';
import {recordNativeCryptoResult} from './src/native-smoke-result';
import type {MeterPoint} from './src/trip-meter';
import {ApiError, driverApi, DriverProfile} from './src/api';
const api = driverApi;
export default function App() {
  const actionGate = useRef(createActionGate()).current;
  const fleetStop = useRef<(() => Promise<void>) | null>(null);
  const registerFleetStop = useCallback((stop: (() => Promise<void>) | null) => {fleetStop.current = stop;}, []);
  const [fleetGeneration, setFleetGeneration] = useState(0);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [blockLogout, setBlockLogout] = useState(true);
  const [driverPosition, setDriverPosition] = useState<MeterPoint | null>(null);
  useEffect(() => {let disposed = false; assertNativeCryptoReady().then(() => {void recordNativeCryptoResult('passed').catch(() => {});}).catch(() => {void recordNativeCryptoResult('failed').catch(() => {}); if (!disposed) setError('تعذّر فحص حماية حفظ الرحلة. لا تحذف بيانات التطبيق.');}); return () => {disposed = true;};}, []);
  useEffect(() => {let disposed = false; api.profile().then(value => {if (!disposed) setProfile(value);}).catch(error => {if (!disposed && (!(error instanceof ApiError) || error.status !== 401)) setError('تعذّر استعادة الجلسة. تحقق من الاتصال.');}).finally(() => {if (!disposed) setBusy(false);}); return () => {disposed = true;};}, []);
  async function login() {
    setBusy(true); setError('');
    try {setProfile(await api.login(identity, password, otp));}
    catch(error) {setError(error instanceof ApiError ? error.message : 'تعذّر الاتصال. حاول مجدداً.');}
    finally {setPassword(''); setOtp(''); setBusy(false);}
  }
  async function logout() {
    if (blockLogout || !actionGate.acquire()) return;
    setBusy(true); setError('');
    try {await fleetStop.current?.(); if (profile) await stopFleetPublishing(profile.driver.id); await api.clearFleet(); await api.logout(); setProfile(null); setIdentity(''); setDriverPosition(null);}
    catch {setFleetGeneration(value => value + 1); setError('تعذّر إكمال تسجيل الخروج ومسح موقع الأسطول على الخادم. حاول مجدداً.');}
    finally {setBusy(false); actionGate.release();}
  }
  return <SafeAreaProvider><SafeAreaView style={styles.screen}><StatusBar style="light"/>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.brandRow}><Text style={styles.brand}>JOUW DRIVER</Text><View style={styles.dot}/></View>
      <Text style={styles.eyebrow}>بوابة السائق</Text>
      <Text style={styles.title}>{profile ? `أهلاً، ${profile.driver.full_name}` : 'رحلتك تبدأ هنا.'}</Text>
      <Text style={styles.subtitle}>{profile ? profile.company.name : 'ادخل بحسابك الحالي للوصول إلى بوابة السائق.'}</Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      {profile ? <>
        <FleetLocation key={fleetGeneration} owner={profile.driver.id} registerStop={registerFleetStop}/>
        <TripPanel profile={profile} onProfile={setProfile} sessionBusy={busy} actionGate={actionGate} onBlockLogout={setBlockLogout} onLocation={setDriverPosition}/>
        <DriverMap position={driverPosition}/>
        <TripHistory key={profile.driver.id} owner={profile.driver.id}/>
        <View style={styles.card}><Text style={styles.cardTitle}>حسابك متصل</Text><Text style={styles.subtitle}>{profile.company.name}</Text><Text style={styles.note}>موقعك يظهر على هاتفك عند السماح بالوصول إليه.</Text></View>
        <Pressable accessibilityRole="button" onPress={logout} disabled={busy || blockLogout} style={styles.secondary}><Text style={styles.secondaryText}>تسجيل الخروج</Text></Pressable>
      </> : <View style={styles.card}>
        <Text style={styles.cardTitle}>تسجيل الدخول</Text>
        <Text accessibilityLabel="البريد الإلكتروني أو رقم الهاتف" style={styles.label}>البريد الإلكتروني أو رقم الهاتف</Text>
        <TextInput accessibilityLabel="البريد الإلكتروني أو رقم الهاتف" value={identity} onChangeText={setIdentity} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="username" editable={!busy} style={styles.input}/>
        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput accessibilityLabel="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" editable={!busy} style={styles.input} onSubmitEditing={() => {if (!busy && identity.trim() && password) void login();}}/>
        {identity.includes('@') && <TextInput accessibilityLabel="رمز التحقق إذا كان حسابك يتطلبه" placeholder="رمز التحقق إذا كان حسابك يتطلبه" placeholderTextColor="#8294a6" value={otp} onChangeText={setOtp} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} editable={!busy} style={styles.input}/>}
        <Pressable accessibilityRole="button" disabled={busy || !identity.trim() || !password} onPress={login} style={[styles.primary,(busy || !identity.trim() || !password) && {opacity:0.5}]}>{busy ? <ActivityIndicator color="#102018"/> : <Text style={styles.primaryText}>الدخول</Text>}</Pressable>
      </View>}
      <Text style={styles.footer}>JOUW DRIVER · BELGIUM</Text>
    </ScrollView></KeyboardAvoidingView>
  </SafeAreaView></SafeAreaProvider>;
}
const styles = StyleSheet.create({screen:{flex:1,backgroundColor:'#0c141d'},content:{padding:24,gap:16},brandRow:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:20},brand:{color:'#fff',fontWeight:'800',fontSize:20,letterSpacing:2},dot:{width:9,height:9,borderRadius:5,backgroundColor:'#a8e86c'},eyebrow:{color:'#a8e86c',textAlign:'right',fontSize:14},title:{fontSize:32,lineHeight:44,fontWeight:'700',color:'#fff',textAlign:'right'},subtitle:{color:'#a6b5c4',fontSize:15,lineHeight:24,textAlign:'right'},card:{backgroundColor:'#15212c',borderRadius:24,padding:22,gap:12},cardTitle:{color:'#fff',fontSize:22,fontWeight:'600',textAlign:'right'},label:{color:'#dbe5ee',textAlign:'right',fontSize:14},input:{backgroundColor:'#0c141d',borderWidth:1,borderColor:'#334655',borderRadius:14,padding:15,color:'#fff',fontSize:16,minHeight:52},primary:{backgroundColor:'#a8e86c',borderRadius:14,padding:17,alignItems:'center',marginTop:10},primaryText:{color:'#122018',fontSize:17,fontWeight:'700'},secondary:{padding:16,alignItems:'center',borderWidth:1,borderColor:'#334655',borderRadius:14},secondaryText:{color:'#dbe5ee',fontSize:16},note:{color:'#a6b5c4',fontSize:13,textAlign:'right',lineHeight:22},error:{color:'#ffc9c9',backgroundColor:'#442525',padding:14,borderRadius:12,textAlign:'right'},footer:{color:'#6f8294',textAlign:'center',fontSize:11,letterSpacing:2,marginTop:20}});
