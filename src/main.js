import "./style.css";
import { getItemDoc, items } from "./items.js";
import "@citolab/qti-components";

document.querySelector("#app").innerHTML = `
<div x-data="itemViewer()" class="d-flex">
<div id="thumbnail-items" x-data="itemViewer()" class="d-flex flex-column">
<!-- Loop through the items -->
<template x-for="(item, index) in items" :key="index">
  <div 
    @click="selectItem(index)" 
    class="p-2 border border-2 rounded cursor-pointer mb-2"
    :class="{ 'border-primary text-white': selectedItemIndex === index }"
    style="transition: border-color 0.2s ease-in-out; width: 200px; height: 200px"
    @mouseover="$el.classList.add('border-primary')"
    @mouseout="$el.classList.remove('border-primary')">
    
    <!-- Show qti-item if canPreview is true -->
    <template x-if="item.canPreview">
      <qti-item x-init="initializeComponent($el, index)">
        <item-container>
          <template>
            <style>
              qti-assessment-item {
                padding: 1rem;
                display: block;
                aspect-ratio: 4 / 3;
                width: 800px;
                overflow: hidden;
                transform: scale(0.25);
                transform-origin: top left;
              }
            </style>
          </template>
        </item-container>
      </qti-item>
    </template>

    <!-- Show item name if canPreview is false -->
    <template x-if="!item.canPreview">
      <span x-text="item.name" class="d-block text-center"></span>
    </template>

  </div>
</template>
</div>
  <div id="full-item" class="w-100 p-3">
    <qti-item>
      <item-container>
        <template>
          <style>
            qti-assessment-item {
              aspect-ratio: 16 / 9;
            }
          </style>
        </template>
      </item-container>
    </qti-item>
  </div>
</div>
`;

// Alpine.js component
window.itemViewer = () => ({
  items: items, // Array of items
  selectedItemIndex: 0, // Default selected item index
  async selectItem(index) {
    this.selectedItemIndex = index;

    // Populate the full item display
    const selectedItemDoc = await getItemDoc(this.items[index].name);
    const fullItemContainer = document.querySelector(
      "#full-item qti-item item-container"
    );
    if (fullItemContainer) {
      fullItemContainer.itemDoc = selectedItemDoc;
    }
  },
  async init() {
    // Default to the first item in the full view
    const firstItemDoc = await getItemDoc(this.items[0].name);
    const fullItemContainer = document.querySelector(
      "#full-item qti-item item-container"
    );
    if (fullItemContainer) {
      fullItemContainer.itemDoc = firstItemDoc;
    }
  },
  async initializeComponent(el) {
    // Extract the index from the data attribute
    const index = Array.from(
      el.closest(".d-flex").querySelectorAll("qti-item")
    ).indexOf(el);

    // Ensure the custom element is upgraded
    if (!el.shadowRoot) {
      customElements.upgrade(el); // Manually upgrade the custom element
    }

    // Fetch and set the itemDoc for the specific web component
    const itemDoc = await getItemDoc(this.items[index].name);
    const container = el.querySelector("item-container");
    if (container) {
      container.itemDoc = itemDoc;
    }
  },
});
