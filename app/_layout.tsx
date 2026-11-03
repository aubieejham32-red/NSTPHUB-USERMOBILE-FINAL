import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';

import {
  Stack,
} from 'expo-router';

import {
  StatusBar,
} from 'expo-status-bar';

import 'react-native-reanimated';

import {
  ThemeProvider,
  useAppTheme,
} from '../contexts/ThemeContext';


const NSTP_DARK_NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#D99202',
    background: '#000D12',
    card: '#233E47',
    text: '#EFEBE2',
    border: '#58761C',
    notification: '#D99202',
  },
};


/*
|--------------------------------------------------------------------------
| NSTP HUB Root Layout
|--------------------------------------------------------------------------
|
| Current application structure:
|
| app/
| │
| ├── (tabs)/
| │   ├── AccountSettingsScreen.js
| │   ├── AnnouncementsScreen.js
| │   ├── AttendanceRecordScreen.js
| │   ├── DigitalStudentIdScreen.js
| │   ├── HomepageScreen.js
| │   ├── ReportScreen.js
| │   ├── RotcSchedScreen.js
| │   └── _layout.tsx
| │
| ├── Registration/
| │   │
| │   ├── ROTC/
| │   │   ├── RotcEnrollment.js
| │   │   └── RotcConfirmEnrollment.js
| │   │
| │   ├── PreRegistrationScreen.js
| │   ├── GeneralRegistrationScreen.js
| │   ├── GeneralRegistrationSignature.js
| │   ├── RegistrationWaitEdit.js
| │   └── RegistrationConfirmation.js
| │
| ├── AccessCodeScreen.js
| ├── ChangePasswordScreen.js
| ├── CreatePasswordScreen.js
| ├── LoadingScreen.js
| ├── LoginScreen.js
| ├── Logout.js
| ├── index.js
| ├── modal.tsx
| └── _layout.tsx
|
*/


/*
|--------------------------------------------------------------------------
| Expo Router Settings
|--------------------------------------------------------------------------
|
| Main authenticated student application:
|
| app/(tabs)/
|
*/

export const unstable_settings = {
  anchor: '(tabs)',
};


/*
|--------------------------------------------------------------------------
| Root Layout
|--------------------------------------------------------------------------
*/

