// points should be ordered by the polar angle
var points = [{ x: 1, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 2 }, { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 1, y: 3 }, { x: 0, y: 2 }, { x: 0, y: 1 }];
var external_point = { x: -6, y: -6 };

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