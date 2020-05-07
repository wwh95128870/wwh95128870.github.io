var clicks = 0;
var lastClick = [0, 0];
var inputLineArray = [];
var blockArray ;
    //x1,y1,x2,y2,blockType 0=cut,touchCount
 
var pin;
var gamelose = 0;
var score = 0;
var maxScore = 2;


var defaultPenColor = "#00f";
var defaultPenColorLose = "#FFA500";
var defaultPenWidth = 6;

var ctx;

//resources
var img_pin_cyan;
var img_pin_red;

function init(c,b,p) {
    ctx = c;
    blockArray = b;
    pin = p
    document.getElementById('canvas').addEventListener('click', drawLine, false);
    document.getElementById('canvas').addEventListener('ontouchstart', drawLine, false);
    img_pin_cyan = document.getElementById('pin_cyan');
    img_pin_red = document.getElementById('pin_red');
    drawBlock(ctx, 7);
    drawPin();
}

function restart() {
    clicks = 0;
    lastClick = [0, 0];
    inputLineArray = [];
    blockArray = [
        //x1,y1,x2,y2,blockType 0=cut,touchCount
        [10, 20, 500, 700, 0, 0],
        [500, 10, 1, 300, 1, 0],
    ]; 
    gamelose = 0;
    score = 0;
    redraw()
}




function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (isNaN(x) || isNaN(y)) {
        return false;
    } else {
        if (x1 >= x2) {
            if (!(x2 <= x && x <= x1)) { return false; }
        } else {
            if (!(x1 <= x && x <= x2)) { return false; }
        }
        if (y1 >= y2) {
            if (!(y2 <= y && y <= y1)) { return false; }
        } else {
            if (!(y1 <= y && y <= y2)) { return false; }
        }
        if (x3 >= x4) {
            if (!(x4 <= x && x <= x3)) { return false; }
        } else {
            if (!(x3 <= x && x <= x4)) { return false; }
        }
        if (y3 >= y4) {
            if (!(y4 <= y && y <= y3)) { return false; }
        } else {
            if (!(y3 <= y && y <= y4)) { return false; }
        }
    }
    return true;
}

function intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  };


function drawBlock(canvas, width) {
    canvas.lineWidth = width;
    score = 0;
    for (var i = 0; i < blockArray.length; i++) {
        canvas.beginPath();
        canvas.moveTo(blockArray[i][0], blockArray[i][1]);
        canvas.lineTo(blockArray[i][2], blockArray[i][3]);
        if (blockArray[i][4] == 0) {  //correctEdge
            if (blockArray[i][5] == 0) {//untouch
                canvas.strokeStyle = "#000";
            } else if (blockArray[i][5] == 1) {//touch once
                canvas.strokeStyle = "#0f0";
                if(!gamelose){score +=1;}
                    
            } else {
                canvas.strokeStyle = "#f00"; //touch more than once
                score = 0;
            }
        }

        if (blockArray[i][4] == 1) { //worngEdge
            if (blockArray[i][5] == 0) {//untouch
                canvas.strokeStyle = "#000";
            } else {//touch once or more
                canvas.strokeStyle = "#f00";
            }
        }

        canvas.stroke();
    }
}

function getCursorPosition(e) {
    var x;
    var y;

    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return [x, y];
}

function drawLines(context) {
    for (var i = 0; i < inputLineArray.length; i++) {
        context.beginPath();
        context.moveTo(inputLineArray[i][0], inputLineArray[i][1]);
        context.lineTo(inputLineArray[i][2], inputLineArray[i][3], defaultPenWidth);
        context.strokeStyle = gamelose? defaultPenColorLose : defaultPenColor;
        context.stroke();
    }
}

function drawPin(){
    for(var i = 0 ; i < pin.length ; i++){
        if(pin[i][2] == 0){
            ctx.drawImage(img_pin_cyan, pin[i][0]-20, pin[i][1]-20,40,40);
        }else{
            ctx.drawImage(img_pin_red, pin[i][0]-20, pin[i][1]-20,40,40);
        }
        
    }
}

function drawLine(e) {
    context = this.getContext('2d');
    x = getCursorPosition(e)[0] * 1000 / document.getElementById("canvas").clientWidth - this.offsetLeft;
    y = getCursorPosition(e)[1] * 1000 / document.getElementById("canvas").clientHeight - this.offsetTop;
    x = x.toFixed(0);
    y = y.toFixed(0);

    if (clicks != 1) {
        clicks++;
    } else {
        context.beginPath();
        context.moveTo(lastClick[0], lastClick[1]);
        context.lineTo(x, y, defaultPenWidth);
        inputLineArray.push([lastClick[0], lastClick[1], x, y])
        context.strokeStyle = gamelose? defaultPenColorLose : defaultPenColor;
        context.stroke();
        redraw()
    }
    console.log(inputLineArray);

    lastClick = [x, y];


};



function checkBlockCollision(blockArray, inputLineArray) {
    for (var i = 0; i < blockArray.length; i++) {
        var intersection = 0
        for (var j = 0; j < inputLineArray.length; j++) {
            if (intersects(blockArray[i][0], blockArray[i][1], blockArray[i][2], blockArray[i][3], inputLineArray[j][0], inputLineArray[j][1], inputLineArray[j][2], inputLineArray[j][3])) {
                intersection += 1;
            }
        }
        blockArray[i][5] = intersection;
    }
}

function checkSelfCollision(inputLineArray) {
    for (var i = 0; i < inputLineArray.length - 1; i++) {
        var intersection = 0
        for (var j = 1; j < inputLineArray.length; j++) {
            if (intersects(inputLineArray[i][0], inputLineArray[i][1], inputLineArray[i][2], inputLineArray[i][3], inputLineArray[j][0], inputLineArray[j][1], inputLineArray[j][2], inputLineArray[j][3])) {
                intersection += 1;
            }
        }
        if (intersection > 0) {
            //alert("Colliision");
            gamelose = 1;
        }
    }
}




function redraw() {
    //ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    checkBlockCollision(blockArray, inputLineArray);
    checkSelfCollision(inputLineArray);
    drawBlock(ctx, 7);
    drawPin();
    drawLines(ctx);

    document.getElementById('score').innerText = score;
    if(score == maxScore){
        document.getElementById('score').innerText = "you win";
    }
}

function undo() {
    line = inputLineArray.pop();
    lastClick[0] = line[0];
    lastClick[1] = line[1];
    redraw();
}

