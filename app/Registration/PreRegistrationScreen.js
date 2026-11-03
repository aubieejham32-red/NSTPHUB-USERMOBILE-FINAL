import {
  router,
  Stack,
} from 'expo-router';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
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

import {
  getStudentUniversity,
} from '../../services/api';

import NstpRegistrationHeader from '../../components/NstpRegistrationHeader';


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
};


/*
|--------------------------------------------------------------------------
| Registration Routes
|--------------------------------------------------------------------------
|
| Current Screen:
|
| app/Registration/PreRegistrationScreen.js
|
| Next Screen:
|
| app/Registration/GeneralRegistrationScreen.js
|
| Expo Router Path:
|
| /Registration/GeneralRegistrationScreen
|
*/

const ROUTES = {
  GENERAL_REGISTRATION:
    '/Registration/GeneralRegistrationScreen',
};


/*
|--------------------------------------------------------------------------
| Pre Registration Screen
|--------------------------------------------------------------------------
|
| Route:
|
| /Registration/PreRegistrationScreen
|
|
| Flow:
|
| PreRegistrationScreen
|        ↓
| Start Registration Form
|        ↓
| GeneralRegistrationScreen
|
*/

export default function PreRegistrationScreen() {
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
  | Initial Loading
  |--------------------------------------------------------------------------
  */

  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | Pull To Refresh
  |--------------------------------------------------------------------------
  */

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | API Error
  |--------------------------------------------------------------------------
  */

  const [
    error,
    setError,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Load Student University
  |--------------------------------------------------------------------------
  |
  | Endpoint:
  |
  | GET /api/mobile/university
  |
  | Relationship:
  |
  | users.university_id
  |        ↓
  | universities.id
  |
  */

  const loadUniversity =
    useCallback(
      async () => {
        try {
          setError('');


          const response =
            await getStudentUniversity();


          const loadedUniversity =
            response?.university
            ??
            null;


          setUniversity(
            loadedUniversity
          );


          /*
          |--------------------------------------------------------------------------
          | Development Log
          |--------------------------------------------------------------------------
          */

          if (
            loadedUniversity?.logo_url
          ) {
            console.log(
              'University logo:',
              loadedUniversity.logo_url
            );
          }

        } catch (
          requestError
        ) {
          console.error(
            'University Load Error:',
            requestError
          );


          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load university information.'
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
  | Load University When Screen Opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadUniversity();
  }, [
    loadUniversity,
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


      loadUniversity();
    };


  /*
  |--------------------------------------------------------------------------
  | Start General Registration
  |--------------------------------------------------------------------------
  |
  | Route:
  |
  | /Registration/GeneralRegistrationScreen
  |
  | File:
  |
  | app/Registration/GeneralRegistrationScreen.js
  |
  */

  const handleStartRegistration =
    () => {
      router.push(
        ROUTES.GENERAL_REGISTRATION
      );
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
              COLORS.maroon
            }
            colors={[
              COLORS.maroon,
            ]}
          />
        }
      >

        {/*
        |--------------------------------------------------------------------------
        | Reusable Registration Header
        |--------------------------------------------------------------------------
        */}

        <NstpRegistrationHeader
          university={
            university
          }
          loading={
            loading
          }
        />


        {/*
        |--------------------------------------------------------------------------
        | Main Body
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.body
          }
        >

          {/*
          |--------------------------------------------------------------------------
          | API Error
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
                  21
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
          | Main Heading
          |--------------------------------------------------------------------------
          */}

          <Text
            style={
              styles.heroTitle
            }
          >
            <Text
              style={
                styles.heroMaroon
              }
            >
              Step Up.
            </Text>

            {' '}

            <Text
              style={
                styles.heroOrange
              }
            >
              Serve.
            </Text>

            {' '}

            <Text
              style={
                styles.heroTeal
              }
            >
              Lead.
            </Text>
          </Text>


          {/*
          |--------------------------------------------------------------------------
          | Description
          |--------------------------------------------------------------------------
          */}

          <Text
            style={
              styles.heroDescription
            }
          >
            Your official NSTP journey starts now. Let's get you
            registered for your chosen component and ready to make
            a difference.
          </Text>


          {/*
          |--------------------------------------------------------------------------
          | Pre-Registration Checklist Header
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.sectionHeading
            }
          >
            <View
              style={
                styles.sectionIcon
              }
            >
              <Ionicons
                name="document-text"
                size={
                  25
                }
                color={
                  COLORS.white
                }
              />
            </View>


            <Text
              style={
                styles.sectionTitle
              }
            >
              Pre-Registration Checklist
            </Text>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Know Your Component
          |--------------------------------------------------------------------------
          */}

          <ChecklistItem
            title="Know Your Component:"
          >
            Decide whether you are enrolling in{' '}

            <Text
              style={
                styles.boldText
              }
            >
              CWTS, LTS, or ROTC.
            </Text>
          </ChecklistItem>


          {/*
          |--------------------------------------------------------------------------
          | Personal Details
          |--------------------------------------------------------------------------
          */}

          <ChecklistItem
            title="Have Your Details Handy:"
          >
            You will need your exact course details, year, section,
            and accurate home address.
          </ChecklistItem>


          {/*
          |--------------------------------------------------------------------------
          | Emergency Contact
          |--------------------------------------------------------------------------
          */}

          <ChecklistItem
            title="Emergency Contact Ready:"
          >
            Make sure you know the full name, complete address, and
            active contact number of your parent, guardian, or
            emergency contact person.
          </ChecklistItem>


          {/*
          |--------------------------------------------------------------------------
          | Digital Signature
          |--------------------------------------------------------------------------
          */}

          <ChecklistItem
            title="Digital Signature:"
          >
            Prepare to draw your signature directly on your screen
            to complete the verification.
          </ChecklistItem>


          {/*
          |--------------------------------------------------------------------------
          | Important Reminders
          |--------------------------------------------------------------------------
          */}

          <View
            style={[
              styles.sectionHeading,
              styles.reminderHeading,
            ]}
          >
            <View
              style={
                styles.reminderIcon
              }
            >
              <Ionicons
                name="alert"
                size={
                  25
                }
                color={
                  COLORS.white
                }
              />
            </View>


            <Text
              style={
                styles.sectionTitle
              }
            >
              Important Reminders:
            </Text>
          </View>


          <View
            style={
              styles.reminderContent
            }
          >
            <Text
              style={
                styles.reminderTitle
              }
            >
              Double-Check Everything:
            </Text>


            <Text
              style={
                styles.reminderText
              }
            >
              This form directly registers you to the NSTP Director's
              official record. Please ensure all information matches
              your institutional school documents.
            </Text>
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Registration Information
          |--------------------------------------------------------------------------
          */}

          {university ? (
            <View
              style={
                styles.infoCard
              }
            >
              <View
                style={
                  styles.infoCardHeader
                }
              >
                <Ionicons
                  name="school-outline"
                  size={
                    20
                  }
                  color={
                    COLORS.maroon
                  }
                />


                <Text
                  style={
                    styles.infoTitle
                  }
                >
                  Registration Information
                </Text>
              </View>


              {university.name ? (
                <InfoRow
                  label="University"
                  value={
                    university.name
                  }
                />
              ) : null}


              {university.academic_year ? (
                <InfoRow
                  label="Academic Year"
                  value={
                    university.academic_year
                  }
                />
              ) : null}


              {university.semester ? (
                <InfoRow
                  label="Semester"
                  value={
                    university.semester
                  }
                />
              ) : null}


              {Array.isArray(
                university.components
              )
              &&
              university.components.length >
                0 ? (
                <InfoRow
                  label="Components"
                  value={
                    university.components.join(
                      ', '
                    )
                  }
                />
              ) : null}

            </View>
          ) : null}


          {/*
          |--------------------------------------------------------------------------
          | Start General Registration Button
          |--------------------------------------------------------------------------
          |
          | Pressing this button now routes to:
          |
          | /Registration/GeneralRegistrationScreen
          |
          */}

          <TouchableOpacity
            style={
              styles.startButton
            }
            onPress={
              handleStartRegistration
            }
            activeOpacity={
              0.85
            }
          >
            <Text
              style={
                styles.startButtonText
              }
            >
              Start Registration Form
            </Text>


            <Ionicons
              name="arrow-forward"
              size={
                19
              }
              color={
                COLORS.white
              }
            />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Checklist Item
|--------------------------------------------------------------------------
*/

function ChecklistItem({
  title,
  children,
}) {
  return (
    <View
      style={
        styles.checklistItem
      }
    >
      <View
        style={
          styles.squareBullet
        }
      />


      <View
        style={
          styles.checklistContent
        }
      >
        <Text
          style={
            styles.checklistTitle
          }
        >
          {title}
        </Text>


        <Text
          style={
            styles.checklistDescription
          }
        >
          {children}
        </Text>
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Information Row
|--------------------------------------------------------------------------
*/

function InfoRow({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.infoRow
      }
    >
      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.infoValue
        }
      >
        {value}
      </Text>
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
        COLORS.maroon,
    },


    /*
    |--------------------------------------------------------------------------
    | Scroll
    |--------------------------------------------------------------------------
    */

    scrollView: {
      flex:
        1,

      backgroundColor:
        COLORS.cream,
    },


    scrollContent: {
      paddingBottom:
        54,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | Main Body
    |--------------------------------------------------------------------------
    */

    body: {
      paddingHorizontal:
        27,

      paddingTop:
        5,
    },


    /*
    |--------------------------------------------------------------------------
    | Hero Title
    |--------------------------------------------------------------------------
    */

    heroTitle: {
      marginTop:
        3,

      textAlign:
        'center',

      fontSize:
        27,

      lineHeight:
        35,

      fontWeight:
        '700',
    },


    heroMaroon: {
      color:
        COLORS.maroon,
    },


    heroOrange: {
      color:
        COLORS.orange,
    },


    heroTeal: {
      color:
        COLORS.darkTeal,
    },


    /*
    |--------------------------------------------------------------------------
    | Hero Description
    |--------------------------------------------------------------------------
    */

    heroDescription: {
      marginTop:
        17,

      marginHorizontal:
        13,

      color:
        COLORS.green,

      textAlign:
        'center',

      fontSize:
        15,

      lineHeight:
        23,
    },


    /*
    |--------------------------------------------------------------------------
    | Section Heading
    |--------------------------------------------------------------------------
    */

    sectionHeading: {
      marginTop:
        56,

      marginBottom:
        24,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    sectionIcon: {
      width:
        44,

      height:
        48,

      borderRadius:
        9,

      backgroundColor:
        COLORS.maroon,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        14,
    },


    sectionTitle: {
      flex:
        1,

      color:
        COLORS.maroon,

      fontSize:
        22,

      lineHeight:
        28,

      fontFamily:
        'serif',
    },


    /*
    |--------------------------------------------------------------------------
    | Checklist
    |--------------------------------------------------------------------------
    */

    checklistItem: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      paddingHorizontal:
        4,

      marginBottom:
        25,
    },


    squareBullet: {
      width:
        10,

      height:
        10,

      marginTop:
        6,

      marginRight:
        17,

      backgroundColor:
        COLORS.maroon,
    },


    checklistContent: {
      flex:
        1,
    },


    checklistTitle: {
      color:
        COLORS.maroon,

      fontSize:
        16,

      lineHeight:
        21,

      marginBottom:
        7,
    },


    checklistDescription: {
      color:
        COLORS.darkTeal,

      fontSize:
        13,

      lineHeight:
        19,
    },


    boldText: {
      color:
        COLORS.darkTeal,

      fontWeight:
        '800',
    },


    /*
    |--------------------------------------------------------------------------
    | Important Reminder
    |--------------------------------------------------------------------------
    */

    reminderHeading: {
      marginTop:
        35,
    },


    reminderIcon: {
      width:
        44,

      height:
        44,

      borderRadius:
        11,

      marginRight:
        14,

      backgroundColor:
        COLORS.maroon,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    reminderContent: {
      paddingLeft:
        58,

      paddingRight:
        8,
    },


    reminderTitle: {
      color:
        COLORS.maroon,

      fontSize:
        16,

      lineHeight:
        22,

      marginBottom:
        13,
    },


    reminderText: {
      color:
        COLORS.darkTeal,

      fontSize:
        13,

      lineHeight:
        19,
    },


    /*
    |--------------------------------------------------------------------------
    | Registration Information
    |--------------------------------------------------------------------------
    */

    infoCard: {
      marginTop:
        36,

      paddingHorizontal:
        17,

      paddingVertical:
        16,

      backgroundColor:
        'rgba(255,255,255,0.48)',

      borderWidth:
        1,

      borderColor:
        'rgba(84,16,15,0.12)',

      borderRadius:
        14,
    },


    infoCardHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        8,

      marginBottom:
        10,
    },


    infoTitle: {
      color:
        COLORS.maroon,

      fontSize:
        16,

      fontWeight:
        '700',
    },


    infoRow: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      justifyContent:
        'space-between',

      paddingVertical:
        9,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        'rgba(35,62,71,0.18)',
    },


    infoLabel: {
      width:
        '39%',

      color:
        COLORS.darkTeal,

      fontSize:
        12,

      fontWeight:
        '600',
    },


    infoValue: {
      width:
        '59%',

      color:
        COLORS.dark,

      fontSize:
        12,

      textAlign:
        'right',
    },


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    errorBox: {
      marginTop:
        6,

      marginBottom:
        15,

      padding:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        9,

      borderRadius:
        10,

      backgroundColor:
        '#F5E5E2',
    },


    errorText: {
      flex:
        1,

      color:
        COLORS.maroon,

      fontSize:
        12,

      lineHeight:
        17,
    },


    /*
    |--------------------------------------------------------------------------
    | Start Registration Button
    |--------------------------------------------------------------------------
    */

    startButton: {
      height:
        55,

      marginTop:
        38,

      marginHorizontal:
        30,

      borderRadius:
        11,

      backgroundColor:
        COLORS.orange,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        9,

      shadowColor:
        COLORS.orange,

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.16,

      shadowRadius:
        4,

      elevation:
        2,
    },


    startButtonText: {
      color:
        COLORS.white,

      fontSize:
        15,

      fontWeight:
        '600',

      letterSpacing:
        0.2,
    },
  });