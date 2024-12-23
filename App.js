import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './src/supabaseClient'; // Correct import of Supabase client
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUp';
import DashboardPage from './components/Dashboard'; // Import DashboardPage
import SubjectPage from './components/Subject'; // Import SubjectPage
import TutorsPage from './components/Tutors'; // Import TutorsPage
import BookingPage from './components/Book'; // Import BookingPage
import FeePage from './components/Fee';
import Pending from './components/Pending';
import Settings from './components/Settings'; 
import TutorDash from './components/TutorDash';
import Schedule from './components/Schedule'
import TutorSub from './components/TutorSub';
import TutorSchedule from './components/TutorSchedule';
import BookingsInfo from './components/BookingsInfo'
import AddSchedule from './components/AddSchedule';
import EditSchedule from './components/EditSchedule';
import TuteeProfile from './components/TuteeProfile';
import MessagePage from './components/Message';
import TutorSettings from './components/TutorSettings';
import TutorProfile from './components/TutorProfile';
import ForgotPassword from './components/ForgotPassword';
import MySubjectsDashboard from './components/MySubjectsDashboard';
import TutorMessage from './components/TutorMessage';


const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  // Check if ang  user is naka logged in
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return;
    }

    const currentUser = supabase.auth.user(); // Get ang current logged-in user
    if (currentUser) {
      setUser(currentUser); // Set the user if naka logged in
    } else {
      setUser(null); 
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null); // Update ang user state on auth state change
    });

    return () => {
      authListener?.unsubscribe(); // Clean up the listener 
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Dashboard" : "Login"}>
        <Stack.Screen 
          name="Login" 
          component={LoginPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Subjects" 
          component={SubjectPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Tutors" 
          component={TutorsPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Booking" 
          component={BookingPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Fee"
          component={FeePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
            name="Pending" 
            component={Pending} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
          name="Settings" 
          component={Settings} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TutorDashboard" 
          component={TutorDash} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="SchedulePage" 
          component={Schedule} 
          options={{ headerShown: false }} 
/>

<Stack.Screen 
          name="TutorSub" 
          component={TutorSub} 
          options={{ headerShown: false }}
        />
            <Stack.Screen 
      name="TutorSchedule" 
      component={TutorSchedule} 
      options={{ headerShown: false }} 
      
/>
<Stack.Screen 
      name="BookingsInfo" 
      component={BookingsInfo} 
      options={{ headerShown: false }} 
/>
<Stack.Screen name="AddSchedule" component={AddSchedule} options={{ headerShown: false }}  />

<Stack.Screen name="EditSchedule" component={EditSchedule} options={{ headerShown: false }}/>

<Stack.Screen name="TuteeProfile" component={TuteeProfile} options={{ headerShown: false }} />
<Stack.Screen
          name="Messages"
          component={MessagePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TutorSettings"
          component={TutorSettings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TutorProfile"
          component={TutorProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MySubjectsDashboard"
          component={MySubjectsDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TutorMessage"
          component={TutorMessage}
          options={{ headerShown: false }}
        />
       

      </Stack.Navigator>
    </NavigationContainer>
  );
}
