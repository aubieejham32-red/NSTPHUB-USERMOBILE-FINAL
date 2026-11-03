import {
    useState,
} from 'react';

import {
    ActivityIndicator,
    Image,
    StyleSheet,
    View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

import Svg, {
    Path,
} from 'react-native-svg';


/*
|--------------------------------------------------------------------------
| NSTP HUB Colors
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


/*
|--------------------------------------------------------------------------
| NSTP HUB Logo
|--------------------------------------------------------------------------
|
| This file is located at:
|
| components/NstpRegistrationHeader.js
|
| Therefore:
|
| ../assets/images/nstphub_logo.png
|
*/

const NSTP_HUB_LOGO =
  require(
    '../assets/images/nstphub_logo.png'
  );


/*
|--------------------------------------------------------------------------
| NSTP Registration Header
|--------------------------------------------------------------------------
|
| Props:
|
| university
| loading
|
| Example:
|
| <NstpRegistrationHeader
|   university={university}
|   loading={loading}
| />
|
*/

export default function NstpRegistrationHeader({
  university,
  loading = false,
}) {
  /*
  |--------------------------------------------------------------------------
  | University Logo Failed
  |--------------------------------------------------------------------------
  */

  const [
    universityLogoFailed,
    setUniversityLogoFailed,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | University Logo Available
  |--------------------------------------------------------------------------
  */

  const hasUniversityLogo =
    Boolean(
      university?.logo_url
    )
    &&
    !universityLogoFailed;


  return (
    <View
      style={
        styles.header
      }
    >

      {/*
      |--------------------------------------------------------------------------
      | University Logo - LEFT
      |--------------------------------------------------------------------------
      |
      | university.logo_url comes from Laravel.
      |
      */}

      <View
        style={
          styles.universityLogoPosition
        }
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              COLORS.white
            }
          />

        ) : hasUniversityLogo ? (
          <UniversityLogoBadge
            uri={
              university.logo_url
            }
            onError={(
              event
            ) => {
              console.error(
                'University logo failed:',
                university?.logo_url,
                event
                  ?.nativeEvent
                  ?.error
              );


              setUniversityLogoFailed(
                true
              );
            }}
          />

        ) : (
          <View
            style={
              styles.universityFallback
            }
          >
            <Ionicons
              name="school-outline"
              size={
                28
              }
              color={
                COLORS.white
              }
            />
          </View>
        )}
      </View>


      {/*
      |--------------------------------------------------------------------------
      | NSTP HUB Logo - RIGHT
      |--------------------------------------------------------------------------
      */}

      <View
        style={
          styles.nstpLogoPosition
        }
      >
        <NstpLogoBadge />
      </View>


      {/*
      |--------------------------------------------------------------------------
      | Cream Wave
      |--------------------------------------------------------------------------
      */}

      <Svg
        width="100%"
        height="105"
        viewBox="0 0 390 105"
        preserveAspectRatio="none"
        style={
          styles.wave
        }
      >
        <Path
          d="
            M0 48
            C58 10 122 5 184 27
            C250 51 320 92 390 52
            L390 105
            L0 105
            Z
          "
          fill={
            COLORS.cream
          }
        />
      </Svg>

    </View>
  );
}


/*
|--------------------------------------------------------------------------
| University Logo Badge
|--------------------------------------------------------------------------
*/

function UniversityLogoBadge({
  uri,
  onError,
}) {
  return (
    <View
      style={
        styles.universityLogoOutline
      }
    >
      <Image
        source={{
          uri,
        }}
        style={
          styles.universityLogo
        }
        resizeMode="contain"
        onError={
          onError
        }
      />
    </View>
  );
}


/*
|--------------------------------------------------------------------------
| NSTP HUB Logo Badge
|--------------------------------------------------------------------------
*/

function NstpLogoBadge() {
  return (
    <View
      style={
        styles.nstpBadge
      }
    >

      {/*
      |--------------------------------------------------------------------------
      | Thin White Outline
      |--------------------------------------------------------------------------
      */}

      <Image
        source={
          NSTP_HUB_LOGO
        }
        style={
          styles.nstpLogoOutline
        }
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
          styles.nstpLogo
        }
        resizeMode="contain"
      />

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
    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */

    header: {
      height:
        196,

      position:
        'relative',

      overflow:
        'hidden',

      backgroundColor:
        COLORS.maroon,
    },


    /*
    |--------------------------------------------------------------------------
    | University Logo Position
    |--------------------------------------------------------------------------
    */

    universityLogoPosition: {
      position:
        'absolute',

      zIndex:
        10,

      top:
        17,

      left:
        25,

      width:
        76,

      height:
        76,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | University Logo Thin Outline
    |--------------------------------------------------------------------------
    */

    universityLogoOutline: {
      width:
        68,

      height:
        68,

      borderRadius:
        34,

      borderWidth:
        1,

      borderColor:
        COLORS.white,

      backgroundColor:
        'transparent',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | University Logo
    |--------------------------------------------------------------------------
    */

    universityLogo: {
      width:
        65,

      height:
        65,

      borderRadius:
        32.5,
    },


    /*
    |--------------------------------------------------------------------------
    | University Fallback
    |--------------------------------------------------------------------------
    */

    universityFallback: {
      width:
        66,

      height:
        66,

      borderRadius:
        33,

      borderWidth:
        1,

      borderColor:
        COLORS.white,

      backgroundColor:
        'transparent',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | NSTP HUB Logo Position
    |--------------------------------------------------------------------------
    */

    nstpLogoPosition: {
      position:
        'absolute',

      zIndex:
        10,

      top:
        8,

      right:
        22,

      width:
        88,

      height:
        110,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | NSTP HUB Badge
    |--------------------------------------------------------------------------
    */

    nstpBadge: {
      width:
        88,

      height:
        110,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    /*
    |--------------------------------------------------------------------------
    | NSTP HUB White Outline
    |--------------------------------------------------------------------------
    */

    nstpLogoOutline: {
      position:
        'absolute',

      width:
        84,

      height:
        106,
    },


    /*
    |--------------------------------------------------------------------------
    | NSTP HUB Original Logo
    |--------------------------------------------------------------------------
    */

    nstpLogo: {
      position:
        'absolute',

      width:
        81,

      height:
        103,
    },


    /*
    |--------------------------------------------------------------------------
    | Cream Wave
    |--------------------------------------------------------------------------
    */

    wave: {
      position:
        'absolute',

      left:
        0,

      right:
        0,

      bottom:
        -1,

      zIndex:
        2,
    },
  });