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
  Alert,
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
  getRegistrationWaitEdit,
  updateRegistrationComponent,
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

  softGreen: '#F2F4EA',
  softOrange: '#FFF7E5',
  selectedRotc: '#D7C6BF',
  line: '#8C4D4B',
};


/*
|--------------------------------------------------------------------------
| Registration Routes
|--------------------------------------------------------------------------
*/

const ROUTES = {
  REGISTRATION_CONFIRMATION:
    '/Registration/RegistrationConfirmation',

  PRE_REGISTRATION:
    '/Registration/PreRegistrationScreen',
};


/*
|--------------------------------------------------------------------------
| NSTP Components
|--------------------------------------------------------------------------
*/

const COMPONENT_DETAILS = {
  CWTS: {
    key: 'CWTS',

    title: 'CWTS',

    subtitle:
      'Civic Welfare Training Service',

    icon:
      'people-outline',

    description:
      'Focuses on community development and social welfare, immersing you in projects like environmental clean-ups, health awareness, and local livelihood programs.',
  },


  ROTC: {
    key: 'ROTC',

    title: 'ROTC',

    subtitle:
      "Reserve Officers' Training Corps",

    icon:
      'shield-outline',

    description:
      'Emphasizes military discipline, leadership, and national defense readiness, preparing you for physical conditioning, tactical training, and emergency disaster response operations.',
  },


  LTS: {
    key: 'LTS',

    title: 'LTS',

    subtitle:
      'Literacy Training Service',

    icon:
      'school-outline',

    description:
      'Centers on education, training you to teach basic reading, writing, and numeracy to school children and out-of-school youth in marginalized areas.',
  },
};


/*
|--------------------------------------------------------------------------
| Registration Wait / Edit Screen
|--------------------------------------------------------------------------
|
| File:
|
| app/Registration/RegistrationWaitEdit.js
|
|
| Backend:
|
| GET
| /api/mobile/registration-wait-edit
|
| PATCH
| /api/mobile/registration-wait-edit/component
|
|
| Flow:
|
| Registration submitted
|       ↓
| RegistrationWaitEdit
|       ↓
| Waiting for NSTP Director
|       ↓
| Student may edit component
|       ↓
| Director confirms
|       ↓
| RegistrationConfirmation
|
*/

