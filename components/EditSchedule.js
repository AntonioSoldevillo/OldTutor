import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';  
import supabase from '../src/supabaseClient';

const EditSchedule = ({ route, navigation }) => {
  const { schedule } = route.params; // kuhaon schedule data passed from TutorSchedule screen
  const [availabilityDateTime, setAvailabilityDateTime] = useState(schedule.availability_date_time);

  // Update ang schedule in the database
  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('schedule')
        .update({ availability_date_time: availabilityDateTime })
        .eq('schedule_id', schedule.schedule_id);

      if (error) throw new Error('Failed to update schedule');

      Alert.alert('Success', 'Schedule updated successfully');
      navigation.goBack(); 
    } catch (err) {
      console.error('Error updating schedule:', err.message);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button and Title in a Row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Schedule</Text>
      </View>

      <Text style={styles.label}>Availability Date and Time</Text>
      <TextInput
        style={styles.input}
        value={availabilityDateTime}
        onChangeText={setAvailabilityDateTime}
        placeholder="YYYY-MM-DD HH:MM:SS"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginTop: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 40, 
  },
  backButton: {
    marginRight: 10, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center', 
    flex: 1, 
    color:'#003366',
    marginLeft:-23
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#003366',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditSchedule;
