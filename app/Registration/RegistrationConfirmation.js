import {
    router,
    Stack,
} from 'expo-router';

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ActivityIndicator,
    RefreshControl,
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

import NstpRegistrationHeader from '../../components/NstpRegistrationHeader';

import {
    getGeneralRegistration,
    getStudentUniversity,
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

  softGreen: '#EEF2E4',
  softOrange: '#FFF5DA',
  divider: '#955B59',
};


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| CWTS / LTS:
|
| RegistrationConfirmation
|        ↓
| /(tabs)/HomepageScreen
|
|
| ROTC:
|
| RegistrationConfirmation
|        ↓
| /Registration/ROTC/RotcEnrollment
|
*/

const ROUTES = {
  HOMEPAGE:
    '/(tabs)/HomepageScreen',

  WAITING:
    '/Registration/RegistrationWaitEdit',

  ROTC_ENROLLMENT:
    '/Registration/ROTC/RotcEnrollment',
};


/*
|--------------------------------------------------------------------------
| Registration Confirmation
|--------------------------------------------------------------------------
|
| File:
|
| app/Registration/RegistrationConfirmation.js
|
|
| Flow:
|
| RegistrationWaitEdit
|        ↓
| Director confirms
|        ↓
| RegistrationConfirmation
|        ↓
| Check component
|
|
| CWTS:
|
| Go to Homepage
|
|
| LTS:
|
| Go to Homepage
|
|
| ROTC:
|
| Proceed
|    ↓
| app/Registration/ROTC/RotcEnrollment.js
|
*/

