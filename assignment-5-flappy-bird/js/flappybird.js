class FlappyBird{

  constructor (game, x, y, width, height, flying, fainted) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.width = width;
    this.height = height;
    this.angle = 0;
    this.fainted = false;
    this.flyingAnimation = flying;
    this.faintedAnimation = fainted;
    this.currentAnimation = this.flyingAnimation;
    this.collider = new Collider(this, this.width, this.height - 11);
  }

  draw (ctx) {
    ctx.beginPath();
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(Math.min(Math.max(this.angle, -Math.PI / 4), Math.PI / 2));
    this.currentAnimation.render(ctx, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
    ctx.closePath();
  }

  update (deltaTime) {
    if((this.isAlive() || !this.onTheGround()) && this.game.isPlaying){
      this.y += this.speed;
      this.speed += this.game.gravity;
      this.angle += Math.atan2(this.speed, this.x);
      if(this.y < 0){
        this.y = 0;
        this.speed = 0;
      }
    }

    if(this.isAlive()){
      this.currentAnimation = this.flyingAnimation;
    }else{
      this.currentAnimation = this.faintedAnimation;
    }

    this.currentAnimation.update(deltaTime);
    this.collider.update(deltaTime);
  }

  moveUp () {
    //this.angle = -45;
    this.speed = -10;
  }

  onTheGround () {
    return ((this.collider.y + this.collider.height) >= (this.game.height - this.game.options.groundSprite.sh));
  }

  isAlive () {
    return !this.onTheGround() && !this.fainted;
  }

}