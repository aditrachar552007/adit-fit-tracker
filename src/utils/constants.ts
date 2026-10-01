import { HabitItem, MealItem, MealType } from '../types';

export const DEFAULT_HABITS: HabitItem[] = [
  {
    id: 'h1',
    key: 'morningWater',
    label: 'Morning water',
    sublabel: 'Drink 1-2 glasses of warm water on waking up',
    icon: 'Droplet',
  },
  {
    id: 'h2',
    key: 'breakfast',
    label: 'Breakfast',
    sublabel: 'Wholesome nutritious breakfast within 2h of waking',
    icon: 'Coffee',
  },
  {
    id: 'h3',
    key: 'waterTarget',
    label: '2.5–3 L water',
    sublabel: 'Keep sipping water throughout the day',
    icon: 'GlassWater',
  },
  {
    id: 'h4',
    key: 'walking',
    label: '30–45 min walking',
    sublabel: 'Brisk walk, jogging, or evening stroll',
    icon: 'Footprints',
  },
  {
    id: 'h5',
    key: 'healthyLunch',
    label: 'Healthy lunch',
    sublabel: 'Balanced plate with fiber, whole grains & protein',
    icon: 'Salad',
  },
  {
    id: 'h6',
    key: 'healthySnack',
    label: 'Healthy snack',
    sublabel: 'Roasted makhana, nuts, fruit, or green tea',
    icon: 'Apple',
  },
  {
    id: 'h7',
    key: 'lightDinner',
    label: 'Light dinner',
    sublabel: 'Early dinner, easy to digest before 8:30 PM',
    icon: 'Moon',
  },
  {
    id: 'h8',
    key: 'goodSleep',
    label: '7–8 h sleep',
    sublabel: 'Deep restorative sleep for body recovery',
    icon: 'BedDouble',
  },
];

export const MEAL_LABELS: Record<MealType, { title: string; time: string; icon: string; description: string }> = {
  breakfast: {
    title: 'Breakfast',
    time: '7:30 AM - 9:00 AM',
    icon: 'Sunrise',
    description: 'Fuel your morning with high protein & complex carbs',
  },
  midMorning: {
    title: 'Mid-Morning',
    time: '11:00 AM - 11:30 AM',
    icon: 'SunMedium',
    description: 'Light hydration, green tea, or fresh fruit',
  },
  lunch: {
    title: 'Lunch',
    time: '1:00 PM - 2:00 PM',
    icon: 'Sun',
    description: 'Main fuel: 50% veggies, 25% protein, 25% complex carbs',
  },
  eveningSnack: {
    title: 'Evening Snack',
    time: '4:30 PM - 5:30 PM',
    icon: 'Sunset',
    description: 'Satisfying snack to avoid dinner overeating',
  },
  dinner: {
    title: 'Dinner',
    time: '7:30 PM - 8:30 PM',
    icon: 'Moon',
    description: 'Light, gut-friendly & restorative meal',
  },
  nightMeal: {
    title: 'Optional Night Meal',
    time: '9:30 PM - 10:00 PM',
    icon: 'Sparkles',
    description: 'Warm turmeric milk, herbal infusion, or light calm drink',
  },
};

