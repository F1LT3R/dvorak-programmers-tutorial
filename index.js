(function () {

  'use strict';
  
  var keypress = require('keypress');
  var clc = require('cli-color');
  var Promise = require('bluebird');
  var fs = require('fs');
  var tty = require('tty');

  //Number.prototype.pad = function (n) {
    //var v=''+this.valueOf(),
      //l=v.length;
    //return n>l?0..toFixed(n-l).slice(2)+v:v;
  //};

  //var lessonNumber = parseInt(process.argv[2]).pad(2);

  var lessonNumber = process.argv[2];

  function getLesson (file) {
    var filename = './lessons/lesson-' + file + '.txt';

    return new Promise (function (resolve, reject) {
      fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
          return reject(err);
        }
        
        resolve(data);
      });
    });
  }

  getLesson(lessonNumber)
  .then(function (lesson) {
    beginLesson(lesson);
  }).catch(function () {
    console.log(clc.red('Could not load lesson!'));
  });

  var fail = clc.bgRed.white;
  var pass = clc.bgGreen.black;
  var complete = clc.green.underline;
  var white = clc.white;
  var green = clc.green;
  var title = clc.white.underline;
  
  function beginLesson (lesson) {
    var lines = lesson.split('\n');
    console.log('\n' + title(lines[0]));  
    lines.shift();
    var cursorLine = 0;
    var currentLine;
    var cursorColumn = 0;
    var lineErrors= 0;
    var trace = '';
    var totalErrors = 0;
    var start = (+ new Date());


    
    function nextLine () {
      lineErrors = 0;
      cursorColumn = 0;
      trace = '';
      currentLine = lines[cursorLine];
      process.stdout.write('\n');

      console.log(white(currentLine));

      if (cursorLine === lines.length-1) {
        lessonComplete();
      }
      cursorLine +=1;     
    }

    // Load the first line
    nextLine();


    function lessonComplete () {
      var end = (+ new Date());
      var time = end - start;
      var wordCount = lines.join(' ').split(' ').length - 1;
      var msPerWord = time / wordCount;
      var wpm = (60 * 1000 / msPerWord).toFixed(2);

      console.log(complete('Lesson complete!'));
      console.log(white('Total errors: ' + totalErrors));
      console.log(white('Words Per Minute: ' + wpm));
      console.log();
      
      process.stdin.pause();
    }


    keypress(process.stdin);
    process.stdin.on('keypress', function (ch, key) {
      //console.log(key.name);

      if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
      }

      if (key.name === 'return') {
        return;
      }

      if (key.name === 'tab') {
        return;
      }
     
      if (key.name === 'backspace') {
        if (cursorColumn > 0) {
          process.stdout.write(clc.move.left(1));
          process.stdout.write(clc.erase.lineRight);
          cursorColumn -= 1;
          if (trace[cursorColumn] === '0') {
            lineErrors-=1;
          }
          trace = trace.substr(0, trace.length-1);
        }
      } else {
        if (ch === currentLine[cursorColumn]) {
          process.stdout.write(pass(ch));
          trace += '1';
        } else {
          process.stdout.write(fail(ch));
          lineErrors += 1;
          totalErrors += 1;
          trace += '0';
        }
        cursorColumn += 1;
      }

      if (cursorColumn === currentLine.length && !lineErrors) {
        nextLine();
      }
    });

    if (typeof process.stdin.setRawMode == 'function') {
      process.stdin.setRawMode(true);
    } else {
      tty.setRawMode(true);
    }

    process.stdin.resume();
  }

})();
