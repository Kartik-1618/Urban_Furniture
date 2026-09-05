import Cookies from 'js-cookie';

const TOKEN_KEY = 'urban_access_token';

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }); // 7 days
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};
