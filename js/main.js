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
                    <div class="quiz">
                        <div class="question">${question.question}</div>
                        ${question.questionImage ? `<img src="${question.questionImage}" alt="Question Image">` : ''}
                        <div class="answers">${answersHtml}</div>
                        <button class="next-button">Next</button>
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
            <img src="${option.imageUrl}" alt="${option.text}">
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