// Initialize
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [255, 184, 224, 255];
var pointRgba = [0, 0, 255, 255];
var lineRgba = [0, 0, 0, 255];
var vlineRgba = [255, 0, 0, 255];

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

function MidPointPainter(context, width, height) {
    this.context = context;
    this.imageData = context.createImageData(width, height);
    this.points = [];      // chỉ giữ điểm đầu đang chọn
    this.circles = [];     // lưu các đường tròn đã vẽ
    this.width = width;
    this.height = height;

    this.getPixelIndex = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return -1;
        return (x + y * this.width) << 2;
    };

    this.setPixel = function(x, y, rgba) {
        let pixelIndex = this.getPixelIndex(x, y);
        if (pixelIndex == -1) return;
        for (var i = 0; i < 4; i++) {
            this.imageData.data[pixelIndex + i] = rgba[i];
        }
    };

    this.drawPoint = function(p, rgba) {
        var x = p[0];
        var y = p[1];
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                this.setPixel(x + i, y + j, rgba);
            }
        }
    };

    this.drawCircle = function(p0, p1, rgba) {
        var x0 = p0[0], y0 = p0[1];
        var x1 = p1[0], y1 = p1[1];

        var r = Math.round(Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)));

        var x = 0;
        var y = r;
        var d = 1 - r;

        while (x <= y) {
            this.setPixel(x0 + x, y0 + y, rgba);
            this.setPixel(x0 - x, y0 + y, rgba);
            this.setPixel(x0 + x, y0 - y, rgba);
            this.setPixel(x0 - x, y0 - y, rgba);
            this.setPixel(x0 + y, y0 + x, rgba);
            this.setPixel(x0 - y, y0 + x, rgba);
            this.setPixel(x0 + y, y0 - x, rgba);
            this.setPixel(x0 - y, y0 - x, rgba);

            x++;

            if (d < 0) {
                d = d + 2 * x + 1;
            } else {
                y--;
                d = d + 2 * x + 1 - 2 * y;
            }
        }
    };

    this.drawBkg = function(rgba) {
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.setPixel(i, j, rgba);
            }
        }
    };

    this.clear = function() {
        this.points = [];
        this.circles = [];
        this.drawBkg(bgRgba);
        this.context.putImageData(this.imageData, 0, 0);
    };

    this.draw = function(p) {
        this.drawBkg(bgRgba);

        // Vẽ các đường tròn đã chốt
        for (var i = 0; i < this.circles.length; i++) {
            var center = this.circles[i][0];
            var edge = this.circles[i][1];

            this.drawCircle(center, edge, lineRgba);

            // Chỉ tô điểm đầu tiên, không tô điểm thứ hai
            this.drawPoint(center, pointRgba);
        }

        // Vẽ điểm đầu hiện tại
        if (this.points.length === 1) {
            this.drawPoint(this.points[0], pointRgba);

            // Preview khi rê chuột
            if (p && p[0] >= 0 && p[1] >= 0) {
                this.drawCircle(this.points[0], p, vlineRgba);
            }
        }

        this.context.putImageData(this.imageData, 0, 0);
    };

    this.clear();
}

var state = 0; // 0: waiting first point, 1: previewing
var painter = new MidPointPainter(context, width, height);

function getPosOnCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return [
        Math.floor((x - bbox.left) * (canvas.width / bbox.width) + 0.5),
        Math.floor((y - bbox.top) * (canvas.height / bbox.height) + 0.5)
    ];
}

function doMouseMove(e) {
    if (state !== 1) return;

    var p = getPosOnCanvas(e.clientX, e.clientY);
    painter.draw(p);
}

function doMouseDown(e) {
    if (e.button !== 0) return;

    var p = getPosOnCanvas(e.clientX, e.clientY);

    // Click thứ nhất: chọn tâm
    if (state === 0) {
        painter.points = [p];
        state = 1;
        painter.draw(p);
        return;
    }

    // Click thứ hai: chốt đường tròn rồi quay về chờ hình mới
    if (state === 1) {
        painter.circles.push([painter.points[0], p]);

        painter.points = [];
        state = 0;

        painter.draw([-1, -1]);
        return;
    }
}

function doKeyDown(e) {
    var keyId = e.keyCode ? e.keyCode : e.which;

    if (keyId === 27) { // ESC
        painter.points = [];
        state = 0;
        painter.draw([-1, -1]);
    }
}

function doReset() {
    state = 0;
    painter.clear();
}

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mousemove", doMouseMove, false);
window.addEventListener("keydown", doKeyDown, false);

var resetButton = document.getElementById("reset");
resetButton.addEventListener("click", doReset, false);