const layerControls = [...document.querySelectorAll("[data-layer-control]")];
const topicControls = [...document.querySelectorAll("[data-topic-control]")];
const architectureStages = [...document.querySelectorAll("[data-layer-stage]")];
const labCards = [...document.querySelectorAll(".lab-card")];
const publicationItems = [...document.querySelectorAll(".publication-item")];
const layerChips = [...document.querySelectorAll("[data-layer-chip]")];
const resetButtons = [...document.querySelectorAll("[data-filter-reset]")];
const filterStatus = document.querySelector("#lab-filter-status");
const publicationFilterStatus = document.querySelector("#publication-filter-status");

const layerLabels = {
  hardware: "Hardware",
  systems: "Systems and Networks",
  intelligence: "Intelligence",
  humans: "Humans",
  applications: "Applications",
};

const topicLabels = Object.fromEntries(
  topicControls.map((control) => [control.dataset.topicControl, control.textContent.trim()]),
);

let activeFilter = null;

function itemMatches(item, type, key) {
  const values = item.dataset[type === "layer" ? "layers" : "topics"].split(" ");
  return values.includes(key);
}

function setFilter(type, key) {
  const isSameFilter = activeFilter?.type === type && activeFilter?.key === key;
  activeFilter = !type || isSameFilter ? null : { type, key };

  const activeLayer = activeFilter
    ? activeFilter.type === "layer"
      ? activeFilter.key
      : topicControls.find((control) => control.dataset.topicControl === activeFilter.key)?.dataset.topicLayer
    : null;

  layerControls.forEach((control) => {
    const isActive = activeFilter?.type === "layer" && control.dataset.layerControl === activeFilter.key;
    control.setAttribute("aria-pressed", String(isActive));
  });

  topicControls.forEach((control) => {
    const isActive = activeFilter?.type === "topic" && control.dataset.topicControl === activeFilter.key;
    control.setAttribute("aria-pressed", String(isActive));
  });

  architectureStages.forEach((stage) => {
    const isActive = Boolean(activeLayer && stage.dataset.layerStage === activeLayer);
    stage.classList.toggle("is-active", isActive);
    stage.classList.toggle("is-muted", Boolean(activeFilter && !isActive));
  });

  let matchingLabCount = 0;
  labCards.forEach((card) => {
    const isMatch = Boolean(activeFilter && itemMatches(card, activeFilter.type, activeFilter.key));
    if (isMatch) matchingLabCount += 1;
    card.classList.toggle("is-match", isMatch);
    card.classList.toggle("is-muted", Boolean(activeFilter && !isMatch));
  });

  let matchingPublicationCount = 0;
  publicationItems.forEach((publication) => {
    const isMatch = Boolean(activeFilter && itemMatches(publication, activeFilter.type, activeFilter.key));
    if (isMatch) matchingPublicationCount += 1;
    publication.classList.toggle("is-match", isMatch);
    publication.hidden = Boolean(activeFilter && !isMatch);
  });

  layerChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.layerChip === activeLayer);
  });

  resetButtons.forEach((button) => {
    button.hidden = !activeFilter;
  });

  if (!activeFilter) {
    filterStatus.textContent = "Showing all member labs and publications.";
    publicationFilterStatus.textContent = `Showing all ${publicationItems.length} publications.`;
    return;
  }

  const label = activeFilter.type === "layer" ? layerLabels[activeFilter.key] : topicLabels[activeFilter.key];
  filterStatus.textContent = `${label}. ${matchingLabCount} member labs match this selection.`;
  publicationFilterStatus.textContent = `${matchingPublicationCount} publications related to ${label}.`;
}

layerControls.forEach((control) => {
  control.addEventListener("click", () => setFilter("layer", control.dataset.layerControl));
});

topicControls.forEach((control) => {
  control.addEventListener("click", () => setFilter("topic", control.dataset.topicControl));
});

resetButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(null, null));
});

setFilter(null, null);
