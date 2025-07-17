import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  SafeAreaView, 
  TextInput,
  FlatList,
  Keyboard,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    name: 'Bogor',
    lat: -6.595,
    lon: 106.816
  });
  const webViewRef = useRef(null);

  // Function to search locations using a geocoding service
  const searchLocation = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      // Using OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=id`
      );
      const data = await response.json();
      
      const locations = data.map(item => ({
        name: item.display_name.split(',')[0],
        fullName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
      
      setSearchResults(locations);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Gagal mencari lokasi. Coba lagi.');
    }
  };

  // Function to select a location and update the map
  const selectLocation = (location) => {
    setCurrentLocation(location);
    setSearchText(location.name);
    setShowSearchResults(false);
    Keyboard.dismiss();
    
    // Update Windy map with new coordinates
    const newUrl = `https://embed.windy.com/embed2.html?lat=${location.lat}&lon=${location.lon}&detailLat=${location.lat}&detailLon=${location.lon}&width=650&height=450&zoom=10&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
    
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = '${newUrl}';`);
    }
  };

  // Get current Windy URL based on selected location
  const getWindyUrl = () => {
    return `https://embed.windy.com/embed2.html?lat=${currentLocation.lat}&lon=${currentLocation.lon}&detailLat=${currentLocation.lat}&detailLon=${currentLocation.lon}&width=650&height=450&zoom=10&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectLocation(item)}
    >
      <Ionicons name="location-outline" size={16} color="#666" />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultFull} numberOfLines={1}>
          {item.fullName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari lokasi..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              searchLocation(text);
            }}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
            >
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            style={styles.searchResultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Current Location Info */}
      <View style={styles.locationInfo}>
        <Ionicons name="location" size={16} color="white" />
        <Text style={styles.locationText}>{currentLocation.name}</Text>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Memuat peta cuaca...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: getWindyUrl() }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(error) => {
            console.error('WebView error:', error);
            setLoading(false);
          }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          scalesPageToFit={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
        />
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            // Reset to Bogor
            const bogorLocation = { name: 'Bogor', lat: -6.595, lon: 106.816 };
            selectLocation(bogorLocation);
          }}
        >
          <Ionicons name="home" size={20} color="white" />
          <Text style={styles.controlButtonText}>Bogor</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.controlButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4C90FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#4C90FF',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 5,
  },
  searchResultsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 5,
    borderRadius: 15,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  searchResultsList: {
    borderRadius: 15,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    marginLeft: 10,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  searchResultFull: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginTop: 10,
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 15,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 144, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
});