import React from 'react';
import '../background-meter';
import {Tabs} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PreferencesProvider,usePreferences} from '../experience/preferences';
import {PushProvider} from '../experience/push';
import {SessionProvider} from '../experience/session';
import {InboxProvider,useInbox} from '../experience/inbox';
import {Icon,type IconName} from '../experience/ui';
function Navigation(){const {colors,t}=usePreferences();const inbox=useInbox();const routes=[['index','home','home-outline'],['trips','trips','receipt-outline'],['messages','messages','chatbubbles-outline'],['account','account','person-circle-outline']] as const;return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.accentText,tabBarInactiveTintColor:colors.muted,tabBarActiveBackgroundColor:colors.accent,tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.line,paddingTop:8},tabBarItemStyle:{borderRadius:14,marginHorizontal:5},tabBarLabelStyle:{fontWeight:'600',fontSize:11},animation:'none',sceneStyle:{backgroundColor:colors.bg}}}>{routes.map(([name,label,icon])=><Tabs.Screen key={name} name={name} options={{title:t(label),tabBarIcon:({color})=><Icon name={icon as IconName} color={color} size={22}/>,...(name==='messages'&&inbox.unreadMessages?{tabBarBadge:inbox.unreadMessages}:{} )}}/>)}<Tabs.Screen name="active" options={{href:null}}/><Tabs.Screen name="notifications" options={{href:null}}/></Tabs>;}
export default function Layout(){return <SafeAreaProvider><PreferencesProvider><SessionProvider><InboxProvider><PushProvider><Navigation/></PushProvider></InboxProvider></SessionProvider></PreferencesProvider></SafeAreaProvider>;}
