import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import type {
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import * as ImagePicker from 'expo-image-picker';

import {
  router,
  Tabs,
} from 'expo-router';

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  getStudentProfile,
  updateStudentProfilePhoto,
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
  dark: '#0D171B',
};


const LIGHT_THEME = {
  surface: COLORS.cream,
  surfaceRaised: COLORS.white,
  text: COLORS.darkTeal,
  mutedText: COLORS.darkTeal,
  icon: COLORS.darkTeal,
  border: 'rgba(190,190,190,0.65)',
  divider: COLORS.gray,
  shadow: COLORS.nearBlack,
};

const DARK_THEME = {
  surface: '#233E47',
  surfaceRaised: '#000D12',
  text: '#EFEBE2',
  mutedText: '#EFEBE2',
  icon: '#EFEBE2',
  border: '#58761C',
  divider: '#58761C',
  shadow: '#000D12',
  accent: '#D99202',
  success: '#58761C',
};


/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type IoniconName =
  React.ComponentProps<
    typeof Ionicons
  >['name'];


type MenuItemProps = {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  active?: boolean;
};


/*
|--------------------------------------------------------------------------
| Menu Item
|--------------------------------------------------------------------------
|
| Uses filled/bold Ionicons for consistent visual weight.
|
*/

function MenuItem({
  icon,
  label,
  onPress,
  active = false,
}: MenuItemProps) {
  const {
    isDarkMode,
  } = useAppTheme();

  const theme =
    isDarkMode
      ? DARK_THEME
      : LIGHT_THEME;

  return (
    <Pressable
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.menuItem,

        active &&
          styles.menuItemActive,

        pressed &&
          styles.menuItemPressed,
      ]}
    >
      <View
        style={[
          styles.menuIconContainer,

          active &&
            styles.menuIconContainerActive,

          {
            backgroundColor:
              isDarkMode
                ? theme.surfaceRaised
                : COLORS.white,
          },
        ]}
      >
        <Ionicons
          name={
            icon
          }
          size={
            20
          }
          color={
            active
              ? COLORS.orange
              : theme.icon
          }
        />
      </View>


      <Text
        style={[
          styles.menuText,

          {
            color:
              active
                ? COLORS.orange
                : theme.text,
          },

          active &&
            styles.menuTextActive,
        ]}
      >
        {
          label
        }
      </Text>
    </Pressable>
  );
}


/*
|--------------------------------------------------------------------------
| Standard Navigation Button
|--------------------------------------------------------------------------
|
| The icon stays filled/bold in both active and inactive states.
| Active state is controlled using color and the bottom indicator.
|
*/

function NavigationButton({
  active,
  icon,
  size = 27,
  onPress,
}: {
  active: boolean;
  icon: IoniconName;
  size?: number;
  onPress: () => void;
}) {
  const {
    isDarkMode,
  } = useAppTheme();

  const theme =
    isDarkMode
      ? DARK_THEME
      : LIGHT_THEME;

  return (
    <Pressable
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.tabButton,

        pressed &&
          styles.tabButtonPressed,
      ]}
    >
      <Ionicons
        name={
          icon
        }
        size={
          size
        }
        color={
          active
            ? COLORS.orange
            : theme.icon
        }
      />


      {
        active &&
        (
          <View
            style={
              styles.activeIndicator
            }
          />
        )
      }
    </Pressable>
  );
}


/*
|--------------------------------------------------------------------------
| Digital Student ID Button
|--------------------------------------------------------------------------
|
| Uses the filled card-account-details icon at all times so it has
| the same strong visual weight as the other navigation icons.
|
*/

function DigitalIdButton({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  const {
    isDarkMode,
  } = useAppTheme();

  const theme =
    isDarkMode
      ? DARK_THEME
      : LIGHT_THEME;

  return (
    <Pressable
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.tabButton,

        pressed &&
          styles.tabButtonPressed,
      ]}
    >
      <MaterialCommunityIcons
        name="card-account-details"
        size={
          29
        }
        color={
          active
            ? COLORS.orange
            : theme.icon
        }
      />


      {
        active &&
        (
          <View
            style={
              styles.activeIndicator
            }
          />
        )
      }
    </Pressable>
  );
}


