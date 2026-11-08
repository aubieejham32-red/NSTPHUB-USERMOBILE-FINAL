import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
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
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  SERVER_URL,
} from '../../config/api';

import {
  getDigitalStudentId,
  getDigitalStudentIdQrSource,
  getStudentProfile,
} from '../../services/api';



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



/*
|--------------------------------------------------------------------------
| Fonts
|--------------------------------------------------------------------------
*/

const SERIF_FONT =
  Platform.select({
    ios:
      'Georgia',

    android:
      'serif',

    default:
      'serif',
  });


/*
|--------------------------------------------------------------------------
| Course Full Names
|--------------------------------------------------------------------------
*/

const COURSE_FULL_NAMES = {
  BSICT:
    'Bachelor of Science in Information and Communications Technology',

  BSIT:
    'Bachelor of Science in Information Technology',

  BSCS:
    'Bachelor of Science in Computer Science',

  BSIS:
    'Bachelor of Science in Information Systems',
};


/*
|--------------------------------------------------------------------------
| Normalize Laravel Media URL
|--------------------------------------------------------------------------
|
| A phone cannot open:
|
| http://localhost:8000
| http://127.0.0.1:8000
| http://0.0.0.0:8000
|
| because those addresses point to the PHONE itself.
|
| We replace them with the LAN Laravel server from config/api.js.
|
*/

