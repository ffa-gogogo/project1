var sw = 20,  //每一个方块的宽高
    sh = 20,
    tr = 30,//每一行小方块的各数
    td = 30  //列
var snake = null,  //蛇的实例
    food = null,  //食物的实例
    game = null //游戏的实例
function Square(x, y, classname) {
    // 0 0     0 0 
    // 20 0    1 0
    // 40 0    2 0
    this.x = x * sw
    this.y = y * sh
    this.class = classname;
    this.viewContent = document.createElement('div') //方块对应的dom元素
    this.viewContent.className = this.class;
    // console.log(this.viewContent);  
    this.parent = document.getElementById('snake') //方块的父级
}
Square.prototype.create = function () { //创建方块的方法
    this.viewContent.style.position = 'absolute'
    this.viewContent.style.width = sw + 'px'
    this.viewContent.style.height = sh + 'px'
    this.viewContent.style.left = this.x + 'px'
    this.viewContent.style.top = this.y + 'px'
    this.parent.appendChild(this.viewContent);

}
Square.prototype.remove = function () { //删除方块的方法
    this.parent.removeChild(this.viewContent)
}
// snake部分1·
function Snake() {
    this.head = null;
    this.tail = null;
    this.pos = [];
    this.directionNum = {
        left: {
            x: -1,
            y: 0,
            rotate: 0,  //蛇头在不同的方向中要旋转
        },
        right: {
            x: 1,
            y: 0,
            rotate: 180,
            rotateY: 180,
        },
        top: {
            x: 0,
            y: -1,
            rotate: 90,

        },
        bottom: {
            x: 0,
            y: 1,
            rotate: 270,
        }
    }
}
Snake.prototype.init = function () {
    var snakehead = new Square(2, 0, 'snakehead')
    snakehead.create()
    this.head = snakehead;
    this.pos.push([2, 0])  //记录蛇头的位置

    var snakebody1 = new Square(1, 0, 'snakebody')
    snakebody1.create()
    this.pos.push([1, 0])

    var snakebody2 = new Square(0, 0, 'snakebody')
    snakebody2.create()
    this.tail = snakebody2;
    this.pos.push([0, 0])
    // console.log(this.pos);
    snakehead.last = null;
    snakehead.next = snakebody1;
    snakebody1.last = snakehead;
    snakebody1.next = snakebody2;
    snakebody2.last = snakebody1;
    snakebody2.next = null;

    // 给蛇添加一条属性
    this.direction = this.directionNum.right  //默认蛇往右走呢

}

Snake.prototype.getNextPos = function () {
    var nextPos = [
        this.head.x / sw + this.direction.x,  //蛇头要走的下一个点的坐标
        this.head.y / sh + this.direction.y]

    // console.log(nextPos);

    // 下个点是自己，代表撞到了自己，游戏结束  
    // 用下一个点位和this.pos对比，如果能找到就会撞到自己

    var selfCollied = false //是否撞到了自己
    this.pos.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true
        }
    });
    if (selfCollied) {
        console.log('撞身体了');
        this.strategies.die.call(this)
        return;
    }

    // 下个点是围墙，游戏结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[0] > tr - 1 || nextPos[1] > td - 1 || nextPos[1] > tr - 1) {
        console.log('撞墙了');
        this.strategies.die.call(this)
        return;
    }
    // 下个点是食物要吃
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {  //如果成立说明现在蛇头要走的下一个点是食物的那个点
        console.log('吃死你');
        this.strategies.eat.call(this);
        return
    }
    // 下个点什么都不是继续走
    this.strategies.move.call(this)  //使用this指向snake使其能够获取信息
}

