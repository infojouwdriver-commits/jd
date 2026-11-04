import {Platform} from 'react-native';

// Runtime source of truth; DESIGN.md records the accepted mapping and rationale.
export const palette = {
  dark: {bg:'#0A111E',surface:'#111D30',raised:'#1B2B42',text:'#F2F7F8',muted:'#B6C4D8',line:'#34485F',accent:'#34D399',icon:'#34D399',accentText:'#062C20',danger:'#FFB4AE',dangerBg:'#4B2C32',hero:'#101E33',heroText:'#F2F7F8',heroMuted:'#B6C4D8',artRoad:'#314861',shadow:'#070D17'},
  light: {bg:'#F1F5FA',surface:'#FFFFFF',raised:'#E6EDF6',text:'#1A2940',muted:'#52647C',line:'#CED7E4',accent:'#34D399',icon:'#047857',accentText:'#062C20',danger:'#9C2933',dangerBg:'#FFE9EB',hero:'#101E33',heroText:'#F2F7F8',heroMuted:'#B6C4D8',artRoad:'#314861',shadow:'#12232C'},
};
export const design = {
  brand: {background:'#0B1110',ink:'#FFFFFF',muted:'#DCE6E1'},
  radius: {card:20,control:16,chip:10},
  space: {page:18,section:18,card:17},
  font: {body:Platform.select({ios:'System',android:'sans-serif',default:'system-ui'}),data:Platform.select({ios:'Menlo',android:'monospace',default:'monospace'})},
  motion: {press:140,enter:320,stagger:45,route:6800},
};
