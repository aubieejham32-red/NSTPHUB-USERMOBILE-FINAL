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
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  StatusBar,
} from 'expo-status-bar';

import Ionicons from 'react-native-vector-icons/Ionicons';

import NstpRegistrationHeader from '../../components/NstpRegistrationHeader';

import {
  getGeneralRegistration,
  getStudentUniversity,
  saveGeneralRegistration,
} from '../../services/api';


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

  inputBackground: '#F2F2F2',
  muted: '#78878D',
};


/*
|--------------------------------------------------------------------------
| Registration Options
|--------------------------------------------------------------------------
*/

const SUBJECT_OPTIONS = [
  'NSTP 1',
  'NSTP 2',
];


const DEFAULT_COMPONENT_OPTIONS = [
  'CWTS',
  'LTS',
  'ROTC',
];


const TERM_OPTIONS = [
  '1st SEM',
  '2nd SEM',
  'SUMMER',
];


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const ROUTES = {
  PRE_REGISTRATION:
    '/Registration/PreRegistrationScreen',

  GENERAL_REGISTRATION_SIGNATURE:
    '/Registration/GeneralRegistrationSignature',

  REGISTRATION_WAIT_EDIT:
    '/Registration/RegistrationWaitEdit',

  REGISTRATION_CONFIRMATION:
    '/Registration/RegistrationConfirmation',
};


/*
|--------------------------------------------------------------------------
| General Registration Screen
|--------------------------------------------------------------------------
|
| Flow:
|
| PreRegistrationScreen
|        ↓
| GeneralRegistrationScreen
|        ↓
| Save to Laravel / MySQL
|        ↓
| GeneralRegistrationSignature
|
*/

