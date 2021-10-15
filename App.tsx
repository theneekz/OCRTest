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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

import TesseractOcr, {
  LANG_ENGLISH,
  useEventListener,
} from 'react-native-tesseract-ocr';

const DEFAULT_HEIGHT = 500;
const DEFAULT_WITH = 600;
const defaultPickerOptions = {
  cropping: true,
  height: DEFAULT_HEIGHT,
  width: DEFAULT_WITH,
};

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

  const recognizeTextFromImage = async path => {
    setIsLoading(true);

    try {
      const tesseractOptions = {};
      const recognizedText = await TesseractOcr.recognize(
        path,
        LANG_ENGLISH,
        tesseractOptions,
      );
      setText(recognizedText);
    } catch (err) {
      console.error(err);
      setText('');
    }

    setIsLoading(false);
    setProgress(0);
  };

  const recognizeFromPicker = async (options = defaultPickerOptions) => {
    try {
      const image = await ImagePicker.openPicker(options);
      setImgSrc({uri: image.path});
      await recognizeTextFromImage(image.path);
    } catch (err: any) {
      if (err.message !== 'User cancelled image selection') {
        console.error(err);
      }
    }
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default App;
