import {Platform} from 'react-native';

// Runtime source of truth; DESIGN.md records the accepted mapping and rationale.
export const palette = {
  dark: {bg:'#0C131B',surface:'#151F2A',raised:'#202D3A',text:'#F2F7F8',muted:'#B6C4D8',line:'#344353',accent:'#34D399',icon:'#34D399',accentText:'#062C20',danger:'#FFB4AE',dangerBg:'#4B2C32',hero:'#12232C',heroText:'#F2F7F8',heroMuted:'#B6C4D8',artRoad:'#29444C',shadow:'#070D17'},
  light: {bg:'#F3F7F5',surface:'#FFFFFF',raised:'#E7F0EB',text:'#1A2940',muted:'#52647C',line:'#CED7E4',accent:'#34D399',icon:'#047857',accentText:'#062C20',danger:'#9C2933',dangerBg:'#FFE9EB',hero:'#12232C',heroText:'#F2F7F8',heroMuted:'#B6C4D8',artRoad:'#29444C',shadow:'#12232C'},
};
export const design = {
  brand: {background:'#0B1110',ink:'#FFFFFF',muted:'#DCE6E1'},
  radius: {card:20,control:16,chip:10},
  space: {page:20,section:24,card:20},
  font: {body:Platform.select({ios:'System',android:'sans-serif',default:'system-ui'}),data:Platform.select({ios:'Menlo',android:'monospace',default:'monospace'})},
  motion: {press:140,enter:320,stagger:45,route:6800},
};
