// ===== Barajar opciones y reetiquetar letras =====
// Así la respuesta correcta no queda siempre en la misma posición.
function stripLetter(s) { return s.replace(/^[A-D]\)\s*/, ''); }

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function prepareQuestions() {
    questions.forEach(q => {
        const items = q.options.map((t, i) => ({ t: stripLetter(t), c: i === q.correct }));
        shuffleArray(items);
        q.options = items.map((o, i) => String.fromCharCode(65 + i) + ') ' + o.t);
        q.correct = items.findIndex(o => o.c);
        q.explanation = q.explanation.replace(/^Respuesta [A-D] \(Correcta\):\s*/, '');
    });
}
prepareQuestions();

let currentIndex = 0;
let userSelections = new Array(questions.length).fill(null);
let lockedStates = new Array(questions.length).fill(false);
let successCount = 0;
let errorCount = 0;

const progressIndicator = document.getElementById('progress-indicator');
const okCounter = document.getElementById('ok-counter');
const errCounter = document.getElementById('err-counter');
const progressBarFill = document.getElementById('progress-bar-fill');

const qMod = document.getElementById('q-mod');
const qTitle = document.getElementById('q-title');
const hintBoxContent = document.getElementById('hint-box-content');
const hintArrow = document.getElementById('hint-arrow');
const optionsBox = document.getElementById('options-box');
const feedbackBox = document.getElementById('feedback-box');

const btnBack = document.getElementById('btn-back');
const btnAction = document.getElementById('btn-action');

const activeQuizContent = document.getElementById('active-quiz-content');
const resultsView = document.getElementById('results-view');
const bottomNavContainer = document.getElementById('bottom-nav-container');

function renderQuestion() {
    const q = questions[currentIndex];
    qMod.textContent = q.mod;
    qTitle.textContent = q.text;
    hintBoxContent.textContent = q.hint;
    hintBoxContent.style.display = 'none';
    hintArrow.textContent = '▼';

    progressIndicator.textContent = `${currentIndex + 1} de ${questions.length}`;
    const pct = Math.round(((currentIndex + 1) / questions.length) * 100);
    progressBarFill.style.width = pct + '%';

    optionsBox.innerHTML = '';
    q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-item';

        const letterSpan = document.createElement('span');
        letterSpan.className = 'option-letter';
        letterSpan.textContent = optText.charAt(0);

        const textSpan = document.createElement('span');
        textSpan.textContent = optText.slice(3);

        btn.appendChild(letterSpan);
        btn.appendChild(textSpan);

        const isLocked = lockedStates[currentIndex];
        const selectedIdx = userSelections[currentIndex];

        if (isLocked) {
            btn.disabled = true;
            if (idx === q.correct) {
                btn.classList.add('correct');
            } else if (idx === selectedIdx) {
                btn.classList.add('incorrect');
            }
        } else {
            if (selectedIdx === idx) {
                btn.classList.add('selected');
            }
            btn.onclick = () => selectOption(idx);
        }

        optionsBox.appendChild(btn);
    });

    if (lockedStates[currentIndex]) {
        showFeedbackUI(userSelections[currentIndex] === q.correct, q);
        btnAction.textContent = currentIndex === questions.length - 1 ? 'Resultados' : 'Siguiente';
        btnAction.disabled = false;
    } else {
        feedbackBox.classList.remove('show');
        btnAction.textContent = 'Listo';
        btnAction.disabled = userSelections[currentIndex] === null;
    }

    btnBack.disabled = currentIndex === 0;
}

function selectOption(idx) {
    if (lockedStates[currentIndex]) return;
    userSelections[currentIndex] = idx;

    const buttons = optionsBox.getElementsByClassName('option-item');
    for (let i = 0; i < buttons.length; i++) {
        if (i === idx) {
            buttons[i].classList.add('selected');
        } else {
            buttons[i].classList.remove('selected');
        }
    }
    btnAction.disabled = false;
}

function handleAction() {
    const isLocked = lockedStates[currentIndex];

    if (!isLocked) {
        if (userSelections[currentIndex] === null) return;
        lockedStates[currentIndex] = true;

        const q = questions[currentIndex];
        const isCorrect = userSelections[currentIndex] === q.correct;

        if (isCorrect) {
            successCount++;
            okCounter.textContent = successCount;
        } else {
            errorCount++;
            errCounter.textContent = errorCount;
        }

        renderQuestion();
    } else {
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            renderQuestion();
        } else {
            showResultsScreen();
        }
    }
}

function handleBack() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function showFeedbackUI(isCorrect, q) {
    const letter = String.fromCharCode(65 + q.correct);
    feedbackBox.classList.add('show');
    if (isCorrect) {
        feedbackBox.style.backgroundColor = '#d1fae5';
        feedbackBox.style.color = '#065f46';
        feedbackBox.innerHTML = `<strong>✓ Respuesta correcta (${letter})</strong><br>${q.explanation}`;
    } else {
        feedbackBox.style.backgroundColor = '#fee2e2';
        feedbackBox.style.color = '#991b1b';
        feedbackBox.innerHTML = `<strong>× Respuesta incorrecta. La correcta es la ${letter}</strong><br>${q.explanation}`;
    }
}

function toggleHint() {
    if (hintBoxContent.style.display === 'block') {
        hintBoxContent.style.display = 'none';
        hintArrow.textContent = '▼';
    } else {
        hintBoxContent.style.display = 'block';
        hintArrow.textContent = '▲';
    }
}

function showResultsScreen() {
    activeQuizContent.style.display = 'none';
    bottomNavContainer.style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';

    document.getElementById('final-score').textContent = `${successCount} / ${questions.length}`;
    resultsView.style.display = 'block';
}

function restartQuiz() {
    currentIndex = 0;
    successCount = 0;
    errorCount = 0;
    userSelections = new Array(questions.length).fill(null);
    lockedStates = new Array(questions.length).fill(false);
    okCounter.textContent = '0';
    errCounter.textContent = '0';

    // Rebarajar opciones en cada reinicio
    prepareQuestions();

    resultsView.style.display = 'none';
    activeQuizContent.style.display = 'block';
    bottomNavContainer.style.display = 'flex';
    document.querySelector('.top-bar').style.display = 'flex';

    renderQuestion();
}

renderQuestion();