import * as SecureStore from 'expo-secure-store';

import {
  API_ENDPOINTS,
} from '../config/api';


/*
|--------------------------------------------------------------------------
| Secure Store Keys
|--------------------------------------------------------------------------
*/

const TOKEN_KEY =
  'nstp_hub_mobile_token';

const GOOGLE_SETUP_TOKEN_KEY =
  'nstp_hub_google_setup_token';

const UNIVERSITY_ACCESS_TOKEN_KEY =
  'nstp_hub_university_access_token';


/*
|--------------------------------------------------------------------------
| Request Timeout
|--------------------------------------------------------------------------
*/

const REQUEST_TIMEOUT =
  20000;


/*
|--------------------------------------------------------------------------
| Clean String
|--------------------------------------------------------------------------
*/

const clean = (
  value,
  fallback = ''
) => {
  const text =
    String(
      value ?? ''
    ).trim();

  return (
    text ||
    fallback
  );
};


/*
|--------------------------------------------------------------------------
| Uppercase String
|--------------------------------------------------------------------------
*/

const upper = (
  value,
  fallback = ''
) => {
  return clean(
    value,
    fallback
  ).toUpperCase();
};


/*
|--------------------------------------------------------------------------
| Read JSON
|--------------------------------------------------------------------------
*/

async function readJson(
  response
) {
  const text =
    await response.text();

  if (
    !text
  ) {
    return {};
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    console.warn(
      'NSTP HUB non-JSON server response:',
      {
        status:
          response.status,

        contentType:
          response.headers.get(
            'content-type'
          ),

        body:
          text.substring(
            0,
            800
          ),
      }
    );

    throw new Error(
      `The NSTP HUB server returned an invalid response (HTTP ${response.status}).`
    );
  }
}


/*
|--------------------------------------------------------------------------
| API Error
|--------------------------------------------------------------------------
*/

function getApiError(
  data,
  fallback
) {
  if (
    data?.errors
  ) {
    const first =
      Object.values(
        data.errors
      )
        .flat()
        .find(
          Boolean
        );

    if (
      first
    ) {
      return String(
        first
      );
    }
  }

  if (
    data?.error
  ) {
    const backendError =
      String(
        data.error
      ).trim();

    if (
      backendError
    ) {
      const message =
        String(
          data?.message
          ??
          fallback
          ??
          ''
        ).trim();

      return message
        ? `${message}\n${backendError}`
        : backendError;
    }
  }

  return (
    data?.message
    ||
    fallback
  );
}


/*
|--------------------------------------------------------------------------
| Require Object Payload
|--------------------------------------------------------------------------
*/

function requireObjectPayload(
  data,
  message
) {
  if (
    !data
    ||
    typeof data !==
      'object'
    ||
    Array.isArray(
      data
    )
  ) {
    throw new Error(
      message
    );
  }
}


/*
|--------------------------------------------------------------------------
| Base API Request
|--------------------------------------------------------------------------
*/

async function apiRequest(
  url,
  options = {}
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      REQUEST_TIMEOUT
    );

  try {
    return await fetch(
      url,
      {
        ...options,

        signal:
          controller.signal,
      }
    );
  } catch (
    error
  ) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw new Error(
        'The NSTP HUB server took too long to respond.'
      );
    }

    throw new Error(
      'Cannot connect to the NSTP HUB server. Make sure Laravel is running and your phone and computer are connected to the same Wi-Fi.'
    );
  } finally {
    clearTimeout(
      timeout
    );
  }
}


/*
|--------------------------------------------------------------------------
| Save Authentication Token
|--------------------------------------------------------------------------
*/

async function saveToken(
  token
) {
  if (
    !token
  ) {
    throw new Error(
      'Laravel did not return an authentication token.'
    );
  }

  await SecureStore
    .setItemAsync(
      TOKEN_KEY,
      token
    );
}


/*
|--------------------------------------------------------------------------
| Get Authentication Token
|--------------------------------------------------------------------------
*/

export async function getToken() {
  return SecureStore
    .getItemAsync(
      TOKEN_KEY
    );
}


/*
|--------------------------------------------------------------------------
| Delete Authentication Token
|--------------------------------------------------------------------------
*/

export async function deleteToken() {
  await SecureStore
    .deleteItemAsync(
      TOKEN_KEY
    );
}


/*
|--------------------------------------------------------------------------
| Require Authentication Token
|--------------------------------------------------------------------------
*/

async function requireToken() {
  const token =
    await getToken();

  if (
    !token
  ) {
    throw new Error(
      'You are not logged in.'
    );
  }

  return token;
}


/*
|--------------------------------------------------------------------------
| Authenticated Request
|--------------------------------------------------------------------------
*/

async function authenticatedRequest(
  url,
  {
    method = 'GET',
    body = undefined,
  } = {}
) {
  const token =
    await requireToken();

  const isFormData =
    typeof FormData !==
      'undefined'
    &&
    body instanceof FormData;

  const headers = {
    Accept:
      'application/json',

    Authorization:
      `Bearer ${token}`,
  };

  /*
  |--------------------------------------------------------------------------
  | JSON Content Type
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Do not manually set Content-Type for FormData.
  |
  | React Native must generate the multipart boundary automatically.
  |
  */

  if (
    body !==
      undefined
    &&
    !isFormData
  ) {
    headers[
      'Content-Type'
    ] =
      'application/json';
  }

  let requestBody;

  if (
    body ===
    undefined
  ) {
    requestBody =
      undefined;
  } else if (
    isFormData
  ) {
    requestBody =
      body;
  } else {
    requestBody =
      JSON.stringify(
        body
      );
  }

  const response =
    await apiRequest(
      url,
      {
        method,

        headers,

        ...(
          requestBody !==
            undefined
            ? {
                body:
                  requestBody,
              }
            : {}
        ),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    response.status ===
    401
  ) {
    await deleteToken();
  }

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'The request could not be completed.'
      )
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Save University Access Token
|--------------------------------------------------------------------------
*/

async function saveUniversityAccessToken(
  token
) {
  if (
    !token
  ) {
    throw new Error(
      'Laravel did not return a university access token.'
    );
  }

  await SecureStore
    .setItemAsync(
      UNIVERSITY_ACCESS_TOKEN_KEY,
      token
    );
}


/*
|--------------------------------------------------------------------------
| Get University Access Token
|--------------------------------------------------------------------------
*/

export async function getUniversityAccessToken() {
  return SecureStore
    .getItemAsync(
      UNIVERSITY_ACCESS_TOKEN_KEY
    );
}


/*
|--------------------------------------------------------------------------
| Clear University Access Token
|--------------------------------------------------------------------------
*/

export async function clearUniversityAccessToken() {
  await SecureStore
    .deleteItemAsync(
      UNIVERSITY_ACCESS_TOKEN_KEY
    );
}


/*
|--------------------------------------------------------------------------
| Require University Access Token
|--------------------------------------------------------------------------
*/

async function requireUniversityAccessToken() {
  const token =
    await getUniversityAccessToken();

  if (
    !token
  ) {
    throw new Error(
      'Your university access session is missing or has expired. Please return to the access code screen.'
    );
  }

  return token;
}


/*
|--------------------------------------------------------------------------
| Verify University Access Code
|--------------------------------------------------------------------------
*/

export async function verifyUniversityAccessCode(
  accessCode
) {
  const normalized =
    upper(
      accessCode
    );

  if (
    !normalized
  ) {
    throw new Error(
      'University access code is required.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS
        .VERIFY_UNIVERSITY_ACCESS_CODE,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            access_code:
              normalized,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'The university access code is invalid.'
      )
    );
  }

  if (
    !data
      ?.university_access_token
  ) {
    throw new Error(
      'Laravel verified the university but did not return a university access session.'
    );
  }

  await saveUniversityAccessToken(
    data.university_access_token
  );

  return data;
}


/*
|--------------------------------------------------------------------------
| Student Login
|--------------------------------------------------------------------------
*/

export async function loginStudent(
  email,
  password
) {
  const universityAccessToken =
    await requireUniversityAccessToken();

  const normalizedEmail =
    clean(
      email
    ).toLowerCase();

  if (
    !normalizedEmail
  ) {
    throw new Error(
      'Email address is required.'
    );
  }

  if (
    !password
  ) {
    throw new Error(
      'Password is required.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS.LOGIN,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email:
              normalizedEmail,

            password,

            university_access_token:
              universityAccessToken,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Login failed. Please check your email and password.'
      )
    );
  }

  if (
    !data?.token
  ) {
    throw new Error(
      'Laravel did not return a login token.'
    );
  }

  await saveToken(
    data.token
  );

  await clearUniversityAccessToken();

  return data;
}


/*
|--------------------------------------------------------------------------
| Google Login
|--------------------------------------------------------------------------
*/

export async function loginStudentWithGoogle(
  googleAccessToken
) {
  if (
    !googleAccessToken
  ) {
    throw new Error(
      'Google did not return an access token.'
    );
  }

  const universityAccessToken =
    await requireUniversityAccessToken();

  await SecureStore
    .deleteItemAsync(
      GOOGLE_SETUP_TOKEN_KEY
    );

  const response =
    await apiRequest(
      API_ENDPOINTS
        .GOOGLE_LOGIN,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            access_token:
              googleAccessToken,

            university_access_token:
              universityAccessToken,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Google authentication failed.'
      )
    );
  }

  if (
    data
      ?.requires_password_setup ===
    true
  ) {
    if (
      !data?.setup_token
    ) {
      throw new Error(
        'Laravel did not return the password setup token.'
      );
    }

    await SecureStore
      .setItemAsync(
        GOOGLE_SETUP_TOKEN_KEY,
        data.setup_token
      );

    await clearUniversityAccessToken();

    return data;
  }

  if (
    !data?.token
  ) {
    throw new Error(
      'Laravel did not return a login token.'
    );
  }

  await saveToken(
    data.token
  );

  await clearUniversityAccessToken();

  return data;
}


/*
|--------------------------------------------------------------------------
| Google Student Login Alias
|--------------------------------------------------------------------------
*/

