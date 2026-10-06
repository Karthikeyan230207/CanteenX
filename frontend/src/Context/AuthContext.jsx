import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // CHECK EXISTING SESSION
  // =========================================

  const checkSession = async () => {
    try {
      const response = await fetch(
        "https://smart-canteen-system-pyyl.onrender.com/api/auth/profile",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();

        setStudent(data.student);
      } else {
        setStudent(null);
      }
    } catch (error) {
      console.error(
        "Session check failed:",
        error
      );

      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // CHECK SESSION WHEN APP STARTS
  // =========================================

  useEffect(() => {
    checkSession();
  }, []);

  // =========================================
  // SIGN IN
  // =========================================

  const signin = async (
    registerNumber,
    password
  ) => {
    const response = await fetch(
      "https://smart-canteen-system-pyyl.onrender.com/api/auth/signin",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          registerNumber,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    setStudent(data.student);

    return data;
  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = async () => {
    try {
      await fetch(
        "https://smart-canteen-system-pyyl.onrender.com/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    setStudent(null);
  };

  // =========================================
  // UPDATE PROFILE
  // =========================================

  const updateProfile = async (profileData) => {
    const response = await fetch(
      "https://smart-canteen-system-pyyl.onrender.com/api/auth/profile",
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify(profileData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Profile update failed"
      );
    }

    setStudent(data.student);

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        isLoggedIn: !!student,
        loading,
        signin,
        logout,
        updateProfile,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================================
// CUSTOM HOOK
// =========================================

export const useAuth = () => {
  return useContext(AuthContext);
};