/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Image,
  NativeModules,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import SampleImage from './sample_image.jpg';
import Receipt from './Receipt.jpg';

const DEFAULT_HEIGHT = 500;
const DEFAULT_WITH = 600;
const defaultPickerOptions = {
  cropping: true,
  height: DEFAULT_HEIGHT,
  width: DEFAULT_WITH,
};

type coords = {
  x: number;
  y: number;
  height: number;
  width: number;
};

//ex component in ts
const Section: React.FC<{
  title: string;
}> = ({children, title}) => {
  return <></>;
};

const App = () => {
  const [text, setText] = useState<string>('text goes here');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [imgSrc, setImgSrc] = useState<any>(null);
  const {OCR} = NativeModules;

  //loads image from picker to state and passes to tesseract
  const recognizeFromPicker = async (options = defaultPickerOptions) => {
    try {
      const image: any = await ImagePicker.openPicker(options);

      setImgSrc({uri: image.path});
      await recognizeTextFromImage(image.sourceURL, image.cropRect);
    } catch (err: any) {
      if (err.message !== 'User cancelled image selection') {
        console.error(err);
      }
    }
  };

  //scans image for text
  const recognizeTextFromImage = async (imagePath: any, coords: coords) => {
    setIsLoading(true);

    try {
      // coords = {x: 0, y: 0, width: 600, height: 500}; //testing only
      // imagePath = Image.resolveAssetSource(SampleImage).uri; // testing only

      // coords = {height: 107, width: 129, x: 458, y: 398}; //testing only
      // imagePath = Image.resolveAssetSource(Receipt).uri; // testing only
      const recognizedText = await OCR.scanForText(imagePath, coords);

      setText(recognizedText || 'Could not find text');
    } catch (err) {
      console.error(err);
      setText('');
    }

    setIsLoading(false);
    setProgress(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => {
            recognizeFromPicker();
          }}>
          <View style={styles.uploadButton}>
            <Text>Upload</Text>
          </View>
        </TouchableOpacity>
        <Text>{text}</Text>
        {isLoading === true && <Text>loading: {progress}%</Text>}
        {imgSrc && (
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={imgSrc} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: '5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginVertical: 15,
    height: DEFAULT_HEIGHT / 2.5,
    width: DEFAULT_WITH / 2.5,
  },
});

export default App;