export default function RegistrationWaitEdit() {
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
  | Wait / Edit Information
  |--------------------------------------------------------------------------
  */

  const [
    waitEdit,
    setWaitEdit,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | Selected Component
  |--------------------------------------------------------------------------
  */

  const [
    selectedComponent,
    setSelectedComponent,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Edit Mode
  |--------------------------------------------------------------------------
  */

  const [
    editingComponents,
    setEditingComponents,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Routing
  |--------------------------------------------------------------------------
  */

  const [
    routingToConfirmation,
    setRoutingToConfirmation,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Load Waiting Registration
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | We now call ONE Laravel endpoint:
  |
  | GET /api/mobile/registration-wait-edit
  |
  | instead of calling:
  |
  | getStudentUniversity()
  | +
  | getGeneralRegistration()
  |
  */

  const loadData =
    useCallback(
      async () => {
        try {
          const response =
            await getRegistrationWaitEdit();


          /*
          |--------------------------------------------------------------------------
          | University
          |--------------------------------------------------------------------------
          */

          const loadedUniversity =
            response?.university
            ??
            null;


          /*
          |--------------------------------------------------------------------------
          | Registration
          |--------------------------------------------------------------------------
          */

          const loadedRegistration =
            response?.registration
            ??
            null;


          /*
          |--------------------------------------------------------------------------
          | Wait / Edit State
          |--------------------------------------------------------------------------
          */

          const loadedWaitEdit =
            response?.wait_edit
            ??
            null;


          /*
          |--------------------------------------------------------------------------
          | Store Data
          |--------------------------------------------------------------------------
          */

          setUniversity(
            loadedUniversity
          );


          setRegistration(
            loadedRegistration
          );


          setWaitEdit(
            loadedWaitEdit
          );


          /*
          |--------------------------------------------------------------------------
          | Selected Component
          |--------------------------------------------------------------------------
          */

          setSelectedComponent(
            String(
              loadedRegistration
                ?.component
              ??
              ''
            )
              .trim()
              .toUpperCase()
          );


          /*
          |--------------------------------------------------------------------------
          | Backend Directed Navigation
          |--------------------------------------------------------------------------
          |
          | If Laravel already knows the registration is confirmed, it may
          | return:
          |
          | next_screen = registration_confirmation
          |
          */

          const nextScreen =
            String(
              response?.next_screen
              ??
              ''
            )
              .trim()
              .toLowerCase();


          if (
            nextScreen ===
              'registration_confirmation'
            ||
            nextScreen ===
              'registration-confirmation'
            ||
            nextScreen ===
              'confirmation'
          ) {
            setRoutingToConfirmation(
              true
            );


            router.replace(
              ROUTES.REGISTRATION_CONFIRMATION
            );


            return;
          }

        } catch (error) {
          console.error(
            'Registration Wait Load Error:',
            error
          );


          Alert.alert(
            'Unable to load registration',

            error instanceof Error
              ? error.message
              : 'Unable to load your registration information.'
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
  | Refresh
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
  | Available Components
  |--------------------------------------------------------------------------
  */

  const availableComponents =
    useMemo(
      () => {
        const universityComponents =
          Array.isArray(
            university?.components
          )
            ? university.components
            : [];


        const normalized =
          universityComponents
            .map(
              item =>
                String(
                  item
                )
                  .trim()
                  .toUpperCase()
            )
            .filter(
              item =>
                COMPONENT_DETAILS[
                  item
                ]
            );


        if (
          normalized.length >
          0
        ) {
          return normalized;
        }


        return [
          'CWTS',
          'ROTC',
          'LTS',
        ];
      },
      [
        university,
      ]
    );


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
      waitEdit
        ?.registration_status
      ??
      'under_review'
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
      'confirmed'
    ||
    registrationStatus ===
      'completed';


  /*
  |--------------------------------------------------------------------------
  | Can Edit?
  |--------------------------------------------------------------------------
  |
  | Laravel may explicitly return:
  |
  | wait_edit.can_edit_component
  |
  | If it does not, fall back to:
  |
  | !isConfirmed
  |
  */

  const canEditComponent =
    typeof waitEdit
      ?.can_edit_component ===
      'boolean'
      ? waitEdit.can_edit_component
      : !isConfirmed;


  /*
  |--------------------------------------------------------------------------
  | Automatic Confirmation Route
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      if (
        loading
        ||
        refreshing
        ||
        !registration
        ||
        !isConfirmed
        ||
        routingToConfirmation
      ) {
        return;
      }


      setRoutingToConfirmation(
        true
      );


      router.replace(
        ROUTES.REGISTRATION_CONFIRMATION
      );
    },
    [
      isConfirmed,
      loading,
      refreshing,
      registration,
      routingToConfirmation,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Display Status
  |--------------------------------------------------------------------------
  */

  const displayStatus =
    isConfirmed
      ? 'confirmed'
      : 'under_review';


  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack =
    () => {
      /*
      |--------------------------------------------------------------------------
      | Close Editor
      |--------------------------------------------------------------------------
      */

      if (
        editingComponents
      ) {
        setSelectedComponent(
          String(
            registration
              ?.component
            ??
            ''
          )
            .trim()
            .toUpperCase()
        );


        setEditingComponents(
          false
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Normal Back
      |--------------------------------------------------------------------------
      */

      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Fallback
      |--------------------------------------------------------------------------
      */

      router.replace(
        ROUTES.PRE_REGISTRATION
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Open Component Editor
  |--------------------------------------------------------------------------
  */

  const handleEditComponents =
    () => {
      /*
      |--------------------------------------------------------------------------
      | Confirmed Registration
      |--------------------------------------------------------------------------
      */

      if (
        isConfirmed
      ) {
        router.replace(
          ROUTES.REGISTRATION_CONFIRMATION
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Laravel Does Not Allow Editing
      |--------------------------------------------------------------------------
      */

      if (
        !canEditComponent
      ) {
        Alert.alert(
          'Registration locked',
          'Your NSTP component can no longer be changed.'
        );


        return;
      }


      setEditingComponents(
        true
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Save Component
  |--------------------------------------------------------------------------
  |
  | PATCH
  |
  | /api/mobile/registration-wait-edit/component
  |
  | Only sends:
  |
  | {
  |   component: "CWTS"
  | }
  |
  */

  const handleSaveComponent =
    async () => {
      /*
      |--------------------------------------------------------------------------
      | Prevent Double Submission
      |--------------------------------------------------------------------------
      */

      if (
        saving
      ) {
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Registration Required
      |--------------------------------------------------------------------------
      */

      if (
        !registration
      ) {
        Alert.alert(
          'Registration unavailable',
          'Your registration information could not be loaded.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Component Required
      |--------------------------------------------------------------------------
      */

      if (
        !selectedComponent
      ) {
        Alert.alert(
          'Choose a component',
          'Please select CWTS, ROTC, or LTS.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Validate Component
      |--------------------------------------------------------------------------
      */

      if (
        ![
          'CWTS',
          'ROTC',
          'LTS',
        ].includes(
          selectedComponent
        )
      ) {
        Alert.alert(
          'Invalid component',
          'Please select a valid NSTP component.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Registration Confirmed
      |--------------------------------------------------------------------------
      */

      if (
        isConfirmed
      ) {
        router.replace(
          ROUTES.REGISTRATION_CONFIRMATION
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Server Says Editing Is Locked
      |--------------------------------------------------------------------------
      */

      if (
        !canEditComponent
      ) {
        Alert.alert(
          'Registration locked',
          'Your NSTP component can no longer be changed.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | No Changes
      |--------------------------------------------------------------------------
      */

      const currentComponent =
        String(
          registration
            ?.component
          ??
          ''
        )
          .trim()
          .toUpperCase();


      if (
        currentComponent ===
        selectedComponent
      ) {
        setEditingComponents(
          false
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Save Through Dedicated Laravel Endpoint
      |--------------------------------------------------------------------------
      */

      try {
        setSaving(
          true
        );


        const response =
          await updateRegistrationComponent(
            selectedComponent
          );


        /*
        |--------------------------------------------------------------------------
        | Updated Registration
        |--------------------------------------------------------------------------
        |
        | Support several possible Laravel response structures.
        |
        */

        const updatedRegistration =
          response?.registration
          ??
          response?.student
          ??
          {
            ...registration,

            component:
              selectedComponent,
          };


        setRegistration(
          updatedRegistration
        );


        /*
        |--------------------------------------------------------------------------
        | Updated Wait/Edit Information
        |--------------------------------------------------------------------------
        */

        if (
          response?.wait_edit
        ) {
          setWaitEdit(
            response.wait_edit
          );
        }


        /*
        |--------------------------------------------------------------------------
        | Update Selected Value
        |--------------------------------------------------------------------------
        */

        setSelectedComponent(
          String(
            updatedRegistration
              ?.component
            ??
            selectedComponent
          )
            .trim()
            .toUpperCase()
        );


        /*
        |--------------------------------------------------------------------------
        | Close Editor
        |--------------------------------------------------------------------------
        */

        setEditingComponents(
          false
        );


        /*
        |--------------------------------------------------------------------------
        | Check Updated Registration Status
        |--------------------------------------------------------------------------
        */

        const updatedStatus =
          String(
            updatedRegistration
              ?.registration_status
            ??
            response?.registration_status
            ??
            ''
          )
            .trim()
            .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Check Backend Next Screen
        |--------------------------------------------------------------------------
        */

        const nextScreen =
          String(
            response?.next_screen
            ??
            ''
          )
            .trim()
            .toLowerCase();


        if (
          updatedStatus ===
            'confirmed'
          ||
          updatedStatus ===
            'completed'
          ||
          nextScreen ===
            'registration_confirmation'
          ||
          nextScreen ===
            'registration-confirmation'
        ) {
          setRoutingToConfirmation(
            true
          );


          router.replace(
            ROUTES.REGISTRATION_CONFIRMATION
          );


          return;
        }


        /*
        |--------------------------------------------------------------------------
        | Success
        |--------------------------------------------------------------------------
        */

        Alert.alert(
          'Component updated',
          `Your NSTP component has been changed to ${selectedComponent}.`
        );


        /*
        |--------------------------------------------------------------------------
        | Reload From Laravel
        |--------------------------------------------------------------------------
        |
        | This guarantees that the UI matches the database.
        |
        */

        await loadData();

      } catch (error) {
        console.error(
          'Component Save Error:',
          error
        );


        Alert.alert(
          'Unable to save changes',

          error instanceof Error
            ? error.message
            : 'Unable to update your NSTP component.'
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  if (
    loading
    ||
    routingToConfirmation
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
          loading={
            loading
          }
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
            {
              routingToConfirmation
                ? 'Opening your registration confirmation...'
                : 'Loading your registration...'
            }
          </Text>
        </View>
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
            colors={[
              COLORS.green,
            ]}
            tintColor={
              COLORS.green
            }
          />
        }
      >

        {/*
        |--------------------------------------------------------------------------
        | Shared Header
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
        | Edit Component
        |--------------------------------------------------------------------------
        */}

        {editingComponents ? (
          <EditComponentsView
            availableComponents={
              availableComponents
            }
            selectedComponent={
              selectedComponent
            }
            setSelectedComponent={
              setSelectedComponent
            }
            saving={
              saving
            }
            onBack={
              handleBack
            }
            onSave={
              handleSaveComponent
            }
          />
        ) : (
          <WaitingView
            registration={
              registration
            }
            status={
              displayStatus
            }
            isConfirmed={
              isConfirmed
            }
            canEditComponent={
              canEditComponent
            }
            onEdit={
              handleEditComponents
            }
          />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Waiting View
|--------------------------------------------------------------------------
*/

function WaitingView({
  registration,
  status,
  isConfirmed,
  canEditComponent,
  onEdit,
}) {
  return (
    <View
      style={
        styles.waitingContent
      }
    >

      {/*
      |--------------------------------------------------------------------------
      | Status Icon
      |--------------------------------------------------------------------------
      */}

      <View
        style={[
          styles.statusIconCircle,

          isConfirmed
          &&
          styles.statusIconConfirmed,
        ]}
      >
        <Ionicons
          name={
            isConfirmed
              ? 'checkmark'
              : 'time-outline'
          }
          size={
            32
          }
          color={
            COLORS.white
          }
        />
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Heading
      |--------------------------------------------------------------------------
      */}

      <Text
        style={
          styles.waitTitle
        }
      >
        {
          isConfirmed
            ? 'Registration confirmed'
            : "You're almost set"
        }
      </Text>


      <Text
        style={
          styles.waitDescription
        }
      >
        {
          isConfirmed
            ? 'Your NSTP registration has been confirmed successfully.'
            : "Your registration was submitted and is now waiting on your NSTP Director's confirmation — usually within one week."
        }
      </Text>


      {/*
      |--------------------------------------------------------------------------
      | Progress
      |--------------------------------------------------------------------------
      */}

      <RegistrationProgress
        status={
          status
        }
      />


      {/*
      |--------------------------------------------------------------------------
      | Registration Summary
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.registrationCard
        }
      >
        <View
          style={
            styles.registrationCardHeader
          }
        >
          <Text
            style={
              styles.registrationCardTitle
            }
          >
            YOUR REGISTRATION
          </Text>


          {
            !isConfirmed
            &&
            canEditComponent
              ? (
                <TouchableOpacity
                  style={
                    styles.smallEditButton
                  }
                  onPress={
                    onEdit
                  }
                  activeOpacity={
                    0.7
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={
                      19
                    }
                    color={
                      COLORS.maroon
                    }
                  />


                  <Text
                    style={
                      styles.smallEditText
                    }
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              )
              : null
          }
        </View>


        <SummaryRow
          label="Subject"
          value={
            registration
              ?.subject
            ??
            '—'
          }
        />


        <SummaryRow
          label="Components"
          value={
            registration
              ?.component
            ??
            '—'
          }
        />


        <SummaryRow
          label="Term"
          value={
            registration
              ?.term
            ??
            '—'
          }
          last
        />
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Notice
      |--------------------------------------------------------------------------
      */}

      {
        !isConfirmed
        &&
        canEditComponent
          ? (
            <View
              style={
                styles.noticeBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={
                  23
                }
                color={
                  COLORS.orange
                }
              />


              <Text
                style={
                  styles.noticeText
                }
              >
                Changed your mind about a component? You can still edit
                your registration until your director confirms it.
              </Text>
            </View>
          )
          : null
      }


      {/*
      |--------------------------------------------------------------------------
      | Edit Components
      |--------------------------------------------------------------------------
      */}

      {
        !isConfirmed
        &&
        canEditComponent
          ? (
            <TouchableOpacity
              style={
                styles.editComponentsButton
              }
              onPress={
                onEdit
              }
              activeOpacity={
                0.85
              }
            >
              <Ionicons
                name="options-outline"
                size={
                  19
                }
                color={
                  COLORS.white
                }
              />


              <Text
                style={
                  styles.editComponentsButtonText
                }
              >
                Edit Components
              </Text>
            </TouchableOpacity>
          )
          : null
      }


      {/*
      |--------------------------------------------------------------------------
      | Locked Registration
      |--------------------------------------------------------------------------
      */}

      {
        !isConfirmed
        &&
        !canEditComponent
          ? (
            <View
              style={
                styles.lockedNotice
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={
                  20
                }
                color={
                  COLORS.maroon
                }
              />


              <Text
                style={
                  styles.lockedNoticeText
                }
              >
                Your registration is currently locked for review.
              </Text>
            </View>
          )
          : null
      }


      {/*
      |--------------------------------------------------------------------------
      | Notification
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.notificationRow
        }
      >
        <Ionicons
          name="notifications-outline"
          size={
            17
          }
          color={
            COLORS.darkTeal
          }
        />


        <Text
          style={
            styles.notificationText
          }
        >
          {
            isConfirmed
              ? 'Opening your confirmed NSTP registration...'
              : "We'll notify you here and by email once your director responds."
          }
        </Text>
      </View>

    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Progress
|--------------------------------------------------------------------------
*/

function RegistrationProgress({
  status,
}) {
  const confirmed =
    status ===
    'confirmed';


  return (
    <View
      style={
        styles.progressContainer
      }
    >
      <View
        style={
          styles.progressLineBackground
        }
      />


      <View
        style={[
          styles.progressLineActive,

          confirmed
          &&
          styles.progressLineCompleted,
        ]}
      />


      {/*
      |--------------------------------------------------------------------------
      | Submitted
      |--------------------------------------------------------------------------
      */}

      <View
        style={[
          styles.progressStep,
          styles.progressStepOne,
        ]}
      >
        <View
          style={[
            styles.progressCircle,
            styles.progressSubmitted,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={
              19
            }
            color={
              COLORS.white
            }
          />
        </View>


        <Text
          style={[
            styles.progressLabel,
            styles.progressLabelSubmitted,
          ]}
        >
          Submitted
        </Text>
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Under Review
      |--------------------------------------------------------------------------
      */}

      <View
        style={[
          styles.progressStep,
          styles.progressStepTwo,
        ]}
      >
        <View
          style={[
            styles.progressCircle,

            confirmed
              ? styles.progressSubmitted
              : styles.progressReview,
          ]}
        >
          {
            confirmed
              ? (
                <Ionicons
                  name="checkmark"
                  size={
                    19
                  }
                  color={
                    COLORS.white
                  }
                />
              )
              : null
          }
        </View>


        <Text
          style={[
            styles.progressLabel,

            confirmed
              ? styles.progressLabelSubmitted
              : styles.progressLabelReview,
          ]}
        >
          Under review
        </Text>
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Confirmed
      |--------------------------------------------------------------------------
      */}

      <View
        style={[
          styles.progressStep,
          styles.progressStepThree,
        ]}
      >
        <View
          style={[
            styles.progressCircle,

            confirmed
              ? styles.progressSubmitted
              : styles.progressPending,
          ]}
        >
          {
            confirmed
              ? (
                <Ionicons
                  name="checkmark"
                  size={
                    19
                  }
                  color={
                    COLORS.white
                  }
                />
              )
              : null
          }
        </View>


        <Text
          style={[
            styles.progressLabel,

            confirmed
              ? styles.progressLabelSubmitted
              : styles.progressLabelPending,
          ]}
        >
          Confirmed
        </Text>
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Summary Row
|--------------------------------------------------------------------------
*/

function SummaryRow({
  label,
  value,
  last = false,
}) {
  return (
    <View
      style={[
        styles.summaryRow,

        last
        &&
        styles.summaryRowLast,
      ]}
    >
      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Edit Components View
|--------------------------------------------------------------------------
*/

function EditComponentsView({
  availableComponents,
  selectedComponent,
  setSelectedComponent,
  saving,
  onBack,
  onSave,
}) {
  return (
    <View
      style={
        styles.editContent
      }
    >

      {/*
      |--------------------------------------------------------------------------
      | Back
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.editBackRow
        }
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={
            onBack
          }
          activeOpacity={
            0.7
          }
        >
          <Ionicons
            name="arrow-back"
            size={
              31
            }
            color={
              COLORS.orange
            }
          />
        </TouchableOpacity>
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Reminder
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.editNotice
        }
      >
        <Ionicons
          name="alert-circle-outline"
          size={
            25
          }
          color={
            COLORS.orange
          }
        />


        <Text
          style={
            styles.editNoticeText
          }
        >
          Your registration hasn't been confirmed yet, so you're free
          to switch components below.
        </Text>
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Components Heading
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.componentsHeadingRow
        }
      >
        <Ionicons
          name="grid-outline"
          size={
            22
          }
          color={
            COLORS.maroon
          }
        />


        <Text
          style={
            styles.componentsHeading
          }
        >
          COMPONENTS
        </Text>
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Cards
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.componentList
        }
      >
        {availableComponents.map(
          componentKey => {
            const details =
              COMPONENT_DETAILS[
                componentKey
              ];


            if (
              !details
            ) {
              return null;
            }


            return (
              <ComponentCard
                key={
                  componentKey
                }
                details={
                  details
                }
                selected={
                  selectedComponent ===
                  componentKey
                }
                onPress={() =>
                  setSelectedComponent(
                    componentKey
                  )
                }
              />
            );
          }
        )}
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Save
      |--------------------------------------------------------------------------
      */}

      <TouchableOpacity
        style={[
          styles.saveButton,

          saving
          &&
          styles.saveButtonDisabled,
        ]}
        onPress={
          onSave
        }
        disabled={
          saving
        }
        activeOpacity={
          0.85
        }
      >
        {
          saving
            ? (
              <ActivityIndicator
                size="small"
                color={
                  COLORS.white
                }
              />
            )
            : (
              <>
                <Ionicons
                  name="save-outline"
                  size={
                    19
                  }
                  color={
                    COLORS.white
                  }
                />


                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Save Changes
                </Text>
              </>
            )
        }
      </TouchableOpacity>

    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Component Card
|--------------------------------------------------------------------------
*/

function ComponentCard({
  details,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.componentCard,

        selected
        &&
        styles.componentCardSelected,
      ]}
      onPress={
        onPress
      }
      activeOpacity={
        0.82
      }
    >
      <View
        style={
          styles.componentTopRow
        }
      >
        <View
          style={[
            styles.componentIconCircle,

            selected
            &&
            styles.componentIconCircleSelected,
          ]}
        >
          <Ionicons
            name={
              details.icon
            }
            size={
              28
            }
            color={
              COLORS.green
            }
          />
        </View>


        <View
          style={
            styles.componentTitleArea
          }
        >
          <Text
            style={[
              styles.componentTitle,

              selected
              &&
              styles.componentTitleSelected,
            ]}
          >
            {details.title}
          </Text>


          <Text
            style={
              styles.componentSubtitle
            }
          >
            {details.subtitle}
          </Text>
        </View>


        <Ionicons
          name={
            selected
              ? 'radio-button-on'
              : 'radio-button-off'
          }
          size={
            24
          }
          color={
            selected
              ? COLORS.maroon
              : COLORS.green
          }
        />
      </View>


      <View
        style={
          styles.componentDivider
        }
      />


      <Text
        style={[
          styles.componentDescription,

          selected
          &&
          styles.componentDescriptionSelected,
        ]}
      >
        {details.description}
      </Text>
    </TouchableOpacity>
  );
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

      minHeight: 450,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor:
        COLORS.cream,
    },


    loadingText: {
      marginTop: 13,

      color:
        COLORS.darkTeal,

      fontSize: 13,
    },


    /*
    |--------------------------------------------------------------------------
    | Waiting Content
    |--------------------------------------------------------------------------
    */

    waitingContent: {
      paddingHorizontal: 26,

      paddingTop: 2,

      alignItems: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Status Icon
    |--------------------------------------------------------------------------
    */

    statusIconCircle: {
      width: 48,

      height: 48,

      marginTop: 3,

      borderRadius: 24,

      backgroundColor:
        COLORS.orange,

      alignItems: 'center',

      justifyContent: 'center',
    },


    statusIconConfirmed: {
      backgroundColor:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Waiting Title
    |--------------------------------------------------------------------------
    */

    waitTitle: {
      marginTop: 13,

      color:
        COLORS.maroon,

      fontSize: 20,

      fontWeight: '500',

      textAlign: 'center',
    },


    waitDescription: {
      maxWidth: 310,

      marginTop: 7,

      color:
        COLORS.darkTeal,

      fontSize: 12.5,

      lineHeight: 17,

      textAlign: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */

    progressContainer: {
      width: '100%',

      height: 93,

      marginTop: 23,

      position: 'relative',
    },


    progressLineBackground: {
      position: 'absolute',

      top: 23,

      left: '15%',

      right: '15%',

      height: 3,

      backgroundColor:
        COLORS.gray,
    },


    progressLineActive: {
      position: 'absolute',

      top: 23,

      left: '15%',

      width: '35%',

      height: 3,

      backgroundColor:
        COLORS.orange,
    },


    progressLineCompleted: {
      width: '70%',

      backgroundColor:
        COLORS.green,
    },


    progressStep: {
      position: 'absolute',

      top: 8,

      width: 90,

      alignItems: 'center',
    },


    progressStepOne: {
      left: 0,
    },


    progressStepTwo: {
      left: '50%',

      marginLeft: -45,
    },


    progressStepThree: {
      right: 0,
    },


    progressCircle: {
      width: 33,

      height: 33,

      borderRadius: 17,

      alignItems: 'center',

      justifyContent: 'center',
    },


    progressSubmitted: {
      backgroundColor:
        COLORS.green,
    },


    progressReview: {
      backgroundColor:
        COLORS.orange,
    },


    progressPending: {
      backgroundColor:
        COLORS.gray,
    },


    progressLabel: {
      marginTop: 8,

      fontSize: 9.5,

      textAlign: 'center',
    },


    progressLabelSubmitted: {
      color:
        COLORS.green,
    },


    progressLabelReview: {
      color:
        COLORS.orange,
    },


    progressLabelPending: {
      color:
        COLORS.gray,
    },


    /*
    |--------------------------------------------------------------------------
    | Registration Summary
    |--------------------------------------------------------------------------
    */

    registrationCard: {
      width: '100%',

      marginTop: 9,

      paddingHorizontal: 17,

      paddingTop: 13,

      paddingBottom: 10,

      borderWidth: 2.5,

      borderColor:
        COLORS.maroon,

      borderRadius: 20,

      backgroundColor:
        COLORS.white,
    },


    registrationCardHeader: {
      minHeight: 36,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.line,
    },


    registrationCardTitle: {
      color:
        COLORS.maroon,

      fontSize: 17,

      fontWeight: '900',
    },


    smallEditButton: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,

      paddingHorizontal: 3,

      paddingVertical: 5,
    },


    smallEditText: {
      color:
        COLORS.maroon,

      fontSize: 15,
    },


    summaryRow: {
      minHeight: 45,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 7,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.line,
    },


    summaryRowLast: {
      borderBottomWidth: 0,
    },


    summaryLabel: {
      color:
        COLORS.maroon,

      fontSize: 14,
    },


    summaryValue: {
      color:
        COLORS.darkTeal,

      fontSize: 19,

      fontWeight: '500',
    },


    /*
    |--------------------------------------------------------------------------
    | Notice
    |--------------------------------------------------------------------------
    */

    noticeBox: {
      width: '100%',

      minHeight: 57,

      marginTop: 26,

      paddingHorizontal: 15,

      paddingVertical: 10,

      borderWidth: 2,

      borderColor:
        COLORS.orange,

      borderRadius: 18,

      backgroundColor:
        COLORS.softOrange,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 11,
    },


    noticeText: {
      flex: 1,

      color:
        COLORS.green,

      fontSize: 11,

      lineHeight: 15,
    },


    /*
    |--------------------------------------------------------------------------
    | Locked
    |--------------------------------------------------------------------------
    */

    lockedNotice: {
      width: '100%',

      minHeight: 54,

      marginTop: 25,

      paddingHorizontal: 15,

      paddingVertical: 11,

      borderWidth: 1.5,

      borderColor:
        COLORS.maroon,

      borderRadius: 15,

      backgroundColor:
        COLORS.white,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,
    },


    lockedNoticeText: {
      color:
        COLORS.maroon,

      fontSize: 11,

      lineHeight: 15,

      textAlign: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Edit Components Button
    |--------------------------------------------------------------------------
    */

    editComponentsButton: {
      minWidth: 184,

      height: 47,

      marginTop: 28,

      paddingHorizontal: 18,

      borderRadius: 12,

      backgroundColor:
        COLORS.orange,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 1,

        height: 4,
      },

      shadowOpacity: 0.23,

      shadowRadius: 4,

      elevation: 5,
    },


    editComponentsButtonText: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight: '500',
    },


    /*
    |--------------------------------------------------------------------------
    | Notification
    |--------------------------------------------------------------------------
    */

    notificationRow: {
      maxWidth: 300,

      marginTop: 24,

      marginBottom: 16,

      flexDirection: 'row',

      alignItems: 'flex-start',

      justifyContent: 'center',

      gap: 7,
    },


    notificationText: {
      flex: 1,

      color:
        COLORS.darkTeal,

      fontSize: 10.5,

      lineHeight: 14,

      textAlign: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Edit Mode
    |--------------------------------------------------------------------------
    */

    editContent: {
      paddingHorizontal: 25,

      paddingBottom: 25,
    },


    editBackRow: {
      minHeight: 48,

      alignItems: 'flex-end',

      justifyContent: 'center',
    },


    backButton: {
      width: 48,

      height: 48,

      alignItems: 'center',

      justifyContent: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Edit Notice
    |--------------------------------------------------------------------------
    */

    editNotice: {
      minHeight: 76,

      marginTop: 2,

      paddingHorizontal: 17,

      paddingVertical: 14,

      borderWidth: 2,

      borderColor:
        COLORS.orange,

      borderRadius: 20,

      backgroundColor:
        COLORS.softOrange,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 13,
    },


    editNoticeText: {
      flex: 1,

      color:
        COLORS.green,

      fontSize: 12,

      lineHeight: 17,
    },


    /*
    |--------------------------------------------------------------------------
    | Components Heading
    |--------------------------------------------------------------------------
    */

    componentsHeadingRow: {
      marginTop: 27,

      marginBottom: 18,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 8,
    },


    componentsHeading: {
      color:
        COLORS.maroon,

      fontSize: 18,

      fontWeight: '900',
    },


    componentList: {
      gap: 18,
    },


    /*
    |--------------------------------------------------------------------------
    | Component Card
    |--------------------------------------------------------------------------
    */

    componentCard: {
      paddingHorizontal: 17,

      paddingTop: 13,

      paddingBottom: 14,

      borderWidth: 2,

      borderColor:
        COLORS.green,

      borderRadius: 17,

      backgroundColor:
        COLORS.white,
    },


    componentCardSelected: {
      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.selectedRotc,
    },


    componentTopRow: {
      flexDirection: 'row',

      alignItems: 'center',
    },


    componentIconCircle: {
      width: 46,

      height: 46,

      borderRadius: 23,

      borderWidth: 1.5,

      borderColor:
        COLORS.green,

      backgroundColor:
        COLORS.softGreen,

      alignItems: 'center',

      justifyContent: 'center',
    },


    componentIconCircleSelected: {
      backgroundColor:
        COLORS.softGreen,
    },


    componentTitleArea: {
      flex: 1,

      marginLeft: 10,

      paddingRight: 8,
    },


    componentTitle: {
      color:
        COLORS.green,

      fontSize: 20,

      fontWeight: '700',

      fontFamily: 'serif',
    },


    componentTitleSelected: {
      color:
        COLORS.maroon,
    },


    componentSubtitle: {
      color:
        COLORS.green,

      fontSize: 10.5,

      lineHeight: 14,
    },


    componentDivider: {
      height: 1,

      marginTop: 10,

      marginBottom: 10,

      marginHorizontal: 3,

      backgroundColor:
        COLORS.green,
    },


    componentDescription: {
      color:
        COLORS.darkTeal,

      fontSize: 10.5,

      lineHeight: 15,
    },


    componentDescriptionSelected: {
      color:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    saveButton: {
      minWidth: 183,

      height: 48,

      marginTop: 28,

      marginBottom: 10,

      alignSelf: 'center',

      paddingHorizontal: 20,

      borderRadius: 12,

      backgroundColor:
        COLORS.green,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,

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


    saveButtonDisabled: {
      opacity: 0.6,
    },


    saveButtonText: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight: '500',
    },
  });