// 处理碰撞后要做的事情
Snake.prototype.strategies = {
    move: function (format) { //这个参数用于决定要不要删除最后一个方块   传了这个参数就代表是吃，不传这个参数代表是走
        // console.log(this);

        // 创建一个新的身体（在旧蛇头的位置）
        var newbody = new Square(this.head.x / sw, this.head.y / sh, 'snakebody')

        newbody.next = this.head.next;  //以直接拿body1拿不到 这时head还没有被删除可以用
        newbody.next.last = newbody;
        newbody.last = null;
        this.head.remove()//把旧蛇头从原来的位置删除
        newbody.create()

        // 创建一个新蛇头（蛇头下一个要走到的点）
        var newhead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakehead')


        // 更新链表关系
        newhead.next = newbody;
        newhead.last = null;
        newbody.last = newhead
        newhead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
        newhead.viewContent.style.transform = 'rotateY(' + this.direction.rotateY + 'deg)'
        // 更新坐标
        // this.pos的更新 因为是创建了一个新的newbody代替了头的位置所以原数组需要变动的只有在第0位加入newhead的坐标
        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
        this.head = newhead;
        newhead.create()

        if (!format) {  //如果format的值为false，表示需要删除（除了吃之外的操作）
            this.tail.remove()
            // 更新尾巴
            this.tail = this.tail.last
            // 更新数组
            this.pos.pop()
        }
    },
    eat: function () {
        // console.log('eat');
        this.strategies.move.call(this, true);
        createFood()
        game.score++;
    },
    die: function () {
        // console.log('die');
        game.over()
    }
}
snake = new Snake()



// 创建食物
function createFood() {
    // 实物小方块的随机坐标
    var x = null;
    var y = null;
    var include = true //循环跳出的条件，true表示食物的坐标在蛇身上 false表示不再蛇身上
    while (include) {
        x = Math.round(Math.random() * (td - 1))
        y = Math.round(Math.random() * (tr - 1))
        snake.pos.forEach(function (value) {
            if (x != value[0] && y != value[1]) {
                include = false //满足条件跳出循环
            }
        })
    }

    // 生成实物
    food = new Square(x, y, 'food');
    food.pos = [x, y]  //存储一下生食物的坐标来和蛇头下一个点的坐标对比看看有没有对上
    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px'
        // console.log( foodDom.style.left,foodDom.style.top);
    } else {
        food.create()
    }


}


// 创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snake.init();
    createFood();
    // document.onkeydown = function (ev) {  //不知道为什么这里被弃用了不过能运行
    //     if (ev.which == 37 && snake.direction != snake.directionNum.right) {  //往右走的同时不能往左走
    //         snake.direction = snake.directionNum.left;
    //     } else if (ev.which == 38 && snake.direction != snake.directionNum.bottom) {
    //         snake.direction = snake.directionNum.top;
    //     }
    //     else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
    //         snake.direction = snake.directionNum.right;
    //     }
    //     else if (ev.which == 40 && snake.direction != snake.directionNum.top) {
    //         snake.direction = snake.directionNum.bottom;
    //     }
    // }
    document.addEventListener('keydown', function (ev) {
        console.log(ev.key);
        if (ev.key == 'ArrowLeft' && snake.direction != snake.directionNum.right) {  //往右走的同时不能往左走
            snake.direction = snake.directionNum.left;
        } else if (ev.key == 'ArrowUp' && snake.direction != snake.directionNum.bottom) {
            snake.direction = snake.directionNum.top;
        }
        else if (ev.key == 'ArrowRight' && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        }
        else if (ev.key == 'ArrowDown' && snake.direction != snake.directionNum.top) {
            snake.direction = snake.directionNum.bottom;
        }
    })
    this.start()
}
Game.prototype.start = function () {  //开始游戏
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 200)
}
Game.prototype.pause = function () {
    clearInterval(this.timer)
}
Game.prototype.over = function () {
    clearInterval(this.timer)
    alert('你的得分为' + this.score)
    // 回到最初的状态
    var snakewrap = document.getElementById('snake')
    snakewrap.innerHTML = ''
    snake = new Snake();
    game = new Game();
    var startBtnWrap = document.querySelector('.startbtn')
    startBtnWrap.style.display = 'block';

}
game = new Game();
var startBtn = document.querySelector('.startbtn button')
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none'
    game.init();
}
// 点击暂停
var snakewrap = document.getElementById('snake')
var pauseBtn = document.querySelector('.pausebtn button');
snakewrap.onclick = function () {
    game.pause()
    pauseBtn.parentNode.style.display = 'block'
}

pauseBtn.onclick = function () {
    game.start();
    pauseBtn.parentNode.style.display='none'
}