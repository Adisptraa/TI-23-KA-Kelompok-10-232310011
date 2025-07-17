import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getLocationId, getDailyForecast } from '../services/forecaApi';
import { getAirQuality } from '../services/iqairApi';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';


export default function ForecastScreen({ navigation }) {
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHourIndex, setSelectedHourIndex] = useState(2); // Default selected hour

  // Mock hourly data for today (format 24 jam)
  const getHourlyData = () => {
    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    const temps = ['23°', '22°', '24°', '27°', '30°', '28°', '26°', '24°'];
    const conditions = ['berawan', 'berawan', 'cerah', 'cerah', 'cerah', 'berawan', 'berawan', 'berawan'];
    
    return hours.map((hour, index) => ({
      time: hour,
      temp: temps[index],
      condition: conditions[index]
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        const locId = await getLocationId('Bogor');
        const fc = await getDailyForecast(locId);
        setForecast(fc);
        const air = await getAirQuality();
        setAqi(air);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    return `${dayName}, ${dayNum}`;
  };

  const getWeatherIcon = (symbolPhrase) => {
    const phrase = symbolPhrase?.toLowerCase() || '';
    if (phrase.includes('cerah') || phrase.includes('sunny')) return 'sunny';
    if (phrase.includes('berawan') || phrase.includes('cloudy')) return 'cloudy';
    if (phrase.includes('hujan') || phrase.includes('rain')) return 'rainy';
    if (phrase.includes('badai') || phrase.includes('storm')) return 'thunderstorm';
    return 'partly-sunny';
  };

  const getWeatherEmoji = (symbolPhrase) => {
    const phrase = symbolPhrase?.toLowerCase() || '';
    if (phrase.includes('cerah') || phrase.includes('sunny')) return '☀️';
    if (phrase.includes('berawan') || phrase.includes('cloudy')) return '☁️';
    if (phrase.includes('hujan') || phrase.includes('rain')) return '🌧️';
    if (phrase.includes('badai') || phrase.includes('storm')) return '⛈️';
    return '⛅';
  };

  const handleHourPress = (index) => {
    setSelectedHourIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const hourlyData = getHourlyData();
  const today = new Date();
  const todayString = `${today.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric' 
  })}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Jumat</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.headerDate}>Juni, 20</Text>
            <View style={styles.redDot} />
          </View>
        </View>
        <TouchableOpacity 
          style={styles.mapsButton} 
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="map" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's hourly forecast */}
        <View style={styles.hourlyContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
            {hourlyData.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.hourlyItem, idx === selectedHourIndex && styles.hourlyItemActive]}
                onPress={() => handleHourPress(idx)}
              >
                <Text style={[styles.hourlyTemp, idx === selectedHourIndex && styles.hourlyTempActive]}>
                  {item.temp}
                </Text>
                <View style={[styles.hourlyIconContainer, idx === selectedHourIndex && styles.hourlyIconActive]}>
                  <Text style={styles.hourlyWeatherEmoji}>
                    {getWeatherEmoji(item.condition)}
                  </Text>
                </View>
                <Text style={[styles.hourlyTime, idx === selectedHourIndex && styles.hourlyTimeActive]}>
                  {item.time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Weekly forecast */}
        <View style={styles.weeklyContainer}>
          {forecast.slice(0, 7).map((item, idx) => (
            <View key={idx} style={styles.dailyCard}>
              <View style={styles.dailyLeft}>
                <Text style={styles.dayName}>{formatDate(item.date)}</Text>
              </View>
              <View style={styles.dailyCenter}>
                <Text style={styles.dailyWeatherEmoji}>
                  {getWeatherEmoji(item.symbolPhrase)}
                </Text>
              </View>
              <View style={styles.dailyRight}>
                <Text style={styles.dailyTemp}>{Math.round(item.maxTemp)}°</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Air Quality */}
        {aqi && (
          <View style={styles.airQualityCard}>
            <Text style={styles.airQualityTitle}>Kualitas Udara</Text>
            <View style={styles.airQualityMainContent}>
              <View style={styles.airQualityLeft}>
                <Text style={styles.aqiNumber}>{aqi.aqius}</Text>
                <Text style={styles.aqiLabel}>AQI (US)</Text>
              </View>
              <View style={styles.airQualityRight}>
                <Text style={styles.aqiStatus}>
                  {aqi.aqius <= 50 ? 'Baik' : 
                   aqi.aqius <= 100 ? 'Sedang' : 
                   aqi.aqius <= 150 ? 'Tidak Sehat' : 'Tidak Sehat'}
                </Text>
                {/* Current PM Values */}
                <View style={styles.currentPMContainer}>
                  <Text style={styles.currentPMText}>
                    PM2.5: <Text style={styles.currentPMValue}>{aqi.pm25} μg/m³</Text>
                  </Text>
                  <Text style={styles.currentPMText}>
                    PM10: <Text style={styles.currentPMValue}>{aqi.pm10} μg/m³</Text>
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Separator Line */}
            <View style={styles.separator} />
            
            {/* Pollutant Details */}
            <View style={styles.pollutantContainer}>
              <View style={styles.pollutantItem}>
                <Text style={styles.pollutantValue}>PM2.5</Text>
                <Text style={styles.pollutantLabel}>Partikel halus (≤ 2,5 μm)</Text>
                <Text style={styles.pollutantStatus}>
                  {aqi.pm25 <= 12 ? 'Baik' : 
                   aqi.pm25 <= 35 ? 'Sedang' : 
                   aqi.pm25 <= 55 ? 'Tidak Sehat untuk Sensitif' : 'Tidak Sehat'}
                </Text>
              </View>
              <View style={styles.pollutantItem}>
                <Text style={styles.pollutantValue}>PM10</Text>
                <Text style={styles.pollutantLabel}>Partikel kasar (≤ 10 μm)</Text>
                <Text style={styles.pollutantStatus}>
                  {aqi.pm10 <= 54 ? 'Baik' : 
                   aqi.pm10 <= 154 ? 'Sedang' : 
                   aqi.pm10 <= 254 ? 'Tidak Sehat untuk Sensitif' : 'Tidak Sehat'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  headerDate: {
    fontSize: 16,
    color: 'white',
    marginRight: 8,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4B4B',
  },
  mapsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  hourlyContainer: {
    marginBottom: 30,
  },
  hourlyScroll: {
    paddingVertical: 15,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 70,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 25,
  },
  hourlyItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  hourlyTemp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  hourlyTempActive: {
    color: 'white',
    fontWeight: '600',
  },
  hourlyIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  hourlyIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  hourlyWeatherEmoji: {
    fontSize: 24,
  },
  hourlyTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  hourlyTimeActive: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  weeklyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dailyLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dayName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dailyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyWeatherEmoji: {
    fontSize: 24,
    textAlign: 'center',
  },
  dailyRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dailyTemp: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  airQualityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
  },
  airQualityTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  airQualityMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  airQualityLeft: {
    alignItems: 'flex-start',
  },
  aqiNumber: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  aqiLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  airQualityRight: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 20,
  },
  aqiStatus: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 8,
  },
  currentPMContainer: {
    alignItems: 'flex-end',
  },
  currentPMText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 2,
  },
  currentPMValue: {
    color: 'white',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 15,
  },
  pollutantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
  },
  pollutantItem: {
    alignItems: 'center',
    flex: 1,
  },
  pollutantValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pollutantLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 12,
  },
  pollutantNumber: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  pollutantStatus: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
});