window.onload = function() {
    const canvas = document.querySelector("#drawingCanvas");
    const newDrawingSession = document.querySelector("#newDrawingSession");
    const addPoints = document.querySelector("#addPoints");
    const addExternalPoint = document.querySelector("#addExternalPoint");
    const drawPolygon = document.querySelector("#drawPolygon");
    const start = document.getElementById("start");

    const sideNavWidth = 257;
    const headerHeight = 104;
    const speed = 250;
    const r = 5;
    const cx = 5;
    const cy = 5;
    let addPoint = false;
    let addExtPoint = false;

    var points = [];
    var external_point;

    newDrawingSession.onclick = function() {
        clearCanvas(canvas);
        points.length = 0;
        addPoint = true;
        addExtPoint = true;
    }

    canvas.onclick = function(event) {
        let x = event.clientX - sideNavWidth;
        let y = event.clientY - headerHeight;

        if (addPoint) {
            points.push(new Point(x, y));
            drawPoint(canvas, x, y, r, cx, cy, "black");
        } else if (addExtPoint) {
            let x = event.clientX - sideNavWidth;
            let y = event.clientY - headerHeight;
            external_point = new Point(x, y);
            drawPoint(canvas, x, y, r, cx, cy, "red");
            addExtPoint = false;
        }
    }

    drawPolygon.onclick = async function() {
        for (let i = 0; i < points.length - 1; i++) {
            await timeout(speed);
            await drawLine(canvas, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        }

        await timeout(speed);
        await drawLine(canvas, points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y);

        addPoint = false;
    }

    addExternalPoint.onclick = function() {
        addPoint = false;
    }

    start.onclick = function() {
        // if 1) orientation_test < 0 : left turn   2) orientation_test = 0 : collinear,   3) orientation_test > 0 : right turn
        function orientation_test(p, q, r) {
            var rez
            rez = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)

            if (rez == 0)
                return 0;
            if (rez > 0)
                return 1;
            else
                return -1;
        }

        function distance(a, b) {
            return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)
        }

        var position_of_closest_point = 0;
        var array_length = points.length;
        var superior_margin, inferior_margin;
        var index, new_array = [];

        // sort points by the polar angle
        // ..........

        // find the point, in the points array, which is closest to the external point
        for (let i = 0; i < array_length; i++)
            if (distance(external_point, points[i]) < distance(external_point, points[position_of_closest_point])) {
                position_of_closest_point = i
            }

            // go through all points in counterclockwise direction to find 
            // the superior_margin: the point for which every other point in the points array is situated to the left of the [external_point, superior_margin] right(dreapta)
        superior_margin = position_of_closest_point;
        while (orientation_test(external_point, points[superior_margin], points[(superior_margin + 1) % array_length]) <= 0) {
            superior_margin = (superior_margin + 1) % array_length;
        }

        // go through all points in clockwise direction to find 
        // the inferior_margin: the point for which every other point in the points array is situated to the right of the [external_point, inferior_margin] right(dreapta)
        inferior_margin = position_of_closest_point;
        while (orientation_test(external_point, points[inferior_margin], points[(array_length + inferior_margin - 1) % array_length]) >= 0) {
            inferior_margin = (array_length + inferior_margin - 1) % array_length;
        }

        // form the new array with the external point, superior_margin point, inferior_margin point 
        // and the points situated between superior_margin point and inferior_margin point in counterclockwise direction
        index = superior_margin
        new_array.push(points[index])
        while (index != inferior_margin) {
            index = (index + 1) % array_length
            new_array.push(points[index])
        }
        new_array.push(external_point)

        // display
        for (let i = 0; i < new_array.length; i++) {
            console.log(new_array[i].x + " " + new_array[i].y);
        }
        console.log()
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