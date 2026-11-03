import { Ionicons } from '@expo/vector-icons';

import {
  Stack,
  router,
} from 'expo-router';

import * as SecureStore from 'expo-secure-store';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  MOBILE_API_URL,
  SERVER_URL,
} from '../config/api';


/* ==========================================================================
   NSTP HUB LOGO
   ========================================================================== */

const NSTP_HUB_LOGO =
  require('../assets/images/nstphub_logo.png');


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

  emailGray: '#66777D',
  metaGray: '#8D8D8D',
  avatarBg: '#A9B18F',
  dangerSoft: '#F8ECEB',
};


/* ==========================================================================
   SECURE STORE KEYS
   ========================================================================== */

const TOKEN_KEY =
  'nstp_hub_mobile_token';

const GOOGLE_SETUP_TOKEN_KEY =
  'nstp_hub_google_setup_token';

const UNIVERSITY_ACCESS_TOKEN_KEY =
  'nstp_hub_university_access_token';

const SAVED_ACCOUNTS_KEY =
  'nstp_hub_saved_student_accounts';


/* ==========================================================================
   API
   ========================================================================== */

const LOGOUT_PAGE_LOGOUT_URL =
  `${MOBILE_API_URL}/logout-page/logout`;

const LOGOUT_PAGE_LOGIN_URL =
  `${MOBILE_API_URL}/logout-page/login`;

const REQUEST_TIMEOUT =
  20000;

const MAX_SAVED_ACCOUNTS =
  8;


/* ==========================================================================
   REQUEST DEDUPLICATION
   ========================================================================== */

const logoutRequestCache =
  new Map();


/* ==========================================================================
   MAIN SCREEN
   ========================================================================== */