function AppNavigator() {
  const { isDarkMode } = useAppTheme();

  return (
    <NavigationThemeProvider
      value={
        isDarkMode
          ? NSTP_DARK_NAV_THEME
          : DefaultTheme
      }
    >
      <Stack
        screenOptions={{
          /*
          |--------------------------------------------------------------------------
          | Hide Expo Router Default Header
          |--------------------------------------------------------------------------
          */

          headerShown:
            false,


          /*
          |--------------------------------------------------------------------------
          | Default Animation
          |--------------------------------------------------------------------------
          */

          animation:
            'fade',
        }}
      >

        {/*
        |--------------------------------------------------------------------------
        | Application Entry
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/index.js
        |
        | Route:
        |
        | /
        |
        */}

        <Stack.Screen
          name="index"
          options={{
            headerShown:
              false,

            animation:
              'fade',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | Loading Screen
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/LoadingScreen.js
        |
        | Route:
        |
        | /LoadingScreen
        |
        |
        | Main startup flow:
        |
        | index
        |   ↓
        | LoadingScreen
        |   ↓
        | AccessCodeScreen
        |
        */}

        <Stack.Screen
          name="LoadingScreen"
          options={{
            headerShown:
              false,

            animation:
              'fade',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | University Access Code
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/AccessCodeScreen.js
        |
        | Route:
        |
        | /AccessCodeScreen
        |
        |
        | Flow:
        |
        | LoadingScreen
        |      ↓
        | AccessCodeScreen
        |      ↓
        | LoginScreen
        |
        */}

        <Stack.Screen
          name="AccessCodeScreen"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | Login
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/LoginScreen.js
        |
        | Route:
        |
        | /LoginScreen
        |
        */}

        <Stack.Screen
          name="LoginScreen"
          options={{
            headerShown:
              false,

            animation:
              'fade',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | Create Password
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/CreatePasswordScreen.js
        |
        | Route:
        |
        | /CreatePasswordScreen
        |
        |
        | Used primarily for first-time Google student setup.
        |
        */}

        <Stack.Screen
          name="CreatePasswordScreen"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | PRE-REGISTRATION
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Registration/PreRegistrationScreen.js
        |
        | Route:
        |
        | /Registration/PreRegistrationScreen
        |
        */}

        <Stack.Screen
          name="Registration/PreRegistrationScreen"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | GENERAL REGISTRATION
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Registration/GeneralRegistrationScreen.js
        |
        | Route:
        |
        | /Registration/GeneralRegistrationScreen
        |
        |
        | Contains:
        |
        | - Registration details
        | - Student personal information
        | - Academic information
        | - Address
        | - Contact
        | - Emergency contact
        |
        */}

        <Stack.Screen
          name="Registration/GeneralRegistrationScreen"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | GENERAL REGISTRATION SIGNATURE
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Registration/GeneralRegistrationSignature.js
        |
        | Route:
        |
        | /Registration/GeneralRegistrationSignature
        |
        |
        | Student:
        |
        | - Draws signature
        | - Certifies registration information
        | - Submits registration
        |
        */}

        <Stack.Screen
          name="Registration/GeneralRegistrationSignature"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | REGISTRATION WAIT / EDIT
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Registration/RegistrationWaitEdit.js
        |
        | Route:
        |
        | /Registration/RegistrationWaitEdit
        |
        |
        | Student registration status:
        |
        | Submitted
        |     ↓
        | Under Review
        |     ↓
        | Confirmed
        |
        | Before confirmation the student may change:
        |
        | CWTS
        | LTS
        | ROTC
        |
        */}

        <Stack.Screen
          name="Registration/RegistrationWaitEdit"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | GENERAL REGISTRATION CONFIRMATION
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Registration/RegistrationConfirmation.js
        |
        | Route:
        |
        | /Registration/RegistrationConfirmation
        |
        |
        | CWTS / LTS:
        |
        | Confirmed
        |     ↓
        | Homepage
        |
        |
        | ROTC:
        |
        | General Registration Confirmed
        |     ↓
        | ROTC Enrollment
        |
        */}

        <Stack.Screen
          name="Registration/RegistrationConfirmation"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | ROTC ENROLLMENT
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Registration/ROTC/RotcEnrollment.js
        |
        | Route:
        |
        | /Registration/ROTC/RotcEnrollment
        |
        |
        | Only ROTC students should enter this flow.
        |
        | Current design begins with:
        |
        | ROTC Enrollment
        |      ↓
        | Step 1 / 4
        |
        */}

        <Stack.Screen
          name="Registration/ROTC/RotcEnrollment"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | ROTC ENROLLMENT CONFIRMATION
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Registration/ROTC/RotcConfirmEnrollment.js
        |
        | Route:
        |
        | /Registration/ROTC/RotcConfirmEnrollment
        |
        |
        | Final ROTC flow:
        |
        | ROTC Enrollment Complete
        |          ↓
        | RotcConfirmEnrollment
        |          ↓
        | You're officially enrolled
        |          ↓
        | Homepage
        |
        */}

        <Stack.Screen
          name="Registration/ROTC/RotcConfirmEnrollment"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | Change Password
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/ChangePasswordScreen.js
        |
        | Route:
        |
        | /ChangePasswordScreen
        |
        */}

        <Stack.Screen
          name="ChangePasswordScreen"
          options={{
            headerShown:
              false,

            animation:
              'slide_from_right',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | Logout
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/Logout.js
        |
        | Route:
        |
        | /Logout
        |
        */}

        <Stack.Screen
          name="Logout"
          options={{
            headerShown:
              false,

            animation:
              'fade',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | Main Authenticated Student Application
        |--------------------------------------------------------------------------
        |
        | Folder:
        |
        | app/(tabs)/
        |
        | Routes include:
        |
        | /(tabs)/HomepageScreen
        | /(tabs)/DigitalStudentIdScreen
        | /(tabs)/AnnouncementsScreen
        | /(tabs)/RotcSchedScreen
        | /(tabs)/AttendanceRecordScreen
        | /(tabs)/ReportScreen
        | /(tabs)/AccountSettingsScreen
        |
        */}

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown:
              false,

            animation:
              'fade',
          }}
        />


        {/*
        |--------------------------------------------------------------------------
        | Modal
        |--------------------------------------------------------------------------
        |
        | File:
        |
        | app/modal.tsx
        |
        | Route:
        |
        | /modal
        |
        */}

        <Stack.Screen
          name="modal"
          options={{
            headerShown:
              false,

            presentation:
              'modal',
          }}
        />

      </Stack>


      {/*
      |--------------------------------------------------------------------------
      | Application Status Bar
      |--------------------------------------------------------------------------
      */}

      <StatusBar
        style={
          isDarkMode
            ? 'light'
            : 'dark'
        }
      />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
