let currentQuestionIndex = 0; 
let questions = []; 
let timerId;
let correctAnswersCount = 0;


// Function to shuffle quiz
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Startquiz
function startQuiz() {
    const category = document.getElementById('category').value;
    const amount = parseInt(document.getElementById('amount').value, 10);
    const timeLimit = parseInt(document.getElementById('time-limit').value, 10);

    fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
        let allQuestions = data.categories.flatMap(cat => cat.questions); 
        let filteredQuestions = [];

        if (category === "Random") {
            filteredQuestions = shuffle(allQuestions).slice(0, amount);
        } else {
            // other categories
            const categoryData = data.categories.find(cat => cat.name === category);
            if (categoryData) {
                filteredQuestions = shuffle(categoryData.questions).slice(0, amount);
            } else {
                console.error('Selected category not found in data:', category);
            }
        }
        

        localStorage.setItem('questions', JSON.stringify(filteredQuestions));
        localStorage.setItem('timeLimit', timeLimit); 
        window.location.href = 'questions.html';
    })
    .catch(error => console.error('Error fetching JSON data:', error));
}

// Load quiz from json
function displayQuestionsOnLoad() {
    const storedQuestions = localStorage.getItem('questions');
    if (storedQuestions) {
        questions = JSON.parse(storedQuestions);
        if (questions.length > 0) {
            renderQuestion(questions[0]);
        }
    } else {
        console.error("No questions found in storage.");
    }
}

// Render each question
function renderQuestion(question) {
    const dataList = document.getElementById('data-list');
    dataList.innerHTML = ''; 
    const timeLimit = parseInt(localStorage.getItem('timeLimit')) * 1;

    let answersHtml = '';
    if (question.type === 'multiple choice') {
        answersHtml = renderMultipleChoiceOptions(question.options);
    } else if (question.type === 'drag-drop-in-order') {
        answersHtml = renderDragDropInOrderOptions(question.options);
    } else if (question.type === 'match-name') {
        answersHtml = renderMatchNameOptions(question.draggableItems, question.dropAreas);
    }

     // progress bar
     const currentProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
     const progressText = `Question ${currentQuestionIndex + 1}/${questions.length}`;

    let questionHtml = `
        <div class="quiz" data-question-type="${question.type}" data-correct-answer="${Array.isArray(question.answer) ? question.answer.join(',') : question.answer}">
                <div id="quiz-progress">
                    <div class="progress-bar" style="width: 0%;"></div>
                </div>
                <p id="progress-text">Question 0/0</p>
            <div class="question">${question.question}</div>
            ${question.questionImage ? `<img src="${question.questionImage}" alt="Question Image">` : ''}
            <div class="answers">${answersHtml}</div>
            <div class="feedback"></div>
            <div class="timer">Time left: <span id="timer-span">${timeLimit}</span> seconds</div>
            <button class="cross-button"><a href="index.html">&#9747;</a></button>
        </div>
    `;

    dataList.innerHTML = questionHtml; 
    updateProgress(currentQuestionIndex + 1, questions.length);

    startTimer(timeLimit);

    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            clearInterval(timerId);  
            checkAndHandleAnswer(this, question);
        });
    });
}

// starttimer
function startTimer(seconds) {
    const timerElement = document.getElementById('timer-span');
    timerElement.textContent = seconds; // Display the starting seconds
    let timeLeft = seconds;

    // Clear any existing timer before starting a new one
    clearInterval(timerId);

    timerId = setInterval(() => {
        timeLeft -= 1;
        timerElement.textContent = timeLeft;  // Update the visible countdown

        if (timeLeft <= 0) {
            clearInterval(timerId);
            handleNoResponse();  // Handle the scenario when time runs out
        }
    }, 1000); // Ensure the countdown decreases every second
}

// no response
function handleNoResponse() {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.disabled = true; // Disable all options after the time runs out
    });

    const feedbackElement = document.querySelector('.feedback');
    feedbackElement.textContent = 'Time out! No answer selected.';
    feedbackElement.className = 'feedback-incorrect';

    addNextQuestionButton();
}

// next question button
function addNextQuestionButton() {
    if (currentQuestionIndex < questions.length - 1) {
        const quizContainer = document.querySelector('.quiz');
        if (!quizContainer.querySelector('.next-button')) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next Question';
            nextButton.className = 'next-button';
            quizContainer.appendChild(nextButton);

            nextButton.addEventListener('click', () => {
                currentQuestionIndex++;
                renderQuestion(questions[currentQuestionIndex]);
            });
        }
    } else {
        console.log("showing result")
        showResults();
    }
}

// check answer
function checkAndHandleAnswer(option, question) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.disabled = true);  

    const isCorrect = option.textContent.trim() === question.answer;
    const feedbackElement = document.querySelector('.feedback');
    if (isCorrect) {
        feedbackElement.textContent = 'Correct answer!';
        feedbackElement.className = 'feedback-correct';
        correctAnswersCount++; 
        addNextQuestionButton();
    } else {
        feedbackElement.textContent = 'Wrong answer!';
        feedbackElement.className = 'feedback-incorrect';
        addNextQuestionButton();
    }

}

// progress bar
function updateProgress(current, total) {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');
    const width = (current / total) * 100;

    progressBar.style.width = `${width}%`;
    progressText.textContent = `Question ${current}/${total}`;
}

