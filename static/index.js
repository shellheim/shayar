// DOM Elements
const container = document.querySelector(".container");
const couplet = document.querySelector(".sher");
const byline = document.querySelector(".shayar");
const coupletBox = document.getElementById("sher-box");
const writerBox = document.getElementById("shayar-box");

const printButton = document.getElementById("print");
const downloadButton = document.getElementById("download");
const fontSizeRange = document.getElementById("font-size-range");
const fontSizeValue = document.getElementById("font-size-value");

// Initialize font size on the range input
let fontSize = Number.parseInt(window.getComputedStyle(container).fontSize);
fontSizeRange.value = fontSize;
fontSizeValue.textContent = `${fontSize}px`;

// Add custom padding on range input for Chromium browsers
if (navigator.userAgent.includes("Chrome")) {
  fontSizeRange.classList.add("chromium-range-padding");
}

// Return a random couplet
const getRandomCouplet = async (data) => {
  const authors = Object.keys(data);
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
  const couplets = data[randomAuthor];
  const randomCouplet = couplets[Math.floor(Math.random() * couplets.length)];
  return { author: randomAuthor, couplet: randomCouplet };
};

// Fetch data and set random couplet
const fetchDataAndSetCouplet = async () => {
  try {
    const response = await fetch("/shayar/static/sherCollection.json");
    if (!response.ok)
      throw new Error(
        `Failed to fetch couplets, got error: ${response.status}`,
      );

    const jsonData = await response.json();
    const randomCouplet = await getRandomCouplet(jsonData);
    coupletBox.value = randomCouplet.couplet;
    writerBox.value = randomCouplet.author;
    printButton.click();
  } catch (error) {
    console.error(`Error in loading couplet collection: ${error}`);
  }
};

// Generate single line elements for couplets
// the createLinePair() function calls this function to create a sort of container
// for two lines, or for one line each in case there are only two lines in total
const createLine = (content, index, container, putNewLine) => {
  const newLine = document.createElement("span");
  newLine.innerText = `${putNewLine ? "\n" : ""}${content}`; // put '\n' on multi-line couplets
  newLine.className = `line-${index}`;
  container.appendChild(newLine);
};

// Helper to create a pair of lines for two line couplets
const createLinePair = (lineContent, index) => {
  const linePair = document.createElement("div");
  linePair.className = "line";
  createLine(lineContent, index, linePair);
  return linePair;
};

const makeLineChain = (lines) => {
  // Clear previous content
  couplet.innerHTML = "";

  // For a standard couplet with two lines
  // Calling the createLinePair() function two times to make a line container for each line, this
  // because we want them to be separated more through css
  if (lines.length === 2) {
    const lineOne = createLinePair(lines[0], 1);
    const lineTwo = createLinePair(lines[1], 2);
    couplet.append(lineOne, lineTwo);
    return;
  }
  // For more than two lines
  for (let i = 1; i <= lines.length; i++) {
    let linePair;
    if (i % 2 === 0) {
      // if you are an even line, you are the last line of a pairr. So, find the last pair
      // and attach yourself as the last line.
      const linePairArray = document.getElementsByClassName("line");
      linePair = linePairArray[linePairArray.length - 1];
    } else {
      // if you are an odd line, you are the start of a pair. So, create a conatainer
      // and attach yourself as the first line
      linePair = document.createElement("div");
      linePair.className = "line";
    }
    createLine(lines[i - 1], i, linePair, true);
    couplet.appendChild(linePair);
  }
};

// Event listener for printing the couplet
printButton.addEventListener("click", () => {
  const lines = coupletBox.value.trim().split("\n").filter(Boolean);
  if (lines.length > 0) {
    makeLineChain(lines);
    byline.innerText = writerBox.value.trim()
      ? `— ${writerBox.value.trim()}`
      : "";
  }
});

// Event listener for changing font size
fontSizeRange.addEventListener("input", () => {
  fontSize = fontSizeRange.value;
  container.style.fontSize = `${fontSize}px`;
  fontSizeValue.textContent = `${fontSize}px`;
});

// Event listener for downloading the image of the couplet
downloadButton.addEventListener("click", () => {
  if (container.innerText.trim()) {
    htmlToImage
      .toPng(container)
      .then((dataUrl) => {
        const link = document.createElement("a");
        // if writer name exists put that in the file name, along with first line of the couplet
        link.download = `${
          byline.innerText.replace("—", "").trim()
            ? `${byline.innerText.replace("—", "").trim()} — `
            : ""
        }${document.querySelector(".line-1").innerText}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Error converting HTML to image:", error);
      });
  }
});

// Fetch random couplet when the page loads
fetchDataAndSetCouplet();
