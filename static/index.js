// Contains the whole couplet
const container = document.getElementsByClassName("container")[0];
// line container
const couplet = document.getElementsByClassName("sher")[0];
const byline = document.getElementsByClassName("shayar")[0];

const coupletBox = document.getElementById("sher-box");
const writerBox = document.getElementById("shayar-box");

// controls

const printButton = document.getElementById("print");
const downloadButton = document.getElementById("download");

const fontSizeRange = document.getElementById("font-size-range");
const fontSizeValue = document.getElementById("font-size-value");

let fontSize = Number.parseInt(window.getComputedStyle(container).fontSize);
fontSizeRange.value = fontSize;
fontSizeValue.textContent = `${fontSize}px`;

// Add custom padding for range on chromium
if (navigator.userAgent.indexOf("Chrome") !== -1) {
  fontSizeRange.classList.add("chromium-range-padding");
}

const getRandomCouplet = async (data) => {
  const authors = Object.keys(data);
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];

  const couplets = data[randomAuthor];
  const randomCouplet = couplets[Math.floor(Math.random() * couplets.length)];

  return { author: randomAuthor, couplet: randomCouplet };
};

const fetchDataAndGetRandomCouplet = async () => {
  try {
    const response = await fetch("/static/sherCollection.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const jsonData = await response.json();
    const randomCouplet = await getRandomCouplet(jsonData);
    coupletBox.value = randomCouplet.couplet;
    writerBox.value = randomCouplet.author;
    printButton.click();
  } catch (error) {
    console.error(
      "Couldn't load collection, falling back to static couplet",
      error,
    );
  }
};

fetchDataAndGetRandomCouplet();

const createLine = (content, index, container) => {
  const newLine = document.createElement("span");
  newLine.innerText = `\n${content}`;
  newLine.className = `line-${index}`;
  container.appendChild(newLine);
};

const makeLineChain = (lines) => {
  // clear previous print
  couplet.innerHTML = "";

  // if it's a standard sher with only 2 lines
  if (lines.length === 2) {
    const linePairOne = document.createElement("div");
    const linePairTwo = document.createElement("div");

    linePairOne.className = "line";
    linePairTwo.className = "line";

    const firstLine = document.createElement("span");
    const secondLine = document.createElement("span");

    firstLine.className = "line-1";
    secondLine.className = "line-2";

    firstLine.innerText = lines[0];
    secondLine.innerText = lines[1];

    couplet.appendChild(linePairOne);
    couplet.appendChild(linePairTwo);

    linePairOne.appendChild(firstLine);
    linePairTwo.appendChild(secondLine);

    return;
  }

  // make as many lines as necessary
  for (let i = 1; i <= lines.length; i++) {
    let linePair;

    if (i % 2 === 0) {
      const linePairArray = document.getElementsByClassName("line");
      linePair = linePairArray[linePairArray.length - 1];
      couplet.appendChild(linePair);
    } else {
      linePair = document.createElement("div");
      linePair.className = "line";
      couplet.appendChild(linePair);
    }
    createLine(lines[i - 1], i, linePair);
  }
};

printButton.addEventListener("click", () => {
  // Don't print an empty box
  if (coupletBox.value.trim() !== "") {
    const lines = coupletBox.value.split("\n").filter((n) => n !== "");
    makeLineChain(lines);

    byline.innerText = `${
      writerBox.value.trim() ? "—" : ""
    } ${writerBox.value.trim()}`;
  }
});

// tweak font-size on range input
fontSizeRange.addEventListener("input", () => {
  fontSize = fontSizeRange.value;
  container.style.fontSize = `${fontSize}px`;
  fontSizeValue.textContent = `${fontSize}px`;
  console.log("fontSize: ", fontSize);
  console.log("fontSizeRange: ", fontSizeRange.value);
});

downloadButton.addEventListener("click", () => {
  // don't download empty boxes
  if (container.innerText.trim() !== "") {
    const node = document.getElementsByClassName("container")[0];

    htmlToImage
      .toPng(node)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `sher-${Math.floor(Math.random() * 100)}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Error converting HTML to image", error);
      });
  }
});
