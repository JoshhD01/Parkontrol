const backendHost =
  typeof window !== 'undefined' && window.location.hostname
    ? `${window.location.hostname}:7820`
    : 'localhost:7820';

export const environment = {
  production: false,
  urlApi: `http://${backendHost}/api`,
};