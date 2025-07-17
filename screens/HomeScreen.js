import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { getLocationId, getCurrentWeather } from '../services/forecaApi';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [weather, setWeather] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('Bogor');
  const [loading, setLoading] = useState(false);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const fetchWeatherData = async (locationName) => {
    setLoading(true);
    try {
      const locId = await getLocationId(locationName);
      const data = await getCurrentWeather(locId);
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      showAlert('Gagal', 'Tidak bisa mengambil data cuaca');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      if (Platform.OS === 'web') {
        // Di browser, langsung pakai lokasi default
        await fetchWeatherData('Bogor');
      } else {
        // Di Android/iOS tetap pakai currentLocation
        await fetchWeatherData(currentLocation);
      }
    };
    fetchInitial();
  }, []);

  const handleLocationSelect = (location) => {
    setCurrentLocation(location.name);
    fetchWeatherData(location.name);
  };

  const openSearchScreen = () => {
    navigation.navigate('Search', {
      onLocationSelect: handleLocationSelect,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Memuat cuaca...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton} onPress={openSearchScreen}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.searchButtonText}>Cari lokasi...</Text>
        </TouchableOpacity>
      </View>

      {/* Isi */}
      <View style={styles.content}>
        <Text style={styles.city}>{currentLocation}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        <Text style={styles.time}>
          {new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        <View style={styles.weatherBox}>
          <Text style={styles.temp}>{Math.round(weather.temperature)}°</Text>
          <Text style={styles.desc}>{weather.symbolPhrase}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="eye-outline" size={16} color="white" />
              <Text style={styles.detail}>Angin</Text>
              <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={16} color="white" />
              <Text style={styles.detail}>Kelembapan</Text>
              <Text style={styles.detailValue}>{weather.relHumidity}%</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forecastButton}
          onPress={() => navigation.navigate('Forecast', {
            location: currentLocation,
          })}
        >
          <Text style={styles.forecastButtonText}>Laporan Perkiraan</Text>
          <Ionicons name="chevron-forward" size={20} color="#4C90FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4C90FF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#4C90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  city: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  time: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 50,
  },
  weatherBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
  },
  temp: {
    fontSize: 64,
    color: 'white',
    fontWeight: '300',
    marginBottom: 5,
  },
  desc: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  forecastButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  forecastButtonText: {
    color: '#4C90FF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
});
