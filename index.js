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
  
const start = (file, list, index) => {
	let callback;
	if (index === list.length - 1) {
		callback = () => {
			console.log('Well done!');
			process.stdin.pause();
		}
	} else {
		callback = () => {
			const nextIndex = parseInt(index) + 1;
			const nextFile = list[nextIndex];
			start(nextFile, list, nextIndex);
		}
	}
	const lines = loadLesson(file.path);
	beginLesson(lines, callback);
};

function beginLesson (lines, callback) {
  var fail = clc.bgRed.white;
  var pass = clc.green;
  var complete = clc.green.underline;
  var white = clc;
	let dim = clc.magenta;
  var green = clc.green;
  var titleStyle = clc.cyan.underline;
  
  // Extra line so test ends in correct place
  lines.push('');

  // Log the lesson title
  const firstLine = `${lines[0]}`;
  console.log('\n' + titleStyle(firstLine));
  
  // Remove the lesson title from the lesson lines
  lines.shift();

  let cursorLine = 0;
  let currentLine;
  let cursorColumn = 0;
  let lineErrors= 0;
  let trace = '';
  let totalErrors = 0;
  let start = (+ new Date());

  // Load the first line
  nextLine();

  function nextLine () {
    lineErrors = 0;
    cursorColumn = 0;
    trace = '';
    currentLine = lines[cursorLine];
    console.log(white('\n' + currentLine.replace(/\s/g, dim('⠐')) + dim('¬')));
	
	process.stdout.write(dim('_'));

    if (cursorLine === lines.length-1) {
    //if (cursorLine === 1) {
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

    console.log();
    console.log(complete('Lesson complete!'));
    console.log(white('Total errors: ' + totalErrors));
    console.log(white('Words Per Minute: ' + wpm));
	console.log();
	process.stdin.removeListener('keypress', onKeyPress);
	callback();
  }

	// Begin reading keys
	keypress(process.stdin);
	function onKeyPress (ch, key) {
		const cols = process.stdout.columns;
		const atEdge = cursorColumn > 0 && cursorColumn % cols >= cols -1;
		//atEdge && console.log('edge');
    	if (key && key.hasOwnProperty('name')) {

      // Quit on Ctrl+C        
      if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
      }

      var returned = key && key.name === 'return' || false;

      // Ignore keys
      // if (key.name === 'return' || key.name === 'tab') {
      if (key.name === 'tab') {
        return;
      }
		const modCol = cursorColumn % cols;
		const byEdge = cursorColumn > 0 && modCol > cols -2;
		const edge = cursorColumn > 0 && modCol === 0;
		const preEdge = cursorColumn > 0 && modCol < cols;
		//edge && console.log('edge');
		//adEdge && console.log('atEdge');
		//byEdge && console.log('byEdge');
      if (key.name === 'backspace') {
        if (cursorColumn > 0) {
			if (byEdge) {
			  process.stdout.write(clc.move.left(1));
			  process.stdout.write(clc.erase.lineRight);
			  process.stdout.write(dim('_'));
			} else if (atEdge) {
			  process.stdout.write(clc.move.left(1));
			} else if (preEdge) {
			  process.stdout.write(clc.move.left(2));
			  process.stdout.write(clc.erase.lineRight);
			  process.stdout.write(clc.erase.lineRight);
			  process.stdout.write(dim('_'));
			}
		  }

          cursorColumn -= 1;
		    if (trace[cursorColumn] === '0') {
            lineErrors-=1;
          }
          trace = trace.substr(0, trace.length-1);
       
        
        return;
      }
    }

    if (ch === currentLine[cursorColumn]) {
      if (!returned) {
		  if (cursorColumn % process.stdout.columns === 0 &&
		  		cursorColumn > 0) {
			  process.stdout.write('\n');
		  }
			!atEdge && process.stdout.write(clc.move.left(1));
		  process.stdout.write(clc.erase.lineRight);
        process.stdout.write(pass(ch).replace(/\s/, dim('⠐')));
		!atEdge && process.stdout.write(dim('_'));
        trace += '1';
      }
    } else {
      if (!returned) {
        process.stdout.write('\u0007');
        process.stdout.write(clc.move.left(1));
		process.stdout.write(clc.erase.lineRight);
        process.stdout.write(fail(ch));
		process.stdout.write(dim('_'));
        lineErrors += 1;
        totalErrors += 1;
        trace += '0';
      }
    }
    if (!returned) {
      cursorColumn += 1;
    }

	if (cursorColumn >= currentLine.length && !lineErrors && returned) {
          process.stdout.write(clc.move.left(1));
		  process.stdout.write(clc.erase.lineRight);
		process.stdout.write(dim('¬'));
		nextLine();
	}
  };
	process.stdin.on('keypress', onKeyPress);
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
        message: clc.green('Dvorak Typing Lessons'),
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

    list.forEach((file, idx) => {
      choices.push({
          message: file.title,
          name: String(idx)
      });
    });

    const prompt = new Select({
      name: 'value',
      message: 'Choose your beginning',
      limit: 5,
      choices
	});

    const idx = await prompt.run();
	const file = list[idx];
    return [file, idx];
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

    menu.sub(list).then(([file, idx]) => {
      start(file, list, idx);
    })
  });

 
const startWithFile = () => {}

program.keyboard && drawKeyboard();
fileToLoad && 
  startWithFile(fileToLoad) || 
  startWithMenu();
