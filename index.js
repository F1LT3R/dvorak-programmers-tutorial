#!/usr/bin/env node

/*
 * Dvorak Programmers Tutorial CLI
 * ===============================
 * Author: Alistair MacDonald
 * Original Lessons: http://gigliwood.com/abcd/lessons/
 * Programmer Dvorak Lessons: http://programmer-dvorak.appspot.com/
 */

(function () {

  'use strict';
  
  var keypress = require('keypress');
  var clc = require('cli-color');
  var Promise = require('bluebird');
  var fs = require('fs');
  var tty = require('tty');
  var program = require('commander');
  var pkg = require('./package.json');

  var lessonsPath = '/lessons';
  var lessonID;

  program
    .version(pkg.version)
    .usage('[options] <lesson_id>')
    .option('-l, --list', 'List of lessons')
    .option('-k, --keyboard', 'Show Programmers Dvorak keyboard layout')
    .action(function (lesson_id) {
      lessonID = lesson_id;
    });
   
  program.parse(process.argv);

  if (!lessonID) {
    program.outputHelp();
  }
  
  program.keyboard && drawKeyboard();
  program.list && listLessons();
  lessonID && runLesson(lessonID);

  function listLessons () {
    var path = __dirname + lessonsPath;
    var files = fs.readdirSync(path);

    var promises = [];
    files.forEach(function (file, n) {
      var filename = path + '/' + file;
      promises.push(loadLesson(filename));
    });
    Promise.all(promises).then(values => {
      var titles = values.map(lines => {
        var title = lines[0];
        var id = title.split('Lesson ')[1].split(':')[0];
        return title.replace(id, clc.green(id));
      });
      titles.sort();
      titles.forEach(title => { console.log(title);});
    });
  }

  function drawKeyboard () {

    var f0 = clc;  
    var f1 = clc.red;
    var f2 = clc.yellow;
    var f3 = clc.green;
    var f4 = clc.cyan;
    var f5 = clc.magenta;
    var tb = clc;
    
    var layout = [
      // 'MacBook Pro Split Key Layout',
      '┌───┬───┬───┬───┬───┬───┬───┐   ┌───┬───┬───┬───┬───┬───┬───────┐',
      '│~ $│% &│[ 7│{ 5│} 3│( 1│= 9│   │* 0│) 2│+ 4│] 6│! 8│` #│ Bkspc │',             
      '├───┼───┼───┼───┼───┼───┼───┤   ├───┼───┼───┼───┼───┼───┼───────┤',
      '│Tab│; :│, <│. >│ P │ Y │ F │   │ G │ C │ R │ L │/ ?│@ ^│  \\ |  │',       
      '├───┴───┼───┼───┼───┼───┼───┤   ├───┼───┼───┼───┼───┼───┼───────┤',
      '│Cap/Esc│ A │ O │ E │ U │ I │   │ D │ H │ T │ N │ S │- _│ Enter │',       
      '├───────┼───┼───┼───┼───┼───┤   ├───┼───┼───┼───┼───┼───┴───────┤',
      '│ Shift │\' "│ Q │ J │ K │ X │   │ B │ M │ W │ V │ Z │   Shift   │',       
      '├───┬───┼───┼───┼───┴───┴───┴───┴───┴───┴───┼───┴───┼───────────┤',
      '│fn │Ctl│Alt│Cmd│         Space Bar         │  Cmd  │    Alt    │',       
      '└───┴───┴───┴───┴───────────────────────────┴───────┴───────────┘'
    ];
    
    var keyboard = layout.join('\n')
      // Finger 1 Left Hand
      .replace(/\( 1/,   f1('( 1'))
      .replace(/ Y /,    f1(' Y '))
      .replace(/ U /,    f1(' U '))
      .replace(/ K /,    f1(' K '))
      // Finger 1 Right Hand
      .replace(/\) 2/,   f1(') 2'))
      .replace(/ C /,    f1(' C '))
      .replace(/ H /,    f1(' H '))
      .replace(/ M /,    f1(' M '))
      // Finger 0 Left Hand
      .replace(/\= 9/,   f0('= 9'))
      .replace(/ F /,    f0(' F '))
      .replace(/ I /,    f0(' I '))
      .replace(/ X /,    f0(' X '))
      // Finger 0 Right Hand
      .replace(/\* 0/,   f0('* 0'))
      .replace(/ G /,    f0(' G '))
      .replace(/ D /,    f0(' D '))
      .replace(/ B /,    f0(' B '))
      // Finger 2 Left Hand
      .replace(/\} 3/,   f2('} 3'))
      .replace(/ P /,    f2(' P '))
      .replace(/ E /,    f2(' E '))
      .replace(/ J /,    f2(' J '))
      // Finger 2 Right Hand
      .replace(/\+ 4/,   f2('+ 4'))
      .replace(/ R /,    f2(' R '))
      .replace(/ T /,    f2(' T '))
      .replace(/ W /,    f2(' W '))
      // Finger 3 Left Hand
      .replace(/\{ 5/,   f3('{ 5'))
      .replace(/\. \>/,  f3('. >'))
      .replace(/ O /,    f3(' O '))
      .replace(/ Q /,    f3(' Q '))
      .replace(/ Cmd /,  f3(' Cmd '))
      // Finger 3 Right Hand
      .replace(/\] 6/,   f3('} 6'))
      .replace(/ L /,    f3(' L '))
      .replace(/ N /,    f3(' N '))
      .replace(/ V /,    f3(' V '))
      .replace(/Cmd/,    f3('Cmd'))
      // Finger 4 Left Hand
      .replace(/\[ 7/,   f4('{ 5'))
      .replace(/\, </,   f4(', <'))
      .replace(/ A /,    f4(' A '))
      .replace(/' "/,    f4('\' "'))
      .replace(/Alt/,    f4('Alt'))
      // Finger 4 Right Hand
      .replace(/\! 8/,   f4('! 8'))
      .replace(/\/ \?/,  f4('/ ?'))
      .replace(/ S /,    f4(' S '))
      .replace(/ Z /,    f4(' Z '))
      // Finger 5 Left Hand
      .replace(/\% \&/,     f5('% &'))
      .replace(/\; \:/,     f5('\\ :'))
      .replace(/Cap\/Esc/,  f5('Cap\/Esc'))
      .replace(/ Shift /,   f5(' Shift '))
      // Finger 5 Right Hand
      .replace(/\` #/,      f5('` #'))
      .replace(/\@ \^/,     f5('@ ^'))
      .replace(/- _/,       f5('- _'))
      .replace(/  Shift  /, f5('  Shift  '))
      .replace(/   Alt   /, f5('   Alt   '))
      .replace(/Ctl/,       f5('Crl'))
      .replace(/Space Bar/, tb('Space Bar'));

    console.log(keyboard);
  };

  function loadLesson (filename) {
    return new Promise (function (resolve, reject) {
      fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data.split('\n'));
      });
    });
  }

  function loadTextFile (filename) {

  }

  function runLesson (lesson_id) {  
    var lessonFile = __dirname + lessonsPath + '/lesson-' + lesson_id + '.txt';     
    loadLesson(lessonFile)
    .then(function (lesson) {
      beginLesson(lesson);
    }).catch(function (error) {
      
      var lessonFile = lessonID;
      loadLesson(lessonFile)
      .then(function (lesson) {
        beginLesson(lesson);
      })
      .catch(function (error) {
        console.warn(clc.red('Could not load lesson!'));
        console.error(error);
      })
    });
  }
  
  var fail = clc.bgRed.white;
  var pass = clc.bgGreen.black;
  var complete = clc.green.underline;
  var white = clc.white;
  var green = clc.green;
  var title = clc.underline;
  
  function beginLesson (lines) {
    
    // Log the lesson title
    console.log('\n' + title(lines[0]));    
    
    // Remove the lesson title from the lesson lines
    lines.shift();

    var cursorLine = 0;
    var currentLine;
    var cursorColumn = 0;
    var lineErrors= 0;
    var trace = '';
    var totalErrors = 0;
    var start = (+ new Date());

    // Load the first line
    nextLine();

    function nextLine () {
      lineErrors = 0;
      cursorColumn = 0;
      trace = '';
      currentLine = lines[cursorLine];
      console.log(white('\n' + currentLine));

      if (cursorLine === lines.length-1) {
        lessonComplete();
      }
      cursorLine +=1;     
    }

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

    // Begin reading keys
    keypress(process.stdin);

    process.stdin.on('keypress', function (ch, key) {
      if (key && key.hasOwnProperty('name')) {

        // Quit on Ctrl+C        
        if (key && key.ctrl && key.name == 'c') {
          process.stdin.pause();
        }

        var returned = key && key.name === 'return' || false;

        // Ignore keys
        // if (key.name === 'return' || key.name === 'tab') {
        if ( key.name === 'tab') {
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
          
          return;
        }
      }

      if (ch === currentLine[cursorColumn]) {
        if (!returned) {
          process.stdout.write(pass(ch));
          trace += '1';
        }
      } else {
        if (!returned) {
          process.stdout.write('\u0007');
          process.stdout.write(fail(ch));
          lineErrors += 1;
          totalErrors += 1;
          trace += '0';
        }
      }
      if (!returned) {
        cursorColumn += 1;
      }

      // console.log(cursorColumn, currentLine.length, returned);
      if (cursorColumn >= currentLine.length && !lineErrors && returned) {
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
