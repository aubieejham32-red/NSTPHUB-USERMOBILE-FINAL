import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import {
  Stack,
  useFocusEffect,
} from 'expo-router';

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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
  createStudentReport,
  deleteStudentReport,
  getStudentReports,
  updateStudentReport,
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

  paper: '#F8F5EE',
  softGreen: '#EFF3E7',
  softYellow: '#FFF5D9',
  softMaroon: '#F5EAE9',

  line: '#C7C0B4',
  softLine: '#DDD7CC',
  muted: '#66747A',
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
   STATUS
   ========================================================================== */

const STATUS_ALL = 'ALL';
const STATUS_PENDING = 'PENDING';
const STATUS_REVIEW = 'IN REVIEW';
const STATUS_RESOLVED = 'RESOLVED';


/* ==========================================================================
   COMPONENT DETAILS
   ========================================================================== */

const COMPONENT_DETAILS = {
  CWTS: {
    title: 'CWTS',
    subtitle: 'Civic Welfare Training Service',
    icon: 'people-outline',
  },

  LTS: {
    title: 'LTS',
    subtitle: 'Literacy Training Service',
    icon: 'book-outline',
  },

  ROTC: {
    title: 'ROTC',
    subtitle: "Reserve Officers' Training Corps",
    icon: 'shield-outline',
  },
};


/* ==========================================================================
   HELPERS
   ========================================================================== */

function normalizeStatus(value) {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();

  if (normalized === 'IN_REVIEW') {
    return STATUS_REVIEW;
  }

  return normalized;
}


function normalizeComponent(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}


function formatOccurrenceDateInput(value) {
  /*
  |--------------------------------------------------------------------------
  | Visible Mobile Format: MM-DD-YYYY
  |--------------------------------------------------------------------------
  |
  | The student only needs to type numbers. Hyphens are inserted
  | automatically after the month and day.
  |
  | Example:
  |   09302026 -> 09-30-2026
  |
  */

  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}


function parseDateForApi(value) {
  const cleanValue = String(value ?? '').trim();

  if (!cleanValue) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Preferred Mobile Format: MM-DD-YYYY
  |--------------------------------------------------------------------------
  */

  let match = cleanValue.match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  );

  /*
  |--------------------------------------------------------------------------
  | Backward Compatibility: MM/DD/YYYY
  |--------------------------------------------------------------------------
  |
  | Existing drafts from older app versions can still be submitted.
  |
  */

  if (!match) {
    match = cleanValue.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );
  }

  if (match) {
    const monthNumber = Number(match[1]);
    const dayNumber = Number(match[2]);
    const yearNumber = Number(match[3]);

    const date = new Date(
      yearNumber,
      monthNumber - 1,
      dayNumber
    );

    if (
      date.getFullYear() !== yearNumber ||
      date.getMonth() !== monthNumber - 1 ||
      date.getDate() !== dayNumber
    ) {
      return null;
    }

    const month = String(monthNumber).padStart(2, '0');
    const day = String(dayNumber).padStart(2, '0');

    /*
    | Laravel/MySQL receive the normalized database format YYYY-MM-DD.
    | The student still sees MM-DD-YYYY in the mobile app.
    */

    return `${yearNumber}-${month}-${day}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Internal API/Database Format: YYYY-MM-DD
  |--------------------------------------------------------------------------
  |
  | Kept so older API responses and saved records remain compatible.
  |
  */

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    const parts = cleanValue.split('-');

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return cleanValue;
  }

  return null;
}


function formatDate(value) {
  if (!value) {
    return 'Not specified';
  }

  const cleanValue = String(value).trim();

  if (!/^\d{4}-\d{2}-\d{2}/.test(cleanValue)) {
    return cleanValue;
  }

  const datePart = cleanValue.substring(0, 10);
  const parts = datePart.split('-');

  if (parts.length !== 3) {
    return cleanValue;
  }

  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  if (Number.isNaN(date.getTime())) {
    return cleanValue;
  }

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }
  );
}


function getSubmittedDate(report) {
  return (
    report?.submittedDate ||
    (
      report?.created_at
        ? formatDate(report.created_at)
        : null
    ) ||
    'Recently submitted'
  );
}


function getOccurrenceDate(report) {
  return (
    report?.occurrenceDate ||
    (
      report?.occurrence_date
        ? formatDate(report.occurrence_date)
        : null
    ) ||
    'Not specified'
  );
}


function getOccurrenceInputDate(report) {
  if (report?.occurrence_date) {
    const dateValue = String(
      report.occurrence_date
    ).substring(0, 10);

    const parts = dateValue.split('-');

    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}-${parts[0]}`;
    }
  }

  const occurrenceDate = String(
    report?.occurrenceDate ?? ''
  ).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)) {
    const parts = occurrenceDate.split('-');

    return `${parts[1]}-${parts[2]}-${parts[0]}`;
  }

  return occurrenceDate;
}


function getReportConcern(report) {
  return String(
    report?.concern ??
    report?.subject ??
    ''
  ).trim();
}


function isImageAttachment(report) {
  const mimeType = String(
    report?.attachment_mime_type ?? ''
  ).toLowerCase();

  if (mimeType.startsWith('image/')) {
    return true;
  }

  const source = String(
    report?.attachment_url ??
    report?.evidenceUri ??
    ''
  )
    .split('?')[0]
    .toLowerCase();

  return (
    source.endsWith('.jpg') ||
    source.endsWith('.jpeg') ||
    source.endsWith('.png') ||
    source.endsWith('.webp')
  );
}


function selectedFileIsImage(file) {
  const mimeType = String(
    file?.mimeType ?? ''
  ).toLowerCase();

  if (mimeType.startsWith('image/')) {
    return true;
  }

  const name = String(
    file?.name ?? ''
  ).toLowerCase();

  return (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp')
  );
}


/* ==========================================================================
   REVIEW / FEEDBACK HELPERS
   ========================================================================== */

function normalizeReviewPayload(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const message = value.trim();

    return message
      ? { message }
      : null;
  }

  if (typeof value === 'object') {
    return value;
  }

  return null;
}


function getReportReview(report, status) {
  const resolution = normalizeReviewPayload(
    report?.resolution
  );

  const response = normalizeReviewPayload(
    report?.response
  );

  const feedback = normalizeReviewPayload(
    report?.feedback
  );

  if (status === STATUS_RESOLVED) {
    return (
      resolution ??
      response ??
      feedback
    );
  }

  return (
    response ??
    resolution ??
    feedback
  );
}


function formatReviewedDate(value) {
  if (!value) {
    return '';
  }

  const raw = String(value).trim();

  if (!raw) {
    return '';
  }

  let date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw
      .split('-')
      .map(Number);

    date = new Date(
      year,
      month - 1,
      day
    );
  } else {
    date = new Date(raw);
  }

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }
  );
}


/* ==========================================================================
   REPORT SCREEN
   ========================================================================== */

