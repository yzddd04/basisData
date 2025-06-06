import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../services/api';
// import api from '../services/api'; // Komen atau hapus import api

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: 'librarian' | 'admin';
  token: string;
}

interface AuthContextType {
  user: Staff | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ambil user dari localStorage jika ada
    const storedUser = localStorage.getItem('lmsUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Set default Authorization header jika perlu
      // api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  // Login beneran ke backend
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('lmsUser', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lmsUser');
    // Hapus juga header Authorization jika digunakan
    // delete api.defaults.headers.common['Authorization'];
  };

  const isAdmin = () => {
    // Jika user ada dan role-nya admin, atau jika kita bypass login (dummy user selalu admin)
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;