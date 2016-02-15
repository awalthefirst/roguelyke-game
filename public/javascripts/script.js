/**
 * Created by ABDUL on 2/7/2016.
 */


window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();
var weapon1 = imageLoader("blocks/blueOrb.png");
var spike = imageLoader('blocks/newspikes.png');
var obstacleBlock = imageLoader("blocks/darkStoneBlock.png");
var enemy = imageLoader("blocks/newblobRight.png");
var health = imageLoader('blocks/newheart.png');
var space = imageLoader("blocks/caveBlock.png");
var char_right = imageLoader("blocks/right_char.png");
var char_left = imageLoader("blocks/left_char.png");
function imageLoader(src) {
  var img = new Image();
  img.src = src;
  return img;
}

function BlockMaker(x, y, type, img) {
  var blockSize = 32;
  this.width = blockSize;
  this.height = blockSize;
  this.type = type;
  this.x = x;
  this.y = y;
  this.gravity = 8;
  this.pull = true;
  this.img = img;
  if (type === 'enemy') {
    this.healthLevel = 100;
  }
  var ctx = gameArea.context;
  ctx.drawImage(img, this.x, this.y);
  this.redraw = function (moves) {
    moves = moves || 0;
    this.x += moves;
    if (this.type === 'enemy') {
      if (this.healthLevel < 0) {
        character.xp += 1;
        gameSystem.gameNextLevel();
        this.resetBlock(space, 'space');
      }
    }
    ctx.drawImage(this.img, this.x, this.y);
  };
}
BlockMaker.prototype.moveBlock = function (arrow, point, extra) {
  var collide = null;
  if (arrow === 'right') {
    this.x += point + 4;
    collide = this.collision('obstacle');
    if (collide.type) {
      if (extra === 'block') {
        gameArea.move += 8;
      } else {
        this.x = (collide.block.x - this.width) + 4;
      }
    }
    this.x -= 4;
  }
  if (arrow === 'left') {
    this.x -= point + 24;
    collide = this.collision('obstacle');
    this.x += 24;
    if (collide.type) {
      this.x = (collide.block.x + this.width);
    }
    
    
  }
  this.itemDetection();
  this.pull = true;
};
BlockMaker.prototype.pullDown = function () {
  if (this.pull) {
    this.y += this.gravity - 6;
    var collide = this.collision('obstacle');
    if (collide.type) {
      this.pull = false;
      this.y = collide.block.y - this.height;
    }
  }
  this.itemDetection()
};
BlockMaker.prototype.pullUp = function () {
  if (this.jump) {
    if (this.currentJump < this.jumpHeight) {
      this.y -= this.gravity;
      var collide = this.collision('obstacle');
      if (collide.type) {
        this.y = collide.block.y + this.height;
        this.currentJump = this.jumpHeight;
        if (this.right_key) {
          this.move('right');
        }
        if (this.left_key) {
          this.move('left');
        }
        
      }
      this.currentJump += 4;
    } else {
      if (this.right_key) {
        this.move('right');
      }
      if (this.left_key) {
        this.move('left');
      }
    }
    
    
    if (this.right_key) {
      this.move('right');
    }
    if (this.left_key) {
      this.move('left');
    }
    if (this.currentJump >= this.jumpHeight) {
      this.jump = false;
      this.pull = true;
      this.currentJump = 0;
    }
  }
  this.itemDetection()
};
BlockMaker.prototype.collision = function (blockType) {
  var self = this;
  var type = false;
  var blk = null;
  var typeArr = [];
  Array.prototype.forEach.call(arguments, function (ele) {
    typeArr.push(ele);
  });
  
  allBlocks.forEach(function (block) {
    if (self.x < block.x + block.width && self.x + self.width > block.x &&
      self.y < block.y + block.height && self.y + self.height > block.y) {
      if (typeArr.indexOf(block.type) > -1) {
        type = true;
        blk = block;
      }
    }
  });
  return {type: type, block: blk};
};
BlockMaker.prototype.resetBlock = function (img, type) {
  this.img = img;
  this.type = type;
};


var gameSystem = {
  gameIsOver: false,
  level: 0,
  gameOver: function () {
    this.gameIsOver = true;
  },
  gameOverText: function () {
    var ctx = gameArea.context;
    ctx.font = "40px Arial";
    ctx.fillStyle = '#99ff66';
    ctx.fillText("Game Over", 350, 220);
    ctx.fillText("Click here to Replay", 305, 280);
  },
  gameReset: function () {
    if (gameSystem.gameIsOver) {
      
      gameSystem.gameIsOver = false;
      gameSystem.level = 0;
      allBlocks = [];
      weaponSystems.firedWeapon = [];
      renderer('initial');
      initCharacter();
      scoreInit()
      
    }
  },
  gameNextLevel: function () {
    var charXp = character.xp;
    if (charXp !== 0) {
      if (charXp % 10 === 0) {
        this.level += 1
      }
    }
    
  }
  
};

