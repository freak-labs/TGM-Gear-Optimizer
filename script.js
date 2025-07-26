import { gearAttributes } from './values.js';
import { jewelAttributes } from './values.js';

const gearGradeLevels = {
  "plain": 0,
  "simple": 1,
  "rare": 5,
  "elite": 9,
  "grand": 13,
  "legacy": 17
};

let enhancements = {
  "Crew-Stats-Enhancements": {
    "Crew-ATK": [0, 0],
    "Crew-DEF": [0, 0],
    "Crew-HP": [0, 0],
    "Max-Crew-Load-Capacity": [0, 0]
  },
  "Stats-Enhancements": {
    "Bruiser-ATK": [0, 0], "Bruiser-HP": [0, 0], "Bruiser-DEF": [0, 0],
    "Hitmen-ATK": [0, 0], "Hitmen-HP": [0, 0], "Hitmen-DEF": [0, 0],
    "Biker-ATK": [0, 0], "Biker-HP": [0, 0], "Biker-DEF": [0, 0],
    "Mortar-Car-ATK": [0, 0],
    "Trap-ATK": [0, 0], "Trap-DEF": [0, 0],
    "Wall-DEF": [0, 0]
  },
  "Movement-Speed-Enhancements": {
    "Movement-Speed": [0, 0]
  },
  "Kingpin-Enhancements": {
    "Energy-Usage-Reduction": [0, 0],
    "Restorable-Energy-Limit": [0, 0],
    "Kingpin-Challenge-DMG": [0, 0],
    "Challenge-Initial-Focus": [0, 0],
    "Double-Crate-Rate": [0, 0],
    "Kingpin-Challenge-Movement-Speed": [0, 0]
  },
  "Economic-Enhancements": {
    "Construction-Speed": [0, 0],
    "Investment-Speed": [0, 0],
    "Robbery-Speed": [0, 0],
    "Diamond-Production": [0, 0],
    "Cash-Production": [0, 0]
  },
  "Battle-Enhancements": {
    "Training-Speed": [0, 0],
    "Pay-Cut": [0, 0]
  }
};


// SWITCH MENU
const switchMenuCategoryButtons = document.querySelectorAll(".switchMenuCategoryBlock");
const switchMenuContainers = document.querySelectorAll(".categoryContainer");

switchMenuCategoryButtons.forEach((btn, index) => {
  btn.addEventListener("click", e => {
    if (!btn.classList.contains("selected")) {
      switchMenuCategoryButtons.forEach(a => {
        a.classList.remove("selected");
      });
      btn.classList.add("selected");
      switchMenuContainers.forEach(container => {
        container.classList.remove("visible");
      });
      switchMenuContainers[index].classList.add("visible");
    }
  });
});



// GRABBING, DROPPING
const elements = document.querySelectorAll(".element");
let selectedElement = null;
let isGrabbing = false;

