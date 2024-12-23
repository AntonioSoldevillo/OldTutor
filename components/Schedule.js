import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import supabase from '../src/supabaseClient';

const SchedulePage = () => {
  const router = useRouter();
  const { tutorId } = router.params; // Access tutorId from URL params
  
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tutorId) {
      console.error('tutorId is not defined!');
      return; // Exit if tutorId is undefined
    }

    const fetchSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('schedule')
          .select('schedule_id, availability_date_time')
          .eq('tutor_id', tutorId);

        if (error) throw error;

        // Check if the schedule is already booked
        const schedulesWithStatus = await Promise.all(
          data.map(async (schedule) => {
            const { data: bookingData, error: bookingError } = await supabase
              .from('bookings')
              .select('booking_id')
              .eq('schedule_id', schedule.schedule_id)
              .single();

            if (bookingError) {
              console.error('Error checking booking status:', bookingError.message);
              return { ...schedule, status: 'available' };
            }

            return { ...schedule, status: 'booked' };
          })
        );

        setSchedules(schedulesWithStatus);
      } catch (error) {
        console.error('Error fetching schedules:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [tutorId]); // Depend on tutorId to fetch schedules when it changes

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#003366" />
      ) : schedules.length > 0 ? (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.schedule_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleText}>
                {new Date(item.availability_date_time).toLocaleString()}
              </Text>
              <Text style={styles.statusText}>{item.status === 'booked' ? 'Booked' : 'Available'}</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBooking(item.schedule_id, item.availability_date_time)}
                disabled={item.status === 'booked'}
              >
                <Text style={styles.bookButtonText}>
                  {item.status === 'booked' ? 'Slot Taken' : 'Book This Slot'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noSchedulesText}>No schedules available for this tutor.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 30,
  },
  scheduleCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#003366',
    marginBottom: 15,
  },
  scheduleText: {
    fontSize: 16,
    color: '#003366',
  },
  statusText: {
    fontSize: 14,
    color: '#808080',
    marginTop: 5,
  },
  bookButton: {
    marginTop: 10,
    backgroundColor: '#003366',
    padding: 10,
    borderRadius: 5,
  },
  bookButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noSchedulesText: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
  },
});

export default SchedulePage;
