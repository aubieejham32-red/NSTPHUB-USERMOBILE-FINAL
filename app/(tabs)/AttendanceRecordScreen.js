import { Ionicons } from '@expo/vector-icons';

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
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  getAttendanceRecords,
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
   TABLE
   ========================================================================== */

const TABLE_WIDTH = 650;

const COLUMN_WIDTHS = {
  date: 190,
  timeIn: 135,
  timeOut: 135,
  remarks: 190,
};


/* ==========================================================================
   SEARCH HELPERS
   ========================================================================== */

function normalizeText(value) {
  return String(
    value
    ??
    ''
  )
    .trim()
    .toLowerCase()
    .replace(
      /[,.-]/g,
      ' '
    )
    .replace(
      /\//g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    );
}


function buildDateSearchText(record) {
  const values = [
    record?.attendance_date,
    record?.date,
    record?.date_label,
  ];


  const isoDate =
    String(
      record?.attendance_date
      ??
      ''
    ).trim();


  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      isoDate
    )
  ) {
    const [
      year,
      month,
      day,
    ] =
      isoDate
        .split('-')
        .map(Number);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      values.push(
        new Intl.DateTimeFormat(
          'en-US',
          {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }
        ).format(
          date
        )
      );


      values.push(
        new Intl.DateTimeFormat(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }
        ).format(
          date
        )
      );


      values.push(
        `${month}/${day}/${year}`,

        `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`,

        `${day}/${month}/${year}`,

        `${day}-${month}-${year}`,

        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      );
    }
  }


  return normalizeText(
    values
      .filter(Boolean)
      .join(' ')
  );
}


/* ==========================================================================
   REMARK THEME
   ========================================================================== */

function getRemarkTheme(remark) {
  const normalized =
    String(
      remark
      ??
      ''
    )
      .trim()
      .toUpperCase();


  switch (
    normalized
  ) {
    case 'PRESENT':
      return {
        color:
          COLORS.green,

        backgroundColor:
          COLORS.softGreen,

        borderColor:
          COLORS.green,

        icon:
          'checkmark-circle-outline',
      };


    case 'LATE':
      return {
        color:
          '#8A5A00',

        backgroundColor:
          COLORS.softOrange,

        borderColor:
          COLORS.orange,

        icon:
          'time-outline',
      };


    case 'EXCUSED':
    case 'EXCUSE':
      return {
        color:
          COLORS.darkTeal,

        backgroundColor:
          COLORS.softTeal,

        borderColor:
          COLORS.darkTeal,

        icon:
          'shield-checkmark-outline',
      };


    case 'ABSENT':
      return {
        color:
          COLORS.maroon,

        backgroundColor:
          COLORS.softMaroon,

        borderColor:
          COLORS.maroon,

        icon:
          'close-circle-outline',
      };


    default:
      return {
        color:
          COLORS.muted,

        backgroundColor:
          COLORS.softCream,

        borderColor:
          COLORS.gray,

        icon:
          'remove-circle-outline',
      };
  }
}


/* ==========================================================================
   SUMMARY CELL
   ========================================================================== */

function SummaryCell({
  icon,
  label,
  value,
  color,
}) {
  return (
    <View style={styles.summaryCell}>

      <Ionicons
        name={icon}
        size={23}
        color={color}
      />


      <Text style={styles.summaryNumber}>
        {value}
      </Text>


      <Text style={styles.summaryLabel}>
        {label}
      </Text>

    </View>
  );
}


/* ==========================================================================
   TABLE HEADER CELL
   ========================================================================== */

function TableHeaderCell({
  title,
  width,
  divider = false,
}) {
  return (
    <View
      style={[
        styles.tableHeaderCell,

        {
          width,
        },

        divider
        &&
        styles.tableDivider,
      ]}
    >
      <Text style={styles.tableHeaderText}>
        {title}
      </Text>
    </View>
  );
}


/* ==========================================================================
   TABLE BODY CELL
   ========================================================================== */

