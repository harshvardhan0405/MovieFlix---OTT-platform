const cards = document.querySelectorAll(".card img");
const modal = document.getElementById("movieModal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");

cards.forEach(card => {
  card.addEventListener("click", () => {
    modal.classList.add("show");
    modalImg.src = card.src;
    modalTitle.innerText = "Movie Preview";
  });
});

document.getElementById("closeModal").onclick = () => {
  modal.classList.remove("show");
};