export const PRESET_FOODS: Record<MealType, Omit<MealItem, 'id'>[]> = {
  breakfast: [
    { name: 'Oatmeal with Almonds & Chia', portion: '1 medium bowl (250g)', calories: 280, protein: 11, carbs: 42, fat: 8, isVeg: true },
    { name: 'Moong Dal Chilla (2 pcs) with Mint Chutney', portion: '2 chillas (160g)', calories: 240, protein: 14, carbs: 32, fat: 6, isVeg: true },
    { name: 'Paneer Bhurji with 1 Multigrain Toast', portion: '100g paneer + 1 toast', calories: 310, protein: 19, carbs: 18, fat: 18, isVeg: true },
    { name: 'Steamed Idli (2 pcs) with Sambar & Chutney', portion: '2 idlis + 1 cup sambar', calories: 220, protein: 7, carbs: 40, fat: 4, isVeg: true },
    { name: 'Sprouts & Pomegranate Salad', portion: '1 bowl (180g)', calories: 190, protein: 12, carbs: 30, fat: 2, isVeg: true },
    { name: 'Tofu Scramble with Spinach & Toast', portion: '120g tofu + 1 toast', calories: 260, protein: 17, carbs: 20, fat: 12, isVeg: true },
    { name: 'Boiled Eggs (2 whole) with Toast', portion: '2 eggs + 1 toast', calories: 220, protein: 15, carbs: 15, fat: 10, isVeg: false },
  ],
  midMorning: [
    { name: 'Green Tea + 6 Soaked Almonds & 2 Walnuts', portion: '1 cup tea + 25g nuts', calories: 150, protein: 4, carbs: 4, fat: 13, isVeg: true },
    { name: 'Fresh Tender Coconut Water', portion: '1 glass (250ml)', calories: 45, protein: 1, carbs: 9, fat: 0, isVeg: true },
    { name: 'Fresh Papaya / Apple Slices', portion: '1 medium bowl (150g)', calories: 85, protein: 1, carbs: 21, fat: 0, isVeg: true },
    { name: 'Spiced Buttermilk (Chaas) with Jeera', portion: '1 tall glass (250ml)', calories: 60, protein: 4, carbs: 5, fat: 2, isVeg: true },
  ],
  lunch: [
    { name: '2 Phulkas + 1 Bowl Yellow Dal + Mix Sabzi + Salad', portion: 'Standard thali plate', calories: 420, protein: 16, carbs: 68, fat: 10, isVeg: true },
    { name: 'Brown Rice (1 cup) + Rajma Curry + Cucumber Raita', portion: '1 cup rice + 1.5 cup rajma', calories: 460, protein: 18, carbs: 78, fat: 8, isVeg: true },
    { name: 'Quinoa Paneer Veggie Bowl', portion: '1 large bowl (300g)', calories: 440, protein: 22, carbs: 48, fat: 16, isVeg: true },
    { name: '2 Multigrain Rotis + Paneer Masala (Light) + Green Salad', portion: '2 rotis + 120g paneer', calories: 490, protein: 24, carbs: 52, fat: 19, isVeg: true },
    { name: 'Chole (Chickpea Curry) with 1 Roti & Sprout Salad', portion: '1 cup chole + 1 roti', calories: 380, protein: 17, carbs: 58, fat: 9, isVeg: true },
    { name: 'Grilled Chicken Breast with Steamed Broccoli & Sweet Potato', portion: '150g chicken + veg', calories: 380, protein: 38, carbs: 25, fat: 8, isVeg: false },
  ],
  eveningSnack: [
    { name: 'Roasted Makhana (Fox Nuts) with Mild Spices', portion: '1 medium bowl (35g)', calories: 130, protein: 4, carbs: 24, fat: 2, isVeg: true },
    { name: 'Roasted Chana (Black Chickpeas)', portion: '1/2 cup (50g)', calories: 170, protein: 9, carbs: 28, fat: 3, isVeg: true },
    { name: 'Whey / Plant Protein Shake with Water', portion: '1 scoop (30g powder)', calories: 120, protein: 24, carbs: 3, fat: 1.5, isVeg: true },
    { name: 'Carrot & Cucumber Sticks with 2 tbsp Hummus', portion: '1 serving (150g)', calories: 120, protein: 4, carbs: 14, fat: 6, isVeg: true },
    { name: 'Black Coffee / Green Tea + 2 Multigrain Crackers', portion: '1 cup + 2 crackers', calories: 75, protein: 2, carbs: 12, fat: 2, isVeg: true },
  ],
  dinner: [
    { name: 'Moong Dal Khichdi (Light) with Curd & Salad', portion: '1 medium bowl + 1/2 cup curd', calories: 340, protein: 14, carbs: 54, fat: 7, isVeg: true },
    { name: 'Grilled Paneer Salad with Mint Vinaigrette', portion: '150g paneer + large salad', calories: 360, protein: 25, carbs: 14, fat: 22, isVeg: true },
    { name: '2 Phulkas + Palak Dal + Stir-Fried Beans', portion: '2 light phulkas + 1 cup dal', calories: 370, protein: 15, carbs: 58, fat: 8, isVeg: true },
    { name: 'Tofu & Vegetable Stir-Fry in Sesame Garlic Sauce', portion: '1 bowl (250g)', calories: 290, protein: 20, carbs: 18, fat: 14, isVeg: true },
    { name: 'Clear Vegetable Soup with Boiled Chickpeas', portion: '1 large bowl (300ml)', calories: 210, protein: 10, carbs: 32, fat: 3, isVeg: true },
    { name: 'Grilled Fish with Sauteed Zucchini & Asparagus', portion: '160g fish + veg', calories: 290, protein: 32, carbs: 8, fat: 12, isVeg: false },
  ],
  nightMeal: [
    { name: 'Golden Turmeric Milk (Haldi Doodh) with Cinnamon', portion: '1 cup warm milk (200ml)', calories: 130, protein: 6, carbs: 12, fat: 5, isVeg: true },
    { name: 'Chamomile Tea + 4 Soaked Almonds', portion: '1 mug tea + almonds', calories: 40, protein: 1, carbs: 1, fat: 3, isVeg: true },
    { name: 'Warm Almond Milk with Pinch of Nutmeg', portion: '1 cup (200ml)', calories: 55, protein: 2, carbs: 3, fat: 4, isVeg: true },
  ],
};

export const PORTION_GUIDES = [
  {
    title: 'Protein (Paneer / Tofu / Dal / Eggs)',
    portion: 'Palm of your hand or 1 katori bowl (~100-150g)',
    tip: 'Aim for 1 palm-sized protein portion with each main meal (approx 15-25g protein).',
    icon: 'Beef',
  },
  {
    title: 'Vegetables & Fiber (Salad / Sabzi)',
    portion: 'Two cupped hands or half your plate (~200g)',
    tip: 'Fill 50% of your lunch and dinner plate with fibrous, colorful greens and veggies.',
    icon: 'Carrot',
  },
  {
    title: 'Carbohydrates (Roti / Rice / Oats)',
    portion: '1 cupped fist or 2 medium phulkas (~1 cup cooked)',
    tip: 'Prioritize whole grains, brown rice, or multigrain rotis without heavy extra ghee.',
    icon: 'Wheat',
  },
  {
    title: 'Healthy Fats (Ghee / Oil / Nuts / Seeds)',
    portion: 'Thumb size (~1 teaspoon oil/ghee or handful of nuts)',
    tip: 'Essential for hormone health and vitamin absorption, but high calorie density.',
    icon: 'Flame',
  },
];