function TableBodyCell({
  value,
  width,
  divider = false,
}) {
  return (
    <View
      style={[
        styles.tableBodyCell,

        {
          width,
        },

        divider
        &&
        styles.tableDivider,
      ]}
    >
      <Text style={styles.tableBodyText}>
        {
          String(
            value
            ??
            ''
          ).trim()
          ||
          '—'
        }
      </Text>
    </View>
  );
}


/* ==========================================================================
   REMARK CELL
   ========================================================================== */

function RemarkCell({
  value,
  width,
  divider = false,
}) {
  const theme =
    getRemarkTheme(
      value
    );


  const label =
    String(
      value
      ??
      ''
    )
      .trim()
      .toUpperCase()
    ||
    '—';


  return (
    <View
      style={[
        styles.tableBodyCell,

        {
          width,
        },

        divider
        &&
        styles.tableDivider,
      ]}
    >
      <View
        style={[
          styles.remarkBadge,

          {
            backgroundColor:
              theme.backgroundColor,

            borderColor:
              theme.borderColor,
          },
        ]}
      >

        <Ionicons
          name={theme.icon}
          size={16}
          color={theme.color}
        />


        <Text
          style={[
            styles.remarkText,

            {
              color:
                theme.color,
            },
          ]}
        >
          {label}
        </Text>

      </View>
    </View>
  );
}


/* ==========================================================================
   MAIN SCREEN
   ========================================================================== */

