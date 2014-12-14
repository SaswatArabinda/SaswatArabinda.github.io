var config = {
    noOfColumns: 3,
    noOfRows: 4,
    imageRotation: false, // no of rows > no of columns
	count:0
};

// Returns the height of the browser
function getHeight() {
    "use strict";
    if (self.innerHeight) {
        return self.innerHeight;
    }

    if (document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }

    if (document.body) {
        return document.body.clientHeight;
    }
}

// Returns the width of the browser
function getWidth() {
    "use strict";
    var nWidth = 0;
    if (self.innerHeight) {
        nWidth = self.innerWidth;
    } else if (document.documentElement && document.documentElement.clientHeight) {
        nWidth = document.documentElement.clientWidth;
    } else if (document.body) {
        nWidth = document.body.clientWidth;
    }
    return nWidth;
}

function setAspectRatio() {
    var nCurrentBrowserWidth = getWidth();
    var nCurrentBrowserHeight = getHeight();

    //if (config.imageRotation) { 
    //    var containerWidth = ($(window).height() / config.noOfColumns) * config.noOfRows;
    //} else {
    //    var containerWidth = ($(window).height() / config.noOfRows) * config.noOfColumns;
    //}


    if (config.imageRotation) {
        // i.e. No of rows < No of columns
    } else {
        // i.e. No of rows > No of columns
        if (nCurrentBrowserWidth > nCurrentBrowserHeight) {
            // height will be same as the browser height
            //calculate width
            var containerHeight = getHeight();
            var containerWidth = (containerHeight / config.noOfRows) * config.noOfColumns;

        } else {
            // width will be same as the browser width
            //calculate height
            var containerWidth = getWidth();
            var containerHeight = (containerWidth / config.noOfColumns) * config.noOfRows;
        }
    }

    $(".gridLines").css("width", containerWidth + "px");
    $(".gridLines").css("height", containerHeight + "px");

    var tilesWidth = 73 / config.noOfColumns;
    var tilesHeight = 75 / config.noOfRows;

    $(".tiles").css("width", tilesWidth + "%");
    $(".tiles").css("height", tilesHeight + "%");
}

// shuffles the array elements
function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


function createGrid() {
// update count
config.count = 0;
		$(".count").text(config.count);
		
    var myArray = [];//['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    var totalNoOfElements = config.noOfColumns * config.noOfRows;
    for (var i = 1; i < totalNoOfElements; i++) {
        myArray.push(i);
    }

    myArray = shuffle(myArray);
    // generate the div
    $.each(myArray, function (index, value) {
        console.log(index + ": " + value);
        $(".gridLines").append("<div class='tiles' id = " + parseInt(index + 1) + "><span class='value'>" + value + "</span></div>");
    });
    $(".gridLines").append("<div class='tiles empty' id=" + totalNoOfElements + "><span class='value'></span></div>");

    setAspectRatio();

}


// gets the position of the tiles
function getTilePosition(selectedValue) {
    // left most
    var flag = false;
    var tilePos = "";
    var leftMostIndexes = config.noOfColumns + "n+1";
    var leftMostTiles = $(".tiles:nth-child(" + leftMostIndexes + ")");

    // right most
    var rightMostIndexes = config.noOfColumns + "n";
    var rightMostTiles = $(".tiles:nth-child(" + rightMostIndexes + ")");

    //middle
    var middleTiles = $(".tiles:nth-child(3n+2)");


    // check for left most divs
    $.each(leftMostTiles, function (index, value) {
        if ($(this).text() == selectedValue) {
            flag = true;
            console.log("leftMost");
            tilePos = "leftMost";


        }
    });

    // check for left most divs
    $.each(rightMostTiles, function (index, value) {
        if ($(this).text() == selectedValue) {
            flag = true;
            console.log("rightMost");
            tilePos = "rightMost";

        }
    });

    if (!flag) {
        console.log("middle");
        tilePos = "middle";
    }

    return tilePos;

}


$('.gridLines').on('click', '.empty', function (event) {
    event.stopPropagation();
});

$('body').on('click', '.tiles', function () {
    var selectedValue = $(this).text();
    var flag = false;
    var aboveTile = parseInt($(this).attr("id")) - parseInt(config.noOfColumns);
    var belowTile = parseInt($(this).attr("id")) + parseInt(config.noOfColumns);
    var nextTile = parseInt($(this).attr("id")) + parseInt(1);
    var prevTile = parseInt($(this).attr("id")) - parseInt(1);
    var posTo = "";


    var tilePos = getTilePosition(selectedValue);
    if (tilePos == "leftMost") {

        if ($("#" + aboveTile).hasClass("empty") || $("#" + belowTile).hasClass("empty") || $("#" + nextTile).hasClass("empty")) {
            flag = true;
        }
    } else if (tilePos == "rightMost") {

        if ($("#" + aboveTile).hasClass("empty") || $("#" + belowTile).hasClass("empty") || $("#" + prevTile).hasClass("empty")) {
            flag = true;
        }
    } else {
        // middle
        if ($("#" + aboveTile).hasClass("empty") || $("#" + belowTile).hasClass("empty") || $("#" + prevTile).hasClass("empty") || $("#" + nextTile).hasClass("empty")) {
            flag = true;
        }
    }
    if (flag) {
        swap($(this));
    }
	
	// display game count
	config.count = config.count+1;
	$(".count").text(config.count);
	
	// Check if the game ends or not
	var isGameCompleted = gameCompleted();
	if(isGameCompleted){
	$(".successContainer, .successContainerBackground").removeClass("hide");
	
	}
});

function gameCompleted(){
	var myArray = [];//['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
	var flag = true;
    var totalNoOfElements = config.noOfColumns * config.noOfRows;
    for (var i = 1; i < totalNoOfElements; i++) {
        myArray.push(i);
    }
	$.each($(".tiles"),function(index,value){
		if($(this).text != myArray[index]){
			flag = false;
		}
	});

	return flag;
}

function swap(currTile) {
    $(".empty").html("<span class='value'>" + currTile.text() + "</span>");
    currTile.html("<span class='value'></span>");
    $(".empty").removeClass("empty");
    currTile.addClass("empty");
}


$(".restart").click(function(){
	$(".successContainer, .successContainerBackground").addClass("hide");
	    $(".gridLines").text("");
		createGrid();
});

$(document).ready(function (event) {
    createGrid();
});


$(window).on("resize", function (event) {
    setAspectRatio();

});