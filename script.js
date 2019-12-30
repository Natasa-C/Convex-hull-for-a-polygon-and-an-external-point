window.onload = function() {
    const sideNavWidth = 257;
    const headerHeight = 104;

    const canvas = document.querySelector("#drawingCanvas");
    const draw = document.querySelector("#draw");
    const speed = 250;
    const r = 5;
    const cx = 5;
    const cy = 5;

    let points = [];
    var interval;

    canvas.onclick = function(event) {
        let x = event.clientX - sideNavWidth;
        let y = event.clientY - headerHeight;

        points.push(new Point(x, y));

        let newBox = document.createElement("div");
        newBox.setAttribute("class", "circleBox");
        newBox.style.left = x - cx + "px";
        newBox.style.top = y - cy + "px";
        newBox.innerHTML = `<svg id="circle"> <circle r="${5}" cx="5" cy="5"/> </svg>`;
        canvas.appendChild(newBox);
    }

    draw.onclick = async function() {
        for (let i = 0; i < points.length - 1; i++) {
            await timeout(speed);
            await drawLine(canvas, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        }

        await timeout(speed);
        await drawLine(canvas, points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y);
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