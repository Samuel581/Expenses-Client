// Custom hook for easier access to AuthContext
import { useContext } from "react";
import { AuthContext } from "@/contexts/authContextDefinition";
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
