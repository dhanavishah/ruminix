let correct = 0;
let wrong = 0;
let topicStats = {}; 
let questionsAsked = 0;
const MAX_QUESTIONS = 10;
let questions = [];     
let currentQ = 0;      
let askedQuestionsSet = new Set(); 

//SAFE JSON PARSE
function safeParse(txt){
  if(!txt) return null;
if(typeof txt === "object") return txt;
  let cleaned = txt
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch(e) {}
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if(start !== -1 && end !== -1){
    try{
      return JSON.parse(cleaned.slice(start, end + 1));
    }catch(e){}
  }
  console.error("❌ PARSE FAILED:", cleaned);
  return null;
}

//GENERATE ALL QUESTIONS 
async function generateAllQuestions(topic){
  try{
    const content = window.studyContent || "";
    const raw = await generateMCQsFromContent(content, MAX_QUESTIONS);
    console.log("🔍 RAW RESPONSE:", raw);
    const parsed = safeParse(raw);
    if(Array.isArray(parsed) && parsed.length > 0){
  questions = parsed
    .filter(q =>
      q.q &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.ans === "number"
    )
    .slice(0, MAX_QUESTIONS);
  if(questions.length > 0) return;
}
  }catch(e){
    console.error("❌ Batch MCQ generation failed:", e);
  }
  // fallback
questions = [
  {
    q: "A function mainly returns:",
    options: ["Multiple values", "A single value", "No value", "Only text"],
    ans: 1,
    tag: "Functions & Procedures"
  },
  {
    q: "A procedure is used to:",
    options: ["Return a value", "Perform a task without returning a value", "Store data", "Create forms"],
    ans: 1,
    tag: "Functions & Procedures"
  },
  {
    q: "Which method is used to display a form?",
    options: ["Open()", "Show()", "Start()", "DisplayNow()"],
    ans: 1,
    tag: "Managing Forms"
  },
  {
    q: "Which event occurs when a form is first loaded?",
    options: ["Click", "Load", "Close", "Resize"],
    ans: 1,
    tag: "Managing Forms"
  },
  {
    q: "SDI stands for:",
    options: ["Single Document Interface", "Simple Data Interface", "System Data Integration", "Standard Document Input"],
    ans: 0,
    tag: "SDI vs MDI"
  },
  {
    q: "In MDI, multiple documents are:",
    options: ["Opened in separate windows", "Opened inside a parent window", "Not allowed", "Stored in database"],
    ans: 1,
    tag: "SDI vs MDI"
  },
  {
    q: "A control array is used to:",
    options: ["Store numbers", "Group similar controls together", "Create menus", "Design forms"],
    ans: 1,
    tag: "Control Arrays"
  },
  {
    q: "Controls in a control array share the same:",
    options: ["Color", "Event procedure", "Size", "Position"],
    ans: 1,
    tag: "Control Arrays"
  },
  {
    q: "Menus are mainly used for:",
    options: ["Data storage", "Navigation and commands", "Drawing graphics", "Debugging code"],
    ans: 1,
    tag: "Menu Management"
  },
  {
    q: "Which component is used to create menus?",
    options: ["Button", "Menu Editor", "Textbox", "Label"],
    ans: 1,
    tag: "Menu Management"
  }
];
}
//TRIGGER QUIZ
function triggerQuiz(){
  if(currentQ >= questions.length) return;
  quizActive = true
  const q = questions[currentQ];
  currentQ++;
  questionsAsked++;
  const modal = document.getElementById("quizModal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  showQuestion(q);
}

//SHOW QUESTION 
function showQuestion(q){
  const box = document.getElementById("quizContent");
  box.innerHTML = `<h2 style="margin-bottom:12px;">${q.q}</h2>`;
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.className = "primary";
    btn.style.display = "block";
    btn.style.margin = "10px 0";
    btn.onclick = () => {
  if(btn.disabled) return;
  document.querySelectorAll("#quizContent button")
    .forEach(b => b.disabled = true);
      const tag = q.tag || "General";
      if(!topicStats[tag]){
        topicStats[tag] = {c:0, w:0};
      }
      if(i === q.ans){
        correct++;
        topicStats[tag].c++;
        showNotification("Correct ✅");
      } else {
        wrong++;
        topicStats[tag].w++;
        showNotification("Wrong ❌");
      }
      if(questionsAsked >= MAX_QUESTIONS){
        gameRunning = false;
        quizActive = false;
        closeQuiz(true); 
        endGameReport();
      } else {
        closeQuiz();
      }
    };
    box.appendChild(btn);
  });
}

//CLOSE QUIZ 
function closeQuiz(skipResume = false){
  const modal = document.getElementById("quizModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  const canvas = document.getElementById("gameCanvas");
  if(canvas) canvas.style.filter = "none";
  if(!skipResume){
    quizActive = false;
    gameRunning = true;
    requestAnimationFrame(gameLoop);
  }
}
function resetQuizState(){
  correct = 0;
  wrong = 0;
  topicStats = {};
  currentQ = 0;
  questionsAsked = 0;
}
window.triggerQuiz = triggerQuiz;