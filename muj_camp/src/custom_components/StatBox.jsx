import optionsIcon from "../assets/images/optionsIcon.svg";
import tableStyles from "../assets/scss/Tables.module.scss";

import { useNavigate } from "react-router-dom";
import { confirm } from "react-bootstrap-confirmation";
import { useState } from "react";
import { toast } from "react-toastify";

import Widget from "./Widget";
import LoadButton from "./LoadButton";
import { moneyFormatIndia, showAlert } from "../tools/UI";
import { AuthStore } from "../app_state/auth/auth";
import { makeSessionRequestPost } from "../tools/Auth";

const StatBox = ({
    data,
    title,
    deleteFunction,
    updateFunction,
    unit = "",
    id = "ds",
    color = "#198754"
}) => {

    const [deleteStatus, setDeleteStatus] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(false);

    const navigate = useNavigate();

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
                    lbText="Delete Statistic"
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

export default StatBox;