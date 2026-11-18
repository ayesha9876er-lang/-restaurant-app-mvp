import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  // AppNavigator isLoading dhoondta hai, baaki loading dhoondte hain - dono de do
  return { ...ctx, loading: ctx.isLoading };
}

export default useAuth;