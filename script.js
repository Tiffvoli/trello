"use strict";

window.addEventListener("load", init);

const endpoint = "https://frontendspring20-67be.restdb.io/rest/trello";
const apiKey = "5e95767d436377171a0c2333";

let currentCard;

function init() {
  activateNewCardBtns();
  activateModalBtns();
  getData();
}

function getData() {
  const data = fetch(endpoint, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((e) => e.json())
    .then(handleCards);
}

function handleCards(cards) {
  cards.forEach(placeCard);
}

function placeCard(card) {
  console.log(card);
  const cardTemplate = document.querySelector("template").content;
  const cardClone = cardTemplate.cloneNode(true);
  const cardList = "#" + card.active_list + " .content";

  cardClone.querySelector(".card-content").textContent = card.card_content;
  cardClone.querySelector(".card").dataset.currentList = card.active_list;
  cardClone.querySelector(".card").setAttribute("id", card._id);

  cardClone.querySelector(".options").addEventListener("click", openModal);

  document.querySelector(cardList).appendChild(cardClone);
}

function activateNewCardBtns() {
  const NCBtns = document.querySelectorAll(".add-new-btn");
  NCBtns.forEach((btn) => {
    btn.addEventListener("click", () => activateBtn(btn));
  });
  function activateBtn(btn) {
    btn.classList.add("hide");
    btn.nextElementSibling.classList.remove("hide");
    if (btn.dataset.activatedBefore === "true") {
      console.log("second click");
      return;
    }
    btn.dataset.activatedBefore = "true";
    setTimeout(activateCardBtns, 100);
    function activateCardBtns() {
      const container = btn.nextElementSibling;
      container.querySelector(".add").addEventListener("click", postToDatabase);
      container.querySelector(".cancel").addEventListener("click", cancelNC);
      function postToDatabase() {
        console.log(container.querySelector("[role='textbox']").textContent);
        console.log(container.parentNode.parentNode.id);
        const data = {
          card_content: container.querySelector("[role='textbox']").textContent,
          active_list: container.parentNode.parentNode.id,
        };
        post(data);
        btn.classList.remove("hide");
        btn.nextElementSibling.classList.add("hide");
        return;
      }
    }
    function cancelNC() {
      btn.classList.remove("hide");
      btn.nextElementSibling.classList.add("hide");
    }
  }
}

function openModal() {
  currentCard = event.target.parentNode;
  console.log(currentCard);
  document.querySelector("#modal-bg").classList.remove("hide");
  document.querySelector("#modal-container").classList.remove("hide");

  document
    .querySelectorAll(".buttons button")
    .forEach((btn) => btn.classList.remove("hide"));
  document
    .querySelector(
      `[data-section="${event.target.parentNode.parentNode.parentNode.getAttribute(
        "id"
      )}"]`
    )
    .classList.add("hide");
  const eventCard = event.target.parentNode;
  const modal = document.querySelector("#modal");
  modal.querySelector(
    "span"
  ).textContent = event.target.parentNode.querySelector(
    ".card-content"
  ).textContent;
}

function activateModalBtns() {
  const edit = document.querySelector("#modal .edit");
  const close = document.querySelector("#modal .close");
  const deleteBtn = document.querySelector("#modal .delete");
  const moveToDo = document.querySelector("#modal .move-to-do");
  const moveToProgress = document.querySelector("#modal .move-to-progress");
  const moveToDone = document.querySelector("#modal .move-to-done");

  moveToDo.addEventListener("click", () => moveCard("to-do"));
  moveToProgress.addEventListener("click", () => moveCard("in-progress"));
  moveToDone.addEventListener("click", () => moveCard("done"));

  close.addEventListener("click", closeModal);
  edit.addEventListener("click", startEdit);
  deleteBtn.addEventListener("click", deleteIt);
}

function closeModal() {
  document.querySelector("#modal-bg").classList.add("hide");
  document.querySelector("#modal-container").classList.add("hide");
}

function startEdit() {
  const modalText = document.querySelector("#modal span");
  if (event.target.classList[1] === "active") {
    event.target.classList.remove("active");
    event.target.textContent = "Edit";
    modalText.setAttribute("contenteditable", "false");
    console.log(currentCard.getAttribute("id"));
    document.getElementById(currentCard.getAttribute("id")).remove();
    putData(
      modalText.textContent,
      currentCard.dataset.currentList,
      currentCard.id
    );
    closeModal();
    return;
  }
  modalText.setAttribute("contenteditable", "true");
  modalText.focus();
  event.target.classList.add("active");
  event.target.textContent = "Done";
}

function moveCard(list) {
  let content = currentCard.children[1].textContent;
  let id = currentCard.id;
  putData(content, list, id);
  document.getElementById(id).remove();
  closeModal();
}

function putData(content, list, id) {
  let data = {
    card_content: content,
    active_list: list,
  };
  let postData = JSON.stringify(data);
  fetch(`${endpoint}/${id}`, {
    method: "put",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
    body: postData,
  })
    .then((e) => e.json())
    .then(placeCard);
}

function post(data) {
  const postData = JSON.stringify(data);
  fetch(endpoint, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
    body: postData,
  })
    .then((e) => e.json())
    .then(placeCard);
}

function deleteIt() {
  let id = currentCard.id;
  document.getElementById(id).remove();
  closeModal();
  fetch(`${endpoint}/${id}`, {
    method: "delete",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  });
}
