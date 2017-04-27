/* globals __DEV__ */
import Phaser from 'phaser';
import Player from '../sprites/Player';

function getExits(x, y) {
  return [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ];
}

function linkRoom(roomA, roomB) {
  // is up or down
  if (roomA.x === roomB.x) {
    let upRoom = roomB;
    let downRoom = roomA;
    if (roomA.y < roomB.y) {
      upRoom = roomA;
      downRoom = roomB;
    }
    upRoom.exits.down = downRoom.id;
    downRoom.exits.up = upRoom.id;
  } else {
    let leftRoom = roomA;
    let rightRoom = roomB;
    if (roomA.x > roomB.x) {
      leftRoom = roomB;
      rightRoom = roomA;
    }
    leftRoom.exits.right = rightRoom.id;
    rightRoom.exits.left = leftRoom.id;
  }
}

function findRoom([x, y], rooms) {
  let ret = false;
  rooms.forEach((r) => {
    if (x === r.x && y === r.y) {
      ret = r;
    }
  });
  return ret;
}

function getNeighboor([x, y], rooms) {
  return getExits(x, y)
  .map(p => findRoom(p, rooms))
  .filter(r => !!r);
}

function findNewRoomPos(rooms) {
  const freePos = [];
  rooms.forEach((r) => {
    getExits(r.x, r.y)
    .filter(p => !findRoom(p, rooms))
    .forEach(p => freePos.push(p));
  });
  return freePos;
}

