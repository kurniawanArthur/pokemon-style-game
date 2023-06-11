const monsters = {
    Emby: {
        position: {
            x: 280,
            y: 325
        },
        image: {
            src: "./img/embySprite.png"
        },
        frames: {
            max: 4,
            hold: 20
        },
        animate: true,
        name: "Emby",
        attacks: [attacks.Tackle, attacks.Fireball]
    },
    Draggle: {
        position: {
            x: 800,
            y: 100
        },
        isEnemy: true,
        image: {
            src: "./img/draggleSprite.png"
        },
        frames: {
            max: 4,
            hold: 50
        },
        animate: true,
        name: "Draggle",
        attacks: [attacks.Tackle, attacks.Fireball]
    }
}