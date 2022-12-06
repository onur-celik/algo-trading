import { useState } from "react";

const Header = ({
    ReadyState,
    selectCoin,
    handleClickSendMessage,
    handleClickUnSendMessage,
    readyState,
}) => {
    const [running, setRunning] = useState(false);
    return (
        <div
            style={{
                height: 50,
                display: "flex",
                backgroundColor: "#d65200",
                justifyContent: "space-around",
                padding: 10,
                boxSizing: "border-box",
            }}
        >
            <select
                onChange={selectCoin}
                style={{
                    width: 200,
                }}
            >
                <option value="btcusdt">Bitcoin</option>
                <option value="ethusdt">Ethereum</option>
                <option value="dogeusdt">Dogecoin</option>
            </select>
            <button
                onClick={() => {
                    running
                        ? handleClickUnSendMessage()
                        : handleClickSendMessage();
                    setRunning(!running);
                }}
                disabled={readyState !== ReadyState.OPEN}
            >
                {running ? "STOP" : "RUN"}
            </button>
        </div>
    );
};

export default Header;
