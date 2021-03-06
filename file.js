import * as pygame from 'pygame';
import * as np from 'numpy';
import * as random from 'random';
import * as time from 'time';

var _pj;

var colors, columns, densit, powers, randomizer, refresh, rows, rules, showStats, speed, timesofdo, treop;

function _pj_snippets(container) {
  function in_es6(left, right) {
    if (right instanceof Array || typeof right === "string") {
      return right.indexOf(left) > -1;
    } else {
      if (right instanceof Map || right instanceof Set || right instanceof WeakMap || right instanceof WeakSet) {
        return right.has(left);
      } else {
        return left in right;
      }
    }
  }

  container["in_es6"] = in_es6;
  return container;
}

_pj = {};

_pj_snippets(_pj);

timesofdo = 0;
treop = 1;
rows = 250;
columns = 250;
densit = 0.85;
speed = 10000000;
refresh = false;
showStats = false;
randomizer = 1e-10;
powers = {};
rules = {};
colors = {};

function main() {
  var counter, elem, gens, screen;

  try {
    setPowers(powers);
    setColors(colors);
    setRules(rules);
    pygame.init();
    pygame.display.set_caption("Game of Life");
    screen = pygame.display.set_mode([columns, rows]);
    elem = np.full([rows, columns], -1, {
      "dtype": np.dtype("int")
    });
    fillMatrix(elem, powers, densit);
    gens = 3;
    counter = 10;

    while (gens > 0) {
      for (var i = 0, _pj_a = gens; i < _pj_a; i += 1) {
        interact(elem, powers, rules);
        counter -= 1;

        if (refresh || counter === 0) {
          draw(screen, elem, colors);
          counter = 10;
        }
      }

      draw(screen, elem, colors);
      gens = Number.parseInt(input("Generations to run (0 to stop): "));
    }
  } catch (err) {
    console.log("Error:", err);
    pygame.display.quit();
    pygame.quit();
    throw err;
  }
}

function fillMatrix(matrix, powers, density) {
  var cols;
  [rows, cols] = matrix.shape;

  for (var r = 0, _pj_a = rows; r < _pj_a; r += 1) {
    for (var c = 0, _pj_b = cols; c < _pj_b; c += 1) {
      if (c === 0 || c === cols - 1 || r === 0 || r === rows - 1) {
        matrix[r][c] = -1;
      } else {
        if (random.random() < density) {
          matrix[r][c] = random.choice(list(powers.keys()));
        } else {
          matrix[r][c] = -1;
        }
      }
    }
  }
}

function interact(matrix, powers, rules) {
  var cell, cols, matCopy, v;
  matCopy = np.copy(matrix);
  [rows, cols] = matrix.shape;
  cell = np.full([3, 3], -1, {
    "dtype": "int"
  });

  for (var r = 0, _pj_a = rows; r < _pj_a; r += 1) {
    console.log(treop);

    for (var c = 0, _pj_b = cols; c < _pj_b; c += 1) {
      v = -1;

      if (!(c === 0 || c === cols - 1 || r === 0 || r === rows - 1)) {
        cell[0][1] = matCopy[r - 1][c];
        cell[0][0] = matCopy[r - 1][c - 1];
        cell[0][2] = matCopy[r - 1][c + 1];
        cell[1][0] = matCopy[r][c - 1];
        cell[1][1] = matCopy[r][c];
        cell[2][0] = matCopy[r + 1][c - 1];
        cell[2][2] = matCopy[r][c + 1];
        cell[2][1] = matCopy[r + 1][c];
        cell[2][2] = matCopy[r + 1][c + 1];
        v = judge(cell, powers, rules);
      }

      if (random.random() < randomizer) {
        v = random.choice(list(powers.keys()));
      }

      matrix[r][c] = v;
    }
  }
}

