window.onload = function() {
    const canvas = document.querySelector("#drawingCanvas");
    const newDrawingSession = document.querySelector("#newDrawingSession");
    const addPoints = document.querySelector("#addPoints");
    const addExternalPoint = document.querySelector("#addExternalPoint");
    const drawPolygon = document.querySelector("#drawPolygon");
    const start = document.querySelector("#start");

    const sideNavWidth = 257;
    const headerHeight = 104;
    const speed = 250;
    const r = 10;
    const cx = 10;
    const cy = 10;
    let addPoint = false;
    let addExtPoint = false;
    let extPointAdded = false;
    let polygonDrawn = false;
    let inDrawingSession = false;

    var points = [];
    var external_point;

    newDrawingSession.onclick = function() {
        clearCanvas(canvas);
        points.length = 0;
        inDrawingSession = true;
        polygonDrawn = false;
        extPointAdded = false;
    }

    addPoints.onclick = function() {
        if (inDrawingSession && !polygonDrawn)
            addPoint = true;
    }

    canvas.onclick = function(event) {
        if (inDrawingSession) {
            let x = event.clientX - sideNavWidth;
            let y = event.clientY - headerHeight;

            if (addPoint) {
                points.push(new Point(x, y));
                drawPoint(canvas, x, y, r, cx, cy, "black", points.length - 1);
            } else if (addExtPoint) {
                let x = event.clientX - sideNavWidth;
                let y = event.clientY - headerHeight;
                external_point = new Point(x, y);
                drawPoint(canvas, x, y, r, cx, cy, "red", points.length - 1);
                extPointAdded = true;
                addExtPoint = false;
            }
        }
    }

    drawPolygon.onclick = async function() {
        if (inDrawingSession) {
            for (let i = 0; i < points.length - 1; i++) {
                await timeout(speed);
                await drawLine(canvas, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, `${i}_${i + 1}`);
            }

            await timeout(speed);
            await drawLine(canvas, points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y, `${points.length - 1}_${0}`);

            polygonDrawn = true;
            addPoint = false;
            addExtPoint = false;
        }
    }

    addExternalPoint.onclick = function() {
        if (inDrawingSession && !extPointAdded)
            addExtPoint = true;
        addPoint = false;
    }

    start.onclick = async function() {
        if (extPointAdded && polygonDrawn && inDrawingSession) {
            var position_of_closest_point = 0;
            var array_length = points.length;
            var superior_margin, inferior_margin;
            var index, new_array = [];
            let point_speed = 250;
            let line_speed = 500;

            // sort points by the polar angle
            // ..........

            // find the point, in the points array, which is closest to the external point
            let point = document.querySelector(`#point_${0} #circle circle`);
            point.style.fill = "green"
            await timeout(point_speed);
            for (let i = 1; i < array_length; i++) {
                let point = document.querySelector(`#point_${i} #circle circle`);
                point.style.fill = "violet"
                await timeout(point_speed);
                if (await distance(external_point, points[i]) < await distance(external_point, points[position_of_closest_point])) {
                    document.querySelector(`#point_${position_of_closest_point} #circle circle`).style.fill = "black";
                    position_of_closest_point = i;
                    point.style.fill = "green"
                } else {
                    point.style.fill = "black"
                }
                await timeout(point_speed);
            }

            await timeout(line_speed);
            await drawLine(canvas, external_point.x, external_point.y, points[position_of_closest_point].x, points[position_of_closest_point].y, `${-1}_${position_of_closest_point}`);
            await timeout(line_speed);

            // go through all points in counterclockwise direction to find 
            // the superior_margin: the point for which every other point in the points array is situated to the left of the [external_point, superior_margin] right(dreapta)
            superior_margin = position_of_closest_point;
            while (await orientation_test(external_point, points[superior_margin], points[(superior_margin + 1) % array_length]) >= 0) {
                let line1 = document.querySelector(`#line_${-1}_${superior_margin} line`);
                let line2 = document.querySelector(`#line_${superior_margin}_${(superior_margin + 1) % array_length} line`);

                line1.style.stroke = "red";
                line2.style.stroke = "red";

                await drawLine(canvas, external_point.x, external_point.y, points[(superior_margin + 1) % array_length].x, points[(superior_margin + 1) % array_length].y, `${-1}_${(superior_margin + 1) % array_length}`);
                await timeout(line_speed);

                canvas.removeChild(document.querySelector(`#line_${superior_margin}_${(superior_margin + 1) % array_length}`));

                if (superior_margin != position_of_closest_point) {
                    canvas.removeChild(document.querySelector(`#line_${-1}_${superior_margin}`));
                    await timeout(line_speed);
                } else {
                    await timeout(line_speed);
                    line1.style.stroke = "black";
                    await timeout(line_speed);
                }

                superior_margin = (superior_margin + 1) % array_length;
            }

            // go through all points in clockwise direction to find 
            // the inferior_margin: the point for which every other point in the points array is situated to the right of the [external_point, inferior_margin] right(dreapta)
            inferior_margin = position_of_closest_point;
            while (await orientation_test(external_point, points[inferior_margin], points[(array_length + inferior_margin - 1) % array_length]) <= 0) {
                let line1 = document.querySelector(`#line_${-1}_${inferior_margin} line`);
                let line2 = document.querySelector(`#line_${(array_length + inferior_margin - 1) % array_length}_${inferior_margin} line`);

                line1.style.stroke = "red";
                line2.style.stroke = "red";

                await drawLine(canvas, external_point.x, external_point.y, points[(array_length + inferior_margin - 1) % array_length].x, points[(array_length + inferior_margin - 1) % array_length].y, `${-1}_${(array_length + inferior_margin - 1) % array_length}`);
                await timeout(line_speed);

                canvas.removeChild(document.querySelector(`#line_${(array_length + inferior_margin - 1) % array_length}_${inferior_margin}`));
                canvas.removeChild(document.querySelector(`#line_${-1}_${inferior_margin}`));
                await timeout(line_speed);

                inferior_margin = (array_length + inferior_margin - 1) % array_length;
            }

            let line1 = document.querySelector(`#line_${-1}_${inferior_margin} line`);
            line1.style.stroke = "black";

            // Remove points which are not in the convex hull now
            index = (inferior_margin + 1) % array_length;
            while (index != superior_margin) {
                let point = document.querySelector(`#point_${index}`);
                canvas.removeChild(point);
                index = (index + 1) % array_length;
            }

            // form the new array with the external point, superior_margin point, inferior_margin point 
            // and the points situated between superior_margin point and inferior_margin point in counterclockwise direction
            // the new_array will remain sorted by the polar angle
            index = superior_margin;
            new_array.push(points[index])
            while (index != inferior_margin) {
                index = (index + 1) % array_length;
                new_array.push(points[index])
            }
            new_array.push(external_point);

            inDrawingSession = false;
        }
    }

    // button details
    const newSessionButton = document.querySelector("#newDrawingSession");
    const addPointsButton = document.querySelector("#addPoints");
    const addExtPointButton = document.querySelector("#addExternalPoint");
    const drawPolygonButton = document.querySelector("#drawPolygon");

    const newSessionDetails = document.querySelector("#newDrawingSessionDetails");
    const addPointsDetails = document.querySelector("#addPointsDetails");
    const addExtPointDetails = document.querySelector("#addExtPointDetails");
    const drawPolygonDetails = document.querySelector("#drawPolygonDetails");

    newSessionButton.onmouseover = function() {
        newSessionDetails.style.display = "block";
    }

    newSessionButton.onmouseout = function() {
        newSessionDetails.style.display = "none";
    }

    addPointsButton.onmouseover = function() {
        addPointsDetails.style.display = "block";
    }

    addPointsButton.onmouseout = function() {
        addPointsDetails.style.display = "none";
    }

    addExtPointButton.onmouseover = function() {
        addExtPointDetails.style.display = "block";
    }

    addExtPointButton.onmouseout = function() {
        addExtPointDetails.style.display = "none";
    }

    drawPolygonButton.onmouseover = function() {
        drawPolygonDetails.style.display = "block";
    }

    drawPolygonButton.onmouseout = function() {
        drawPolygonDetails.style.display = "none";
    }
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function drawLine(canvas, x1, y1, x2, y2, line_number) {
    return new Promise(resolve => {
        let line_id = `line_${line_number}`;
        canvas.innerHTML += `<svg class="lineBox" id="${line_id}"> <line id="lineStyle" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/> </svg>`;
        resolve();
    });
}

function drawPoint(canvas, x, y, r, cx, cy, color, point_number) {
    let newBox = document.createElement("div");
    newBox.setAttribute("class", "circleBox");
    newBox.setAttribute("id", `point_${point_number}`);
    newBox.style.left = x - cx + "px";
    newBox.style.top = y - cy + "px";
    newBox.innerHTML = `<svg id="circle"> <circle r="${r}" cx="${cx}" cy="${cy}" fill="${color}"/> </svg>`;
    canvas.appendChild(newBox);
}

function clearCanvas(canvas) {
    while (canvas.firstChild)
        canvas.removeChild(canvas.firstChild);
}

// if 1) orientation_test < 0 : left turn   2) orientation_test = 0 : collinear,   3) orientation_test > 0 : right turn
function orientation_test(p, q, r) {
    return new Promise(resolve => {
        resolve((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
    });
}

function distance(a, b) {
    return new Promise(resolve => {
        resolve((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    });
}