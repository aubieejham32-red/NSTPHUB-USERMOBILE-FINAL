import { Ionicons } from '@expo/vector-icons';
import {
  Stack,
  router,
  useFocusEffect,
} from 'expo-router';

import * as SecureStore from 'expo-secure-store';

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  StatusBar,
} from 'expo-status-bar';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  SERVER_URL,
} from '../../config/api';

import {
  getHomepage,
  getStudentProfile,
} from '../../services/api';

import { getUniversityLogoUri } from '../../utils/universityLogo';



import {
  useAppTheme,
} from '../../contexts/ThemeContext';

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

  // Semantic text aliases. These preserve the existing light-mode colors.
  readableText: '#233E47',
  valueText: '#0D171B',
  actionText: '#58761C',
  metaText: '#58761C',
  programText: '#58761C',
  actionIcon: '#58761C',
};

const DARK_COLORS = {
  ...COLORS,

  // ================================================================
  // ACCESSIBLE DARK MODE - requested palette only
  // #58761C  green
  // #EFEBE2  cream
  // #000D12  near black
  // #233E47  dark teal
  // #D99202  orange
  // ================================================================

  // Backgrounds / surfaces
  cream: '#000D12',
  nearBlack: '#000D12',
  white: '#233E47',
  paper: '#233E47',

  // IMPORTANT: several student values use COLORS.dark.
  // In dark mode this must be light, otherwise the text is nearly black
  // on the #233E47 profile card.
  dark: '#EFEBE2',

  // Main readable text on dark surfaces
  darkTeal: '#EFEBE2',
  readableText: '#EFEBE2',
  valueText: '#EFEBE2',

  // Brand accents
  maroon: '#D99202',
  green: '#58761C',
  yellow: '#D99202',
  orange: '#D99202',

  // Small/action text MUST be cream on #233E47 for readability.
  actionText: '#EFEBE2',
  metaText: '#EFEBE2',
  programText: '#D99202',
  actionIcon: '#D99202',

  // Dividers / secondary information
  gray: '#EFEBE2',
  muted: '#EFEBE2',
  softText: '#EFEBE2',
  placeholder: '#EFEBE2',
  line: '#EFEBE2',
  lineDark: '#EFEBE2',
  softLine: '#EFEBE2',
  border: '#EFEBE2',
  modalBorder: '#EFEBE2',

  // Soft panels stay dark instead of becoming bright blocks.
  softCream: '#233E47',
  softGreen: '#233E47',
  softYellow: '#233E47',
  softOrange: '#233E47',
  softMaroon: '#233E47',
  softTeal: '#233E47',
};

// Shared render-time theme references used by helper components in this file.
let themeColors = COLORS;
let styles;




/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
*/

const ACADEMIC_YEAR_STORAGE_PREFIX =
  'nstp_hub_home_academic_year_';


/*
|--------------------------------------------------------------------------
| HOMEPAGE
|--------------------------------------------------------------------------
*/

