import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy"; // <-- CONSERVÉ SELON VOTRE DEMANDE
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../app/AuthContext";
import { Ionicons } from "@expo/vector-icons"; // Ajout de l'import pour les icônes

interface Step {
    step_number: number;
    instruction: string;
    image_url?: string | null;
}

const AddRecipeForm = () => {
    const navigation = useNavigation();
    const { userProfile } = useContext(AuthContext);

    const [category, setCategory] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([""]);
    const [calories, setCalories] = useState<string>("");
    const [yieldPortions, setYieldPortions] = useState<string>("");
    const [dietLabels, setDietLabels] = useState<string[]>([]);
    const [healthLabels, setHealthLabels] = useState<string[]>([]);
    const [totalTime, setTotalTime] = useState<string>("");
    const [image, setImage] = useState<string | null>(null);
    const [steps, setSteps] = useState<Step[]>([{ step_number: 1, instruction: "", image_url: null }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            const savedCategory = await AsyncStorage.getItem("selectedCategory");
            setCategory(savedCategory);
        };
        fetchCategory();
    }, []);

    // --- Sélection d’image ---
    const pickImage = async (callback: (uri: string) => void) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission requise", "Vous devez autoriser l'accès aux photos.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsEditing: false, // Conserver la logique de votre code original
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            callback(result.assets[0].uri);
        }
    };

    // --- Upload vers Supabase Storage ---
    const uploadImage = async (uri: string, bucket: string, path: string) => {
  if (!uri) throw new Error("URI d'image invalide");

  let fileExt = uri.split(".").pop()?.toLowerCase();
  if (fileExt === "heic" || fileExt === "heif") fileExt = "jpeg";

  const contentType = `image/${fileExt}`;
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  // Lire le fichier en base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Décoder le base64 en binaire (ArrayBuffer)
  const binary = atob(base64);
  const arrayBuffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arrayBuffer[i] = binary.charCodeAt(i);
  }

  // Upload du binaire
  const { error } = await supabase.storage.from(bucket).upload(filePath, arrayBuffer, {
    contentType,
    upsert: true,
  });

  if (error) throw error;

  // Récupérer l’URL publique
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

    // --- Fonctions dynamiques pour champs ---
    const addIngredient = () => setIngredients([...ingredients.filter(i => i.trim() !== ""), ""]);
    const updateIngredient = (i: number, v: string) => {
        const newList = [...ingredients];
        newList[i] = v;
        setIngredients(newList);
    };

    const addStep = () => setSteps([...steps.filter(s => s.instruction.trim() !== ""), { step_number: steps.length + 1, instruction: "", image_url: null }]);
    const updateStepInstruction = (i: number, v: string) => {
        const newSteps = [...steps];
        newSteps[i].instruction = v;
        setSteps(newSteps);
    };
    const updateStepImage = (i: number, uri: string) => {
        const newSteps = [...steps];
        newSteps[i].image_url = uri;
        setSteps(newSteps);
    };

    // --- Soumission du formulaire ---
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user.id;

            if (!userId) {
                Alert.alert("Attention", "Veuillez vous connecter avant d’ajouter une recette.");
                setLoading(false);
                return navigation.navigate("Login" as never);
            }

            const filteredIngredients = ingredients.filter(i => i.trim() !== "");
            const filteredSteps = steps.filter(s => s.instruction.trim() !== "");

            if (!title.trim()) return Alert.alert("Erreur", "Veuillez saisir un titre.");
            if (filteredIngredients.length === 0) return Alert.alert("Erreur", "Veuillez saisir au moins un ingrédient.");
            if (filteredSteps.length === 0) return Alert.alert("Erreur", "Veuillez saisir au moins une étape.");

            const image_url = image ? await uploadImage(image, "recipes", `main/${userId}`) : null;

            const { data: recette, error } = await supabase.from("recettes").insert([{
                title,
                description,
                image_url,
                ingredient_lines: filteredIngredients,
                calories: calories ? parseFloat(calories) : null,
                yield: yieldPortions ? parseInt(yieldPortions) : null,
                diet_labels: dietLabels,
                health_labels: healthLabels,
                total_time: totalTime ? parseInt(totalTime) : null,
                category,
                country: userProfile?.country_code || null,
                created_by: userId,
            }]).select().single();

            if (error) throw error;

            // Étapes
            await Promise.all(
                filteredSteps.map(async (s) => {
                    const step_image_url = s.image_url
                        ? await uploadImage(s.image_url, "recipes", `steps/${recette.id}`)
                        : null;
                    const { error: stepError } = await supabase.from("steps").insert([{
                        recette_id: recette.id,
                        step_number: s.step_number,
                        instruction: s.instruction,
                        image_url: step_image_url,
                        created_by: userId,
                    }]);
                    if (stepError) throw stepError;
                })
            );

            Alert.alert("Succès 🎉", "Recette ajoutée avec succès !");
            setTitle(""); setDescription(""); setIngredients([""]); setImage(null);
            setSteps([{ step_number: 1, instruction: "", image_url: null }]);
            setCalories(""); setYieldPortions(""); setDietLabels([]); setHealthLabels([]); setTotalTime("");
            
            navigation.goBack(); 

        } catch (err: any) {
            console.error(err);
            Alert.alert("Erreur", err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    // --- Loading UI ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E76F51" />
                <Text style={styles.loadingText}>Enregistrement en cours...</Text>
            </View>
        );
    }

    // --- Interface ---
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
                    <Text style={styles.header}>Créer votre Recette</Text>

                    {category && (
                        <View style={styles.categoryBox}>
                            <Ionicons name="pricetag-outline" size={16} color="#E76F51" />
                            <Text style={styles.categoryText}>Catégorie : {category}</Text>
                        </View>
                    )}
                    
                    {/* Section 1: Informations Générales */}
                    <Text style={styles.sectionTitle}>1. Informations de base</Text>
                    
                    <Text style={styles.label}>Titre *</Text>
                    <TextInput style={styles.input} placeholder="Ex: Poulet Yassa Authentique" placeholderTextColor="#A9A9A9" value={title} onChangeText={setTitle} />

                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        placeholder="Décrivez votre recette en quelques lignes." 
                        placeholderTextColor="#A9A9A9" 
                        value={description} 
                        onChangeText={setDescription} 
                        multiline 
                    />

                    {/* Image Principale */}
                    <Text style={styles.label}>Image principale de la recette</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setImage)}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
                        ) : (
                            <View style={styles.imagePickerContent}>
                                <Ionicons name="cloud-upload-outline" size={40} color="#fff" />
                                <Text style={styles.imagePickerText}>Choisir une image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    
                    {/* Section 2: Ingrédients */}
                    <Text style={styles.sectionTitle}>2. Ingrédients</Text>
                    
                    {ingredients.map((ing, i) => (
                         <View key={i} style={styles.inputRow}>
                            <TextInput 
                                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                                placeholder={`Ingrédient ${i + 1} (Ex: 200g de riz)`} 
                                placeholderTextColor="#A9A9A9"
                                value={ing} 
                                onChangeText={(v) => updateIngredient(i, v)} 
                            />
                             {ingredients.length > 1 && (
                                <TouchableOpacity 
                                    style={styles.removeButton} 
                                    onPress={() => setIngredients(ingredients.filter((_, index) => index !== i))}
                                >
                                    <Ionicons name="close-circle-outline" size={24} color="#E76F51" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity style={styles.secondaryButton} onPress={addIngredient}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.secondaryButtonText}>Ajouter un ingrédient</Text>
                    </TouchableOpacity>
                    
                    {/* Section 3: Détails */}
                    <Text style={styles.sectionTitle}>3. Détails & Labels</Text>

                    <Text style={styles.label}>Temps total (minutes)</Text>
                    <TextInput style={styles.input} placeholder="Ex: 45" placeholderTextColor="#A9A9A9" keyboardType="numeric" value={totalTime} onChangeText={setTotalTime} />
                    
                    <Text style={styles.label}>Portions</Text>
                    <TextInput style={styles.input} placeholder="Ex: 4" placeholderTextColor="#A9A9A9" keyboardType="numeric" value={yieldPortions} onChangeText={setYieldPortions} />
                    
                    <Text style={styles.label}>Calories (kcal)</Text>
                    <TextInput style={styles.input} placeholder="Ex: 350" placeholderTextColor="#A9A9A9" keyboardType="numeric" value={calories} onChangeText={setCalories} />
                    
                    <Text style={styles.label}>Diet Labels (séparés par une virgule)</Text>
                    <TextInput style={styles.input} placeholder="Ex: Végétarien, Sans Gluten" placeholderTextColor="#A9A9A9" value={dietLabels.join(", ")} onChangeText={(t) => setDietLabels(t.split(",").map(s => s.trim()))} />

                    <Text style={styles.label}>Health Labels (séparés par une virgule)</Text>
                    <TextInput style={styles.input} placeholder="Ex: Faible en Sucre, Riche en Fibres" placeholderTextColor="#A9A9A9" value={healthLabels.join(", ")} onChangeText={(t) => setHealthLabels(t.split(",").map(s => s.trim()))} />
                    
                    {/* Section 4: Étapes */}
                    <Text style={styles.sectionTitle}>4. Étapes de préparation</Text>
                    
                    {steps.map((step, i) => (
                        <View key={i} style={styles.stepContainer}>
                            <Text style={styles.stepTitle}>Étape {i + 1}</Text>
                            <TextInput 
                                style={[styles.input, styles.stepInput]} 
                                placeholder="Instruction de l'étape" 
                                placeholderTextColor="#A9A9A9"
                                value={step.instruction} 
                                onChangeText={(v) => updateStepInstruction(i, v)} 
                                multiline
                            />
                            
                            <TouchableOpacity style={styles.stepImagePicker} onPress={() => pickImage(uri => updateStepImage(i, uri))}>
                                {step.image_url ? (
                                    <Image source={{ uri: step.image_url }} style={styles.imagePreview} resizeMode="cover" />
                                ) : (
                                    <View style={styles.stepImagePickerContent}>
                                        <Ionicons name="camera-outline" size={24} color="#E76F51" />
                                        <Text style={styles.stepImagePickerText}>Ajouter une photo de l'étape (optionnel)</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                             {steps.length > 1 && (
                                <TouchableOpacity 
                                    style={styles.removeStepButton} 
                                    onPress={() => setSteps(steps.filter((_, index) => index !== i))}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#E76F51" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity style={styles.secondaryButton} onPress={addStep}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.secondaryButtonText}>Ajouter une étape</Text>
                    </TouchableOpacity>

                    {/* Bouton de Soumission */}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                        <Text style={styles.submitText}>{loading ? "Enregistrement..." : "Enregistrer la recette"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddRecipeForm;

const styles = StyleSheet.create({
    // --- Palette et Conteneurs ---
    container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
    scrollContent: { paddingBottom: 120 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
    loadingText: { marginTop: 10, color: '#E76F51', fontSize: 16, fontWeight: '500' },
    
    // --- Titres et Labels ---
    header: { fontSize: 28, fontWeight: "bold", color: "#E76F51", textAlign: "center", marginBottom: 25 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginTop: 30, marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#F4A261', paddingBottom: 5 },
    label: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#333", marginTop: 10 },
    
    // --- Catégorie ---
    categoryBox: { 
        backgroundColor: "#EFECEC", 
        padding: 10, 
        borderRadius: 8, 
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 5,
        borderLeftColor: '#F4A261',
    },
    categoryText: { fontSize: 16, fontWeight: "700", color: "#E76F51", marginLeft: 8 },
    
    // --- Inputs et Textarea ---
    input: { 
        borderWidth: 1, 
        borderColor: "#E0E0E0", 
        borderRadius: 10, 
        paddingHorizontal: 15, 
        paddingVertical: Platform.OS === "ios" ? 12 : 10, 
        marginBottom: 10, 
        backgroundColor: "#fff",
        fontSize: 15,
        color: '#333'
    },
    textArea: { height: 100, textAlignVertical: 'top' as const },
    
    // --- Lignes d'Input (Ingrédients) ---
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    removeButton: {
        padding: 8,
        marginLeft: 5,
        alignSelf: 'center',
    },

    // --- Boutons Secondaires (Ajouter) ---
    secondaryButton: { 
        backgroundColor: "#F4A261", 
        padding: 12, 
        borderRadius: 10, 
        alignItems: "center", 
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    secondaryButtonText: { 
        color: "#fff", 
        fontWeight: "bold", 
        fontSize: 16,
        marginLeft: 8
    },
    
    // --- Image Picker Principal ---
    imagePicker: { 
        height: 180, 
        backgroundColor: "#E76F51", 
        borderRadius: 12, 
        justifyContent: "center", 
        alignItems: "center", 
        marginBottom: 20, 
        overflow: "hidden",
        borderWidth: 2,
        borderColor: '#E76F51'
    },
    imagePickerContent: {
        alignItems: 'center',
        padding: 20,
    },
    imagePickerText: { color: "#fff", fontWeight: "600", marginTop: 5, fontSize: 14 },
    imagePreview: { width: "100%", height: "100%" },
    
    // --- Étapes ---
    stepContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#F4A261',
        position: 'relative'
    },
    stepTitle: { fontWeight: "700", fontSize: 16, marginBottom: 5, color: "#E76F51" },
    stepInput: { height: 60, textAlignVertical: 'top' as const },
    stepImagePicker: { 
        height: 80, 
        backgroundColor: "#F9F9F9", 
        borderRadius: 8, 
        justifyContent: "center", 
        alignItems: "center", 
        marginTop: 10,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#F4A261',
        overflow: "hidden" 
    },
    stepImagePickerContent: {
        alignItems: 'center',
        opacity: 0.7
    },
    stepImagePickerText: { color: "#E76F51", fontWeight: "600", marginTop: 5, fontSize: 12 },
    removeStepButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },

    // --- Bouton de Soumission Principal ---
    submitButton: { 
        backgroundColor: "#E76F51", 
        padding: 18, 
        borderRadius: 12, 
        alignItems: "center", 
        marginTop: 30,
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    submitText: { color: "#fff", fontWeight: "bold", fontSize: 18 }
});