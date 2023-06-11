class Sprite {
    constructor({ position, image, rotation = 0, frames = { max: 1, hold: 10 }, sprites, animate = false }) {
        this.position = position
        this.image = new Image()
        this.frames = { ...frames, val: 0, elapsed: 0 }
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.image.src = image.src
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
        ctx.rotate(this.rotation)
        ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)
        ctx.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )
        ctx.restore()

        if (!this.animate) return
        if (this.frames.max > 1) {
            this.frames.elapsed++
        }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++
            else this.frames.val = 0
        }
    }

}

class Monsters extends Sprite {
    constructor({ isEnemy = false, name, position, image, rotation = 0, frames = { max: 1, hold: 10 }, sprites, animate = false, attacks }) {
        super({
            position, image, rotation, frames, sprites, animate
        })
        this.health = 100
        this.name = name
        this.isEnemy = isEnemy
        this.attacks = attacks
    }

    faint() {
        document.querySelector("#dialogueBox").innerHTML = `${this.name} fainted!`
        gsap.to(this.position, {
            y: this.position.y + 30
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop()
        audio.victory.play()
    }

    attack({ attack, recipient, renderedSprites }) {
        document.querySelector("#dialogueBox").style.display = "block"
        document.querySelector("#dialogueBox").innerHTML = `${this.name} used ${attack.name}`
        recipient.health -= attack.damage
        let fireballRotation = 1.5

        let movDistX = 20
        let movDistY = 25
        let healthBar = "#draggleHealthBar"

        if (this.isEnemy) {
            movDistX = -20
            movDistY = -25
            healthBar = "#embyHealthBar"
            fireballRotation = -2.4
        }

        switch (attack.name) {
            case "Fireball":
                audio.initFireball.play()
                const fireballImage = new Image()
                fireballImage.src = "./img/fireball.png"
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation: fireballRotation
                })
                renderedSprites.splice(1, 0, fireball)
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        audio.fireballHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health + "%"
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + movDistX * 1 / 2,
                            y: recipient.position.y - movDistY * 1 / 3,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0.1,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1)
                    }
                })
                break;
            case "Tackle":
                const tl = gsap.timeline()
                tl.to(this.position, {
                    x: this.position.x - movDistX * 4,
                    duration: 0.3
                }).to(this.position, {
                    x: this.position.x + movDistX * 4,
                    duration: 0.2
                }).to(this.position, {
                    x: this.position.x - movDistX,
                    y: this.position.y + movDistY,
                    duration: 0.5
                }).to(this.position, {
                    x: this.position.x + movDistX * 19,
                    y: this.position.y - movDistY * 6,
                    duration: 0.01,
                    onComplete: () => {
                        audio.tackleHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health + "%"
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + movDistX * 1 / 2,
                            y: recipient.position.y - movDistY * 1 / 3,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0.1,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x,
                    y: this.position.y,
                    duration: 0.5
                })
                break;
        }
    }
}

class Boundary {
    static width = 48
    static height = 48
    constructor({ position }) {
        this.position = position
        this.width = 48
        this.height = 48
    }
    draw() {
        ctx.fillStyle = "rgba(255, 0, 0, 0.0)"
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}