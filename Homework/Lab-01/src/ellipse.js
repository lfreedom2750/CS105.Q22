// Initialize
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [255, 184, 224, 255];
var pointRgba = [0, 0, 255, 255];
var lineRgba = [0, 0, 0, 255];
var vlineRgba = [255, 0, 0, 255];

canvas.width = width;
canvas.height = height;

function MidPointEllipsePainter(context, width, height) {
    this.context = context;
    this.imageData = context.createImageData(width, height);
    this.ellipses = [];
    this.width = width;
    this.height = height;

    this.getPixelIndex = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
        return (x + y * this.width) << 2;
    };

    this.setPixel = function(x, y, rgba) {
        var pixelIndex = this.getPixelIndex(x, y);
        if (pixelIndex === -1) return;

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

    this.plot4Points = function(xc, yc, x, y, rgba) {
        this.setPixel(xc + x, yc + y, rgba);
        this.setPixel(xc - x, yc + y, rgba);
        this.setPixel(xc + x, yc - y, rgba);
        this.setPixel(xc - x, yc - y, rgba);
    };

    this.drawEllipse = function(p0, p1, rgba) {
        var xc = p0[0], yc = p0[1];
        var rx = Math.abs(p1[0] - xc);
        var ry = Math.abs(p1[1] - yc);

        if (rx === 0 && ry === 0) {
            this.setPixel(xc, yc, rgba);
            return;
        }

        var rx2 = rx * rx;
        var ry2 = ry * ry;
        var twoRx2 = 2 * rx2;
        var twoRy2 = 2 * ry2;

        var x = 0;
        var y = ry;

        var px = 0;
        var py = twoRx2 * y;

        var d1 = ry2 - rx2 * ry + 0.25 * rx2;

        while (px < py) {
            this.plot4Points(xc, yc, x, y, rgba);

            x++;
            px += twoRy2;

            if (d1 < 0) {
                d1 += ry2 + px;
            } else {
                y--;
                py -= twoRx2;
                d1 += ry2 + px - py;
            }
        }

        var d2 = ry2 * (x + 0.5) * (x + 0.5) +
                 rx2 * (y - 1) * (y - 1) -
                 rx2 * ry2;

        while (y >= 0) {
            this.plot4Points(xc, yc, x, y, rgba);

            y--;
            py -= twoRx2;

            if (d2 > 0) {
                d2 += rx2 - py;
            } else {
                x++;
                px += twoRy2;
                d2 += rx2 - py + px;
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

    this.render = function(startPoint, previewPoint) {
        this.drawBkg(bgRgba);

        // Vẽ các ellipse đã hoàn tất
        for (var i = 0; i < this.ellipses.length; i++) {
            var center = this.ellipses[i][0];
            var edge = this.ellipses[i][1];
            this.drawEllipse(center, edge, lineRgba);

            // chỉ tô điểm đầu
            this.drawPoint(center, pointRgba);
        }

        // Nếu đang có điểm đầu mới chọn
        if (startPoint) {
            this.drawPoint(startPoint, pointRgba);

            // Nếu đang rê chuột thì vẽ preview
            if (previewPoint) {
                this.drawEllipse(startPoint, previewPoint, vlineRgba);
            }
        }

        this.context.putImageData(this.imageData, 0, 0);
    };

    this.clear = function() {
        this.ellipses = [];
        this.drawBkg(bgRgba);
        this.context.putImageData(this.imageData, 0, 0);
    };

    this.clear();
}

var painter = new MidPointEllipsePainter(context, width, height);

// null = đang chờ click điểm đầu
var startPoint = null;

function getPosOnCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return [
        Math.floor((x - bbox.left) * (canvas.width / bbox.width) + 0.5),
        Math.floor((y - bbox.top) * (canvas.height / bbox.height) + 0.5)
    ];
}

function doMouseMove(e) {
    if (startPoint === null) return;

    var p = getPosOnCanvas(e.clientX, e.clientY);
    painter.render(startPoint, p);
}

function doMouseDown(e) {
    if (e.button !== 0) return;

    var p = getPosOnCanvas(e.clientX, e.clientY);

    // Click thứ nhất
    if (startPoint === null) {
        startPoint = p;
        painter.render(startPoint, null);
        return;
    }

    // Click thứ hai
    painter.ellipses.push([startPoint, p]);
    startPoint = null;
    painter.render(null, null);
}

function doKeyDown(e) {
    var keyId = e.keyCode ? e.keyCode : e.which;

    if (keyId === 27) { // ESC
        startPoint = null;
        painter.render(null, null);
    }
}

function doReset() {
    startPoint = null;
    painter.clear();
}

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mousemove", doMouseMove, false);
window.addEventListener("keydown", doKeyDown, false);

var resetButton = document.getElementById("reset");
if (resetButton) {
    resetButton.addEventListener("click", doReset, false);
}