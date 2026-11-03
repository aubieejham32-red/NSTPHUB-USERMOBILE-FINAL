import {
  router,
  Stack,
} from 'expo-router';

import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Ionicons from 'react-native-vector-icons/Ionicons';

import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
} from 'react-native-svg';

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {
  loginStudent,
  loginStudentWithGoogle,
} from '../services/api';


/*
|--------------------------------------------------------------------------
| NSTP HUB Routes
|--------------------------------------------------------------------------
*/

const ROUTES = {
  PRE_REGISTRATION:
    '/Registration/PreRegistrationScreen',

  GENERAL_REGISTRATION:
    '/Registration/GeneralRegistrationScreen',

  GENERAL_REGISTRATION_SIGNATURE:
    '/Registration/GeneralRegistrationSignature',

  REGISTRATION_WAIT_EDIT:
    '/Registration/RegistrationWaitEdit',

  REGISTRATION_CONFIRMATION:
    '/Registration/RegistrationConfirmation',

  ROTC_ENROLLMENT:
    '/Registration/ROTC/RotcEnrollment',

  ROTC_CONFIRM_ENROLLMENT:
    '/Registration/ROTC/RotcConfirmEnrollment',

  CREATE_PASSWORD:
    '/CreatePasswordScreen',

  FORGOT_PASSWORD:
    '/ForgotPasswordScreen',

  HOMEPAGE:
    '/(tabs)/HomepageScreen',
};


/*
|--------------------------------------------------------------------------
| Allowed Laravel Mobile Routes
|--------------------------------------------------------------------------
*/

const ALLOWED_AUTH_ROUTES = [
  ROUTES.PRE_REGISTRATION,
  ROUTES.GENERAL_REGISTRATION,
  ROUTES.GENERAL_REGISTRATION_SIGNATURE,
  ROUTES.REGISTRATION_WAIT_EDIT,
  ROUTES.REGISTRATION_CONFIRMATION,
  ROUTES.ROTC_ENROLLMENT,
  ROUTES.ROTC_CONFIRM_ENROLLMENT,
  ROUTES.HOMEPAGE,
];


/*
|--------------------------------------------------------------------------
| Legacy Laravel Route Names
|--------------------------------------------------------------------------
*/

const LEGACY_ROUTE_MAP = {
  pre_registration:
    ROUTES.PRE_REGISTRATION,

  general_registration:
    ROUTES.GENERAL_REGISTRATION,

  registration_wait_edit:
    ROUTES.REGISTRATION_WAIT_EDIT,

  registration_confirmation:
    ROUTES.REGISTRATION_CONFIRMATION,

  rotc_enrollment:
    ROUTES.ROTC_ENROLLMENT,

  rotc_confirm_enrollment:
    ROUTES.ROTC_CONFIRM_ENROLLMENT,

  homepage:
    ROUTES.HOMEPAGE,
};


/*
|--------------------------------------------------------------------------
| Registration Status Route Fallback
|--------------------------------------------------------------------------
*/

const STATUS_ROUTE_MAP = {
  not_started:
    ROUTES.PRE_REGISTRATION,

  draft:
    ROUTES.GENERAL_REGISTRATION,

  submitted:
    ROUTES.REGISTRATION_WAIT_EDIT,

  under_review:
    ROUTES.REGISTRATION_WAIT_EDIT,

  confirmed:
    ROUTES.REGISTRATION_CONFIRMATION,

  completed:
    ROUTES.HOMEPAGE,
};


/*
|--------------------------------------------------------------------------
| Colors
|--------------------------------------------------------------------------
*/

const COLORS = {
  cream:
    '#EFEBE2',

  maroon:
    '#54100F',

  green:
    '#58761C',

  yellow:
    '#FFBD36',

  orange:
    '#D99202',

  darkTeal:
    '#233E47',

  nearBlack:
    '#000D12',

  white:
    '#FFFFFF',

  gray:
    '#BEBEBE',

  dark:
    '#0D171B',

  googleBlue:
    '#4285F4',

  googleRed:
    '#EA4335',

  googleYellow:
    '#FBBC05',

  googleGreen:
    '#34A853',
};


/*
|--------------------------------------------------------------------------
| Font
|--------------------------------------------------------------------------
*/

const SERIF_FONT =
  Platform.select({
    ios:
      'Times New Roman',

    android:
      'serif',

    default:
      'serif',
  });


