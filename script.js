// Modal Interaction
const modal = document.getElementById("about-modal");
const aboutUsBtn = document.getElementById("about-us-btn");
const closeBtn = document.querySelector(".close-btn");

// Open Modal
aboutUsBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// Close Modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close Modal on Outside Click
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
