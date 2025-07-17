import axios from 'axios';

// Base URL Nominatim
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// 🔍 Cari lokasi berdasarkan nama atau kata kunci
export const searchLocations = async (query, limit = 5) => {
  if (!query || query.length < 2) return [];

  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        format: 'json',
        q: query,
        limit: limit,
        'accept-language': 'id,en',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        // countrycodes: 'id', // ❌ DIHAPUS agar bisa global
      },
      headers: {
        'User-Agent': 'ForeskyWeatherApp/1.0 (gunturpurnama802@gmail.com)', // ✅ WAJIB!
      },
      timeout: 5000
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Respon dari server tidak valid');
    }

    return response.data
      .filter(item => item.lat && item.lon)
      .map(item => ({
        id: item.place_id,
        name: getLocationName(item),
        fullName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type || 'unknown',
        importance: item.importance || 0
      }));
  } catch (error) {
    console.error('Error searching locations:', error.message || error);
    throw new Error('Gagal mencari lokasi. Periksa koneksi internet atau coba lagi nanti.');
  }
};

// 🧭 Dapatkan info detail lokasi dari koordinat
export const getLocationDetails = async (lat, lon) => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        format: 'json',
        lat: lat,
        lon: lon,
        'accept-language': 'id,en',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        zoom: 10
      },
      headers: {
        'User-Agent': 'ForeskyWeatherApp/1.0 (gunturpurnama802@gmail.com)', // ✅ Sama seperti di atas
      },
      timeout: 5000
    });

    if (response.data) {
      const item = response.data;
      return {
        name: getLocationName(item),
        fullName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.address,
        type: item.type || 'unknown'
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting location details:', error.message || error);
    throw new Error('Gagal mendapatkan detail lokasi.');
  }
};

// 🔠 Ekstrak nama lokasi dari hasil API
const getLocationName = (item) => {
  if (item.namedetails?.name) {
    return item.namedetails.name;
  }

  if (item.address) {
    const nameFields = [
      'city', 'town', 'village', 'suburb', 'neighbourhood',
      'county', 'state_district', 'state', 'region'
    ];
    for (const field of nameFields) {
      if (item.address[field]) {
        return item.address[field];
      }
    }
  }

  return item.display_name?.split(',')[0] || 'Tidak dikenal';
};

// 📌 Daftar kota populer Indonesia (untuk shortcut)
export const getPopularCities = () => {
  return [
    { name: 'Jakarta', lat: -6.2088, lon: 106.8456, fullName: 'Jakarta, Indonesia' },
    { name: 'Bogor', lat: -6.5950, lon: 106.8161, fullName: 'Bogor, Jawa Barat, Indonesia' },
    { name: 'Bandung', lat: -6.9175, lon: 107.6191, fullName: 'Bandung, Jawa Barat, Indonesia' },
    { name: 'Surabaya', lat: -7.2575, lon: 112.7521, fullName: 'Surabaya, Jawa Timur, Indonesia' },
    { name: 'Yogyakarta', lat: -7.7956, lon: 110.3695, fullName: 'Yogyakarta, Indonesia' },
    { name: 'Medan', lat: 3.5952, lon: 98.6722, fullName: 'Medan, Sumatera Utara, Indonesia' },
    { name: 'Semarang', lat: -6.9669, lon: 110.4203, fullName: 'Semarang, Jawa Tengah, Indonesia' },
    { name: 'Makassar', lat: -5.1477, lon: 119.4327, fullName: 'Makassar, Sulawesi Selatan, Indonesia' },
    { name: 'Palembang', lat: -2.9761, lon: 104.7754, fullName: 'Palembang, Sumatera Selatan, Indonesia' },
    { name: 'Tangerang', lat: -6.1701, lon: 106.6403, fullName: 'Tangerang, Banten, Indonesia' }
  ];
};

// 🧪 Validasi koordinat
export const isValidCoordinate = (lat, lon) => {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
};