/*
|--------------------------------------------------------------------------
| Logo
|--------------------------------------------------------------------------
*/

const NSTP_LOGO =
  require(
    '../assets/images/nstphub_logo.png'
  );


/*
|--------------------------------------------------------------------------
| Google Web Client ID
|--------------------------------------------------------------------------
*/

const GOOGLE_WEB_CLIENT_ID =
  process.env
    .EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;


/*
|--------------------------------------------------------------------------
| Normalize Registration Status
|--------------------------------------------------------------------------
*/

function normalizeRegistrationStatus(
  value
) {
  return String(
    value ?? ''
  )
    .trim()
    .toLowerCase();
}


/*
|--------------------------------------------------------------------------
| Resolve Authenticated Route
|--------------------------------------------------------------------------
*/

function resolveAuthenticatedRoute(
  result
) {
  const backendNextScreen =
    String(
      result?.next_screen
      ??
      result?.student
        ?.next_screen
      ??
      ''
    ).trim();


  /*
  |--------------------------------------------------------------------------
  | Exact Expo Route
  |--------------------------------------------------------------------------
  */

  if (
    ALLOWED_AUTH_ROUTES.includes(
      backendNextScreen
    )
  ) {
    return backendNextScreen;
  }


  /*
  |--------------------------------------------------------------------------
  | Legacy Route
  |--------------------------------------------------------------------------
  */

  if (
    Object.prototype
      .hasOwnProperty.call(
        LEGACY_ROUTE_MAP,
        backendNextScreen
      )
  ) {
    return LEGACY_ROUTE_MAP[
      backendNextScreen
    ];
  }


  /*
  |--------------------------------------------------------------------------
  | Registration Status
  |--------------------------------------------------------------------------
  */

  const registrationStatus =
    normalizeRegistrationStatus(
      result?.registration_status
      ??
      result?.student
        ?.registration_status
    );


  if (
    Object.prototype
      .hasOwnProperty.call(
        STATUS_ROUTE_MAP,
        registrationStatus
      )
  ) {
    return STATUS_ROUTE_MAP[
      registrationStatus
    ];
  }


  /*
  |--------------------------------------------------------------------------
  | Incomplete Registration
  |--------------------------------------------------------------------------
  */

  if (
    result?.requires_nstp_registration ===
      true
  ) {
    return ROUTES
      .PRE_REGISTRATION;
  }


  /*
  |--------------------------------------------------------------------------
  | Completed Registration
  |--------------------------------------------------------------------------
  */

  if (
    result?.registration_complete ===
      true
  ) {
    return ROUTES.HOMEPAGE;
  }


  return ROUTES
    .PRE_REGISTRATION;
}


/*
|--------------------------------------------------------------------------
| Login Screen
|--------------------------------------------------------------------------
*/

