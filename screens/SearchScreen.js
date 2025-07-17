import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchLocations, getPopularCities } from '../services/locationService';

export default function SearchScreen({ navigation, route }) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popularCities] = useState(getPopularCities());
  const { onLocationSelect } = route.params || {};

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.length >= 2) {
        performSearch(searchText);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const results = await searchLocations(query, 8);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal mencari lokasi');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    navigation.goBack();
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.locationIcon}>
        <Ionicons 
          name={item.type === 'city' ? 'location' : 'location-outline'} 
          size={20} 
          color="#4C90FF" 
        />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDetails} numberOfLines={2}>
          {item.fullName}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderPopularCityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.popularCityItem}
      onPress={() => handleLocationSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.popularCityIcon}>
        <Ionicons name="location" size={18} color="#666" />
      </View>
      <Text style={styles.popularCityName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilih Lokasi</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kota atau tempat..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="words"
            returnKeyType="search"
            autoFocus={true}
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={clearSearch} 
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4C90FF" />
            <Text style={styles.loadingText}>Mencari lokasi...</Text>
          </View>
        )}

        {searchText.length >= 2 && !loading && (
          <View style={styles.resultsContainer}>
            {searchResults.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Hasil Pencarian</Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderLocationItem}
                  keyExtractor={(item, index) => `search-${index}-${item.name}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.resultsList}
                />
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>
                  Tidak ada hasil untuk "{searchText}"
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Coba gunakan kata kunci yang berbeda
                </Text>
              </View>
            )}
          </View>
        )}

        {searchText.length < 2 && !loading && (
          <View style={styles.popularContainer}>
            <Text style={styles.sectionTitle}>Kota Populer</Text>
            <FlatList
              data={popularCities}
              renderItem={renderPopularCityItem}
              keyExtractor={(item, index) => `popular-${index}-${item.name}`}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              style={styles.popularList}
              columnWrapperStyle={styles.popularRow}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resultsList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  popularContainer: {
    flex: 1,
    paddingTop: 16,
  },
  popularList: {
    flex: 1,
  },
  popularRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  popularCityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
    marginBottom: 8,
  },
  popularCityIcon: {
    marginRight: 8,
  },
  popularCityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
});