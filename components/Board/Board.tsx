import { useEffect, useRef, useState } from "react";
import {
  BoardContainer,
  ControlsBar,
  GameControlButtons,
  HeaderImage,
  HowToPlay,
  WoodenBorder
} from "./Board.styles";
import headerImage from "@/assets/images/v-cell_header1.png";
import Image from "next/image";
import appState from "@/logic/AppState";
import { observer } from "mobx-react-lite";
import FoundationsUI from "./Foundations/FoundationsUI";
import TableauUI from "./Tableau/TableauUI";
import HandUI from "./Hand/HandUI";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  cardSizeState,
  calculateCardSize,
  timeElapsedState,
  timerIsRunningState
} from "@/logic/RecoilAtoms";
import CardsBeingDragged from "../CardsBeingDragged";
import WinModal from "../Modals/WinModal";
import InstructionsModal from "../Modals/InstructionsModal";
import { FaCog, FaInfoCircle } from "react-icons/fa";
import { Luckiest_Guy, Questrial } from "next/font/google";
import {
  handlePointerDown,
  handlePointerMove,
  handlePointerUp
} from "@/logic/UIFunctions";
import LocalStorageServerHelper from "@/logic/LocalStorageServerHelper";
import SettingsModal from "../Modals/SettingsModal";
import Timer from "./Timer";

export const luckyGuy = Luckiest_Guy({ weight: "400", subsets: ["latin"] });
export const questrial = Questrial({ weight: "400", subsets: ["latin"] });

const Board = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [cardSize, setCardSize] = useRecoilState(cardSizeState);
  const [dragPosition, setDragPosition] = useState({ left: 0, top: 0 });
  const [timeElapsed, setTimeElapsed] = useRecoilState(timeElapsedState);
  const setTimerIsRunning = useSetRecoilState(timerIsRunningState);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  function resetTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerIsRunning(false);
    setTimeElapsed(0);
  }

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const winHistory = localStorage.getItem("vCellWinHistory")
      ? JSON.parse(localStorage.getItem("vCellWinHistory") as string)
      : [];
    if (appState.winCount > 0) {
      const newWinObject = {
        date: new Date(),
        layout: appState.layoutName,
        timeElapsed: timeElapsed
      };

      localStorage.setItem(
        "vCellWinHistory",
        JSON.stringify([...winHistory, newWinObject])
      );
    }
  }, [appState.winCount]);

  useEffect(() => {
    const handleResize = () => {
      setCardSize(calculateCardSize(window.innerWidth, window.innerHeight));
    };

    document.addEventListener("pointermove", (e) => {
      handlePointerMove(e, setDragPosition);
    });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("resize", handleResize);

    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", (e) => {
        handlePointerMove(e, setDragPosition);
      });
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* <GameTitle className={luckyGuy.className}>V-Cell</GameTitle>
       */}
      <LocalStorageServerHelper timerIntervalRef={timerIntervalRef} />
      <HeaderImage>
        <Image
          src={headerImage}
          width={1700}
          height={400}
          alt="V-Cell header image"
          priority
        />
      </HeaderImage>

      <ControlsBar>
        <div>{/* left empty for grid */}</div>
        <HowToPlay
          className={questrial.className}
          onClick={() => {
            if (!appState.instructionsModal.isOpen) {
              appState.instructionsModal.open();
              appState.winModal.close();
            }
          }}
          $isInstructionsModalOpen={appState.instructionsModal.isOpen}
        >
          <span>How to play</span> <FaInfoCircle className="info-icon" />
        </HowToPlay>
        <div className="settings-button">
          <button
            aria-label="Settings"
            onClick={() => {
              appState.settingsModal.open();
              appState.instructionsModal.close();
              appState.winModal.close();
            }}
          >
            <FaCog />
          </button>
        </div>
      </ControlsBar>
      <WoodenBorder>
        <Timer timerIntervalRef={timerIntervalRef} resetTimer={resetTimer} />
        <BoardContainer
          $isModalOpen={
            appState.winModal.isOpen || appState.instructionsModal.isOpen
          }
          $cardSize={cardSize}
          onPointerLeave={(e) => {
            handlePointerUp(e as unknown as PointerEvent);
          }}
        >
          {appState.winModal.isOpen && <WinModal />}
          {appState.settingsModal.isOpen && <SettingsModal />}
          {appState.instructionsModal.isOpen && <InstructionsModal />}
          {appState.cardsBeingTouched && appState.isDragging && (
            <CardsBeingDragged dragPosition={dragPosition} />
          )}
          <FoundationsUI />
          <div className="scroll">
            <TableauUI />
          </div>
          <HandUI />
        </BoardContainer>
      </WoodenBorder>
      <GameControlButtons className={questrial.className}>
        <button
          className={questrial.className}
          style={{
            backgroundColor: "#0099cc",
            borderColor: "#0099cc"
          }}
          onClick={() => {
            resetTimer();
            appState.dealCards();
          }}
          disabled={appState.winningBoard && appState.canAutoComplete}
        >
          Deal again
        </button>
        <button
          style={{
            backgroundColor: "var(--red)",
            borderColor: "var(--red)"
          }}
          className={questrial.className}
          disabled={appState.moveEvaluator.getIsUndoButtonDisabled()}
          onClick={() => {
            appState.undo();
          }}
        >
          Undo{" "}
          {appState.moveEvaluator.undosAllowed > 0 &&
          appState.moveEvaluator.undosAllowed !== Infinity
            ? `(${
                appState.moveEvaluator.undosAllowed -
                appState.moveEvaluator.undosUsed
              })`
            : ""}
        </button>

        {process.env.NODE_ENV !== "production" && (
          <button
            onClick={() => {
              appState.setIsWinningBoard(true);
              appState.winModal.open();
              appState.instructionsModal.close();
            }}
          >
            win
          </button>
        )}
      </GameControlButtons>
    </>
  );
});

export default Board;
