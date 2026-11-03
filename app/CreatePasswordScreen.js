import {
  router,
  Stack,
  useLocalSearchParams,
} from 'expo-router';

import {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  completeGooglePasswordSetup,
} from '../services/api';


/*
|--------------------------------------------------------------------------
| NSTP HUB Routes
|--------------------------------------------------------------------------
|
| PreRegistrationScreen.js is now located at:
|
| app/Registration/PreRegistrationScreen.js
|
*/

const ROUTES = {
  PRE_REGISTRATION:
    '/Registration/PreRegistrationScreen',
};


/*
|--------------------------------------------------------------------------
| NSTP HUB Create Password Screen
|--------------------------------------------------------------------------
|
| Flow:
|
| Google Sign-In
|      ↓
| Laravel verifies Google
|      ↓
| New Student
|      ↓
| CreatePasswordScreen
|      ↓
| POST /api/mobile/google-set-password
|      ↓
| Laravel creates student
|      ↓
| Sanctum token saved
|      ↓
| Registration/PreRegistrationScreen
|
*/


/*
|--------------------------------------------------------------------------
| NSTP HUB Colors
|--------------------------------------------------------------------------
*/

const COLORS = {
  cream: '#EFEBE2',
  maroon: '#54100F',
  green: '#58761C',
  yellow: '#FFBD36',
  orange: '#D99202',
  darkTeal: '#233E47',
  nearBlack: '#000D12',
  white: '#FFFFFF',
  gray: '#BEBEBE',
  dark: '#0D171B',

  placeholderGray: '#8B9193',
};


/*
|--------------------------------------------------------------------------
| Reference Design Size
|--------------------------------------------------------------------------
*/

const DESIGN_WIDTH =
  390;

const DESIGN_HEIGHT =
  844;


/*
|--------------------------------------------------------------------------
| Serif Font
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
| Real NSTP HUB Logo
|--------------------------------------------------------------------------
*/

const NSTP_LOGO =
  require(
    '../assets/images/nstphub_logo.png'
  );


/*
|--------------------------------------------------------------------------
| Create Password Screen
|--------------------------------------------------------------------------
*/

