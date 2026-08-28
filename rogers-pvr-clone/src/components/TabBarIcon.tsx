import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Home, Tv, Search, Download, Settings, Play, Pause, Square, Info, Menu, ChevronLeft, Mic } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface TabBarIconProps {
  route: any;
  focused: boolean;
  color: string;
  size: number;
}

export default function TabBarIcon({ route, focused, color, size }: TabBarIconProps) {
  const iconSize = focused ? size + 2 : size;
  
  switch (route.name) {
    case 'Home':
      return <Home size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'Guide':
      return <Tv size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'Search':
      return <Search size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'Recordings':
      return <Download size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'Settings':
      return <Settings size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
    default:
      return <Info size={iconSize} color={color} />;
  }
}

interface ActionButtonProps {
  type: 'play' | 'pause' | 'record' | 'stop' | 'info' | 'menu' | 'back' | 'voice';
  onPress?: () => void;
  size?: number;
}

export function ActionButton({ type, onPress, size = 24 }: ActionButtonProps) {
  const { colors } = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'play':
        return <Play size={size} color={colors.foreground} />;
      case 'pause':
        return <Pause size={size} color={colors.foreground} />;
      case 'record':
        return <Square size={size} color="#E31837" fill="#E31837" />;
      case 'stop':
        return <Square size={size} color={colors.foreground} fill={colors.foreground} />;
      case 'info':
        return <Info size={size} color={colors.foreground} />;
      case 'menu':
        return <Menu size={size} color={colors.foreground} />;
      case 'back':
        return <ChevronLeft size={size} color={colors.foreground} />;
      case 'voice':
        return <Mic size={size} color={colors.rogersRed} />;
      default:
        return <Info size={size} color={colors.foreground} />;
    }
  };

  return (
    <View 
      style={[styles.button, { backgroundColor: type === 'record' ? colors.rogersRed + '20' : colors.accent }]}
      onTouchEnd={onPress}
    >
      {getIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
});
