#!/usr/bin/env node

/*
* Dvorak Programmers Tutorial CLI
* ===============================
* Author: Alistair MacDonald
* Original Lessons: http://gigliwood.com/abcd/lessons/
* Programmer Dvorak Lessons: http://programmer-dvorak.appspot.com/
*/

const keypress = require('keypress');
const clc = require('cli-color');
const fs = require('fs');
const tty = require('tty');
const program = require('commander');
const readline = require('readline');
const {prompt, Select} = require('enquirer');
const pkg = require('./package.json');

const kataMeta = [
  {
    name: 'Tao Te Ching',
    type: 'tao-te-ching',
    dir: '/kata/tao-te-ching',
    description: 'The Tao Te Ching of Lao-tzu',
    url: 'http://www.with.org/tao_te_ching_en.pdf'
  },
  {
    name: 'Proverbs',
    description: 'The Proverbs of King Solomon',
    type: 'proverbs',
    dir: '/kata/proverbs',
    url: 'https://ebible.org/engwebp/'
  }
];

const title = fs.readFileSync(__dirname + '/title.ascii', 'utf8');
const lessonsPath = '/lessons';
let TOC;
let fileToLoad;

program
.version(pkg.version)
.usage('[options] <my-file.txt>')
.action(input => {
  fileToLoad = input;
});

program.parse(process.argv);

function drawKeyboard () {
  const c0 = clc.red;  
  const c1 = clc.white;  
  const c3 = clc.yellow;
  const c4 = clc.green;    
  const c5 = clc.blue;
  
  const layout = [
    '┌───┬───┬───┬───┬───┐   ┌───┬───┬───┬───┬───┐',
    '│\' "│, <│. >│ P │ Y │   │ F │ G │ C │ R │ L │',       
    '├───┼───┼───┼───┼───┤   ├───┼───┼───┼───┼───┤',
    '│ A │ O │ E │ U │ I │   │ D │ H │ T │ N │ S │',       
    '├───┼───┼───┼───┼───┤   ├───┼───┼───┼───┼───┤',
    '│; :│ Q │ J │ K │ X │   │ B │ M │ W │ V │ Z │',       
    '└───┴───┴───┴───┴───┘   └───────────────────┘'
  ];
  
  const keyboard = layout.join('\n')
    .replace(/ Y /,    c0(' Y '))
    .replace(/ I /,    c0(' I '))
    .replace(/ X /,    c0(' X '))
    .replace(/ F /,    c0(' F '))
    .replace(/ D /,    c0(' D '))
    .replace(/ B /,    c0(' B '))

    .replace(/ P /,    c1(' P '))
    .replace(/ U /,    c1(' U '))
    .replace(/ K /,    c1(' K '))
    .replace(/ G /,    c1(' G '))
    .replace(/ H /,    c1(' H '))
    .replace(/ M /,    c1(' M '))
    
    .replace(/\. \>/,  c3('. >'))
    .replace(/ E /,    c3(' E '))
    .replace(/ J /,    c3(' J '))
    .replace(/ C /,    c3(' C '))
    .replace(/ T /,    c3(' T '))
    .replace(/ W /,    c3(' W '))

    .replace(/\, </,   c4(', <'))
    .replace(/ O /,    c4(' O '))
    .replace(/ Q /,    c4(' Q '))
    .replace(/ R /,    c4(' R '))
    .replace(/ N /,    c4(' N '))
    .replace(/ V /,    c4(' V '))

    .replace(/ L /,    c5(' L '))
    .replace(/ S /,    c5(' S '))
    .replace(/ Z /,    c5(' Z '))
    .replace(/' "/,    c5('\' "'))
    .replace(/ A /,    c5(' A '))
    .replace(/\; \:/,  c5('\\ :'))

  console.log(keyboard);
};

const firstLineOf = file => new Promise((resolve, reject) => {
  const lineReader = readline.createInterface({
    input: require('fs').createReadStream(file)
  });

  lineReader.on('line', line => {
    lineReader.close();
    resolve(line)
  });

  lineReader.on('error', e => {
    reject(error);
  });
});

