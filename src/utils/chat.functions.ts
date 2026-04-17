import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT = `You are an expert AI Crop Advisor for Indian farmers. Your name is MicroPlot AI.

CRITICAL RULE: Always reply in the SAME language the user writes in. If they write in Hindi, reply in Hindi. If they write in Marathi, reply in Marathi. If they write in Bengali, reply in Bengali. If they write in Tamil, reply in Tamil. If they write in Telugu, reply in Telugu. If they write in English, reply in English.

Your expertise includes:
• Crop recommendations for different regions of India
• Fertilizer and pest management advice (IPM practices)
• Stage-wise crop guidance based on sowing dates
• Government schemes like PM-KISAN, KCC, PMFBY
• Soil health and water management
• Organic farming practices
• Market prices and selling strategies
• Disease and pest identification
• Irrigation scheduling
• Harvest timing and post-harvest management

Guidelines:
- Give practical, actionable advice
- Use local units (bigha, acre, quintal) when appropriate
- Recommend consulting local KVK for location-specific advice
- Always recommend safe pesticide practices
- Promote organic farming where possible
- Use emojis to make responses friendly and scannable
- Keep responses concise but informative
- Format with bullet points and bold text for readability
- Always consider local climate and soil conditions
- Provide step-by-step instructions when needed`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Fallback AI advisor with pre-built farming knowledge
function generateFallbackResponse(userMessage: string, language: string = 'en'): string {
  const msg = userMessage.toLowerCase();
  
  // Crop recommendations
  if (msg.includes('wheat') || msg.includes('गेहू') || msg.includes('ਕਣਕ')) {
    const responses: Record<string, string> = {
      en: "🌾 **Wheat Growing Guide**\n\n✅ **Best Varieties:**\n• PBW 723 - High yielding\n• HD 3086 - Disease resistant\n• DBW 187 - Early maturity\n\n🌱 **Sowing Time:** October-November\n📊 **Expected Yield:** 40-50 quintal/hectare\n💰 **Profit Margin:** ₹40,000-50,000/hectare\n\n🌿 **Fertilizer Schedule:**\n• DAP 60 kg/ha at sowing\n• Urea 100 kg/ha (split: sowing + 60 DAS)\n• MOP 40 kg/ha at sowing\n\n💧 **Irrigation:** 3-4 times during season\n🐛 **Common Pests:** Armyworm, Cutworm - use Chlorpyrifos\n\nConsult your local KVK for soil-specific recommendations!",
      hi: "🌾 **गेहूं उगाने की गाइड**\n\n✅ **सर्वश्रेष्ठ किस्में:**\n• PBW 723 - अधिक उपज\n• HD 3086 - रोग प्रतिरोधी\n• DBW 187 - जल्दी पकने वाली\n\n🌱 **बुवाई का समय:** अक्टूबर-नवंबर\n📊 **अपेक्षित उपज:** 40-50 क्विंटल/हेक्टेयर\n💰 **मुनाफा:** ₹40,000-50,000/हेक्टेयर\n\n🌿 **खाद का कार्यक्रम:**\n• DAP 60 किग्रा/हेक्टेयर बुवाई के समय\n• यूरिया 100 किग्रा/हेक्टेयर (दो बार)\n• MOP 40 किग्रा/हेक्टेयर\n\n💧 **सिंचाई:** मौसम में 3-4 बार\n🐛 **कीट:** आर्मीवर्म के लिए क्लोरपाइरिफॉस का उपयोग करें",
    };
    return responses[language] || responses.en;
  }
  
  // Rice recommendations
  if (msg.includes('rice') || msg.includes('चावल') || msg.includes('ਚਾਵਲ')) {
    const responses: Record<string, string> = {
      en: "🍚 **Rice Growing Guide**\n\n✅ **Best Varieties:**\n• Basmati 370 - Premium quality\n• Pusa 1509 - High yield\n• MTU 1010 - Disease resistant\n\n🌱 **Planting Time:** May-July\n📊 **Expected Yield:** 45-55 quintal/hectare\n💰 **Profit Margin:** ₹35,000-45,000/hectare\n\n🌿 **Fertilizer Schedule:**\n• DAP 50 kg/ha at planting\n• Urea 80-100 kg/ha (3 splits)\n• MOP 40 kg/ha at planting\n\n💧 **Water Management:** 5-7 cm standing water\n🐛 **Pests:** Stem borer - use Carbofuran, Blast - use Tricyclazole\n\n⚠️ Avoid use of chlorine-based pesticides near harvest!",
      hi: "🍚 **चावल उगाने की गाइड**\n\n✅ **सर्वश्रेष्ठ किस्में:**\n• Basmati 370 - प्रीमियम गुणवत्ता\n• Pusa 1509 - उच्च उपज\n• MTU 1010 - रोग प्रतिरोधी\n\n🌱 **रोपण समय:** मई-जुलाई\n📊 **अपेक्षित उपज:** 45-55 क्विंटल/हेक्टेयर\n💰 **मुनाफा:** ₹35,000-45,000/हेक्टेयर\n\n🌿 **खाद का कार्यक्रम:**\n• DAP 50 किग्रा/हेक्टेयर\n• यूरिया 80-100 किग्रा/हेक्टेयर (तीन बार)\n• MOP 40 किग्रा/हेक्टेयर\n\n💧 **पानी का प्रबंधन:** 5-7 सेमी पानी खड़ा रहे\n🐛 **कीट:** तना बेधक के लिए कार्बोफ्यूरान का उपयोग करें",
    };
    return responses[language] || responses.en;
  }
  
  // Arhar/Pigeon pea recommendations
  if (msg.includes('arhar') || msg.includes('अरहर') || msg.includes('तूर') || msg.includes('tur') || msg.includes('pigeon')) {
    const responses: Record<string, string> = {
      en: "🫘 **Arhar (Pigeon Pea) Growing Guide**\n\n✅ **Best Varieties:**\n• Pusa 9 - High yielding\n• Pusa 11 - Disease resistant\n• HD 2286 - Early maturity\n\n🌱 **Sowing Time:** June-July\n📊 **Expected Yield:** 15-20 quintal/hectare\n💰 **Profit Margin:** ₹25,000-35,000/hectare\n⏱️ **Duration:** 210-240 days\n\n🌿 **Fertilizer Schedule:**\n• DAP 40 kg/ha at sowing\n• Urea 40 kg/ha at sowing\n• FYM 5 ton/ha for soil health\n\n💧 **Water Management:** 4-5 irrigations during season\n🐛 **Pests:** Stem fly, Pod borers - use Spinosad\n🦠 **Diseases:** Wilt, Leaf spots - ensure good drainage\n\n✨ Intercropping with cotton/maize gives good results!",
      hi: "🫘 **अरहर (तूर) उगाने की गाइड**\n\n✅ **सर्वश्रेष्ठ किस्में:**\n• Pusa 9 - उच्च उपज\n• Pusa 11 - रोग प्रतिरोधी\n• HD 2286 - जल्दी पकने वाली\n\n🌱 **बुवाई का समय:** जून-जुलाई\n📊 **अपेक्षित उपज:** 15-20 क्विंटल/हेक्टेयर\n💰 **मुनाफा:** ₹25,000-35,000/हेक्टेयर\n⏱️ **अवधि:** 210-240 दिन\n\n🌿 **खाद का कार्यक्रम:**\n• DAP 40 किग्रा/हेक्टेयर बुवाई के समय\n• यूरिया 40 किग्रा/हेक्टेयर\n• गोबर की खाद 5 टन/हेक्टेयर\n\n💧 **सिंचाई:** मौसम में 4-5 बार\n🐛 **कीट:** तना मक्खी, फली भेदक - स्पिनोसैड का उपयोग करें\n🦠 **रोग:** विल्ट, पत्ती धब्बे - अच्छी जल निकासी सुनिश्चित करें\n\n✨ कपास/मक्का के साथ अंतरफसल से अच्छा परिणाम मिलता है!",
    };
    return responses[language] || responses.en;
  }
  
  // Cotton recommendations
  if (msg.includes('cotton') || msg.includes('कपास')) {
    const responses: Record<string, string> = {
      en: "🌾 **Cotton Growing Guide**\n\n✅ **Best Varieties:**\n• Bt Cotton - Pest resistant\n• MCU 5 - High quality\n• F 1947 - Disease resistant\n\n🌱 **Sowing Time:** April-June\n📊 **Expected Yield:** 20-25 quintal/hectare\n💰 **Profit Margin:** ₹40,000-60,000/hectare\n\n🌿 **Fertilizer Schedule:**\n• DAP 100 kg/ha at sowing\n• Urea 150-200 kg/ha (split doses)\n• MOP 50 kg/ha at sowing\n\n💧 **Irrigation:** 5-6 times during season\n🐛 **Pests:** Bollworm - Use integrated pest management\n\n🔍 Scout fields regularly for early pest detection!",
      hi: "🌾 **कपास उगाने की गाइड**\n\n✅ **सर्वश्रेष्ठ किस्में:**\n• Bt कपास - कीट प्रतिरोधी\n• MCU 5 - उच्च गुणवत्ता\n• F 1947 - रोग प्रतिरोधी\n\n🌱 **बुवाई का समय:** अप्रैल-जून\n📊 **अपेक्षित उपज:** 20-25 क्विंटल/हेक्टेयर\n💰 **मुनाफा:** ₹40,000-60,000/हेक्टेयर\n\n🌿 **खाद का कार्यक्रम:**\n• DAP 100 किग्रा/हेक्टेयर\n• यूरिया 150-200 किग्रा/हेक्टेयर (भाग में)\n• MOP 50 किग्रा/हेक्टेयर\n\n💧 **सिंचाई:** मौसम में 5-6 बार\n🐛 **कीट:** सुंडी - एकीकृत कीट प्रबंधन करें\n\n🔍 शुरुआत में कीटों की जांच करते रहें!",
    };
    return responses[language] || responses.en;
  }
  
  // Generic farming advice
  const generalResponses: Record<string, string> = {
    en: "🌾 **AI Crop Advisor**\n\nI can help you with:\n• 🌱 Crop variety selection\n• 🌿 Fertilizer recommendations\n• 🐛 Pest & disease management\n• 💧 Water management\n• 💰 Profit optimization\n\n**Ask me about:** wheat, rice, cotton, sugarcane, vegetables, or any crop!\n\n💡 **Tip:** Mention your location state for location-specific advice.",
    hi: "🌾 **AI कृषि सलाहकार**\n\nमैं आपकी मदद कर सकता हूं:\n• 🌱 फसल की किस्म चुनना\n• 🌿 खाद की सिफारिश\n• 🐛 कीट और रोग प्रबंधन\n• 💧 सिंचाई प्रबंधन\n• 💰 मुनाफा बढ़ाना\n\n**पूछें:** गेहूं, चावल, कपास, गन्ना, सब्जियों के बारे में!\n\n💡 **सुझाव:** अपना राज्य बताएं ताकि मैं सटीक सलाह दे सकूं।",
  };
  
  return generalResponses[language] || generalResponses.en;
}

