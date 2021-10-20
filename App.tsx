import React, {useEffect, useState} from 'react';
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
import SampleImage from './sample_image.jpg'; //testing only
import Receipt from './Receipt.jpg'; //testing only

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

interface item {
  quantity: string;
  item: string;
  price: string;
}

const regex = /^\s*(\d+)\s+(.*\S)\s+(\(?)\$([0-9.]+)\)?\s*$/gm;

const Breakdown: React.FC<{
  allItems: item[];
}> = ({allItems}) => {
  return (
    <View style={styles.breakdownContainer}>
      <View style={styles.breakdownRow}>
        <Text style={styles.leftText}>Quantity</Text>
        <Text style={styles.centerText}>Description</Text>
        <Text style={styles.rightText}>Price</Text>
      </View>
      {allItems.map((itemObj, index) => (
        <Row key={`itemRow${index}`} item={itemObj} />
      ))}
    </View>
  );
};

const Row: React.FC<{item: item}> = ({item: {quantity, item, price}}) => {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.leftText}>{quantity}</Text>
      <Text style={styles.centerText}>{item}</Text>
      <Text style={styles.rightText}>{price}</Text>
    </View>
  );
};

const App = () => {
  const [text, setText] = useState<string>('Text goes here');
  const [items, setItems] = useState<item[]>([]);
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

  useEffect(() => {
    if (text !== 'Text goes here' && text !== 'Could not find text') {
      getAndSetItems(text);
    } else {
      setItems([]);
    }
  }, [text]);

  const getAndSetItems = (inputStr: string) => {
    let items = [];
    const matches = inputStr.matchAll(regex);
    for (const matchedGroup of matches) {
      const [
        ignoredString, //[0] -> matched string "1 Blue gatorade $2.00"
        quantity, //[1] -> quantity "1"
        item, //[2] -> item description "Blue gatorade"
        ignoredSymbol, //[3] -> "$" (should probably always ignore)
        price, //[4] -> amount "2.00"
      ] = matchedGroup;

      items.push({
        quantity,
        item,
        price,
      });
    }
    setItems(items);
  };

  const getAndSetTax = (inputStr: string) => {
    //todo
    //find all indexes of 'tax'
    //get slices from (indexOfTax, '\n')?
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
        {/* <Text>{text}</Text> */}
        {isLoading === true && <Text>loading: {progress}%</Text>}
        {imgSrc && (
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={imgSrc} />
          </View>
        )}
        {items.length > 0 && <Breakdown allItems={items} />}
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
  breakdownContainer: {
    width: '90%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    minHeight: 200,
  },
  breakdownRow: {
    flexDirection: 'row',
    flex: 1,
  },
  leftText: {
    flex: 1,
    textAlign: 'left',
  },
  centerText: {
    flex: 1,
    textAlign: 'center',
  },
  rightText: {
    flex: 1,
    textAlign: 'right',
  },
});

export default App;