const gearTypes = ["rifle", "melee", "shoes", "pants", "tops", "accessories"];
const associateTypes = ["bruhit", "brubik", "bikhit", "bru", "hit", "bik"];
elements.forEach(el => {
  el.addEventListener("mousedown", spawn => {
    if (spawn.button !== 0 || !el.classList.contains("element")) return;

    isGrabbing = true;

    selectedElement = el.cloneNode(true);
    selectedElement.classList.add("selectedElement");
    document.body.append(selectedElement);

    selectedElement.style.position = "absolute";
    selectedElement.style.top = `${spawn.clientY - el.offsetHeight / 2}px`;
    selectedElement.style.left = `${spawn.clientX - el.offsetWidth / 2}px`;
    selectedElement.style.pointerEvents = "none";
    selectedElement.style.zIndex = "1000";

    document.body.style.cursor = "grabbing";

    function moveHandler(move) {
      if (!isGrabbing || !selectedElement) return;
      selectedElement.style.top = `${move.clientY - selectedElement.offsetHeight / 2}px`;
      selectedElement.style.left = `${move.clientX - selectedElement.offsetWidth / 2}px`;
    }

    function upHandler(up) {
      if (!isGrabbing) return;

      const hoveredElement = document.elementFromPoint(up.clientX, up.clientY);
      const slot = hoveredElement?.closest(".heroBarElement");

      // If dragging a jewel
      if (selectedElement.classList.contains("jewel")) {
        if (slot) {
          const subSlotsContainer = slot.querySelector(".subSlotsContainer");
          if (!subSlotsContainer) return;

          const draggedJewel = selectedElement;
          const draggedSrc = draggedJewel.querySelector("img")?.src;

          // Prevent duplicate jewel src
          const existingJewels = subSlotsContainer.querySelectorAll("img");
          const isDuplicate = Array.from(existingJewels).some(img => img.src === draggedSrc);

          if (isDuplicate) {
            console.log("Duplicate jewel, skipping.");
            cleanup();
            return;
          }

          // Place in first empty subslot (max 3)
          const subSlots = Array.from(subSlotsContainer.querySelectorAll(".subSlot")).slice(0, 3);
          const availableSlot = subSlots.find(sub => !sub.querySelector("img"));

          if (!availableSlot) {
            console.log("No available subslot.");
            cleanup();
            return;
          }

          // Add jewel id as class to the subSlot
          const jewelId = draggedJewel.id;
          if (jewelId) {
            availableSlot.classList.add(jewelId);
          }

          // Set background to grade
          const gradeClass = [...draggedJewel.classList].find(cls =>
            ["plain", "uncommon", "rare", "epic", "legendary", "mythic", "divine", "legacy"].includes(cls)
          );
          if (gradeClass) {
            availableSlot.style.backgroundImage = `url(grades/${gradeClass}.png)`;
          }

          // Place jewel image
          const jewelImg = draggedJewel.querySelector("img").cloneNode(true);
          jewelImg.style.maxWidth = "90%";
          jewelImg.style.maxHeight = "90%";
          jewelImg.style.pointerEvents = "none";

          availableSlot.appendChild(jewelImg);

          // Add overlay for removal
          const overlay = document.createElement("div");
          overlay.classList.add("subSlotOverlay");

          availableSlot.style.position = "relative";
          availableSlot.appendChild(overlay);

          availableSlot.addEventListener("mouseenter", () => {
            overlay.style.opacity = "1";
          });
          availableSlot.addEventListener("mouseleave", () => {
            overlay.style.opacity = "0";
          });

          overlay.addEventListener("click", () => {
            availableSlot.innerHTML = "";
            availableSlot.style.backgroundImage = 'url("misc/jewelSlot.png")';
            // Remove jewelId class on removal
            if (jewelId) {
              availableSlot.classList.remove(jewelId);
            }
          });
        }

        cleanup();
        return;
      }


      // Handle gear item drop
      if (slot) {
        let draggedGearType = gearTypes.find(type => selectedElement.classList.contains(type));

        if (draggedGearType && slot.classList.contains(draggedGearType)) {
          clearGradeClasses(slot);

          gearTypes.forEach(type => slot.classList.remove(type));
          associateTypes.forEach(type => slot.classList.remove(type));
          slot.classList.add(draggedGearType);

          slot.querySelector(".gradeLabel")?.remove();
          slot.querySelector(".removeButton")?.remove();
          slot.querySelector(".subSlotsContainer")?.remove();

          selectedElement.classList.forEach(cls => {
            if (cls !== "element" && !cls.includes("selectedElement")) {
              slot.classList.add(cls);
            }
          });

          const gradeLabel = selectedElement.querySelector(".gradeLabel");
          if (gradeLabel) {
            addLabel(slot, gradeLabel.textContent);
          }

          const draggedImg = selectedElement.querySelector("img");
          const slotImg = slot.querySelector("img");
          if (draggedImg && slotImg) {
            slotImg.src = draggedImg.src;
            slotImg.alt = draggedImg.alt;
          }

          // Add remove button
          const removeButton = document.createElement("img");
          removeButton.src = "misc/removeIcon.svg";
          removeButton.classList.add("removeButton");

          removeButton.addEventListener("click", () => {
            const gearType = gearTypes.find(type => slot.classList.contains(type));
            if (!gearType) return;

            const newSlot = document.createElement("div");
            newSlot.className = `heroBarElement ${gearType} plain`;

            const defaultImg = document.createElement("img");
            defaultImg.src = `equipmentSets/placeholders/${gearType}PH.png`;
            defaultImg.alt = gearType;
            newSlot.appendChild(defaultImg);

            slot.replaceWith(newSlot);
          });

          slot.appendChild(removeButton);

          // Add subslots
          const subSlotsContainer = document.createElement("div");
          subSlotsContainer.classList.add("subSlotsContainer");

          for (let i = 0; i < 4; i++) {
            const subSlot = document.createElement("div");
            subSlot.classList.add("subSlot");
            subSlot.style.backgroundImage = `url(misc/${i < 3 ? 'jewelSlot' : 'fmCrystalSlot'}.png)`;
            subSlotsContainer.appendChild(subSlot);
          }

          slot.appendChild(subSlotsContainer);
        } else {
          console.log(`Cannot drop ${draggedGearType} into this slot.`);
        }
      }

      cleanup();

      function cleanup() {
        isGrabbing = false;
        selectedElement?.remove();
        selectedElement = null;
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", moveHandler);
        window.removeEventListener("mouseup", upHandler);
      }
    }

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);
  });
});



