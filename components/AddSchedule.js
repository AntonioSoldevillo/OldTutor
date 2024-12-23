import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import supabase from '../src/supabaseClient'; 
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons'; 

// Component para sa pag-manage sa mga schedule sa tutor
const Schedule = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleId, setScheduleId] = useState(route?.params?.scheduleId || null); 
  const [currentSchedule, setCurrentSchedule] = useState(null);

  // Pag-load sa schedule data kung naay schedule ID
  useEffect(() => {
    if (scheduleId) {
      fetchScheduleData(scheduleId);
    }
  }, [scheduleId]);

   // Function para kuhaon ang schedule gikan sa database
  const fetchScheduleData = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('availability_date_time')
        .eq('schedule_id', scheduleId)
        .single();
      
      if (error) {
        setError('Error fetching schedule data: ' + error.message);
        return;
      }

      if (data) {
        const scheduleDateTime = new Date(data.availability_date_time);
        setSelectedDate(scheduleDateTime.toISOString().split('T')[0]); // Set date in YYYY-MM-DD format
        setSelectedTime(scheduleDateTime); // Set time for the time picker
        setCurrentSchedule(data);
      }
    } catch (err) {
      setError('An error occurred while fetching schedule data: ' + err.message);
    }
  };

   // Function para i-update ang petsa gikan sa calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString); 
  };

// Function para i-update ang oras
  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios' ? true : false); // Hide time picker on iOS after selection
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  // Function para i-save oR i-update ang schedule sa database
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a valid date and time');
      return;
    }
  
    // e Extract ang hours and minutes sa selected time
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
  
    // Create a Date object para sa selected date and set hours and minutes
    const localDateTime = new Date(selectedDate);
    localDateTime.setHours(hours);
    localDateTime.setMinutes(minutes);
    
    // adjust ang local time to UTC by getting  time zone offset in minutes
    const timeZoneOffset = localDateTime.getTimezoneOffset(); // returns the offset in minutes
    localDateTime.setMinutes(localDateTime.getMinutes() - timeZoneOffset); // Adjust by offset
  
    
    const availabilityDateTime = localDateTime.toISOString(); 
  
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError) {
        setError('Error retrieving user: ' + userError.message);
        return;
      }
  
      if (!user) {
        setError('You must be logged in to create or edit a schedule');
        return;
      }
  
      // Fetch the tutor_id from the tutors table using the user.id
      const { data: tutorData, error: tutorError } = await supabase
        .from('tutors')
        .select('tutor_id')
        .eq('user_id', user.id)
        .single();
  
      if (tutorError || !tutorData) {
        setError('Tutor ID not found for this user');
        return;
      }

      // If editing, update the schedule
      if (scheduleId) {
        const { data, error } = await supabase
          .from('schedule')
          .update({ availability_date_time: availabilityDateTime })
          .eq('schedule_id', scheduleId);
  
        if (error) {
          setError('Error updating schedule: ' + error.message);
        } else {
          navigation.goBack(); // Navigate back after updating the schedule
        }
      } else {
        // If creating, insert the schedule into the schedule table
        const { data, error } = await supabase.from('schedule').insert([{
          tutor_id: tutorData.tutor_id, // Use the retrieved tutor_id
          availability_date_time: availabilityDateTime, // Store as UTC
        }]);
  
        if (error) {
          setError('Error creating schedule: ' + error.message);
        } else {
          navigation.goBack(); // Navigate back after creating the schedule
        }
      }
    } catch (err) {
      setError('An error occurred: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#003366"  />
      </TouchableOpacity>

      <Text style={styles.title}>{scheduleId ? 'Edit Schedule' : 'Create a New Schedule'}</Text>

      {/* Calendar to select a date */}
      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue', selectedTextColor: 'white' },
        }}
      />

      {/* Time Picker */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.buttonText}>Select Time</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Save Schedule Button */}
      <TouchableOpacity style={[styles.button, { marginTop: 15 }]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{scheduleId ? 'Update Schedule' : 'Save Schedule'}</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('TutorDashboard')}>
          <Ionicons name="home-outline" size={24} color="#003366" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-outline" size={24} color="#808080" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
          <Ionicons name="calendar-outline" size={24} color="#003366" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="book-outline" size={24} color="#003366" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#808080" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginTop: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#003366',
  },
  error: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#003366', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default Schedule;
