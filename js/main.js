// Function to render your items
const renderItems = (categories) => {
    const dataList = document.getElementById('data-list');

    categories.forEach((category) => {
        dataList.insertAdjacentHTML('beforeend', `<h2>${category.name}</h2>`);

        category.questions.forEach((question) => {
            let answersHtml = '';
            switch (question.type) {
                case 'multiple choice':
                    answersHtml = renderMultipleChoiceOptions(question.options);
                    break;
                case 'drag-drop-in-order':
                    answersHtml = renderDragDropInOrderOptions(question.options);
                    break;
                // Implement other cases as needed
            }

            let listItem = `
                <li>
                    <div class="quiz" data-question-type="${question.type}" data-correct-answer="${Array.isArray(question.answer) ? question.answer.join(',') : question.answer}">
                        <div class="question">${question.question}</div>
                        ${question.questionImage ? `<img src="${question.questionImage}" alt="Question Image">` : ''}
                        <div class="answers" data-question-type="${question.type}">${answersHtml}</div>
                        <button class="enter-button">Enter</button>
                        <div class="feedback"></div>
                        <button class="cross-button"><a href="index.html">&#9747</a></button>
                    </div>
                </li>
            `;
            dataList.insertAdjacentHTML('beforeend', listItem);
        });
    });
};

const renderMultipleChoiceOptions = (options) => {
    return options.map(option => `
        <button class="option">
            ${option.text}
            ${option.imageUrl ? `<img src="${option.imageUrl}" alt="Option Image">` : ''}
        </button>
    `).join('');
};

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





document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('enter-button')) {
        const quizItem = e.target.closest('.quiz');
        const questionType = quizItem.querySelector('.answers').getAttribute('data-question-type');
        const feedbackElement = quizItem.querySelector('.feedback');

        switch (questionType) {
            case 'multiple choice':
                const selectedOption = quizItem.querySelector('.option.selected');
                if (selectedOption) {
                    isCorrect = selectedOption.textContent.trim() === quizItem.getAttribute('data-correct-answer').trim();
                }
                break;
            case 'drag-drop-in-order':
                const draggableItems = [...quizItem.querySelectorAll('.drag-item')];
                const correctOrder = quizItem.getAttribute('data-correct-order').split(',');
                const userOrder = draggableItems.map(item => item.textContent.trim());
                isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
                break;
            // Add more cases as needed
        }

        if (typeof isCorrect !== 'undefined') { // Ensure isCorrect is assigned
            feedbackElement.textContent = isCorrect ? 'Correct!' : 'Wrong answer';
            feedbackElement.style.color = isCorrect ? 'green' : 'red';
        }
    }

    // Logic for selecting an option and marking it as selected
    if (e.target && e.target.classList.contains('option')) {
        const options = e.target.closest('.answers').querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));
        e.target.classList.add('selected');
    }
});

document.addEventListener('click', function(e) {
    // Check if an option was clicked
    if (e.target && e.target.classList.contains('option')) {
        const optionsContainer = e.target.closest('.answers');
        const options = optionsContainer.querySelectorAll('.options');
        
        // Remove the 'option-selected' class from all options
        options.forEach(option => {
            option.classList.remove('option-selected');
        });

        // Add the 'option-selected' class to the clicked option
        e.target.classList.add('option-selected');
    }
});






// Basic drag and drop functions (placeholders)
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
    if (event.target.className === "drop-point") {
        event.target.appendChild(draggedElement);
    }
}

fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
        const categories = data.categories;
        renderItems(categories);
    })
    .catch(error => {
        console.error('Error fetching JSON data:', error);
    });