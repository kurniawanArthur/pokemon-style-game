const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const collisionMap = []
for (let i = 0; i < collisions1.length; i += 70) {
  collisionMap.push(collisions1.slice(i, i + 70))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, i + 70))
}

let offset = {
  x: -1792,
  y: -348
}

const boundaries = []
collisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const battleZones = []
battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const image = new Image();
image.src = "./img/Cirrus Town1.png";

const foregroundImage = new Image();
foregroundImage.src = "./img/foregroundObjects1.png";

const playerDown = new Image();
playerDown.src = "./img/playerDown.png";

const playerUp = new Image();
playerUp.src = "./img/playerUp.png";

const playerLeft = new Image();
playerLeft.src = "./img/playerLeft.png";

const playerRight = new Image();
playerRight.src = "./img/playerRight.png";

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDown,
  frames: {
    max: 4,
    hold: 20
  },
  sprites: {
    up: playerUp,
    down: playerDown,
    left: playerLeft,
    right: playerRight
  }
})

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowUp: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowDown: {
    pressed: false
  }
}

const movables = [background, ...boundaries, foreground, ...battleZones]
const playerSpeed = 1

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x + 2 &&
    rectangle1.position.x + 2 <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y + 40 <= rectangle2.position.y + rectangle2.height
  )
}

let battle = {
  initiate: false
}

function animate() {
  const animationId = window.requestAnimationFrame(animate);

  background.draw()
  boundaries.forEach(boundary => {
    boundary.draw()
  })
  battleZones.forEach(battleZone => {
    battleZone.draw()
  })
  player.draw()
  foreground.draw()

  let moving = true
  player.animate = false

  if (battle.initiate) return

  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed || keys.ArrowUp.pressed || keys.ArrowLeft.pressed || keys.ArrowDown.pressed || keys.ArrowRight.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea =
        (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width)
          - Math.max(player.position.x, battleZone.position.x))
        * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height)
          - Math.max(player.position.y, battleZone.position.y))
      if (rectangularCollision({
        rectangle1: player,
        rectangle2: battleZone
      }) && overlappingArea > (player.width * player.height) / 2
        && Math.random() < 0.005) {
        //deactivate current animation loop
        window.cancelAnimationFrame(animationId)

        audio.Map.stop()
        audio.initBattle.play()
        audio.battle.play()

        battle.initiate = true
        gsap.to("#overlappingDiv", {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to("#overlappingDiv", {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                //activate a new animation loop
                initBattle()
                animateBattle()
                gsap.to("#overlappingDiv", {
                  opacity: 0,
                  duration: 0.4
                })
              }
            })

          }
        })
        break
      }
    }
  }

  // if (background.position.x >= 0 && background.position.x <= 152) {
  //   moving = false 
  //   movables.forEach(moveable => {
  //     moveable.position.x -= playerSpeed
  //     movables[0].position.x += playerSpeed
  //   })
  //   player.position.x -= playerSpeed + 1
  // }

  if (keys.w.pressed || keys.ArrowUp.pressed) {
    player.animate = true
    player.image = player.sprites.up
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x,
            y: boundary.position.y + playerSpeed
          }
        }
      })
      ) {
        player.animate = false
        player.frames.val = 0
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach(moveable => {
        moveable.position.y += playerSpeed
      })
  }
  else if (keys.s.pressed || keys.ArrowDown.pressed) {
    player.animate = true
    player.image = player.sprites.down
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x,
            y: boundary.position.y - (playerSpeed * 2)
          }
        }
      })
      ) {
        player.animate = false
        player.frames.val = 0
        moving = false
        break
      }
    }
    if (moving)
      movables.forEach(moveable => {
        moveable.position.y -= playerSpeed
      })
  }
  else if (keys.a.pressed || keys.ArrowLeft.pressed) {
    player.animate = true
    player.image = player.sprites.left
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x + playerSpeed,
            y: boundary.position.y
          }
        }
      })
      ) {
        player.animate = false
        player.frames.val = 0
        moving = false
        break
      }
    }
    if (moving)
      movables.forEach(moveable => {
        moveable.position.x += playerSpeed
      })
  }
  else if (keys.d.pressed || keys.ArrowRight.pressed) {
    player.animate = true
    player.image = player.sprites.right
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x - playerSpeed,
            y: boundary.position.y
          }
        }
      })
      ) {
        player.animate = false
        player.frames.val = 1
        moving = false
        break
      }
    }
    if (moving)
      movables.forEach(moveable => {
        moveable.position.x -= playerSpeed
      })
  }
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true
      break;
    case "a":
      keys.a.pressed = true
      break;
    case "s":
      keys.s.pressed = true
      break;
    case "d":
      keys.d.pressed = true
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = true
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = true
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false
      break;
    case "a":
      keys.a.pressed = false
      break;
    case "s":
      keys.s.pressed = false
      break;
    case "d":
      keys.d.pressed = false
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = false
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = false
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false
      break;
  }
});

let clickToPlay = false
addEventListener("click", () => {
  if (!clickToPlay) {
    audio.Map.play()
    clickToPlay = true
  }
})