const BULLET_LIFE = 2;
const BULLET_SPEED = 150;

class Bullet{

  constructor (game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.life = this.game.options.bulletLife || BULLET_LIFE;
    this.speed = this.game.options.bulletSpeed || BULLET_SPEED;
  }

  draw (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.x, this.y, 5, 5);
    ctx.closePath();
  }

  update (deltaTime) {
    this.y -= this.speed * deltaTime;
    this.life -= deltaTime;
  }

  isAlive () {
    return this.life > 0;
  }

}