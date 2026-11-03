import {
  router,
  Stack,
} from 'expo-router';

import {
  useCallback,
  useEffect,
  useRef,
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
} from 'react-native-safe-area-context';

import {
  StatusBar,
} from 'expo-status-bar';

import Ionicons from 'react-native-vector-icons/Ionicons';

import NstpRegistrationHeader from '../../../components/NstpRegistrationHeader';

import {
  getRotcEnrollment,
  saveRotcEnrollmentStepFour,
  saveRotcEnrollmentStepOne,
  saveRotcEnrollmentStepThree,
  saveRotcEnrollmentStepTwo,
} from '../../../services/api';


/*
|--------------------------------------------------------------------------
| Colors
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

  inputBackground: '#FBFAF7',
  muted: '#73858C',
  softOrange: '#F3D58C',
};


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const ROUTES = {
  GENERAL_CONFIRMATION:
    '/Registration/RegistrationConfirmation',

  ROTC_CONFIRM_ENROLLMENT:
    '/Registration/ROTC/RotcConfirmEnrollment',
};


/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

const MS_LEVEL_OPTIONS = [
  'MS 1',
  'MS 2',
  'MS 3',
  'MS 4',
];

const GENDER_OPTIONS = [
  'Male',
  'Female',
];

const BLOOD_TYPE_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown',
];

const SEMESTER_OPTIONS = [
  '1st Sem',
  '2nd Sem',
  'Summer',
];


/*
|--------------------------------------------------------------------------
| Default MS Record
|--------------------------------------------------------------------------
*/

function createEmptyMsRecord(
  schoolYear = '',
  msLevel = 'MS 1'
) {
  return {
    local_id:
      `${Date.now()}-${Math.random()}`,

    ms_level:
      msLevel,

    semester:
      '1st Sem',

    school_year:
      schoolYear,

    grade:
      '',

    remarks:
      '',
  };
}


/*
|--------------------------------------------------------------------------
| ROTC Enrollment
|--------------------------------------------------------------------------
*/

