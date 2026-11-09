import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useFocusEffect } from 'expo-router';

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
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Path,
  Svg,
  SvgXml,
} from 'react-native-svg';

import {
  getStudentProfile,
  updateStudentProfile,
  updateStudentProfilePhoto,
  updateStudentSignature,
} from '../../../services/api';



import {
  useAppTheme,
} from '../../../contexts/ThemeContext';

/* ==========================================================================
   COLORS
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

  paper: '#F7F3EA',
  muted: '#607178',
  softGreen: '#EEF3E7',
  softMaroon: '#F6ECEA',
  line: '#BEB8AD',

  signaturePaper: '#FFFFFF',
  signatureInk: '#233E47',
  signatureMuted: '#607178',
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




const SIGNATURE_CANVAS_WIDTH =
  1000;

const SIGNATURE_CANVAS_HEIGHT =
  400;


/* ==========================================================================
   HELPERS
   ========================================================================== */

function cleanText(
  value,
  fallback = ''
) {
  const text =
    String(
      value ?? ''
    ).trim();


  return (
    text ||
    fallback
  );
}


/* ==========================================================================
   VALUE OR DASH
   ========================================================================== */

function valueOrDash(
  value
) {
  return cleanText(
    value,
    '—'
  );
}


/* ==========================================================================
   EMPTY NAME VALUE
   ========================================================================== */

function isEmptyNameValue(
  value
) {
  const normalized =
    String(
      value ?? ''
    )
      .trim()
      .toUpperCase()
      .replace(
        /[.\s]/g,
        ''
      );


  return [
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
  );
}


/* ==========================================================================
   OPTIONAL NAME PART
   ========================================================================== */

function optionalNamePart(
  value
) {
  if (
    isEmptyNameValue(
      value
    )
  ) {
    return '';
  }


  return cleanText(
    value
  );
}


/* ==========================================================================
   FALLBACK FULL NAME
   ========================================================================== */

function sanitizeFallbackFullName(
  value
) {
  let name =
    cleanText(
      value,
      'NSTP Student'
    );


  name =
    name
      .replace(
        /\s+(N\s*\/\s*A|NA|NONE|NULL|NOT\s+APPLICABLE)\s*$/i,
        ''
      )
      .trim();


  return (
    name ||
    'NSTP Student'
  );
}


/* ==========================================================================
   BUILD DISPLAY NAME
   ========================================================================== */

function buildStudentDisplayName(
  profile,
  student
) {
  const lastName =
    cleanText(
      profile?.last_name
    );


  const firstName =
    cleanText(
      profile?.first_name
    );


  const middleName =
    optionalNamePart(
      profile?.middle_name
    );


  const extension =
    optionalNamePart(
      profile?.name_extension
    );


  const givenNames =
    [
      firstName,
      middleName,
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
    lastName
    &&
    givenNames
  ) {
    return (
      `${lastName}, ${givenNames}`
    );
  }


  if (
    givenNames
  ) {
    return givenNames;
  }


  if (
    lastName
  ) {
    return lastName;
  }


  return sanitizeFallbackFullName(
    student?.full_name
  );
}


/* ==========================================================================
   CACHE BUSTER
   ========================================================================== */

function withCacheBuster(
  url
) {
  const value =
    cleanText(
      url
    );


  if (
    !value
  ) {
    return null;
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


/* ==========================================================================
   FORMAT DATE
   ========================================================================== */

function formatDate(
  value
) {
  if (
    !value
  ) {
    return '—';
  }


  const clean =
    String(
      value
    ).substring(
      0,
      10
    );


  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      clean
    )
  ) {
    return clean;
  }


  const [
    year,
    month,
    day,
  ] =
    clean
      .split(
        '-'
      )
      .map(
        Number
      );


  const date =
    new Date(
      year,
      month - 1,
      day
    );


  return date.toLocaleDateString(
    'en-US',
    {
      month:
        '2-digit',

      day:
        '2-digit',

      year:
        'numeric',
    }
  );
}


/* ==========================================================================
   MAIN SCREEN
   ========================================================================== */