export default function ReportScreen() {

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

  const { width } = useWindowDimensions();

  /*
  |--------------------------------------------------------------------------
  | Same Content Width As Announcements
  |--------------------------------------------------------------------------
  */

  const contentWidth = Math.min(
    width - 32,
    430
  );


  /* ==========================================================================
     DATABASE STATE
     ========================================================================== */

  const [reports, setReports] = useState([]);
  const [student, setStudent] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [allowedComponents, setAllowedComponents] = useState([]);


  /* ==========================================================================
     SCREEN STATE
     ========================================================================== */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    activeFilter,
    setActiveFilter,
  ] = useState(STATUS_ALL);

  const [
    showReportForm,
    setShowReportForm,
  ] = useState(false);

  const [
    editingReportId,
    setEditingReportId,
  ] = useState(null);

  const [
    openMenuReportId,
    setOpenMenuReportId,
  ] = useState(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);


  /* ==========================================================================
     FORM STATE
     ========================================================================== */

  const [component, setComponent] = useState('');
  const [instructorId, setInstructorId] = useState(null);

  const [
    occurrenceDate,
    setOccurrenceDate,
  ] = useState('');

  const [concern, setConcern] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  /* ==========================================================================
     LOAD REAL DATABASE DATA
     ========================================================================== */

  const loadReports = useCallback(
    async ({
      silent = false,
    } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        setErrorMessage('');

        const response =
          await getStudentReports();

        const databaseReports =
          Array.isArray(response?.reports)
            ? response.reports
            : [];

        const databaseInstructors =
          Array.isArray(response?.instructors)
            ? response.instructors
            : [];

        const studentComponent =
          normalizeComponent(
            response?.student?.component
          );

        const databaseComponents =
          Array.isArray(
            response?.allowed_components
          )
            ? response.allowed_components
                .map(normalizeComponent)
                .filter(
                  value =>
                    Boolean(
                      COMPONENT_DETAILS[value]
                    )
                )
            : [];

        const finalComponents =
          databaseComponents.length > 0
            ? databaseComponents
            : studentComponent
              ? [studentComponent]
              : [];

        setReports(databaseReports);

        setStudent(
          response?.student ?? null
        );

        setInstructors(
          databaseInstructors
        );

        setAllowedComponents(
          finalComponents
        );

        setComponent(
          currentValue => {
            const current =
              normalizeComponent(
                currentValue
              );

            if (
              current &&
              finalComponents.includes(
                current
              )
            ) {
              return current;
            }

            return (
              finalComponents[0] ??
              studentComponent ??
              ''
            );
          }
        );
      } catch (error) {
        console.log(
          'ReportScreen load error:',
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load your reports.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* ==========================================================================
     RELOAD WHEN SCREEN IS FOCUSED
     ========================================================================== */

  useFocusEffect(
    useCallback(
      () => {
        loadReports();

        return undefined;
      },
      [loadReports]
    )
  );


  /* ==========================================================================
     PULL TO REFRESH
     ========================================================================== */

  const handleRefresh =
    useCallback(
      () => {
        setRefreshing(true);

        loadReports({
          silent: true,
        });
      },
      [loadReports]
    );


  /* ==========================================================================
     SUMMARY COUNTS
     ========================================================================== */

  const summary =
    useMemo(
      () => ({
        total:
          reports.length,

        pending:
          reports.filter(
            report =>
              normalizeStatus(
                report?.status
              ) === STATUS_PENDING
          ).length,

        review:
          reports.filter(
            report =>
              normalizeStatus(
                report?.status
              ) === STATUS_REVIEW
          ).length,

        resolved:
          reports.filter(
            report =>
              normalizeStatus(
                report?.status
              ) === STATUS_RESOLVED
          ).length,
      }),
      [reports]
    );


  /* ==========================================================================
     FILTERED REPORTS
     ========================================================================== */

  const filteredReports =
    useMemo(
      () => {
        if (
          activeFilter ===
          STATUS_ALL
        ) {
          return reports;
        }

        return reports.filter(
          report =>
            normalizeStatus(
              report?.status
            ) === activeFilter
        );
      },
      [
        reports,
        activeFilter,
      ]
    );


  /* ==========================================================================
     FILTER INSTRUCTORS BY COMPONENT
     ========================================================================== */

  const filteredInstructors =
    useMemo(
      () => {
        const selectedComponent =
          normalizeComponent(
            component
          );

        if (!selectedComponent) {
          return instructors;
        }

        const matches =
          instructors.filter(
            instructor => {
              const instructorComponents =
                Array.isArray(
                  instructor?.components
                )
                  ? instructor.components
                      .map(
                        normalizeComponent
                      )
                      .filter(
                        Boolean
                      )
                  : [
                      normalizeComponent(
                        instructor?.component
                      ),
                    ].filter(
                      Boolean
                    );

              return (
                instructorComponents.length === 0 ||
                instructorComponents.includes(
                  'ALL'
                ) ||
                instructorComponents.includes(
                  selectedComponent
                )
              );
            }
          );

        return matches.length > 0
          ? matches
          : instructors;
      },
      [
        instructors,
        component,
      ]
    );


  /* ==========================================================================
     RESET FORM
     ========================================================================== */

  const resetForm =
    useCallback(
      () => {
        const studentComponent =
          normalizeComponent(
            student?.component
          );

        setComponent(
          allowedComponents[0] ??
          studentComponent ??
          ''
        );

        setInstructorId(null);
        setOccurrenceDate('');
        setConcern('');
        setDescription('');
        setAttachment(null);
        setEditingReportId(null);
      },
      [
        allowedComponents,
        student,
      ]
    );


  /* ==========================================================================
     OPEN NEW REPORT FORM
     ========================================================================== */

  const handleAddReport = () => {
    resetForm();

    setOpenMenuReportId(null);
    setShowReportForm(true);
  };


  /* ==========================================================================
     CLOSE FORM
     ========================================================================== */

  const handleCloseForm = () => {
    resetForm();

    setShowReportForm(false);
  };


  /* ==========================================================================
     SELECT COMPONENT
     ========================================================================== */

  const handleSelectComponent = (
    selectedComponent
  ) => {
    const normalized =
      normalizeComponent(
        selectedComponent
      );

    setComponent(normalized);

    if (!instructorId) {
      return;
    }

    const selectedInstructor =
      instructors.find(
        item =>
          String(item?.id) ===
          String(instructorId)
      );

    const instructorComponents =
      Array.isArray(
        selectedInstructor?.components
      )
        ? selectedInstructor.components
            .map(
              normalizeComponent
            )
            .filter(
              Boolean
            )
        : [
            normalizeComponent(
              selectedInstructor?.component
            ),
          ].filter(
            Boolean
          );

    if (
      instructorComponents.length > 0 &&
      !instructorComponents.includes(
        'ALL'
      ) &&
      !instructorComponents.includes(
        normalized
      )
    ) {
      setInstructorId(null);
    }
  };


  /* ==========================================================================
     EDIT REPORT
     ========================================================================== */

  const handleEditReport = report => {
    const status =
      normalizeStatus(
        report?.status
      );

    if (
      status !== STATUS_PENDING ||
      report?.can_edit === false
    ) {
      Alert.alert(
        'Report Locked',
        'Only pending reports can be edited.'
      );

      return;
    }

    setComponent(
      normalizeComponent(
        report?.component
      ) ||
      normalizeComponent(
        student?.component
      )
    );

    if (report?.instructor_id) {
      setInstructorId(
        report.instructor_id
      );
    } else {
      const matched =
        instructors.find(
          instructor =>
            String(
              instructor?.full_name ?? ''
            )
              .trim()
              .toLowerCase() ===
            String(
              report?.instructor ?? ''
            )
              .trim()
              .toLowerCase()
        );

      setInstructorId(
        matched?.id ?? null
      );
    }

    setOccurrenceDate(
      getOccurrenceInputDate(
        report
      )
    );

    setConcern(
      getReportConcern(
        report
      )
    );

    setDescription(
      String(
        report?.description ?? ''
      )
    );

    setAttachment(null);

    setEditingReportId(
      report.id
    );

    setOpenMenuReportId(null);
    setShowReportForm(true);
  };


  /* ==========================================================================
     DELETE REPORT
     ========================================================================== */

  const performDelete =
    async report => {
      try {
        setDeletingId(
          report.id
        );

        await deleteStudentReport(
          report.id
        );

        await loadReports({
          silent: true,
        });

        setOpenMenuReportId(null);

        Alert.alert(
          'Report Deleted',
          'Your pending report was deleted successfully.'
        );
      } catch (error) {
        Alert.alert(
          'Unable to Delete',
          error instanceof Error
            ? error.message
            : 'The report could not be deleted.'
        );
      } finally {
        setDeletingId(null);
      }
    };


  const handleDeleteReport =
    report => {
      const status =
        normalizeStatus(
          report?.status
        );

      if (
        status !== STATUS_PENDING ||
        report?.can_delete === false
      ) {
        Alert.alert(
          'Report Locked',
          'Only pending reports can be deleted.'
        );

        return;
      }

      Alert.alert(
        'Delete Report?',
        'This report will be permanently deleted from your NSTP HUB account.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },

          {
            text: 'Delete',
            style: 'destructive',

            onPress: () =>
              performDelete(
                report
              ),
          },
        ]
      );
    };


  /* ==========================================================================
     PICK ATTACHMENT
     ========================================================================== */

  const handlePickAttachment =
    async () => {
      try {
        const result =
          await DocumentPicker
            .getDocumentAsync({
              type: [
                'image/*',
                'application/pdf',
              ],

              copyToCacheDirectory:
                true,

              multiple:
                false,
            });

        if (result.canceled) {
          return;
        }

        if (
          !Array.isArray(
            result.assets
          ) ||
          result.assets.length === 0
        ) {
          return;
        }

        const selected =
          result.assets[0];

        const size =
          Number(
            selected?.size ?? 0
          );

        const maximumBytes =
          10 *
          1024 *
          1024;

        if (
          size >
          maximumBytes
        ) {
          Alert.alert(
            'File Too Large',
            'Please choose a file that is 10 MB or smaller.'
          );

          return;
        }

        setAttachment(
          selected
        );
      } catch (error) {
        console.log(
          'Document picker error:',
          error
        );

        Alert.alert(
          'Unable to Attach File',
          'Please try selecting your file again.'
        );
      }
    };


  /* ==========================================================================
     SUBMIT / UPDATE REPORT
     ========================================================================== */

  const handleSubmitReport =
    async () => {
      const normalizedComponent =
        normalizeComponent(
          component
        );

      if (!normalizedComponent) {
        Alert.alert(
          'NSTP Component Required',
          'Please select your NSTP component.'
        );

        return;
      }

      if (
        !instructorId &&
        instructors.length > 0
      ) {
        Alert.alert(
          'Instructor Required',
          'Please select your NSTP instructor.'
        );

        return;
      }

      const apiDate =
        parseDateForApi(
          occurrenceDate
        );

      if (!apiDate) {
        Alert.alert(
          'Valid Date Required',
          'Enter the occurrence date as MM-DD-YYYY. Example: 09-30-2026.'
        );

        return;
      }

      const cleanConcern =
        concern.trim();

      if (!cleanConcern) {
        Alert.alert(
          'Subject Required',
          'Please tell us what your report is about.'
        );

        return;
      }

      const cleanDescription =
        description.trim();

      if (!cleanDescription) {
        Alert.alert(
          'Description Required',
          'Please describe your concern.'
        );

        return;
      }

      if (
        cleanDescription.length < 10
      ) {
        Alert.alert(
          'More Information Needed',
          'Please provide a little more detail about your concern.'
        );

        return;
      }

      const payload = {
        component:
          normalizedComponent,

        instructor_id:
          instructorId
          ??
          null,

        occurrence_date:
          apiDate,

        subject:
          cleanConcern,

        description:
          cleanDescription,
      };

      try {
        setSubmitting(true);

        if (
          editingReportId !== null
        ) {
          await updateStudentReport(
            editingReportId,
            payload,
            attachment
          );

          Alert.alert(
            'Report Updated',
            'Your report was updated successfully.'
          );
        } else {
          await createStudentReport(
            payload,
            attachment
          );

          setActiveFilter(
            STATUS_ALL
          );

          Alert.alert(
            'Report Submitted',
            'Your report was submitted successfully and is now pending review.'
          );
        }

        await loadReports({
          silent: true,
        });

        resetForm();
        setShowReportForm(false);
      } catch (error) {
        console.log(
          'Report submission error:',
          error
        );

        Alert.alert(
          editingReportId !== null
            ? 'Unable to Update Report'
            : 'Unable to Submit Report',

          error instanceof Error
            ? error.message
            : 'Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
    };


  /* ==========================================================================
     LOADING
     ========================================================================== */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <StatusBar
          barStyle="dark-content"
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
              name="document-text-outline"
              size={28}
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
            style={
              styles.loadingIndicator
            }
          />

          <Text
            style={
              styles.loadingTitle
            }
          >
            Loading Reports
          </Text>

          <Text
            style={
              styles.loadingText
            }
          >
            Getting your latest NSTP report records.
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  /* ==========================================================================
     SUBMIT / EDIT REPORT FORM
     ========================================================================== */

  if (showReportForm) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={['top']}
      >
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <StatusBar
          barStyle="dark-content"
          backgroundColor={
            themeColors.cream
          }
        />

        <ReportForm
          width={
            contentWidth
          }

          student={
            student
          }

          isEditing={
            editingReportId !== null
          }

          component={
            component
          }

          allowedComponents={
            allowedComponents
          }

          onSelectComponent={
            handleSelectComponent
          }

          instructorId={
            instructorId
          }

          instructors={
            filteredInstructors
          }

          setInstructorId={
            setInstructorId
          }

          occurrenceDate={
            occurrenceDate
          }

          setOccurrenceDate={
            setOccurrenceDate
          }

          concern={
            concern
          }

          setConcern={
            setConcern
          }

          description={
            description
          }

          setDescription={
            setDescription
          }

          attachment={
            attachment
          }

          setAttachment={
            setAttachment
          }

          onPickAttachment={
            handlePickAttachment
          }

          onSubmit={
            handleSubmitReport
          }

          onClose={
            handleCloseForm
          }

          submitting={
            submitting
          }
        />
      </SafeAreaView>
    );
  }


  /* ==========================================================================
     MAIN REPORT LIST
     ========================================================================== */

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={['top']}
    >
      <Stack.Screen
        options={{
          headerShown: false,
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
          styles.mainScroll
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.mainScrollContent
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
            progressBackgroundColor={
              themeColors.white
            }
          />
        }
      >
        {/* ================================================================
            ANNOUNCEMENT-STYLE HEADER
        ================================================================= */}

        <ReportPageHeader
          width={
            contentWidth
          }
          title="Reports"
          description="Submit concerns, monitor their review, and read official NSTP responses."
          component={
            normalizeComponent(
              student?.component
            )
          }
        />


        {/* ================================================================
            COMPACT REPORT ACTION AREA
            Reference design
        ================================================================= */}

        <View
          style={[
            styles.reportControlSection,
            {
              width:
                contentWidth,
            },
          ]}
        >
          {/* ================================================================
              MAROON STRIP
          ================================================================= */}

          <View
            style={
              styles.actionStrip
            }
          >
            <View
              style={
                styles.actionStripMaroon
              }
            />

            <View
              style={
                styles.actionStripOrange
              }
            />

            <Pressable
              onPress={
                handleAddReport
              }
              accessibilityRole="button"
              accessibilityLabel="Create a new report"
              style={({
                pressed,
              }) => [
                styles.addReportButton,

                pressed &&
                styles.addReportButtonPressed,
              ]}
            >
              <Ionicons
                name="add"
                size={33}
                color={
                  themeColors.maroon
                }
              />
            </Pressable>
          </View>


          {/* ================================================================
              STATUS FILTERS
          ================================================================= */}

          <View
            style={
              styles.filterBar
            }
          >
            <StatusFilter
              label="ALL"
              color={
                themeColors.darkTeal
              }
              active={
                activeFilter ===
                STATUS_ALL
              }
              onPress={() => {
                setOpenMenuReportId(
                  null
                );

                setActiveFilter(
                  STATUS_ALL
                );
              }}
            />

            <StatusFilter
              label="PENDING"
              color={
                themeColors.orange
              }
              count={
                summary.pending
              }
              active={
                activeFilter ===
                STATUS_PENDING
              }
              onPress={() => {
                setOpenMenuReportId(
                  null
                );

                setActiveFilter(
                  STATUS_PENDING
                );
              }}
            />

            <StatusFilter
              label="IN REVIEW"
              color={
                themeColors.green
              }
              count={
                summary.review
              }
              active={
                activeFilter ===
                STATUS_REVIEW
              }
              onPress={() => {
                setOpenMenuReportId(
                  null
                );

                setActiveFilter(
                  STATUS_REVIEW
                );
              }}
            />

            <StatusFilter
              label="RESOLVED"
              color={
                themeColors.maroon
              }
              count={
                summary.resolved
              }
              active={
                activeFilter ===
                STATUS_RESOLVED
              }
              onPress={() => {
                setOpenMenuReportId(
                  null
                );

                setActiveFilter(
                  STATUS_RESOLVED
                );
              }}
            />
          </View>
        </View>


        {/* ================================================================
            ERROR
        ================================================================= */}

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
                Unable to load reports
              </Text>

              <Text
                style={
                  styles.errorText
                }
              >
                {errorMessage}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                loadReports()
              }
              style={
                styles.retryButton
              }
            >
              <Ionicons
                name="refresh"
                size={18}
                color={
                  themeColors.white
                }
              />
            </Pressable>
          </View>
        )}


        {/* ================================================================
            REPORT CARDS
        ================================================================= */}

        <View
          style={[
            styles.reportList,
            {
              width:
                contentWidth,
            },
          ]}
        >
          {filteredReports.length === 0 ? (
            <EmptyReports
              activeFilter={
                activeFilter
              }
              onCreate={
                handleAddReport
              }
            />
          ) : (
            filteredReports.map(
              report => (
                <ReportCard
                  key={
                    report.id
                  }

                  report={
                    report
                  }

                  menuOpen={
                    openMenuReportId ===
                    report.id
                  }

                  deleting={
                    deletingId ===
                    report.id
                  }

                  onToggleMenu={() =>
                    setOpenMenuReportId(
                      current =>
                        current === report.id
                          ? null
                          : report.id
                    )
                  }

                  onEdit={() =>
                    handleEditReport(
                      report
                    )
                  }

                  onDelete={() =>
                    handleDeleteReport(
                      report
                    )
                  }
                />
              )
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


/* ==========================================================================
   REPORT PAGE HEADER
   Same Concept As Announcements
   ========================================================================== */

function ReportPageHeader({
  width,
  title,
  description,
  component,
}) {
  return (
    <View
      style={[
        styles.pageHeader,
        {
          width,
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
            name="document-text-outline"
            size={27}
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
            {title}
          </Text>
        </View>
      </View>


      {/* ================================================================
          COLOR RULE
      ================================================================= */}

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
        {description}
      </Text>


      {Boolean(component) && (
        <View
          style={
            styles.componentTag
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
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
      )}
    </View>
  );
}


/* ==========================================================================
   REPORT FORM
   ========================================================================== */

function ReportForm({
  width,

  student,

  isEditing,

  component,

  allowedComponents,

  onSelectComponent,

  instructorId,

  instructors,

  setInstructorId,

  occurrenceDate,

  setOccurrenceDate,

  concern,

  setConcern,

  description,

  setDescription,

  attachment,

  setAttachment,

  onPickAttachment,

  onSubmit,

  onClose,

  submitting,
}) {
  return (
    <KeyboardAvoidingView
      style={
        styles.formScreen
      }
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.formScrollContent
        }
      >
        {/* ================================================================
            ANNOUNCEMENT-STYLE HEADER
        ================================================================= */}

        <ReportPageHeader
          width={
            width
          }
          title={
            isEditing
              ? 'Edit Report'
              : 'Submit Report'
          }
          description={
            isEditing
              ? 'Update the details of your pending NSTP report.'
              : 'Send a concern or incident report to your NSTP instructor.'
          }
          component={
            normalizeComponent(
              student?.component
            )
          }
        />


        {/* ================================================================
            STUDENT IDENTITY
        ================================================================= */}

        <View
          style={[
            styles.identityBoard,
            {
              width,
            },
          ]}
        >
          <Pressable
            onPress={
              onClose
            }
            accessibilityRole="button"
            accessibilityLabel="Close report form"
            style={({
              pressed,
            }) => [
              styles.formCloseButton,

              pressed && {
                opacity: 0.65,
              },
            ]}
          >
            <Ionicons
              name="close"
              size={24}
              color={
                themeColors.maroon
              }
            />
          </Pressable>


          <Text
            numberOfLines={1}
            style={
              styles.identityId
            }
          >
            ID NO.{' '}
            {student?.student_id_number ||
              'NSTP STUDENT'}
          </Text>


          <View
            style={
              styles.identityNameBar
            }
          >
            <Text
              numberOfLines={1}
              style={
                styles.identityName
              }
            >
              {student?.full_name ||
                'NSTP STUDENT'}
            </Text>
          </View>


          <StudentAvatar
            uri={
              student?.profile_photo_url
            }
            size={92}
            style={
              styles.formStudentAvatar
            }
          />
        </View>


        {/* ================================================================
            FORM
        ================================================================= */}

        <View
          style={[
            styles.formPanel,
            {
              width,
            },
          ]}
        >
          <Text
            style={
              styles.formPanelTitle
            }
          >
            {isEditing
              ? 'EDIT YOUR REPORT'
              : 'SUBMIT A REPORT'}
          </Text>


          {/* ================================================================
              COMPONENT
          ================================================================= */}

          <FormLabel>
            Select your NSTP component
          </FormLabel>

          <View
            style={
              styles.componentList
            }
          >
            {allowedComponents.length > 0 ? (
              allowedComponents.map(
                value => (
                  <ComponentRadio
                    key={value}
                    value={value}
                    selected={
                      component === value
                    }
                    onPress={() =>
                      onSelectComponent(
                        value
                      )
                    }
                  />
                )
              )
            ) : (
              <InlineNotice
                icon="alert-circle-outline"
                text="Your NSTP component is currently unavailable."
              />
            )}
          </View>


          {/* ================================================================
              INSTRUCTOR
          ================================================================= */}

          <FormLabel>
            Your Instructor
          </FormLabel>

          <View
            style={
              styles.instructorList
            }
          >
            {instructors.length > 0 ? (
              instructors.map(
                instructor => (
                  <InstructorRadio
                    key={
                      instructor.id
                    }
                    instructor={
                      instructor
                    }
                    selected={
                      String(
                        instructorId
                      ) ===
                      String(
                        instructor.id
                      )
                    }
                    onPress={() =>
                      setInstructorId(
                        instructor.id
                      )
                    }
                  />
                )
              )
            ) : (
              <InlineNotice
                icon="information-circle-outline"
                text="No instructor is currently assigned to this component. You can still submit the report and the NSTP office / University Administrator can review it."
              />
            )}
          </View>


          {/* ================================================================
              DATE
          ================================================================= */}

          <FormLabel>
            Date of Occurrence
          </FormLabel>

          <View
            style={
              styles.dateInputWrapper
            }
          >
            <Ionicons
              name="calendar-outline"
              size={21}
              color={
                themeColors.green
              }
            />

            <TextInput
              value={
                occurrenceDate
              }
              onChangeText={
                value =>
                  setOccurrenceDate(
                    formatOccurrenceDateInput(
                      value
                    )
                  )
              }
              placeholder="MM-DD-YYYY"
              placeholderTextColor={
                themeColors.muted
              }
              selectionColor={
                themeColors.maroon
              }
              keyboardType={
                Platform.OS === 'ios'
                  ? 'numbers-and-punctuation'
                  : 'numeric'
              }
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
              style={
                styles.dateInput
              }
            />
          </View>

          <Text
            style={
              styles.inputHint
            }
          >
            Example: 08-30-2026
          </Text>


          {/* ================================================================
              SUBJECT
          ================================================================= */}

          <FormLabel>
            What’s this about?
          </FormLabel>

          <TextInput
            value={
              concern
            }
            onChangeText={
              setConcern
            }
            placeholder="Attendance Concern"
            placeholderTextColor={
              themeColors.muted
            }
            selectionColor={
              themeColors.maroon
            }
            maxLength={150}
            style={
              styles.formInput
            }
          />


          {/* ================================================================
              DESCRIPTION
          ================================================================= */}

          <FormLabel>
            Describe your concern
          </FormLabel>

          <TextInput
            value={
              description
            }
            onChangeText={
              setDescription
            }
            placeholder="e.g. I was marked absent last Saturday but I attended the full session."
            placeholderTextColor={
              themeColors.muted
            }
            selectionColor={
              themeColors.maroon
            }
            multiline
            textAlignVertical="top"
            style={
              styles.descriptionInput
            }
          />


          {/* ================================================================
              ATTACHMENT
          ================================================================= */}

          <FormLabel>
            Attach proof (optional)
          </FormLabel>

          {!attachment ? (
            <Pressable
              onPress={
                onPickAttachment
              }
              style={({
                pressed,
              }) => [
                styles.proofButton,

                pressed && {
                  opacity: 0.7,
                },
              ]}
            >
              <Ionicons
                name="attach-outline"
                size={22}
                color={
                  themeColors.maroon
                }
              />

              <Text
                style={
                  styles.proofButtonText
                }
              >
                Add a photo or file
              </Text>
            </Pressable>
          ) : (
            <View
              style={
                styles.selectedProof
              }
            >
              {selectedFileIsImage(
                attachment
              ) ? (
                <Image
                  source={{
                    uri:
                      attachment.uri,
                  }}
                  style={
                    styles.selectedProofImage
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.selectedProofFileIcon
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={25}
                    color={
                      themeColors.maroon
                    }
                  />
                </View>
              )}

              <Text
                numberOfLines={1}
                style={
                  styles.selectedProofName
                }
              >
                {attachment?.name ||
                  'Attached file'}
              </Text>

              <Pressable
                onPress={() =>
                  setAttachment(
                    null
                  )
                }
                style={
                  styles.removeProofButton
                }
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={
                    themeColors.maroon
                  }
                />
              </Pressable>
            </View>
          )}


          {isEditing && (
            <View
              style={
                styles.editHint
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={
                  themeColors.darkTeal
                }
              />

              <Text
                style={
                  styles.editHintText
                }
              >
                Existing proof stays unless you choose a new file.
              </Text>
            </View>
          )}


          {/* ================================================================
              SUBMIT
          ================================================================= */}

          <Pressable
            disabled={
              submitting
            }
            onPress={
              onSubmit
            }
            style={({
              pressed,
            }) => [
              styles.submitButton,

              submitting &&
              styles.submitButtonDisabled,

              pressed &&
              !submitting &&
              styles.submitButtonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color={
                  themeColors.white
                }
              />
            ) : (
              <Ionicons
                name={
                  isEditing
                    ? 'save-outline'
                    : 'paper-plane-outline'
                }
                size={19}
                color={
                  themeColors.white
                }
              />
            )}

            <Text
              style={
                styles.submitButtonText
              }
            >
              {submitting
                ? isEditing
                  ? 'SAVING...'
                  : 'SUBMITTING...'
                : isEditing
                  ? 'SAVE CHANGES'
                  : 'SUBMIT REPORT'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


/* ==========================================================================
   STATUS FILTER
   ========================================================================== */

function StatusFilter({
  label,
  color,
  count,
  active,
  onPress,
}) {
  let flexValue = 1;

  if (label === 'ALL') {
    flexValue = 0.82;
  }

  if (label === 'IN REVIEW') {
    flexValue = 1.18;
  }

  return (
    <View
      style={[
        styles.filterWrapper,
        {
          flex:
            flexValue,
        },
      ]}
    >
      <Pressable
        onPress={
          onPress
        }
        style={({
          pressed,
        }) => [
          styles.filterButton,

          {
            backgroundColor:
              color,

            borderColor:
              color,
          },

          active &&
          styles.filterButtonActive,

          pressed &&
          styles.filterButtonPressed,
        ]}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={
            styles.filterButtonText
          }
        >
          {label}
        </Text>
      </Pressable>


      {typeof count === 'number' && (
        <View
          pointerEvents="none"
          style={[
            styles.filterCount,
            {
              borderColor:
                color,
            },
          ]}
        >
          <Text
            style={[
              styles.filterCountText,
              {
                color,
              },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </View>
  );
}


/* ==========================================================================
   REPORT CARD
   ========================================================================== */

function ReportCard({
  report,
  menuOpen,
  deleting,
  onToggleMenu,
  onEdit,
  onDelete,
}) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const status =
    normalizeStatus(
      report?.status
    );

  const canEdit =
    status === STATUS_PENDING &&
    report?.can_edit !== false;

  const canDelete =
    status === STATUS_PENDING &&
    report?.can_delete !== false;

  const attachmentUrl =
    report?.attachment_url ??
    report?.evidenceUri ??
    null;

  const showImage =
    Boolean(attachmentUrl) &&
    isImageAttachment(report) &&
    !imageFailed;

  const staffReview =
    getReportReview(
      report,
      status
    );

  return (
    <View
      style={
        styles.reportCard
      }
    >
      {/* ================================================================
          CARD HEADER
      ================================================================= */}

      <View
        style={
          styles.reportCardHeader
        }
      >
        <StudentAvatar
          uri={
            report?.profile_photo_url
          }
          size={56}
        />

        <View
          style={
            styles.reportIdentity
          }
        >
          <Text
            numberOfLines={1}
            style={
              styles.reportStudentName
            }
          >
            {report?.studentName ||
              'NSTP Student'}
          </Text>

          <View
            style={
              styles.reportMetaRow
            }
          >
            {Boolean(
              report?.email
            ) && (
              <Text
                numberOfLines={1}
                style={
                  styles.reportEmail
                }
              >
                {report.email}
              </Text>
            )}

            {Boolean(
              report?.email
            ) && (
              <View
                style={
                  styles.metaDot
                }
              />
            )}

            <Ionicons
              name="calendar-clear-outline"
              size={13}
              color={
                themeColors.muted
              }
            />

            <Text
              style={
                styles.reportSubmittedDate
              }
            >
              {getSubmittedDate(
                report
              )}
            </Text>
          </View>
        </View>


        <View
          style={
            styles.cardRight
          }
        >
          {(canEdit || canDelete) && (
            <Pressable
              onPress={
                onToggleMenu
              }
              hitSlop={10}
              style={
                styles.menuButton
              }
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={25}
                color={
                  themeColors.orange
                }
              />
            </Pressable>
          )}

          <StatusBadge
            status={
              status
            }
          />
        </View>


        {/* ================================================================
            ACTION MENU
        ================================================================= */}

        {menuOpen && (
          <View
            style={
              styles.actionMenu
            }
          >
            {canEdit && (
              <Pressable
                onPress={
                  onEdit
                }
                style={
                  styles.actionMenuItem
                }
              >
                <Ionicons
                  name="create-outline"
                  size={19}
                  color={
                    themeColors.darkTeal
                  }
                />

                <Text
                  style={
                    styles.actionMenuText
                  }
                >
                  Edit
                </Text>
              </Pressable>
            )}

            {canEdit && canDelete && (
              <View
                style={
                  styles.actionMenuDivider
                }
              />
            )}

            {canDelete && (
              <Pressable
                disabled={
                  deleting
                }
                onPress={
                  onDelete
                }
                style={
                  styles.actionMenuItem
                }
              >
                {deleting ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      themeColors.maroon
                    }
                  />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={
                      themeColors.maroon
                    }
                  />
                )}

                <Text
                  style={[
                    styles.actionMenuText,
                    {
                      color:
                        themeColors.maroon,
                    },
                  ]}
                >
                  Delete
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>


      {/* ================================================================
          REPORT INFORMATION
      ================================================================= */}

      <View
        style={
          styles.reportBody
        }
      >
        <ReportInfoRow
          label="NSTP Component:"
          value={
            normalizeComponent(
              report?.component
            ) ||
            'Not specified'
          }
        />

        <ReportInfoRow
          label="Instructor:"
          value={
            report?.instructor ||
            'Not assigned'
          }
        />

        <ReportInfoRow
          label="Date of Occurrence:"
          value={
            getOccurrenceDate(
              report
            )
          }
        />

        <Text
          style={
            styles.reportQuestion
          }
        >
          What’s this about?
        </Text>

        <Text
          style={
            styles.reportAnswer
          }
        >
          {getReportConcern(
            report
          ) ||
          'Student Concern'}
        </Text>

        <Text
          style={
            styles.reportQuestion
          }
        >
          Describe Your Concern:
        </Text>

        <Text
          style={
            styles.reportDescription
          }
        >
          {report?.description ||
            'No description provided.'}
        </Text>
      </View>


      {/* ================================================================
          SUPPORTING PROOF
      ================================================================= */}

      {Boolean(
        attachmentUrl
      ) && (
        <View
          style={
            styles.attachmentArea
          }
        >
          {showImage ? (
            <Image
              source={{
                uri:
                  attachmentUrl,
              }}
              style={
                styles.reportAttachmentImage
              }
              resizeMode="cover"
              onError={() =>
                setImageFailed(
                  true
                )
              }
            />
          ) : (
            <View
              style={
                styles.reportFileAttachment
              }
            >
              <View
                style={
                  styles.reportFileIcon
                }
              >
                <Ionicons
                  name="document-attach-outline"
                  size={25}
                  color={
                    themeColors.maroon
                  }
                />
              </View>

              <View
                style={
                  styles.reportFileCopy
                }
              >
                <Text
                  style={
                    styles.reportFileTitle
                  }
                >
                  Supporting proof
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.reportFileName
                  }
                >
                  {imageFailed
                    ? 'Image could not be displayed'
                    : report?.attachmentName ||
                      'Attached document'}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}


      {/* ================================================================
          OFFICIAL REVIEW / RESPONSE
      ================================================================= */}

      {Boolean(
        staffReview
      ) && (
        <StaffResponse
          response={
            staffReview
          }
          report={
            report
          }
          resolved={
            status === STATUS_RESOLVED
          }
        />
      )}
    </View>
  );
}


/* ==========================================================================
   STUDENT AVATAR
   ========================================================================== */

function StudentAvatar({
  uri,
  size,
  style,
}) {
  const [
    failed,
    setFailed,
  ] = useState(false);

  const canShowPhoto =
    Boolean(uri) &&
    !failed;

  return (
    <View
      style={[
        styles.avatarBase,
        {
          width:
            size,

          height:
            size,

          borderRadius:
            size / 2,
        },
        style,
      ]}
    >
      {canShowPhoto ? (
        <Image
          source={{
            uri,
          }}
          style={{
            width: '100%',
            height: '100%',

            borderRadius:
              size / 2,
          }}
          resizeMode="cover"
          onError={() =>
            setFailed(
              true
            )
          }
        />
      ) : (
        <Ionicons
          name="person"
          size={
            Math.round(
              size * 0.48
            )
          }
          color={
            themeColors.white
          }
        />
      )}
    </View>
  );
}


/* ==========================================================================
   FORM LABEL
   ========================================================================== */

function FormLabel({
  children,
}) {
  return (
    <Text
      style={
        styles.formLabel
      }
    >
      {children}
    </Text>
  );
}


/* ==========================================================================
   COMPONENT RADIO
   ========================================================================== */

function ComponentRadio({
  value,
  selected,
  onPress,
}) {
  const details =
    COMPONENT_DETAILS[value] ??
    COMPONENT_DETAILS.ROTC;

  return (
    <Pressable
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.componentRadio,

        pressed && {
          opacity: 0.68,
        },
      ]}
    >
      <View
        style={[
          styles.radioOuter,

          selected &&
          styles.radioOuterSelected,
        ]}
      >
        {selected && (
          <View
            style={
              styles.radioInner
            }
          />
        )}
      </View>

      <View
        style={
          styles.componentMiniIcon
        }
      >
        <Ionicons
          name={
            details.icon
          }
          size={18}
          color={
            themeColors.green
          }
        />
      </View>

      <View
        style={
          styles.componentRadioCopy
        }
      >
        <Text
          style={
            styles.componentRadioTitle
          }
        >
          {details.title}
        </Text>

        <Text
          numberOfLines={1}
          style={
            styles.componentRadioSubtitle
          }
        >
          {details.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}


/* ==========================================================================
   INSTRUCTOR RADIO
   ========================================================================== */

function InstructorRadio({
  instructor,
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
        styles.instructorRadio,

        selected &&
        styles.instructorRadioSelected,

        pressed && {
          opacity: 0.72,
        },
      ]}
    >
      <View
        style={[
          styles.radioOuter,

          selected &&
          styles.radioOuterSelected,
        ]}
      >
        {selected && (
          <View
            style={
              styles.radioInner
            }
          />
        )}
      </View>

      <Text
        numberOfLines={2}
        style={
          styles.instructorRadioName
        }
      >
        {instructor?.full_name ||
          instructor?.name ||
          'NSTP Instructor'}
      </Text>
    </Pressable>
  );
}


/* ==========================================================================
   INLINE NOTICE
   ========================================================================== */

function InlineNotice({
  icon,
  text,
}) {
  return (
    <View
      style={
        styles.inlineNotice
      }
    >
      <Ionicons
        name={
          icon
        }
        size={19}
        color={
          themeColors.orange
        }
      />

      <Text
        style={
          styles.inlineNoticeText
        }
      >
        {text}
      </Text>
    </View>
  );
}


/* ==========================================================================
   REPORT INFO ROW
   ========================================================================== */

function ReportInfoRow({
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


/* ==========================================================================
   STATUS BADGE
   ========================================================================== */

function StatusBadge({
  status,
}) {
  let color =
    themeColors.orange;

  let icon =
    'time-outline';

  if (
    status === STATUS_REVIEW
  ) {
    color =
      themeColors.green;

    icon =
      'eye-outline';
  }

  if (
    status === STATUS_RESOLVED
  ) {
    color =
      themeColors.maroon;

    icon =
      'checkmark-circle-outline';
  }

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor:
            color,
        },
      ]}
    >
      <Ionicons
        name={
          icon
        }
        size={13}
        color={
          themeColors.white
        }
      />

      <Text
        style={
          styles.statusBadgeText
        }
      >
        {status}
      </Text>
    </View>
  );
}


/* ==========================================================================
   STAFF RESPONSE
   ========================================================================== */

function StaffResponse({
  response,
  report,
  resolved = false,
}) {
  const reviewerName = String(
    response?.name ??
    response?.reviewer_name ??
    report?.reviewer_name ??
    report?.reviewed_by_name ??
    report?.resolved_by_name ??
    report?.university_admin_name ??
    ''
  ).trim();

  const reviewerRole = String(
    response?.role ??
    response?.reviewer_role ??
    report?.reviewer_role ??
    report?.reviewed_by_role ??
    report?.resolved_by_role ??
    ''
  ).trim();

  const reviewerPhoto =
    response?.profile_photo_url ??
    response?.photo_url ??
    response?.avatar_url ??
    response?.photo ??
    report?.reviewer_photo_url ??
    report?.reviewed_by_photo_url ??
    report?.resolved_by_photo_url ??
    report?.university_admin_photo_url ??
    null;

  const reviewedAt =
    response?.reviewed_at ??
    response?.responded_at ??
    response?.resolved_at ??
    report?.reviewed_at ??
    report?.responded_at ??
    report?.resolved_at ??
    report?.updated_at ??
    null;

  const reviewedDate =
    formatReviewedDate(
      reviewedAt
    );

  const message = String(
    response?.message ??
    response?.feedback ??
    response?.response ??
    'Your report has been reviewed.'
  ).trim();

  const hasReviewerIdentity =
    Boolean(
      reviewerName ||
      reviewerRole ||
      reviewerPhoto
    );

  return (
    <View
      style={[
        styles.staffResponse,

        resolved &&
        styles.resolutionResponse,
      ]}
    >
      {hasReviewerIdentity ? (
        <View
          style={
            styles.responseReviewerRow
          }
        >
          <StudentAvatar
            uri={
              reviewerPhoto
            }
            size={52}
            style={
              styles.responseReviewerAvatar
            }
          />

          <View
            style={
              styles.responseReviewerIdentity
            }
          >
            {Boolean(
              reviewerName
            ) && (
              <Text
                numberOfLines={1}
                style={
                  styles.responseName
                }
              >
                {reviewerName}
              </Text>
            )}

            {Boolean(
              reviewerRole
            ) && (
              <View
                style={
                  styles.responseRoleRow
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={
                    themeColors.darkTeal
                  }
                />

                <Text
                  numberOfLines={1}
                  style={
                    styles.responseRole
                  }
                >
                  {reviewerRole}
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View
          style={
            styles.staffResponseHeader
          }
        >
          <Ionicons
            name={
              resolved
                ? 'checkmark-done-circle-outline'
                : 'chatbox-ellipses-outline'
            }
            size={19}
            color={
              resolved
                ? themeColors.green
                : themeColors.darkTeal
            }
          />

          <Text
            style={
              styles.staffResponseTitle
            }
          >
            {resolved
              ? 'RESOLUTION'
              : 'NSTP RESPONSE'}
          </Text>
        </View>
      )}

      <Text
        style={
          styles.staffResponseMessage
        }
      >
        {message}
      </Text>

      {Boolean(
        reviewedDate
      ) && (
        <View
          style={
            styles.responseReviewedRow
          }
        >
          <Ionicons
            name="calendar-outline"
            size={13}
            color={
              themeColors.muted
            }
          />

          <Text
            style={
              styles.responseReviewedText
            }
          >
            Last reviewed: {reviewedDate}
          </Text>
        </View>
      )}
    </View>
  );
}



/* ==========================================================================
   EMPTY REPORTS
   ========================================================================== */

function EmptyReports({
  activeFilter,
  onCreate,
}) {
  return (
    <View
      style={
        styles.emptyReports
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name="document-text-outline"
          size={29}
          color={
            themeColors.darkTeal
          }
        />
      </View>

      <Text
        style={
          styles.emptyReportsTitle
        }
      >
        {activeFilter === STATUS_ALL
          ? 'No Reports Yet'
          : 'No Reports Found'}
      </Text>

      <Text
        style={
          styles.emptyReportsText
        }
      >
        {activeFilter === STATUS_ALL
          ? 'Your submitted NSTP reports will appear here.'
          : 'There are currently no reports under this status.'}
      </Text>

      {activeFilter === STATUS_ALL && (
        <Pressable
          onPress={
            onCreate
          }
          style={
            styles.emptyCreateButton
          }
        >
          <Ionicons
            name="add"
            size={20}
            color={
              themeColors.white
            }
          />

          <Text
            style={
              styles.emptyCreateButtonText
            }
          >
            Submit Report
          </Text>
        </Pressable>
      )}
    </View>
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

    safeArea: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    mainScroll: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    mainScrollContent: {
      alignItems:
        'center',

      paddingTop:
        16,

      paddingHorizontal:
        16,

      paddingBottom:
        170,
    },


    /* ======================================================================
       PAGE HEADER
       ====================================================================== */

    pageHeader: {
      paddingBottom:
        18,
    },


    pageHeaderTop: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    titleIcon: {
      width:
        56,

      height:
        56,

      borderRadius:
        11,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    titleCopy: {
      flex: 1,

      marginLeft:
        13,
    },


    eyebrow: {
      color:
        COLORS.green,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        1.4,
    },


    pageTitle: {
      marginTop:
        2,

      color:
        COLORS.maroon,

      fontSize:
        28,

      lineHeight:
        34,

      fontWeight:
        '900',
    },


    headerRule: {
      height:
        4,

      marginTop:
        16,

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
      marginTop:
        14,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      lineHeight:
        23,
    },


    componentTag: {
      alignSelf:
        'flex-start',

      minHeight:
        38,

      marginTop:
        15,

      paddingHorizontal:
        11,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        8,

      backgroundColor:
        COLORS.paper,
    },


    componentTagLabel: {
      marginLeft:
        7,

      color:
        COLORS.muted,

      fontSize:
        10,

      fontWeight:
        '900',

      letterSpacing:
        0.7,
    },


    componentDivider: {
      width:
        1,

      height:
        19,

      marginHorizontal:
        9,

      backgroundColor:
        COLORS.softLine,
    },


    componentTagValue: {
      color:
        COLORS.green,

      fontSize:
        14,

      fontWeight:
        '900',

      letterSpacing:
        0.3,
    },


    /* ======================================================================
       LOADING
       ====================================================================== */

    loadingContainer: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        28,
    },


    loadingIcon: {
      width:
        58,

      height:
        58,

      borderRadius:
        13,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    loadingIndicator: {
      marginTop:
        18,
    },


    loadingTitle: {
      marginTop:
        13,

      color:
        COLORS.maroon,

      fontSize:
        22,

      fontWeight:
        '900',
    },


    loadingText: {
      marginTop:
        6,

      color:
        COLORS.darkTeal,

      fontSize:
        15,

      lineHeight:
        21,

      textAlign:
        'center',
    },


    /* ======================================================================
       COMPACT ACTION SECTION
       ====================================================================== */

    reportControlSection: {
      marginTop:
        8,

      marginBottom:
        22,
    },


    actionStrip: {
      position:
        'relative',

      paddingTop:
        28,

      marginBottom:
        25,
    },


    actionStripMaroon: {
      height:
        42,

      backgroundColor:
        COLORS.maroon,
    },


    actionStripOrange: {
      height:
        7,

      backgroundColor:
        COLORS.orange,
    },


    addReportButton: {
      position:
        'absolute',

      right:
        18,

      top:
        0,

      width:
        64,

      height:
        64,

      borderWidth:
        3,

      borderColor:
        COLORS.orange,

      borderRadius:
        32,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.paper,

      elevation:
        5,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.17,

      shadowRadius:
        4,
    },


    addReportButtonPressed: {
      opacity:
        0.75,

      transform: [
        {
          scale:
            0.96,
        },
      ],
    },


    /* ======================================================================
       COMPACT STATUS FILTERS
       ====================================================================== */

    filterBar: {
      width:
        '100%',

      paddingHorizontal:
        4,

      flexDirection:
        'row',

      alignItems:
        'center',

      columnGap:
        8,

      overflow:
        'visible',
    },


    filterWrapper: {
      position:
        'relative',

      minWidth:
        0,

      overflow:
        'visible',
    },


    filterButton: {
      width:
        '100%',

      height:
        36,

      paddingHorizontal:
        7,

      borderWidth:
        1,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

      elevation:
        4,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        3,
    },


    filterButtonActive: {
      transform: [
        {
          translateY:
            -1,
        },
      ],
    },


    filterButtonPressed: {
      opacity:
        0.78,
    },


    filterButtonText: {
      color:
        COLORS.white,

      fontSize:
        12,

      lineHeight:
        15,

      fontWeight:
        '800',

      letterSpacing:
        0.1,

      textAlign:
        'center',
    },


    filterCount: {
      position:
        'absolute',

      right:
        -6,

      top:
        -11,

      minWidth:
        24,

      height:
        24,

      paddingHorizontal:
        4,

      borderWidth:
        1.5,

      borderRadius:
        12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.paper,

      elevation:
        5,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.17,

      shadowRadius:
        2,
    },


    filterCountText: {
      fontSize:
        10.5,

      lineHeight:
        13,

      fontWeight:
        '900',
    },


    /* ======================================================================
       ERROR
       ====================================================================== */

    errorBox: {
      marginBottom:
        18,

      padding:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        9,

      backgroundColor:
        COLORS.softMaroon,

      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },


    errorCopy: {
      flex: 1,

      paddingHorizontal:
        10,
    },


    errorTitle: {
      color:
        COLORS.maroon,

      fontSize:
        15,

      fontWeight:
        '900',
    },


    errorText: {
      marginTop:
        4,

      color:
        COLORS.darkTeal,

      fontSize:
        13,

      lineHeight:
        19,
    },


    retryButton: {
      width:
        36,

      height:
        36,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.maroon,
    },


    /* ======================================================================
       REPORT LIST
       ====================================================================== */

    reportList: {
      alignSelf:
        'center',
    },


    reportCard: {
      marginBottom:
        18,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        13,

      backgroundColor:
        COLORS.paper,

      overflow:
        'visible',

      elevation:
        2,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.08,

      shadowRadius:
        3,
    },


    reportCardHeader: {
      minHeight:
        86,

      paddingTop:
        14,

      paddingHorizontal:
        14,

      paddingBottom:
        9,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      position:
        'relative',

      zIndex:
        20,
    },


    avatarBase: {
      overflow:
        'hidden',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.muted,

      borderWidth:
        2,

      borderColor:
        COLORS.white,
    },


    reportIdentity: {
      flex: 1,

      paddingLeft:
        10,

      paddingRight:
        7,
    },


    reportStudentName: {
      color:
        COLORS.maroon,

      fontSize:
        16,

      lineHeight:
        21,

      fontWeight:
        '900',

      textTransform:
        'uppercase',
    },


    reportMetaRow: {
      marginTop:
        5,

      flexDirection:
        'row',

      alignItems:
        'center',

      flexWrap:
        'wrap',
    },


    reportEmail: {
      maxWidth:
        150,

      color:
        COLORS.green,

      fontSize:
        12,

      fontStyle:
        'italic',
    },


    metaDot: {
      width:
        3,

      height:
        3,

      marginHorizontal:
        6,

      borderRadius:
        2,

      backgroundColor:
        COLORS.gray,
    },


    reportSubmittedDate: {
      marginLeft:
        4,

      color:
        COLORS.muted,

      fontSize:
        11,
    },


    cardRight: {
      alignItems:
        'flex-end',
    },


    menuButton: {
      width:
        32,

      height:
        26,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /* ======================================================================
       STATUS BADGE
       ====================================================================== */

    statusBadge: {
      minWidth:
        84,

      minHeight:
        28,

      marginTop:
        4,

      paddingHorizontal:
        10,

      borderRadius:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    statusBadgeText: {
      marginLeft:
        5,

      color:
        COLORS.white,

      fontSize:
        9.5,

      fontWeight:
        '900',
    },


    /* ======================================================================
       ACTION MENU
       ====================================================================== */

    actionMenu: {
      position:
        'absolute',

      top:
        43,

      right:
        11,

      width:
        124,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        8,

      backgroundColor:
        COLORS.white,

      overflow:
        'hidden',

      elevation:
        15,

      zIndex:
        100,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity:
        0.16,

      shadowRadius:
        6,
    },


    actionMenuItem: {
      minHeight:
        46,

      paddingHorizontal:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    actionMenuText: {
      marginLeft:
        8,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      fontWeight:
        '700',
    },


    actionMenuDivider: {
      height:
        StyleSheet.hairlineWidth,

      backgroundColor:
        COLORS.softLine,
    },


    /* ======================================================================
       REPORT BODY
       ====================================================================== */

    reportBody: {
      paddingHorizontal:
        15,

      paddingBottom:
        16,
    },


    infoRow: {
      marginBottom:
        3,

      flexDirection:
        'row',

      flexWrap:
        'wrap',
    },


    infoLabel: {
      color:
        COLORS.darkTeal,

      fontSize:
        13.5,

      lineHeight:
        19,

      fontWeight:
        '900',
    },


    infoValue: {
      flexShrink:
        1,

      marginLeft:
        4,

      color:
        COLORS.darkTeal,

      fontSize:
        13.5,

      lineHeight:
        19,
    },


    reportQuestion: {
      marginTop:
        13,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '900',
    },


    reportAnswer: {
      marginTop:
        3,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      lineHeight:
        20,
    },


    reportDescription: {
      marginTop:
        4,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      lineHeight:
        21,
    },


    /* ======================================================================
       ATTACHMENT
       ====================================================================== */

    attachmentArea: {
      borderTopWidth:
        1,

      borderTopColor:
        COLORS.softLine,

      overflow:
        'hidden',
    },


    reportAttachmentImage: {
      width:
        '100%',

      height:
        250,

      backgroundColor:
        COLORS.gray,
    },


    reportFileAttachment: {
      minHeight:
        68,

      paddingHorizontal:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.white,
    },


    reportFileIcon: {
      width:
        42,

      height:
        42,

      borderRadius:
        8,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.softMaroon,
    },


    reportFileCopy: {
      flex: 1,

      paddingLeft:
        10,
    },


    reportFileTitle: {
      color:
        COLORS.darkTeal,

      fontSize:
        13,

      fontWeight:
        '900',
    },


    reportFileName: {
      marginTop:
        3,

      color:
        COLORS.muted,

      fontSize:
        12,
    },


    /* ======================================================================
       STAFF RESPONSE / UNIVERSITY ADMIN REVIEW
       ====================================================================== */

    staffResponse: {
      paddingHorizontal:
        16,

      paddingTop:
        16,

      paddingBottom:
        17,

      borderTopWidth:
        1,

      borderTopColor:
        COLORS.softLine,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.maroon,

      borderStyle:
        'dashed',

      backgroundColor:
        COLORS.softTeal,
    },


    resolutionResponse: {
      backgroundColor:
        COLORS.softGreen,
    },


    staffResponseHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    staffResponseTitle: {
      marginLeft:
        7,

      color:
        COLORS.darkTeal,

      fontSize:
        11,

      fontWeight:
        '900',

      letterSpacing:
        0.7,
    },


    responseReviewerRow: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    responseReviewerAvatar: {
      borderWidth:
        2,

      borderColor:
        COLORS.white,

      backgroundColor:
        COLORS.darkTeal,

      elevation:
        2,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity:
        0.14,

      shadowRadius:
        2,
    },


    responseReviewerIdentity: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        11,
    },


    responseName: {
      color:
        COLORS.maroon,

      fontSize:
        14,

      lineHeight:
        18,

      fontWeight:
        '900',

      textTransform:
        'uppercase',
    },


    responseRoleRow: {
      marginTop:
        3,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    responseRole: {
      flexShrink:
        1,

      marginLeft:
        4,

      color:
        COLORS.darkTeal,

      fontSize:
        10.5,

      lineHeight:
        14,

      fontWeight:
        '900',

      textTransform:
        'uppercase',
    },


    staffResponseMessage: {
      marginTop:
        17,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      lineHeight:
        21,
    },


    responseReviewedRow: {
      marginTop:
        15,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    responseReviewedText: {
      marginLeft:
        6,

      color:
        COLORS.muted,

      fontSize:
        10.5,

      lineHeight:
        14,
    },


    /* ======================================================================
       EMPTY
       ====================================================================== */

    emptyReports: {
      paddingVertical:
        42,

      paddingHorizontal:
        24,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        12,

      alignItems:
        'center',

      backgroundColor:
        COLORS.paper,
    },


    emptyIcon: {
      width:
        58,

      height:
        58,

      borderRadius:
        12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.softTeal,
    },


    emptyReportsTitle: {
      marginTop:
        14,

      color:
        COLORS.maroon,

      fontSize:
        19,

      fontWeight:
        '900',
    },


    emptyReportsText: {
      marginTop:
        6,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      lineHeight:
        20,

      textAlign:
        'center',
    },


    emptyCreateButton: {
      minHeight:
        44,

      marginTop:
        18,

      paddingHorizontal:
        17,

      borderRadius:
        22,

      backgroundColor:
        COLORS.maroon,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    emptyCreateButtonText: {
      marginLeft:
        6,

      color:
        COLORS.white,

      fontSize:
        13,

      fontWeight:
        '900',
    },


    /* ======================================================================
       FORM SCREEN
       ====================================================================== */

    formScreen: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    formScrollContent: {
      alignItems:
        'center',

      paddingTop:
        16,

      paddingHorizontal:
        16,

      paddingBottom:
        170,
    },


    /* ======================================================================
       STUDENT FORM IDENTITY
       ====================================================================== */

    identityBoard: {
      minHeight:
        128,

      position:
        'relative',

      marginTop:
        5,

      marginBottom:
        0,
    },


    formCloseButton: {
      position:
        'absolute',

      right:
        0,

      top:
        0,

      width:
        42,

      height:
        42,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        21,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.paper,

      zIndex:
        10,
    },


    identityId: {
      position:
        'absolute',

      right:
        50,

      top:
        15,

      maxWidth:
        '65%',

      color:
        COLORS.maroon,

      fontSize:
        12,

      fontWeight:
        '900',
    },


    identityNameBar: {
      position:
        'absolute',

      left:
        0,

      right:
        0,

      top:
        56,

      height:
        54,

      paddingLeft:
        115,

      paddingRight:
        12,

      justifyContent:
        'center',

      backgroundColor:
        COLORS.maroon,
    },


    identityName: {
      color:
        COLORS.white,

      fontSize:
        17,

      lineHeight:
        22,

      fontWeight:
        '900',

      textTransform:
        'uppercase',
    },


    formStudentAvatar: {
      position:
        'absolute',

      left:
        15,

      top:
        8,

      zIndex:
        5,

      borderWidth:
        3,

      borderColor:
        COLORS.white,

      elevation:
        4,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.15,

      shadowRadius:
        3,
    },


    /* ======================================================================
       FORM PANEL
       ====================================================================== */

    formPanel: {
      marginTop:
        -18,

      paddingTop:
        28,

      paddingHorizontal:
        17,

      paddingBottom:
        29,

      borderWidth:
        1.2,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.paper,
    },


    formPanelTitle: {
      marginBottom:
        7,

      color:
        COLORS.maroon,

      fontSize:
        14,

      fontWeight:
        '900',

      letterSpacing:
        0.4,
    },


    formLabel: {
      marginTop:
        20,

      marginBottom:
        8,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      lineHeight:
        21,

      fontWeight:
        '900',
    },


    /* ======================================================================
       COMPONENT
       ====================================================================== */

    componentList: {
      gap:
        4,
    },


    componentRadio: {
      minHeight:
        45,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    radioOuter: {
      width:
        19,

      height:
        19,

      borderWidth:
        1.7,

      borderColor:
        COLORS.green,

      borderRadius:
        10,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    radioOuterSelected: {
      borderColor:
        COLORS.maroon,
    },


    radioInner: {
      width:
        10,

      height:
        10,

      borderRadius:
        5,

      backgroundColor:
        COLORS.maroon,
    },


    componentMiniIcon: {
      width:
        34,

      height:
        34,

      marginLeft:
        8,

      borderWidth:
        1,

      borderColor:
        COLORS.green,

      borderRadius:
        17,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    componentRadioCopy: {
      flex: 1,

      paddingLeft:
        9,
    },


    componentRadioTitle: {
      color:
        COLORS.green,

      fontSize:
        14,

      fontWeight:
        '900',
    },


    componentRadioSubtitle: {
      marginTop:
        1,

      color:
        COLORS.muted,

      fontSize:
        11,
    },


    /* ======================================================================
       INSTRUCTOR
       ====================================================================== */

    instructorList: {
      gap:
        8,
    },


    instructorRadio: {
      minHeight:
        54,

      paddingHorizontal:
        12,

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.white,
    },


    instructorRadioSelected: {
      backgroundColor:
        COLORS.softGreen,
    },


    instructorRadioName: {
      flex: 1,

      marginLeft:
        10,

      color:
        COLORS.darkTeal,

      fontSize:
        15,

      lineHeight:
        20,

      fontWeight:
        '700',
    },


    /* ======================================================================
       INPUTS
       ====================================================================== */

    dateInputWrapper: {
      width:
        '100%',

      height:
        54,

      paddingHorizontal:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.white,
    },


    dateInput: {
      flex: 1,

      height:
        '100%',

      marginLeft:
        10,

      color:
        COLORS.darkTeal,

      fontSize:
        16,
    },


    inputHint: {
      marginTop:
        6,

      color:
        COLORS.muted,

      fontSize:
        12,
    },


    formInput: {
      width:
        '100%',

      minHeight:
        55,

      paddingHorizontal:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      backgroundColor:
        COLORS.white,
    },


    descriptionInput: {
      width:
        '100%',

      minHeight:
        145,

      paddingTop:
        12,

      paddingHorizontal:
        13,

      paddingBottom:
        12,

      borderWidth:
        1,

      borderColor:
        COLORS.maroon,

      color:
        COLORS.darkTeal,

      fontSize:
        16,

      lineHeight:
        23,

      backgroundColor:
        COLORS.white,
    },


    /* ======================================================================
       PROOF
       ====================================================================== */

    proofButton: {
      minHeight:
        50,

      paddingHorizontal:
        13,

      borderWidth:
        1.2,

      borderColor:
        COLORS.maroon,

      borderStyle:
        'dashed',

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.white,
    },


    proofButtonText: {
      marginLeft:
        9,

      color:
        COLORS.darkTeal,

      fontSize:
        14,

      fontWeight:
        '700',
    },


    selectedProof: {
      minHeight:
        66,

      padding:
        8,

      borderWidth:
        1,

      borderColor:
        COLORS.green,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.softGreen,
    },


    selectedProofImage: {
      width:
        50,

      height:
        50,

      borderRadius:
        5,

      backgroundColor:
        COLORS.gray,
    },


    selectedProofFileIcon: {
      width:
        50,

      height:
        50,

      borderRadius:
        5,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    selectedProofName: {
      flex: 1,

      marginHorizontal:
        10,

      color:
        COLORS.darkTeal,

      fontSize:
        13,

      fontWeight:
        '800',
    },


    removeProofButton: {
      width:
        36,

      height:
        36,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    editHint: {
      marginTop:
        11,

      padding:
        10,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      backgroundColor:
        COLORS.softTeal,
    },


    editHintText: {
      flex: 1,

      marginLeft:
        7,

      color:
        COLORS.darkTeal,

      fontSize:
        12,

      lineHeight:
        17,
    },


    inlineNotice: {
      padding:
        10,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      backgroundColor:
        COLORS.softYellow,
    },


    inlineNoticeText: {
      flex: 1,

      marginLeft:
        7,

      color:
        COLORS.darkTeal,

      fontSize:
        12.5,

      lineHeight:
        18,
    },


    /* ======================================================================
       SUBMIT BUTTON
       ====================================================================== */

    submitButton: {
      alignSelf:
        'center',

      minWidth:
        200,

      minHeight:
        50,

      marginTop:
        29,

      paddingHorizontal:
        22,

      borderRadius:
        25,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.maroon,
    },


    submitButtonPressed: {
      opacity:
        0.82,

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },


    submitButtonDisabled: {
      opacity:
        0.45,
    },


    submitButtonText: {
      marginLeft:
        8,

      color:
        COLORS.white,

      fontSize:
        13,

      fontWeight:
        '900',

      letterSpacing:
        0.4,
    },
  });