export default function RotcEnrollment() {
  const scrollRef =
    useRef(null);


  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    university,
    setUniversity,
  ] = useState(null);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);


  /*
  |--------------------------------------------------------------------------
  | STEP 1
  |--------------------------------------------------------------------------
  */

  const [
    nstpIdNo,
    setNstpIdNo,
  ] = useState('');

  const [
    msLevel,
    setMsLevel,
  ] = useState('MS 1');

  const [
    lastName,
    setLastName,
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
    nameExtension,
    setNameExtension,
  ] = useState('');

  const [
    gender,
    setGender,
  ] = useState('');

  const [
    bloodType,
    setBloodType,
  ] = useState('');

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

  const [
    placeOfBirth,
    setPlaceOfBirth,
  ] = useState('');

  const [
    heightCm,
    setHeightCm,
  ] = useState('');

  const [
    weightKg,
    setWeightKg,
  ] = useState('');

  const [
    complexion,
    setComplexion,
  ] = useState('');

  const [
    schoolName,
    setSchoolName,
  ] = useState('');

  const [
    course,
    setCourse,
  ] = useState('');

  const [
    religion,
    setReligion,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | STEP 2
  |--------------------------------------------------------------------------
  */

  const [
    cellphoneNumber,
    setCellphoneNumber,
  ] = useState('');

  const [
    contactEmail,
    setContactEmail,
  ] = useState('');

  const [
    temporaryAddressLine,
    setTemporaryAddressLine,
  ] = useState('');

  const [
    temporaryMunicipality,
    setTemporaryMunicipality,
  ] = useState('');

  const [
    temporaryProvince,
    setTemporaryProvince,
  ] = useState('');

  const [
    permanentSameAsTemporary,
    setPermanentSameAsTemporary,
  ] = useState(true);

  const [
    permanentAddressLine,
    setPermanentAddressLine,
  ] = useState('');

  const [
    permanentMunicipality,
    setPermanentMunicipality,
  ] = useState('');

  const [
    permanentProvince,
    setPermanentProvince,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | STEP 3
  |--------------------------------------------------------------------------
  */

  const [
    fatherName,
    setFatherName,
  ] = useState('');

  const [
    fatherOccupation,
    setFatherOccupation,
  ] = useState('');

  const [
    motherName,
    setMotherName,
  ] = useState('');

  const [
    motherOccupation,
    setMotherOccupation,
  ] = useState('');

  const [
    emergencyContactName,
    setEmergencyContactName,
  ] = useState('');

  const [
    emergencyRelationship,
    setEmergencyRelationship,
  ] = useState('');

  const [
    emergencyContactNumber,
    setEmergencyContactNumber,
  ] = useState('');

  const [
    emergencyContactAddress,
    setEmergencyContactAddress,
  ] = useState('');


  /*
  |--------------------------------------------------------------------------
  | STEP 4
  |--------------------------------------------------------------------------
  */

  const [
    msRecords,
    setMsRecords,
  ] = useState([]);

  const [
    willingAdvanceCourse,
    setWillingAdvanceCourse,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | Move To Step
  |--------------------------------------------------------------------------
  */

  const moveToStep =
    useCallback(
      step => {
        setCurrentStep(
          step
        );

        setTimeout(
          () => {
            scrollRef
              .current
              ?.scrollTo({
                y: 0,
                animated: true,
              });
          },
          50
        );
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Load ROTC Enrollment
  |--------------------------------------------------------------------------
  */

  const loadEnrollment =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );


          const response =
            await getRotcEnrollment();


          const loadedUniversity =
            response?.university
            ??
            null;


          const stepOne =
            response?.step_1
            ??
            {};


          const stepTwo =
            response?.step_2
            ??
            {};


          const stepThree =
            response?.step_3
            ??
            {};


          const stepFour =
            response?.step_4
            ??
            {};


          const profile =
            response?.rotc_profile
            ??
            null;


          /*
          |--------------------------------------------------------------------------
          | Completed Already
          |--------------------------------------------------------------------------
          */

          if (
            response
              ?.progress
              ?.is_completed
          ) {
            router.replace(
              ROUTES.ROTC_CONFIRM_ENROLLMENT
            );

            return;
          }


          /*
          |--------------------------------------------------------------------------
          | University
          |--------------------------------------------------------------------------
          */

          setUniversity(
            loadedUniversity
          );


          /*
          |--------------------------------------------------------------------------
          | STEP 1
          |--------------------------------------------------------------------------
          */

          setNstpIdNo(
            String(
              stepOne
                ?.nstp_id_no
              ??
              ''
            )
          );


          setMsLevel(
            stepOne
              ?.ms_level
            ??
            'MS 1'
          );


          setLastName(
            stepOne
              ?.last_name
            ??
            ''
          );


          setFirstName(
            stepOne
              ?.first_name
            ??
            ''
          );


          setMiddleName(
            stepOne
              ?.middle_name
            ??
            ''
          );


          setNameExtension(
            stepOne
              ?.name_extension
            ??
            ''
          );


          if (
            stepOne?.gender
          ) {
            const normalized =
              String(
                stepOne.gender
              )
                .toLowerCase();


            setGender(
              normalized ===
              'male'
                ? 'Male'
                : normalized ===
                  'female'
                  ? 'Female'
                  : ''
            );
          }


          setBloodType(
            stepOne
              ?.blood_type
            ??
            ''
          );


          if (
            stepOne
              ?.date_of_birth
          ) {
            const parts =
              String(
                stepOne
                  .date_of_birth
              )
                .split('-');


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


          setPlaceOfBirth(
            stepOne
              ?.place_of_birth
            ??
            ''
          );


          setHeightCm(
            stepOne
              ?.height_cm
              ?.toString()
            ??
            ''
          );


          setWeightKg(
            stepOne
              ?.weight_kg
              ?.toString()
            ??
            ''
          );


          setComplexion(
            stepOne
              ?.complexion
            ??
            ''
          );


          setSchoolName(
            stepOne
              ?.school_name
            ??
            loadedUniversity
              ?.name
            ??
            ''
          );


          setCourse(
            stepOne
              ?.course
            ??
            ''
          );


          setReligion(
            stepOne
              ?.religion
            ??
            ''
          );


          /*
          |--------------------------------------------------------------------------
          | STEP 2
          |--------------------------------------------------------------------------
          */

          setCellphoneNumber(
            stepTwo
              ?.cellphone_number
            ??
            ''
          );


          setContactEmail(
            stepTwo
              ?.contact_email
            ??
            ''
          );


          setTemporaryAddressLine(
            stepTwo
              ?.temporary_address_line
            ??
            ''
          );


          setTemporaryMunicipality(
            stepTwo
              ?.temporary_municipality
            ??
            ''
          );


          setTemporaryProvince(
            stepTwo
              ?.temporary_province
            ??
            ''
          );


          const samePermanent =
            stepTwo
              ?.permanent_same_as_temporary;


          setPermanentSameAsTemporary(
            samePermanent ===
            undefined
              ? true
              : Boolean(
                  samePermanent
                )
          );


          setPermanentAddressLine(
            stepTwo
              ?.permanent_address_line
            ??
            ''
          );


          setPermanentMunicipality(
            stepTwo
              ?.permanent_municipality
            ??
            ''
          );


          setPermanentProvince(
            stepTwo
              ?.permanent_province
            ??
            ''
          );


          /*
          |--------------------------------------------------------------------------
          | STEP 3
          |--------------------------------------------------------------------------
          */

          setFatherName(
            stepThree
              ?.father_name
            ??
            ''
          );


          setFatherOccupation(
            stepThree
              ?.father_occupation
            ??
            ''
          );


          setMotherName(
            stepThree
              ?.mother_name
            ??
            ''
          );


          setMotherOccupation(
            stepThree
              ?.mother_occupation
            ??
            ''
          );


          setEmergencyContactName(
            stepThree
              ?.emergency_contact_name
            ??
            ''
          );


          setEmergencyRelationship(
            stepThree
              ?.emergency_contact_relationship
            ??
            ''
          );


          setEmergencyContactNumber(
            stepThree
              ?.emergency_contact_number
            ??
            ''
          );


          setEmergencyContactAddress(
            stepThree
              ?.emergency_contact_address
            ??
            ''
          );


          /*
          |--------------------------------------------------------------------------
          | STEP 4
          |--------------------------------------------------------------------------
          */

          if (
            Array.isArray(
              stepFour?.ms_records
            )
            &&
            stepFour
              .ms_records
              .length >
              0
          ) {
            setMsRecords(
              stepFour
                .ms_records
                .map(
                  (
                    record,
                    index
                  ) => ({
                    local_id:
                      String(
                        record?.id
                        ??
                        `${Date.now()}-${index}`
                      ),

                    ms_level:
                      record
                        ?.ms_level
                      ??
                      'MS 1',

                    semester:
                      record
                        ?.semester
                      ??
                      '1st Sem',

                    school_year:
                      record
                        ?.school_year
                      ??
                      loadedUniversity
                        ?.academic_year
                      ??
                      '',

                    grade:
                      record
                        ?.grade
                        ?.toString()
                      ??
                      '',

                    remarks:
                      record
                        ?.remarks
                      ??
                      '',
                  })
                )
            );

          } else {
            // New cadets have no previous MS records.
            setMsRecords([]);
          }


          if (
            stepFour
              ?.willing_advance_course
            !==
            null
            &&
            stepFour
              ?.willing_advance_course
            !==
            undefined
          ) {
            setWillingAdvanceCourse(
              Boolean(
                stepFour
                  .willing_advance_course
              )
            );
          }


          /*
          |--------------------------------------------------------------------------
          | Resume Saved Step
          |--------------------------------------------------------------------------
          */

          const resumeStep =
            Number(
              response
                ?.progress
                ?.current_step
              ??
              1
            );


          setCurrentStep(
            Math.min(
              Math.max(
                resumeStep,
                1
              ),
              4
            )
          );

        } catch (
          error
        ) {
          console.error(
            'ROTC Enrollment Load Error:',
            error
          );


          Alert.alert(
            'Unable to load ROTC enrollment',

            error instanceof Error
              ? error.message
              : 'Unable to load your ROTC enrollment information.'
          );

        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {
      loadEnrollment();
    },
    [
      loadEnrollment,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Step 1 Validation
  |--------------------------------------------------------------------------
  */

  const buildStepOneData =
    () => {
      if (
        !nstpIdNo.trim()
      ) {
        showRequired(
          'NSTP ID No.'
        );

        return null;
      }


      if (
        !msLevel
      ) {
        showRequired(
          'MS Level'
        );

        return null;
      }


      if (
        !lastName.trim()
      ) {
        showRequired(
          'Last Name'
        );

        return null;
      }


      if (
        !firstName.trim()
      ) {
        showRequired(
          'First Name'
        );

        return null;
      }


      if (
        !gender
      ) {
        showRequired(
          'Gender'
        );

        return null;
      }


      if (
        !bloodType
      ) {
        showRequired(
          'Blood Type'
        );

        return null;
      }


      if (
        !birthMonth
        ||
        !birthDay
        ||
        !birthYear
      ) {
        showRequired(
          'Date of Birth'
        );

        return null;
      }


      if (
        !placeOfBirth.trim()
      ) {
        showRequired(
          'Place of Birth'
        );

        return null;
      }


      if (
        !heightCm.trim()
      ) {
        showRequired(
          'Height'
        );

        return null;
      }


      if (
        !weightKg.trim()
      ) {
        showRequired(
          'Weight'
        );

        return null;
      }


      if (
        !complexion.trim()
      ) {
        showRequired(
          'Complexion'
        );

        return null;
      }


      if (
        !schoolName.trim()
      ) {
        showRequired(
          'School'
        );

        return null;
      }


      if (
        !course.trim()
      ) {
        showRequired(
          'Course'
        );

        return null;
      }


      const month =
        Number(
          birthMonth
        );


      const day =
        Number(
          birthDay
        );


      const year =
        Number(
          birthYear
        );


      if (
        !isRealDate(
          year,
          month,
          day
        )
      ) {
        Alert.alert(
          'Invalid birth date',
          'Please enter a valid date of birth.'
        );

        return null;
      }


      const dateValue =
        `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;


      return {
        /*
        |--------------------------------------------------------------------------
        | Displayed for reference.
        | Laravel will use the student's assigned NSTP ID.
        |--------------------------------------------------------------------------
        */

        nstp_id_no:
          nstpIdNo.trim(),

        ms_level:
          msLevel,

        last_name:
          lastName.trim(),

        first_name:
          firstName.trim(),

        middle_name:
          nullableText(
            middleName
          ),

        name_extension:
          nullableText(
            nameExtension
          ),

        gender:
          gender
            .toLowerCase(),

        blood_type:
          bloodType,

        date_of_birth:
          dateValue,

        place_of_birth:
          placeOfBirth.trim(),

        height_cm:
          Number(
            heightCm
          ),

        weight_kg:
          Number(
            weightKg
          ),

        complexion:
          complexion.trim(),

        school_name:
          schoolName.trim(),

        course:
          course.trim(),

        religion:
          nullableText(
            religion
          ),
      };
    };


  /*
  |--------------------------------------------------------------------------
  | Step 2 Validation
  |--------------------------------------------------------------------------
  */

  const buildStepTwoData =
    () => {
      if (
        !cellphoneNumber.trim()
      ) {
        showRequired(
          'Cellphone No.'
        );

        return null;
      }


      if (
        !contactEmail.trim()
      ) {
        showRequired(
          'Email Address'
        );

        return null;
      }


      if (
        !isValidEmail(
          contactEmail
        )
      ) {
        Alert.alert(
          'Invalid email',
          'Please enter a valid email address.'
        );

        return null;
      }


      if (
        !temporaryAddressLine.trim()
      ) {
        showRequired(
          'Temporary Address'
        );

        return null;
      }


      if (
        !temporaryMunicipality.trim()
      ) {
        showRequired(
          'Temporary Municipality'
        );

        return null;
      }


      if (
        !temporaryProvince.trim()
      ) {
        showRequired(
          'Temporary Province'
        );

        return null;
      }


      if (
        !permanentSameAsTemporary
      ) {
        if (
          !permanentAddressLine.trim()
        ) {
          showRequired(
            'Permanent Address'
          );

          return null;
        }


        if (
          !permanentMunicipality.trim()
        ) {
          showRequired(
            'Permanent Municipality'
          );

          return null;
        }


        if (
          !permanentProvince.trim()
        ) {
          showRequired(
            'Permanent Province'
          );

          return null;
        }
      }


      return {
        cellphone_number:
          cellphoneNumber.trim(),

        contact_email:
          contactEmail
            .trim()
            .toLowerCase(),

        temporary_address_line:
          temporaryAddressLine.trim(),

        temporary_municipality:
          temporaryMunicipality.trim(),

        temporary_province:
          temporaryProvince.trim(),

        permanent_same_as_temporary:
          permanentSameAsTemporary,

        permanent_address_line:
          permanentSameAsTemporary
            ? temporaryAddressLine.trim()
            : permanentAddressLine.trim(),

        permanent_municipality:
          permanentSameAsTemporary
            ? temporaryMunicipality.trim()
            : permanentMunicipality.trim(),

        permanent_province:
          permanentSameAsTemporary
            ? temporaryProvince.trim()
            : permanentProvince.trim(),
      };
    };


  /*
  |--------------------------------------------------------------------------
  | Step 3 Validation
  |--------------------------------------------------------------------------
  */

  const buildStepThreeData =
    () => {
      if (
        !fatherName.trim()
      ) {
        showRequired(
          "Father's Name"
        );

        return null;
      }


      if (
        !fatherOccupation.trim()
      ) {
        showRequired(
          "Father's Occupation"
        );

        return null;
      }


      if (
        !motherName.trim()
      ) {
        showRequired(
          "Mother's Name"
        );

        return null;
      }


      if (
        !motherOccupation.trim()
      ) {
        showRequired(
          "Mother's Occupation"
        );

        return null;
      }


      if (
        !emergencyContactName.trim()
      ) {
        showRequired(
          'Emergency Contact Name'
        );

        return null;
      }


      if (
        !emergencyRelationship.trim()
      ) {
        showRequired(
          'Emergency Relationship'
        );

        return null;
      }


      if (
        !emergencyContactNumber.trim()
      ) {
        showRequired(
          'Emergency Contact Number'
        );

        return null;
      }


      if (
        !emergencyContactAddress.trim()
      ) {
        showRequired(
          'Emergency Contact Address'
        );

        return null;
      }


      return {
        father_name:
          fatherName.trim(),

        father_occupation:
          fatherOccupation.trim(),

        mother_name:
          motherName.trim(),

        mother_occupation:
          motherOccupation.trim(),

        emergency_contact_name:
          emergencyContactName.trim(),

        emergency_contact_relationship:
          emergencyRelationship.trim(),

        emergency_contact_number:
          emergencyContactNumber.trim(),

        emergency_contact_address:
          emergencyContactAddress.trim(),
      };
    };


  /*
  |--------------------------------------------------------------------------
  | Step 4 Validation
  |--------------------------------------------------------------------------
  */

  // Previous MS records are optional. Advance Course is required.
  // A record with a grade or remarks counts as started and must be completed.
  const buildStepFourData = () => {
    if (typeof willingAdvanceCourse !== 'boolean') {
      Alert.alert('Advance Course required', 'Please select Yes or No before submitting your ROTC enrollment.');
      return null;
    }

    const recordsToSave = [];

    for (let index = 0; index < msRecords.length; index += 1) {
      const record = msRecords[index];
      const grade = String(record?.grade ?? '').trim();
      const remarks = String(record?.remarks ?? '').trim();

      // The untouched placeholder record is optional.
      if (!grade && !remarks) continue;

      const number = index + 1;
      if (!record?.ms_level) {
        showRequired(`Record ${number} MS Level`);
        return null;
      }
      if (!record?.semester) {
        showRequired(`Record ${number} Semester`);
        return null;
      }
      if (!String(record?.school_year ?? '').trim()) {
        showRequired(`Record ${number} School Year`);
        return null;
      }
      if (!grade) {
        showRequired(`Record ${number} Grade`);
        return null;
      }
      if (!remarks) {
        showRequired(`Record ${number} Remarks`);
        return null;
      }
      if (!Number.isFinite(Number(grade)) || Number(grade) < 0 || Number(grade) > 100) {
        Alert.alert('Invalid grade', `Record ${number} must have a grade between 0 and 100.`);
        return null;
      }

      recordsToSave.push({
        ms_level: record.ms_level,
        semester: record.semester,
        school_year: String(record.school_year).trim(),
        grade: Number(grade),
        remarks,
      });
    }

    return {
      ms_records: recordsToSave,
      willing_advance_course: willingAdvanceCourse,
    };
  };


  /*
  |--------------------------------------------------------------------------
  | Continue / Submit
  |--------------------------------------------------------------------------
  */

  const handleContinue =
    async () => {
      if (
        saving
      ) {
        return;
      }


      try {
        /*
        |--------------------------------------------------------------------------
        | STEP 1
        |--------------------------------------------------------------------------
        */

        if (
          currentStep ===
          1
        ) {
          const data =
            buildStepOneData();


          if (
            !data
          ) {
            return;
          }


          setSaving(
            true
          );


          await saveRotcEnrollmentStepOne(
            data
          );


          moveToStep(
            2
          );

          return;
        }


        /*
        |--------------------------------------------------------------------------
        | STEP 2
        |--------------------------------------------------------------------------
        */

        if (
          currentStep ===
          2
        ) {
          const data =
            buildStepTwoData();


          if (
            !data
          ) {
            return;
          }


          setSaving(
            true
          );


          await saveRotcEnrollmentStepTwo(
            data
          );


          moveToStep(
            3
          );

          return;
        }


        /*
        |--------------------------------------------------------------------------
        | STEP 3
        |--------------------------------------------------------------------------
        */

        if (
          currentStep ===
          3
        ) {
          const data =
            buildStepThreeData();


          if (
            !data
          ) {
            return;
          }


          setSaving(
            true
          );


          await saveRotcEnrollmentStepThree(
            data
          );


          moveToStep(
            4
          );

          return;
        }


        /*
        |--------------------------------------------------------------------------
        | STEP 4 - FINAL SUBMIT
        |--------------------------------------------------------------------------
        */

        const data =
          buildStepFourData();


        if (
          !data
        ) {
          return;
        }


        setSaving(
          true
        );


        const response =
          await saveRotcEnrollmentStepFour(
            data
          );


        router.replace(
          response
            ?.next_screen
          ??
          ROUTES.ROTC_CONFIRM_ENROLLMENT
        );

      } catch (
        error
      ) {
        console.error(
          `ROTC Step ${currentStep} Error:`,
          error
        );


        Alert.alert(
          currentStep === 4
            ? 'Unable to submit ROTC enrollment'
            : `Unable to save Step ${currentStep}`,

          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.'
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack =
    () => {
      if (
        saving
      ) {
        return;
      }


      if (
        currentStep >
        1
      ) {
        moveToStep(
          currentStep - 1
        );

        return;
      }


      router.replace(
        ROUTES.GENERAL_CONFIRMATION
      );
    };


  /*
  |--------------------------------------------------------------------------
  | MS Records
  |--------------------------------------------------------------------------
  */

  const updateMsRecord =
    (
      index,
      field,
      value
    ) => {
      setMsRecords(
        previous =>
          previous.map(
            (
              record,
              recordIndex
            ) =>
              recordIndex ===
              index
                ? {
                    ...record,
                    [field]:
                      value,
                  }
                : record
          )
      );
    };


  const addMsRecord =
    () => {
      if (
        msRecords.length >=
        8
      ) {
        Alert.alert(
          'Record limit',
          'A maximum of 8 MS records can be added.'
        );

        return;
      }


      setMsRecords(
        previous => [
          ...previous,

          createEmptyMsRecord(
            university
              ?.academic_year
            ??
            '',
            msLevel
          ),
        ]
      );
    };


  const removeMsRecord =
    index => {
      setMsRecords(
        previous =>
          previous.filter(
            (
              _,
              recordIndex
            ) =>
              recordIndex !==
              index
          )
      );
    };


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
              COLORS.orange
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


      <KeyboardAvoidingView
        style={
          styles.flex
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          ref={
            scrollRef
          }
          style={
            styles.scrollView
          }
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
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
            | Heading
            |--------------------------------------------------------------------------
            */}

            <View
              style={
                styles.titleArea
              }
            >
              <View
                style={
                  styles.titleIcon
                }
              >
                <Ionicons
                  name="shield-outline"
                  size={
                    25
                  }
                  color={
                    COLORS.maroon
                  }
                />
              </View>


              <Text
                style={
                  styles.pageTitle
                }
              >
                ROTC
                {'\n'}
                ENROLLMENT
              </Text>
            </View>


            <StepProgress
              currentStep={
                currentStep
              }
              totalSteps={
                4
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | STEP 1
            |--------------------------------------------------------------------------
            */}

            {currentStep ===
              1 && (
              <>
                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <FormField
                    style={
                      styles.flexField
                    }
                    label="NSTP ID NO."
                    placeholder="NSTP ID"
                    value={
                      nstpIdNo
                    }
                    editable={
                      false
                    }
                  />


                  <DropdownField
                    style={
                      styles.flexField
                    }
                    label="MS Level"
                    value={
                      msLevel
                    }
                    placeholder="Select"
                    options={
                      MS_LEVEL_OPTIONS
                    }
                    onChange={
                      setMsLevel
                    }
                  />
                </View>


                <SectionHeading
                  title="NAME"
                  icon="person-outline"
                />


                <FormField
                  label="Last Name"
                  placeholder="e.g Siega"
                  value={
                    lastName
                  }
                  onChangeText={
                    setLastName
                  }
                  autoCapitalize="words"
                />


                <FormField
                  label="First Name"
                  placeholder="e.g Aubrey"
                  value={
                    firstName
                  }
                  onChangeText={
                    setFirstName
                  }
                  autoCapitalize="words"
                />


                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Middle Name"
                    placeholder="e.g Olaguir"
                    value={
                      middleName
                    }
                    onChangeText={
                      setMiddleName
                    }
                    autoCapitalize="words"
                  />


                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Ex."
                    placeholder="e.g Jr."
                    value={
                      nameExtension
                    }
                    onChangeText={
                      setNameExtension
                    }
                    autoCapitalize="words"
                  />
                </View>


                <SectionHeading
                  title="PERSONAL DETAILS"
                  icon="person-circle-outline"
                />


                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <DropdownField
                    style={
                      styles.flexField
                    }
                    label="Gender"
                    value={
                      gender
                    }
                    placeholder="Select"
                    options={
                      GENDER_OPTIONS
                    }
                    onChange={
                      setGender
                    }
                  />


                  <DropdownField
                    style={
                      styles.flexField
                    }
                    label="Blood Type"
                    value={
                      bloodType
                    }
                    placeholder="Select"
                    options={
                      BLOOD_TYPE_OPTIONS
                    }
                    onChange={
                      setBloodType
                    }
                  />
                </View>


                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <BirthDateField
                    style={
                      styles.flexField
                    }
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


                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Place of Birth"
                    placeholder="e.g Surigao City"
                    value={
                      placeOfBirth
                    }
                    onChangeText={
                      setPlaceOfBirth
                    }
                    autoCapitalize="words"
                  />
                </View>


                <View
                  style={
                    styles.threeColumnRow
                  }
                >
                  <FormField
                    style={
                      styles.thirdField
                    }
                    label="Height (cm)"
                    placeholder="e.g 165"
                    value={
                      heightCm
                    }
                    onChangeText={
                      value =>
                        setHeightCm(
                          decimalOnly(
                            value
                          )
                        )
                    }
                    keyboardType="decimal-pad"
                  />


                  <FormField
                    style={
                      styles.thirdField
                    }
                    label="Weight (kg)"
                    placeholder="e.g 58"
                    value={
                      weightKg
                    }
                    onChangeText={
                      value =>
                        setWeightKg(
                          decimalOnly(
                            value
                          )
                        )
                    }
                    keyboardType="decimal-pad"
                  />


                  <FormField
                    style={
                      styles.thirdField
                    }
                    label="Complexion"
                    placeholder="e.g Fair"
                    value={
                      complexion
                    }
                    onChangeText={
                      setComplexion
                    }
                    autoCapitalize="words"
                  />
                </View>


                <SectionHeading
                  title="ACADEMIC"
                  icon="school-outline"
                />


                <FormField
                  label="School"
                  placeholder="University"
                  value={
                    schoolName
                  }
                  onChangeText={
                    setSchoolName
                  }
                  autoCapitalize="words"
                />


                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Course"
                    placeholder="e.g BS InfoTech"
                    value={
                      course
                    }
                    onChangeText={
                      setCourse
                    }
                    autoCapitalize="words"
                  />


                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Religion"
                    placeholder="e.g Roman Catholic"
                    value={
                      religion
                    }
                    onChangeText={
                      setReligion
                    }
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}


            {/*
            |--------------------------------------------------------------------------
            | STEP 2
            |--------------------------------------------------------------------------
            */}

            {currentStep ===
              2 && (
              <>
                <SectionHeading
                  title="REACH YOU AT"
                  icon="call-outline"
                />


                <FormField
                  label="Cellphone No."
                  placeholder="09XX XXX XXXX"
                  value={
                    cellphoneNumber
                  }
                  onChangeText={
                    setCellphoneNumber
                  }
                  keyboardType="phone-pad"
                />


                <FormField
                  label="Email Address"
                  placeholder="e.g student@school.edu.ph"
                  value={
                    contactEmail
                  }
                  onChangeText={
                    setContactEmail
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />


                <SectionHeading
                  title="TEMPORARY ADDRESS"
                  icon="location-outline"
                />


                <FormField
                  label="No. / Street / Sitio / Brgy."
                  placeholder="e.g 123 Narciso St., Brgy. Washington"
                  value={
                    temporaryAddressLine
                  }
                  onChangeText={
                    setTemporaryAddressLine
                  }
                  autoCapitalize="words"
                />


                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Municipality"
                    placeholder="e.g Surigao City"
                    value={
                      temporaryMunicipality
                    }
                    onChangeText={
                      setTemporaryMunicipality
                    }
                    autoCapitalize="words"
                  />


                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Province"
                    placeholder="e.g Surigao del Norte"
                    value={
                      temporaryProvince
                    }
                    onChangeText={
                      setTemporaryProvince
                    }
                    autoCapitalize="words"
                  />
                </View>


                <SectionHeading
                  title="PERMANENT ADDRESS"
                  icon="home-outline"
                />


                <View
                  style={
                    styles.choiceRow
                  }
                >
                  <ChoiceButton
                    label="Same as temporary"
                    selected={
                      permanentSameAsTemporary
                    }
                    onPress={() =>
                      setPermanentSameAsTemporary(
                        true
                      )
                    }
                  />


                  <ChoiceButton
                    label="Different"
                    selected={
                      !permanentSameAsTemporary
                    }
                    onPress={() =>
                      setPermanentSameAsTemporary(
                        false
                      )
                    }
                  />
                </View>


                {!permanentSameAsTemporary && (
                  <>
                    <FormField
                      label="No. / Street / Village / Brgy."
                      placeholder="Permanent address"
                      value={
                        permanentAddressLine
                      }
                      onChangeText={
                        setPermanentAddressLine
                      }
                      autoCapitalize="words"
                    />


                    <View
                      style={
                        styles.twoColumnRow
                      }
                    >
                      <FormField
                        style={
                          styles.flexField
                        }
                        label="Municipality"
                        placeholder="Municipality"
                        value={
                          permanentMunicipality
                        }
                        onChangeText={
                          setPermanentMunicipality
                        }
                        autoCapitalize="words"
                      />


                      <FormField
                        style={
                          styles.flexField
                        }
                        label="Province"
                        placeholder="Province"
                        value={
                          permanentProvince
                        }
                        onChangeText={
                          setPermanentProvince
                        }
                        autoCapitalize="words"
                      />
                    </View>
                  </>
                )}
              </>
            )}


            {/*
            |--------------------------------------------------------------------------
            | STEP 3
            |--------------------------------------------------------------------------
            */}

            {currentStep ===
              3 && (
              <>
                <SectionHeading
                  title="PARENTS"
                  icon="people-outline"
                />


                <FormField
                  label="Father's Name"
                  placeholder="e.g Pedro Pandero"
                  value={
                    fatherName
                  }
                  onChangeText={
                    setFatherName
                  }
                  autoCapitalize="words"
                />


                <FormField
                  label="Father's Occupation"
                  placeholder="e.g Farmer"
                  value={
                    fatherOccupation
                  }
                  onChangeText={
                    setFatherOccupation
                  }
                  autoCapitalize="words"
                />


                <FormField
                  label="Mother's Name"
                  placeholder="e.g Maria Pandero"
                  value={
                    motherName
                  }
                  onChangeText={
                    setMotherName
                  }
                  autoCapitalize="words"
                />


                <FormField
                  label="Mother's Occupation"
                  placeholder="e.g Teacher"
                  value={
                    motherOccupation
                  }
                  onChangeText={
                    setMotherOccupation
                  }
                  autoCapitalize="words"
                />


                <SectionHeading
                  title="IN CASE OF EMERGENCY"
                  icon="alert-circle-outline"
                />


                <FormField
                  label="Contact Name"
                  placeholder="e.g Anna Cruz"
                  value={
                    emergencyContactName
                  }
                  onChangeText={
                    setEmergencyContactName
                  }
                  autoCapitalize="words"
                />


                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Relationship"
                    placeholder="e.g Sister"
                    value={
                      emergencyRelationship
                    }
                    onChangeText={
                      setEmergencyRelationship
                    }
                    autoCapitalize="words"
                  />


                  <FormField
                    style={
                      styles.flexField
                    }
                    label="Contact No."
                    placeholder="09XX XXX XXXX"
                    value={
                      emergencyContactNumber
                    }
                    onChangeText={
                      setEmergencyContactNumber
                    }
                    keyboardType="phone-pad"
                  />
                </View>


                <FormField
                  label="Address"
                  placeholder="Emergency contact address"
                  value={
                    emergencyContactAddress
                  }
                  onChangeText={
                    setEmergencyContactAddress
                  }
                  autoCapitalize="words"
                />
              </>
            )}


            {/*
            |--------------------------------------------------------------------------
            | STEP 4
            |--------------------------------------------------------------------------
            */}

            {currentStep ===
              4 && (
              <>
                <Text style={{ color: COLORS.darkTeal, fontSize: 12, marginBottom: 12 }}>
                  First-year cadets: Previous MS records are optional. You must answer Yes or No for the advance course before submitting.
                </Text>
                {msRecords.length === 0 && (
                  <View style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    <Text style={{ color: COLORS.darkTeal, fontSize: 13, lineHeight: 20 }}>
                      No previous MS records. This is normal for first-year cadets.
                    </Text>
                  </View>
                )}
                {msRecords.map(
                  (
                    record,
                    index
                  ) => (
                    <MsRecordCard
                      key={
                        record.local_id
                      }
                      index={
                        index
                      }
                      record={
                        record
                      }
                      canRemove={
                        true
                      }
                      onChange={
                        updateMsRecord
                      }
                      onRemove={
                        removeMsRecord
                      }
                    />
                  )
                )}


                <TouchableOpacity
                  style={
                    styles.addRecordButton
                  }
                  onPress={
                    addMsRecord
                  }
                  activeOpacity={
                    0.8
                  }
                >
                  <Ionicons
                    name="add"
                    size={
                      23
                    }
                    color={
                      COLORS.maroon
                    }
                  />


                  <Text
                    style={
                      styles.addRecordText
                    }
                  >
                    Add another MS record
                  </Text>
                </TouchableOpacity>


                <SectionHeading
                  title="ADVANCE COURSE"
                  icon="ribbon-outline"
                />


                <Text
                  style={
                    styles.advanceQuestion
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
                      willingAdvanceCourse ===
                      true
                    }
                    onPress={() =>
                      setWillingAdvanceCourse(
                        true
                      )
                    }
                  />


                  <ChoiceButton
                    label="No"
                    selected={
                      willingAdvanceCourse ===
                      false
                    }
                    onPress={() =>
                      setWillingAdvanceCourse(
                        false
                      )
                    }
                  />
                </View>
              </>
            )}


            {/*
            |--------------------------------------------------------------------------
            | Navigation
            |--------------------------------------------------------------------------
            */}

            <View
              style={
                styles.bottomNavigation
              }
            >
              <TouchableOpacity
                style={
                  styles.backButton
                }
                onPress={
                  handleBack
                }
                disabled={
                  saving
                }
                activeOpacity={
                  0.8
                }
              >
                <Ionicons
                  name="arrow-back"
                  size={
                    18
                  }
                  color={
                    COLORS.orange
                  }
                />


                <Text
                  style={
                    styles.backButtonText
                  }
                >
                  BACK
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  styles.continueButton,

                  saving &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleContinue
                }
                disabled={
                  saving
                }
                activeOpacity={
                  0.85
                }
              >
                {saving ? (
                  <ActivityIndicator
                    color={
                      COLORS.white
                    }
                  />

                ) : (
                  <>
                    <Text
                      style={
                        styles.continueButtonText
                      }
                    >
                      {
                        currentStep ===
                        4
                          ? 'SUBMIT'
                          : 'CONTINUE'
                      }
                    </Text>


                    <Ionicons
                      name={
                        currentStep ===
                        4
                          ? 'checkmark-circle-outline'
                          : 'arrow-forward'
                      }
                      size={
                        19
                      }
                      color={
                        COLORS.white
                      }
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Step Progress
|--------------------------------------------------------------------------
*/

function StepProgress({
  currentStep,
  totalSteps,
}) {
  return (
    <View
      style={
        styles.stepContainer
      }
    >
      <View
        style={
          styles.stepBars
        }
      >
        {Array
          .from({
            length:
              totalSteps,
          })
          .map(
            (
              _,
              index
            ) => {
              const step =
                index + 1;


              return (
                <View
                  key={
                    step
                  }
                  style={[
                    styles.stepBar,

                    step <=
                    currentStep
                      ? styles.stepBarActive
                      : styles.stepBarInactive,
                  ]}
                />
              );
            }
          )}
      </View>


      <Text
        style={
          styles.stepText
        }
      >
        Step {currentStep}/{totalSteps}
      </Text>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Section Heading
|--------------------------------------------------------------------------
*/

function SectionHeading({
  title,
  icon,
}) {
  return (
    <View
      style={
        styles.sectionHeading
      }
    >
      <View
        style={
          styles.sectionHeadingLeft
        }
      >
        <Ionicons
          name={
            icon
          }
          size={
            18
          }
          color={
            COLORS.orange
          }
        />


        <Text
          style={
            styles.sectionHeadingText
          }
        >
          {title}
        </Text>
      </View>


      <View
        style={
          styles.sectionHeadingLine
        }
      />
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Form Field
|--------------------------------------------------------------------------
*/

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
}) {
  return (
    <View
      style={[
        styles.fieldContainer,
        style,
      ]}
    >
      <Text
        style={
          styles.fieldLabel
        }
      >
        {label}
      </Text>


      <TextInput
        style={[
          styles.textInput,

          !editable &&
            styles.readOnlyInput,
        ]}
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
        editable={
          editable
        }
        selectionColor={
          COLORS.orange
        }
      />
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Dropdown
|--------------------------------------------------------------------------
*/

function DropdownField({
  label,
  value,
  placeholder,
  options,
  onChange,
  style,
}) {
  const [
    visible,
    setVisible,
  ] = useState(false);


  return (
    <>
      <View
        style={[
          styles.fieldContainer,
          style,
        ]}
      >
        <Text
          style={
            styles.fieldLabel
          }
        >
          {label}
        </Text>


        <TouchableOpacity
          style={
            styles.dropdownInput
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
          <Text
            style={[
              styles.dropdownValue,

              !value &&
                styles.placeholderText,
            ]}
          >
            {
              value ||
              placeholder
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
        </TouchableOpacity>
      </View>


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
              styles.modalCard
            }
            onPress={
              event =>
                event
                  .stopPropagation()
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
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


            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={{ flexGrow: 0, flexShrink: 1 }}>
            {options.map(
              option => (
                <TouchableOpacity
                  key={
                    option
                  }
                  style={[
                    styles.optionRow,

                    option ===
                    value &&
                      styles.optionRowSelected,
                  ]}
                  onPress={() => {
                    onChange(
                      option
                    );

                    setVisible(
                      false
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,

                      option ===
                      value &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>


                  <Ionicons
                    name={
                      option ===
                      value
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={
                      20
                    }
                    color={
                      option ===
                      value
                        ? COLORS.green
                        : COLORS.darkTeal
                    }
                  />
                </TouchableOpacity>
              )
            )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}


/*
|--------------------------------------------------------------------------
| Birth Date
|--------------------------------------------------------------------------
*/

function BirthDateField({
  month,
  setMonth,
  day,
  setDay,
  year,
  setYear,
  style,
}) {
  return (
    <View
      style={[
        styles.fieldContainer,
        style,
      ]}
    >
      <Text
        style={
          styles.fieldLabel
        }
      >
        Date of Birth
      </Text>


      <View
        style={
          styles.birthDateContainer
        }
      >
        <View
          style={
            styles.birthDateInputs
          }
        >
          <TextInput
            style={
              styles.birthDatePart
            }
            placeholder="mm"
            placeholderTextColor={
              COLORS.muted
            }
            value={
              month
            }
            onChangeText={
              value =>
                setMonth(
                  numbersOnly(
                    value,
                    2
                  )
                )
            }
            maxLength={
              2
            }
            keyboardType="number-pad"
          />


          <Text
            style={
              styles.dateSlash
            }
          >
            /
          </Text>


          <TextInput
            style={
              styles.birthDatePart
            }
            placeholder="dd"
            placeholderTextColor={
              COLORS.muted
            }
            value={
              day
            }
            onChangeText={
              value =>
                setDay(
                  numbersOnly(
                    value,
                    2
                  )
                )
            }
            maxLength={
              2
            }
            keyboardType="number-pad"
          />


          <Text
            style={
              styles.dateSlash
            }
          >
            /
          </Text>


          <TextInput
            style={
              styles.birthYearPart
            }
            placeholder="yyyy"
            placeholderTextColor={
              COLORS.muted
            }
            value={
              year
            }
            onChangeText={
              value =>
                setYear(
                  numbersOnly(
                    value,
                    4
                  )
                )
            }
            maxLength={
              4
            }
            keyboardType="number-pad"
          />
        </View>


        <Ionicons
          name="calendar-outline"
          size={
            19
          }
          color={
            COLORS.orange
          }
        />
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Choice
|--------------------------------------------------------------------------
*/

function ChoiceButton({
  label,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.choiceButton,

        selected &&
          styles.choiceButtonSelected,
      ]}
      onPress={
        onPress
      }
      activeOpacity={
        0.8
      }
    >
      <Text
        style={[
          styles.choiceButtonText,

          selected &&
            styles.choiceButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}


/*
|--------------------------------------------------------------------------
| MS Record
|--------------------------------------------------------------------------
*/

function MsRecordCard({
  index,
  record,
  canRemove,
  onChange,
  onRemove,
}) {
  return (
    <View
      style={
        styles.recordCard
      }
    >
      <View
        style={
          styles.recordHeader
        }
      >
        <Text
          style={
            styles.recordTitle
          }
        >
          RECORD {index + 1}
        </Text>


        {canRemove && (
          <TouchableOpacity
            onPress={() =>
              onRemove(
                index
              )
            }
          >
            <Text
              style={
                styles.removeRecordText
              }
            >
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>


      <View
        style={
          styles.twoColumnRow
        }
      >
        <DropdownField
          style={
            styles.flexField
          }
          label="MS"
          value={
            record.ms_level
          }
          placeholder="MS Level"
          options={
            MS_LEVEL_OPTIONS
          }
          onChange={
            value =>
              onChange(
                index,
                'ms_level',
                value
              )
          }
        />


        <DropdownField
          style={
            styles.flexField
          }
          label="Semester"
          value={
            record.semester
          }
          placeholder="Semester"
          options={
            SEMESTER_OPTIONS
          }
          onChange={
            value =>
              onChange(
                index,
                'semester',
                value
              )
          }
        />
      </View>


      <View
        style={
          styles.twoColumnRow
        }
      >
        <FormField
          style={
            styles.flexField
          }
          label="School Year"
          placeholder="2026-2027"
          value={
            record.school_year
          }
          onChangeText={
            value =>
              onChange(
                index,
                'school_year',
                value
              )
          }
        />


        <FormField
          style={
            styles.flexField
          }
          label="Grade"
          placeholder="1.50"
          value={
            record.grade
          }
          onChangeText={
            value =>
              onChange(
                index,
                'grade',
                decimalOnly(
                  value
                )
              )
          }
          keyboardType="decimal-pad"
        />
      </View>


      <FormField
        label="Remarks"
        placeholder="Passed"
        value={
          record.remarks
        }
        onChangeText={
          value =>
            onChange(
              index,
              'remarks',
              value
            )
        }
        autoCapitalize="words"
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


function nullableText(
  value
) {
  const cleaned =
    String(
      value
      ??
      ''
    )
      .trim();


  return cleaned ||
    null;
}


function numbersOnly(
  value,
  length
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
      length
    );
}


function decimalOnly(
  value
) {
  const cleaned =
    String(
      value
    )
      .replace(
        /[^0-9.]/g,
        ''
      );


  const parts =
    cleaned.split(
      '.'
    );


  if (
    parts.length <=
    2
  ) {
    return cleaned;
  }


  return (
    parts[0]
    +
    '.'
    +
    parts
      .slice(
        1
      )
      .join('')
  );
}


function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(
      value
    )
      .trim()
      .toLowerCase()
  );
}


function isRealDate(
  year,
  month,
  day
) {
  if (
    !Number.isInteger(
      year
    )
    ||
    !Number.isInteger(
      month
    )
    ||
    !Number.isInteger(
      day
    )
  ) {
    return false;
  }


  if (
    year < 1900
    ||
    month < 1
    ||
    month > 12
    ||
    day < 1
    ||
    day > 31
  ) {
    return false;
  }


  const date =
    new Date(
      year,
      month - 1,
      day
    );


  return (
    date.getFullYear() ===
      year
    &&
    date.getMonth() ===
      month - 1
    &&
    date.getDate() ===
      day
  );
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
      paddingBottom: 35,
    },

    loadingContainer: {
      flex: 1,
      minHeight: 450,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        COLORS.cream,
    },

    loadingText: {
      marginTop: 12,
      color:
        COLORS.darkTeal,
      fontSize: 13,
    },

    content: {
      paddingHorizontal: 18,
      backgroundColor:
        COLORS.cream,
    },

    titleArea: {
      minHeight: 100,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 13,
      paddingTop: 4,
    },

    titleIcon: {
      width: 43,
      height: 43,
      borderRadius: 22,
      borderWidth: 1.4,
      borderColor:
        COLORS.maroon,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        COLORS.white,
    },

    pageTitle: {
      color:
        COLORS.maroon,
      fontFamily:
        Platform.select({
          ios:
            'Times New Roman',
          android:
            'serif',
          default:
            'serif',
        }),
      fontSize: 24,
      lineHeight: 31,
      textAlign: 'center',
    },

    stepContainer: {
      marginBottom: 21,
    },

    stepBars: {
      flexDirection: 'row',
      gap: 7,
    },

    stepBar: {
      flex: 1,
      height: 3,
      borderRadius: 2,
    },

    stepBarActive: {
      backgroundColor:
        COLORS.orange,
    },

    stepBarInactive: {
      backgroundColor:
        COLORS.softOrange,
    },

    stepText: {
      marginTop: 7,
      color:
        COLORS.orange,
      fontSize: 11,
    },

    sectionHeading: {
      marginTop: 20,
      marginBottom: 13,
      flexDirection: 'row',
      alignItems: 'center',
    },

    sectionHeadingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    sectionHeadingText: {
      color:
        COLORS.orange,
      fontSize: 16,
      fontWeight: '900',
    },

    sectionHeadingLine: {
      flex: 1,
      height: 1,
      marginLeft: 7,
      backgroundColor:
        COLORS.orange,
    },

    twoColumnRow: {
      flexDirection: 'row',
      gap: 10,
    },

    threeColumnRow: {
      flexDirection: 'row',
      gap: 6,
    },

    flexField: {
      flex: 1,
    },

    thirdField: {
      flex: 1,
    },

    fieldContainer: {
      marginBottom: 11,
    },

    fieldLabel: {
      marginLeft: 4,
      marginBottom: 5,
      color:
        COLORS.maroon,
      fontSize: 12.5,
      lineHeight: 16,
    },

    textInput: {
      height: 42,
      borderWidth: 1.5,
      borderColor:
        COLORS.maroon,
      borderRadius: 5,
      backgroundColor:
        COLORS.inputBackground,
      paddingHorizontal: 12,
      paddingVertical: 0,
      color:
        COLORS.darkTeal,
      fontSize: 12,
    },

    readOnlyInput: {
      backgroundColor:
        '#F0EEE8',
      color:
        COLORS.darkTeal,
    },

    dropdownInput: {
      height: 42,
      borderWidth: 1.5,
      borderColor:
        COLORS.maroon,
      borderRadius: 5,
      backgroundColor:
        COLORS.inputBackground,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    dropdownValue: {
      flex: 1,
      color:
        COLORS.darkTeal,
      fontSize: 12,
      textAlign: 'center',
    },

    placeholderText: {
      color:
        COLORS.muted,
    },

    birthDateContainer: {
      height: 42,
      borderWidth: 1.5,
      borderColor:
        COLORS.maroon,
      borderRadius: 5,
      backgroundColor:
        COLORS.inputBackground,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },

    birthDateInputs: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    birthDatePart: {
      width: 26,
      padding: 0,
      color:
        COLORS.darkTeal,
      fontSize: 12,
      textAlign: 'center',
    },

    birthYearPart: {
      width: 43,
      padding: 0,
      color:
        COLORS.darkTeal,
      fontSize: 12,
      textAlign: 'center',
    },

    dateSlash: {
      color:
        COLORS.darkTeal,
      fontSize: 12,
    },

    choiceRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },

    choiceButton: {
      flex: 1,
      minHeight: 39,
      borderWidth: 1.7,
      borderColor:
        COLORS.maroon,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        COLORS.cream,
      paddingHorizontal: 8,
    },

    choiceButtonSelected: {
      backgroundColor:
        COLORS.maroon,
    },

    choiceButtonText: {
      color:
        COLORS.maroon,
      fontSize: 11,
      textAlign: 'center',
    },

    choiceButtonTextSelected: {
      color:
        COLORS.white,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,13,18,0.45)',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },

    modalCard: {
      maxHeight: '80%',
      borderRadius: 16,
      backgroundColor:
        COLORS.cream,
      padding: 17,
      borderWidth: 1,
      borderColor:
        COLORS.gray,
      elevation: 10,
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingBottom: 8,
      borderBottomWidth:
        StyleSheet.hairlineWidth,
      borderBottomColor:
        COLORS.gray,
    },

    modalTitle: {
      color:
        COLORS.maroon,
      fontSize: 17,
      fontWeight: '700',
    },

    optionRow: {
      minHeight: 48,
      marginTop: 5,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      borderRadius: 8,
    },

    optionRowSelected: {
      backgroundColor:
        'rgba(88,118,28,0.12)',
    },

    optionText: {
      color:
        COLORS.darkTeal,
      fontSize: 14,
    },

    optionTextSelected: {
      color:
        COLORS.green,
      fontWeight: '700',
    },

    recordCard: {
      marginBottom: 16,
      padding: 15,
      borderRadius: 13,
      backgroundColor:
        COLORS.white,
      shadowColor:
        COLORS.nearBlack,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },

    recordHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },

    recordTitle: {
      color:
        COLORS.maroon,
      fontSize: 21,
      fontWeight: '800',
    },

    removeRecordText: {
      color:
        COLORS.maroon,
      fontSize: 11,
      textDecorationLine:
        'underline',
    },

    addRecordButton: {
      minHeight: 43,
      marginHorizontal: 22,
      marginVertical: 12,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor:
        COLORS.maroon,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },

    addRecordText: {
      color:
        COLORS.maroon,
      fontFamily:
        Platform.select({
          ios:
            'Times New Roman',
          android:
            'serif',
          default:
            'serif',
        }),
      fontSize: 13,
    },

    advanceQuestion: {
      marginHorizontal: 27,
      marginBottom: 12,
      color:
        COLORS.darkTeal,
      fontSize: 15,
      lineHeight: 18,
    },

    bottomNavigation: {
      marginTop: 35,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 14,
    },

    backButton: {
      width: 103,
      height: 48,
      borderWidth: 2,
      borderColor:
        COLORS.orange,
      borderRadius: 12,
      backgroundColor:
        COLORS.cream,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      elevation: 3,
    },

    backButtonText: {
      color:
        COLORS.orange,
      fontSize: 13,
      fontWeight: '600',
    },

    continueButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor:
        COLORS.orange,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      elevation: 4,
    },

    continueButtonText: {
      color:
        COLORS.white,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.2,
    },

    disabledButton: {
      opacity: 0.6,
    },
  });