const battleBackgroundImage = new Image()
battleBackgroundImage.src = "./img/battleBackground.png"

const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

let draggle
let emby
let renderedSprites
let queue = []

let battleAnimationID

function animateBattle() {
  battleAnimationID = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach(sprite => {
    sprite.draw()
  })
}

animate();
// initBattle()
// animateBattle()

function initBattle() {
  document.getElementById("battleActivation").style.display = "block"
  document.getElementById("dialogueBox").style.display = "none"
  document.getElementById("draggleHealthBar").style.width = "100%"
  document.getElementById("embyHealthBar").style.width = "100%"
  document.getElementById("attacksBox").replaceChildren()


  draggle = new Monsters(monsters.Draggle)
  emby = new Monsters(monsters.Emby)
  renderedSprites = [draggle, emby]
  queue = []

  emby.attacks.forEach(attack => {
    const button = document.createElement("button")
    button.innerHTML = attack.name
    document.getElementById("attacksBox").appendChild(button)
  })

  // event listener for attack button
  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("mouseenter", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerText]
      document.querySelector("#attackType").innerHTML = selectedAttack.type
      document.querySelector("#attackType").style.color = selectedAttack.color
    })
    button.addEventListener("mouseleave", (e) => {
      document.querySelector("#attackType").innerHTML = "Attack Type"
      document.querySelector("#attackType").style.color = "black"
    })

    button.addEventListener("click", function (e) {
      const selectedAttack = attacks[e.currentTarget.innerText]
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })
      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        queue.push(() => {
          gsap.to("#overlappingDiv", {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationID)
              animate()
              gsap.to("#overlappingDiv", {
                opacity: 0
              })
              document.getElementById("battleActivation").style.display = "none"
              draggle.position.y -= 30
              battle.initiate = false
              audio.Map.play()
            }
          })
        })
        return
      }

      // Draggle or enemy attack
      const randomAttacks = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

      queue.push(() => {
        draggle.attack({
          attack: randomAttacks,
          recipient: emby,
          renderedSprites
        })
        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })
          queue.push(() => {
            gsap.to("#overlappingDiv", {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationID)
                animate()
                gsap.to("#overlappingDiv", {
                  opacity: 0
                })
                document.getElementById("battleActivation").style.display = "none"
                emby.position.y -= 30
                battle.initiate = false
                audio.Map.play()
              }
            })
          })
          return
        }
      })
    })
  })
}

document.querySelector("#dialogueBox").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = "none"
})