export default function ChooseAccountScreen() {
  const insets =
    useSafeAreaInsets();


  const [
    accounts,
    setAccounts,
  ] =
    useState([]);


  const [
    preparing,
    setPreparing,
  ] =
    useState(true);


  const [
    pageError,
    setPageError,
  ] =
    useState('');


  const [
    selectedAccount,
    setSelectedAccount,
  ] =
    useState(null);


  const [
    password,
    setPassword,
  ] =
    useState('');


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  const [
    loginVisible,
    setLoginVisible,
  ] =
    useState(false);


  const [
    loginLoading,
    setLoginLoading,
  ] =
    useState(false);


  const [
    loginError,
    setLoginError,
  ] =
    useState('');


  const [
    removeVisible,
    setRemoveVisible,
  ] =
    useState(false);


  const [
    accountToRemove,
    setAccountToRemove,
  ] =
    useState(null);


  const [
    confirmRemoveVisible,
    setConfirmRemoveVisible,
  ] =
    useState(false);


  /* ========================================================================
     INITIALIZE LOGOUT PAGE
     ======================================================================== */

  const initialize =
    useCallback(
      async () => {
        setPreparing(true);
        setPageError('');


        let localAccounts =
          await loadSavedAccounts();


        setAccounts(
          localAccounts
        );


        const token =
          await SecureStore.getItemAsync(
            TOKEN_KEY
          );


        if (!token) {
          setPreparing(false);
          return;
        }


        try {
          const data =
            await logoutCurrentStudent(
              token
            );


          if (data?.saved_account) {
            localAccounts =
              mergeSavedAccount(
                localAccounts,
                data.saved_account
              );


            await saveSavedAccounts(
              localAccounts
            );


            setAccounts(
              localAccounts
            );
          }


          if (
            data?.university_access_token
          ) {
            await SecureStore.setItemAsync(
              UNIVERSITY_ACCESS_TOKEN_KEY,
              data.university_access_token
            );
          }

        } catch (error) {
          console.error(
            'Mobile logout-page initialization error:',
            error
          );


          setPageError(
            error instanceof Error
              ? error.message
              : 'Unable to complete logout with the NSTP HUB server.'
          );

        } finally {
          await Promise.all([
            SecureStore.deleteItemAsync(
              TOKEN_KEY
            ),

            SecureStore.deleteItemAsync(
              GOOGLE_SETUP_TOKEN_KEY
            ),
          ]);


          setPreparing(false);
        }
      },
      []
    );


  useEffect(
    () => {
      void initialize();
    },
    [
      initialize,
    ]
  );


  /* ========================================================================
     SELECT SAVED ACCOUNT
     ======================================================================== */

  const handleSelectAccount =
    account => {
      setSelectedAccount(
        account
      );

      setPassword('');
      setShowPassword(false);
      setLoginError('');
      setLoginVisible(true);
    };


  /* ========================================================================
     CLOSE LOGIN MODAL
     ======================================================================== */

  const closeLoginModal =
    () => {
      if (loginLoading) {
        return;
      }


      setLoginVisible(false);
      setSelectedAccount(null);
      setPassword('');
      setShowPassword(false);
      setLoginError('');
    };


  /* ========================================================================
     LOGIN SAVED ACCOUNT
     ======================================================================== */

  const loginSelectedAccount =
    async () => {
      if (loginLoading) {
        return;
      }


      if (
        !selectedAccount?.id
        ||
        !selectedAccount?.email
        ||
        !selectedAccount?.university_id
      ) {
        setLoginError(
          'Unable to identify the selected saved account.'
        );

        return;
      }


      if (!password) {
        setLoginError(
          'Please enter your password.'
        );

        return;
      }


      try {
        setLoginLoading(true);
        setLoginError('');


        const data =
          await requestJson(
            LOGOUT_PAGE_LOGIN_URL,
            {
              method: 'POST',

              headers: {
                Accept:
                  'application/json',

                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  id:
                    selectedAccount.id,

                  account_type:
                    'student',

                  email:
                    selectedAccount.email,

                  university_id:
                    selectedAccount.university_id,

                  password,
                }),
            }
          );


        if (!data?.token) {
          throw new Error(
            'Laravel did not return a mobile login token.'
          );
        }


        await Promise.all([
          SecureStore.setItemAsync(
            TOKEN_KEY,
            data.token
          ),

          SecureStore.deleteItemAsync(
            GOOGLE_SETUP_TOKEN_KEY
          ),

          SecureStore.deleteItemAsync(
            UNIVERSITY_ACCESS_TOKEN_KEY
          ),
        ]);


        setLoginVisible(false);
        setPassword('');
        setSelectedAccount(null);


        const nextScreen =
          data?.next_screen
          ||
          data?.student?.next_screen
          ||
          '/(tabs)/HomepageScreen';


        router.replace(
          nextScreen
        );

      } catch (error) {
        console.error(
          'Saved student login error:',
          error
        );


        setLoginError(
          error instanceof Error
            ? error.message
            : 'Unable to sign in to the selected account.'
        );

      } finally {
        setLoginLoading(false);
      }
    };


  /* ========================================================================
     USE ANOTHER ACCOUNT
     ======================================================================== */

  const handleUseAnotherAccount =
    async () => {
      const universityAccessToken =
        await SecureStore.getItemAsync(
          UNIVERSITY_ACCESS_TOKEN_KEY
        );


      if (universityAccessToken) {
        router.replace(
          '/LoginScreen'
        );

        return;
      }


      router.replace(
        '/AccessCodeScreen'
      );
    };


  /* ========================================================================
     REMOVE ACCOUNT
     ======================================================================== */

  const handleRemoveAccount =
    () => {
      if (
        accounts.length === 0
      ) {
        return;
      }


      setRemoveVisible(true);
    };


  const askRemoveAccount =
    account => {
      setAccountToRemove(
        account
      );

      setConfirmRemoveVisible(
        true
      );
    };


  const cancelRemoveAccount =
    () => {
      setConfirmRemoveVisible(
        false
      );

      setAccountToRemove(
        null
      );
    };


  const confirmRemoveAccount =
    async () => {
      if (!accountToRemove) {
        return;
      }


      const removeKey =
        getAccountKey(
          accountToRemove
        );


      const nextAccounts =
        accounts.filter(
          account =>
            getAccountKey(account)
            !==
            removeKey
        );


      await saveSavedAccounts(
        nextAccounts
      );


      setAccounts(
        nextAccounts
      );

      setConfirmRemoveVisible(
        false
      );

      setAccountToRemove(
        null
      );


      if (
        nextAccounts.length === 0
      ) {
        setRemoveVisible(false);
      }
    };


  /* ========================================================================
     SCREEN
     ======================================================================== */

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />


      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.cream
        }
      />


      <View
        style={
          styles.screen
        }
      >
        {/* ================================================================
            LOGO
            ================================================================ */}

        <View
          style={
            styles.logoSection
          }
        >
          <View
            style={
              styles.logoWrapper
            }
          >
            {/* ============================================================
                WHITE LOGO OUTLINE - LEFT
                ============================================================ */}

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


            {/* ============================================================
                WHITE LOGO OUTLINE - RIGHT
                ============================================================ */}

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


            {/* ============================================================
                WHITE LOGO OUTLINE - TOP
                ============================================================ */}

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


            {/* ============================================================
                WHITE LOGO OUTLINE - BOTTOM
                ============================================================ */}

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


            {/* ============================================================
                ORIGINAL NSTP HUB LOGO
                ============================================================ */}

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
        </View>


        {/* ================================================================
            TITLE
            ================================================================ */}

        <View
          style={
            styles.titleSection
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Choose An Account
          </Text>
        </View>


        {/* ================================================================
            ACCOUNTS
            ================================================================ */}

        <View
          style={
            styles.accountsSection
          }
        >
          {
            preparing
              ? (
                <View
                  style={
                    styles.loadingState
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
                    Signing you out securely...
                  </Text>
                </View>
              )

              : accounts.length > 0
                ? (
                  <ScrollView
                    style={
                      styles.rowsScroll
                    }
                    contentContainerStyle={
                      styles.rowsContent
                    }
                    showsVerticalScrollIndicator={
                      false
                    }
                    bounces={
                      false
                    }
                  >
                    {
                      accounts.map(
                        account => (
                          <AccountRow
                            key={
                              getAccountKey(
                                account
                              )
                            }
                            account={
                              account
                            }
                            onPress={() =>
                              handleSelectAccount(
                                account
                              )
                            }
                          />
                        )
                      )
                    }
                  </ScrollView>
                )

                : (
                  <View
                    style={
                      styles.emptyState
                    }
                  >
                    <View
                      style={
                        styles.emptyIconCircle
                      }
                    >
                      <Ionicons
                        name="person-outline"
                        size={29}
                        color={
                          COLORS.green
                        }
                      />
                    </View>


                    <Text
                      style={
                        styles.emptyTitle
                      }
                    >
                      No saved student accounts
                    </Text>


                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      Sign in with another account to continue using NSTP HUB.
                    </Text>
                  </View>
                )
          }


          {
            Boolean(pageError)
            &&
            (
              <View
                style={
                  styles.pageError
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={
                    COLORS.maroon
                  }
                />


                <Text
                  style={
                    styles.pageErrorText
                  }
                >
                  {pageError}
                </Text>
              </View>
            )
          }
        </View>


        {/* ================================================================
            FOOTER ACTIONS
            ================================================================
            
            IMPORTANT:
            
            The marginBottom below uses the real device safe-area inset.
            This keeps the buttons above the Android navigation buttons.
            
            ================================================================ */}

        <View
          style={[
            styles.actionsSection,

            {
              marginBottom:
                Math.max(
                  insets.bottom + 38,
                  56
                ),
            },
          ]}
        >
          <TouchableOpacity
            style={
              styles.actionItem
            }
            onPress={
              handleUseAnotherAccount
            }
            disabled={
              preparing
            }
            activeOpacity={
              0.68
            }
          >
            <View
              style={
                styles.actionIcon
              }
            >
              <Ionicons
                name="person-add-outline"
                size={25}
                color={
                  COLORS.maroon
                }
              />
            </View>


            <Text
              style={
                styles.actionText
              }
            >
              Use another account
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.actionItem,

              accounts.length === 0
              &&
              styles.disabledAction,
            ]}
            onPress={
              handleRemoveAccount
            }
            disabled={
              preparing
              ||
              accounts.length === 0
            }
            activeOpacity={
              0.68
            }
          >
            <View
              style={
                styles.actionIcon
              }
            >
              <Ionicons
                name="person-remove"
                size={25}
                color={
                  COLORS.maroon
                }
              />
            </View>


            <Text
              style={
                styles.actionText
              }
            >
              Remove an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* ====================================================================
          SAVED ACCOUNT PASSWORD MODAL
          ==================================================================== */}

      <Modal
        visible={
          loginVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeLoginModal
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalKeyboard
          }
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <Pressable
            style={
              styles.modalOverlay
            }
            onPress={
              closeLoginModal
            }
          >
            <Pressable
              style={
                styles.loginModal
              }
              onPress={() => {}}
            >
              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                onPress={
                  closeLoginModal
                }
                disabled={
                  loginLoading
                }
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={
                    COLORS.maroon
                  }
                />
              </TouchableOpacity>


              <AccountAvatar
                account={
                  selectedAccount
                }
                size={82}
              />


              <Text
                numberOfLines={2}
                style={
                  styles.modalAccountName
                }
              >
                {
                  getAccountName(
                    selectedAccount
                  )
                }
              </Text>


              <Text
                numberOfLines={1}
                style={
                  styles.modalEmail
                }
              >
                {
                  selectedAccount?.email
                  ||
                  ''
                }
              </Text>


              {
                Boolean(
                  getUniversityName(
                    selectedAccount
                  )
                )
                &&
                (
                  <Text
                    numberOfLines={2}
                    style={
                      styles.modalUniversity
                    }
                  >
                    {
                      getUniversityName(
                        selectedAccount
                      )
                    }
                  </Text>
                )
              }


              <View
                style={[
                  styles.passwordBox,

                  Boolean(loginError)
                  &&
                  styles.passwordBoxError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={
                    COLORS.darkTeal
                  }
                />


                <TextInput
                  value={
                    password
                  }
                  onChangeText={
                    value => {
                      setPassword(
                        value
                      );

                      setLoginError('');
                    }
                  }
                  placeholder="Enter your password"
                  placeholderTextColor={
                    COLORS.metaGray
                  }
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  editable={
                    !loginLoading
                  }
                  returnKeyType="done"
                  onSubmitEditing={
                    loginSelectedAccount
                  }
                  style={
                    styles.passwordInput
                  }
                />


                <TouchableOpacity
                  style={
                    styles.eyeButton
                  }
                  onPress={() =>
                    setShowPassword(
                      current =>
                        !current
                    )
                  }
                  disabled={
                    loginLoading
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={
                      COLORS.darkTeal
                    }
                  />
                </TouchableOpacity>
              </View>


              {
                Boolean(loginError)
                &&
                (
                  <View
                    style={
                      styles.loginErrorRow
                    }
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={17}
                      color={
                        COLORS.maroon
                      }
                    />


                    <Text
                      style={
                        styles.loginErrorText
                      }
                    >
                      {loginError}
                    </Text>
                  </View>
                )
              }


              <View
                style={
                  styles.modalButtons
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  onPress={
                    closeLoginModal
                  }
                  disabled={
                    loginLoading
                  }
                  activeOpacity={
                    0.75
                  }
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>


                <TouchableOpacity
                  style={[
                    styles.continueButton,

                    loginLoading
                    &&
                    styles.buttonDisabled,
                  ]}
                  onPress={
                    loginSelectedAccount
                  }
                  disabled={
                    loginLoading
                  }
                  activeOpacity={
                    0.78
                  }
                >
                  {
                    loginLoading
                      ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            COLORS.white
                          }
                        />
                      )
                      : (
                        <Ionicons
                          name="log-in-outline"
                          size={19}
                          color={
                            COLORS.white
                          }
                        />
                      )
                  }


                  <Text
                    style={
                      styles.continueButtonText
                    }
                  >
                    {
                      loginLoading
                        ? 'Signing In...'
                        : 'Continue'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>


      {/* ====================================================================
          REMOVE ACCOUNT MODAL
          ==================================================================== */}

      <Modal
        visible={
          removeVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setRemoveVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setRemoveVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.removeModal
            }
            onPress={() => {}}
          >
            <TouchableOpacity
              style={
                styles.modalCloseButton
              }
              onPress={() =>
                setRemoveVisible(
                  false
                )
              }
            >
              <Ionicons
                name="close"
                size={21}
                color={
                  COLORS.maroon
                }
              />
            </TouchableOpacity>


            <Text
              style={
                styles.removeTitle
              }
            >
              Remove Account
            </Text>


            <Text
              style={
                styles.removeDescription
              }
            >
              Select the student account you want to remove from this device.
            </Text>


            <View
              style={
                styles.modalDivider
              }
            />


            <ScrollView
              style={
                styles.removeList
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {
                accounts.map(
                  account => (
                    <TouchableOpacity
                      key={
                        getAccountKey(
                          account
                        )
                      }
                      style={
                        styles.removeAccountRow
                      }
                      onPress={() =>
                        askRemoveAccount(
                          account
                        )
                      }
                      activeOpacity={
                        0.72
                      }
                    >
                      <AccountAvatar
                        account={
                          account
                        }
                        size={48}
                      />


                      <View
                        style={
                          styles.removeAccountInfo
                        }
                      >
                        <Text
                          numberOfLines={1}
                          style={
                            styles.removeAccountName
                          }
                        >
                          {
                            getAccountName(
                              account
                            )
                          }
                        </Text>


                        <Text
                          numberOfLines={1}
                          style={
                            styles.removeAccountEmail
                          }
                        >
                          {
                            account?.email
                            ||
                            ''
                          }
                        </Text>
                      </View>


                      <Ionicons
                        name="trash-outline"
                        size={21}
                        color={
                          COLORS.maroon
                        }
                      />
                    </TouchableOpacity>
                  )
                )
              }
            </ScrollView>


            <TouchableOpacity
              style={
                styles.closeRemoveButton
              }
              onPress={() =>
                setRemoveVisible(
                  false
                )
              }
            >
              <Text
                style={
                  styles.closeRemoveButtonText
                }
              >
                Close
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>


      {/* ====================================================================
          CONFIRM REMOVE MODAL
          ==================================================================== */}

      <Modal
        visible={
          confirmRemoveVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          cancelRemoveAccount
        }
      >
        <Pressable
          style={
            styles.modalOverlayStrong
          }
          onPress={
            cancelRemoveAccount
          }
        >
          <Pressable
            style={
              styles.confirmModal
            }
            onPress={() => {}}
          >
            <View
              style={
                styles.confirmIcon
              }
            >
              <Ionicons
                name="trash-outline"
                size={27}
                color={
                  COLORS.maroon
                }
              />
            </View>


            <Text
              style={
                styles.confirmTitle
              }
            >
              Remove Account
            </Text>


            <Text
              style={
                styles.confirmText
              }
            >
              Remove{' '}

              <Text
                style={
                  styles.confirmStrong
                }
              >
                {
                  getAccountName(
                    accountToRemove
                  )
                }
              </Text>

              {' '}from this device?
            </Text>


            <Text
              style={
                styles.confirmSmall
              }
            >
              This only removes the saved account from this device. It will not delete the student account from the NSTP HUB database.
            </Text>


            <View
              style={
                styles.confirmButtons
              }
            >
              <TouchableOpacity
                style={
                  styles.confirmCancelButton
                }
                onPress={
                  cancelRemoveAccount
                }
              >
                <Text
                  style={
                    styles.confirmCancelText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.confirmRemoveButton
                }
                onPress={
                  confirmRemoveAccount
                }
              >
                <Text
                  style={
                    styles.confirmRemoveText
                  }
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}


/* ==========================================================================
   ACCOUNT ROW
   ========================================================================== */

function AccountRow({
  account,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={
        styles.row
      }
      onPress={
        onPress
      }
      activeOpacity={
        0.72
      }
    >
      <AccountAvatar
        account={
          account
        }
        size={43}
      />


      <View
        style={
          styles.rowText
        }
      >
        <Text
          style={
            styles.rowName
          }
          numberOfLines={1}
        >
          {
            getAccountName(
              account
            )
          }
        </Text>


        <Text
          style={
            styles.rowEmail
          }
          numberOfLines={1}
        >
          {
            account?.email
            ||
            ''
          }
        </Text>


        {
          Boolean(
            getUniversityName(
              account
            )
          )
          &&
          (
            <Text
              style={
                styles.rowUniversity
              }
              numberOfLines={1}
            >
              {
                getUniversityName(
                  account
                )
              }
            </Text>
          )
        }
      </View>


      <Text
        style={
          styles.rowStatus
        }
      >
        Signed out
      </Text>
    </TouchableOpacity>
  );
}


/* ==========================================================================
   ACCOUNT AVATAR
   ========================================================================== */

function AccountAvatar({
  account,
  size,
}) {
  const [
    failed,
    setFailed,
  ] =
    useState(false);


  const photoUrl =
    useMemo(
      () =>
        resolveProfilePhotoUrl(
          account?.profile_photo_url
          ??
          account?.profile_photo
          ??
          null
        ),
      [
        account?.profile_photo_url,
        account?.profile_photo,
      ]
    );


  const radius =
    size / 2;


  return (
    <View
      style={[
        styles.avatar,

        {
          width: size,
          height: size,
          borderRadius: radius,
        },
      ]}
    >
      {
        photoUrl
        &&
        !failed
          ? (
            <Image
              source={{
                uri: photoUrl,
              }}
              style={
                styles.avatarImage
              }
              resizeMode="cover"
              onError={() =>
                setFailed(true)
              }
            />
          )
          : (
            <Ionicons
              name="person"
              size={
                Math.max(
                  18,
                  size * 0.44
                )
              }
              color={
                COLORS.white
              }
            />
          )
      }
    </View>
  );
}


/* ==========================================================================
   LOGOUT CURRENT STUDENT
   ========================================================================== */

async function logoutCurrentStudent(
  token
) {
  if (
    logoutRequestCache.has(
      token
    )
  ) {
    return logoutRequestCache.get(
      token
    );
  }


  const request =
    requestJson(
      LOGOUT_PAGE_LOGOUT_URL,
      {
        method: 'POST',

        headers: {
          Accept:
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  logoutRequestCache.set(
    token,
    request
  );


  try {
    return await request;

  } catch (error) {
    logoutRequestCache.delete(
      token
    );

    throw error;
  }
}


/* ==========================================================================
   REQUEST JSON
   ========================================================================== */

async function requestJson(
  url,
  options = {}
) {
  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      REQUEST_TIMEOUT
    );


  try {
    const response =
      await fetch(
        url,
        {
          ...options,

          signal:
            controller.signal,
        }
      );


    const text =
      await response.text();


    let data = {};


    if (text) {
      try {
        data =
          JSON.parse(
            text
          );

      } catch {
        throw new Error(
          `The NSTP HUB server returned an invalid response (HTTP ${response.status}).`
        );
      }
    }


    if (!response.ok) {
      throw new Error(
        getApiError(
          data,
          'The request could not be completed.'
        )
      );
    }


    return data;

  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw new Error(
        'The NSTP HUB server took too long to respond.'
      );
    }


    throw error;

  } finally {
    clearTimeout(
      timeout
    );
  }
}


/* ==========================================================================
   API ERROR
   ========================================================================== */

function getApiError(
  data,
  fallback
) {
  if (data?.errors) {
    const first =
      Object.values(
        data.errors
      )
        .flat()
        .find(Boolean);


    if (first) {
      return String(first);
    }
  }


  return (
    data?.message
    ||
    fallback
  );
}


/* ==========================================================================
   LOAD SAVED ACCOUNTS
   ========================================================================== */

async function loadSavedAccounts() {
  try {
    const value =
      await SecureStore.getItemAsync(
        SAVED_ACCOUNTS_KEY
      );


    if (!value) {
      return [];
    }


    const parsed =
      JSON.parse(
        value
      );


    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }


    return parsed.filter(
      account =>
        account?.id
        &&
        account?.email
        &&
        account?.university_id
    );

  } catch (error) {
    console.warn(
      'Unable to read saved student accounts:',
      error
    );


    return [];
  }
}


/* ==========================================================================
   SAVE ACCOUNTS
   ========================================================================== */

async function saveSavedAccounts(
  accounts
) {
  const safeAccounts =
    Array.isArray(accounts)
      ? accounts
          .slice(
            0,
            MAX_SAVED_ACCOUNTS
          )
          .map(
            sanitizeSavedAccount
          )
      : [];


  await SecureStore.setItemAsync(
    SAVED_ACCOUNTS_KEY,

    JSON.stringify(
      safeAccounts
    )
  );
}


/* ==========================================================================
   MERGE LOGGED-OUT ACCOUNT
   ========================================================================== */

function mergeSavedAccount(
  accounts,
  incoming
) {
  const safeIncoming =
    sanitizeSavedAccount(
      incoming
    );


  if (
    !safeIncoming?.id
    ||
    !safeIncoming?.email
    ||
    !safeIncoming?.university_id
  ) {
    return accounts;
  }


  const incomingKey =
    getAccountKey(
      safeIncoming
    );


  const withoutDuplicate =
    accounts.filter(
      account =>
        getAccountKey(account)
        !==
        incomingKey
    );


  return [
    safeIncoming,
    ...withoutDuplicate,
  ].slice(
    0,
    MAX_SAVED_ACCOUNTS
  );
}


/* ==========================================================================
   SANITIZE SAVED ACCOUNT
   ========================================================================== */

function sanitizeSavedAccount(
  account
) {
  return {
    id:
      account?.id
      ??
      null,

    account_type:
      'student',

    role:
      'student',

    full_name:
      account?.full_name
      ??
      null,

    name:
      account?.name
      ??
      null,

    email:
      account?.email
      ??
      null,

    profile_photo:
      account?.profile_photo
      ??
      null,

    profile_photo_url:
      account?.profile_photo_url
      ??
      null,

    component:
      account?.component
      ??
      null,

    student_id_number:
      account?.student_id_number
      ??
      null,

    university_id:
      account?.university_id
      ??
      null,

    university_name:
      account?.university_name
      ??
      null,

    university_acronym:
      account?.university_acronym
      ??
      null,
  };
}


/* ==========================================================================
   ACCOUNT KEY
   ========================================================================== */

function getAccountKey(
  account
) {
  return [
    'student',

    account?.university_id
    ??
    'university',

    account?.id
    ??
    'account',

    String(
      account?.email
      ??
      ''
    ).toLowerCase(),
  ].join(':');
}


/* ==========================================================================
   ACCOUNT NAME
   ========================================================================== */

function getAccountName(
  account
) {
  return (
    account?.full_name
    ||
    account?.name
    ||
    account?.email
    ||
    'NSTP Student'
  );
}


/* ==========================================================================
   UNIVERSITY NAME
   ========================================================================== */

function getUniversityName(
  account
) {
  return (
    account?.university_name
    ||
    account?.university_acronym
    ||
    ''
  );
}


/* ==========================================================================
   PROFILE PHOTO URL
   ========================================================================== */

function resolveProfilePhotoUrl(
  value
) {
  let photo =
    String(
      value
      ??
      ''
    ).trim();


  if (!photo) {
    return null;
  }


  if (
    photo.startsWith(
      'data:image/'
    )
  ) {
    return photo;
  }


  photo =
    photo.replace(
      /\\/g,
      '/'
    );


  const server =
    String(
      SERVER_URL
      ??
      ''
    )
      .trim()
      .replace(
        /\/+$/,
        ''
      );


  if (
    /^https?:\/\//i.test(
      photo
    )
  ) {
    if (
      server
      &&
      /^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?/i.test(
        photo
      )
    ) {
      photo =
        photo.replace(
          /^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?/i,
          server
        );
    }


    return photo.replace(
      /\/storage\/storage\//gi,
      '/storage/'
    );
  }


  if (!server) {
    return photo;
  }


  let relative =
    photo
      .replace(
        /^\/+/,
        ''
      )
      .replace(
        /^storage\/app\/public\//i,
        ''
      )
      .replace(
        /^app\/public\//i,
        ''
      )
      .replace(
        /^public\//i,
        ''
      );


  if (
    /^storage\//i.test(
      relative
    )
  ) {
    return (
      `${server}/${relative}`
        .replace(
          /\/storage\/storage\//gi,
          '/storage/'
        )
    );
  }


  return (
    `${server}/storage/${relative}`
  );
}


/* ==========================================================================
   STYLES
   ========================================================================== */

const styles =
  StyleSheet.create({

    /* ======================================================================
       PAGE
       ====================================================================== */

    safeArea: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },


    screen: {
      flex: 1,

      width:
        '100%',

      maxWidth: 500,

      alignSelf:
        'center',

      paddingHorizontal: 26,

      backgroundColor:
        COLORS.cream,
    },


    /* ======================================================================
       LOGO
       ====================================================================== */

    logoSection: {
      height:
        '28%',

      minHeight: 205,

      maxHeight: 260,

      alignItems:
        'center',

      justifyContent:
        'flex-end',

      paddingBottom: 6,
    },


    /*
    |--------------------------------------------------------------------------
    | Same Logo Design As Forgot Password
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
    },


    logoOutline: {
      position:
        'absolute',

      width: 154,

      height: 186,
    },


    logo: {
      position:
        'absolute',

      width: 154,

      height: 186,
    },


    /* ======================================================================
       TITLE
       ====================================================================== */

    titleSection: {
      alignItems:
        'center',

      justifyContent:
        'center',

      paddingTop: 16,

      paddingBottom: 30,
    },


    title: {
      color:
        COLORS.green,

      fontSize: 24,

      lineHeight: 30,

      fontWeight:
        '800',

      textAlign:
        'center',

      letterSpacing: 0.7,

      textShadowColor:
        'rgba(0, 13, 18, 0.18)',

      textShadowOffset: {
        width: 1,
        height: 2,
      },

      textShadowRadius: 3,
    },


    /* ======================================================================
       ACCOUNTS
       ====================================================================== */

    accountsSection: {
      flex: 1,

      width:
        '100%',

      maxWidth: 360,

      alignSelf:
        'center',
    },


    rowsScroll: {
      flexGrow: 0,

      width:
        '100%',

      maxHeight: 360,
    },


    rowsContent: {
      paddingHorizontal: 2,

      paddingTop: 2,

      paddingBottom: 4,
    },


    row: {
      width:
        '100%',

      minHeight: 70,

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom: 11,

      paddingHorizontal: 13,

      paddingVertical: 9,

      borderRadius: 7,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.white,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.24,

      shadowRadius: 3,

      elevation: 5,
    },


    avatar: {
      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      borderWidth: 1,

      borderColor:
        COLORS.green,

      backgroundColor:
        COLORS.avatarBg,
    },


    avatarImage: {
      width:
        '100%',

      height:
        '100%',
    },


    rowText: {
      flex: 1,

      minWidth: 0,

      marginLeft: 10,

      paddingRight: 5,
    },


    rowName: {
      color:
        COLORS.orange,

      fontSize: 14,

      lineHeight: 17,

      fontWeight:
        '800',
    },


    rowEmail: {
      marginTop: 2,

      color:
        COLORS.darkTeal,

      fontSize: 10.5,

      lineHeight: 14,

      fontWeight:
        '500',
    },


    rowUniversity: {
      marginTop: 1,

      color:
        COLORS.green,

      fontSize: 8,

      lineHeight: 10,

      fontWeight:
        '600',
    },


    rowStatus: {
      marginLeft: 5,

      color:
        COLORS.metaGray,

      fontSize: 8,

      lineHeight: 11,

      fontWeight:
        '500',

      textTransform:
        'lowercase',
    },


    /* ======================================================================
       LOADING / EMPTY / ERROR
       ====================================================================== */

    loadingState: {
      minHeight: 260,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    loadingText: {
      marginTop: 12,

      color:
        COLORS.darkTeal,

      fontSize: 11,

      fontWeight:
        '500',
    },


    emptyState: {
      minHeight: 245,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 25,
    },


    emptyIconCircle: {
      width: 58,

      height: 58,

      borderRadius: 29,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.gray,
    },


    emptyTitle: {
      marginTop: 13,

      color:
        COLORS.maroon,

      fontSize: 13,

      fontWeight:
        '800',

      textAlign:
        'center',
    },


    emptyText: {
      marginTop: 5,

      color:
        COLORS.darkTeal,

      fontSize: 10.5,

      lineHeight: 15,

      textAlign:
        'center',

      opacity: 0.76,
    },


    pageError: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop: 6,

      paddingHorizontal: 10,

      paddingVertical: 9,

      borderRadius: 8,

      borderWidth: 1,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.dangerSoft,
    },


    pageErrorText: {
      flex: 1,

      marginLeft: 7,

      color:
        COLORS.maroon,

      fontSize: 9.5,

      lineHeight: 13,
    },


    /* ======================================================================
       FOOTER ACTIONS
       ====================================================================== */

    actionsSection: {
      width:
        '100%',

      maxWidth: 340,

      minHeight: 58,

      alignSelf:
        'center',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 2,
    },


    actionItem: {
      width:
        '48%',

      minHeight: 48,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 3,
    },


    actionIcon: {
      width: 30,

      height: 30,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    actionText: {
      flexShrink: 1,

      marginLeft: 6,

      color:
        COLORS.maroon,

      fontSize: 9.5,

      lineHeight: 13,

      fontWeight:
        '600',
    },


    disabledAction: {
      opacity: 0.35,
    },


    /* ======================================================================
       MODAL COMMON
       ====================================================================== */

    modalKeyboard: {
      flex: 1,
    },


    modalOverlay: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 20,

      backgroundColor:
        'rgba(0, 13, 18, 0.55)',
    },


    modalOverlayStrong: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 20,

      backgroundColor:
        'rgba(0, 13, 18, 0.68)',
    },


    modalCloseButton: {
      position:
        'absolute',

      top: 13,

      right: 13,

      width: 38,

      height: 38,

      borderRadius: 19,

      alignItems:
        'center',

      justifyContent:
        'center',

      zIndex: 5,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.cream,
    },


    /* ======================================================================
       LOGIN MODAL
       ====================================================================== */

    loginModal: {
      width:
        '100%',

      maxWidth: 410,

      alignItems:
        'center',

      paddingHorizontal: 22,

      paddingTop: 31,

      paddingBottom: 22,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.cream,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      shadowOpacity: 0.25,

      shadowRadius: 12,

      elevation: 10,
    },


    modalAccountName: {
      marginTop: 13,

      paddingHorizontal: 28,

      color:
        COLORS.orange,

      fontSize: 18,

      lineHeight: 23,

      fontWeight:
        '800',

      textAlign:
        'center',
    },


    modalEmail: {
      marginTop: 4,

      color:
        COLORS.darkTeal,

      fontSize: 11.5,
    },


    modalUniversity: {
      marginTop: 5,

      color:
        COLORS.green,

      fontSize: 10,

      lineHeight: 14,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    passwordBox: {
      width:
        '100%',

      height: 54,

      marginTop: 22,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 13,

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.white,
    },


    passwordBoxError: {
      borderColor:
        COLORS.maroon,
    },


    passwordInput: {
      flex: 1,

      height:
        '100%',

      paddingHorizontal: 10,

      color:
        COLORS.nearBlack,

      fontSize: 14,
    },


    eyeButton: {
      width: 38,

      height: 38,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    loginErrorRow: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop: 10,

      paddingHorizontal: 2,
    },


    loginErrorText: {
      flex: 1,

      marginLeft: 6,

      color:
        COLORS.maroon,

      fontSize: 10.5,

      lineHeight: 15,

      fontWeight:
        '600',
    },


    modalButtons: {
      width:
        '100%',

      flexDirection:
        'row',

      marginTop: 20,

      gap: 10,
    },


    cancelButton: {
      flex: 1,

      height: 46,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.white,
    },


    cancelButtonText: {
      color:
        COLORS.maroon,

      fontSize: 12,

      fontWeight:
        '700',
    },


    continueButton: {
      flex: 1.35,

      height: 46,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 10,

      backgroundColor:
        COLORS.green,
    },


    continueButtonText: {
      marginLeft: 7,

      color:
        COLORS.white,

      fontSize: 12,

      fontWeight:
        '800',
    },


    buttonDisabled: {
      opacity: 0.6,
    },


    /* ======================================================================
       REMOVE ACCOUNT MODAL
       ====================================================================== */

    removeModal: {
      width:
        '100%',

      maxWidth: 430,

      maxHeight:
        '82%',

      paddingHorizontal: 20,

      paddingTop: 30,

      paddingBottom: 20,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.cream,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      shadowOpacity: 0.25,

      shadowRadius: 12,

      elevation: 10,
    },


    removeTitle: {
      color:
        COLORS.green,

      fontSize: 20,

      lineHeight: 25,

      fontWeight:
        '800',

      textAlign:
        'center',
    },


    removeDescription: {
      marginTop: 6,

      paddingHorizontal: 20,

      color:
        COLORS.darkTeal,

      fontSize: 10.5,

      lineHeight: 15,

      textAlign:
        'center',
    },


    modalDivider: {
      height: 1,

      marginTop: 16,

      marginBottom: 8,

      backgroundColor:
        COLORS.gray,
    },


    removeList: {
      flexGrow: 0,
    },


    removeAccountRow: {
      minHeight: 67,

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom: 9,

      paddingHorizontal: 10,

      paddingVertical: 9,

      borderRadius: 8,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.white,
    },


    removeAccountInfo: {
      flex: 1,

      marginLeft: 10,

      marginRight: 8,
    },


    removeAccountName: {
      color:
        COLORS.orange,

      fontSize: 12,

      fontWeight:
        '800',
    },


    removeAccountEmail: {
      marginTop: 2,

      color:
        COLORS.darkTeal,

      fontSize: 10,
    },


    closeRemoveButton: {
      height: 45,

      marginTop: 12,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.white,
    },


    closeRemoveButtonText: {
      color:
        COLORS.maroon,

      fontSize: 12,

      fontWeight:
        '700',
    },


    /* ======================================================================
       CONFIRM REMOVE
       ====================================================================== */

    confirmModal: {
      width:
        '100%',

      maxWidth: 390,

      alignItems:
        'center',

      paddingHorizontal: 24,

      paddingVertical: 26,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        COLORS.gray,

      backgroundColor:
        COLORS.cream,

      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      shadowOpacity: 0.28,

      shadowRadius: 12,

      elevation: 10,
    },


    confirmIcon: {
      width: 58,

      height: 58,

      borderRadius: 29,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.white,
    },


    confirmTitle: {
      marginTop: 14,

      color:
        COLORS.maroon,

      fontSize: 19,

      fontWeight:
        '800',
    },


    confirmText: {
      marginTop: 11,

      color:
        COLORS.darkTeal,

      fontSize: 12,

      lineHeight: 18,

      textAlign:
        'center',
    },


    confirmStrong: {
      color:
        COLORS.maroon,

      fontWeight:
        '800',
    },


    confirmSmall: {
      marginTop: 9,

      color:
        COLORS.metaGray,

      fontSize: 9.5,

      lineHeight: 14,

      textAlign:
        'center',
    },


    confirmButtons: {
      width:
        '100%',

      flexDirection:
        'row',

      marginTop: 20,

      gap: 10,
    },


    confirmCancelButton: {
      flex: 1,

      height: 45,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        COLORS.maroon,

      backgroundColor:
        COLORS.white,
    },


    confirmCancelText: {
      color:
        COLORS.maroon,

      fontSize: 12,

      fontWeight:
        '700',
    },


    confirmRemoveButton: {
      flex: 1,

      height: 45,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 10,

      backgroundColor:
        COLORS.maroon,
    },


    confirmRemoveText: {
      color:
        COLORS.white,

      fontSize: 12,

      fontWeight:
        '800',
    },
  });