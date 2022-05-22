from fileinput import filename
import pygame
import numpy as np
import random
import time

# # Settings
rows = 200
columns = 355
scale = 3.0
densit = 0.85
refresh = False
showStats = False
randomizer = 0.00002
messer = 0.01
powers = {}  # Powers - will call setPowers from main()
rules = {}  # Rules for dying, living, being born - will call setRules from main()
colors = {}  # Colors - will call setColors from main()


def main():
    iterCounter = 0
    fileCounter = 0
    fileName = "gameoflife"
    try:
        counter = 1
        setPowers(powers)
        setColors(colors)
        setRules(rules)
        pygame.init()
        pygame.display.set_caption("Game of Life")
        screen = pygame.display.set_mode((columns*scale, rows*scale))
        elem = np.full([rows, columns], -1, dtype=np.dtype("int"))
        fillMatrix(elem, powers, densit)
        gens = 1
        while gens > 0:
            for i in range(gens):
                draw(screen, elem, colors)
                interact(elem, powers, rules)
                iterCounter += 1
                if(iterCounter % 10 == 0):
                    name = fileName + ("00000"+str(fileCounter))[-5:] + ".jpg"
                    draw(screen, elem, colors, name)
                    fileCounter += 1
            gens = int(input("Generations to run (0 to stop): "))

    except Exception as err:
        print("Error:", err)
        pygame.display.quit()
        pygame.quit()
        raise (err)


def fillMatrix(matrix, powers, density):
    rows, cols = matrix.shape
    for r, row in enumerate(matrix):
        for c, col in enumerate(row):
            if c == 0 or c == cols-1 or r == 0 or r == rows-1:
                matrix[r][c] = -1
            else:
                if random.random() < density:
                    matrix[r][c] = random.choice(list(powers.keys()))
                else:
                    matrix[r][c] = -1


def gomesser(matrix):
    print("Messing")
    matCopy = np.copy(matrix)
    rows, cols = matrix.shape
    for r in range(rows):
        for c in range(cols):
            r = random.randint(0, 3)
            if (r == 0):
                matrix[r][c] = matCopy[c % rows][r % cols]
            if (r == 2):
                matrix[r][c] = matCopy[r][r % cols]
            else:
                matrix[r][c] = matCopy[c % rows][c]


def interact(matrix, powers, rules):
    matCopy = np.copy(matrix)
    rows, cols = matrix.shape
    cell = np.full((3, 3), -1, dtype="int")
    for r in range(rows):
        # if random.random() < messer:
        #    gomesser(matrix)
        for c in range(cols):
            v = -1
            if not(c == 0 or c == cols-1 or r == 0 or r == rows-1):
                cell[0][0] = matCopy[r-1][c-1]
                cell[0][1] = matCopy[r-1][c]
                cell[0][2] = matCopy[r-1][c+1]
                cell[1][0] = matCopy[r][c-1]
                cell[1][1] = matCopy[r][c]
                cell[1][2] = matCopy[r][c+1]
                cell[2][0] = matCopy[r+1][c-1]
                cell[2][1] = matCopy[r+1][c]
                cell[2][2] = matCopy[r+1][c+1]
                v = judge(cell, powers, rules)
            if random.random() < randomizer:
                v = random.choice(list(powers.keys()))
            matrix[r][c] = v


def judge(cell, powers, rules):
    center = cell[1][1]
    bugs = {}
    winners = []
    maxPoints = 0
    for row in range(3):
        for col in range(3):
            tBug = cell[row][col]
            if tBug != -1:
                if tBug in bugs:
                    bugs[tBug]["c"] += 1
                else:
                    bugs[tBug] = {"c": 1, "cond1": False,
                                  "points": 0, "cond2": False}
    for bug in bugs:
        points = 0
        for oBug in bugs:
            if oBug in powers[bug]["s"]:
                points -= bugs[oBug]["c"]
            elif oBug in powers[bug]["w"] or oBug == bug:
                points += bugs[oBug]["c"]
        bugs[bug]["points"] = points

    if center == -1:
        for bug in bugs:
            # Tests for same type around
            if rules["b"]["mns"] <= bugs[bug]["c"] <= rules["b"]["mxs"]:
                bugs[bug]["cond1"] = True
            else:
                bugs[bug]["cond1"] = False

            # Tests for points
            points = bugs[bug]["points"]
            if rules["b"]["mnp"] <= points <= rules["b"]["mxp"]:
                bugs[bug]["cond2"] = True
            else:
                bugs[bug]["cond2"] = False

            # Test for meeting the conditions
            if rules["b"]["type"] == "and":
                if bugs[bug]["cond1"] and bugs[bug]["cond2"]:
                    winners.append(bug)
                    maxPoints = max(points, maxPoints)
            elif rules["b"]["type"] == "or":
                if bugs[bug]["cond1"] or bugs[bug]["cond2"]:
                    winners.append(bug)
                    maxPoints = max(points, maxPoints)
    else:
        bug = center
        # Tests if it should die
        toLive = True
        if rules["d"]["mns"] <= bugs[bug]["c"] <= rules["d"]["mxs"]:
            toLive = False
        if toLive or rules["d"]["type"] == "and":
            points = bugs[bug]["points"]
            if rules["d"]["mnp"] <= points <= rules["d"]["mxp"]:
                toLive = False
            else:
                toLive = True

        # Tests if it should remain alive
        if toLive:
            if rules["l"]["mns"] <= bugs[bug]["c"] <= rules["l"]["mxs"]:
                toLive = True
            else:
                toLive = False
            if toLive or rules["l"]["type"] == "or":
                points = bugs[bug]["points"]
                if rules["l"]["mnp"] <= points <= rules["l"]["mxp"]:
                    toLive = True
                else:
                    toLive = False

        # Final decision
        if toLive:
            winners.append(bug)

    if len(winners) == 0:
        return -1
    elif len(winners) == 1:
        return winners[0]
    else:
        for bug in winners:
            if bugs[bug]["points"] == maxPoints:
                return bug