export default function AttendanceRecordScreen() {

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
  | Same Main Width As Announcements
  |--------------------------------------------------------------------------
  */

  const contentWidth =
    Math.min(
      width - 32,
      430
    );


  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */

  const [
    attendance,
    setAttendance,
  ] =
    useState(
      []
    );


  const [
    summary,
    setSummary,
  ] =
    useState({
      total: 0,
      present: 0,
      late: 0,
      excused: 0,
      absent: 0,
    });


  const [
    student,
    setStudent,
  ] =
    useState({
      status:
        'ACTIVE',

      status_label:
        'ACTIVE',

      component:
        '',
    });


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
    searchText,
    setSearchText,
  ] =
    useState(
      ''
    );


  /* ------------------------------------------------------------------------
     Load Attendance From Laravel
     ------------------------------------------------------------------------ */

  const loadAttendance =
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
            await getAttendanceRecords();


          const records =
            Array.isArray(
              response?.attendance
            )
              ? response.attendance
              : [];


          setAttendance(
            records
          );


          setSummary({
            total:
              Number(
                response
                  ?.summary
                  ?.total
                ??
                records.length
              ),

            present:
              Number(
                response
                  ?.summary
                  ?.present
                ??
                0
              ),

            late:
              Number(
                response
                  ?.summary
                  ?.late
                ??
                0
              ),

            excused:
              Number(
                response
                  ?.summary
                  ?.excused
                ??
                0
              ),

            absent:
              Number(
                response
                  ?.summary
                  ?.absent
                ??
                0
              ),
          });


          setStudent({
            status:
              String(
                response
                  ?.student
                  ?.status
                ??
                'ACTIVE'
              )
                .trim()
                .toUpperCase(),

            status_label:
              String(
                response
                  ?.student
                  ?.status_label
                ??
                response
                  ?.student
                  ?.status
                ??
                'ACTIVE'
              )
                .trim()
                .toUpperCase(),

            component:
              String(
                response
                  ?.student
                  ?.component
                ??
                ''
              )
                .trim()
                .toUpperCase(),
          });

        } catch (
          error
        ) {
          console.warn(
            'Attendance Load Error:',
            error
          );


          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load attendance records.'
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


  /* ------------------------------------------------------------------------
     Reload When Screen Opens
     ------------------------------------------------------------------------ */

  useFocusEffect(
    useCallback(
      () => {

        loadAttendance(
          false
        );

      },
      [
        loadAttendance,
      ]
    )
  );


  /* ------------------------------------------------------------------------
     Search
     ------------------------------------------------------------------------ */

  const filteredAttendance =
    useMemo(
      () => {

        const keyword =
          normalizeText(
            searchText
          );


        if (
          !keyword
        ) {
          return attendance;
        }


        return attendance.filter(
          record =>
            buildDateSearchText(
              record
            ).includes(
              keyword
            )
        );

      },
      [
        attendance,
        searchText,
      ]
    );


  const clearSearch =
    () => {

      setSearchText(
        ''
      );


      Keyboard.dismiss();
    };


  /* ------------------------------------------------------------------------
     Student Standing
     ------------------------------------------------------------------------ */

  const standingTheme =
    useMemo(
      () => {

        const status =
          String(
            student
              .status_label
            ??
            ''
          )
            .trim()
            .toUpperCase();


        if (
          status ===
          'DROPOUT'
        ) {
          return {
            color:
              themeColors.maroon,

            backgroundColor:
              themeColors.softMaroon,

            icon:
              'close-circle-outline',
          };
        }


        if (
          status ===
          'WARNING FOR DROPOUT'
        ) {
          return {
            color:
              COLORS.orange,

            backgroundColor:
              themeColors.softYellow,

            icon:
              'warning-outline',
          };
        }


        return {
          color:
            themeColors.green,

          backgroundColor:
            themeColors.softGreen,

          icon:
            'checkmark-circle-outline',
        };

      },
      [
        student.status_label,
      ]
    );


  /* ------------------------------------------------------------------------
     Loading
     ------------------------------------------------------------------------ */

  if (
    loading
  ) {
    return (
      <SafeAreaView
        style={styles.container}
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
          backgroundColor={themeColors.cream}
        />


        <View style={styles.loadingContainer}>

          <Ionicons
            name="calendar-outline"
            size={36}
            color={themeColors.darkTeal}
          />


          <ActivityIndicator
            size="large"
            color={themeColors.green}
            style={styles.loadingSpinner}
          />


          <Text style={styles.loadingTitle}>
            Loading Attendance
          </Text>


          <Text style={styles.loadingText}>
            Getting your latest attendance records.
          </Text>

        </View>

      </SafeAreaView>
    );
  }


  /* ------------------------------------------------------------------------
     Screen
     ------------------------------------------------------------------------ */

  return (
    <SafeAreaView
      style={styles.container}
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
        backgroundColor={themeColors.cream}
      />


      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadAttendance(
                true
              )
            }
            colors={[
              themeColors.green,
            ]}
            tintColor={themeColors.green}
            progressBackgroundColor={themeColors.white}
          />
        }
      >

        {/* ================================================================
            SIMPLE PAGE HEADER
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

          <View style={styles.pageHeaderTop}>

            <View style={styles.titleIcon}>
              <Ionicons
                name="calendar-clear-outline"
                size={25}
                color={themeColors.white}
              />
            </View>


            <View style={styles.titleCopy}>

              <Text style={styles.eyebrow}>
                NSTP HUB
              </Text>


              <Text style={styles.pageTitle}>
                Attendance Record
              </Text>

            </View>

          </View>


          <View style={styles.headerRule}>

            <View style={styles.ruleGreen} />

            <View style={styles.ruleYellow} />

            <View style={styles.ruleOrange} />

          </View>


          <Text style={styles.pageDescription}>
            View your official Time In, Time Out,
            and attendance remarks.
          </Text>


          <View style={styles.metaRow}>

            {
              Boolean(
                student.component
              )
              &&
              (
                <View style={styles.componentTag}>

                  <Ionicons
                    name="school-outline"
                    size={16}
                    color={themeColors.darkTeal}
                  />


                  <Text style={styles.componentTagText}>
                    {student.component}
                  </Text>

                </View>
              )
            }


            <View
              style={[
                styles.statusTag,

                {
                  backgroundColor:
                    standingTheme.backgroundColor,
                },
              ]}
            >

              <Ionicons
                name={standingTheme.icon}
                size={16}
                color={standingTheme.color}
              />


              <Text
                style={[
                  styles.statusTagText,

                  {
                    color:
                      standingTheme.color,
                  },
                ]}
              >
                {
                  student.status_label
                  ||
                  'ACTIVE'
                }
              </Text>

            </View>

          </View>

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
                color={themeColors.maroon}
              />


              <View style={styles.errorCopy}>

                <Text style={styles.errorTitle}>
                  Unable to load attendance
                </Text>


                <Text style={styles.errorText}>
                  {errorMessage}
                </Text>

              </View>


              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={() =>
                  loadAttendance(
                    false
                  )
                }
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={themeColors.white}
                />
              </TouchableOpacity>

            </View>
          )
        }


        {/* ================================================================
            SUMMARY
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

          <View style={styles.sectionTitleRow}>

            <View>
              <Text style={styles.sectionTitle}>
                Attendance Summary
              </Text>


              <Text style={styles.sectionDescription}>
                Your current attendance standing
              </Text>
            </View>


            <Ionicons
              name="stats-chart-outline"
              size={22}
              color={themeColors.darkTeal}
            />

          </View>


          <View style={styles.summaryGrid}>

            <SummaryCell
              icon="checkmark-circle-outline"
              label="Present"
              value={summary.present}
              color={themeColors.green}
            />


            <SummaryCell
              icon="time-outline"
              label="Late"
              value={summary.late}
              color={themeColors.orange}
            />


            <SummaryCell
              icon="shield-checkmark-outline"
              label="Excused"
              value={summary.excused}
              color={themeColors.darkTeal}
            />


            <SummaryCell
              icon="close-circle-outline"
              label="Absent"
              value={summary.absent}
              color={themeColors.maroon}
            />

          </View>

        </View>


        {/* ================================================================
            SEARCH
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

          <View style={styles.sectionTitleRow}>

            <View>
              <Text style={styles.sectionTitle}>
                Find a Date
              </Text>


              <Text style={styles.sectionDescription}>
                Search your attendance history
              </Text>
            </View>

          </View>


          <View style={styles.searchBar}>

            <Ionicons
              name="search-outline"
              size={21}
              color={themeColors.darkTeal}
            />


            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() =>
                Keyboard.dismiss()
              }
              placeholder="Search date"
              placeholderTextColor={themeColors.muted}
              style={styles.searchInput}
              selectionColor={themeColors.green}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />


            {
              Boolean(
                searchText
              )
              &&
              (
                <TouchableOpacity
                  style={styles.clearButton}
                  activeOpacity={0.75}
                  onPress={clearSearch}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={themeColors.maroon}
                  />
                </TouchableOpacity>
              )
            }

          </View>


          <View style={styles.searchInfoRow}>

            <Ionicons
              name="calendar-outline"
              size={14}
              color={themeColors.green}
            />


            <Text style={styles.searchHint}>
              July 10, 2026 · 2026-07-10 · 7/10/2026
            </Text>

          </View>


          {
            Boolean(
              searchText
            )
            &&
            (
              <Text style={styles.resultText}>
                {
                  filteredAttendance.length
                }
                {
                  filteredAttendance.length ===
                  1
                    ? ' matching record'
                    : ' matching records'
                }
              </Text>
            )
          }

        </View>


        {/* ================================================================
            OFFICIAL RECORD
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

          <View style={styles.sectionTitleRow}>

            <View>
              <Text style={styles.sectionTitle}>
                Official Record
              </Text>


              <Text style={styles.sectionDescription}>
                Swipe the table to view all columns
              </Text>
            </View>


            <Ionicons
              name="reader-outline"
              size={22}
              color={themeColors.maroon}
            />

          </View>


          <View style={styles.tableShell}>

            <View style={styles.tableTopBar}>

              <View style={styles.tableTopAccent} />


              <Ionicons
                name="document-text-outline"
                size={20}
                color={themeColors.white}
              />


              <Text style={styles.tableTitle}>
                ATTENDANCE HISTORY
              </Text>

            </View>


            <ScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator
              contentContainerStyle={styles.horizontalTable}
            >

              <View style={styles.table}>

                <View style={styles.tableHeaderRow}>

                  <TableHeaderCell
                    title="DATE"
                    width={COLUMN_WIDTHS.date}
                  />


                  <TableHeaderCell
                    title="TIME IN"
                    width={COLUMN_WIDTHS.timeIn}
                    divider
                  />


                  <TableHeaderCell
                    title="TIME OUT"
                    width={COLUMN_WIDTHS.timeOut}
                    divider
                  />


                  <TableHeaderCell
                    title="REMARKS"
                    width={COLUMN_WIDTHS.remarks}
                    divider
                  />

                </View>


                {
                  filteredAttendance.length >
                  0
                    ? (
                      filteredAttendance.map(
                        (
                          record,
                          index
                        ) => (
                          <View
                            key={
                              record?.id
                              ??
                              `${record?.attendance_date}-${index}`
                            }
                            style={[
                              styles.tableRow,

                              index %
                              2 ===
                              1
                              &&
                              styles.tableAlternateRow,
                            ]}
                          >

                            <TableBodyCell
                              value={
                                record?.date_label
                                ??
                                record?.date
                                ??
                                record?.attendance_date
                              }
                              width={COLUMN_WIDTHS.date}
                            />


                            <TableBodyCell
                              value={
                                record?.time_in_label
                                ??
                                record?.timeIn
                                ??
                                record?.time_in
                              }
                              width={COLUMN_WIDTHS.timeIn}
                              divider
                            />


                            <TableBodyCell
                              value={
                                record?.time_out_label
                                ??
                                record?.timeOut
                                ??
                                record?.time_out
                              }
                              width={COLUMN_WIDTHS.timeOut}
                              divider
                            />


                            <RemarkCell
                              value={
                                record?.remark
                                ??
                                record?.remarks
                              }
                              width={COLUMN_WIDTHS.remarks}
                              divider
                            />

                          </View>
                        )
                      )
                    )
                    : (
                      <View style={styles.emptyState}>

                        <Ionicons
                          name="calendar-outline"
                          size={33}
                          color={themeColors.green}
                        />


                        <Text style={styles.emptyTitle}>
                          No Attendance Found
                        </Text>


                        <Text style={styles.emptyDescription}>
                          {
                            searchText
                              ? 'No attendance record matches the date you entered.'
                              : 'Your official attendance history will appear here.'
                          }
                        </Text>

                      </View>
                    )
                }

              </View>

            </ScrollView>

          </View>

        </View>


        <View style={styles.bottomSpace} />

      </ScrollView>

    </SafeAreaView>
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


    loadingSpinner: {
      marginTop: 18,
    },


    loadingTitle: {
      marginTop: 16,

      color:
        COLORS.maroon,

      fontSize: 20,

      fontWeight:
        '800',
    },


    loadingText: {
      marginTop: 5,

      color:
        COLORS.darkTeal,

      fontSize: 14,

      lineHeight: 20,

      textAlign:
        'center',
    },


    /* ------------------------------------------------------------------------
       Page Header
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

      fontSize: 26,

      lineHeight: 31,

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


    metaRow: {
      marginTop: 13,

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',
    },


    componentTag: {
      minHeight: 34,

      marginRight: 8,

      marginBottom: 5,

      paddingHorizontal: 11,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 8,

      backgroundColor:
        COLORS.softCream,
    },


    componentTagText: {
      marginLeft: 6,

      color:
        COLORS.darkTeal,

      fontSize: 13,

      fontWeight:
        '800',
    },


    statusTag: {
      minHeight: 34,

      marginBottom: 5,

      paddingHorizontal: 11,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderRadius: 8,
    },


    statusTagText: {
      marginLeft: 6,

      fontSize: 12,

      fontWeight:
        '900',
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


    errorText: {
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


    sectionTitleRow: {
      marginBottom: 12,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
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
       Summary
       ------------------------------------------------------------------------ */

    summaryGrid: {
      overflow:
        'hidden',

      flexDirection:
        'row',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 10,

      backgroundColor:
        COLORS.white,
    },


    summaryCell: {
      flex: 1,

      minHeight: 102,

      paddingVertical: 14,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRightWidth: 1,

      borderRightColor:
        COLORS.line,
    },


    summaryNumber: {
      marginTop: 5,

      color:
        COLORS.dark,

      fontSize: 23,

      lineHeight: 27,

      fontWeight:
        '800',
    },


    summaryLabel: {
      marginTop: 2,

      color:
        COLORS.muted,

      fontSize: 12,

      fontWeight:
        '700',
    },


    /* ------------------------------------------------------------------------
       Search
       ------------------------------------------------------------------------ */

    searchBar: {
      minHeight: 54,

      paddingLeft: 14,

      paddingRight: 8,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 8,

      backgroundColor:
        COLORS.white,
    },


    searchInput: {
      flex: 1,

      minHeight: 52,

      marginLeft: 9,

      paddingVertical: 0,

      color:
        COLORS.dark,

      fontSize: 16,

      fontWeight:
        '600',
    },


    clearButton: {
      width: 38,

      height: 38,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    searchInfoRow: {
      marginTop: 8,

      flexDirection:
        'row',

      alignItems:
        'center',
    },


    searchHint: {
      flex: 1,

      marginLeft: 6,

      color:
        COLORS.muted,

      fontSize: 11,

      lineHeight: 16,
    },


    resultText: {
      marginTop: 7,

      color:
        COLORS.green,

      fontSize: 12,

      fontWeight:
        '800',
    },


    /* ------------------------------------------------------------------------
       Table
       ------------------------------------------------------------------------ */

    tableShell: {
      overflow:
        'hidden',

      borderWidth: 1,

      borderColor:
        COLORS.lineDark,

      borderRadius: 10,

      backgroundColor:
        COLORS.white,
    },


    tableTopBar: {
      position:
        'relative',

      minHeight: 52,

      paddingHorizontal: 15,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.darkTeal,
    },


    tableTopAccent: {
      position:
        'absolute',

      left: 0,

      top: 0,

      bottom: 0,

      width: 5,

      backgroundColor:
        COLORS.yellow,
    },


    tableTitle: {
      marginLeft: 8,

      color:
        COLORS.white,

      fontSize: 14,

      fontWeight:
        '900',

      letterSpacing: 0.6,
    },


    horizontalTable: {
      minWidth:
        TABLE_WIDTH,
    },


    table: {
      width:
        TABLE_WIDTH,

      backgroundColor:
        COLORS.white,
    },


    tableHeaderRow: {
      height: 50,

      flexDirection:
        'row',

      backgroundColor:
        COLORS.softCream,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.darkTeal,
    },


    tableHeaderCell: {
      height:
        '100%',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 7,
    },


    tableHeaderText: {
      color:
        COLORS.maroon,

      fontSize: 13,

      fontWeight:
        '900',

      textAlign:
        'center',
    },


    tableRow: {
      minHeight: 64,

      flexDirection:
        'row',

      backgroundColor:
        COLORS.white,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.line,
    },


    tableAlternateRow: {
      backgroundColor:
        COLORS.softCream,
    },


    tableBodyCell: {
      minHeight: 64,

      paddingHorizontal: 7,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    tableDivider: {
      borderLeftWidth: 1,

      borderLeftColor:
        COLORS.line,
    },


    tableBodyText: {
      color:
        COLORS.darkTeal,

      fontSize: 14,

      lineHeight: 20,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    remarkBadge: {
      minWidth: 110,

      minHeight: 34,

      paddingHorizontal: 9,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderRadius: 7,
    },


    remarkText: {
      marginLeft: 5,

      fontSize: 11,

      fontWeight:
        '900',
    },


    /* ------------------------------------------------------------------------
       Empty State
       ------------------------------------------------------------------------ */

    emptyState: {
      width:
        TABLE_WIDTH,

      minHeight: 170,

      paddingHorizontal: 30,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.softCream,
    },


    emptyTitle: {
      marginTop: 10,

      color:
        COLORS.maroon,

      fontSize: 17,

      fontWeight:
        '800',
    },


    emptyDescription: {
      maxWidth: 290,

      marginTop: 4,

      color:
        COLORS.muted,

      fontSize: 13,

      lineHeight: 19,

      textAlign:
        'center',
    },


    /* ------------------------------------------------------------------------
       Bottom Navigation Clearance
       ------------------------------------------------------------------------ */

    bottomSpace: {
      height: 110,
    },

  });