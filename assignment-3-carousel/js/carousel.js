class Carousel {

  constructor (el, options) {
    if(!el){
      throw new Error("el is required.");
    }
    this.el = el; 
    this.imageCont = el.querySelector(".image-cont");
    this.images = this.imageCont.children;

    this.options = options || {};
    this.options.transitionTime = this.options.transitionTime || 100;

    this.width = this.options.width || this.images[0].width;
    this.height = this.options.height || this.images[0].height;
 
    this.init();
  }

  init () {
    this.el.style.width = this.width + "px";
    this.el.style.height = this.height + "px";
    this.el.style.overflow = "hidden";
    this.el.style.position = "relative";
    
    this.imageCont.style.width = this.images.length * this.width + "px";
    this.imageCont.style.lineHeight = "0";

    for(let image of this.images){
      image.style.display = "block";
      image.style.float = "left";
      image.style.width = this.width + "px";
      image.style.height = this.height + "px";
    }

    this.addButtons();
    this.addBullets();

    this.currentIndex = 0;

    this.bulletList.children[this.currentIndex].classList.add('active');
    this.startLoop();
  }

  startLoop () {
    this.changer = setInterval(() => { this.next(); }, this.options.delay || 2000);
  }

  clearTime () {
    clearInterval(this.changer);
    this.changer = null;
  }

  addButtons () {
    let prevBtn = document.createElement('div');
    prevBtn.classList.add('prev');
    this.el.appendChild(prevBtn);
    prevBtn.addEventListener('click', () => {
      if(!this.isAnimating){
        this.prev();
      }
    });

    let nextBtn = document.createElement('div');
    nextBtn.classList.add('next');
    this.el.appendChild(nextBtn);
    nextBtn.addEventListener('click', () => {
      if(!this.isAnimating){
        this.next();
      }
    });
  }

  addBullets () {
    this.bulletList = document.createElement("ul");
    this.bulletList.classList.add('bullets-list');
    for(let i = 0; i < this.images.length; i++){
      let bullet = document.createElement("li");
      bullet.classList.add('bullet');
      bullet.addEventListener('click', () => {
        this.jumpTo(i);
      });
      this.bulletList.appendChild(bullet);
    }
    this.el.appendChild(this.bulletList);
  }

  finishCurrentAnimation () {
    this.imageCont.style.marginLeft = -this.currentIndex * this.width + "px";
    clearInterval(this.animator);
    this.animator = null;
    this.isAnimating = false;
  }

  animateTo (n){
    let currentMargin = this.currentIndex * this.width;
    let endMargin = n * this.width;
    let diffMargin = endMargin - currentMargin;
    let progress = 0;
    let speed = Math.abs(n - this.currentIndex) / this.options.transitionTime;

    if(this.animator){
      this.finishCurrentAnimation();
    }

    this.isAnimating = true;

    this.animator = setInterval(() => {
      this.imageCont.style.marginLeft = -(currentMargin + diffMargin * progress) + "px";
      progress += speed;
      if(progress >= 1){
        this.finishCurrentAnimation();
        this.startLoop();
      }
    }, speed * this.width);
    
  }

  prev () {
    let prevIndex  = (this.currentIndex - 1);
    if(prevIndex < 0){
      prevIndex = this.images.length + prevIndex;
    }
    this.jumpTo(prevIndex);
  }

  next () {
    let nextIndex = (this.currentIndex + 1) % this.images.length;
    this.jumpTo(nextIndex);
  }

  jumpTo (i) {
    if(!this.isAnimating){
      this.clearTime();
      this.animateTo(i);
      this.bulletList.children[this.currentIndex].classList.remove('active');
      this.currentIndex = i;
      this.bulletList.children[i].classList.add('active');
    }
  }

  static register(selector, options) {
    let elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      new Carousel(element, options);
    });
  }

}