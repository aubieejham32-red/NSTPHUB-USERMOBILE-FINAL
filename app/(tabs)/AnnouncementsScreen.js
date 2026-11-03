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
  getStudentAnnouncements,
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
  lineDark: '#AAA69D',
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
   ANNOUNCEMENTS SCREEN
   ========================================================================== */

export default function AnnouncementsScreen() {

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
  | Same Width As Attendance
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
    announcements,
    setAnnouncements,
  ] =
    useState(
      []
    );


  const [
    component,
    setComponent,
  ] =
    useState(
      ''
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
  | Load Announcements
  |--------------------------------------------------------------------------
  */

  const loadAnnouncements =
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


          /*
          |--------------------------------------------------------------------------
          | Laravel / MySQL
          |--------------------------------------------------------------------------
          */

          const response =
            await getStudentAnnouncements();


          setAnnouncements(
            Array.isArray(
              response
                ?.announcements
            )
              ? response.announcements
              : []
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

        } catch (
          error
        ) {
          console.warn(
            'Announcements Load Error:',
            error
          );


          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load your NSTP announcements.'
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

        loadAnnouncements(
          false
        );

      },
      [
        loadAnnouncements,
      ]
    )
  );


  /*
  |--------------------------------------------------------------------------
  | Loading
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
            name="megaphone-outline"
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
            Loading Announcements
          </Text>


          <Text
            style={
              styles.loadingDescription
            }
          >
            Getting the latest official NSTP updates.
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
              loadAnnouncements(
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

        {/*
        |--------------------------------------------------------------------------
        | Page Header
        |--------------------------------------------------------------------------
        |
        | Attendance concept:
        |
        | - flat
        | - strong title
        | - real icon
        | - simple colored rule
        | - minimal badge
        |
        */}

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
                name="megaphone-outline"
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
                Announcements
              </Text>

            </View>

          </View>


          {/*
          |--------------------------------------------------------------------------
          | Institutional Color Rule
          |--------------------------------------------------------------------------
          */}

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
            Read official NSTP notices, reminders,
            schedules, and important university updates.
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
                  YOUR COMPONENT
                </Text>


                <View
                  style={
                    styles.componentDivider
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


        {/*
        |--------------------------------------------------------------------------
        | Error
        |--------------------------------------------------------------------------
        */}

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
                  Unable to load announcements
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
                  loadAnnouncements(
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


        {/*
        |--------------------------------------------------------------------------
        | Latest Updates Heading
        |--------------------------------------------------------------------------
        */}

        <View
          style={[
            styles.sectionHeading,

            {
              width:
                contentWidth,
            },
          ]}
        >

          <View
            style={
              styles.sectionHeadingText
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Latest Updates
            </Text>


            <Text
              style={
                styles.sectionDescription
              }
            >
              Official announcements from your university
            </Text>

          </View>


          <Ionicons
            name="notifications-outline"
            size={22}
            color={
              themeColors.maroon
            }
          />

        </View>


        {/*
        |--------------------------------------------------------------------------
        | Announcement List
        |--------------------------------------------------------------------------
        */}

        {
          announcements.length >
          0
            ? announcements.map(
                (
                  announcement,
                  index
                ) => (
                  <AnnouncementItem
                    key={
                      announcement
                        ?.id
                      ??
                      index
                    }
                    item={
                      announcement
                    }
                    width={
                      contentWidth
                    }
                    index={
                      index
                    }
                  />
                )
              )
            : (
              <EmptyAnnouncements
                width={
                  contentWidth
                }
              />
            )
        }


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
   ANNOUNCEMENT ITEM
   ========================================================================== */

function AnnouncementItem({
  item,
  width,
  index,
}) {

  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  */

  const component =
    String(
      item?.component
      ??
      ''
    )
      .trim()
      .toUpperCase();


  const title =
    String(
      item?.title
      ??
      ''
    )
      .trim()
    ||
    'NSTP Announcement';


  const description =
    String(
      item?.description
      ??
      ''
    )
      .trim();


  const author =
    String(
      item?.author_label
      ??
      'NSTP Administration'
    )
      .trim();


  const date =
    item?.date_label
    ||
    formatAnnouncementDate(
      item
        ?.announcement_date
    );


  /*
  |--------------------------------------------------------------------------
  | Accent Color
  |--------------------------------------------------------------------------
  |
  | Restrained alternating accent.
  |
  */

  const accentColor =
    index %
    3 ===
    0
      ? themeColors.orange
      : index %
        3 ===
        1
          ? themeColors.green
          : themeColors.darkTeal;


  return (
    <View
      style={[
        styles.announcementItem,

        {
          width,
        },
      ]}
    >

      {/*
      |--------------------------------------------------------------------------
      | Small Accent
      |--------------------------------------------------------------------------
      */}

      <View
        style={[
          styles.announcementAccent,

          {
            backgroundColor:
              accentColor,
          },
        ]}
      />


      {/*
      |--------------------------------------------------------------------------
      | Header
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.announcementHeader
        }
      >

        <View
          style={
            styles.announcementIcon
          }
        >

          <Ionicons
            name="megaphone-outline"
            size={21}
            color={
              themeColors.darkTeal
            }
          />

        </View>


        <View
          style={
            styles.announcementHeaderText
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
                    styles.smallComponentTag
                  }
                >
                  <Text
                    style={
                      styles.smallComponentText
                    }
                  >
                    {component}
                  </Text>
                </View>
              )
            }


            {
              item
                ?.is_personal ===
              true
              &&
              (
                <View
                  style={
                    styles.personalTag
                  }
                >

                  <Ionicons
                    name="person-outline"
                    size={12}
                    color={
                      themeColors.maroon
                    }
                  />


                  <Text
                    style={
                      styles.personalTagText
                    }
                  >
                    FOR YOU
                  </Text>

                </View>
              )
            }


            {
              item
                ?.is_today ===
              true
              &&
              (
                <View
                  style={
                    styles.todayTag
                  }
                >

                  <View
                    style={
                      styles.todayDot
                    }
                  />


                  <Text
                    style={
                      styles.todayTagText
                    }
                  >
                    TODAY
                  </Text>

                </View>
              )
            }

          </View>


          <Text
            style={
              styles.announcementTitle
            }
          >
            {title}
          </Text>

        </View>

      </View>


      {/*
      |--------------------------------------------------------------------------
      | Description
      |--------------------------------------------------------------------------
      */}

      {
        Boolean(
          description
        )
        &&
        (
          <Text
            style={
              styles.announcementDescription
            }
          >
            {description}
          </Text>
        )
      }


      {/*
      |--------------------------------------------------------------------------
      | Simple Divider
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.contentDivider
        }
      />


      {/*
      |--------------------------------------------------------------------------
      | Footer
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.footerRow
        }
      >

        <View
          style={
            styles.footerItem
          }
        >

          <Ionicons
            name="calendar-clear-outline"
            size={17}
            color={
              themeColors.green
            }
          />


          <View
            style={
              styles.footerTextArea
            }
          >
            <Text
              style={
                styles.footerLabel
              }
            >
              DATE
            </Text>


            <Text
              style={
                styles.footerValue
              }
            >
              {date}
            </Text>
          </View>

        </View>


        <View
          style={
            styles.footerSeparator
          }
        />


        <View
          style={
            styles.footerItem
          }
        >

          <Ionicons
            name="person-outline"
            size={17}
            color={
              themeColors.maroon
            }
          />


          <View
            style={
              styles.footerTextArea
            }
          >

            <Text
              style={
                styles.footerLabel
              }
            >
              POSTED BY
            </Text>


            <Text
              numberOfLines={2}
              style={
                styles.footerValue
              }
            >
              {author}
            </Text>

          </View>

        </View>

      </View>

    </View>
  );
}


/* ==========================================================================
   EMPTY ANNOUNCEMENTS
   ========================================================================== */

function EmptyAnnouncements({
  width,
}) {
  return (
    <View
      style={[
        styles.emptyState,

        {
          width,
        },
      ]}
    >

      <Ionicons
        name="notifications-outline"
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
        No Announcements Yet
      </Text>


      <Text
        style={
          styles.emptyDescription
        }
      >
        Official NSTP announcements from your university
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
   FORMAT DATE
   ========================================================================== */

function formatAnnouncementDate(
  value
) {
  if (
    !value
  ) {
    return 'Date not specified';
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
    return String(
      value
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


/* ==========================================================================
   STYLES
   ========================================================================== */

const createStyles = (COLORS) =>
  StyleSheet.create({

    /* ------------------------------------------------------------------------
       Screen
       ------------------------------------------------------------------------ */

    container: {
      flex:
        1,

      backgroundColor:
        COLORS.cream,
    },


    scroll: {
      flex:
        1,

      backgroundColor:
        COLORS.cream,
    },


    scrollContent: {
      flexGrow:
        1,

      alignItems:
        'center',

      paddingTop:
        16,

      paddingHorizontal:
        16,

      paddingBottom:
        24,
    },


    /* ------------------------------------------------------------------------
       Loading
       ------------------------------------------------------------------------ */

    loadingContainer: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        30,

      backgroundColor:
        COLORS.cream,
    },


    loadingIndicator: {
      marginTop:
        18,
    },


    loadingTitle: {
      marginTop:
        15,

      color:
        COLORS.maroon,

      fontSize:
        20,

      fontWeight:
        '800',
    },


    loadingDescription: {
      marginTop:
        5,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      lineHeight:
        20,

      textAlign:
        'center',
    },


    /* ------------------------------------------------------------------------
       Page Header
       ------------------------------------------------------------------------ */

    pageHeader: {
      paddingBottom:
        15,
    },


    pageHeaderTop: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    titleIcon: {
      width:
        50,

      height:
        50,

      borderRadius:
        10,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    titleCopy: {
      flex:
        1,

      marginLeft:
        12,
    },


    eyebrow: {
      color:
        COLORS.green,

      fontSize:
        11,

      fontWeight:
        '900',

      letterSpacing:
        1.3,
    },


    pageTitle: {
      marginTop:
        2,

      color:
        COLORS.maroon,

      fontSize:
        26,

      lineHeight:
        31,

      fontWeight:
        '900',
    },


    /* ------------------------------------------------------------------------
       Header Rule
       ------------------------------------------------------------------------ */

    headerRule: {
      height:
        4,

      marginTop:
        15,

      flexDirection:
        'row',
    },


    ruleGreen: {
      flex:
        1.2,

      backgroundColor:
        COLORS.green,
    },


    ruleYellow: {
      flex:
        0.7,

      backgroundColor:
        COLORS.yellow,
    },


    ruleOrange: {
      flex:
        0.4,

      backgroundColor:
        COLORS.orange,
    },


    pageDescription: {
      marginTop:
        12,

      color:
        COLORS.darkTeal,

      fontSize:
        15,

      lineHeight:
        21,
    },


    /* ------------------------------------------------------------------------
       Header Component Tag
       ------------------------------------------------------------------------ */

    componentTag: {
      alignSelf:
        'flex-start',

      minHeight:
        34,

      marginTop:
        13,

      paddingHorizontal:
        10,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth:
        1,

      borderColor:
        COLORS.lineDark,

      borderRadius:
        7,

      backgroundColor:
        COLORS.softCream,
    },


    componentTagLabel: {
      marginLeft:
        6,

      color:
        COLORS.muted,

      fontSize:
        12,

      fontWeight:
        '800',

      letterSpacing:
        0.6,
    },


    componentDivider: {
      width:
        1,

      height:
        17,

      marginHorizontal:
        8,

      backgroundColor:
        COLORS.line,
    },


    componentTagValue: {
      color:
        COLORS.green,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        0.4,
    },


    /* ------------------------------------------------------------------------
       Error
       ------------------------------------------------------------------------ */

    errorBox: {
      marginTop:
        8,

      paddingVertical:
        11,

      paddingHorizontal:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,

      borderRadius:
        8,

      backgroundColor:
        COLORS.softMaroon,
    },


    errorCopy: {
      flex:
        1,

      marginHorizontal:
        9,
    },


    errorTitle: {
      color:
        COLORS.maroon,

      fontSize:
        14,

      fontWeight:
        '800',
    },


    errorDescription: {
      marginTop:
        2,

      color:
        COLORS.darkTeal,

      fontSize:
        12,

      lineHeight:
        17,
    },


    retryButton: {
      width:
        36,

      height:
        36,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        7,

      backgroundColor:
        COLORS.maroon,
    },


    /* ------------------------------------------------------------------------
       Section Heading
       ------------------------------------------------------------------------ */

    sectionHeading: {
      marginTop:
        25,

      marginBottom:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },


    sectionHeadingText: {
      flex:
        1,

      minWidth:
        0,

      paddingRight:
        12,
    },


    sectionTitle: {
      color:
        COLORS.maroon,

      fontSize:
        21,

      lineHeight:
        26,

      fontWeight:
        '900',
    },


    sectionDescription: {
      marginTop:
        2,

      color:
        COLORS.darkTeal,

      fontSize:
        15,

      lineHeight:
        22,
    },


    /* ------------------------------------------------------------------------
       Announcement Item
       ------------------------------------------------------------------------ */

    announcementItem: {
      position:
        'relative',

      marginBottom:
        14,

      paddingTop:
        15,

      paddingBottom:
        14,

      paddingHorizontal:
        15,

      borderWidth:
        1,

      borderColor:
        COLORS.lineDark,

      borderRadius:
        10,

      backgroundColor:
        COLORS.white,
    },


    announcementAccent: {
      position:
        'absolute',

      left:
        0,

      top:
        14,

      bottom:
        14,

      width:
        4,

      borderTopRightRadius:
        4,

      borderBottomRightRadius:
        4,
    },


    /* ------------------------------------------------------------------------
       Announcement Header
       ------------------------------------------------------------------------ */

    announcementHeader: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      paddingLeft:
        4,
    },


    announcementIcon: {
      width:
        42,

      height:
        42,

      flexShrink:
        0,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        8,

      backgroundColor:
        COLORS.softCream,
    },


    announcementHeaderText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        11,
    },


    /* ------------------------------------------------------------------------
       Tags
       ------------------------------------------------------------------------ */

    tagRow: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',

      gap:
        5,

      marginBottom:
        6,
    },


    smallComponentTag: {
      minHeight:
        23,

      paddingHorizontal:
        8,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        5,

      backgroundColor:
        COLORS.green,
    },


    smallComponentText: {
      color:
        COLORS.white,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        0.4,
    },


    personalTag: {
      minHeight:
        23,

      paddingHorizontal:
        7,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderRadius:
        5,

      backgroundColor:
        COLORS.softYellow,

      borderWidth:
        1,

      borderColor:
        COLORS.yellow,
    },


    personalTagText: {
      marginLeft:
        3,

      color:
        COLORS.maroon,

      fontSize:
        12,

      fontWeight:
        '900',
    },


    todayTag: {
      minHeight:
        23,

      paddingHorizontal:
        7,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderRadius:
        5,

      backgroundColor:
        COLORS.softMaroon,

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,
    },


    todayDot: {
      width:
        6,

      height:
        6,

      marginRight:
        4,

      borderRadius:
        3,

      backgroundColor:
        COLORS.maroon,
    },


    todayTagText: {
      color:
        COLORS.maroon,

      fontSize:
        12,

      fontWeight:
        '900',
    },


    /* ------------------------------------------------------------------------
       Announcement Text
       ------------------------------------------------------------------------ */

    announcementTitle: {
      color:
        COLORS.maroon,

      fontSize:
        17,

      lineHeight:
        22,

      fontWeight:
        '900',
    },


    announcementDescription: {
      marginTop:
        13,

      paddingLeft:
        4,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      lineHeight:
        24,

      fontWeight:
        '500',
    },


    contentDivider: {
      height:
        1,

      marginTop:
        14,

      marginBottom:
        12,

      marginLeft:
        4,

      backgroundColor:
        COLORS.line,
    },


    /* ------------------------------------------------------------------------
       Footer
       ------------------------------------------------------------------------ */

    footerRow: {
      paddingLeft:
        4,

      flexDirection:
        'row',

      alignItems:
        'stretch',
    },


    footerItem: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    footerTextArea: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        7,
    },


    footerLabel: {
      color:
        COLORS.muted,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        0.8,
    },


    footerValue: {
      marginTop:
        2,

      color:
        COLORS.dark,

      fontSize:
        11,

      lineHeight:
        15,

      fontWeight:
        '700',
    },


    footerSeparator: {
      width:
        1,

      marginHorizontal:
        10,

      backgroundColor:
        COLORS.line,
    },


    /* ------------------------------------------------------------------------
       Empty
       ------------------------------------------------------------------------ */

    emptyState: {
      minHeight:
        210,

      paddingHorizontal:
        28,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        COLORS.lineDark,

      borderRadius:
        10,

      backgroundColor:
        COLORS.white,
    },


    emptyTitle: {
      marginTop:
        12,

      color:
        COLORS.maroon,

      fontSize:
        18,

      fontWeight:
        '900',
    },


    emptyDescription: {
      maxWidth:
        280,

      marginTop:
        5,

      color:
        COLORS.darkTeal,

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        'center',
    },


    emptyRefreshRow: {
      marginTop:
        13,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    emptyRefreshText: {
      marginLeft:
        5,

      color:
        COLORS.maroon,

      fontSize:
        10,

      fontWeight:
        '800',
    },


    /* ------------------------------------------------------------------------
       Bottom Navigation Clearance
       ------------------------------------------------------------------------ */

    bottomSpace: {
      height:
        110,
    },

  });