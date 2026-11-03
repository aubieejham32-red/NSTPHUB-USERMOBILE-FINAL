import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function App() {
  const [modalVisible, setModalVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Input States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3EFE6" />

      {/* Account Settings Box */}
      <View style={styles.card}>
        <Text style={styles.headerText}>ACCOUNT SETTINGS</Text>
        <Text style={styles.subtext}>
          Customize your personalized settings and account configurations.
        </Text>
        
        <View style={styles.buttonContainer}>
          {/* Change Password Button */}
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.7} 
            onPress={() => setModalVisible(true)}
          >
            <MaterialCommunityIcons name="lock-outline" size={22} color="#5D251D" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <FontAwesome5 name="edit" size={18} color="#5D251D" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dark Mode Row */}
      <View style={styles.darkModeRow}>
        <View style={styles.darkModeLeft}>
          <MaterialCommunityIcons name="weather-night" size={26} color="#253C47" style={styles.moonIcon} />
          <Text style={styles.darkModeText}>Enable dark mode</Text>
        </View>
        <Switch
          trackColor={{ false: '#5D251D', true: '#8FBC8F' }}
          thumbColor="#F3EFE6"
          ios_backgroundColor="#5D251D"
          onValueChange={toggleSwitch}
          value={isDarkMode}
        />
      </View>

      {/* Change Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Header Section */}
            <View style={styles.modalHeaderContainer}>
              <View style={styles.modalHeaderTexts}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <Text style={styles.modalSubtitle}>Update your password to keep your account secure.</Text>
              </View>
              
              {/* Absolute Positioned Close Button aligned perfectly with header line */}
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)} 
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
              >
                <Ionicons name="close" size={24} color="#5D251D" />
              </TouchableOpacity>
            </View>

            {/* Input Form Fields */}
            <View style={styles.form}>
              
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="enter current password"
                    placeholderTextColor="#7A8B99"
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                    <Feather name={showCurrent ? "eye" : "eye-off"} size={20} color="#253C47" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="enter new password"
                    placeholderTextColor="#7A8B99"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                    <Feather name={showNew ? "eye" : "eye-off"} size={20} color="#253C47" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="confirm new password"
                    placeholderTextColor="#7A8B99"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                    <Feather name={showConfirm ? "eye" : "eye-off"} size={20} color="#253C47" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Changes Button */}
              <TouchableOpacity 
                style={styles.saveButton} 
                activeOpacity={0.8}
                onPress={() => {
                  alert('Password updated successfully!');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EFE6', // Light beige base
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  card: {
    borderWidth: 1,
    borderColor: '#C8C4B7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#556B2F', // Olive green header
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 12,
    color: '#4A4A4A',
    lineHeight: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8C4B7',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flex: 0.49, // Expanded widths to fit tight gaps smoothly
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    color: '#5D251D', 
    fontFamily: 'serif',
    fontWeight: '500',
  },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#C8C4B7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  darkModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moonIcon: {
    transform: [{ rotate: '-20deg' }],
    marginRight: 10,
  },
  darkModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#253C47', // Deep slate gray text
  },

  // Modal Specific Layout
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)', // Light shadowy backdrop overlay
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B0B5B3',
    width: '100%',
    maxWidth: 360,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeaderContainer: {
    position: 'relative',
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  modalHeaderTexts: {
    flex: 1,
    paddingRight: 30, // Protects text layout from overlap
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D251D',
    lineHeight: 26,
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#55616B',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 2, // Keeps cross aligned cleanly beside "Change Password"
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#5D251D',
    fontFamily: 'serif',
    marginBottom: 6,
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38535D',
    borderRadius: 22, // Makes text input pill-shaped
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 12.5,
    color: '#253C47',
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 12,
    fontWeight: '600',
  },
  eyeIcon: {
    marginLeft: 8,
    marginRight: 4,
    paddingVertical: 11,
  },
  saveButton: {
    backgroundColor: '#556B2F',
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});