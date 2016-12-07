(function () {
    'use strict';

    angular
        .module('app')
        .controller('gameController', gameController);

    function gameController($scope, $timeout) {

        //Keeps track of how many moves the computer has made
        var computerMoveCount;

        //Object called 'coord' is a coordinate, with a row and a column
        function coord(row, col) { this.row = row; this.col = col; }

        //Self-executing 'newGame' function, executed when the page initially loads and when the new game button is pressed
        ($scope.newGame = function () {
            //The global array 'grid' has three arrays (rows) within it, each containing the value of that square
            //The value of a square can be 'X' or 'O' when it is occupied, or '-' when it is empty
            $scope.grid = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
            //The global variable 'player'  keeps track of whose turn it currently is
            $scope.player = "X";
            //The global variable 'gameStatus' keeps track of the status of the game, e.g. if it is a draw, or a player has won
            $scope.gameStatus = "";
            computerMoveCount = 1;
            //After a half-second delay, X (the computer) plays their first move in square (0,0)
            $timeout(function () { $scope.grid[0][0] = "X"; $scope.player = "O"; }, 500);
        })();

        //'squareClicked' is called when a (human) user clicks a square on the grid.
        //If it is their turn, they clicked on an empty square, and the game is still in play,
        //then place a 'O' in that square, and after a half-second delay, call 'compMove'.
        $scope.squareClicked = function (row, col) {
            if ($scope.gameStatus == "" && $scope.player == "O" && $scope.grid[row][col] == "-") {
                $scope.grid[row][col] = "O";
                //Could check for human winner here, but not necessary because it will never happen
                $scope.player = "X";
                $timeout(function () { compMove(); $scope.player = "O"; }, 500);
            }
        }

        //Determines the optimal move for the computer to make, and makes that move.
        function compMove() {
            computerMoveCount++;
            //If a line can be completed to win the game, do so
            if (canCompleteAnyLine("X")) { $scope.gameStatus = "Computer won!"; return; }
            //Otherwise, if it is the computer's 5th move, the game is a draw
            if (computerMoveCount == 5) $scope.gameStatus = "Draw!";
            //Otherwise, if the opponent can form a line next turn, block them
            if (canCompleteAnyLine("O")) return;
            //Otherwise, determine the correct move to play dependent on the current board layout
            if (computerMoveCount == 2) {
                if ($scope.grid[1][1] == "O") $scope.grid[2][2] = "X";
                else if ($scope.grid[0][1] == "-" && $scope.grid[0][2] == "-" && $scope.grid[2][1] == "-") $scope.grid[0][2] = "X";
                else $scope.grid[2][0] = "X";
            }
            else if ($scope.grid[0][2] == "X" && $scope.grid[1][0] == "-" && $scope.grid[2][0] == "-") $scope.grid[2][0] = "X";
            else if ($scope.grid[2][0] == "X" && $scope.grid[0][1] == "-" && $scope.grid[0][2] == "-") $scope.grid[0][2] = "X";
            else $scope.grid[2][2] = "X";
            //Some board layouts are not directly accounted for, as they will all be handled through blocking and winning moves
        }

        //Returns true if the computer can complete any line or block any opponent's line (depending on which piece is passed in), returns false otherwise
        function canCompleteAnyLine(piece) {
            for (var i = 0; i < 3; i++) {
                if (canCompleteLine(new coord(i, 0), new coord(i, 1), new coord(i, 2), piece)) return true;
                if (canCompleteLine(new coord(0, i), new coord(1, i), new coord(2, i), piece)) return true;
            }
            if (canCompleteLine(new coord(0, 0), new coord(1, 1), new coord(2, 2), piece)) return true;
            if (canCompleteLine(new coord(0, 2), new coord(1, 1), new coord(2, 0), piece)) return true;
            return false;
        }

        //Returns true if the computer can complete or block a particular line, returns false otherwise
        function canCompleteLine(coord1, coord2, coord3, piece) {
            if (lineCombination(coord1, coord2, coord3, piece)) return true;
            if (lineCombination(coord1, coord3, coord2, piece)) return true;
            if (lineCombination(coord2, coord3, coord1, piece)) return true;
            return false;
        }

        //If playing a particular square would complete or block a particular line, the computer makes that move and returns true, returns false otherwise
        function lineCombination(occupied1, occupied2, empty, piece) {
            if ($scope.grid[occupied1.row][occupied1.col] == piece &&
                $scope.grid[occupied2.row][occupied2.col] == piece &&
                $scope.grid[empty.row][empty.col] == "-") {
                $scope.grid[empty.row][empty.col] = "X";
                return true;
            }
            return false;
        }
    }
})();