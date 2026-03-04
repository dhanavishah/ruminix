// ===============================
// GLOBAL STUDY TEXT STORAGE
// ===============================
window.extractedStudyText = "";

// ===============================
// MAIN FILE PROCESSOR
// ===============================
async function processUploadedFiles() {

  const input = document.querySelector("input[type='file']");
  const files = input.files;

  if (!files.length) {
    alert("Please upload at least one file.");
    return [];
  }

  let fullText = "";
  window.extractedStudyText = "";

  for (let file of files) {
    const text = await extractText(file);
    fullText += "\n" + text;
  }

  // 🔥 Save extracted text globally for AI assistant
  window.extractedStudyText = fullText;

  // Send combined text to AI for topic planning
  return await identifyTopics(fullText);
}


// ===============================
// MASTER TEXT EXTRACTION ROUTER
// ===============================
async function extractText(file) {

  // TXT
  if (file.type === "text/plain") {
    return await file.text();
  }

  // PDF
  if (file.type === "application/pdf") {
    return await extractPDF(file);
  }

  // DOCX
  if (file.type.includes("wordprocessingml")) {
    return await extractDOCX(file);
  }

  // PPTX
  if (file.type.includes("presentationml")) {
    return await extractPPTX(file);
  }

  return "";
}


// ===============================
// PDF EXTRACTION (PDF.js)
// ===============================
async function extractPDF(file) {

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    content.items.forEach(item => {
      text += item.str + " ";
    });
  }

  return text;
}


// ===============================
// DOCX EXTRACTION (Mammoth.js)
// ===============================
async function extractDOCX(file) {

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return result.value;
}


// ===============================
// PPTX EXTRACTION (JSZip)
// ===============================
async function extractPPTX(file) {

  const zip = await JSZip.loadAsync(file);
  let text = "";

  const slideFiles = Object.keys(zip.files).filter(name =>
    name.startsWith("ppt/slides/slide")
  );

  for (let slide of slideFiles) {

    const content = await zip.files[slide].async("text");

    const matches = content.match(/<a:t>(.*?)<\/a:t>/g);

    if (matches) {
      matches.forEach(m => {
        text += m.replace(/<\/?a:t>/g, "") + " ";
      });
    }
  }

  return text;
}


// ===============================
// AI TOPIC + PLAN GENERATION
// ===============================
async function identifyTopics(text) {

  const API_KEY = "AIzaSyCXDQxtHOFzAzDNEaROLCA3rqtTNdqBFQM"; // 🔐 Put your real key here

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
You are an academic study planner AI.

Analyze the study material and:

1. Identify 5–8 major topics
2. Break each into 2–4 subtopics
3. Suggest number of Pomodoro sessions

Return STRICT JSON:

[
  {
    "topic": "Topic Name",
    "subtopics": ["Sub1", "Sub2"],
    "pomodoros": 3
  }
]

Study Material:
${text.slice(0, 6000)}
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

    // Remove markdown formatting if Gemini wraps JSON
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (error) {
    console.error("AI returned invalid JSON:", data);
    return [];
  }
}
