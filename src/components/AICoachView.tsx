import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { ChatMessage, DayLog, UserProfile, HealthConnectStatus } from '../types';
import { calculateDailyTotals, formatDisplayDate } from '../utils/storage';

interface AICoachViewProps {
  dayLog: DayLog;
  profile: UserProfile;
  healthStatus?: HealthConnectStatus;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  dayLog,
  profile,
  healthStatus,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const { totalCalories, totalProtein, completedHabits, totalHabits } = calculateDailyTotals(dayLog);

  const caloriesRemaining = Math.max(0, profile.caloriesGoal - totalCalories);
  const proteinRemaining = Math.max(0, profile.proteinGoalGrams - totalProtein);
  const stepsRemaining = Math.max(0, profile.stepsGoal - dayLog.steps);

  const isHealthConnected = !!healthStatus?.isConnected;

  // Initialize messages with an informative greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      content: `Hi ${profile.name}! 👋 I'm your **Adit Fit Coach**.\n\nI have full visibility into your live log for ${formatDisplayDate(dayLog.date)}:\n- **Calories:** ${totalCalories} / ${profile.caloriesGoal} kcal (${caloriesRemaining} kcal remaining)\n- **Protein:** ${totalProtein}g / ${profile.proteinGoalGrams}g (${proteinRemaining}g remaining)\n- **Dietary Preference:** ${profile.dietaryPreference}\n- **Water:** ${(dayLog.waterMl / 1000).toFixed(1)} L · **Steps:** ${dayLog.steps.toLocaleString()} (${stepsRemaining.toLocaleString()} steps to daily goal)\n- **Routine:** ${completedHabits} of ${totalHabits} completed\n- **Health Sync:** ${isHealthConnected ? '🟢 Health Connect Connected' : '○ Manual Tracking'}\n\nAsk me anything! For example: *"What should I eat for dinner?"* or *"How many steps do I have left?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle triggered questions from other views
  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  const suggestedQuestions = [
    'How am I doing today?',
    'What should I eat for dinner?',
    'How can I reach my protein goal?',
    'How many steps do I have left?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    const payload = {
      messages: [...messages, userMsg].map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        content: m.content,
      })),
      userProfile: profile,
      dietaryPreference: profile.dietaryPreference,
      healthStatus: {
        isConnected: isHealthConnected,
        lastSynced: healthStatus?.lastSynced,
      },
      todayData: {
        date: dayLog.date,
        weight: dayLog.weight || profile.currentWeight,
        steps: dayLog.steps,
        stepsSource: dayLog.stepsSource || (isHealthConnected ? 'health_connect' : 'manual'),
        waterMl: dayLog.waterMl,
        activeMinutes: dayLog.activeMinutes,
        sleepHours: dayLog.sleepHours,
        caloriesBurned: dayLog.caloriesBurned,
        totalCalories,
        totalProtein,
        habitsSummary: `${completedHabits}/${totalHabits} completed`,
        mealsSummary: {
          breakfast: dayLog.meals.breakfast.map((m) => `${m.name} (${m.portion}, ${m.calories} kcal, ${m.protein}g protein)`).join(', '),
          midMorning: dayLog.meals.midMorning.map((m) => `${m.name} (${m.portion})`).join(', '),
          lunch: dayLog.meals.lunch.map((m) => `${m.name} (${m.portion}, ${m.calories} kcal, ${m.protein}g protein)`).join(', '),
          eveningSnack: dayLog.meals.eveningSnack.map((m) => `${m.name} (${m.portion})`).join(', '),
          dinner: dayLog.meals.dinner.map((m) => `${m.name} (${m.portion})`).join(', '),
          nightMeal: dayLog.meals.nightMeal.map((m) => `${m.name}`).join(', '),
        },
      },
    };

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || getLocalFallbackAdvice(query, caloriesRemaining, proteinRemaining, profile.dietaryPreference),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Backend call failed, using intelligent client nutrition engine fallback:', err);
      const fallbackReply = getLocalFallbackAdvice(query, caloriesRemaining, proteinRemaining, profile.dietaryPreference);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalFallbackAdvice = (
    query: string,
    calRem: number,
    protRem: number,
    diet: string
  ): string => {
    const qLower = query.toLowerCase();

    if (qLower.includes('step')) {
      const connectNotice = !isHealthConnected
        ? `\n\n💡 *Note: Health Connect is currently disconnected. Connect Health Data in **Settings > Health Data** to see live steps synchronized from your Android device.*`
        : '';

      return `### 👟 Daily Steps Breakdown\n\n- **Steps Logged Today:** ${dayLog.steps.toLocaleString()}\n- **Daily Goal:** ${profile.stepsGoal.toLocaleString()} steps\n- **Steps Remaining:** ${stepsRemaining > 0 ? `${stepsRemaining.toLocaleString()} steps left` : 'Goal already reached! 🎉'}\n- **Distance Walked:** ${(dayLog.steps * 0.00075).toFixed(1)} km\n\n${
        stepsRemaining > 0
          ? `A brisk 20–25 minute walk will add approximately ~2,500 steps, which will get you much closer to closing your daily ring!`
          : `Awesome job hitting your walking target today!`
      }${connectNotice}`;
    }

    if (qLower.includes('dinner')) {
      return `### 🥗 Recommended ${diet} Dinner Options\n\nYou currently have **~${calRem} kcal** and **${protRem}g protein** remaining for today. Here are 3 balanced, easy-to-digest dinner choices:\n\n1. **Grilled Paneer & Roasted Veggie Bowl**\n   - **Portion:** 120g low-fat paneer cubed + 1 bowl sauteed bell peppers, beans & zucchini with herbs.\n   - **Macros:** ~330 kcal | 22g protein | 12g carbs\n   - *Why it works:* High in leucine for overnight muscle recovery without spiking insulin.\n\n2. **Moong Dal Khichdi + Fresh Curd + Cucumber Salad**\n   - **Portion:** 1 medium katori khichdi (with generous moong dal to rice ratio) + 1/2 cup curd.\n   - **Macros:** ~360 kcal | 15g protein | 55g carbs\n   - *Why it works:* Light on the stomach, promotes deep sleep, and helps achieve your "Light dinner" habit.\n\n3. **Tofu & Vegetable Stir-Fry with 1 Multigrain Phulka**\n   - **Portion:** 140g firm tofu cubes tossed in sesame seeds & garlic + 1 light phulka.\n   - **Macros:** ~310 kcal | 20g protein | 26g carbs\n   - *Why it works:* Plant-powered, rich in minerals, and ready in under 12 minutes.\n\n💡 *Tip: Try to finish your dinner at least 2 hours before bed to check off your "Light dinner" and "7-8h sleep" habits!*`;
    }

    if (qLower.includes('protein')) {
      return `### 🥩 How to Reach Your Protein Goal\n\n- **Logged Protein:** ${totalProtein}g / ${profile.proteinGoalGrams}g\n- **Protein Deficit:** ${protRem > 0 ? `${protRem}g remaining` : 'Target achieved! 🎉'}\n\nTo bridge the remaining ${protRem}g, consider these high-protein ${diet} options:\n- **100g Paneer (Grilled/Bhurji):** ~18g protein\n- **1 cup Boiled Chickpeas or Rajma:** ~15g protein\n- **150g Greek Yogurt / Hung Curd:** ~15g protein\n- **1 scoop Plant or Whey Protein:** ~24g protein\n- **100g Tofu or Soya Chunks:** ~17-25g protein`;
    }

    if (qLower.includes('how am i doing') || qLower.includes('today')) {
      return `### 📊 Your Daily Summary for Today\n\n- **Habits Done:** ${completedHabits} of ${totalHabits} completed (${Math.round((completedHabits / totalHabits) * 100)}%)\n- **Steps:** ${dayLog.steps.toLocaleString()} / ${profile.stepsGoal.toLocaleString()} (${Math.min(100, Math.round((dayLog.steps / profile.stepsGoal) * 100))}%)\n- **Water:** ${(dayLog.waterMl / 1000).toFixed(1)} L / ${(profile.waterGoalMl / 1000).toFixed(1)} L\n- **Active Time:** ${dayLog.activeMinutes} min (${dayLog.caloriesBurned} kcal burned)\n- **Calories Consumed:** ${totalCalories} / ${profile.caloriesGoal} kcal\n- **Protein:** ${totalProtein}g / ${profile.proteinGoalGrams}g\n\n${
        completedHabits >= 5
          ? '🌟 Excellent momentum! You are well on your way to closing your rings today.'
          : '💪 You have good time left in the day—get a brisk walk in and log your dinner to maintain your streak!'
      }`;
    }

    return `### 🌿 Personalized Health Insights\n\nBased on your active goals:\n- **Calories:** ${totalCalories} / ${profile.caloriesGoal} kcal (${calRem} remaining)\n- **Water Intake:** ${(dayLog.waterMl / 1000).toFixed(1)} L (Target: ${(profile.waterGoalMl / 1000).toFixed(1)} L)\n- **Steps:** ${dayLog.steps.toLocaleString()} (Target: ${profile.stepsGoal.toLocaleString()})\n- **Habits Done:** ${completedHabits} of ${totalHabits}\n\nKeep focusing on whole, unprocessed meals, sip water regularly, and finish strong with an early light dinner!`;
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: `Chat refreshed! What health or nutrition question can I help you with, ${profile.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8 flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      {/* Header: AI Coach */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-xl shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00D9B5] to-[#00C8FF] text-[#050B18] flex items-center justify-center shrink-0 shadow-md shadow-[#00D9B5]/20 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[#F5F7FA] text-base sm:text-lg">AI Coach</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D9B5]/15 text-[#00D9B5] font-semibold border border-[#00D9B5]/30">
                  {isHealthConnected ? 'Health Connect Synced' : 'Live Log Connected'}
                </span>
              </div>
              <p className="text-xs text-[#9AA8BC]">Your personal health assistant</p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3 text-xs glass-capsule px-3 py-1.5 rounded-2xl self-start sm:self-auto flex-wrap">
            <span className="text-[#9AA8BC]">
              <strong className="text-[#FFB020]">{caloriesRemaining}</strong> kcal left
            </span>
            <span className="text-white/[0.12]">|</span>
            <span className="text-[#9AA8BC]">
              <strong className="text-[#00D9B5]">{proteinRemaining}g</strong> protein left
            </span>
            <span className="text-white/[0.12]">|</span>
            <span className="text-[#9AA8BC]">
              <strong className="text-[#00C8FF]">{stepsRemaining.toLocaleString()}</strong> steps left
            </span>
            <button
              onClick={handleResetChat}
              className="text-[#66758A] hover:text-[#F5F7FA] p-1 rounded-lg transition ml-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Reset Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages List: Distinct Glass Bubbles */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 p-1">
        {messages.map((msg) => {
          const isBot = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#00D9B5]/20 to-[#00C8FF]/20 text-[#00D9B5] flex items-center justify-center shrink-0 border border-[#00D9B5]/30 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Glass Chat Bubble */}
              <div
                className={`max-w-2xl rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-lg ${
                  isBot
                    ? 'glass-panel text-[#F5F7FA] border border-white/[0.08]'
                    : 'bg-gradient-to-r from-[#00D9B5]/20 to-[#00C8FF]/20 backdrop-blur-xl border border-[#00D9B5]/35 text-[#F5F7FA] ml-8 sm:ml-12'
                }`}
              >
                <div className="whitespace-pre-line prose-invert">
                  {msg.content}
                </div>
                <span
                  className={`text-[10px] mt-2 block ${
                    isBot ? 'text-[#66758A]' : 'text-[#00D9B5] font-medium'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#00D9B5] to-[#00C8FF] text-[#050B18] font-black flex items-center justify-center shrink-0 shadow-md shadow-[#00D9B5]/20 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-[#9AA8BC] text-xs">
            <div className="w-8 h-8 rounded-2xl bg-[#00D9B5]/15 text-[#00D9B5] flex items-center justify-center animate-pulse border border-[#00D9B5]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="glass-panel rounded-2xl p-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D9B5] animate-ping" />
              <span>Analyzing today's nutrition and preparing recommendations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions: Small Rounded Glass Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 no-scrollbar">
        <Lightbulb className="w-4 h-4 text-[#FFB020] shrink-0 ml-1" />
        {suggestedQuestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="min-h-[40px] text-xs px-3.5 py-1.5 rounded-full glass-capsule hover:bg-white/[0.10] text-[#9AA8BC] hover:text-[#F5F7FA] whitespace-nowrap transition-all duration-200 active:scale-95 flex items-center"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Glass Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0 glass-panel rounded-2xl p-1.5 sm:p-2 shadow-2xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask coach (e.g. "What should I eat for dinner?")...`}
          disabled={isLoading}
          className="flex-1 bg-transparent border-0 px-3 py-2 text-xs sm:text-sm text-[#F5F7FA] placeholder-[#66758A] focus:outline-none min-h-[44px]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] hover:opacity-90 disabled:opacity-30 text-[#050B18] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-[#00D9B5]/25 active:scale-95 shrink-0"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