//CLEAR ALL BUTTON
const gearClearBtn = document.querySelector(".heroClearButton")
gearClearBtn.addEventListener("click", () => {
  const gearSlots = document.querySelectorAll(".heroBarElement");

  gearSlots.forEach(slot => {
    const gearType = gearTypes.find(type => slot.classList.contains(type));
    if (!gearType) return;

    const newSlot = document.createElement("div");
    newSlot.className = `heroBarElement ${gearType} plain`;

    const defaultImg = document.createElement("img");
    defaultImg.src = `equipmentSets/placeholders/${gearType}PH.png`;
    defaultImg.alt = gearType;
    newSlot.appendChild(defaultImg);

    slot.replaceWith(newSlot);
  });
});



// ATTRIBUTE PREVIEW
function getGearName(element) {
  const gearAttributesKeys = Object.keys(gearAttributes);
  for (const key of gearAttributesKeys) {
    if (element.classList.contains(key)) {
      return key;
    }
  }
}

function getGearType(element) {
  const gearTypes = {
    "bruhit": ["Bruiser", "Hitmen"],
    "brubik": ["Bruiser", "Biker"],
    "bikhit": ["Biker", "Hitmen"],
    "bru": ["Bruiser"],
    "hit": ["Hitmen"],
    "bik": ["Biker"]
  };
  for (const key in gearTypes) {
    if (element.classList.contains(key)) {
      return gearTypes[key];
    }
  }
}

function getGearPart(element, gearName) {
  const partKeys = Object.keys(gearAttributes[gearName]);
  for (const key of partKeys) {
    if (element.classList.contains(key)) {
      return key;
    }
  }
}

function getLevelIndex(element) {
  for (const key in gearGradeLevels) {
    if (element.classList.contains(key)) {
      return gearGradeLevels[key];
    }
  }
  const lastClass = element.classList[element.classList.length - 1];
  const base = lastClass.slice(0, -1);
  const plus = parseInt(lastClass.slice(-1));
  return gearGradeLevels[base] + plus;
}

const attributePreview = document.querySelector('.attributePreview');

elements.forEach(el => {
  if (el.classList.contains("jewel") || el.classList.contains("fmCrystal")) return;

  el.addEventListener("mouseover", e => {
    if (gradeMenu.style.display === "block" || isGrabbing) return;

    const gearName = getGearName(el);
    const gearType = getGearType(el);
    const gearPart = getGearPart(el, gearName);
    const gearLevelIndex = getLevelIndex(el);

    attributePreview.innerHTML = '';

    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    for (const attr in gearAttributes[gearName][gearPart]) {
      const value = gearAttributes[gearName][gearPart][attr][gearLevelIndex];
      const formattedName = attr.replace(/-/g, ' ');

      if (attr === "main-ATK") {
        for (let i = 0; i < gearType.length; i++) {
          const p = document.createElement("p");

          const nameSpan = document.createElement("span");
          nameSpan.className = "attributeName";
          nameSpan.textContent = gearType[i];

          const valueSpan = document.createElement("span");
          valueSpan.className = "attributeValue";
          valueSpan.textContent = `${value}%`;

          p.appendChild(nameSpan);
          p.appendChild(valueSpan);
          attributePreview.appendChild(p);
        }
      } else {
        const p = document.createElement("p");

        const nameSpan = document.createElement("span");
        nameSpan.className = "attributeName";
        nameSpan.textContent = formattedName;

        const valueSpan = document.createElement("span");
        valueSpan.className = "attributeValue";
        valueSpan.textContent = `${value}%`;

        p.appendChild(nameSpan);
        p.appendChild(valueSpan);
        attributePreview.appendChild(p);
      }
    }

    attributePreview.style.display = 'block';
    attributePreview.style.position = 'absolute';
    attributePreview.style.top = `${rect.top + scrollY}px`;
    attributePreview.style.left = `${rect.right + scrollX + 10}px`;
  });

  el.addEventListener("mouseout", () => {
    attributePreview.style.display = 'none';
    attributePreview.innerHTML = '';
  });
});



// GRADE CHANGING
const gradeMenu = document.querySelector(".gradeMenu");
const gradeMenuInside = document.querySelector(".gradeMenuInside");

let currentElement = null;

