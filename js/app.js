async function answerFromContent(question) {
  if (!window.extractedStudyText || window.extractedStudyText.trim() === "") {
    return {
      text: "Please upload and generate a study plan first."
    };
  }
  try {
    const response = await fetch("http://localhost:3000/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        studyText: window.extractedStudyText
      })
    });
    const data = await response.json();
    console.log("AI RAW RESPONSE:", data); 
    const text =
      data?.text ||
      data?.answer ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response received.";

    return { text };

  } catch (error) {
    console.error("AI assistant error:", error);
    return {
      text: "AI failed to generate answer."
    };
  }
}
window.answerFromContent = answerFromContent;