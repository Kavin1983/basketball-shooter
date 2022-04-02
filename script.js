const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector(".score");
const colorBtnEls = Array.from(document.querySelectorAll(".colors__color"));
const settingsBtnEl = document.querySelector(".settings-btn");
const settingsMenuEl = document.querySelector(".settings-menu");
const madeByEl = document.querySelector(".made-by");
const warningEl = document.querySelector(".warning");
const skipBtnEl = document.querySelector(".skip");
const mass = 0.56699; // KG
const force = 6.457; // N
const acceleration = mass * force;
const gravity = -9.8;
const madeHoopRimColor = "rgb(247, 209, 20)";
let initialVelocityY = 6;
let initialVelocityX = 6;
let basketBallColor = "orange";
let inAir = false;
let isIn = false;
let score = 0;
let shootBasketBallInteval;
let currentBasketScored = false;
let hoopColor = "red";
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const clickedPosition = {
  x: 0,
  y: 0,
};

const basketBallPosition = {
  x: 300,
  y: 600,
  lastY: this.y - 1,
};

const hoopPosition = {
  x: Math.random() * (canvas.width - 200) + 100,
  y: Math.random() * (canvas.height - 200) + 100,
};

window.addEventListener("load", () => {
  colorBtnEls.forEach((btn) => {
    btn.style.backgroundColor = btn.dataset.color;

    btn.addEventListener("click", () => {
      changeBasketBallColor(btn);
      generateHoop();

      colorBtnEls.forEach((b) => {
        b.innerHTML = "";
      });

      btn.innerHTML = `
      <svg class="icon icon--checkmark">
      <use href="icons.svg#icon-checkmark"></use>
      </svg>
      `;
    });
    generateHoopPosition();
    generateBasketball();
    generateHoop();
    typeAnimation();
  });
});

document.addEventListener("keydown", () => {
  return;
  reset(currentBasketScored);
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  generateBasketball();
  generateHoop();
});

settingsBtnEl.addEventListener("click", () => {
  settingsMenuEl.classList.toggle("hidden");

  if (settingsMenuEl.classList.contains("hidden")) {
    settingsBtnEl.style.top = "2rem";
    settingsBtnEl.style.right = "2rem";
    skipBtnEl.style.display = "inline-block";
    settingsBtnEl.innerHTML = `<svg class="icon icon--settings"><use href="icons.svg#icon-cog"></use></svg>`;
    settingsBtnEl.querySelector(".icon--settings").style.fill = "white";

    settingsBtnEl.querySelector(".icon--settings").style.width = "4rem";
    settingsBtnEl.querySelector(".icon--settings").style.height = "4rem";
  } else {
    settingsBtnEl.style.top = "3.5rem";
    settingsBtnEl.style.right = "3.5rem";
    skipBtnEl.style.display = "none";
    settingsBtnEl.innerHTML = `<svg class="icon icon--settings"><use href="icons.svg#icon-cross"></use></svg>`;
    settingsBtnEl.querySelector(".icon--settings").style.fill = "black";

    settingsBtnEl.querySelector(".icon--settings").style.width = "2rem";
    settingsBtnEl.querySelector(".icon--settings").style.height = "2rem";
  }
});