export default function CreatePasswordScreen() {
  const {
    width,
    height,
  } = useWindowDimensions();


  /*
  |--------------------------------------------------------------------------
  | Google Email
  |--------------------------------------------------------------------------
  */

  const params =
    useLocalSearchParams();


  const email =
    Array.isArray(
      params.email
    )
      ? params.email[0]
      : params.email || '';


  /*
  |--------------------------------------------------------------------------
  | Password State
  |--------------------------------------------------------------------------
  */

  const [
    password,
    setPassword,
  ] = useState('');


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Password Visibility
  |--------------------------------------------------------------------------
  */

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Responsive Measurements
  |--------------------------------------------------------------------------
  */

  const canvasWidth =
    Math.min(
      width,
      430
    );


  const sx =
    canvasWidth /
    DESIGN_WIDTH;


  const sy =
    height /
    DESIGN_HEIGHT;


  const scale =
    Math.min(
      sx,
      sy
    );


  const styles =
    useMemo(
      () =>
        createStyles(
          canvasWidth,
          sx,
          sy,
          scale
        ),
      [
        canvasWidth,
        sx,
        sy,
        scale,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Create Password
  |--------------------------------------------------------------------------
  */

  const handleContinue =
    async () => {
      if (
        isSubmitting
      ) {
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Password Required
      |--------------------------------------------------------------------------
      */

      if (!password) {
        Alert.alert(
          'Password required',
          'Please create your NSTP HUB password.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Minimum Length
      |--------------------------------------------------------------------------
      */

      if (
        password.length <
        8
      ) {
        Alert.alert(
          'Password too short',
          'Your password must contain at least 8 characters.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Confirm Password Required
      |--------------------------------------------------------------------------
      */

      if (
        !confirmPassword
      ) {
        Alert.alert(
          'Confirm password',
          'Please re-enter your password.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Passwords Must Match
      |--------------------------------------------------------------------------
      */

      if (
        password !==
        confirmPassword
      ) {
        Alert.alert(
          'Passwords do not match',
          'Please make sure both passwords are exactly the same.'
        );

        return;
      }


      try {
        setIsSubmitting(
          true
        );


        /*
        |--------------------------------------------------------------------------
        | Laravel Password Setup
        |--------------------------------------------------------------------------
        |
        | POST:
        |
        | /api/mobile/google-set-password
        |
        */

        await completeGooglePasswordSetup(
          password,
          confirmPassword
        );


        /*
        |--------------------------------------------------------------------------
        | Continue To Pre-Registration
        |--------------------------------------------------------------------------
        |
        | New file:
        |
        | app/Registration/PreRegistrationScreen.js
        |
        | New Expo Router path:
        |
        | /Registration/PreRegistrationScreen
        |
        */

        router.replace(
          ROUTES.PRE_REGISTRATION
        );

      } catch (
        error
      ) {
        Alert.alert(
          'Unable to create password',

          error instanceof Error
            ? error.message
            : 'Something went wrong while creating your account.'
        );

      } finally {
        setIsSubmitting(
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
    <View
      style={
        styles.page
      }
    >
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />


      <StatusBar
        hidden
      />


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
            | White Logo Outline - Left
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
                        -2.5 *
                        scale,
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
            | White Logo Outline - Right
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
                        2.5 *
                        scale,
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
            | White Logo Outline - Top
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
                        -2.5 *
                        scale,
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
            | White Logo Outline - Bottom
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
                        2.5 *
                        scale,
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
            | Original NSTP HUB Logo
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
        | Cream Main Card
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.card
          }
        >

          {/*
          |--------------------------------------------------------------------------
          | Title
          |--------------------------------------------------------------------------
          */}

          <Text
            style={
              styles.title
            }
          >
            CREATE YOUR
            {'\n'}
            PASSWORD
          </Text>


          {/*
          |--------------------------------------------------------------------------
          | Signed Google Account
          |--------------------------------------------------------------------------
          */}

          <Text
            style={
              styles.signedAs
            }
            numberOfLines={
              2
            }
          >
            Signed as{' '}

            <Text
              style={
                styles.signedAsEmail
              }
            >
              {email}
            </Text>
          </Text>


          {/*
          |--------------------------------------------------------------------------
          | Password Label
          |--------------------------------------------------------------------------
          */}

          <Text
            style={[
              styles.fieldLabel,
              styles.passwordLabel,
            ]}
          >
            PASSWORD
          </Text>


          {/*
          |--------------------------------------------------------------------------
          | Password Input
          |--------------------------------------------------------------------------
          */}

          <View
            style={[
              styles.inputContainer,
              styles.passwordInputContainer,
            ]}
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
              placeholder="enter your password"
              placeholderTextColor={
                COLORS.placeholderGray
              }
              secureTextEntry={
                !showPassword
              }
              autoCapitalize="none"
              autoCorrect={
                false
              }
              editable={
                !isSubmitting
              }
              selectionColor={
                COLORS.green
              }
            />


            <TouchableOpacity
              onPress={() =>
                setShowPassword(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              disabled={
                isSubmitting
              }
              activeOpacity={
                0.7
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-outline'
                    : 'eye-off-outline'
                }
                size={
                  19 *
                  scale
                }
                color={
                  COLORS.darkTeal
                }
              />
            </TouchableOpacity>

          </View>


          {/*
          |--------------------------------------------------------------------------
          | Confirm Password Label
          |--------------------------------------------------------------------------
          */}

          <Text
            style={[
              styles.fieldLabel,
              styles.confirmPasswordLabel,
            ]}
          >
            CONFIRM PASSWORD
          </Text>


          {/*
          |--------------------------------------------------------------------------
          | Confirm Password Input
          |--------------------------------------------------------------------------
          */}

          <View
            style={[
              styles.inputContainer,
              styles.confirmPasswordInputContainer,
            ]}
          >
            <TextInput
              style={
                styles.input
              }
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              placeholder="re-enter your password"
              placeholderTextColor={
                COLORS.placeholderGray
              }
              secureTextEntry={
                !showConfirmPassword
              }
              autoCapitalize="none"
              autoCorrect={
                false
              }
              editable={
                !isSubmitting
              }
              selectionColor={
                COLORS.green
              }
            />


            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              disabled={
                isSubmitting
              }
              activeOpacity={
                0.7
              }
            >
              <Ionicons
                name={
                  showConfirmPassword
                    ? 'eye-outline'
                    : 'eye-off-outline'
                }
                size={
                  19 *
                  scale
                }
                color={
                  COLORS.darkTeal
                }
              />
            </TouchableOpacity>

          </View>


          {/*
          |--------------------------------------------------------------------------
          | Continue Button
          |--------------------------------------------------------------------------
          */}

          <TouchableOpacity
            style={[
              styles.continueButton,

              isSubmitting &&
                styles.disabledButton,
            ]}
            onPress={
              handleContinue
            }
            disabled={
              isSubmitting
            }
            activeOpacity={
              0.85
            }
          >

            {isSubmitting ? (
              <ActivityIndicator
                color={
                  COLORS.cream
                }
              />
            ) : (
              <Text
                style={
                  styles.continueButtonText
                }
              >
                CONTINUE
              </Text>
            )}

          </TouchableOpacity>

        </View>

      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Responsive Styles
|--------------------------------------------------------------------------
*/

function createStyles(
  canvasWidth,
  sx,
  sy,
  scale
) {
  return StyleSheet.create({

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    page: {
      flex:
        1,

      backgroundColor:
        COLORS.green,

      alignItems:
        'center',

      justifyContent:
        'flex-start',
    },


    /*
    |--------------------------------------------------------------------------
    | Screen
    |--------------------------------------------------------------------------
    */

    screen: {
      flex:
        1,

      width:
        canvasWidth,

      backgroundColor:
        COLORS.green,

      position:
        'relative',

      overflow:
        'hidden',
    },


    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */

    header: {
      position:
        'absolute',

      top:
        0,

      left:
        0,

      right:
        0,

      height:
        176 *
        sy,

      backgroundColor:
        COLORS.green,

      alignItems:
        'center',

      justifyContent:
        'flex-start',
    },


    /*
    |--------------------------------------------------------------------------
    | Logo Wrapper
    |--------------------------------------------------------------------------
    */

    logoWrapper: {
      position:
        'absolute',

      top:
        8 *
        sy,

      width:
        145 *
        sx,

      height:
        160 *
        sy,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | White Logo Outline
    |--------------------------------------------------------------------------
    */

    logoOutline: {
      position:
        'absolute',

      width:
        118 *
        sx,

      height:
        142 *
        sy,
    },


    /*
    |--------------------------------------------------------------------------
    | Real Logo
    |--------------------------------------------------------------------------
    */

    logo: {
      position:
        'absolute',

      width:
        118 *
        sx,

      height:
        142 *
        sy,
    },


    /*
    |--------------------------------------------------------------------------
    | Cream Card
    |--------------------------------------------------------------------------
    */

    card: {
      position:
        'absolute',

      top:
        176 *
        sy,

      bottom:
        0,

      left:
        0,

      right:
        0,

      backgroundColor:
        COLORS.cream,

      borderTopLeftRadius:
        40 *
        scale,

      borderTopRightRadius:
        40 *
        scale,
    },


    /*
    |--------------------------------------------------------------------------
    | Create Password Title
    |--------------------------------------------------------------------------
    */

    title: {
      position:
        'absolute',

      top:
        39 *
        sy,

      left:
        20 *
        sx,

      right:
        20 *
        sx,

      color:
        COLORS.orange,

      textAlign:
        'center',

      fontSize:
        24 *
        scale,

      lineHeight:
        31 *
        scale,

      fontWeight:
        '700',

      letterSpacing:
        1.1 *
        scale,

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Signed As
    |--------------------------------------------------------------------------
    */

    signedAs: {
      position:
        'absolute',

      top:
        126 *
        sy,

      left:
        24 *
        sx,

      right:
        24 *
        sx,

      textAlign:
        'center',

      color:
        COLORS.maroon,

      fontSize:
        12.5 *
        scale,

      lineHeight:
        18 *
        scale,

      includeFontPadding:
        false,
    },


    signedAsEmail: {
      fontWeight:
        '700',

      color:
        COLORS.maroon,
    },


    /*
    |--------------------------------------------------------------------------
    | Labels
    |--------------------------------------------------------------------------
    */

    fieldLabel: {
      position:
        'absolute',

      left:
        40 *
        sx,

      color:
        COLORS.maroon,

      fontSize:
        13.5 *
        scale,

      lineHeight:
        17 *
        scale,

      fontWeight:
        '700',

      fontFamily:
        SERIF_FONT,

      includeFontPadding:
        false,
    },


    passwordLabel: {
      top:
        210 *
        sy,
    },


    confirmPasswordLabel: {
      top:
        315 *
        sy,
    },


    /*
    |--------------------------------------------------------------------------
    | Input Containers
    |--------------------------------------------------------------------------
    */

    inputContainer: {
      position:
        'absolute',

      left:
        20 *
        sx,

      right:
        20 *
        sx,

      height:
        53 *
        sy,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingLeft:
        25 *
        sx,

      paddingRight:
        18 *
        sx,

      backgroundColor:
        COLORS.cream,

      borderWidth:
        2,

      borderColor:
        COLORS.darkTeal,

      borderRadius:
        28 *
        scale,
    },


    passwordInputContainer: {
      top:
        239 *
        sy,
    },


    confirmPasswordInputContainer: {
      top:
        344 *
        sy,
    },


    /*
    |--------------------------------------------------------------------------
    | Input Text
    |--------------------------------------------------------------------------
    */

    input: {
      flex:
        1,

      height:
        '100%',

      paddingVertical:
        0,

      paddingRight:
        10 *
        sx,

      color:
        COLORS.dark,

      fontSize:
        11.5 *
        scale,

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Continue Button
    |--------------------------------------------------------------------------
    */

    continueButton: {
      position:
        'absolute',

      top:
        432 *
        sy,

      left:
        20 *
        sx,

      right:
        20 *
        sx,

      height:
        53 *
        sy,

      backgroundColor:
        COLORS.green,

      borderRadius:
        28 *
        scale,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    disabledButton: {
      opacity:
        0.6,
    },


    continueButtonText: {
      color:
        COLORS.white,

      fontSize:
        14 *
        scale,

      lineHeight:
        18 *
        scale,

      fontWeight:
        '700',

      letterSpacing:
        1 *
        scale,

      includeFontPadding:
        false,
    },
  });
}