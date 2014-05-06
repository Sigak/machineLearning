    var Model = function() {
      
      
      function getClosestOnes(x, y, matrix, ammount, accuracy) {
        if (!matrix) return;
        x *= 1/accuracy;
        y *= 1/accuracy;
        var xLeft = x, xRight = x, yLeft = y, yRight = y, r = 0;
        var result = [];
        while (result.length < ammount) {
          var newRound = [];
          var maxR = Math.pow(r+1, 2);
          var minR = Math.pow(r, 2);
          for (var i=xLeft; i<=xRight; i++) {
            for (var j=yLeft; j<=yRight; j++) {
              if (!matrix[i][j]) continue;
              var dist = Math.pow(x-i, 2) + Math.pow(y-j, 2);
              if ((minR <= dist) && (dist < maxR)) {
                newRound.push({color: matrix[i][j], distance: (Math.sqrt(dist)/(1/accuracy)).toFixed(5)});
              }
            }
          }
          if (xLeft) xLeft--;
          if (xRight < 1/accuracy) xRight++;
          if (yLeft) yLeft--;
          if (yRight < 1/accuracy) yRight++;
          r++;
          if ((result.length + newRound.length) > ammount) {
            newRound.sort(function (a, b) {return a.distance - b.distance;});
          }
          if (newRound.length) result = result.concat(newRound);
        }
        return result;
      }
      
      
      function countColors(args, ammount) {
        var length = ammount;
        for (var i=0; i<length; i++) {
          while (~args[i].color.indexOf(' ')) {
            args.push({color: args[i].color.slice(0, args[i].color.indexOf(' '))});
            args[i].color = args[i].color.slice(args[i].color.indexOf(' ')+1);
            ammount = args.length;
          }
        }
        var colors = {};
        for (i=0; i<ammount; i++) {
          (colors[args[i].color]++) || (colors[args[i].color]=1);
        }
        var max = 0, color = '';
        for (var key in colors) {
          if (max == colors[key]) color += ' ' + key;
          if (max < colors[key]) color = key;
          max = Math.max(max, colors[key]);
        }
        return color;
      }
      
      
      function predictColor(x, y, options) {
        var axes = options.axes;
        var colors = [];
        for (var axis=1; axis<axes.length; axis++) {
          var ammount = options.neighboursAmount;
          var args = getClosestOnes(x, y, options.matrix[axis-1], ammount, options.accuracy) ||
          options.args.sort(compareDistance);
          while ((args[ammount]) && (args[ammount].distance == args[ammount-1].distance)) ammount++;
          colors[axis-1] = {};
          colors[axis-1].color = countColors(args, ammount);
        }
        function compareDistance(a, b) {
          a.distance = Math.sqrt((a[axes[axis-1]] - x)*(a[axes[axis-1]] - x) + 
                                 (a[axes[axis]] - y)*(a[axes[axis]] - y)).toFixed(5);
          b.distance = Math.sqrt((b[axes[axis-1]] - x)*(b[axes[axis-1]] - x) + 
                                 (b[axes[axis]] - y)*(b[axes[axis]] - y)).toFixed(5);
          return a.distance - b.distance;
        }
        return countColors(colors, colors.length);
      }
      
      
      function learn() {
        var options = [].pop.call(arguments);
        var axes = options.axes; 
        var accuracy = options.accuracy || 0.1;
        accuracy = Math.round(accuracy*100000)/100000;
        var variants = {options: {}};
        variants.options.axes = axes;
        variants.options.neighboursAmount = options.neighboursAmount || 5;
        variants.options.accuracy = accuracy;
        variants.options.args = [];
        for (var i=0; i<arguments.length; i++) variants.options.args.push(Object.create(arguments[i]));
        variants.options.matrix = [];
        for (var axis=1; axis<axes.length; axis++) {
          if ((arguments.length / 2 > variants.options.neighboursAmount) &&
             (variants.options.args.every(function(item) {
            return !(item[axes[axis-1]] * (1/accuracy) % 1 || item[axes[axis-1]] * (1/accuracy) % 1);
          }))) {
            variants.options.matrix[axis-1] = [];
            for (i=0; i<1+1/accuracy; i++) variants.options.matrix[axis-1][i] = [];
            for (i=0; i<arguments.length; i++) {
              variants.options.matrix[axis-1][arguments[i][axes[axis-1]]*(1/accuracy)][arguments[i][axes[axis]]*(1/accuracy)] = arguments[i].color;
            }
          }
        }
        for (var x = 0; x < 1 + accuracy; x = (+((x + accuracy).toFixed(5)))) {
          for (var y = 0; y < 1 + accuracy; y = (+((y + accuracy).toFixed(5)))) {
            var color = predictColor(x, y, variants.options);
            if (!variants[color]) variants[color] = {};
            variants[color][x+', '+y] = true;                       
          }
        }
        return variants;
      }
      
      
      function getColor(obj, variants) {
        var k = obj.x + ', ' + obj.y;
        for (var key in variants) if (variants[key][k]) return key;
        return predictColor(obj.x, obj.y, variants.options);
      }
      
      
      return {
        learn: learn,
        getColor: getColor
      };
    }();