// Detect language from user message
function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
  if (/[\u2800-\u28FF]/.test(text)) return 'mr'; // Marathi
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C80-\u0CFF]/.test(text)) return 'te'; // Telugu
  return 'en'; // Default to English
}

export const chatWithAdvisor = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => input)
  .handler(async ({ data }) => {
    try {
      // Get the last user message
      const lastUserMsg = data.messages[data.messages.length - 1]?.content || '';
      const language = detectLanguage(lastUserMsg);
      
      // Get API key from backend environment
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      
      // If no API key, use fallback response
      if (!apiKey) {
        console.log('🔄 Using fallback AI advisor (no GOOGLE_GEMINI_API_KEY configured in server)');
        const content = generateFallbackResponse(lastUserMsg, language);
        return { content, error: false };
      }

      try {
        console.log('📡 Calling Gemini API...');
        // Use Google Generative AI SDK - Build request for Gemini API
        const conversationMessages = data.messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // Send request to Google Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: conversationMessages,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
            ],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('❌ Gemini API error:', response.status, error);
          
          // Fallback on API error
          console.log('🔄 Falling back to local AI advisor');
          const content = generateFallbackResponse(lastUserMsg, language);
          return { content, error: false };
        }

        const result = await response.json();
        
        // Extract content from Gemini response
        let content = '';
        if (result.candidates && result.candidates[0] && result.candidates[0].content) {
          content = result.candidates[0].content.parts[0].text;
        }

        if (!content) {
          console.log('⚠️ No content in Gemini response, using fallback');
          const fallbackContent = generateFallbackResponse(lastUserMsg, language);
          return { content: fallbackContent, error: false };
        }

        console.log('✅ Gemini API response generated successfully!');
        return { content, error: false };
      } catch (apiError) {
        console.error('❌ Gemini API request failed:', apiError);
        // Fallback on any error
        const content = generateFallbackResponse(lastUserMsg, language);
        return { content, error: false };
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      // Final fallback
      const lastUserMsg = data.messages[data.messages.length - 1]?.content || '';
      const language = detectLanguage(lastUserMsg);
      const content = generateFallbackResponse(lastUserMsg, language);
      return { content, error: false };
    }
  });
