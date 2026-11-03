import {
  Ionicons,
} from '@expo/vector-icons';

import {
  Stack,
  useFocusEffect,
} from 'expo-router';

import {
  useCallback,
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
  useWindowDimensions,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  StatusBar,
} from 'expo-status-bar';

import {
  getStudentSchedules,
} from '../../services/api';



import {
  useAppTheme,
} from '../../contexts/ThemeContext';

/* ==========================================================================
   NSTP HUB COLORS
   ========================================================================== */

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

  softCream: '#F7F4ED',
  softGreen: '#EFF3E8',
  softYellow: '#FFF6DD',
  softOrange: '#FFF1D8',
  softMaroon: '#F8EEEE',
  softTeal: '#EDF2F3',

  line: '#D7D2C8',
  lineDark: '#AFAAA1',
  muted: '#647176',
};

const DARK_COLORS = {
  ...COLORS,

  // Accessible NSTP HUB dark mode.
  // Only the requested dark-mode palette is used:
  // #58761C, #EFEBE2, #000D12, #233E47, #D99202
  cream: '#000D12',
  dark: '#000D12',
  nearBlack: '#000D12',

  // Elevated cards, sheets, inputs and panels.
  white: '#233E47',
  paper: '#233E47',

  // Existing styles use darkTeal for body copy, so make it the
  // high-contrast cream text color in dark mode.
  darkTeal: '#EFEBE2',

  // Existing maroon/green/yellow references are often headings/icons.
  // Orange provides much stronger contrast on dark teal than green.
  maroon: '#D99202',
  green: '#D99202',
  yellow: '#D99202',
  orange: '#D99202',

  // Readable supporting copy. Borders retain the NSTP green identity.
  gray: '#EFEBE2',
  muted: '#EFEBE2',
  softText: '#EFEBE2',
  placeholder: '#EFEBE2',
  line: '#58761C',
  lineDark: '#EFEBE2',
  softLine: '#58761C',
  border: '#EFEBE2',
  modalBorder: '#EFEBE2',

  // Pastel/light surfaces become dark-teal surfaces.
  softCream: '#233E47',
  softGreen: '#233E47',
  softYellow: '#233E47',
  softOrange: '#233E47',
  softMaroon: '#233E47',
  softTeal: '#233E47',

  // Signature-specific semantic colors.
  signaturePaper: '#EFEBE2',
  signatureInk: '#000D12',
  signatureMuted: '#233E47',
};

// Shared render-time theme references used by helper components in this file.
let themeColors = COLORS;
let styles;




/* ==========================================================================
   SCHEDULE SCREEN
   ========================================================================== */