function clearGradeClasses(el) {
  const gradeClassList = [
    "legacy", "plain",
    "grand1", "grand2", "grand3",
    "elite1", "elite2", "elite3",
    "rare1", "rare2", "rare3",
    "simple1", "simple2", "simple3",
    "grand", "elite", "rare", "simple"
  ];
  gradeClassList.forEach(cls => el.classList.remove(cls));
}

function addLabel(el, text) {
  const old = el.querySelector(".gradeLabel");
  if (old) old.remove();

  const label = document.createElement("p");
  label.className = "gradeLabel";
  label.textContent = text;
  el.style.position = "relative";
  el.appendChild(label);
}

elements.forEach(el => {
  el.addEventListener("contextmenu", e => {
    e.preventDefault();
    currentElement = el;

    attributePreview.style.display = 'none';
    attributePreview.innerHTML = '';

    gradeMenu.style.display = "block";
    gradeMenu.style.top = `${e.clientY}px`;
    gradeMenu.style.left = `${e.clientX + 15}px`;
    gradeMenuInside.style.display = "none";
    gradeMenuInside.innerHTML = "";
  });
});

gradeMenu.addEventListener("click", e => {
  const option = e.target.closest(".gradeMenuOption");
  if (!option || !currentElement) return;

  const grade = option.textContent.trim().toLowerCase();

  clearGradeClasses(currentElement);
  currentElement.classList.add(grade);

  const oldLabel = currentElement.querySelector(".gradeLabel");
  if (oldLabel) oldLabel.remove();

  gradeMenu.style.display = "none";
  gradeMenuInside.style.display = "none";
  currentElement = null;
});

gradeMenu.addEventListener("mouseover", e => {
  const option = e.target.closest(".gradeMenuOption");
  if (!option || !currentElement) return;

  if (currentElement.classList.contains("jewel")) {
    gradeMenuInside.style.display = "none";
    gradeMenuInside.innerHTML = "";
    return;
  }

  const baseGrade = option.textContent.trim().toLowerCase();

  if (baseGrade === "legacy" || baseGrade === "plain") {
    gradeMenuInside.style.display = "none";
    gradeMenuInside.innerHTML = "";
    return;
  }

  const inheritedColor = window.getComputedStyle(option).color;
  gradeMenuInside.innerHTML = "";

  for (let i = 1; i <= 3; i++) {
    const capitalizedBaseGrade = baseGrade.charAt(0).toUpperCase() + baseGrade.slice(1);
    const level = `${capitalizedBaseGrade}+${i}`;
    const sub = document.createElement("div");
    sub.textContent = level;
    sub.className = "gradeMenuParagraph";
    sub.style.color = inheritedColor;
    sub.style.margin = 0;

    sub.addEventListener("click", e => {
      e.stopPropagation();
      if (!currentElement) return;

      clearGradeClasses(currentElement);
      currentElement.classList.add(`${baseGrade}${i}`);
      addLabel(currentElement, `+${i}`);

      gradeMenu.style.display = "none";
      gradeMenuInside.style.display = "none";
      currentElement = null;
    });

    gradeMenuInside.appendChild(sub);
  }

  gradeMenuInside.style.display = "block";
  gradeMenuInside.style.top = `${option.offsetTop}px`;
  gradeMenuInside.style.left = `${gradeMenu.offsetWidth}px`;
});

document.addEventListener("mousedown", e => {
  if (!gradeMenu.contains(e.target) && !gradeMenuInside.contains(e.target)) {
    gradeMenu.style.display = "none";
    gradeMenuInside.style.display = "none";
    currentElement = null;
  }
});

window.addEventListener("scroll", () => {
  gradeMenu.style.display = "none";
  gradeMenuInside.style.display = "none";
  currentElement = null;
}, true);



//RESULT SYSTEM
function observeAllGearChanges(callback) {
  const gearBars = document.querySelectorAll(".heroGearBar");

  if (!gearBars.length) {
    console.warn("No .heroGearBar elements found.");
    return;
  }

  const config = {
    childList: true,
    subtree: true,
    characterData: true,
  };

  gearBars.forEach((gearBar, index) => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'childList' ||
          mutation.type === 'characterData'
        ) {
          callback();
          break;
        }
      }
    });

    observer.observe(gearBar, config);
  });
}

