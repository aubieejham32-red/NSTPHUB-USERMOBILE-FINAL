import {
  router,
  Stack,
} from 'expo-router';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  StatusBar,
} from 'expo-status-bar';

import Ionicons from 'react-native-vector-icons/Ionicons';

import Svg, {
  Path,
} from 'react-native-svg';

import NstpRegistrationHeader from '../../components/NstpRegistrationHeader';

import {
  getStudentUniversity,
  submitGeneralRegistrationSignature,
} from '../../services/api';


/*
|--------------------------------------------------------------------------
| NSTP HUB Color Palette
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

  signatureBackground:
    '#D9D5CF',

  softCream:
    '#F3F0E8',
};


/*
|--------------------------------------------------------------------------
| Signature Virtual Canvas
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Both the normal signature box and the full-screen signature box use
| this same virtual coordinate system.
|
| This means:
|
| Small pad
|      ↓
| Expand
|      ↓
| Full-screen pad
|      ↓
| Signature keeps the same proportions
|
*/

const SIGNATURE_CANVAS_WIDTH =
  1000;

const SIGNATURE_CANVAS_HEIGHT =
  400;


/*
|--------------------------------------------------------------------------
| Registration Routes
|--------------------------------------------------------------------------
*/

const ROUTES = {
  GENERAL_REGISTRATION:
    '/Registration/GeneralRegistrationScreen',

  REGISTRATION_WAIT_EDIT:
    '/Registration/RegistrationWaitEdit',
};


/*
|--------------------------------------------------------------------------
| General Registration Signature Screen
|--------------------------------------------------------------------------
|
| File:
|
| app/Registration/GeneralRegistrationSignature.js
|
|
| Flow:
|
| GeneralRegistrationScreen
|          ↓
| GeneralRegistrationSignature
|          ↓
| Draw Signature
|          ↓
| Optional Full-Screen Drawing
|          ↓
| Accept Signature
|          ↓
| Certification
|          ↓
| POST /api/mobile/general-registration/signature
|          ↓
| Laravel
|          ↓
| Store Signature
|          ↓
| registration_status = under_review
|          ↓
| RegistrationWaitEdit
|
*/

