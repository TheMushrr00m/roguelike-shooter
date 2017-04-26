import Phaser from 'phaser';

export default class extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);
    this.anchor.setTo(0.5);
    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    // this.body.setSize(20, 32, 5, 16);
    // this.animations.add('left', [0, 1, 2, 3], 10, true);
    // this.animations.add('turn', [4], 20, true);
    // this.animations.add('right', [5, 6, 7, 8], 10, true);
  }

  checkCursors(cursors) {
    if (cursors.up.isDown) {
      this.body.velocity.y -= 140;
    } else if (cursors.down.isDown) {
      this.body.velocity.y += 140;
    }

    if (cursors.left.isDown) {
      this.body.velocity.x -= 140;
    } else if (cursors.right.isDown) {
      this.body.velocity.x += 140;
    }
  }

  update() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.checkCursors(this.game.cursors);
    this.checkCursors(this.game.wasd);
  }

}
