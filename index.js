const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let score = 0;

class Player {
  constructor(x, y, size, color, health = 100) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.health = health;
  }

  draw() {
    context.fillStyle = this.color;
    context.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    context.fillStyle = "red";
    context.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2 - 10,
      this.size,
      5
    );
    context.fillStyle = "green";
    context.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2 - 10,
      this.size * (this.health / 100),
      5
    );
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      cancelAnimationFrame(animationId);
    }
  }
}

class Projectile {
  constructor(x, y, size, color, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    context.fillStyle = this.color;
    context.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, width, height, color, velocity, shape = "rectangle") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.velocity = velocity;
    this.shape = shape;
  }

  draw() {
    context.fillStyle = this.color;
    if (this.shape === "rectangle") {
      context.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else if (this.shape === "circle") {
      context.beginPath();
      context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      context.fill();
    } else if (this.shape === "triangle") {
      context.beginPath();
      context.moveTo(this.x, this.y - this.height / 2);
      context.lineTo(this.x - this.width / 2, this.y + this.height / 2);
      context.lineTo(this.x + this.width / 2, this.y + this.height / 2);
      context.closePath();
      context.fill();
    }
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  resetPosition() {
    const width = Math.random() * (30 - 10) + 30;
    const height = Math.random() * (30 - 10) + 30;
    let x, y;
    const shape = ["rectangle", "circle", "triangle"][
      Math.floor(Math.random() * 3)
    ];
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - width : canvas.width + width;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - height : canvas.height + height;
    }

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    this.velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }
}

const friction = 0.98;

class Particle {
  constructor(x, y, size, color, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    context.save();
    context.globalAlpha = this.alpha;
    context.fillStyle = this.color;
    context.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    context.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, "white");
player.draw();

const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemies() {
  setInterval(() => {
    const width = Math.random() * (30 - 10) + 40;
    const height = Math.random() * (30 - 10) + 40;
    let x, y;
    const shape = ["rectangle", "circle", "triangle"][
      Math.floor(Math.random() * 3)
    ];
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - width : canvas.width + width;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - height : canvas.height + height;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    const newEnemy = new Enemy(x, y, width, height, color, velocity, shape);
    enemies.push(newEnemy);
  }, 1000);
}

let animationId;

const keys = {
  w: false,
  s: false,
  a: false,
  d: false,
};

const playerSpeed = 5;

function handlePlayerMovement() {
  if (keys.w && player.y - player.size / 2 > 0) {
    player.y -= playerSpeed;
  }
  if (keys.s && player.y + player.size / 2 < canvas.height) {
    player.y += playerSpeed;
  }
  if (keys.a && player.x - player.size / 2 > 0) {
    player.x -= playerSpeed;
  }
  if (keys.d && player.x + player.size / 2 < canvas.width) {
    player.x += playerSpeed;
  }
}

addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(new Projectile(player.x, player.y, 15, "white", velocity));
});

addEventListener("keydown", (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true;
  }
});

addEventListener("keyup", (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = false;
  }
});

class Star {
  constructor(x, y, size, brightness) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.brightness = brightness;
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
    context.fill();
  }

  update() {
    this.brightness = Math.random() * 0.7 + 0.3;
  }
}

const stars = [];

function generateStars(numStars) {
  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 1;
    const brightness = Math.random() * 0.2 + 0.3;
    stars.push(new Star(x, y, size, brightness));
  }
}

generateStars(50);

function animate() {
  animationId = requestAnimationFrame(animate);
  context.fillStyle = "rgba(0, 0, 100, 0.1)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach((star) => {
    star.update();
    star.draw();
  });

  player.draw();

  context.fillStyle = "white";
  context.font = "40px Monospace";
  context.fillText(score, canvas.width / 2, 100);

  handlePlayerMovement();

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    }
    particle.update();
  });

  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();
    if (
      projectile.x + projectile.size / 2 < 0 ||
      projectile.x - projectile.size / 2 > canvas.width ||
      projectile.y + projectile.size / 2 < 0 ||
      projectile.y - projectile.size / 2 > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distance - enemy.width / 2 - player.size / 2 < 1) {
      player.takeDamage(10);
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );
      if (distance - enemy.width / 2 - projectile.size / 2 < 1) {
        for (let i = 0; i < enemy.width; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 7),
                y: (Math.random() - 0.5) * (Math.random() * 7),
              }
            )
          );
        }
        if (enemy.width - 15 > 10) {
          const newWidth = enemy.width - 15;
          const newHeight = enemy.height - 15;
          gsap.to(enemy, { width: newWidth, height: newHeight, duration: 0.3 });
        } else {
          score += 10;
          setTimeout(() => {
            enemies.splice(index, 1);
          }, 0);
        }
        setTimeout(() => {
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });
  });
}

animate();
spawnEnemies();
