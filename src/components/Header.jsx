import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const Header = ({
    ReadyState,
    selectCoin,
    handleClickSendMessage,
    handleClickUnSendMessage,
    _readyState,
    setMaxAsk,
    setMaxBid,
}) => {
    const [selectedCoin, setSelectedCoin] = useState("btcusdt");
    const [running, setRunning] = useState(false);
    const [_running, _setRunning] = useState(false);

    const socketUrl = "wss://stream.binance.com:9443/ws";
    const { sendJsonMessage, lastJsonMessage, readyState } =
        useWebSocket(socketUrl);
    const messageHistory = useRef([]);
    messageHistory.current = useMemo(
        () => messageHistory.current.concat(lastJsonMessage ?? []),
        [lastJsonMessage]
    );

    const setAskBid = (data) => {
        const asks = data?.asks?.map((ask) => ask[1]);
        const _asks = asks?.toString().split(",").map(Number);
        const maxAsk = Math.max.apply(null, _asks);
        const maxAskOrders = data?.asks?.filter(
            (ask) => parseFloat(ask[1]) === maxAsk
        );

        const bids = data?.bids?.map((bid) => bid[1]);
        const _bids = bids?.toString().split(",").map(Number);
        const maxBid = Math.max.apply(null, _bids);
        const maxBidOrders = data?.bids?.filter(
            (bid) => parseFloat(bid[1]) === maxBid
        );

        maxAskOrders && setMaxAsk(maxAskOrders);
        maxBidOrders && setMaxBid(maxBidOrders);
    };

    useEffect(() => {
        setAskBid(lastJsonMessage);
    }, [lastJsonMessage]);

    const _handleClickSendMessage = useCallback(() => {
        return sendJsonMessage({
            method: "SUBSCRIBE",
            params: [`${selectedCoin}@depth20@100ms`],
            id: 1,
        });
    }, [sendJsonMessage, selectedCoin]);

    const _handleClickUnSendMessage = useCallback(() => {
        sendJsonMessage({
            method: "UNSUBSCRIBE",
            params: [`${selectedCoin}@depth20@100ms`],
            id: 1,
        });
        setMaxAsk(null);
        setMaxBid(null);
    }, [sendJsonMessage, selectedCoin]);
    return (
        <div
            style={{
                height: 50,
                display: "flex",
                background: "linear-gradient(to bottom, #000000, #131722)",
                justifyContent: "space-around",
                padding: 10,
                boxSizing: "border-box",
                borderBottom: "1px solid rgba(255,255,255,.1)",
            }}
        >
            <a
                href="https://github.com/onur-celik/bitcoin1second"
                target={"_blank"}
            >
                <img
                    src="https://onurcelik.dev/avatar.jpg"
                    style={{ width: 30, height: 30, borderRadius: 6 }}
                    alt={"Mustafa Onur Çelik"}
                />
            </a>
            <select
                onChange={(e) => {
                    selectCoin(e);
                    setSelectedCoin(e.target.value);
                }}
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
                    !running && setTimeout(_handleClickSendMessage, 8000);
                    running && _handleClickUnSendMessage();
                }}
                disabled={_readyState !== ReadyState.OPEN}
            >
                {running ? "STOP" : "RUN"}
            </button>
        </div>
    );
};

export default Header;