export default function StudentProfileScreen() {

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


  const contentWidth =
    Math.min(
      width - 28,
      520
    );


  /* ==========================================================================
     PROFILE DATA
     ========================================================================== */

  const [
    student,
    setStudent,
  ] =
    useState(
      null
    );


  const [
    profile,
    setProfile,
  ] =
    useState(
      null
    );


  const [
    msRecords,
    setMsRecords,
  ] =
    useState(
      []
    );


  /* ==========================================================================
     LOADING
     ========================================================================== */

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


  /* ==========================================================================
     EDIT INFORMATION
     ========================================================================== */

  const [
    editVisible,
    setEditVisible,
  ] =
    useState(
      false
    );


  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );


  const [
    form,
    setForm,
  ] =
    useState(
      {}
    );


  /* ==========================================================================
     SIGNATURE
     ========================================================================== */

  const [
    signatureSaving,
    setSignatureSaving,
  ] =
    useState(
      false
    );


  const [
    signatureModalVisible,
    setSignatureModalVisible,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     PROFILE PHOTO
     ========================================================================== */

  const [
    profilePhotoSaving,
    setProfilePhotoSaving,
  ] =
    useState(
      false
    );

  // A ref locks immediately; React state alone updates on the next render.
  // Without this guard, two rapid taps can open two pickers and upload twice.
  const photoPickerBusyRef = useRef(false);


  const [
    photoPreviewUri,
    setPhotoPreviewUri,
  ] =
    useState(
      null
    );


  /* ==========================================================================
     COMPONENT
     ========================================================================== */

  const component =
    String(
      student?.component
      ??
      ''
    )
      .trim()
      .toUpperCase();


  const isRotc =
    component ===
    'ROTC';


  /* ==========================================================================
     LOAD PROFILE
     ========================================================================== */

  const loadProfile =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (
            !silent
          ) {
            setLoading(
              true
            );
          }


          setErrorMessage(
            ''
          );


          const data =
            await getStudentProfile();


          setStudent(
            data?.student
            ??
            null
          );


          setProfile(
            data?.profile
            ??
            null
          );


          setMsRecords(
            Array.isArray(
              data?.ms_records
            )
              ? data.ms_records
              : []
          );


          setPhotoPreviewUri(
            null
          );

        } catch (
          error
        ) {
          console.log(
            'Student Profile load error:',
            error
          );


          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load your student profile.'
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


  /* ==========================================================================
     RELOAD WHEN PROFILE OPENS
     ========================================================================== */

  useFocusEffect(
    useCallback(
      () => {
        loadProfile();


        return undefined;
      },
      [
        loadProfile,
      ]
    )
  );


  /* ==========================================================================
     REFRESH
     ========================================================================== */

  const handleRefresh =
    useCallback(
      () => {
        setRefreshing(
          true
        );


        loadProfile({
          silent:
            true,
        });
      },
      [
        loadProfile,
      ]
    );


  /* ==========================================================================
     OPEN EDIT
     ========================================================================== */

  const openEdit =
    () => {
      setForm({
        last_name:
          profile?.last_name
          ??
          '',

        first_name:
          profile?.first_name
          ??
          '',

        middle_name:
          optionalNamePart(
            profile?.middle_name
          ),

        name_extension:
          optionalNamePart(
            profile?.name_extension
          ),

        gender:
          profile?.gender
          ??
          '',

        blood_type:
          profile?.blood_type
          ??
          '',

        date_of_birth:
          profile?.date_of_birth
          ??
          '',

        place_of_birth:
          profile?.place_of_birth
          ??
          '',

        height_cm:
          profile?.height_cm !==
            null
          &&
          profile?.height_cm !==
            undefined
            ? String(
                profile.height_cm
              )
            : '',

        weight_kg:
          profile?.weight_kg !==
            null
          &&
          profile?.weight_kg !==
            undefined
            ? String(
                profile.weight_kg
              )
            : '',

        complexion:
          profile?.complexion
          ??
          '',

        school_name:
          profile?.school_name
          ??
          '',

        course:
          profile?.course
          ??
          '',

        religion:
          profile?.religion
          ??
          '',

        cellphone_number:
          profile?.cellphone_number
          ??
          '',

        contact_email:
          profile?.contact_email
          ??
          '',

        temporary_address_line:
          profile?.temporary_address_line
          ??
          '',

        temporary_municipality:
          profile?.temporary_municipality
          ??
          '',

        temporary_province:
          profile?.temporary_province
          ??
          '',

        permanent_same_as_temporary:
          profile
            ?.permanent_same_as_temporary ===
          true,

        permanent_address_line:
          profile?.permanent_address_line
          ??
          '',

        permanent_municipality:
          profile?.permanent_municipality
          ??
          '',

        permanent_province:
          profile?.permanent_province
          ??
          '',

        father_name:
          profile?.father_name
          ??
          '',

        father_occupation:
          profile?.father_occupation
          ??
          '',

        mother_name:
          profile?.mother_name
          ??
          '',

        mother_occupation:
          profile?.mother_occupation
          ??
          '',

        emergency_contact_name:
          profile?.emergency_contact_name
          ??
          '',

        emergency_contact_relationship:
          profile?.emergency_contact_relationship
          ??
          '',

        emergency_contact_number:
          profile?.emergency_contact_number
          ??
          '',

        emergency_contact_address:
          profile?.emergency_contact_address
          ??
          '',

        willing_advance_course:
          profile
            ?.willing_advance_course ===
          true,
      });


      setEditVisible(
        true
      );
    };


  /* ==========================================================================
     UPDATE FIELD
     ========================================================================== */

  const updateField =
    (
      field,
      value
    ) => {
      setForm(
        current => ({
          ...current,

          [field]:
            value,
        })
      );
    };


  /* ==========================================================================
     SAVE INFORMATION
     ========================================================================== */

  const saveInformation =
    async () => {
      if (
        !cleanText(
          form?.last_name
        )
      ) {
        Alert.alert(
          'Last Name Required',
          'Please enter your last name.'
        );


        return;
      }


      if (
        !cleanText(
          form?.first_name
        )
      ) {
        Alert.alert(
          'First Name Required',
          'Please enter your first name.'
        );


        return;
      }


      try {
        setSaving(
          true
        );


        const commonPayload = {
          last_name:
            cleanText(
              form?.last_name
            ),

          first_name:
            cleanText(
              form?.first_name
            ),

          middle_name:
            optionalNamePart(
              form?.middle_name
            ),

          name_extension:
            optionalNamePart(
              form?.name_extension
            ),

          gender:
            form?.gender
            ??
            '',

          date_of_birth:
            form?.date_of_birth
            ??
            '',

          course:
            form?.course
            ??
            '',

          cellphone_number:
            form?.cellphone_number
            ??
            '',

          contact_email:
            form?.contact_email
            ??
            '',

          temporary_address_line:
            form?.temporary_address_line
            ??
            '',

          temporary_municipality:
            form?.temporary_municipality
            ??
            '',

          temporary_province:
            form?.temporary_province
            ??
            '',

          emergency_contact_name:
            form?.emergency_contact_name
            ??
            '',

          emergency_contact_relationship:
            form?.emergency_contact_relationship
            ??
            '',

          emergency_contact_number:
            form?.emergency_contact_number
            ??
            '',

          emergency_contact_address:
            form?.emergency_contact_address
            ??
            '',
        };


        const payload =
          isRotc
            ? {
                ...commonPayload,

                blood_type:
                  form?.blood_type
                  ??
                  '',

                place_of_birth:
                  form?.place_of_birth
                  ??
                  '',

                height_cm:
                  cleanText(
                    form?.height_cm
                  )
                    ? Number(
                        form.height_cm
                      )
                    : null,

                weight_kg:
                  cleanText(
                    form?.weight_kg
                  )
                    ? Number(
                        form.weight_kg
                      )
                    : null,

                complexion:
                  form?.complexion
                  ??
                  '',

                school_name:
                  form?.school_name
                  ??
                  '',

                religion:
                  form?.religion
                  ??
                  '',

                permanent_same_as_temporary:
                  form
                    ?.permanent_same_as_temporary ===
                  true,

                permanent_address_line:
                  form?.permanent_address_line
                  ??
                  '',

                permanent_municipality:
                  form?.permanent_municipality
                  ??
                  '',

                permanent_province:
                  form?.permanent_province
                  ??
                  '',

                father_name:
                  form?.father_name
                  ??
                  '',

                father_occupation:
                  form?.father_occupation
                  ??
                  '',

                mother_name:
                  form?.mother_name
                  ??
                  '',

                mother_occupation:
                  form?.mother_occupation
                  ??
                  '',

                willing_advance_course:
                  form
                    ?.willing_advance_course ===
                  true,
              }
            : commonPayload;


        const data =
          await updateStudentProfile(
            payload
          );


        setStudent(
          data?.student
          ??
          student
        );


        setProfile(
          data?.profile
          ??
          profile
        );


        setMsRecords(
          Array.isArray(
            data?.ms_records
          )
            ? data.ms_records
            : msRecords
        );


        setEditVisible(
          false
        );


        Alert.alert(
          'Information Updated',
          'Your student information has been saved successfully.'
        );

      } catch (
        error
      ) {
        Alert.alert(
          'Unable to Save',
          error instanceof Error
            ? error.message
            : 'Your student information could not be updated.'
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  /* ==========================================================================
     CHOOSE PROFILE PHOTO
     ========================================================================== */

  const chooseProfilePhoto =
    async () => {
      if (
        profilePhotoSaving || photoPickerBusyRef.current
      ) {
        return;
      }

      photoPickerBusyRef.current = true;

      try {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();


        if (
          !permission.granted
        ) {
          Alert.alert(
            'Photo Permission Required',
            'NSTP HUB needs access to your photos so you can select a profile picture.'
          );


          return;
        }


        const result =
          await ImagePicker
            .launchImageLibraryAsync({
              mediaTypes: [
                'images',
              ],

              allowsEditing:
                true,

              aspect: [
                1,
                1,
              ],

              quality:
                0.85,
            });


        if (
          result.canceled
          ||
          !result.assets
            ?.length
        ) {
          return;
        }


        const asset =
          result.assets[
            0
          ];


        if (
          !asset?.uri
        ) {
          throw new Error(
            'The selected profile photo could not be read.'
          );
        }


        const fileSize =
          Number(
            asset?.fileSize
            ??
            0
          );


        if (
          fileSize >
          5 *
          1024 *
          1024
        ) {
          Alert.alert(
            'Photo Too Large',
            'Please choose a profile photo smaller than 5 MB.'
          );


          return;
        }


        setPhotoPreviewUri(
          asset.uri
        );


        setProfilePhotoSaving(
          true
        );


        const data =
          await updateStudentProfilePhoto({
            uri:
              asset.uri,

            name:
              asset.fileName
              ??
              `student-profile-${Date.now()}.jpg`,

            mimeType:
              asset.mimeType
              ??
              'image/jpeg',
          });


        const savedPhotoUrl =
          withCacheBuster(
            data?.profile_photo_url
          );


        setStudent(
          current => ({
            ...current,

            profile_photo_url:
              savedPhotoUrl
              ??
              current?.profile_photo_url
              ??
              null,
          })
        );


        setPhotoPreviewUri(
          null
        );


        Alert.alert(
          'Profile Photo Updated',
          'Your profile photo has been saved successfully.'
        );

      } catch (
        error
      ) {
        console.log(
          'Profile photo picker/upload error:',
          error
        );


        setPhotoPreviewUri(
          null
        );


        Alert.alert(
          'Unable to Update Photo',
          error instanceof Error
            ? error.message
            : 'Your profile photo could not be updated.'
        );

      } finally {
        setProfilePhotoSaving(
          false
        );

        photoPickerBusyRef.current = false;
      }
    };


  /* ==========================================================================
     OPEN SIGNATURE
     ========================================================================== */

  const openSignatureEditor =
    () => {
      if (
        !signatureSaving
      ) {
        setSignatureModalVisible(
          true
        );
      }
    };


  /* ==========================================================================
     SAVE SIGNATURE
     ========================================================================== */

  const saveSignature =
    async (
      paths
    ) => {
      if (
        !Array.isArray(
          paths
        )
        ||
        paths.length ===
          0
      ) {
        Alert.alert(
          'Signature Required',
          'Please draw your signature inside the signature box.'
        );


        return;
      }


      try {
        setSignatureSaving(
          true
        );


        const data =
          await updateStudentSignature(
            paths
          );


        setStudent(
          current => ({
            ...current,

            signature_svg:
              data?.signature_svg
              ??
              current?.signature_svg
              ??
              null,

            signature_data_uri:
              data?.signature_data_uri
              ??
              current?.signature_data_uri
              ??
              null,

            signature_url:
              data?.signature_url
              ??
              current?.signature_url
              ??
              null,
          })
        );


        setSignatureModalVisible(
          false
        );


        Alert.alert(
          'Signature Updated',
          'Your digital signature has been saved successfully.'
        );

      } catch (
        error
      ) {
        console.log(
          'Digital signature save error:',
          error
        );


        Alert.alert(
          'Unable to Save Signature',
          error instanceof Error
            ? error.message
            : 'Your digital signature could not be updated.'
        );

      } finally {
        setSignatureSaving(
          false
        );
      }
    };


  /* ==========================================================================
     DISPLAY FULL NAME
     ========================================================================== */

  const displayFullName =
    useMemo(
      () =>
        buildStudentDisplayName(
          profile,
          student
        ),
      [
        profile,
        student,
      ]
    );


  /* ==========================================================================
     SIGNATURE SVG
     ========================================================================== */

  const signatureSvg =
    useMemo(
      () => {
        const value =
          cleanText(
            student?.signature_svg
          );


        return (
          value ||
          null
        );
      },
      [
        student?.signature_svg,
      ]
    );


  /* ==========================================================================
     SIGNATURE IMAGE FALLBACK
     ========================================================================== */

  const signatureSource =
    useMemo(
      () => {
        if (
          student?.signature_data_uri
        ) {
          return {
            uri:
              student.signature_data_uri,
          };
        }


        if (
          student?.signature_url
        ) {
          return {
            uri:
              student.signature_url,
          };
        }


        return null;
      },
      [
        student?.signature_data_uri,
        student?.signature_url,
      ]
    );


  /* ==========================================================================
     PROFILE PHOTO SOURCE
     ========================================================================== */

  const profilePhotoSource =
    useMemo(
      () => {
        if (
          photoPreviewUri
        ) {
          return {
            uri:
              photoPreviewUri,
          };
        }


        if (
          student?.profile_photo_url
        ) {
          return {
            uri:
              student.profile_photo_url,
          };
        }


        return null;
      },
      [
        photoPreviewUri,
        student?.profile_photo_url,
      ]
    );


  /* ==========================================================================
     LOADING
     ========================================================================== */

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
          barStyle={
            themeColors.cream === '#000D12'
              ? 'light-content'
              : 'dark-content'
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
              styles.loadingIcon
            }
          >
            <Ionicons
              name="person-outline"
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
            style={{
              marginTop:
                18,
            }}
          />


          <Text
            style={
              styles.loadingTitle
            }
          >
            Loading My Information
          </Text>


          <Text
            style={
              styles.loadingText
            }
          >
            Retrieving your NSTP student profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  /* ==========================================================================
     SCREEN
     ========================================================================== */

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
        barStyle="dark-content"
        backgroundColor={
          themeColors.cream
        }
      />


      <ScrollView
        style={
          styles.scroll
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
              themeColors.green,
            ]}
            tintColor={
              themeColors.green
            }
          />
        }
      >

        {/* HEADER */}

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
              styles.pageHeaderIcon
            }
          >
            <Ionicons
              name="person-circle-outline"
              size={27}
              color={
                themeColors.white
              }
            />
          </View>


          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              NSTP HUB · {component || 'STUDENT'}
            </Text>


            <Text
              style={
                styles.pageTitle
              }
            >
              My Information
            </Text>
          </View>
        </View>


        {/* COLOR RULE */}

        <View
          style={[
            styles.colorRule,
            {
              width:
                contentWidth,
            },
          ]}
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


        {/* ERROR */}

        {Boolean(
          errorMessage
        ) && (
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
              size={22}
              color={
                themeColors.maroon
              }
            />


            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage}
            </Text>
          </View>
        )}


        {/* MY INFORMATION CARD */}

        <View
          style={[
            styles.identityCard,
            {
              width:
                contentWidth,
            },
          ]}
        >
          <View
            style={
              styles.identityTop
            }
          >
            <Text
              style={
                styles.cardHeading
              }
            >
              
            </Text>


            <Pressable
              onPress={
                openEdit
              }
              style={({
                pressed,
              }) => [
                styles.editButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={17}
                color={
                  themeColors.maroon
                }
              />


              <Text
                style={
                  styles.editButtonText
                }
              >
                Edit Information
              </Text>
            </Pressable>
          </View>


          {/* PHOTO + NAME */}

          <View
            style={
              styles.identityMain
            }
          >
            <View
              style={
                styles.profilePhotoContainer
              }
            >
              <Pressable
                disabled={
                  profilePhotoSaving
                }
                onPress={
                  chooseProfilePhoto
                }
                style={({
                  pressed,
                }) => [
                  styles.photoFrame,

                  pressed &&
                    styles.photoFramePressed,
                ]}
              >
                {profilePhotoSource ? (
                  <Image
                    source={
                      profilePhotoSource
                    }
                    style={
                      styles.photo
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={58}
                    color={
                      themeColors.white
                    }
                  />
                )}


                {profilePhotoSaving && (
                  <View
                    style={
                      styles.photoSavingOverlay
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color={
                        themeColors.white
                      }
                    />
                  </View>
                )}
              </Pressable>


              <Pressable
                disabled={
                  profilePhotoSaving
                }
                onPress={
                  chooseProfilePhoto
                }
                style={({
                  pressed,
                }) => [
                  styles.photoCameraButton,

                  pressed &&
                    styles.photoCameraButtonPressed,
                ]}
              >
                {profilePhotoSaving ? (
                  <ActivityIndicator
                    size={12}
                    color={
                      themeColors.white
                    }
                  />
                ) : (
                  <Ionicons
                    name="camera"
                    size={15}
                    color={
                      themeColors.white
                    }
                  />
                )}
              </Pressable>
            </View>


            <View
              style={
                styles.identityText
              }
            >
              <Text
                style={
                  styles.studentName
                }
              >
                {displayFullName}
              </Text>


              <Text
                style={
                  styles.studentCourse
                }
              >
                {valueOrDash(
                  profile?.course
                  ??
                  student?.course
                )}
              </Text>


              <Text
                style={
                  styles.studentId
                }
              >
                ID NO.{' '}
                {valueOrDash(
                  profile?.nstp_id_no
                  ??
                  student?.student_id_number
                )}
              </Text>
            </View>
          </View>


          {/* SIGNATURE */}

          <View
            style={
              styles.signatureArea
            }
          >
            <View
              style={
                styles.signaturePreview
              }
            >
              {signatureSvg ? (
                <SvgXml
                  xml={
                    signatureSvg
                  }
                  width="100%"
                  height={72}
                />
              ) : signatureSource ? (
                <Image
                  source={
                    signatureSource
                  }
                  style={
                    styles.signatureImage
                  }
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={
                    styles.signatureEmpty
                  }
                >
                  <Ionicons
                    name="pencil-outline"
                    size={25}
                    color={
                      themeColors.gray
                    }
                  />


                  <Text
                    style={
                      styles.signatureEmptyText
                    }
                  >
                    No signature yet
                  </Text>
                </View>
              )}
            </View>


            <Text
              style={
                styles.signatureCaption
              }
            >
              Student Digital Signature
            </Text>


            <Pressable
              disabled={
                signatureSaving
              }
              onPress={
                openSignatureEditor
              }
              style={({
                pressed,
              }) => [
                styles.signatureButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              {signatureSaving ? (
                <ActivityIndicator
                  size="small"
                  color={
                    themeColors.maroon
                  }
                />
              ) : (
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={
                    themeColors.maroon
                  }
                />
              )}


              <Text
                style={
                  styles.signatureButtonText
                }
              >
                Edit Signature
              </Text>
            </Pressable>
          </View>


          <View
            style={
              styles.greenDivider
            }
          />


          <View
            style={
              styles.threeColumns
            }
          >
            <CompactItem
              label="Subject"
              value={
                student?.subject
              }
            />


            <CompactItem
              label="Term"
              value={
                student?.term
              }
            />


            <CompactItem
              label="Component"
              value={
                student?.component
              }
            />
          </View>


          <View
            style={[
              styles.threeColumns,
              {
                marginTop:
                  20,
              },
            ]}
          >
            <CompactItem
              label="Year and Section"
              value={
                [
                  student?.year_level,
                  student?.section,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    ' / '
                  )
              }
            />


            <CompactItem
              label="Gender"
              value={
                profile?.gender
              }
            />


            <CompactItem
              label="Birthday"
              value={
                formatDate(
                  profile?.date_of_birth
                )
              }
            />
          </View>
        </View>


        {/* TEMPORARY ADDRESS */}

        <ProfileSection
          width={
            contentWidth
          }
          icon="location-outline"
          title="Temporary Address"
        >
          <TwoColumn>
            <InfoItem
              label="No. / St. / Vill / Brgy"
              value={
                profile?.temporary_address_line
              }
            />


            <InfoItem
              label="Municipality"
              value={
                profile?.temporary_municipality
              }
            />
          </TwoColumn>


          <InfoItem
            label="Province"
            value={
              profile?.temporary_province
            }
          />


          <View
            style={
              styles.greenDivider
            }
          />


          <TwoColumn>
            <InfoItem
              label="Email Address"
              value={
                profile?.contact_email
              }
            />


            <InfoItem
              label="Contact"
              value={
                profile?.cellphone_number
              }
            />
          </TwoColumn>
        </ProfileSection>


        {/* PERSONAL DETAILS */}

        <ProfileSection
          width={
            contentWidth
          }
          icon="school-outline"
          title="Personal and Academic Details"
        >
          <InfoItem
            label="Course"
            value={
              profile?.course
              ??
              student?.course
            }
          />


          <InfoItem
            label="School"
            value={
              profile?.school_name
            }
          />


          <InfoItem
            label="Date of Birth"
            value={
              formatDate(
                profile?.date_of_birth
              )
            }
          />


          {isRotc && (
            <>
              <InfoItem
                label="Religion"
                value={
                  profile?.religion
                }
              />


              <InfoItem
                label="Place of Birth"
                value={
                  profile?.place_of_birth
                }
              />


              <TwoColumn>
                <InfoItem
                  label="Weight"
                  value={
                    profile?.weight_kg
                      ? `${profile.weight_kg} kg`
                      : '—'
                  }
                />


                <InfoItem
                  label="Height"
                  value={
                    profile?.height_cm
                      ? `${profile.height_cm} cm`
                      : '—'
                  }
                />
              </TwoColumn>


              <TwoColumn>
                <InfoItem
                  label="Complexion"
                  value={
                    profile?.complexion
                  }
                />


                <InfoItem
                  label="Blood Type"
                  value={
                    profile?.blood_type
                  }
                />
              </TwoColumn>
            </>
          )}
        </ProfileSection>


        {/* PERMANENT ADDRESS */}

        <ProfileSection
          width={
            contentWidth
          }
          icon="home-outline"
          title="Permanent Address"
        >
          <InfoItem
            label="No. / St. / Vill / Brgy"
            value={
              profile?.permanent_same_as_temporary
                ? profile?.temporary_address_line
                : profile?.permanent_address_line
            }
          />


          <InfoItem
            label="Municipality"
            value={
              profile?.permanent_same_as_temporary
                ? profile?.temporary_municipality
                : profile?.permanent_municipality
            }
          />


          <InfoItem
            label="Province"
            value={
              profile?.permanent_same_as_temporary
                ? profile?.temporary_province
                : profile?.permanent_province
            }
          />


          <InfoItem
            label="Contact"
            value={
              profile?.cellphone_number
            }
          />
        </ProfileSection>


        {/* PARENT INFORMATION */}

        {isRotc && (
          <ProfileSection
            width={
              contentWidth
            }
            icon="people-outline"
            title="Parent Information"
          >
            <TwoColumn>
              <InfoItem
                label="Father"
                value={
                  profile?.father_name
                }
              />


              <InfoItem
                label="Occupation"
                value={
                  profile?.father_occupation
                }
              />
            </TwoColumn>


            <TwoColumn>
              <InfoItem
                label="Mother"
                value={
                  profile?.mother_name
                }
              />


              <InfoItem
                label="Occupation"
                value={
                  profile?.mother_occupation
                }
              />
            </TwoColumn>
          </ProfileSection>
        )}


        {/* EMERGENCY CONTACT */}

        <ProfileSection
          width={
            contentWidth
          }
          icon="alert-circle-outline"
          title="Person to be notified in case of emergency"
        >
          <InfoItem
            label={
              profile?.emergency_contact_relationship
              ||
              'Parents / Guardian'
            }
            value={
              profile?.emergency_contact_name
            }
          />


          <InfoItem
            label="Address"
            value={
              profile?.emergency_contact_address
            }
          />


          <InfoItem
            label="Contact Number"
            value={
              profile?.emergency_contact_number
            }
          />
        </ProfileSection>


        {/* MILITARY SCIENCE */}

        {isRotc && (
          <>
            <ProfileSection
              width={
                contentWidth
              }
              icon="ribbon-outline"
              title="Military Science Records"
            >
              {msRecords.length >
              0 ? (
                msRecords.map(
                  (
                    record,
                    index
                  ) => (
                    <View
                      key={
                        record?.id
                        ??
                        index
                      }
                      style={[
                        styles.msRecord,

                        index >
                        0 && {
                          marginTop:
                            18,
                        },
                      ]}
                    >
                      <View
                        style={
                          styles.msRecordHeader
                        }
                      >
                        <Text
                          style={
                            styles.msTitle
                          }
                        >
                          {valueOrDash(
                            record?.ms_level
                          )}
                        </Text>


                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={
                            themeColors.green
                          }
                        />
                      </View>


                      <TwoColumn>
                        <InfoItem
                          label="Semester"
                          value={
                            record?.semester
                          }
                        />


                        <InfoItem
                          label="School Year"
                          value={
                            record?.school_year
                          }
                        />
                      </TwoColumn>


                      <TwoColumn>
                        <InfoItem
                          label="Grade"
                          value={
                            record?.grade
                          }
                        />


                        <InfoItem
                          label="Remarks"
                          value={
                            record?.remarks
                          }
                        />
                      </TwoColumn>
                    </View>
                  )
                )
              ) : (
                <View
                  style={
                    styles.emptyRecord
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={28}
                    color={
                      themeColors.gray
                    }
                  />


                  <Text
                    style={
                      styles.emptyRecordText
                    }
                  >
                    No Military Science records are available yet.
                  </Text>
                </View>
              )}
            </ProfileSection>


            <View
              style={[
                styles.advanceCard,
                {
                  width:
                    contentWidth,
                },
              ]}
            >
              <Text
                style={
                  styles.advanceQuestion
                }
              >
                Are you willing to take the advance course?
              </Text>


              <View
                style={
                  styles.advanceAnswerRow
                }
              >
                <AnswerBox
                  selected={
                    profile?.willing_advance_course ===
                    true
                  }
                  label="Yes"
                />


                <AnswerBox
                  selected={
                    profile?.willing_advance_course !==
                    true
                  }
                  label="No"
                />
              </View>
            </View>
          </>
        )}


        <View
          style={{
            height:
              150,
          }}
        />
      </ScrollView>


      {/* EDIT PROFILE MODAL */}

      <EditProfileModal
        visible={
          editVisible
        }

        form={
          form
        }

        saving={
          saving
        }

        component={
          component
        }

        isRotc={
          isRotc
        }

        onChange={
          updateField
        }

        onClose={() =>
          setEditVisible(
            false
          )
        }

        onSave={
          saveInformation
        }
      />


      {/* SIGNATURE MODAL */}

      <SignaturePadModal
        visible={
          signatureModalVisible
        }

        saving={
          signatureSaving
        }

        component={
          component
        }

        existingSignatureSvg={
          signatureSvg
        }

        onClose={() => {
          if (
            !signatureSaving
          ) {
            setSignatureModalVisible(
              false
            );
          }
        }}

        onSave={
          saveSignature
        }
      />
    </SafeAreaView>
  );
}


/* ==========================================================================
   SIGNATURE PAD MODAL
   ========================================================================== */

function SignaturePadModal({
  visible,
  saving,
  component,
  existingSignatureSvg,
  onClose,
  onSave,
}) {
  const {
    height:
      screenHeight,
  } =
    useWindowDimensions();


  const expandedCanvasHeight =
    Math.min(
      Math.max(
        screenHeight * 0.48,
        360
      ),
      520
    );


  const [
    paths,
    setPaths,
  ] =
    useState(
      []
    );


  const [
    currentPath,
    setCurrentPath,
  ] =
    useState(
      ''
    );


  const [
    isDrawing,
    setIsDrawing,
  ] =
    useState(
      false
    );


  const canvasSizeRef =
    useRef({
      width:
        1,

      height:
        1,
    });


  const currentPathRef =
    useRef(
      ''
    );


  const lastPointRef =
    useRef(
      null
    );


  useEffect(
    () => {
      if (
        visible
      ) {
        setPaths(
          []
        );


        setCurrentPath(
          ''
        );


        setIsDrawing(
          false
        );


        currentPathRef.current =
          '';


        lastPointRef.current =
          null;
      }
    },
    [
      visible,
    ]
  );


  const panResponder =
    useMemo(
      () => {
        const scaledPoint =
          event => {
            const {
              width,
              height,
            } =
              canvasSizeRef.current;


            const rawX =
              Number(
                event
                  ?.nativeEvent
                  ?.locationX
                ??
                0
              );


            const rawY =
              Number(
                event
                  ?.nativeEvent
                  ?.locationY
                ??
                0
              );


            const safeWidth =
              Math.max(
                width,
                1
              );


            const safeHeight =
              Math.max(
                height,
                1
              );


            const x =
              Math.max(
                0,
                Math.min(
                  SIGNATURE_CANVAS_WIDTH,
                  (
                    rawX
                    /
                    safeWidth
                  )
                  *
                  SIGNATURE_CANVAS_WIDTH
                )
              );


            const y =
              Math.max(
                0,
                Math.min(
                  SIGNATURE_CANVAS_HEIGHT,
                  (
                    rawY
                    /
                    safeHeight
                  )
                  *
                  SIGNATURE_CANVAS_HEIGHT
                )
              );


            return {
              x:
                Number(
                  x.toFixed(
                    1
                  )
                ),

              y:
                Number(
                  y.toFixed(
                    1
                  )
                ),
            };
          };


        const finishStroke =
          () => {
            const value =
              cleanText(
                currentPathRef.current
              );


            if (
              value
            ) {
              const lastPoint =
                lastPointRef.current
                ??
                {
                  x:
                    0,

                  y:
                    0,
                };


              const finalPath =
                value.includes(
                  ' L '
                )
                  ? value
                  : (
                      `${value} L `
                      +
                      `${lastPoint.x + 0.1} `
                      +
                      `${lastPoint.y + 0.1}`
                    );


              setPaths(
                previous => {
                  if (
                    previous.length >=
                    200
                  ) {
                    return previous;
                  }


                  return [
                    ...previous,
                    finalPath,
                  ];
                }
              );
            }


            currentPathRef.current =
              '';


            lastPointRef.current =
              null;


            setCurrentPath(
              ''
            );


            setIsDrawing(
              false
            );
          };


        return PanResponder.create({
          onStartShouldSetPanResponder:
            () => true,

          onStartShouldSetPanResponderCapture:
            () => true,

          onMoveShouldSetPanResponder:
            () => true,

          onMoveShouldSetPanResponderCapture:
            () => true,

          onPanResponderGrant:
            event => {
              setIsDrawing(
                true
              );


              const point =
                scaledPoint(
                  event
                );


              const path =
                `M ${point.x} ${point.y}`;


              currentPathRef.current =
                path;


              lastPointRef.current =
                point;


              setCurrentPath(
                path
              );
            },

          onPanResponderMove:
            event => {
              const current =
                currentPathRef.current;


              if (
                !current
              ) {
                return;
              }


              const point =
                scaledPoint(
                  event
                );


              const previousPoint =
                lastPointRef.current;


              if (
                previousPoint
              ) {
                const deltaX =
                  point.x
                  -
                  previousPoint.x;


                const deltaY =
                  point.y
                  -
                  previousPoint.y;


                const distance =
                  Math.sqrt(
                    (
                      deltaX
                      *
                      deltaX
                    )
                    +
                    (
                      deltaY
                      *
                      deltaY
                    )
                  );


                if (
                  distance <
                  2
                ) {
                  return;
                }
              }


              const nextPath =
                `${current} L ${point.x} ${point.y}`;


              if (
                nextPath.length >
                49000
              ) {
                finishStroke();

                return;
              }


              currentPathRef.current =
                nextPath;


              lastPointRef.current =
                point;


              setCurrentPath(
                nextPath
              );
            },

          onPanResponderRelease:
            finishStroke,

          onPanResponderTerminate:
            finishStroke,

          onPanResponderTerminationRequest:
            () => false,

          onShouldBlockNativeResponder:
            () => true,
        });
      },
      []
    );


  const clearSignature =
    () => {
      if (
        saving
      ) {
        return;
      }


      setPaths(
        []
      );


      setCurrentPath(
        ''
      );


      setIsDrawing(
        false
      );


      currentPathRef.current =
        '';


      lastPointRef.current =
        null;
    };


  const closeEditor =
    () => {
      if (
        saving
      ) {
        return;
      }


      clearSignature();

      onClose();
    };


  const saveDrawing =
    () => {
      if (
        saving
      ) {
        return;
      }


      const readyPaths = [
        ...paths,

        ...(
          cleanText(
            currentPathRef.current
          )
            ? [
                currentPathRef.current,
              ]
            : []
        ),
      ]
        .map(
          path =>
            cleanText(
              path
            )
        )
        .filter(
          Boolean
        );


      if (
        readyPaths.length ===
        0
      ) {
        Alert.alert(
          'Signature Required',
          'Please sign inside the box before saving.'
        );


        return;
      }


      onSave(
        readyPaths
      );
    };


  return (
    <Modal
      visible={
        visible
      }
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={
        closeEditor
      }
    >
      <SafeAreaView
        style={
          styles.signatureModalSafeArea
        }
      >
        <StatusBar
          barStyle={
            themeColors.cream === '#000D12'
              ? 'light-content'
              : 'dark-content'
          }
          backgroundColor={
            themeColors.cream
          }
        />


        {/* ================================================================
            CONSISTENT SIGNATURE HEADER
            ================================================================ */}

        <View
          style={
            styles.modalHeaderBlock
          }
        >
          <View
            style={
              styles.signatureModalHeader
            }
          >
            <View
              style={
                styles.signatureModalHeaderIcon
              }
            >
              <Ionicons
                name="pencil-outline"
                size={27}
                color={
                  themeColors.white
                }
              />
            </View>


            <View
              style={
                styles.headerTextContainer
              }
            >
              <Text
                style={
                  styles.signatureModalEyebrow
                }
              >
                NSTP HUB · {component || 'STUDENT'}
              </Text>


              <Text
                style={
                  styles.signatureModalTitle
                }
              >
                Edit Digital Signature
              </Text>
            </View>


            <Pressable
              disabled={
                saving
              }
              onPress={
                closeEditor
              }
              style={({
                pressed,
              }) => [
                styles.signatureModalCloseButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="close"
                size={27}
                color={
                  themeColors.maroon
                }
              />
            </Pressable>
          </View>


          <View
            style={
              styles.modalHeaderColorRule
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
        </View>


        <ScrollView
          style={
            styles.signatureModalScroll
          }
          contentContainerStyle={
            styles.signatureModalContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          scrollEnabled={
            !isDrawing
          }
        >

          <View
            style={
              styles.signatureInstructionCard
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={
                themeColors.green
              }
            />


            <Text
              style={
                styles.signatureInstructionText
              }
            >
              Use your finger to sign inside the large box below. The page will stay still while you are signing.
            </Text>
          </View>


          {Boolean(
            existingSignatureSvg
          ) && (
            <View
              style={
                styles.currentSignatureCard
              }
            >
              <Text
                style={
                  styles.currentSignatureLabel
                }
              >
                CURRENT SAVED SIGNATURE
              </Text>


              <View
                style={
                  styles.currentSignaturePreview
                }
              >
                <SvgXml
                  xml={
                    existingSignatureSvg
                  }
                  width="100%"
                  height={82}
                />
              </View>
            </View>
          )}


          <View
            style={
              styles.signaturePadCard
            }
          >
            <View
              style={
                styles.signaturePadTitleRow
              }
            >
              <View
                style={
                  styles.signatureTitleTextContainer
                }
              >
                <Text
                  style={
                    styles.signaturePadLabel
                  }
                >
                  SIGN HERE
                </Text>


                <Text
                  style={
                    styles.signaturePadHint
                  }
                >
                  Use the full area below for your signature
                </Text>
              </View>


              <Ionicons
                name="create-outline"
                size={25}
                color={
                  themeColors.green
                }
              />
            </View>


            <View
              onLayout={
                event => {
                  const {
                    width,
                    height,
                  } =
                    event
                      .nativeEvent
                      .layout;


                  canvasSizeRef.current = {
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
                }
              }
              style={[
                styles.signatureCanvas,

                {
                  height:
                    expandedCanvasHeight,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Svg
                width="100%"
                height="100%"
                viewBox={
                  `0 0 ${SIGNATURE_CANVAS_WIDTH} ${SIGNATURE_CANVAS_HEIGHT}`
                }
                preserveAspectRatio="none"
                pointerEvents="none"
              >
                {paths.map(
                  (
                    path,
                    index
                  ) => (
                    <Path
                      key={
                        `saved-stroke-${index}`
                      }
                      d={
                        path
                      }
                      stroke={
                        themeColors.darkTeal
                      }
                      strokeWidth={7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  )
                )}


                {Boolean(
                  currentPath
                ) && (
                  <Path
                    d={
                      currentPath
                    }
                    stroke={
                      themeColors.signatureInk
                      || themeColors.darkTeal
                    }
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </Svg>


              {paths.length ===
                0
              &&
              !currentPath && (
                <View
                  pointerEvents="none"
                  style={
                    styles.signatureCanvasPlaceholder
                  }
                >
                  <View
                    style={
                      styles.signaturePlaceholderIcon
                    }
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={36}
                      color={
                        themeColors.signatureMuted
                        || themeColors.darkTeal
                      }
                    />
                  </View>


                  <Text
                    style={
                      styles.signatureCanvasPlaceholderText
                    }
                  >
                    Sign here
                  </Text>


                  <Text
                    style={
                      styles.signatureCanvasPlaceholderSubtext
                    }
                  >
                    You can use the entire box
                  </Text>
                </View>
              )}


              <View
                pointerEvents="none"
                style={
                  styles.signatureBaseline
                }
              />
            </View>


            <View
              style={
                styles.signaturePadFooter
              }
            >
              <View>
                <Text
                  style={
                    styles.signatureStrokeCount
                  }
                >
                  {paths.length}{' '}
                  {paths.length === 1
                    ? 'stroke'
                    : 'strokes'}
                </Text>


                <Text
                  style={
                    styles.signatureDrawingHint
                  }
                >
                  Draw slowly for a smoother signature.
                </Text>
              </View>


              <Pressable
                disabled={
                  saving
                }
                onPress={
                  clearSignature
                }
                style={({
                  pressed,
                }) => [
                  styles.signatureClearButton,

                  pressed &&
                    styles.buttonPressed,
                ]}
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
                    styles.signatureClearButtonText
                  }
                >
                  Clear
                </Text>
              </Pressable>
            </View>
          </View>


          <View
            style={
              styles.signatureActionRow
            }
          >
            <Pressable
              disabled={
                saving
              }
              onPress={
                closeEditor
              }
              style={({
                pressed,
              }) => [
                styles.signatureCancelButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.signatureCancelButtonText
                }
              >
                Cancel
              </Text>
            </Pressable>


            <Pressable
              disabled={
                saving
              }
              onPress={
                saveDrawing
              }
              style={({
                pressed,
              }) => [
                styles.signatureSaveButton,

                saving &&
                  styles.disabledButton,

                pressed &&
                !saving &&
                  styles.buttonPressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={
                    themeColors.white
                  }
                />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={
                    themeColors.white
                  }
                />
              )}


              <Text
                style={
                  styles.signatureSaveButtonText
                }
              >
                {saving
                  ? 'Saving...'
                  : 'Save Signature'}
              </Text>
            </Pressable>
          </View>


          <Text
            style={
              styles.signatureSecurityText
            }
          >
            Your digital signature is securely associated with your authenticated NSTP HUB student profile.
          </Text>


          <View
            style={{
              height:
                45,
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}


/* ==========================================================================
   PROFILE SECTION
   ========================================================================== */

function ProfileSection({
  width,
  icon,
  title,
  children,
}) {
  return (
    <View
      style={[
        styles.sectionCard,
        {
          width,
        },
      ]}
    >
      <View
        style={
          styles.sectionHeader
        }
      >
        <Ionicons
          name={
            icon
          }
          size={20}
          color={
            themeColors.green
          }
        />


        <Text
          style={
            styles.sectionHeaderText
          }
        >
          {title}
        </Text>


        <View
          style={
            styles.sectionHeaderLine
          }
        />
      </View>


      {children}
    </View>
  );
}


/* ==========================================================================
   TWO COLUMN
   ========================================================================== */

function TwoColumn({
  children,
}) {
  return (
    <View
      style={
        styles.twoColumn
      }
    >
      {children}
    </View>
  );
}


/* ==========================================================================
   INFO ITEM
   ========================================================================== */

function InfoItem({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.infoItem
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
        {valueOrDash(
          value
        )}
      </Text>
    </View>
  );
}


/* ==========================================================================
   COMPACT ITEM
   ========================================================================== */

function CompactItem({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.compactItem
      }
    >
      <Text
        style={
          styles.compactLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.compactValue
        }
      >
        {valueOrDash(
          value
        )}
      </Text>
    </View>
  );
}


/* ==========================================================================
   ANSWER BOX
   ========================================================================== */

function AnswerBox({
  selected,
  label,
}) {
  return (
    <View
      style={
        styles.answerItem
      }
    >
      <View
        style={[
          styles.answerSquare,

          selected &&
            styles.answerSquareSelected,
        ]}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={16}
            color={
              themeColors.white
            }
          />
        )}
      </View>


      <Text
        style={
          styles.answerLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}


/* ==========================================================================
   EDIT PROFILE MODAL
   ========================================================================== */

function EditProfileModal({
  visible,
  form,
  saving,
  component,
  isRotc,
  onChange,
  onClose,
  onSave,
}) {
  return (
    <Modal
      visible={
        visible
      }
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={
        onClose
      }
    >
      <SafeAreaView
        style={
          styles.modalSafeArea
        }
      >
        <StatusBar
          barStyle={
            themeColors.cream === '#000D12'
              ? 'light-content'
              : 'dark-content'
          }
          backgroundColor={
            themeColors.cream
          }
        />


        <KeyboardAvoidingView
          style={
            styles.flexOne
          }
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }
        >

          {/* ================================================================
              CONSISTENT EDIT INFORMATION HEADER
              ================================================================ */}

          <View
            style={
              styles.modalHeaderBlock
            }
          >
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
                  name="person-circle-outline"
                  size={27}
                  color={
                    themeColors.white
                  }
                />
              </View>


              <View
                style={
                  styles.headerTextContainer
                }
              >
                <Text
                  style={
                    styles.modalEyebrow
                  }
                >
                  NSTP HUB · {component || 'STUDENT'}
                </Text>


                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Edit Information
                </Text>
              </View>


              <Pressable
                disabled={
                  saving
                }
                onPress={
                  onClose
                }
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={27}
                  color={
                    themeColors.maroon
                  }
                />
              </Pressable>
            </View>


            <View
              style={
                styles.modalHeaderColorRule
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
          </View>


          {/* CONTENT */}

          <ScrollView
            style={
              styles.flexOne
            }
            contentContainerStyle={
              styles.modalContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >

            <EditSection
              title="Student Name"
            >
              <EditField
                label="Last Name"
                value={
                  form?.last_name
                }
                onChangeText={
                  value =>
                    onChange(
                      'last_name',
                      value
                    )
                }
              />


              <EditField
                label="First Name"
                value={
                  form?.first_name
                }
                onChangeText={
                  value =>
                    onChange(
                      'first_name',
                      value
                    )
                }
              />


              <EditField
                label="Middle Name"
                value={
                  form?.middle_name
                }
                onChangeText={
                  value =>
                    onChange(
                      'middle_name',
                      value
                    )
                }
              />


              <EditField
                label="Name Extension"
                value={
                  form?.name_extension
                }
                onChangeText={
                  value =>
                    onChange(
                      'name_extension',
                      value
                    )
                }
                placeholder="Leave blank if none (Jr., Sr., II, III)"
              />
            </EditSection>


            <EditSection
              title="Personal Information"
            >
              <EditField
                label="Gender"
                value={
                  form?.gender
                }
                onChangeText={
                  value =>
                    onChange(
                      'gender',
                      value
                    )
                }
              />


              <EditField
                label="Date of Birth"
                value={
                  form?.date_of_birth
                }
                onChangeText={
                  value =>
                    onChange(
                      'date_of_birth',
                      value
                    )
                }
                placeholder="YYYY-MM-DD"
              />


              {isRotc && (
                <>
                  <EditField
                    label="Place of Birth"
                    value={
                      form?.place_of_birth
                    }
                    onChangeText={
                      value =>
                        onChange(
                          'place_of_birth',
                          value
                        )
                    }
                  />


                  <EditField
                    label="Blood Type"
                    value={
                      form?.blood_type
                    }
                    onChangeText={
                      value =>
                        onChange(
                          'blood_type',
                          value
                        )
                    }
                    placeholder="O+"
                  />


                  <EditField
                    label="Height (cm)"
                    value={
                      form?.height_cm
                    }
                    onChangeText={
                      value =>
                        onChange(
                          'height_cm',
                          value
                        )
                    }
                    keyboardType="decimal-pad"
                  />


                  <EditField
                    label="Weight (kg)"
                    value={
                      form?.weight_kg
                    }
                    onChangeText={
                      value =>
                        onChange(
                          'weight_kg',
                          value
                        )
                    }
                    keyboardType="decimal-pad"
                  />


                  <EditField
                    label="Complexion"
                    value={
                      form?.complexion
                    }
                    onChangeText={
                      value =>
                        onChange(
                          'complexion',
                          value
                        )
                    }
                  />
                </>
              )}
            </EditSection>


            <EditSection
              title="Academic Information"
            >
              <EditField
                label="Course"
                value={
                  form?.course
                }
                onChangeText={
                  value =>
                    onChange(
                      'course',
                      value
                    )
                }
              />


              {isRotc && (
                <>
                  <EditField
                    label="School"
                    value={
                      form?.school_name
                    }
                    onChangeText={
                      value =>
                        onChange(
                          'school_name',
                          value
                        )
                    }
                  />


                  <EditField
                    label="Religion"
                    value={
                      form?.religion
                    }
                    onChangeText={
                      value =>
                        onChange(
                          'religion',
                          value
                        )
                    }
                  />
                </>
              )}
            </EditSection>


            <EditSection
              title="Contact Information"
            >
              <EditField
                label="Cellphone Number"
                value={
                  form?.cellphone_number
                }
                onChangeText={
                  value =>
                    onChange(
                      'cellphone_number',
                      value
                    )
                }
                keyboardType="phone-pad"
              />


              <EditField
                label="Contact Email"
                value={
                  form?.contact_email
                }
                onChangeText={
                  value =>
                    onChange(
                      'contact_email',
                      value
                    )
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </EditSection>


            <EditSection
              title="Temporary Address"
            >
              <EditField
                label="No. / St. / Vill / Brgy"
                value={
                  form?.temporary_address_line
                }
                onChangeText={
                  value =>
                    onChange(
                      'temporary_address_line',
                      value
                    )
                }
              />


              <EditField
                label="Municipality"
                value={
                  form?.temporary_municipality
                }
                onChangeText={
                  value =>
                    onChange(
                      'temporary_municipality',
                      value
                    )
                }
              />


              <EditField
                label="Province"
                value={
                  form?.temporary_province
                }
                onChangeText={
                  value =>
                    onChange(
                      'temporary_province',
                      value
                    )
                }
              />
            </EditSection>


            {isRotc && (
              <EditSection
                title="Permanent Address"
              >
                <ToggleRow
                  label="Same as Temporary Address"
                  selected={
                    form?.permanent_same_as_temporary ===
                    true
                  }
                  onPress={() =>
                    onChange(
                      'permanent_same_as_temporary',
                      !form?.permanent_same_as_temporary
                    )
                  }
                />


                {!form?.permanent_same_as_temporary && (
                  <>
                    <EditField
                      label="No. / St. / Vill / Brgy"
                      value={
                        form?.permanent_address_line
                      }
                      onChangeText={
                        value =>
                          onChange(
                            'permanent_address_line',
                            value
                          )
                      }
                    />


                    <EditField
                      label="Municipality"
                      value={
                        form?.permanent_municipality
                      }
                      onChangeText={
                        value =>
                          onChange(
                            'permanent_municipality',
                            value
                          )
                      }
                    />


                    <EditField
                      label="Province"
                      value={
                        form?.permanent_province
                      }
                      onChangeText={
                        value =>
                          onChange(
                            'permanent_province',
                            value
                          )
                      }
                    />
                  </>
                )}
              </EditSection>
            )}


            {isRotc && (
              <EditSection
                title="Parent Information"
              >
                <EditField
                  label="Father"
                  value={
                    form?.father_name
                  }
                  onChangeText={
                    value =>
                      onChange(
                        'father_name',
                        value
                      )
                  }
                />


                <EditField
                  label="Father Occupation"
                  value={
                    form?.father_occupation
                  }
                  onChangeText={
                    value =>
                      onChange(
                        'father_occupation',
                        value
                      )
                  }
                />


                <EditField
                  label="Mother"
                  value={
                    form?.mother_name
                  }
                  onChangeText={
                    value =>
                      onChange(
                        'mother_name',
                        value
                      )
                  }
                />


                <EditField
                  label="Mother Occupation"
                  value={
                    form?.mother_occupation
                  }
                  onChangeText={
                    value =>
                      onChange(
                        'mother_occupation',
                        value
                      )
                  }
                />
              </EditSection>
            )}


            <EditSection
              title="Emergency Contact"
            >
              <EditField
                label="Name"
                value={
                  form?.emergency_contact_name
                }
                onChangeText={
                  value =>
                    onChange(
                      'emergency_contact_name',
                      value
                    )
                }
              />


              <EditField
                label="Relationship"
                value={
                  form?.emergency_contact_relationship
                }
                onChangeText={
                  value =>
                    onChange(
                      'emergency_contact_relationship',
                      value
                    )
                }
              />


              <EditField
                label="Contact Number"
                value={
                  form?.emergency_contact_number
                }
                onChangeText={
                  value =>
                    onChange(
                      'emergency_contact_number',
                      value
                    )
                }
                keyboardType="phone-pad"
              />


              <EditField
                label="Address"
                value={
                  form?.emergency_contact_address
                }
                onChangeText={
                  value =>
                    onChange(
                      'emergency_contact_address',
                      value
                    )
                }
                multiline
              />
            </EditSection>


            {isRotc && (
              <EditSection
                title="Advance Course"
              >
                <Text
                  style={
                    styles.editQuestion
                  }
                >
                  Are you willing to take the advance course?
                </Text>


                <View
                  style={
                    styles.choiceRow
                  }
                >
                  <ChoiceButton
                    label="Yes"
                    selected={
                      form?.willing_advance_course ===
                      true
                    }
                    onPress={() =>
                      onChange(
                        'willing_advance_course',
                        true
                      )
                    }
                  />


                  <ChoiceButton
                    label="No"
                    selected={
                      form?.willing_advance_course !==
                      true
                    }
                    onPress={() =>
                      onChange(
                        'willing_advance_course',
                        false
                      )
                    }
                  />
                </View>
              </EditSection>
            )}


            <Pressable
              disabled={
                saving
              }
              onPress={
                onSave
              }
              style={({
                pressed,
              }) => [
                styles.saveButton,

                saving &&
                  styles.disabledButton,

                pressed &&
                !saving &&
                  styles.buttonPressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={
                    themeColors.white
                  }
                />
              ) : (
                <Ionicons
                  name="save-outline"
                  size={20}
                  color={
                    themeColors.white
                  }
                />
              )}


              <Text
                style={
                  styles.saveButtonText
                }
              >
                {saving
                  ? 'SAVING...'
                  : 'SAVE INFORMATION'}
              </Text>
            </Pressable>


            <View
              style={{
                height:
                  80,
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}


/* ==========================================================================
   EDIT SECTION
   ========================================================================== */

function EditSection({
  title,
  children,
}) {
  return (
    <View
      style={
        styles.editSection
      }
    >
      <Text
        style={
          styles.editSectionTitle
        }
      >
        {title}
      </Text>


      {children}
    </View>
  );
}


/* ==========================================================================
   EDIT FIELD
   ========================================================================== */

function EditField({
  label,
  value,
  onChangeText,
  placeholder = '',
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
}) {
  return (
    <View
      style={
        styles.editField
      }
    >
      <Text
        style={
          styles.editFieldLabel
        }
      >
        {label}
      </Text>


      <TextInput
        value={
          String(
            value ?? ''
          )
        }
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={themeColors.muted}
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        multiline={
          multiline
        }
        textAlignVertical={
          multiline
            ? 'top'
            : 'center'
        }
        selectionColor={
          themeColors.maroon
        }
        style={[
          styles.editInput,

          multiline &&
            styles.editInputMultiline,
        ]}
      />
    </View>
  );
}


/* ==========================================================================
   TOGGLE ROW
   ========================================================================== */

function ToggleRow({
  label,
  selected,
  onPress,
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
      style={
        styles.toggleRow
      }
    >
      <View
        style={[
          styles.toggleBox,

          selected &&
            styles.toggleBoxSelected,
        ]}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={17}
            color={
              themeColors.white
            }
          />
        )}
      </View>


      <Text
        style={
          styles.toggleText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}


/* ==========================================================================
   CHOICE BUTTON
   ========================================================================== */

function ChoiceButton({
  label,
  selected,
  onPress,
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.choiceButton,

        selected &&
          styles.choiceButtonSelected,

        pressed &&
          styles.buttonPressed,
      ]}
    >
      <Ionicons
        name={
          selected
            ? 'radio-button-on'
            : 'radio-button-off'
        }
        size={21}
        color={
          selected
            ? themeColors.green
            : themeColors.gray
        }
      />


      <Text
        style={[
          styles.choiceText,

          selected &&
            styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}


/* ==========================================================================
   STYLES
   ========================================================================== */

const createStyles = (COLORS) =>
  StyleSheet.create({

    /* ======================================================================
       GENERAL
       ====================================================================== */

    flexOne: {
      flex:
        1,
    },


    headerTextContainer: {
      flex:
        1,

      minWidth:
        0,
    },


    safeArea: {
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
      alignItems:
        'center',

      paddingHorizontal:
        14,

      paddingTop:
        16,
    },


    buttonPressed: {
      opacity:
        0.72,

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },


    disabledButton: {
      opacity:
        0.55,
    },


    /* ======================================================================
       LOADING
       ====================================================================== */

    loadingContainer: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        30,
    },


    loadingIcon: {
      width:
        64,

      height:
        64,

      borderRadius:
        12,

      backgroundColor:
        COLORS.darkTeal,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    loadingTitle: {
      marginTop:
        15,

      color:
        COLORS.maroon,

      fontSize:
        23,

      fontWeight:
        '800',
    },


    loadingText: {
      marginTop:
        6,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      textAlign:
        'center',
    },


    /* ======================================================================
       MAIN HEADER
       ====================================================================== */

    pageHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    pageHeaderIcon: {
      width:
        54,

      height:
        54,

      marginRight:
        13,

      borderRadius:
        10,

      backgroundColor:
        COLORS.darkTeal,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    eyebrow: {
      color:
        COLORS.green,

      fontSize:
        11,

      fontWeight:
        '900',

      letterSpacing:
        1.2,
    },


    pageTitle: {
      marginTop:
        2,

      color:
        COLORS.maroon,

      fontSize:
        27,

      fontWeight:
        '900',
    },


    colorRule: {
      height:
        4,

      marginTop:
        14,

      marginBottom:
        20,

      flexDirection:
        'row',
    },


    ruleGreen: {
      flex:
        1.3,

      backgroundColor:
        COLORS.green,
    },


    ruleYellow: {
      flex:
        0.75,

      backgroundColor:
        COLORS.yellow,
    },


    ruleOrange: {
      flex:
        0.45,

      backgroundColor:
        COLORS.orange,
    },


    /* ======================================================================
       CONSISTENT MODAL HEADER
       ====================================================================== */

    modalHeaderBlock: {
      width:
        '100%',

      backgroundColor:
        COLORS.cream,
    },


    modalHeaderColorRule: {
      height:
        4,

      marginHorizontal:
        14,

      flexDirection:
        'row',
    },


    errorBox: {
      marginBottom:
        16,

      padding:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      backgroundColor:
        COLORS.softMaroon,

      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },


    errorText: {
      flex:
        1,

      marginLeft:
        9,

      color:
        COLORS.maroon,

      fontSize:
        16,

      lineHeight:
        24,
    },


    /* ======================================================================
       IDENTITY CARD
       ====================================================================== */

    identityCard: {
      padding:
        15,

      borderWidth:
        2,

      borderColor:
        COLORS.maroon,

      borderRadius:
        14,

      backgroundColor:
        COLORS.cream,

      flexShrink:
        1,
    },


    identityTop: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      columnGap:
        10,

      marginBottom:
        18,
    },


    cardHeading: {
      flexShrink:
        1,

      color:
        COLORS.maroon,

      fontSize:
        20,

      fontWeight:
        '900',
    },


    editButton: {
      minHeight:
        38,

      paddingHorizontal:
        11,

      borderWidth:
        1.5,

      borderColor:
        COLORS.maroon,

      borderRadius:
        9,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,

      flexShrink:
        0,
    },


    editButtonText: {
      marginLeft:
        5,

      color:
        COLORS.maroon,

      fontSize:
        14,

      fontWeight:
        '800',
    },


    identityMain: {
      flexDirection:
        'row',

      alignItems:
        'center',

      minHeight:
        118,
    },


    /* ======================================================================
       PROFILE PHOTO
       ====================================================================== */

    profilePhotoContainer: {
      width:
        118,

      height:
        118,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',

      flexShrink:
        0,
    },


    photoFrame: {
      width:
        108,

      height:
        108,

      borderWidth:
        2,

      borderColor:
        COLORS.maroon,

      borderRadius:
        14,

      backgroundColor:
        COLORS.muted,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',
    },


    photoFramePressed: {
      opacity:
        0.78,

      transform: [
        {
          scale:
            0.97,
        },
      ],
    },


    photo: {
      width:
        '100%',

      height:
        '100%',
    },


    photoSavingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(0, 13, 18, 0.48)',
    },


    photoCameraButton: {
      position:
        'absolute',

      right:
        0,

      bottom:
        0,

      width:
        36,

      height:
        36,

      borderRadius:
        18,

      borderWidth:
        3,

      borderColor:
        COLORS.cream,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.green,

      elevation:
        6,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          2,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        4,
    },


    photoCameraButtonPressed: {
      opacity:
        0.76,

      transform: [
        {
          scale:
            0.92,
        },
      ],
    },


    identityText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        13,

      justifyContent:
        'center',
    },


    studentName: {
      color:
        COLORS.green,

      fontSize:
        18,

      lineHeight:
        23,

      fontWeight:
        '700',

      flexShrink:
        1,
    },


    studentCourse: {
      marginTop:
        3,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      lineHeight:
        19,
    },


    studentId: {
      marginTop:
        8,

      color:
        COLORS.maroon,

      fontSize:
        13,

      lineHeight:
        18,

      fontWeight:
        '700',
    },


    signatureArea: {
      marginTop:
        18,

      alignSelf:
        'stretch',

      alignItems:
        'flex-end',
    },


    signaturePreview: {
      width:
        190,

      height:
        76,

      maxHeight:
        76,

      overflow:
        'hidden',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    signatureImage: {
      width:
        '100%',

      height:
        72,
    },


    signatureEmpty: {
      height:
        72,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    signatureEmptyText: {
      marginTop:
        3,

      color:
        COLORS.muted,

      fontSize:
        12,
    },


    signatureCaption: {
      width:
        190,

      marginTop:
        2,

      color:
        COLORS.darkTeal,

      fontSize:
        11,

      textAlign:
        'center',
    },


    signatureButton: {
      minHeight:
        36,

      marginTop:
        7,

      paddingHorizontal:
        10,

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,

      borderRadius:
        8,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.white,
    },


    signatureButtonText: {
      marginLeft:
        5,

      color:
        COLORS.maroon,

      fontSize:
        12,

      fontWeight:
        '700',
    },


    greenDivider: {
      height:
        5,

      marginTop:
        20,

      marginBottom:
        18,

      borderRadius:
        3,

      backgroundColor:
        COLORS.green,
    },


    threeColumns: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      columnGap:
        12,
    },


    compactItem: {
      flex:
        1,

      minWidth:
        0,
    },


    compactLabel: {
      color:
        COLORS.muted,

      fontSize:
        13,

      lineHeight:
        17,
    },


    compactValue: {
      marginTop:
        5,

      color:
        COLORS.maroon,

      fontSize:
        15,

      lineHeight:
        20,

      fontWeight:
        '700',
    },


    sectionCard: {
      marginTop:
        28,

      padding:
        18,

      borderWidth:
        2,

      borderColor:
        COLORS.maroon,

      borderRadius:
        14,

      backgroundColor:
        COLORS.cream,
    },


    sectionHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        19,
    },


    sectionHeaderText: {
      marginLeft:
        7,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      fontWeight:
        '800',

      flexShrink:
        1,
    },


    sectionHeaderLine: {
      flex:
        1,

      height:
        1,

      marginLeft:
        12,

      backgroundColor:
        COLORS.gray,
    },


    twoColumn: {
      flexDirection:
        'row',

      columnGap:
        20,
    },


    infoItem: {
      flex:
        1,

      minWidth:
        0,

      marginBottom:
        18,
    },


    infoLabel: {
      color:
        COLORS.muted,

      fontSize:
        14,

      lineHeight:
        18,
    },


    infoValue: {
      marginTop:
        5,

      color:
        COLORS.maroon,

      fontSize:
        16,

      lineHeight:
        22,

      fontWeight:
        '600',
    },


    msRecord: {
      paddingBottom:
        4,
    },


    msRecordHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom:
        14,
    },


    msTitle: {
      color:
        COLORS.maroon,

      fontSize:
        18,

      fontWeight:
        '800',
    },


    emptyRecord: {
      minHeight:
        120,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    emptyRecordText: {
      marginTop:
        8,

      color:
        COLORS.muted,

      fontSize:
        14,

      textAlign:
        'center',
    },


    advanceCard: {
      marginTop:
        28,

      padding:
        22,

      borderWidth:
        2,

      borderColor:
        COLORS.maroon,

      borderRadius:
        14,

      backgroundColor:
        COLORS.cream,
    },


    advanceQuestion: {
      color:
        COLORS.maroon,

      fontSize:
        19,

      lineHeight:
        25,

      fontWeight:
        '600',
    },


    advanceAnswerRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      columnGap:
        36,

      marginTop:
        18,
    },


    answerItem: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    answerSquare: {
      width:
        23,

      height:
        23,

      borderWidth:
        2,

      borderColor:
        COLORS.green,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    answerSquareSelected: {
      backgroundColor:
        COLORS.green,

      borderColor:
        COLORS.green,
    },


    answerLabel: {
      marginLeft:
        8,

      color:
        COLORS.maroon,

      fontSize:
        17,
    },


    /* ======================================================================
       SIGNATURE MODAL
       ====================================================================== */

    signatureModalSafeArea: {
      flex:
        1,

      backgroundColor:
        COLORS.cream,
    },


    signatureModalHeader: {
      minHeight:
        88,

      paddingHorizontal:
        14,

      paddingVertical:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    signatureModalHeaderIcon: {
      width:
        54,

      height:
        54,

      marginRight:
        13,

      borderRadius:
        10,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    signatureModalEyebrow: {
      color:
        COLORS.green,

      fontSize:
        11,

      fontWeight:
        '900',

      letterSpacing:
        1.2,
    },


    signatureModalTitle: {
      marginTop:
        2,

      color:
        COLORS.maroon,

      fontSize:
        24,

      lineHeight:
        29,

      fontWeight:
        '900',
    },


    signatureModalCloseButton: {
      width:
        46,

      height:
        46,

      marginLeft:
        8,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        23,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    signatureModalScroll: {
      flex:
        1,
    },


    signatureModalContent: {
      paddingHorizontal:
        10,

      paddingTop:
        14,

      paddingBottom:
        16,
    },


    signatureInstructionCard: {
      padding:
        14,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        12,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      backgroundColor:
        COLORS.softGreen,
    },


    signatureInstructionText: {
      flex:
        1,

      marginLeft:
        10,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      lineHeight:
        24,

      fontWeight:
        '600',
    },


    currentSignatureCard: {
      marginTop:
        14,

      padding:
        12,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        12,

      backgroundColor:
        COLORS.white,
    },


    currentSignatureLabel: {
      marginBottom:
        8,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      fontWeight:
        '800',

      textTransform:
        'uppercase',

      letterSpacing:
        0.7,
    },


    currentSignaturePreview: {
      width:
        '100%',

      height:
        82,

      maxHeight:
        82,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      borderRadius:
        8,

      backgroundColor:
        COLORS.signaturePaper,
    },


    signaturePadCard: {
      marginTop:
        14,

      padding:
        10,

      borderWidth:
        2,

      borderColor:
        COLORS.maroon,

      borderRadius:
        14,

      backgroundColor:
        COLORS.paper,
    },


    signaturePadTitleRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom:
        10,
    },


    signatureTitleTextContainer: {
      flex:
        1,

      minWidth:
        0,

      paddingRight:
        10,
    },


    signaturePadLabel: {
      color:
        COLORS.maroon,

      fontSize:
        18,

      fontWeight:
        '900',

      letterSpacing:
        0.8,
    },


    signaturePadHint: {
      marginTop:
        3,

      color:
        COLORS.muted,

      fontSize:
        15,

      lineHeight:
        21,
    },


    signatureCanvas: {
      width:
        '100%',

      minHeight:
        360,

      position:
        'relative',

      overflow:
        'hidden',

      borderWidth:
        2,

      borderColor:
        COLORS.darkTeal,

      borderRadius:
        12,

      backgroundColor:
        COLORS.signaturePaper,
    },


    signatureCanvasPlaceholder: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    signaturePlaceholderIcon: {
      width:
        58,

      height:
        58,

      borderRadius:
        29,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.signaturePaper,
    },


    signatureCanvasPlaceholderText: {
      marginTop:
        9,

      color:
        COLORS.signatureMuted,

      fontSize:
        20,

      fontWeight:
        '800',
    },


    signatureCanvasPlaceholderSubtext: {
      marginTop:
        4,

      color:
        COLORS.signatureMuted,

      fontSize:
        14,
    },


    signatureBaseline: {
      position:
        'absolute',

      left:
        30,

      right:
        30,

      bottom:
        55,

      height:
        1,

      backgroundColor:
        COLORS.line,
    },


    signaturePadFooter: {
      minHeight:
        62,

      paddingTop:
        10,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      columnGap:
        10,
    },


    signatureStrokeCount: {
      color:
        COLORS.darkTeal,

      fontSize:
        13,

      fontWeight:
        '700',
    },


    signatureDrawingHint: {
      marginTop:
        2,

      color:
        COLORS.muted,

      fontSize:
        10,
    },


    signatureClearButton: {
      minHeight:
        42,

      paddingHorizontal:
        14,

      borderWidth:
        1.5,

      borderColor:
        COLORS.maroon,

      borderRadius:
        9,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    signatureClearButtonText: {
      marginLeft:
        6,

      color:
        COLORS.maroon,

      fontSize:
        14,

      fontWeight:
        '800',
    },


    signatureActionRow: {
      marginTop:
        18,

      flexDirection:
        'row',

      columnGap:
        12,
    },


    signatureCancelButton: {
      flex:
        0.9,

      minHeight:
        54,

      borderWidth:
        1.5,

      borderColor:
        COLORS.maroon,

      borderRadius:
        27,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    signatureCancelButtonText: {
      color:
        COLORS.maroon,

      fontSize:
        14,

      fontWeight:
        '900',
    },


    signatureSaveButton: {
      flex:
        1.4,

      minHeight:
        54,

      borderRadius:
        27,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.maroon,
    },


    signatureSaveButtonText: {
      marginLeft:
        7,

      color:
        COLORS.white,

      fontSize:
        14,

      fontWeight:
        '900',
    },


    signatureSecurityText: {
      marginTop:
        14,

      paddingHorizontal:
        8,

      color:
        COLORS.muted,

      fontSize:
        11,

      lineHeight:
        16,

      textAlign:
        'center',
    },


    /* ======================================================================
       EDIT MODAL
       ====================================================================== */

    modalSafeArea: {
      flex:
        1,

      backgroundColor:
        COLORS.cream,
    },


    modalHeader: {
      minHeight:
        88,

      paddingHorizontal:
        14,

      paddingVertical:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.cream,
    },


    modalHeaderIcon: {
      width:
        54,

      height:
        54,

      marginRight:
        13,

      borderRadius:
        10,

      backgroundColor:
        COLORS.darkTeal,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    modalEyebrow: {
      color:
        COLORS.green,

      fontSize:
        11,

      letterSpacing:
        1.2,

      fontWeight:
        '900',
    },


    modalTitle: {
      marginTop:
        2,

      color:
        COLORS.maroon,

      fontSize:
        27,

      lineHeight:
        32,

      fontWeight:
        '900',
    },


    closeButton: {
      width:
        46,

      height:
        46,

      marginLeft:
        8,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        23,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    modalContent: {
      padding:
        16,

      paddingTop:
        18,
    },


    editSection: {
      marginBottom:
        18,

      padding:
        16,

      borderWidth:
        1.5,

      borderColor:
        COLORS.maroon,

      borderRadius:
        12,

      backgroundColor:
        COLORS.paper,
    },


    editSectionTitle: {
      marginBottom:
        7,

      color:
        COLORS.maroon,

      fontSize:
        18,

      fontWeight:
        '900',
    },


    editField: {
      marginTop:
        13,
    },


    editFieldLabel: {
      marginBottom:
        6,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      fontWeight:
        '700',
    },


    editInput: {
      minHeight:
        51,

      paddingHorizontal:
        12,

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,

      borderRadius:
        6,

      backgroundColor:
        COLORS.white,

      color:
        COLORS.darkTeal,

      fontSize:
        16,
    },


    editInputMultiline: {
      minHeight:
        90,

      paddingTop:
        12,
    },


    toggleRow: {
      minHeight:
        50,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    toggleBox: {
      width:
        24,

      height:
        24,

      borderWidth:
        2,

      borderColor:
        COLORS.green,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    toggleBoxSelected: {
      backgroundColor:
        COLORS.green,

      borderColor:
        COLORS.green,
    },


    toggleText: {
      marginLeft:
        10,

      color:
        COLORS.darkTeal,

      fontSize:
        16,
    },


    editQuestion: {
      marginTop:
        8,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      lineHeight:
        22,
    },


    choiceRow: {
      flexDirection:
        'row',

      columnGap:
        12,

      marginTop:
        13,
    },


    choiceButton: {
      flex:
        1,

      minHeight:
        50,

      paddingHorizontal:
        12,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        7,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    choiceButtonSelected: {
      borderColor:
        COLORS.green,

      backgroundColor:
        COLORS.softGreen,
    },


    choiceText: {
      marginLeft:
        7,

      color:
        COLORS.darkTeal,

      fontSize:
        16,
    },


    choiceTextSelected: {
      color:
        COLORS.green,

      fontWeight:
        '800',
    },


    saveButton: {
      minHeight:
        56,

      borderRadius:
        28,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.maroon,
    },


    saveButtonText: {
      marginLeft:
        8,

      color:
        COLORS.white,

      fontSize:
        15,

      fontWeight:
        '900',

      letterSpacing:
        0.3,
    },
  });
