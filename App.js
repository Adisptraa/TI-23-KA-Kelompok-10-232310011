import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import ForecastScreen from './screens/ForecastScreen';
import MapScreen from './screens/MapScreen';
import SearchScreen from './screens/SearchScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#4C90FF" />
      <Stack.Navigator 
        initialRouteName="Splash" 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#4C90FF' },
          animationEnabled: true,
          animationTypeForReplace: 'push',
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Forecast" 
          component={ForecastScreen}
          options={{
            animationEnabled: true,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
          options={{
            animationEnabled: true,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            animationEnabled: true,
            gestureEnabled: true,
          }}
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}