var character;
var frameId;
var scoreSystem = {};
var allBlocks = [];
var gameArea = {
  move: 0,
  blockUp: 4,
  blockDown: (15) - 4,
  canvas: document.getElementById('canvas'),
  start: function () {
    this.canvas.width = 960;
    this.canvas.height = 480;
    this.context = this.canvas.getContext('2d');
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  dimension: function () {
    return (this.canvas.width / 32) * (this.canvas.height / 32)
  },
  addBlocks: function () {
    renderer('addBlock')
  },
  initEvents: function () {
    $(document).on('keydown', function (e) {
      if (!gameSystem.gameIsOver) {
        if (e.keyCode === 39) {
          e.preventDefault();
          character.right_key = true;
          character.move('right')
        }
        if (e.keyCode === 37) {
          e.preventDefault();
          character.left_key = true;
          character.move('left')
        }
        if (e.keyCode === 38) {
          e.preventDefault();
          character.up_key = true;
          character.move('jump')
        }
        if (e.keyCode === 32) {
          e.preventDefault();
          weaponSystems.fire();
        }
        
      }
    });
    $(document).on('keyup', function (e) {
      if (!gameSystem.gameIsOver) {
        if (e.keyCode === 39) {
          e.preventDefault();
          character.right_key = false;
        }
        if (e.keyCode === 37) {
          e.preventDefault();
          character.left_key = false;
        }
        if (e.keyCode === 38) {
          e.preventDefault();
          character.up_key = false;
        }
        
      }
    });
    $("#canvas").click(gameSystem.gameReset);
  }
};
var weaponSystems = {
  fire: function () {
    var weapon = this.weapon;
    var fire = new BlockMaker(character.x, character.y, 'weapon', weapon.type);
    fire.direction = character.looking;
    fire.damage = this.weapon.damage;
    this.firedWeapon.push(fire);
  },
  weapon: {type: weapon1, damage: 100},
  firedWeapon: [],
  moveWeapon: function (fired, index) {
    if (fired.direction === 'right') {
      fired.x += 4
    } else {
      fired.x -= 4;
    }
    
    var collide = fired.collision('enemy');
    if (collide.type) {
      this.firedWeapon.splice(index, 1);
      collide.block.healthLevel -= fired.damage;
    } else {
      if (fired.x < 0 || fired.x > gameArea.canvas.width) {
        this.firedWeapon.splice(index, 1)
      }
    }
    
  }
};
var blockPattern = [
  [
    0, 0, 1, 0, 0, 0, 0
  ], [
    0, 0, 0, 0, 0, 1, 0
  ], [
    1, 0, 0, 0, 1, 0, 0
  ], [
    0, 0, 1, 0, 0, 0, 0
  ], [
    1, 0, 0, 0, 1, 0, 0
  ], [
    0, 1, 0, 1, 0, 0, 0
  ], [
    0, 0, 1, 0, 1, 1, 0
  ], [
    0, 0, 0, 0, 0, 0, 0
  ]
];


function initCharacter() {
  character = new BlockMaker(32, 32 * 10, 'character', char_right);
  character.healthLevel = 100;
  character.xp = 0;
  character.looking = 'right';
  character.redraw = function () {
    var ctx = gameArea.context;
    if (this.looking == 'right') {
      ctx.drawImage(char_right, this.x, this.y);
    } else {
      ctx.drawImage(char_left, this.x, this.y);
    }
  };
  character.left_key = false;
  character.right_key = false;
  character.up_key = false;
  character.jump = false;
  character.jumpHeight = (32 * 2) + 2;
  character.currentJump = 0;
  character.move = function (direction) {
    
    if (direction === 'right') {
      this.looking = 'right';
      if (this.x + this.width > (gameArea.canvas.width / 2)) {
        gameArea.addBlocks();
        gameArea.move -= 8;
        character.moveBlock('right', 0, 'block');
      } else {
        character.moveBlock('right', 8);
      }
    }
    
    if (direction === 'left') {
      this.looking = 'left';
      if (this.x > 0) {
        character.moveBlock('left', 8)
      }
    }
    
    if (direction === 'jump') {
      if (!this.pull && this.jump == false) {
        this.jump = true;
        this.pullUp();
      }
    }
    
  };
  character.itemDetection = function () {
    var itemDetection = this.collision('enemy', 'health', 'spike');
    if (itemDetection.type) {
      if (itemDetection.block.type === 'health') {
        this.healthLevel = (this.healthLevel >= 100) ? 100 : this.healthLevel + 5;
        itemDetection.block.resetBlock(space, 'space')
      }
      if (itemDetection.block.type === 'enemy') {
        this.healthLevel -= 10;
        itemDetection.block.resetBlock(space, 'space');
        if (this.healthLevel <= 0) {
          this.healthLevel = 0;
          gameSystem.gameOver();
        }
      }
      if (itemDetection.block.type === 'spike') {
        this.healthLevel -= 1;
        if (this.healthLevel <= 0) {
          this.healthLevel = 0;
          gameSystem.gameOver();
        }
      }
    }
  };
}

function scoreInit() {
  var ctx = gameArea.context;
  scoreSystem.level = 0;
  scoreSystem.redraw = function () {
    ctx.font = "30px Arial";
    ctx.fillStyle = '#99ff66';
    ctx.fillText("level: " + gameSystem.level + "    xp: " + character.xp + "    health: " + character.healthLevel, 300, 64);
  };
  scoreSystem.redraw();
}

function renderer(state) {
  
  var prevBlock_width = 0;
  var prevBlock_height = 0;
  var blockRowUp = gameArea.blockUp;
  var blockRowDown = gameArea.blockDown;
  var loopLength = gameArea.dimension();
  var rand = Math.floor(Math.random() * 7);
  var looper = 0;
  
  if (state === 'initial') {
    draw(loopLength);
  } else {
    
    var lastBlock = allBlocks[allBlocks.length - 1];
    var lastBlock4X = lastBlock.x + lastBlock.width;
    
    if (lastBlock4X < gameArea.canvas.width) {
      prevBlock_width = lastBlock4X;
      draw(45, 'addBlock');
    }
    
  }
  
  function draw(length, extra) {
    
    for (var i = 0; i < length; i++) {
      var block;
      
      if (i >= blockRowUp && i < blockRowDown) {
        
        var pattern = blockPattern[rand];
        var patternCell = pattern[looper];
        if (patternCell) {
          block = new BlockMaker(prevBlock_width, prevBlock_height, 'obstacle', obstacleBlock);
        } else {
          
          var ran = Math.floor(Math.random() * 100);
          
          if (ran === 10 && i > 2) {
            block = new BlockMaker(prevBlock_width, prevBlock_height, 'spike', spike);
          } else if (ran === 50) {
            block = new BlockMaker(prevBlock_width, prevBlock_height, 'health', health);
          } else if (looper === 6 && ran > 90 && i > 2) {
            block = new BlockMaker(prevBlock_width, prevBlock_height, 'enemy', enemy);  //later
          } else {
            block = new BlockMaker(prevBlock_width, prevBlock_height, 'space', space);
          }
          
        }
        
        looper++;
        
      } else {
        block = new BlockMaker(prevBlock_width, prevBlock_height, 'obstacle', obstacleBlock);
      }
      
      prevBlock_height += block.height;
      allBlocks.push(block);
      
      if ((i + 1) % 15 === 0 && i !== 0) {
        prevBlock_width += 32;
        prevBlock_height = 0;
        blockRowDown += 15;
        blockRowUp += 15;
        rand = Math.floor(Math.random() * blockPattern.length);
        looper = 0;
      }
    }
    
    
    if (extra === 'addBlock') {
      allBlocks.splice(0, 15);
    }
  }
  
}

function startGame() {
  gameArea.canvas.style.border = '2px solid red';
  gameArea.start();
  gameArea.initEvents();
  renderer('initial');
  initCharacter();
  scoreInit();
  window.frameId = requestAnimFrame(updateGameArea);
}

function updateGameArea() {
  
  gameArea.clear();
  allBlocks.forEach(function (block) {
    block.redraw(gameArea.move);
  });
  weaponSystems.firedWeapon.forEach(function (fired, index) {
    fired.redraw();
    weaponSystems.moveWeapon(fired, index);
  });
  gameArea.move = 0;
  character.redraw();
  character.pullDown();
  scoreSystem.redraw();
  if (character.jump) {
    character.pullUp();
  }
  frameId = requestAnimFrame(updateGameArea);
  if (gameSystem.gameIsOver) {
    gameSystem.gameOverText();
  }
}

window.onload = startGame;