function normalizeLaravelMediaUrl(
  value
) {
  const raw =
    String(
      value ?? ''
    ).trim();


  if (
    !raw
  ) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Data URI
  |--------------------------------------------------------------------------
  */

  if (
    raw.startsWith(
      'data:'
    )
  ) {
    return raw;
  }


  /*
  |--------------------------------------------------------------------------
  | Relative Laravel URL
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | /storage/student-profile-photos/3/photo.jpg
  |
  */

  if (
    raw.startsWith(
      '/'
    )
  ) {
    return (
      `${SERVER_URL}${raw}`
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Localhost Laravel URL
  |--------------------------------------------------------------------------
  */

  const localHostPattern =
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i;


  if (
    localHostPattern.test(
      raw
    )
  ) {
    return raw.replace(
      localHostPattern,
      SERVER_URL
    );
  }


  return raw;
}


/*
|--------------------------------------------------------------------------
| Image Cache Buster
|--------------------------------------------------------------------------
|
| When a student replaces their profile photo, the URL can remain the same.
| React Native may continue showing the cached old image.
|
*/

function withImageCacheBuster(
  value
) {
  const url =
    normalizeLaravelMediaUrl(
      value
    );


  if (
    !url
  ) {
    return null;
  }


  if (
    url.startsWith(
      'data:'
    )
  ) {
    return url;
  }


  const separator =
    url.includes(
      '?'
    )
      ? '&'
      : '?';


  return (
    `${url}${separator}v=${Date.now()}`
  );
}


/*
|--------------------------------------------------------------------------
| Clean Optional Name Part
|--------------------------------------------------------------------------
*/

function cleanOptionalNamePart(
  value
) {
  const text =
    String(
      value ?? ''
    ).trim();


  const normalized =
    text
      .toUpperCase()
      .replace(
        /[.\s]/g,
        ''
      );


  if (
    [
      '',
      'N/A',
      'NA',
      'NONE',
      'NULL',
      'NOTAPPLICABLE',
      '-',
      '—',
    ].includes(
      normalized
    )
  ) {
    return '';
  }


  return text;
}


/*
|--------------------------------------------------------------------------
| University Name Lines
|--------------------------------------------------------------------------
*/

function splitUniversityName(
  name
) {
  const normalized =
    String(
      name ?? ''
    )
      .trim()
      .toUpperCase();


  if (
    normalized ===
    'SURIGAO DEL NORTE STATE UNIVERSITY'
  ) {
    return [
      'SURIGAO DEL NORTE',
      'STATE UNIVERSITY',
    ];
  }


  const words =
    normalized
      .split(
        /\s+/
      )
      .filter(
        Boolean
      );


  if (
    words.length <=
    3
  ) {
    return [
      normalized,
    ];
  }


  const midpoint =
    Math.ceil(
      words.length /
      2
    );


  return [
    words
      .slice(
        0,
        midpoint
      )
      .join(
        ' '
      ),

    words
      .slice(
        midpoint
      )
      .join(
        ' '
      ),
  ];
}


/*
|--------------------------------------------------------------------------
| Component Full Name
|--------------------------------------------------------------------------
*/

function getComponentFullName(
  component
) {
  switch (
    String(
      component ?? ''
    )
      .trim()
      .toUpperCase()
  ) {
    case 'ROTC':
      return (
        "Reserve Officers' Training Corps"
      );


    case 'CWTS':
      return (
        'Civic Welfare Training Service'
      );


    case 'LTS':
      return (
        'Literacy Training Service'
      );


    default:
      return '-';
  }
}


/*
|--------------------------------------------------------------------------
| Digital Student ID Screen
|--------------------------------------------------------------------------
*/

export default function DigitalStudentIdScreen() {

  const {
    isDarkMode,
  } = useAppTheme();

  const themeColors =
    isDarkMode
      ? DARK_COLORS
      : COLORS;

  const {
    width,
  } =
    useWindowDimensions();


  /*
  |--------------------------------------------------------------------------
  | Main Data
  |--------------------------------------------------------------------------
  */

  const [
    digitalId,
    setDigitalId,
  ] =
    useState(
      null
    );


  const [
    qrImageSource,
    setQrImageSource,
  ] =
    useState(
      null
    );


  /*
  |--------------------------------------------------------------------------
  | Resolved Profile Photo
  |--------------------------------------------------------------------------
  |
  | This is intentionally separate from digitalId.student.profile_photo_url.
  |
  | We first check Digital ID.
  | Then we check the shared student Profile API.
  |
  */

  const [
    profilePhotoUrl,
    setProfilePhotoUrl,
  ] =
    useState(
      null
    );


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

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
    error,
    setError,
  ] =
    useState(
      ''
    );


  /*
  |--------------------------------------------------------------------------
  | Image Failures
  |--------------------------------------------------------------------------
  */

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
    qrImageFailed,
    setQrImageFailed,
  ] =
    useState(
      false
    );


  /*
  |--------------------------------------------------------------------------
  | QR Modal
  |--------------------------------------------------------------------------
  */

  const [
    qrModalVisible,
    setQrModalVisible,
  ] =
    useState(
      false
    );


  /*
  |--------------------------------------------------------------------------
  | Responsive Card
  |--------------------------------------------------------------------------
  */

  const cardWidth =
    Math.min(
      width - 34,
      356
    );


  const scale =
    cardWidth /
    356;


  const cardHeight =
    620 *
    scale;


  const styles =
    useMemo(
      () =>
        createStyles(
          cardWidth,
          cardHeight,
          scale,
          width,
          themeColors
        ),
      [
        cardWidth,
        cardHeight,
        scale,
        width,
        themeColors,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | API Data
  |--------------------------------------------------------------------------
  */

  const student =
    digitalId?.student
    ??
    {};


  const university =
    digitalId?.university
    ??
    {};


  /*
  |--------------------------------------------------------------------------
  | University Logo URL
  |--------------------------------------------------------------------------
  */

  const universityLogoUrl =
    useMemo(
      () =>
        normalizeLaravelMediaUrl(
          university?.logo_url
        ),
      [
        university?.logo_url,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Student ID
  |--------------------------------------------------------------------------
  */

  const studentIdNumber =
    String(
      student?.student_id_number
      ??
      ''
    ).trim();


  /*
  |--------------------------------------------------------------------------
  | Student Name
  |--------------------------------------------------------------------------
  */

  const studentCardName =
    useMemo(
      () => {
        const firstName =
          String(
            student?.first_name
            ??
            ''
          )
            .trim()
            .toUpperCase();


        const middleName =
          cleanOptionalNamePart(
            student?.middle_name
          );


        const surname =
          String(
            student?.surname
            ??
            student?.last_name
            ??
            ''
          )
            .trim()
            .toUpperCase();


        const extension =
          cleanOptionalNamePart(
            student?.name_extension
          )
            .toUpperCase();


        const middleInitial =
          middleName
            ? (
                `${middleName
                  .charAt(
                    0
                  )
                  .toUpperCase()}.`
              )
            : '';


        const composedName = [
          firstName,
          middleInitial,
          surname,
          extension,
        ]
          .filter(
            Boolean
          )
          .join(
            ' '
          )
          .trim();


        if (
          composedName
        ) {
          return composedName;
        }


        return String(
          student?.full_name
          ??
          student?.name
          ??
          'NSTP STUDENT'
        )
          .replace(
            /\s+(N\s*\/\s*A|NA|NONE|NULL|NOT\s+APPLICABLE)\s*$/i,
            ''
          )
          .trim()
          .toUpperCase();
      },
      [
        student?.first_name,
        student?.middle_name,
        student?.surname,
        student?.last_name,
        student?.name_extension,
        student?.full_name,
        student?.name,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Student Initials
  |--------------------------------------------------------------------------
  */

  const studentInitials =
    useMemo(
      () => {
        const first =
          String(
            student?.first_name
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
            student?.last_name
            ??
            ''
          )
            .trim()
            .charAt(
              0
            );


        const initials =
          `${first}${surname}`
            .trim()
            .toUpperCase();


        if (
          initials
        ) {
          return initials;
        }


        const fallback =
          String(
            student?.name
            ??
            student?.full_name
            ??
            ''
          )
            .trim()
            .split(
              /\s+/
            )
            .filter(
              Boolean
            )
            .slice(
              0,
              2
            )
            .map(
              part =>
                part
                  .charAt(
                    0
                  )
                  .toUpperCase()
            )
            .join(
              ''
            );


        return (
          fallback
          ||
          'NS'
        );
      },
      [
        student?.first_name,
        student?.surname,
        student?.last_name,
        student?.name,
        student?.full_name,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | University
  |--------------------------------------------------------------------------
  */

  const universityName =
    String(
      university?.name
      ??
      'UNIVERSITY'
    )
      .trim()
      .toUpperCase();


  const universityNameLines =
    useMemo(
      () =>
        splitUniversityName(
          universityName
        ),
      [
        universityName,
      ]
    );


  const universityAcronym =
    String(
      university?.acronym
      ??
      'NSTP'
    )
      .trim()
      .toUpperCase();


  /*
  |--------------------------------------------------------------------------
  | Component
  |--------------------------------------------------------------------------
  */

  const componentCode =
    String(
      student?.component
      ??
      ''
    )
      .trim()
      .toUpperCase();


  const componentFullName =
    getComponentFullName(
      componentCode
    );


  /*
  |--------------------------------------------------------------------------
  | Course
  |--------------------------------------------------------------------------
  */

  const courseDisplay =
    useMemo(
      () => {
        const course =
          String(
            student?.course
            ??
            ''
          ).trim();


        if (
          !course
        ) {
          return '-';
        }


        const upperCourse =
          course
            .toUpperCase();


        const fullName =
          COURSE_FULL_NAMES[
            upperCourse
          ];


        if (
          fullName
        ) {
          return (
            `${upperCourse} - ${fullName}`
          );
        }


        return course;
      },
      [
        student?.course,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Credentials
  |--------------------------------------------------------------------------
  */

  const credentialsReady =
    digitalId
      ?.credentials_ready ===
    true;


  const qrAvailable =
    digitalId
      ?.qr_available ===
    true;


  /*
  |--------------------------------------------------------------------------
  | Resolve Latest Profile Photo
  |--------------------------------------------------------------------------
  |
  | This is the important image fix.
  |
  | Priority:
  |
  | 1. Digital Student ID API
  | 2. Shared Student Profile API
  |
  | The shared Profile API is the same API used by My Information, so the
  | Digital ID receives the newest photo after the student changes it.
  |
  */

  const resolveLatestProfilePhoto =
    useCallback(
      async digitalIdResponse => {
        let latestPhotoUrl =
          normalizeLaravelMediaUrl(
            digitalIdResponse
              ?.student
              ?.profile_photo_url
          );


        try {
          const profileResponse =
            await getStudentProfile();


          const sharedProfilePhoto =
            normalizeLaravelMediaUrl(
              profileResponse
                ?.student
                ?.profile_photo_url
            );


          if (
            sharedProfilePhoto
          ) {
            latestPhotoUrl =
              sharedProfilePhoto;
          }

        } catch (
          profileError
        ) {
          /*
          |--------------------------------------------------------------------------
          | Do not break Digital ID if fallback profile request fails
          |--------------------------------------------------------------------------
          */

          console.warn(
            'Digital ID shared profile photo fallback failed:',
            profileError
          );
        }


        return latestPhotoUrl;
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Load Digital ID
  |--------------------------------------------------------------------------
  */

  const loadDigitalId =
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


          setError(
            ''
          );


          /*
          |--------------------------------------------------------------------------
          | Reset image failures
          |--------------------------------------------------------------------------
          */

          setUniversityLogoFailed(
            false
          );


          setProfilePhotoFailed(
            false
          );


          setQrImageFailed(
            false
          );


          /*
          |--------------------------------------------------------------------------
          | Digital ID API
          |--------------------------------------------------------------------------
          */

          const response =
            await getDigitalStudentId();


          setDigitalId(
            response
          );


          /*
          |--------------------------------------------------------------------------
          | Latest Profile Photo
          |--------------------------------------------------------------------------
          */

          const latestPhotoUrl =
            await resolveLatestProfilePhoto(
              response
            );


          /*
          |--------------------------------------------------------------------------
          | Add cache buster
          |--------------------------------------------------------------------------
          */

          setProfilePhotoUrl(
            latestPhotoUrl
              ? withImageCacheBuster(
                  latestPhotoUrl
                )
              : null
          );


          /*
          |--------------------------------------------------------------------------
          | QR Source
          |--------------------------------------------------------------------------
          */

          if (
            response?.qr_available === true &&
            (response?.qr_code_data_uri || response?.qr_code_url)
          ) {
            // Prefer artwork from authenticated JSON over another native
            // image download that may drop the Bearer token on Android.
            const source = response?.qr_code_data_uri
              ? { uri: response.qr_code_data_uri }
              : await getDigitalStudentIdQrSource(response.qr_code_url);


            setQrImageSource(
              source
            );

          } else {
            setQrImageSource(
              null
            );
          }

        } catch (
          requestError
        ) {
          console.warn(
            'Digital Student ID Error:',
            requestError
          );


          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your Digital Student ID.'
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
      [
        resolveLatestProfilePhoto,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Refresh On Focus
  |--------------------------------------------------------------------------
  |
  | When the student goes:
  |
  | Profile -> changes photo -> Digital ID
  |
  | this reloads the newest profile image.
  |
  */

  useFocusEffect(
    useCallback(
      () => {
        loadDigitalId(
          false
        );


        return undefined;
      },
      [
        loadDigitalId,
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
    &&
    !digitalId
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
            Loading Student ID
          </Text>


          <Text
            style={
              styles.loadingDescription
            }
          >
            Retrieving your official NSTP credentials...
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
        style="dark"
        backgroundColor={
          themeColors.cream
        }
      />


      <ScrollView
        style={
          styles.page
        }
        contentContainerStyle={
          styles.pageContent
        }
        showsVerticalScrollIndicator={
          false
        }
        bounces={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadDigitalId(
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
            ERROR
            ================================================================ */}

        {Boolean(
          error
        ) && (
          <View
            style={
              styles.errorCard
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={
                themeColors.maroon
              }
            />


            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>


            <TouchableOpacity
              onPress={() =>
                loadDigitalId(
                  false
                )
              }
              style={
                styles.retryButton
              }
            >
              <Ionicons
                name="refresh"
                size={17}
                color={
                  themeColors.white
                }
              />
            </TouchableOpacity>
          </View>
        )}


        {/* ================================================================
            DIGITAL ID
            ================================================================ */}

        {digitalId && (
          <View
            style={
              styles.cardShadow
            }
          >
            <View
              style={
                styles.idCard
              }
            >

              {/* ============================================================
                  UNIVERSITY HEADER
                  ============================================================ */}

              <View
                style={
                  styles.universityHeader
                }
              >

                {/* ==========================================================
                    UNIVERSITY LOGO
                    ========================================================== */}

                <View
                  style={
                    styles.universityLogoArea
                  }
                >
                  {universityLogoUrl &&
                  !universityLogoFailed ? (
                    <Image
                      key={
                        universityLogoUrl
                      }
                      source={{
                        uri:
                          universityLogoUrl,
                      }}
                      style={
                        styles.universityLogo
                      }
                      resizeMode="contain"
                      onError={
                        event => {
                          console.warn(
                            'Digital ID university logo failed:',
                            {
                              url:
                                universityLogoUrl,

                              error:
                                event
                                  ?.nativeEvent,
                            }
                          );


                          setUniversityLogoFailed(
                            true
                          );
                        }
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.universityLogoFallback
                      }
                    >
                      <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        minimumFontScale={
                          0.5
                        }
                        style={
                          styles.universityLogoFallbackText
                        }
                      >
                        {universityAcronym}
                      </Text>
                    </View>
                  )}
                </View>


                {/* ==========================================================
                    UNIVERSITY NAME
                    ========================================================== */}

                <View
                  style={
                    styles.universityNameArea
                  }
                >
                  {universityNameLines.map(
                    (
                      line,
                      index
                    ) => (
                      <Text
                        key={
                          `${line}-${index}`
                        }
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={
                          0.65
                        }
                        style={
                          styles.universityName
                        }
                      >
                        {line}
                      </Text>
                    )
                  )}
                </View>
              </View>


              {/* ============================================================
                  CARD BODY
                  ============================================================ */}

              <View
                style={
                  styles.cardBody
                }
              >

                {/* ==========================================================
                    WATERMARK
                    ========================================================== */}

                <Image
                  source={require(
                    '../../assets/images/nstphub_logo.png'
                  )}
                  style={
                    styles.watermark
                  }
                  resizeMode="contain"
                />


                {/* ==========================================================
                    PROGRAM
                    ========================================================== */}

                <Text
                  style={
                    styles.programTitle
                  }
                >
                  NATIONAL SERVICE TRAINING PROGRAM
                </Text>


                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  Digital Student ID Card
                </Text>


                {/* ==========================================================
                    PHOTO + COMPONENT
                    ========================================================== */}

                <View
                  style={
                    styles.mainRow
                  }
                >

                  {/* ========================================================
                      STUDENT PROFILE PHOTO
                      ======================================================== */}

                  <View
                    style={
                      styles.photoFrame
                    }
                  >
                    {profilePhotoUrl &&
                    !profilePhotoFailed ? (
                      <Image
                        key={
                          profilePhotoUrl
                        }
                        source={{
                          uri:
                            profilePhotoUrl,
                        }}
                        style={
                          styles.studentPhoto
                        }
                        resizeMode="cover"

                        /*
                        |--------------------------------------------------------------------------
                        | Android
                        |--------------------------------------------------------------------------
                        |
                        | Avoid old-image fade while replacing photo.
                        |
                        */

                        fadeDuration={
                          0
                        }

                        onLoad={() => {
                          setProfilePhotoFailed(
                            false
                          );
                        }}

                        onError={
                          event => {
                            /*
                            |--------------------------------------------------------------------------
                            | Debugging
                            |--------------------------------------------------------------------------
                            |
                            | If Laravel cannot serve the image, this prints the
                            | exact URL to your Expo terminal.
                            |
                            */

                            console.warn(
                              'Digital ID profile photo failed to load:',
                              {
                                url:
                                  profilePhotoUrl,

                                error:
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
                    ) : (
                      <View
                        style={
                          styles.photoFallback
                        }
                      >
                        <Text
                          style={
                            styles.photoInitials
                          }
                        >
                          {studentInitials}
                        </Text>
                      </View>
                    )}
                  </View>


                  {/* ========================================================
                      COMPONENT
                      ======================================================== */}

                  <View
                    style={
                      styles.componentDetails
                    }
                  >
                    <Text
                      style={
                        styles.componentHeading
                      }
                    >
                      NSTP COMPONENT:
                    </Text>


                    <View
                      style={
                        styles.componentFirstLine
                      }
                    >
                      <Text
                        style={
                          styles.componentCode
                        }
                      >
                        {componentCode ||
                          '-'}
                      </Text>


                      {Boolean(
                        componentCode
                      ) && (
                        <Text
                          style={
                            styles.componentDash
                          }
                        >
                          -
                        </Text>
                      )}
                    </View>


                    <Text
                      style={
                        styles.componentFullName
                      }
                    >
                      {componentFullName}
                    </Text>
                  </View>
                </View>


                {/* ==========================================================
                    STUDENT ID
                    ========================================================== */}

                <View
                  style={
                    styles.studentIdRow
                  }
                >
                  <Text
                    style={
                      styles.studentIdLabel
                    }
                  >
                    ID NO.
                  </Text>


                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={
                      0.7
                    }
                    style={
                      styles.studentIdValue
                    }
                  >
                    {studentIdNumber
                      ||
                      'NOT YET ASSIGNED'}
                  </Text>
                </View>


                {/* ==========================================================
                    STUDENT NAME
                    ========================================================== */}

                <View
                  style={
                    styles.studentNameArea
                  }
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={
                      0.58
                    }
                    style={
                      styles.studentName
                    }
                  >
                    {studentCardName}
                  </Text>
                </View>


                {/* ==========================================================
                    COURSE
                    ========================================================== */}

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={
                    0.55
                  }
                  style={
                    styles.course
                  }
                >
                  {courseDisplay}
                </Text>


                {/* ==========================================================
                    QR CODE
                    ========================================================== */}

                <View
                  style={
                    styles.qrArea
                  }
                >
                  {credentialsReady &&
                  qrAvailable &&
                  qrImageSource &&
                  !qrImageFailed ? (
                    <Pressable
                      onPress={() =>
                        setQrModalVisible(
                          true
                        )
                      }
                      style={
                        styles.qrPressable
                      }
                    >
                      <Image
                        source={
                          qrImageSource
                        }
                        style={
                          styles.qrImage
                        }
                        resizeMode="contain"
                        onError={
                          event => {
                            console.warn(
                              'Digital Student ID QR failed:',
                              event
                                ?.nativeEvent
                            );


                            setQrImageFailed(
                              true
                            );
                          }
                        }
                      />
                    </Pressable>
                  ) : (
                    <View
                      style={
                        styles.qrUnavailable
                      }
                    >
                      <Ionicons
                        name="qr-code-outline"
                        size={
                          55 *
                          scale
                        }
                        color={
                          themeColors.gray
                        }
                      />


                      <Text
                        style={
                          styles.qrUnavailableText
                        }
                      >
                        {credentialsReady
                          ? 'Unable to display QR. Pull down to refresh.'
                          : 'QR pending. Ask your university admin to generate your ID and QR credentials.'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}


        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>


      {/* ================================================================
          LARGE QR MODAL
          ================================================================ */}

      <Modal
        visible={
          qrModalVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setQrModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={() =>
            setQrModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.qrModalCard
            }
            onPress={
              event =>
                event
                  .stopPropagation()
            }
          >
            <TouchableOpacity
              activeOpacity={
                0.75
              }
              style={
                styles.modalClose
              }
              onPress={() =>
                setQrModalVisible(
                  false
                )
              }
            >
              <Ionicons
                name="close"
                size={28}
                color={
                  themeColors.maroon
                }
              />
            </TouchableOpacity>


            {qrImageSource && (
              <Image
                source={
                  qrImageSource
                }
                style={
                  styles.modalQrImage
                }
                resizeMode="contain"
              />
            )}


            <Text
              style={
                styles.modalStudentId
              }
            >
              {studentIdNumber}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Responsive Styles
|--------------------------------------------------------------------------
*/

function createStyles(
  cardWidth,
  cardHeight,
  scale,
  screenWidth,
  COLORS
) {
  const qrSize =
    192 *
    scale;


  const modalQrSize =
    Math.min(
      screenWidth - 86,
      325
    );


  return StyleSheet.create({

    /*
    |--------------------------------------------------------------------------
    | Screen
    |--------------------------------------------------------------------------
    */

    safeArea: {
      flex:
        1,

      backgroundColor:
        COLORS.cream,
    },


    page: {
      flex:
        1,

      backgroundColor:
        COLORS.cream,
    },


    pageContent: {
      flexGrow:
        1,

      alignItems:
        'center',

      paddingTop:
        20,

      paddingHorizontal:
        12,

      paddingBottom:
        20,
    },


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

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


    loadingTitle: {
      marginTop:
        18,

      color:
        COLORS.maroon,

      fontSize:
        15,

      fontWeight:
        '800',
    },


    loadingDescription: {
      marginTop:
        5,

      color:
        COLORS.darkTeal,

      fontSize:
        10.5,

      textAlign:
        'center',

      opacity:
        0.7,
    },


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    errorCard: {
      width:
        cardWidth,

      minHeight:
        60,

      marginBottom:
        14,

      paddingHorizontal:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderRadius:
        10,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        'rgba(84,16,15,0.38)',
    },


    errorText: {
      flex:
        1,

      marginHorizontal:
        10,

      color:
        COLORS.darkTeal,

      fontSize:
        9,

      lineHeight:
        13,
    },


    retryButton: {
      width:
        34,

      height:
        34,

      borderRadius:
        9,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Card
    |--------------------------------------------------------------------------
    */

    cardShadow: {
      width:
        cardWidth,

      height:
        cardHeight,

      borderRadius:
        10 *
        scale,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          4,

        height:
          6,
      },

      shadowOpacity:
        0.24,

      shadowRadius:
        7,

      elevation:
        8,
    },


    idCard: {
      width:
        cardWidth,

      height:
        cardHeight,

      overflow:
        'hidden',

      borderWidth:
        4 *
        scale,

      borderColor:
        COLORS.maroon,

      borderRadius:
        10 *
        scale,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | University Header
    |--------------------------------------------------------------------------
    */

    universityHeader: {
      width:
        '100%',

      height:
        90 *
        scale,

      paddingHorizontal:
        17 *
        scale,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.green,
    },


    universityLogoArea: {
      width:
        66 *
        scale,

      height:
        66 *
        scale,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    universityLogo: {
      width:
        '100%',

      height:
        '100%',
    },


    universityLogoFallback: {
      width:
        '100%',

      height:
        '100%',

      borderRadius:
        33 *
        scale,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    universityLogoFallbackText: {
      maxWidth:
        '85%',

      color:
        COLORS.green,

      fontSize:
        9 *
        scale,

      fontWeight:
        '900',

      textAlign:
        'center',
    },


    universityNameArea: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        12 *
        scale,

      justifyContent:
        'center',
    },


    universityName: {
      width:
        '100%',

      color:
        COLORS.white,

      fontSize:
        17 *
        scale,

      lineHeight:
        21 *
        scale,

      fontWeight:
        '800',

      letterSpacing:
        0.35 *
        scale,

      textAlign:
        'left',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Card Body
    |--------------------------------------------------------------------------
    */

    cardBody: {
      flex:
        1,

      position:
        'relative',

      overflow:
        'hidden',

      paddingTop:
        20 *
        scale,

      paddingHorizontal:
        31 *
        scale,

      paddingBottom:
        16 *
        scale,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | Watermark
    |--------------------------------------------------------------------------
    */

    watermark: {
      position:
        'absolute',

      zIndex:
        0,

      width:
        245 *
        scale,

      height:
        330 *
        scale,

      left:
        (
          cardWidth
          -
          245 *
          scale
        )
        /
        2
        -
        4 *
        scale,

      top:
        105 *
        scale,

      opacity:
        0.10,
    },


    /*
    |--------------------------------------------------------------------------
    | Program
    |--------------------------------------------------------------------------
    */

    programTitle: {
      position:
        'relative',

      zIndex:
        2,

      color:
        COLORS.maroon,

      fontSize:
        12 *
        scale,

      lineHeight:
        15 *
        scale,

      fontWeight:
        '700',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    cardSubtitle: {
      position:
        'relative',

      zIndex:
        2,

      marginTop:
        7 *
        scale,

      color:
        COLORS.darkTeal,

      fontSize:
        10 *
        scale,

      lineHeight:
        13 *
        scale,

      fontWeight:
        '400',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Photo + Component
    |--------------------------------------------------------------------------
    */

    mainRow: {
      position:
        'relative',

      zIndex:
        3,

      width:
        '100%',

      height:
        132 *
        scale,

      marginTop:
        27 *
        scale,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Student Photo
    |--------------------------------------------------------------------------
    */

    photoFrame: {
      width:
        132 *
        scale,

      height:
        132 *
        scale,

      overflow:
        'hidden',

      borderWidth:
        2 *
        scale,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.white,
    },


    studentPhoto: {
      width:
        '100%',

      height:
        '100%',

      backgroundColor:
        COLORS.white,
    },


    photoFallback: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    photoInitials: {
      color:
        COLORS.white,

      fontSize:
        34 *
        scale,

      fontWeight:
        '800',

      letterSpacing:
        1 *
        scale,
    },


    /*
    |--------------------------------------------------------------------------
    | Component
    |--------------------------------------------------------------------------
    */

    componentDetails: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        15 *
        scale,

      justifyContent:
        'center',
    },


    componentHeading: {
      marginBottom:
        10 *
        scale,

      color:
        COLORS.darkTeal,

      fontSize:
        10 *
        scale,

      lineHeight:
        13 *
        scale,

      fontWeight:
        '400',

      includeFontPadding:
        false,
    },


    componentFirstLine: {
      flexDirection:
        'row',

      alignItems:
        'baseline',
    },


    componentCode: {
      color:
        COLORS.green,

      fontFamily:
        SERIF_FONT,

      fontSize:
        13 *
        scale,

      lineHeight:
        16 *
        scale,

      fontWeight:
        '400',

      includeFontPadding:
        false,
    },


    componentDash: {
      marginLeft:
        3 *
        scale,

      color:
        COLORS.darkTeal,

      fontFamily:
        SERIF_FONT,

      fontSize:
        11 *
        scale,
    },


    componentFullName: {
      marginTop:
        1 *
        scale,

      color:
        COLORS.darkTeal,

      fontFamily:
        SERIF_FONT,

      fontSize:
        11 *
        scale,

      lineHeight:
        13 *
        scale,

      fontWeight:
        '400',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Student ID
    |--------------------------------------------------------------------------
    */

    studentIdRow: {
      position:
        'relative',

      zIndex:
        3,

      marginTop:
        13 *
        scale,

      flexDirection:
        'row',

      alignItems:
        'baseline',
    },


    studentIdLabel: {
      color:
        COLORS.nearBlack,

      fontSize:
        9.5 *
        scale,

      lineHeight:
        12 *
        scale,

      fontWeight:
        '400',

      includeFontPadding:
        false,
    },


    studentIdValue: {
      flexShrink:
        1,

      marginLeft:
        2 *
        scale,

      color:
        COLORS.nearBlack,

      fontSize:
        9.5 *
        scale,

      lineHeight:
        12 *
        scale,

      fontWeight:
        '400',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Student Name
    |--------------------------------------------------------------------------
    */

    studentNameArea: {
      position:
        'relative',

      zIndex:
        3,

      width:
        '100%',

      minHeight:
        32 *
        scale,

      marginTop:
        9 *
        scale,

      paddingHorizontal:
        2 *
        scale,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    studentName: {
      width:
        '100%',

      color:
        COLORS.maroon,

      fontFamily:
        SERIF_FONT,

      fontStyle:
        'italic',

      fontSize:
        19 *
        scale,

      lineHeight:
        22 *
        scale,

      fontWeight:
        '400',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | Course
    |--------------------------------------------------------------------------
    */

    course: {
      position:
        'relative',

      zIndex:
        3,

      width:
        '100%',

      minHeight:
        17 *
        scale,

      marginTop:
        2 *
        scale,

      color:
        COLORS.darkTeal,

      fontFamily:
        SERIF_FONT,

      fontSize:
        8.5 *
        scale,

      lineHeight:
        11 *
        scale,

      fontWeight:
        '400',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
    |--------------------------------------------------------------------------
    | QR
    |--------------------------------------------------------------------------
    */

    qrArea: {
      position:
        'relative',

      zIndex:
        5,

      width:
        qrSize,

      height:
        qrSize,

      alignSelf:
        'center',

      marginTop:
        12 *
        scale,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    qrPressable: {
      width:
        '100%',

      height:
        '100%',

      padding:
        4 *
        scale,

      backgroundColor:
        COLORS.white,
    },


    qrImage: {
      width:
        '100%',

      height:
        '100%',

      backgroundColor:
        COLORS.white,
    },


    qrUnavailable: {
      width:
        '100%',

      height:
        '100%',

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderStyle:
        'dashed',

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.white,
    },


    qrUnavailableText: {
      marginTop:
        6 *
        scale,

      color:
        COLORS.gray,

      fontSize:
        8 *
        scale,

      textAlign:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Bottom Space
    |--------------------------------------------------------------------------
    */

    bottomSpace: {
      height:
        100,
    },


    /*
    |--------------------------------------------------------------------------
    | QR Modal
    |--------------------------------------------------------------------------
    */

    modalBackdrop: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        18,

      backgroundColor:
        'rgba(0, 13, 18, 0.55)',
    },


    qrModalCard: {
      width:
        Math.min(
          screenWidth - 36,
          375
        ),

      minHeight:
        modalQrSize +
        95,

      paddingTop:
        48,

      paddingHorizontal:
        24,

      paddingBottom:
        22,

      borderWidth:
        2,

      borderColor:
        COLORS.maroon,

      borderRadius:
        8,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          8,
      },

      shadowOpacity:
        0.28,

      shadowRadius:
        12,

      elevation:
        15,
    },


    modalClose: {
      position:
        'absolute',

      top:
        11,

      right:
        11,

      width:
        38,

      height:
        38,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    modalQrImage: {
      width:
        modalQrSize,

      height:
        modalQrSize,

      backgroundColor:
        COLORS.white,
    },


    modalStudentId: {
      marginTop:
        12,

      color:
        COLORS.darkTeal,

      fontSize:
        12,

      fontWeight:
        '700',

      letterSpacing:
        0.5,
    },
  });
}
