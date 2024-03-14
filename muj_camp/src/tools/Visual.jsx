const adjustWidth = (parentElement, reverse = false) => {
    if (!reverse) {
        let spinnerDimensions = ((parentElement.offsetHeight + 6) + "px");
        parentElement.style.width = spinnerDimensions;
        parentElement.style.height = spinnerDimensions;
    } else {
        parentElement.style.width = "100%";
        parentElement.style.height = "unset";
    }
}


export { adjustWidth };