import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import GuideScreen from './src/screens/GuideScreen';
import RecordingsScreen from './src/screens/RecordingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SearchScreen from './src/screens/SearchScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { StorageProvider } from './src/context/StorageContext';
import TabBarIcon from './src/components/TabBarIcon';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#E31837', // Rogers red
        tabBarInactiveTintColor: isDark ? '#888' : '#666',
        headerStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Rogers PVR' }}
      />
      <Tab.Screen 
        name="Guide" 
        component={GuideScreen}
        options={{ title: 'TV Guide' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Recordings" 
        component={RecordingsScreen}
        options={{ title: 'My Recordings' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StorageProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen 
                name="Player" 
                component={PlayerScreen}
                options={{
                  presentation: 'modal',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </StorageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
