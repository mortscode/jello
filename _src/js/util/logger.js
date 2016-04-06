function logger(str, color, bgColor) {
  let options = {
    color: color,
    bgColor: bgColor
  };

  console.log(`%c[-- ${str} --]`, `color:${options.color}; background-color:${options.bgColor}; padding: 4px 8px;`)
}

function hot(str) {
  logger(str, '#fff', 'tomato');
}

function cool(str) {
  logger(str, '#222', 'skyblue');
}

function luke(str) {
  logger(str, '#222', 'gainsboro');
}

export { hot, cool, luke }