export async function startGoogleStudentLogin(
  googleAccessToken
) {
  return loginStudentWithGoogle(
    googleAccessToken
  );
}


/*
|--------------------------------------------------------------------------
| Complete Google Password Setup
|--------------------------------------------------------------------------
*/

export async function completeGooglePasswordSetup(
  password,
  confirmPassword
) {
  const setupToken =
    await SecureStore
      .getItemAsync(
        GOOGLE_SETUP_TOKEN_KEY
      );

  if (
    !setupToken
  ) {
    throw new Error(
      'Your Google registration session is missing or has expired. Please return to login and sign in with Google again.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS
        .GOOGLE_SET_PASSWORD,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            setup_token:
              setupToken,

            password,

            password_confirmation:
              confirmPassword,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Unable to create your NSTP HUB password.'
      )
    );
  }

  if (
    !data?.token
  ) {
    throw new Error(
      'Laravel did not return a login token after creating your account.'
    );
  }

  await saveToken(
    data.token
  );

  await SecureStore
    .deleteItemAsync(
      GOOGLE_SETUP_TOKEN_KEY
    );

  await clearUniversityAccessToken();

  return data;
}


/*
|--------------------------------------------------------------------------
| Forgot Password - Normalize Email
|--------------------------------------------------------------------------
|
| Forgot-password requests are public and do not require a Sanctum token.
|
*/

function normalizeForgotPasswordEmail(
  email
) {
  return String(
    email ?? ''
  )
    .trim()
    .toLowerCase();
}


/*
|--------------------------------------------------------------------------
| Forgot Password - Send Verification Code
|--------------------------------------------------------------------------
|
| POST
|
| /api/mobile/forgot-password/send-code
|
*/

