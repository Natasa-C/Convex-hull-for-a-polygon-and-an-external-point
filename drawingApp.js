window.onload = function () {
    const canvas = document.querySelector("#drawingCanvas");
    const newDrawingSession = document.querySelector("#newDrawingSession");
    const addPoints = document.querySelector("#addPoints");
    const addExternalPoint = document.querySelector("#addExternalPoint");
    const drawPolygon = document.querySelector("#drawPolygon");

    const sideNavWidth = 257;
    const headerHeight = 104;
    const speed = 250;
    const r = 5;
    const cx = 5;
    const cy = 5;
    let addPoint = false;
    let addExtPoint = false;
    let points = [];

    newDrawingSession.onclick = function () {
        clearCanvas(canvas);
        points.length = 0;
        addPoint = true;
        addExtPoint = true;
    }

    canvas.onclick = function (event) {
        let x = event.clientX - sideNavWidth;
        let y = event.clientY - headerHeight;

        if (addPoint) {
            points.push(new Point(x, y));
            drawPoint(canvas, x, y, r, cx, cy, "black");
        }
        else if (addExtPoint) {
            let x = event.clientX - sideNavWidth;
            let y = event.clientY - headerHeight;
            drawPoint(canvas, x, y, r, cx, cy, "red");
            addExtPoint = false;
        }
    }

    drawPolygon.onclick = async function () {
        for (let i = 0; i < points.length - 1; i++) {
            await timeout(speed);
            await drawLine(canvas, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        }

        await timeout(speed);
        await drawLine(canvas, points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y);

        addPoint = false;
    }

    addExternalPoint.onclick = function () {
        addPoint = false;
    }
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function drawLine(canvas, x1, y1, x2, y2) {
    return new Promise(resolve => {
        canvas.innerHTML += `<svg id="lineBox"> <line id="lineStyle" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/> </svg>`;
        resolve();
    });
}

function drawPoint(canvas, x, y, r, cx, cy, color) {
    let newBox = document.createElement("div");
    newBox.setAttribute("class", "circleBox");
    newBox.style.left = x - cx + "px";
    newBox.style.top = y - cy + "px";
    newBox.innerHTML = `<svg id="circle"> <circle r="${r}" cx="${cx}" cy="${cy}" fill="${color}"/> </svg>`;
    canvas.appendChild(newBox);
}

function clearCanvas(canvas) {
    while (canvas.firstChild)
        canvas.removeChild(canvas.firstChild);
}