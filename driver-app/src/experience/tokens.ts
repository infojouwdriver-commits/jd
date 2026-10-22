import {Platform} from 'react-native';

// Runtime source of truth; DESIGN.md records the accepted mapping and rationale.
export const palette = {
  dark: {bg:'#0B1423',surface:'#142238',raised:'#20314A',text:'#F2F7F8',muted:'#B6C4D8',line:'#354760',accent:'#E0BD5B',icon:'#E0BD5B',accentText:'#302408',danger:'#FFB4AE',dangerBg:'#4B2C32',hero:'#101E33',heroText:'#F2F7F8',heroMuted:'#B6C4D8',artRoad:'#30435E',shadow:'#070D17'},
  light: {bg:'#F5F3ED',surface:'#FFFFFF',raised:'#ECECE6',text:'#1A2940',muted:'#52647C',line:'#CED7E4',accent:'#E0BD5B',icon:'#765514',accentText:'#302408',danger:'#9C2933',dangerBg:'#FFE9EB',hero:'#101E33',heroText:'#F2F7F8',heroMuted:'#B6C4D8',artRoad:'#30435E',shadow:'#101E33'},
};
export const design = {
  radius: {card:20,control:16,chip:10},
  space: {page:20,section:24,card:20},
  font: {body:Platform.select({ios:'System',android:'sans-serif',default:'system-ui'}),data:Platform.select({ios:'Menlo',android:'monospace',default:'monospace'})},
  motion: {press:140,enter:320,stagger:45,route:6800},
};
