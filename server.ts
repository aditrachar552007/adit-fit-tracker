import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Coach endpoint
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { messages, userProfile, todayData, dietaryPreference } = req.body;

    const systemInstruction = `You are "Adit Fit Coach", a friendly, knowledgeable, and motivating fitness, nutrition, and wellness coach.
The user is tracking their daily health: weight, steps, water, active minutes, sleep, daily habit routines, and meals.
User Profile:
- Name: ${userProfile?.name || 'Adit'}
- Dietary Preference: ${dietaryPreference || userProfile?.dietaryPreference || 'Vegetarian'}
- Weight Goal: ${userProfile?.weightGoal || 68} kg (Current: ${todayData?.weight || userProfile?.currentWeight || 72} kg)
- Daily Water Goal: ${userProfile?.waterGoalMl || 3000} ml
- Daily Steps Goal: ${userProfile?.stepsGoal || 10000}
- Daily Calories Goal: ${userProfile?.caloriesGoal || 2000} kcal
- Daily Protein Goal: ${userProfile?.proteinGoalGrams || 75} g

Today's Logged Data (${todayData?.date || 'Today'}):
- Water: ${todayData?.waterMl || 0} / ${userProfile?.waterGoalMl || 3000} ml
- Steps: ${todayData?.steps || 0} / ${userProfile?.stepsGoal || 10000} steps
- Active Minutes: ${todayData?.activeMinutes || 0} / ${userProfile?.activeMinutesGoal || 45} mins
- Calories Burned: ${todayData?.caloriesBurned || 0} kcal
- Habit Routine Completed: ${todayData?.habitsSummary || 'None yet'}
- Meals Logged So Far:
  * Breakfast: ${todayData?.mealsSummary?.breakfast || 'Not logged yet'}
  * Mid-Morning: ${todayData?.mealsSummary?.midMorning || 'Not logged yet'}
  * Lunch: ${todayData?.mealsSummary?.lunch || 'Not logged yet'}
  * Evening Snack: ${todayData?.mealsSummary?.eveningSnack || 'Not logged yet'}
  * Dinner: ${todayData?.mealsSummary?.dinner || 'Not logged yet'}
  * Night Meal: ${todayData?.mealsSummary?.nightMeal || 'Not logged yet'}
- Total Nutrition Today: ${todayData?.totalCalories || 0} kcal, ${todayData?.totalProtein || 0}g protein (Remaining: ${Math.max(0, (userProfile?.caloriesGoal || 2000) - (todayData?.totalCalories || 0))} kcal, ${Math.max(0, (userProfile?.proteinGoalGrams || 75) - (todayData?.totalProtein || 0))}g protein)

Guidelines:
1. When asked questions like "What should I eat for dinner?", ALWAYS calculate how many calories and protein the user has remaining today, and suggest 2-3 delicious, balanced ${dietaryPreference || 'Vegetarian'} options that fit their remaining budget. Mention exact portions, approximate calories, and protein grams for each item.
2. If their protein intake is low, prioritize high-protein vegetarian foods (e.g. Paneer, Tofu, Soya chunks, Lentils/Dal, Sprouts, Greek yogurt/Curd, Chickpeas/Chana, Edamame, Chia seeds).
3. If they are behind on water or walking steps, offer gentle encouragement and realistic micro-habits.
4. Keep answers structured, encouraging, crisp, formatted with clear markdown bullet points, bold highlights, and friendly tone.
5. Provide actionable advice without medical disclaimers unless strictly clinical.`;

    // Format chat contents for Gemini
    const contents = (messages || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello coach! What should I focus on today?' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error generating AI coach response:', error);
    res.status(500).json({
      error: 'Failed to generate coach advice.',
      message: error?.message || 'Unknown error occurred.',
    });
  }
});

// Vite setup in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