export default function GeneralRegistrationSignature() {
  /*
  |--------------------------------------------------------------------------
  | University
  |--------------------------------------------------------------------------
  */

  const [
    university,
    setUniversity,
  ] = useState(null);


  const [
    universityLoading,
    setUniversityLoading,
  ] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | Signature Paths
  |--------------------------------------------------------------------------
  */

  const [
    signaturePaths,
    setSignaturePaths,
  ] = useState([]);


  /*
  |--------------------------------------------------------------------------
  | Signature Accepted
  |--------------------------------------------------------------------------
  */

  const [
    signatureAccepted,
    setSignatureAccepted,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Full Screen Signature
  |--------------------------------------------------------------------------
  */

  const [
    signatureExpanded,
    setSignatureExpanded,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Certification
  |--------------------------------------------------------------------------
  */

  const [
    certified,
    setCertified,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Registration Submission
  |--------------------------------------------------------------------------
  */

  const [
    registering,
    setRegistering,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Load University
  |--------------------------------------------------------------------------
  */

  const loadUniversity =
    useCallback(
      async () => {
        try {
          setUniversityLoading(
            true
          );


          const response =
            await getStudentUniversity();


          setUniversity(
            response?.university
            ??
            null
          );

        } catch (error) {
          console.error(
            'Signature University Load Error:',
            error
          );


          Alert.alert(
            'Unable to load university',

            error instanceof Error
              ? error.message
              : 'Unable to load your university information.'
          );

        } finally {
          setUniversityLoading(
            false
          );
        }
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Initial University Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadUniversity();
  }, [
    loadUniversity,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Signature Changed
  |--------------------------------------------------------------------------
  |
  | Whenever the student changes the signature, the previous acceptance is
  | cancelled. The student must press Upload Signature again.
  |
  */

  const handleSignatureChange =
    useCallback(
      paths => {
        setSignaturePaths(
          paths
        );


        setSignatureAccepted(
          false
        );
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Clear Signature
  |--------------------------------------------------------------------------
  */

  const handleClearSignature =
    useCallback(
      () => {
        setSignaturePaths(
          []
        );


        setSignatureAccepted(
          false
        );
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Open Full Screen Signature
  |--------------------------------------------------------------------------
  */

  const handleExpandSignature =
    () => {
      setSignatureExpanded(
        true
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Close Full Screen Signature
  |--------------------------------------------------------------------------
  */

  const handleCloseExpandedSignature =
    () => {
      setSignatureExpanded(
        false
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Upload / Accept Signature
  |--------------------------------------------------------------------------
  |
  | This confirms that the student is satisfied with the drawing.
  |
  | The actual Laravel submission happens after REGISTER is pressed.
  |
  */

  const handleUploadSignature =
    () => {
      /*
      |--------------------------------------------------------------------------
      | Signature Required
      |--------------------------------------------------------------------------
      */

      if (
        signaturePaths.length ===
        0
      ) {
        Alert.alert(
          'Signature required',
          'Please draw your signature inside the signature box first.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Accept Signature
      |--------------------------------------------------------------------------
      */

      setSignatureAccepted(
        true
      );


      Alert.alert(
        'Signature ready',
        'Your signature has been captured and is ready for registration.'
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack =
    () => {
      /*
      |--------------------------------------------------------------------------
      | Close Expanded Signature First
      |--------------------------------------------------------------------------
      */

      if (
        signatureExpanded
      ) {
        setSignatureExpanded(
          false
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Normal Navigation
      |--------------------------------------------------------------------------
      */

      if (
        router.canGoBack()
      ) {
        router.back();


        return;
      }


      router.replace(
        ROUTES.GENERAL_REGISTRATION
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  |
  | The signature is now sent to Laravel.
  |
  */

  const handleRegister =
    async () => {
      /*
      |--------------------------------------------------------------------------
      | Prevent Double Submission
      |--------------------------------------------------------------------------
      */

      if (
        registering
      ) {
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Signature Required
      |--------------------------------------------------------------------------
      */

      if (
        signaturePaths.length ===
        0
      ) {
        Alert.alert(
          'Signature required',
          'Please draw your signature before registering.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Signature Must Be Accepted
      |--------------------------------------------------------------------------
      */

      if (
        !signatureAccepted
      ) {
        Alert.alert(
          'Upload signature',
          'Please press Upload Signature before completing registration.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Certification Required
      |--------------------------------------------------------------------------
      */

      if (
        !certified
      ) {
        Alert.alert(
          'Certification required',
          'Please certify that the signature and registration information belong to you.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Laravel Submission
      |--------------------------------------------------------------------------
      */

      try {
        setRegistering(
          true
        );


        /*
        |--------------------------------------------------------------------------
        | Submit Signature
        |--------------------------------------------------------------------------
        |
        | Laravel expects:
        |
        | {
        |   paths: [...],
        |   certified: true
        | }
        |
        */

        const response =
          await submitGeneralRegistrationSignature(
            signaturePaths,
            true
          );


        /*
        |--------------------------------------------------------------------------
        | Laravel Must Confirm Success
        |--------------------------------------------------------------------------
        */

        if (
          response?.success !==
          true
        ) {
          throw new Error(
            response?.message
            ??
            'Laravel did not confirm that your signature was submitted.'
          );
        }


        /*
        |--------------------------------------------------------------------------
        | Development Log
        |--------------------------------------------------------------------------
        */

        console.log(
          'NSTP Signature Submitted:',
          response
        );


        /*
        |--------------------------------------------------------------------------
        | Continue To Registration Wait / Edit
        |--------------------------------------------------------------------------
        */

        router.replace(
          ROUTES.REGISTRATION_WAIT_EDIT
        );

      } catch (error) {
        console.error(
          'Registration Signature Error:',
          error
        );


        Alert.alert(
          'Registration failed',

          error instanceof Error
            ? error.message
            : 'Unable to complete your registration.'
        );

      } finally {
        setRegistering(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Register Button Enabled
  |--------------------------------------------------------------------------
  */

  const canRegister =
    signaturePaths.length >
      0
    &&
    signatureAccepted
    &&
    certified
    &&
    !registering;


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
      ]}
    >
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />


      <StatusBar
        style="light"
        backgroundColor={
          COLORS.maroon
        }
      />


      <ScrollView
        style={
          styles.scrollView
        }
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >

        {/*
        |--------------------------------------------------------------------------
        | Shared Registration Header
        |--------------------------------------------------------------------------
        */}

        <NstpRegistrationHeader
          university={
            university
          }
          loading={
            universityLoading
          }
        />


        {/*
        |--------------------------------------------------------------------------
        | Main Content
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.content
          }
        >

          {/*
          |--------------------------------------------------------------------------
          | NSTP Registration Title
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.registrationTitleArea
            }
          >
            <Text
              style={
                styles.registrationTitle
              }
            >
              NSTP
              {'\n'}
              REGISTRATION
            </Text>


            <TouchableOpacity
              style={
                styles.backButton
              }
              onPress={
                handleBack
              }
              activeOpacity={
                0.7
              }
            >
              <Ionicons
                name="arrow-back"
                size={
                  32
                }
                color={
                  COLORS.orange
                }
              />
            </TouchableOpacity>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Introduction
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.introduction
            }
          >
            <View
              style={
                styles.introductionTitleRow
              }
            >
              <Ionicons
                name="create-outline"
                size={
                  21
                }
                color={
                  COLORS.maroon
                }
              />


              <Text
                style={
                  styles.introductionTitle
                }
              >
                Sign to complete registration
              </Text>
            </View>


            <Text
              style={
                styles.introductionText
              }
            >
              Use your finger to sign within the area below.
              {'\n'}
              Tap the expand button if you need a larger drawing space.
              {'\n'}
              This signature will appear on your official NSTP
              enrollment record.
            </Text>
          </View>

        </View>


        {/*
        |--------------------------------------------------------------------------
        | Signature Area
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.signatureSection
          }
        >
          <View
            style={
              styles.signatureHeadingRow
            }
          >
            <Ionicons
              name="pencil-outline"
              size={
                19
              }
              color={
                COLORS.green
              }
            />


            <Text
              style={
                styles.signatureHeading
              }
            >
              Draw your signature below
            </Text>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Signature Box
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.signatureBoxWrapper
            }
          >
            <SignaturePad
              paths={
                signaturePaths
              }
              onChange={
                handleSignatureChange
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | Expand Button
            |--------------------------------------------------------------------------
            */}

            <TouchableOpacity
              style={
                styles.expandButton
              }
              onPress={
                handleExpandSignature
              }
              activeOpacity={
                0.75
              }
            >
              <Ionicons
                name="expand-outline"
                size={
                  18
                }
                color={
                  COLORS.maroon
                }
              />


              <Text
                style={
                  styles.expandText
                }
              >
                Expand
              </Text>
            </TouchableOpacity>


            {/*
            |--------------------------------------------------------------------------
            | Clear Button
            |--------------------------------------------------------------------------
            */}

            <TouchableOpacity
              style={
                styles.clearButton
              }
              onPress={
                handleClearSignature
              }
              activeOpacity={
                0.7
              }
            >
              <Ionicons
                name="trash-outline"
                size={
                  17
                }
                color={
                  COLORS.maroon
                }
              />


              <Text
                style={
                  styles.clearText
                }
              >
                Clear
              </Text>
            </TouchableOpacity>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Expand Help
          |--------------------------------------------------------------------------
          */}

          <TouchableOpacity
            style={
              styles.largeSignatureButton
            }
            onPress={
              handleExpandSignature
            }
            activeOpacity={
              0.8
            }
          >
            <Ionicons
              name="expand-outline"
              size={
                18
              }
              color={
                COLORS.green
              }
            />


            <Text
              style={
                styles.largeSignatureButtonText
              }
            >
              Open Large Signature Pad
            </Text>
          </TouchableOpacity>


          {/*
          |--------------------------------------------------------------------------
          | Signature Status
          |--------------------------------------------------------------------------
          */}

          {
            signatureAccepted
              ? (
                <View
                  style={
                    styles.signatureReady
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={
                      18
                    }
                    color={
                      COLORS.green
                    }
                  />


                  <Text
                    style={
                      styles.signatureReadyText
                    }
                  >
                    Signature captured
                  </Text>
                </View>
              )
              : null
          }


          {/*
          |--------------------------------------------------------------------------
          | Upload Signature
          |--------------------------------------------------------------------------
          */}

          <TouchableOpacity
            style={[
              styles.uploadButton,

              signaturePaths.length ===
                0
              &&
              styles.disabledUploadButton,
            ]}
            onPress={
              handleUploadSignature
            }
            disabled={
              signaturePaths.length ===
              0
            }
            activeOpacity={
              0.82
            }
          >
            <Ionicons
              name="cloud-upload-outline"
              size={
                17
              }
              color={
                COLORS.white
              }
            />


            <Text
              style={
                styles.uploadButtonText
              }
            >
              UPLOAD
              {'\n'}
              SIGNATURE
            </Text>
          </TouchableOpacity>
        </View>


        {/*
        |--------------------------------------------------------------------------
        | Certification
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.certificationSection
          }
        >
          <TouchableOpacity
            style={
              styles.certificationRow
            }
            onPress={() =>
              setCertified(
                previous =>
                  !previous
              )
            }
            activeOpacity={
              0.8
            }
          >
            <Ionicons
              name={
                certified
                  ? 'checkbox'
                  : 'square-outline'
              }
              size={
                25
              }
              color={
                certified
                  ? COLORS.green
                  : COLORS.maroon
              }
            />


            <Text
              style={
                styles.certificationText
              }
            >
              I certify that this is my own signature and that the
              information I've provided for NSTP registration is
              accurate.
            </Text>
          </TouchableOpacity>


          {/*
          |--------------------------------------------------------------------------
          | Register
          |--------------------------------------------------------------------------
          */}

          <TouchableOpacity
            style={[
              styles.registerButton,

              !canRegister
              &&
              styles.registerButtonDisabled,
            ]}
            onPress={
              handleRegister
            }
            disabled={
              !canRegister
            }
            activeOpacity={
              0.85
            }
          >
            {
              registering
                ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      COLORS.orange
                    }
                  />
                )
                : (
                  <>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={
                        21
                      }
                      color={
                        canRegister
                          ? COLORS.orange
                          : COLORS.gray
                      }
                    />


                    <Text
                      style={[
                        styles.registerButtonText,

                        !canRegister
                        &&
                        styles.registerButtonTextDisabled,
                      ]}
                    >
                      REGISTER
                    </Text>
                  </>
                )
            }
          </TouchableOpacity>
        </View>

      </ScrollView>


      {/*
      |--------------------------------------------------------------------------
      | Full-Screen Signature Modal
      |--------------------------------------------------------------------------
      |
      | The student can use most of the phone screen to draw.
      |
      */}

      <Modal
        visible={
          signatureExpanded
        }
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={
          handleCloseExpandedSignature
        }
      >
        <SafeAreaView
          style={
            styles.expandedSafeArea
          }
          edges={[
            'top',
            'bottom',
          ]}
        >
          <StatusBar
            style="light"
            backgroundColor={
              COLORS.maroon
            }
          />


          {/*
          |--------------------------------------------------------------------------
          | Full Screen Header
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.expandedHeader
            }
          >
            <TouchableOpacity
              style={
                styles.expandedHeaderButton
              }
              onPress={
                handleCloseExpandedSignature
              }
              activeOpacity={
                0.7
              }
            >
              <Ionicons
                name="close"
                size={
                  28
                }
                color={
                  COLORS.white
                }
              />
            </TouchableOpacity>


            <View
              style={
                styles.expandedHeaderCenter
              }
            >
              <Ionicons
                name="create-outline"
                size={
                  21
                }
                color={
                  COLORS.yellow
                }
              />


              <Text
                style={
                  styles.expandedHeaderTitle
                }
              >
                Draw Your Signature
              </Text>
            </View>


            <TouchableOpacity
              style={
                styles.expandedHeaderButton
              }
              onPress={
                handleClearSignature
              }
              activeOpacity={
                0.7
              }
            >
              <Ionicons
                name="trash-outline"
                size={
                  23
                }
                color={
                  COLORS.white
                }
              />
            </TouchableOpacity>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Full Screen Instructions
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.expandedInstructionArea
            }
          >
            <Text
              style={
                styles.expandedInstructionTitle
              }
            >
              Sign inside the box
            </Text>


            <Text
              style={
                styles.expandedInstructionText
              }
            >
              Use your finger freely. You can clear the signature and
              try again before pressing Done.
            </Text>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Large Signature Pad
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.expandedPadContainer
            }
          >
            <View
              style={
                styles.expandedSignatureBox
              }
            >
              <SignaturePad
                paths={
                  signaturePaths
                }
                onChange={
                  handleSignatureChange
                }
                expanded
              />


              {
                signaturePaths.length ===
                  0
                  ? (
                    <View
                      pointerEvents="none"
                      style={
                        styles.expandedPlaceholder
                      }
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={
                          36
                        }
                        color={
                          COLORS.gray
                        }
                      />


                      <Text
                        style={
                          styles.expandedPlaceholderText
                        }
                      >
                        Draw your signature here
                      </Text>
                    </View>
                  )
                  : null
              }
            </View>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Full Screen Bottom Actions
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.expandedBottomArea
            }
          >
            <TouchableOpacity
              style={
                styles.expandedClearButton
              }
              onPress={
                handleClearSignature
              }
              activeOpacity={
                0.8
              }
            >
              <Ionicons
                name="trash-outline"
                size={
                  20
                }
                color={
                  COLORS.maroon
                }
              />


              <Text
                style={
                  styles.expandedClearButtonText
                }
              >
                Clear
              </Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={[
                styles.expandedDoneButton,

                signaturePaths.length ===
                  0
                &&
                styles.expandedDoneButtonDisabled,
              ]}
              onPress={
                handleCloseExpandedSignature
              }
              disabled={
                signaturePaths.length ===
                0
              }
              activeOpacity={
                0.85
              }
            >
              <Ionicons
                name="checkmark"
                size={
                  21
                }
                color={
                  COLORS.white
                }
              />


              <Text
                style={
                  styles.expandedDoneButtonText
                }
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Signature Pad
|--------------------------------------------------------------------------
|
| Uses:
|
| react-native-svg
| PanResponder
|
| The coordinates are converted into a fixed 1000 x 400 virtual canvas.
|
| This allows the same signature to display correctly in:
|
| - Small preview
| - Full-screen pad
|
*/

function SignaturePad({
  paths,
  onChange,
  expanded = false,
}) {
  /*
  |--------------------------------------------------------------------------
  | Layout
  |--------------------------------------------------------------------------
  */

  const layoutRef =
    useRef({
      width: 1,
      height: 1,
    });


  /*
  |--------------------------------------------------------------------------
  | Current Path
  |--------------------------------------------------------------------------
  */

  const currentPathRef =
    useRef('');


  const [
    currentPath,
    setCurrentPath,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Latest Paths
  |--------------------------------------------------------------------------
  */

  const pathsRef =
    useRef(
      paths
    );


  useEffect(() => {
    pathsRef.current =
      paths;


    if (
      paths.length ===
      0
    ) {
      currentPathRef.current =
        '';


      setCurrentPath(
        ''
      );
    }
  }, [
    paths,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Convert Device Position To Virtual Canvas Position
  |--------------------------------------------------------------------------
  */

  const convertPoint =
    useCallback(
      (
        locationX,
        locationY
      ) => {
        const width =
          Math.max(
            layoutRef.current.width,
            1
          );


        const height =
          Math.max(
            layoutRef.current.height,
            1
          );


        const rawX =
          (
            locationX
            /
            width
          )
          *
          SIGNATURE_CANVAS_WIDTH;


        const rawY =
          (
            locationY
            /
            height
          )
          *
          SIGNATURE_CANVAS_HEIGHT;


        const x =
          Math.max(
            0,
            Math.min(
              SIGNATURE_CANVAS_WIDTH,
              rawX
            )
          );


        const y =
          Math.max(
            0,
            Math.min(
              SIGNATURE_CANVAS_HEIGHT,
              rawY
            )
          );


        return {
          x,
          y,
        };
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Complete Current Stroke
  |--------------------------------------------------------------------------
  */

  const completeStroke =
    useCallback(
      () => {
        const completedPath =
          currentPathRef.current;


        if (
          completedPath
        ) {
          onChange([
            ...pathsRef.current,
            completedPath,
          ]);
        }


        currentPathRef.current =
          '';


        setCurrentPath(
          ''
        );
      },
      [
        onChange,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Gesture Handler
  |--------------------------------------------------------------------------
  */

  const panResponder =
    useMemo(
      () =>
        PanResponder.create({
          /*
          |--------------------------------------------------------------------------
          | Capture Touches
          |--------------------------------------------------------------------------
          */

          onStartShouldSetPanResponder:
            () =>
              true,


          onMoveShouldSetPanResponder:
            () =>
              true,


          onStartShouldSetPanResponderCapture:
            () =>
              true,


          onMoveShouldSetPanResponderCapture:
            () =>
              true,


          /*
          |--------------------------------------------------------------------------
          | Start Stroke
          |--------------------------------------------------------------------------
          */

          onPanResponderGrant:
            event => {
              const {
                locationX,
                locationY,
              } =
                event.nativeEvent;


              const point =
                convertPoint(
                  locationX,
                  locationY
                );


              const newPath =
                `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;


              currentPathRef.current =
                newPath;


              setCurrentPath(
                newPath
              );
            },


          /*
          |--------------------------------------------------------------------------
          | Continue Stroke
          |--------------------------------------------------------------------------
          */

          onPanResponderMove:
            event => {
              const {
                locationX,
                locationY,
              } =
                event.nativeEvent;


              const point =
                convertPoint(
                  locationX,
                  locationY
                );


              const updatedPath =
                `${currentPathRef.current} L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;


              currentPathRef.current =
                updatedPath;


              setCurrentPath(
                updatedPath
              );
            },


          /*
          |--------------------------------------------------------------------------
          | Complete Stroke
          |--------------------------------------------------------------------------
          */

          onPanResponderRelease:
            completeStroke,


          /*
          |--------------------------------------------------------------------------
          | Interrupted Stroke
          |--------------------------------------------------------------------------
          */

          onPanResponderTerminate:
            completeStroke,


          /*
          |--------------------------------------------------------------------------
          | Keep Control Of Gesture
          |--------------------------------------------------------------------------
          */

          onPanResponderTerminationRequest:
            () =>
              false,
        }),
      [
        completeStroke,
        convertPoint,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Layout
  |--------------------------------------------------------------------------
  */

  const handleLayout =
    event => {
      const {
        width,
        height,
      } =
        event.nativeEvent.layout;


      layoutRef.current = {
        width:
          Math.max(
            width,
            1
          ),

        height:
          Math.max(
            height,
            1
          ),
      };
    };


  /*
  |--------------------------------------------------------------------------
  | Signature Pad UI
  |--------------------------------------------------------------------------
  */

  return (
    <View
      style={[
        styles.signaturePad,

        expanded
        &&
        styles.signaturePadExpanded,
      ]}
      onLayout={
        handleLayout
      }
      {...panResponder.panHandlers}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={
          `0 0 ${SIGNATURE_CANVAS_WIDTH} ${SIGNATURE_CANVAS_HEIGHT}`
        }
        preserveAspectRatio="none"
      >
        {paths.map(
          (
            path,
            index
          ) => (
            <Path
              key={
                `${index}-${path.length}`
              }
              d={
                path
              }
              stroke={
                COLORS.darkTeal
              }
              strokeWidth={
                expanded
                  ? 5
                  : 6
              }
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )
        )}


        {
          currentPath
            ? (
              <Path
                d={
                  currentPath
                }
                stroke={
                  COLORS.darkTeal
                }
                strokeWidth={
                  expanded
                    ? 5
                    : 6
                }
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )
            : null
        }
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
      flex: 1,

      backgroundColor:
        COLORS.maroon,
    },


    /*
    |--------------------------------------------------------------------------
    | Scroll View
    |--------------------------------------------------------------------------
    */

    scrollView: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    scrollContent: {
      flexGrow: 1,

      paddingBottom: 0,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | Content
    |--------------------------------------------------------------------------
    */

    content: {
      backgroundColor:
        COLORS.cream,

      paddingHorizontal: 24,
    },


    /*
    |--------------------------------------------------------------------------
    | Registration Title
    |--------------------------------------------------------------------------
    */

    registrationTitleArea: {
      minHeight: 126,

      position: 'relative',

      alignItems: 'center',

      justifyContent:
        'flex-start',

      paddingTop: 5,
    },


    registrationTitle: {
      color:
        COLORS.maroon,

      fontFamily: 'serif',

      fontSize: 24,

      lineHeight: 34,

      textAlign: 'center',

      fontWeight: '400',
    },


    backButton: {
      position: 'absolute',

      right: 0,

      bottom: 12,

      width: 48,

      height: 48,

      alignItems: 'center',

      justifyContent: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Introduction
    |--------------------------------------------------------------------------
    */

    introduction: {
      paddingBottom: 20,
    },


    introductionTitleRow: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 8,

      marginBottom: 7,
    },


    introductionTitle: {
      flex: 1,

      color:
        COLORS.maroon,

      fontSize: 15,

      lineHeight: 20,

      fontWeight: '500',
    },


    introductionText: {
      color:
        COLORS.darkTeal,

      fontSize: 12.5,

      lineHeight: 17,
    },


    /*
    |--------------------------------------------------------------------------
    | Signature Section
    |--------------------------------------------------------------------------
    */

    signatureSection: {
      backgroundColor:
        COLORS.softCream,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        COLORS.gray,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        COLORS.gray,

      paddingHorizontal: 25,

      paddingTop: 17,

      paddingBottom: 17,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,

        height: 3,
      },

      shadowOpacity: 0.16,

      shadowRadius: 6,

      elevation: 4,
    },


    signatureHeadingRow: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 7,

      marginBottom: 14,
    },


    signatureHeading: {
      color:
        COLORS.green,

      fontSize: 14,

      lineHeight: 20,

      textAlign: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Normal Signature Box
    |--------------------------------------------------------------------------
    */

    signatureBoxWrapper: {
      height: 182,

      position: 'relative',

      borderWidth: 2,

      borderColor:
        COLORS.maroon,

      borderStyle: 'dashed',

      backgroundColor:
        COLORS.signatureBackground,

      overflow: 'hidden',
    },


    signaturePad: {
      flex: 1,

      backgroundColor:
        'transparent',
    },


    signaturePadExpanded: {
      width: '100%',

      height: '100%',
    },


    /*
    |--------------------------------------------------------------------------
    | Expand Button Inside Signature Box
    |--------------------------------------------------------------------------
    */

    expandButton: {
      position: 'absolute',

      top: 9,

      left: 10,

      zIndex: 30,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,

      paddingHorizontal: 8,

      paddingVertical: 6,

      borderRadius: 5,

      backgroundColor:
        'rgba(217,213,207,0.90)',
    },


    expandText: {
      color:
        COLORS.maroon,

      fontSize: 12,
    },


    /*
    |--------------------------------------------------------------------------
    | Clear Button
    |--------------------------------------------------------------------------
    */

    clearButton: {
      position: 'absolute',

      top: 9,

      right: 10,

      zIndex: 30,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,

      paddingHorizontal: 8,

      paddingVertical: 6,

      backgroundColor:
        'rgba(217,213,207,0.90)',

      borderRadius: 5,
    },


    clearText: {
      color:
        COLORS.maroon,

      fontSize: 12,
    },


    /*
    |--------------------------------------------------------------------------
    | Open Large Signature Button
    |--------------------------------------------------------------------------
    */

    largeSignatureButton: {
      minHeight: 38,

      marginTop: 11,

      alignSelf: 'flex-start',

      paddingHorizontal: 11,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 6,

      borderWidth: 1,

      borderColor:
        COLORS.green,

      borderRadius: 9,

      backgroundColor:
        COLORS.white,
    },


    largeSignatureButtonText: {
      color:
        COLORS.green,

      fontSize: 11.5,

      fontWeight: '600',
    },


    /*
    |--------------------------------------------------------------------------
    | Signature Ready
    |--------------------------------------------------------------------------
    */

    signatureReady: {
      marginTop: 10,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 5,
    },


    signatureReadyText: {
      color:
        COLORS.green,

      fontSize: 11.5,

      fontWeight: '600',
    },


    /*
    |--------------------------------------------------------------------------
    | Upload
    |--------------------------------------------------------------------------
    */

    uploadButton: {
      minWidth: 86,

      minHeight: 42,

      marginTop: 12,

      alignSelf: 'flex-end',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 5,

      paddingHorizontal: 10,

      borderRadius: 10,

      backgroundColor:
        COLORS.orange,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 2,

        height: 4,
      },

      shadowOpacity: 0.25,

      shadowRadius: 4,

      elevation: 5,
    },


    disabledUploadButton: {
      opacity: 0.48,
    },


    uploadButtonText: {
      color:
        COLORS.white,

      fontSize: 8,

      lineHeight: 10,

      textAlign: 'center',

      fontWeight: '700',
    },


    /*
    |--------------------------------------------------------------------------
    | Certification
    |--------------------------------------------------------------------------
    */

    certificationSection: {
      minHeight: 175,

      backgroundColor:
        COLORS.cream,

      paddingHorizontal: 25,

      paddingTop: 28,

      paddingBottom: 25,
    },


    certificationRow: {
      flexDirection: 'row',

      alignItems: 'flex-start',

      gap: 9,
    },


    certificationText: {
      flex: 1,

      color:
        COLORS.darkTeal,

      fontSize: 12,

      lineHeight: 16,
    },


    /*
    |--------------------------------------------------------------------------
    | Register
    |--------------------------------------------------------------------------
    */

    registerButton: {
      width: 200,

      height: 51,

      marginTop: 28,

      alignSelf: 'center',

      borderWidth: 2,

      borderColor:
        COLORS.orange,

      backgroundColor:
        COLORS.cream,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 2,

        height: 4,
      },

      shadowOpacity: 0.22,

      shadowRadius: 4,

      elevation: 5,
    },


    registerButtonDisabled: {
      borderColor:
        COLORS.gray,

      opacity: 0.64,

      elevation: 0,

      shadowOpacity: 0,
    },


    registerButtonText: {
      color:
        COLORS.orange,

      fontSize: 18,

      fontWeight: '400',

      letterSpacing: 0.5,
    },


    registerButtonTextDisabled: {
      color:
        COLORS.gray,
    },


    /*
    |--------------------------------------------------------------------------
    | Full-Screen Signature
    |--------------------------------------------------------------------------
    */

    expandedSafeArea: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | Expanded Header
    |--------------------------------------------------------------------------
    */

    expandedHeader: {
      height: 64,

      paddingHorizontal: 12,

      backgroundColor:
        COLORS.maroon,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },


    expandedHeaderButton: {
      width: 48,

      height: 48,

      alignItems: 'center',

      justifyContent: 'center',
    },


    expandedHeaderCenter: {
      flex: 1,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 7,
    },


    expandedHeaderTitle: {
      color:
        COLORS.white,

      fontSize: 17,

      fontWeight: '600',
    },


    /*
    |--------------------------------------------------------------------------
    | Expanded Instructions
    |--------------------------------------------------------------------------
    */

    expandedInstructionArea: {
      paddingHorizontal: 24,

      paddingTop: 19,

      paddingBottom: 15,

      backgroundColor:
        COLORS.cream,
    },


    expandedInstructionTitle: {
      color:
        COLORS.maroon,

      fontSize: 18,

      fontWeight: '700',

      textAlign: 'center',
    },


    expandedInstructionText: {
      maxWidth: 470,

      marginTop: 6,

      alignSelf: 'center',

      color:
        COLORS.darkTeal,

      fontSize: 12.5,

      lineHeight: 17,

      textAlign: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Expanded Pad
    |--------------------------------------------------------------------------
    */

    expandedPadContainer: {
      flex: 1,

      paddingHorizontal: 15,

      paddingVertical: 9,

      backgroundColor:
        COLORS.softCream,
    },


    expandedSignatureBox: {
      flex: 1,

      minHeight: 300,

      position: 'relative',

      borderWidth: 2.5,

      borderColor:
        COLORS.maroon,

      borderStyle: 'dashed',

      borderRadius: 8,

      overflow: 'hidden',

      backgroundColor:
        COLORS.signatureBackground,
    },


    expandedPlaceholder: {
      ...StyleSheet.absoluteFillObject,

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,

      opacity: 0.65,
    },


    expandedPlaceholderText: {
      color:
        COLORS.darkTeal,

      fontSize: 14,
    },


    /*
    |--------------------------------------------------------------------------
    | Expanded Bottom Actions
    |--------------------------------------------------------------------------
    */

    expandedBottomArea: {
      minHeight: 88,

      paddingHorizontal: 20,

      paddingVertical: 13,

      backgroundColor:
        COLORS.cream,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 12,
    },


    expandedClearButton: {
      minWidth: 125,

      height: 48,

      paddingHorizontal: 20,

      borderWidth: 1.5,

      borderColor:
        COLORS.maroon,

      borderRadius: 11,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 7,

      backgroundColor:
        COLORS.white,
    },


    expandedClearButtonText: {
      color:
        COLORS.maroon,

      fontSize: 14,

      fontWeight: '600',
    },


    expandedDoneButton: {
      minWidth: 145,

      height: 48,

      paddingHorizontal: 22,

      borderRadius: 11,

      backgroundColor:
        COLORS.green,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 7,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 1,

        height: 3,
      },

      shadowOpacity: 0.23,

      shadowRadius: 3,

      elevation: 4,
    },


    expandedDoneButtonDisabled: {
      backgroundColor:
        COLORS.gray,

      elevation: 0,

      shadowOpacity: 0,

      opacity: 0.7,
    },


    expandedDoneButtonText: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight: '700',
    },
  });