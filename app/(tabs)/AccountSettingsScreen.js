import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
  router,
} from 'expo-router';

import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  changeStudentPassword,
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

  border: '#C8C4B7',
  softText: '#4A4A4A',
  placeholder: '#7A8B99',

  dangerBackground: '#F9ECEB',
};


/*
|--------------------------------------------------------------------------
| LIGHT THEME
|--------------------------------------------------------------------------
*/

const LIGHT_THEME = {
  background: '#EFEBE2',

  card: 'transparent',

  surface: '#FFFFFF',

  text: '#233E47',

  softText: '#4A4A4A',

  primaryText: '#54100F',

  icon: '#233E47',

  border: '#C8C4B7',

  inputBackground: '#FFFFFF',

  placeholder: '#7A8B99',

  modalBackground: '#FFFFFF',

  modalBorder: '#B0B5B3',

  closeButtonBackground: '#EFEBE2',

  dangerBackground: '#F9ECEB',

  dangerText: '#54100F',
};


/*
|--------------------------------------------------------------------------
| DARK THEME
|--------------------------------------------------------------------------
*/

const DARK_THEME = {
  background: '#000D12',
  card: '#233E47',
  surface: '#233E47',
  text: '#EFEBE2',
  softText: '#EFEBE2',
  primaryText: '#D99202',
  icon: '#EFEBE2',
  border: '#58761C',
  inputBackground: '#233E47',
  placeholder: '#EFEBE2',
  modalBackground: '#233E47',
  modalBorder: '#EFEBE2',
  closeButtonBackground: '#000D12',
  dangerBackground: '#000D12',
  dangerText: '#D99202',
};


/*
|--------------------------------------------------------------------------
| ACCOUNT SETTINGS SCREEN
|--------------------------------------------------------------------------
*/

