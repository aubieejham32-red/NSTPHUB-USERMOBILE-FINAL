import {
  router,
  Stack,
} from 'expo-router';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';


/*
|--------------------------------------------------------------------------
| NSTP HUB LOADING SCREEN
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The original animation flow is preserved.
|
| 1. NSTP logo appears
| 2. Logo floats and glows
| 3. Loading bars animate
| 4. Loading bars disappear
| 5. Logo moves to the left
| 6. NSTP text appears
| 7. "hub" appears
| 8. University name appears
| 9. Screen fades
| 10. Routes to AccessCodeScreen
|
*/


/*
|--------------------------------------------------------------------------
| NSTP HUB COLOR PALETTE
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
};


/*
|--------------------------------------------------------------------------
| LOADING SCREEN
|--------------------------------------------------------------------------
*/

export default function LoadingScreen() {
  const {
    width,
  } = useWindowDimensions();


  /*
  |--------------------------------------------------------------------------
  | Fonts
  |--------------------------------------------------------------------------
  */

  const [
    fontsLoaded,
  ] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });


  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  const [
    activeBar,
    setActiveBar,
  ] = useState(0);


  const totalBars =
    10;


  /*
  |--------------------------------------------------------------------------
  | Responsive Size
  |--------------------------------------------------------------------------
  |
  | Same responsive behavior as your original file.
  |
  */

  const screenScale =
    Math.min(
      width / 390,
      1.15
    );


  /*
  |--------------------------------------------------------------------------
  | Logo Animations
  |--------------------------------------------------------------------------
  */

  const logoScale =
    useRef(
      new Animated.Value(
        0.9
      )
    ).current;


  const logoFloatY =
    useRef(
      new Animated.Value(
        0
      )
    ).current;


  const logoMoveX =
    useRef(
      new Animated.Value(
        0
      )
    ).current;


  const logoMoveY =
    useRef(
      new Animated.Value(
        0
      )
    ).current;


  /*
  |--------------------------------------------------------------------------
  | Glow Animations
  |--------------------------------------------------------------------------
  */

  const glowOpacity =
    useRef(
      new Animated.Value(
        0.25
      )
    ).current;


  const glowScale =
    useRef(
      new Animated.Value(
        0.9
      )
    ).current;


  /*
  |--------------------------------------------------------------------------
  | Loading Bars Animations
  |--------------------------------------------------------------------------
  */

  const loadingOpacity =
    useRef(
      new Animated.Value(
        1
      )
    ).current;


  const loadingTranslateY =
    useRef(
      new Animated.Value(
        0
      )
    ).current;


  /*
  |--------------------------------------------------------------------------
  | NSTP Text Animations
  |--------------------------------------------------------------------------
  */

  const titleOpacity =
    useRef(
      new Animated.Value(
        0
      )
    ).current;


  const titleTranslateX =
    useRef(
      new Animated.Value(
        30
      )
    ).current;


  /*
  |--------------------------------------------------------------------------
  | HUB Text Animations
  |--------------------------------------------------------------------------
  */

  const hubOpacity =
    useRef(
      new Animated.Value(
        0
      )
    ).current;


  const hubTranslateY =
    useRef(
      new Animated.Value(
        12
      )
    ).current;


  /*
  |--------------------------------------------------------------------------
  | University Name Animations
  |--------------------------------------------------------------------------
  */

  const subtitleOpacity =
    useRef(
      new Animated.Value(
        0
      )
    ).current;


  const subtitleTranslateY =
    useRef(
      new Animated.Value(
        10
      )
    ).current;


  /*
  |--------------------------------------------------------------------------
  | Screen Exit Animation
  |--------------------------------------------------------------------------
  */

  const screenOpacity =
    useRef(
      new Animated.Value(
        1
      )
    ).current;


  const screenScaleOut =
    useRef(
      new Animated.Value(
        1
      )
    ).current;


  /*
  |--------------------------------------------------------------------------
  | Main Animation
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      if (
        !fontsLoaded
      ) {
        return undefined;
      }


      let navigationTimer =
        null;


      /*
      |--------------------------------------------------------------------------
      | Loading Bar Animation
      |--------------------------------------------------------------------------
      |
      | SAME animation:
      |
      | Every 140 milliseconds another bar becomes active.
      |
      */

      const loadingInterval =
        setInterval(
          () => {
            setActiveBar(
              previous => {
                if (
                  previous >=
                  totalBars - 1
                ) {
                  return 0;
                }


                return (
                  previous + 1
                );
              }
            );
          },
          140
        );


      /*
      |--------------------------------------------------------------------------
      | Initial Logo Entrance
      |--------------------------------------------------------------------------
      |
      | SAME spring animation.
      |
      */

      Animated.spring(
        logoScale,
        {
          toValue: 1,

          friction: 6,

          tension: 45,

          useNativeDriver:
            true,
        }
      ).start();


      /*
      |--------------------------------------------------------------------------
      | Floating Logo Animation
      |--------------------------------------------------------------------------
      |
      | SAME:
      |
      | Up 6px
      | Scale 1.04
      | Back down
      |
      */

      const floatingAnimation =
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(
                logoFloatY,
                {
                  toValue:
                    -6,

                  duration:
                    1100,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),

              Animated.timing(
                logoScale,
                {
                  toValue:
                    1.04,

                  duration:
                    1100,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),
            ]),

            Animated.parallel([
              Animated.timing(
                logoFloatY,
                {
                  toValue:
                    0,

                  duration:
                    1100,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),

              Animated.timing(
                logoScale,
                {
                  toValue:
                    1,

                  duration:
                    1100,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),
            ]),
          ])
        );


      floatingAnimation
        .start();


      /*
      |--------------------------------------------------------------------------
      | Glow Animation
      |--------------------------------------------------------------------------
      |
      | SAME glow animation.
      |
      */

      const glowAnimation =
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(
                glowOpacity,
                {
                  toValue:
                    0.6,

                  duration:
                    1200,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),

              Animated.timing(
                glowScale,
                {
                  toValue:
                    1.15,

                  duration:
                    1200,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),
            ]),

            Animated.parallel([
              Animated.timing(
                glowOpacity,
                {
                  toValue:
                    0.25,

                  duration:
                    1200,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),

              Animated.timing(
                glowScale,
                {
                  toValue:
                    0.92,

                  duration:
                    1200,

                  easing:
                    Easing.inOut(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),
            ]),
          ])
        );


      glowAnimation
        .start();


      /*
      |--------------------------------------------------------------------------
      | Final Branding Transition
      |--------------------------------------------------------------------------
      |
      | SAME transition time:
      |
      | 2.8 seconds
      |
      */

      const transitionTimer =
        setTimeout(
          () => {

            /*
            |--------------------------------------------------------------------------
            | Stop Initial Animations
            |--------------------------------------------------------------------------
            */

            clearInterval(
              loadingInterval
            );


            floatingAnimation
              .stop();


            glowAnimation
              .stop();


            /*
            |--------------------------------------------------------------------------
            | Reset Logo Float
            |--------------------------------------------------------------------------
            */

            logoFloatY
              .setValue(
                0
              );


            /*
            |--------------------------------------------------------------------------
            | Hide Loading Bars
            |--------------------------------------------------------------------------
            |
            | SAME duration and movement.
            |
            */

            Animated.parallel([
              Animated.timing(
                loadingOpacity,
                {
                  toValue:
                    0,

                  duration:
                    350,

                  easing:
                    Easing.out(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),

              Animated.timing(
                loadingTranslateY,
                {
                  toValue:
                    18,

                  duration:
                    350,

                  easing:
                    Easing.out(
                      Easing.ease
                    ),

                  useNativeDriver:
                    true,
                }
              ),
            ]).start(
              () => {

                /*
                |--------------------------------------------------------------------------
                | Logo Moves Left + NSTP Appears
                |--------------------------------------------------------------------------
                |
                | Animation values are preserved exactly.
                |
                */

                Animated.parallel([

                  /*
                  |--------------------------------------------------------------------------
                  | Logo Left
                  |--------------------------------------------------------------------------
                  */

                  Animated.spring(
                    logoMoveX,
                    {
                      toValue:
                        -82,

                      friction:
                        7,

                      tension:
                        45,

                      useNativeDriver:
                        true,
                    }
                  ),


                  /*
                  |--------------------------------------------------------------------------
                  | Logo Vertical
                  |--------------------------------------------------------------------------
                  */

                  Animated.spring(
                    logoMoveY,
                    {
                      toValue:
                        -5,

                      friction:
                        7,

                      tension:
                        45,

                      useNativeDriver:
                        true,
                    }
                  ),


                  /*
                  |--------------------------------------------------------------------------
                  | Logo Final Size
                  |--------------------------------------------------------------------------
                  */

                  Animated.spring(
                    logoScale,
                    {
                      toValue:
                        0.78,

                      friction:
                        7,

                      tension:
                        45,

                      useNativeDriver:
                        true,
                    }
                  ),


                  /*
                  |--------------------------------------------------------------------------
                  | NSTP Fade
                  |--------------------------------------------------------------------------
                  */

                  Animated.timing(
                    titleOpacity,
                    {
                      toValue:
                        1,

                      duration:
                        650,

                      easing:
                        Easing.out(
                          Easing.cubic
                        ),

                      useNativeDriver:
                        true,
                    }
                  ),


                  /*
                  |--------------------------------------------------------------------------
                  | NSTP Slide
                  |--------------------------------------------------------------------------
                  */

                  Animated.timing(
                    titleTranslateX,
                    {
                      toValue:
                        0,

                      duration:
                        650,

                      easing:
                        Easing.out(
                          Easing.cubic
                        ),

                      useNativeDriver:
                        true,
                    }
                  ),
                ]).start(
                  () => {

                    /*
                    |--------------------------------------------------------------------------
                    | HUB Appears
                    |--------------------------------------------------------------------------
                    |
                    | SAME animation.
                    |
                    */

                    Animated.parallel([
                      Animated.timing(
                        hubOpacity,
                        {
                          toValue:
                            1,

                          duration:
                            400,

                          useNativeDriver:
                            true,
                        }
                      ),

                      Animated.spring(
                        hubTranslateY,
                        {
                          toValue:
                            0,

                          friction:
                            7,

                          tension:
                            45,

                          useNativeDriver:
                            true,
                        }
                      ),
                    ]).start(
                      () => {

                        /*
                        |--------------------------------------------------------------------------
                        | University Appears
                        |--------------------------------------------------------------------------
                        |
                        | SAME animation.
                        |
                        */

                        Animated.parallel([
                          Animated.timing(
                            subtitleOpacity,
                            {
                              toValue:
                                1,

                              duration:
                                500,

                              useNativeDriver:
                                true,
                            }
                          ),

                          Animated.timing(
                            subtitleTranslateY,
                            {
                              toValue:
                                0,

                              duration:
                                500,

                              easing:
                                Easing.out(
                                  Easing.ease
                                ),

                              useNativeDriver:
                                true,
                            }
                          ),
                        ]).start(
                          () => {

                            /*
                            |--------------------------------------------------------------------------
                            | Final Hold
                            |--------------------------------------------------------------------------
                            |
                            | SAME 1.3 second hold.
                            |
                            */

                            navigationTimer =
                              setTimeout(
                                () => {

                                  /*
                                  |--------------------------------------------------------------------------
                                  | Exit
                                  |--------------------------------------------------------------------------
                                  */

                                  Animated.parallel([
                                    Animated.timing(
                                      screenOpacity,
                                      {
                                        toValue:
                                          0,

                                        duration:
                                          450,

                                        easing:
                                          Easing.inOut(
                                            Easing.ease
                                          ),

                                        useNativeDriver:
                                          true,
                                      }
                                    ),

                                    Animated.timing(
                                      screenScaleOut,
                                      {
                                        toValue:
                                          1.04,

                                        duration:
                                          450,

                                        easing:
                                          Easing.inOut(
                                            Easing.ease
                                          ),

                                        useNativeDriver:
                                          true,
                                      }
                                    ),
                                  ]).start(
                                    () => {
                                      router.replace(
                                        '/AccessCodeScreen'
                                      );
                                    }
                                  );
                                },
                                1300
                              );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          },
          2800
        );


      /*
      |--------------------------------------------------------------------------
      | Cleanup
      |--------------------------------------------------------------------------
      */

      return () => {
        clearInterval(
          loadingInterval
        );


        clearTimeout(
          transitionTimer
        );


        if (
          navigationTimer
        ) {
          clearTimeout(
            navigationTimer
          );
        }


        floatingAnimation
          .stop();


        glowAnimation
          .stop();
      };
    },
    [
      fontsLoaded,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Wait For Poppins Fonts
  |--------------------------------------------------------------------------
  */

  if (
    !fontsLoaded
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          'top',
          'bottom',
        ]}
      >
        <Stack.Screen
          options={{
            headerShown:
              false,
          }}
        />


        <StatusBar
          barStyle="dark-content"
          backgroundColor={
            COLORS.cream
          }
        />


        <View
          style={
            styles.fontLoadingScreen
          }
        />
      </SafeAreaView>
    );
  }


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


      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.cream
        }
      />


      <Animated.View
        style={[
          styles.fullScreen,

          {
            opacity:
              screenOpacity,

            transform: [
              {
                scale:
                  screenScaleOut,
              },
            ],
          },
        ]}
      >

        {/*
        |--------------------------------------------------------------------------
        | Elevated Background
        |--------------------------------------------------------------------------
        |
        | Static decorative shapes only.
        |
        | These DO NOT alter your original animation.
        |
        */}

        <View
          pointerEvents="none"
          style={
            styles.backgroundDecoration
          }
        >
          <View
            style={
              styles.backgroundGlowTop
            }
          />


          <View
            style={
              styles.backgroundGlowBottom
            }
          />


          <View
            style={
              styles.backgroundAccent
            }
          />
        </View>


        {/*
        |--------------------------------------------------------------------------
        | Animation Area
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.animationArea
          }
        >

          {/*
          |--------------------------------------------------------------------------
          | Outer Glow
          |--------------------------------------------------------------------------
          */}

          <Animated.View
            style={[
              styles.outerGlow,

              {
                opacity:
                  glowOpacity,

                transform: [
                  {
                    scale:
                      glowScale,
                  },
                ],
              },
            ]}
          />


          {/*
          |--------------------------------------------------------------------------
          | Inner Glow
          |--------------------------------------------------------------------------
          */}

          <Animated.View
            style={[
              styles.innerGlow,

              {
                opacity:
                  glowOpacity,
              },
            ]}
          />


          {/*
          |--------------------------------------------------------------------------
          | NSTP Logo
          |--------------------------------------------------------------------------
          */}

          <Animated.View
            style={[
              styles.logoWrapper,

              {
                transform: [
                  {
                    translateX:
                      logoMoveX,
                  },

                  {
                    translateY:
                      Animated.add(
                        logoFloatY,
                        logoMoveY
                      ),
                  },

                  {
                    scale:
                      logoScale,
                  },
                ],
              },
            ]}
          >
            <View
              style={
                styles.logoShadow
              }
            >
              <Image
                source={require(
                  '../assets/images/nstphub_logo.png'
                )}
                style={[
                  styles.logo,

                  {
                    width:
                      140
                      *
                      screenScale,

                    height:
                      185
                      *
                      screenScale,
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          </Animated.View>


          {/*
          |--------------------------------------------------------------------------
          | Loading Bars
          |--------------------------------------------------------------------------
          |
          | SAME loading mechanism.
          |
          */}

          <Animated.View
            style={[
              styles.loadingContainer,

              {
                opacity:
                  loadingOpacity,

                transform: [
                  {
                    translateY:
                      loadingTranslateY,
                  },
                ],
              },
            ]}
          >
            {
              Array.from({
                length:
                  totalBars,
              }).map(
                (
                  _,
                  index
                ) => {
                  const completed =
                    index <=
                    activeBar;


                  return (
                    <View
                      key={
                        index
                      }
                      style={[
                        styles.loadingBar,

                        completed
                          ? styles.loadingBarActive
                          : styles.loadingBarInactive,
                      ]}
                    />
                  );
                }
              )
            }
          </Animated.View>


          {/*
          |--------------------------------------------------------------------------
          | NSTP HUB
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.brandTextContainer
            }
          >
            <Animated.Text
              numberOfLines={
                1
              }
              style={[
                styles.nstpText,

                {
                  fontSize:
                    40
                    *
                    screenScale,

                  lineHeight:
                    52
                    *
                    screenScale,

                  opacity:
                    titleOpacity,

                  transform: [
                    {
                      translateX:
                        titleTranslateX,
                    },
                  ],
                },
              ]}
            >
              NSTP
            </Animated.Text>


            <Animated.Text
              style={[
                styles.hubText,

                {
                  fontSize:
                    23
                    *
                    screenScale,

                  lineHeight:
                    31
                    *
                    screenScale,

                  opacity:
                    hubOpacity,

                  transform: [
                    {
                      translateY:
                        hubTranslateY,
                    },
                  ],
                },
              ]}
            >
              hub
            </Animated.Text>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | University
          |--------------------------------------------------------------------------
          */}

          <Animated.Text
            numberOfLines={
              1
            }
            adjustsFontSizeToFit
            minimumFontScale={
              0.72
            }
            style={[
              styles.universityText,

              {
                fontSize:
                  12.5
                  *
                  screenScale,

                lineHeight:
                  18
                  *
                  screenScale,

                opacity:
                  subtitleOpacity,

                transform: [
                  {
                    translateY:
                      subtitleTranslateY,
                  },
                ],
              },
            ]}
          >
            Surigao del Norte State University - Main Campus
          </Animated.Text>
        </View>
      </Animated.View>
    </SafeAreaView>
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
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    fontLoadingScreen: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | Full Screen
    |--------------------------------------------------------------------------
    */

    fullScreen: {
      flex: 1,

      width:
        '100%',

      position:
        'relative',

      backgroundColor:
        COLORS.cream,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',
    },


    /*
    |--------------------------------------------------------------------------
    | Static Background Decoration
    |--------------------------------------------------------------------------
    |
    | Provides depth while keeping the original animation unchanged.
    |
    */

    backgroundDecoration: {
      ...StyleSheet.absoluteFillObject,
    },


    backgroundGlowTop: {
      position:
        'absolute',

      width:
        290,

      height:
        290,

      borderRadius:
        145,

      top:
        -210,

      right:
        -160,

      backgroundColor:
        COLORS.green,

      opacity:
        0.025,
    },


    backgroundGlowBottom: {
      position:
        'absolute',

      width:
        300,

      height:
        300,

      borderRadius:
        150,

      bottom:
        -225,

      left:
        -175,

      backgroundColor:
        COLORS.maroon,

      opacity:
        0.022,
    },


    backgroundAccent: {
      position:
        'absolute',

      width:
        84,

      height:
        84,

      borderRadius:
        42,

      left:
        -52,

      top:
        '33%',

      backgroundColor:
        COLORS.yellow,

      opacity:
        0.025,
    },


    /*
    |--------------------------------------------------------------------------
    | Animation Area
    |--------------------------------------------------------------------------
    */

    animationArea: {
      width:
        '100%',

      height:
        380,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Glow
    |--------------------------------------------------------------------------
    */

    outerGlow: {
      position:
        'absolute',

      width:
        224,

      height:
        224,

      borderRadius:
        112,

      backgroundColor:
        'rgba(255, 189, 54, 0.10)',
    },


    innerGlow: {
      position:
        'absolute',

      width:
        174,

      height:
        174,

      borderRadius:
        87,

      backgroundColor:
        'rgba(255, 255, 255, 0.32)',
    },


    /*
    |--------------------------------------------------------------------------
    | Logo
    |--------------------------------------------------------------------------
    */

    logoWrapper: {
      position:
        'absolute',

      alignItems:
        'center',

      justifyContent:
        'center',

      zIndex:
        10,
    },


    logoShadow: {
      alignItems:
        'center',

      justifyContent:
        'center',

      ...Platform.select({
        ios: {
          shadowColor:
            COLORS.maroon,

          shadowOffset: {
            width:
              0,

            height:
              9,
          },

          shadowOpacity:
            0.24,

          shadowRadius:
            13,
        },

        android: {
          elevation:
            13,
        },

        default: {
          shadowColor:
            COLORS.maroon,

          shadowOffset: {
            width:
              0,

            height:
              9,
          },

          shadowOpacity:
            0.24,

          shadowRadius:
            13,
        },
      }),
    },


    logo: {
      width:
        140,

      height:
        185,
    },


    /*
    |--------------------------------------------------------------------------
    | Loading Bars
    |--------------------------------------------------------------------------
    |
    | Same bars and same animation.
    | Only their visual treatment is refined.
    |
    */

    loadingContainer: {
      position:
        'absolute',

      top:
        292,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    loadingBar: {
      width:
        11,

      height:
        7,

      marginHorizontal:
        3,

      borderRadius:
        3.5,
    },


    loadingBarActive: {
      backgroundColor:
        COLORS.maroon,

      ...Platform.select({
        ios: {
          shadowColor:
            COLORS.maroon,

          shadowOffset: {
            width: 0,
            height: 1,
          },

          shadowOpacity:
            0.18,

          shadowRadius:
            2,
        },

        android: {
          elevation: 1,
        },
      }),
    },


    loadingBarInactive: {
      backgroundColor:
        '#A98985',
    },


    /*
    |--------------------------------------------------------------------------
    | NSTP HUB
    |--------------------------------------------------------------------------
    */

    brandTextContainer: {
      position:
        'absolute',

      marginLeft:
        142,

      alignItems:
        'center',

      justifyContent:
        'center',

      zIndex:
        5,
    },


    /*
    |--------------------------------------------------------------------------
    | NSTP Font
    |--------------------------------------------------------------------------
    */

    nstpText: {
      color:
        COLORS.maroon,

      fontFamily:
        'Poppins_600SemiBold',

      letterSpacing:
        3.7,

      textAlign:
        'center',

      includeFontPadding:
        false,

      textShadowColor:
        'rgba(84, 16, 15, 0.18)',

      textShadowOffset: {
        width:
          2,

        height:
          3,
      },

      textShadowRadius:
        4,
    },


    /*
    |--------------------------------------------------------------------------
    | HUB Font
    |--------------------------------------------------------------------------
    */

    hubText: {
      marginTop:
        -7,

      color:
        COLORS.orange,

      fontFamily:
        'Poppins_500Medium',

      letterSpacing:
        1.7,

      textAlign:
        'center',

      includeFontPadding:
        false,

      textShadowColor:
        'rgba(217, 146, 2, 0.15)',

      textShadowOffset: {
        width:
          1,

        height:
          2,
      },

      textShadowRadius:
        3,
    },


    /*
    |--------------------------------------------------------------------------
    | University
    |--------------------------------------------------------------------------
    */

    universityText: {
      position:
        'absolute',

      top:
        262,

      width:
        '90%',

      paddingHorizontal:
        12,

      color:
        COLORS.darkTeal,

      fontFamily:
        'Poppins_400Regular',

      letterSpacing:
        -0.05,

      textAlign:
        'center',

      includeFontPadding:
        false,

      opacity:
        0.94,
    },
  });