import axios from 'axios';

const API_DOMAIN = 'https://pfa.foreca.com';
const USERNAME = 'adi2422sd';
const PASSWORD = 'UBFWATVmyIG6';

let accessToken = null;

export const getAccessToken = async () => {
  if (accessToken) return accessToken;

  const response = await axios.post(`${API_DOMAIN}/authorize/token?expire_hours=2`, {
    user: USERNAME,
    password: PASSWORD,
  });
  accessToken = response.data.access_token;
  return accessToken;
};

export const getLocationId = async (city) => {
  const token = await getAccessToken();
  const res = await axios.get(`${API_DOMAIN}/api/v1/location/search/${city}?lang=id`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.locations[0].id;
};

export const getCurrentWeather = async (locationId) => {
  const token = await getAccessToken();
  const res = await axios.get(`${API_DOMAIN}/api/v1/current/${locationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.current;
};

export const getDailyForecast = async (locationId) => {
  const token = await getAccessToken();
  const res = await axios.get(`${API_DOMAIN}/api/v1/forecast/daily/${locationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.forecast;
};
