import { supabase } from "../../utils/supabase"; 
import React, { useState, useEffect } from "react"; 
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  Image,
  TextInput 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// 💡 Importez vos APIs ici
import { getAfricanRecipes } from "../api/edamam"; 
import { getDessertRecipes } from "../api/mealdb";
import { getPopularRecipes, searchSpoonacularRecipes } from "../api/spoonacular"; 

// Interface de recette unifiée
interface UnifiedRecipe {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
}

// =================================================================
// 1. FONCTIONS UTILITAIRES DE DATE
// =================================================================
const formatDateDetails = (dateISO: string, selectedDayName?: string) => {
    const dateObj = new Date(dateISO + 'T00:00:00'); 
    if (isNaN(dateObj.getTime())) {
        return { 
            dayOfWeek: selectedDayName || 'Jour Inconnu',
            fullDate: 'Date Invalide', 
            weekNumber: null 
        };
    }

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const oneJan = new Date(dateObj.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((dateObj.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((dateObj.getDay() + 1 + numberOfDays) / 7);

    return {
        dayOfWeek: dateObj.toLocaleDateString('fr-FR', { weekday: 'long' }),
        fullDate: dateObj.toLocaleDateString('fr-FR', options),
        weekNumber: weekNumber,
    };
};

// =================================================================
// 2. COMPOSANT PRINCIPAL
// =================================================================
const MealSelectorScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedDate, selectedDayName } = route.params as { selectedDate: string, selectedDayName?: string };

    const [recipes, setRecipes] = useState<UnifiedRecipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const dateDetails = formatDateDetails(selectedDate, selectedDayName); 

    // 💡 Fallback pour les images null ou vides
    const safeImage = (url: string | null | undefined) => url && url.length > 0 ? url : 'https://via.placeholder.com/100';

    // 💡 Fonction pour récupérer les recettes locales depuis Supabase
    const fetchLocalRecipes = async (): Promise<UnifiedRecipe[]> => {
        try {
            const { data, error } = await supabase
                .from('recettes')
                .select('id, title, image_url');
            
            if (error) {
                console.error('Erreur fetch Supabase:', error);
                return [];
            }

            return data.map((item: any) => ({
                id: item.id,
                title: item.title,
                imageUrl: safeImage(item.image_url),
                source: 'Afrique', // Source par défaut
            }));
        } catch (err) {
            console.error('Erreur critique fetchSupabase:', err);
            return [];
        }
    };

    // 💡 Normalisation des recettes API
    const unifyRecipeFormat = (data: any, source: string): UnifiedRecipe[] => {
      if (!data) return []; 
      
      switch (source) {
        case 'edamam': 
          const edamamHits = Array.isArray(data.hits) ? data.hits : [];
          return edamamHits.map((hit: any) => ({
            id: hit.recipe.uri,
            title: hit.recipe.label,
            imageUrl: safeImage(hit.recipe.image),
            source: 'Africaine (Edamam)',
          }));
          
        case 'mealdb':
          const mealdbMeals = Array.isArray(data.meals) ? data.meals : [];
          return mealdbMeals.map((meal: any) => ({
            id: meal.idMeal,
            title: meal.strMeal,
            imageUrl: safeImage(meal.strMealThumb),
            source: 'Dessert (MealDB)',
          }));
          
        case 'spoonacular': 
          const spResults = Array.isArray(data.results) ? data.results : [];
          return spResults.map((result: any) => ({
            id: result.id.toString(),
            title: result.title,
            imageUrl: safeImage(result.image),
            source: 'Internationale (Spoonacular)',
          }));
          
        default:
          return [];
      }
    };

    // 💡 Récupération de toutes les recettes
    const fetchRecipes = async (query?: string) => {
        setLoading(true);
        let allRecipes: UnifiedRecipe[] = [];

        try {
            // 1️⃣ Recettes locales
            const localRecipes = await fetchLocalRecipes();
            allRecipes = allRecipes.concat(localRecipes);

            // 2️⃣ Recettes APIs
            if (query) {
                const spResult = await searchSpoonacularRecipes(query);
                allRecipes = allRecipes.concat(unifyRecipeFormat(spResult, 'spoonacular'));
            } else {
                const africanResult = await getAfricanRecipes("african");
                allRecipes = allRecipes.concat(unifyRecipeFormat(africanResult, 'edamam'));

                const dessertResult = await getDessertRecipes("dessert");
                allRecipes = allRecipes.concat(unifyRecipeFormat(dessertResult, 'mealdb'));

                const popularResult = await getPopularRecipes();
                allRecipes = allRecipes.concat(unifyRecipeFormat(popularResult, 'spoonacular'));
            }

            setRecipes(allRecipes);
        } catch (error) {
            console.error("Erreur critique de chargement des recettes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes(); 
    }, []);
    
    const handleSearch = () => {
        if (search.trim()) {
            fetchRecipes(search.trim());
        } else {
            fetchRecipes();
        }
    }

    const selectMeal = (recipe: UnifiedRecipe) => {
        navigation.navigate('DayDetails', {
            selectedDate: selectedDate,
            selectedRecipe: recipe, 
        });
    };

    const renderItem = ({ item }: { item: UnifiedRecipe }) => (
        <TouchableOpacity style={styles.recipeCard} onPress={() => selectMeal(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.recipeImage} />
            <View style={styles.textContainer}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <Text style={styles.recipeSource}>Source: {item.source}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Choisir un Plat</Text>
            <View style={styles.dateInfoContainer}>
                <Text style={styles.dateDay}>{dateDetails.dayOfWeek.charAt(0).toUpperCase() + dateDetails.dayOfWeek.slice(1)}</Text>
                <Text style={styles.dateMonth}>
                    {dateDetails.fullDate} 
                    {dateDetails.weekNumber ? ` (Semaine ${dateDetails.weekNumber})` : ''}
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un plat (africain, dessert, etc.)"
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#D35400" style={{ marginTop: 50 }} />
            ) : recipes.length === 0 ? (
                <Text style={styles.noResultsText}>Aucune recette trouvée. Vérifiez vos APIs ou essayez une autre recherche.</Text>
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

export default MealSelectorScreen;

// =================================================================
// 3. STYLES
// =================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 15 },
  dateInfoContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0D1A1'
  },
  dateDay: { fontSize: 18, fontWeight: '700', color: '#D35400' },
  dateMonth: { fontSize: 14, color: '#555', marginTop: 2 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 15, marginTop: 10 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 10 },
  searchButton: { backgroundColor: '#D35400', justifyContent: 'center', alignItems: 'center', borderRadius: 8, paddingHorizontal: 15 },
  listContent: { paddingHorizontal: 15, paddingBottom: 20 },
  recipeCard: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 10, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#EAEAEA' },
  recipeImage: { width: 100, height: 100 },
  textContainer: { flex: 1, padding: 10, justifyContent: 'center' },
  recipeTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  recipeSource: { fontSize: 12, color: '#777', marginTop: 4 },
  noResultsText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#E74C3C' }
});
