/* eslint-disable react-hooks/exhaustive-deps */

import optionsIcon from "../assets/images/optionsIcon.svg";
import tableStyles from "../assets/scss/Tables.module.scss";

import ApexCharts from "apexcharts";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { confirm } from "react-bootstrap-confirmation";

import Widget from "./Widget";
import LoadButton from "./LoadButton";
import { colorNameToHex, moneyFormatIndia, showAlert } from "../tools/UI";
import { makeSessionRequestPost } from "../tools/Auth";
import { AuthStore } from "../app_state/auth/auth";

const BarGraph = ({
    dataset,
    title,
    deleteFunction,
    updateFunction,
    total = 0,
    unit = "",
    id = "bg",
    color = "#0d6efd"
}) => {

    const [deleteStatus, setDeleteStatus] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(false);

    const navigate = useNavigate();

    const formatKey = (key) => {
        if (key.startsWith("School of ")) {
            return key.substring(10, key.length);
        } else if (key.startsWith("Faculty of ")) {
            return key.substring(11, key.length);
        } else {
            return key;
        }
    }

    const prepareData = () => {
        
        const data = [];
        const categories = [];

        for (var i = 0; i < dataset.length; i++) {
            categories.push(formatKey(dataset[i]["key"]));
            data.push(dataset[i]["data"]);
        }

        return [data, categories];
    }

    const colors = Array(dataset.length).fill(colorNameToHex(color), 0);

    useEffect(() => {

        const formattedData = prepareData();

        const options = {
            series: [{
                data: formattedData[0]
            }],
            colors: colors,
            chart: {
                type: "bar",
                height: dataset.length * 28
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    borderRadiusApplication: "end",
                    horizontal: true
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (val) => {
                    return moneyFormatIndia(String(val))
                }
            },
            xaxis: {
                categories: formattedData[1]
            }
        };
        
        var chart = new ApexCharts(document.querySelector(`#chart${id}`), options);
        chart.render();

    }, []);

    return (
        <Widget className="bar-graph-widget">
            <h4 style={{
                textAlign: "center",
                paddingTop: "20px",
                fontSynthesis: "initial",
                fontWeight: "bold",
                wordWrap: "break-word"
            }}>
                {title}
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
                    {moneyFormatIndia(String(total))} {unit}
                </h5>
            ) : (
                <></>
            )}
            <div
                style={{
                    maxHeight: "40vh",
                    overflowY: "auto",
                    overflowX: "hidden"
                }}
                id={`chartContainer${id}`}
            >
                <div id={`chart${id}`}></div>
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
                    lbLoading={updateStatus}
                    clickHandler={() => {
                        if (document.getElementById(id).value.replaceAll(" ", "") === "") {
                            showAlert("Enter your description of what filter you want to see first 😡", toast.error);
                            return;
                        }
                        setUpdateStatus(true);
                        makeSessionRequestPost("/admin/doar/update", {
                            visualId: id,
                            prompt: document.getElementById(id).value
                        }, (response) => {
                            setUpdateStatus(false);
                            const newData = response.data;
                            if (!newData.error) {
                                newData.visualId = id;
                                updateFunction(newData);
                                document.getElementById(id).value = "";
                            } else {
                                showAlert("No filtered visual can be created for your request. Try another description or try again (Sometimes the AI just zones out...)", toast.error);
                            }
                        }, (sessionExisted) => {
                            if (sessionExisted) {
                                showAlert("Session expired! Please login again.", toast.error, false);
                            } else {
                                showAlert("Please sign-in to continue.", toast.info, false);
                            }
                            navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                        });
                    }}
                />
                <LoadButton
                    style={{
                        width: "fit-content"
                    }}
                    lbText="Delete Graph"
                    type="danger"
                    lbId={`${id}delete`}
                    lbLoading={deleteStatus}
                    clickHandler={async () => {
                        if (await confirm(`Are you sure you want to delete this visual, ${AuthStore.getState().authName} 🤨. The AI did pretty hard work to create it 😥...`, {
                            title: "Are you sure?",
                            okText: "Yes 😎",
                            cancelText: "No pressed by mistake 😅",
                            okButtonStyle: "danger",
                            cancelButtonStyle: "warning"
                        })) {
                            setDeleteStatus(true);
                            makeSessionRequestPost("/admin/doar/delete", {
                                visualId: id
                            }, (response) => {
                                setDeleteStatus(false);
                                const statusData = response.data;
                                if (statusData.status === "s") {
                                    deleteFunction();
                                } else {
                                    showAlert(`Something went wrong, please try again after some time or contact ${process.env.REACT_APP_CONTACT_PERSON}`, toast.error);
                                }
                            }, (sessionExisted) => {
                                if (sessionExisted) {
                                    showAlert("Session expired! Please login again.", toast.error, false);
                                } else {
                                    showAlert("Please sign-in to continue.", toast.info, false);
                                }
                                navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                            });
                        }
                    }}
                />
            </div>
        </Widget>
    );

}

export default BarGraph;