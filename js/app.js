// AI Answer from Study Content
async function answerFromContent(question) {

  // ✅ Check if study material exists
  if (!window.extractedStudyText || window.extractedStudyText.trim() === "") {
    return {
      answer: "Please upload and generate a study plan first.",
      knowMore: ""
    };
  }

  const API_KEY = "AIzaSyDPSRmGpKS0UvsTY0L97b3UdxQ2c7ahLmc"; // Put your real key here

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
You are a study assistant.

Answer using ONLY the study material.
Then give extra related knowledge separately.

Format EXACTLY like this:

ANSWER:
<main answer>

KNOW MORE:
<extra info>

Study Material:
${window.extractedStudyText.slice(0, 6000)}

Question:
${question}
`
          }]
        }]
      })
    }
  );

  const data = await response.json();

  try {
    const rawText =
      data.candidates[0].content.parts[0].text;

    const answer =
      rawText.match(/ANSWER:\s*([\s\S]*?)KNOW MORE:/)?.[1]?.trim() || "";

    const knowMore =
      rawText.match(/KNOW MORE:\s*([\s\S]*)/)?.[1]?.trim() || "";

    return { answer, knowMore };

  } catch (error) {
    console.error("AI assistant error:", data);
    return {
      answer: "AI failed to generate answer.",
      knowMore: ""
    };
  }
}

// 🔥 VERY IMPORTANT — expose to global scope
window.answerFromContent = answerFromContent;

// Example: Updating audio paths for Vercel
const bellAudio = new Audio("/assets/sounds/bell.mp3");
const tickAudio = new Audio("/assets/sounds/tick.mp3");

// Play bell example
function playBell() {
  bellAudio.currentTime = 0;
  bellAudio.play();
}

// Play tick example
function playTick() {
  tickAudio.currentTime = 0;
  tickAudio.play();
}

// Expose globally if needed
window.playBell = playBell;
window.playTick = playTick;
