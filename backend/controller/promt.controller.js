import { GoogleGenAI } from "@google/genai";
import { ChatSession } from "../model/chatSession.model.js";
import { ChatMessage } from "../model/chatMessage.model.js";
import config from "../config.js";

const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});

const getAiErrorResponse = (error) => {
  const status = error?.status || error?.response?.status || error?.code || 500;
  const providerMessage = error?.message || error?.response?.data?.error?.message || 'Failed to process prompt';

  if (status === 429 || /quota|rate limit|resource_exhausted/i.test(providerMessage)) {
    return {
      status: 429,
      message: 'Gemini quota exceeded. Please retry after a short delay or upgrade your plan.',
    };
  }

  return {
    status: typeof status === 'number' && status >= 400 ? status : 500,
    message: providerMessage,
  };
};

const validatePromptRequest = (req, res) => {
  const { content } = req.body;
  const model = req.body.model || config.AI_CONFIG.default;
  // Coerce temperature to number (multipart/form-data sends strings)
  const temperatureRaw = req.body.temperature;
  const temperature = temperatureRaw !== undefined ? Number(temperatureRaw) : config.AI_CONFIG.temperature.default;

  if (temperatureRaw !== undefined && Number.isNaN(temperature)) {
    res.status(400).json({
      success: false,
      error: { message: `Temperature must be a number`, code: 'INVALID_TEMPERATURE' },
    });
    return null;
  }

  const validModels = Object.values(config.AI_MODELS);
  if (!validModels.includes(model)) {
    res.status(400).json({
      success: false,
      error: {
        message: `Invalid model. Supported models: ${validModels.join(', ')}`,
        code: 'INVALID_MODEL',
      },
    });
    return null;
  }

  const tempMin = config.AI_CONFIG.temperature.min;
  const tempMax = config.AI_CONFIG.temperature.max;
  if (temperature < tempMin || temperature > tempMax) {
    res.status(400).json({
      success: false,
      error: {
        message: `Temperature must be between ${tempMin} and ${tempMax}`,
        code: 'INVALID_TEMPERATURE',
      },
    });
    return null;
  }

  return { content, model, temperature };
};

const prepareChatSession = async ({ content, userId, sessionId }) => {
  let session = null;

  if (!sessionId) {
    session = await ChatSession.create({
      userId,
      title: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
    });
  } else {
    session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return null;
    }
  }

  return session;
};

const persistAssistantMessage = async ({ sessionId, userId, reply, model, temperature }) => {
  await ChatMessage.create({
    sessionId,
    userId,
    role: "assistant",
    content: reply,
    metadata: { model, temperature },
  });
};

const updateSessionTimestamp = async (session) => {
  session.lastMessageAt = new Date();
  await session.save();
};

