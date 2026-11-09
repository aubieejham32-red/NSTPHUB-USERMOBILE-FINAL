import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
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

import { SafeAreaView } from 'react-native-safe-area-context';

import { SERVER_URL } from '../../config/api';

import {
    createStudentExcuseLetter,
    deleteStudentExcuseLetter,
    getStudentExcuseLetters,
    getStudentProfile,
    updateStudentExcuseLetter,
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
    muted: '#667478',
    line: '#C9C3B8',
    softLine: '#DDD7CC',
    softGreen: '#EEF3E7',
    softMaroon: '#F5E8E7',
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
   CONSTANTS
   ========================================================================== */

const STATUS_PENDING = 'PENDING';
const STATUS_APPROVED = 'APPROVED';
const STATUS_REJECTED = 'REJECTED';

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

const COMPONENTS = {
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
    return String(value ?? '')
        .trim()
        .toUpperCase();
}


function normalizeComponent(value) {
    return String(value ?? '')
        .trim()
        .toUpperCase();
}


/* ==========================================================================
   NORMALIZE REMOTE URL
   ========================================================================== */

function normalizeRemoteUrl(value) {
    const raw = String(value ?? '')
        .trim();


    if (!raw) {
        return null;
    }


    const cleanServerUrl =
        String(SERVER_URL ?? '')
            .replace(/\/+$/, '');


    if (!cleanServerUrl) {
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

    if (raw.startsWith('/')) {
        return `${cleanServerUrl}${raw}`;
    }


    /*
    |--------------------------------------------------------------------------
    | Relative URL without leading slash
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | storage/student-profile-photos/3/photo.jpg
    |
    */

    if (
        !/^[a-z][a-z0-9+.-]*:/i.test(raw)
    ) {
        return (
            `${cleanServerUrl}/${raw.replace(/^\/+/, '')}`
        );
    }


    /*
    |--------------------------------------------------------------------------
    | localhost
    |--------------------------------------------------------------------------
    */

    if (
        /^https?:\/\/127\.0\.0\.1(?::\d+)?/i.test(raw)
    ) {
        return raw.replace(
            /^https?:\/\/127\.0\.0\.1(?::\d+)?/i,
            cleanServerUrl
        );
    }


    if (
        /^https?:\/\/localhost(?::\d+)?/i.test(raw)
    ) {
        return raw.replace(
            /^https?:\/\/localhost(?::\d+)?/i,
            cleanServerUrl
        );
    }


    if (
        /^https?:\/\/0\.0\.0\.0(?::\d+)?/i.test(raw)
    ) {
        return raw.replace(
            /^https?:\/\/0\.0\.0\.0(?::\d+)?/i,
            cleanServerUrl
        );
    }


    return raw;
}


/* ==========================================================================
   IMAGE CACHE BUSTER
   ========================================================================== */

function withImageCacheBuster(value) {
    const url =
        normalizeRemoteUrl(value);


    if (!url) {
        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | Local/data source
    |--------------------------------------------------------------------------
    */

    if (
        url.startsWith('data:') ||
        url.startsWith('file:') ||
        url.startsWith('content:')
    ) {
        return url;
    }


    const separator =
        url.includes('?')
            ? '&'
            : '?';


    return (
        `${url}${separator}nstp_photo_v=${Date.now()}`
    );
}


/* ==========================================================================
   DATE HELPERS
   ========================================================================== */

function parseDateForApi(value) {
    const clean =
        String(value ?? '')
            .trim();


    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(clean)
    ) {
        return null;
    }


    const [
        year,
        month,
        day,
    ] =
        clean
            .split('-')
            .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }


    return clean;
}


function formatDateTyping(value) {
    const digits =
        String(value ?? '')
            .replace(/\D/g, '')
            .slice(0, 8);


    if (
        digits.length <= 4
    ) {
        return digits;
    }


    if (
        digits.length <= 6
    ) {
        return (
            `${digits.slice(0, 4)}-` +
            `${digits.slice(4)}`
        );
    }


    return (
        `${digits.slice(0, 4)}-` +
        `${digits.slice(4, 6)}-` +
        `${digits.slice(6, 8)}`
    );
}


function formatDateForInput(value) {
    const clean =
        String(value ?? '')
            .trim()
            .substring(0, 10);


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(clean)
    ) {
        return clean;
    }


    const match =
        clean.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (!match) {
        return clean;
    }


    return (
        `${match[3]}-` +
        `${match[1].padStart(2, '0')}-` +
        `${match[2].padStart(2, '0')}`
    );
}


function formatDisplayDate(value) {
    const clean =
        String(value ?? '')
            .trim()
            .substring(0, 10);


    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(clean)
    ) {
        return clean || '—';
    }


    const [
        year,
        month,
        day,
    ] =
        clean
            .split('-')
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    ).toLocaleDateString(
        'en-US',
        {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
        }
    );
}


function isFutureDate(value) {
    const clean =
        parseDateForApi(value);


    if (!clean) {
        return false;
    }


    const [
        year,
        month,
        day,
    ] =
        clean
            .split('-')
            .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    const today =
        new Date();


    date.setHours(
        0,
        0,
        0,
        0
    );


    today.setHours(
        0,
        0,
        0,
        0
    );


    return (
        date.getTime() >
        today.getTime()
    );
}


/* ==========================================================================
   CONTROLLER EVIDENCE HELPERS
   ========================================================================== */

function getEvidencePreviewUrl(letter) {
    return normalizeRemoteUrl(
        letter?.evidence_preview_url ??
        letter?.evidence_url ??
        letter?.evidenceUri ??
        null
    );
}


function getEvidenceOpenUrl(letter) {
    return normalizeRemoteUrl(
        letter?.evidence_open_url ??
        letter?.evidence_url ??
        letter?.evidenceUri ??
        null
    );
}


function hasEvidence(letter) {
    if (
        typeof letter?.has_evidence ===
        'boolean'
    ) {
        return letter.has_evidence;
    }


    return Boolean(
        getEvidencePreviewUrl(letter) ||
        getEvidenceOpenUrl(letter)
    );
}


function isImageEvidence(letter) {
    if (
        typeof letter?.evidence_is_image ===
        'boolean'
    ) {
        return letter.evidence_is_image;
    }


    const mime =
        String(
            letter?.evidence_mime_type ??
            ''
        )
            .trim()
            .toLowerCase();


    if (
        mime.startsWith('image/')
    ) {
        return true;
    }


    const fileName =
        String(
            letter?.evidence_original_name ??
            letter?.attachmentName ??
            ''
        )
            .toLowerCase();


    return (
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg') ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.webp')
    );
}


function selectedFileIsImage(file) {
    const mime =
        String(
            file?.mimeType ??
            file?.type ??
            ''
        )
            .toLowerCase();


    if (
        mime.startsWith('image/')
    ) {
        return true;
    }


    const name =
        String(
            file?.name ??
            ''
        )
            .toLowerCase();


    return (
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.png') ||
        name.endsWith('.webp')
    );
}


function getStatusColor(status) {
    switch (
        normalizeStatus(status)
    ) {
        case STATUS_APPROVED:
            return COLORS.green;

        case STATUS_REJECTED:
            return COLORS.maroon;

        default:
            return COLORS.orange;
    }
}


/* ==========================================================================
   MAIN SCREEN
   ========================================================================== */

