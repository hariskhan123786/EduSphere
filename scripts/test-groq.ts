import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
console.log("Testing Groq API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "None");

const groq = new Groq({ apiKey });

async function testGroq() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Explain Pythagorean theorem in 2 concise sentences." }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 200,
    });
    console.log("✅ Groq Response Success:");
    console.log(chatCompletion.choices[0]?.message?.content);
  } catch (error: any) {
    console.error("❌ Groq Error:", error.message);
  }
}

testGroq();
