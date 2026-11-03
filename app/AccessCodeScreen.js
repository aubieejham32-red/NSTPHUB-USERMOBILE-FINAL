import {
  router,
  Stack,
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

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  verifyUniversityAccessCode,
} from '../services/api';


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

  placeholderGray: '#7B8588',
};


/*
|--------------------------------------------------------------------------
| Reference Design
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
| NSTP HUB Logo
|--------------------------------------------------------------------------
*/

const NSTP_LOGO =
  require(
    '../assets/images/nstphub_logo.png'
  );


/*
|--------------------------------------------------------------------------
| Access Code Screen
|--------------------------------------------------------------------------
*/

export default function AccessCodeScreen() {
  const {
    width,
    height,
  } = useWindowDimensions();


  const insets =
    useSafeAreaInsets();


  /*
  |--------------------------------------------------------------------------
  | Access Code
  |--------------------------------------------------------------------------
  */

  const [
    accessCode,
    setAccessCode,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Access Code Visibility
  |--------------------------------------------------------------------------
  |
  | True by default so the student can see what they type.
  |
  */

  const [
    showAccessCode,
    setShowAccessCode,
  ] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | Loading State
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


  /*
  |--------------------------------------------------------------------------
  | Safe Usable Height
  |--------------------------------------------------------------------------
  |
  | The top and bottom device safe areas are excluded from the design height.
  |
  */

  const usableHeight =
    Math.max(
      height
      -
      insets.top
      -
      insets.bottom,
      600
    );


  const sx =
    canvasWidth /
    DESIGN_WIDTH;


  const sy =
    usableHeight /
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
  | Verify University Access Code
  |--------------------------------------------------------------------------
  |
  | Flow:
  |
  | LoadingScreen
  |      ↓
  | AccessCodeScreen
  |      ↓
  | POST /api/mobile/university/verify-access-code
  |      ↓
  | Laravel
  |      ↓
  | universities.access_code
  |      ↓
  | Valid active university
  |      ↓
  | Temporary university access token
  |      ↓
  | SecureStore
  |      ↓
  | LoginScreen
  |
  */

  const handleContinue =
    async () => {
      /*
      |--------------------------------------------------------------------------
      | Prevent Multiple Submissions
      |--------------------------------------------------------------------------
      */

      if (
        isSubmitting
      ) {
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Normalize Access Code
      |--------------------------------------------------------------------------
      */

      const cleanCode =
        accessCode
          .trim()
          .toUpperCase();


      /*
      |--------------------------------------------------------------------------
      | Required
      |--------------------------------------------------------------------------
      */

      if (
        !cleanCode
      ) {
        Alert.alert(
          'Access code required',
          'Please enter the university access code provided by your instructor or program coordinator.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Minimum Length
      |--------------------------------------------------------------------------
      */

      if (
        cleanCode.length <
        3
      ) {
        Alert.alert(
          'Invalid access code',
          'Please enter a valid university access code.'
        );

        return;
      }


      try {
        /*
        |--------------------------------------------------------------------------
        | Start Loading
        |--------------------------------------------------------------------------
        */

        setIsSubmitting(
          true
        );


        /*
        |--------------------------------------------------------------------------
        | Verify Against Laravel / MySQL
        |--------------------------------------------------------------------------
        */

        const result =
          await verifyUniversityAccessCode(
            cleanCode
          );


        /*
        |--------------------------------------------------------------------------
        | Access Code Successfully Verified
        |--------------------------------------------------------------------------
        */

        if (
          result?.success ===
          true
        ) {
          /*
          |--------------------------------------------------------------------------
          | Access Code → Login
          |--------------------------------------------------------------------------
          */

          router.replace(
            '/LoginScreen'
          );

          return;
        }


        /*
        |--------------------------------------------------------------------------
        | Unexpected Laravel Response
        |--------------------------------------------------------------------------
        */

        throw new Error(
          'Unable to verify the university access code.'
        );

      } catch (
        error
      ) {
        /*
        |--------------------------------------------------------------------------
        | Verification Failed
        |--------------------------------------------------------------------------
        */

        Alert.alert(
          'Access code not accepted',

          error instanceof Error
            ? error.message
            : 'Unable to verify your university access code.'
        );

      } finally {
        /*
        |--------------------------------------------------------------------------
        | Stop Loading
        |--------------------------------------------------------------------------
        */

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
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        'top',
        'bottom',
        'left',
        'right',
      ]}
    >
      {/*
      |--------------------------------------------------------------------------
      | Hide Expo Router Header
      |--------------------------------------------------------------------------
      */}

      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | Android Status Bar
      |--------------------------------------------------------------------------
      */}

      <StatusBar
        barStyle="light-content"
        backgroundColor={
          COLORS.green
        }
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

          {/*
          |--------------------------------------------------------------------------
          | NSTP HUB Logo
          |--------------------------------------------------------------------------
          */}

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
        | Cream Card
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.card
          }
        >

          {/*
          |--------------------------------------------------------------------------
          | Header Content
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.headerContent
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
              Enter your access
              {'\n'}
              code
            </Text>


            {/*
            |--------------------------------------------------------------------------
            | Description
            |--------------------------------------------------------------------------
            */}

            <Text
              style={
                styles.description
              }
            >
              To proceed with your registration, please
              {'\n'}
              obtain a valid university access code from
              {'\n'}
              your instructor or program coordinator.
            </Text>

          </View>


          {/*
          |--------------------------------------------------------------------------
          | University Access Code Label
          |--------------------------------------------------------------------------
          */}

          <Text
            style={
              styles.label
            }
          >
            University access code
          </Text>


          {/*
          |--------------------------------------------------------------------------
          | Access Code Input
          |--------------------------------------------------------------------------
          */}

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
                accessCode
              }
              onChangeText={
                (
                  value
                ) =>
                  setAccessCode(
                    value
                      .toUpperCase()
                  )
              }
              placeholder="enter your access code"
              placeholderTextColor={
                COLORS.placeholderGray
              }
              secureTextEntry={
                !showAccessCode
              }
              autoCapitalize="characters"
              autoCorrect={
                false
              }
              editable={
                !isSubmitting
              }
              selectionColor={
                COLORS.green
              }
              cursorColor={
                COLORS.green
              }
              maxLength={
                100
              }
              returnKeyType="done"
              onSubmitEditing={
                handleContinue
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | Show / Hide Access Code
            |--------------------------------------------------------------------------
            */}

            <TouchableOpacity
              style={
                styles.eyeButton
              }
              onPress={() =>
                setShowAccessCode(
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
                  showAccessCode
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={
                  22 *
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

              isSubmitting
              &&
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
            {
              isSubmitting
                ? (
                  <ActivityIndicator
                    color={
                      COLORS.white
                    }
                  />
                )
                : (
                  <Text
                    style={
                      styles.continueButtonText
                    }
                  >
                    CONTINUE
                  </Text>
                )
            }
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
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
    | Safe Area
    |--------------------------------------------------------------------------
    */

    safeArea: {
      flex:
        1,

      backgroundColor:
        COLORS.green,
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

      alignSelf:
        'center',

      position:
        'relative',

      overflow:
        'hidden',

      backgroundColor:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Green Header
    |--------------------------------------------------------------------------
    |
    | Reduced from 300 to 225 to remove the large empty gap.
    |
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
        225 *
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
    |
    | Moved upward slightly while keeping the original logo design.
    |
    */

    logoWrapper: {
      position:
        'absolute',

      top:
        15 *
        sy,

      width:
        140 *
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
    | Logo Outline
    |--------------------------------------------------------------------------
    */

    logoOutline: {
      position:
        'absolute',

      width:
        105 *
        sx,

      height:
        130 *
        sy,
    },


    /*
    |--------------------------------------------------------------------------
    | Main Logo
    |--------------------------------------------------------------------------
    */

    logo: {
      position:
        'absolute',

      width:
        105 *
        sx,

      height:
        130 *
        sy,
    },


    /*
    |--------------------------------------------------------------------------
    | Cream Card
    |--------------------------------------------------------------------------
    |
    | Reduced from top 258 to 185.
    |
    */

    card: {
      position:
        'absolute',

      top:
        185 *
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
        38 *
        scale,

      borderTopRightRadius:
        38 *
        scale,
    },


    /*
    |--------------------------------------------------------------------------
    | Centered Header Content
    |--------------------------------------------------------------------------
    */

    headerContent: {
      position:
        'absolute',

      top:
        25 *
        sy,

      left:
        24 *
        sx,

      right:
        24 *
        sx,

      alignItems:
        'center',

      justifyContent:
        'flex-start',
    },


    /*
    |--------------------------------------------------------------------------
    | Title
    |--------------------------------------------------------------------------
    */

    title: {
      width:
        '100%',

      color:
        COLORS.orange,

      textAlign:
        'center',

      fontSize:
        22 *
        scale,

      lineHeight:
        27 *
        scale,

      letterSpacing:
        3.4 *
        scale,

      fontWeight:
        '500',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Description
    |--------------------------------------------------------------------------
    |
    | Reduced from marginTop 45 to 18.
    |
    */

    description: {
      width:
        '100%',

      marginTop:
        18 *
        sy,

      color:
        COLORS.maroon,

      textAlign:
        'center',

      fontSize:
        14 *
        scale,

      lineHeight:
        22 *
        scale,

      fontWeight:
        '400',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Input Label
    |--------------------------------------------------------------------------
    |
    | Reduced from top 248 to 190.
    |
    */

    label: {
      position:
        'absolute',

      top:
        190 *
        sy,

      left:
        39 *
        sx,

      right:
        30 *
        sx,

      color:
        COLORS.maroon,

      fontSize:
        14 *
        scale,

      lineHeight:
        18 *
        scale,

      fontFamily:
        SERIF_FONT,

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Input Container
    |--------------------------------------------------------------------------
    |
    | Reduced from top 280 to 218.
    |
    */

    inputContainer: {
      position:
        'absolute',

      top:
        218 *
        sy,

      left:
        20 *
        sx,

      right:
        20 *
        sx,

      height:
        52 *
        sy,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingLeft:
        24 *
        sx,

      paddingRight:
        10 *
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


    /*
    |--------------------------------------------------------------------------
    | Text Input
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
        13 *
        scale,

      fontWeight:
        '500',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Eye Button
    |--------------------------------------------------------------------------
    */

    eyeButton: {
      width:
        40 *
        scale,

      height:
        40 *
        scale,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        20 *
        scale,
    },


    /*
    |--------------------------------------------------------------------------
    | Continue Button
    |--------------------------------------------------------------------------
    |
    | Reduced from top 382 to 300.
    |
    */

    continueButton: {
      position:
        'absolute',

      top:
        300 *
        sy,

      width:
        178 *
        sx,

      height:
        51 *
        sy,

      alignSelf:
        'center',

      backgroundColor:
        COLORS.green,

      borderRadius:
        9 *
        scale,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Disabled Button
    |--------------------------------------------------------------------------
    */

    disabledButton: {
      opacity:
        0.6,
    },


    /*
    |--------------------------------------------------------------------------
    | Continue Button Text
    |--------------------------------------------------------------------------
    */

    continueButtonText: {
      color:
        COLORS.white,

      fontSize:
        15 *
        scale,

      lineHeight:
        19 *
        scale,

      fontWeight:
        '500',

      fontFamily:
        SERIF_FONT,

      includeFontPadding:
        false,
    },
  });
}