export default function GeneralRegistrationScreen() {
  const insets = useSafeAreaInsets();
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
  | Registration
  |--------------------------------------------------------------------------
  */

  const [
    registrationLoading,
    setRegistrationLoading,
  ] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | Registration Details
  |--------------------------------------------------------------------------
  */

  const [
    subject,
    setSubject,
  ] = useState('NSTP 1');


  const [
    component,
    setComponent,
  ] = useState('');


  const [
    term,
    setTerm,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Personal Details
  |--------------------------------------------------------------------------
  */

  const [
    surname,
    setSurname,
  ] = useState('');


  const [
    firstName,
    setFirstName,
  ] = useState('');


  const [
    middleName,
    setMiddleName,
  ] = useState('');


  const [
    course,
    setCourse,
  ] = useState('');


  const [
    year,
    setYear,
  ] = useState('');


  const [
    section,
    setSection,
  ] = useState('');


  const [
    gender,
    setGender,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Birthdate
  |--------------------------------------------------------------------------
  */

  const [
    birthMonth,
    setBirthMonth,
  ] = useState('');


  const [
    birthDay,
    setBirthDay,
  ] = useState('');


  const [
    birthYear,
    setBirthYear,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Address
  |--------------------------------------------------------------------------
  */

  const [
    cityAddress,
    setCityAddress,
  ] = useState('');


  const [
    municipality,
    setMunicipality,
  ] = useState('');


  const [
    province,
    setProvince,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Contact
  |--------------------------------------------------------------------------
  */

  const [
    email,
    setEmail,
  ] = useState('');


  const [
    contactNumber,
    setContactNumber,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Emergency Contact
  |--------------------------------------------------------------------------
  */

  const [
    guardianName,
    setGuardianName,
  ] = useState('');


  const [
    guardianAddress,
    setGuardianAddress,
  ] = useState('');


  const [
    guardianContact,
    setGuardianContact,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | Submission
  |--------------------------------------------------------------------------
  */

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  const loading =
    universityLoading
    ||
    registrationLoading;


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


          const loadedUniversity =
            response?.university
            ??
            null;


          setUniversity(
            loadedUniversity
          );


          /*
          |--------------------------------------------------------------------------
          | Default Component
          |--------------------------------------------------------------------------
          */

          if (
            Array.isArray(
              loadedUniversity?.components
            )
            &&
            loadedUniversity.components.length >
              0
          ) {
            setComponent(
              currentValue => {
                if (
                  currentValue
                ) {
                  return currentValue;
                }


                return String(
                  loadedUniversity.components[0]
                )
                  .trim()
                  .toUpperCase();
              }
            );
          }


          /*
          |--------------------------------------------------------------------------
          | Default Term
          |--------------------------------------------------------------------------
          */

          if (
            loadedUniversity?.semester
          ) {
            setTerm(
              currentValue => {
                if (
                  currentValue
                ) {
                  return currentValue;
                }


                return normalizeSemester(
                  loadedUniversity.semester
                );
              }
            );
          }

        } catch (error) {
          console.error(
            'General Registration University Error:',
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
  | Load Existing Registration
  |--------------------------------------------------------------------------
  |
  | This allows a saved draft to be restored when the student returns.
  |
  */

  const loadRegistration =
    useCallback(
      async () => {
        try {
          setRegistrationLoading(
            true
          );


          const response =
            await getGeneralRegistration();


          const registration =
            response?.registration
            ??
            null;


          /*
          |--------------------------------------------------------------------------
          | No Existing Registration
          |--------------------------------------------------------------------------
          */

          if (
            !registration
          ) {
            return;
          }


          /*
          |--------------------------------------------------------------------------
          | Registration Status
          |--------------------------------------------------------------------------
          */

          const status =
            String(
              registration
                ?.registration_status
              ??
              'draft'
            )
              .trim()
              .toLowerCase();


          /*
          |--------------------------------------------------------------------------
          | Already Confirmed
          |--------------------------------------------------------------------------
          */

          if (
            status ===
              'confirmed'
            ||
            status ===
              'completed'
          ) {
            router.replace(
              ROUTES.REGISTRATION_CONFIRMATION
            );


            return;
          }


          /*
          |--------------------------------------------------------------------------
          | Already Submitted / Under Review
          |--------------------------------------------------------------------------
          */

          if (
            status ===
              'submitted'
            ||
            status ===
              'under_review'
          ) {
            router.replace(
              ROUTES.REGISTRATION_WAIT_EDIT
            );


            return;
          }


          /*
          |--------------------------------------------------------------------------
          | Restore Registration Fields
          |--------------------------------------------------------------------------
          */

          if (
            registration.subject
          ) {
            setSubject(
              String(
                registration.subject
              )
            );
          }


          if (
            registration.component
          ) {
            setComponent(
              String(
                registration.component
              )
                .trim()
                .toUpperCase()
            );
          }


          if (
            registration.term
          ) {
            setTerm(
              normalizeSemester(
                registration.term
              )
            );
          }


          if (
            registration.surname
          ) {
            setSurname(
              String(
                registration.surname
              )
            );
          }


          if (
            registration.first_name
          ) {
            setFirstName(
              String(
                registration.first_name
              )
            );
          }


          if (
            registration.middle_name
          ) {
            setMiddleName(
              String(
                registration.middle_name
              )
            );
          }


          if (
            registration.course
          ) {
            setCourse(
              String(
                registration.course
              )
            );
          }


          if (
            registration.year_level
          ) {
            setYear(
              String(
                registration.year_level
              )
            );
          }


          if (
            registration.section
          ) {
            setSection(
              String(
                registration.section
              )
            );
          }


          if (
            registration.gender
          ) {
            setGender(
              String(
                registration.gender
              )
                .trim()
                .toLowerCase()
            );
          }


          /*
          |--------------------------------------------------------------------------
          | Birth Date
          |--------------------------------------------------------------------------
          */

          if (
            registration.birth_date
          ) {
            const birthDate =
              String(
                registration.birth_date
              )
                .slice(
                  0,
                  10
                );


            const parts =
              birthDate.split(
                '-'
              );


            if (
              parts.length ===
              3
            ) {
              setBirthYear(
                parts[0]
              );


              setBirthMonth(
                parts[1]
              );


              setBirthDay(
                parts[2]
              );
            }
          }


          if (
            registration.city_address
          ) {
            setCityAddress(
              String(
                registration.city_address
              )
            );
          }


          if (
            registration.municipality
          ) {
            setMunicipality(
              String(
                registration.municipality
              )
            );
          }


          if (
            registration.province
          ) {
            setProvince(
              String(
                registration.province
              )
            );
          }


          if (
            registration.email
          ) {
            setEmail(
              String(
                registration.email
              )
            );
          }


          if (
            registration.contact_number
          ) {
            setContactNumber(
              String(
                registration.contact_number
              )
            );
          }


          if (
            registration.guardian_name
          ) {
            setGuardianName(
              String(
                registration.guardian_name
              )
            );
          }


          if (
            registration.guardian_address
          ) {
            setGuardianAddress(
              String(
                registration.guardian_address
              )
            );
          }


          if (
            registration.guardian_contact_number
          ) {
            setGuardianContact(
              String(
                registration
                  .guardian_contact_number
              )
            );
          }

        } catch (error) {
          /*
          |--------------------------------------------------------------------------
          | Not Having A Registration Yet Is Fine
          |--------------------------------------------------------------------------
          |
          | If Laravel returns an error because no registration exists yet,
          | keep the form available instead of preventing registration.
          |
          */

          console.log(
            'General Registration Existing Data:',
            error
          );

        } finally {
          setRegistrationLoading(
            false
          );
        }
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Load Screen Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadUniversity();
    loadRegistration();
  }, [
    loadUniversity,
    loadRegistration,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Component Options
  |--------------------------------------------------------------------------
  */

  const componentOptions =
    useMemo(
      () => {
        if (
          Array.isArray(
            university?.components
          )
          &&
          university.components.length >
            0
        ) {
          return university.components
            .map(
              item =>
                String(
                  item
                )
                  .trim()
                  .toUpperCase()
            )
            .filter(
              Boolean
            );
        }


        return DEFAULT_COMPONENT_OPTIONS;
      },
      [
        university,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack =
    () => {
      if (
        router.canGoBack()
      ) {
        router.back();


        return;
      }


      router.replace(
        ROUTES.PRE_REGISTRATION
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Next
  |--------------------------------------------------------------------------
  |
  | Flow:
  |
  | Validate
  |    ↓
  | Save Registration To Laravel
  |    ↓
  | Laravel Saves To MySQL
  |    ↓
  | Success
  |    ↓
  | GeneralRegistrationSignature
  |
  */

  const handleNext =
    async () => {
      /*
      |--------------------------------------------------------------------------
      | Prevent Double Submission
      |--------------------------------------------------------------------------
      */

      if (
        submitting
      ) {
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Required Fields
      |--------------------------------------------------------------------------
      */

      if (
        !subject
      ) {
        showRequired(
          'Subject'
        );


        return;
      }


      if (
        !component
      ) {
        showRequired(
          'NSTP component'
        );


        return;
      }


      if (
        !term
      ) {
        showRequired(
          'Term'
        );


        return;
      }


      if (
        !surname.trim()
      ) {
        showRequired(
          'Surname'
        );


        return;
      }


      if (
        !firstName.trim()
      ) {
        showRequired(
          'First name'
        );


        return;
      }


      if (
        !course.trim()
      ) {
        showRequired(
          'Course'
        );


        return;
      }


      if (
        !year.trim()
      ) {
        showRequired(
          'Year'
        );


        return;
      }


      if (
        !section.trim()
      ) {
        showRequired(
          'Section'
        );


        return;
      }


      if (
        !gender
      ) {
        showRequired(
          'Gender'
        );


        return;
      }


      if (
        !birthMonth
        ||
        !birthDay
        ||
        !birthYear
      ) {
        showRequired(
          'Birthdate'
        );


        return;
      }


      if (
        !cityAddress.trim()
      ) {
        showRequired(
          'City address'
        );


        return;
      }


      if (
        !municipality.trim()
      ) {
        showRequired(
          'Municipality'
        );


        return;
      }


      if (
        !province.trim()
      ) {
        showRequired(
          'Province'
        );


        return;
      }


      if (
        !email.trim()
      ) {
        showRequired(
          'Email'
        );


        return;
      }


      if (
        !contactNumber.trim()
      ) {
        showRequired(
          'Contact number'
        );


        return;
      }


      if (
        !guardianName.trim()
      ) {
        showRequired(
          'Parent / guardian name'
        );


        return;
      }


      if (
        !guardianAddress.trim()
      ) {
        showRequired(
          'Parent / guardian address'
        );


        return;
      }


      if (
        !guardianContact.trim()
      ) {
        showRequired(
          'Parent / guardian contact number'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Validate Email
      |--------------------------------------------------------------------------
      */

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {
        Alert.alert(
          'Invalid email',
          'Please enter a valid email address.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Validate Birthdate
      |--------------------------------------------------------------------------
      */

      const month =
        Number(
          birthMonth
        );


      const day =
        Number(
          birthDay
        );


      const yearNumber =
        Number(
          birthYear
        );


      if (
        month < 1
        ||
        month > 12
      ) {
        Alert.alert(
          'Invalid birthdate',
          'Please enter a valid birth month.'
        );


        return;
      }


      if (
        day < 1
        ||
        day > 31
      ) {
        Alert.alert(
          'Invalid birthdate',
          'Please enter a valid birth day.'
        );


        return;
      }


      if (
        birthYear.length !==
          4
        ||
        yearNumber < 1900
      ) {
        Alert.alert(
          'Invalid birthdate',
          'Please enter a valid four-digit birth year.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Format Birthdate
      |--------------------------------------------------------------------------
      */

      const paddedMonth =
        birthMonth.padStart(
          2,
          '0'
        );


      const paddedDay =
        birthDay.padStart(
          2,
          '0'
        );


      const birthDateValue =
        `${birthYear}-${paddedMonth}-${paddedDay}`;


      /*
      |--------------------------------------------------------------------------
      | Validate Actual Calendar Date
      |--------------------------------------------------------------------------
      */

      const parsedDate =
        new Date(
          `${birthDateValue}T00:00:00`
        );


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
        ||
        parsedDate.getFullYear() !==
          yearNumber
        ||
        parsedDate.getMonth() + 1 !==
          month
        ||
        parsedDate.getDate() !==
          day
      ) {
        Alert.alert(
          'Invalid birthdate',
          'Please enter a valid calendar date.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Future Birthdate Protection
      |--------------------------------------------------------------------------
      */

      const today =
        new Date();


      today.setHours(
        0,
        0,
        0,
        0
      );


      if (
        parsedDate >
        today
      ) {
        Alert.alert(
          'Invalid birthdate',
          'Birthdate cannot be in the future.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Validate Contact Numbers
      |--------------------------------------------------------------------------
      */

      if (
        !isValidContactNumber(
          contactNumber
        )
      ) {
        Alert.alert(
          'Invalid contact number',
          'Please enter a valid contact number.'
        );


        return;
      }


      if (
        !isValidContactNumber(
          guardianContact
        )
      ) {
        Alert.alert(
          'Invalid guardian contact',
          'Please enter a valid parent or guardian contact number.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Validate Component
      |--------------------------------------------------------------------------
      */

      const normalizedComponent =
        String(
          component
        )
          .trim()
          .toUpperCase();


      if (
        !componentOptions.includes(
          normalizedComponent
        )
      ) {
        Alert.alert(
          'Invalid component',
          'Please choose a valid NSTP component.'
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Registration Payload
      |--------------------------------------------------------------------------
      |
      | These field names match Laravel / User fillable fields.
      |
      */

      const registrationData = {
        /*
        |--------------------------------------------------------------------------
        | NSTP Details
        |--------------------------------------------------------------------------
        */

        subject:
          String(
            subject
          )
            .trim()
            .toUpperCase(),

        component:
          normalizedComponent,

        term:
          String(
            term
          )
            .trim()
            .toUpperCase(),


        /*
        |--------------------------------------------------------------------------
        | Name
        |--------------------------------------------------------------------------
        */

        surname:
          surname.trim(),

        first_name:
          firstName.trim(),

        middle_name:
          middleName.trim()
          ||
          null,


        /*
        |--------------------------------------------------------------------------
        | Academic
        |--------------------------------------------------------------------------
        */

        course:
          course.trim(),

        year_level:
          year.trim(),

        section:
          section.trim(),


        /*
        |--------------------------------------------------------------------------
        | Personal Information
        |--------------------------------------------------------------------------
        */

        gender:
          String(
            gender
          )
            .trim()
            .toLowerCase(),

        birth_date:
          birthDateValue,


        /*
        |--------------------------------------------------------------------------
        | Address
        |--------------------------------------------------------------------------
        */

        city_address:
          cityAddress.trim(),

        municipality:
          municipality.trim(),

        province:
          province.trim(),


        /*
        |--------------------------------------------------------------------------
        | Contact
        |--------------------------------------------------------------------------
        */

        email:
          normalizedEmail,

        contact_number:
          contactNumber.trim(),


        /*
        |--------------------------------------------------------------------------
        | Guardian
        |--------------------------------------------------------------------------
        */

        guardian_name:
          guardianName.trim(),

        guardian_address:
          guardianAddress.trim(),

        guardian_contact_number:
          guardianContact.trim(),
      };


      /*
      |--------------------------------------------------------------------------
      | Save Registration
      |--------------------------------------------------------------------------
      */

      try {
        setSubmitting(
          true
        );


        const response =
          await saveGeneralRegistration(
            registrationData
          );


        /*
        |--------------------------------------------------------------------------
        | Laravel Success Required
        |--------------------------------------------------------------------------
        */

        if (
          response?.success !==
          true
        ) {
          throw new Error(
            response?.message
            ??
            'Laravel did not confirm that your registration was saved.'
          );
        }


        /*
        |--------------------------------------------------------------------------
        | Development Log
        |--------------------------------------------------------------------------
        */

        console.log(
          'General Registration Saved:',
          response
        );


        /*
        |--------------------------------------------------------------------------
        | Route To Signature
        |--------------------------------------------------------------------------
        */

        router.push(
          ROUTES.GENERAL_REGISTRATION_SIGNATURE
        );

      } catch (error) {
        console.error(
          'General Registration Save Error:',
          error
        );


        Alert.alert(
          'Unable to save registration',

          error instanceof Error
            ? error.message
            : 'Something went wrong while saving your registration. Please try again.'
        );

      } finally {
        setSubmitting(
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
            true
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
            Loading registration...
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


      <KeyboardAvoidingView
        style={
          styles.flex
        }
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          style={
            styles.scrollView
          }
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                Math.max(insets.bottom, 16) + 32,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
          automaticallyAdjustKeyboardInsets={
            Platform.OS === 'ios'
          }
          nestedScrollEnabled
          bounces
          overScrollMode="always"
          scrollEventThrottle={16}
          removeClippedSubviews={false}
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


          <View
            style={
              styles.content
            }
          >

            {/*
            |--------------------------------------------------------------------------
            | Back
            |--------------------------------------------------------------------------
            */}

            <View
              style={
                styles.backRow
              }
            >
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
            | Registration Details
            |--------------------------------------------------------------------------
            */}

            <SectionTitle
              title="REGISTRATION DETAILS"
            />


            <View
              style={
                styles.registrationOptions
              }
            >
              <SelectionRow
                label="SUBJECT"
                value={
                  subject
                }
                options={
                  SUBJECT_OPTIONS
                }
                onChange={
                  setSubject
                }
              />


              <SelectionRow
                label="COMPONENTS"
                value={
                  component
                }
                options={
                  componentOptions
                }
                onChange={
                  setComponent
                }
              />


              <SelectionRow
                label="TERM"
                value={
                  term
                }
                options={
                  TERM_OPTIONS
                }
                onChange={
                  setTerm
                }
              />
            </View>


            {/*
            |--------------------------------------------------------------------------
            | Personal Details
            |--------------------------------------------------------------------------
            */}

            <SectionTitle
              title="PERSONAL DETAILS"
              style={
                styles.personalTitle
              }
            />


            <FieldGroupTitle
              title="NAME"
            />


            <PillInput
              label="SURNAME"
              placeholder="Enter your surname"
              value={
                surname
              }
              onChangeText={
                setSurname
              }
              autoCapitalize="words"
            />


            <PillInput
              label="FIRST NAME"
              placeholder="Enter your first name"
              value={
                firstName
              }
              onChangeText={
                setFirstName
              }
              autoCapitalize="words"
            />


            <PillInput
              label="MIDDLE NAME"
              placeholder="Enter your middle name"
              value={
                middleName
              }
              onChangeText={
                setMiddleName
              }
              autoCapitalize="words"
            />


            {/*
            |--------------------------------------------------------------------------
            | Course / Year / Section
            |--------------------------------------------------------------------------
            */}

            <FieldGroupTitle
              title="COURSE , YR & SECTION"
              style={
                styles.largeGroupSpacing
              }
            />


            <PillInput
              label="COURSE"
              placeholder="Enter your course"
              value={
                course
              }
              onChangeText={
                setCourse
              }
              autoCapitalize="characters"
            />


            <View
              style={
                styles.yearSectionRow
              }
            >
              <CompactPillInput
                label="YEAR"
                placeholder="Enter your year"
                value={
                  year
                }
                onChangeText={
                  setYear
                }
                keyboardType="number-pad"
              />


              <CompactPillInput
                label="SECTION"
                placeholder="Enter your section"
                value={
                  section
                }
                onChangeText={
                  setSection
                }
                autoCapitalize="characters"
              />
            </View>


            {/*
            |--------------------------------------------------------------------------
            | Gender
            |--------------------------------------------------------------------------
            */}

            <View
              style={
                styles.genderRow
              }
            >
              <Text
                style={
                  styles.genderLabel
                }
              >
                GENDER
              </Text>


              <GenderOption
                label="MALE"
                selected={
                  gender ===
                  'male'
                }
                onPress={() =>
                  setGender(
                    'male'
                  )
                }
              />


              <GenderOption
                label="FEMALE"
                selected={
                  gender ===
                  'female'
                }
                onPress={() =>
                  setGender(
                    'female'
                  )
                }
              />
            </View>


            {/*
            |--------------------------------------------------------------------------
            | Birthdate
            |--------------------------------------------------------------------------
            */}

            <BirthdateBox
              month={
                birthMonth
              }
              setMonth={
                setBirthMonth
              }
              day={
                birthDay
              }
              setDay={
                setBirthDay
              }
              year={
                birthYear
              }
              setYear={
                setBirthYear
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | Address
            |--------------------------------------------------------------------------
            */}

            <FieldGroupTitle
              title="ADDRESS"
              style={
                styles.largeGroupSpacing
              }
            />


            <PillInput
              label="CITY ADDRESS"
              placeholder="Enter your city address"
              value={
                cityAddress
              }
              onChangeText={
                setCityAddress
              }
              autoCapitalize="words"
            />


            <PillInput
              label="MUNICIPALITY"
              placeholder="Enter your municipality"
              value={
                municipality
              }
              onChangeText={
                setMunicipality
              }
              autoCapitalize="words"
            />


            <PillInput
              label="PROVINCE"
              placeholder="Enter your province"
              value={
                province
              }
              onChangeText={
                setProvince
              }
              autoCapitalize="words"
            />


            {/*
            |--------------------------------------------------------------------------
            | Email And Contact
            |--------------------------------------------------------------------------
            */}

            <FieldGroupTitle
              title="EMAIL AND CONTACT NUMBER"
              style={
                styles.largeGroupSpacing
              }
            />


            <PillInput
              label="EMAIL"
              placeholder="Enter your email address"
              value={
                email
              }
              onChangeText={
                setEmail
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />


            <PillInput
              label="CONTACT"
              placeholder="Enter your contact number"
              value={
                contactNumber
              }
              onChangeText={
                setContactNumber
              }
              keyboardType="phone-pad"
            />


            {/*
            |--------------------------------------------------------------------------
            | Emergency Heading
            |--------------------------------------------------------------------------
            */}

            <Text
              style={
                styles.emergencyHeading
              }
            >
              PERSON TO BE NOTIFIED IN
              {'\n'}
              CASE OF EMERGENCY
            </Text>

          </View>


          {/*
          |--------------------------------------------------------------------------
          | Guardian Section
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.guardianSection
            }
          >
            <EmergencyInput
              label="PARENTS / GUARDIAN"
              placeholder="Enter your parents/guardian's name"
              value={
                guardianName
              }
              onChangeText={
                setGuardianName
              }
              autoCapitalize="words"
            />


            <EmergencyInput
              label="ADDRESS"
              placeholder="Enter your parents/guardian's address"
              value={
                guardianAddress
              }
              onChangeText={
                setGuardianAddress
              }
              autoCapitalize="words"
            />


            <EmergencyInput
              label="CELL NO./TELEPHONE NO."
              placeholder="Enter your parents/guardian's number"
              value={
                guardianContact
              }
              onChangeText={
                setGuardianContact
              }
              keyboardType="phone-pad"
            />
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Bottom Next
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.bottomArea
            }
          >
            <TouchableOpacity
              style={[
                styles.nextButton,

                submitting
                &&
                styles.nextButtonDisabled,
              ]}
              onPress={
                handleNext
              }
              disabled={
                submitting
              }
              activeOpacity={
                0.85
              }
            >
              {
                submitting
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
                      <Text
                        style={
                          styles.nextButtonText
                        }
                      >
                        NEXT
                      </Text>


                      <Ionicons
                        name="arrow-forward"
                        size={
                          18
                        }
                        color={
                          COLORS.white
                        }
                      />
                    </>
                  )
              }
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Section Title
|--------------------------------------------------------------------------
*/

function SectionTitle({
  title,
  style,
}) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        style,
      ]}
    >
      {title}
    </Text>
  );
}


/*
|--------------------------------------------------------------------------
| Group Title
|--------------------------------------------------------------------------
*/

function FieldGroupTitle({
  title,
  style,
}) {
  return (
    <Text
      style={[
        styles.fieldGroupTitle,
        style,
      ]}
    >
      {title}
    </Text>
  );
}


/*
|--------------------------------------------------------------------------
| Selection Row
|--------------------------------------------------------------------------
*/

function SelectionRow({
  label,
  value,
  options,
  onChange,
}) {
  const [
    visible,
    setVisible,
  ] = useState(false);


  return (
    <>
      <TouchableOpacity
        style={
          styles.selectionRow
        }
        onPress={() =>
          setVisible(
            true
          )
        }
        activeOpacity={
          0.8
        }
      >
        <View
          style={
            styles.selectionLabelBox
          }
        >
          <Text
            style={
              styles.selectionLabel
            }
          >
            {label}
          </Text>
        </View>


        <View
          style={
            styles.selectionValueBox
          }
        >
          <Text
            style={
              styles.selectionValue
            }
          >
            {
              value
              ||
              'SELECT'
            }
          </Text>


          <Ionicons
            name="chevron-down-outline"
            size={
              17
            }
            color={
              COLORS.darkTeal
            }
          />
        </View>
      </TouchableOpacity>


      <Modal
        visible={
          visible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.dropdownCard
            }
            onPress={event =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.dropdownHeader
              }
            >
              <Text
                style={
                  styles.dropdownTitle
                }
              >
                Select {label}
              </Text>


              <TouchableOpacity
                onPress={() =>
                  setVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={
                    24
                  }
                  color={
                    COLORS.maroon
                  }
                />
              </TouchableOpacity>
            </View>


            {options.map(
              option => {
                const selected =
                  option ===
                  value;


                return (
                  <TouchableOpacity
                    key={
                      option
                    }
                    style={[
                      styles.dropdownOption,

                      selected
                      &&
                      styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      onChange(
                        option
                      );


                      setVisible(
                        false
                      );
                    }}
                    activeOpacity={
                      0.7
                    }
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,

                        selected
                        &&
                        styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>


                    {
                      selected
                        ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={
                              20
                            }
                            color={
                              COLORS.green
                            }
                          />
                        )
                        : null
                    }
                  </TouchableOpacity>
                );
              }
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}


/*
|--------------------------------------------------------------------------
| Standard Pill Input
|--------------------------------------------------------------------------
*/

function PillInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  return (
    <View
      style={
        styles.pillRow
      }
    >
      <View
        style={
          styles.pillLabel
        }
      >
        <Text
          style={
            styles.pillLabelText
          }
        >
          {label}
        </Text>
      </View>


      <TextInput
        style={
          styles.pillInput
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={
          COLORS.muted
        }
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        autoCorrect={
          false
        }
        selectionColor={
          COLORS.green
        }
      />
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Compact Input
|--------------------------------------------------------------------------
*/

function CompactPillInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  return (
    <View
      style={
        styles.compactPill
      }
    >
      <View
        style={
          styles.compactPillLabel
        }
      >
        <Text
          style={
            styles.compactPillLabelText
          }
        >
          {label}
        </Text>
      </View>


      <TextInput
        style={
          styles.compactInput
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={
          COLORS.muted
        }
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        autoCorrect={
          false
        }
        selectionColor={
          COLORS.green
        }
      />
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Gender
|--------------------------------------------------------------------------
*/

function GenderOption({
  label,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={
        styles.genderOption
      }
      onPress={
        onPress
      }
      activeOpacity={
        0.7
      }
    >
      <Ionicons
        name={
          selected
            ? 'checkbox'
            : 'square-outline'
        }
        size={
          22
        }
        color={
          selected
            ? COLORS.green
            : COLORS.darkTeal
        }
      />


      <Text
        style={[
          styles.genderOptionText,

          selected
          &&
          styles.genderOptionTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}


/*
|--------------------------------------------------------------------------
| Birthdate
|--------------------------------------------------------------------------
*/

function BirthdateBox({
  month,
  setMonth,
  day,
  setDay,
  year,
  setYear,
}) {
  return (
    <View
      style={
        styles.birthdateBox
      }
    >
      <View
        style={
          styles.birthdateTitleRow
        }
      >
        <Ionicons
          name="calendar-outline"
          size={
            20
          }
          color={
            COLORS.maroon
          }
        />


        <Text
          style={
            styles.birthdateTitle
          }
        >
          BIRTHDATE
        </Text>
      </View>


      <View
        style={
          styles.birthdateInputs
        }
      >
        <TextInput
          style={
            styles.birthdateInput
          }
          placeholder="MM"
          placeholderTextColor={
            COLORS.darkTeal
          }
          value={
            month
          }
          onChangeText={
            value =>
              setMonth(
                onlyNumbers(
                  value,
                  2
                )
              )
          }
          keyboardType="number-pad"
          maxLength={
            2
          }
        />


        <TextInput
          style={
            styles.birthdateInput
          }
          placeholder="DD"
          placeholderTextColor={
            COLORS.darkTeal
          }
          value={
            day
          }
          onChangeText={
            value =>
              setDay(
                onlyNumbers(
                  value,
                  2
                )
              )
          }
          keyboardType="number-pad"
          maxLength={
            2
          }
        />


        <TextInput
          style={[
            styles.birthdateInput,
            styles.birthdateYear,
          ]}
          placeholder="YYYY"
          placeholderTextColor={
            COLORS.darkTeal
          }
          value={
            year
          }
          onChangeText={
            value =>
              setYear(
                onlyNumbers(
                  value,
                  4
                )
              )
          }
          keyboardType="number-pad"
          maxLength={
            4
          }
        />
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Emergency Input
|--------------------------------------------------------------------------
*/

function EmergencyInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  return (
    <View
      style={
        styles.emergencyField
      }
    >
      <Text
        style={
          styles.emergencyLabel
        }
      >
        {label}
      </Text>


      <TextInput
        style={
          styles.emergencyInput
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={
          COLORS.muted
        }
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        autoCorrect={
          false
        }
        selectionColor={
          COLORS.green
        }
      />
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function showRequired(
  field
) {
  Alert.alert(
    'Required field',
    `Please complete the ${field} field.`
  );
}


/*
|--------------------------------------------------------------------------
| Numbers Only
|--------------------------------------------------------------------------
*/

function onlyNumbers(
  value,
  maxLength
) {
  return String(
    value
  )
    .replace(
      /[^0-9]/g,
      ''
    )
    .slice(
      0,
      maxLength
    );
}


/*
|--------------------------------------------------------------------------
| Email Validation
|--------------------------------------------------------------------------
*/

function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      String(
        value
      )
    );
}


/*
|--------------------------------------------------------------------------
| Contact Validation
|--------------------------------------------------------------------------
*/

function isValidContactNumber(
  value
) {
  const normalized =
    String(
      value
    )
      .trim();


  /*
  |--------------------------------------------------------------------------
  | Allow:
  |
  | digits
  | +
  | -
  | spaces
  | parentheses
  |--------------------------------------------------------------------------
  */

  if (
    !/^[0-9+\-()\s]+$/
      .test(
        normalized
      )
  ) {
    return false;
  }


  const digits =
    normalized.replace(
      /\D/g,
      ''
    );


  return (
    digits.length >=
      7
    &&
    digits.length <=
      15
  );
}


/*
|--------------------------------------------------------------------------
| Semester Normalizer
|--------------------------------------------------------------------------
*/

function normalizeSemester(
  semester
) {
  const normalized =
    String(
      semester
    )
      .trim()
      .toLowerCase();


  if (
    normalized.includes(
      'first'
    )
    ||
    normalized.includes(
      '1st'
    )
  ) {
    return '1st SEM';
  }


  if (
    normalized.includes(
      'second'
    )
    ||
    normalized.includes(
      '2nd'
    )
  ) {
    return '2nd SEM';
  }


  if (
    normalized.includes(
      'summer'
    )
  ) {
    return 'SUMMER';
  }


  return String(
    semester
  )
    .trim()
    .toUpperCase();
}


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },


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

      backgroundColor:
        COLORS.cream,

      paddingBottom: 32,
    },


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    loadingContainer: {
      flex: 1,

      minHeight: 450,

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
    | Main Content
    |--------------------------------------------------------------------------
    */

    content: {
      paddingHorizontal: 26,

      paddingTop: 4,

      backgroundColor:
        COLORS.cream,
    },


    /*
    |--------------------------------------------------------------------------
    | Back
    |--------------------------------------------------------------------------
    */

    backRow: {
      minHeight: 52,

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
    | Section Title
    |--------------------------------------------------------------------------
    */

    sectionTitle: {
      color:
        COLORS.maroon,

      fontSize: 20,

      lineHeight: 27,

      textAlign: 'center',

      fontWeight: '400',

      marginBottom: 20,

      textShadowColor:
        'rgba(84,16,15,0.16)',

      textShadowOffset: {
        width: 0,

        height: 2,
      },

      textShadowRadius: 2,
    },


    personalTitle: {
      marginTop: 42,

      marginBottom: 27,
    },


    /*
    |--------------------------------------------------------------------------
    | Registration Details
    |--------------------------------------------------------------------------
    */

    registrationOptions: {
      gap: 12,
    },


    selectionRow: {
      minHeight: 59,

      flexDirection: 'row',

      borderWidth: 2,

      borderColor:
        COLORS.darkTeal,

      backgroundColor:
        COLORS.white,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 2,

        height: 3,
      },

      shadowOpacity: 0.18,

      shadowRadius: 3,

      elevation: 3,
    },


    selectionLabelBox: {
      width: '49%',

      minHeight: 55,

      backgroundColor:
        COLORS.green,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 7,
    },


    selectionLabel: {
      color:
        COLORS.white,

      fontSize: 16,

      fontWeight: '500',

      textAlign: 'center',
    },


    selectionValueBox: {
      flex: 1,

      minHeight: 55,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 20,
    },


    selectionValue: {
      flex: 1,

      color:
        COLORS.darkTeal,

      fontSize: 21,

      fontWeight: '800',

      textAlign: 'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Dropdown
    |--------------------------------------------------------------------------
    */

    modalOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(0,13,18,0.42)',

      paddingHorizontal: 28,

      justifyContent: 'center',
    },


    dropdownCard: {
      backgroundColor:
        COLORS.cream,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      padding: 18,

      elevation: 10,
    },


    dropdownHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      marginBottom: 12,
    },


    dropdownTitle: {
      color:
        COLORS.maroon,

      fontSize: 18,

      fontWeight: '700',
    },


    dropdownOption: {
      minHeight: 50,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 15,

      borderRadius: 10,

      marginTop: 7,
    },


    dropdownOptionSelected: {
      backgroundColor:
        'rgba(88,118,28,0.13)',
    },


    dropdownOptionText: {
      color:
        COLORS.darkTeal,

      fontSize: 16,

      fontWeight: '600',
    },


    dropdownOptionTextSelected: {
      color:
        COLORS.green,

      fontWeight: '800',
    },


    /*
    |--------------------------------------------------------------------------
    | Group Labels
    |--------------------------------------------------------------------------
    */

    fieldGroupTitle: {
      color:
        COLORS.maroon,

      fontSize: 16,

      marginLeft: 8,

      marginBottom: 12,
    },


    largeGroupSpacing: {
      marginTop: 30,
    },


    /*
    |--------------------------------------------------------------------------
    | Standard Pill Input
    |--------------------------------------------------------------------------
    */

    pillRow: {
      height: 52,

      flexDirection: 'row',

      alignItems: 'stretch',

      marginBottom: 10,

      borderWidth: 2,

      borderColor:
        COLORS.darkTeal,

      borderRadius: 28,

      overflow: 'hidden',

      backgroundColor:
        COLORS.inputBackground,
    },


    pillLabel: {
      width: '43%',

      backgroundColor:
        COLORS.green,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 8,
    },


    pillLabelText: {
      color:
        COLORS.white,

      fontSize: 13,

      fontWeight: '500',

      textAlign: 'center',
    },


    pillInput: {
      flex: 1,

      color:
        COLORS.dark,

      backgroundColor:
        COLORS.inputBackground,

      paddingHorizontal: 20,

      fontSize: 13,

      paddingVertical: 0,
    },


    /*
    |--------------------------------------------------------------------------
    | Year + Section
    |--------------------------------------------------------------------------
    */

    yearSectionRow: {
      flexDirection: 'row',

      gap: 8,
    },


    compactPill: {
      flex: 1,

      height: 50,

      flexDirection: 'row',

      borderWidth: 2,

      borderColor:
        COLORS.darkTeal,

      borderRadius: 26,

      overflow: 'hidden',

      backgroundColor:
        COLORS.inputBackground,
    },


    compactPillLabel: {
      width: '48%',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 3,

      backgroundColor:
        COLORS.green,
    },


    compactPillLabelText: {
      color:
        COLORS.white,

      fontSize: 12,

      fontWeight: '600',

      textAlign: 'center',
    },


    compactInput: {
      flex: 1,

      color:
        COLORS.dark,

      paddingHorizontal: 8,

      paddingVertical: 0,

      fontSize: 10,

      textAlign: 'center',

      backgroundColor:
        COLORS.inputBackground,
    },


    /*
    |--------------------------------------------------------------------------
    | Gender
    |--------------------------------------------------------------------------
    */

    genderRow: {
      marginTop: 34,

      flexDirection: 'row',

      alignItems: 'center',

      flexWrap: 'wrap',

      gap: 13,

      paddingHorizontal: 8,
    },


    genderLabel: {
      color:
        COLORS.maroon,

      fontSize: 16,

      marginRight: 2,
    },


    genderOption: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 6,
    },


    genderOptionText: {
      color:
        COLORS.darkTeal,

      fontSize: 17,

      fontWeight: '800',
    },


    genderOptionTextSelected: {
      color:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Birthdate
    |--------------------------------------------------------------------------
    */

    birthdateBox: {
      marginTop: 25,

      borderWidth: 2,

      borderColor:
        COLORS.darkTeal,

      paddingHorizontal: 14,

      paddingTop: 12,

      paddingBottom: 15,
    },


    birthdateTitleRow: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 8,

      marginBottom: 10,
    },


    birthdateTitle: {
      color:
        COLORS.maroon,

      fontSize: 16,
    },


    birthdateInputs: {
      flexDirection: 'row',

      gap: 8,
    },


    birthdateInput: {
      flex: 1,

      height: 40,

      borderWidth: 2,

      borderColor:
        COLORS.darkTeal,

      color:
        COLORS.darkTeal,

      backgroundColor:
        COLORS.white,

      fontSize: 21,

      fontWeight: '800',

      paddingHorizontal: 8,

      paddingVertical: 0,
    },


    birthdateYear: {
      flex: 1.2,
    },


    /*
    |--------------------------------------------------------------------------
    | Emergency Heading
    |--------------------------------------------------------------------------
    */

    emergencyHeading: {
      marginTop: 47,

      marginBottom: 18,

      color:
        COLORS.maroon,

      fontSize: 20,

      lineHeight: 28,

      textAlign: 'center',

      textShadowColor:
        'rgba(84,16,15,0.15)',

      textShadowOffset: {
        width: 0,

        height: 2,
      },

      textShadowRadius: 2,
    },


    /*
    |--------------------------------------------------------------------------
    | Guardian
    |--------------------------------------------------------------------------
    */

    guardianSection: {
      backgroundColor:
        COLORS.green,

      paddingHorizontal: 30,

      paddingTop: 24,

      paddingBottom: 22,
    },


    emergencyField: {
      marginBottom: 15,
    },


    emergencyLabel: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight: '600',

      marginBottom: 8,
    },


    emergencyInput: {
      height: 40,

      borderWidth: 2,

      borderColor:
        COLORS.darkTeal,

      backgroundColor:
        COLORS.inputBackground,

      color:
        COLORS.dark,

      paddingHorizontal: 15,

      paddingVertical: 0,

      fontSize: 12,
    },


    /*
    |--------------------------------------------------------------------------
    | Bottom
    |--------------------------------------------------------------------------
    */

    bottomArea: {
      minHeight: 113,

      paddingHorizontal: 30,

      alignItems: 'flex-end',

      justifyContent: 'center',

      backgroundColor:
        COLORS.cream,
    },


    nextButton: {
      minWidth: 112,

      height: 49,

      paddingHorizontal: 20,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 7,

      borderRadius: 11,

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


    nextButtonDisabled: {
      opacity: 0.65,
    },


    nextButtonText: {
      color:
        COLORS.white,

      fontSize: 15,

      fontWeight: '600',
    },
  });