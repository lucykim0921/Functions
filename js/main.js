// Function to render your items
const renderItems = (data) => {
    // The `ul` where the items will be inserted
    const dataList = document.getElementById('data-list');

    // Loop through each item in the data array
    data.forEach((item) => {

        // Make a template literal as we have before, inserting your data
        let listItem = `
            <li>
            <div class="quiz">

                <div class="question">${item.question}</div>
        
                <div class="answers">
                    <button class="option">${item.option1}</button>
                    <button class="option">${item.option2}</button>
                    <button class="option">${item.option3}</button>
                    <button class="option">${item.option4}</button>
                </div>

                    <button class="next-button">next</button>
                    <button class="cross-button"><a href="index.html">&#9747</a><button>

                
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
        // And passes the data to the function, above!
        renderItems(data);
    })
    .catch(error => {
        console.error('Error fetching JSON data:', error);
    });