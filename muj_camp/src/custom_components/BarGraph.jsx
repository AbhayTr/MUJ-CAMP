import optionsIcon from "../assets/images/optionsIcon.svg";
import tableStyles from "../assets/scss/Tables.module.scss";

import { BarChart } from "@mui/x-charts/BarChart";
import { useState } from "react";

import Widget from "./Widget";
import LoadButton from "./LoadButton";
import { moneyFormatIndia } from "../tools/UI";

const fixSVGS = () => {
    const barGraphSVGS = document.getElementsByClassName("css-13aj3tc-MuiChartsSurface-root");
    if (barGraphSVGS != null && barGraphSVGS.length !== 0) {
        for (var i = 0; i < barGraphSVGS.length; i++) {
            barGraphSVGS[i].viewBox.baseVal.x = -35;
        }
    }
}

const truncateLabels = () => {

    const MAX_LENGTH = 10;
    
    const startLooking = setInterval(() => {
        const labels = document.querySelectorAll(`text[dominant-baseline="central"]`);
        if (labels.length > 0) {
            for (var i = 0; i < labels.length; i++) {
                if (labels[i].textContent.length > MAX_LENGTH) {
                    labels[i].textContent = labels[i].textContent.substring(0, MAX_LENGTH) + "...";
                }
            }
            clearInterval(startLooking);
        }
    }, 10);

}

const BarGraph = ({
    dataset,
    title,
    total = 0,
    unit = "",
    id = "bg",
    color = "#0d6efd"
}) => {

    const [datasetState, setDatasetState] = useState(dataset);
    const [titleState, setTitleState] = useState(title);
    const [totalState, setTotalState] = useState(total);
    const [unitState, setUnitState] = useState(unit);

    const chartSetting = {
        height: datasetState.length * 28,
    };
    
    const valueFormatter = (value) => `${moneyFormatIndia(String(value))} ${unitState}`;

    return (
        <Widget className="bar-graph-widget">
            <h4 style={{
                textAlign: "center",
                paddingTop: "20px",
                fontSynthesis: "initial",
                fontWeight: "bold",
                wordWrap: "break-word"
            }}>
                {titleState}
            </h4>
            {(true) ? (
                <h5 style={{
                    textAlign: "center",
                    paddingBottom: "10px",
                    fontSynthesis: "initial",
                    fontWeight: "bold",
                    wordWrap: "break-word",
                    color: "#198754"
                }}>
                    {totalState} {unitState}
                </h5>
            ) : (
                <></>
            )}
            <div style={{
                maxHeight: "30vh",
                overflowY: "auto"
            }}>
                <BarChart
                    dataset={datasetState}
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
                                color: color,
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

export { BarGraph, fixSVGS, truncateLabels };