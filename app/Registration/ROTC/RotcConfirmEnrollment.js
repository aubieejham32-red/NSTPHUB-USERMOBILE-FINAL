import {
  router,

  Stack,

  useLocalSearchParams,
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

  View
} from 'react-native';



import {
  SafeAreaView,
} from 'react-native-safe-area-context';



import {
  StatusBar,
} from 'expo-status-bar';



import Ionicons from 'react-native-vector-icons/Ionicons';



import NstpRegistrationHeader from '../../../components/NstpRegistrationHeader';



import {
  getGeneralRegistration,

  getStudentUniversity,
} from '../../../services/api';





/*

|--------------------------------------------------------------------------

| NSTP HUB COLORS

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



  softGreen: '#E9EFDC',

  softMaroon: '#DED0CC',

  divider: '#9D6A67',

};





/*

|--------------------------------------------------------------------------

| ROTC Confirm Enrollment

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

| This is shown AFTER the student's ROTC enrollment has been

| successfully completed.

|

*/



export default function RotcConfirmEnrollment() {

  /*

  |--------------------------------------------------------------------------

  | Route Parameters

  |--------------------------------------------------------------------------

  |

  | ROTC-specific values can temporarily be passed from the final ROTC

  | enrollment step until the dedicated ROTC profile GET API is connected.

  |

  | Example:

  |

  | router.replace({

  |   pathname:

  |     '/Registration/ROTC/RotcConfirmEnrollment',

  |

  |   params: {

  |     nstpIdNo:

  |       'NSTP-26-04821',

  |

  |     msLevel:

  |       'MS 1',

  |   },

  | });

  |

  */



  const params =

    useLocalSearchParams();





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

  | General Registration

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

  | Refresh

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

  | Load Student Data

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

            'ROTC Confirmation Load Error:',

            requestError

          );





          setError(

            requestError instanceof Error

              ? requestError.message

              : 'Unable to load your ROTC enrollment information.'

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

  | Cadet Name

  |--------------------------------------------------------------------------

  */



  const cadetName =

    useMemo(

      () => {

        const surname =

          registration

            ?.surname

          ??

          '';





        const firstName =

          registration

            ?.first_name

          ??

          '';





        const middleName =

          registration

            ?.middle_name

          ??

          '';





        const middleInitial =

          middleName

            ? `${middleName.charAt(0).toUpperCase()}.`

            : '';





        if (

          surname &&

          firstName

        ) {

          return [

            `${surname},`,

            firstName,

            middleInitial,

          ]

            .filter(Boolean)

            .join(' ');

        }





        return (

          registration

            ?.name

          ??

          'Cadet'

        );

      },

      [

        registration,

      ]

    );





  /*

  |--------------------------------------------------------------------------

  | NSTP ID

  |--------------------------------------------------------------------------

  |

  | Primary:

  |

  | route parameter from ROTC enrollment.

  |

  | Fallback:

  |

  | registration API values if you later include them.

  |

  */



  const nstpIdNo =

    String(

      params?.nstpIdNo

      ??

      params?.nstp_id_no

      ??

      registration?.nstp_id_no

      ??

      registration?.student_id

      ??

      registration?.id_no

      ??

      '—'

    );





  /*

  |--------------------------------------------------------------------------

  | MS Level

  |--------------------------------------------------------------------------

  */



  const msLevel =

    String(

      params?.msLevel

      ??

      params?.ms_level

      ??

      registration?.ms_level

      ??

      'MS 1'

    );





  /*

  |--------------------------------------------------------------------------

  | Term

  |--------------------------------------------------------------------------

  */



  const term =

    normalizeTerm(

      registration?.term

      ??

      params?.term

      ??

      '1st SEM'

    );





  /*

  |--------------------------------------------------------------------------

  | Confirmed Status

  |--------------------------------------------------------------------------

  */



  const status =

    'Confirmed';





  /*

  |--------------------------------------------------------------------------

  | Homepage

  |--------------------------------------------------------------------------

  */



  const handleHomepage =

    () => {

      router.replace(

        '/(tabs)/HomepageScreen'

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

            Loading ROTC enrollment...

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

        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        removeClippedSubviews={false}

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

        | Shared Registration Header

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





        <View

          style={

            styles.content

          }

        >



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

          | Success Icon

          |--------------------------------------------------------------------------

          */}



          <View

            style={

              styles.successArea

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

                76

              }

              color={

                COLORS.green

              }

            />

          </View>





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

            You're officially enrolled

          </Text>





          {/*

          |--------------------------------------------------------------------------

          | Cadet Information Card

          |--------------------------------------------------------------------------

          */}



          <View

            style={

              styles.cadetCard

            }

          >



            {/*

            |--------------------------------------------------------------------------

            | Cadet Name + NSTP ID

            |--------------------------------------------------------------------------

            */}



            <View

              style={

                styles.cadetTopRow

              }

            >

              <View

                style={

                  styles.cadetNameColumn

                }

              >

                <View

                  style={

                    styles.cardLabelRow

                  }

                >

                  <Ionicons

                    name="person-outline"

                    size={

                      16

                    }

                    color={

                      COLORS.maroon

                    }

                  />





                  <Text

                    style={

                      styles.cardLabel

                    }

                  >

                    Cadet

                  </Text>

                </View>





                <Text

                  style={

                    styles.cadetName

                  }

                  numberOfLines={

                    2

                  }

                >

                  {cadetName}

                </Text>

              </View>





              <View

                style={

                  styles.nstpIdColumn

                }

              >

                <View

                  style={[

                    styles.cardLabelRow,

                    styles.rightLabelRow,

                  ]}

                >

                  <Ionicons

                    name="card-outline"

                    size={

                      16

                    }

                    color={

                      COLORS.maroon

                    }

                  />





                  <Text

                    style={[

                      styles.cardLabel,

                      styles.rightText,

                    ]}

                  >

                    NSTP ID No.

                  </Text>

                </View>





                <Text

                  style={[

                    styles.nstpId,

                    styles.rightText,

                  ]}

                  numberOfLines={

                    1

                  }

                  adjustsFontSizeToFit

                >

                  {nstpIdNo}

                </Text>

              </View>

            </View>





            {/*

            |--------------------------------------------------------------------------

            | Divider

            |--------------------------------------------------------------------------

            */}



            <View

              style={

                styles.cardDivider

              }

            />





            {/*

            |--------------------------------------------------------------------------

            | Enrollment Details

            |--------------------------------------------------------------------------

            */}



            <View

              style={

                styles.detailsRow

              }

            >

              <InfoBadge

                icon="shield-outline"

                label="MS Level"

                value={

                  msLevel

                }

              />





              <InfoBadge

                icon="calendar-outline"

                label="Term"

                value={

                  term

                }

              />





              <InfoBadge

                icon="checkmark-circle-outline"

                label="Status"

                value={

                  status

                }

                confirmed

              />

            </View>



          </View>





          {/*

          |--------------------------------------------------------------------------

          | Confirmation Message

          |--------------------------------------------------------------------------

          */}



          <View

            style={

              styles.messageArea

            }

          >

            <Ionicons

              name="ribbon-outline"

              size={

                27

              }

              color={

                COLORS.green

              }

            />





            <Text

              style={

                styles.message

              }

            >

              Thank you for completing your ROTC enrollment. Your slot

              is reserved and your training record has been created.

              {'\n'}

              From here on, use the NSTP Hub to track attendance, view

              your merits, and stay updated on formation schedules.

            </Text>

          </View>





          {/*

          |--------------------------------------------------------------------------

          | Small Confirmation Status

          |--------------------------------------------------------------------------

          */}



          <View

            style={

              styles.confirmedNotice

            }

          >

            <Ionicons

              name="shield-checkmark-outline"

              size={

                19

              }

              color={

                COLORS.green

              }

            />





            <Text

              style={

                styles.confirmedNoticeText

              }

            >

              ROTC enrollment confirmed

            </Text>

          </View>





          {/*

          |--------------------------------------------------------------------------

          | Homepage Button

          |--------------------------------------------------------------------------

          */}



          <TouchableOpacity

            style={

              styles.homeButton

            }

            onPress={

              handleHomepage

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



      </ScrollView>

    </SafeAreaView>

  );

}





/*

|--------------------------------------------------------------------------

| Information Badge

|--------------------------------------------------------------------------

*/



function InfoBadge({

  icon,

  label,

  value,

  confirmed = false,

}) {

  return (

    <View

      style={[

        styles.infoBadge,



        confirmed &&

          styles.infoBadgeConfirmed,

      ]}

    >

      <View

        style={

          styles.infoBadgeHeader

        }

      >

        <Ionicons

          name={

            icon

          }

          size={

            15

          }

          color={

            confirmed

              ? COLORS.white

              : COLORS.maroon

          }

        />





        <Text

          style={[

            styles.infoBadgeLabel,



            confirmed &&

              styles.infoBadgeLabelConfirmed,

          ]}

        >

          {label}

        </Text>

      </View>





      <Text

        style={[

          styles.infoBadgeValue,



          confirmed &&

            styles.infoBadgeValueConfirmed,

        ]}

        numberOfLines={

          1

        }

        adjustsFontSizeToFit

      >

        {value}

      </Text>

    </View>

  );

}





/*

|--------------------------------------------------------------------------

| Term Formatter

|--------------------------------------------------------------------------

*/



function normalizeTerm(

  value

) {

  const term =

    String(

      value

      ??

      ''

    )

      .trim()

      .toLowerCase();





  if (

    term.includes(

      '1st'

    )

    ||

    term.includes(

      'first'

    )

  ) {

    return '1st Sem';

  }





  if (

    term.includes(

      '2nd'

    )

    ||

    term.includes(

      'second'

    )

  ) {

    return '2nd Sem';

  }





  if (

    term.includes(

      'summer'

    )

  ) {

    return 'Summer';

  }





  return (

    value

    ??

    '—'

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

      flexGrow:

        1,



      paddingBottom:

        90,



      backgroundColor:

        COLORS.cream,

    },





    /*

    |--------------------------------------------------------------------------

    | Main Content

    |--------------------------------------------------------------------------

    */



    content: {

      paddingHorizontal:

        25,



      alignItems:

        'center',



      backgroundColor:

        COLORS.cream,

    },





    /*

    |--------------------------------------------------------------------------

    | Loading

    |--------------------------------------------------------------------------

    */



    loadingContainer: {

      flex:

        1,



      minHeight:

        450,



      alignItems:

        'center',



      justifyContent:

        'center',



      backgroundColor:

        COLORS.cream,

    },





    loadingText: {

      marginTop:

        13,



      color:

        COLORS.darkTeal,



      fontSize:

        13,

    },





    /*

    |--------------------------------------------------------------------------

    | Error

    |--------------------------------------------------------------------------

    */



    errorBox: {

      width:

        '100%',



      marginTop:

        8,



      paddingHorizontal:

        13,



      paddingVertical:

        11,



      borderRadius:

        10,



      backgroundColor:

        '#F5E5E2',



      flexDirection:

        'row',



      alignItems:

        'center',



      gap:

        8,

    },





    errorText: {

      flex:

        1,



      color:

        COLORS.maroon,



      fontSize:

        11.5,



      lineHeight:

        16,

    },





    /*

    |--------------------------------------------------------------------------

    | Success Icon

    |--------------------------------------------------------------------------

    */



    successArea: {

      width:

        90,



      height:

        90,



      marginTop:

        1,



      alignItems:

        'center',



      justifyContent:

        'center',



      position:

        'relative',

    },





    successGlow: {

      position:

        'absolute',



      width:

        61,



      height:

        61,



      borderRadius:

        31,



      backgroundColor:

        'rgba(88,118,28,0.11)',



      shadowColor:

        COLORS.green,



      shadowOffset: {

        width:

          0,



        height:

          4,

      },



      shadowOpacity:

        0.35,



      shadowRadius:

        8,



      elevation:

        6,

    },





    /*

    |--------------------------------------------------------------------------

    | Title

    |--------------------------------------------------------------------------

    */



    title: {

      marginTop:

        1,



      marginBottom:

        21,



      color:

        COLORS.maroon,



      fontSize:

        22,



      lineHeight:

        29,



      textAlign:

        'center',



      fontWeight:

        '500',

    },





    /*

    |--------------------------------------------------------------------------

    | Cadet Card

    |--------------------------------------------------------------------------

    */



    cadetCard: {

      width:

        '100%',



      paddingHorizontal:

        14,



      paddingTop:

        15,



      paddingBottom:

        15,



      borderWidth:

        2,



      borderColor:

        COLORS.maroon,



      borderRadius:

        10,



      backgroundColor:

        COLORS.cream,

    },





    /*

    |--------------------------------------------------------------------------

    | Cadet Top Row

    |--------------------------------------------------------------------------

    */



    cadetTopRow: {

      flexDirection:

        'row',



      alignItems:

        'flex-start',



      justifyContent:

        'space-between',

    },





    cadetNameColumn: {

      flex:

        1.2,



      paddingRight:

        10,

    },





    nstpIdColumn: {

      flex:

        1,



      alignItems:

        'flex-end',

    },





    cardLabelRow: {

      flexDirection:

        'row',



      alignItems:

        'center',



      gap:

        4,



      marginBottom:

        5,

    },





    rightLabelRow: {

      justifyContent:

        'flex-end',

    },





    cardLabel: {

      color:

        COLORS.maroon,



      fontSize:

        11.5,

    },





    rightText: {

      textAlign:

        'right',

    },





    cadetName: {

      color:

        COLORS.darkTeal,



      fontFamily:

        'serif',



      fontSize:

        18,



      lineHeight:

        23,

    },





    nstpId: {

      width:

        '100%',



      color:

        COLORS.darkTeal,



      fontFamily:

        'serif',



      fontSize:

        17,



      lineHeight:

        23,

    },





    /*

    |--------------------------------------------------------------------------

    | Divider

    |--------------------------------------------------------------------------

    */



    cardDivider: {

      height:

        1,



      marginTop:

        13,



      marginBottom:

        13,



      backgroundColor:

        COLORS.maroon,



      opacity:

        0.65,

    },





    /*

    |--------------------------------------------------------------------------

    | Detail Badges

    |--------------------------------------------------------------------------

    */



    detailsRow: {

      flexDirection:

        'row',



      alignItems:

        'stretch',



      gap:

        7,

    },





    infoBadge: {

      flex:

        1,



      minHeight:

        57,



      paddingHorizontal:

        8,



      paddingVertical:

        7,



      borderRadius:

        10,



      backgroundColor:

        COLORS.softMaroon,



      justifyContent:

        'center',

    },





    infoBadgeConfirmed: {

      backgroundColor:

        COLORS.green,

    },





    infoBadgeHeader: {

      flexDirection:

        'row',



      alignItems:

        'center',



      gap:

        3,

    },





    infoBadgeLabel: {

      color:

        COLORS.maroon,



      fontSize:

        9.5,

    },





    infoBadgeLabelConfirmed: {

      color:

        COLORS.white,

    },





    infoBadgeValue: {

      marginTop:

        2,



      color:

        COLORS.darkTeal,



      fontFamily:

        'serif',



      fontSize:

        17,



      lineHeight:

        20,

    },





    infoBadgeValueConfirmed: {

      color:

        COLORS.darkTeal,



      fontWeight:

        '600',

    },





    /*

    |--------------------------------------------------------------------------

    | Confirmation Message

    |--------------------------------------------------------------------------

    */



    messageArea: {

      maxWidth:

        320,



      marginTop:

        27,



      alignItems:

        'center',

    },





    message: {

      marginTop:

        8,



      color:

        COLORS.darkTeal,



      fontFamily:

        'serif',



      fontSize:

        14.5,



      lineHeight:

        20,



      textAlign:

        'center',

    },





    /*

    |--------------------------------------------------------------------------

    | Confirmed Notice

    |--------------------------------------------------------------------------

    */



    confirmedNotice: {

      marginTop:

        24,



      minHeight:

        36,



      paddingHorizontal:

        13,



      borderRadius:

        18,



      borderWidth:

        1,



      borderColor:

        COLORS.green,



      backgroundColor:

        COLORS.softGreen,



      flexDirection:

        'row',



      alignItems:

        'center',



      justifyContent:

        'center',



      gap:

        6,

    },





    confirmedNoticeText: {

      color:

        COLORS.green,



      fontSize:

        11.5,



      fontWeight:

        '600',

    },





    /*

    |--------------------------------------------------------------------------

    | Homepage Button

    |--------------------------------------------------------------------------

    */



    homeButton: {

      minWidth:

        215,



      height:

        50,



      marginTop:

        38,



      marginBottom:

        15,



      paddingHorizontal:

        16,



      borderWidth:

        2,



      borderColor:

        COLORS.darkTeal,



      borderRadius:

        12,



      backgroundColor:

        COLORS.cream,



      flexDirection:

        'row',



      alignItems:

        'center',



      justifyContent:

        'center',



      gap:

        9,



      shadowColor:

        COLORS.nearBlack,



      shadowOffset: {

        width:

          0,



        height:

          2,

      },



      shadowOpacity:

        0.09,



      shadowRadius:

        3,



      elevation:

        2,

    },





    homeButtonText: {

      color:

        COLORS.darkTeal,



      fontSize:

        13.5,



      fontWeight:

        '500',

    },

  });