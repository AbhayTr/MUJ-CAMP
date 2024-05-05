import optionsIcon from "../assets/images/optionsIcon.svg";
import tableStyles from "../assets/scss/Tables.module.scss";

import Widget from "./Widget";
import LoadButton from "./LoadButton";
import { moneyFormatIndia } from "../tools/UI";

const StatBox = ({
    data,
    title,
    unit = "",
    id = "ds",
    color = "#198754"
}) => {

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
                height: "30vh",
                overflowY: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
            }}>
                <h1 style={{
                    textAlign: "center",
                    fontSynthesis: "initial",
                    fontWeight: "bold",
                    wordWrap: "break-word",
                    fontSize: "4em",
                    color: color
                }}>
                    {moneyFormatIndia(String(data))} {unit}
                </h1>
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
                    lbText="Delete Statistic"
                    type="danger"
                    lbId={`${id}delete`}
                    clickHandler={() => {
                    }}
                />
            </div>
        </Widget>
    );

}

export default StatBox;