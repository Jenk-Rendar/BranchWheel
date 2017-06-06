
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

//    function getRandomColor() {
// 	var letters = '0123456789ABCDEF';
// 	var color = '#';
// 	for (var i = 0; i < 6; i++ ) {
// 	 	color += letters[Math.floor(Math.random() * 16)];
// 	}
// 	return color;
// }

function getRandomColor(id) {
	var Saturation = .75;
	var Brightness = .90;

	var PHI = (1 + Math.sqrt(5))/2;
	var Hue = id * PHI - Math.floor(id * PHI);
	
	var rgbColorObj =  HSVtoRGB(Hue,Saturation,Brightness);
	var rgbColor = [rgbColorObj.r,rgbColorObj.g, rgbColorObj.b];

	return "rgb(" + rgbColor.join(",") + ")";
}

	function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	var randNum = Math.floor(Math.random() * (max - min)) + min;
	return randNum;
}

function getUniqueId(min, max, existingIds){
	var newId = 0;
	do {
	    newId = getRandomInt(min, max);	    
	}
	while (existingIds.indexOf(newId) != -1);
	return newId;
}

function sumArray(input) {
             
	if (toString.call(input) !== "[object Array]")
    	return false;
      
    var total =  0;
    for(var i=0;i<input.length;i++) {                  
        if(isNaN(input[i])){
        	continue;
        }
        total += Number(input[i]);
    }
    return total;
}