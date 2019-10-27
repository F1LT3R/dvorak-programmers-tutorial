const keypress = require("keypress");
const clc = require("cli-color");
const cliCursor = require('cli-cursor');
 
cliCursor.show();

const cols = process.stdout.columns;
console.log(cols);
for (var i = 0;  i< cols; i++) {
    process.stdout.write(String(i % 10));
}

const str = "Which wrist watches are Swiss wrist watches?";

const fill = str => {
    // str.split()
    const r = str.match(new RegExp(`.{1,${cols}}`, 'g'));
    console.log(r);
    for (let i in r) {
        console.log(r[i]);
    }
}

fill(str);

let x = 0;
let y = 0;

const noPrint = [
    'backspace'
];

// const write = (ch, name) => {
//     if (noPrint.includes(ch) ||
//         noPrint.includes(name)) {
//         return;
//     }
//     process.stdout.write(ch);
// }


const allowedChars = [
    'a', 'b'
]

let line = [];

const write = (ch, col) => {
    if (allowedChars.includes(ch)) {
        const output = col ? col(ch) : ch;
        process.stdout.write(output);
        line.push(output);
        x = x + 1;
        return true;
    }
}

const backspace = () => {
    const len = line[line.length - 1].length;
    // line.pop();
}

keypress(process.stdin);
function onKeyPress(ch, key) {
    if (key && key.hasOwnProperty("name")) {
        if (key && key.ctrl && key.name == "c") {
          process.stdin.pause();
        }

        const modX = x % cols;

        switch(key.name) {
            case 'backspace':
                if (x > 0) {
                    process.stdout.write(clc.move.left(1));
                    process.stdout.write(clc.erase.lineRight);
                    backspace();
                    x -= 1;
                }
                break;
            default:
                if (modX === cols - 2) { // end col
                    write(ch, clc.red);
                } else if (modX === cols - 1) { // end col
                    write(ch, clc.blue);
                } else {
                    write(ch);
                }
        }
    }
}

process.stdin.on("keypress", onKeyPress);

if (typeof process.stdin.setRawMode == "function") {
  process.stdin.setRawMode(true);
} else {
  tty.setRawMode(true);
}

process.stdin.resume();
