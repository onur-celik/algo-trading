import { createChart, ColorType } from "lightweight-charts";
import React, {
    useCallback,
    useMemo,
    useEffect,
    useRef,
    useState,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Header from "./Header";

export const ChartComponent = ({
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
}) => {
    const [selectedCoin, setSelectedCoin] = useState("btcusdt");
    const [liveData, setLiveData] = useState(data);
    const chartContainerRef = useRef();
    const [chartSeries, setChartSeries] = useState(null);
    const [firstDataSet, setFirstDataSet] = useState(null);

    const selectCoin = (coin) => {
        setSelectedCoin(coin.target.value);
    };

    const socketUrl = "wss://stream.binance.com:9443/stream";

    const { sendJsonMessage, lastJsonMessage, readyState } =
        useWebSocket(socketUrl);

    const messageHistory = useRef([]);

    messageHistory.current = useMemo(
        () => messageHistory.current.concat(lastJsonMessage ?? []),
        [lastJsonMessage]
    );

    useEffect(() => {
        const shiftingPoint = 180;
        lastJsonMessage?.data &&
            setLiveData((liveData) => {
                let oldData = [];
                if (liveData.length > shiftingPoint) {
                    oldData = liveData.slice(0 - shiftingPoint);
                } else {
                    oldData = liveData;
                }

                return [
                    ...oldData,
                    {
                        time: parseInt(
                            new Date(lastJsonMessage?.data?.E)
                                .getTime()
                                .toString()
                                .substring(0, 10)
                        ),
                        value: lastJsonMessage?.data?.c,
                    },
                ];
            });
    }, [lastJsonMessage]);

    const handleClickSendMessage = useCallback(() => {
        return sendJsonMessage({
            method: "SUBSCRIBE",
            params: [`${selectedCoin}@ticker`],
            id: 1,
        });
    }, [sendJsonMessage, selectedCoin]);

    const handleClickUnSendMessage = useCallback(() => {
        sendJsonMessage({
            method: "UNSUBSCRIBE",
            params: [`${selectedCoin}@ticker`],
            id: 1,
        });
        setLiveData([]);
    }, [sendJsonMessage, selectedCoin]);

    // const connectionStatus = {
    //     [ReadyState.CONNECTING]: "Connecting",
    //     [ReadyState.OPEN]: "Open",
    //     [ReadyState.CLOSING]: "Closing",
    //     [ReadyState.CLOSED]: "Closed",
    //     [ReadyState.UNINSTANTIATED]: "Uninstantiated",
    // }[readyState];

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
            });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            watermark: {
                visible: true,
                fontSize: 62,
                horzAlign: "center",
                vertAlign: "center",
                color: "#d6520040",
                text: selectedCoin.toUpperCase(),
            },
            timeScale: { timeVisible: true, secondsVisible: true },
            width: chartContainerRef.current.clientWidth,
            height: window.innerHeight - 50,
        });
        chart.timeScale().fitContent();

        const btcPriceSeries = chart.addAreaSeries({
            priceLineWidth: 1,
            baseLineVisible: true,
            lastPriceAnimation: 1,
            lineColor,
            topColor: areaTopColor,
            bottomColor: areaBottomColor,
            timeVisible: true,
            secondsVisible: true,
            lineWidth: 2,
        });
        if (!firstDataSet) {
            btcPriceSeries.setData(liveData);
            setFirstDataSet(true);
        } else {
            const markers = [
                {
                    time: parseInt(
                        new Date(lastJsonMessage?.data?.E)
                            .getTime()
                            .toString()
                            .substring(0, 10)
                    ),
                    position: "aboveBar",
                    color: "#000000",
                    shape: "circle",
                    text: "Aasdadsasd",
                },
            ];
            btcPriceSeries.setData(liveData);
            btcPriceSeries.setMarkers(markers);
        }

        if (!chartSeries) {
            setChartSeries(btcPriceSeries);
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [
        lastJsonMessage,
        liveData,
        data,
        backgroundColor,
        lineColor,
        textColor,
        areaTopColor,
        areaBottomColor,
    ]);

    return (
        <>
            <Header
                ReadyState={ReadyState}
                selectCoin={selectCoin}
                readyState={readyState}
                handleClickSendMessage={handleClickSendMessage}
                handleClickUnSendMessage={handleClickUnSendMessage}
            />
            <div ref={chartContainerRef} />
        </>
    );
};
