document.addEventListener("DOMContentLoaded", async function() {
    const flagsData = await loadFlagsData();
    initializeGame(flagsData);
  });
  
  async function loadFlagsData() {
    try {
      const response = await fetch('js/flagsData.json'); // Adjust the path if necessary
      const data = await response.json();
      return data; // Returns the full data from JSON
    } catch (error) {
      console.error('Error loading flags data:', error);
      return []; // Return an empty array in case of an error
    }
  }
  
  function initializeGame(data) {
    let draggableObjects;
    let dropPoints;
    const startButton = document.getElementById("start");
    const result = document.getElementById("result");
    const controls = document.querySelector(".controls-container");
    const dragContainer = document.querySelector(".draggable-objects");
    const dropContainer = document.querySelector(".drop-points");
    let deviceType = "";
    let initialX = 0,
      initialY = 0;
    let currentElement = "";
    let moveElement = false;
    let count = 0;
  
    const isTouchDevice = () => {
      try {
        document.createEvent("TouchEvent");
        deviceType = "touch";
        return true;
      } catch (e) {
        deviceType = "mouse";
        return false;
      }
    };
  
    const randomValueGenerator = (data) => {
      return data[Math.floor(Math.random() * data.length)].name;
    };
  
    const stopGame = () => {
      controls.classList.remove("hide");
      startButton.classList.remove("hide");
    };
  
    function dragStart(e) {
      if (isTouchDevice()) {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
        moveElement = true;
        currentElement = e.target;
      } else {
        e.dataTransfer.setData("text", e.target.id);
      }
    }
  
    function dragOver(e) {
      e.preventDefault();
    }
  
    const touchMove = (e) => {
      if (moveElement) {
        e.preventDefault();
        let newX = e.touches[0].clientX;
        let newY = e.touches[0].clientY;
        let currentSelectedElement = document.getElementById(e.target.id);
        currentSelectedElement.parentElement.style.top =
          currentSelectedElement.parentElement.offsetTop - (initialY - newY) + "px";
        currentSelectedElement.parentElement.style.left =
          currentSelectedElement.parentElement.offsetLeft - (initialX - newX) + "px";
        initialX = newX;
        initialY - newY;
      }
    };
  
    const drop = (e) => {
      e.preventDefault();
      if (isTouchDevice()) {
        moveElement = false;
        const currentDrop = document.querySelector(`div[data-id='${e.target.id}']`);
        const currentDropBound = currentDrop.getBoundingClientRect();
        if (
          initialX >= currentDropBound.left &&
          initialX <= currentDropBound.right &&
          initialY >= currentDropBound.top &&
          initialY <= currentDropBound.bottom
        ) {
          currentDrop.classList.add("dropped");
          currentElement.classList.add("hide");
          currentDrop.innerHTML = ``;
          currentDrop.insertAdjacentHTML(
            "afterbegin",
            `<img src="${currentElement.getAttribute("data-imagePath")}">`
          );
          count += 1;
        }
      } else {
        const draggedElementData = e.dataTransfer.getData("text");
        const droppableElementData = e.target.getAttribute("data-id");
        if (draggedElementData === droppableElementData) {
          const draggedElement = document.getElementById(draggedElementData);
          e.target.classList.add("dropped");
          draggedElement.classList.add("hide");
          draggedElement.setAttribute("draggable", "false");
          e.target.innerHTML = ``;
          e.target.insertAdjacentHTML(
            "afterbegin",
            `<img src="${draggedElement.getAttribute("data-imagePath")}">`
          );
          count += 1;
        }
      }
      if (count == 3) {
        result.innerText = `You Won!`;
        stopGame();
      }
    };
  
    const creator = () => {
      dragContainer.innerHTML = "";
      dropContainer.innerHTML = "";
      let randomData = [];
      for (let i = 1; i <= 3; i++) {
        let randomValue = randomValueGenerator(data);
        if (!randomData.includes(randomValue)) {
          randomData.push(randomValue);
        } else {
          i -= 1;
        }
      }
      randomData.forEach(countryName => {
        const countryData = data.find(country => country.name === countryName);
        const flagDiv = document.createElement("div");
        flagDiv.classList.add("draggable-image");
        flagDiv.setAttribute("draggable", true);
        flagDiv.setAttribute("data-imagePath", countryData.imagePath);
        flagDiv.setAttribute("id", countryData.name);
        if (isTouchDevice()) {
          flagDiv.style.position = "absolute";
        }
        flagDiv.innerHTML = `<img src="${countryData.imagePath}" id="${countryData.name}">`;
        dragContainer.appendChild(flagDiv);
  
        const countryDiv = document.createElement("div");
        countryDiv.innerHTML = `<div class='countries' data-id='${countryData.name}'>
        ${countryData.name.charAt(0).toUpperCase() + countryData.name.slice(1).replace("-", " ")}
        </div>`;
        dropContainer.appendChild(countryDiv);
      });
    };
  
    startButton.addEventListener("click", async () => {
      currentElement = "";
      controls.classList.add("hide");
      startButton.classList.add("hide");
      await creator();
      count = 0;
      dropPoints = document.querySelectorAll(".countries");
      draggableObjects = document.querySelectorAll(".draggable-image");
      draggableObjects.forEach((element) => {
        element.addEventListener("dragstart", dragStart);
        element.addEventListener("touchstart", dragStart);
        element.addEventListener("touchend", drop);
        element.addEventListener("touchmove", touchMove);
      });
      dropPoints.forEach((element) => {
        element.addEventListener("dragover", dragOver);
        element.addEventListener("drop", drop);
      });
    });
  }