def setRules(rules):
    # d = Rules for dying; l = Rules for reamining alive; b = Rules for being born
    # t = type - "or"-any of the three conditions below; "and"-all of the conditions below
    # mns = minimun of the same; mxs = maximun of the same
    # mnp = minimun points; mxp = maximun points
    rules["d"] = {"type": "or", "mns": 0, "mxs": 3, "mnp": -10, "mxp": 0}
    rules["l"] = {"type": "and", "mns": 3, "mxs": 5, "mnp": -3, "mxp": 10}
    rules["b"] = {"type": "and", "mns": 4, "mxs": 5, "mnp": 4, "mxp": 10}


def draw(screen, matrix, colors, filename=False):
    cols, rows = matrix.shape
    draw = np.zeros((rows, cols, 3))
    for r in range(rows):
        for c in range(cols):
            draw[r][c] = colors[matrix[c][r]]
    surf = pygame.surfarray.make_surface(draw)
    if filename:
        pygame.image.save(surf, filename)
    surf = pygame.transform.scale(surf, (rows*scale, cols*scale))
    screen.blit(surf, (0, 0))
    pygame.display.update()
    pygame.event.pump()


def setPowers(powers):
    # "s"trongers and "w"eakers
    powers[0] = {"s": [6, 7, 8, 9, 10], "w": [1, 2, 3, 4, 5]}
    powers[1] = {"s": [0, 2, 3, 4, 5], "w": [1, 2, 3, 4, 5]}
    powers[2] = {'s': [0, 3, 4, 5, 6], 'w': [1, 7, 8, 9, 10]}
    powers[3] = {'s': [0, 7, 8, 9, 10], 'w': [1, 2, 4, 5, 6]}
    powers[4] = {'s': [0, 3, 5, 6, 7], 'w': [1, 2, 8, 9, 10]}
    powers[5] = {'s': [0, 3, 6, 7, 8], 'w': [1, 2, 4, 9, 10]}
    powers[6] = {'s': [1, 3, 8, 9, 10], 'w': [0, 2, 4, 5, 7]}
    powers[7] = {'s': [1, 2, 6, 9, 10], 'w': [0, 3, 4, 5, 8]}
    powers[8] = {'s': [1, 2, 4, 7, 9], 'w': [0, 3, 5, 6, 10]}
    powers[9] = {'s': [1, 2, 4, 5, 10], 'w': [0, 3, 6, 7, 8]}
    powers[10] = {'s': [1, 2, 4, 5, 8], 'w': [0, 3, 6, 7, 9]}


def setRules(rules):
    # d = Rules for dying; l = Rules for reamining alive; b = Rules for being born
    # t = type - "or"-any of the three conditions below; "and"-all of the conditions below
    # mns = minimun of the same; mxs = maximun of the same
    # mnp = minimun points; mxp = maximun points
    rules["d"] = {"type": "or", "mns": 0, "mxs": 2, "mnp": -10, "mxp": 0}
    rules["l"] = {"type": "and", "mns": 3, "mxs": 5, "mnp": 0, "mxp": 10}
    rules["b"] = {"type": "and", "mns": 3, "mxs": 6, "mnp": 2, "mxp": 10}


def setColors(colors):
    colors[0] = (204, 0, 0)
    colors[1] = (255, 162, 51)
    colors[2] = (231, 255, 0)
    colors[3] = (125, 255, 51)
    colors[4] = (0, 204, 37)
    colors[5] = (51, 255, 199)
    colors[6] = (0, 185, 255)
    colors[7] = (51, 88, 255)
    colors[8] = (74, 0, 204)
    colors[9] = (236, 51, 255)
    colors[10] = (255, 0, 139)
    colors[-1] = (0, 0, 0)  # Color where there is no life


def setColors2(colors):
    colors[0] = (7, 171, 246)
    colors[1] = (0, 214, 206)
    colors[2] = (0, 229, 163)
    colors[3] = (0, 240, 124)
    colors[4] = (0, 248, 91)
    colors[5] = (0, 253, 63)
    colors[6] = (255, 0, 0)
    colors[7] = (0, 253, 21)
    colors[8] = (47, 249, 8)
    colors[9] = (128, 242, 0)
    colors[10] = (188, 231, 0)
    colors[-1] = (0, 0, 0)  # Color where there is no life


if __name__ == "__main__":
    main()
