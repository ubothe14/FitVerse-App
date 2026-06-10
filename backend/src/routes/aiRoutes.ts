import express from 'express';

export const createAiRouter = (opts: {
  aiLimiter: express.RequestHandler;
}) => {
  const { aiLimiter } = opts;
  const router = express.Router();

  router.post('/analyze', aiLimiter, async (req, res) => {
    const prompt = String(req.body?.prompt ?? '').trim();
    const model = String(req.body?.model || 'gemini-2.5-flash');

    const apiKey =
      String(req.header('x-gemini-api-key') ?? '').trim() ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'No Gemini API key configured' });
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown Gemini API error' }));
        console.error(`❌ Gemini API error (${response.status}):`, errorBody);
        return res.status(response.status).json(errorBody);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      res.json({ text });
    } catch (err) {
      const message = (err as Error).message || 'AI analysis failed';
      console.error(`❌ AI analysis failed: ${message}`);
      res.status(500).json({ error: message });
    }
  });

  router.post('/analyze-food', aiLimiter, async (req, res) => {
    let base64Data = String(req.body?.image ?? '').trim();
    const mimeType = String(req.body?.mimeType || 'image/jpeg');
    const model = String(req.body?.model || 'gemini-2.5-flash');

    const apiKey =
      String(req.header('x-gemini-api-key') ?? '').trim() ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'No Gemini API key configured' });
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'No food image data provided' });
    }

    const commaIndex = base64Data.indexOf(',');
    if (commaIndex !== -1) {
      base64Data = base64Data.substring(commaIndex + 1);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Analyze this food image. Estimate its macros (calories in kcal, protein in grams, carbs in grams, fat in grams). Return only a JSON object matching the requested schema.",
                },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                foodName: { type: 'STRING' },
                calories: { type: 'INTEGER' },
                protein: { type: 'INTEGER' },
                carbs: { type: 'INTEGER' },
                fat: { type: 'INTEGER' },
                explanation: { type: 'STRING' },
              },
              required: ['foodName', 'calories', 'protein', 'carbs', 'fat', 'explanation'],
            },
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown Gemini API error' }));
        console.error(`❌ Gemini API error (${response.status}):`, errorBody);
        return res.status(response.status).json(errorBody);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      try {
        const parsedResult = JSON.parse(text);
        res.json(parsedResult);
      } catch (jsonErr) {
        console.warn('⚠️ Gemini output not parseable as JSON:', text);
        res.json({
          foodName: 'Detected Meal',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          explanation: text,
        });
      }
    } catch (err) {
      const message = (err as Error).message || 'AI food analysis failed';
      console.error(`❌ AI food analysis failed: ${message}`);
      res.status(500).json({ error: message });
    }
  });

  return router;
};