function onGearChanged() {
  const gearBarElements = document.querySelectorAll(".heroBarElement");
  const totalBonuses = {};
  const multiplier = document.querySelector(".ibaiCheckbox")?.checked ? 1.1 : 1;

  // Deep clone enhancements so we can update it
  const updatedEnhancements = structuredClone(enhancements);

  const applyValue = (attr, value) => {
    if (!totalBonuses[attr]) totalBonuses[attr] = 0;
    totalBonuses[attr] += value;

    // Also update enhancements if path exists
    for (const section in updatedEnhancements) {
      if (updatedEnhancements[section][attr] !== undefined) {
        const existing = updatedEnhancements[section][attr];
        if (Array.isArray(existing)) {
          existing[1] += value; // jewels go in second slot
        } else {
          updatedEnhancements[section][attr] += value;
        }
      }
    }
  };

  gearBarElements.forEach(el => {
    const gearName = getGearName(el);
    if (!gearName) return;

    const gearPart = getGearPart(el, gearName);
    const levelIndex = getLevelIndex(el);
    const typeArray = getGearType(el);

    const partData = gearAttributes[gearName]?.[gearPart];
    if (!partData) return;

    // Base gear stats
    for (const attr in partData) {
      const raw = partData[attr][levelIndex];
      const value = Array.isArray(raw) ? raw[0] * multiplier + raw[1] : raw * multiplier;
      if (value > 0) {
        if (attr === "main-ATK") {
          typeArray.forEach(type => applyValue(`${type}-ATK`, value));
        } else {
          applyValue(attr, value);
        }
      }
    }

    // Jewel stats - read jewelType from second class of .subSlot, and grade from background image
    const grades = ["plain", "simple", "rare", "elite", "grand", "legacy"];

    const subSlots = el.querySelectorAll(".subSlot");
    subSlots.forEach(slot => {
      if (!slot.querySelector("img")) return;

      const classes = [...slot.classList];
      if (classes.length < 2) return; // Need at least 2 classes

      const jewelType = classes[1]; // second class of .subSlot

      if (!jewelAttributes.hasOwnProperty(jewelType)) return;

      // Determine grade by checking backgroundImage URL of slot.style.backgroundImage
      // Example backgroundImage might be: url("grades/plain.png")
      // We extract "plain" from it.

      let grade = "plain"; // default fallback

      const bg = slot.style.backgroundImage || "";
      const match = bg.match(/\/([a-z]+)\.png/i);
      if (match && grades.includes(match[1])) {
        grade = match[1];
      }

      const gradeIndex = grades.indexOf(grade);
      if (gradeIndex < 0) return;

      const jewelData = jewelAttributes[jewelType];

      for (const stat in jewelData) {
        const value = jewelData[stat][gradeIndex];
        applyValue(stat, value);
      }
    });

  });

  // Render Results
  const resultsContainer = document.querySelector(".results");
  const infoText = resultsContainer.querySelector(".noEnhancementsInfo");
  resultsContainer.querySelectorAll(".categoryContainer").forEach(e => e.remove());

  const hasBonuses = Object.values(totalBonuses).some(v => v > 0);
  infoText.style.display = hasBonuses ? "none" : "block";
  if (!hasBonuses) return;

  for (const [category, stats] of Object.entries(updatedEnhancements)) {
    const visibleStats = Object.entries(stats).filter(([_, val]) =>
      Array.isArray(val) ? val[0] > 0 || val[1] > 0 : val > 0
    );

    if (visibleStats.length === 0) continue;

    const catContainer = document.createElement("div");
    catContainer.className = "categoryContainer visible";

    const title = document.createElement("p");
    title.className = "resultsTitle";
    title.textContent = category.replace(/-/g, " ");
    catContainer.appendChild(title);

    const resultsDiv = document.createElement("div");
    resultsDiv.className = "categoryResults";

    for (const [attr, val] of visibleStats) {
      const row = document.createElement("div");
      row.className = "attributeRow";

      const nameSpan = document.createElement("span");
      nameSpan.className = "attributeName";
      nameSpan.textContent = attr.replace(/-/g, " ");

      const valueSpan = document.createElement("span");
      valueSpan.className = "attributeValue";
      const total = Array.isArray(val) ? val[0] + val[1] : val;
      valueSpan.textContent = `${Number(total.toFixed(2))}%`;

      row.appendChild(nameSpan);
      row.appendChild(valueSpan);
      resultsDiv.appendChild(row);
    }

    catContainer.appendChild(resultsDiv);
    resultsContainer.appendChild(catContainer);
  }
}








// Attach listeners
document.addEventListener("DOMContentLoaded", () => {
  observeAllGearChanges(onGearChanged);
  const checkbox = document.querySelector(".ibaiCheckbox");
  if (checkbox) {
    checkbox.addEventListener("change", onGearChanged);
  }
});