// result tab
function showResults() {
    const dataList = document.getElementById('data-list');
    dataList.innerHTML = `
        <div class="results">
            <h1>Quiz Completed!</h1>
            <p>You scored ${correctAnswersCount} out of ${questions.length} questions!</p>
            <div class="buttons">
                <button onclick="window.location.href='index.html'">Return Home</button>

                <div class="sharing buttons">
                    <a href="https://wa.me/?text=Check%20out%20this%20quiz%20about%20South%20Korea!%20https://lucykim0921.github.io/Functions" target="_blank">
                    <button>Share on WhatsApp</button></a>
                    <button onclick="copyLinkToClipboard()">Copy Link to Clipboard</button>
                </div>
            </div>
        </div>
    `;
}

function copyLinkToClipboard() {
    navigator.clipboard.writeText("https://lucykim0921.github.io/Functions").then(function() {
        alert('Link copied to clipboard!');
    }, function(err) {
        console.error('Could not copy text: ', err);
    });
}


// Render multiple choice options
const renderMultipleChoiceOptions = (options) => {
    return options.map(option => `
        <button class="option">
            ${option.text}
            ${option.imageUrl ? `<img src="${option.imageUrl}" alt="Option Image">` : ''}
        </button>
    `).join('');
};

// Render drag and drop options
const renderDragDropInOrderOptions = (options) => {
    let dragItemsHtml = options.map(option => `
        <div class="drag-item" draggable="true" ondragstart="drag(event)" id="${option.text.replace(/\s+/g, '-').toLowerCase()}">
            ${option.text}
            ${option.imageUrl ? `<img src="${option.imageUrl}" alt="${option.text}">` : ''}
        </div>
    `).join('');

    let dropPointsHtml = options.map(() => `
        <div class="drop-point" ondragover="allowDrop(event)" ondrop="drop(event)"></div>
    `).join('');

    return `
        <div class="drag-container">
            <div class="drag-items">${dragItemsHtml}</div>
            <div class="drop-areas">${dropPointsHtml}</div>
        </div>
    `;
};

// Render match-name options
const renderMatchNameOptions = (draggableItems, dropAreas) => {
    let dragItemsHtml = draggableItems.map(item => `
        <div class="drag-item" draggable="true" ondragstart="drag(event)" id="drag-${item.id}">
            ${item.text}
        </div>
    `).join('');

    let dropAreasHtml = dropAreas.map(area => `
        <div class="drop-area" ondragover="allowDrop(event)" ondrop="drop(event)" id="drop-${area.id}">
            <img src="${area.imagePath}" alt="${area.id}" class="drop-image">
        </div>
    `).join('');

    return `
        <div class="drag-container">
            <div class="drag-items">${dragItemsHtml}</div>
            <div class="drop-areas">${dropAreasHtml}</div>
        </div>
    `;
};

// Event listeners for start button
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.querySelector('.start-button');
    const dataListElement = document.getElementById('data-list');

    if (startButton) {
        startButton.addEventListener('click', startQuiz);
    }
    if (dataListElement) {
        displayQuestionsOnLoad();
    }
});

// Event listeners and interactions
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('option')) {
        const quizItem = e.target.closest('.quiz');
        const optionsContainer = e.target.closest('.answers');
        const options = optionsContainer.querySelectorAll('.option');
        

        if (!e.target.disabled) {
            // Disable all options after one is clicked
            options.forEach(option => {
                option.disabled = true; // Disable the button
                option.classList.remove('option-selected');
            });
            e.target.classList.add('option-selected'); 
            

            const isCorrect = checkAnswer(quizItem);
            const feedbackElement = quizItem.querySelector('.feedback');
            if (isCorrect) {
                feedbackElement.textContent = 'Correct answer!';
                feedbackElement.className = 'feedback-correct';
            } else {
                feedbackElement.textContent = 'Wrong answer!';
                feedbackElement.className = 'feedback-incorrect';
            }
            
            // Add Next Question button if not already present
            if (!quizItem.querySelector('.next-button')) {
                const nextButton = document.createElement('button');
                nextButton.textContent = 'Next Question';
                nextButton.className = 'next-button';
                quizItem.appendChild(nextButton);

                nextButton.addEventListener('click', () => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        renderQuestion(questions[currentQuestionIndex]);
                    } else {
                        showResults();
                    }
                });
            }
        }
    }
});

// Check the correctness 
function checkAnswer(quizItem) {
    const correctAnswer = quizItem.getAttribute('data-correct-answer').split(',');
    let userAnswer = getUserAnswer(quizItem);

    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
}

// Extract the user's answer based on the type of question
function getUserAnswer(quizItem) {
    if (quizItem.getAttribute('data-question-type') === 'multiple choice') {
        const selectedOption = quizItem.querySelector('.option-selected');
        return selectedOption ? [selectedOption.textContent.trim()] : [];
    } else {
        const draggableItems = Array.from(quizItem.querySelectorAll('.drag-item'));
        return draggableItems.map(item => item.id);
    }
}


// Basic drag and drop functions
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    let dropTarget = event.target.closest('.drop-area, .drop-point'); // This targets both drop areas for match-name and drop points for in-order.

    if (dropTarget) {
        // For match-name type questions, validate if the drop is correct
        if (dropTarget.classList.contains('drop-area') && draggedElement.id.startsWith('drag-')) {
            const expectedDropId = 'drop-' + draggedElement.id.split('-')[1];
            if (dropTarget.id === expectedDropId) {
                if (!dropTarget.querySelector('.drag-item')) { // Prevent multiple items in one drop zone
                    dropTarget.appendChild(draggedElement);
                }
            }
        } 
        // For drag-drop-in-order type questions, allow reordering within any drop points
        else if (dropTarget.classList.contains('drop-point')) {
            if (!dropTarget.querySelector('.drag-item')) { // Ensure each drop point holds only one item
                dropTarget.appendChild(draggedElement);
            }
        }
    }
}