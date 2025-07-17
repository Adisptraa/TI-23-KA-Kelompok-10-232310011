import axios from 'axios';

const API_KEY = 'f0767e20-27cb-43d5-a351-61e1b9ee3e7f';

export const getAirQuality = async (city = 'Bogor') => {
  const res = await axios.get(`http://api.airvisual.com/v2/city?city=${city}&state=West%20Java&country=Indonesia&key=${API_KEY}`);
  return res.data.data.current.pollution;
};
