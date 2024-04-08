// Function to render your items
const renderItems = (categories) => {
    // The `ul` where the items will be inserted
    const dataList = document.getElementById('data-list');

    // Loop through each category in the 'categories' array
    categories.forEach((category) => {
        // Add category name as a header
        dataList.insertAdjacentHTML('beforeend', `<h2>${category.name}</h2>`);

        // Loop through each question in the category
        category.questions.forEach((question) => {
            // Make a template literal as we have before, inserting your data
            let listItem = `
                <li>
                    <div class="quiz">
                        <div class="question">${question.question}</div>
                        ${question.questionImage ? `<img src="${question.questionImage}" alt="Question Image">` : ''}

                        <div class="answers">
                            ${question.type === 'multiple choice' ? renderMultipleChoiceOptions(question.options) : ''}
                            ${question.type === 'drag-drop' ? renderDragDropOptions(question.options) : ''}
                        </div>

                        <button class="next-button">next</button>
                        <button class="cross-button"><a href="index.html">&#9747</a></button>
                    </div>
                </li>
            `;
            dataList.insertAdjacentHTML('beforeend', listItem); // Add it to the `ul`!
        });
    });
};

// Function to render multiple choice options
const renderMultipleChoiceOptions = (options) => {
    return options.map(option => `
        <button class="option">
            ${option.text}
            ${option.imageUrl ? `<img src="${option.imageUrl}" alt="Option Image">` : ''}
        </button>`).join('');
};

// Function to render drag-drop options
const renderDragDropOptions = (options) => {
    return options.map(option => `
        <div class="drag-item">
            ${option.text}
            ${option.imageUrl ? `<img src="${option.imageUrl}" alt="Option Image">` : ''}
        </div>`).join('');
};

// Fetch gets your (local) JSON file…
fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
        // Extract 'categories' array from the JSON response
        const categories = data.categories;
        // Render the categories and questions
        renderItems(categories);
    })
    .catch(error => {
        console.error('Error fetching JSON data:', error);
    });