export default function ScheduleScreen() {

  const {
    isDarkMode,
  } = useAppTheme();

  themeColors =
    isDarkMode
      ? DARK_COLORS
      : COLORS;


  styles =
    createStyles(
      themeColors
    );


  const {
    width,
  } =
    useWindowDimensions();


  /*
  |--------------------------------------------------------------------------
  | Same Responsive Width As Attendance
  |--------------------------------------------------------------------------
  */

  const contentWidth =
    Math.min(
      width - 32,
      430
    );


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    schedules,
    setSchedules,
  ] =
    useState(
      []
    );


  const [
    scheduleTitle,
    setScheduleTitle,
  ] =
    useState(
      'NSTP SCHEDULE'
    );


  const [
    component,
    setComponent,
  ] =
    useState(
      ''
    );


  const [
    totalCount,
    setTotalCount,
  ] =
    useState(
      0
    );


  const [
    upcomingCount,
    setUpcomingCount,
  ] =
    useState(
      0
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState(
      ''
    );


  /*
  |--------------------------------------------------------------------------
  | Load Schedule From Laravel / MySQL
  |--------------------------------------------------------------------------
  */

  const loadSchedule =
    useCallback(
      async (
        refreshOnly = false
      ) => {

        try {
          if (
            refreshOnly
          ) {
            setRefreshing(
              true
            );

          } else {
            setLoading(
              true
            );
          }


          setErrorMessage(
            ''
          );


          const response =
            await getStudentSchedules();


          const responseSchedules =
            Array.isArray(
              response?.schedules
            )
              ? response.schedules
              : [];


          setSchedules(
            responseSchedules
          );


          setScheduleTitle(
            String(
              response
                ?.schedule_title
              ??
              'NSTP SCHEDULE'
            )
              .trim()
              .toUpperCase()
          );


          setComponent(
            String(
              response
                ?.component
              ??
              ''
            )
              .trim()
              .toUpperCase()
          );


          setTotalCount(
            Number(
              response?.total
              ??
              responseSchedules.length
            )
          );


          setUpcomingCount(
            Number(
              response
                ?.upcoming_count
              ??
              responseSchedules
                .filter(
                  item =>
                    item
                      ?.is_upcoming ===
                    true
                )
                .length
            )
          );

        } catch (
          error
        ) {
          console.warn(
            'Schedule Load Error:',
            error
          );


          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load your NSTP schedule.'
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
  | Reload When Tab Opens
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(
      () => {

        loadSchedule(
          false
        );

      },
      [
        loadSchedule,
      ]
    )
  );


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
          styles.container
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
          style="dark"
          backgroundColor={
            themeColors.cream
          }
        />


        <View
          style={
            styles.loadingContainer
          }
        >

          <Ionicons
            name="calendar-clear-outline"
            size={37}
            color={
              themeColors.darkTeal
            }
          />


          <ActivityIndicator
            size="large"
            color={
              themeColors.green
            }
            style={
              styles.loadingIndicator
            }
          />


          <Text
            style={
              styles.loadingTitle
            }
          >
            Loading Schedule
          </Text>


          <Text
            style={
              styles.loadingDescription
            }
          >
            Getting your latest NSTP activities.
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
        styles.container
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
        style="dark"
        backgroundColor={
          themeColors.cream
        }
      />


      <ScrollView
        style={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadSchedule(
                true
              )
            }
            colors={[
              themeColors.green,
            ]}
            tintColor={
              themeColors.green
            }
            progressBackgroundColor={
              themeColors.white
            }
          />
        }
      >

        {/* ================================================================
            PAGE HEADER
        ================================================================= */}

        <View
          style={[
            styles.pageHeader,

            {
              width:
                contentWidth,
            },
          ]}
        >

          <View
            style={
              styles.pageHeaderTop
            }
          >

            <View
              style={
                styles.titleIcon
              }
            >
              <Ionicons
                name="calendar-clear-outline"
                size={25}
                color={
                  themeColors.white
                }
              />
            </View>


            <View
              style={
                styles.titleCopy
              }
            >

              <Text
                style={
                  styles.eyebrow
                }
              >
                NSTP HUB
              </Text>


              <Text
                style={
                  styles.pageTitle
                }
              >
                {scheduleTitle}
              </Text>

            </View>

          </View>


          {/* Institutional color rule */}

          <View
            style={
              styles.headerRule
            }
          >

            <View
              style={
                styles.ruleGreen
              }
            />


            <View
              style={
                styles.ruleYellow
              }
            />


            <View
              style={
                styles.ruleOrange
              }
            />

          </View>


          <Text
            style={
              styles.pageDescription
            }
          >
            View your official NSTP activities,
            schedule dates, times, and venues.
          </Text>


          {
            Boolean(
              component
            )
            &&
            (
              <View
                style={
                  styles.componentTag
                }
              >

                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={
                    themeColors.green
                  }
                />


                <Text
                  style={
                    styles.componentTagLabel
                  }
                >
                  COMPONENT
                </Text>


                <View
                  style={
                    styles.componentTagDivider
                  }
                />


                <Text
                  style={
                    styles.componentTagValue
                  }
                >
                  {component}
                </Text>

              </View>
            )
          }

        </View>


        {/* ================================================================
            ERROR
        ================================================================= */}

        {
          Boolean(
            errorMessage
          )
          &&
          (
            <View
              style={[
                styles.errorBox,

                {
                  width:
                    contentWidth,
                },
              ]}
            >

              <Ionicons
                name="alert-circle-outline"
                size={23}
                color={
                  themeColors.maroon
                }
              />


              <View
                style={
                  styles.errorCopy
                }
              >

                <Text
                  style={
                    styles.errorTitle
                  }
                >
                  Unable to load schedule
                </Text>


                <Text
                  style={
                    styles.errorDescription
                  }
                >
                  {errorMessage}
                </Text>

              </View>


              <TouchableOpacity
                style={
                  styles.retryButton
                }
                activeOpacity={0.8}
                onPress={() =>
                  loadSchedule(
                    false
                  )
                }
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={
                    themeColors.white
                  }
                />
              </TouchableOpacity>

            </View>
          )
        }


        {/* ================================================================
            SCHEDULE SUMMARY
        ================================================================= */}

        <View
          style={[
            styles.sectionBlock,

            {
              width:
                contentWidth,
            },
          ]}
        >

          <View
            style={
              styles.sectionHeading
            }
          >

            <View
              style={
                styles.sectionHeadingCopy
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Schedule Summary
              </Text>


              <Text
                style={
                  styles.sectionDescription
                }
              >
                Quick view of your NSTP activities
              </Text>

            </View>


            <Ionicons
              name="stats-chart-outline"
              size={22}
              color={
                themeColors.darkTeal
              }
            />

          </View>


          <View
            style={
              styles.summaryStrip
            }
          >

            <View
              style={
                styles.summaryItem
              }
            >

              <Ionicons
                name="calendar-outline"
                size={24}
                color={
                  themeColors.green
                }
              />


              <Text
                style={
                  styles.summaryValue
                }
              >
                {totalCount}
              </Text>


              <Text
                style={
                  styles.summaryLabel
                }
              >
                Total Activities
              </Text>

            </View>


            <View
              style={
                styles.summaryDivider
              }
            />


            <View
              style={
                styles.summaryItem
              }
            >

              <Ionicons
                name="time-outline"
                size={24}
                color={
                  themeColors.orange
                }
              />


              <Text
                style={
                  styles.summaryValue
                }
              >
                {upcomingCount}
              </Text>


              <Text
                style={
                  styles.summaryLabel
                }
              >
                Upcoming
              </Text>

            </View>

          </View>

        </View>


        {/* ================================================================
            ACTIVITIES HEADING
        ================================================================= */}

        <View
          style={[
            styles.sectionBlock,

            {
              width:
                contentWidth,
            },
          ]}
        >

          <View
            style={
              styles.sectionHeading
            }
          >

            <View
              style={
                styles.sectionHeadingCopy
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Activities
              </Text>


              <Text
                style={
                  styles.sectionDescription
                }
              >
                Your official NSTP schedule
              </Text>

            </View>


            <Ionicons
              name="list-outline"
              size={22}
              color={
                themeColors.maroon
              }
            />

          </View>


          {
            schedules.length >
            0
              ? schedules.map(
                  (
                    item,
                    index
                  ) => (
                    <ScheduleItem
                      key={
                        item?.id
                        ??
                        index
                      }
                      item={
                        item
                      }
                      index={
                        index
                      }
                    />
                  )
                )
              : (
                <EmptySchedule />
              )
          }

        </View>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
}


/* ==========================================================================
   SCHEDULE ITEM
   ========================================================================== */

function ScheduleItem({
  item,
  index,
}) {

  /*
  |--------------------------------------------------------------------------
  | Date
  |--------------------------------------------------------------------------
  */

  const fullDate =
    item?.date_label
    ||
    formatDate(
      item?.schedule_date
    );


  const day =
    item?.day_label
    ||
    formatDay(
      item?.schedule_date
    );


  const month =
    getMonth(
      item?.schedule_date
    );


  const dayNumber =
    getDayNumber(
      item?.schedule_date
    );


  /*
  |--------------------------------------------------------------------------
  | Details
  |--------------------------------------------------------------------------
  */

  const title =
    String(
      item?.title
      ??
      ''
    )
      .trim()
    ||
    'NSTP Activity';


  const time =
    String(
      item?.time_label
      ??
      ''
    )
      .trim()
    ||
    'Time TBA';


  const location =
    String(
      item?.location
      ??
      ''
    )
      .trim()
    ||
    'Location TBA';


  const component =
    String(
      item?.component
      ??
      ''
    )
      .trim()
      .toUpperCase();


  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  let statusText =
    'UPCOMING';


  let statusIcon =
    'time-outline';


  let statusBackground =
    themeColors.softYellow;


  let statusBorder =
    themeColors.orange;


  let statusColor =
    COLORS.orange;


  if (
    item?.is_today
  ) {
    statusText =
      'TODAY';


    statusIcon =
      'radio-button-on-outline';


    statusBackground =
      themeColors.maroon;


    statusBorder =
      themeColors.maroon;


    statusColor =
      themeColors.white;

  } else if (
    item?.is_past
  ) {
    statusText =
      'COMPLETED';


    statusIcon =
      'checkmark-circle-outline';


    statusBackground =
      themeColors.softGreen;


    statusBorder =
      themeColors.green;


    statusColor =
      themeColors.green;
  }


  /*
  |--------------------------------------------------------------------------
  | Accent
  |--------------------------------------------------------------------------
  */

  const accentColor =
    item?.is_today
      ? themeColors.maroon
      : item?.is_past
        ? themeColors.green
        : index %
          2 ===
          0
            ? themeColors.orange
            : themeColors.darkTeal;


  return (
    <View
      style={
        styles.scheduleItem
      }
    >

      {/* Accent */}

      <View
        style={[
          styles.scheduleAccent,

          {
            backgroundColor:
              accentColor,
          },
        ]}
      />


      {/* Top content */}

      <View
        style={
          styles.scheduleTopRow
        }
      >

        {/* Date tile */}

        <View
          style={
            styles.dateTile
          }
        >

          <View
            style={
              styles.dateMonth
            }
          >
            <Text
              style={
                styles.dateMonthText
              }
            >
              {month}
            </Text>
          </View>


          <Text
            style={
              styles.dateNumber
            }
          >
            {dayNumber}
          </Text>


          <Text
            style={
              styles.dateDay
            }
          >
            {day}
          </Text>

        </View>


        {/* Main information */}

        <View
          style={
            styles.scheduleContent
          }
        >

          <View
            style={
              styles.tagRow
            }
          >

            {
              Boolean(
                component
              )
              &&
              (
                <View
                  style={
                    styles.scheduleComponentTag
                  }
                >
                  <Text
                    style={
                      styles.scheduleComponentText
                    }
                  >
                    {component}
                  </Text>
                </View>
              )
            }


            <View
              style={[
                styles.statusTag,

                {
                  backgroundColor:
                    statusBackground,

                  borderColor:
                    statusBorder,
                },
              ]}
            >

              <Ionicons
                name={
                  statusIcon
                }
                size={12}
                color={
                  statusColor
                }
              />


              <Text
                style={[
                  styles.statusText,

                  {
                    color:
                      statusColor,
                  },
                ]}
              >
                {statusText}
              </Text>

            </View>

          </View>


          <Text
            style={
              styles.scheduleTitle
            }
          >
            {title}
          </Text>


          <View
            style={
              styles.fullDateRow
            }
          >

            <Ionicons
              name="calendar-clear-outline"
              size={15}
              color={
                themeColors.green
              }
            />


            <Text
              style={
                styles.fullDateText
              }
            >
              {fullDate}
            </Text>

          </View>

        </View>

      </View>


      {/* Divider */}

      <View
        style={
          styles.scheduleDivider
        }
      />


      {/* Time */}

      <View
        style={
          styles.detailRow
        }
      >

        <Ionicons
          name="time-outline"
          size={20}
          color={
            themeColors.maroon
          }
        />


        <View
          style={
            styles.detailCopy
          }
        >

          <Text
            style={
              styles.detailLabel
            }
          >
            TIME
          </Text>


          <Text
            style={
              styles.detailValue
            }
          >
            {time}
          </Text>

        </View>

      </View>


      {/* Location */}

      <View
        style={
          styles.detailRow
        }
      >

        <Ionicons
          name="location-outline"
          size={20}
          color={
            themeColors.green
          }
        />


        <View
          style={
            styles.detailCopy
          }
        >

          <Text
            style={
              styles.detailLabel
            }
          >
            LOCATION
          </Text>


          <Text
            style={
              styles.detailValue
            }
          >
            {location}
          </Text>

        </View>

      </View>

    </View>
  );
}


/* ==========================================================================
   EMPTY SCHEDULE
   ========================================================================== */

function EmptySchedule() {
  return (
    <View
      style={
        styles.emptyState
      }
    >

      <Ionicons
        name="calendar-outline"
        size={38}
        color={
          themeColors.green
        }
      />


      <Text
        style={
          styles.emptyTitle
        }
      >
        No Schedule Yet
      </Text>


      <Text
        style={
          styles.emptyDescription
        }
      >
        NSTP activities created by your university
        will appear here.
      </Text>


      <View
        style={
          styles.emptyRefreshRow
        }
      >

        <Ionicons
          name="arrow-down-outline"
          size={15}
          color={
            themeColors.maroon
          }
        />


        <Text
          style={
            styles.emptyRefreshText
          }
        >
          Pull down to refresh
        </Text>

      </View>

    </View>
  );
}


/* ==========================================================================
   DATE HELPERS
   ========================================================================== */

function createLocalDate(
  value
) {
  if (
    !value
  ) {
    return null;
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;
}


function formatDate(
  value
) {
  const date =
    createLocalDate(
      value
    );


  if (
    !date
  ) {
    return (
      value
      ||
      'Date TBA'
    );
  }


  return date.toLocaleDateString(
    'en-US',
    {
      month:
        'long',

      day:
        '2-digit',

      year:
        'numeric',
    }
  );
}


function formatDay(
  value
) {
  const date =
    createLocalDate(
      value
    );


  if (
    !date
  ) {
    return '--';
  }


  return date.toLocaleDateString(
    'en-US',
    {
      weekday:
        'short',
    }
  );
}


function getMonth(
  value
) {
  const date =
    createLocalDate(
      value
    );


  if (
    !date
  ) {
    return '---';
  }


  return date
    .toLocaleDateString(
      'en-US',
      {
        month:
          'short',
      }
    )
    .toUpperCase();
}


function getDayNumber(
  value
) {
  const date =
    createLocalDate(
      value
    );


  if (
    !date
  ) {
    return '--';
  }


  return String(
    date.getDate()
  )
    .padStart(
      2,
      '0'
    );
}


/* ==========================================================================
   STYLES
   ========================================================================== */

const createStyles = (COLORS) =>
  StyleSheet.create({

    /* ------------------------------------------------------------------------
       Screen
       ------------------------------------------------------------------------ */

    container: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    scroll: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    scrollContent: {
      flexGrow: 1,

      alignItems:
        'center',

      paddingTop: 16,

      paddingHorizontal: 16,

      paddingBottom: 24,
    },


    /* ------------------------------------------------------------------------
       Loading
       ------------------------------------------------------------------------ */

    loadingContainer: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 30,

      backgroundColor:
        COLORS.cream,
    },


    loadingIndicator: {
      marginTop: 18,
    },


    loadingTitle: {
      marginTop: 15,

      color:
        COLORS.maroon,

      fontSize: 20,

      fontWeight:
        '800',
    },


    loadingDescription: {
      marginTop: 5,

      color:
        COLORS.darkTeal,

      fontSize: 14,

      lineHeight: 20,

      textAlign:
        'center',
    },


    /* ------------------------------------------------------------------------
       Header
       ------------------------------------------------------------------------ */

    pageHeader: {
      paddingBottom: 15,
    },


    pageHeaderTop: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    titleIcon: {
      width: 50,

      height: 50,

      borderRadius: 10,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    titleCopy: {
      flex: 1,

      minWidth: 0,

      marginLeft: 12,
    },


    eyebrow: {
      color:
        COLORS.green,

      fontSize: 11,

      fontWeight:
        '900',

      letterSpacing: 1.3,
    },


    pageTitle: {
      marginTop: 2,

      color:
        COLORS.maroon,

      fontSize: 25,

      lineHeight: 30,

      fontWeight:
        '900',
    },


    headerRule: {
      height: 4,

      marginTop: 15,

      flexDirection:
        'row',
    },


    ruleGreen: {
      flex: 1.2,

      backgroundColor:
        COLORS.green,
    },


    ruleYellow: {
      flex: 0.7,

      backgroundColor:
        COLORS.yellow,
    },


    ruleOrange: {
      flex: 0.4,

      backgroundColor:
        COLORS.orange,
    },


    pageDescription: {
      marginTop: 12,

      color:
        COLORS.darkTeal,

      fontSize: 15,

      lineHeight: 21,
    },


    componentTag: {
      alignSelf:
        'flex-start',

      minHeight: 34,

      marginTop: 13,

      paddingHorizontal: 10,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 7,

      backgroundColor:
        COLORS.softCream,
    },


    componentTagLabel: {
      marginLeft: 6,

      color:
        COLORS.muted,

      fontSize: 9,

      fontWeight:
        '800',

      letterSpacing: 0.6,
    },


    componentTagDivider: {
      width: 1,

      height: 17,

      marginHorizontal: 8,

      backgroundColor:
        COLORS.line,
    },


    componentTagValue: {
      color:
        COLORS.green,

      fontSize: 12,

      fontWeight:
        '900',

      letterSpacing: 0.4,
    },


    /* ------------------------------------------------------------------------
       Error
       ------------------------------------------------------------------------ */

    errorBox: {
      marginTop: 8,

      paddingVertical: 11,

      paddingHorizontal: 12,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth: 1,

      borderColor:
        COLORS.maroon,

      borderRadius: 8,

      backgroundColor:
        COLORS.softMaroon,
    },


    errorCopy: {
      flex: 1,

      marginHorizontal: 9,
    },


    errorTitle: {
      color:
        COLORS.maroon,

      fontSize: 14,

      fontWeight:
        '800',
    },


    errorDescription: {
      marginTop: 2,

      color:
        COLORS.darkTeal,

      fontSize: 12,

      lineHeight: 17,
    },


    retryButton: {
      width: 36,

      height: 36,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 7,

      backgroundColor:
        COLORS.maroon,
    },


    /* ------------------------------------------------------------------------
       Sections
       ------------------------------------------------------------------------ */

    sectionBlock: {
      marginTop: 25,
    },


    sectionHeading: {
      marginBottom: 12,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },


    sectionHeadingCopy: {
      flex: 1,

      minWidth: 0,

      paddingRight: 12,
    },


    sectionTitle: {
      color:
        COLORS.maroon,

      fontSize: 21,

      lineHeight: 26,

      fontWeight:
        '900',
    },


    sectionDescription: {
      marginTop: 2,

      color:
        COLORS.darkTeal,

      fontSize: 13,

      lineHeight: 18,
    },


    /* ------------------------------------------------------------------------
       Summary Strip
       ------------------------------------------------------------------------ */

    summaryStrip: {
      minHeight: 108,

      flexDirection:
        'row',

      alignItems:
        'stretch',

      overflow:
        'hidden',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 10,

      backgroundColor:
        COLORS.white,
    },


    summaryItem: {
      flex: 1,

      paddingVertical: 15,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    summaryDivider: {
      width: 1,

      backgroundColor:
        COLORS.line,
    },


    summaryValue: {
      marginTop: 5,

      color:
        COLORS.dark,

      fontSize: 24,

      lineHeight: 28,

      fontWeight:
        '900',
    },


    summaryLabel: {
      marginTop: 2,

      color:
        COLORS.muted,

      fontSize: 12,

      lineHeight: 16,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    /* ------------------------------------------------------------------------
       Schedule Item
       ------------------------------------------------------------------------ */

    scheduleItem: {
      position:
        'relative',

      overflow:
        'hidden',

      marginBottom: 13,

      paddingTop: 15,

      paddingBottom: 13,

      paddingHorizontal: 15,

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 10,

      backgroundColor:
        COLORS.white,
    },


    scheduleAccent: {
      position:
        'absolute',

      left: 0,

      top: 14,

      bottom: 14,

      width: 4,

      borderTopRightRadius: 4,

      borderBottomRightRadius: 4,
    },


    /* ------------------------------------------------------------------------
       Schedule Top
       ------------------------------------------------------------------------ */

    scheduleTopRow: {
      paddingLeft: 4,

      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },


    /* ------------------------------------------------------------------------
       Date Tile
       ------------------------------------------------------------------------ */

    dateTile: {
      width: 68,

      minHeight: 90,

      overflow:
        'hidden',

      alignItems:
        'center',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 8,

      backgroundColor:
        COLORS.softCream,
    },


    dateMonth: {
      width:
        '100%',

      minHeight: 25,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.maroon,
    },


    dateMonthText: {
      color:
        COLORS.white,

      fontSize: 10,

      fontWeight:
        '900',

      letterSpacing: 0.8,
    },


    dateNumber: {
      marginTop: 7,

      color:
        COLORS.darkTeal,

      fontSize: 25,

      lineHeight: 28,

      fontWeight:
        '900',
    },


    dateDay: {
      marginTop: 1,

      marginBottom: 6,

      color:
        COLORS.green,

      fontSize: 10,

      fontWeight:
        '800',

      textTransform:
        'uppercase',
    },


    /* ------------------------------------------------------------------------
       Schedule Main Content
       ------------------------------------------------------------------------ */

    scheduleContent: {
      flex: 1,

      minWidth: 0,

      marginLeft: 12,
    },


    tagRow: {
      marginBottom: 7,

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',

      gap: 5,
    },


    scheduleComponentTag: {
      minHeight: 23,

      paddingHorizontal: 7,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 5,

      backgroundColor:
        COLORS.green,
    },


    scheduleComponentText: {
      color:
        COLORS.white,

      fontSize: 9,

      fontWeight:
        '900',

      letterSpacing: 0.4,
    },


    statusTag: {
      minHeight: 23,

      paddingHorizontal: 7,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth: 1,

      borderRadius: 5,
    },


    statusText: {
      marginLeft: 4,

      fontSize: 8,

      fontWeight:
        '900',

      letterSpacing: 0.35,
    },


    scheduleTitle: {
      color:
        COLORS.maroon,

      fontSize: 17,

      lineHeight: 22,

      fontWeight:
        '900',
    },


    fullDateRow: {
      marginTop: 7,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    fullDateText: {
      flex: 1,

      marginLeft: 5,

      color:
        COLORS.green,

      fontSize: 12,

      lineHeight: 17,

      fontWeight:
        '700',
    },


    /* ------------------------------------------------------------------------
       Divider
       ------------------------------------------------------------------------ */

    scheduleDivider: {
      height: 1,

      marginTop: 14,

      marginBottom: 5,

      marginLeft: 4,

      backgroundColor:
        COLORS.line,
    },


    /* ------------------------------------------------------------------------
       Detail Rows
       ------------------------------------------------------------------------ */

    detailRow: {
      minHeight: 51,

      paddingLeft: 4,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    detailCopy: {
      flex: 1,

      minWidth: 0,

      marginLeft: 10,
    },


    detailLabel: {
      color:
        COLORS.muted,

      fontSize: 9,

      fontWeight:
        '900',

      letterSpacing: 0.9,
    },


    detailValue: {
      marginTop: 2,

      color:
        COLORS.dark,

      fontSize: 14,

      lineHeight: 19,

      fontWeight:
        '700',
    },


    /* ------------------------------------------------------------------------
       Empty State
       ------------------------------------------------------------------------ */

    emptyState: {
      minHeight: 210,

      paddingHorizontal: 28,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 10,

      backgroundColor:
        COLORS.white,
    },


    emptyTitle: {
      marginTop: 12,

      color:
        COLORS.maroon,

      fontSize: 18,

      fontWeight:
        '900',
    },


    emptyDescription: {
      maxWidth: 285,

      marginTop: 5,

      color:
        COLORS.darkTeal,

      fontSize: 13,

      lineHeight: 19,

      textAlign:
        'center',
    },


    emptyRefreshRow: {
      marginTop: 13,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    emptyRefreshText: {
      marginLeft: 5,

      color:
        COLORS.maroon,

      fontSize: 10,

      fontWeight:
        '800',
    },


    /* ------------------------------------------------------------------------
       Bottom Navigation Clearance
       ------------------------------------------------------------------------ */

    bottomSpace: {
      height: 110,
    },

  });