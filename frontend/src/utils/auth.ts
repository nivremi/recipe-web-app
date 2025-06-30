export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
};

export function saveUser(username: string) {
  localStorage.setItem("username", username);
}

export function getUser(): string | null {
  return localStorage.getItem("username");
}

