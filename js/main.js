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

// Function to render a single question
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
            <div class="answers" data-question-type="${question.type}">${answersHtml}</div>
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

// Event listeners and interactions
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('enter-button')) {
        const quizItem = e.target.closest('.quiz');
        const isCorrect = checkAnswer(quizItem);

        if (isCorrect) {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                renderQuestion(questions[currentQuestionIndex]); // Move to the next question
            } else {
                alert('Quiz completed!'); // Notify completion of the quiz
            }
        } else {
            const feedbackElement = quizItem.querySelector('.feedback');
            feedbackElement.textContent = 'Try again!'; // Provide opportunity to retry
            feedbackElement.className = 'feedback-incorrect';
        }
    }

    if (e.target && e.target.classList.contains('option')) {
        const optionsContainer = e.target.closest('.answers');
        const options = optionsContainer.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('option-selected')); // Clear previous selections
        e.target.classList.add('option-selected'); // Highlight newly selected option
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

// Load questions and shuffle them initially
fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
        questions = shuffle(data.categories.flatMap(category => category.questions)); // Flatten and shuffle questions from all categories
        renderQuestion(questions[currentQuestionIndex]); // Render the first question
    })
    .catch(error => {
        console.error('Error fetching JSON data:', error);
    });