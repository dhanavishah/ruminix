// GLOBAL STUDY TEXT STORAGE
window.extractedStudyText = "";
window.studyContent = "";
// MAIN FILE PROCESSOR
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
  window.extractedStudyText = fullText;
  window.studyContent = fullText;
  return await identifyTopics(fullText);
}
// MASTER TEXT EXTRACTION ROUTER
async function extractText(file) {
  if (file.type === "text/plain") {
    return await file.text();
  }
  if (file.type === "application/pdf") {
    return await extractPDF(file);
  }
  if (file.type.includes("wordprocessingml")) {
    return await extractDOCX(file);
  }
  if (file.type.includes("presentationml")) {
    return await extractPPTX(file);
  }
  return "";
}
// PDF EXTRACTION (PDF.js)
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
// DOCX EXTRACTION (Mammoth.js)
async function extractDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
// PPTX EXTRACTION (JSZip)
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
// AI TOPIC + PLAN GENERATION
async function identifyTopics(text) {
  const response = await fetch("http://localhost:3000/api/topics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text
    })
  });
  const data = await response.json();
  if (data.error) {
    console.error("API ERROR:", data.error);
    alert("AI quota exceeded. Please wait and try again.");
    return [];
  }
  try {
    const rawText = data.candidates[0].content.parts[0].text;
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    console.log("RAW TOPICS TEXT:", cleaned);
    return JSON.parse(cleaned);

  } catch (error) {
    console.error("AI returned invalid JSON:", data);
    return [];
  }
}
