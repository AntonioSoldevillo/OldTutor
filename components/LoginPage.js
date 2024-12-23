import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, TextInput, Checkbox } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; 
import supabase from '../src/supabaseClient';  

const LoginPage = ({ navigation }) => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(null); 

  // Handle sa login process
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Login error:', authError.message);
        setErrorMessage(authError.message);
        return;
      }

      const userId = authData.user.id;

      // Fetch user details gikan sa `users` table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError.message);
        setErrorMessage('Error fetching user details: ' + userError.message);
        return;
      }

      // Check kung ang user is naa sa `tutors` table
      const { data: tutorData, error: tutorError } = await supabase
        .from('tutors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (tutorError && tutorError.code !== 'PGRST116') { 
        console.error('Error checking tutor role:', tutorError.message);
        setErrorMessage('Error checking tutor role: ' + tutorError.message);
        return;
      }

      // Determine asa mag  navigate based osa role
      if (tutorData) {
        navigation.navigate('TutorDashboard'); 
      } else {
        navigation.navigate('TuteeDashboard'); 
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrorMessage('An unexpected error occurred: ' + error.message);
    }
  };

  useEffect(() => {
    // Listen para authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigation.navigate('Dashboard'); 
      }
    });

    // Clean up 
    return () => {
      authListener?.unsubscribe(); 
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Ionicons name="book-outline" size={80} color="#003366" style={styles.logoIcon} />
      <Text style={styles.title}>TutorLink</Text>

      {/* Email input */}
      <TextInput
        label="Email address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        mode="outlined"
        theme={{
        colors: {
          primary: '#003366', 
          underlineColor: 'transparent', 
        }}
        }
      />

      {/* Password input with visibility toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          label="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible} 
          style={styles.input}
          mode="outlined"
          theme={{
        colors: {
          primary: '#003366', 
          underlineColor: 'transparent', 
        }}
        }
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#808080"
          />
        </TouchableOpacity>
      </View>

      {/* Display error message if login fail */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {/* Remember me checkbox */}
      <View style={styles.rememberMeContainer}>
        <Checkbox
          status={rememberMe ? 'checked' : 'unchecked'}
          onPress={() => setRememberMe(!rememberMe)}
        />
        <Text>Remember me</Text>
      </View>

      {/* Forgot password link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
  <Text style={styles.forgotPassword}>Forgot password?</Text>
</TouchableOpacity>

      {/* Login button */}
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>

      {/* Sign up link */}
      <View style={styles.signUpContainer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Social media login options */}
      <Text style={styles.orText}>OR</Text>
      <Button mode="outlined" icon="google" style={styles.socialButton} theme={{
        colors: {
          primary: '#003366', 
          underlineColor: 'transparent', 
        }}
        }>
        Continue with Google
      </Button>
      <Button mode="outlined" icon="facebook" style={styles.socialButton} theme={{
        colors: {
          primary: '#003366', 
          underlineColor: 'transparent', 
        }}
        }>
        Continue with Facebook
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#003366',
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'transparent',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotPassword: {
    color: '#003366',
    textAlign: 'right',
    marginTop: -39,
  },
  button: {
    marginBottom: 20,
    backgroundColor: '#003366',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signUpText: {
    color: '#003366',
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 5,
    color: '#808080',
    marginBottom: 20,
  },
  socialButton: {
    marginBottom: 10,
    BackgroundColor:'#003366',
    color:'#003366'
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LoginPage;