const getLeadLines = dir => new Promise((resolve, reject) => {
  const path = __dirname + dir;
  const files = fs.readdirSync(path).sort();
  const paths = []; 
  const getFirstLines = [];

  files.forEach(function (file, n) {
    const filename = path + '/' + file;
    paths.push(filename);
    getFirstLines.push(firstLineOf(filename));
  });

  return Promise.all(getFirstLines)
    .then(firstLines => {
      const leadLines = files.map((file, idx) => ({
        path: paths[idx],
        leadLine: firstLines[idx]
      }));
      resolve(leadLines);
    })
    .catch(reject);
});

const transformLeads = (leadLines, type) => new Promise((resolve, reject) => {
  try {
    const lessons = leadLines.map((file, index) => {
      const title = file.leadLine;
      const lessonDef = {title, path: file.path};
      return lessonDef;
    });
    resolve(lessons);
  } catch (error) {
    reject(error);
  }
});

const getLessons = () => new Promise((resolve, reject) => {
  getLeadLines(lessonsPath)
    .then(lessons => transformLeads(lessons, 'Lesson'))
    .then(lessons => resolve(lessons))
    .catch(error => console.error(error));
});


const getKatas = () => new Promise((resolve, reject) => {
  const promises = [];
  
  kataMeta.forEach(kata => {
    promises.push(new Promise((resolve, reject) => {
      getLeadLines(kata.dir)
        .then(leadLines => transformLeads(leadLines))
        .then(katas => resolve({[kata.type]: katas}));
    }));
  });
  
  Promise.all(promises).then(results => {
    const katas = {};
    results.forEach(kata => {
      const key = Reflect.ownKeys(kata)[0];
      katas[key] = kata[key];
    });
    resolve(katas);
  }).catch(error => console.error(error));
});

const loadLesson = filename => {
  const content = fs.readFileSync(filename, 'utf8')
  const lines = content.split('\n');
  return lines;
};
  
const start = file => {
  const lines = loadLesson(file);
   beginLesson(lines);
};

function beginLesson (lines) {
  var fail = clc.bgRed.white.bold.underline;
  var pass = clc.green;
  var complete = clc.green.underline;
  var white = clc;
  var green = clc.green;
  var titleStyle = clc.underline;

  // Log the lesson title
  const firstLine = `${lines[0]}`;
  console.log('\n' + titleStyle(firstLine));
  
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

const generateTOC = () => new Promise((resolve, reject) => {
  Promise.all([getLessons(), getKatas()])
  .then(([lessons, katas]) => {
    resolve({lessons, katas});
  }).catch(error => console.error(error));
});

const menu = {
  main: async toc => {
    console.log(title);

    const choices = [
      {
        message: clc.green('Dvorak Typeing Lessons'),
        name: 'lessons'
      }
    ];

    kataMeta.forEach(kata => {
      choices.push({
          name: kata.type,
          message: clc.blue(kata.description)
      });
    });

    choices.push(
      {
        message: clc.yellow('Show Dvorak Keyboard Layout'),
        name: 'keyboard'
      },{
        message: clc.red('Show Help'),
        name: 'help'
    });

    const prompt = new Select({
      name: 'value',
      message: 'Select your experience',
      choices
    });

    const answer = await prompt.run();
    return answer;
  },

  sub: async list => {
    const choices = [];

    list.forEach(file => {
      choices.push({
          message: file.title,
          name: file.path
      });
    });

    const prompt = new Select({
      name: 'value',
      message: 'Choose your beginning',
      limit: 5,
      choices
    });

    const answer = await prompt.run();
    return answer;
  },

  help: () => program.outputHelp(),

  keyboard: () => drawKeyboard()
};

const startWithMenu = () => generateTOC()
  .then(generatedTOC => {
    TOC = generatedTOC;
  })
  .then(menu.main)
  .then(type => {
    if (Reflect.has(menu, type)) {
      return menu[type]();
    }
    
    const list = type === 'lessons' ? TOC.lessons : TOC.katas[type];
    
    menu.sub(list).then(file => {
      start(file);
    })
  });

 
const startWithFile = () => {}

program.keyboard && drawKeyboard();
fileToLoad && 
  startWithFile(fileToLoad) || 
  startWithMenu();