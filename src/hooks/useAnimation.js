
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { itemToGeoJSONFeature } from 'react-native-maps-super-cluster';

export default function useAnimation(start, end, trigger, duration) {

const value = useRef(new Animated.Value(start)).current  // Initial value for opacity: 0

useEffect(() => {
    if(trigger){
        Animated.timing(
            value,
            {
              toValue: end,
              duration: duration,
            }
          ).start();
    }
    if(!trigger){
        Animated.timing(
            value,
            {
              toValue: start,
              duration: duration,
            }
          ).start();
    }
   
  }, [trigger])

  return (value);
}