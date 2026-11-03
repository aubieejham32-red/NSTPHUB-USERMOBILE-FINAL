import {
    Feather,
    Ionicons,
    MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
    router,
    Stack,
} from 'expo-router';

import {
    useRef,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    resendForgotPasswordCode,
    resetForgotPassword,
    sendForgotPasswordCode,
    verifyForgotPasswordCode,
} from '../services/api';


/*
|--------------------------------------------------------------------------
| NSTP HUB Logo
|--------------------------------------------------------------------------
*/

const NSTP_HUB_LOGO =
  require(
    '../assets/images/nstphub_logo.png'
  );


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

  placeholder: '#8C98A4',
  border: '#D8D1C4',
  softCream: '#F7F4ED',
};


/*
|--------------------------------------------------------------------------
| Steps
|--------------------------------------------------------------------------
*/

const STEP_EMAIL =
  'email';

const STEP_VERIFY =
  'verify';

const STEP_RESET =
  'reset';

const STEP_SUCCESS =
  'success';


/*
|--------------------------------------------------------------------------
| Forgot Password Screen
|--------------------------------------------------------------------------
*/

export default function ForgotPasswordScreen() {
  const [
    step,
    setStep,
  ] =
    useState(
      STEP_EMAIL
    );


  const [
    email,
    setEmail,
  ] =
    useState('');


  const [
    otp,
    setOtp,
  ] =
    useState([
      '',
      '',
      '',
      '',
      '',
      '',
    ]);


  const otpRefs =
    useRef([]);


  const [
    resetToken,
    setResetToken,
  ] =
    useState('');


  const [
    newPassword,
    setNewPassword,
  ] =
    useState('');


  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('');


  const [
    showNewPassword,
    setShowNewPassword,
  ] =
    useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    resendLoading,
    setResendLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState('');


  const [
    success,
    setSuccess,
  ] =
    useState('');


  /*
  |--------------------------------------------------------------------------
  | Values
  |--------------------------------------------------------------------------
  */

  const normalizedEmail =
    String(
      email ?? ''
    )
      .trim()
      .toLowerCase();


  const verificationCode =
    otp.join('');


  const codeComplete =
    verificationCode.length ===
    6;


  const passwordLengthValid =
    newPassword.length >=
    8;


  const passwordsMatch =
    newPassword.length >
      0
    &&
    newPassword ===
      confirmPassword;


  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const clearMessages =
    () => {
      setError('');

      setSuccess('');
    };


  const clearOtp =
    () => {
      setOtp([
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
    };


  /*
  |--------------------------------------------------------------------------
  | Send Code
  |--------------------------------------------------------------------------
  */

  const handleSendCode =
    async () => {
      if (
        loading
      ) {
        return;
      }


      clearMessages();


      if (
        !normalizedEmail
      ) {
        setError(
          'Please enter your email address.'
        );

        return;
      }


      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          normalizedEmail
        )
      ) {
        setError(
          'Please enter a valid email address.'
        );

        return;
      }


      try {
        setLoading(
          true
        );


        const data =
          await sendForgotPasswordCode(
            normalizedEmail
          );


        clearOtp();


        setResetToken(
          ''
        );


        setSuccess(
          data?.message
          ||
          'Verification code sent successfully.'
        );


        setStep(
          STEP_VERIFY
        );


        setTimeout(
          () => {
            otpRefs
              .current[0]
              ?.focus();
          },
          250
        );

      } catch (
        requestError
      ) {
        console.error(
          'Forgot password send code error:',
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to send the verification code.'
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | OTP Change
  |--------------------------------------------------------------------------
  */

  const handleOtpChange =
    (
      value,
      index
    ) => {
      clearMessages();


      const numericValue =
        String(
          value ?? ''
        )
          .replace(
            /\D/g,
            ''
          );


      /*
      |--------------------------------------------------------------------------
      | Paste Multiple Digits
      |--------------------------------------------------------------------------
      */

      if (
        numericValue.length >
        1
      ) {
        const incoming =
          numericValue
            .slice(
              0,
              6
            )
            .split('');


        const next =
          [
            '',
            '',
            '',
            '',
            '',
            '',
          ];


        incoming.forEach(
          (
            digit,
            digitIndex
          ) => {
            if (
              digitIndex <
              6
            ) {
              next[
                digitIndex
              ] =
                digit;
            }
          }
        );


        setOtp(
          next
        );


        const focusIndex =
          Math.min(
            incoming.length,
            6
          ) -
          1;


        setTimeout(
          () => {
            otpRefs
              .current[
                Math.max(
                  focusIndex,
                  0
                )
              ]
              ?.focus();
          },
          40
        );


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Single Digit
      |--------------------------------------------------------------------------
      */

      const next =
        [
          ...otp,
        ];


      next[
        index
      ] =
        numericValue
          .slice(
            0,
            1
          );


      setOtp(
        next
      );


      if (
        numericValue
        &&
        index <
        5
      ) {
        otpRefs
          .current[
            index + 1
          ]
          ?.focus();
      }
    };


  /*
  |--------------------------------------------------------------------------
  | OTP Backspace
  |--------------------------------------------------------------------------
  */

  const handleOtpKeyPress =
    (
      event,
      index
    ) => {
      if (
        event
          ?.nativeEvent
          ?.key !==
        'Backspace'
      ) {
        return;
      }


      if (
        otp[
          index
        ]
      ) {
        const next =
          [
            ...otp,
          ];


        next[
          index
        ] =
          '';


        setOtp(
          next
        );


        return;
      }


      if (
        index >
        0
      ) {
        const next =
          [
            ...otp,
          ];


        next[
          index - 1
        ] =
          '';


        setOtp(
          next
        );


        otpRefs
          .current[
            index - 1
          ]
          ?.focus();
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Verify Code
  |--------------------------------------------------------------------------
  */

  const handleVerifyCode =
    async () => {
      if (
        loading
      ) {
        return;
      }


      clearMessages();


      if (
        !codeComplete
      ) {
        setError(
          'Please enter the complete 6-digit verification code.'
        );

        return;
      }


      try {
        setLoading(
          true
        );


        const data =
          await verifyForgotPasswordCode(
            normalizedEmail,
            verificationCode
          );


        if (
          !data?.reset_token
        ) {
          throw new Error(
            'Laravel did not return a valid password reset session.'
          );
        }


        setResetToken(
          data.reset_token
        );


        setNewPassword(
          ''
        );


        setConfirmPassword(
          ''
        );


        setShowNewPassword(
          false
        );


        setShowConfirmPassword(
          false
        );


        setSuccess(
          data?.message
          ||
          'Verification successful.'
        );


        setStep(
          STEP_RESET
        );

      } catch (
        requestError
      ) {
        console.error(
          'Forgot password verify error:',
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to verify the verification code.'
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Resend Code
  |--------------------------------------------------------------------------
  */

  const handleResendCode =
    async () => {
      if (
        resendLoading
        ||
        loading
      ) {
        return;
      }


      clearMessages();


      try {
        setResendLoading(
          true
        );


        const data =
          await resendForgotPasswordCode(
            normalizedEmail
          );


        clearOtp();


        setSuccess(
          data?.message
          ||
          'A new verification code has been sent.'
        );


        setTimeout(
          () => {
            otpRefs
              .current[0]
              ?.focus();
          },
          150
        );

      } catch (
        requestError
      ) {
        console.error(
          'Forgot password resend error:',
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to resend the verification code.'
        );

      } finally {
        setResendLoading(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Reset Password
  |--------------------------------------------------------------------------
  */

  const handleResetPassword =
    async () => {
      if (
        loading
      ) {
        return;
      }


      clearMessages();


      if (
        !newPassword
      ) {
        setError(
          'Please enter your new password.'
        );

        return;
      }


      if (
        newPassword.length <
        8
      ) {
        setError(
          'Password must contain at least 8 characters.'
        );

        return;
      }


      if (
        !confirmPassword
      ) {
        setError(
          'Please confirm your new password.'
        );

        return;
      }


      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          'Passwords do not match.'
        );

        return;
      }


      if (
        !resetToken
      ) {
        setError(
          'Your password reset session has expired. Please request another verification code.'
        );

        return;
      }


      try {
        setLoading(
          true
        );


        const data =
          await resetForgotPassword(
            normalizedEmail,
            resetToken,
            newPassword,
            confirmPassword
          );


        setSuccess(
          data?.message
          ||
          'Password updated successfully.'
        );


        setResetToken(
          ''
        );


        clearOtp();


        setNewPassword(
          ''
        );


        setConfirmPassword(
          ''
        );


        setStep(
          STEP_SUCCESS
        );

      } catch (
        requestError
      ) {
        console.error(
          'Forgot password reset error:',
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to reset your password.'
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Wrong Email
  |--------------------------------------------------------------------------
  */

  const handleWrongEmail =
    () => {
      if (
        loading
        ||
        resendLoading
      ) {
        return;
      }


      clearOtp();


      setResetToken(
        ''
      );


      clearMessages();


      setStep(
        STEP_EMAIL
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Back To Login
  |--------------------------------------------------------------------------
  */

  const handleBackToLogin =
    () => {
      router.replace(
        '/LoginScreen'
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Messages
  |--------------------------------------------------------------------------
  */

  const renderMessages =
    () => {
      return (
        <>
          {
            Boolean(
              error
            )
            &&
            (
              <View
                style={[
                  styles.messageBox,
                  styles.errorBox,
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={
                    COLORS.maroon
                  }
                />


                <Text
                  style={[
                    styles.messageText,
                    styles.errorText,
                  ]}
                >
                  {
                    error
                  }
                </Text>
              </View>
            )
          }


          {
            Boolean(
              success
            )
            &&
            (
              <View
                style={[
                  styles.messageBox,
                  styles.successBox,
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color={
                    COLORS.green
                  }
                />


                <Text
                  style={[
                    styles.messageText,
                    styles.successText,
                  ]}
                >
                  {
                    success
                  }
                </Text>
              </View>
            )
          }
        </>
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Email Step
  |--------------------------------------------------------------------------
  */

  const renderEmailStep =
    () => {
      return (
        <>
          <Text
            style={
              styles.title
            }
          >
            Forgot your password?
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Enter the email associated with your NSTP student account. We'll send a 6-digit verification code to verify it's you.
          </Text>


          <View
            style={
              styles.formGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Email
            </Text>


            <View
              style={[
                styles.inputWrapper,

                Boolean(
                  error
                )
                &&
                styles.inputWrapperError,
              ]}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={21}
                color={
                  COLORS.darkTeal
                }
              />


              <TextInput
                value={
                  email
                }
                onChangeText={
                  value => {
                    setEmail(
                      value
                    );

                    clearMessages();
                  }
                }
                editable={
                  !loading
                }
                placeholder="Enter your email"
                placeholderTextColor={
                  COLORS.placeholder
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={
                  handleSendCode
                }
                style={
                  styles.textInput
                }
              />
            </View>
          </View>


          {
            renderMessages()
          }


          <TouchableOpacity
            style={[
              styles.primaryButton,

              loading
              &&
              styles.buttonDisabled,
            ]}
            activeOpacity={
              0.82
            }
            onPress={
              handleSendCode
            }
            disabled={
              loading
            }
          >
            {
              loading
                ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.white
                      }
                    />


                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Sending...
                    </Text>
                  </>
                )
                : (
                  <>
                    <MaterialCommunityIcons
                      name="email-send-outline"
                      size={20}
                      color={
                        COLORS.white
                      }
                    />


                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Send Verification Code
                    </Text>
                  </>
                )
            }
          </TouchableOpacity>


          <View
            style={
              styles.footerRow
            }
          >
            <Text
              style={
                styles.footerText
              }
            >
              Remembered it after all?
            </Text>


            <TouchableOpacity
              onPress={
                handleBackToLogin
              }
            >
              <Text
                style={
                  styles.footerLink
                }
              >
                Back to sign in
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Verify Step
  |--------------------------------------------------------------------------
  */

  const renderVerifyStep =
    () => {
      return (
        <>
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={
              handleWrongEmail
            }
            disabled={
              loading
              ||
              resendLoading
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={
                COLORS.maroon
              }
            />
          </TouchableOpacity>


          <Text
            style={
              styles.title
            }
          >
            Check your inbox
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            We sent a 6-digit code to{' '}

            <Text
              style={
                styles.emailHighlight
              }
            >
              {
                normalizedEmail
              }
            </Text>

            . Enter it below.
          </Text>


          <View
            style={
              styles.studentBadge
            }
          >
            <Ionicons
              name="school-outline"
              size={14}
              color={
                COLORS.green
              }
            />


            <Text
              style={
                styles.studentBadgeText
              }
            >
              STUDENT ACCOUNT
            </Text>
          </View>


          <View
            style={
              styles.otpContainer
            }
          >
            {
              otp.map(
                (
                  digit,
                  index
                ) => (
                  <TextInput
                    key={
                      index
                    }
                    ref={
                      ref => {
                        otpRefs
                          .current[
                            index
                          ] =
                          ref;
                      }
                    }
                    value={
                      digit
                    }
                    onChangeText={
                      value =>
                        handleOtpChange(
                          value,
                          index
                        )
                    }
                    onKeyPress={
                      event =>
                        handleOtpKeyPress(
                          event,
                          index
                        )
                    }
                    editable={
                      !loading
                      &&
                      !resendLoading
                    }
                    keyboardType="number-pad"
                    textContentType={
                      index ===
                        0
                        ? 'oneTimeCode'
                        : 'none'
                    }
                    maxLength={6}
                    selectTextOnFocus
                    style={[
                      styles.otpBox,

                      Boolean(
                        error
                      )
                      &&
                      styles.otpBoxError,
                    ]}
                  />
                )
              )
            }
          </View>


          {
            renderMessages()
          }


          <View
            style={
              styles.resendRow
            }
          >
            <Text
              style={
                styles.resendText
              }
            >
              Didn't receive the code?
            </Text>


            <TouchableOpacity
              onPress={
                handleResendCode
              }
              disabled={
                resendLoading
                ||
                loading
              }
            >
              <Text
                style={[
                  styles.resendLink,

                  (
                    resendLoading
                    ||
                    loading
                  )
                  &&
                  styles.linkDisabled,
                ]}
              >
                {
                  resendLoading
                    ? 'Sending...'
                    : 'Resend Code'
                }
              </Text>
            </TouchableOpacity>
          </View>


          <TouchableOpacity
            style={[
              styles.primaryButton,

              (
                loading
                ||
                !codeComplete
              )
              &&
              styles.buttonDisabled,
            ]}
            activeOpacity={
              0.82
            }
            onPress={
              handleVerifyCode
            }
            disabled={
              loading
              ||
              !codeComplete
            }
          >
            {
              loading
                ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.white
                      }
                    />


                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Verifying...
                    </Text>
                  </>
                )
                : (
                  <>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={
                        COLORS.white
                      }
                    />


                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Verify Code
                    </Text>
                  </>
                )
            }
          </TouchableOpacity>


          <View
            style={
              styles.footerRow
            }
          >
            <Text
              style={
                styles.footerText
              }
            >
              Entered the wrong email?
            </Text>


            <TouchableOpacity
              onPress={
                handleWrongEmail
              }
              disabled={
                loading
                ||
                resendLoading
              }
            >
              <Text
                style={
                  styles.footerLink
                }
              >
                Go back
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Reset Step
  |--------------------------------------------------------------------------
  */

  const renderResetStep =
    () => {
      return (
        <>
          <Text
            style={
              styles.title
            }
          >
            New Password
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Establish a unique account password known exclusively to you.
          </Text>


          <View
            style={
              styles.studentBadge
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={
                COLORS.green
              }
            />


            <Text
              style={
                styles.studentBadgeText
              }
            >
              EMAIL VERIFIED
            </Text>
          </View>


          <View
            style={
              styles.formGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              New Password
            </Text>


            <View
              style={[
                styles.inputWrapper,

                Boolean(
                  error
                )
                &&
                styles.inputWrapperError,
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={21}
                color={
                  COLORS.darkTeal
                }
              />


              <TextInput
                value={
                  newPassword
                }
                onChangeText={
                  value => {
                    setNewPassword(
                      value
                    );

                    clearMessages();
                  }
                }
                editable={
                  !loading
                }
                placeholder="Enter your new password"
                placeholderTextColor={
                  COLORS.placeholder
                }
                secureTextEntry={
                  !showNewPassword
                }
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                textContentType="newPassword"
                style={
                  styles.textInput
                }
              />


              <TouchableOpacity
                style={
                  styles.eyeButton
                }
                onPress={() =>
                  setShowNewPassword(
                    previous =>
                      !previous
                  )
                }
                disabled={
                  loading
                }
              >
                <Feather
                  name={
                    showNewPassword
                      ? 'eye'
                      : 'eye-off'
                  }
                  size={20}
                  color={
                    COLORS.darkTeal
                  }
                />
              </TouchableOpacity>
            </View>
          </View>


          <View
            style={
              styles.formGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Confirm Password
            </Text>


            <View
              style={[
                styles.inputWrapper,

                Boolean(
                  error
                )
                &&
                styles.inputWrapperError,
              ]}
            >
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={21}
                color={
                  COLORS.darkTeal
                }
              />


              <TextInput
                value={
                  confirmPassword
                }
                onChangeText={
                  value => {
                    setConfirmPassword(
                      value
                    );

                    clearMessages();
                  }
                }
                editable={
                  !loading
                }
                placeholder="Re-enter your password"
                placeholderTextColor={
                  COLORS.placeholder
                }
                secureTextEntry={
                  !showConfirmPassword
                }
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={
                  handleResetPassword
                }
                style={
                  styles.textInput
                }
              />


              <TouchableOpacity
                style={
                  styles.eyeButton
                }
                onPress={() =>
                  setShowConfirmPassword(
                    previous =>
                      !previous
                  )
                }
                disabled={
                  loading
                }
              >
                <Feather
                  name={
                    showConfirmPassword
                      ? 'eye'
                      : 'eye-off'
                  }
                  size={20}
                  color={
                    COLORS.darkTeal
                  }
                />
              </TouchableOpacity>
            </View>
          </View>


          <View
            style={
              styles.requirements
            }
          >
            <RequirementRow
              valid={
                passwordLengthValid
              }
              text="Password must contain at least 8 characters."
            />


            {
              confirmPassword.length >
              0
              &&
              (
                <RequirementRow
                  valid={
                    passwordsMatch
                  }
                  text="Both passwords must match."
                />
              )
            }
          </View>


          {
            renderMessages()
          }


          <TouchableOpacity
            style={[
              styles.primaryButton,

              (
                loading
                ||
                !passwordLengthValid
                ||
                !passwordsMatch
              )
              &&
              styles.buttonDisabled,
            ]}
            activeOpacity={
              0.82
            }
            onPress={
              handleResetPassword
            }
            disabled={
              loading
              ||
              !passwordLengthValid
              ||
              !passwordsMatch
            }
          >
            {
              loading
                ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.white
                      }
                    />


                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Resetting...
                    </Text>
                  </>
                )
                : (
                  <>
                    <MaterialCommunityIcons
                      name="lock-reset"
                      size={21}
                      color={
                        COLORS.white
                      }
                    />


                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Reset Password
                    </Text>
                  </>
                )
            }
          </TouchableOpacity>
        </>
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Success Step
  |--------------------------------------------------------------------------
  */

  const renderSuccessStep =
    () => {
      return (
        <View
          style={
            styles.successContent
          }
        >
          <View
            style={
              styles.successIconContainer
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={52}
              color={
                COLORS.green
              }
            />
          </View>


          <Text
            style={
              styles.title
            }
          >
            All Set
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Your password has been reset successfully. Use your new password the next time you log in to your NSTP HUB student account.
          </Text>


          <View
            style={
              styles.studentBadge
            }
          >
            <Ionicons
              name="school-outline"
              size={14}
              color={
                COLORS.green
              }
            />


            <Text
              style={
                styles.studentBadgeText
              }
            >
              STUDENT ACCOUNT
            </Text>
          </View>


          <TouchableOpacity
            style={[
              styles.primaryButton,
              styles.successContinueButton,
            ]}
            activeOpacity={
              0.82
            }
            onPress={
              handleBackToLogin
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Continue to Log in
            </Text>


            <Ionicons
              name="arrow-forward"
              size={20}
              color={
                COLORS.white
              }
            />
          </TouchableOpacity>
        </View>
      );
    };


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
    >
      <Stack.Screen
        options={{
          headerShown:
            false,

          gestureEnabled:
            step ===
            STEP_EMAIL,
        }}
      />


      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.cream
        }
      />


      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS ===
            'ios'
            ? 'padding'
            : undefined
        }
      >
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
          keyboardShouldPersistTaps="handled"
        >

          {/*
          |--------------------------------------------------------------------------
          | BRAND
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.brandContainer
            }
          >

            {/*
            |--------------------------------------------------------------------------
            | Login-Style NSTP HUB Logo
            |--------------------------------------------------------------------------
            |
            | Same logo technique as LoginScreen:
            |
            | - White outline left
            | - White outline right
            | - White outline top
            | - White outline bottom
            | - Original logo in front
            |
            */}

            <View
              style={
                styles.logoWrapper
              }
            >

              {/*
              |--------------------------------------------------------------------------
              | White Outline - Left
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_HUB_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateX:
                          -3.5,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | White Outline - Right
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_HUB_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateX:
                          3.5,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | White Outline - Top
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_HUB_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateY:
                          -3.5,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | White Outline - Bottom
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_HUB_LOGO
                }
                style={[
                  styles.logoOutline,

                  {
                    transform: [
                      {
                        translateY:
                          3.5,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  COLORS.white
                }
              />


              {/*
              |--------------------------------------------------------------------------
              | Original Logo
              |--------------------------------------------------------------------------
              */}

              <Image
                source={
                  NSTP_HUB_LOGO
                }
                style={
                  styles.logo
                }
                resizeMode="contain"
              />

            </View>


            <Text
              style={
                styles.brandName
              }
            >
              NSTP HUB
            </Text>


            <Text
              style={
                styles.brandSubtitle
              }
            >
              Student Account Recovery
            </Text>

          </View>


          {/*
          |--------------------------------------------------------------------------
          | Card
          |--------------------------------------------------------------------------
          */}

          <View
            style={
              styles.card
            }
          >
            {
              step ===
              STEP_EMAIL
              &&
              renderEmailStep()
            }


            {
              step ===
              STEP_VERIFY
              &&
              renderVerifyStep()
            }


            {
              step ===
              STEP_RESET
              &&
              renderResetStep()
            }


            {
              step ===
              STEP_SUCCESS
              &&
              renderSuccessStep()
            }
          </View>


          {/*
          |--------------------------------------------------------------------------
          | Security Notice
          |--------------------------------------------------------------------------
          */}

          {
            step !==
            STEP_SUCCESS
            &&
            (
              <View
                style={
                  styles.securityRow
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={17}
                  color={
                    COLORS.green
                  }
                />


                <Text
                  style={
                    styles.securityText
                  }
                >
                  NSTP HUB will never ask you to share your verification code with another person.
                </Text>
              </View>
            )
          }

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| Requirement Row
|--------------------------------------------------------------------------
*/

function RequirementRow({
  valid,
  text,
}) {
  return (
    <View
      style={
        styles.requirementRow
      }
    >
      <View
        style={[
          styles.requirementDot,

          valid
          &&
          styles.requirementDotValid,
        ]}
      />


      <Text
        style={[
          styles.requirementText,

          valid
          &&
          styles.requirementTextValid,
        ]}
      >
        {
          text
        }
      </Text>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    keyboardContainer: {
      flex: 1,
    },


    scrollView: {
      flex: 1,
    },


    scrollContent: {
      flexGrow: 1,

      paddingHorizontal: 20,

      paddingTop: 20,

      paddingBottom: 42,

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Brand
    |--------------------------------------------------------------------------
    */

    brandContainer: {
      alignItems:
        'center',

      marginBottom: 22,
    },


    /*
    |--------------------------------------------------------------------------
    | Bigger Login-Style Logo Wrapper
    |--------------------------------------------------------------------------
    */

    logoWrapper: {
      width: 190,

      height: 205,

      alignItems:
        'center',

      justifyContent:
        'center',

      position:
        'relative',

      marginBottom: 2,
    },


    /*
    |--------------------------------------------------------------------------
    | White Logo Outline
    |--------------------------------------------------------------------------
    |
    | LoginScreen uses the same logo multiple times with white tint.
    |
    */

    logoOutline: {
      position:
        'absolute',

      width: 154,

      height: 186,
    },


    /*
    |--------------------------------------------------------------------------
    | Original Logo
    |--------------------------------------------------------------------------
    */

    logo: {
      position:
        'absolute',

      width: 154,

      height: 186,
    },


    brandName: {
      color:
        COLORS.green,

      fontSize: 20,

      fontWeight:
        '800',

      letterSpacing: 1.2,
    },


    brandSubtitle: {
      marginTop: 3,

      color:
        COLORS.darkTeal,

      fontSize: 11,

      fontWeight:
        '500',
    },


    /*
    |--------------------------------------------------------------------------
    | Card
    |--------------------------------------------------------------------------
    */

    card: {
      width:
        '100%',

      maxWidth: 520,

      alignSelf:
        'center',

      paddingHorizontal: 22,

      paddingTop: 28,

      paddingBottom: 26,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius: 22,

      backgroundColor:
        COLORS.white,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.08,

      shadowRadius: 12,

      elevation: 4,
    },


    /*
    |--------------------------------------------------------------------------
    | Back
    |--------------------------------------------------------------------------
    */

    backButton: {
      width: 40,

      height: 40,

      marginBottom: 8,

      marginLeft: -6,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 20,

      backgroundColor:
        COLORS.softCream,
    },


    /*
    |--------------------------------------------------------------------------
    | Typography
    |--------------------------------------------------------------------------
    */

    title: {
      color:
        COLORS.maroon,

      fontSize: 28,

      lineHeight: 35,

      fontWeight:
        '800',

      marginBottom: 10,
    },


    subtitle: {
      color:
        COLORS.darkTeal,

      fontSize: 13.5,

      lineHeight: 21,

      marginBottom: 26,
    },


    emailHighlight: {
      color:
        COLORS.maroon,

      fontWeight:
        '700',
    },


    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    formGroup: {
      marginBottom: 20,
    },


    label: {
      color:
        COLORS.darkTeal,

      fontSize: 14,

      fontWeight:
        '700',

      marginBottom: 8,
    },


    inputWrapper: {
      width:
        '100%',

      minHeight: 54,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingLeft: 16,

      paddingRight: 7,

      borderWidth: 1.5,

      borderColor:
        COLORS.orange,

      borderRadius: 13,

      backgroundColor:
        COLORS.white,
    },


    inputWrapperError: {
      borderColor:
        COLORS.maroon,
    },


    textInput: {
      flex: 1,

      minWidth: 0,

      minHeight: 52,

      paddingHorizontal: 13,

      color:
        COLORS.nearBlack,

      fontSize: 14,
    },


    eyeButton: {
      width: 42,

      height: 42,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Student Badge
    |--------------------------------------------------------------------------
    */

    studentBadge: {
      alignSelf:
        'flex-start',

      minHeight: 29,

      marginTop: -10,

      marginBottom: 24,

      paddingHorizontal: 11,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 5,

      borderWidth: 1,

      borderColor:
        'rgba(88,118,28,0.25)',

      borderRadius: 999,

      backgroundColor:
        'rgba(88,118,28,0.08)',
    },


    studentBadgeText: {
      color:
        COLORS.green,

      fontSize: 9.5,

      fontWeight:
        '800',

      letterSpacing: 0.7,
    },


    /*
    |--------------------------------------------------------------------------
    | OTP
    |--------------------------------------------------------------------------
    */

    otpContainer: {
      width:
        '100%',

      marginBottom: 22,

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      gap: 6,
    },


    otpBox: {
      flex: 1,

      maxWidth: 52,

      minWidth: 38,

      height: 52,

      padding: 0,

      borderWidth: 2,

      borderColor:
        COLORS.maroon,

      borderRadius: 12,

      backgroundColor:
        COLORS.white,

      color:
        COLORS.maroon,

      fontSize: 20,

      fontWeight:
        '800',

      textAlign:
        'center',
    },


    otpBoxError: {
      borderColor:
        COLORS.maroon,

      backgroundColor:
        '#FFF9F8',
    },


    /*
    |--------------------------------------------------------------------------
    | Message
    |--------------------------------------------------------------------------
    */

    messageBox: {
      width:
        '100%',

      minHeight: 44,

      marginBottom: 17,

      paddingHorizontal: 12,

      paddingVertical: 10,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      gap: 8,

      borderRadius: 10,

      borderWidth: 1,
    },


    errorBox: {
      borderColor:
        'rgba(84,16,15,0.24)',

      backgroundColor:
        'rgba(84,16,15,0.06)',
    },


    successBox: {
      borderColor:
        'rgba(88,118,28,0.26)',

      backgroundColor:
        'rgba(88,118,28,0.08)',
    },


    messageText: {
      flex: 1,

      fontSize: 11.5,

      lineHeight: 17,

      fontWeight:
        '600',
    },


    errorText: {
      color:
        COLORS.maroon,
    },


    successText: {
      color:
        COLORS.green,
    },


    /*
    |--------------------------------------------------------------------------
    | Resend
    |--------------------------------------------------------------------------
    */

    resendRow: {
      width:
        '100%',

      marginBottom: 22,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      gap: 10,
    },


    resendText: {
      flexShrink: 1,

      color:
        COLORS.darkTeal,

      fontSize: 12,
    },


    resendLink: {
      color:
        COLORS.orange,

      fontSize: 12,

      fontWeight:
        '800',
    },


    linkDisabled: {
      opacity: 0.55,
    },


    /*
    |--------------------------------------------------------------------------
    | Primary Button
    |--------------------------------------------------------------------------
    */

    primaryButton: {
      width:
        '100%',

      minHeight: 54,

      paddingHorizontal: 18,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,

      borderRadius: 28,

      backgroundColor:
        COLORS.orange,

      shadowColor:
        COLORS.orange,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.18,

      shadowRadius: 8,

      elevation: 3,
    },


    buttonDisabled: {
      opacity: 0.55,

      shadowOpacity: 0,

      elevation: 0,
    },


    primaryButtonText: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight:
        '800',

      textAlign:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    footerRow: {
      marginTop: 25,

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 5,
    },


    footerText: {
      color:
        COLORS.darkTeal,

      fontSize: 12,
    },


    footerLink: {
      color:
        COLORS.orange,

      fontSize: 12,

      fontWeight:
        '800',

      textDecorationLine:
        'underline',
    },


    /*
    |--------------------------------------------------------------------------
    | Password Requirements
    |--------------------------------------------------------------------------
    */

    requirements: {
      marginTop: -4,

      marginBottom: 20,

      gap: 7,
    },


    requirementRow: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    requirementDot: {
      width: 8,

      height: 8,

      marginRight: 8,

      borderRadius: 4,

      backgroundColor:
        COLORS.gray,
    },


    requirementDotValid: {
      backgroundColor:
        COLORS.green,
    },


    requirementText: {
      flex: 1,

      color:
        COLORS.darkTeal,

      fontSize: 10.5,

      lineHeight: 15,
    },


    requirementTextValid: {
      color:
        COLORS.green,

      fontWeight:
        '700',
    },


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    successContent: {
      width:
        '100%',
    },


    successIconContainer: {
      width: 74,

      height: 74,

      marginBottom: 24,

      borderRadius: 37,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 2,

      borderColor:
        'rgba(88,118,28,0.24)',

      backgroundColor:
        'rgba(88,118,28,0.09)',
    },


    successContinueButton: {
      marginTop: 13,
    },


    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    */

    securityRow: {
      width:
        '100%',

      maxWidth: 480,

      alignSelf:
        'center',

      marginTop: 18,

      paddingHorizontal: 12,

      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },


    securityText: {
      flex: 1,

      marginLeft: 7,

      color:
        COLORS.darkTeal,

      fontSize: 9.5,

      lineHeight: 14,

      opacity: 0.76,
    },
  });