// Msn12 Task 2

function partition(xs, p) {
    function greater_than_p(x) {
        return (x > p);
    }
    
    var left = filter(function(x) {return (x < p);}, xs);
    var right = filter(greater_than_p, xs);
    return pair(left, right);
}

function quicksort(xs) {
    // Your answer here
    if (is_empty_list(xs) || is_empty_list(tail(xs))) {
        return xs;
    } else {
        var sorted = partition(xs, head(xs));
        return append(append(quicksort(head(sorted)), list(head(xs))),
                                quicksort(tail(sorted)));
    }
}

// Test
var my_list = list(23, 12, 56, 92, -2, 0);
quicksort(my_list);

// Msn14 T1
// Task 1
function sort(b) {
    // Your answer here
    var len = array_length(b);
    for (var i = 0; i < len; i = i + 1 ) {
        for (var j = 0; j < len - i - 1; j = j + 1) {
            if (b[j] > b[j + 1]) {
                swap(j, j + 1, b);    
            } else {
            
            }
        }
    }
}

// Do not modify this function
function swap(left_index, right_index, array) {
    var tmp = array[left_index];
    array[left_index] = array[right_index];
    array[right_index] = tmp;
}

// Msn15
function compareEnemy(enemyA, enemyB) {
    // Your solution here
    if (getPlanarAngle(enemyA) < getPlanarAngle(enemyB)) {
        return -1;
    } else if (getPlanarAngle(enemyA) > getPlanarAngle(enemyB)) {
        return 1;
    } else {
        return 0;
    }
}

function partition(xs, low, high, comparator) {
    // Your solution here
    // reason for pivot (last element): list of enemies is expected to be unsorted, hence 
    // choosing pivot as last element is easy to implement while keeping average running time at O(n log n)
    var pivot = xs[high];
    var j = low;
    for (var i = low; i < high; i = i + 1) {
        if (comparator(xs[i], pivot) !== 1) {
            swap(j, i, xs);
            j = j + 1;
        } else {}
    }
    swap(j, high, xs);
    return j;
}

function swap(i, j, xs) {
    var temp = xs[i];
    xs[i] = xs[j];
    xs[j] = temp;
}

//Example (with last element as pivot, on the entire array):
var enemiesA = [[1, 9], [2, 1], [3, 4], [4, 6]];

// Last element is [4, 6] (our pivot)  
var pivotIndexA = partition(enemiesA, 0, 3, compareEnemy);
display(enemiesA);
display(pivotIndexA);

// Valid values are [[2, 1], [3, 4], [4, 6], [1, 9]]  
// or [[3, 4], [2, 1], [4, 6], [1, 9]]  
//enemiesA;

// Pivot Index is 2, and Pivot value is [4, 6]  
//pivotIndexA;

//Example (with last element as pivot, ignore last 2 elements):  
var enemiesA = [[3, 4], [2, 1], [4, 6], [1, 9]];  

// Last element is [2, 1] (our pivot)  
var pivotIndexA = partition(enemiesA, 0, 1, compareEnemy); 

// Only valid value is [[2, 1], [3, 4], [4, 6], [1, 9]]  
enemiesA;

// Pivot Index is 0, and Pivot value is [2, 1]  
pivotIndexA;

// Path 10B
function count_occurrence(arr) {
    var len = array_length(arr);
    var occ = [];
    for (var i = 0; i < len; i= i + 1) {
        var m = arr[i];
        if (occ[m] !== undefined) {
            occ[m] = occ[m] + 1;
        } else {
            occ[m] = 1;   
        }
    }
    return occ;
}

function count_sort(arr) {
    var occ = count_occurrence(arr);
    var len = array_length(occ);
    var currentNum = 0;
    var j = 0;
    
    function put_in_arr(number, occurrence) {
        if (occurrence > 0) {
            //var temp = arr[j];
            arr[j] = number;
            j = j + 1;
            put_in_arr(number, occurrence - 1);
        } else {
            
        }
    }
    
    for (var i = 0; i < len; i = i+1) {
        if (occ[i] > 0) {
            put_in_arr(i, occ[i]);
        } else {}
    }
}

// Test
var arr = [0, 1, 2, 3, 3, 0, 2];
count_sort(arr);
display(arr);
// It should display [0, 0, 1, 2, 2, 3, 3];