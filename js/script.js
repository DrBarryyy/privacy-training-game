let currentQuestion = 0;
let score = 0;
let questions = [];

fetch("data/questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
  });

function showQuestion() {
    const q = questions[currentQuestion];
    const questionEl = document.getElementById("question");
    const answersEl = document.getElementById("answers");
    const feedbackEl = document.getElementById("feedback");
    const nextBtn = document.getElementById("next-btn");

    questionEl.innerText = q.question;
    answersEl.innerHTML = "";
    feedbackEl.innerText = "";
    nextBtn.style.display = "none";

    if (q.type === "multiple") {
        q.options.forEach(option => {
            const btn = document.createElement("button");
            btn.innerText = option;
            btn.onclick = () => {
                if (option === q.answer) {
                    feedbackEl.innerText = "✅ Correct!";
                    score++;
                } else {
                    feedbackEl.innerText = `❌ Incorrect. Answer: ${q.answer}`;
                }
                nextBtn.style.display = "inline-block";
            };
            answersEl.appendChild(btn);
        });
    }

    else if (q.type === "text") {
        const input = document.createElement("input");
        input.placeholder = "Type your answer...";
        input.style.width = "80%";
        input.style.padding = "10px";
        answersEl.appendChild(input);

        const submit = document.createElement("button");
        submit.innerText = "Submit";
        submit.onclick = () => {
            const userAnswer = input.value.trim().toLowerCase();
            const isCorrect = q.answer.some(a => userAnswer.includes(a));
            if (isCorrect) {
                feedbackEl.innerText = "✅ Correct!";
                score++;
            } else {
                feedbackEl.innerText = `❌ Possible answers: ${q.answer.join(", ")}`;
            }
            nextBtn.style.display = "inline-block";
        };
        answersEl.appendChild(submit);
    }

    else if (q.type === "drag") {
        const pairs = Object.entries(q.pairs);
        const terms = pairs.map(([term]) => term);
        const definitions = pairs.map(([_, def]) => def);
        const dropData = {};

        // Shuffle definitions
        definitions.sort(() => 0.5 - Math.random());

        const dropZone = document.createElement("div");
        dropZone.className = "drag-drop";

        terms.forEach(term => {
            const box = document.createElement("div");
            box.className = "drag-item";
            box.innerText = term;
            box.draggable = true;
            box.id = `drag-${term}`;
            box.ondragstart = e => {
                e.dataTransfer.setData("text", e.target.id);
            };
            dropZone.appendChild(box);
        });

        const dropTargets = document.createElement("div");
        dropTargets.className = "drop-area";

        definitions.forEach(def => {
            const drop = document.createElement("div");
            drop.className = "drop-box";
            drop.innerText = def;
            drop.setAttribute("data-definition", def);
            drop.ondragover = e => e.preventDefault();
            drop.ondrop = e => {
                const draggedId = e.dataTransfer.getData("text");
                const dragged = document.getElementById(draggedId);

                drop.innerHTML = def; // Reset label
                drop.appendChild(dragged);

                const term = dragged.innerText;
                dropData[def] = term; // Save match
            };
            dropTargets.appendChild(drop);
        });

        answersEl.appendChild(dropZone);
        answersEl.appendChild(dropTargets);

        const checkBtn = document.createElement("button");
        checkBtn.innerText = "Submit Matches";
        checkBtn.onclick = () => {
            let correct = 0;
            pairs.forEach(([term, def]) => {
                if (dropData[def] === term) {
                    correct++;
                }
            });

            feedbackEl.innerText = `✅ You matched ${correct}/${pairs.length} correctly`;
            if (correct === pairs.length) score++;
            nextBtn.style.display = "inline-block";
        };
        answersEl.appendChild(checkBtn);
    }
}


function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    window.location.href = `results.html?score=${score}&total=${questions.length}`;
  }
}