function judge(cell, powers, rules) {
  var bug, bugs, center, maxPoints, points, t, tBug, toLive, winners;
  t = 0;
  center = cell[1][1];
  bugs = {};
  winners = [];
  maxPoints = 0;

  for (var row = 0, _pj_a = 3; row < _pj_a; row += 1) {
    for (var col = 0, _pj_b = 3; col < _pj_b; col += 1) {
      treop += 1;
      tBug = cell[row][col];

      if (tBug !== -1) {
        if (_pj.in_es6(tBug, bugs)) {
          bugs[tBug]["c"] += 1;
        } else {
          bugs[tBug] = {
            "c": 1,
            "cond1": false,
            "points": 0,
            "cond2": false
          };
        }
      }
    }
  }

  for (var bug, _pj_c = 0, _pj_a = bugs, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
    bug = _pj_a[_pj_c];
    points = 0;

    for (var oBug, _pj_f = 0, _pj_d = bugs, _pj_e = _pj_d.length; _pj_f < _pj_e; _pj_f += 1) {
      oBug = _pj_d[_pj_f];

      if (_pj.in_es6(oBug, powers[bug]["s"])) {
        points -= bugs[oBug]["c"];
      } else {
        if (_pj.in_es6(oBug, powers[bug]["w"]) || oBug === bug) {
          points += bugs[oBug]["c"];
        }
      }
    }

    bugs[bug]["points"] = points;
  }

  if (center === -1) {
    for (var bug, _pj_c = 0, _pj_a = bugs, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
      bug = _pj_a[_pj_c];

      if (rules["b"]["mns"] <= bugs[bug]["c"] && bugs[bug]["c"] <= rules["b"]["mxs"]) {
        bugs[bug]["cond1"] = true;
      } else {
        bugs[bug]["cond1"] = false;
      }

      points = bugs[bug]["points"];

      if (rules["b"]["mnp"] <= points && points <= rules["b"]["mxp"]) {
        bugs[bug]["cond2"] = true;
      } else {
        bugs[bug]["cond2"] = false;
      }

      if (rules["b"]["type"] === "and") {
        if (bugs[bug]["cond1"] && bugs[bug]["cond2"]) {
          winners.append(bug);
          maxPoints = max(points, maxPoints);
        }
      } else {
        if (rules["b"]["type"] === "or") {
          if (bugs[bug]["cond1"] || bugs[bug]["cond2"]) {
            winners.append(bug);
            maxPoints = max(points, maxPoints);
          }
        }
      }
    }
  } else {
    bug = center;
    toLive = true;

    if (rules["d"]["mns"] <= bugs[bug]["c"] && bugs[bug]["c"] <= rules["d"]["mxs"]) {
      toLive = false;
    }

    if (toLive || rules["d"]["type"] === "and") {
      points = bugs[bug]["points"];

      if (rules["d"]["mnp"] <= points && points <= rules["d"]["mxp"]) {
        toLive = false;
      } else {
        toLive = true;
      }
    }

    if (toLive) {
      if (rules["l"]["mns"] <= bugs[bug]["c"] && bugs[bug]["c"] <= rules["l"]["mxs"]) {
        toLive = true;
      } else {
        toLive = false;
      }

      if (toLive || rules["l"]["type"] === "or") {
        points = bugs[bug]["points"];

        if (rules["l"]["mnp"] <= points && points <= rules["l"]["mxp"]) {
          toLive = true;
        } else {
          toLive = false;
        }
      }
    }

    if (toLive) {
      winners.append(bug);
    }
  }

  if (winners.length === 0) {
    return -1;
  } else {
    if (winners.length === 1) {
      return winners[0];
    } else {
      for (var bug, _pj_c = 0, _pj_a = winners, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
        bug = _pj_a[_pj_c];

        if (bugs[bug]["points"] === maxPoints) {
          return bug;
        }
      }
    }
  }
}

function setRules(rules) {
  rules["d"] = {
    "type": "or",
    "mns": 0,
    "mxs": 2,
    "mnp": -10,
    "mxp": -3
  };
  rules["l"] = {
    "type": "and",
    "mns": 3,
    "mxs": 5,
    "mnp": -3,
    "mxp": 10
  };
  rules["b"] = {
    "type": "and",
    "mns": 2,
    "mxs": 5,
    "mnp": 1,
    "mxp": 10
  };
}

function draw(screen, matrix, colors) {
  var cols, draw, surf;
  draw = np.zeros([matrix.shape[0], matrix.shape[1], 3]);
  [rows, cols] = matrix.shape;

  for (var r = 0, _pj_a = rows; r < _pj_a; r += 1) {
    for (var c = 0, _pj_b = cols; c < _pj_b; c += 1) {
      draw[r][c] = colors[matrix[r][c]];
    }
  }

  surf = pygame.surfarray.make_surface(draw);
  screen.blit(surf, [0, 0]);
  pygame.display.update();
  pygame.event.pump();
}

function setPowers(powers) {
  powers[0] = {
    "s": [6, 7, 8, 9, 10],
    "w": [1, 2, 3, 4, 5]
  };
  powers[1] = {
    "s": [0, 2, 3, 4, 5],
    "w": [1, 2, 3, 4, 5]
  };
  powers[2] = {
    "s": [0, 3, 4, 5, 6],
    "w": [1, 7, 8, 9, 10]
  };
  powers[3] = {
    "s": [0, 7, 8, 9, 10],
    "w": [1, 2, 4, 5, 6]
  };
  powers[4] = {
    "s": [0, 3, 5, 6, 7],
    "w": [1, 2, 8, 9, 10]
  };
  powers[5] = {
    "s": [0, 3, 6, 7, 8],
    "w": [1, 2, 4, 9, 10]
  };
  powers[6] = {
    "s": [1, 3, 8, 9, 10],
    "w": [0, 2, 4, 5, 7]
  };
  powers[7] = {
    "s": [1, 2, 6, 9, 10],
    "w": [0, 3, 4, 5, 8]
  };
  powers[8] = {
    "s": [1, 2, 4, 7, 9],
    "w": [0, 3, 5, 6, 10]
  };
  powers[9] = {
    "s": [1, 2, 4, 5, 10],
    "w": [0, 3, 6, 7, 8]
  };
  powers[10] = {
    "s": [1, 2, 4, 5, 8],
    "w": [0, 3, 6, 7, 9]
  };
}

function setColors(colors) {
  colors[0] = [204, 0, 0];
  colors[1] = [255, 162, 51];
  colors[2] = [231, 255, 0];
  colors[3] = [125, 255, 51];
  colors[4] = [0, 204, 37];
  colors[5] = [51, 255, 199];
  colors[6] = [0, 185, 255];
  colors[7] = [51, 88, 255];
  colors[8] = [74, 0, 204];
  colors[9] = [236, 51, 255];
  colors[10] = [255, 0, 139];
  colors.slice(-1)[0] = [0, 0, 0];
}

function setColors2(colors) {
  colors[0] = [7, 171, 246];
  colors[1] = [0, 214, 206];
  colors[2] = [0, 229, 163];
  colors[3] = [0, 240, 124];
  colors[4] = [0, 248, 91];
  colors[5] = [0, 253, 63];
  colors[6] = [255, 0, 0];
  colors[7] = [0, 253, 21];
  colors[8] = [47, 249, 8];
  colors[9] = [128, 242, 0];
  colors[10] = [188, 231, 0];
  colors.slice(-1)[0] = [0, 0, 0];
}

if (__name__ === "__main__") {
  main();
}
