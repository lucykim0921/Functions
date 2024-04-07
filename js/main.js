const renderItems = (questions) => {
    // The `ul` where the items will be inserted
    const dataList = document.getElementById('data-list');

    // Loop through each question in the 'questions' array
    questions.forEach((question) => {
        // Make a template literal as we have before, inserting your data
        let listItem = `
            <li>
                <div class="quiz">
                    <div class="question">${question.question}</div>
                    ${question.questionImage ? `<img src="${question.questionImage}" alt="Question Image">` : ''}

                    <div class="answers">
                        ${question.options.map(option => `
                            <button class="option">
                                ${option.text}
                                ${option.imageUrl ? `<img src="${option.imageUrl}" alt="Option Image">` : ''}
                            </button>`).join('')}
                    </div>

                    <button class="next-button">next</button>
                    <button class="cross-button"><a href="index.html">&#9747</a></button>
                </div>
            </li>
        `;
        dataList.insertAdjacentHTML('beforeend', listItem); // Add it to the `ul`!
    });
};

// Fetch gets your (local) JSON file…
fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
        // Extract 'questions' array from the JSON response
        const questions = data.questions;
        // Render the questions
        renderItems(questions);
    })
    .catch(error => {
        console.error('Error fetching JSON data:', error);
    });