export default function ExcuseLetterScreen() {

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
            width - 32,
            430
        );


    /* --------------------------------------------------------------------------
       Database data
       -------------------------------------------------------------------------- */

    const [
        letters,
        setLetters,
    ] =
        useState([]);


    const [
        student,
        setStudent,
    ] =
        useState(null);


    const [
        instructors,
        setInstructors,
    ] =
        useState([]);


    const [
        allowedComponents,
        setAllowedComponents,
    ] =
        useState([]);


    /* --------------------------------------------------------------------------
       Screen state
       -------------------------------------------------------------------------- */

    const [
        loading,
        setLoading,
    ] =
        useState(true);


    const [
        refreshing,
        setRefreshing,
    ] =
        useState(false);


    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState('');


    const [
        screenMode,
        setScreenMode,
    ] =
        useState('list');


    const [
        selectedLetterId,
        setSelectedLetterId,
    ] =
        useState(null);


    const [
        openMenuLetterId,
        setOpenMenuLetterId,
    ] =
        useState(null);


    const [
        deletingLetterId,
        setDeletingLetterId,
    ] =
        useState(null);


    /* --------------------------------------------------------------------------
       Form state
       -------------------------------------------------------------------------- */

    const [
        editingLetterId,
        setEditingLetterId,
    ] =
        useState(null);


    const [
        component,
        setComponent,
    ] =
        useState('');


    const [
        instructorId,
        setInstructorId,
    ] =
        useState(null);


    const [
        absenceDate,
        setAbsenceDate,
    ] =
        useState('');


    const [
        reason,
        setReason,
    ] =
        useState('');


    const [
        explanation,
        setExplanation,
    ] =
        useState('');


    const [
        attachment,
        setAttachment,
    ] =
        useState(null);


    const [
        existingEvidence,
        setExistingEvidence,
    ] =
        useState(null);


    const [
        removeExistingEvidence,
        setRemoveExistingEvidence,
    ] =
        useState(false);


    const [
        submitting,
        setSubmitting,
    ] =
        useState(false);


    /* ==========================================================================
       LOAD FROM DATABASE
       ========================================================================== */

    const loadLetters =
        useCallback(
            async ({
                silent = false,
            } = {}) => {
                try {
                    if (!silent) {
                        setLoading(true);
                    }


                    setErrorMessage('');


                    const response =
                        await getStudentExcuseLetters();


                    /*
                    |--------------------------------------------------------------------------
                    | Student + latest shared profile photo
                    |--------------------------------------------------------------------------
                    */

                    const responseStudent =
                        response?.student ??
                        null;


                    let latestProfilePhotoUrl =
                        normalizeRemoteUrl(
                            responseStudent
                                ?.profile_photo_url
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | Get the same latest image shown on My Information
                    |--------------------------------------------------------------------------
                    */

                    try {
                        const profileResponse =
                            await getStudentProfile();


                        const sharedProfilePhotoUrl =
                            normalizeRemoteUrl(
                                profileResponse
                                    ?.student
                                    ?.profile_photo_url
                            );


                        if (
                            sharedProfilePhotoUrl
                        ) {
                            latestProfilePhotoUrl =
                                sharedProfilePhotoUrl;
                        }

                    } catch (
                        profilePhotoError
                    ) {
                        /*
                        |--------------------------------------------------------------------------
                        | Profile fallback must not break excuse letters
                        |--------------------------------------------------------------------------
                        */

                        console.log(
                            'Excuse letter profile photo fallback:',
                            profilePhotoError
                        );
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Force React Native to load latest image
                    |--------------------------------------------------------------------------
                    */

                    const freshProfilePhotoUrl =
                        latestProfilePhotoUrl
                            ? withImageCacheBuster(
                                latestProfilePhotoUrl
                            )
                            : null;


                    const nextStudent =
                        responseStudent
                            ? {
                                ...responseStudent,

                                profile_photo_url:
                                    freshProfilePhotoUrl ??
                                    normalizeRemoteUrl(
                                        responseStudent
                                            ?.profile_photo_url
                                    ),
                            }
                            : null;


                    /*
                    |--------------------------------------------------------------------------
                    | Excuse Letters
                    |--------------------------------------------------------------------------
                    |
                    | The important fix is here.
                    |
                    | The old screen expected:
                    |
                    | letter.profile_photo_url
                    |
                    | on every record.
                    |
                    | But these letters all belong to the current authenticated
                    | student, so we use the latest shared student photo when an
                    | individual letter doesn't provide one.
                    |
                    */

                    const nextLetters =
                        Array.isArray(
                            response?.letters
                        )
                            ? response.letters.map(
                                letter => ({
                                    ...letter,

                                    profile_photo_url:
                                        freshProfilePhotoUrl ??
                                        withImageCacheBuster(
                                            letter
                                                ?.profile_photo_url
                                        ),
                                })
                            )
                            : [];


                    /*
                    |--------------------------------------------------------------------------
                    | Instructors
                    |--------------------------------------------------------------------------
                    */

                    const nextInstructors =
                        Array.isArray(
                            response?.instructors
                        )
                            ? response.instructors
                            : [];


                    /*
                    |--------------------------------------------------------------------------
                    | Allowed Components
                    |--------------------------------------------------------------------------
                    */

                    let nextComponents =
                        Array.isArray(
                            response?.allowed_components
                        )
                            ? response.allowed_components
                                .map(
                                    normalizeComponent
                                )
                                .filter(
                                    value =>
                                        Boolean(
                                            COMPONENTS[
                                            value
                                            ]
                                        )
                                )
                            : [];


                    if (
                        nextComponents.length ===
                        0
                    ) {
                        const studentComponent =
                            normalizeComponent(
                                nextStudent?.component
                            );


                        if (
                            COMPONENTS[
                            studentComponent
                            ]
                        ) {
                            nextComponents = [
                                studentComponent,
                            ];
                        }
                    }


                    setLetters(
                        nextLetters
                    );


                    setStudent(
                        nextStudent
                    );


                    setInstructors(
                        nextInstructors
                    );


                    setAllowedComponents(
                        nextComponents
                    );


                    setComponent(
                        current => {
                            const normalized =
                                normalizeComponent(
                                    current
                                );


                            if (
                                normalized &&
                                nextComponents.includes(
                                    normalized
                                )
                            ) {
                                return normalized;
                            }


                            return (
                                nextComponents[0] ??
                                ''
                            );
                        }
                    );

                } catch (
                    error
                ) {
                    console.log(
                        'Excuse letters load error:',
                        error
                    );


                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : 'Unable to load your excuse letters.'
                    );

                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            []
        );


    useFocusEffect(
        useCallback(
            () => {
                loadLetters();


                return undefined;
            },
            [
                loadLetters,
            ]
        )
    );


    /* ==========================================================================
       DERIVED DATA
       ========================================================================== */

    const pendingLetters =
        useMemo(
            () =>
                letters.filter(
                    letter =>
                        normalizeStatus(
                            letter?.status
                        ) ===
                        STATUS_PENDING
                ),
            [
                letters,
            ]
        );


    const historyLetters =
        useMemo(
            () =>
                letters.filter(
                    letter =>
                        normalizeStatus(
                            letter?.status
                        ) !==
                        STATUS_PENDING
                ),
            [
                letters,
            ]
        );


    const summary =
        useMemo(
            () => ({
                total:
                    letters.length,


                pending:
                    letters.filter(
                        letter =>
                            normalizeStatus(
                                letter?.status
                            ) ===
                            STATUS_PENDING
                    ).length,


                approved:
                    letters.filter(
                        letter =>
                            normalizeStatus(
                                letter?.status
                            ) ===
                            STATUS_APPROVED
                    ).length,


                rejected:
                    letters.filter(
                        letter =>
                            normalizeStatus(
                                letter?.status
                            ) ===
                            STATUS_REJECTED
                    ).length,
            }),
            [
                letters,
            ]
        );


    const selectedLetter =
        useMemo(
            () =>
                letters.find(
                    letter =>
                        String(
                            letter?.id
                        ) ===
                        String(
                            selectedLetterId
                        )
                ) ??
                null,
            [
                letters,
                selectedLetterId,
            ]
        );


    /* ==========================================================================
       FIND INSTRUCTOR
       ========================================================================== */

    const findInstructorForComponent =
        useCallback(
            value => {
                const normalized =
                    normalizeComponent(
                        value
                    );


                return (
                    instructors.find(
                        instructor =>
                            normalizeComponent(
                                instructor?.component
                            ) ===
                            normalized
                    ) ??
                    null
                );
            },
            [
                instructors,
            ]
        );


    /* ==========================================================================
       RESET FORM
       ========================================================================== */

    const resetForm =
        useCallback(
            () => {
                const defaultComponent =
                    allowedComponents[0] ??
                    normalizeComponent(
                        student?.component
                    ) ??
                    '';


                const defaultInstructor =
                    findInstructorForComponent(
                        defaultComponent
                    );


                setEditingLetterId(
                    null
                );


                setComponent(
                    defaultComponent
                );


                setInstructorId(
                    defaultInstructor?.id ??
                    null
                );


                setAbsenceDate(
                    ''
                );


                setReason(
                    ''
                );


                setExplanation(
                    ''
                );


                setAttachment(
                    null
                );


                setExistingEvidence(
                    null
                );


                setRemoveExistingEvidence(
                    false
                );


                setSubmitting(
                    false
                );
            },
            [
                allowedComponents,
                student,
                findInstructorForComponent,
            ]
        );


    /* ==========================================================================
       OPEN NEW FORM
       ========================================================================== */

    const openNewForm =
        () => {
            setSelectedLetterId(
                null
            );


            setOpenMenuLetterId(
                null
            );


            resetForm();


            setScreenMode(
                'form'
            );
        };


    /* ==========================================================================
       CLOSE FORM
       ========================================================================== */

    const closeForm =
        () => {
            resetForm();


            setScreenMode(
                'list'
            );
        };


    /* ==========================================================================
       OPEN DETAIL
       ========================================================================== */

    const openDetail =
        letter => {
            setOpenMenuLetterId(
                null
            );


            setSelectedLetterId(
                letter.id
            );


            setScreenMode(
                'detail'
            );
        };


    /* ==========================================================================
       CLOSE DETAIL
       ========================================================================== */

    const closeDetail =
        () => {
            setSelectedLetterId(
                null
            );


            setScreenMode(
                'list'
            );
        };


    /* ==========================================================================
       SELECT COMPONENT
       ========================================================================== */

    const selectComponent =
        value => {
            const normalized =
                normalizeComponent(
                    value
                );


            setComponent(
                normalized
            );


            const matchingInstructor =
                findInstructorForComponent(
                    normalized
                );


            setInstructorId(
                matchingInstructor?.id ??
                null
            );
        };


    /* ==========================================================================
       EDIT EXCUSE LETTER
       ========================================================================== */

    const editLetter =
        letter => {
            const status =
                normalizeStatus(
                    letter?.status
                );


            if (
                status !==
                STATUS_PENDING ||
                letter?.can_edit ===
                false
            ) {
                Alert.alert(
                    'Excuse Letter Locked',
                    'Only pending excuse letters can be edited.'
                );


                return;
            }


            const letterComponent =
                normalizeComponent(
                    letter?.component
                );


            const automaticInstructor =
                findInstructorForComponent(
                    letterComponent
                );


            const previewUrl =
                getEvidencePreviewUrl(
                    letter
                );


            const openUrl =
                getEvidenceOpenUrl(
                    letter
                );


            setEditingLetterId(
                letter.id
            );


            setComponent(
                letterComponent
            );


            setInstructorId(
                letter?.instructor_id ??
                automaticInstructor?.id ??
                null
            );


            setAbsenceDate(
                formatDateForInput(
                    letter?.absence_date ??
                    letter?.absenceDate
                )
            );


            setReason(
                String(
                    letter?.reason ??
                    ''
                )
            );


            setExplanation(
                String(
                    letter?.explanation ??
                    ''
                )
            );


            setAttachment(
                null
            );


            setExistingEvidence(
                hasEvidence(letter)
                    ? {
                        previewUrl:
                            previewUrl,

                        openUrl:
                            openUrl,

                        name:
                            letter?.evidence_original_name ??
                            letter?.attachmentName ??
                            'Supporting Evidence',

                        mimeType:
                            letter?.evidence_mime_type ??
                            '',
                    }
                    : null
            );


            setRemoveExistingEvidence(
                false
            );


            setSelectedLetterId(
                null
            );


            setOpenMenuLetterId(
                null
            );


            setScreenMode(
                'form'
            );
        };


    /* ==========================================================================
       DELETE EXCUSE LETTER
       ========================================================================== */

    const performDelete =
        async letter => {
            try {
                setDeletingLetterId(
                    letter.id
                );


                const result =
                    await deleteStudentExcuseLetter(
                        letter.id
                    );


                setLetters(
                    current =>
                        current.filter(
                            item =>
                                String(
                                    item.id
                                ) !==
                                String(
                                    letter.id
                                )
                        )
                );


                setOpenMenuLetterId(
                    null
                );


                if (
                    String(
                        selectedLetterId
                    ) ===
                    String(
                        letter.id
                    )
                ) {
                    setSelectedLetterId(
                        null
                    );


                    setScreenMode(
                        'list'
                    );
                }


                Alert.alert(
                    'Excuse Letter Deleted',
                    result?.message ||
                    'Your pending excuse letter was deleted successfully.'
                );

            } catch (
                error
            ) {
                Alert.alert(
                    'Unable to Delete',
                    error instanceof Error
                        ? error.message
                        : 'The excuse letter could not be deleted.'
                );

            } finally {
                setDeletingLetterId(
                    null
                );
            }
        };


    const deleteLetter =
        letter => {
            const status =
                normalizeStatus(
                    letter?.status
                );


            if (
                status !==
                STATUS_PENDING ||
                letter?.can_delete ===
                false
            ) {
                Alert.alert(
                    'Excuse Letter Locked',
                    'Only pending excuse letters can be deleted.'
                );


                return;
            }


            Alert.alert(
                'Delete Excuse Letter?',
                'This permanently removes the pending excuse letter and its supporting evidence.',
                [
                    {
                        text:
                            'Cancel',

                        style:
                            'cancel',
                    },

                    {
                        text:
                            'Delete',

                        style:
                            'destructive',

                        onPress:
                            () =>
                                performDelete(
                                    letter
                                ),
                    },
                ]
            );
        };


    /* ==========================================================================
       PICK EVIDENCE
       ========================================================================== */

    const pickEvidence =
        async () => {
            try {
                const result =
                    await DocumentPicker.getDocumentAsync({
                        type: [
                            'image/*',
                            'application/pdf',
                        ],

                        copyToCacheDirectory:
                            true,

                        multiple:
                            false,
                    });


                if (
                    result.canceled
                ) {
                    return;
                }


                const selected =
                    Array.isArray(
                        result.assets
                    )
                        ? result.assets[0]
                        : null;


                if (
                    !selected
                ) {
                    return;
                }


                const size =
                    Number(
                        selected?.size ??
                        0
                    );


                if (
                    size >
                    MAX_EVIDENCE_BYTES
                ) {
                    Alert.alert(
                        'File Too Large',
                        'Evidence must not be larger than 10 MB.'
                    );


                    return;
                }


                setAttachment(
                    selected
                );


                setRemoveExistingEvidence(
                    false
                );

            } catch (
                error
            ) {
                console.log(
                    'Evidence picker error:',
                    error
                );


                Alert.alert(
                    'Unable to Attach Evidence',
                    'Please try selecting your image or PDF again.'
                );
            }
        };


    /* ==========================================================================
       SUBMIT EXCUSE LETTER
       ========================================================================== */

    const submitLetter =
        async () => {
            const normalizedComponent =
                normalizeComponent(
                    component
                );


            if (
                !normalizedComponent
            ) {
                Alert.alert(
                    'NSTP Component Required',
                    'Please select your NSTP component.'
                );


                return;
            }


            if (
                !allowedComponents.includes(
                    normalizedComponent
                )
            ) {
                Alert.alert(
                    'Component Not Available',
                    'That NSTP component is not available for your account.'
                );


                return;
            }


            const apiDate =
                parseDateForApi(
                    absenceDate
                );


            if (
                !apiDate
            ) {
                Alert.alert(
                    'Valid Date Required',
                    'The date of absence must use YYYY-MM-DD format.'
                );


                return;
            }


            if (
                isFutureDate(
                    apiDate
                )
            ) {
                Alert.alert(
                    'Invalid Absence Date',
                    'The absence date cannot be in the future.'
                );


                return;
            }


            const cleanReason =
                reason.trim();


            if (
                cleanReason.length <
                2
            ) {
                Alert.alert(
                    'Reason Required',
                    'Please enter a reason with at least 2 characters.'
                );


                return;
            }


            if (
                cleanReason.length >
                500
            ) {
                Alert.alert(
                    'Reason Too Long',
                    'The reason must not exceed 500 characters.'
                );


                return;
            }


            const cleanExplanation =
                explanation.trim();


            if (
                cleanExplanation.length <
                10
            ) {
                Alert.alert(
                    'Explanation Required',
                    'Please explain your absence using at least 10 characters.'
                );


                return;
            }


            if (
                cleanExplanation.length >
                5000
            ) {
                Alert.alert(
                    'Explanation Too Long',
                    'The explanation must not exceed 5,000 characters.'
                );


                return;
            }


            const automaticInstructor =
                findInstructorForComponent(
                    normalizedComponent
                );


            const payload = {
                component:
                    normalizedComponent,

                instructor_id:
                    instructorId ??
                    automaticInstructor?.id ??
                    null,

                absence_date:
                    apiDate,

                reason:
                    cleanReason,

                explanation:
                    cleanExplanation,

                remove_evidence:
                    Boolean(
                        removeExistingEvidence
                    ),
            };


            try {
                setSubmitting(
                    true
                );


                /*
                |--------------------------------------------------------------------------
                | UPDATE
                |--------------------------------------------------------------------------
                */

                if (
                    editingLetterId !==
                    null
                ) {
                    const result =
                        await updateStudentExcuseLetter(
                            editingLetterId,
                            payload,
                            attachment
                        );


                    if (
                        result?.letter
                    ) {
                        setLetters(
                            current =>
                                current.map(
                                    letter =>
                                        String(
                                            letter.id
                                        ) ===
                                        String(
                                            editingLetterId
                                        )
                                            ? {
                                                ...result.letter,

                                                profile_photo_url:
                                                    student
                                                        ?.profile_photo_url ??
                                                    result
                                                        ?.letter
                                                        ?.profile_photo_url ??
                                                    null,
                                            }
                                            : letter
                                )
                        );

                    } else {
                        await loadLetters({
                            silent:
                                true,
                        });
                    }


                    Alert.alert(
                        'Excuse Letter Updated',
                        result?.message ||
                        'Excuse letter updated successfully.'
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | CREATE
                |--------------------------------------------------------------------------
                */

                else {
                    const result =
                        await createStudentExcuseLetter(
                            payload,
                            attachment
                        );


                    if (
                        result?.letter
                    ) {
                        setLetters(
                            current => [
                                {
                                    ...result.letter,

                                    profile_photo_url:
                                        student
                                            ?.profile_photo_url ??
                                        result
                                            ?.letter
                                            ?.profile_photo_url ??
                                        null,
                                },

                                ...current,
                            ]
                        );

                    } else {
                        await loadLetters({
                            silent:
                                true,
                        });
                    }


                    Alert.alert(
                        'Excuse Letter Submitted',
                        result?.message ||
                        'Excuse letter submitted successfully.'
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | Reload from Laravel
                |--------------------------------------------------------------------------
                */

                await loadLetters({
                    silent:
                        true,
                });


                resetForm();


                setScreenMode(
                    'list'
                );

            } catch (
                error
            ) {
                console.log(
                    'Excuse letter submit error:',
                    error
                );


                Alert.alert(
                    editingLetterId !==
                    null
                        ? 'Unable to Update Excuse Letter'
                        : 'Unable to Submit Excuse Letter',

                    error instanceof Error
                        ? error.message
                        : 'Please try again.'
                );

            } finally {
                setSubmitting(
                    false
                );
            }
        };


    /* ==========================================================================
       REFRESH
       ========================================================================== */

    const refresh =
        () => {
            setRefreshing(
                true
            );


            loadLetters({
                silent:
                    true,
            });
        };


    /* ==========================================================================
       LOADING SCREEN
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
                    barStyle="dark-content"
                    backgroundColor={
                        themeColors.cream
                    }
                />


                <View
                    style={
                        styles.loadingArea
                    }
                >
                    <View
                        style={
                            styles.loadingIcon
                        }
                    >
                        <Ionicons
                            name="mail-open-outline"
                            size={30}
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
                            styles.loadingSpinner
                        }
                    />


                    <Text
                        style={
                            styles.loadingTitle
                        }
                    >
                        Loading Excuse Letters
                    </Text>


                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Retrieving your latest NSTP records.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }


    /* ==========================================================================
       FORM SCREEN
       ========================================================================== */

    if (
        screenMode ===
        'form'
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
                    barStyle="dark-content"
                    backgroundColor={
                        themeColors.cream
                    }
                />


                <ExcuseLetterForm
                    width={
                        contentWidth
                    }

                    student={
                        student
                    }

                    isEditing={
                        editingLetterId !==
                        null
                    }

                    component={
                        component
                    }

                    allowedComponents={
                        allowedComponents
                    }

                    onSelectComponent={
                        selectComponent
                    }

                    absenceDate={
                        absenceDate
                    }

                    setAbsenceDate={
                        setAbsenceDate
                    }

                    reason={
                        reason
                    }

                    setReason={
                        setReason
                    }

                    explanation={
                        explanation
                    }

                    setExplanation={
                        setExplanation
                    }

                    attachment={
                        attachment
                    }

                    setAttachment={
                        setAttachment
                    }

                    existingEvidence={
                        existingEvidence
                    }

                    removeExistingEvidence={
                        removeExistingEvidence
                    }

                    setRemoveExistingEvidence={
                        setRemoveExistingEvidence
                    }

                    onPickEvidence={
                        pickEvidence
                    }

                    onClose={
                        closeForm
                    }

                    onSubmit={
                        submitLetter
                    }

                    submitting={
                        submitting
                    }
                />
            </SafeAreaView>
        );
    }


    /* ==========================================================================
       DETAIL SCREEN
       ========================================================================== */

    if (
        screenMode ===
        'detail' &&
        selectedLetter
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
                    barStyle="dark-content"
                    backgroundColor={
                        themeColors.cream
                    }
                />


                <LetterDetail
                    width={
                        contentWidth
                    }

                    letter={
                        selectedLetter
                    }

                    deleting={
                        String(
                            deletingLetterId
                        ) ===
                        String(
                            selectedLetter.id
                        )
                    }

                    onBack={
                        closeDetail
                    }

                    onEdit={() =>
                        editLetter(
                            selectedLetter
                        )
                    }

                    onDelete={() =>
                        deleteLetter(
                            selectedLetter
                        )
                    }

                    onRefreshEvidence={() => loadLetters({ silent: true })}
                />
            </SafeAreaView>
        );
    }


    /* ==========================================================================
       MAIN LIST
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
                    styles.scrollView
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
                            refresh
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
                <MainHeader
                    width={
                        contentWidth
                    }
                    component={
                        student?.component
                    }
                />


                {Boolean(
                    errorMessage
                ) && (
                        <ErrorBox
                            width={
                                contentWidth
                            }
                            message={
                                errorMessage
                            }
                            onRetry={() =>
                                loadLetters()
                            }
                        />
                    )}


                <View
                    style={[
                        styles.summaryRow,
                        {
                            width:
                                contentWidth,
                        },
                    ]}
                >
                    <SummaryCard
                        value={
                            summary.pending
                        }
                        label="Pending"
                        icon="time-outline"
                        color={
                            themeColors.orange
                        }
                    />


                    <SummaryCard
                        value={
                            summary.approved
                        }
                        label="Approved"
                        icon="checkmark-circle-outline"
                        color={
                            themeColors.green
                        }
                    />


                    <SummaryCard
                        value={
                            summary.rejected
                        }
                        label="Rejected"
                        icon="close-circle-outline"
                        color={
                            themeColors.maroon
                        }
                    />
                </View>


                <Pressable
                    onPress={
                        openNewForm
                    }
                    style={({
                        pressed,
                    }) => [
                            styles.fileButton,
                            {
                                width:
                                    contentWidth,
                            },

                            pressed &&
                            styles.pressed,
                        ]}
                >
                    <Ionicons
                        name="add"
                        size={22}
                        color={
                            themeColors.white
                        }
                    />


                    <Text
                        style={
                            styles.fileButtonText
                        }
                    >
                        FILE AN EXCUSE LETTER
                    </Text>
                </Pressable>


                <LetterSection
                    width={
                        contentWidth
                    }

                    title="Recent Excuse Letter"

                    subtitle="Requests waiting for review"

                    letters={
                        pendingLetters
                    }

                    emptyText="No pending excuse letters."

                    openMenuLetterId={
                        openMenuLetterId
                    }

                    deletingLetterId={
                        deletingLetterId
                    }

                    onToggleMenu={
                        id =>
                            setOpenMenuLetterId(
                                current =>
                                    String(
                                        current
                                    ) ===
                                    String(
                                        id
                                    )
                                        ? null
                                        : id
                            )
                    }

                    onOpen={
                        openDetail
                    }

                    onEdit={
                        editLetter
                    }

                    onDelete={
                        deleteLetter
                    }
                />


                <LetterSection
                    width={
                        contentWidth
                    }

                    title="History Excuse Letter"

                    subtitle="Approved and rejected requests"

                    letters={
                        historyLetters
                    }

                    emptyText="No excuse letter history."

                    openMenuLetterId={
                        openMenuLetterId
                    }

                    deletingLetterId={
                        deletingLetterId
                    }

                    onToggleMenu={
                        id =>
                            setOpenMenuLetterId(
                                current =>
                                    String(
                                        current
                                    ) ===
                                    String(
                                        id
                                    )
                                        ? null
                                        : id
                            )
                    }

                    onOpen={
                        openDetail
                    }

                    onEdit={
                        editLetter
                    }

                    onDelete={
                        deleteLetter
                    }
                />


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
   MAIN HEADER
   ========================================================================== */

function MainHeader({
    width,
    component,
}) {
    return (
        <View
            style={[
                styles.mainHeader,
                {
                    width,
                },
            ]}
        >
            <View
                style={
                    styles.mainHeaderTop
                }
            >
                <View
                    style={
                        styles.mainHeaderIcon
                    }
                >
                    <Ionicons
                        name="mail-open-outline"
                        size={28}
                        color={
                            themeColors.white
                        }
                    />
                </View>


                <View
                    style={
                        styles.mainHeaderCopy
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
                            styles.mainTitle
                        }
                    >
                        Excuse Letters
                    </Text>
                </View>
            </View>


            <ColorRule />


            <Text
                style={
                    styles.mainDescription
                }
            >
                File an absence request, attach supporting proof,
                and follow its official review status.
            </Text>


            {Boolean(
                component
            ) && (
                    <View
                        style={
                            styles.componentTag
                        }
                    >
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={17}
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
                                styles.componentTagDivider
                            }
                        />


                        <Text
                            style={
                                styles.componentTagValue
                            }
                        >
                            {normalizeComponent(
                                component
                            )}
                        </Text>
                    </View>
                )}
        </View>
    );
}


/* ==========================================================================
   COLOR RULE
   ========================================================================== */

function ColorRule() {
    return (
        <View
            style={
                styles.colorRule
            }
        >
            <View
                style={
                    styles.colorRuleGreen
                }
            />


            <View
                style={
                    styles.colorRuleYellow
                }
            />


            <View
                style={
                    styles.colorRuleOrange
                }
            />
        </View>
    );
}


/* ==========================================================================
   ERROR BOX
   ========================================================================== */

function ErrorBox({
    width,
    message,
    onRetry,
}) {
    return (
        <View
            style={[
                styles.errorBox,
                {
                    width,
                },
            ]}
        >
            <Ionicons
                name="alert-circle-outline"
                size={24}
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
                    Unable to load excuse letters
                </Text>


                <Text
                    style={
                        styles.errorText
                    }
                >
                    {message}
                </Text>
            </View>


            <Pressable
                onPress={
                    onRetry
                }
                style={
                    styles.retryButton
                }
            >
                <Ionicons
                    name="refresh"
                    size={19}
                    color={
                        themeColors.white
                    }
                />
            </Pressable>
        </View>
    );
}


/* ==========================================================================
   SUMMARY CARD
   ========================================================================== */

function SummaryCard({
    value,
    label,
    icon,
    color,
}) {
    return (
        <View
            style={
                styles.summaryCard
            }
        >
            <View
                style={[
                    styles.summaryIcon,
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
                    size={19}
                    color={
                        themeColors.white
                    }
                />
            </View>


            <Text
                style={[
                    styles.summaryValue,
                    {
                        color,
                    },
                ]}
            >
                {value}
            </Text>


            <Text
                style={
                    styles.summaryLabel
                }
            >
                {label}
            </Text>
        </View>
    );
}


/* ==========================================================================
   LETTER SECTION
   ========================================================================== */

function LetterSection({
    width,
    title,
    subtitle,
    letters,
    emptyText,
    openMenuLetterId,
    deletingLetterId,
    onToggleMenu,
    onOpen,
    onEdit,
    onDelete,
}) {
    return (
        <View
            style={[
                styles.letterSection,
                {
                    width,
                },
            ]}
        >
            <Text
                style={
                    styles.sectionTitle
                }
            >
                {title}
            </Text>


            <Text
                style={
                    styles.sectionSubtitle
                }
            >
                {subtitle}
            </Text>


            {letters.length ===
                0 ? (
                <View
                    style={
                        styles.emptyBox
                    }
                >
                    <Ionicons
                        name="mail-outline"
                        size={34}
                        color={
                            themeColors.gray
                        }
                    />


                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        {emptyText}
                    </Text>
                </View>
            ) : (
                letters.map(
                    letter => (
                        <LetterCard
                            key={
                                letter.id
                            }

                            letter={
                                letter
                            }

                            menuOpen={
                                String(
                                    openMenuLetterId
                                ) ===
                                String(
                                    letter.id
                                )
                            }

                            deleting={
                                String(
                                    deletingLetterId
                                ) ===
                                String(
                                    letter.id
                                )
                            }

                            onToggleMenu={() =>
                                onToggleMenu(
                                    letter.id
                                )
                            }

                            onOpen={() =>
                                onOpen(
                                    letter
                                )
                            }

                            onEdit={() =>
                                onEdit(
                                    letter
                                )
                            }

                            onDelete={() =>
                                onDelete(
                                    letter
                                )
                            }
                        />
                    )
                )
            )}
        </View>
    );
}


/* ==========================================================================
   LETTER CARD
   ========================================================================== */

function LetterCard({
    letter,
    menuOpen,
    deleting,
    onToggleMenu,
    onOpen,
    onEdit,
    onDelete,
}) {
    const status =
        normalizeStatus(
            letter?.status
        );


    const canEdit =
        status ===
        STATUS_PENDING &&
        letter?.can_edit !==
        false;


    const canDelete =
        status ===
        STATUS_PENDING &&
        letter?.can_delete !==
        false;


    return (
        <View
            style={[
                styles.letterCard,

                menuOpen &&
                styles.letterCardMenuOpen,
            ]}
        >
            <Pressable
                onPress={
                    onOpen
                }
                style={({
                    pressed,
                }) => [
                        styles.letterCardBody,

                        pressed &&
                        styles.pressed,
                    ]}
            >
                <View
                    style={
                        styles.letterCardHeader
                    }
                >
                    <StudentAvatar
                        uri={
                            letter?.profile_photo_url
                        }
                        size={
                            54
                        }
                    />


                    <View
                        style={
                            styles.letterIdentity
                        }
                    >
                        <Text
                            numberOfLines={
                                1
                            }
                            style={
                                styles.letterStudentName
                            }
                        >
                            {letter?.name ||
                                'NSTP Student'}
                        </Text>


                        <View
                            style={
                                styles.metaRow
                            }
                        >
                            <Text
                                numberOfLines={
                                    1
                                }
                                style={
                                    styles.studentIdText
                                }
                            >
                                {letter?.studentId ||
                                    letter?.student_id_number ||
                                    'NSTP STUDENT'}
                            </Text>


                            <View
                                style={
                                    styles.metaDot
                                }
                            />


                            <Text
                                style={
                                    styles.createdDateText
                                }
                            >
                                {letter?.date ||
                                    'Recently submitted'}
                            </Text>
                        </View>
                    </View>
                </View>


                <View
                    style={
                        styles.cardRow
                    }
                >
                    <Text
                        style={
                            styles.cardLabel
                        }
                    >
                        Reason
                    </Text>


                    <Text
                        style={
                            styles.cardValue
                        }
                    >
                        {letter?.reason ||
                            '—'}
                    </Text>
                </View>


                <View
                    style={
                        styles.cardRow
                    }
                >
                    <Text
                        style={
                            styles.cardLabel
                        }
                    >
                        Explanation
                    </Text>


                    <Text
                        numberOfLines={
                            4
                        }
                        style={
                            styles.cardValue
                        }
                    >
                        {letter?.explanation ||
                            '—'}
                    </Text>
                </View>


                <View
                    style={
                        styles.letterFooter
                    }
                >
                    <View
                        style={
                            styles.smallComponentTag
                        }
                    >
                        <Ionicons
                            name="shield-outline"
                            size={14}
                            color={
                                themeColors.green
                            }
                        />


                        <Text
                            style={
                                styles.smallComponentText
                            }
                        >
                            {normalizeComponent(
                                letter?.component
                            )}
                        </Text>
                    </View>


                    <StatusBadge
                        status={
                            status
                        }
                        compact
                    />
                </View>
            </Pressable>


            {(canEdit ||
                canDelete) && (
                    <Pressable
                        onPress={
                            onToggleMenu
                        }
                        hitSlop={
                            12
                        }
                        style={
                            styles.moreButton
                        }
                    >
                        <Ionicons
                            name="ellipsis-horizontal"
                            size={24}
                            color={
                                themeColors.orange
                            }
                        />
                    </Pressable>
                )}


            {menuOpen &&
                (canEdit ||
                    canDelete) && (
                    <ActionMenu
                        canEdit={
                            canEdit
                        }

                        canDelete={
                            canDelete
                        }

                        deleting={
                            deleting
                        }

                        onEdit={
                            onEdit
                        }

                        onDelete={
                            onDelete
                        }
                    />
                )}
        </View>
    );
}


/* ==========================================================================
   ACTION MENU
   ========================================================================== */

function ActionMenu({
    canEdit,
    canDelete,
    deleting,
    onEdit,
    onDelete,
    style,
}) {
    return (
        <View
            style={[
                styles.actionMenu,
                style,
            ]}
        >
            {canEdit && (
                <Pressable
                    onPress={
                        onEdit
                    }
                    style={
                        styles.actionMenuButton
                    }
                >
                    <Ionicons
                        name="create-outline"
                        size={18}
                        color={
                            themeColors.orange
                        }
                    />


                    <Text
                        style={
                            styles.actionMenuText
                        }
                    >
                        EDIT
                    </Text>
                </Pressable>
            )}


            {canEdit &&
                canDelete && (
                    <View
                        style={
                            styles.actionMenuDivider
                        }
                    />
                )}


            {canDelete && (
                <Pressable
                    onPress={
                        onDelete
                    }
                    disabled={
                        deleting
                    }
                    style={
                        styles.actionMenuButton
                    }
                >
                    {deleting ? (
                        <ActivityIndicator
                            size="small"
                            color={
                                themeColors.orange
                            }
                        />
                    ) : (
                        <>
                            <Ionicons
                                name="trash-outline"
                                size={18}
                                color={
                                    themeColors.orange
                                }
                            />


                            <Text
                                style={
                                    styles.actionMenuText
                                }
                            >
                                DELETE
                            </Text>
                        </>
                    )}
                </Pressable>
            )}
        </View>
    );
}


/* ==========================================================================
   STATUS BADGE
   ========================================================================== */

function StatusBadge({
    status,
    compact = false,
}) {
    const normalized =
        normalizeStatus(
            status
        );


    return (
        <View
            style={[
                styles.statusBadge,

                compact &&
                styles.statusBadgeCompact,

                {
                    backgroundColor:
                        getStatusColor(
                            normalized
                        ),
                },
            ]}
        >
            <Text
                style={[
                    styles.statusBadgeText,

                    compact &&
                    styles.statusBadgeTextCompact,
                ]}
            >
                {normalized ||
                    STATUS_PENDING}
            </Text>
        </View>
    );
}


/* ==========================================================================
   STUDENT AVATAR
   ========================================================================== */

function StudentAvatar({
    uri,
    size,
}) {
    const [
        failed,
        setFailed,
    ] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | Resolve latest image URL
    |--------------------------------------------------------------------------
    */

    const sourceUrl =
        useMemo(
            () =>
                withImageCacheBuster(
                    uri
                ),
            [
                uri,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | Reset failure when photo URL changes
    |--------------------------------------------------------------------------
    |
    | The old screen kept failed=true forever after one failed request.
    |
    */

    useEffect(
        () => {
            setFailed(
                false
            );
        },
        [
            sourceUrl,
        ]
    );


    return (
        <View
            style={[
                styles.avatar,
                {
                    width:
                        size,

                    height:
                        size,

                    borderRadius:
                        size / 2,
                },
            ]}
        >
            {sourceUrl &&
                !failed ? (
                <Image
                    key={
                        sourceUrl
                    }

                    source={{
                        uri:
                            sourceUrl,
                    }}

                    style={{
                        width:
                            '100%',

                        height:
                            '100%',

                        borderRadius:
                            size / 2,
                    }}

                    resizeMode="cover"

                    fadeDuration={
                        0
                    }

                    onLoad={() =>
                        setFailed(
                            false
                        )
                    }

                    onError={
                        event => {
                            /*
                            |--------------------------------------------------------------------------
                            | The Expo console will show the exact broken URL
                            |--------------------------------------------------------------------------
                            */

                            console.warn(
                                'Excuse letter profile photo failed to load:',
                                {
                                    url:
                                        sourceUrl,

                                    error:
                                        event
                                            ?.nativeEvent,
                                }
                            );


                            setFailed(
                                true
                            );
                        }
                    }
                />
            ) : (
                <Ionicons
                    name="person"
                    size={
                        Math.round(
                            size *
                            0.48
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
   LETTER DETAIL
   ========================================================================== */

function LetterDetail({
    width,
    letter,
    deleting,
    onBack,
    onEdit,
    onDelete,
    onRefreshEvidence,
}) {
    const [
        menuOpen,
        setMenuOpen,
    ] =
        useState(false);


    const [
        previewVisible,
        setPreviewVisible,
    ] =
        useState(false);


    const [
        previewLoading,
        setPreviewLoading,
    ] =
        useState(false);


    const [
        previewFailed,
        setPreviewFailed,
    ] =
        useState(false);

    const [
        evidencePreviewFailed,
        setEvidencePreviewFailed,
    ] = useState(false);


    const status =
        normalizeStatus(
            letter?.status
        );


    const canEdit =
        status ===
        STATUS_PENDING &&
        letter?.can_edit !==
        false;


    const canDelete =
        status ===
        STATUS_PENDING &&
        letter?.can_delete !==
        false;


    const previewUrl =
        getEvidencePreviewUrl(
            letter
        );

    useEffect(() => {
        setEvidencePreviewFailed(false);
    }, [previewUrl]);


    const openUrl =
        getEvidenceOpenUrl(
            letter
        );


    const imageEvidence =
        isImageEvidence(
            letter
        );


    /* ==========================================================================
       OPEN ORIGINAL
       ========================================================================== */

    const openOriginal =
        async () => {
            const target =
                openUrl ??
                previewUrl;


            if (
                !target
            ) {
                return;
            }


            try {
                await Linking.openURL(
                    target
                );

            } catch (
                error
            ) {
                console.log(
                    'Open evidence error:',
                    error
                );


                Alert.alert(
                    'Unable to Open Evidence',
                    'The supporting evidence could not be opened.'
                );
            }
        };


    /* ==========================================================================
       OPEN EVIDENCE
       ========================================================================== */

    const openEvidence =
        async () => {
            if (
                !hasEvidence(
                    letter
                )
            ) {
                return;
            }


            if (
                imageEvidence &&
                previewUrl
            ) {
                setPreviewFailed(
                    false
                );


                setPreviewVisible(
                    true
                );


                return;
            }


            await openOriginal();
        };


    return (
        <>
            <ScrollView
                style={
                    styles.detailScreen
                }
                contentContainerStyle={
                    styles.detailContent
                }
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View
                    style={[
                        styles.detailHeader,
                        {
                            width,
                        },
                    ]}
                >
                    <Pressable
                        onPress={
                            onBack
                        }
                        hitSlop={
                            12
                        }
                        style={
                            styles.backButton
                        }
                    >
                        <Ionicons
                            name="chevron-back"
                            size={28}
                            color={
                                themeColors.darkTeal
                            }
                        />
                    </Pressable>


                    <Text
                        style={
                            styles.detailHeaderTitle
                        }
                    >
                        Letter Detail
                    </Text>
                </View>


                <View
                    style={[
                        styles.detailSheet,
                        {
                            width,
                        },
                    ]}
                >
                    <View
                        style={
                            styles.detailTopRow
                        }
                    >
                        <View>
                            <Text
                                style={
                                    styles.detailEyebrow
                                }
                            >
                                EXCUSE LETTER
                            </Text>


                            <Text
                                style={
                                    styles.detailNumber
                                }
                            >
                                #
                                {String(
                                    letter?.id ??
                                    ''
                                ).padStart(
                                    4,
                                    '0'
                                )}
                            </Text>
                        </View>


                        <View
                            style={
                                styles.detailTopRight
                            }
                        >
                            <StatusBadge
                                status={
                                    status
                                }
                            />


                            {(canEdit ||
                                canDelete) && (
                                    <Pressable
                                        onPress={() =>
                                            setMenuOpen(
                                                current =>
                                                    !current
                                            )
                                        }
                                        style={
                                            styles.detailMenuButton
                                        }
                                    >
                                        <Ionicons
                                            name="ellipsis-horizontal"
                                            size={24}
                                            color={
                                                themeColors.orange
                                            }
                                        />
                                    </Pressable>
                                )}
                        </View>
                    </View>


                    {menuOpen &&
                        (canEdit ||
                            canDelete) && (
                            <ActionMenu
                                canEdit={
                                    canEdit
                                }

                                canDelete={
                                    canDelete
                                }

                                deleting={
                                    deleting
                                }

                                onEdit={() => {
                                    setMenuOpen(
                                        false
                                    );

                                    onEdit();
                                }}

                                onDelete={() => {
                                    setMenuOpen(
                                        false
                                    );

                                    onDelete();
                                }}

                                style={
                                    styles.detailActionMenu
                                }
                            />
                        )}


                    <View
                        style={
                            styles.detailDivider
                        }
                    />


                    <DetailRow
                        label="ID No."
                        value={
                            letter?.studentId ??
                            letter?.student_id_number
                        }
                    />


                    <DetailRow
                        label="Student name"
                        value={
                            letter?.name
                        }
                    />


                    <DetailRow
                        label="Date of Absence"
                        value={
                            formatDisplayDate(
                                letter?.absence_date ??
                                letter?.absenceDate
                            )
                        }
                    />


                    <DetailRow
                        label="Component"
                        value={
                            letter?.component
                        }
                    />


                    <DetailRow
                        label="Instructor"
                        value={
                            letter?.instructor_name ||
                            'Not assigned'
                        }
                    />


                    <DetailRow
                        label="Reason"
                        value={
                            letter?.reason
                        }
                    />


                    <Text
                        style={
                            styles.blockLabel
                        }
                    >
                        Explanation
                    </Text>


                    <Text
                        style={
                            styles.explanationText
                        }
                    >
                        {letter?.explanation ||
                            '—'}
                    </Text>


                    {Boolean(
                        letter?.feedback
                    ) && (
                            <View
                                style={
                                    styles.feedbackBox
                                }
                            >
                                <View
                                    style={
                                        styles.feedbackHeader
                                    }
                                >
                                    <Ionicons
                                        name="chatbox-ellipses-outline"
                                        size={19}
                                        color={
                                            themeColors.green
                                        }
                                    />


                                    <Text
                                        style={
                                            styles.feedbackTitle
                                        }
                                    >
                                        REVIEWER FEEDBACK
                                    </Text>
                                </View>


                                {Boolean(
                                    letter?.reviewer_name
                                ) && (
                                        <Text
                                            style={
                                                styles.reviewerName
                                            }
                                        >
                                            {letter.reviewer_name}
                                        </Text>
                                    )}


                                <Text
                                    style={
                                        styles.feedbackText
                                    }
                                >
                                    {letter.feedback}
                                </Text>
                            </View>
                        )}


                    <Text
                        style={
                            styles.blockLabel
                        }
                    >
                        Supporting Evidence
                    </Text>


                    {!hasEvidence(
                        letter
                    ) ? (
                        <View
                            style={
                                styles.noEvidenceBox
                            }
                        >
                            <Ionicons
                                name="image-outline"
                                size={32}
                                color={
                                    themeColors.gray
                                }
                            />


                            <Text
                                style={
                                    styles.noEvidenceText
                                }
                            >
                                No supporting evidence was provided.
                            </Text>
                        </View>
                    ) : imageEvidence &&
                        previewUrl ? (
                        <Pressable
                            onPress={
                                evidencePreviewFailed
                                    ? onRefreshEvidence
                                    : openEvidence
                            }
                            style={({
                                pressed,
                            }) => [
                                    styles.evidencePressable,

                                    pressed &&
                                    styles.pressed,
                                ]}
                        >
                            <View
                                style={
                                    styles.evidencePreviewBox
                                }
                            >
                                {evidencePreviewFailed ? (
                                    <View style={styles.noEvidenceBox}>
                                        <Ionicons
                                            name="cloud-offline-outline"
                                            size={32}
                                            color={themeColors.gray}
                                        />
                                        <Text style={styles.noEvidenceText}>
                                            Evidence image could not be loaded.
                                            Tap here to refresh its secure link.
                                            If it still fails, the uploaded file
                                            may be missing from server storage.
                                        </Text>
                                    </View>
                                ) : (
                                    <Image
                                        source={{ uri: previewUrl }}
                                        style={styles.evidencePreviewImage}
                                        resizeMode="contain"
                                        onError={event => {
                                            console.warn('Excuse evidence preview failed:',
                                                event?.nativeEvent?.error);
                                            setEvidencePreviewFailed(true);
                                        }}
                                    />
                                )}


                                {!evidencePreviewFailed && <View
                                    style={
                                        styles.expandBadge
                                    }
                                >
                                    <Ionicons
                                        name="expand-outline"
                                        size={16}
                                        color={
                                            themeColors.white
                                        }
                                    />


                                    <Text
                                        style={
                                            styles.expandBadgeText
                                        }
                                    >
                                        ENLARGE
                                    </Text>
                                </View>}
                            </View>


                            <View
                                style={
                                    styles.tapToOpenRow
                                }
                            >
                                <Ionicons
                                    name="expand-outline"
                                    size={17}
                                    color={
                                        themeColors.green
                                    }
                                />


                                <Text
                                    style={
                                        styles.tapToOpenText
                                    }
                                >
                                    {evidencePreviewFailed
                                        ? 'Tap to retry evidence'
                                        : 'Tap image to enlarge'}
                                </Text>
                            </View>
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={
                                openOriginal
                            }
                            style={
                                styles.documentEvidence
                            }
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={30}
                                color={
                                    themeColors.maroon
                                }
                            />


                            <View
                                style={
                                    styles.documentEvidenceCopy
                                }
                            >
                                <Text
                                    numberOfLines={
                                        2
                                    }
                                    style={
                                        styles.documentEvidenceName
                                    }
                                >
                                    {letter?.evidence_original_name ??
                                        letter?.attachmentName ??
                                        'Supporting Evidence'}
                                </Text>


                                <Text
                                    style={
                                        styles.documentEvidenceHint
                                    }
                                >
                                    Tap to open document
                                </Text>
                            </View>


                            <Ionicons
                                name="open-outline"
                                size={20}
                                color={
                                    themeColors.green
                                }
                            />
                        </Pressable>
                    )}
                </View>


                <View
                    style={
                        styles.bottomSpace
                    }
                />
            </ScrollView>


            <Modal
                visible={
                    previewVisible
                }
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() =>
                    setPreviewVisible(
                        false
                    )
                }
            >
                <View
                    style={
                        styles.modalBackdrop
                    }
                >
                    <View
                        style={
                            styles.modalHeader
                        }
                    >
                        <View
                            style={
                                styles.modalHeaderTitleRow
                            }
                        >
                            <Ionicons
                                name="image-outline"
                                size={21}
                                color={
                                    themeColors.white
                                }
                            />


                            <Text
                                style={
                                    styles.modalTitle
                                }
                            >
                                Supporting Evidence
                            </Text>
                        </View>


                        <Pressable
                            onPress={() =>
                                setPreviewVisible(
                                    false
                                )
                            }
                            hitSlop={
                                12
                            }
                            style={
                                styles.modalCloseButton
                            }
                        >
                            <Ionicons
                                name="close"
                                size={30}
                                color={
                                    themeColors.white
                                }
                            />
                        </Pressable>
                    </View>


                    <View
                        style={
                            styles.modalImageArea
                        }
                    >
                        {previewUrl && (
                            <Image
                                source={{
                                    uri:
                                        previewUrl,
                                }}
                                style={
                                    styles.modalImage
                                }
                                resizeMode="contain"
                                onLoadStart={() => {
                                    setPreviewLoading(
                                        true
                                    );

                                    setPreviewFailed(
                                        false
                                    );
                                }}
                                onLoadEnd={() =>
                                    setPreviewLoading(
                                        false
                                    )
                                }
                                onError={() => {
                                    setPreviewLoading(
                                        false
                                    );

                                    setPreviewFailed(
                                        true
                                    );
                                }}
                            />
                        )}


                        {previewLoading && (
                            <View
                                style={
                                    styles.modalLoading
                                }
                            >
                                <ActivityIndicator
                                    size="large"
                                    color={
                                        themeColors.yellow
                                    }
                                />


                                <Text
                                    style={
                                        styles.modalLoadingText
                                    }
                                >
                                    Loading evidence...
                                </Text>
                            </View>
                        )}


                        {previewFailed && (
                            <View
                                style={
                                    styles.modalFailed
                                }
                            >
                                <Ionicons
                                    name="image-outline"
                                    size={48}
                                    color={
                                        themeColors.gray
                                    }
                                />


                                <Text
                                    style={
                                        styles.modalFailedTitle
                                    }
                                >
                                    Unable to display the image
                                </Text>


                                <Text
                                    style={
                                        styles.modalFailedText
                                    }
                                >
                                    The secure evidence link may have expired.
                                    Refresh the Excuse Letters page to receive
                                    a new signed link.
                                </Text>
                            </View>
                        )}
                    </View>


                    <View
                        style={
                            styles.modalFooter
                        }
                    >
                        <Text
                            style={
                                styles.modalFooterHint
                            }
                        >
                            Full-screen supporting evidence
                        </Text>


                        <Pressable
                            onPress={
                                openOriginal
                            }
                            style={
                                styles.openOriginalButton
                            }
                        >
                            <Ionicons
                                name="open-outline"
                                size={18}
                                color={
                                    themeColors.white
                                }
                            />


                            <Text
                                style={
                                    styles.openOriginalText
                                }
                            >
                                OPEN ORIGINAL
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}


/* ==========================================================================
   DETAIL ROW
   ========================================================================== */

function DetailRow({
    label,
    value,
}) {
    return (
        <View
            style={
                styles.detailRow
            }
        >
            <Text
                style={
                    styles.detailLabel
                }
            >
                {label}
            </Text>


            <Text
                style={
                    styles.detailValue
                }
            >
                {value ||
                    '—'}
            </Text>
        </View>
    );
}


/* ==========================================================================
   EXCUSE LETTER FORM
   ========================================================================== */

function ExcuseLetterForm({
    width,
    student,
    isEditing,

    component,
    allowedComponents,
    onSelectComponent,

    absenceDate,
    setAbsenceDate,

    reason,
    setReason,

    explanation,
    setExplanation,

    attachment,
    setAttachment,

    existingEvidence,

    removeExistingEvidence,
    setRemoveExistingEvidence,

    onPickEvidence,
    onClose,
    onSubmit,
    submitting,
}) {
    const studentName =
        String(
            student?.full_name ||
            'NSTP Student'
        )
            .trim()
            .toUpperCase();


    const studentId =
        String(
            student?.student_id_number ||
            'NSTP STUDENT'
        )
            .trim();


    return (
        <KeyboardAvoidingView
            style={
                styles.formScreen
            }
            behavior={
                Platform.OS ===
                    'ios'
                    ? 'padding'
                    : undefined
            }
        >
            <ScrollView
                contentContainerStyle={
                    styles.formScrollContent
                }
                showsVerticalScrollIndicator={
                    false
                }
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={[
                        styles.formHeader,
                        {
                            width,
                        },
                    ]}
                >
                    <View
                        style={
                            styles.formHeaderTop
                        }
                    >
                        <View
                            style={
                                styles.formHeaderCopy
                            }
                        >
                            <Text
                                style={
                                    styles.formEyebrow
                                }
                            >
                                NSTP HUB
                            </Text>


                            <Text
                                style={
                                    styles.formTitle
                                }
                            >
                                {isEditing
                                    ? 'Edit Excuse Letter'
                                    : 'File an Excuse Letter'}
                            </Text>
                        </View>


                        <Pressable
                            onPress={
                                onClose
                            }
                            hitSlop={
                                12
                            }
                            style={
                                styles.formCloseButton
                            }
                        >
                            <Ionicons
                                name="close"
                                size={26}
                                color={
                                    themeColors.maroon
                                }
                            />
                        </Pressable>
                    </View>


                    <ColorRule />


                    <Text
                        style={
                            styles.formDescription
                        }
                    >
                        Provide a clear reason for your absence.
                        Supporting evidence is optional and may be
                        a photo or PDF.
                    </Text>
                </View>


                <View
                    style={[
                        styles.formPaper,
                        {
                            width,
                        },
                    ]}
                >
                    <View
                        style={
                            styles.studentIdLine
                        }
                    >
                        <Text
                            numberOfLines={
                                1
                            }
                            style={
                                styles.studentIdLineText
                            }
                        >
                            ID NO. {studentId}
                        </Text>
                    </View>


                    <View
                        style={
                            styles.studentNameBar
                        }
                    >
                        <Text
                            numberOfLines={
                                1
                            }
                            adjustsFontSizeToFit
                            minimumFontScale={
                                0.78
                            }
                            style={
                                styles.studentNameBarText
                            }
                        >
                            {studentName}
                        </Text>
                    </View>


                    <View
                        style={
                            styles.formBody
                        }
                    >
                        {isEditing && (
                            <View
                                style={
                                    styles.editNotice
                                }
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
                                        styles.editNoticeText
                                    }
                                >
                                    EDITING PENDING EXCUSE LETTER
                                </Text>
                            </View>
                        )}


                        <FormLabel>
                            Select your NSTP component
                        </FormLabel>


                        <View>
                            {allowedComponents.map(
                                value => (
                                    <ComponentOption
                                        key={
                                            value
                                        }
                                        value={
                                            value
                                        }
                                        selected={
                                            component ===
                                            value
                                        }
                                        onPress={() =>
                                            onSelectComponent(
                                                value
                                            )
                                        }
                                    />
                                )
                            )}
                        </View>


                        <FormLabel>
                            Date of Absence
                        </FormLabel>


                        <View
                            style={
                                styles.dateInputWrap
                            }
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color={
                                    themeColors.green
                                }
                            />


                            <TextInput
                                value={
                                    absenceDate
                                }
                                onChangeText={
                                    value =>
                                        setAbsenceDate(
                                            formatDateTyping(
                                                value
                                            )
                                        )
                                }
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={
                                    themeColors.muted
                                }
                                keyboardType={
                                    Platform.OS ===
                                        'ios'
                                        ? 'numbers-and-punctuation'
                                        : 'numeric'
                                }
                                maxLength={
                                    10
                                }
                                selectionColor={
                                    themeColors.maroon
                                }
                                style={
                                    styles.dateInput
                                }
                            />
                        </View>


                        <Text
                            style={
                                styles.fieldHint
                            }
                        >
                            Example: 2026-08-30
                        </Text>


                        <FormLabel>
                            Reason
                        </FormLabel>


                        <TextInput
                            value={
                                reason
                            }
                            onChangeText={
                                setReason
                            }
                            placeholder="Family Emergency"
                            placeholderTextColor={
                                themeColors.muted
                            }
                            maxLength={
                                500
                            }
                            selectionColor={
                                themeColors.maroon
                            }
                            style={
                                styles.textField
                            }
                        />


                        <FormLabel>
                            Explanation
                        </FormLabel>


                        <TextInput
                            value={
                                explanation
                            }
                            onChangeText={
                                setExplanation
                            }
                            placeholder="Explain clearly why you were absent."
                            placeholderTextColor={
                                themeColors.muted
                            }
                            multiline
                            textAlignVertical="top"
                            maxLength={
                                5000
                            }
                            selectionColor={
                                themeColors.maroon
                            }
                            style={
                                styles.explanationField
                            }
                        />


                        <FormLabel>
                            Attach Evidence (Optional)
                        </FormLabel>


                        {attachment ? (
                            <SelectedEvidence
                                file={
                                    attachment
                                }
                                onRemove={() =>
                                    setAttachment(
                                        null
                                    )
                                }
                            />
                        ) : existingEvidence &&
                            !removeExistingEvidence ? (
                            <View
                                style={
                                    styles.existingEvidenceBox
                                }
                            >
                                <View
                                    style={
                                        styles.existingEvidenceIcon
                                    }
                                >
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={26}
                                        color={
                                            themeColors.green
                                        }
                                    />
                                </View>


                                <View
                                    style={
                                        styles.existingEvidenceCopy
                                    }
                                >
                                    <Text
                                        style={
                                            styles.existingEvidenceTitle
                                        }
                                    >
                                        Evidence attached
                                    </Text>


                                    <Text
                                        numberOfLines={
                                            1
                                        }
                                        style={
                                            styles.existingEvidenceName
                                        }
                                    >
                                        {existingEvidence.name}
                                    </Text>


                                    <Pressable
                                        onPress={
                                            onPickEvidence
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.replaceEvidenceText
                                            }
                                        >
                                            Replace evidence
                                        </Text>
                                    </Pressable>
                                </View>


                                <Pressable
                                    onPress={() =>
                                        setRemoveExistingEvidence(
                                            true
                                        )
                                    }
                                    hitSlop={
                                        10
                                    }
                                    style={
                                        styles.removeEvidenceButton
                                    }
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color={
                                            themeColors.maroon
                                        }
                                    />
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable
                                onPress={
                                    onPickEvidence
                                }
                                style={({
                                    pressed,
                                }) => [
                                        styles.attachButton,

                                        pressed &&
                                        styles.pressed,
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
                                        styles.attachButtonText
                                    }
                                >
                                    Add a photo or PDF
                                </Text>
                            </Pressable>
                        )}


                        <Text
                            style={
                                styles.fieldHint
                            }
                        >
                            Optional · JPG, JPEG, PNG, WEBP or PDF · Maximum 10 MB
                        </Text>


                        <Pressable
                            onPress={
                                onSubmit
                            }
                            disabled={
                                submitting
                            }
                            style={({
                                pressed,
                            }) => [
                                styles.submitButton,

                                submitting &&
                                styles.submitButtonDisabled,

                                pressed &&
                                !submitting &&
                                styles.pressed,
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
                                    size={18}
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
                                        ? 'UPDATING...'
                                        : 'SUBMITTING...'
                                    : isEditing
                                        ? 'UPDATE YOUR EXCUSE LETTER'
                                        : 'SUBMIT YOUR EXCUSE LETTER'}
                            </Text>
                        </Pressable>
                    </View>
                </View>


                <View
                    style={
                        styles.bottomSpace
                    }
                />
            </ScrollView>
        </KeyboardAvoidingView>
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
   COMPONENT OPTION
   ========================================================================== */

function ComponentOption({
    value,
    selected,
    onPress,
}) {
    const info =
        COMPONENTS[
        value
        ] ??
        COMPONENTS.ROTC;


    return (
        <Pressable
            onPress={
                onPress
            }
            style={({
                pressed,
            }) => [
                styles.componentOption,

                pressed &&
                styles.pressed,
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
                style={[
                    styles.componentOptionIcon,

                    selected &&
                    styles.componentOptionIconSelected,
                ]}
            >
                <Ionicons
                    name={
                        info.icon
                    }
                    size={18}
                    color={
                        selected
                            ? themeColors.green
                            : themeColors.darkTeal
                    }
                />
            </View>


            <View
                style={
                    styles.componentOptionCopy
                }
            >
                <Text
                    style={[
                        styles.componentOptionTitle,

                        selected && {
                            color:
                                themeColors.green,
                        },
                    ]}
                >
                    {info.title}
                </Text>


                <Text
                    numberOfLines={
                        2
                    }
                    style={
                        styles.componentOptionSubtitle
                    }
                >
                    {info.subtitle}
                </Text>
            </View>
        </Pressable>
    );
}


/* ==========================================================================
   SELECTED EVIDENCE
   ========================================================================== */

function SelectedEvidence({
    file,
    onRemove,
}) {
    return (
        <View
            style={
                styles.selectedEvidenceBox
            }
        >
            {selectedFileIsImage(
                file
            ) ? (
                <Image
                    source={{
                        uri:
                            file.uri,
                    }}
                    style={
                        styles.selectedEvidenceImage
                    }
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={
                        styles.selectedEvidenceFileIcon
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


            <View
                style={
                    styles.selectedEvidenceCopy
                }
            >
                <Text
                    numberOfLines={
                        1
                    }
                    style={
                        styles.selectedEvidenceName
                    }
                >
                    {file?.name ||
                        'Supporting Evidence'}
                </Text>


                <Text
                    numberOfLines={
                        1
                    }
                    style={
                        styles.selectedEvidenceMeta
                    }
                >
                    {file?.mimeType ||
                        file?.type ||
                        'Selected file'}
                </Text>
            </View>


            <Pressable
                onPress={
                    onRemove
                }
                hitSlop={
                    10
                }
                style={
                    styles.removeEvidenceButton
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
    );
}


/* ==========================================================================
   STYLES
   ========================================================================== */

const createStyles = (COLORS) =>
  StyleSheet.create({

        /* ========================================================================
           GLOBAL
           ======================================================================== */

        safeArea: {
            flex:
                1,

            backgroundColor:
                COLORS.cream,
        },


        scrollView: {
            flex:
                1,

            backgroundColor:
                COLORS.cream,
        },


        scrollContent: {
            alignItems:
                'center',

            paddingTop:
                16,

            paddingHorizontal:
                16,
        },


        pressed: {
            opacity:
                0.76,
        },


        bottomSpace: {
            height:
                160,
        },


        /* ========================================================================
           LOADING
           ======================================================================== */

        loadingArea: {
            flex:
                1,

            alignItems:
                'center',

            justifyContent:
                'center',

            paddingHorizontal:
                28,
        },


        loadingIcon: {
            width:
                60,

            height:
                60,

            borderRadius:
                10,

            backgroundColor:
                COLORS.darkTeal,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        loadingSpinner: {
            marginTop:
                18,
        },


        loadingTitle: {
            marginTop:
                14,

            color:
                COLORS.maroon,

            fontSize:
                22,

            lineHeight:
                28,

            fontWeight:
                '900',

            textAlign:
                'center',
        },


        loadingText: {
            marginTop:
                5,

            color:
                COLORS.darkTeal,

            fontSize:
                15,

            lineHeight:
                21,

            textAlign:
                'center',
        },


        /* ========================================================================
           MAIN HEADER
           ======================================================================== */

        mainHeader: {
            marginBottom:
                24,
        },


        mainHeaderTop: {
            flexDirection:
                'row',

            alignItems:
                'center',
        },


        mainHeaderIcon: {
            width:
                56,

            height:
                56,

            borderRadius:
                11,

            backgroundColor:
                COLORS.darkTeal,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        mainHeaderCopy: {
            flex:
                1,

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
                1.5,
        },


        mainTitle: {
            marginTop:
                2,

            color:
                COLORS.maroon,

            fontSize:
                29,

            lineHeight:
                35,

            fontWeight:
                '900',
        },


        colorRule: {
            height:
                4,

            marginTop:
                16,

            flexDirection:
                'row',
        },


        colorRuleGreen: {
            flex:
                1.2,

            backgroundColor:
                COLORS.green,
        },


        colorRuleYellow: {
            flex:
                0.7,

            backgroundColor:
                COLORS.yellow,
        },


        colorRuleOrange: {
            flex:
                0.4,

            backgroundColor:
                COLORS.orange,
        },


        mainDescription: {
            marginTop:
                13,

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
                14,

            paddingHorizontal:
                10,

            borderWidth:
                1,

            borderColor:
                COLORS.line,

            borderRadius:
                7,

            backgroundColor:
                COLORS.paper,

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        componentTagLabel: {
            marginLeft:
                6,

            color:
                COLORS.muted,

            fontSize:
                10,

            fontWeight:
                '900',

            letterSpacing:
                0.45,
        },


        componentTagDivider: {
            width:
                1,

            height:
                18,

            marginHorizontal:
                8,

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
        },


        /* ========================================================================
           ERROR
           ======================================================================== */

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
                8,

            backgroundColor:
                COLORS.softMaroon,

            flexDirection:
                'row',

            alignItems:
                'flex-start',
        },


        errorCopy: {
            flex:
                1,

            marginHorizontal:
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
                3,

            color:
                COLORS.darkTeal,

            fontSize:
                13,

            lineHeight:
                18,
        },


        retryButton: {
            width:
                36,

            height:
                36,

            borderRadius:
                18,

            backgroundColor:
                COLORS.maroon,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        /* ========================================================================
           SUMMARY
           ======================================================================== */

        summaryRow: {
            flexDirection:
                'row',

            gap:
                9,

            marginBottom:
                18,
        },


        summaryCard: {
            flex:
                1,

            minHeight:
                108,

            paddingVertical:
                12,

            borderWidth:
                1,

            borderColor:
                COLORS.line,

            borderRadius:
                8,

            backgroundColor:
                COLORS.paper,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        summaryIcon: {
            width:
                36,

            height:
                36,

            borderRadius:
                9,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        summaryValue: {
            marginTop:
                7,

            fontSize:
                23,

            lineHeight:
                28,

            fontWeight:
                '900',
        },


        summaryLabel: {
            marginTop:
                1,

            color:
                COLORS.darkTeal,

            fontSize:
                12.5,

            fontWeight:
                '800',
        },


        /* ========================================================================
           FILE BUTTON
           ======================================================================== */

        fileButton: {
            minHeight:
                52,

            borderRadius:
                10,

            backgroundColor:
                COLORS.green,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        fileButtonText: {
            marginLeft:
                8,

            color:
                COLORS.white,

            fontSize:
                14,

            fontWeight:
                '900',

            letterSpacing:
                0.2,
        },


        /* ========================================================================
           SECTIONS
           ======================================================================== */

        letterSection: {
            marginTop:
                31,
        },


        sectionTitle: {
            color:
                COLORS.darkTeal,

            fontSize:
                20,

            lineHeight:
                26,

            fontWeight:
                '700',
        },


        sectionSubtitle: {
            marginTop:
                2,

            marginBottom:
                12,

            color:
                COLORS.muted,

            fontSize:
                13,

            lineHeight:
                18,
        },


        emptyBox: {
            minHeight:
                126,

            borderWidth:
                1,

            borderColor:
                COLORS.line,

            borderRadius:
                8,

            backgroundColor:
                COLORS.paper,

            alignItems:
                'center',

            justifyContent:
                'center',

            paddingHorizontal:
                20,
        },


        emptyText: {
            marginTop:
                7,

            color:
                COLORS.muted,

            fontSize:
                13,

            textAlign:
                'center',
        },


        /* ========================================================================
           LETTER CARD
           ======================================================================== */

        letterCard: {
            position:
                'relative',

            marginBottom:
                14,

            borderWidth:
                1,

            borderColor:
                COLORS.muted,

            borderRadius:
                9,

            backgroundColor:
                COLORS.paper,

            zIndex:
                1,

            elevation:
                1,
        },


        letterCardMenuOpen: {
            zIndex:
                100,

            elevation:
                18,
        },


        letterCardBody: {
            paddingHorizontal:
                17,

            paddingTop:
                17,

            paddingBottom:
                15,
        },


        letterCardHeader: {
            flexDirection:
                'row',

            alignItems:
                'center',

            paddingRight:
                34,
        },


        avatar: {
            overflow:
                'hidden',

            backgroundColor:
                COLORS.muted,

            borderWidth:
                2,

            borderColor:
                COLORS.white,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        letterIdentity: {
            flex:
                1,

            marginLeft:
                11,
        },


        letterStudentName: {
            color:
                COLORS.darkTeal,

            fontSize:
                16,

            lineHeight:
                21,

            fontWeight:
                '900',
        },


        metaRow: {
            marginTop:
                3,

            flexDirection:
                'row',

            alignItems:
                'center',

            flexWrap:
                'wrap',
        },


        studentIdText: {
            color:
                COLORS.darkTeal,

            fontSize:
                10.5,

            fontWeight:
                '700',
        },


        metaDot: {
            width:
                4,

            height:
                4,

            borderRadius:
                2,

            marginHorizontal:
                8,

            backgroundColor:
                COLORS.darkTeal,
        },


        createdDateText: {
            color:
                COLORS.muted,

            fontSize:
                10.5,
        },


        cardRow: {
            marginTop:
                18,

            flexDirection:
                'row',

            alignItems:
                'flex-start',
        },


        cardLabel: {
            width:
                95,

            color:
                COLORS.muted,

            fontSize:
                12.5,

            lineHeight:
                19,
        },


        cardValue: {
            flex:
                1,

            color:
                COLORS.darkTeal,

            fontSize:
                13.5,

            lineHeight:
                20,
        },


        letterFooter: {
            marginTop:
                18,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'space-between',
        },


        smallComponentTag: {
            minHeight:
                29,

            paddingHorizontal:
                8,

            borderRadius:
                6,

            backgroundColor:
                COLORS.softGreen,

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        smallComponentText: {
            marginLeft:
                4,

            color:
                COLORS.green,

            fontSize:
                11,

            fontWeight:
                '900',
        },


        moreButton: {
            position:
                'absolute',

            right:
                11,

            top:
                10,

            width:
                38,

            height:
                38,

            alignItems:
                'center',

            justifyContent:
                'center',

            zIndex:
                50,
        },


        /* ========================================================================
           STATUS
           ======================================================================== */

        statusBadge: {
            minWidth:
                84,

            minHeight:
                32,

            paddingHorizontal:
                11,

            borderRadius:
                16,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        statusBadgeCompact: {
            minWidth:
                74,

            minHeight:
                26,

            borderRadius:
                13,

            paddingHorizontal:
                9,
        },


        statusBadgeText: {
            color:
                COLORS.white,

            fontSize:
                10.5,

            fontWeight:
                '900',
        },


        statusBadgeTextCompact: {
            fontSize:
                9.5,
        },


        /* ========================================================================
           ACTION MENU
           ======================================================================== */

        actionMenu: {
            position:
                'absolute',

            top:
                44,

            right:
                12,

            width:
                120,

            borderWidth:
                1,

            borderColor:
                COLORS.line,

            borderRadius:
                11,

            overflow:
                'hidden',

            backgroundColor:
                COLORS.paper,

            elevation:
                14,

            zIndex:
                200,

            shadowColor:
                COLORS.nearBlack,

            shadowOpacity:
                0.18,

            shadowRadius:
                7,

            shadowOffset: {
                width:
                    0,

                height:
                    4,
            },
        },


        actionMenuButton: {
            minHeight:
                48,

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
                COLORS.orange,

            fontSize:
                13,

            fontWeight:
                '700',
        },


        actionMenuDivider: {
            height:
                1,

            backgroundColor:
                COLORS.line,
        },


        /* ========================================================================
           DETAIL
           ======================================================================== */

        detailScreen: {
            flex:
                1,

            backgroundColor:
                COLORS.cream,
        },


        detailContent: {
            alignItems:
                'center',

            paddingTop:
                16,

            paddingHorizontal:
                16,
        },


        detailHeader: {
            minHeight:
                52,

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        backButton: {
            width:
                40,

            height:
                44,

            justifyContent:
                'center',

            alignItems:
                'flex-start',
        },


        detailHeaderTitle: {
            color:
                COLORS.darkTeal,

            fontSize:
                20,

            fontWeight:
                '900',
        },


        detailSheet: {
            position:
                'relative',

            marginTop:
                14,

            padding:
                17,

            borderWidth:
                1,

            borderColor:
                COLORS.line,

            borderRadius:
                9,

            backgroundColor:
                COLORS.paper,
        },


        detailTopRow: {
            flexDirection:
                'row',

            alignItems:
                'flex-start',

            justifyContent:
                'space-between',
        },


        detailEyebrow: {
            color:
                COLORS.green,

            fontSize:
                11,

            fontWeight:
                '900',

            letterSpacing:
                1,
        },


        detailNumber: {
            marginTop:
                3,

            color:
                COLORS.maroon,

            fontSize:
                22,

            lineHeight:
                28,

            fontWeight:
                '900',
        },


        detailTopRight: {
            flexDirection:
                'row',

            alignItems:
                'center',

            gap:
                7,
        },


        detailMenuButton: {
            width:
                38,

            height:
                38,

            borderRadius:
                19,

            borderWidth:
                1,

            borderColor:
                COLORS.softLine,

            backgroundColor:
                COLORS.white,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        detailActionMenu: {
            top:
                63,

            right:
                17,
        },


        detailDivider: {
            height:
                1,

            marginVertical:
                18,

            backgroundColor:
                COLORS.softLine,
        },


        detailRow: {
            minHeight:
                44,

            flexDirection:
                'row',

            alignItems:
                'flex-start',
        },


        detailLabel: {
            width:
                115,

            color:
                COLORS.muted,

            fontSize:
                13.5,

            lineHeight:
                21,
        },


        detailValue: {
            flex:
                1,

            color:
                COLORS.darkTeal,

            fontSize:
                15.5,

            lineHeight:
                22,

            fontWeight:
                '700',
        },


        blockLabel: {
            marginTop:
                16,

            color:
                COLORS.darkTeal,

            fontSize:
                15,

            fontWeight:
                '900',
        },


        explanationText: {
            marginTop:
                7,

            color:
                COLORS.darkTeal,

            fontSize:
                15.5,

            lineHeight:
                23,
        },


        feedbackBox: {
            marginTop:
                20,

            padding:
                13,

            borderLeftWidth:
                4,

            borderLeftColor:
                COLORS.green,

            backgroundColor:
                COLORS.softGreen,
        },


        feedbackHeader: {
            flexDirection:
                'row',

            alignItems:
                'center',
        },


        feedbackTitle: {
            marginLeft:
                7,

            color:
                COLORS.green,

            fontSize:
                11,

            fontWeight:
                '900',

            letterSpacing:
                0.5,
        },


        reviewerName: {
            marginTop:
                8,

            color:
                COLORS.maroon,

            fontSize:
                13.5,

            fontWeight:
                '900',
        },


        feedbackText: {
            marginTop:
                5,

            color:
                COLORS.darkTeal,

            fontSize:
                13.5,

            lineHeight:
                20,
        },


        /* ========================================================================
           EVIDENCE
           ======================================================================== */

        evidencePressable: {
            marginTop:
                10,
        },


        evidencePreviewBox: {
            position:
                'relative',

            width:
                '100%',

            height:
                300,

            borderWidth:
                1,

            borderColor:
                COLORS.softLine,

            borderRadius:
                8,

            overflow:
                'hidden',

            backgroundColor:
                COLORS.white,
        },


        evidencePreviewImage: {
            width:
                '100%',

            height:
                '100%',

            backgroundColor:
                COLORS.white,
        },


        expandBadge: {
            position:
                'absolute',

            right:
                10,

            bottom:
                10,

            minHeight:
                32,

            paddingHorizontal:
                10,

            borderRadius:
                16,

            backgroundColor:
                'rgba(35, 62, 71, 0.92)',

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        expandBadgeText: {
            marginLeft:
                5,

            color:
                COLORS.white,

            fontSize:
                10,

            fontWeight:
                '900',

            letterSpacing:
                0.4,
        },


        tapToOpenRow: {
            marginTop:
                8,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        tapToOpenText: {
            marginLeft:
                5,

            color:
                COLORS.green,

            fontSize:
                13,

            fontWeight:
                '900',
        },


        documentEvidence: {
            minHeight:
                80,

            marginTop:
                10,

            paddingHorizontal:
                12,

            borderWidth:
                1,

            borderColor:
                COLORS.line,

            borderRadius:
                7,

            backgroundColor:
                COLORS.white,

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        documentEvidenceCopy: {
            flex:
                1,

            marginHorizontal:
                10,
        },


        documentEvidenceName: {
            color:
                COLORS.darkTeal,

            fontSize:
                13.5,

            lineHeight:
                18,

            fontWeight:
                '800',
        },


        documentEvidenceHint: {
            marginTop:
                3,

            color:
                COLORS.muted,

            fontSize:
                11.5,
        },


        noEvidenceBox: {
            minHeight:
                126,

            marginTop:
                10,

            borderWidth:
                1,

            borderStyle:
                'dashed',

            borderColor:
                COLORS.gray,

            borderRadius:
                7,

            alignItems:
                'center',

            justifyContent:
                'center',

            paddingHorizontal:
                18,
        },


        noEvidenceText: {
            marginTop:
                7,

            color:
                COLORS.muted,

            fontSize:
                12.5,

            textAlign:
                'center',
        },


        /* ========================================================================
           FULL SCREEN EVIDENCE
           ======================================================================== */

        modalBackdrop: {
            flex:
                1,

            backgroundColor:
                'rgba(0, 13, 18, 0.98)',
        },


        modalHeader: {
            minHeight:
                78,

            paddingTop:
                Platform.OS ===
                    'android'
                    ? 24
                    : 10,

            paddingHorizontal:
                18,

            borderBottomWidth:
                1,

            borderBottomColor:
                'rgba(255,255,255,0.14)',

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'space-between',
        },


        modalHeaderTitleRow: {
            flexDirection:
                'row',

            alignItems:
                'center',
        },


        modalTitle: {
            marginLeft:
                8,

            color:
                COLORS.white,

            fontSize:
                17,

            fontWeight:
                '900',
        },


        modalCloseButton: {
            width:
                46,

            height:
                46,

            borderRadius:
                23,

            backgroundColor:
                'rgba(255,255,255,0.10)',

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        modalImageArea: {
            flex:
                1,

            paddingHorizontal:
                10,

            paddingVertical:
                14,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        modalImage: {
            width:
                '100%',

            height:
                '100%',
        },


        modalLoading: {
            ...StyleSheet.absoluteFillObject,

            alignItems:
                'center',

            justifyContent:
                'center',

            backgroundColor:
                'rgba(0,13,18,0.72)',
        },


        modalLoadingText: {
            marginTop:
                10,

            color:
                COLORS.white,

            fontSize:
                14,

            fontWeight:
                '700',
        },


        modalFailed: {
            ...StyleSheet.absoluteFillObject,

            paddingHorizontal:
                30,

            alignItems:
                'center',

            justifyContent:
                'center',

            backgroundColor:
                COLORS.nearBlack,
        },


        modalFailedTitle: {
            marginTop:
                12,

            color:
                COLORS.white,

            fontSize:
                18,

            fontWeight:
                '900',

            textAlign:
                'center',
        },


        modalFailedText: {
            marginTop:
                7,

            color:
                COLORS.gray,

            fontSize:
                13.5,

            lineHeight:
                20,

            textAlign:
                'center',
        },


        modalFooter: {
            paddingHorizontal:
                18,

            paddingTop:
                12,

            paddingBottom:
                Platform.OS ===
                    'android'
                    ? 24
                    : 34,

            borderTopWidth:
                1,

            borderTopColor:
                'rgba(255,255,255,0.14)',
        },


        modalFooterHint: {
            marginBottom:
                10,

            color:
                COLORS.gray,

            fontSize:
                12.5,

            textAlign:
                'center',
        },


        openOriginalButton: {
            minHeight:
                50,

            borderRadius:
                9,

            backgroundColor:
                COLORS.maroon,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        openOriginalText: {
            marginLeft:
                7,

            color:
                COLORS.white,

            fontSize:
                12.5,

            fontWeight:
                '900',

            letterSpacing:
                0.4,
        },


        /* ========================================================================
           FORM SCREEN
           ======================================================================== */

        formScreen: {
            flex:
                1,

            backgroundColor:
                COLORS.cream,
        },


        formScrollContent: {
            alignItems:
                'center',

            paddingTop:
                18,

            paddingHorizontal:
                16,
        },


        /* ========================================================================
           FILE AN EXCUSE LETTER HEADER
           ======================================================================== */

        formHeader: {
            marginBottom:
                22,
        },


        formHeaderTop: {
            flexDirection:
                'row',

            alignItems:
                'center',
        },


        formHeaderCopy: {
            flex:
                1,

            paddingRight:
                12,
        },


        formEyebrow: {
            color:
                COLORS.green,

            fontSize:
                12,

            fontWeight:
                '900',

            letterSpacing:
                1.6,
        },


        formTitle: {
            marginTop:
                4,

            color:
                COLORS.maroon,

            fontSize:
                30,

            lineHeight:
                36,

            fontWeight:
                '900',
        },


        formCloseButton: {
            width:
                50,

            height:
                50,

            borderWidth:
                1,

            borderColor:
                COLORS.line,

            borderRadius:
                25,

            backgroundColor:
                COLORS.paper,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        formDescription: {
            marginTop:
                13,

            color:
                COLORS.darkTeal,

            fontSize:
                15.5,

            lineHeight:
                23,
        },


        /* ========================================================================
           REFERENCE FORM
           ======================================================================== */

        formPaper: {
            backgroundColor:
                COLORS.cream,
        },


        studentIdLine: {
            minHeight:
                46,

            paddingHorizontal:
                8,

            alignItems:
                'flex-end',

            justifyContent:
                'center',
        },


        studentIdLineText: {
            color:
                COLORS.maroon,

            fontSize:
                13.5,

            fontWeight:
                '700',
        },


        studentNameBar: {
            minHeight:
                68,

            paddingHorizontal:
                18,

            backgroundColor:
                COLORS.maroon,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        studentNameBarText: {
            color:
                COLORS.white,

            fontSize:
                19,

            lineHeight:
                25,

            fontWeight:
                '500',

            letterSpacing:
                0.2,

            textAlign:
                'center',
        },


        formBody: {
            minHeight:
                650,

            paddingHorizontal:
                19,

            paddingTop:
                18,

            paddingBottom:
                28,

            borderLeftWidth:
                1.5,

            borderRightWidth:
                1.5,

            borderBottomWidth:
                1.5,

            borderColor:
                COLORS.maroon,

            backgroundColor:
                COLORS.cream,
        },


        editNotice: {
            alignSelf:
                'flex-start',

            marginBottom:
                4,

            paddingVertical:
                7,

            paddingHorizontal:
                9,

            borderLeftWidth:
                3,

            borderLeftColor:
                COLORS.maroon,

            backgroundColor:
                COLORS.softMaroon,

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        editNoticeText: {
            marginLeft:
                6,

            color:
                COLORS.maroon,

            fontSize:
                10.5,

            fontWeight:
                '900',

            letterSpacing:
                0.35,
        },


        formLabel: {
            marginTop:
                18,

            marginBottom:
                7,

            color:
                COLORS.darkTeal,

            fontSize:
                16,

            lineHeight:
                21,

            fontWeight:
                '800',
        },


        /* ========================================================================
           COMPONENT
           ======================================================================== */

        componentOption: {
            minHeight:
                48,

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        radioOuter: {
            width:
                21,

            height:
                21,

            borderWidth:
                1.7,

            borderColor:
                COLORS.green,

            borderRadius:
                11,

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
                11,

            height:
                11,

            borderRadius:
                6,

            backgroundColor:
                COLORS.maroon,
        },


        componentOptionIcon: {
            width:
                33,

            height:
                33,

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
        },


        componentOptionIconSelected: {
            backgroundColor:
                COLORS.softGreen,
        },


        componentOptionCopy: {
            flex:
                1,

            marginLeft:
                9,
        },


        componentOptionTitle: {
            color:
                COLORS.darkTeal,

            fontSize:
                14.5,

            lineHeight:
                18,

            fontWeight:
                '900',
        },


        componentOptionSubtitle: {
            marginTop:
                1,

            color:
                COLORS.muted,

            fontSize:
                11,

            lineHeight:
                15,
        },


        /* ========================================================================
           FORM INPUTS
           ======================================================================== */

        dateInputWrap: {
            minHeight:
                52,

            paddingHorizontal:
                11,

            borderWidth:
                1,

            borderColor:
                COLORS.maroon,

            backgroundColor:
                COLORS.white,

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        dateInput: {
            flex:
                1,

            minHeight:
                50,

            marginLeft:
                9,

            paddingVertical:
                0,

            color:
                COLORS.darkTeal,

            fontSize:
                16,
        },


        fieldHint: {
            marginTop:
                5,

            color:
                COLORS.muted,

            fontSize:
                11,

            lineHeight:
                15,
        },


        textField: {
            minHeight:
                52,

            paddingHorizontal:
                12,

            paddingVertical:
                10,

            borderWidth:
                1,

            borderColor:
                COLORS.maroon,

            backgroundColor:
                COLORS.white,

            color:
                COLORS.darkTeal,

            fontSize:
                16,
        },


        explanationField: {
            minHeight:
                136,

            paddingHorizontal:
                12,

            paddingTop:
                11,

            paddingBottom:
                11,

            borderWidth:
                1,

            borderColor:
                COLORS.maroon,

            backgroundColor:
                COLORS.white,

            color:
                COLORS.darkTeal,

            fontSize:
                16,

            lineHeight:
                23,
        },


        /* ========================================================================
           ATTACH EVIDENCE
           ======================================================================== */

        attachButton: {
            minHeight:
                52,

            paddingHorizontal:
                12,

            borderWidth:
                1.2,

            borderStyle:
                'dashed',

            borderColor:
                COLORS.maroon,

            backgroundColor:
                COLORS.white,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        attachButtonText: {
            marginLeft:
                7,

            color:
                COLORS.maroon,

            fontSize:
                13.5,

            fontWeight:
                '700',
        },


        selectedEvidenceBox: {
            minHeight:
                70,

            padding:
                8,

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
        },


        selectedEvidenceImage: {
            width:
                52,

            height:
                52,

            backgroundColor:
                COLORS.gray,
        },


        selectedEvidenceFileIcon: {
            width:
                52,

            height:
                52,

            backgroundColor:
                COLORS.white,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        selectedEvidenceCopy: {
            flex:
                1,

            marginHorizontal:
                9,
        },


        selectedEvidenceName: {
            color:
                COLORS.darkTeal,

            fontSize:
                13,

            lineHeight:
                18,

            fontWeight:
                '900',
        },


        selectedEvidenceMeta: {
            marginTop:
                2,

            color:
                COLORS.muted,

            fontSize:
                11,
        },


        /* ========================================================================
           EXISTING EVIDENCE
           ======================================================================== */

        existingEvidenceBox: {
            minHeight:
                70,

            padding:
                8,

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
        },


        existingEvidenceIcon: {
            width:
                52,

            height:
                52,

            backgroundColor:
                COLORS.white,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        existingEvidenceCopy: {
            flex:
                1,

            marginHorizontal:
                9,
        },


        existingEvidenceTitle: {
            color:
                COLORS.darkTeal,

            fontSize:
                13,

            fontWeight:
                '900',
        },


        existingEvidenceName: {
            marginTop:
                2,

            color:
                COLORS.muted,

            fontSize:
                11,
        },


        replaceEvidenceText: {
            marginTop:
                4,

            color:
                COLORS.maroon,

            fontSize:
                11,

            fontWeight:
                '900',

            textDecorationLine:
                'underline',
        },


        removeEvidenceButton: {
            width:
                36,

            height:
                36,

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        /* ========================================================================
           SUBMIT BUTTON
           ======================================================================== */

        submitButton: {
            alignSelf:
                'center',

            minWidth:
                225,

            minHeight:
                52,

            marginTop:
                70,

            paddingHorizontal:
                20,

            borderRadius:
                26,

            backgroundColor:
                COLORS.maroon,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },


        submitButtonDisabled: {
            opacity:
                0.55,
        },


        submitButtonText: {
            marginLeft:
                8,

            color:
                COLORS.white,

            fontSize:
                11.5,

            fontWeight:
                '900',

            letterSpacing:
                0.15,
        },
    });
