import Phaser from 'phaser';

export default class extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);
    this.anchor.setTo(0.5);
    this.game = game;
    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.maxVelocity.x = 240;
    this.body.maxVelocity.y = 240;
    // this.body.setSize(20, 32, 5, 16);
    // this.animations.add('left', [0, 1, 2, 3], 10, true);
    // this.animations.add('turn', [4], 20, true);
    // this.animations.add('right', [5, 6, 7, 8], 10, true);

    this.bulletPool = this.game.add.group();
    for (let i = 0; i < 30; i += 1) {
      // Create each bullet and add it to the group.
      const bullet = game.add.sprite(0, 0, 'bullet');
      this.bulletPool.add(bullet);

      // Set its pivot point to the center of the bullet
      bullet.anchor.setTo(0.5, 0.5);
      bullet.scale.setTo(3, 3);

      // Enable physics on the bullet
      game.physics.enable(bullet, Phaser.Physics.ARCADE);

      // Set its initial state to "dead".
      bullet.kill();
    }
  }

  checkCursors(cursors) {
    if (cursors.up.isDown) {
      this.body.velocity.y -= 240;
    } else if (cursors.down.isDown) {
      this.body.velocity.y += 240;
    }

    if (cursors.left.isDown) {
      this.body.velocity.x -= 240;
    } else if (cursors.right.isDown) {
      this.body.velocity.x += 240;
    }
  }

  shootBullet() {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    const SHOT_DELAY = 190;
    if (this.game.time.now - this.lastBulletShotAt < SHOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now;

    // Get a dead bullet from the pool
    const bullet = this.bulletPool.getFirstDead();

    // If there aren't any bullets available then don't shoot
    if (!bullet) {
      return;
    }

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.revive();

    // Bullets should kill themselves when they leave the world.
    // Phaser takes care of this for me by setting this flag
    // but you can do it yourself by killing the bullet if
    // its x,y coordinates are outside of the world.
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    // Set the bullet position to the gun position.
    bullet.reset(this.x, this.y);
    this.lastRotation = this.game.physics.arcade.angleToPointer(this);

    /*
    this.gun.anchor.set(0, 0.5);
    if (Math.cos(this.lastRotation) < 0) {
      this.gun.rotation = Math.PI - this.lastRotation;
    } else {
      this.gun.rotation = this.lastRotation;
    }*/
    bullet.rotation = this.lastRotation;

    const BULLET_SPEED = 950;
    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * BULLET_SPEED;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * BULLET_SPEED;
  }


  update() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.checkCursors(this.game.cursors);
    this.checkCursors(this.game.wasd);
    if (this.game.input.activePointer.isDown) {
      this.shootBullet();
    }
  }
}
