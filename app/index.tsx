// Root redirect with role-based routing
import { AuthRouter } from '@/template';
import { useAuth } from '@/template';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/theme';

function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Default to tabs (all roles use tab navigation)
  return <Redirect href="/(tabs)" />;
}

export default function RootScreen() {
  return (
    <AuthRouter loginRoute="/login">
      <RoleBasedRedirect />
    </AuthRouter>
  );
}
