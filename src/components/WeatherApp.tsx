import React, { useEffect, useState } from 'react';
import { getCurrentWeather, getForecast, getHistoricalWeather } from '../api/weather';

// More explicit type definitions
interface WeatherData {
  main: { 
    temp: number;
    feels_like?: number;
    humidity?: number;
  };
  weather: { 
    description: string;
    main: string;
    icon: string;
  }[];
  name?: string;
}

interface ForecastData {
  dt_txt: string;
  main: { 
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: { 
    description: string;
    icon: string;
  }[];
}

// New type for location
interface LocationCoords {
  latitude: number;
  longitude: number;
}

const WeatherApp: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Centralized error handling function
  const handleError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  // Extracted location retrieval logic
  const getCurrentLocation = (): Promise<LocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude && longitude) {
            resolve({ latitude, longitude });
          } else {
            reject(new Error('Unable to retrieve precise location'));
          }
        },
        () => reject(new Error('Location access denied'))
      );
    });
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const { latitude, longitude } = await getCurrentLocation();
      
      const current = await getCurrentWeather(latitude, longitude);
      const forecastResponse = await getForecast(latitude, longitude);
      
      if (forecastResponse.list && Array.isArray(forecastResponse.list)) {
        // Filter forecast to get unique days
        const uniqueForecast = forecastResponse.list.filter((item, index, self) => 
          index === self.findIndex((t) => (
            new Date(t.dt_txt).toDateString() === new Date(item.dt_txt).toDateString()
          )))
        .slice(0, 5);
        
        setForecast(uniqueForecast);
      } else {
        setForecast([]);
      }
      
      setCurrentWeather(current);
      setError(null);
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalWeather = async () => {
    if (!selectedDate) {
      handleError('Please select a date');
      return;
    }

    try {
      setLoading(true);
      const { latitude, longitude } = await getCurrentLocation();
      const timestamp = Math.floor(new Date(selectedDate).getTime() / 1000);
      
      const historical = await getHistoricalWeather(latitude, longitude, timestamp);
      setCurrentWeather(historical);
      setError(null);
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to fetch historical weather');
    } finally {
      setLoading(false);
    }
  };

  // Initial weather data fetch
  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Render helpers
  const renderCurrentWeather = () => {
    if (loading) return <p>Loading current weather. . .</p>;
    if (!currentWeather) return <p>No weather data available</p>;

    return (
      <div>
        <h2 className="text-xl font-bold">
          {currentWeather.name ? `Weather in ${currentWeather.name}` : 'Current Weather'}
        </h2>
        <p>Temperature: {currentWeather.main.temp.toFixed(1)}°C</p>
        <p>Feels Like: {currentWeather.main.feels_like?.toFixed(1)}°C</p>
        <p>Condition: {currentWeather.weather[0].description}</p>
      </div>
    );
  };

  const renderForecast = () => {
    if (loading) return <p>Loading forecast...</p>;
    if (forecast.length === 0) return <p>No forecast available</p>;

    return (
      <div>
        <h2 className="text-lg font-semibold mt-4">5-Day Weather</h2>
        <ul className="space-y-2">
          {forecast.map((day, index) => (
            <li 
              key={index} 
              className="flex justify-between items-center bg-blue-50 p-2 rounded"
            >
              <span>{new Date(day.dt_txt).toLocaleDateString()}</span>
              <span>{day.main.temp.toFixed(1)}°C</span>
              <span>{day.weather[0].description}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-black rounded-xl shadow-md space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      
      {renderCurrentWeather()}
      {renderForecast()}

      <div className="mt-4">
        <label htmlFor="date" className="block font-medium">
           Date:
        </label>
        <input
          type="date"
          id="date"
          className="mt-1 block w-full border border-gray-400 rounded-md shadow-m"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button
          className="mt-2 bg-black text-blue-500 px-4 py-2 rounded-md disabled:opacity-50"
          onClick={fetchHistoricalWeather}
          disabled={!selectedDate || loading}
        >
           Historical Weather
        </button>
      </div>
    </div>
  );
};

export default WeatherApp;
