// Environment configuration for deployment
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    WEBSOCKET_URL: 'http://localhost:5000'
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_URL || '/api',
    WEBSOCKET_URL: process.env.REACT_APP_WS_URL || window.location.origin
  }
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment];