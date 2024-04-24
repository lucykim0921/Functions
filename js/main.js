
let currentQuestionIndex = 0; 
let questions = []; 
let timerId;
let correctAnswersCount = 0;
let currentQuestion = null;


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
    window.scrollTo(0, 0);
    currentQuestion = question;
    const dataList = document.getElementById('data-list');
    dataList.innerHTML = ''; 
    const timeLimit = parseInt(localStorage.getItem('timeLimit')) * 1;

    console.log("Current Question:", question);  
    console.log("Question Image URL:", question.questionImage);  

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
            <div class="exit-button-container">
                    <a href="index.html">Exit quiz</a>
            </div>

            <div class="quiz-content-container">
                <img src="images/border.png" class="corner" id="top-left">
                <img src="images/border.png" class="corner" id="top-right">
                <img src="images/border.png" class="corner" id="bottom-left">
                <img src="images/border.png" class="corner" id="bottom-right">

                <div id="quiz-progress">
                        <div class="progress-bar" style="width: 0%;"></div>
                </div>
                    <p id="progress-text">Question 0/0</p>

                    <div class="question">
                        ${question.question} <br>
                        ${question.questionImage ? `<img src="${question.questionImage}" alt="Question Image">` : ''}
                    </div>

                    <div class="answers">${answersHtml}</div>

                    <div class="feedback"></div>

                    <div class="timer">Time left: <span id="timer-span">${timeLimit}</span> seconds</div>
                
                    <div class="description" style="display: none;">
                        <div class="divider"></div>
                        <h3>Correct answer: <span class="correct-answer">${question.answer}</span></h3>
                        <p>${question.description}</p>
                    </div>
                
                </div>
            </div>
    `;

    console.log("Generated HTML:", questionHtml);  

    dataList.innerHTML = questionHtml; 

    updateProgress(currentQuestionIndex + 1, questions.length);

    startTimer(timeLimit);

    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            clearInterval(timerId);  
            // checkAndHandleAnswer(this, question);
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
            handleNoResponse();  // Handle noresponse (timeout)
        }
    }, 1000); // Ensure the countdown decreases every second
}


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
                if (isCorrect) {
                    correctAnswersCount++;
                }
                const feedbackElement = quizItem.querySelector('.feedback');
                const descriptionElement = quizItem.querySelector('.description');
                feedbackElement.textContent = isCorrect ? 'Correct answer!' : 'Wrong answer!';
                feedbackElement.className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';

                if (!isCorrect) {
                    descriptionElement.style.display = 'block'; 
                }        


            // Determine the next action based on question number
            if (currentQuestionIndex < questions.length - 1) {
                // Not the last question 
                if (!quizItem.querySelector('.next-button')) {
                    const nextButton = document.createElement('button');
                    nextButton.textContent = 'Next Question';
                    nextButton.className = 'next-button';
                    quizItem.appendChild(nextButton);

                    nextButton.addEventListener('click', () => {
                        currentQuestionIndex++;
                        renderQuestion(questions[currentQuestionIndex]);
                    });
                }
            } else {
                // Last question 
                const resultButton = document.createElement('button');
                resultButton.textContent = 'See Results!';
                resultButton.className = 'next-button'; 
                quizItem.appendChild(resultButton);

                resultButton.addEventListener('click', () => {
                    showResults();
                });
            }
        }

         // Scroll to bottom
         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
});

// Check the correctness - multiple choice
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


// check answers for match name
function checkAllDroppedMatchName() {
    const dropAreas = document.querySelectorAll('.drop-area');
    let allCorrect = true;
    dropAreas.forEach(dropArea => {
        const itemId = dropArea.id.split('-')[1];
        const item = dropArea.querySelector('.drag-item');

        if (!item || item.id.split('-')[1] !== itemId) {
            allCorrect = false;
        }
    });

    const feedbackElement = document.querySelector('.feedback');
    if (allCorrect) {
        feedbackElement.textContent = 'Correct!';
        feedbackElement.className = 'feedback-correct';
        correctAnswersCount++;
        clearInterval(timerId);
    } else {
        feedbackElement.textContent = 'Wrong answer!';
        feedbackElement.className = 'feedback-incorrect';
        clearInterval(timerId);
    }

    addNextQuestionButton();
}

// check answers - drop in order
function checkAllDroppedInOrder() {
    const dropPoints = document.querySelectorAll('.drop-point');
    let allCorrect = true;

    // Check the order of items
    dropPoints.forEach((dropPoint, index) => {
        const item = dropPoint.firstChild;
        if (!item || item.textContent.trim() !== currentQuestion.answer[index]) {
            allCorrect = false;
        }
    });

    const feedbackElement = document.querySelector('.feedback'); 
    if (allCorrect) {
        feedbackElement.textContent = 'Correct!';
        feedbackElement.className = 'feedback-correct';
        correctAnswersCount++;
        clearInterval(timerId);
    } else {
        feedbackElement.textContent = 'Wrong answer!';
        feedbackElement.className = 'feedback-incorrect';
        clearInterval(timerId);
    }

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

                <img src="images/border.png" class="corner-result" id="result-top-left">
                <img src="images/border.png" class="corner-result" id="result-top-left">
                <img src="images/border.png" class="corner-result" id="result-top-right">
                <img src="images/border.png" class="corner-result" id="result-bottom-left">
                <img src="images/border.png" class="corner-result" id="result-bottom-right">

                <h1>Quiz Completed!</h1>
                <p>You scored <span class="answer-count">${correctAnswersCount}</span> out of <span class="answer-count">${questions.length}</span> questions.</p>
                <div class="buttons">
                    <div class="home-button">
                        <button onclick="window.location.href='index.html'">Return Home</button>
                    </div>

                    <div class="sharing-buttons">
                        <a href="https://wa.me/?text=Check%20out%20this%20quiz%20about%20South%20Korea!%20https://lucykim0921.github.io/Functions" target="_blank">
                        <button>Share on WhatsApp</button></a>
                        <button onclick="copyLinkToClipboard()">Copy Link</button>
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

// Render drag and drop in order options
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



// General drag and drop functions for all drag-drop quiz
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
    let dropTarget = event.target.closest('.drop-area, .drop-point');

    if (!dropTarget) return; 

    // Match-name - allow dropping into any drop area
    if (dropTarget.classList.contains('drop-area')) {
        if (draggedElement.id.startsWith('drag-')) {
            // Allows dropping on an already occupied drop area, removes existing if present
            if (dropTarget.querySelector('.drag-item')) {
                dropTarget.removeChild(dropTarget.querySelector('.drag-item'));
            }
            dropTarget.appendChild(draggedElement);
        }
    }

    // drag-drop-in-order type questions
    if (dropTarget.classList.contains('drop-point')) {
        if (!dropTarget.firstChild || dropTarget.firstChild === draggedElement) {
            dropTarget.appendChild(draggedElement);
        }
    }

    const totalItems = document.querySelectorAll('.drag-item').length;
    const placedItemsMatchName = document.querySelectorAll('.drop-area .drag-item').length;
    const placedItemsInOrder = document.querySelectorAll('.drop-point .drag-item').length;
    
    if (totalItems === 4) { // 4 items max
        if (placedItemsMatchName === 4 && document.querySelector('.drop-area')) {
            checkAllDroppedMatchName();
        }
        if (placedItemsInOrder === 4 && document.querySelector('.drop-point')) {
            checkAllDroppedInOrder();
        }
    }
}




