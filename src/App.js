import { ChartComponent } from "./components/ChartComponent";

const initialData = [
    { time: "2018-12-22", value: 32.51 },
    { time: "2018-12-23", value: 31.11 },
    { time: "2018-12-24", value: 27.02 },
    { time: "2018-12-25", value: 27.32 },
    { time: "2018-12-26", value: 25.17 },
    { time: "2018-12-27", value: 28.89 },
    { time: "2018-12-28", value: 25.46 },
    { time: "2018-12-29", value: 23.92 },
    { time: "2018-12-30", value: 22.68 },
    { time: "2018-12-31", value: 22.67 },
];

const initialCandleStickData = [
    {
        time: 1670325445,
        s: "BTCUSDT",
        open: "17303.24000000",
        high: "17315.00000000",
        low: "16867.00000000",
        close: "16953.51000000",
    },
];

// const initialBaseLineData = [
//     { value: 1, time: 1642425322 },
//     { value: 8, time: 1642511722 },
//     { value: 10, time: 1642598122 },
//     { value: 20, time: 1642684522 },
//     { value: 3, time: 1642770922 },
//     { value: 43, time: 1642857322 },
//     { value: 41, time: 1642943722 },
//     { value: 43, time: 1643030122 },
//     { value: 56, time: 1643116522 },
//     { value: 46, time: 1643202922 },
// ];

const initialBaseLineData = [];

function App() {
    return (
        <div className="App">
            <ChartComponent
                backgroundColor="white"
                // lineColor="#2962FF"
                lineColor="#d65200"
                textColor="black"
                // areaTopColor="#2962FF"
                areaTopColor="#d6520001"
                // areaBottomColor="rgba(41, 98, 255, 0.28)"
                // areaBottomColor="rgba(0,0,0, 0.0)"
                areaBottomColor="#d6520020"
                data={initialBaseLineData}
            ></ChartComponent>
        </div>
    );
}

export default App;
