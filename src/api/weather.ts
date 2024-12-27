import axios from 'axios';

const API_KEY = 'ae4ed26fb4e67a28cbf8812c92096c38'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getCurrentWeather = async (lat: number, lon: number) => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: API_KEY,
    },
  });
  return response.data;
};

export const getForecast = async (lat: number, lon: number) => {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: API_KEY,
    },
  });
  return response.data;
};

export const getHistoricalWeather = async (lat: number, lon: number, date: number) => {
  const response = await axios.get(`${BASE_URL}/timemachine`, {
    params: {
      lat,
      lon,
      dt: date,
      units: 'metric',
      appid: API_KEY,
    },
  });
  return response.data;
};