export default function HomepageScreen() {

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


  const screenWidth =
    Math.min(
      width,
      500
    );


  const horizontalPadding =
    screenWidth <= 360
      ? 14
      : 18;


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [
    homepage,
    setHomepage,
  ] =
    useState(
      null
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


  const [
    universityLogoFailed,
    setUniversityLogoFailed,
  ] =
    useState(
      false
    );


  const [
    profilePhotoFailed,
    setProfilePhotoFailed,
  ] =
    useState(
      false
    );


  const [
    selectedAcademicYear,
    setSelectedAcademicYear,
  ] =
    useState(
      ''
    );


  const [
    academicYearModalVisible,
    setAcademicYearModalVisible,
  ] =
    useState(
      false
    );


  /*
  |--------------------------------------------------------------------------
  | API DATA
  |--------------------------------------------------------------------------
  */

  const student =
    homepage?.student
    ??
    {};


  const university =
    homepage?.university
    ??
    {};

  const universityLogoUri = getUniversityLogoUri(university);


  const schedules =
    Array.isArray(
      homepage?.schedules
    )
      ? homepage.schedules
      : [];


  const announcements =
    Array.isArray(
      homepage?.announcements
    )
      ? homepage.announcements
      : [];


  const newAnnouncementCount =
    numberValue(
      homepage
        ?.new_announcement_count
    );


  /*
  |--------------------------------------------------------------------------
  | ATTENDANCE SUMMARY
  |--------------------------------------------------------------------------
  */

  const attendanceSummary = {
    total:
      numberValue(
        homepage
          ?.summary
          ?.attendance
          ?.total
      ),

    present:
      numberValue(
        homepage
          ?.summary
          ?.attendance
          ?.present
      ),

    late:
      numberValue(
        homepage
          ?.summary
          ?.attendance
          ?.late
      ),

    excused:
      numberValue(
        homepage
          ?.summary
          ?.attendance
          ?.excused
      ),

    absent:
      numberValue(
        homepage
          ?.summary
          ?.attendance
          ?.absent
      ),
  };


  /*
  |--------------------------------------------------------------------------
  | REPORT SUMMARY
  |--------------------------------------------------------------------------
  */

  const reportSummary = {
    total:
      numberValue(
        homepage
          ?.summary
          ?.reports
          ?.total
      ),

    pending:
      numberValue(
        homepage
          ?.summary
          ?.reports
          ?.pending
      ),

    inReview:
      numberValue(
        homepage
          ?.summary
          ?.reports
          ?.in_review
      ),

    resolved:
      numberValue(
        homepage
          ?.summary
          ?.reports
          ?.resolved
      ),
  };


  /*
  |--------------------------------------------------------------------------
  | EXCUSE LETTER SUMMARY
  |--------------------------------------------------------------------------
  */

  const excuseLetterSummary = {
    total:
      numberValue(
        homepage
          ?.summary
          ?.excuse_letters
          ?.total
      ),

    pending:
      numberValue(
        homepage
          ?.summary
          ?.excuse_letters
          ?.pending
      ),

    approved:
      numberValue(
        homepage
          ?.summary
          ?.excuse_letters
          ?.approved
      ),

    rejected:
      numberValue(
        homepage
          ?.summary
          ?.excuse_letters
          ?.rejected
      ),
  };


  /*
  |--------------------------------------------------------------------------
  | SUMMARY UPDATES
  |--------------------------------------------------------------------------
  */

  const attendanceUpdate =
    buildAttendanceUpdate(
      attendanceSummary
    );


  const reportUpdate =
    buildReportUpdate(
      reportSummary
    );


  const excuseLetterUpdate =
    buildExcuseLetterUpdate(
      excuseLetterSummary
    );


  /*
  |--------------------------------------------------------------------------
  | UNIVERSITY
  |--------------------------------------------------------------------------
  */

  const universityName =
    university?.name
    ||
    'NSTP HUB';


  /*
  |--------------------------------------------------------------------------
  | ACADEMIC YEAR
  |--------------------------------------------------------------------------
  */

  const officialAcademicYear =
    formatAcademicYear(
      university
        ?.academic_year
    );


  const semesterDisplay =
    formatSemester(
      university?.semester
      ||
      student?.term
    );


  const academicYearOptions =
    useMemo(
      () =>
        buildAcademicYearOptions(
          officialAcademicYear
        ),
      [
        officialAcademicYear,
      ]
    );


  const displayedAcademicYear =
    selectedAcademicYear
    ||
    officialAcademicYear
    ||
    '-';


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  */

  const studentName =
    student?.full_name
    ||
    student?.name
    ||
    'NSTP Student';


  /*
  |--------------------------------------------------------------------------
  | STUDENT ID NUMBER
  |--------------------------------------------------------------------------
  */

  const studentIdDisplay =
    String(
      student
        ?.student_id_number
      ??
      student
        ?.student_id
      ??
      student
        ?.school_id
      ??
      ''
    )
      .trim()
    ||
    'Not yet assigned';


  /*
  |--------------------------------------------------------------------------
  | STUDENT INITIALS
  |--------------------------------------------------------------------------
  */

  const studentInitials =
    useMemo(
      () => {
        const first =
          String(
            student?.first_name
            ??
            student?.name
            ??
            ''
          )
            .trim()
            .charAt(
              0
            );


        const surname =
          String(
            student?.surname
            ??
            ''
          )
            .trim()
            .charAt(
              0
            );


        return (
          `${first}${surname}`
            .toUpperCase()
          ||
          'NS'
        );
      },
      [
        student?.first_name,
        student?.surname,
        student?.name,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | PROGRAM
  |--------------------------------------------------------------------------
  */

  const programDisplay =
    useMemo(
      () => {
        const course =
          String(
            student?.course
            ??
            ''
          )
            .trim();


        const year =
          String(
            student?.year_level
            ??
            ''
          )
            .trim();


        const section =
          String(
            student?.section
            ??
            ''
          )
            .trim();


        if (
          course
          &&
          section
        ) {
          return (
            `${course}-${section}`
          );
        }


        if (
          course
          &&
          year
        ) {
          return (
            `${course}-${year}`
          );
        }


        return (
          course
          ||
          '-'
        );
      },
      [
        student?.course,
        student?.year_level,
        student?.section,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | COMPONENT
  |--------------------------------------------------------------------------
  */

  const component =
    String(
      student?.component
      ??
      ''
    )
      .trim()
      .toUpperCase();


  /*
  |--------------------------------------------------------------------------
  | STUDENT INFORMATION
  |--------------------------------------------------------------------------
  */

  const subjectDisplay =
    formatSubject(
      student?.subject
    );


  const termDisplay =
    formatSemester(
      student?.term
      ||
      university?.semester
    );


  const genderDisplay =
    capitalizeWords(
      student?.gender
    );


  const contactDisplay =
    student?.contact_number
    ||
    '-';


  /*
  |--------------------------------------------------------------------------
  | PROFILE PHOTO
  |--------------------------------------------------------------------------
  */

  const profilePhotoUrl =
    useMemo(
      () => {
        const resolved =
          resolveStudentProfilePhotoUrl(
            student
              ?.profile_photo_url
            ??
            student
              ?.profile_photo_data_uri
            ??
            student
              ?.profile_photo
            ??
            null
          );


        return withImageCacheBuster(
          resolved
        );
      },
      [
        student?.profile_photo_url,
        student?.profile_photo_data_uri,
        student?.profile_photo,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | LOAD HOMEPAGE
  |--------------------------------------------------------------------------
  */

  const loadHomepage =
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


          const [
            homepageResponse,
            profileResponse,
          ] =
            await Promise.all([
              getHomepage(),

              getStudentProfile()
                .catch(
                  error => {
                    console.warn(
                      'Homepage profile fallback:',
                      error
                    );


                    return null;
                  }
                ),
            ]);


          if (
            !homepageResponse
            ||
            homepageResponse
              ?.success ===
              false
          ) {
            throw new Error(
              homepageResponse
                ?.message
              ||
              'Unable to load the NSTP HUB homepage.'
            );
          }


          const homepageStudent =
            homepageResponse
              ?.student
            ??
            {};


          const canonicalStudent =
            profileResponse
              ?.student
            ??
            {};


          const canonicalProfile =
            profileResponse
              ?.profile
            ??
            {};


          const rawProfilePhoto =
            canonicalStudent
              ?.profile_photo_url
            ??
            canonicalStudent
              ?.profile_photo_data_uri
            ??
            canonicalProfile
              ?.profile_photo_url
            ??
            canonicalProfile
              ?.profile_photo_data_uri
            ??
            profileResponse
              ?.profile_photo_url
            ??
            profileResponse
              ?.profile_photo_data_uri
            ??
            canonicalStudent
              ?.profile_photo
            ??
            canonicalProfile
              ?.profile_photo
            ??
            homepageStudent
              ?.profile_photo_url
            ??
            homepageStudent
              ?.profile_photo_data_uri
            ??
            homepageStudent
              ?.profile_photo
            ??
            null;


          const normalizedProfilePhoto =
            resolveStudentProfilePhotoUrl(
              rawProfilePhoto
            );


          const mergedStudent = {
            ...homepageStudent,

            profile_photo:
              canonicalStudent
                ?.profile_photo
              ??
              canonicalProfile
                ?.profile_photo
              ??
              homepageStudent
                ?.profile_photo
              ??
              null,

            profile_photo_url:
              normalizedProfilePhoto,

            profile_photo_data_uri:
              canonicalStudent
                ?.profile_photo_data_uri
              ??
              canonicalProfile
                ?.profile_photo_data_uri
              ??
              homepageStudent
                ?.profile_photo_data_uri
              ??
              null,
          };


          setHomepage({
            ...homepageResponse,

            student:
              mergedStudent,
          });


          setUniversityLogoFailed(
            false
          );


          setProfilePhotoFailed(
            false
          );


          const studentId =
            homepageResponse
              ?.student
              ?.id;


          const officialYear =
            formatAcademicYear(
              homepageResponse
                ?.university
                ?.academic_year
            );


          if (
            studentId
          ) {
            const storageKey =
              `${ACADEMIC_YEAR_STORAGE_PREFIX}${studentId}`;


            const savedYear =
              await SecureStore
                .getItemAsync(
                  storageKey
                );


            const validYears =
              buildAcademicYearOptions(
                officialYear
              );


            if (
              savedYear
              &&
              validYears
                .includes(
                  savedYear
                )
            ) {
              setSelectedAcademicYear(
                savedYear
              );

            } else {
              setSelectedAcademicYear(
                officialYear
              );
            }

          } else {
            setSelectedAcademicYear(
              officialYear
            );
          }

        } catch (
          error
        ) {
          console.error(
            'Homepage Load Error:',
            error
          );


          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load the NSTP HUB homepage.'
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
  | RELOAD WHEN SCREEN IS FOCUSED
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(
      () => {
        loadHomepage(
          false
        );
      },
      [
        loadHomepage,
      ]
    )
  );


  /*
  |--------------------------------------------------------------------------
  | SELECT ACADEMIC YEAR
  |--------------------------------------------------------------------------
  */

  const selectAcademicYear =
    async (
      academicYear
    ) => {
      setSelectedAcademicYear(
        academicYear
      );


      setAcademicYearModalVisible(
        false
      );


      if (
        student?.id
      ) {
        try {
          await SecureStore
            .setItemAsync(
              `${ACADEMIC_YEAR_STORAGE_PREFIX}${student.id}`,
              academicYear
            );

        } catch (
          error
        ) {
          console.warn(
            'Unable to save academic year preference:',
            error
          );
        }
      }
    };


  /*
  |--------------------------------------------------------------------------
  | RESET ACADEMIC YEAR
  |--------------------------------------------------------------------------
  */

  const resetAcademicYear =
    async () => {
      setSelectedAcademicYear(
        officialAcademicYear
      );


      setAcademicYearModalVisible(
        false
      );


      if (
        student?.id
      ) {
        try {
          await SecureStore
            .deleteItemAsync(
              `${ACADEMIC_YEAR_STORAGE_PREFIX}${student.id}`
            );

        } catch (
          error
        ) {
          console.warn(
            'Unable to reset academic year preference:',
            error
          );
        }
      }
    };


  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  |
  | These routes exactly match:
  |
  | app/(tabs)/Schedule.js
  | app/(tabs)/AnnouncementsScreen.js
  | app/(tabs)/AttendanceRecordScreen.js
  | app/(tabs)/ReportScreen.js
  | app/(tabs)/ExcuseLetterScreen.js
  |
  */

  const openSchedules =
    () => {
      router.push(
        '/(tabs)/Schedule'
      );
    };


  const openAnnouncements =
    () => {
      router.push(
        '/(tabs)/AnnouncementsScreen'
      );
    };


  const openAttendance =
    () => {
      router.push(
        '/(tabs)/AttendanceRecordScreen'
      );
    };


  const openReports =
    () => {
      router.push(
        '/(tabs)/ReportScreen'
      );
    };


  const openExcuseLetters =
    () => {
      router.push(
        '/(tabs)/ExcuseLetterScreen'
      );
    };


  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (
    loading
    &&
    !homepage
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
          style={
            isDarkMode
              ? 'light'
              : 'dark'
          }
          backgroundColor={
            themeColors.cream
          }
        />


        <View
          style={
            styles.loadingContainer
          }
        >
          <View
            style={
              styles.loadingLogo
            }
          >
            <Ionicons
              name="school"
              size={34}
              color={
                themeColors.white
              }
            />
          </View>


          <ActivityIndicator
            size="large"
            color={
              themeColors.green
            }
          />


          <Text
            style={
              styles.loadingTitle
            }
          >
            NSTP HUB
          </Text>


          <Text
            style={
              styles.loadingText
            }
          >
            Preparing your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


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
        style={
          isDarkMode
            ? 'light'
            : 'dark'
        }
        backgroundColor={
          themeColors.cream
        }
      />


      <View
        style={[
          styles.screen,

          {
            width:
              screenWidth,
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.scrollContent,

            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={() =>
                loadHomepage(
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
          <View
            style={
              styles.topHeader
            }
          >
            <View
              style={
                styles.brandRow
              }
            >
              <View
                style={
                  styles.logoContainer
                }
              >
                {
                  universityLogoUri
                  &&
                  !universityLogoFailed
                    ? (
                      <Image
                        source={{
                          uri: universityLogoUri,
                        }}
                        style={
                          styles.universityLogo
                        }
                        resizeMode="contain"
                        onError={(event) => {
                          console.warn('Homepage university logo failed:', universityLogoUri, event?.nativeEvent?.error);
                          setUniversityLogoFailed(
                            true
                          );
                        }}
                      />
                    )
                    : (
                      <View
                        style={
                          styles.logoFallback
                        }
                      >
                        <Ionicons
                          name="school"
                          size={25}
                          color={
                            themeColors.green
                          }
                        />
                      </View>
                    )
                }
              </View>


              <View
                style={
                  styles.brandTextContainer
                }
              >
                <View
                  style={
                    styles.nstpLogoRow
                  }
                >
                  <Text
                    style={
                      styles.nstpText
                    }
                  >
                    NSTP
                  </Text>


                  <Text
                    style={
                      styles.hubText
                    }
                  >
                    HUB
                  </Text>
                </View>


                <Text
                  numberOfLines={2}
                  style={
                    styles.universityName
                  }
                >
                  {
                    universityName
                  }
                </Text>
              </View>
            </View>


            <TouchableOpacity
              activeOpacity={
                0.82
              }
              style={
                styles.academicSelector
              }
              onPress={() =>
                setAcademicYearModalVisible(
                  true
                )
              }
            >
              <View
                style={
                  styles.academicSelectorIcon
                }
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={
                    themeColors.maroon
                  }
                />
              </View>


              <View
                style={
                  styles.academicSelectorText
                }
              >
                <Text
                  style={
                    styles.academicSelectorLabel
                  }
                >
                  ACADEMIC YEAR
                </Text>


                <Text
                  style={
                    styles.academicSelectorValue
                  }
                >
                  {
                    displayedAcademicYear
                  }
                </Text>
              </View>


              <View
                style={
                  styles.semesterMini
                }
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.semesterMiniText
                  }
                >
                  {
                    semesterDisplay
                  }
                </Text>
              </View>


              <Ionicons
                name="chevron-down"
                size={19}
                color={
                  themeColors.darkTeal
                }
              />
            </TouchableOpacity>
          </View>


          <View
            style={
              styles.hero
            }
          >
            <View
              style={
                styles.heroDecorOne
              }
            />


            <View
              style={
                styles.heroDecorTwo
              }
            />


            <View
              style={
                styles.heroContent
              }
            >
              <View
                style={
                  styles.heroTopRow
                }
              >
                <View
                  style={
                    styles.heroBadge
                  }
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color={
                      themeColors.yellow
                    }
                  />


                  <Text
                    style={
                      styles.heroBadgeText
                    }
                  >
                    STUDENT HOMEPAGE
                  </Text>
                </View>


                <View
                  style={
                    styles.componentPill
                  }
                >
                  <Text
                    style={
                      styles.componentPillText
                    }
                  >
                    {
                      component
                      ||
                      'NSTP'
                    }
                  </Text>
                </View>
              </View>


              <Text
                style={
                  styles.heroGreeting
                }
              >
                Welcome back,
              </Text>


              <Text
                numberOfLines={2}
                style={
                  styles.heroName
                }
              >
                {
                  studentName
                }
              </Text>
            </View>
          </View>


          <View
            style={
              styles.profileCard
            }
          >
            <View
              style={
                styles.profileTop
              }
            >
              <View
                style={
                  styles.avatarShell
                }
              >
                {
                  profilePhotoUrl
                  &&
                  !profilePhotoFailed
                    ? (
                      <Image
                        key={
                          profilePhotoUrl
                        }
                        source={{
                          uri:
                            profilePhotoUrl,
                        }}
                        style={
                          styles.avatarImage
                        }
                        resizeMode="cover"
                        fadeDuration={0}
                        onLoad={() =>
                          setProfilePhotoFailed(
                            false
                          )
                        }
                        onError={
                          event => {
                            console.warn(
                              'Homepage Profile Photo Error:',
                              {
                                uri:
                                  profilePhotoUrl,

                                nativeEvent:
                                  event
                                    ?.nativeEvent,
                              }
                            );


                            setProfilePhotoFailed(
                              true
                            );
                          }
                        }
                      />
                    )
                    : (
                      <View
                        style={
                          styles.initialAvatar
                        }
                      >
                        <Text
                          style={
                            styles.initialAvatarText
                          }
                        >
                          {
                            studentInitials
                          }
                        </Text>
                      </View>
                    )
                }
              </View>


              <View
                style={
                  styles.profileIdentity
                }
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.profileName
                  }
                >
                  {
                    studentName
                  }
                </Text>


                <Text
                  style={
                    styles.profileProgram
                  }
                >
                  {
                    programDisplay
                  }
                </Text>


                <View
                  style={
                    styles.studentIdBadge
                  }
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={
                      0.75
                    }
                    style={
                      styles.studentIdValue
                    }
                  >
                    {
                      studentIdDisplay
                    }
                  </Text>
                </View>
              </View>
            </View>


            <View
              style={
                styles.profileDivider
              }
            />


            <View
              style={
                styles.detailGrid
              }
            >
              <ProfileInfo
                icon="book-outline"
                label="Subject"
                value={
                  subjectDisplay
                }
              />


              <ProfileInfo
                icon="time-outline"
                label="Term"
                value={
                  termDisplay
                }
              />


              <ProfileInfo
                icon="person-outline"
                label="Gender"
                value={
                  genderDisplay
                }
              />


              <ProfileInfo
                icon="call-outline"
                label="Contact"
                value={
                  contactDisplay
                }
              />


              <ProfileInfo
                icon="calendar-outline"
                label="Viewing Academic Year"
                value={
                  displayedAcademicYear
                }
                full
              />
            </View>
          </View>


          {
            Boolean(
              errorMessage
            )
            &&
            (
              <View
                style={
                  styles.errorCard
                }
              >
                <View
                  style={
                    styles.errorIcon
                  }
                >
                  <Ionicons
                    name="alert-circle"
                    size={22}
                    color={
                      themeColors.maroon
                    }
                  />
                </View>


                <View
                  style={
                    styles.errorContent
                  }
                >
                  <Text
                    style={
                      styles.errorTitle
                    }
                  >
                    Unable to refresh
                  </Text>


                  <Text
                    style={
                      styles.errorMessage
                    }
                  >
                    {
                      errorMessage
                    }
                  </Text>
                </View>


                <TouchableOpacity
                  style={
                    styles.retryButton
                  }
                  onPress={() =>
                    loadHomepage(
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


          <DashboardSection
            icon="checkmark-done-circle"
            eyebrow="ATTENDANCE UPDATE"
            title="Attendance Summary"
            action="View all"
            onPress={
              openAttendance
            }
            badge={
              attendanceSummary
                .absent
            }
          >
            <StudentRecordUpdate
              updateLabel="Current attendance update"
              updateText={
                attendanceUpdate
                  .update
              }
              noticeText={
                attendanceUpdate
                  .notice
              }
              stats={[
                {
                  label:
                    'Present',

                  value:
                    attendanceSummary
                      .present,

                  icon:
                    'checkmark-circle-outline',
                },

                {
                  label:
                    'Late',

                  value:
                    attendanceSummary
                      .late,

                  icon:
                    'time-outline',
                },

                {
                  label:
                    'Excused',

                  value:
                    attendanceSummary
                      .excused,

                  icon:
                    'shield-checkmark-outline',
                },

                {
                  label:
                    'Absent',

                  value:
                    attendanceSummary
                      .absent,

                  icon:
                    'close-circle-outline',
                },
              ]}
            />
          </DashboardSection>


          <DashboardSection
            icon="document-text"
            eyebrow="REPORT UPDATE"
            title="Report Summary"
            action="View all"
            onPress={
              openReports
            }
            badge={
              reportSummary
                .pending
              +
              reportSummary
                .inReview
            }
          >
            <StudentRecordUpdate
              updateLabel="Current report update"
              updateText={
                reportUpdate
                  .update
              }
              noticeText={
                reportUpdate
                  .notice
              }
              stats={[
                {
                  label:
                    'Total',

                  value:
                    reportSummary
                      .total,

                  icon:
                    'documents-outline',
                },

                {
                  label:
                    'Pending',

                  value:
                    reportSummary
                      .pending,

                  icon:
                    'time-outline',
                },

                {
                  label:
                    'In Review',

                  value:
                    reportSummary
                      .inReview,

                  icon:
                    'eye-outline',
                },

                {
                  label:
                    'Resolved',

                  value:
                    reportSummary
                      .resolved,

                  icon:
                    'checkmark-done-outline',
                },
              ]}
            />
          </DashboardSection>


          <DashboardSection
            icon="mail-open"
            eyebrow="EXCUSE LETTER UPDATE"
            title="Excuse Letter Summary"
            action="View all"
            onPress={
              openExcuseLetters
            }
            badge={
              excuseLetterSummary
                .pending
            }
          >
            <StudentRecordUpdate
              updateLabel="Current excuse letter update"
              updateText={
                excuseLetterUpdate
                  .update
              }
              noticeText={
                excuseLetterUpdate
                  .notice
              }
              stats={[
                {
                  label:
                    'Total',

                  value:
                    excuseLetterSummary
                      .total,

                  icon:
                    'mail-outline',
                },

                {
                  label:
                    'Pending',

                  value:
                    excuseLetterSummary
                      .pending,

                  icon:
                    'time-outline',
                },

                {
                  label:
                    'Approved',

                  value:
                    excuseLetterSummary
                      .approved,

                  icon:
                    'checkmark-circle-outline',
                },

                {
                  label:
                    'Rejected',

                  value:
                    excuseLetterSummary
                      .rejected,

                  icon:
                    'close-circle-outline',
                },
              ]}
            />
          </DashboardSection>


          <DashboardSection
            icon="calendar"
            eyebrow="WHAT'S NEXT"
            title="Upcoming Schedule"
            action="View all"
            onPress={
              openSchedules
            }
          >
            {
              schedules.length > 0
                ? schedules.map(
                    (
                      schedule,
                      index
                    ) => (
                      <ScheduleItem
                        key={
                          schedule.id
                        }
                        schedule={
                          schedule
                        }
                        last={
                          index ===
                          schedules.length - 1
                        }
                        onPress={
                          openSchedules
                        }
                      />
                    )
                  )
                : (
                  <EmptyState
                    icon="calendar-outline"
                    title="Your calendar is clear"
                    description="Upcoming NSTP activities will appear here when they are posted."
                  />
                )
            }
          </DashboardSection>


          <DashboardSection
            icon="megaphone"
            eyebrow="NSTP UPDATES"
            title="Announcements"
            action="View all"
            onPress={
              openAnnouncements
            }
            badge={
              newAnnouncementCount
            }
          >
            {
              announcements.length > 0
                ? announcements.map(
                    (
                      announcement,
                      index
                    ) => (
                      <AnnouncementItem
                        key={
                          announcement.id
                        }
                        announcement={
                          announcement
                        }
                        last={
                          index ===
                          announcements.length - 1
                        }
                        onPress={
                          openAnnouncements
                        }
                      />
                    )
                  )
                : (
                  <EmptyState
                    icon="notifications-outline"
                    title="You're all caught up"
                    description="There are no announcements for your NSTP component right now."
                  />
                )
            }
          </DashboardSection>


          <View
            style={
              styles.bottomSpace
            }
          />
        </ScrollView>
      </View>


      <Modal
        visible={
          academicYearModalVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setAcademicYearModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={() =>
            setAcademicYearModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.academicModal
            }
            onPress={() => {}}
          >
            <View
              style={
                styles.modalHandle
              }
            />


            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderIcon
                }
              >
                <Ionicons
                  name="calendar"
                  size={22}
                  color={
                    themeColors.white
                  }
                />
              </View>


              <View
                style={
                  styles.modalHeaderText
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Select Academic Year
                </Text>


                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose the academic year you want displayed on your dashboard.
                </Text>
              </View>


              <TouchableOpacity
                style={
                  styles.modalClose
                }
                onPress={() =>
                  setAcademicYearModalVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={
                    themeColors.darkTeal
                  }
                />
              </TouchableOpacity>
            </View>


            <View
              style={
                styles.yearList
              }
            >
              {
                academicYearOptions
                  .map(
                    academicYear => {
                      const selected =
                        academicYear ===
                        displayedAcademicYear;


                      const official =
                        academicYear ===
                        officialAcademicYear;


                      return (
                        <TouchableOpacity
                          key={
                            academicYear
                          }
                          activeOpacity={
                            0.8
                          }
                          style={[
                            styles.yearOption,

                            selected
                            &&
                            styles.yearOptionSelected,
                          ]}
                          onPress={() =>
                            selectAcademicYear(
                              academicYear
                            )
                          }
                        >
                          <View
                            style={[
                              styles.yearOptionIcon,

                              selected
                              &&
                              styles.yearOptionIconSelected,
                            ]}
                          >
                            <Ionicons
                              name={
                                selected
                                  ? 'checkmark'
                                  : 'calendar-outline'
                              }
                              size={19}
                              color={
                                selected
                                  ? themeColors.white
                                  : themeColors.green
                              }
                            />
                          </View>


                          <View
                            style={
                              styles.yearOptionTextContainer
                            }
                          >
                            <Text
                              style={[
                                styles.yearOptionText,

                                selected
                                &&
                                styles.yearOptionTextSelected,
                              ]}
                            >
                              {
                                academicYear
                              }
                            </Text>


                            {
                              official
                              &&
                              (
                                <Text
                                  style={[
                                    styles.officialText,

                                    selected
                                    &&
                                    styles.officialTextSelected,
                                  ]}
                                >
                                  University current academic year
                                </Text>
                              )
                            }
                          </View>


                          {
                            official
                            &&
                            (
                              <View
                                style={[
                                  styles.currentBadge,

                                  selected
                                  &&
                                  styles.currentBadgeSelected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.currentBadgeText,

                                    selected
                                    &&
                                    styles.currentBadgeTextSelected,
                                  ]}
                                >
                                  CURRENT
                                </Text>
                              </View>
                            )
                          }
                        </TouchableOpacity>
                      );
                    }
                  )
              }
            </View>


            <TouchableOpacity
              style={
                styles.resetYearButton
              }
              onPress={
                resetAcademicYear
              }
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={
                  themeColors.maroon
                }
              />


              <Text
                style={
                  styles.resetYearText
                }
              >
                Use university current year
              </Text>
            </TouchableOpacity>


            <View
              style={
                styles.modalNotice
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={
                  themeColors.darkTeal
                }
              />


              <Text
                style={
                  styles.modalNoticeText
                }
              >
                This changes your dashboard view only. It does not change the university&apos;s official academic year.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| PROFILE INFORMATION ITEM
|--------------------------------------------------------------------------
*/

function ProfileInfo({
  icon,
  label,
  value,
  full = false,
}) {
  return (
    <View
      style={[
        styles.profileInfo,

        full
        &&
        styles.profileInfoFull,
      ]}
    >
      <View
        style={
          styles.profileInfoIcon
        }
      >
        <Ionicons
          name={
            icon
          }
          size={18}
          color={
            themeColors.green
          }
        />
      </View>


      <View
        style={
          styles.profileInfoText
        }
      >
        <Text
          style={
            styles.profileInfoLabel
          }
        >
          {
            label
          }
        </Text>


        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={
            0.75
          }
          style={
            styles.profileInfoValue
          }
        >
          {
            value
            ||
            '-'
          }
        </Text>
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| DASHBOARD SECTION
|--------------------------------------------------------------------------
*/

function DashboardSection({
  icon,
  eyebrow,
  title,
  action,
  onPress,
  badge = null,
  children,
}) {
  return (
    <View
      style={
        styles.dashboardSection
      }
    >
      <View
        style={
          styles.sectionHeader
        }
      >
        <View
          style={
            styles.sectionHeaderLeft
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Ionicons
              name={
                icon
              }
              size={20}
              color={
                themeColors.maroon
              }
            />
          </View>


          <View>
            <Text
              style={
                styles.sectionEyebrow
              }
            >
              {
                eyebrow
              }
            </Text>


            <Text
              style={
                styles.sectionTitle
              }
            >
              {
                title
              }
            </Text>
          </View>
        </View>


        <TouchableOpacity
          activeOpacity={
            0.72
          }
          style={
            styles.sectionAction
          }
          onPress={
            onPress
          }
        >
          {
            badge !== null
            &&
            numberValue(
              badge
            ) > 0
            &&
            (
              <View
                style={
                  styles.sectionBadge
                }
              >
                <Text
                  style={
                    styles.sectionBadgeText
                  }
                >
                  {
                    numberValue(
                      badge
                    ) > 99
                      ? '99+'
                      : numberValue(
                          badge
                        )
                  }
                </Text>
              </View>
            )
          }


          <Text
            style={
              styles.sectionActionText
            }
          >
            {
              action
            }
          </Text>


          <Ionicons
            name="arrow-forward"
            size={17}
            color={
              themeColors.actionIcon
            }
          />
        </TouchableOpacity>
      </View>


      <View
        style={
          styles.sectionBody
        }
      >
        {
          children
        }
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| STUDENT RECORD UPDATE
|--------------------------------------------------------------------------
*/

function StudentRecordUpdate({
  updateLabel,
  updateText,
  noticeText,
  stats = [],
}) {
  return (
    <View
      style={
        styles.studentRecordUpdate
      }
    >
      <View
        style={
          styles.recordUpdateTop
        }
      >
        <View
          style={
            styles.recordUpdateIcon
          }
        >
          <Ionicons
            name="sparkles-outline"
            size={17}
            color={
              themeColors.orange
            }
          />
        </View>


        <View
          style={
            styles.recordUpdateCopy
          }
        >
          <Text
            style={
              styles.recordUpdateLabel
            }
          >
            {
              updateLabel
            }
          </Text>


          <Text
            style={
              styles.recordUpdateText
            }
          >
            {
              updateText
            }
          </Text>
        </View>
      </View>


      <View
        style={
          styles.recordSummaryGrid
        }
      >
        {
          stats.map(
            stat => (
              <View
                key={
                  stat.label
                }
                style={
                  styles.recordSummaryItem
                }
              >
                <View
                  style={
                    styles.recordSummaryIcon
                  }
                >
                  <Ionicons
                    name={
                      stat.icon
                    }
                    size={16}
                    color={
                      themeColors.green
                    }
                  />
                </View>


                <Text
                  style={
                    styles.recordSummaryValue
                  }
                >
                  {
                    numberValue(
                      stat.value
                    )
                  }
                </Text>


                <Text
                  numberOfLines={1}
                  style={
                    styles.recordSummaryLabel
                  }
                >
                  {
                    stat.label
                  }
                </Text>
              </View>
            )
          )
        }
      </View>


      <View
        style={
          styles.recordNotice
        }
      >
        <Ionicons
          name="information-circle-outline"
          size={17}
          color={
            themeColors.maroon
          }
        />


        <Text
          style={
            styles.recordNoticeText
          }
        >
          {
            noticeText
          }
        </Text>
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| SCHEDULE ITEM
|--------------------------------------------------------------------------
*/

function ScheduleItem({
  schedule,
  last,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={
        0.72
      }
      onPress={
        onPress
      }
      style={[
        styles.scheduleItem,

        last
        &&
        styles.scheduleItemLast,
      ]}
    >
      <View
        style={
          styles.scheduleDateBlock
        }
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={
            themeColors.maroon
          }
        />


        <Text
          style={
            styles.scheduleDayText
          }
        >
          {
            getDateDay(
              schedule
                ?.schedule_date
            )
          }
        </Text>


        <Text
          style={
            styles.scheduleMonthText
          }
        >
          {
            getDateMonth(
              schedule
                ?.schedule_date
            )
          }
        </Text>
      </View>


      <View
        style={
          styles.scheduleMain
        }
      >
        <View
          style={
            styles.scheduleTopRow
          }
        >
          <Text
            numberOfLines={1}
            style={
              styles.scheduleTitle
            }
          >
            {
              schedule?.title
              ||
              'NSTP Schedule'
            }
          </Text>


          <Ionicons
            name="chevron-forward"
            size={18}
            color={
              themeColors.gray
            }
          />
        </View>


        <Text
          style={
            styles.scheduleDateLabel
          }
        >
          {
            schedule?.date_label
            ||
            schedule?.schedule_date
            ||
            '-'
          }
        </Text>


        <View
          style={
            styles.scheduleMetaRow
          }
        >
          <View
            style={
              styles.scheduleMeta
            }
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={
                themeColors.green
              }
            />


            <Text
              style={
                styles.scheduleMetaText
              }
            >
              {
                schedule?.time_label
                ||
                'Time TBA'
              }
            </Text>
          </View>


          <View
            style={
              styles.scheduleMeta
            }
          >
            <Ionicons
              name="location-outline"
              size={15}
              color={
                themeColors.green
              }
            />


            <Text
              numberOfLines={1}
              style={
                styles.scheduleMetaText
              }
            >
              {
                schedule?.location
                ||
                'TBA'
              }
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


/*
|--------------------------------------------------------------------------
| ANNOUNCEMENT ITEM
|--------------------------------------------------------------------------
*/

function AnnouncementItem({
  announcement,
  last,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={
        0.72
      }
      onPress={
        onPress
      }
      style={[
        styles.announcementItem,

        last
        &&
        styles.announcementItemLast,
      ]}
    >
      <View
        style={
          styles.announcementIcon
        }
      >
        <Ionicons
          name="megaphone-outline"
          size={19}
          color={
            themeColors.maroon
          }
        />
      </View>


      <View
        style={
          styles.announcementBody
        }
      >
        <View
          style={
            styles.announcementTop
          }
        >
          <Text
            numberOfLines={2}
            style={
              styles.announcementTitle
            }
          >
            {
              announcement?.title
              ||
              'Announcement'
            }
          </Text>


          <Ionicons
            name="chevron-forward"
            size={18}
            color={
              themeColors.gray
            }
          />
        </View>


        <Text
          numberOfLines={2}
          style={
            styles.announcementDescription
          }
        >
          {
            announcement?.description
            ||
            ''
          }
        </Text>


        <View
          style={
            styles.announcementFooter
          }
        >
          <View
            style={
              styles.announcementFooterItem
            }
          >
            <Ionicons
              name="calendar-outline"
              size={13}
              color={
                themeColors.actionIcon
              }
            />


            <Text
              style={
                styles.announcementFooterText
              }
            >
              {
                announcement?.date_label
                ||
                '-'
              }
            </Text>
          </View>


          <View
            style={
              styles.footerDot
            }
          />


          <View
            style={
              styles.announcementFooterItem
            }
          >
            <Ionicons
              name="person-outline"
              size={13}
              color={
                themeColors.actionIcon
              }
            />


            <Text
              numberOfLines={1}
              style={
                styles.announcementFooterText
              }
            >
              {
                announcement?.author
                ||
                'NSTP Office'
              }
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <View
      style={
        styles.emptyState
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name={
            icon
          }
          size={27}
          color={
            themeColors.green
          }
        />
      </View>


      <Text
        style={
          styles.emptyTitle
        }
      >
        {
          title
        }
      </Text>


      <Text
        style={
          styles.emptyDescription
        }
      >
        {
          description
        }
      </Text>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| NUMBER
|--------------------------------------------------------------------------
*/

function numberValue(
  value
) {
  const number =
    Number(
      value
      ??
      0
    );


  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


/*
|--------------------------------------------------------------------------
| PROFILE PHOTO URL
|--------------------------------------------------------------------------
*/

function resolveStudentProfilePhotoUrl(
  value
) {
  let photo =
    String(
      value
      ??
      ''
    )
      .trim();


  if (
    !photo
  ) {
    return null;
  }


  if (
    photo
      .startsWith(
        'data:image/'
      )
  ) {
    return photo;
  }


  photo =
    photo.replace(
      /\\/g,
      '/'
    );


  const serverBase =
    String(
      SERVER_URL
      ??
      ''
    )
      .trim()
      .replace(
        /\/+$/,
        ''
      );


  const lastHttp =
    Math.max(
      photo.lastIndexOf(
        'http://'
      ),

      photo.lastIndexOf(
        'https://'
      )
    );


  if (
    lastHttp > 0
  ) {
    photo =
      photo.substring(
        lastHttp
      );
  }


  photo =
    photo.replace(
      /\/storage\/storage\//gi,
      '/storage/'
    );


  if (
    /^https?:\/\//i.test(
      photo
    )
  ) {
    if (
      serverBase
      &&
      /^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?/i.test(
        photo
      )
    ) {
      photo =
        photo.replace(
          /^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?/i,
          serverBase
        );
    }


    photo =
      photo.replace(
        /\/storage\/storage\//gi,
        '/storage/'
      );


    return photo;
  }


  if (
    !serverBase
  ) {
    return photo;
  }


  let relativePath =
    photo
      .replace(
        /^\/+/,
        ''
      )
      .replace(
        /^storage\/app\/public\//i,
        ''
      )
      .replace(
        /^app\/public\//i,
        ''
      )
      .replace(
        /^public\//i,
        ''
      );


  if (
    /^storage\//i.test(
      relativePath
    )
  ) {
    relativePath =
      relativePath.replace(
        /^storage\/storage\//i,
        'storage/'
      );


    return (
      `${serverBase}/${relativePath}`
    );
  }


  return (
    `${serverBase}/storage/${relativePath}`
  );
}


/*
|--------------------------------------------------------------------------
| IMAGE CACHE BUSTER
|--------------------------------------------------------------------------
*/

function withImageCacheBuster(
  url
) {
  if (
    !url
  ) {
    return null;
  }


  const value =
    String(
      url
    );


  if (
    value
      .startsWith(
        'data:image/'
      )
  ) {
    return value;
  }


  const separator =
    value.includes(
      '?'
    )
      ? '&'
      : '?';


  return (
    `${value}${separator}v=${Date.now()}`
  );
}


/*
|--------------------------------------------------------------------------
| ATTENDANCE UPDATE
|--------------------------------------------------------------------------
*/

function buildAttendanceUpdate(
  summary
) {
  if (
    summary.total <= 0
  ) {
    return {
      update:
        'No attendance records have been posted yet.',

      notice:
        'Your attendance updates will appear here once your NSTP attendance is recorded.',
    };
  }


  const update =
    `You have ${summary.total} attendance record${summary.total === 1 ? '' : 's'}: `
    +
    `${summary.present} present, ${summary.late} late, ${summary.excused} excused, and ${summary.absent} absent.`;


  if (
    summary.absent > 0
  ) {
    return {
      update,

      notice:
        'Review your Attendance Record for the exact absence dates. If you believe a record needs correction, contact your NSTP instructor.',
    };
  }


  if (
    summary.late > 0
  ) {
    return {
      update,

      notice:
        'You currently have a late attendance record. Continue checking your Attendance Record after every NSTP activity.',
    };
  }


  return {
    update,

    notice:
      'There is no current absence notice. Keep checking your Attendance Record because instructors may post updates after an NSTP activity.',
  };
}


/*
|--------------------------------------------------------------------------
| REPORT UPDATE
|--------------------------------------------------------------------------
*/

function buildReportUpdate(
  summary
) {
  if (
    summary.total <= 0
  ) {
    return {
      update:
        'You have no submitted reports yet.',

      notice:
        'Use Reports when you need to submit an NSTP concern or issue to the proper NSTP personnel.',
    };
  }


  const update =
    `You have ${summary.total} report${summary.total === 1 ? '' : 's'}: `
    +
    `${summary.pending} pending, ${summary.inReview} in review, and ${summary.resolved} resolved.`;


  if (
    summary.inReview > 0
  ) {
    return {
      update,

      notice:
        'One or more reports are currently being reviewed. Open Reports to check their current status and any response.',
    };
  }


  if (
    summary.pending > 0
  ) {
    return {
      update,

      notice:
        'One or more reports are waiting for review. Open Reports regularly for status changes.',
    };
  }


  return {
    update,

    notice:
      'Your submitted reports currently have no pending review. Resolved reports remain available for reference.',
  };
}


/*
|--------------------------------------------------------------------------
| EXCUSE LETTER UPDATE
|--------------------------------------------------------------------------
*/

function buildExcuseLetterUpdate(
  summary
) {
  if (
    summary.total <= 0
  ) {
    return {
      update:
        'You have no submitted excuse letters yet.',

      notice:
        'Submit an excuse letter only when needed and attach valid supporting evidence for review.',
    };
  }


  const update =
    `You have ${summary.total} excuse letter${summary.total === 1 ? '' : 's'}: `
    +
    `${summary.pending} pending, ${summary.approved} approved, and ${summary.rejected} rejected.`;


  if (
    summary.pending > 0
  ) {
    return {
      update,

      notice:
        'One or more excuse letters are waiting for review. Open Excuse Letter to check their status.',
    };
  }


  if (
    summary.rejected > 0
  ) {
    return {
      update,

      notice:
        'A rejected excuse letter is recorded in your account. Open Excuse Letter to review its status and supporting information.',
    };
  }


  return {
    update,

    notice:
      'There is no current pending excuse letter notice. Approved records remain available in your Excuse Letter page.',
  };
}


/*
|--------------------------------------------------------------------------
| FORMAT ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

function formatAcademicYear(
  value
) {
  const text =
    String(
      value
      ??
      ''
    )
      .trim();


  if (
    !text
  ) {
    return '-';
  }


  return text
    .replace(
      /^AY\s*/i,
      ''
    )
    .replace(
      /\s*-\s*/g,
      '-'
    );
}


/*
|--------------------------------------------------------------------------
| ACADEMIC YEAR OPTIONS
|--------------------------------------------------------------------------
*/

function buildAcademicYearOptions(
  value
) {
  const normalized =
    formatAcademicYear(
      value
    );


  const match =
    normalized.match(
      /^(\d{4})-(\d{4})$/
    );


  if (
    !match
  ) {
    return normalized !== '-'
      ? [
          normalized,
        ]
      : [];
  }


  const firstYear =
    Number(
      match[1]
    );


  return [
    `${firstYear - 2}-${firstYear - 1}`,
    `${firstYear - 1}-${firstYear}`,
    `${firstYear}-${firstYear + 1}`,
    `${firstYear + 1}-${firstYear + 2}`,
    `${firstYear + 2}-${firstYear + 3}`,
  ];
}


/*
|--------------------------------------------------------------------------
| FORMAT SUBJECT
|--------------------------------------------------------------------------
*/

function formatSubject(
  value
) {
  const subject =
    String(
      value
      ??
      ''
    )
      .trim()
      .toUpperCase();


  if (
    [
      'NSTP 1',
      'NSTP-1',
      'NSTP -1',
      'NSTP - 1',
    ].includes(
      subject
    )
  ) {
    return 'NSTP - 1';
  }


  if (
    [
      'NSTP 2',
      'NSTP-2',
      'NSTP -2',
      'NSTP - 2',
    ].includes(
      subject
    )
  ) {
    return 'NSTP - 2';
  }


  return (
    subject
    ||
    '-'
  );
}


/*
|--------------------------------------------------------------------------
| FORMAT SEMESTER
|--------------------------------------------------------------------------
*/

function formatSemester(
  value
) {
  const semester =
    String(
      value
      ??
      ''
    )
      .trim()
      .toUpperCase();


  if (
    !semester
  ) {
    return '-';
  }


  if (
    [
      '1',
      '1ST',
      '1ST SEM',
      '1ST SEMESTER',
      'FIRST',
      'FIRST SEM',
      'FIRST SEMESTER',
    ].includes(
      semester
    )
  ) {
    return 'First Semester';
  }


  if (
    [
      '2',
      '2ND',
      '2ND SEM',
      '2ND SEMESTER',
      'SECOND',
      'SECOND SEM',
      'SECOND SEMESTER',
    ].includes(
      semester
    )
  ) {
    return 'Second Semester';
  }


  if (
    [
      'SUMMER',
      'SUMMER TERM',
    ].includes(
      semester
    )
  ) {
    return 'Summer';
  }


  return capitalizeWords(
    value
  );
}


/*
|--------------------------------------------------------------------------
| CAPITALIZE
|--------------------------------------------------------------------------
*/

function capitalizeWords(
  value
) {
  const text =
    String(
      value
      ??
      ''
    )
      .trim();


  if (
    !text
  ) {
    return '-';
  }


  return text
    .toLowerCase()
    .replace(
      /\b\w/g,
      character =>
        character
          .toUpperCase()
    );
}


/*
|--------------------------------------------------------------------------
| DATE DAY
|--------------------------------------------------------------------------
*/

function getDateDay(
  value
) {
  if (
    !value
  ) {
    return '--';
  }


  const parts =
    String(
      value
    )
      .split(
        '-'
      );


  if (
    parts.length === 3
  ) {
    return String(
      Number(
        parts[2]
      )
    );
  }


  return '--';
}


/*
|--------------------------------------------------------------------------
| DATE MONTH
|--------------------------------------------------------------------------
*/

function getDateMonth(
  value
) {
  if (
    !value
  ) {
    return '---';
  }


  const parts =
    String(
      value
    )
      .split(
        '-'
      );


  const month =
    Number(
      parts[1]
    );


  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];


  return (
    months[
      month - 1
    ]
    ||
    '---'
  );
}


/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const createStyles = (COLORS) =>
  StyleSheet.create({

    safeArea: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    screen: {
      flex: 1,

      alignSelf:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    scrollContent: {
      flexGrow: 1,

      paddingTop: 10,

      paddingBottom: 28,

      backgroundColor:
        COLORS.cream,
    },


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


    loadingLogo: {
      width: 74,

      height: 74,

      borderRadius: 22,

      marginBottom: 22,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.green,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity: 0.16,

      shadowRadius: 10,

      elevation: 5,
    },


    loadingTitle: {
      marginTop: 14,

      color:
        COLORS.maroon,

      fontSize: 18,

      fontWeight:
        '800',

      letterSpacing: 2,
    },


    loadingText: {
      marginTop: 5,

      color:
        COLORS.darkTeal,

      fontSize: 13,
    },


    topHeader: {
      marginBottom: 14,
    },


    brandRow: {
      minHeight: 74,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 3,
    },


    logoContainer: {
      width: 55,

      height: 55,

      borderRadius: 18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      overflow:
        'hidden',
    },


    universityLogo: {
      width: 48,

      height: 48,
    },


    logoFallback: {
      width: 48,

      height: 48,

      borderRadius: 15,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    brandTextContainer: {
      flex: 1,

      marginLeft: 11,

      paddingRight: 8,
    },


    nstpLogoRow: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    nstpText: {
      color:
        COLORS.maroon,

      fontSize: 19,

      lineHeight: 23,

      fontWeight:
        '900',

      letterSpacing: 2.2,
    },


    hubText: {
      marginLeft: 5,

      color:
        COLORS.green,

      fontSize: 12,

      fontWeight:
        '800',

      letterSpacing: 1,
    },


    universityName: {
      marginTop: 2,

      color:
        COLORS.darkTeal,

      fontSize: 11,

      lineHeight: 15,

      fontWeight:
        '600',
    },


    academicSelector: {
      minHeight: 68,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 13,

      paddingVertical: 10,

      borderRadius: 18,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,

        height: 4,
      },

      shadowOpacity: 0.08,

      shadowRadius: 9,

      elevation: 3,
    },


    academicSelectorIcon: {
      width: 42,

      height: 42,

      borderRadius: 13,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    academicSelectorText: {
      flex: 1,

      marginLeft: 11,
    },


    academicSelectorLabel: {
      color:
        COLORS.darkTeal,

      fontSize: 9,

      lineHeight: 12,

      fontWeight:
        '700',

      letterSpacing: 1.1,
    },


    academicSelectorValue: {
      marginTop: 2,

      color:
        COLORS.maroon,

      fontSize: 17,

      lineHeight: 21,

      fontWeight:
        '800',
    },


    semesterMini: {
      maxWidth: 97,

      marginRight: 8,

      paddingHorizontal: 9,

      paddingVertical: 6,

      borderRadius: 10,

      backgroundColor:
        COLORS.green,
    },


    semesterMiniText: {
      color:
        COLORS.white,

      fontSize: 9,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    hero: {
      position:
        'relative',

      minHeight: 185,

      marginTop: 7,

      borderRadius: 26,

      overflow:
        'hidden',

      backgroundColor:
        COLORS.green,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,

        height: 8,
      },

      shadowOpacity: 0.15,

      shadowRadius: 14,

      elevation: 5,
    },


    heroDecorOne: {
      position:
        'absolute',

      width: 190,

      height: 190,

      borderRadius: 95,

      top: -86,

      right: -70,

      backgroundColor:
        COLORS.maroon,

      opacity: 0.22,
    },


    heroDecorTwo: {
      position:
        'absolute',

      width: 125,

      height: 125,

      borderRadius: 63,

      bottom: -64,

      left: -30,

      backgroundColor:
        COLORS.yellow,

      opacity: 0.15,
    },


    heroContent: {
      flex: 1,

      paddingHorizontal: 20,

      paddingVertical: 19,
    },


    heroTopRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },


    heroBadge: {
      minHeight: 28,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 10,

      borderRadius: 10,

      backgroundColor:
        COLORS.darkTeal,
    },


    heroBadgeText: {
      marginLeft: 6,

      color:
        COLORS.white,

      fontSize: 9,

      fontWeight:
        '800',

      letterSpacing: 0.7,
    },


    componentPill: {
      minHeight: 28,

      justifyContent:
        'center',

      paddingHorizontal: 11,

      borderRadius: 10,

      backgroundColor:
        COLORS.yellow,
    },


    componentPillText: {
      color:
        COLORS.maroon,

      fontSize: 10,

      fontWeight:
        '900',

      letterSpacing: 0.5,
    },


    heroGreeting: {
      marginTop: 20,

      color:
        COLORS.cream,

      fontSize: 15,

      fontWeight:
        '500',
    },


    heroName: {
      marginTop: 3,

      maxWidth:
        '94%',

      color:
        COLORS.white,

      fontSize: 25,

      lineHeight: 31,

      fontWeight:
        '800',
    },


    profileCard: {
      marginTop: -19,

      marginHorizontal: 9,

      padding: 16,

      borderRadius: 22,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,

        height: 6,
      },

      shadowOpacity: 0.12,

      shadowRadius: 13,

      elevation: 5,
    },


    profileTop: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    avatarShell: {
      width: 72,

      height: 72,

      borderRadius: 22,

      overflow:
        'hidden',

      backgroundColor:
        COLORS.green,

      borderWidth: 4,

      borderColor:
        COLORS.cream,
    },


    avatarImage: {
      width:
        '100%',

      height:
        '100%',
    },


    initialAvatar: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    initialAvatarText: {
      color:
        COLORS.white,

      fontSize: 22,

      fontWeight:
        '800',

      letterSpacing: 1,
    },


    profileIdentity: {
      flex: 1,

      marginLeft: 13,
    },


    profileName: {
      color:
        COLORS.darkTeal,

      fontSize: 15,

      fontWeight:
        '800',
    },


    profileProgram: {
      marginTop: 3,

      color:
        COLORS.programText,

      fontSize: 11,

      fontWeight:
        '700',
    },


    studentIdBadge: {
      alignSelf:
        'flex-start',

      maxWidth:
        '100%',

      marginTop: 8,

      paddingHorizontal: 12,

      paddingVertical: 7,

      borderRadius: 10,

      backgroundColor:
        COLORS.cream,
    },


    studentIdValue: {
      color:
        COLORS.maroon,

      fontSize: 12,

      lineHeight: 16,

      fontWeight:
        '900',

      letterSpacing: 0.5,
    },


    profileDivider: {
      height: 1,

      marginVertical: 15,

      backgroundColor:
        COLORS.gray,

      opacity: 0.55,
    },


    detailGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      marginHorizontal: -4,
    },


    profileInfo: {
      width:
        '50%',

      minHeight: 63,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 7,

      paddingVertical: 8,
    },


    profileInfoFull: {
      width:
        '100%',
    },


    profileInfoIcon: {
      width: 36,

      height: 36,

      borderRadius: 11,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    profileInfoText: {
      flex: 1,

      marginLeft: 9,
    },


    profileInfoLabel: {
      color:
        COLORS.readableText,

      fontSize: 12,

      lineHeight: 17,

      fontWeight:
        '700',

      opacity: 1,
    },


    profileInfoValue: {
      marginTop: 2,

      color:
        COLORS.valueText,

      fontSize: 13,

      lineHeight: 19,

      fontWeight:
        '700',
    },


    errorCard: {
      minHeight: 72,

      marginTop: 18,

      flexDirection:
        'row',

      alignItems:
        'center',

      padding: 12,

      borderRadius: 16,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.maroon,
    },


    errorIcon: {
      width: 40,

      height: 40,

      borderRadius: 12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    errorContent: {
      flex: 1,

      marginLeft: 10,
    },


    errorTitle: {
      color:
        COLORS.maroon,

      fontSize: 12,

      fontWeight:
        '800',
    },


    errorMessage: {
      marginTop: 2,

      color:
        COLORS.darkTeal,

      fontSize: 10,

      lineHeight: 14,
    },


    retryButton: {
      width: 38,

      height: 38,

      borderRadius: 12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.green,
    },


    dashboardSection: {
      marginTop: 20,

      borderRadius: 22,

      overflow:
        'hidden',

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,

        height: 5,
      },

      shadowOpacity: 0.08,

      shadowRadius: 11,

      elevation: 3,
    },


    sectionHeader: {
      minHeight: 72,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 15,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.gray,
    },


    sectionHeaderLeft: {
      flex: 1,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    sectionIcon: {
      width: 42,

      height: 42,

      borderRadius: 13,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    sectionEyebrow: {
      marginLeft: 11,

      color:
        COLORS.orange,

      fontSize: 8,

      lineHeight: 11,

      fontWeight:
        '900',

      letterSpacing: 1,
    },


    sectionTitle: {
      marginLeft: 11,

      marginTop: 1,

      color:
        COLORS.darkTeal,

      fontSize: 14,

      lineHeight: 18,

      fontWeight:
        '800',
    },


    sectionAction: {
      minHeight: 38,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingLeft: 8,
    },


    sectionActionText: {
      marginRight: 5,

      color:
        COLORS.actionText,

      fontSize: 10,

      fontWeight:
        '800',
    },


    sectionBadge: {
      minWidth: 22,

      height: 22,

      marginRight: 7,

      paddingHorizontal: 5,

      borderRadius: 7,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.yellow,
    },


    sectionBadgeText: {
      color:
        COLORS.maroon,

      fontSize: 8,

      fontWeight:
        '900',
    },


    sectionBody: {
      paddingHorizontal: 14,

      paddingBottom: 7,
    },


    studentRecordUpdate: {
      paddingTop: 13,

      paddingBottom: 8,
    },


    recordUpdateTop: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      paddingHorizontal: 2,

      paddingBottom: 12,
    },


    recordUpdateIcon: {
      width: 34,

      height: 34,

      borderRadius: 11,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    recordUpdateCopy: {
      flex: 1,

      marginLeft: 9,
    },


    recordUpdateLabel: {
      color:
        COLORS.orange,

      fontSize: 8,

      lineHeight: 11,

      fontWeight:
        '900',

      letterSpacing: 0.8,

      textTransform:
        'uppercase',
    },


    recordUpdateText: {
      marginTop: 3,

      color:
        COLORS.darkTeal,

      fontSize: 11,

      lineHeight: 16,

      fontWeight:
        '700',
    },


    recordSummaryGrid: {
      flexDirection:
        'row',

      borderTopWidth: 1,

      borderBottomWidth: 1,

      borderTopColor:
        COLORS.gray,

      borderBottomColor:
        COLORS.gray,
    },


    recordSummaryItem: {
      flex: 1,

      minHeight: 78,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 3,

      paddingVertical: 9,
    },


    recordSummaryIcon: {
      width: 28,

      height: 28,

      borderRadius: 9,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    recordSummaryValue: {
      marginTop: 4,

      color:
        COLORS.maroon,

      fontSize: 16,

      lineHeight: 19,

      fontWeight:
        '900',
    },


    recordSummaryLabel: {
      marginTop: 1,

      color:
        COLORS.readableText,

      fontSize: 8,

      lineHeight: 11,

      fontWeight:
        '700',

      textAlign:
        'center',

      opacity: 0.76,
    },


    recordNotice: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop: 10,

      paddingHorizontal: 10,

      paddingVertical: 10,

      borderRadius: 12,

      backgroundColor:
        COLORS.cream,
    },


    recordNoticeText: {
      flex: 1,

      marginLeft: 7,

      color:
        COLORS.darkTeal,

      fontSize: 9,

      lineHeight: 14,
    },


    scheduleItem: {
      minHeight: 102,

      flexDirection:
        'row',

      paddingVertical: 14,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.gray,
    },


    scheduleItemLast: {
      borderBottomWidth: 0,
    },


    scheduleDateBlock: {
      width: 54,

      minHeight: 68,

      borderRadius: 14,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    scheduleDayText: {
      marginTop: 1,

      color:
        COLORS.maroon,

      fontSize: 18,

      lineHeight: 21,

      fontWeight:
        '900',
    },


    scheduleMonthText: {
      marginTop: -1,

      color:
        COLORS.green,

      fontSize: 8,

      fontWeight:
        '900',

      letterSpacing: 0.8,
    },


    scheduleMain: {
      flex: 1,

      marginLeft: 12,
    },


    scheduleTopRow: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    scheduleTitle: {
      flex: 1,

      paddingRight: 8,

      color:
        COLORS.darkTeal,

      fontSize: 13,

      lineHeight: 17,

      fontWeight:
        '800',
    },


    scheduleDateLabel: {
      marginTop: 3,

      color:
        COLORS.darkTeal,

      fontSize: 10,

      opacity: 0.7,
    },


    scheduleMetaRow: {
      marginTop: 8,

      flexDirection:
        'row',

      flexWrap:
        'wrap',
    },


    scheduleMeta: {
      maxWidth:
        '50%',

      flexDirection:
        'row',

      alignItems:
        'center',

      marginRight: 12,

      marginBottom: 3,
    },


    scheduleMetaText: {
      marginLeft: 4,

      color:
        COLORS.darkTeal,

      fontSize: 9,

      lineHeight: 13,
    },


    announcementItem: {
      minHeight: 106,

      flexDirection:
        'row',

      paddingVertical: 14,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.gray,
    },


    announcementItemLast: {
      borderBottomWidth: 0,
    },


    announcementIcon: {
      width: 43,

      height: 43,

      borderRadius: 13,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    announcementBody: {
      flex: 1,

      marginLeft: 11,
    },


    announcementTop: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },


    announcementTitle: {
      flex: 1,

      paddingRight: 8,

      color:
        COLORS.darkTeal,

      fontSize: 13,

      lineHeight: 17,

      fontWeight:
        '800',
    },


    announcementDescription: {
      marginTop: 4,

      color:
        COLORS.darkTeal,

      fontSize: 10,

      lineHeight: 15,

      opacity: 0.8,
    },


    announcementFooter: {
      marginTop: 8,

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',
    },


    announcementFooterItem: {
      maxWidth:
        '45%',

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    announcementFooterText: {
      marginLeft: 4,

      color:
        COLORS.metaText,

      fontSize: 8,

      fontWeight:
        '700',
    },


    footerDot: {
      width: 3,

      height: 3,

      marginHorizontal: 7,

      borderRadius: 2,

      backgroundColor:
        COLORS.gray,
    },


    emptyState: {
      minHeight: 170,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 25,

      paddingVertical: 25,
    },


    emptyIcon: {
      width: 54,

      height: 54,

      borderRadius: 17,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    emptyTitle: {
      marginTop: 11,

      color:
        COLORS.darkTeal,

      fontSize: 13,

      fontWeight:
        '800',

      textAlign:
        'center',
    },


    emptyDescription: {
      marginTop: 4,

      maxWidth: 250,

      color:
        COLORS.darkTeal,

      fontSize: 10,

      lineHeight: 15,

      textAlign:
        'center',

      opacity: 0.72,
    },


    modalBackdrop: {
      flex: 1,

      justifyContent:
        'flex-end',

      backgroundColor:
        'rgba(0, 13, 18, 0.55)',
    },


    academicModal: {
      maxHeight:
        '78%',

      paddingHorizontal: 18,

      paddingTop: 10,

      paddingBottom: 26,

      borderTopLeftRadius: 28,

      borderTopRightRadius: 28,

      backgroundColor:
        COLORS.cream,
    },


    modalHandle: {
      width: 42,

      height: 4,

      alignSelf:
        'center',

      marginBottom: 15,

      borderRadius: 2,

      backgroundColor:
        COLORS.gray,
    },


    modalHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    modalHeaderIcon: {
      width: 47,

      height: 47,

      borderRadius: 15,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.green,
    },


    modalHeaderText: {
      flex: 1,

      marginLeft: 11,

      paddingRight: 8,
    },


    modalTitle: {
      color:
        COLORS.maroon,

      fontSize: 16,

      fontWeight:
        '900',
    },


    modalSubtitle: {
      marginTop: 2,

      color:
        COLORS.darkTeal,

      fontSize: 10,

      lineHeight: 14,

      opacity: 0.74,
    },


    modalClose: {
      width: 37,

      height: 37,

      borderRadius: 12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    yearList: {
      marginTop: 18,
    },


    yearOption: {
      minHeight: 64,

      marginBottom: 9,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 12,

      borderRadius: 16,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.gray,
    },


    yearOptionSelected: {
      backgroundColor:
        COLORS.green,

      borderColor:
        COLORS.green,
    },


    yearOptionIcon: {
      width: 38,

      height: 38,

      borderRadius: 12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    yearOptionIconSelected: {
      backgroundColor:
        COLORS.darkTeal,
    },


    yearOptionTextContainer: {
      flex: 1,

      marginLeft: 10,
    },


    yearOptionText: {
      color:
        COLORS.darkTeal,

      fontSize: 14,

      fontWeight:
        '800',
    },


    yearOptionTextSelected: {
      color:
        COLORS.white,
    },


    officialText: {
      marginTop: 2,

      color:
        COLORS.green,

      fontSize: 8,

      fontWeight:
        '600',
    },


    officialTextSelected: {
      color:
        COLORS.cream,
    },


    currentBadge: {
      paddingHorizontal: 7,

      paddingVertical: 5,

      borderRadius: 8,

      backgroundColor:
        COLORS.yellow,
    },


    currentBadgeSelected: {
      backgroundColor:
        COLORS.white,
    },


    currentBadgeText: {
      color:
        COLORS.maroon,

      fontSize: 7,

      fontWeight:
        '900',

      letterSpacing: 0.5,
    },


    currentBadgeTextSelected: {
      color:
        COLORS.green,
    },


    resetYearButton: {
      minHeight: 48,

      marginTop: 3,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        COLORS.maroon,
    },


    resetYearText: {
      marginLeft: 7,

      color:
        COLORS.maroon,

      fontSize: 11,

      fontWeight:
        '800',
    },


    modalNotice: {
      marginTop: 13,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      padding: 11,

      borderRadius: 13,

      backgroundColor:
        COLORS.white,
    },


    modalNoticeText: {
      flex: 1,

      marginLeft: 7,

      color:
        COLORS.darkTeal,

      fontSize: 9,

      lineHeight: 14,
    },


    bottomSpace: {
      // Leave room for the floating tab bar and Android gesture navigation.
      height: 130,
    },
  });
