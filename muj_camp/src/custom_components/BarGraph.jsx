import optionsIcon from "../assets/images/optionsIcon.svg";
import tableStyles from "../assets/scss/Tables.module.scss";

import { BarChart } from "@mui/x-charts/BarChart";
import { useEffect } from "react";

import Widget from "./Widget";
import LoadButton from "./LoadButton";

const BarGraph = ({
    dataset,
    title,
    unit = "",
    id = "bg"
}) => {

    useEffect(() => {

        const fixSVGS = setInterval(() => {
            const barGraphSVGS = document.getElementsByClassName("css-13aj3tc-MuiChartsSurface-root");
            if (barGraphSVGS != null && barGraphSVGS.length !== 0) {
                for (var i = 0; i < barGraphSVGS.length; i++) {
                    barGraphSVGS[i].viewBox.baseVal.x = -35;
                }
            }
        }, 10);

        return (() => {
            clearInterval(fixSVGS);
        });

    }, []);

    const chartSetting = {
        height: dataset.length * 28,
    };
    
    const valueFormatter = (value) => `${value} ${unit}`;

    return (
        <Widget className="bar-graph-widget">
            <h4 style={{
                textAlign: "center",
                paddingTop: "20px",
                paddingBottom: "10px",
                fontSynthesis: "initial",
                fontWeight: "bold",
                wordWrap: "break-word"
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
                            dataKey: "key"
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
            <div
                className={`${tableStyles.tableTitle} ${tableStyles.search}`}
            >
                <label htmlFor={id}>
                    <img
                        className="d-sm-block"
                        src={optionsIcon}
                        alt="Filters"
                        style={{
                            marginLeft: "0px",
                            marginRight: "10px"
                        }}
                    />
                </label>
                <input
                    type="search"
                    className="form-control mr-sm-2"
                    placeholder="Filters description"
                    id={id}
                    style={{
                        width: "100%",
                        borderStyle: "solid",
                        borderWidth: "2px",
                        borderRadius: "10px",
                        borderColor: "black"
                    }}
                />
            </div>
            <div
                style={{
                    padding: "calc(0.5rem + 17px) calc(0.5rem + 17px)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.3em",
                    paddingTop: "0px"
                }}
            >
                <LoadButton
                    style={{
                        width: "fit-content"
                    }}
                    lbText="Apply Filters"
                    type="primary"
                    lbId={`${id}apply`}
                    clickHandler={() => {
                    }}
                />
                <LoadButton
                    style={{
                        width: "fit-content"
                    }}
                    lbText="Delete Graph"
                    type="danger"
                    lbId={`${id}delete`}
                    clickHandler={() => {
                    }}
                />
            </div>
        </Widget>
    );

}

export default BarGraph;