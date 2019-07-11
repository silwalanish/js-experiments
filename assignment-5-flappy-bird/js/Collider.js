class Collider {

  constructor (parent, width, height) {
    this.parent = parent;
    this.x = this.parent.x;
    this.y = this.parent.y;
    this.width = width || this.parent.width;
    this.height = height || this.parent.height;
  }

  update (deltaTime) {
    this.x = this.parent.x;
    this.y = this.parent.y;
  }
  
  collidesWith (collider) {
    return this.contains(collider.x, collider.y) || 
    this.contains(collider.x + collider.width, collider.y) ||
    this.contains(collider.x, collider.y + collider.height) ||
    this.contains(collider.x + collider.width, collider.y + collider.height);
  }
  
  contains (x, y) {
    return (x >= this.x && x <= (this.x + this.width)) && 
           (y >= this.y && y <= (this.y + this.height));
  } 

  collisionExtent (collider) {
    let extentLeft = this.x - (collider.x + collider.width);
    let extentRight = this.x + this.width - collider.x;
    if(Math.abs(extentLeft) > Math.abs(extentRight)){
      return extentRight;
    }else{
      return extentLeft;
    }
  }

}