canvas.addEventListener("click", (e) => {
  if (inAir) return;

  inAir = true;

  clickedPosition.x = e.x;
  clickedPosition.y = e.y;

  const displacementY = Math.abs(clickedPosition.y - basketBallPosition.y);
  const displacementX = Math.abs(clickedPosition.x - basketBallPosition.x);
  initialVelocityX = displacementX / 2 - (acceleration / 120) * 2;
  initialVelocityY = displacementY / 2 + (gravity / 120) * 2;

  initialVelocityY = Math.sqrt(2 * (acceleration / 50) * displacementY);
  initialVelocityX = Math.sqrt(((2 * acceleration) / 50) * displacementX);

  if (e.x < basketBallPosition.x) {
    initialVelocityX *= -1;
  }

  if (basketBallPosition.y < e.y) {
    initialVelocityY *= -1;
  }

  // Shoot basketball
  shootBasketBallInteval = setInterval(() => {
    initialVelocityX +=
      initialVelocityX < 0 ? acceleration / 120 : -acceleration / 120;
    checkShot();
    if (basketBallPosition.y < canvas.height) {
      initialVelocityY += gravity / 120;
    } else {
      displayWarning();
      inAir = true;
      isIn = false;
      initialVelocityY = Math.abs(initialVelocityY * 0.5);
    }

    if (basketBallPosition.x > canvas.width) {
      basketBallPosition.x = 0;
    }

    if (basketBallPosition.x < 0) {
      basketBallPosition.x = canvas.width;
    }

    basketBallPosition.lastY = basketBallPosition.y;

    basketBallPosition.x += initialVelocityX;
    basketBallPosition.y -= initialVelocityY;

    updateBasketBall();
  }, 10);
});

skipBtnEl.addEventListener("click", () => {
  reset(true);
});

function reset(randomizeHoopPosition) {
  basketBallPosition.x = 300;
  basketBallPosition.y = 600;
  initialVelocityX = 6;
  initialVelocityY = 6;
  inAir = false;
  hoopColor = "red";
  if (randomizeHoopPosition) {
    hoopPosition.x = Math.random() * (canvas.width - 200) + 100;
    hoopPosition.y = Math.random() * (canvas.height - 200) + 100;
  }
  generateHoopPosition();
  warningEl.style.transform = "translateX(-100%)";
  warningEl.style.opacity = 0;
  updateBasketBall();
  clearInterval(shootBasketBallInteval);
  currentBasketScored = false;
}

function generateHoopPosition() {
  while (
    Math.abs(basketBallPosition.x - hoopPosition.x) <= 100 &&
    Math.abs(basketBallPosition.y - hoopPosition.y) <= 100
  ) {
    hoopPosition.x = Math.random() * (canvas.width - 200) + 100;
    hoopPosition.y = Math.random() * (canvas.height - 200) + 100;
  }
}

function displayWarning() {
  warningEl.style.transform = "translateX(0)";
  warningEl.style.opacity = 1;
}

function bounceHorizontal() {
  initialVelocityX *= -1;
}

function bounceVertical() {
  if (initialVelocityX < 1) {
    initialVelocityY *= -1;
    initialVelocityX += initialVelocityX / Math.abs(initialVelocityX);
  }
}

function updateScore() {
  score++;
  scoreEl.textContent = score;
}

function checkShot() {
  if (
    basketBallPosition.x + 15 > hoopPosition.x - 5 &&
    basketBallPosition.x - 15 < hoopPosition.x + 15 &&
    basketBallPosition.y - 15 < hoopPosition.y - 5 &&
    basketBallPosition.y + 15 > hoopPosition.y + 5
  ) {
    bounceHorizontal();
    bounceVertical();
  }

  if (
    basketBallPosition.x - 15 < hoopPosition.x + 105 &&
    basketBallPosition.x + 15 > hoopPosition.x + 95 &&
    basketBallPosition.y - 15 < hoopPosition.y - 5 &&
    basketBallPosition.y + 15 > hoopPosition.y + 5
  ) {
    bounceHorizontal();
    bounceVertical();
  }

  if (
    basketBallPosition.x > hoopPosition.x &&
    basketBallPosition.x < hoopPosition.x + 100 &&
    basketBallPosition.y > hoopPosition.y &&
    basketBallPosition.y < hoopPosition.y + 20 &&
    basketBallPosition.lastY < basketBallPosition.y
  ) {
    if (!isIn) {
      if (currentBasketScored) return;
      hoopColor = madeHoopRimColor;
      updateScore();
      currentBasketScored = true;
      isIn = true;
    }
    if (
      basketBallPosition.x > hoopPosition.x + 30 &&
      basketBallPosition.x < hoopPosition.x + 70
    ) {
      if (basketBallPosition.x < hoopPosition.x + 50) {
        initialVelocityX += 0.5;
      } else {
        initialVelocityX += -0.5;
      }
    }
  }
}

