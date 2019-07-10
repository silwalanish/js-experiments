class FlappyBird{

  constructor (game, x, y, width, height, flying, dazalled) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.width = width;
    this.height = height;
    this.flyingAnimation = flying;
    this.dazalledAnimation = dazalled;
    this.currentAnimation = this.flyingAnimation;
  }

  draw (ctx) {
    ctx.beginPath();
    this.currentAnimation.render(ctx, this.x, this.y, this.width, this.height);
    ctx.closePath();
  }

  update (deltaTime) {

    if(this.isAlive()){
      this.y += this.speed;
      this.speed += this.game.gravity;
      this.currentAnimation = this.flyingAnimation;
    }else{
      this.currentAnimation = this.dazalledAnimation;
    }
    this.currentAnimation.update(deltaTime);
  }

  isAlive () {
    return (this.y + this.height) <= this.game.height;
  }

  setFlyingAnimation(animation) {
    this.flyingAnimation = animation;
  }

  setDazalledAnimation(animation){
    this.dazalledAnimation = animation;
  }

}