export default function LoginScreen() {
  const insets =
    useSafeAreaInsets();


  /*
  |--------------------------------------------------------------------------
  | Email
  |--------------------------------------------------------------------------
  */

  const [
    email,
    setEmail,
  ] =
    useState('');


  /*
  |--------------------------------------------------------------------------
  | Password
  |--------------------------------------------------------------------------
  */

  const [
    password,
    setPassword,
  ] =
    useState('');


  /*
  |--------------------------------------------------------------------------
  | Password Visibility
  |--------------------------------------------------------------------------
  */

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const [
    isLoggingIn,
    setIsLoggingIn,
  ] =
    useState(false);


  const [
    isGoogleSigningIn,
    setIsGoogleSigningIn,
  ] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Configure Google
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      if (
        !GOOGLE_WEB_CLIENT_ID
      ) {
        console.warn(
          'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing from the mobile .env file.'
        );

        return;
      }


      GoogleSignin.configure({
        webClientId:
          GOOGLE_WEB_CLIENT_ID,

        offlineAccess:
          false,
      });
    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | Disabled State
  |--------------------------------------------------------------------------
  */

  const interactionDisabled =
    isLoggingIn
    ||
    isGoogleSigningIn;


  /*
  |--------------------------------------------------------------------------
  | Route Student
  |--------------------------------------------------------------------------
  */

  const routeAfterAuthentication =
    result => {
      const destination =
        resolveAuthenticatedRoute(
          result
        );


      console.log(
        'NSTP HUB Authentication Route:',
        {
          next_screen:
            result?.next_screen,

          registration_status:
            result
              ?.registration_status,

          registration_complete:
            result
              ?.registration_complete,

          requires_nstp_registration:
            result
              ?.requires_nstp_registration,

          component:
            result
              ?.student
              ?.component,

          resolved_destination:
            destination,
        }
      );


      router.replace(
        destination
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Email Password Login
  |--------------------------------------------------------------------------
  */

  const handleLogin =
    async () => {
      if (
        interactionDisabled
      ) {
        return;
      }


      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      /*
      |--------------------------------------------------------------------------
      | Email Validation
      |--------------------------------------------------------------------------
      */

      if (
        !cleanEmail
      ) {
        Alert.alert(
          'Email required',
          'Please enter your school email.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Password Validation
      |--------------------------------------------------------------------------
      */

      if (
        !password
      ) {
        Alert.alert(
          'Password required',
          'Please enter your password.'
        );

        return;
      }


      if (
        password.length <
          8
      ) {
        Alert.alert(
          'Invalid password',
          'Your password must contain at least 8 characters.'
        );

        return;
      }


      try {
        setIsLoggingIn(
          true
        );


        const result =
          await loginStudent(
            cleanEmail,
            password
          );


        routeAfterAuthentication(
          result
        );

      } catch (
        error
      ) {
        Alert.alert(
          'Login failed',

          error instanceof Error
            ? error.message
            : 'Unable to sign in.'
        );

      } finally {
        setIsLoggingIn(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Forgot Password
  |--------------------------------------------------------------------------
  */

  const handleForgotPassword =
    () => {
      if (
        interactionDisabled
      ) {
        return;
      }


      router.push(
        ROUTES.FORGOT_PASSWORD
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Google Login
  |--------------------------------------------------------------------------
  */

  const handleGoogleSignIn =
    async () => {
      if (
        interactionDisabled
      ) {
        return;
      }


      if (
        !GOOGLE_WEB_CLIENT_ID
      ) {
        Alert.alert(
          'Google configuration missing',
          'The Google Web Client ID is missing from the mobile .env file.'
        );

        return;
      }


      try {
        setIsGoogleSigningIn(
          true
        );


        /*
        |--------------------------------------------------------------------------
        | Google Play Services
        |--------------------------------------------------------------------------
        */

        await GoogleSignin
          .hasPlayServices({
            showPlayServicesUpdateDialog:
              true,
          });


        /*
        |--------------------------------------------------------------------------
        | Clear Previous Google Session
        |--------------------------------------------------------------------------
        */

        try {
          await GoogleSignin
            .signOut();

        } catch (
          signOutError
        ) {
          console.log(
            'No previous Google session to clear.'
          );
        }


        /*
        |--------------------------------------------------------------------------
        | Sign In
        |--------------------------------------------------------------------------
        */

        const googleResponse =
          await GoogleSignin
            .signIn();


        if (
          !isSuccessResponse(
            googleResponse
          )
        ) {
          return;
        }


        /*
        |--------------------------------------------------------------------------
        | Google Access Token
        |--------------------------------------------------------------------------
        */

        const googleTokens =
          await GoogleSignin
            .getTokens();


        const googleAccessToken =
          googleTokens
            ?.accessToken;


        if (
          !googleAccessToken
        ) {
          throw new Error(
            'Google did not return an access token.'
          );
        }


        /*
        |--------------------------------------------------------------------------
        | Laravel Google Login
        |--------------------------------------------------------------------------
        */

        const result =
          await loginStudentWithGoogle(
            googleAccessToken
          );


        /*
        |--------------------------------------------------------------------------
        | First-Time Google Account
        |--------------------------------------------------------------------------
        */

        if (
          result
            ?.requires_password_setup ===
          true
        ) {
          router.push({
            pathname:
              ROUTES.CREATE_PASSWORD,

            params: {
              email:
                result?.email
                ||
                '',
            },
          });


          return;
        }


        routeAfterAuthentication(
          result
        );

      } catch (
        error
      ) {
        if (
          isErrorWithCode(
            error
          )
        ) {
          if (
            error.code ===
            statusCodes.IN_PROGRESS
          ) {
            return;
          }


          if (
            error.code ===
            statusCodes
              .PLAY_SERVICES_NOT_AVAILABLE
          ) {
            setTimeout(
              () => {
                Alert.alert(
                  'Google Play Services',
                  'Google Play Services is unavailable or needs to be updated on your Android phone.'
                );
              },
              300
            );


            return;
          }
        }


        console.error(
          'Google Sign-In Error:',
          error
        );


        setTimeout(
          () => {
            Alert.alert(
              'Google Sign-In failed',

              error instanceof Error
                ? error.message
                : 'Unable to sign in with Google.'
            );
          },
          300
        );

      } finally {
        setIsGoogleSigningIn(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        'top',
        'left',
        'right',
      ]}
    >
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />


      <StatusBar
        barStyle="light-content"
        backgroundColor={
          COLORS.green
        }
      />


      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS ===
            'ios'
            ? 'padding'
            : undefined
        }
      >
        <View
          style={
            styles.screen
          }
        >

          {/*
          |--------------------------------------------------------------------------
          | Green Header
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.logoWrapper
              }
            >

              {/*
              |--------------------------------------------------------------------------
              | White Outline - Left
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateX:
                          -3,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | White Outline - Right
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateX:
                          3,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | White Outline - Top
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateY:
                          -3,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | White Outline - Bottom
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateY:
                          3,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | Original Logo
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_LOGO
                }
                style={
                  styles.logo
                }
                resizeMode="contain"
              />
            </View>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Main Login Panel
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.card
            }
          >
            <ScrollView
              style={
                styles.scrollView
              }
              contentContainerStyle={[
                styles.scrollContent,

                {
                  paddingBottom:
                    Math.max(
                      insets.bottom + 24,
                      32
                    ),
                },
              ]}
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              bounces={
                false
              }
            >

              {/*
              |--------------------------------------------------------------------------
              | Welcome
              |--------------------------------------------------------------------------
              */}

              <View
                style={
                  styles.welcomeSection
                }
              >
                <Text
                  style={
                    styles.title
                  }
                >
                  Welcome to the
                  {'\n'}
                  NSTP hub!
                </Text>


                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Your civic journey starts here.
                </Text>
              </View>


              {/*
              |--------------------------------------------------------------------------
              | Form
              |--------------------------------------------------------------------------
              */}

              <View
                style={
                  styles.form
                }
              >

                {/*
                |--------------------------------------------------------------------------
                | Email
                |--------------------------------------------------------------------------
                */}

                <View
                  style={
                    styles.fieldGroup
                  }
                >
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    EMAIL ADDRESS
                  </Text>


                  <View
                    style={
                      styles.inputContainer
                    }
                  >
                    <TextInput
                      style={
                        styles.input
                      }
                      value={
                        email
                      }
                      onChangeText={
                        setEmail
                      }
                      placeholder="Enter school email"
                      placeholderTextColor={
                        '#75868B'
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={
                        false
                      }
                      editable={
                        !interactionDisabled
                      }
                      selectionColor={
                        COLORS.green
                      }
                      cursorColor={
                        COLORS.green
                      }
                      returnKeyType="next"
                    />


                    <Ionicons
                      name="mail-outline"
                      size={21}
                      color={
                        COLORS.darkTeal
                      }
                    />
                  </View>
                </View>


                {/*
                |--------------------------------------------------------------------------
                | Password
                |--------------------------------------------------------------------------
                */}

                <View
                  style={
                    styles.fieldGroup
                  }
                >
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    PASSWORD
                  </Text>


                  <View
                    style={
                      styles.inputContainer
                    }
                  >
                    <TextInput
                      style={
                        styles.input
                      }
                      value={
                        password
                      }
                      onChangeText={
                        setPassword
                      }
                      placeholder="Enter your password"
                      placeholderTextColor={
                        '#75868B'
                      }
                      secureTextEntry={
                        !showPassword
                      }
                      autoCapitalize="none"
                      autoCorrect={
                        false
                      }
                      editable={
                        !interactionDisabled
                      }
                      selectionColor={
                        COLORS.green
                      }
                      cursorColor={
                        COLORS.green
                      }
                      returnKeyType="done"
                      onSubmitEditing={
                        handleLogin
                      }
                    />


                    <TouchableOpacity
                      style={
                        styles.eyeButton
                      }
                      onPress={() =>
                        setShowPassword(
                          previous =>
                            !previous
                        )
                      }
                      disabled={
                        interactionDisabled
                      }
                      activeOpacity={
                        0.65
                      }
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={22}
                        color={
                          COLORS.darkTeal
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>


                {/*
                |--------------------------------------------------------------------------
                | Login
                |--------------------------------------------------------------------------
                */}

                <TouchableOpacity
                  style={[
                    styles.loginButton,

                    interactionDisabled
                    &&
                    styles.disabledButton,
                  ]}
                  onPress={
                    handleLogin
                  }
                  disabled={
                    interactionDisabled
                  }
                  activeOpacity={
                    0.82
                  }
                >
                  {
                    isLoggingIn
                      ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            COLORS.white
                          }
                        />
                      )
                      : (
                        <Text
                          style={
                            styles.loginButtonText
                          }
                        >
                          LOG IN
                        </Text>
                      )
                  }
                </TouchableOpacity>


                {/*
                |--------------------------------------------------------------------------
                | Forgot Password
                |--------------------------------------------------------------------------
                */}

                <TouchableOpacity
                  style={
                    styles.forgotButton
                  }
                  onPress={
                    handleForgotPassword
                  }
                  disabled={
                    interactionDisabled
                  }
                  activeOpacity={
                    0.65
                  }
                >
                  <Text
                    style={
                      styles.forgotText
                    }
                  >
                    Forgot your password?
                  </Text>
                </TouchableOpacity>


                {/*
                |--------------------------------------------------------------------------
                | Divider
                |--------------------------------------------------------------------------
                */}

                <View
                  style={
                    styles.divider
                  }
                >
                  <View
                    style={
                      styles.dividerLine
                    }
                  />


                  <Text
                    style={
                      styles.dividerText
                    }
                  >
                    Or sign in with
                  </Text>


                  <View
                    style={
                      styles.dividerLine
                    }
                  />
                </View>


                {/*
                |--------------------------------------------------------------------------
                | Google
                |--------------------------------------------------------------------------
                */}

                <TouchableOpacity
                  style={[
                    styles.googleButton,

                    interactionDisabled
                    &&
                    styles.disabledButton,
                  ]}
                  onPress={
                    handleGoogleSignIn
                  }
                  disabled={
                    interactionDisabled
                  }
                  activeOpacity={
                    0.82
                  }
                >
                  {
                    isGoogleSigningIn
                      ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            COLORS.green
                          }
                        />
                      )
                      : (
                        <GoogleLogo
                          size={23}
                        />
                      )
                  }


                  <Text
                    style={
                      styles.googleButtonText
                    }
                  >
                    {
                      isGoogleSigningIn
                        ? 'Signing in...'
                        : 'Continue with Google'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Google Logo
|--------------------------------------------------------------------------
*/

function GoogleLogo({
  size,
}) {
  return (
    <View
      style={{
        width:
          size,

        height:
          size,

        marginRight:
          9,
      }}
    >
      <Svg
        width={
          size
        }
        height={
          size
        }
        viewBox="0 0 48 48"
      >
        <Defs>
          <ClipPath
            id="googleGClip"
          >
            <Path
              d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
            />
          </ClipPath>
        </Defs>


        <G
          clipPath="url(#googleGClip)"
        >
          <Path
            fill={
              COLORS.googleYellow
            }
            d="M0 37V11l17 13z"
          />


          <Path
            fill={
              COLORS.googleRed
            }
            d="M0 11l17 13 7-6.1L48 14V0H0z"
          />


          <Path
            fill={
              COLORS.googleGreen
            }
            d="M0 37l30-23 7.9 1L48 0v48H0z"
          />


          <Path
            fill={
              COLORS.googleBlue
            }
            d="M48 48L17 24l-4-3 35-10z"
          />
        </G>
      </Svg>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({

    /*
    |--------------------------------------------------------------------------
    | Safe Area
    |--------------------------------------------------------------------------
    */

    safeArea: {
      flex:
        1,

      backgroundColor:
        COLORS.green,
    },


    keyboardContainer: {
      flex:
        1,
    },


    screen: {
      flex:
        1,

      backgroundColor:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */

    header: {
      height:
        158,

      minHeight:
        158,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Logo
    |--------------------------------------------------------------------------
    */

    logoWrapper: {
      width:
        150,

      height:
        152,

      alignItems:
        'center',

      justifyContent:
        'center',

      position:
        'relative',
    },


    logoOutline: {
      position:
        'absolute',

      width:
        116,

      height:
        140,
    },


    logo: {
      position:
        'absolute',

      width:
        116,

      height:
        140,
    },


    /*
    |--------------------------------------------------------------------------
    | Card
    |--------------------------------------------------------------------------
    */

    card: {
      flex:
        1,

      marginTop:
        -2,

      backgroundColor:
        COLORS.cream,

      borderTopLeftRadius:
        34,

      borderTopRightRadius:
        34,

      overflow:
        'hidden',
    },


    scrollView: {
      flex:
        1,
    },


    scrollContent: {
      flexGrow:
        1,

      paddingHorizontal:
        24,

      paddingTop:
        26,
    },


    /*
    |--------------------------------------------------------------------------
    | Welcome
    |--------------------------------------------------------------------------
    */

    welcomeSection: {
      alignItems:
        'center',

      marginBottom:
        28,
    },


    title: {
      color:
        COLORS.orange,

      fontSize:
        25,

      lineHeight:
        33,

      fontWeight:
        '500',

      letterSpacing:
        2.1,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    subtitle: {
      marginTop:
        8,

      color:
        COLORS.maroon,

      fontSize:
        13.5,

      lineHeight:
        19,

      fontWeight:
        '500',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    form: {
      width:
        '100%',

      maxWidth:
        420,

      alignSelf:
        'center',
    },


    fieldGroup: {
      marginBottom:
        18,
    },


    fieldLabel: {
      marginLeft:
        17,

      marginBottom:
        7,

      color:
        COLORS.maroon,

      fontSize:
        13,

      lineHeight:
        17,

      fontWeight:
        '600',

      fontFamily:
        SERIF_FONT,

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Input
    |--------------------------------------------------------------------------
    */

    inputContainer: {
      width:
        '100%',

      minHeight:
        54,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingLeft:
        21,

      paddingRight:
        10,

      backgroundColor:
        COLORS.cream,

      borderWidth:
        1.8,

      borderColor:
        COLORS.darkTeal,

      borderRadius:
        27,
    },


    input: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        50,

      paddingVertical:
        0,

      paddingRight:
        10,

      color:
        COLORS.nearBlack,

      fontSize:
        14.5,

      fontWeight:
        '500',

      includeFontPadding:
        false,
    },


    eyeButton: {
      width:
        42,

      height:
        42,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        21,
    },


    /*
    |--------------------------------------------------------------------------
    | Login Button
    |--------------------------------------------------------------------------
    */

    loginButton: {
      width:
        190,

      minHeight:
        52,

      alignSelf:
        'center',

      marginTop:
        6,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        12,

      backgroundColor:
        COLORS.green,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.12,

      shadowRadius:
        5,

      elevation:
        3,
    },


    loginButtonText: {
      color:
        COLORS.white,

      fontSize:
        14,

      lineHeight:
        19,

      fontWeight:
        '700',

      fontFamily:
        SERIF_FONT,

      letterSpacing:
        0.5,

      includeFontPadding:
        false,
    },


    disabledButton: {
      opacity:
        0.55,
    },


    /*
    |--------------------------------------------------------------------------
    | Forgot Password
    |--------------------------------------------------------------------------
    */

    forgotButton: {
      alignSelf:
        'center',

      marginTop:
        14,

      paddingHorizontal:
        10,

      paddingVertical:
        6,
    },


    forgotText: {
      color:
        COLORS.green,

      fontSize:
        12,

      lineHeight:
        16,

      fontWeight:
        '600',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Divider
    |--------------------------------------------------------------------------
    */

    divider: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop:
        19,

      marginBottom:
        19,
    },


    dividerLine: {
      flex:
        1,

      height:
        1,

      backgroundColor:
        'rgba(35, 62, 71, 0.45)',
    },


    dividerText: {
      marginHorizontal:
        13,

      color:
        COLORS.darkTeal,

      fontSize:
        10,

      lineHeight:
        14,

      fontWeight:
        '500',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Google Button
    |--------------------------------------------------------------------------
    */

    googleButton: {
      width:
        230,

      minHeight:
        52,

      alignSelf:
        'center',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        14,

      borderWidth:
        1.8,

      borderColor:
        COLORS.green,

      borderRadius:
        12,

      backgroundColor:
        COLORS.cream,
    },


    googleButtonText: {
      color:
        COLORS.green,

      fontSize:
        13,

      lineHeight:
        18,

      fontWeight:
        '600',

      includeFontPadding:
        false,
    },
  });