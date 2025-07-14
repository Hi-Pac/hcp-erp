import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Initialize default settings if not exists
  useEffect(() => {
    const existingSettings = localStorage.getItem('systemSettings');
    if (!existingSettings) {
      const defaultSettings = {
        currency: 'EGP',
        currencySymbol: 'ج.م',
        autoLogoutTime: 30, // 30 minutes default
        companyName: 'شركة دلتا للدهانات الحديثة',
        companyAddress: 'القاهرة، مصر',
        companyPhone: '01234567890',
        companyEmail: 'info@deltapaints.com',
        taxNumber: '123456789'
      };
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    }
  }, []);

  // Auto logout based on system settings
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const timeDiff = now - lastActivity;

      // Get auto logout time from settings (default 30 minutes)
      const settings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
      const autoLogoutMinutes = settings.autoLogoutTime || 30;

      // If auto logout is disabled (0), don't check
      if (autoLogoutMinutes === 0) return;

      const logoutTime = autoLogoutMinutes * 60 * 1000; // Convert to milliseconds

      if (timeDiff > logoutTime && currentUser) {
        logout();
        toast.error(`تم تسجيل الخروج تلقائياً بعد ${autoLogoutMinutes} دقيقة من عدم النشاط`);
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity, currentUser]);

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Get user role from Firestore
  const getUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role || 'User';
      }
      return 'User';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'User';
    }
  };

  // Demo users for testing
  const demoUsers = {
    'admin@hcp.com': { password: 'admin123', role: 'admin', name: 'مدير النظام' },
    'supervisor@hcp.com': { password: 'supervisor123', role: 'supervisor', name: 'مشرف النظام' },
    'sales@hcp.com': { password: 'sales123', role: 'sales', name: 'موظف مبيعات' },
    'user@hcp.com': { password: 'user123', role: 'user', name: 'مستخدم عادي' }
  };

  // Login function (using demo data for now)
  const login = async (email, password) => {
    try {
      setLoading(true);

      // Check demo users first
      const demoUser = demoUsers[email];
      if (demoUser && demoUser.password === password) {
        const user = { email, displayName: demoUser.name, uid: email };
        setCurrentUser(user);
        setUserRole(demoUser.role);
        setLastActivity(Date.now());
        toast.success('تم تسجيل الدخول بنجاح');
        return { user };
      }

      // Fallback to Firebase if demo user not found
      const result = await signInWithEmailAndPassword(auth, email, password);
      const role = await getUserRole(result.user.uid);
      setUserRole(role);
      setLastActivity(Date.now());
      toast.success('تم تسجيل الدخول بنجاح');
      return result;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('خطأ في تسجيل الدخول: بيانات غير صحيحة');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        name: userData.name,
        role: userData.role || 'User',
        createdAt: new Date(),
        createdBy: currentUser?.uid || 'system'
      });

      toast.success('تم إنشاء المستخدم بنجاح');
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('خطأ في إنشاء المستخدم: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // For demo users, just clear local state
      if (currentUser && demoUsers[currentUser.email]) {
        setCurrentUser(null);
        setUserRole(null);
        toast.success('تم تسجيل الخروج بنجاح');
        return;
      }

      // For Firebase users
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('خطأ في تسجيل الخروج');
    }
  };

  // Check permissions
  const hasPermission = (requiredRole) => {
    const roleHierarchy = {
      'admin': 4,
      'Admin': 4,
      'supervisor': 3,
      'Supervisor': 3,
      'sales': 2,
      'Sales': 2,
      'user': 1,
      'User': 1
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    register,
    logout,
    hasPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
