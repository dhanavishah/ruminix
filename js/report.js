function endGameReport(){
  gameRunning = false;
  quizActive = false;
  const quizModal = document.getElementById("quizModal");
  quizModal.style.display = "none";
  const total = correct + wrong;
  const accuracy = total ? ((correct / total) * 100).toFixed(1) : 0;
  const modal = document.getElementById("reportCard");
  const report = document.getElementById("reportContent");
  modal.style.display = "flex";
  report.innerHTML = `
    <h2>Session Complete 🎉</h2>
    <p>Total Questions: ${total}</p>
    <p>Correct: ${correct}</p>
    <p>Wrong: ${wrong}</p>
    <p>Accuracy: ${accuracy}%</p>
    <br>
    <div class="game-btns">
    <button class="game-btn btn-replay" onclick="restartGame()">🔁 Replay</button>
    <button class="game-btn btn-dashboard" onclick="goToDashboard()">🏠 Dashboard</button>
  </div>
  `;
}
function closeReport(){
  document.getElementById("reportCard").style.display = "none";
  correct = 0;
  wrong = 0;
  questionsAsked = 0;
  askedQuestionsSet.clear();
  topicStats = {};
  quizActive = false;
  gameRunning = false;
  navigate("dashboard");
}

function goToDashboard(){
  closeReport();
}