export async function sendForgotPasswordCode(
  email
) {
  const normalizedEmail =
    normalizeForgotPasswordEmail(
      email
    );

  if (
    !normalizedEmail
  ) {
    throw new Error(
      'Please enter your email address.'
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalizedEmail
    )
  ) {
    throw new Error(
      'Please enter a valid email address.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.FORGOT_PASSWORD_SEND_CODE
  ) {
    throw new Error(
      'The NSTP HUB forgot password send-code API endpoint is not configured.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS
        .FORGOT_PASSWORD_SEND_CODE,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email:
              normalizedEmail,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Unable to send the verification code.'
      )
    );
  }

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to send the verification code.'
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Forgot Password - Verify Verification Code
|--------------------------------------------------------------------------
|
| POST
|
| /api/mobile/forgot-password/verify-code
|
| Laravel returns reset_token when the OTP is valid.
|
*/

export async function verifyForgotPasswordCode(
  email,
  code
) {
  const normalizedEmail =
    normalizeForgotPasswordEmail(
      email
    );

  const normalizedCode =
    String(
      code ?? ''
    )
      .replace(
        /\D/g,
        ''
      )
      .slice(
        0,
        6
      );

  if (
    !normalizedEmail
  ) {
    throw new Error(
      'Email address is required.'
    );
  }

  if (
    normalizedCode.length !==
    6
  ) {
    throw new Error(
      'Please enter the complete 6-digit verification code.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.FORGOT_PASSWORD_VERIFY_CODE
  ) {
    throw new Error(
      'The NSTP HUB forgot password verification API endpoint is not configured.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS
        .FORGOT_PASSWORD_VERIFY_CODE,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email:
              normalizedEmail,

            code:
              normalizedCode,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Unable to verify the verification code.'
      )
    );
  }

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to verify the verification code.'
    );
  }

  if (
    !data?.reset_token
  ) {
    throw new Error(
      'Laravel verified the code but did not return a password reset token.'
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Forgot Password - Resend Verification Code
|--------------------------------------------------------------------------
|
| POST
|
| /api/mobile/forgot-password/resend-code
|
*/

export async function resendForgotPasswordCode(
  email
) {
  const normalizedEmail =
    normalizeForgotPasswordEmail(
      email
    );

  if (
    !normalizedEmail
  ) {
    throw new Error(
      'Email address is required.'
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalizedEmail
    )
  ) {
    throw new Error(
      'Please enter a valid email address.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.FORGOT_PASSWORD_RESEND_CODE
  ) {
    throw new Error(
      'The NSTP HUB resend verification code API endpoint is not configured.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS
        .FORGOT_PASSWORD_RESEND_CODE,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email:
              normalizedEmail,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Unable to resend the verification code.'
      )
    );
  }

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to resend the verification code.'
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Forgot Password - Reset Password
|--------------------------------------------------------------------------
|
| POST
|
| /api/mobile/forgot-password/reset-password
|
*/

export async function resetForgotPassword(
  email,
  resetToken,
  password,
  confirmPassword
) {
  const normalizedEmail =
    normalizeForgotPasswordEmail(
      email
    );

  if (
    !normalizedEmail
  ) {
    throw new Error(
      'Email address is required.'
    );
  }

  if (
    typeof resetToken !==
      'string'
    ||
    resetToken.length <
      40
  ) {
    throw new Error(
      'Your password reset session has expired. Please request another verification code.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Do Not Trim Passwords
  |--------------------------------------------------------------------------
  */

  if (
    typeof password !==
      'string'
    ||
    password.length <
      8
  ) {
    throw new Error(
      'Password must contain at least 8 characters.'
    );
  }

  if (
    typeof confirmPassword !==
      'string'
    ||
    confirmPassword.length ===
      0
  ) {
    throw new Error(
      'Please confirm your new password.'
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    throw new Error(
      'Passwords do not match.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.FORGOT_PASSWORD_RESET
  ) {
    throw new Error(
      'The NSTP HUB reset password API endpoint is not configured.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS
        .FORGOT_PASSWORD_RESET,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email:
              normalizedEmail,

            reset_token:
              resetToken,

            password,

            password_confirmation:
              confirmPassword,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Unable to reset your password.'
      )
    );
  }

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to reset your password.'
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Current Student
|--------------------------------------------------------------------------
*/

export async function getCurrentStudent() {
  return authenticatedRequest(
    API_ENDPOINTS.ME
  );
}


/*
|--------------------------------------------------------------------------
| Change Student Password
|--------------------------------------------------------------------------
|
| PUT
|
| /api/mobile/account/password
|
*/

export async function changeStudentPassword(
  currentPassword,
  newPassword,
  confirmPassword
) {
  if (
    !API_ENDPOINTS
      ?.CHANGE_PASSWORD
  ) {
    throw new Error(
      'The NSTP HUB change password API endpoint is not configured.'
    );
  }

  if (
    typeof currentPassword !==
      'string'
    ||
    currentPassword.length ===
      0
  ) {
    throw new Error(
      'Please enter your current password.'
    );
  }

  if (
    typeof newPassword !==
      'string'
    ||
    newPassword.length <
      8
  ) {
    throw new Error(
      'Your new password must contain at least 8 characters.'
    );
  }

  if (
    typeof confirmPassword !==
      'string'
    ||
    confirmPassword.length ===
      0
  ) {
    throw new Error(
      'Please confirm your new password.'
    );
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    throw new Error(
      'The new password and confirmation password do not match.'
    );
  }

  if (
    currentPassword ===
    newPassword
  ) {
    throw new Error(
      'Your new password must be different from your current password.'
    );
  }

  const data =
    await authenticatedRequest(
      API_ENDPOINTS
        .CHANGE_PASSWORD,
      {
        method:
          'PUT',

        body: {
          current_password:
            currentPassword,

          password:
            newPassword,

          password_confirmation:
            confirmPassword,
        },
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to update your password.'
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Student University
|--------------------------------------------------------------------------
*/

export async function getStudentUniversity() {
  const data =
    await authenticatedRequest(
      API_ENDPOINTS.UNIVERSITY
    );

  if (
    !data?.university
  ) {
    throw new Error(
      'Laravel did not return university information.'
    );
  }

  return data;
}


export async function getCurrentUniversity() {
  return getStudentUniversity();
}


/*
|--------------------------------------------------------------------------
| Homepage
|--------------------------------------------------------------------------
*/

export async function getHomepage() {
  const data =
    await authenticatedRequest(
      API_ENDPOINTS.HOMEPAGE
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel did not return homepage information.'
    );
  }

  if (
    !data?.student
  ) {
    throw new Error(
      'Laravel did not return student information for the homepage.'
    );
  }

  if (
    !data?.university
  ) {
    throw new Error(
      'Laravel did not return university information for the homepage.'
    );
  }

  return {
    ...data,

    schedules:
      Array.isArray(
        data?.schedules
      )
        ? data.schedules
        : [],

    announcements:
      Array.isArray(
        data?.announcements
      )
        ? data.announcements
        : [],

    new_announcement_count:
      Number(
        data
          ?.new_announcement_count
        ??
        0
      ),
  };
}


/*
|--------------------------------------------------------------------------
| Student Schedules
|--------------------------------------------------------------------------
*/

export async function getStudentSchedules() {
  if (
    !API_ENDPOINTS
      ?.SCHEDULES
  ) {
    throw new Error(
      'The NSTP HUB schedule API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      API_ENDPOINTS.SCHEDULES
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel did not return your NSTP schedule.'
    );
  }

  const schedules =
    Array.isArray(
      data?.schedules
    )
      ? data.schedules
      : [];

  const normalizedSchedules =
    schedules.map(
      schedule => ({
        ...schedule,

        id:
          schedule?.id,

        university_id:
          schedule
            ?.university_id,

        component:
          upper(
            schedule?.component
          ),

        title:
          clean(
            schedule?.title
          ),

        location:
          clean(
            schedule?.location
          ),

        schedule_date:
          schedule
            ?.schedule_date
          ??
          null,

        start_time:
          schedule
            ?.start_time
          ??
          null,

        end_time:
          schedule
            ?.end_time
          ??
          null,

        date_label:
          clean(
            schedule?.date_label
          ),

        day_label:
          clean(
            schedule?.day_label
          ),

        time_label:
          clean(
            schedule?.time_label
          ),

        is_today:
          schedule
            ?.is_today ===
          true,

        is_past:
          schedule
            ?.is_past ===
          true,

        is_upcoming:
          schedule
            ?.is_upcoming ===
          true,
      })
    );

  return {
    ...data,

    schedule_title:
      upper(
        data?.schedule_title,
        'NSTP SCHEDULE'
      ),

    component:
      upper(
        data?.component
      )
      ||
      null,

    total:
      Number(
        data?.total
        ??
        normalizedSchedules.length
      ),

    upcoming_count:
      Number(
        data
          ?.upcoming_count
        ??
        normalizedSchedules
          .filter(
            item =>
              item.is_upcoming
          )
          .length
      ),

    past_count:
      Number(
        data
          ?.past_count
        ??
        normalizedSchedules
          .filter(
            item =>
              item.is_past
          )
          .length
      ),

    schedules:
      normalizedSchedules,
  };
}


export async function getSchedules() {
  return getStudentSchedules();
}


/*
|--------------------------------------------------------------------------
| Student Announcements
|--------------------------------------------------------------------------
*/

export async function getStudentAnnouncements() {
  if (
    !API_ENDPOINTS
      ?.ANNOUNCEMENTS
  ) {
    throw new Error(
      'The NSTP HUB announcements API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      API_ENDPOINTS
        .ANNOUNCEMENTS
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel did not return your NSTP announcements.'
    );
  }

  const announcements =
    Array.isArray(
      data?.announcements
    )
      ? data.announcements
      : [];

  const normalizedAnnouncements =
    announcements.map(
      announcement => ({
        ...announcement,

        id:
          announcement?.id,

        component:
          upper(
            announcement
              ?.component
          ),

        title:
          clean(
            announcement
              ?.title
          ),

        description:
          clean(
            announcement
              ?.description
          ),

        announcement_date:
          announcement
            ?.announcement_date
          ??
          null,

        date_label:
          clean(
            announcement
              ?.date_label
          )
          ||
          null,

        day_label:
          clean(
            announcement
              ?.day_label
          )
          ||
          null,

        author_label:
          clean(
            announcement
              ?.author_label,
            'NSTP Administration'
          ),

        creator_role:
          clean(
            announcement
              ?.creator_role
          ),

        recipient_type:
          clean(
            announcement
              ?.recipient_type
          ),

        is_personal:
          announcement
            ?.is_personal ===
          true,

        is_today:
          announcement
            ?.is_today ===
          true,
      })
    );

  return {
    ...data,

    component:
      upper(
        data?.component
      )
      ||
      null,

    total:
      Number(
        data?.total
        ??
        normalizedAnnouncements.length
      ),

    announcements:
      normalizedAnnouncements,
  };
}


export async function getAnnouncements() {
  return getStudentAnnouncements();
}


/*
|--------------------------------------------------------------------------
| Attendance Records
|--------------------------------------------------------------------------
*/

export async function getAttendanceRecords(
  date = null
) {
  if (
    !API_ENDPOINTS
      ?.ATTENDANCE_RECORDS
  ) {
    throw new Error(
      'The NSTP HUB attendance records API endpoint is not configured.'
    );
  }

  const normalizedDate =
    clean(
      date
    );

  if (
    normalizedDate
    &&
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalizedDate
    )
  ) {
    throw new Error(
      'Attendance date must use YYYY-MM-DD format.'
    );
  }

  const url =
    normalizedDate
      ? `${API_ENDPOINTS.ATTENDANCE_RECORDS}?date=${encodeURIComponent(
          normalizedDate
        )}`
      : API_ENDPOINTS
          .ATTENDANCE_RECORDS;

  const data =
    await authenticatedRequest(
      url
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel did not return your attendance records.'
    );
  }

  const attendance =
    Array.isArray(
      data?.attendance
    )
      ? data.attendance
      : [];

  const normalizedAttendance =
    attendance.map(
      record => ({
        ...record,

        id:
          record?.id,

        attendance_date:
          record
            ?.attendance_date
          ??
          null,

        date_label:
          clean(
            record
              ?.date_label
            ??
            record
              ?.attendance_date
          ),

        time_in:
          record
            ?.time_in
          ??
          null,

        time_in_label:
          clean(
            record
              ?.time_in_label,
            '—'
          ),

        time_out:
          record
            ?.time_out
          ??
          null,

        time_out_label:
          clean(
            record
              ?.time_out_label,
            '—'
          ),

        remark:
          upper(
            record?.remark
          ),

        notes:
          record?.notes
          ??
          null,
      })
    );

  return {
    ...data,

    student: {
      ...(
        data?.student
        ??
        {}
      ),

      status:
        upper(
          data
            ?.student
            ?.status,
          'ACTIVE'
        ),

      status_label:
        upper(
          data
            ?.student
            ?.status_label
          ??
          data
            ?.student
            ?.status,
          'ACTIVE'
        ),

      component:
        upper(
          data
            ?.student
            ?.component
        ),
    },

    summary: {
      total:
        Number(
          data
            ?.summary
            ?.total
          ??
          normalizedAttendance.length
        ),

      present:
        Number(
          data
            ?.summary
            ?.present
          ??
          0
        ),

      late:
        Number(
          data
            ?.summary
            ?.late
          ??
          0
        ),

      excused:
        Number(
          data
            ?.summary
            ?.excused
          ??
          0
        ),

      absent:
        Number(
          data
            ?.summary
            ?.absent
          ??
          0
        ),
    },

    attendance:
      normalizedAttendance,
  };
}


export async function getStudentAttendanceRecords(
  date = null
) {
  return getAttendanceRecords(
    date
  );
}


/*
|--------------------------------------------------------------------------
| Report Helpers
|--------------------------------------------------------------------------
*/

function normalizeReportStatus(
  value
) {
  const status =
    upper(
      value
    );

  return (
    status ===
      'IN_REVIEW'
      ? 'IN REVIEW'
      : status
        ||
        'PENDING'
  );
}


function normalizeStudentReport(
  report
) {
  if (
    !report
    ||
    typeof report !==
      'object'
  ) {
    return null;
  }

  const status =
    normalizeReportStatus(
      report?.status
    );

  const component =
    upper(
      report?.component
    );

  const subject =
    clean(
      report?.subject
      ??
      report?.concern
    );

  const concern =
    clean(
      report?.concern
      ??
      report?.subject
    );

  return {
    ...report,

    id:
      report?.id,

    studentName:
      clean(
        report?.studentName,
        'Student'
      ),

    student_id_number:
      clean(
        report
          ?.student_id_number
      )
      ||
      null,

    email:
      clean(
        report?.email
      )
      ||
      null,

    profile_photo_url:
      report
        ?.profile_photo_url
      ??
      null,

    submittedDate:
      clean(
        report?.submittedDate
      )
      ||
      null,

    created_at:
      report?.created_at
      ??
      null,

    updated_at:
      report?.updated_at
      ??
      null,

    status,

    component,

    instructor_id:
      report?.instructor_id
      ??
      null,

    instructor:
      clean(
        report?.instructor,
        'Instructor'
      ),

    occurrence_date:
      report
        ?.occurrence_date
      ??
      null,

    occurrenceDate:
      clean(
        report
          ?.occurrenceDate
      )
      ||
      null,

    concern,

    subject,

    description:
      clean(
        report?.description
      ),

    attachment_url:
      report
        ?.attachment_url
      ??
      null,

    evidenceUri:
      report?.evidenceUri
      ??
      (
        clean(
          report
            ?.attachment_mime_type
        )
          .toLowerCase()
          .startsWith(
            'image/'
          )
          ? report
              ?.attachment_url
          : null
      )
      ??
      null,

    attachmentName:
      clean(
        report
          ?.attachmentName
      )
      ||
      null,

    attachment_mime_type:
      report
        ?.attachment_mime_type
      ??
      null,

    attachment_size:
      report
        ?.attachment_size !==
        null
      &&
      report
        ?.attachment_size !==
        undefined
        ? Number(
            report
              .attachment_size
          )
        : null,

    feedback:
      report?.feedback
      ??
      null,

    response:
      report?.response
      ??
      null,

    resolution:
      report?.resolution
      ??
      null,

    reviewed_at:
      report?.reviewed_at
      ??
      null,

    resolved_at:
      report?.resolved_at
      ??
      null,

    can_edit:
      report?.can_edit ===
      true,

    can_delete:
      report?.can_delete ===
      true,
  };
}


function normalizeInstructor(
  instructor
) {
  if (
    !instructor
    ||
    typeof instructor !==
      'object'
  ) {
    return null;
  }

  const components =
    normalizeAllowedComponents(
      Array.isArray(
        instructor?.components
      )
        ? instructor.components
        : [
            instructor?.component,
          ]
    );

  const primaryComponent =
    upper(
      instructor?.component
    )
    ||
    components[0]
    ||
    '';

  return {
    ...instructor,

    id:
      instructor?.id,

    full_name:
      clean(
        instructor
          ?.full_name
        ??
        instructor?.name,
        'Instructor'
      ),

    email:
      clean(
        instructor?.email
      )
      ||
      null,

    component:
      primaryComponent,

    components,
  };
}


function normalizeAllowedComponents(
  values
) {
  if (
    !Array.isArray(
      values
    )
  ) {
    return [];
  }

  return values
    .map(
      value =>
        upper(
          value
        )
    )
    .filter(
      value =>
        [
          'CWTS',
          'LTS',
          'ROTC',
        ].includes(
          value
        )
    );
}


/*
|--------------------------------------------------------------------------
| Get Student Reports
|--------------------------------------------------------------------------
*/

export async function getStudentReports() {
  if (
    !API_ENDPOINTS
      ?.REPORTS
  ) {
    throw new Error(
      'The NSTP HUB reports API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      API_ENDPOINTS.REPORTS
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel did not return your reports.'
    );
  }

  const reports =
    Array.isArray(
      data?.reports
    )
      ? data.reports
          .map(
            normalizeStudentReport
          )
          .filter(
            Boolean
          )
      : [];

  const instructors =
    Array.isArray(
      data?.instructors
    )
      ? data.instructors
          .map(
            normalizeInstructor
          )
          .filter(
            Boolean
          )
      : [];

  const allowedComponents =
    normalizeAllowedComponents(
      data
        ?.allowed_components
    );

  const student = {
    ...(
      data?.student
      ??
      {}
    ),

    id:
      data
        ?.student
        ?.id
      ??
      null,

    student_id_number:
      clean(
        data
          ?.student
          ?.student_id_number
      )
      ||
      null,

    full_name:
      clean(
        data
          ?.student
          ?.full_name,
        'Student'
      ),

    email:
      clean(
        data
          ?.student
          ?.email
      )
      ||
      null,

    component:
      upper(
        data
          ?.student
          ?.component
      )
      ||
      null,

    profile_photo_url:
      data
        ?.student
        ?.profile_photo_url
      ??
      null,
  };

  return {
    ...data,

    student,

    allowed_components:
      allowedComponents,

    instructors,

    summary: {
      total:
        Number(
          data
            ?.summary
            ?.total
          ??
          reports.length
        ),

      pending:
        Number(
          data
            ?.summary
            ?.pending
          ??
          reports.filter(
            report =>
              report.status ===
              'PENDING'
          ).length
        ),

      in_review:
        Number(
          data
            ?.summary
            ?.in_review
          ??
          reports.filter(
            report =>
              report.status ===
              'IN REVIEW'
          ).length
        ),

      resolved:
        Number(
          data
            ?.summary
            ?.resolved
          ??
          reports.filter(
            report =>
              report.status ===
              'RESOLVED'
          ).length
        ),
    },

    reports,
  };
}


/*
|--------------------------------------------------------------------------
| Validate Student Report
|--------------------------------------------------------------------------
*/

function validateStudentReportPayload(
  reportData
) {
  requireObjectPayload(
    reportData,
    'Report information is required.'
  );

  const component =
    upper(
      reportData?.component
    );

  if (
    ![
      'CWTS',
      'LTS',
      'ROTC',
    ].includes(
      component
    )
  ) {
    throw new Error(
      'Please select a valid NSTP component.'
    );
  }

  const occurrenceDate =
    clean(
      reportData
        ?.occurrence_date
    );

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      occurrenceDate
    )
  ) {
    throw new Error(
      'Report occurrence date must use YYYY-MM-DD format.'
    );
  }

  const subject =
    clean(
      reportData?.subject
    );

  if (
    !subject
  ) {
    throw new Error(
      'Please tell us what your report is about.'
    );
  }

  const description =
    clean(
      reportData
        ?.description
    );

  if (
    !description
  ) {
    throw new Error(
      'Please describe your concern.'
    );
  }

  return {
    component,

    instructor_id:
      reportData
        ?.instructor_id
      ??
      null,

    occurrence_date:
      occurrenceDate,

    subject,

    description,
  };
}


/*
|--------------------------------------------------------------------------
| Create Report FormData
|--------------------------------------------------------------------------
*/

function createReportFormData(
  reportData,
  attachment = null
) {
  const normalized =
    validateStudentReportPayload(
      reportData
    );

  const formData =
    new FormData();

  formData.append(
    'component',
    normalized.component
  );

  if (
    normalized
      .instructor_id !==
      null
    &&
    normalized
      .instructor_id !==
      undefined
    &&
    normalized
      .instructor_id !==
      ''
  ) {
    formData.append(
      'instructor_id',
      String(
        normalized
          .instructor_id
      )
    );
  }

  formData.append(
    'occurrence_date',
    normalized
      .occurrence_date
  );

  formData.append(
    'subject',
    normalized.subject
  );

  formData.append(
    'description',
    normalized.description
  );

  if (
    attachment?.uri
  ) {
    formData.append(
      'attachment',
      {
        uri:
          attachment.uri,

        name:
          attachment.name
          ||
          `nstp-report-${Date.now()}`,

        type:
          attachment.mimeType
          ||
          'application/octet-stream',
      }
    );
  }

  return formData;
}


/*
|--------------------------------------------------------------------------
| Create Student Report
|--------------------------------------------------------------------------
*/

export async function createStudentReport(
  reportData,
  attachment = null
) {
  if (
    !API_ENDPOINTS
      ?.REPORTS
  ) {
    throw new Error(
      'The NSTP HUB reports API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      API_ENDPOINTS.REPORTS,
      {
        method:
          'POST',

        body:
          createReportFormData(
            reportData,
            attachment
          ),
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to submit your report.'
    );
  }

  return {
    ...data,

    report:
      normalizeStudentReport(
        data?.report
      ),
  };
}


/*
|--------------------------------------------------------------------------
| Update Student Report
|--------------------------------------------------------------------------
*/

export async function updateStudentReport(
  reportId,
  reportData,
  attachment = null
) {
  if (
    reportId ===
      null
    ||
    reportId ===
      undefined
    ||
    reportId ===
      ''
  ) {
    throw new Error(
      'Report ID is required.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.REPORTS
  ) {
    throw new Error(
      'The NSTP HUB reports API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      `${API_ENDPOINTS.REPORTS}/${encodeURIComponent(
        reportId
      )}`,
      {
        method:
          'POST',

        body:
          createReportFormData(
            reportData,
            attachment
          ),
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to update your report.'
    );
  }

  return {
    ...data,

    report:
      normalizeStudentReport(
        data?.report
      ),
  };
}


/*
|--------------------------------------------------------------------------
| Delete Student Report
|--------------------------------------------------------------------------
*/

export async function deleteStudentReport(
  reportId
) {
  if (
    reportId ===
      null
    ||
    reportId ===
      undefined
    ||
    reportId ===
      ''
  ) {
    throw new Error(
      'Report ID is required.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.REPORTS
  ) {
    throw new Error(
      'The NSTP HUB reports API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      `${API_ENDPOINTS.REPORTS}/${encodeURIComponent(
        reportId
      )}`,
      {
        method:
          'DELETE',
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to delete your report.'
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Excuse Letter Helpers
|--------------------------------------------------------------------------
*/

function normalizeExcuseLetterStatus(
  value
) {
  const status =
    upper(
      value
    );

  if (
    [
      'PENDING',
      'APPROVED',
      'REJECTED',
    ].includes(
      status
    )
  ) {
    return status;
  }

  return (
    status ||
    'PENDING'
  );
}


function normalizeStudentExcuseLetter(
  letter
) {
  if (
    !letter
    ||
    typeof letter !==
      'object'
  ) {
    return null;
  }

  const status =
    normalizeExcuseLetterStatus(
      letter?.status
    );

  const evidenceUrl =
    letter?.evidence_url
    ??
    letter?.evidenceUri
    ??
    null;

  return {
    ...letter,

    id:
      letter?.id,

    section:
      clean(
        letter?.section
        ??
        (
          status ===
          'PENDING'
            ? 'recent'
            : 'history'
        )
      ).toLowerCase(),

    user_id:
      letter?.user_id
      ??
      null,

    university_id:
      letter?.university_id
      ??
      null,

    name:
      clean(
        letter?.name
        ??
        letter?.student_name,
        'NSTP Student'
      ),

    studentId:
      clean(
        letter?.studentId
        ??
        letter
          ?.student_id_number
      )
      ||
      null,

    student_id_number:
      clean(
        letter
          ?.student_id_number
        ??
        letter?.studentId
      )
      ||
      null,

    profile_photo_url:
      letter
        ?.profile_photo_url
      ??
      null,

    date:
      clean(
        letter?.date
      )
      ||
      null,

    created_at:
      letter?.created_at
      ??
      null,

    absenceDate:
      clean(
        letter?.absenceDate
      )
      ||
      null,

    absence_date:
      letter?.absence_date
      ??
      null,

    component:
      upper(
        letter?.component
      ),

    instructor_id:
      letter?.instructor_id
      ??
      null,

    instructor_name:
      clean(
        letter
          ?.instructor_name
        ??
        letter?.instructor
      )
      ||
      null,

    reason:
      clean(
        letter?.reason
      ),

    explanation:
      clean(
        letter?.explanation
      ),

    status,

    feedback:
      letter?.feedback
      ??
      null,

    evidence_url:
      evidenceUrl,

    evidenceUri:
      evidenceUrl,

    attachmentName:
      clean(
        letter?.attachmentName
        ??
        letter
          ?.evidence_original_name
      )
      ||
      null,

    evidence_original_name:
      clean(
        letter
          ?.evidence_original_name
        ??
        letter?.attachmentName
      )
      ||
      null,

    evidence_mime_type:
      letter
        ?.evidence_mime_type
      ??
      null,

    evidence_size:
      letter?.evidence_size !==
        null
      &&
      letter?.evidence_size !==
        undefined
        ? Number(
            letter
              .evidence_size
          )
        : null,

    reviewer_name:
      clean(
        letter?.reviewer_name
      )
      ||
      null,

    reviewer_role:
      clean(
        letter?.reviewer_role
      )
      ||
      null,

    reviewed_at:
      letter?.reviewed_at
      ??
      null,

    can_edit:
      letter?.can_edit ===
        true
      ||
      (
        letter?.can_edit ===
          undefined
        &&
        status ===
          'PENDING'
      ),

    can_delete:
      letter?.can_delete ===
        true
      ||
      (
        letter?.can_delete ===
          undefined
        &&
        status ===
          'PENDING'
      ),
  };
}


/*
|--------------------------------------------------------------------------
| Get Student Excuse Letters
|--------------------------------------------------------------------------
*/

export async function getStudentExcuseLetters() {
  if (
    !API_ENDPOINTS
      ?.EXCUSE_LETTERS
  ) {
    throw new Error(
      'The NSTP HUB excuse letter API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      API_ENDPOINTS
        .EXCUSE_LETTERS
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel did not return your excuse letters.'
    );
  }

  const letters =
    Array.isArray(
      data?.letters
    )
      ? data.letters
          .map(
            normalizeStudentExcuseLetter
          )
          .filter(
            Boolean
          )
      : [];

  const instructors =
    Array.isArray(
      data?.instructors
    )
      ? data.instructors
          .map(
            normalizeInstructor
          )
          .filter(
            Boolean
          )
      : [];

  const student = {
    ...(
      data?.student
      ??
      {}
    ),

    id:
      data
        ?.student
        ?.id
      ??
      null,

    student_id_number:
      clean(
        data
          ?.student
          ?.student_id_number
      )
      ||
      null,

    full_name:
      clean(
        data
          ?.student
          ?.full_name,
        'NSTP Student'
      ),

    email:
      clean(
        data
          ?.student
          ?.email
      )
      ||
      null,

    component:
      upper(
        data
          ?.student
          ?.component
      )
      ||
      null,

    status:
      upper(
        data
          ?.student
          ?.status
      )
      ||
      null,

    profile_photo_url:
      data
        ?.student
        ?.profile_photo_url
      ??
      null,
  };

  return {
    ...data,

    student,

    university:
      data?.university
      ??
      null,

    allowed_components:
      normalizeAllowedComponents(
        data
          ?.allowed_components
      ),

    instructors,

    summary: {
      total:
        Number(
          data
            ?.summary
            ?.total
          ??
          letters.length
        ),

      pending:
        Number(
          data
            ?.summary
            ?.pending
          ??
          letters.filter(
            letter =>
              letter.status ===
              'PENDING'
          ).length
        ),

      approved:
        Number(
          data
            ?.summary
            ?.approved
          ??
          letters.filter(
            letter =>
              letter.status ===
              'APPROVED'
          ).length
        ),

      rejected:
        Number(
          data
            ?.summary
            ?.rejected
          ??
          letters.filter(
            letter =>
              letter.status ===
              'REJECTED'
          ).length
        ),
    },

    letters,
  };
}


/*
|--------------------------------------------------------------------------
| Validate Student Excuse Letter
|--------------------------------------------------------------------------
*/

function validateStudentExcuseLetterPayload(
  excuseLetterData
) {
  requireObjectPayload(
    excuseLetterData,
    'Excuse letter information is required.'
  );

  const component =
    upper(
      excuseLetterData
        ?.component
    );

  if (
    ![
      'CWTS',
      'LTS',
      'ROTC',
    ].includes(
      component
    )
  ) {
    throw new Error(
      'Please select a valid NSTP component.'
    );
  }

  const absenceDate =
    clean(
      excuseLetterData
        ?.absence_date
    );

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      absenceDate
    )
  ) {
    throw new Error(
      'Excuse letter absence date must use YYYY-MM-DD format.'
    );
  }

  const reason =
    clean(
      excuseLetterData
        ?.reason
    );

  if (
    reason.length <
    2
  ) {
    throw new Error(
      'Please enter your reason for absence.'
    );
  }

  const explanation =
    clean(
      excuseLetterData
        ?.explanation
    );

  if (
    explanation.length <
    10
  ) {
    throw new Error(
      'Please provide a clear explanation with at least 10 characters.'
    );
  }

  const instructorId =
    excuseLetterData
      ?.instructor_id;

  return {
    component,

    instructor_id:
      instructorId ===
        null
      ||
      instructorId ===
        undefined
      ||
      instructorId ===
        ''
        ? null
        : instructorId,

    absence_date:
      absenceDate,

    reason,

    explanation,

    remove_evidence:
      excuseLetterData
        ?.remove_evidence ===
      true,
  };
}


/*
|--------------------------------------------------------------------------
| Guess Excuse Letter MIME Type
|--------------------------------------------------------------------------
*/

function guessExcuseLetterMimeType(
  file
) {
  const direct =
    clean(
      file?.mimeType
      ??
      file?.type
    );

  if (
    direct
    &&
    direct !==
      'application/octet-stream'
  ) {
    return direct;
  }

  const name =
    clean(
      file?.name
    ).toLowerCase();

  if (
    name.endsWith(
      '.jpg'
    )
    ||
    name.endsWith(
      '.jpeg'
    )
  ) {
    return 'image/jpeg';
  }

  if (
    name.endsWith(
      '.png'
    )
  ) {
    return 'image/png';
  }

  if (
    name.endsWith(
      '.webp'
    )
  ) {
    return 'image/webp';
  }

  if (
    name.endsWith(
      '.pdf'
    )
  ) {
    return 'application/pdf';
  }

  return 'application/octet-stream';
}


/*
|--------------------------------------------------------------------------
| Create Excuse Letter FormData
|--------------------------------------------------------------------------
*/

function createExcuseLetterFormData(
  excuseLetterData,
  evidence = null
) {
  const normalized =
    validateStudentExcuseLetterPayload(
      excuseLetterData
    );

  const formData =
    new FormData();

  formData.append(
    'component',
    normalized.component
  );

  if (
    normalized
      .instructor_id !==
    null
  ) {
    formData.append(
      'instructor_id',
      String(
        normalized
          .instructor_id
      )
    );
  }

  formData.append(
    'absence_date',
    normalized
      .absence_date
  );

  formData.append(
    'reason',
    normalized.reason
  );

  formData.append(
    'explanation',
    normalized.explanation
  );

  formData.append(
    'remove_evidence',
    normalized
      .remove_evidence
      ? '1'
      : '0'
  );

  if (
    evidence?.uri
  ) {
    const fileName =
      evidence?.name
      ||
      `nstp-excuse-evidence-${Date.now()}.jpg`;

    formData.append(
      'evidence',
      {
        uri:
          evidence.uri,

        name:
          fileName,

        type:
          guessExcuseLetterMimeType({
            ...evidence,

            name:
              fileName,
          }),
      }
    );
  }

  return formData;
}


/*
|--------------------------------------------------------------------------
| Create Student Excuse Letter
|--------------------------------------------------------------------------
*/

export async function createStudentExcuseLetter(
  excuseLetterData,
  evidence = null
) {
  if (
    !API_ENDPOINTS
      ?.EXCUSE_LETTERS
  ) {
    throw new Error(
      'The NSTP HUB excuse letter API endpoint is not configured.'
    );
  }

  if (
    !evidence?.uri
  ) {
    throw new Error(
      'Please attach verifiable supporting evidence.'
    );
  }

  const data =
    await authenticatedRequest(
      API_ENDPOINTS
        .EXCUSE_LETTERS,
      {
        method:
          'POST',

        body:
          createExcuseLetterFormData(
            excuseLetterData,
            evidence
          ),
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to submit your excuse letter.'
    );
  }

  return {
    ...data,

    letter:
      normalizeStudentExcuseLetter(
        data?.letter
      ),
  };
}


/*
|--------------------------------------------------------------------------
| Update Student Excuse Letter
|--------------------------------------------------------------------------
*/

export async function updateStudentExcuseLetter(
  excuseLetterId,
  excuseLetterData,
  evidence = null
) {
  if (
    excuseLetterId ===
      null
    ||
    excuseLetterId ===
      undefined
    ||
    excuseLetterId ===
      ''
  ) {
    throw new Error(
      'Excuse letter ID is required.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.EXCUSE_LETTERS
  ) {
    throw new Error(
      'The NSTP HUB excuse letter API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      `${API_ENDPOINTS.EXCUSE_LETTERS}/${encodeURIComponent(
        excuseLetterId
      )}`,
      {
        method:
          'POST',

        body:
          createExcuseLetterFormData(
            excuseLetterData,
            evidence
          ),
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to update your excuse letter.'
    );
  }

  return {
    ...data,

    letter:
      normalizeStudentExcuseLetter(
        data?.letter
      ),
  };
}


/*
|--------------------------------------------------------------------------
| Delete Student Excuse Letter
|--------------------------------------------------------------------------
*/

export async function deleteStudentExcuseLetter(
  excuseLetterId
) {
  if (
    excuseLetterId ===
      null
    ||
    excuseLetterId ===
      undefined
    ||
    excuseLetterId ===
      ''
  ) {
    throw new Error(
      'Excuse letter ID is required.'
    );
  }

  if (
    !API_ENDPOINTS
      ?.EXCUSE_LETTERS
  ) {
    throw new Error(
      'The NSTP HUB excuse letter API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      `${API_ENDPOINTS.EXCUSE_LETTERS}/${encodeURIComponent(
        excuseLetterId
      )}`,
      {
        method:
          'DELETE',
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to delete your excuse letter.'
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| Digital Student ID
|--------------------------------------------------------------------------
*/

export async function getDigitalStudentId() {
  const data =
    await authenticatedRequest(
      API_ENDPOINTS
        .DIGITAL_STUDENT_ID
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel did not return your Digital Student ID.'
    );
  }

  if (
    !data?.student
  ) {
    throw new Error(
      'Laravel did not return student information for the Digital Student ID.'
    );
  }

  if (
    !data?.university
  ) {
    throw new Error(
      'Laravel did not return university information for the Digital Student ID.'
    );
  }

  return {
    ...data,

    credentials_ready:
      data
        ?.credentials_ready ===
      true,

    qr_available:
      data
        ?.qr_available ===
      true,

    qr_code_url:
      data?.qr_code_url
      ||
      (
        data
          ?.qr_available ===
        true
          ? API_ENDPOINTS
              .DIGITAL_STUDENT_ID_QR_CODE
          : null
      ),

    student: {
      ...data.student,

      student_id_number:
        clean(
          data
            ?.student
            ?.student_id_number
        )
        ||
        null,

      component:
        upper(
          data
            ?.student
            ?.component
        ),
    },
  };
}


/*
|--------------------------------------------------------------------------
| Digital Student ID QR Source
|--------------------------------------------------------------------------
*/

export async function getDigitalStudentIdQrSource(
  qrCodeUrl = null
) {
  const token =
    await requireToken();

  const url =
    clean(
      qrCodeUrl
      ??
      API_ENDPOINTS
        .DIGITAL_STUDENT_ID_QR_CODE
    );

  if (
    !url
  ) {
    throw new Error(
      'The Digital Student ID QR endpoint is missing.'
    );
  }

  return {
    uri:
      url,

    headers: {
      Accept:
        'image/png',

      Authorization:
        `Bearer ${token}`,

      'Cache-Control':
        'no-cache',
    },

    cache:
      'reload',
  };
}


export function getDigitalStudentIdQrUrl() {
  return (
    API_ENDPOINTS
      .DIGITAL_STUDENT_ID_QR_CODE
    ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| Normalize Student Profile
|--------------------------------------------------------------------------
*/

function normalizeStudentProfileResponse(
  data
) {
  if (
    !data
    ||
    typeof data !==
      'object'
    ||
    Array.isArray(
      data
    )
  ) {
    throw new Error(
      'Laravel did not return your student profile information.'
    );
  }

  if (
    data?.success ===
    false
  ) {
    throw new Error(
      data?.message
      ||
      'Laravel could not load your student profile.'
    );
  }

  if (
    !data?.student
  ) {
    throw new Error(
      'Laravel did not return the student information.'
    );
  }

  if (
    !data?.profile
  ) {
    throw new Error(
      'Laravel did not return the student profile information.'
    );
  }

  const component =
    upper(
      data?.component
      ??
      data
        ?.student
        ?.component
    );

  const isRotc =
    data?.is_rotc ===
      true
    ||
    component ===
      'ROTC';

  const features = {
    military_science_records:
      data
        ?.features
        ?.military_science_records ===
      true
      ||
      isRotc,

    advance_course:
      data
        ?.features
        ?.advance_course ===
      true
      ||
      isRotc,
  };

  return {
    ...data,

    component:
      component
      ||
      null,

    is_rotc:
      isRotc,

    features,

    student: {
      ...data.student,

      id:
        data
          ?.student
          ?.id
        ??
        null,

      student_id_number:
        clean(
          data
            ?.student
            ?.student_id_number
        )
        ||
        null,

      full_name:
        clean(
          data
            ?.student
            ?.full_name,
          'NSTP Student'
        ),

      email:
        clean(
          data
            ?.student
            ?.email
        )
        ||
        null,

      subject:
        clean(
          data
            ?.student
            ?.subject
        )
        ||
        null,

      term:
        clean(
          data
            ?.student
            ?.term
        )
        ||
        null,

      component:
        component
        ||
        null,

      course:
        clean(
          data
            ?.student
            ?.course
        )
        ||
        null,

      year_level:
        clean(
          data
            ?.student
            ?.year_level
        )
        ||
        null,

      section:
        clean(
          data
            ?.student
            ?.section
        )
        ||
        null,

      profile_photo_url:
        data
          ?.student
          ?.profile_photo_url
        ??
        null,

      signature_url:
        data
          ?.student
          ?.signature_url
        ??
        null,

      signature_data_uri:
        data
          ?.student
          ?.signature_data_uri
        ??
        null,

      signature_svg:
        data
          ?.student
          ?.signature_svg
        ??
        null,
    },

    profile: {
      ...data.profile,

      profile_type:
        upper(
          data
            ?.profile
            ?.profile_type,
          isRotc
            ? 'ROTC'
            : 'GENERAL'
        ),

      id:
        data
          ?.profile
          ?.id
        ??
        null,

      user_id:
        data
          ?.profile
          ?.user_id
        ??
        null,

      nstp_id_no:
        clean(
          data
            ?.profile
            ?.nstp_id_no
        )
        ||
        null,

      ms_level:
        isRotc
          ? clean(
              data
                ?.profile
                ?.ms_level,
              'MS 1'
            )
          : null,

      last_name:
        clean(
          data
            ?.profile
            ?.last_name
        ),

      first_name:
        clean(
          data
            ?.profile
            ?.first_name
        ),

      middle_name:
        clean(
          data
            ?.profile
            ?.middle_name
        )
        ||
        null,

      name_extension:
        clean(
          data
            ?.profile
            ?.name_extension
        )
        ||
        null,

      gender:
        clean(
          data
            ?.profile
            ?.gender
        )
        ||
        null,

      blood_type:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.blood_type
              )
              ||
              null
            )
          : null,

      date_of_birth:
        data
          ?.profile
          ?.date_of_birth
        ??
        null,

      place_of_birth:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.place_of_birth
              )
              ||
              null
            )
          : null,

      height_cm:
        isRotc
          ? (
              data
                ?.profile
                ?.height_cm
              ??
              null
            )
          : null,

      weight_kg:
        isRotc
          ? (
              data
                ?.profile
                ?.weight_kg
              ??
              null
            )
          : null,

      complexion:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.complexion
              )
              ||
              null
            )
          : null,

      school_name:
        clean(
          data
            ?.profile
            ?.school_name
        )
        ||
        null,

      course:
        clean(
          data
            ?.profile
            ?.course
        )
        ||
        null,

      religion:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.religion
              )
              ||
              null
            )
          : null,

      cellphone_number:
        clean(
          data
            ?.profile
            ?.cellphone_number
        )
        ||
        null,

      contact_email:
        clean(
          data
            ?.profile
            ?.contact_email
        )
        ||
        null,

      temporary_address_line:
        clean(
          data
            ?.profile
            ?.temporary_address_line
        )
        ||
        null,

      temporary_municipality:
        clean(
          data
            ?.profile
            ?.temporary_municipality
        )
        ||
        null,

      temporary_province:
        clean(
          data
            ?.profile
            ?.temporary_province
        )
        ||
        null,

      permanent_same_as_temporary:
        data
          ?.profile
          ?.permanent_same_as_temporary ===
        true,

      permanent_address_line:
        clean(
          data
            ?.profile
            ?.permanent_address_line
        )
        ||
        null,

      permanent_municipality:
        clean(
          data
            ?.profile
            ?.permanent_municipality
        )
        ||
        null,

      permanent_province:
        clean(
          data
            ?.profile
            ?.permanent_province
        )
        ||
        null,

      father_name:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.father_name
              )
              ||
              null
            )
          : null,

      father_occupation:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.father_occupation
              )
              ||
              null
            )
          : null,

      mother_name:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.mother_name
              )
              ||
              null
            )
          : null,

      mother_occupation:
        isRotc
          ? (
              clean(
                data
                  ?.profile
                  ?.mother_occupation
              )
              ||
              null
            )
          : null,

      emergency_contact_name:
        clean(
          data
            ?.profile
            ?.emergency_contact_name
        )
        ||
        null,

      emergency_contact_relationship:
        clean(
          data
            ?.profile
            ?.emergency_contact_relationship
        )
        ||
        null,

      emergency_contact_number:
        clean(
          data
            ?.profile
            ?.emergency_contact_number
        )
        ||
        null,

      emergency_contact_address:
        clean(
          data
            ?.profile
            ?.emergency_contact_address
        )
        ||
        null,

      willing_advance_course:
        isRotc
          &&
          data
            ?.profile
            ?.willing_advance_course ===
          true,

      status:
        isRotc
          ? (
              upper(
                data
                  ?.profile
                  ?.status
              )
              ||
              null
            )
          : null,

      submitted_at:
        isRotc
          ? (
              data
                ?.profile
                ?.submitted_at
              ??
              null
            )
          : null,

      completed_at:
        isRotc
          ? (
              data
                ?.profile
                ?.completed_at
              ??
              null
            )
          : null,
    },

    ms_records:
      isRotc
      &&
      Array.isArray(
        data?.ms_records
      )
        ? data.ms_records
        : [],
  };
}


/*
|--------------------------------------------------------------------------
| Student Profile Endpoints
|--------------------------------------------------------------------------
*/

function getStudentProfileEndpoint() {
  return (
    API_ENDPOINTS
      ?.PROFILE
    ||
    API_ENDPOINTS
      ?.ROTC_PROFILE
    ||
    null
  );
}


function getStudentProfileSignatureEndpoint() {
  return (
    API_ENDPOINTS
      ?.PROFILE_SIGNATURE
    ||
    API_ENDPOINTS
      ?.ROTC_PROFILE_SIGNATURE
    ||
    null
  );
}


function getStudentProfilePhotoEndpoint() {
  return (
    API_ENDPOINTS
      ?.PROFILE_PHOTO
    ||
    API_ENDPOINTS
      ?.ROTC_PROFILE_PHOTO
    ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| Get Student Profile
|--------------------------------------------------------------------------
*/

export async function getStudentProfile() {
  const endpoint =
    getStudentProfileEndpoint();

  if (
    !endpoint
  ) {
    throw new Error(
      'The NSTP HUB student profile API endpoint is not configured.'
    );
  }

  const data =
    await authenticatedRequest(
      endpoint
    );

  return normalizeStudentProfileResponse(
    data
  );
}


/*
|--------------------------------------------------------------------------
| Update Student Profile
|--------------------------------------------------------------------------
*/

export async function updateStudentProfile(
  profileData
) {
  requireObjectPayload(
    profileData,
    'Student profile information is required.'
  );

  const endpoint =
    getStudentProfileEndpoint();

  if (
    !endpoint
  ) {
    throw new Error(
      'The NSTP HUB student profile API endpoint is not configured.'
    );
  }

  const lastName =
    clean(
      profileData
        ?.last_name
    );

  const firstName =
    clean(
      profileData
        ?.first_name
    );

  if (
    !lastName
  ) {
    throw new Error(
      'Last name is required.'
    );
  }

  if (
    !firstName
  ) {
    throw new Error(
      'First name is required.'
    );
  }

  const data =
    await authenticatedRequest(
      endpoint,
      {
        method:
          'PUT',

        body: {
          ...profileData,

          last_name:
            lastName,

          first_name:
            firstName,
        },
      }
    );

  return normalizeStudentProfileResponse(
    data
  );
}


/*
|--------------------------------------------------------------------------
| Guess Student Profile Image MIME Type
|--------------------------------------------------------------------------
*/

function guessStudentProfileImageMimeType(
  file,
  fallback = 'image/jpeg'
) {
  const direct =
    clean(
      file?.mimeType
      ??
      file?.type
    )
      .toLowerCase();

  if (
    [
      'image/jpeg',
      'image/png',
      'image/webp',
    ].includes(
      direct
    )
  ) {
    return direct;
  }

  const fileName =
    clean(
      file?.name
      ??
      file?.fileName
    )
      .toLowerCase();

  if (
    fileName.endsWith(
      '.png'
    )
  ) {
    return 'image/png';
  }

  if (
    fileName.endsWith(
      '.webp'
    )
  ) {
    return 'image/webp';
  }

  if (
    fileName.endsWith(
      '.jpg'
    )
    ||
    fileName.endsWith(
      '.jpeg'
    )
  ) {
    return 'image/jpeg';
  }

  return fallback;
}


/*
|--------------------------------------------------------------------------
| Normalize Student Signature Paths
|--------------------------------------------------------------------------
*/

function normalizeStudentSignaturePaths(
  paths
) {
  if (
    !Array.isArray(
      paths
    )
  ) {
    return [];
  }

  return paths
    .map(
      path =>
        clean(
          path
        )
    )
    .filter(
      Boolean
    );
}


/*
|--------------------------------------------------------------------------
| Update Student Signature
|--------------------------------------------------------------------------
*/

export async function updateStudentSignature(
  signature
) {
  const endpoint =
    getStudentProfileSignatureEndpoint();

  if (
    !endpoint
  ) {
    throw new Error(
      'The NSTP HUB student signature API endpoint is not configured.'
    );
  }

  const paths =
    normalizeStudentSignaturePaths(
      Array.isArray(
        signature
      )
        ? signature
        : signature?.paths
    );

  /*
  |--------------------------------------------------------------------------
  | SVG Path Signature
  |--------------------------------------------------------------------------
  */

  if (
    paths.length >
    0
  ) {
    const data =
      await authenticatedRequest(
        endpoint,
        {
          method:
            'POST',

          body: {
            paths,
          },
        }
      );

    if (
      !data
      ||
      data?.success ===
        false
    ) {
      throw new Error(
        data?.message
        ||
        'Unable to update your digital signature.'
      );
    }

    return {
      ...data,

      signature_svg:
        data
          ?.signature_svg
        ??
        null,

      signature_data_uri:
        data
          ?.signature_data_uri
        ??
        null,

      signature_url:
        data
          ?.signature_url
        ??
        null,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Image Signature Compatibility
  |--------------------------------------------------------------------------
  */

  if (
    !signature?.uri
  ) {
    throw new Error(
      'Please draw your digital signature before saving.'
    );
  }

  const fileName =
    clean(
      signature?.name
      ??
      signature?.fileName
    )
    ||
    `student-signature-${Date.now()}.png`;

  const formData =
    new FormData();

  formData.append(
    'signature',
    {
      uri:
        signature.uri,

      name:
        fileName,

      type:
        guessStudentProfileImageMimeType(
          {
            ...signature,

            name:
              fileName,
          },
          'image/png'
        ),
    }
  );

  const data =
    await authenticatedRequest(
      endpoint,
      {
        method:
          'POST',

        body:
          formData,
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to update your digital signature.'
    );
  }

  return {
    ...data,

    signature_svg:
      data
        ?.signature_svg
      ??
      null,

    signature_data_uri:
      data
        ?.signature_data_uri
      ??
      null,

    signature_url:
      data
        ?.signature_url
      ??
      null,
  };
}


/*
|--------------------------------------------------------------------------
| Update Student Signature Paths
|--------------------------------------------------------------------------
*/

export async function updateStudentSignaturePaths(
  paths
) {
  const normalizedPaths =
    normalizeStudentSignaturePaths(
      paths
    );

  if (
    normalizedPaths.length ===
    0
  ) {
    throw new Error(
      'Please draw your digital signature before saving.'
    );
  }

  return updateStudentSignature(
    normalizedPaths
  );
}


/*
|--------------------------------------------------------------------------
| Update Student Profile Photo
|--------------------------------------------------------------------------
*/

export async function updateStudentProfilePhoto(
  photo
) {
  const endpoint =
    getStudentProfilePhotoEndpoint();

  if (
    !endpoint
  ) {
    throw new Error(
      'The NSTP HUB profile photo API endpoint is not configured.'
    );
  }

  if (
    !photo?.uri
  ) {
    throw new Error(
      'Please select a profile photo.'
    );
  }

  const fileName =
    clean(
      photo?.name
      ??
      photo?.fileName
    )
    ||
    `student-profile-${Date.now()}.jpg`;

  const formData =
    new FormData();

  formData.append(
    'profile_photo',
    {
      uri:
        photo.uri,

      name:
        fileName,

      type:
        guessStudentProfileImageMimeType({
          ...photo,

          name:
            fileName,
        }),
    }
  );

  const data =
    await authenticatedRequest(
      endpoint,
      {
        method:
          'POST',

        body:
          formData,
      }
    );

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to update your profile photo.'
    );
  }

  return {
    ...data,

    profile_photo_url:
      data
        ?.profile_photo_url
      ??
      null,
  };
}


/*
|--------------------------------------------------------------------------
| ROTC Profile Compatibility
|--------------------------------------------------------------------------
*/

export async function getRotcProfile() {
  return getStudentProfile();
}


export async function updateRotcProfile(
  profileData
) {
  return updateStudentProfile(
    profileData
  );
}


export async function updateRotcProfileSignature(
  signature
) {
  return updateStudentSignature(
    signature
  );
}


export async function updateRotcProfilePhoto(
  photo
) {
  return updateStudentProfilePhoto(
    photo
  );
}


export async function getStudentRotcProfile() {
  return getStudentProfile();
}


export async function updateStudentRotcProfile(
  profileData
) {
  return updateStudentProfile(
    profileData
  );
}


export async function updateStudentRotcProfileSignature(
  signature
) {
  return updateStudentSignature(
    signature
  );
}


export async function updateStudentRotcProfilePhoto(
  photo
) {
  return updateStudentProfilePhoto(
    photo
  );
}


export async function getRotcStudentProfile() {
  return getStudentProfile();
}


export async function updateRotcStudentProfile(
  profileData
) {
  return updateStudentProfile(
    profileData
  );
}


export async function updateRotcStudentSignature(
  signature
) {
  return updateStudentSignature(
    signature
  );
}


export async function updateRotcStudentProfilePhoto(
  photo
) {
  return updateStudentProfilePhoto(
    photo
  );
}


/*
|--------------------------------------------------------------------------
| General Registration
|--------------------------------------------------------------------------
*/

export async function getGeneralRegistration() {
  return authenticatedRequest(
    API_ENDPOINTS
      .GENERAL_REGISTRATION
  );
}


export async function saveGeneralRegistration(
  registrationData
) {
  requireObjectPayload(
    registrationData,
    'General registration information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .GENERAL_REGISTRATION,
    {
      method:
        'POST',

      body:
        registrationData,
    }
  );
}


export async function updateGeneralRegistration(
  registrationData
) {
  requireObjectPayload(
    registrationData,
    'General registration information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .GENERAL_REGISTRATION,
    {
      method:
        'PUT',

      body:
        registrationData,
    }
  );
}


/*
|--------------------------------------------------------------------------
| General Registration Signature
|--------------------------------------------------------------------------
*/

export async function submitGeneralRegistrationSignature(
  paths,
  certified = true
) {
  if (
    !Array.isArray(
      paths
    )
    ||
    paths.length ===
      0
  ) {
    throw new Error(
      'Please draw your signature first.'
    );
  }

  if (
    certified !==
    true
  ) {
    throw new Error(
      'Please certify that the signature belongs to you.'
    );
  }

  return authenticatedRequest(
    API_ENDPOINTS
      .GENERAL_REGISTRATION_SIGNATURE,
    {
      method:
        'POST',

      body: {
        paths,

        certified:
          true,
      },
    }
  );
}


export async function saveGeneralRegistrationSignature(
  paths,
  certified = true
) {
  return submitGeneralRegistrationSignature(
    paths,
    certified
  );
}


/*
|--------------------------------------------------------------------------
| Registration Wait / Edit
|--------------------------------------------------------------------------
*/

export async function getRegistrationWaitEdit() {
  return authenticatedRequest(
    API_ENDPOINTS
      .REGISTRATION_WAIT_EDIT
  );
}


export async function updateRegistrationComponent(
  component
) {
  const normalized =
    upper(
      component
    );

  if (
    !normalized
  ) {
    throw new Error(
      'Please choose an NSTP component.'
    );
  }

  if (
    ![
      'CWTS',
      'LTS',
      'ROTC',
    ].includes(
      normalized
    )
  ) {
    throw new Error(
      'The selected NSTP component is invalid.'
    );
  }

  return authenticatedRequest(
    API_ENDPOINTS
      .REGISTRATION_WAIT_EDIT_COMPONENT,
    {
      method:
        'PATCH',

      body: {
        component:
          normalized,
      },
    }
  );
}


export async function updateRegistrationWaitEditComponent(
  component
) {
  return updateRegistrationComponent(
    component
  );
}


/*
|--------------------------------------------------------------------------
| Registration Confirmation
|--------------------------------------------------------------------------
*/

export async function getRegistrationConfirmation() {
  return authenticatedRequest(
    API_ENDPOINTS
      .REGISTRATION_CONFIRMATION
  );
}


/*
|--------------------------------------------------------------------------
| ROTC Enrollment
|--------------------------------------------------------------------------
*/

export async function getRotcEnrollment() {
  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT
  );
}


/*
|--------------------------------------------------------------------------
| ROTC Enrollment Step One
|--------------------------------------------------------------------------
*/

export async function saveRotcEnrollmentStepOne(
  enrollmentData
) {
  requireObjectPayload(
    enrollmentData,
    'ROTC Step 1 information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_ONE,
    {
      method:
        'POST',

      body:
        enrollmentData,
    }
  );
}


export async function updateRotcEnrollmentStepOne(
  enrollmentData
) {
  requireObjectPayload(
    enrollmentData,
    'ROTC Step 1 information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_ONE,
    {
      method:
        'PUT',

      body:
        enrollmentData,
    }
  );
}


/*
|--------------------------------------------------------------------------
| ROTC Enrollment Step Two
|--------------------------------------------------------------------------
*/

export async function saveRotcEnrollmentStepTwo(
  enrollmentData
) {
  requireObjectPayload(
    enrollmentData,
    'ROTC Step 2 information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_TWO,
    {
      method:
        'POST',

      body:
        enrollmentData,
    }
  );
}


export async function updateRotcEnrollmentStepTwo(
  enrollmentData
) {
  requireObjectPayload(
    enrollmentData,
    'ROTC Step 2 information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_TWO,
    {
      method:
        'PUT',

      body:
        enrollmentData,
    }
  );
}


/*
|--------------------------------------------------------------------------
| ROTC Enrollment Step Three
|--------------------------------------------------------------------------
*/

export async function saveRotcEnrollmentStepThree(
  enrollmentData
) {
  requireObjectPayload(
    enrollmentData,
    'ROTC Step 3 information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_THREE,
    {
      method:
        'POST',

      body:
        enrollmentData,
    }
  );
}


export async function updateRotcEnrollmentStepThree(
  enrollmentData
) {
  requireObjectPayload(
    enrollmentData,
    'ROTC Step 3 information is required.'
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_THREE,
    {
      method:
        'PUT',

      body:
        enrollmentData,
    }
  );
}


/*
|--------------------------------------------------------------------------
| ROTC Enrollment Step Four Validation
|--------------------------------------------------------------------------
*/

function validateRotcStepFour(
  enrollmentData
) {
  requireObjectPayload(
    enrollmentData,
    'ROTC Step 4 information is required.'
  );

  // Previous Military Science records are optional for first-year cadets.
  // An empty list is accepted; supplied records are checked by Laravel.
  if (
    enrollmentData.ms_records !== undefined &&
    enrollmentData.ms_records !== null &&
    !Array.isArray(enrollmentData.ms_records)
  ) {
    throw new Error('MS records must be a list.');
  }

  if (
    Array.isArray(enrollmentData.ms_records) &&
    enrollmentData.ms_records.length > 8
  ) {
    throw new Error('A maximum of 8 MS records can be added.');
  }

  // Students must still answer Yes or No for the Advance Course.
  if (
    typeof enrollmentData.willing_advance_course !== 'boolean'
  ) {
    throw new Error('Please select Yes or No for the advance course.');
  }
}

/*
|--------------------------------------------------------------------------
| ROTC Enrollment Step Four
|--------------------------------------------------------------------------
*/

export async function saveRotcEnrollmentStepFour(
  enrollmentData
) {
  validateRotcStepFour(
    enrollmentData
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_FOUR,
    {
      method:
        'POST',

      body:
        enrollmentData,
    }
  );
}


export async function updateRotcEnrollmentStepFour(
  enrollmentData
) {
  validateRotcStepFour(
    enrollmentData
  );

  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_STEP_FOUR,
    {
      method:
        'PUT',

      body:
        enrollmentData,
    }
  );
}


/*
|--------------------------------------------------------------------------
| ROTC Enrollment Confirmation
|--------------------------------------------------------------------------
*/

export async function getRotcEnrollmentConfirmation() {
  return authenticatedRequest(
    API_ENDPOINTS
      .ROTC_ENROLLMENT_CONFIRMATION
  );
}


/*
|--------------------------------------------------------------------------
| Logout To Account Chooser
|--------------------------------------------------------------------------
|
| POST
|
| /api/mobile/logout-page/logout
|
| IMPORTANT:
|
| The university access token is intentionally preserved because it is used
| by the "Use another account" flow.
|
*/

export async function logoutToAccountChooser() {
  if (
    !API_ENDPOINTS
      ?.LOGOUT_PAGE_LOGOUT
  ) {
    throw new Error(
      'The NSTP HUB account chooser logout API endpoint is not configured.'
    );
  }

  const token =
    await getToken();

  /*
  |--------------------------------------------------------------------------
  | Already Signed Out
  |--------------------------------------------------------------------------
  */

  if (
    !token
  ) {
    return {
      success:
        true,

      already_logged_out:
        true,

      message:
        'You are already signed out.',

      saved_account:
        null,

      university_access_token:
        await getUniversityAccessToken(),
    };
  }

  try {
    const response =
      await apiRequest(
        API_ENDPOINTS
          .LOGOUT_PAGE_LOGOUT,
        {
          method:
            'POST',

          headers: {
            Accept:
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const data =
      await readJson(
        response
      );

    if (
      !response.ok
    ) {
      throw new Error(
        getApiError(
          data,
          'Unable to complete the NSTP HUB account chooser logout.'
        )
      );
    }

    if (
      !data
      ||
      data?.success ===
        false
    ) {
      throw new Error(
        data?.message
        ||
        'Unable to complete the NSTP HUB account chooser logout.'
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Preserve University Context
    |--------------------------------------------------------------------------
    */

    if (
      data
        ?.university_access_token
    ) {
      await saveUniversityAccessToken(
        data
          .university_access_token
      );
    }

    return data;

  } finally {
    /*
    |--------------------------------------------------------------------------
    | Clear Authentication Only
    |--------------------------------------------------------------------------
    |
    | Do not clear UNIVERSITY_ACCESS_TOKEN_KEY.
    |
    */

    await Promise.all([
      SecureStore
        .deleteItemAsync(
          TOKEN_KEY
        ),

      SecureStore
        .deleteItemAsync(
          GOOGLE_SETUP_TOKEN_KEY
        ),
    ]);
  }
}


/*
|--------------------------------------------------------------------------
| Saved Student Account Login
|--------------------------------------------------------------------------
*/

export async function loginSavedStudentAccount(
  account,
  password
) {
  if (
    !API_ENDPOINTS
      ?.LOGOUT_PAGE_LOGIN
  ) {
    throw new Error(
      'The NSTP HUB saved account login API endpoint is not configured.'
    );
  }

  requireObjectPayload(
    account,
    'Saved student account information is required.'
  );

  /*
  |--------------------------------------------------------------------------
  | Account Type
  |--------------------------------------------------------------------------
  */

  const accountType =
    clean(
      account
        ?.account_type,
      'student'
    )
      .toLowerCase();

  if (
    accountType !==
    'student'
  ) {
    throw new Error(
      'Only saved student accounts can sign in to the NSTP HUB mobile application.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Account ID
  |--------------------------------------------------------------------------
  */

  const accountId =
    Number(
      account
        ?.id
    );

  if (
    !Number.isInteger(
      accountId
    )
    ||
    accountId <=
      0
  ) {
    throw new Error(
      'Unable to identify the selected saved account.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | University ID
  |--------------------------------------------------------------------------
  */

  const universityId =
    Number(
      account
        ?.university_id
    );

  if (
    !Number.isInteger(
      universityId
    )
    ||
    universityId <=
      0
  ) {
    throw new Error(
      'Unable to identify the university for the selected saved account.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Email
  |--------------------------------------------------------------------------
  */

  const email =
    clean(
      account
        ?.email
    )
      .toLowerCase();

  if (
    !email
  ) {
    throw new Error(
      'Unable to identify the email address for the selected saved account.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Password
  |--------------------------------------------------------------------------
  |
  | Do not trim or normalize passwords.
  |
  */

  if (
    typeof password !==
      'string'
    ||
    password.length ===
      0
  ) {
    throw new Error(
      'Please enter your password.'
    );
  }

  const response =
    await apiRequest(
      API_ENDPOINTS
        .LOGOUT_PAGE_LOGIN,
      {
        method:
          'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            id:
              accountId,

            account_type:
              'student',

            email,

            university_id:
              universityId,

            password,
          }),
      }
    );

  const data =
    await readJson(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getApiError(
        data,
        'Unable to sign in to the selected saved account.'
      )
    );
  }

  if (
    !data
    ||
    data?.success ===
      false
  ) {
    throw new Error(
      data?.message
      ||
      'Unable to sign in to the selected saved account.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Sanctum Token Required
  |--------------------------------------------------------------------------
  */

  if (
    !data?.token
  ) {
    throw new Error(
      'Laravel did not return a mobile login token.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Save Authentication Session
  |--------------------------------------------------------------------------
  */

  await saveToken(
    data.token
  );

  /*
  |--------------------------------------------------------------------------
  | Clear Temporary Login Context
  |--------------------------------------------------------------------------
  */

  await Promise.all([
    SecureStore
      .deleteItemAsync(
        GOOGLE_SETUP_TOKEN_KEY
      ),

    SecureStore
      .deleteItemAsync(
        UNIVERSITY_ACCESS_TOKEN_KEY
      ),
  ]);

  return data;
}


/*
|--------------------------------------------------------------------------
| Account Chooser Compatibility Aliases
|--------------------------------------------------------------------------
*/

export async function logoutStudentToAccountChooser() {
  return logoutToAccountChooser();
}


export async function loginSavedAccount(
  account,
  password
) {
  return loginSavedStudentAccount(
    account,
    password
  );
}


/*
|--------------------------------------------------------------------------
| Legacy / Direct Logout
|--------------------------------------------------------------------------
*/

export async function logoutStudent() {
  const token =
    await getToken();

  try {
    if (
      token
    ) {
      const response =
        await apiRequest(
          API_ENDPOINTS.LOGOUT,
          {
            method:
              'POST',

            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      await readJson(
        response
      );
    }
  } catch (
    error
  ) {
    console.warn(
      'NSTP HUB Laravel logout request failed:',
      error
    );
  } finally {
    await clearMobileSession();
  }
}


/*
|--------------------------------------------------------------------------
| Clear Complete Mobile Session
|--------------------------------------------------------------------------
*/

export async function clearMobileSession() {
  await Promise.all([
    SecureStore
      .deleteItemAsync(
        TOKEN_KEY
      ),

    SecureStore
      .deleteItemAsync(
        GOOGLE_SETUP_TOKEN_KEY
      ),

    SecureStore
      .deleteItemAsync(
        UNIVERSITY_ACCESS_TOKEN_KEY
      ),
  ]);
}