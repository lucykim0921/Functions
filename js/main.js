let currentQuestionIndex = 0; // Global index to track the current question
let questions = []; // Array to hold shuffled questions

// Function to shuffle array (Fisher-Yates shuffle algorithm)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize quiz with selections from index.html
function startQuiz() {
    const category = document.getElementById('category').value;
    const amount = parseInt(document.getElementById('amount').value, 10);

    fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
        let allQuestions = data.categories.flatMap(cat => cat.questions); // Flatten questions from all categories
        let filteredQuestions = [];

        if (category === "Random") {
            // Shuffle all questions first then slice to get random questions across all categories
            filteredQuestions = shuffle(allQuestions).slice(0, amount);
        } else {
            // Filter by the selected category and then shuffle and slice
            const categoryData = data.categories.find(cat => cat.name === category);
            if (categoryData) {
                filteredQuestions = shuffle(categoryData.questions).slice(0, amount);
            } else {
                console.error('Selected category not found in data:', category);
            }
        }

        localStorage.setItem('questions', JSON.stringify(filteredQuestions));
        window.location.href = 'questions.html';
    })
    .catch(error => console.error('Error fetching JSON data:', error));
}

// Load and display questions on questions.html
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

// Render a single question
function renderQuestion(question) {
    const dataList = document.getElementById('data-list');
    dataList.innerHTML = ''; // Clear previous content

    let answersHtml = '';
    if (question.type === 'multiple choice') {
        answersHtml = renderMultipleChoiceOptions(question.options);
    } else if (question.type === 'drag-drop-in-order') {
        answersHtml = renderDragDropInOrderOptions(question.options);
    }

    let questionHtml = `
        <div class="quiz" data-question-type="${question.type}" data-correct-answer="${Array.isArray(question.answer) ? question.answer.join(',') : question.answer}">
            <div class="question">${question.question}</div>
            ${question.questionImage ? `<img src="${question.questionImage}" alt="Question Image">` : ''}
            <div class="answers">${answersHtml}</div>
            <div class="feedback"></div>
            <button class="enter-button">Enter</button>
            <button class="cross-button"><a href="index.html">&#9747;</a></button>
        </div>
    `;

    dataList.innerHTML = questionHtml; // Render the current question
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

// Event listeners for interaction
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
    if (e.target && e.target.classList.contains('enter-button')) {
        const quizItem = e.target.closest('.quiz');
        const isCorrect = checkAnswer(quizItem);

        if (isCorrect) {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                renderQuestion(questions[currentQuestionIndex]);
            } else {
                alert('Quiz completed!');
            }
        } else {
            const feedbackElement = quizItem.querySelector('.feedback');
            feedbackElement.textContent = 'Try again!';
            feedbackElement.className = 'feedback-incorrect';
        }
    }

    if (e.target && e.target.classList.contains('option')) {
        const optionsContainer = e.target.closest('.answers');
        const options = optionsContainer.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('option-selected'));
        e.target.classList.add('option-selected');
    }
});

// Check the correctness of the answer
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
    var data = event.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    event.target.appendChild(draggedElement);
}