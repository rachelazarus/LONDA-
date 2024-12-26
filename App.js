import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location"; // For fetching user location
import NetInfo from "@react-native-community/netinfo"; // For network status
import { Ionicons } from "@expo/vector-icons"; // Icons for menu and notifications
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // Icons for calendar, and other elements
import MaterialIcons from "@expo/vector-icons/MaterialIcons"; // Icons for location markers
import { FontAwesome } from "@expo/vector-icons"; // For user icons on schedule cards
export default function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [connectionType, setConnectionType] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(160)); // Initial height
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const pan = useRef(new Animated.Value(0)).current;
  const maxHeight = 700; // Maximum expansion height
  const minHeight = 160; // Minimum collapsed height
  const dragThreshold = 40; // Height threshold to complete the expansion (1 cm in pixels)

  // Fetch user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.002, // Adjust zoom level
        longitudeDelta: 0.002,
      });
    })();
  }, []);

  // Check network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnectionType(state.type);
      setIsOnline(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const toggleOnlineStatus = () => {
    setIsOnline((prevState) => !prevState);
  };
  
   const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false, // Ignore taps
    onMoveShouldSetPanResponder: (e, gestureState) => Math.abs(gestureState.dy) > 5, // Only respond to vertical drag
    onPanResponderMove: (e, gestureState) => {
      if (!expanded && gestureState.dy < 0) {
        let newHeight = Math.max(
          minHeight,
          Math.min(maxHeight, minHeight + gestureState.dy)
        );
        animation.setValue(newHeight);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dy < 0 && -gestureState.dy > dragThreshold) {
        setExpanded(true);
        Animated.timing(animation, {
          toValue: maxHeight,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else if (gestureState.dy > dragThreshold) {
        setExpanded(false);
        Animated.timing(animation, {
          toValue: minHeight,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    },
  });


  return (
    <View style={styles.container}>
      {/* Map */}
      {region ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
        >
          <Marker coordinate={region} />
        </MapView>
      ) : (
        <Text style={styles.loadingText}>
          {errorMsg || "Loading your location..."}
        </Text>
      )}

      {/* Top Menu Boxes */}
      <SafeAreaView style={styles.topMenu}>
        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBox}>
          <View style={styles.moneyContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <Text style={styles.moneyText}>0</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Status and Expandable Container */}
      <Animated.View
        style={[styles.expandableContainer, { height: animation }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.shortLine} />
        <Text style={styles.statusText}>
            You're {isOnline ? "Online" : "Offline"}
          </Text>
          <View style={styles.longLine} />
        {!expanded && (
          <Text style={styles.statusText}>
            You're {isOnline ? "Online" : "Offline"}
          </Text>
        )}

        {expanded && isOnline && (
          <View style={styles.bookingInfo}>
          {/* Title and Subtitle */}
          <Text style={styles.bookingText}>Set up your upcoming trip</Text>
          <Text style={styles.bookingSubText}>
            Tell us about your trip and help transport goods to everyone
          </Text>
        
          {/* Destination Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Your destination"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.iconContainer}>
              <MaterialIcons name="location-on" size={20} color="#B0BEC5" />
            </TouchableOpacity>
          </View>
        
          {/* "Set Up" Button */}
          <TouchableOpacity style={styles.setUpButton}>
            <Text style={styles.setUpButtonText}>Set Up</Text>
          </TouchableOpacity>
        
          {/* Schedule Section */}
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>My schedule</Text>
            <Text style={styles.scheduleSubtitle}>Upcoming</Text>
        
            {/* Booking Info Card */}
            <View style={styles.scheduleCard}>
              <View style={styles.cardHeader}>
                <FontAwesome name="users" size={24} color="#007AFF" />
                <Text style={styles.cardTitle}>15/07/2023 | San Jose</Text>
              </View>
        
              {/* Address List */}
              <View style={styles.addressContainer}>
                {/* Start Address */}
                <View style={styles.addressRow}>
                  <MaterialIcons name="circle" size={12} color="green" />
                  <View style={styles.addressDetails}>
                    <Text style={styles.addressTitle}>8 County Road 11/6</Text>
                    <Text style={styles.addressSubtitle}>
                      Mannington, WV, 26582 United States
                    </Text>
                  </View>
                </View>
        
                {/* Stop (optional) */}
                <View style={styles.addressRow}>
                  <MaterialIcons name="more-vert" size={12} color="gray" />
                </View>
        
                {/* End Address */}
                <View style={styles.addressRow}>
                  <MaterialIcons name="place" size={12} color="red" />
                  <View style={styles.addressDetails}>
                    <Text style={styles.addressTitle}>1124 Cave Road</Text>
                    <Text style={styles.addressSubtitle}>
                      Gillette, WV, 26582 United States
                    </Text>
                  </View>
                </View>
              </View>
            </View>
        
            {/* See All Schedule */}
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        )}

       
      </Animated.View>
      <View style= {styles.statusContainer}>
      <View style={styles.longLine} />
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={styles.iconBox2}>
            <MaterialCommunityIcons
              name="calendar-text-outline"
              size={24}
              color="#212121"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleOnlineStatus}>
            <Text style={styles.toggleButtonText}>
              {isOnline ? "Go Offline" : "Go Online"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBox2}>
            <MaterialIcons name="display-settings" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
    </View>
    
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  topMenu: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 45,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  moneyText: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
  },
  expandableContainer:{
    position: 'absolute',
    bottom:27,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
  },
  longLine: {
    width: '200%',
    height: 2,
    backgroundColor: '#DFE3EF',
    marginTop: 10,
    marginBottom: 20,
  },
  shortLine: {
    width: 45,
    height: 5,
    backgroundColor: '#DFE3EF',
    borderRadius: 10,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconBox2: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE3EF',
  },
  toggleButton: {
    width: 200,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#32CD32',
    margin: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  dollarSign: {
    marginRight: 2,
    fontWeight: 'bold',
    color: '#4285F4',
    fontSize: 25,
  },
  moneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    bookingInfo: {
      padding: 16,
      backgroundColor: '#fff',
    },
    bookingText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    bookingSubText: {
      fontSize: 14,
      color: '#555',
      marginBottom: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9F9F9',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: '#000',
    },
    iconContainer: {
      marginLeft: 8,
    },
    setUpButton: {
      backgroundColor: '#32CD32',
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      marginBottom: 24,
    },
    setUpButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    scheduleContainer: {
      marginTop: 16,
    },
    scheduleTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    scheduleSubtitle: {
      fontSize: 16,
      color: '#555',
      marginBottom: 16,
    },
    scheduleCard: {
      backgroundColor: '#F9F9F9',
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    addressContainer: {
      marginLeft: 16,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    addressDetails: {
      marginLeft: 8,
    },
    addressTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    addressSubtitle: {
      fontSize: 12,
      color: 'gray',
    },
    seeAll: {
      color: '#007AFF',
      fontSize: 14,
      marginTop: 8,
      alignSelf: 'center',
    },

  
});