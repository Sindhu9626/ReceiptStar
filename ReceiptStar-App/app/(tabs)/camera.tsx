import { CameraView, useCameraPermissions } from "expo-camera";
import { getCurrentUserId } from "../../src/getID";
import { parseReceipt } from "../../src/parseReceipt";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

// Set this based on where you run the app:
// iOS Simulator: "http://localhost:8080/ocr"
// Android Emulator: "http://10.0.2.2:8080/ocr"
// Real device on same Wi-Fi: "http://10.132.231.8:8080/ocr"
const OCR_URL = "http://10.132.231.11:8080/ocr";

const CATEGORIES = ["Gas", "Groceries", "Entertainment", "Miscellaneous"];


export default function ReceiptScanScreen() {
  const [ocrResult, setOcrResult] = React.useState(""); 
  const camRef = React.useRef<CameraView>(null);
  const [perm, requestPerm] = useCameraPermissions();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [showOptions, setShowOptions] = React.useState(false);

  React.useEffect(() => {
    if (!perm?.granted) requestPerm();
  }, [perm]);

  /*
  async function pickAndOcr() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow photo library access.");
        return;
      }
      const img = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 1 });
      if (img.canceled) return;

      const base64 = img.assets?.[0]?.base64;
      if (!base64) return Alert.alert("No image", "Could not read image data.");

      const resp = await fetch(OCR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await resp.json();
  
      if (!resp.ok) throw new Error(data?.error || "OCR failed");
      setOcrResult(data.text ?? "(no text)");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? String(e));
    }
  }
  */

  async function scanWithCamera() {
    try {

      if (!camRef.current) 
        return Alert.alert("Camera not ready");

      // capture photo with base64 to send to backend
      const photo = await camRef.current.takePictureAsync({ base64: true, quality: 1 });
      console.log("photo base64 length:", photo?.base64?.length);

      if(!selectedCategory){
        Alert.alert("Choose a category");
        return;
      }

      if (!photo?.base64) 
        return Alert.alert("Capture failed");

      const resp = await fetch(OCR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photo.base64 }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || "OCR failed");
      }

      const userID = await getCurrentUserId();

      if(!userID){
        Alert.alert("Not logged in", "Please log in to save receipts.");
        return;
      }

         //setOcrResult(JSON.stringify(data, null, 2));
      router.push("/scanComplete");

      //await parseReceipt(data, userID, selectedCategory);
      //Alert.alert("Sucess", "Receipt saved!");
      
    } catch (e: any) {
      Alert.alert("OCR error", e?.message ?? String(e));
    }
  }

  if (!perm) return <View style={{ flex: 1 }} />;
  if (!perm.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Camera permission is required.</Text>
        <Button title="Grant permission" onPress={requestPerm} />
      </View>
    );
  }


  //<Button title="Select Receipt" onPress={pickAndOcr} />
 return (
  <View style={{ flex: 1 }}>
    {/* Camera preview */}
    <CameraView ref={camRef} style={{ flex: 1 }} facing="back" />

    {/* Actions */}
    <View style={{ padding: 16 }}>
      <Text style={{ marginBottom: 8, fontWeight: "600" }}>Select Category</Text>

      {/* Selector box */}
      <TouchableOpacity
        onPress={() => setShowOptions((prev) => !prev)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 4,
        }}
      >
        <Text style={{ color: selectedCategory ? "#000" : "#888" }}>
          {selectedCategory || "Choose a category..."}
        </Text>
      </TouchableOpacity>

      {/* Dropdown list, only when showOptions is true */}
      {showOptions && (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                setSelectedCategory(cat);
                setShowOptions(false);
              }}
              style={{ paddingHorizontal: 12, paddingVertical: 10 }}
            >
              <Text>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button title="Scan with Camera" onPress={scanWithCamera} />

      <Text style={{ marginTop: 12 }} selectable>
        {ocrResult}
      </Text>
    </View>
  </View>
);


}