const sendPromptCore = async ({ req, res, isStream = false }) => {
  const validated = validatePromptRequest(req, res);
  if (!validated) return;

  const { content, model, temperature } = validated;
  const userId = req.userId;
  const { sessionId } = req.body;

  // If images were uploaded via multer, construct their public URLs
  let imageUrls = [];
  if (req.files && req.files.length) {
    const host = req.get('host');
    const protocol = req.protocol;
    imageUrls = req.files.map((f) => `${protocol}://${host}/uploads/${f.filename}`);
  }

  const session = await prepareChatSession({ content, userId, sessionId });
  if (!session) {
    res.status(404).json({
      success: false,
      error: { message: "Chat session not found" },
    });
    return;
  }

  const promptOptions = {
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: content }],
      },
    ],
    config: {
      temperature,
    },
  };

  if (!isStream) {
    await ChatMessage.create({
      sessionId: session._id,
      userId,
      role: "user",
      content,
      image: imageUrls[0] || null,
      images: imageUrls,
      metadata: { model, temperature },
    });

    // If images are present, append references and instruct the model to use them as references only
    const imageInstruction = imageUrls.length
      ? `Reference images: ${imageUrls.join(', ')}\nPlease use these images only as visual references to help answer the user's request. Do NOT generate or output any images, image files, or image creation instructions. Provide only textual assistance that references or analyzes the images as needed.`
      : '';

    const contentToSend = imageUrls.length
      ? `${imageInstruction}\n\nUser request: ${content}`
      : content;
    // support multiple possible SDK input shapes to avoid 'invalid parameters' errors
    // helper: retry wrapper for transient errors (503)
    const callGenerateContentWithRetry = async (opts, attempts = 3) => {
      let lastErr;
      for (let i = 0; i < attempts; i++) {
        try {
          return await ai.models.generateContent(opts);
        } catch (e) {
          lastErr = e;
          const status = e?.status || e?.response?.status || (e?.response && e.response.status);
          // only retry on 503 (UNAVAILABLE) or network errors
          if (status === 503) {
            const backoff = 500 * Math.pow(2, i);
            console.warn(`generateContent attempt ${i + 1} failed with 503; retrying in ${backoff}ms`);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }
          throw e;
        }
      }
      throw lastErr;
    };

    try {
      // log the incoming request and constructed options for debugging
      console.log('sendPromptCore - request body:', JSON.stringify(req.body));
      promptOptions.contents[0].parts[0].text = contentToSend;
      console.log('sendPromptCore - promptOptions:', JSON.stringify(promptOptions));
      // also provide simpler fallbacks
      promptOptions.input = contentToSend;
      promptOptions.prompt = contentToSend;

      let response;
      try {
        response = await callGenerateContentWithRetry(promptOptions, 3);
      } catch (err) {
        // If model is not found for the API/version, retry with a safe fallback model
        const status = err?.status || err?.response?.status || err?.code;
        const providerMessage = err?.message || err?.response?.data?.error?.message || '';
        const notFound = status === 404 || /not found|is not found|ModelService.ListModels/i.test(providerMessage);
        if (notFound && model !== config.AI_MODELS.GEMINI_FLASH) {
          console.warn(`Model ${model} not available; retrying with fallback ${config.AI_MODELS.GEMINI_FLASH}`);
          try {
            promptOptions.model = config.AI_MODELS.GEMINI_FLASH;
            promptOptions.contents[0].parts[0].text = contentToSend;
            response = await callGenerateContentWithRetry(promptOptions, 2);
          } catch (err2) {
            throw err2;
          }
        } else {
          throw err;
        }
      }

      const aiContent = response?.text || response?.output?.[0]?.content?.[0]?.text || "";

      await ChatMessage.create({
        sessionId: session._id,
        userId,
        role: "assistant",
        content: aiContent,
        metadata: { model: promptOptions.model || model, temperature },
      });

      await updateSessionTimestamp(session);

      res.status(200).json({
        success: true,
        message: 'Prompt processed successfully',
        reply: aiContent,
        sessionId: session._id,
        metadata: { model: promptOptions.model || model, temperature },
      });
      return;
    } catch (err) {
      console.error('AI generateContent error full:', err);
      try {
        console.error('AI generateContent error response data:', JSON.stringify(err.response?.data));
      } catch (e) {}
      const { status, message } = getAiErrorResponse(err);
      if (!res.headersSent) {
        res.status(status).json({ success: false, error: { message } });
      }
      return;
    }
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify({ type: "session", sessionId: session._id.toString() })}\n\n`);

  let assistantContent = "";

    try {
      await ChatMessage.create({
        sessionId: session._id,
        userId,
        role: "user",
        content,
        metadata: { model, temperature },
      });

      // add fallbacks for streaming API as well
      promptOptions.input = content;

      // helper: retry for stream in case of transient failures
      const callGenerateContentStreamWithRetry = async (opts, attempts = 2) => {
        let lastErr;
        for (let i = 0; i < attempts; i++) {
          try {
            return await ai.models.generateContentStream(opts);
          } catch (e) {
            lastErr = e;
            const status = e?.status || e?.response?.status;
            if (status === 503) {
              const backoff = 500 * Math.pow(2, i);
              console.warn(`generateContentStream attempt ${i + 1} failed with 503; retrying in ${backoff}ms`);
              await new Promise((r) => setTimeout(r, backoff));
              continue;
            }
            throw e;
          }
        }
        throw lastErr;
      };

      let stream;
      try {
        stream = await callGenerateContentStreamWithRetry(promptOptions, 2);
      } catch (err) {
        const status = err?.status || err?.response?.status || err?.code;
        const providerMessage = err?.message || err?.response?.data?.error?.message || '';
        const notFound = status === 404 || /not found|is not found|ModelService.ListModels/i.test(providerMessage);
        if (notFound && model !== config.AI_MODELS.GEMINI_FLASH) {
          console.warn(`Streaming model ${model} not available; retrying with fallback ${config.AI_MODELS.GEMINI_FLASH}`);
          promptOptions.model = config.AI_MODELS.GEMINI_FLASH;
          promptOptions.input = content;
          stream = await callGenerateContentStreamWithRetry(promptOptions, 1);
        } else {
          throw err;
        }
      }
      for await (const chunk of stream) {
        const text = chunk.text || "";
        if (!text) continue;
        assistantContent += text;
        res.write(`data: ${JSON.stringify({ type: "chunk", content: text })}\n\n`);
      }

      await persistAssistantMessage({
        sessionId: session._id,
        userId,
        reply: assistantContent,
        model,
        temperature,
      });
      await updateSessionTimestamp(session);

      res.write(`data: ${JSON.stringify({ type: "done", reply: assistantContent, sessionId: session._id.toString() })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Error in streaming prompt:", error?.message || error);
      const { message } = getAiErrorResponse(error);
      res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
};

export const sendPromt=async (req,res)=>{
  try {
    return await sendPromptCore({ req, res, isStream: false });
  } catch (error) {
    console.error("Error in Promt:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to process prompt' }
      });
    }
  }
};

export const sendPromtStream = async (req, res) => {
  try {
    await sendPromptCore({ req, res, isStream: true });
  } catch (error) {
    console.error("Error in streamed Promt:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to process prompt' }
      });
    }
  }
};