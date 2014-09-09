var MSlider = function (opts) {
  this.wrap = opts.dom;
  this.list = opts.list;
  this.autoPlay = opts.autoPlay;
  this.init();
  this.renderDOM();
  this.bindDOM();
};

MSlider.prototype.init = function () {
  this.radio = window.innerHeight / window.innerWidth;
  this.scaleW = window.innerWidth;
  this.idx = 1;
  this.initListInDom();
  this.initAutoPlay();
};

MSlider.prototype.initListInDom = function () {
  //this array save index of the li in dom 
  var domIndexArr = [];
  var listLength = this.list.length;


  domIndexArr[0] = listLength-1
  domIndexArr[1] = 0;
  domIndexArr[2] = 1;

  
  for (var i = 0; i < 3; i++) {
    if (i - 1 < 0) {
      domIndexArr[i] = (i - 1 + listLength);
    } else {
      domIndexArr[i] = (i - 1) % listLength;
    }
  }
  this.domIndexArr = domIndexArr;
};

MSlider.prototype.initAutoPlay = function () {
  if (!this.autoPlay) return;
  var self = this;
  this.autoPlayTimeout = setTimeout(function () {
    self.goIndex('+1');
  }, this.autoPlay);
};

MSlider.prototype.clearAutoPlay = function () {
  clearTimeout(this.autoPlayTimeout);
};

MSlider.prototype.createLi = function (i) {
  var li = document.createElement('li');
  var item = this.list[this.domIndexArr[i]];

  li.style.width = this.scaleW + 'px';
  li.style.webkitTransform = 'translate3d(' + (i - 1) * this.scaleW + 'px, 0, 0)';

  if (item.height / item.width > this.radio) {
    li.innerHTML = '<img height="' + window.innerHeight + '" src="' + item.img + '">';
  } else {
    li.innerHTML = '<img width="' + window.innerWidth + '" src="' + item.img + '">';
  }
  return li;
};

MSlider.prototype.renderDOM = function () {
  var wrap = this.wrap;
  var data = this.list;
  var domIndexArr = this.domIndexArr;

  this.outer = document.createElement('ul');
  for (var i = 0; i < 3; i++) {
    var li = this.createLi(i);
    this.outer.appendChild(li);
  }
  this.outer.style.width = this.scaleW + 'px';
  wrap.style.height = window.innerHeight + 'px';
  wrap.appendChild(this.outer);
};

MSlider.prototype.goIndex = function (n) {
  var lis = this.outer.getElementsByTagName('li');
  var domIndexArr = this.domIndexArr;
  var outer = this.outer;
  var listLength = this.list.length;
  var newChild;

  if (typeof n !== "string") return;
  if (n === "+1") {
    domIndexArr.shift();
    domIndexArr.push((domIndexArr[1] + 1) % listLength);
    outer.removeChild(outer.childNodes[0]);
    newChild = this.createLi(2);
    outer.appendChild(newChild);
  } else if (n === "-1") {
    var tmp = domIndexArr[0] - 1;
    tmp = tmp < 0 ? listLength - 1 : tmp;
    domIndexArr.unshift(tmp);
    outer.removeChild(outer.childNodes[2]);
    newChild = this.createLi(0);
    outer.insertBefore(newChild, outer.childNodes[0]);
  }
  for (var i = 0; i < 3; i++) {
    lis[i].style.webkitTransition = '-webkit-transform 0.2s ease-out';
    lis[i].style.webkitTransform = 'translate3d(' + (i - 1) * this.scaleW + 'px, 0, 0)';
  }
  this.initAutoPlay();
};

MSlider.prototype.bindDOM = function () {
  var self = this;
  var scaleW = self.scaleW;
  var outer = self.outer;
  var len = self.list.length;

  var startHandler = function (evt) {
    self.startTime = new Date() * 1;
    self.startX = evt.touches[0].pageX;
    self.offsetX = 0;
    var target = evt.target;
    while (target.nodeName != 'LI' && target.nodeName != 'BODY') {
      target = target.parentNode;
    }
    self.target = target;
    self.clearAutoPlay();
  };

  var moveHandler = function (evt) {
    evt.preventDefault();
    self.offsetX = evt.targetTouches[0].pageX - self.startX;
    var lis = outer.getElementsByTagName('li');
    var i = self.idx - 1;
    var m = i + 3;
    for (; i < m; i++) {
      if (lis[i]) {
        lis[i].style.webkitTransition = '-webkit-transform 0s ease-out';
      }
      if (lis[i]) {
        lis[i].style.webkitTransform = 'translate3d(' + ((i - self.idx) * self.scaleW + self.offsetX) + 'px, 0, 0)';
      }
    }
  };

  var endHandler = function (evt) {
    evt.preventDefault();
    var boundary = scaleW / 6;
    var endTime = new Date() * 1;
    var lis = outer.getElementsByTagName('li');
    if (endTime - self.startTime > 300) {
      if (self.offsetX >= boundary) {
        self.goIndex('-1');
      } else if (self.offsetX < -boundary) {
        self.goIndex('+1');
      } else {
        self.goIndex('0');
      }
    } else {
      if (self.offsetX > 50) {
        self.goIndex('-1');
      } else if (self.offsetX < -50) {
        self.goIndex('+1');
      } else {
        self.goIndex('0');
      }
    }
  };

  var orientationHandler = function (evt) {
    console.log(arguments);
  };

  window.addEventListener('orientationchange', orientationHandler);
  outer.addEventListener('touchstart', startHandler);
  outer.addEventListener('touchmove', moveHandler);
  outer.addEventListener('touchend', endHandler);
};