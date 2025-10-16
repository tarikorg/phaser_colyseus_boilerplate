/**
 * phaser client
 * connects to auth colyseus room
 * 
 * config for renderer,size,scenes
 * game instantiate, boots phaser = Phaser.game(config)
 * 
 * keeping reference to our player and display and the colyseus room
 * 
 * preload = for assets
 * create = setup visuals + connect to server
[
  update = works per frame loop for animations&VFX 
   Deliberately empty: the server drives truth; client just renders received state
   You can add cosmetic effects or UI here without changing server state
]
 */

const config = {
    type: Phaser.AUTO, //let phaser pick WEBGL/CANVAS auto
    width: 800,
    height: 600,
    backgroundColor: '#1e1e1e1e',
    scene: {
        preload,  //called once to load assets(keep it minimal)
        create,  //called once to setup objects and connect to server
        update //called every frame to render handle input visuals
    }
}



const game = new Phaser.Game(config);

let room = null;
let sprites = new Map();
/**
 * what is a sprite? 
 * -a visual object in a game
 * -its needed to move/animate/interact with things we see on screen
 *  setting it in a map so we can find/update/remove whenever needed
 */

function preload() {
    //this.load.image('player','player.png')     EXAMPLE
}

function create() {
    //visuals and connection to server
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsEndpoint = `${protocol}://${window.location.host}`;
    const client = new Colyseus.Client(wsEndpoint);

    client.joinOrCreate("room").then(joined => {
        //request a room from the server
        room = joined; //save the room connection

        //listen for new players added
        room.state.players.onAdd = (player, sessionId) => {
            const circle = this.add.circle(player.x, player.y, 12, 0x66ccff)// Draw a simple player circle
            sprites.set(sessionId, circle)// Track the sprite by sessionId

        }

        room.state.players.onChange = (player, sessionId) => {
            //on state change
            const s = sprites.get(sessionId);//get the target's sprite with session id we provided with parameter
            if (s) { s.setPosition(player.x, player.y) } //if found target sprite, move to the current player.x/y 
        }

        //remove sprites when player leave
        room.state.players.onRemove = (_, sessionId) => {
            const s = sprites.get(sessionId); //find the sprite
            if (s) { s.destroy(); }   //remove from scene
            sprites.delete(sessionId); //remove from map 
        }

        //
    })
}