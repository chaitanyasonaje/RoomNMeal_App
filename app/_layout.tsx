// Root layout with providers
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AlertProvider } from '@/template';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="admin-login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="listing/[id]" 
              options={{ 
                headerShown: true,
                title: 'Listing Details',
                headerBackTitle: 'Back',
              }} 
            />
            <Stack.Screen 
              name="add-listing" 
              options={{ 
                headerShown: true,
                title: 'Add Listing',
                headerBackTitle: 'Cancel',
              }} 
            />
            <Stack.Screen 
              name="edit-listing/[id]" 
              options={{ 
                headerShown: true,
                title: 'Edit Listing',
                headerBackTitle: 'Cancel',
              }} 
            />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
