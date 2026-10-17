import React from 'react';
import '../background-meter';
import {Tabs} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PreferencesProvider,usePreferences} from '../experience/preferences';
import {PushProvider} from '../experience/push';
import {SessionProvider} from '../experience/session';
import {InboxProvider,useInbox} from '../experience/inbox';
import {ActivityProvider} from '../experience/activity-state';
import {NavigationBar,navigationItems} from '../experience/NavigationBar';
function Navigation(){const {colors,t}=usePreferences();const inbox=useInbox();return <Tabs tabBar={({state,navigation})=><NavigationBar active={state.routes[state.index].name==='settings'?'account':state.routes[state.index].name} unreadMessages={inbox.unreadMessages} onNavigate={name=>{const route=state.routes.find(row=>row.name===name);if(!route)return;const event=navigation.emit({type:'tabPress',target:route.key,canPreventDefault:true});if(!event.defaultPrevented&&state.routes[state.index].key!==route.key)navigation.navigate(route.name,route.params);}} onLongPress={name=>{const route=state.routes.find(row=>row.name===name);if(route)navigation.emit({type:'tabLongPress',target:route.key});}}/>} screenOptions={{headerShown:false,animation:'none',sceneStyle:{backgroundColor:colors.bg}}}>{navigationItems.map(([name,label])=><Tabs.Screen key={name} name={name} options={{title:t(label)}}/>)}<Tabs.Screen name="settings" options={{href:null}}/><Tabs.Screen name="active" options={{href:null}}/><Tabs.Screen name="notifications" options={{href:null}}/></Tabs>;}
export default function Layout(){return <SafeAreaProvider><PreferencesProvider><SessionProvider><InboxProvider><PushProvider><ActivityProvider><Navigation/></ActivityProvider></PushProvider></InboxProvider></SessionProvider></PreferencesProvider></SafeAreaProvider>;}