export default function AccountSettingsScreen() {

  /*
  |--------------------------------------------------------------------------
  | GLOBAL DARK MODE
  |--------------------------------------------------------------------------
  */

  const {
    isDarkMode,
    toggleDarkMode,
  } =
    useAppTheme();


  const theme =
    isDarkMode
      ? DARK_THEME
      : LIGHT_THEME;


  /*
  |--------------------------------------------------------------------------
  | CHANGE PASSWORD MODAL
  |--------------------------------------------------------------------------
  */

  const [
    passwordModalVisible,
    setPasswordModalVisible,
  ] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | PASSWORD FIELDS
  |--------------------------------------------------------------------------
  */

  const [
    currentPassword,
    setCurrentPassword,
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


  /*
  |--------------------------------------------------------------------------
  | PASSWORD VISIBILITY
  |--------------------------------------------------------------------------
  */

  const [
    showCurrent,
    setShowCurrent,
  ] =
    useState(false);


  const [
    showNew,
    setShowNew,
  ] =
    useState(false);


  const [
    showConfirm,
    setShowConfirm,
  ] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | PASSWORD REQUEST STATE
  |--------------------------------------------------------------------------
  */

  const [
    passwordSaving,
    setPasswordSaving,
  ] =
    useState(false);


  const [
    passwordError,
    setPasswordError,
  ] =
    useState('');


  /*
  |--------------------------------------------------------------------------
  | RESET PASSWORD FORM
  |--------------------------------------------------------------------------
  */

  const resetPasswordForm =
    () => {

      setCurrentPassword(
        ''
      );

      setNewPassword(
        ''
      );

      setConfirmPassword(
        ''
      );

      setShowCurrent(
        false
      );

      setShowNew(
        false
      );

      setShowConfirm(
        false
      );

      setPasswordError(
        ''
      );
    };


  /*
  |--------------------------------------------------------------------------
  | OPEN PASSWORD MODAL
  |--------------------------------------------------------------------------
  */

  const openChangePasswordModal =
    () => {

      resetPasswordForm();

      setPasswordModalVisible(
        true
      );
    };


  /*
  |--------------------------------------------------------------------------
  | CLOSE PASSWORD MODAL
  |--------------------------------------------------------------------------
  */

  const closeChangePasswordModal =
    () => {

      if (
        passwordSaving
      ) {
        return;
      }


      setPasswordModalVisible(
        false
      );


      resetPasswordForm();
    };


  /*
  |--------------------------------------------------------------------------
  | SAVE PASSWORD
  |--------------------------------------------------------------------------
  */

  const handleSavePassword =
    async () => {

      if (
        passwordSaving
      ) {
        return;
      }


      setPasswordError(
        ''
      );


      /*
      |--------------------------------------------------------------------------
      | CURRENT PASSWORD
      |--------------------------------------------------------------------------
      */

      if (
        !currentPassword
      ) {

        setPasswordError(
          'Please enter your current password.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | NEW PASSWORD
      |--------------------------------------------------------------------------
      */

      if (
        !newPassword
      ) {

        setPasswordError(
          'Please enter your new password.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | MINIMUM PASSWORD LENGTH
      |--------------------------------------------------------------------------
      */

      if (
        newPassword.length <
        8
      ) {

        setPasswordError(
          'Your new password must contain at least 8 characters.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | CONFIRM PASSWORD
      |--------------------------------------------------------------------------
      */

      if (
        !confirmPassword
      ) {

        setPasswordError(
          'Please confirm your new password.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | PASSWORDS MUST MATCH
      |--------------------------------------------------------------------------
      */

      if (
        newPassword !==
        confirmPassword
      ) {

        setPasswordError(
          'The new password and confirmation password do not match.'
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | PREVENT REUSING CURRENT PASSWORD
      |--------------------------------------------------------------------------
      */

      if (
        currentPassword ===
        newPassword
      ) {

        setPasswordError(
          'Your new password must be different from your current password.'
        );

        return;
      }


      try {

        setPasswordSaving(
          true
        );


        /*
        |--------------------------------------------------------------------------
        | SEND PASSWORD CHANGE TO LARAVEL
        |--------------------------------------------------------------------------
        */

        const data =
          await changeStudentPassword(
            currentPassword,
            newPassword,
            confirmPassword
          );


        setPasswordModalVisible(
          false
        );


        resetPasswordForm();


        Alert.alert(
          'Password Updated',
          data?.message ||
          'Your password has been updated successfully.'
        );

      } catch (
        error
      ) {

        console.error(
          'Change password error:',
          error
        );


        setPasswordError(
          error instanceof Error
            ? error.message
            : 'Unable to update your password.'
        );

      } finally {

        setPasswordSaving(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | EDIT PROFILE
  |--------------------------------------------------------------------------
  */

  const handleEditProfile =
    () => {

      router.push({
        pathname:
          '/(tabs)/Profile/ProfileScreen',

        params: {
          mode:
            'edit',

          requestId:
            String(
              Date.now()
            ),
        },
      });
    };


  /*
  |--------------------------------------------------------------------------
  | SCREEN
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={[
        styles.container,

        {
          backgroundColor:
            theme.background,
        },
      ]}
    >

      {/*
      |--------------------------------------------------------------------------
      | STATUS BAR
      |--------------------------------------------------------------------------
      */}

      <StatusBar
        barStyle={
          isDarkMode
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.background
        }
      />


      {/*
      |--------------------------------------------------------------------------
      | ACCOUNT SETTINGS CARD
      |--------------------------------------------------------------------------
      */}

      <View
        style={[
          styles.card,

          {
            backgroundColor:
              theme.card,

            borderColor:
              theme.border,
          },
        ]}
      >

        <Text
          style={
            styles.headerText
          }
        >
          ACCOUNT SETTINGS
        </Text>


        <Text
          style={[
            styles.subtext,

            {
              color:
                theme.softText,
            },
          ]}
        >
          Customize your personalized settings and account configurations.
        </Text>


        {/*
        |--------------------------------------------------------------------------
        | ACTION BUTTONS
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.buttonContainer
          }
        >

          {/*
          |--------------------------------------------------------------------------
          | CHANGE PASSWORD
          |--------------------------------------------------------------------------
          */}

          <TouchableOpacity
            style={[
              styles.actionButton,

              {
                backgroundColor:
                  isDarkMode
                    ? theme.surface
                    : 'transparent',

                borderColor:
                  theme.border,
              },
            ]}
            activeOpacity={
              0.72
            }
            onPress={
              openChangePasswordModal
            }
          >

            <View
              style={
                styles.actionButtonContent
              }
            >

              <MaterialCommunityIcons
                name="lock-outline"
                size={
                  21
                }
                color={
                  theme.primaryText
                }
                style={
                  styles.buttonIcon
                }
              />


              <Text
                style={[
                  styles.buttonText,

                  {
                    color:
                      theme.primaryText,
                  },
                ]}
                numberOfLines={
                  1
                }
                adjustsFontSizeToFit
                minimumFontScale={
                  0.82
                }
              >
                Change Password
              </Text>

            </View>

          </TouchableOpacity>


          {/*
          |--------------------------------------------------------------------------
          | EDIT PROFILE
          |--------------------------------------------------------------------------
          */}

          <TouchableOpacity
            style={[
              styles.actionButton,

              {
                backgroundColor:
                  isDarkMode
                    ? theme.surface
                    : 'transparent',

                borderColor:
                  theme.border,
              },
            ]}
            activeOpacity={
              0.72
            }
            onPress={
              handleEditProfile
            }
          >

            <View
              style={
                styles.actionButtonContent
              }
            >

              <FontAwesome5
                name="edit"
                size={
                  18
                }
                color={
                  theme.primaryText
                }
                style={
                  styles.buttonIcon
                }
              />


              <Text
                style={[
                  styles.buttonText,

                  {
                    color:
                      theme.primaryText,
                  },
                ]}
                numberOfLines={
                  1
                }
                adjustsFontSizeToFit
                minimumFontScale={
                  0.82
                }
              >
                Edit Profile
              </Text>

            </View>

          </TouchableOpacity>

        </View>

      </View>


      {/*
      |--------------------------------------------------------------------------
      | DARK MODE
      |--------------------------------------------------------------------------
      */}

      <View
        style={[
          styles.darkModeRow,

          {
            backgroundColor:
              isDarkMode
                ? theme.card
                : 'transparent',

            borderColor:
              theme.border,
          },
        ]}
      >

        <View
          style={
            styles.darkModeLeft
          }
        >

          <MaterialCommunityIcons
            name={
              isDarkMode
                ? 'weather-night'
                : 'weather-night'
            }
            size={
              26
            }
            color={
              theme.icon
            }
            style={
              styles.moonIcon
            }
          />


          <View
            style={
              styles.darkModeTextContainer
            }
          >

            <Text
              style={[
                styles.darkModeText,

                {
                  color:
                    theme.text,
                },
              ]}
            >
              Enable dark mode
            </Text>


            <Text
              style={[
                styles.darkModeSubtext,

                {
                  color:
                    theme.softText,
                },
              ]}
            >
              {
                isDarkMode
                  ? 'Dark mode is enabled'
                  : 'Dark mode is disabled'
              }
            </Text>

          </View>

        </View>


        <Switch
          trackColor={{
            false:
              COLORS.maroon,

            true:
              COLORS.green,
          }}
          thumbColor={
            COLORS.cream
          }
          ios_backgroundColor={
            COLORS.maroon
          }
          onValueChange={
            toggleDarkMode
          }
          value={
            isDarkMode
          }
        />

      </View>


      {/*
      |--------------------------------------------------------------------------
      | CHANGE PASSWORD MODAL
      |--------------------------------------------------------------------------
      */}

      <Modal
        animationType="fade"
        transparent
        visible={
          passwordModalVisible
        }
        statusBarTranslucent
        onRequestClose={
          closeChangePasswordModal
        }
      >

        <KeyboardAvoidingView
          style={
            styles.keyboardView
          }
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }
        >

          <Pressable
            style={
              styles.modalOverlay
            }
            onPress={
              closeChangePasswordModal
            }
          >

            <Pressable
              style={[
                styles.modalContent,

                {
                  backgroundColor:
                    theme.modalBackground,

                  borderColor:
                    theme.modalBorder,
                },
              ]}
              onPress={() => {}}
            >

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.modalScrollContent
                }
              >

                {/*
                |--------------------------------------------------------------------------
                | MODAL HEADER
                |--------------------------------------------------------------------------
                */}

                <View
                  style={
                    styles.modalHeaderContainer
                  }
                >

                  <View
                    style={
                      styles.modalHeaderTexts
                    }
                  >

                    <Text
                      style={[
                        styles.modalTitle,

                        {
                          color:
                            theme.primaryText,
                        },
                      ]}
                    >
                      Change Password
                    </Text>


                    <Text
                      style={[
                        styles.modalSubtitle,

                        {
                          color:
                            theme.softText,
                        },
                      ]}
                    >
                      Update your password to keep your account secure.
                    </Text>

                  </View>


                  <TouchableOpacity
                    style={[
                      styles.closeButton,

                      {
                        backgroundColor:
                          theme.closeButtonBackground,
                      },
                    ]}
                    onPress={
                      closeChangePasswordModal
                    }
                    disabled={
                      passwordSaving
                    }
                    activeOpacity={
                      0.7
                    }
                    hitSlop={{
                      top: 15,
                      bottom: 15,
                      left: 15,
                      right: 15,
                    }}
                  >

                    <Ionicons
                      name="close"
                      size={
                        24
                      }
                      color={
                        theme.primaryText
                      }
                    />

                  </TouchableOpacity>

                </View>


                {/*
                |--------------------------------------------------------------------------
                | ERROR MESSAGE
                |--------------------------------------------------------------------------
                */}

                {
                  Boolean(
                    passwordError
                  )
                  &&
                  (
                    <View
                      style={[
                        styles.errorBox,

                        {
                          backgroundColor:
                            theme.dangerBackground,
                        },
                      ]}
                    >

                      <Ionicons
                        name="alert-circle-outline"
                        size={
                          19
                        }
                        color={
                          theme.dangerText
                        }
                      />


                      <Text
                        style={[
                          styles.errorText,

                          {
                            color:
                              theme.dangerText,
                          },
                        ]}
                      >
                        {
                          passwordError
                        }
                      </Text>

                    </View>
                  )
                }


                {/*
                |--------------------------------------------------------------------------
                | PASSWORD FORM
                |--------------------------------------------------------------------------
                */}

                <View
                  style={
                    styles.form
                  }
                >

                  {/*
                  |--------------------------------------------------------------------------
                  | CURRENT PASSWORD
                  |--------------------------------------------------------------------------
                  */}

                  <View
                    style={
                      styles.inputGroup
                    }
                  >

                    <Text
                      style={[
                        styles.label,

                        {
                          color:
                            theme.primaryText,
                        },
                      ]}
                    >
                      Current Password
                    </Text>


                    <View
                      style={[
                        styles.inputContainer,

                        {
                          backgroundColor:
                            theme.inputBackground,

                          borderColor:
                            passwordError
                              ? theme.dangerText
                              : theme.icon,
                        },
                      ]}
                    >

                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={
                          19
                        }
                        color={
                          theme.icon
                        }
                      />


                      <TextInput
                        style={[
                          styles.input,

                          {
                            color:
                              theme.text,
                          },
                        ]}
                        placeholder="enter current password"
                        placeholderTextColor={
                          theme.placeholder
                        }
                        secureTextEntry={
                          !showCurrent
                        }
                        value={
                          currentPassword
                        }
                        onChangeText={
                          value => {

                            setCurrentPassword(
                              value
                            );

                            setPasswordError(
                              ''
                            );
                          }
                        }
                        editable={
                          !passwordSaving
                        }
                        autoCapitalize="none"
                        autoCorrect={
                          false
                        }
                        textContentType="password"
                      />


                      <TouchableOpacity
                        onPress={() =>
                          setShowCurrent(
                            previous =>
                              !previous
                          )
                        }
                        disabled={
                          passwordSaving
                        }
                        style={
                          styles.eyeIcon
                        }
                      >

                        <Feather
                          name={
                            showCurrent
                              ? 'eye'
                              : 'eye-off'
                          }
                          size={
                            20
                          }
                          color={
                            theme.icon
                          }
                        />

                      </TouchableOpacity>

                    </View>

                  </View>


                  {/*
                  |--------------------------------------------------------------------------
                  | NEW PASSWORD
                  |--------------------------------------------------------------------------
                  */}

                  <View
                    style={
                      styles.inputGroup
                    }
                  >

                    <Text
                      style={[
                        styles.label,

                        {
                          color:
                            theme.primaryText,
                        },
                      ]}
                    >
                      New Password
                    </Text>


                    <View
                      style={[
                        styles.inputContainer,

                        {
                          backgroundColor:
                            theme.inputBackground,

                          borderColor:
                            theme.icon,
                        },
                      ]}
                    >

                      <MaterialCommunityIcons
                        name="lock-plus-outline"
                        size={
                          19
                        }
                        color={
                          theme.icon
                        }
                      />


                      <TextInput
                        style={[
                          styles.input,

                          {
                            color:
                              theme.text,
                          },
                        ]}
                        placeholder="enter new password"
                        placeholderTextColor={
                          theme.placeholder
                        }
                        secureTextEntry={
                          !showNew
                        }
                        value={
                          newPassword
                        }
                        onChangeText={
                          value => {

                            setNewPassword(
                              value
                            );

                            setPasswordError(
                              ''
                            );
                          }
                        }
                        editable={
                          !passwordSaving
                        }
                        autoCapitalize="none"
                        autoCorrect={
                          false
                        }
                        textContentType="newPassword"
                      />


                      <TouchableOpacity
                        onPress={() =>
                          setShowNew(
                            previous =>
                              !previous
                          )
                        }
                        disabled={
                          passwordSaving
                        }
                        style={
                          styles.eyeIcon
                        }
                      >

                        <Feather
                          name={
                            showNew
                              ? 'eye'
                              : 'eye-off'
                          }
                          size={
                            20
                          }
                          color={
                            theme.icon
                          }
                        />

                      </TouchableOpacity>

                    </View>


                    <Text
                      style={[
                        styles.passwordHint,

                        {
                          color:
                            theme.softText,
                        },
                      ]}
                    >
                      Use at least 8 characters.
                    </Text>

                  </View>


                  {/*
                  |--------------------------------------------------------------------------
                  | CONFIRM PASSWORD
                  |--------------------------------------------------------------------------
                  */}

                  <View
                    style={
                      styles.inputGroup
                    }
                  >

                    <Text
                      style={[
                        styles.label,

                        {
                          color:
                            theme.primaryText,
                        },
                      ]}
                    >
                      Confirm Password
                    </Text>


                    <View
                      style={[
                        styles.inputContainer,

                        {
                          backgroundColor:
                            theme.inputBackground,

                          borderColor:
                            theme.icon,
                        },
                      ]}
                    >

                      <MaterialCommunityIcons
                        name="lock-check-outline"
                        size={
                          19
                        }
                        color={
                          theme.icon
                        }
                      />


                      <TextInput
                        style={[
                          styles.input,

                          {
                            color:
                              theme.text,
                          },
                        ]}
                        placeholder="confirm new password"
                        placeholderTextColor={
                          theme.placeholder
                        }
                        secureTextEntry={
                          !showConfirm
                        }
                        value={
                          confirmPassword
                        }
                        onChangeText={
                          value => {

                            setConfirmPassword(
                              value
                            );

                            setPasswordError(
                              ''
                            );
                          }
                        }
                        editable={
                          !passwordSaving
                        }
                        autoCapitalize="none"
                        autoCorrect={
                          false
                        }
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={
                          handleSavePassword
                        }
                      />


                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirm(
                            previous =>
                              !previous
                          )
                        }
                        disabled={
                          passwordSaving
                        }
                        style={
                          styles.eyeIcon
                        }
                      >

                        <Feather
                          name={
                            showConfirm
                              ? 'eye'
                              : 'eye-off'
                          }
                          size={
                            20
                          }
                          color={
                            theme.icon
                          }
                        />

                      </TouchableOpacity>

                    </View>

                  </View>


                  {/*
                  |--------------------------------------------------------------------------
                  | SAVE CHANGES
                  |--------------------------------------------------------------------------
                  */}

                  <TouchableOpacity
                    style={[
                      styles.saveButton,

                      passwordSaving
                      &&
                      styles.saveButtonDisabled,
                    ]}
                    activeOpacity={
                      0.8
                    }
                    onPress={
                      handleSavePassword
                    }
                    disabled={
                      passwordSaving
                    }
                  >

                    {
                      passwordSaving
                        ? (
                          <>

                            <ActivityIndicator
                              size="small"
                              color={
                                isDarkMode
                                  ? COLORS.cream
                                  : COLORS.white
                              }
                            />


                            <Text
                              style={[
                                styles.saveButtonText,

                                isDarkMode && {
                                  color:
                                    COLORS.cream,
                                },
                              ]}
                            >
                              Updating...
                            </Text>

                          </>
                        )
                        : (
                          <>

                            <MaterialCommunityIcons
                              name="content-save-check-outline"
                              size={
                                20
                              }
                              color={
                                isDarkMode
                                  ? COLORS.cream
                                  : COLORS.white
                              }
                            />


                            <Text
                              style={[
                                styles.saveButtonText,

                                isDarkMode && {
                                  color:
                                    COLORS.cream,
                                },
                              ]}
                            >
                              Save Changes
                            </Text>

                          </>
                        )
                    }

                  </TouchableOpacity>


                  {/*
                  |--------------------------------------------------------------------------
                  | SECURITY NOTICE
                  |--------------------------------------------------------------------------
                  */}

                  <View
                    style={
                      styles.securityNotice
                    }
                  >

                    <Ionicons
                      name="shield-checkmark-outline"
                      size={
                        18
                      }
                      color={
                        COLORS.green
                      }
                    />


                    <Text
                      style={[
                        styles.securityNoticeText,

                        {
                          color:
                            theme.softText,
                        },
                      ]}
                    >
                      Your current password is required before your password can be changed.
                    </Text>

                  </View>

                </View>

              </ScrollView>

            </Pressable>

          </Pressable>

        </KeyboardAvoidingView>

      </Modal>

    </SafeAreaView>
  );
}


/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({

    /*
    |--------------------------------------------------------------------------
    | SCREEN
    |--------------------------------------------------------------------------
    */

    container: {
      flex:
        1,

      paddingHorizontal:
        20,

      paddingTop:
        40,
    },


    /*
    |--------------------------------------------------------------------------
    | ACCOUNT SETTINGS CARD
    |--------------------------------------------------------------------------
    */

    card: {
      borderWidth:
        1,

      borderRadius:
        16,

      paddingHorizontal:
        20,

      paddingTop:
        20,

      paddingBottom:
        20,

      marginBottom:
        20,
    },


    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    headerText: {
      fontSize:
        20,

      fontWeight:
        'bold',

      color:
        COLORS.green,

      letterSpacing:
        0.5,

      marginBottom:
        8,
    },


    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    subtext: {
      fontSize:
        12,

      lineHeight:
        17,

      marginBottom:
        20,
    },


    /*
    |--------------------------------------------------------------------------
    | ACTION BUTTONS
    |--------------------------------------------------------------------------
    */

    buttonContainer: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'stretch',

      gap:
        10,
    },


    actionButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        58,

      borderWidth:
        1,

      borderRadius:
        14,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        8,

      paddingVertical:
        10,
    },


    actionButtonContent: {
      width:
        '100%',

      minWidth:
        0,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        2,
    },


    buttonIcon: {
      flexShrink:
        0,

      marginRight:
        6,
    },


    buttonText: {
      flexShrink:
        1,

      minWidth:
        0,

      fontSize:
        13,

      lineHeight:
        18,

      fontFamily:
        'serif',

      fontWeight:
        '600',

      textAlign:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | DARK MODE
    |--------------------------------------------------------------------------
    */

    darkModeRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      borderWidth:
        1,

      borderRadius:
        16,

      paddingVertical:
        14,

      paddingHorizontal:
        16,
    },


    darkModeLeft: {
      flex:
        1,

      flexDirection:
        'row',

      alignItems:
        'center',

      minWidth:
        0,

      paddingRight:
        10,
    },


    darkModeTextContainer: {
      flex:
        1,

      minWidth:
        0,
    },


    moonIcon: {
      transform: [
        {
          rotate:
            '-20deg',
        },
      ],

      marginRight:
        10,
    },


    darkModeText: {
      flexShrink:
        1,

      fontSize:
        16,

      fontWeight:
        '600',
    },


    darkModeSubtext: {
      marginTop:
        2,

      fontSize:
        12,

      lineHeight:
        16,
    },


    /*
    |--------------------------------------------------------------------------
    | KEYBOARD
    |--------------------------------------------------------------------------
    */

    keyboardView: {
      flex:
        1,
    },


    /*
    |--------------------------------------------------------------------------
    | MODAL OVERLAY
    |--------------------------------------------------------------------------
    */

    modalOverlay: {
      flex:
        1,

      backgroundColor:
        'rgba(0, 13, 18, 0.50)',

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal:
        20,

      paddingVertical:
        30,
    },


    /*
    |--------------------------------------------------------------------------
    | MODAL
    |--------------------------------------------------------------------------
    */

    modalContent: {
      width:
        '100%',

      maxWidth:
        360,

      maxHeight:
        '90%',

      borderRadius:
        16,

      borderWidth:
        1,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          4,
      },

      shadowOpacity:
        0.15,

      shadowRadius:
        10,

      elevation:
        8,
    },


    modalScrollContent: {
      padding:
        24,
    },


    /*
    |--------------------------------------------------------------------------
    | MODAL HEADER
    |--------------------------------------------------------------------------
    */

    modalHeaderContainer: {
      position:
        'relative',

      width:
        '100%',

      flexDirection:
        'row',

      marginBottom:
        20,
    },


    modalHeaderTexts: {
      flex:
        1,

      minWidth:
        0,

      paddingRight:
        38,
    },


    modalTitle: {
      fontSize:
        22,

      lineHeight:
        27,

      fontWeight:
        'bold',
    },


    modalSubtitle: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        15,
    },


    closeButton: {
      position:
        'absolute',

      right:
        0,

      top:
        -3,

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
    },


    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    errorBox: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      paddingHorizontal:
        12,

      paddingVertical:
        10,

      marginBottom:
        18,

      borderWidth:
        1,

      borderColor:
        'rgba(201, 73, 68, 0.35)',

      borderRadius:
        10,
    },


    errorText: {
      flex:
        1,

      marginLeft:
        8,

      fontSize:
        10.5,

      lineHeight:
        15,

      fontWeight:
        '600',
    },


    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    form: {
      width:
        '100%',
    },


    inputGroup: {
      marginBottom:
        16,
    },


    label: {
      marginBottom:
        6,

      marginLeft:
        12,

      fontSize:
        14,

      fontFamily:
        'serif',
    },


    /*
    |--------------------------------------------------------------------------
    | PASSWORD INPUT
    |--------------------------------------------------------------------------
    */

    inputContainer: {
      minHeight:
        48,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderWidth:
        1.5,

      borderRadius:
        22,

      paddingLeft:
        15,

      paddingRight:
        7,
    },


    input: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        12.5,

      fontWeight:
        '600',

      paddingHorizontal:
        10,

      paddingVertical:
        11,
    },


    eyeIcon: {
      width:
        38,

      height:
        38,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    passwordHint: {
      marginTop:
        5,

      marginLeft:
        13,

      fontSize:
        12,

      lineHeight:
        16,
    },


    /*
    |--------------------------------------------------------------------------
    | SAVE BUTTON
    |--------------------------------------------------------------------------
    */

    saveButton: {
      height:
        52,

      marginTop:
        18,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,

      borderRadius:
        10,

      backgroundColor:
        COLORS.green,
    },


    saveButtonDisabled: {
      opacity:
        0.62,
    },


    saveButtonText: {
      color:
        COLORS.white,

      fontSize:
        16,

      fontWeight:
        '600',
    },


    /*
    |--------------------------------------------------------------------------
    | SECURITY NOTICE
    |--------------------------------------------------------------------------
    */

    securityNotice: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop:
        15,

      paddingHorizontal:
        4,
    },


    securityNoticeText: {
      flex:
        1,

      marginLeft:
        7,

      fontSize:
        12,

      lineHeight:
        17,
    },
  });