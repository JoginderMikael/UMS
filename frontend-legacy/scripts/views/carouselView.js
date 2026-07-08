/**
 * @fileoverview View module for managing the homepage image carousel.
 * Provides functions for querying carousel elements and updating their visual state.
 * @module scripts/views/carouselView
 */
/**
 * Scans the DOM for all elements designated as carousel images.
 * @returns {Array<HTMLElement>} An array of image elements found in the document.
 */
export function readCarouselImages() {
  return Array.from(document.querySelectorAll(".carousel-image"));
}

/**
 * Updates the visual state of the carousel by toggling the 'active' class.
 * Ensures only the currently relevant image is visible to the user.
 * @param {Array<HTMLElement>} images - The list of carousel image elements.
 * @param {number} previousIndex - The index of the image currently marked as active.
 * @param {number} nextIndex - The index of the image to be shown next.
 * @returns {void} No return value.
 */
export function renderActiveCarouselImage(images, previousIndex, nextIndex) {
  if (!images.length) {
    return;
  }

  images[previousIndex].classList.remove("active");
  images[nextIndex].classList.add("active");
}
