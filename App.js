import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [connectionType, setConnectionType] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(160)); // Initial height
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const pan = useRef(new Animated.Value(0)).current;
  const maxHeight = 300; // Maximum expansion height
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
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      let newHeight = Math.max(minHeight, Math.min(maxHeight, minHeight + gestureState.dy));
      animation.setValue(newHeight);
    },
    onPanResponderRelease: (e, gestureState) => {
      if (-gestureState.dy > dragThreshold) { // Check for upward drag (negative dy)
        setExpanded(true);
        Animated.timing(animation, {
          toValue: maxHeight,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
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
        style={[styles.statusContainer, { height: animation }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.shortLine} />
        {!expanded && (
          <Text style={styles.statusText}>
            You're {isOnline ? "Online" : "Offline"}
          </Text>
        )}

        {expanded && isOnline && (
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingText}>Plan Your Upcoming Trip</Text>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}

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
      </Animated.View>
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
    backgroundColor: '#42F45D',
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
    alignItems: 'center',
    marginBottom: 20,
  },
  bookingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  bookButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4285F4',
    borderRadius: 10,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});