function updateBasketBall() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  generateBasketball();
  generateHoop();
}

function changeBasketBallColor(btn) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  basketBallColor = btn.dataset.color;
  generateBasketball();
}

function generateHoop() {
  ctx.beginPath();
  ctx.moveTo(hoopPosition.x, hoopPosition.y);
  ctx.lineTo(hoopPosition.x + 30, hoopPosition.y + 100);

  ctx.moveTo(hoopPosition.x + 30, hoopPosition.y + 100);
  ctx.lineTo(hoopPosition.x + 70, hoopPosition.y + 100);

  ctx.moveTo(hoopPosition.x + 70, hoopPosition.y + 100);
  ctx.lineTo(hoopPosition.x + 100, hoopPosition.y);

  ctx.moveTo(hoopPosition.x + 100, hoopPosition.y);
  ctx.lineTo(hoopPosition.x + 30, hoopPosition.y + 100);

  ctx.moveTo(hoopPosition.x + 70, hoopPosition.y + 100);
  ctx.lineTo(hoopPosition.x, hoopPosition.y);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(hoopPosition.x + 50, hoopPosition.y + 100);
  ctx.lineTo(hoopPosition.x + 85, hoopPosition.y + 50);

  ctx.moveTo(hoopPosition.x + 85, hoopPosition.y + 50);
  ctx.lineTo(hoopPosition.x + 50, hoopPosition.y);

  ctx.moveTo(hoopPosition.x + 50, hoopPosition.y);
  ctx.lineTo(hoopPosition.x + 15, hoopPosition.y + 50);

  ctx.moveTo(hoopPosition.x + 15, hoopPosition.y + 50);
  ctx.lineTo(hoopPosition.x + 50, hoopPosition.y + 100);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(hoopPosition.x, hoopPosition.y);
  ctx.lineTo(hoopPosition.x + 100, hoopPosition.y);
  ctx.strokeStyle = hoopColor;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.closePath();
}
let count = 0;
let xLineMultiplier = 0;
let yLineMultiplier = 0;

function updateLine() {
  count++;
  xLineMultiplier++;
  yLineMultiplier++;
  if (count === 360) {
    xLineMultiplier = 1;
    yLineMultiplier = 1;
  }
}

function generateBasketball() {
  const lineColor = "rgb(43, 42, 42)";
  ctx.beginPath();
  ctx.fillStyle = basketBallColor;
  ctx.arc(basketBallPosition.x, basketBallPosition.y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.bezierCurveTo(
    basketBallPosition.x + -10,
    basketBallPosition.y + 30,
    basketBallPosition.x,
    basketBallPosition.y,
    basketBallPosition.x + -10,
    basketBallPosition.y - 30
  );
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.bezierCurveTo(
    basketBallPosition.x + 10,
    basketBallPosition.y - 30,
    basketBallPosition.x,
    basketBallPosition.y,
    basketBallPosition.x + 10,
    basketBallPosition.y + 30
  );
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.bezierCurveTo(
    basketBallPosition.x - 30,
    basketBallPosition.y,
    basketBallPosition.x,
    basketBallPosition.y,
    basketBallPosition.x + 30,
    basketBallPosition.y
  );
  ctx.stroke();
  ctx.closePath();
}

function typeAnimation() {
  let count = 1;
  let madeByArr = "Made by Kavin".split("");
  madeByEl.textContent = "";

  madeByArr.forEach((char) => {
    if (char === " ") {
      i = madeByArr.indexOf(char);
      madeByArr[i + 1] = ` ${madeByArr[i + 1]}`;

      madeByArr.splice(i, 1);
    }
  });
  setInterval(function () {
    madeByEl.textContent = madeByArr.slice(0, count).join("");
    count++;
  }, 200);
}