/*
|--------------------------------------------------------------------------
| Custom Bottom Navigation
|--------------------------------------------------------------------------
*/

function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets =
    useSafeAreaInsets();

  const {
    isDarkMode,
  } = useAppTheme();

  const theme =
    isDarkMode
      ? DARK_THEME
      : LIGHT_THEME;


  const [
    moreVisible,
    setMoreVisible,
  ] = useState(
    false
  );


  const [
    profilePhotoUrl,
    setProfilePhotoUrl,
  ] = useState<
    string | null
  >(
    null
  );


  const [
    loadingProfilePhoto,
    setLoadingProfilePhoto,
  ] = useState(
    true
  );


  const [
    uploadingProfilePhoto,
    setUploadingProfilePhoto,
  ] = useState(
    false
  );


  /*
  |--------------------------------------------------------------------------
  | Current Route
  |--------------------------------------------------------------------------
  */

  const currentRouteName =
    state.routes[
      state.index
    ]?.name;


  /*
  |--------------------------------------------------------------------------
  | Profile Route
  |--------------------------------------------------------------------------
  */

  const isProfileActive =
    currentRouteName ===
      'Profile/ProfileScreen';


  /*
  |--------------------------------------------------------------------------
  | More Section Active
  |--------------------------------------------------------------------------
  */

  const isMoreSectionActive =
    currentRouteName ===
      'ReportScreen'
    ||
    currentRouteName ===
      'ExcuseLetterScreen'
    ||
    currentRouteName ===
      'AttendanceRecordScreen'
    ||
    currentRouteName ===
      'AccountSettingsScreen';


  /*
  |--------------------------------------------------------------------------
  | Navigate To Tab
  |--------------------------------------------------------------------------
  */

  const navigateToTab = (
    routeName: string
  ) => {
    setMoreVisible(
      false
    );


    const route =
      state.routes.find(
        item =>
          item.name ===
          routeName
      );


    if (
      !route
    ) {
      console.warn(
        `Route "${routeName}" was not found.`
      );

      return;
    }


    const event =
      navigation.emit({
        type:
          'tabPress',

        target:
          route.key,

        canPreventDefault:
          true,
      });


    if (
      !event.defaultPrevented
    ) {
      navigation.navigate(
        route.name
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Load Saved Profile Photo
  |--------------------------------------------------------------------------
  |
  | Shared by:
  |
  | CWTS
  | LTS
  | ROTC
  |
  */

  const loadProfilePhoto =
    useCallback(
      async () => {
        try {
          const data =
            await getStudentProfile();


          const photoUrl =
            data
              ?.student
              ?.profile_photo_url
            ??
            null;


          setProfilePhotoUrl(
            photoUrl
          );

        } catch (
          error
        ) {
          console.warn(
            'Unable to load profile photo:',
            error
          );

        } finally {
          setLoadingProfilePhoto(
            false
          );
        }
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Initial Profile Photo
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      void loadProfilePhoto();
    },
    [
      loadProfilePhoto,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Refresh Profile Photo
  |--------------------------------------------------------------------------
  |
  | When the student enters the Profile screen, reload the image from Laravel.
  |
  */

  useEffect(
    () => {
      if (
        isProfileActive
      ) {
        void loadProfilePhoto();
      }
    },
    [
      isProfileActive,
      loadProfilePhoto,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Select And Save Profile Photo
  |--------------------------------------------------------------------------
  |
  | Available to:
  |
  | CWTS
  | LTS
  | ROTC
  |
  */

  const handleChangeProfilePhoto =
    async () => {
      if (
        uploadingProfilePhoto
      ) {
        return;
      }


      try {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();


        if (
          !permission.granted
        ) {
          Alert.alert(
            'Photo Permission Required',
            'NSTP HUB needs permission to access your photos so you can choose a profile picture.'
          );

          return;
        }


        const result =
          await ImagePicker
            .launchImageLibraryAsync({
              mediaTypes: [
                'images',
              ],

              allowsEditing:
                true,

              aspect: [
                1,
                1,
              ],

              quality:
                0.85,
            });


        if (
          result.canceled
          ||
          !result.assets
            ?.length
        ) {
          return;
        }


        const asset =
          result.assets[
            0
          ];


        if (
          !asset?.uri
        ) {
          throw new Error(
            'The selected image could not be read.'
          );
        }


        const fileSize =
          Number(
            asset.fileSize
            ??
            0
          );


        if (
          fileSize >
          5 *
          1024 *
          1024
        ) {
          Alert.alert(
            'Photo Too Large',
            'Please choose a profile photo smaller than 5 MB.'
          );

          return;
        }


        setUploadingProfilePhoto(
          true
        );


        /*
        |--------------------------------------------------------------------------
        | Temporary Local Preview
        |--------------------------------------------------------------------------
        */

        setProfilePhotoUrl(
          asset.uri
        );


        /*
        |--------------------------------------------------------------------------
        | Save To Laravel
        |--------------------------------------------------------------------------
        */

        const response =
          await updateStudentProfilePhoto({
            uri:
              asset.uri,

            name:
              asset.fileName
              ??
              `nstp-profile-${Date.now()}.jpg`,

            mimeType:
              asset.mimeType
              ??
              'image/jpeg',
          });


        /*
        |--------------------------------------------------------------------------
        | Replace Preview With Laravel URL
        |--------------------------------------------------------------------------
        */

        if (
          response
            ?.profile_photo_url
        ) {
          setProfilePhotoUrl(
            response
              .profile_photo_url
          );
        }


        Alert.alert(
          'Profile Photo Updated',
          'Your profile picture was saved successfully.'
        );

      } catch (
        error
      ) {
        console.error(
          'Profile photo upload error:',
          error
        );


        /*
        |--------------------------------------------------------------------------
        | Restore Photo From Laravel
        |--------------------------------------------------------------------------
        */

        await loadProfilePhoto();


        Alert.alert(
          'Unable to Save Photo',
          error instanceof Error
            ? error.message
            : 'Your profile picture could not be saved.'
        );

      } finally {
        setUploadingProfilePhoto(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | More Menu
  |--------------------------------------------------------------------------
  */

  const toggleMoreMenu =
    () => {
      setMoreVisible(
        current =>
          !current
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Excuse Letter
  |--------------------------------------------------------------------------
  */

  const openExcuseLetter =
    () => {
      navigateToTab(
        'ExcuseLetterScreen'
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout =
    () => {
      setMoreVisible(
        false
      );


      /*
      |--------------------------------------------------------------------------
      | Important
      |--------------------------------------------------------------------------
      |
      | Do NOT call logoutStudent() here.
      |
      | app/Logout.js still needs the current Sanctum token so Laravel can:
      |
      | 1. identify the current student
      | 2. save the safe account information for the account chooser
      | 3. preserve the university context
      | 4. revoke the current Sanctum token
      |
      | Logout.js + MobileLogoutController now own the actual logout process.
      |
      */

      Alert.alert(
        'Logout',
        'Are you sure you want to log out of NSTP HUB?',
        [
          {
            text:
              'Cancel',

            style:
              'cancel',
          },

          {
            text:
              'Logout',

            style:
              'destructive',

            onPress:
              () => {
                router.replace(
                  '/Logout'
                );
              },
          },
        ]
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Safe Bottom Position
  |--------------------------------------------------------------------------
  */

  const safeBottom =
    Math.max(
      insets.bottom,
      8
    );


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <View
      pointerEvents="box-none"
      style={
        StyleSheet.absoluteFillObject
      }
    >

      {/*
      |--------------------------------------------------------------------------
      | More Popup
      |--------------------------------------------------------------------------
      */}

      {
        moreVisible &&
        (
          <View
            style={[
              styles.moreMenu,

              {
                bottom:
                  safeBottom +
                  72,

                backgroundColor:
                  theme.surface,

                borderColor:
                  theme.border,

                shadowColor:
                  theme.shadow,
              },
            ]}
          >
            <View
              style={
                styles.moreMenuHeader
              }
            >
              <View>
                <Text
                  style={[
                    styles.moreMenuEyebrow,

                    {
                      color:
                        isDarkMode
                          ? COLORS.orange
                          : COLORS.green,
                    },
                  ]}
                >
                  NSTP HUB
                </Text>


                <Text
                  style={[
                    styles.moreMenuTitle,

                    {
                      color:
                        isDarkMode
                          ? theme.text
                          : COLORS.maroon,
                    },
                  ]}
                >
                  MORE
                </Text>
              </View>


              <Pressable
                onPress={() =>
                  setMoreVisible(
                    false
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.moreCloseButton,

                  {
                    backgroundColor:
                      theme.surfaceRaised,
                  },

                  pressed &&
                    styles.moreCloseButtonPressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={
                    18
                  }
                  color={
                    theme.icon
                  }
                />
              </Pressable>
            </View>


            <View
              style={[
                styles.moreDivider,

                {
                  backgroundColor:
                    theme.divider,
                },
              ]}
            />


            {/*
            |--------------------------------------------------------------------------
            | Report
            |--------------------------------------------------------------------------
            |
            | Filled icon for consistent bold weight.
            |
            */}

            <MenuItem
              icon="document-text"
              label="REPORT"
              active={
                currentRouteName ===
                'ReportScreen'
              }
              onPress={() =>
                navigateToTab(
                  'ReportScreen'
                )
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | Excuse Letter
            |--------------------------------------------------------------------------
            */}

            <MenuItem
              icon="mail"
              label="EXCUSE LETTER"
              active={
                currentRouteName ===
                'ExcuseLetterScreen'
              }
              onPress={
                openExcuseLetter
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | Attendance
            |--------------------------------------------------------------------------
            */}

            <MenuItem
              icon="clipboard"
              label="ATTENDANCE RECORD"
              active={
                currentRouteName ===
                'AttendanceRecordScreen'
              }
              onPress={() =>
                navigateToTab(
                  'AttendanceRecordScreen'
                )
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | Account Settings
            |--------------------------------------------------------------------------
            */}

            <MenuItem
              icon="settings"
              label="ACCOUNT SETTINGS"
              active={
                currentRouteName ===
                'AccountSettingsScreen'
              }
              onPress={() =>
                navigateToTab(
                  'AccountSettingsScreen'
                )
              }
            />


            {/*
            |--------------------------------------------------------------------------
            | Logout
            |--------------------------------------------------------------------------
            */}

            <Pressable
              onPress={
                handleLogout
              }
              style={({
                pressed,
              }) => [
                styles.logoutButton,

                isDarkMode && {
                  backgroundColor:
                    COLORS.green,
                },

                pressed &&
                  styles.logoutButtonPressed,
              ]}
            >
              <View
                style={
                  styles.logoutIcon
                }
              >
                <Ionicons
                  name="log-out"
                  size={
                    18
                  }
                  color={
                    isDarkMode
                      ? COLORS.cream
                      : COLORS.white
                  }
                />
              </View>


              <Text
                style={[
                  styles.logoutText,

                  isDarkMode && {
                    color:
                      COLORS.cream,
                  },
                ]}
              >
                LOGOUT
              </Text>
            </Pressable>
          </View>
        )
      }


      {/*
      |--------------------------------------------------------------------------
      | Bottom Navigation
      |--------------------------------------------------------------------------
      */}

      <View
        pointerEvents="box-none"
        style={[
          styles.bottomRow,

          {
            bottom:
              safeBottom,
          },
        ]}
      >

        {/*
        |--------------------------------------------------------------------------
        | Cream Navigation Pill
        |--------------------------------------------------------------------------
        */}

        <View
          style={[
            styles.tabPill,

            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,

              shadowColor:
                theme.shadow,
            },
          ]}
        >

          {/*
          |--------------------------------------------------------------------------
          | Home
          |--------------------------------------------------------------------------
          */}

          <NavigationButton
            active={
              currentRouteName ===
              'HomepageScreen'
            }
            icon="home"
            onPress={() =>
              navigateToTab(
                'HomepageScreen'
              )
            }
          />


          {/*
          |--------------------------------------------------------------------------
          | Digital ID
          |--------------------------------------------------------------------------
          */}

          <DigitalIdButton
            active={
              currentRouteName ===
              'DigitalID'
            }
            onPress={() =>
              navigateToTab(
                'DigitalID'
              )
            }
          />


          {/*
          |--------------------------------------------------------------------------
          | Schedule
          |--------------------------------------------------------------------------
          */}

          <NavigationButton
            active={
              currentRouteName ===
              'Schedule'
            }
            icon="calendar"
            onPress={() =>
              navigateToTab(
                'Schedule'
              )
            }
          />


          {/*
          |--------------------------------------------------------------------------
          | Announcements
          |--------------------------------------------------------------------------
          */}

          <NavigationButton
            active={
              currentRouteName ===
              'AnnouncementsScreen'
            }
            icon="megaphone"
            size={
              28
            }
            onPress={() =>
              navigateToTab(
                'AnnouncementsScreen'
              )
            }
          />


          {/*
          |--------------------------------------------------------------------------
          | More
          |--------------------------------------------------------------------------
          |
          | ellipsis-horizontal is already visually bold.
          |
          */}

          <Pressable
            onPress={
              toggleMoreMenu
            }
            style={({
              pressed,
            }) => [
              styles.tabButton,

              pressed &&
                styles.tabButtonPressed,
            ]}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={
                30
              }
              color={
                moreVisible
                ||
                isMoreSectionActive
                  ? COLORS.orange
                  : theme.icon
              }
            />


            {
              (
                moreVisible
                ||
                isMoreSectionActive
              )
              &&
              (
                <View
                  style={
                    styles.activeIndicator
                  }
                />
              )
            }
          </Pressable>
        </View>


        {/*
        |--------------------------------------------------------------------------
        | Profile Section
        |--------------------------------------------------------------------------
        */}

        <View
          style={
            styles.profileContainer
          }
        >
          <Pressable
            onPress={() =>
              navigateToTab(
                'Profile/ProfileScreen'
              )
            }
            style={({
              pressed,
            }) => [
              styles.profileButton,

              {
                backgroundColor:
                  theme.surface,

                borderColor:
                  theme.border,

                shadowColor:
                  theme.shadow,
              },

              isProfileActive &&
                styles.profileButtonActive,

              pressed &&
                styles.profileButtonPressed,
            ]}
          >

            {
              loadingProfilePhoto
              ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      theme.icon
                    }
                  />
                )

              : profilePhotoUrl
                ? (
                    <Image
                      source={{
                        uri:
                          profilePhotoUrl,
                      }}
                      style={
                        styles.profileImage
                      }
                      resizeMode="cover"
                    />
                  )

                : (
                    <Ionicons
                      name="person"
                      size={
                        28
                      }
                      color={
                        isProfileActive
                          ? COLORS.orange
                          : theme.icon
                      }
                    />
                  )
            }


            {
              isProfileActive &&
              (
                <View
                  style={
                    styles.profileActiveIndicator
                  }
                />
              )
            }
          </Pressable>


          {/*
          |--------------------------------------------------------------------------
          | Camera Badge
          |--------------------------------------------------------------------------
          */}

          <Pressable
            disabled={
              uploadingProfilePhoto
            }
            onPress={
              handleChangeProfilePhoto
            }
            style={({
              pressed,
            }) => [
              styles.profileCameraButton,

              {
                borderColor:
                  theme.surface,
              },

              pressed &&
                styles.profileCameraButtonPressed,

              uploadingProfilePhoto &&
                styles.profileCameraButtonDisabled,
            ]}
          >
            {
              uploadingProfilePhoto
                ? (
                    <ActivityIndicator
                      size={
                        12
                      }
                      color={
                        COLORS.white
                      }
                    />
                  )

                : (
                    <Ionicons
                      name="camera"
                      size={
                        13
                      }
                      color={
                        COLORS.white
                      }
                    />
                  )
            }
          </Pressable>
        </View>
      </View>
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| Tab Layout
|--------------------------------------------------------------------------
*/

export default function TabLayout() {
  return (
    <Tabs
      tabBar={
        props => (
          <CustomTabBar
            {...props}
          />
        )
      }
      screenOptions={{
        headerShown:
          false,

        // The custom tab bar floats over each scene. Reserve physical
        // content space so text and buttons are not hidden beneath it.
        sceneStyle: {
          paddingBottom: 92,
        },

        tabBarHideOnKeyboard:
          true,


        /*
        |--------------------------------------------------------------------------
        | Remove Native Full-Width Tab Background
        |--------------------------------------------------------------------------
        */

        tabBarStyle: {
          position:
            'absolute',

          left:
            0,

          right:
            0,

          bottom:
            0,

          height:
            0,

          backgroundColor:
            'transparent',

          borderTopWidth:
            0,

          elevation:
            0,

          shadowOpacity:
            0,
        },


        tabBarBackground:
          () => (
            <View
              style={
                styles.nativeTabBackground
              }
            />
          ),
      }}
    >

      {/*
      |--------------------------------------------------------------------------
      | Main Navigation
      |--------------------------------------------------------------------------
      */}

      <Tabs.Screen
        name="HomepageScreen"
        options={{
          title:
            'Home',
        }}
      />


      <Tabs.Screen
        name="DigitalID"
        options={{
          title:
            'Digital ID',
        }}
      />


      <Tabs.Screen
        name="Schedule"
        options={{
          title:
            'Schedule',
        }}
      />


      <Tabs.Screen
        name="AnnouncementsScreen"
        options={{
          title:
            'Announcements',
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | More Menu Screens
      |--------------------------------------------------------------------------
      */}

      <Tabs.Screen
        name="ReportScreen"
        options={{
          title:
            'Reports',
        }}
      />


      <Tabs.Screen
        name="ExcuseLetterScreen"
        options={{
          title:
            'Excuse Letter',
        }}
      />


      <Tabs.Screen
        name="AttendanceRecordScreen"
        options={{
          title:
            'Attendance Record',
        }}
      />


      <Tabs.Screen
        name="AccountSettingsScreen"
        options={{
          title:
            'Account Settings',
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | Student Profile
      |--------------------------------------------------------------------------
      */}

      <Tabs.Screen
        name="Profile/ProfileScreen"
        options={{
          title:
            'Profile',
        }}
      />
    </Tabs>
  );
}


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({

    /*
    |--------------------------------------------------------------------------
    | Native Tab Background
    |--------------------------------------------------------------------------
    */

    nativeTabBackground: {
      flex:
        1,

      backgroundColor:
        'transparent',
    },


    /*
    |--------------------------------------------------------------------------
    | Bottom Floating Row
    |--------------------------------------------------------------------------
    */

    bottomRow: {
      position:
        'absolute',

      left:
        10,

      right:
        10,

      height:
        62,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        'transparent',
    },


    /*
    |--------------------------------------------------------------------------
    | Navigation Pill
    |--------------------------------------------------------------------------
    */

    tabPill: {
      flex:
        1,

      height:
        60,

      borderRadius:
        32,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-around',

      paddingHorizontal:
        7,

      backgroundColor:
        COLORS.cream,

      borderWidth:
        1,

      borderColor:
        'rgba(190, 190, 190, 0.55)',


      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          4,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        8,

      elevation:
        8,
    },


    /*
    |--------------------------------------------------------------------------
    | Tab Button
    |--------------------------------------------------------------------------
    */

    tabButton: {
      flex:
        1,

      height:
        60,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'transparent',
    },


    tabButtonPressed: {
      opacity:
        0.62,

      transform: [
        {
          scale:
            0.92,
        },
      ],
    },


    /*
    |--------------------------------------------------------------------------
    | Active Indicator
    |--------------------------------------------------------------------------
    */

    activeIndicator: {
      position:
        'absolute',

      bottom:
        5,

      width:
        17,

      height:
        3,

      borderRadius:
        2,

      backgroundColor:
        COLORS.orange,
    },


    /*
    |--------------------------------------------------------------------------
    | Profile Container
    |--------------------------------------------------------------------------
    */

    profileContainer: {
      width:
        64,

      height:
        64,

      marginLeft:
        9,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | Profile Button
    |--------------------------------------------------------------------------
    */

    profileButton: {
      width:
        60,

      height:
        60,

      position:
        'relative',

      overflow:
        'hidden',

      borderRadius:
        30,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.cream,

      borderWidth:
        1.5,

      borderColor:
        'rgba(190,190,190,0.65)',


      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          4,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        8,

      elevation:
        8,
    },


    profileButtonActive: {
      borderColor:
        COLORS.orange,

      borderWidth:
        2,
    },


    profileButtonPressed: {
      opacity:
        0.76,

      transform: [
        {
          scale:
            0.94,
        },
      ],
    },


    /*
    |--------------------------------------------------------------------------
    | Actual Profile Image
    |--------------------------------------------------------------------------
    */

    profileImage: {
      width:
        '100%',

      height:
        '100%',

      borderRadius:
        30,
    },


    /*
    |--------------------------------------------------------------------------
    | Profile Active Indicator
    |--------------------------------------------------------------------------
    */

    profileActiveIndicator: {
      position:
        'absolute',

      bottom:
        4,

      width:
        17,

      height:
        3,

      borderRadius:
        2,

      backgroundColor:
        COLORS.orange,
    },


    /*
    |--------------------------------------------------------------------------
    | Profile Camera Badge
    |--------------------------------------------------------------------------
    */

    profileCameraButton: {
      position:
        'absolute',

      right:
        -1,

      bottom:
        -1,

      width:
        24,

      height:
        24,

      zIndex:
        20,

      borderRadius:
        12,

      borderWidth:
        2,

      borderColor:
        COLORS.cream,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.green,

      elevation:
        12,


      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          2,
      },

      shadowOpacity:
        0.24,

      shadowRadius:
        4,
    },


    profileCameraButtonPressed: {
      opacity:
        0.72,

      transform: [
        {
          scale:
            0.9,
        },
      ],
    },


    profileCameraButtonDisabled: {
      opacity:
        0.65,
    },


    /*
    |--------------------------------------------------------------------------
    | More Menu
    |--------------------------------------------------------------------------
    */

    moreMenu: {
      position:
        'absolute',

      right:
        18,

      width:
        232,

      padding:
        12,

      borderRadius:
        20,

      backgroundColor:
        COLORS.cream,

      borderWidth:
        1,

      borderColor:
        'rgba(190,190,190,0.65)',


      shadowColor:
        COLORS.nearBlack,

      shadowOffset: {
        width:
          0,

        height:
          8,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        14,

      elevation:
        14,

      zIndex:
        100,
    },


    /*
    |--------------------------------------------------------------------------
    | More Header
    |--------------------------------------------------------------------------
    */

    moreMenuHeader: {
      minHeight:
        44,

      paddingHorizontal:
        5,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },


    moreMenuEyebrow: {
      color:
        COLORS.green,

      fontSize:
        11,

      fontWeight:
        '800',

      letterSpacing:
        1.2,
    },


    moreMenuTitle: {
      marginTop:
        1,

      color:
        COLORS.maroon,

      fontSize:
        17,

      fontWeight:
        '900',

      letterSpacing:
        1.1,
    },


    moreCloseButton: {
      width:
        32,

      height:
        32,

      borderRadius:
        10,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    moreCloseButtonPressed: {
      opacity:
        0.62,
    },


    moreDivider: {
      height:
        1,

      marginTop:
        3,

      marginBottom:
        6,

      backgroundColor:
        COLORS.gray,

      opacity:
        0.42,
    },


    /*
    |--------------------------------------------------------------------------
    | Menu Items
    |--------------------------------------------------------------------------
    */

    menuItem: {
      minHeight:
        48,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        7,

      borderRadius:
        12,

      backgroundColor:
        'transparent',
    },


    menuItemActive: {
      backgroundColor:
        'rgba(217,146,2,0.10)',
    },


    menuItemPressed: {
      opacity:
        0.58,
    },


    menuIconContainer: {
      width:
        36,

      height:
        36,

      borderRadius:
        11,

      marginRight:
        8,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.white,
    },


    menuIconContainerActive: {
      backgroundColor:
        'rgba(255,189,54,0.18)',
    },


    menuText: {
      flex:
        1,

      color:
        COLORS.darkTeal,

      fontSize:
        13.5,

      fontWeight:
        '800',
    },


    menuTextActive: {
      color:
        COLORS.orange,

      fontWeight:
        '900',
    },


    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    logoutButton: {
      minHeight:
        44,

      marginTop:
        8,

      paddingHorizontal:
        10,

      borderRadius:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.maroon,
    },


    logoutIcon: {
      alignItems:
        'center',

      justifyContent:
        'center',
    },


    logoutButtonPressed: {
      opacity:
        0.78,
    },


    logoutButtonDisabled: {
      opacity:
        0.55,
    },


    logoutText: {
      marginLeft:
        7,

      color:
        COLORS.white,

      fontSize:
        13.5,

      fontWeight:
        '900',

      letterSpacing:
        0.8,
    },
  });
