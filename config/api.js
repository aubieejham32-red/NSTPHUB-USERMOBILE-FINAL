/*
|--------------------------------------------------------------------------
| Laravel Server
|--------------------------------------------------------------------------
|
| EAS preview/production builds read this public build-time variable:
| EXPO_PUBLIC_NSTPHUB_SERVER_URL
|
| Set it to a LAN URL explicitly when developing against local Laravel.
| Without that variable, the APK uses the deployed Railway HTTPS API.
*/

const configuredServerUrl =
  process.env.EXPO_PUBLIC_NSTPHUB_SERVER_URL;

const productionServerUrl =
  'https://nstphub-final-web-production.up.railway.app';

const isDevelopment =
  typeof __DEV__ !== 'undefined' && __DEV__;

const cleanServerUrl =
  typeof configuredServerUrl === 'string'
    ? configuredServerUrl.trim()
    : '';

export const SERVER_URL = (
  cleanServerUrl && (isDevelopment || /^https:\/\//i.test(cleanServerUrl))
    ? cleanServerUrl
    : productionServerUrl
).replace(/\/+$/, '');


/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

export const API_URL =
  `${SERVER_URL}/api`;


/*
|--------------------------------------------------------------------------
| Mobile API URL
|--------------------------------------------------------------------------
*/

export const MOBILE_API_URL =
  `${API_URL}/mobile`;


/*
|--------------------------------------------------------------------------
| Mobile API Endpoints
|--------------------------------------------------------------------------
*/

export const API_ENDPOINTS = {

  /*
  |--------------------------------------------------------------------------
  | University Access
  |--------------------------------------------------------------------------
  */

  VERIFY_UNIVERSITY_ACCESS_CODE:
    `${MOBILE_API_URL}/university/verify-access-code`,


  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  LOGIN:
    `${MOBILE_API_URL}/login`,

  GOOGLE_LOGIN:
    `${MOBILE_API_URL}/google-login`,

  GOOGLE_SET_PASSWORD:
    `${MOBILE_API_URL}/google-set-password`,

  ME:
    `${MOBILE_API_URL}/me`,


  /*
  |--------------------------------------------------------------------------
  | Forgot Password
  |--------------------------------------------------------------------------
  |
  | Public student password recovery flow.
  |
  | The flow is:
  |
  | 1. Send verification code
  | 2. Verify the 6-digit code
  | 3. Receive temporary reset token
  | 4. Reset password
  |
  */


  /*
  |--------------------------------------------------------------------------
  | Send Forgot Password Code
  |--------------------------------------------------------------------------
  |
  | POST
  |
  | /api/mobile/forgot-password/send-code
  |
  | Request:
  |
  | {
  |   "email": "student@example.com"
  | }
  |
  */

  FORGOT_PASSWORD_SEND_CODE:
    `${MOBILE_API_URL}/forgot-password/send-code`,


  /*
  |--------------------------------------------------------------------------
  | Verify Forgot Password Code
  |--------------------------------------------------------------------------
  |
  | POST
  |
  | /api/mobile/forgot-password/verify-code
  |
  | Request:
  |
  | {
  |   "email": "student@example.com",
  |   "code": "123456"
  | }
  |
  | Successful response returns:
  |
  | reset_token
  |
  */

  FORGOT_PASSWORD_VERIFY_CODE:
    `${MOBILE_API_URL}/forgot-password/verify-code`,


  /*
  |--------------------------------------------------------------------------
  | Resend Forgot Password Code
  |--------------------------------------------------------------------------
  |
  | POST
  |
  | /api/mobile/forgot-password/resend-code
  |
  | Request:
  |
  | {
  |   "email": "student@example.com"
  | }
  |
  */

  FORGOT_PASSWORD_RESEND_CODE:
    `${MOBILE_API_URL}/forgot-password/resend-code`,


  /*
  |--------------------------------------------------------------------------
  | Reset Forgot Password
  |--------------------------------------------------------------------------
  |
  | POST
  |
  | /api/mobile/forgot-password/reset-password
  |
  | Request:
  |
  | {
  |   "email": "student@example.com",
  |   "reset_token": "...",
  |   "password": "...",
  |   "password_confirmation": "..."
  | }
  |
  */

  FORGOT_PASSWORD_RESET:
    `${MOBILE_API_URL}/forgot-password/reset-password`,


  /*
  |--------------------------------------------------------------------------
  | Account Settings
  |--------------------------------------------------------------------------
  |
  | Change Password
  |
  | PUT
  |
  | /api/mobile/account/password
  |
  | Request:
  |
  | {
  |   "current_password": "...",
  |   "password": "...",
  |   "password_confirmation": "..."
  | }
  |
  */

  CHANGE_PASSWORD:
    `${MOBILE_API_URL}/account/password`,


  /*
  |--------------------------------------------------------------------------
  | Legacy / Direct Logout
  |--------------------------------------------------------------------------
  |
  | POST
  |
  | /api/mobile/logout
  |
  | This remains available for compatibility with older mobile code.
  |
  | The new Choose Account flow uses:
  |
  | LOGOUT_PAGE_LOGOUT
  |
  */

  LOGOUT:
    `${MOBILE_API_URL}/logout`,


  /*
  |--------------------------------------------------------------------------
  | Logout Page / Choose Account
  |--------------------------------------------------------------------------
  |
  | These endpoints support the web-style logout flow:
  |
  | Logged-in Student
  |      ↓
  | Logout
  |      ↓
  | Choose An Account
  |      ↓
  | Saved Account / Another Account
  |
  */


  /*
  |--------------------------------------------------------------------------
  | Saved Account Login
  |--------------------------------------------------------------------------
  |
  | POST
  |
  | /api/mobile/logout-page/login
  |
  | Public endpoint.
  |
  | Used when a student taps an account saved on the device and enters
  | their password.
  |
  */

  LOGOUT_PAGE_LOGIN:
    `${MOBILE_API_URL}/logout-page/login`,


  /*
  |--------------------------------------------------------------------------
  | Account Chooser Logout
  |--------------------------------------------------------------------------
  |
  | POST
  |
  | /api/mobile/logout-page/logout
  |
  | Protected by auth:sanctum.
  |
  | This endpoint:
  |
  | - identifies the currently logged-in student
  | - returns safe account information
  | - preserves the university context
  | - revokes the current Sanctum token
  |
  */

  LOGOUT_PAGE_LOGOUT:
    `${MOBILE_API_URL}/logout-page/logout`,


  /*
  |--------------------------------------------------------------------------
  | University
  |--------------------------------------------------------------------------
  */

  UNIVERSITY:
    `${MOBILE_API_URL}/university`,

  UNIVERSITY_LOGO_BASE:
    `${MOBILE_API_URL}/universities`,


  /*
  |--------------------------------------------------------------------------
  | Homepage
  |--------------------------------------------------------------------------
  */

  HOMEPAGE:
    `${MOBILE_API_URL}/homepage`,


  /*
  |--------------------------------------------------------------------------
  | Schedule
  |--------------------------------------------------------------------------
  */

  SCHEDULES:
    `${MOBILE_API_URL}/schedules`,


  /*
  |--------------------------------------------------------------------------
  | Announcements
  |--------------------------------------------------------------------------
  */

  ANNOUNCEMENTS:
    `${MOBILE_API_URL}/announcements`,


  /*
  |--------------------------------------------------------------------------
  | Attendance
  |--------------------------------------------------------------------------
  */

  ATTENDANCE_RECORDS:
    `${MOBILE_API_URL}/attendance-records`,


  /*
  |--------------------------------------------------------------------------
  | Reports
  |--------------------------------------------------------------------------
  |
  | GET
  | POST
  |
  | /api/mobile/reports
  |
  | POST
  | DELETE
  |
  | /api/mobile/reports/{report}
  |
  */

  REPORTS:
    `${MOBILE_API_URL}/reports`,


  /*
  |--------------------------------------------------------------------------
  | Excuse Letters
  |--------------------------------------------------------------------------
  |
  | GET
  | POST
  |
  | /api/mobile/excuse-letters
  |
  | POST
  | DELETE
  |
  | /api/mobile/excuse-letters/{excuseLetter}
  |
  */

  EXCUSE_LETTERS:
    `${MOBILE_API_URL}/excuse-letters`,


  /*
  |--------------------------------------------------------------------------
  | Digital Student ID
  |--------------------------------------------------------------------------
  */

  DIGITAL_STUDENT_ID:
    `${MOBILE_API_URL}/digital-student-id`,

  DIGITAL_STUDENT_ID_QR_CODE:
    `${MOBILE_API_URL}/digital-student-id/qr-code`,


  /*
  |--------------------------------------------------------------------------
  | Shared Student Profile
  |--------------------------------------------------------------------------
  |
  | Available to:
  |
  | CWTS
  | LTS
  | ROTC
  |
  | GET
  |
  | /api/mobile/profile
  |
  | PUT
  |
  | /api/mobile/profile
  |
  */

  PROFILE:
    `${MOBILE_API_URL}/profile`,


  /*
  |--------------------------------------------------------------------------
  | Shared Student Profile Signature
  |--------------------------------------------------------------------------
  |
  | Available to:
  |
  | CWTS
  | LTS
  | ROTC
  |
  | POST
  |
  | /api/mobile/profile/signature
  |
  | Current signature drawing request:
  |
  | {
  |   "paths": [
  |     "M 100 100 L 120 110 ...",
  |     "M 200 120 L 230 140 ..."
  |   ]
  | }
  |
  */

  PROFILE_SIGNATURE:
    `${MOBILE_API_URL}/profile/signature`,


  /*
  |--------------------------------------------------------------------------
  | Shared Student Profile Photo
  |--------------------------------------------------------------------------
  |
  | Available to:
  |
  | CWTS
  | LTS
  | ROTC
  |
  | POST
  |
  | /api/mobile/profile/photo
  |
  | Multipart field:
  |
  | profile_photo
  |
  */

  PROFILE_PHOTO:
    `${MOBILE_API_URL}/profile/photo`,


  /*
  |--------------------------------------------------------------------------
  | Legacy ROTC Profile Compatibility Aliases
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | These names are intentionally kept so older files that still import:
  |
  | API_ENDPOINTS.ROTC_PROFILE
  | API_ENDPOINTS.ROTC_PROFILE_SIGNATURE
  | API_ENDPOINTS.ROTC_PROFILE_PHOTO
  |
  | will continue working.
  |
  | They now point to the SHARED profile API.
  |
  */

  ROTC_PROFILE:
    `${MOBILE_API_URL}/profile`,

  ROTC_PROFILE_SIGNATURE:
    `${MOBILE_API_URL}/profile/signature`,

  ROTC_PROFILE_PHOTO:
    `${MOBILE_API_URL}/profile/photo`,


  /*
  |--------------------------------------------------------------------------
  | General Registration
  |--------------------------------------------------------------------------
  */

  GENERAL_REGISTRATION:
    `${MOBILE_API_URL}/general-registration`,

  GENERAL_REGISTRATION_SIGNATURE:
    `${MOBILE_API_URL}/general-registration/signature`,


  /*
  |--------------------------------------------------------------------------
  | Registration Wait / Edit
  |--------------------------------------------------------------------------
  */

  REGISTRATION_WAIT_EDIT:
    `${MOBILE_API_URL}/registration-wait-edit`,

  REGISTRATION_WAIT_EDIT_COMPONENT:
    `${MOBILE_API_URL}/registration-wait-edit/component`,


  /*
  |--------------------------------------------------------------------------
  | Registration Confirmation
  |--------------------------------------------------------------------------
  */

  REGISTRATION_CONFIRMATION:
    `${MOBILE_API_URL}/registration-confirmation`,


  /*
  |--------------------------------------------------------------------------
  | ROTC Enrollment
  |--------------------------------------------------------------------------
  |
  | These routes remain ROTC-specific.
  |
  */

  ROTC_ENROLLMENT:
    `${MOBILE_API_URL}/rotc-enrollment`,

  ROTC_ENROLLMENT_STEP_ONE:
    `${MOBILE_API_URL}/rotc-enrollment/step-1`,

  ROTC_ENROLLMENT_STEP_TWO:
    `${MOBILE_API_URL}/rotc-enrollment/step-2`,

  ROTC_ENROLLMENT_STEP_THREE:
    `${MOBILE_API_URL}/rotc-enrollment/step-3`,

  ROTC_ENROLLMENT_STEP_FOUR:
    `${MOBILE_API_URL}/rotc-enrollment/step-4`,

  ROTC_ENROLLMENT_CONFIRMATION:
    `${MOBILE_API_URL}/rotc-enrollment/confirmation`,
};


/*
|--------------------------------------------------------------------------
| University Logo URL
|--------------------------------------------------------------------------
*/

export function getUniversityLogoUrl(
  universityId
) {
  if (
    universityId === null
    ||
    universityId === undefined
    ||
    universityId === ''
  ) {
    return null;
  }


  return (
    `${API_ENDPOINTS.UNIVERSITY_LOGO_BASE}/${encodeURIComponent(
      universityId
    )}/logo`
  );
}
