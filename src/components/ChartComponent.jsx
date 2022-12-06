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
    const [firstDataSet, setFirstDataSet] = useState(null);
    const [markerList, setMarkerList] = useState([]);
    const [averageVol, setAverageVol] = useState(null);
    const [totalVol, setTotalVol] = useState(0);

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
        if (lastJsonMessage?.data?.k) {
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
                            new Date(lastJsonMessage?.data?.k?.t)
                                .getTime()
                                .toString()
                                .substring(0, 10)
                        ),
                        value: parseFloat(lastJsonMessage?.data?.k?.c),
                    },
                ];
            });
            if (
                !isNaN(
                    parseInt(
                        new Date(lastJsonMessage?.data?.k?.t)
                            .getTime()
                            .toString()
                            .substring(0, 10)
                    )
                )
            ) {
                const dir =
                    parseFloat(lastJsonMessage?.data?.k?.o) >
                    parseFloat(lastJsonMessage?.data?.k?.c)
                        ? "d"
                        : "u";
                const visible =
                    parseFloat(lastJsonMessage?.data?.k?.v) > averageVol
                        ? true
                        : false;
                averageVol &&
                    setMarkerList((markers) => {
                        let oldMarkers = [];
                        if (markers.length > shiftingPoint) {
                            oldMarkers = markers.slice(0 - shiftingPoint);
                        } else {
                            oldMarkers = markers;
                        }

                        return [
                            ...oldMarkers,
                            {
                                time: parseInt(
                                    new Date(lastJsonMessage?.data?.k?.t)
                                        .getTime()
                                        .toString()
                                        .substring(0, 10)
                                ),
                                position: dir === "d" ? "aboveBar" : "belowBar",
                                color: visible
                                    ? dir === "d"
                                        ? "red"
                                        : "green"
                                    : "rgba(0,0,0,0)",
                                shape: dir === "d" ? "arrowDown" : "arrowUp",
                                text: parseFloat(
                                    lastJsonMessage?.data?.k?.v
                                ).toString(),
                            },
                        ];
                    });
            }

            setTotalVol(
                (total) =>
                    parseFloat(total) + parseFloat(lastJsonMessage?.data?.k?.v)
            );

            setAverageVol(parseFloat(totalVol) / liveData.length);
        }
    }, [lastJsonMessage]);

    const handleClickSendMessage = useCallback(() => {
        return sendJsonMessage({
            method: "SUBSCRIBE",
            // params: [`${selectedCoin}@ticker`],
            params: [`${selectedCoin}@kline_1s`],
            id: 1,
        });
    }, [sendJsonMessage, selectedCoin]);

    const handleClickUnSendMessage = useCallback(() => {
        sendJsonMessage({
            method: "UNSUBSCRIBE",
            // params: [`${selectedCoin}@ticker`],
            params: [`${selectedCoin}@kline_1s`],
            id: 1,
        });
        setLiveData([]);
    }, [sendJsonMessage, selectedCoin]);

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
            btcPriceSeries.setData(liveData);
            btcPriceSeries.setMarkers(markerList);
            chart.timeScale().fitContent();
        }

        // liveData.length > 0 && console.log("[LIVE DATA]", liveData);
        // markerList.length > 0 && console.log("[MARKERS]", markerList);
        // liveData.length > 0 && console.log("\n\n\n\n\n");

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
