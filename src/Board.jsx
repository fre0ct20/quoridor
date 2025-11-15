import { useState } from "react";
import Square from './Square.jsx';
import WallPlaceholder from './WallPlaceholder.jsx';
import Wall from './Wall.jsx';
import Pawn from './Pawn.jsx';
import './Board.css';

// -------------------
// -----------------
// 17*17 グリッドの初期状態定義
// ------------------------------------
const createEmptyGrid = () => {
    // 17*17の配列の初期化(すべて0 = 空)
    const grid = Array(17).fill(null).map(() => Array(17).fill(0));

    return grid;
};

// ------------------------------------
// ボードをコンポーネント本体
// ------------------------------------
const Board = () => {

    // 過去のゲーム履歴を保存する配列
    const [history, setHistory] = useState([
        {
            p1Pos: {r: 0, c: 8}, // P1の初期位置
            p2Pos: {r: 16, c: 8}, // P2の初期位置
            placedWalls: [], // 壁の状態
            turn: 1,
            p1Walls: 10, // P1の壁の初期枚数
            p2Walls: 10, // P2の壁の初期枚数
        }
    ]);

    const [currentMove, setCurrentMove] = useState(0); // 履歴の現在の位置

    // 現在の状態を履歴から取得する
    const currentState = history[currentMove];
    const {p1Pos, p2Pos, placedWalls, turn, p1Walls, p2Walls} = currentState;

    // mode, winner, wallStartPosはゲームの進行状態とは別に保持
    const [mode, setMode] = useState('move'); // move or wall
    const [winner, setWinner] = useState(0); // 勝利したプレイヤーを管理するState(0: 継続中, 1: P1勝利, 2: P2勝利)
    const [wallStartPos, setWallStartPos] = useState(null); // 壁配置の最初のクリック座標を記憶するState

    // ---------------------------------
    // 描画用のgridを、p1Posとp2Posから動的に生成
    // ---------------------------------
    const getCurrentGrid = () => {
        const newGrid = createEmptyGrid();

        // 設置済みの壁を反映させる
        placedWalls.forEach(wall => {
            const {r: repR, c: repC, isHorizontal} = wall;

            // 専有する3マスを計算
            const wallCoords = isHorizontal ? [
                {r: repR, c: repC - 1}, {r: repR, c: repC}, {r: repR, c: repC + 1}
            ] : [
                {r: repR - 1, c: repC}, {r: repR, c: repC}, {r: repR + 1, c: repC}
            ];

            // グリッドに書き込む(3: 水平, 4: 垂直)
            const wallValue = isHorizontal ? 3 : 4;

            wallCoords.forEach(({r: wr, c: wc}) => {
                // 範囲内のマスにのみ壁を設置
                if (wr >= 0 && wr <= 16 && wc >= 0 && wc <= 16) {
                    newGrid[wr][wc] = wallValue;
                }
            });
        });

        // プレイヤーの最新の位置を反映
        newGrid[p1Pos.r][p1Pos.c] = 1;
        newGrid[p2Pos.r][p2Pos.c] = 2;

        return newGrid;
    }

    // 盤面の情報を保持する配列
    const grid = getCurrentGrid();

    console.log(`grid=${grid}`); // デバック用

    // コマの移動処理
    const handleMove = (nextR, nextC) => {
        // modeがmove出なかったら何もしない
        if(mode !== 'move' || winner != 0) return;
        
        // nextR, nextCがコママスであるかチェック
        if (nextR % 2 !== 0 || nextC % 2 !== 0) {
            console.log("コマはマスにのみ移動可能");
            return;
        }

        // 現在の状態をcurrentStateから各変数に格納
        const {p1Pos, p2Pos, p1Walls, p2Walls, turn} = currentState;
        const currentPos = turn === 1 ? p1Pos : p2Pos;
        const opponentPos = turn === 1 ? p2Pos : p1Pos;

        // 現在のプレイヤーの位置を特定
        const nextP1Pos = turn === 1 ? {r: nextR, c: nextC} : p1Pos;
        const nextP2Pos = turn === 2 ? {r: nextR, c: nextC} : p2Pos;
        const nextTurn = turn === 1 ? 2 : 1;

        // 動かすコマの位置
        const {r: currentR, c: currentC} = currentPos;

        // 相手のコマの位置
        const {r: oppR, c: oppC} = opponentPos;

        // 移動距離のチェック
        const dr = Math.abs(nextR - currentR);
        const dc = Math.abs(nextC - currentC);

        // 壁によるブロックチェック(移動先と移動元の間に壁があるか)
        const wallR = currentR + (nextR - currentR) / 2;
        const wallC = currentC + (nextC - currentC) / 2;

        // 通常の移動
        const isBasicMove = (dr === 2 && dc === 0) || (dr === 0 && dc === 2);

        // 勝利判定を実行
        const p1NextR = turn === 1 ? nextR : p1Pos.r;
        const p2NextR = turn === 2 ? nextR : p2Pos.r;

        // ---------------------------------
        // 通常移動の処理
        // ---------------------------------
        // 有効な基本移動であれば、位置を更新しターン交代
        if (isBasicMove) {

            // 移動先に壁が設定されているかチェック
            if (grid[wallR][wallC] > 2) {
                console.log('壁にブロックされています!');
                return;
            };

            // 移動先に他のコマがあるかチェック
            if (grid[nextR][nextC] !== 0) {
                console.log('ほかのコマがあります!');
                return;
            };
            
            // 勝利判定
            if (checkWinCondition(p1NextR, p2NextR)) {
                return;
            }

            // ゲーム履歴を更新
            updateHistory(
                {p1: nextP1Pos, p2: nextP2Pos},
                {p1: p1Walls, p2: p2Walls},
                nextTurn,
                placedWalls
            );

            setMode('move');
            return;
        }

        // ---------------------------------
        // ジャンプ移動の処理
        // ---------------------------------
        // ジャンプする条件: 移動距離が4マスか直線移動であること
        const isJumpMove = (dr === 4 && dc === 0) || (dr === 0 && dc === 4);

        if (isJumpMove) {
            // 現在値と移動先の中間の位置
            const middleR = currentR + (nextR - currentR) / 2;
            const middleC = currentC + (nextC - currentC) / 2;

            // 自身と移動先の間に相手のコマがあるか
            if (middleR !== oppR || middleC !== oppC) {
                console.log("相手のコマがないためジャンプ移動不可");
                return;
            }

            // 相手のコマと自分のコマの間に壁がないこと
            const wallToOpponentR = currentR + (oppR - currentR) / 2;
            const wallToOpponentC = currentC + (oppC - currentC) / 2;

            if (grid[wallToOpponentR][wallToOpponentC] > 2) {
                console.log("相手と自分のコマの間に壁がありジャンプ不可");
                return;
            }

            // 飛び越えた先のマスの前に壁がないか確認
            const wallBeyondOpponentR = oppR + (nextR - oppR) / 2;
            const wallBeyondOpponentC = oppC + (nextC - oppC) / 2;

            if (grid[wallBeyondOpponentR][wallBeyondOpponentC] > 2) {
                console.log("相手を飛び越えた先に壁があるため、ジャンプ不可");
                return;
            }

            // 勝利判定
            if (checkWinCondition(p1NextR, p2NextR)) {
                return;
            }

            // ゲーム履歴を更新
            updateHistory(
                {p1: nextP1Pos, p2: nextP2Pos},
                {p1: p1Walls, p2: p2Walls},
                nextTurn,
                placedWalls
            );

            setMode('move');
            return;
        }

        // 斜めジャンプの条件: 移動距離が2マスでRとCが両方2離れている
        const isDiagonalMove = (dr === 2 && dc === 2);

        if (isDiagonalMove) {
            // 相手のコマの位置
            const {r: oppR, c: oppC} = opponentPos;

            // 自分と相手のコマの中間マス
            const centerR = currentR + (oppR - currentR) / 2;
            const centerC = currentC + (oppC - currentC) / 2;

            // 相手のコマが隣接しているか
            const isOpponentAdjacent = Math.abs(currentR - oppR) === 2 || Math.abs(currentC - oppC) === 2;

            // 相手のコマが直線状に存在するか
            let opponentIsInStarightLine = false;
            
            if (isOpponentAdjacent) {
                // 相手のコマが直線状にいる場合の座標 (r, c)
                if (currentR === oppR && Math.abs(currentC - oppC) === 2) {
                    opponentIsInStarightLine = true;
                } else if (currentC === oppC && Math.abs(currentR - oppR) === 2) {
                    opponentIsInStarightLine = true;
                }
            }

            // 直線ジャンプがブロックされているかチェック
            let isStraightBlocked = false;

            // 飛び越え先の座標を計算
            const beyondOppR = oppR + (oppR - currentR);
            const beyondOppC = oppC + (oppC - currentC);

            // 飛び越え先と相手のコマの間のかべ
            const wallBeyondOpponentR = oppR + (beyondOppR - oppR) / 2;
            const wallBeyondOpponentC = oppC + (beyondOppC - oppC) / 2;

            // 飛び越え先に壁がある。または盤面外の場合、直線はブロックされている
            if (opponentIsInStarightLine) {
                if (beyondOppR < 0 || beyondOppR > 16 || beyondOppC < 0 || beyondOppC > 16) {
                    isStraightBlocked = true;
                } else if (grid[wallBeyondOpponentR][wallBeyondOpponentC] > 2) {
                    isStraightBlocked = true;
                }
            }

            // 斜め移動の判定
            if (opponentIsInStarightLine && isStraightBlocked) {

                // 現在値から着地マスまでの間の壁マス
                const wallToNextR = currentR + (nextR - currentR) / 2;
                const wallToNextC = currentC + (nextC - currentC) / 2;

                if(grid[wallToNextR][wallToNextC] > 2) {
                    console.log("斜め移動先に壁があり、移動不可");
                    return;
                }

                // 勝利判定
                if (checkWinCondition(p1NextR, p2NextR)) {
                    return;
                }

                // ゲーム履歴を更新
                updateHistory(
                    {p1: nextP1Pos, p2: nextP2Pos},
                    {p1: p1Walls, p2: p2Walls},
                    nextTurn,
                    placedWalls
                );

                setMode('move');
                return;
            }
        }


        // どちらの移動にも該当しない場合
        console.log("無効な移動");
    };

    // ---------------------------------
    // 壁の設置処理
    // ---------------------------------
    const handleWallPlacement = (r, c) => {
        if (mode !== 'wall' || winner !== 0) return;
        
        // クリックされたのが細い線であることの確認
        if ((r % 2 === 0 && c % 2 === 0) || (r % 2 === 1 && c % 2 === 1)) {
            console.log("このマスは壁の設置できないますです。");
            setWallStartPos(null);
            return;
        }

        // 1回目のクリックの場合(起点の設定)
        if (!wallStartPos) {
            setWallStartPos({r, c});
            console.log("壁の起点を選択しました。");
            return;
        }

        // 現在の状態をcurrentStateから取得
        const {p1Pos, p2Pos, placedWalls, p1Walls, p2Walls, turn} = currentState;

        // 2回目のクリックの場合(終点の確認と設置)
        const startR = wallStartPos.r;
        const startC = wallStartPos.c;
        const endR = r;
        const endC = c;

        // 2マス隣接のチェック(行または列が2離れているかつ同じ行または列にある)
        const dr = Math.abs(startR - endR);
        const dc = Math.abs(startC - endC);

        // 壁が専有する細いマスの座標を計算
        let representativeWallCoord;
        const isHorizontal = startR % 2 === 1 && endR % 2 === 1; // 1回目と2回目の行数が奇数であれば水平

        // 代表座標は2つのクリックされた細い線の中間にある交点
        const repR = startR + (endR - startR) / 2;
        const repC = startC + (endC - startC) / 2;
        const isAdjacentTwoSquares = isHorizontal ? dc === 2 : dr === 2;
        
        representativeWallCoord = {
            r: repR,
            c: repC,
            isHorizontal: isHorizontal
        };

        // 壁を設置できるかのチェック
        if (!isAdjacentTwoSquares) {
            console.log("無効な壁の終点です。");
            setWallStartPos(null);
            return;
        }

        // 壁の設置が可能かチェック
        if (grid[repR][repC] !== 0) {
            console.log("その位置には既に壁が設置されています");
            setWallStartPos(null);
            return;
        }

        // 設置完了と状態更新
        const currentWalls = turn === 1 ? p1Walls : p2Walls;
        if (currentWalls <= 0) {
            console.log(`プレイヤー${turn}: 残り壁がないため設置不可`);
            setWallStartPos(null);
            return;
        }

        const potentialWalls = [...placedWalls, representativeWallCoord];
        const nextWallsCount = currentWalls - 1;
        const nextTurn = turn === 1 ? 2 : 1;

        updateHistory(
            {p1: p1Pos, p2: p2Pos},
            {
                p1: turn === 1 ? nextWallsCount : p1Walls,
                p2: turn === 2 ? nextWallsCount :p2Walls
            },
            nextTurn,
            potentialWalls
        )


        setMode('move'); // モードをコマ移動にリセット
        setWallStartPos(null); // 選択状態のリセット
    }
    // ---------------------------------
    // ゴールの判定を行う関数
    // ---------------------------------
    const checkWinCondition = (p1R, p2R) => {
        // P1のゴールライン: R=16
        if (p1R === 16) {
            setWinner(1);
            return;
        }

        // P2のゴールライン: R=0
        if (p2R === 0) {
            setWinner(2);
            return;
        }
        
        return false;
    }

    // -----------------------------
    // ゲームの状態を履歴に追加し、currentMoveを更新する
    // -----------------------------
    const updateHistory = (newPos, newWalls, nextTurn, newPlacedWalls) => {
        // currentMoveより後の履歴を破棄する
        const newHistory = history.slice(0, currentMove + 1);

        const newState = {
            p1Pos: newPos.p1,
            p2Pos: newPos.p2,
            placedWalls: newPlacedWalls,
            turn: nextTurn,
            p1Walls: newWalls.p1,
            p2Walls: newWalls.p2,
        };

        setHistory([...newHistory, newState])
        setCurrentMove(newHistory.length) // 配列の末尾のインデックスを設定
    }

    const handleUndo = () => {
        // 履歴の戦闘より前には戻れない
        if (currentMove > 0) {
            setCurrentMove(currentMove - 1);
            setWinner(0);
            setMode('move');
            setWallStartPos(null);
        }
    }

    const handleRedo = () => {
        // 履歴の末尾より先には進めない
        if (currentMove < history.length - 1) {
            setCurrentMove(currentMove + 1);
            setWinner(0);
            setMode('move');
            setWallStartPos(null);
        }
    }

    return (
        <div className="game-wrapper">
            <div className="game-info">
                <div className="hands-p1">
                    P1の壁の枚数: {p1Walls}
                </div>

                <div className="hands-p2">
                    P2の壁の枚数: {p2Walls}
                </div>

                <div className="current-player">
                    現在の手番:P{turn}
                </div>

                <div className="current-pawn">
                    <Pawn player={turn} />
                </div>

                <div></div>
            </div>

            {winner !== 0 && (
                <div className="win-message">
                    <h2>プレイヤー{winner}の勝利！</h2>
                    <button onClick={() => window.location.reload()}>もう一度プレイ</button>
                </div>
            )}

            <div className="mode-toggle">
                <button
                    onClick={() => setMode('move')}
                    className={mode === 'move' ? 'active' : ''}
                >
                    コマの移動
                </button>
                <button
                    onClick={() => setMode('wall')}
                    className={mode === 'wall' ? 'active' : ''}
                >
                    壁を置く
                </button>
                

                <button
                    className="handleUndo"
                    onClick={handleUndo}
                    disabled={currentMove === 0}
                >
                    ⇐1つ前に戻る
                </button>

                <button
                    className="handleRedo"
                    onClick={handleRedo}
                    disabled={currentMove === history.length - 1}
                >
                    1つ先に進む⇒
                </button>
            </div>

            <div className="board-grid-1717">
                {grid.map((row, r) =>
                    row.map((cellValue, c) => {
                        const isPawnSquare = r % 2 === 0 && c % 2 === 0; // 偶数のコママス
                        const type = r % 2 === 1 && c % 2 === 0 ? 'H' : (r % 2 === 0 && c % 2 === 1 ? 'V' : 'I')
                        if (isPawnSquare) {
                            // コマを動かす用のマス
                            return (
                                <Square 
                                    key={`${r}-${c}`}
                                    player={cellValue}
                                    onClick={() => handleMove(r, c)}    
                                /> 
                            );
                        } else if (cellValue === 3 || cellValue === 4 || cellValue === 5) {
                            // 既に壁が置かれているマス(3: 水平, 4: 垂直, 5: 交点)
                            return (
                                <Wall
                                    key={`${r}-${c}`}
                                    orientation={c % 2 === 1 ? 'V' : 'H'} // 列が奇数なら垂直, 偶数なら水平
                                    value={cellValue}
                                />
                            );
                        } else {
                            // 壁のマス
                            const isStart = wallStartPos && wallStartPos.r === r && wallStartPos.c === c

                            return (
                                <WallPlaceholder
                                    key={`${r}-${c}`}
                                    onClick={() => handleWallPlacement(r, c)}
                                    type={type} // プレースホルダーの種類
                                    mode={mode} // モードによって見た目をs変更
                                    isWallStart={isStart} // 壁の設置開始地点
                                />
                            );
                        }
                    })
                )}
            </div>
        </div>
    );
};

export default Board;