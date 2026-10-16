import {Platform} from 'react-native';

// Runtime source of truth; DESIGN.md records the accepted mapping and rationale.
export const palette = {
  dark: {bg:'#0D252E',surface:'#16353F',raised:'#20434D',text:'#F2F7F8',muted:'#AAC1C8',line:'#31535E',accent:'#B6EF62',icon:'#B6EF62',accentText:'#172B16',danger:'#FFB4AE',dangerBg:'#4B2C32',hero:'#12313C',heroText:'#F2F7F8',heroMuted:'#AAC1C8',artRoad:'#2C4D58',shadow:'#05151B'},
  light: {bg:'#EDF3F4',surface:'#FFFFFF',raised:'#E2ECEF',text:'#153541',muted:'#536D77',line:'#CBDCE1',accent:'#B6EF62',icon:'#426719',accentText:'#172B16',danger:'#9C2933',dangerBg:'#FFE9EB',hero:'#12313C',heroText:'#F2F7F8',heroMuted:'#AAC1C8',artRoad:'#2C4D58',shadow:'#12313C'},
};
export const design = {
  radius: {card:24,control:17,chip:12},
  space: {page:20,section:24,card:20},
  font: {body:Platform.select({ios:'System',android:'sans-serif',default:'system-ui'}),data:Platform.select({ios:'Menlo',android:'monospace',default:'monospace'})},
  motion: {press:140,enter:320,stagger:45,route:6800},
};