export default class extends Phaser.State {
  init() {}
  preload() {
    this.load.spritesheet('wizard', 'assets/images/wizard.png', 52, 52, 3);
    /*
    function create() {

    sprite = game.add.sprite(40, 100, 'ms');

    sprite.animations.add('walk');

    sprite.animations.play('walk', 50, true);

      }

     */
  }


  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Keyboard.W),
      down: this.input.keyboard.addKey(Phaser.Keyboard.S),
      left: this.input.keyboard.addKey(Phaser.Keyboard.A),
      right: this.input.keyboard.addKey(Phaser.Keyboard.D),
    };
    this.player = new Player({
      game: this,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'wizard',
    });
    // crear tilemap;
    const nRooms = this.rnd.between(4, 6);
    const rooms = [];
    rooms.push({
      id: 0,
      x: 0,
      y: 0,
      exits: {},
    });
    let lastId = 0;

    while (rooms.length < nRooms) {
      lastId += 1;

      const [x, y] = this.rnd.pick(findNewRoomPos(rooms));
      const linkedRooms = getNeighboor([x, y], rooms);
      const newRoom = {
        id: lastId,
        x,
        y,
        exits: {} };
      linkedRooms.forEach(lRoom => linkRoom(lRoom, newRoom));
      rooms.push(newRoom);
    }

    this.createRoooms(rooms);
    this.game.add.existing(this.player);
  }

  createRoooms(rooms) {
    const ROOMSIZE = 21;
    const HALFROOMSIZE = Math.floor(ROOMSIZE / 2);
    const CORRIDORSIZE = 2;
    const MAPMARGIN = 2;

    const minX = Math.min(...rooms.map(r => r.x));
    const minY = Math.min(...rooms.map(r => r.y));
    if (minX < 0) {
      rooms.forEach(r => r.x += Math.abs(minX));
    }
    if (minY < 0) {
      rooms.forEach(r => r.y += Math.abs(minY));
    }

    const maxXRooms = Math.max(...rooms.map(r => r.x)) + 1;
    const maxYRooms = Math.max(...rooms.map(r => r.y)) + 1;
    this.world.setBounds(0, 0,
      ((maxXRooms * (ROOMSIZE + CORRIDORSIZE)) + MAPMARGIN) * 32,
      ((maxYRooms * (ROOMSIZE + CORRIDORSIZE)) + MAPMARGIN) * 32,
    );

    this.stage.backgroundColor = '#2d2d2d';

    // Creates a blank tilemap
    const map = this.add.tilemap();

    // This is our tileset - it's just a BitmapData filled with a selection of
    // randomly colored tiles but you could generate anything here
    const bmd = this.make.bitmapData(32 * 25, 32 * 2);

    const colors = Phaser.Color.HSVColorWheel();

    let i = 0;
    colors[0].rgba = [0, 0, 0, 0];
    for (let y = 0; y < 2; y += 1) {
      for (let x = 0; x < 25; x += 1) {
        bmd.rect(x * 32, y * 32, 32, 32, colors[i].rgba);
        i += 6;
      }
    }

    //  Add a Tileset image to the map
    map.addTilesetImage('tiles', bmd);

    //  Creates a new blank layer and sets the map dimensions.
    //  In this case the map is 40x30 tiles in size and the tiles are 32x32 pixels in size.
    const layer = map.create('level1', maxXRooms * (ROOMSIZE + CORRIDORSIZE),
    maxYRooms * (ROOMSIZE + CORRIDORSIZE), 32, 32);

    this.layer = layer;

    const addLabel = (x, y, t) => {
      const text = this.add.text(x, y, t);
      // Center align
      text.anchor.set(0.5);
      text.align = 'center';

      // Font style
      text.font = 'Arial Black';
      text.fontSize = 50;
      text.fontWeight = 'bold';

      // Stroke color and thickness
      text.stroke = '#000000';
      text.strokeThickness = 6;
      text.fill = '#43d637';
    };

    rooms.forEach((room) => {
      const topX = (room.x * (ROOMSIZE + CORRIDORSIZE)) + MAPMARGIN;
      const topY = (room.y * (ROOMSIZE + CORRIDORSIZE)) + MAPMARGIN;

      for (let j = 0; j < ROOMSIZE; j += 1) {
        // top
        map.putTile(2, topX + j, topY, layer);
        // bottom
        map.putTile(2, topX + j, (topY + ROOMSIZE) - 1, layer);
        // left column
        map.putTile(2, topX, topY + j, layer);
        // right column
        map.putTile(2, (topX + ROOMSIZE) - 1, topY + j, layer);
      }

      const labelX = (topX + (ROOMSIZE / 2)) * 32;
      const labelY = (topY + (ROOMSIZE / 2)) * 32;
      addLabel(labelX, labelY, room.id);
      if (room.id === 0) {
        this.camera.follow(this.player);
        this.player.x = labelX;
        this.player.y = labelY;
      }

      // corridors
      if (typeof room.exits.up !== 'undefined') {
        // in phaser Y axis is inverted, so up is down and down is up
        for (let i = -3; i < 4; i++) {
          map.putTile(0, topX + HALFROOMSIZE + i, topY - 1, layer);
          map.putTile(0, topX + HALFROOMSIZE + i, topY, layer);
        }
        map.putTile(20, topX + HALFROOMSIZE - 4, topY - 1, layer);
        map.putTile(20, topX + HALFROOMSIZE + 4, topY - 1, layer);
      }
      if (typeof room.exits.down !== 'undefined') {
        // in phaser Y axis is inverted, so up is down and down is up
        for (let i = -3; i < 4; i++) {
          map.putTile(0, topX + HALFROOMSIZE + i, topY + ROOMSIZE - 1, layer);
          map.putTile(0, topX + HALFROOMSIZE + i, topY + ROOMSIZE, layer);
        }
        map.putTile(20, topX + HALFROOMSIZE - 4, topY + ROOMSIZE, layer);
        map.putTile(20, topX + HALFROOMSIZE + 4, topY + ROOMSIZE, layer);
      }
      if (typeof room.exits.left !== 'undefined') {
        for (let i = -3; i < 4; i++) {
          map.putTile(0, topX, topY + HALFROOMSIZE + i, layer);
          map.putTile(0, topX - 1, topY + HALFROOMSIZE + i, layer);
        }
        map.putTile(20, topX - 1, topY + HALFROOMSIZE - 4, layer);
        map.putTile(20, topX - 1, topY + HALFROOMSIZE + 4, layer);
      }
      if (typeof room.exits.right !== 'undefined') {
        for (let i = -3; i < 4; i++) {
          map.putTile(0, topX + ROOMSIZE, topY + HALFROOMSIZE + i, layer);
          map.putTile(0, topX + ROOMSIZE - 1, topY + HALFROOMSIZE + i, layer);
        }
        map.putTile(20, topX + ROOMSIZE, topY + HALFROOMSIZE - 4, layer);
        map.putTile(20, topX + ROOMSIZE, topY + HALFROOMSIZE + 4, layer);
      }
    });
    map.setCollisionByExclusion([0]);

    console.log(JSON.stringify(rooms, null, 2));
    /*
    //  Populate some tiles for our player to start on
    const m = [
      '                ',
      '  XXXXXXXXXXX   ',
      '  X         X   ',
      '  X         X   ',
      '  X         X   ',
      '  X         X   ',
      '  X         X   ',
      '  X         X   ',
      '  X         X   ',
      '  X         X   ',
      '  XXXXXXXXXXX',
    ];
    m.forEach((row, y) => {
      row.split('').forEach((tile, x) => {
        if (tile !== ' ') {
          map.putTile(2, x, y, layer);
        }
      });
    });*/
  }

  update() {
    this.physics.arcade.collide(this.player, this.layer);
    this.game.physics.arcade.collide(this.player.bulletPool, this.layer, (b/* , tile */) => {
      b.kill();
    });
  }

  render() {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player, 32, 32);
    }
  }
}