export default function RegistrationConfirmation() {
  /*
  |--------------------------------------------------------------------------
  | University
  |--------------------------------------------------------------------------
  */

  const [
    university,
    setUniversity,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | Registration
  |--------------------------------------------------------------------------
  */

  const [
    registration,
    setRegistration,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | Refreshing
  |--------------------------------------------------------------------------
  */

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  const [
    error,
    setError,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Load Confirmation Data
  |--------------------------------------------------------------------------
  */

  const loadData =
    useCallback(
      async () => {
        try {
          setError('');


          const [
            universityResponse,
            registrationResponse,
          ] =
            await Promise.all([
              getStudentUniversity(),
              getGeneralRegistration(),
            ]);


          setUniversity(
            universityResponse
              ?.university
            ??
            null
          );


          setRegistration(
            registrationResponse
              ?.registration
            ??
            null
          );

        } catch (requestError) {
          console.error(
            'Registration Confirmation Error:',
            requestError
          );


          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your registration confirmation.'
          );

        } finally {
          setLoading(
            false
          );


          setRefreshing(
            false
          );
        }
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadData();
  }, [
    loadData,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Pull To Refresh
  |--------------------------------------------------------------------------
  */

  const handleRefresh =
    () => {
      setRefreshing(
        true
      );


      loadData();
    };


  /*
  |--------------------------------------------------------------------------
  | Student Component
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | cwts → CWTS
  | lts  → LTS
  | rotc → ROTC
  |
  */

  const component =
    useMemo(
      () =>
        String(
          registration
            ?.component
          ??
          ''
        )
          .trim()
          .toUpperCase(),
      [
        registration,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Component Checks
  |--------------------------------------------------------------------------
  */

  const isRotc =
    component ===
    'ROTC';


  const isCwts =
    component ===
    'CWTS';


  const isLts =
    component ===
    'LTS';


  /*
  |--------------------------------------------------------------------------
  | Registration Status
  |--------------------------------------------------------------------------
  */

  const registrationStatus =
    String(
      registration
        ?.registration_status
      ??
      ''
    )
      .trim()
      .toLowerCase();


  /*
  |--------------------------------------------------------------------------
  | Confirmed?
  |--------------------------------------------------------------------------
  */

  const isConfirmed =
    registrationStatus ===
      'completed'
    ||
    registrationStatus ===
      'confirmed';


  /*
  |--------------------------------------------------------------------------
  | Director
  |--------------------------------------------------------------------------
  */

  const directorName =
    registration
      ?.confirmed_by
      ?.name
    ??
    registration
      ?.confirmed_by_name
    ??
    'NSTP Director';


  const directorCredentials =
    registration
      ?.confirmed_by
      ?.credentials
    ??
    registration
      ?.confirmed_by_credentials
    ??
    '';


  /*
  |--------------------------------------------------------------------------
  | Confirmation Date
  |--------------------------------------------------------------------------
  */

  const confirmationDate =
    formatConfirmationDate(
      registration
        ?.confirmed_at
      ??
      registration
        ?.registration_completed_at
      ??
      null
    );


  /*
  |--------------------------------------------------------------------------
  | Student ID
  |--------------------------------------------------------------------------
  */

  const studentId =
    registration
      ?.student_id
    ??
    registration
      ?.id_no
    ??
    registration
      ?.student_number
    ??
    '—';


  /*
  |--------------------------------------------------------------------------
  | CWTS / LTS → Homepage
  |--------------------------------------------------------------------------
  |
  | Route:
  |
  | app/(tabs)/HomepageScreen.js
  |
  */

  const handleHomepage =
    () => {
      /*
      |--------------------------------------------------------------------------
      | Security / Flow Protection
      |--------------------------------------------------------------------------
      |
      | ROTC students should not use this path from the general confirmation
      | page because ROTC requires secondary enrollment first.
      |
      */

      if (
        isRotc
      ) {
        router.replace(
          ROUTES.ROTC_ENROLLMENT
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | CWTS / LTS
      |--------------------------------------------------------------------------
      */

      if (
        isCwts
        ||
        isLts
      ) {
        router.replace(
          ROUTES.HOMEPAGE
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Unknown Component Fallback
      |--------------------------------------------------------------------------
      */

      router.replace(
        ROUTES.HOMEPAGE
      );
    };


  /*
  |--------------------------------------------------------------------------
  | ROTC → ROTC Enrollment
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
  */

  const handleRotcProceed =
    () => {
      router.replace(
        ROUTES.ROTC_ENROLLMENT
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Return To Waiting
  |--------------------------------------------------------------------------
  */

  const handleReturnToWaiting =
    () => {
      router.replace(
        ROUTES.WAITING
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  if (
    loading
  ) {
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


        <NstpRegistrationHeader
          university={
            university
          }
          loading
        />


        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.green
            }
          />


          <Text
            style={
              styles.loadingText
            }
          >
            Loading confirmation...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Main Screen
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
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor={
              COLORS.green
            }
            colors={[
              COLORS.green,
            ]}
          />
        }
      >

        {/*
        |--------------------------------------------------------------------------
        | Header
        |--------------------------------------------------------------------------
        */}

        <NstpRegistrationHeader
          university={
            university
          }
          loading={
            false
          }
        />


        {/*
        |--------------------------------------------------------------------------
        | Error
        |--------------------------------------------------------------------------
        */}

        {error ? (
          <View
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="warning-outline"
              size={
                22
              }
              color={
                COLORS.maroon
              }
            />


            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}


        {/*
        |--------------------------------------------------------------------------
        | Not Confirmed
        |--------------------------------------------------------------------------
        */}

        {!isConfirmed ? (
          <NotConfirmedView
            onReturn={
              handleReturnToWaiting
            }
          />

        ) : isRotc ? (

          /*
          |--------------------------------------------------------------------------
          | ROTC
          |--------------------------------------------------------------------------
          |
          | RegistrationConfirmation
          |        ↓
          | RotcEnrollment
          |
          */

          <RotcConfirmation
            registration={
              registration
            }
            directorName={
              directorName
            }
            directorCredentials={
              directorCredentials
            }
            confirmationDate={
              confirmationDate
            }
            onProceed={
              handleRotcProceed
            }
          />

        ) : (

          /*
          |--------------------------------------------------------------------------
          | CWTS / LTS
          |--------------------------------------------------------------------------
          |
          | RegistrationConfirmation
          |        ↓
          | HomepageScreen
          |
          */

          <StandardConfirmation
            registration={
              registration
            }
            directorName={
              directorName
            }
            directorCredentials={
              directorCredentials
            }
            confirmationDate={
              confirmationDate
            }
            studentId={
              studentId
            }
            onHomepage={
              handleHomepage
            }
          />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| CWTS / LTS Confirmation
|--------------------------------------------------------------------------
*/

function StandardConfirmation({
  registration,
  directorName,
  directorCredentials,
  confirmationDate,
  studentId,
  onHomepage,
}) {
  return (
    <View
      style={
        styles.standardContent
      }
    >

      <SuccessIcon />


      <Text
        style={
          styles.confirmedTitle
        }
      >
        You're officially enrolled
      </Text>


      <ConfirmationMessage
        directorName={
          directorName
        }
        directorCredentials={
          directorCredentials
        }
        confirmationDate={
          confirmationDate
        }
      />


      <ConfirmationProgress
        rotc={
          false
        }
      />


      <View
        style={
          styles.detailsCard
        }
      >
        <View
          style={
            styles.detailsTitleRow
          }
        >
          <Ionicons
            name="document-text-outline"
            size={
              20
            }
            color={
              COLORS.maroon
            }
          />


          <Text
            style={
              styles.detailsTitle
            }
          >
            REGISTRATION DETAILS
          </Text>
        </View>


        <ConfirmationRow
          label="Subject"
          value={
            registration
              ?.subject
            ??
            '—'
          }
        />


        <ConfirmationRow
          label="Components"
          value={
            registration
              ?.component
            ??
            '—'
          }
        />


        <ConfirmationRow
          label="Term"
          value={
            registration
              ?.term
            ??
            '—'
          }
        />


        <ConfirmationRow
          label="ID No."
          value={
            studentId
          }
          last
        />
      </View>


      <View
        style={
          styles.homeDescriptionRow
        }
      >
        <Ionicons
          name="information-circle-outline"
          size={
            20
          }
          color={
            COLORS.darkTeal
          }
        />


        <Text
          style={
            styles.homeDescription
          }
        >
          You can now access your NSTP Hub. Tap below to proceed to
          your homepage.
        </Text>
      </View>


      {/*
      |--------------------------------------------------------------------------
      | CWTS / LTS Homepage Button
      |--------------------------------------------------------------------------
      */}

      <TouchableOpacity
        style={
          styles.homeButton
        }
        onPress={
          onHomepage
        }
        activeOpacity={
          0.85
        }
      >
        <Ionicons
          name="home"
          size={
            28
          }
          color={
            COLORS.darkTeal
          }
        />


        <Text
          style={
            styles.homeButtonText
          }
        >
          Go to Homepage
        </Text>


        <Ionicons
          name="arrow-forward"
          size={
            19
          }
          color={
            COLORS.darkTeal
          }
        />
      </TouchableOpacity>

    </View>
  );
}


/*
|--------------------------------------------------------------------------
| ROTC Confirmation
|--------------------------------------------------------------------------
*/

function RotcConfirmation({
  registration,
  directorName,
  directorCredentials,
  confirmationDate,
  onProceed,
}) {
  return (
    <View
      style={
        styles.rotcContent
      }
    >

      <SuccessIcon />


      <Text
        style={
          styles.rotcTitle
        }
      >
        General Registration Confirmed!
      </Text>


      <ConfirmationMessage
        directorName={
          directorName
        }
        directorCredentials={
          directorCredentials
        }
        confirmationDate={
          confirmationDate
        }
      />


      <ConfirmationProgress
        rotc
      />


      <View
        style={
          styles.rotcMessageArea
        }
      >
        <View
          style={
            styles.rotcMessageIcon
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={
              29
            }
            color={
              COLORS.maroon
            }
          />
        </View>


        <Text
          style={
            styles.rotcMessage
          }
        >
          Your general university NSTP registration has been
          successfully confirmed.
          {'\n\n'}

          However, because you selected the{' '}

          <Text
            style={
              styles.rotcBold
            }
          >
            ROTC
          </Text>

          {' '}component, you must complete the secondary enlistment
          process with the Department of Military Science and Tactics
          to grant you full access to the NSTP Hub.
          {'\n\n'}

          Please tap below to fill out your formal military profiling
          sheet, physical attributes, and cadet certification details.
        </Text>
      </View>


      <View
        style={
          styles.rotcComponentBadge
        }
      >
        <Ionicons
          name="shield-outline"
          size={
            20
          }
          color={
            COLORS.green
          }
        />


        <Text
          style={
            styles.rotcComponentBadgeText
          }
        >
          {
            registration
              ?.component
            ??
            'ROTC'
          }
        </Text>
      </View>


      {/*
      |--------------------------------------------------------------------------
      | ROTC Enrollment Button
      |--------------------------------------------------------------------------
      |
      | Routes to:
      |
      | app/Registration/ROTC/RotcEnrollment.js
      |
      */}

      <TouchableOpacity
        style={
          styles.proceedButton
        }
        onPress={
          onProceed
        }
        activeOpacity={
          0.85
        }
      >
        <Text
          style={
            styles.proceedButtonText
          }
        >
          Proceed
        </Text>


        <Ionicons
          name="arrow-forward"
          size={
            20
          }
          color={
            COLORS.white
          }
        />
      </TouchableOpacity>

    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Not Confirmed
|--------------------------------------------------------------------------
*/

function NotConfirmedView({
  onReturn,
}) {
  return (
    <View
      style={
        styles.notConfirmedContent
      }
    >
      <View
        style={
          styles.pendingIcon
        }
      >
        <Ionicons
          name="time-outline"
          size={
            37
          }
          color={
            COLORS.white
          }
        />
      </View>


      <Text
        style={
          styles.pendingTitle
        }
      >
        Registration still under review
      </Text>


      <Text
        style={
          styles.pendingDescription
        }
      >
        Your NSTP registration has not been confirmed by the NSTP
        Director yet.
      </Text>


      <TouchableOpacity
        style={
          styles.waitingButton
        }
        onPress={
          onReturn
        }
        activeOpacity={
          0.85
        }
      >
        <Ionicons
          name="hourglass-outline"
          size={
            19
          }
          color={
            COLORS.white
          }
        />


        <Text
          style={
            styles.waitingButtonText
          }
        >
          View Registration Status
        </Text>
      </TouchableOpacity>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Success Icon
|--------------------------------------------------------------------------
*/

function SuccessIcon() {
  return (
    <View
      style={
        styles.successIconWrapper
      }
    >
      <View
        style={
          styles.successGlow
        }
      />


      <Ionicons
        name="checkmark-circle-outline"
        size={
          69
        }
        color={
          COLORS.green
        }
      />
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Confirmation Message
|--------------------------------------------------------------------------
*/

function ConfirmationMessage({
  directorName,
  directorCredentials,
  confirmationDate,
}) {
  return (
    <View
      style={
        styles.confirmationMessage
      }
    >
      <View
        style={
          styles.directorIcon
        }
      >
        <Ionicons
          name="person-circle-outline"
          size={
            19
          }
          color={
            COLORS.darkTeal
          }
        />
      </View>


      <Text
        style={
          styles.confirmationText
        }
      >
        Confirmed by{' '}

        <Text
          style={
            styles.confirmationStrong
          }
        >
          {directorName}
        </Text>

        {
          directorCredentials
            ? `, ${directorCredentials}`
            : ''
        }

        {
          confirmationDate
            ? ` on ${confirmationDate}.`
            : '.'
        }

        {'\n'}

        Welcome to the program!
      </Text>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Confirmation Progress
|--------------------------------------------------------------------------
*/

function ConfirmationProgress({
  rotc = false,
}) {
  const steps =
    rotc
      ? [
          {
            key: 'submitted',
            label: 'Submitted',
            final: false,
          },

          {
            key: 'review',
            label: 'Under review',
            final: false,
          },

          {
            key: 'confirmed',
            label: 'Confirmed',
            final: false,
          },

          {
            key: 'rotc',
            label: 'ROTC Enrollment',
            final: true,
          },
        ]
      : [
          {
            key: 'submitted',
            label: 'Submitted',
          },

          {
            key: 'review',
            label: 'Under review',
          },

          {
            key: 'confirmed',
            label: 'Confirmed',
          },
        ];


  return (
    <View
      style={[
        styles.progress,

        rotc
        &&
        styles.progressRotc,
      ]}
    >
      <View
        style={
          styles.progressLine
        }
      />


      {rotc ? (
        <View
          style={
            styles.progressRotcPendingLine
          }
        />
      ) : null}


      {steps.map(
        (
          step,
          index
        ) => (
          <View
            key={
              step.key
            }
            style={[
              styles.progressItem,

              {
                left:
                  `${
                    (
                      index /
                      (
                        steps.length -
                        1
                      )
                    )
                    *
                    100
                  }%`,
              },
            ]}
          >
            <View
              style={[
                styles.progressDot,

                step.final
                  ? styles.progressDotRotc
                  : styles.progressDotComplete,
              ]}
            >
              {step.final ? null : (
                <Ionicons
                  name="checkmark"
                  size={
                    15
                  }
                  color={
                    COLORS.white
                  }
                />
              )}
            </View>


            <Text
              style={[
                styles.progressText,

                step.final
                  ? styles.progressTextRotc
                  : styles.progressTextComplete,
              ]}
            >
              {step.label}
            </Text>
          </View>
        )
      )}
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Confirmation Detail Row
|--------------------------------------------------------------------------
*/

function ConfirmationRow({
  label,
  value,
  last = false,
}) {
  return (
    <View
      style={[
        styles.confirmationRow,

        last
        &&
        styles.confirmationRowLast,
      ]}
    >
      <Text
        style={
          styles.confirmationLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.confirmationValue
        }
      >
        {value}
      </Text>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
*/

function formatConfirmationDate(
  value
) {
  if (
    !value
  ) {
    return '';
  }


  try {
    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }


    return date.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    );

  } catch (error) {
    return '';
  }
}


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        COLORS.maroon,
    },


    scrollView: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    scrollContent: {
      flexGrow: 1,

      paddingBottom: 34,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    loadingContainer: {
      flex: 1,

      minHeight: 430,

      backgroundColor:
        COLORS.cream,

      alignItems: 'center',

      justifyContent: 'center',
    },


    loadingText: {
      marginTop: 13,

      color:
        COLORS.darkTeal,

      fontSize: 13,
    },


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    errorBox: {
      marginHorizontal: 25,

      marginTop: 10,

      paddingHorizontal: 14,

      paddingVertical: 12,

      borderRadius: 11,

      backgroundColor:
        '#F5E5E2',

      flexDirection: 'row',

      alignItems: 'center',

      gap: 9,
    },


    errorText: {
      flex: 1,

      color:
        COLORS.maroon,

      fontSize: 12,

      lineHeight: 17,
    },


    /*
    |--------------------------------------------------------------------------
    | Standard Confirmation
    |--------------------------------------------------------------------------
    */

    standardContent: {
      paddingHorizontal: 25,

      alignItems: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    successIconWrapper: {
      width: 82,

      height: 82,

      marginTop: 5,

      position: 'relative',

      alignItems: 'center',

      justifyContent: 'center',
    },


    successGlow: {
      position: 'absolute',

      width: 60,

      height: 60,

      borderRadius: 30,

      backgroundColor:
        'rgba(88,118,28,0.12)',

      shadowColor:
        COLORS.green,

      shadowOffset: {
        width: 0,

        height: 3,
      },

      shadowOpacity: 0.3,

      shadowRadius: 10,

      elevation: 5,
    },


    confirmedTitle: {
      marginTop: 2,

      color:
        COLORS.maroon,

      fontSize: 21,

      lineHeight: 28,

      textAlign: 'center',

      fontWeight: '500',
    },


    /*
    |--------------------------------------------------------------------------
    | Confirmation Message
    |--------------------------------------------------------------------------
    */

    confirmationMessage: {
      maxWidth: 330,

      marginTop: 17,

      flexDirection: 'row',

      alignItems: 'flex-start',

      justifyContent: 'center',
    },


    directorIcon: {
      marginTop: 1,

      marginRight: 5,
    },


    confirmationText: {
      flexShrink: 1,

      color:
        COLORS.darkTeal,

      fontSize: 12,

      lineHeight: 16,

      textAlign: 'center',
    },


    confirmationStrong: {
      fontWeight: '700',

      color:
        COLORS.darkTeal,
    },


    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */

    progress: {
      width: '88%',

      height: 81,

      marginTop: 22,

      marginBottom: 12,

      position: 'relative',
    },


    progressRotc: {
      width: '91%',

      marginBottom: 24,
    },


    progressLine: {
      position: 'absolute',

      top: 15,

      left: 4,

      right: 4,

      height: 3,

      backgroundColor:
        COLORS.green,
    },


    progressRotcPendingLine: {
      position: 'absolute',

      top: 15,

      right: 0,

      width: '26%',

      height: 3,

      backgroundColor:
        COLORS.orange,
    },


    progressItem: {
      position: 'absolute',

      top: 0,

      width: 72,

      marginLeft: -36,

      alignItems: 'center',
    },


    progressDot: {
      width: 31,

      height: 31,

      borderRadius: 16,

      alignItems: 'center',

      justifyContent: 'center',
    },


    progressDotComplete: {
      backgroundColor:
        COLORS.green,
    },


    progressDotRotc: {
      backgroundColor:
        COLORS.orange,
    },


    progressText: {
      marginTop: 6,

      fontSize: 7.5,

      textAlign: 'center',
    },


    progressTextComplete: {
      color:
        COLORS.green,
    },


    progressTextRotc: {
      color:
        COLORS.orange,
    },


    /*
    |--------------------------------------------------------------------------
    | Details
    |--------------------------------------------------------------------------
    */

    detailsCard: {
      width: '100%',

      marginTop: 6,

      paddingHorizontal: 16,

      paddingTop: 12,

      paddingBottom: 8,

      borderWidth: 2,

      borderColor:
        COLORS.maroon,

      borderRadius: 20,

      backgroundColor:
        COLORS.white,
    },


    detailsTitleRow: {
      minHeight: 37,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 7,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.divider,
    },


    detailsTitle: {
      color:
        COLORS.maroon,

      fontSize: 15,

      fontWeight: '900',
    },


    confirmationRow: {
      minHeight: 46,

      paddingHorizontal: 7,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.divider,
    },


    confirmationRowLast: {
      borderBottomWidth: 0,
    },


    confirmationLabel: {
      color:
        COLORS.maroon,

      fontSize: 13.5,
    },


    confirmationValue: {
      maxWidth: '59%',

      color:
        COLORS.darkTeal,

      fontSize: 18,

      fontWeight: '500',

      textAlign: 'right',
    },


    /*
    |--------------------------------------------------------------------------
    | Homepage
    |--------------------------------------------------------------------------
    */

    homeDescriptionRow: {
      maxWidth: 310,

      marginTop: 25,

      flexDirection: 'row',

      alignItems: 'flex-start',

      justifyContent: 'center',

      gap: 7,
    },


    homeDescription: {
      flex: 1,

      color:
        COLORS.dark,

      fontSize: 12,

      lineHeight: 16,

      textAlign: 'center',
    },


    homeButton: {
      minWidth: 205,

      height: 49,

      marginTop: 25,

      paddingHorizontal: 16,

      borderWidth: 2,

      borderColor:
        COLORS.darkTeal,

      borderRadius: 12,

      backgroundColor:
        COLORS.cream,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 10,
    },


    homeButtonText: {
      color:
        COLORS.darkTeal,

      fontSize: 14,

      fontWeight: '500',
    },


    /*
    |--------------------------------------------------------------------------
    | ROTC
    |--------------------------------------------------------------------------
    */

    rotcContent: {
      paddingHorizontal: 26,

      alignItems: 'center',
    },


    rotcTitle: {
      marginTop: 3,

      color:
        COLORS.maroon,

      fontSize: 20,

      lineHeight: 27,

      textAlign: 'center',

      fontWeight: '500',
    },


    rotcMessageArea: {
      width: '100%',

      marginTop: 15,

      paddingHorizontal: 10,

      alignItems: 'center',
    },


    rotcMessageIcon: {
      width: 51,

      height: 51,

      marginBottom: 12,

      borderRadius: 26,

      borderWidth: 1.5,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.softGreen,

      alignItems: 'center',

      justifyContent: 'center',
    },


    rotcMessage: {
      color:
        COLORS.maroon,

      fontFamily:
        'serif',

      fontSize: 16,

      lineHeight: 22,

      textAlign: 'center',
    },


    rotcBold: {
      fontWeight: '800',
    },


    rotcComponentBadge: {
      marginTop: 24,

      paddingHorizontal: 16,

      height: 38,

      borderWidth: 1,

      borderColor:
        COLORS.green,

      borderRadius: 19,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 7,

      backgroundColor:
        COLORS.softGreen,
    },


    rotcComponentBadgeText: {
      color:
        COLORS.green,

      fontSize: 13,

      fontWeight: '700',
    },


    proceedButton: {
      minWidth: 200,

      height: 49,

      marginTop: 35,

      marginBottom: 8,

      paddingHorizontal: 20,

      borderRadius: 12,

      backgroundColor:
        COLORS.orange,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 9,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 1,

        height: 4,
      },

      shadowOpacity: 0.24,

      shadowRadius: 4,

      elevation: 5,
    },


    proceedButtonText: {
      color:
        COLORS.white,

      fontSize: 15,

      fontWeight: '500',

      letterSpacing: 0.2,
    },


    /*
    |--------------------------------------------------------------------------
    | Pending
    |--------------------------------------------------------------------------
    */

    notConfirmedContent: {
      minHeight: 450,

      paddingHorizontal: 30,

      alignItems: 'center',

      justifyContent: 'center',
    },


    pendingIcon: {
      width: 62,

      height: 62,

      borderRadius: 31,

      backgroundColor:
        COLORS.orange,

      alignItems: 'center',

      justifyContent: 'center',
    },


    pendingTitle: {
      marginTop: 18,

      color:
        COLORS.maroon,

      fontSize: 20,

      fontWeight: '600',

      textAlign: 'center',
    },


    pendingDescription: {
      maxWidth: 310,

      marginTop: 10,

      color:
        COLORS.darkTeal,

      fontSize: 13,

      lineHeight: 18,

      textAlign: 'center',
    },


    waitingButton: {
      minWidth: 220,

      height: 48,

      marginTop: 28,

      paddingHorizontal: 18,

      borderRadius: 11,

      backgroundColor:
        COLORS.green,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,
    },


    waitingButtonText: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight: '500',
    },
  });