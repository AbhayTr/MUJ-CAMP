import { BarChart } from "@mui/x-charts/BarChart";
import { useEffect } from "react";

import Widget from "./Widget";

const BarGraph = ({
    dataset,
    title,
    unit = ""
}) => {

    useEffect(() => {

        setInterval(() => {
            const barGraphSVGS = document.getElementsByClassName("css-13aj3tc-MuiChartsSurface-root");
            if (barGraphSVGS != null && barGraphSVGS.length !== 0) {
                for (var i = 0; i < barGraphSVGS.length; i++) {
                    barGraphSVGS[i].viewBox.baseVal.x = -35;
                }
            }
        }, 10);

    }, []);

    const chartSetting = {
        height: dataset.length * 28,
    };

    // dataset.map((data) => {
    //     if (data.key.length > 5) {
    //         data.key = data.key.substring(0, 4) + "...";
    //     }
    //     return data;
    // });
    
    const valueFormatter = (value) => `${value} ${unit}`;
    const keyFormatter = (key) => {
        if (key.length > 10) {
            return key.substring(0, 10) + "...";
        }
        return key;
    }

    return (
        <Widget className="bar-graph-widget">
            <h4 style={{
                textAlign: "center",
                paddingTop: "20px",
                paddingBottom: "10px",
                fontSynthesis: "initial",
                fontWeight: "bold"
            }}>
                {title}
            </h4>
            <div style={{
                maxHeight: "30vh",
                overflowY: "auto"
            }}>
                <BarChart
                    dataset={dataset}
                    yAxis={[
                        {
                            scaleType: "band",
                            dataKey: "key",
                            valueFormatter: keyFormatter
                        }
                    ]}
                    series={
                        [
                            {
                                dataKey: "data",
                                valueFormatter
                            }
                        ]
                    }
                    layout="horizontal"
                    {...chartSetting}
                />
            </div>
        </Widget>
    );

}

export default BarGraph;