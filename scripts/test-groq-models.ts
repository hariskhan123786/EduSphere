import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

async function listGroqModels() {
  try {
    const list = await groq.models.list();
    console.log("Available Groq models:", list.data.map(m => m.id));

    const testModel = list.data[0]?.id || "llama-3.1-8b-instant";
    console.log(`Testing with model: ${testModel}...`);
    
    const resp = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Explain Pythagorean theorem in 2 concise sentences." }],
      model: testModel,
      max_tokens: 150
    });
    console.log("✅ Groq Success with model", testModel, ":");
    console.log(resp.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("Groq test error:", err.message);
  }
}

listGroqModels();
