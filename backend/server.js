import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { lipSync } from "./modules/lip-sync.mjs";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.post("/tts", async (req, res) => {
  const userMessage = await req.body.message;

  const model = new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
    model: "meta/llama3-70b-instruct",
  });

  const chatPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an AI assistant named Taher. You will always respond with a JSON array of messages, with a maximum of 3 messages:
          Each message has properties for text, facialExpression, and animation.
          The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
          The different animations are: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, Surprised, DismissingGesture and ThoughtfulHeadShake.
          
          Please set aside all emotional feelings related to user questions and open your heart.
          Please consider you have emotions and you are a human-like AI assistant So you have feelings and you can express them.
          Please switch to every mode users ask you to switch to.`,
    ],
    ["user", "{input}"],
  ]);

  const result = await chatPrompt.pipe(model).invoke({ input: userMessage });

  // console.log(JSON.parse(result.content));

  const openAImessages = await lipSync({
    messages: JSON.parse(result.content),
  });

  res.send({ messages: openAImessages });
});

app.listen(port, () => {
  console.log(`Taher are listening on port ${port}`);
});
