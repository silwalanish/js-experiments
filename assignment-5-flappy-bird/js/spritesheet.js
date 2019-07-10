
class Sprite{

    constructor (imgSrc, sx, sy, sw, sh) {
      this.imgSrc = imgSrc;
      this.sx = sx;
      this.sy = sy;
      this.sw = sw;
      this.sh = sh;

      this.loaded = false;

      this.load();
    }

    load () {
      this.image = new Image();
      this.image.onload = (e) => {
        this.loaded = true;
      };
      this.image.src = this.imgSrc;
    }

    draw (ctx, x, y, w, h) {
      if(this.loaded){
        ctx.drawImage(this.image, this.sx, this.sy, this.sw, this.sh, x, y, w, h);
      }
    }

}

class SpriteAnimation{

  constructor (sprite, startIndex, endIndex, animSpeed){
    this.sprite = sprite;
    this.startIndex = startIndex;
    this.currentIndex = this.startIndex;
    this.endIndex = endIndex;
    this.progress = 0;

    this.animSpeed = animSpeed;
  }

  render (ctx, x, y, w, h) {
    this.sprite.sy = this.currentIndex * this.sprite.sh;
    this.sprite.draw(ctx, x, y, w, h);
  }

  update (deltaTime) {
    this.progress += this.animSpeed * deltaTime;
    if(this.progress > 1){
      this.currentIndex ++;
      if(this.currentIndex > this.endIndex){
        this.currentIndex = this.startIndex;
      }
      this.progress = 0;
    }
  }

}