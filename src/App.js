const initialData = [];

function App() {
    return (
        <div className="App">
            <ChartComponent
                backgroundColor="white"
                lineColor="#d65200"
                textColor="black"
                areaTopColor="#d6520001"
                areaBottomColor="#d6520020"
                data={initialData}
            ></ChartComponent>
        </div>
    );
}

export default App;
