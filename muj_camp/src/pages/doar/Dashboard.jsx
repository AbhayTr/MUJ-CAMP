/* eslint-disable react-hooks/exhaustive-deps */

import aiIcon from "../../assets/images/ai.png";
import tableStyles from "../../assets/scss/Tables.module.scss";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Row, Col } from "reactstrap";
import { toast } from "react-toastify";

import { ensureAdminAccess, makeSessionRequestGet, makeSessionRequestPost } from "../../tools/Auth";
import LoadSpinner from "../../custom_components/LoadSpinner";
import BarGraph from "../../custom_components/BarGraph";
import { AuthStore } from "../../app_state/auth/auth";
import Widget from "../../custom_components/Widget";
import LoadButton from "../../custom_components/LoadButton";
import StatBox from "../../custom_components/StatBox";
import { showAlert } from "../../tools/UI";

const Dashboard = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [visuals, setVisuals] = useState([]);

    const [aiWorking, setAiWorking] = useState(false);

    const loadPage = () => {
        makeSessionRequestGet("/admin/doar/dashboard", (response) => {
            const visualsData = response.data;
            if (visualsData != null && visualsData.visuals != null) {
                setVisuals(visualsData.visuals);
            }
            setLoading(false);
        }, (sessionExisted) => {
            if (sessionExisted) {
                showAlert("Session expired! Please login again.", toast.error, false);
            } else {
                showAlert("Please sign-in to continue.", toast.info, false);
            }
            navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
        });
    }

    useEffect(() => {

        ensureAdminAccess("DOAR_DASHBOARD", loadPage, navigate);
    
    }, []);

    return (
        (loading) ? (
            <LoadSpinner
                title="Loading Dashboard 📊"
            />
        ) : (
            <div style={{
                display: (visuals.length === 0) ? "flex" : "initial",
                flexDirection: (visuals.length === 0) ? "column" : "initial",
                height: "100%"
            }}>
                <Row>
                    <Col>
                        <Row className="mb-4">
                            <Col>
                                <Widget>
                                    <div
                                        style={{
                                            padding: "1rem",
                                            paddingBottom: "0rem",
                                        }}
                                        id="doarHeading"
                                    >
                                        <h4 style={{
                                            marginBottom: "0.7rem",
                                            fontWeight: "bold",
                                            marginLeft: "calc(-0.5rem + 17px)"
                                        }}>
                                            Hello {AuthStore.getState().authName} 👋
                                        </h4>
                                        <p style={{
                                            textAlign: "justify",
                                            marginLeft: "calc(-0.5rem + 17px)"
                                        }}>
                                            Welcome to the <b>Alumni Dashboard</b>. This Dashboard is <b style={{color: "green"}}>powered by Generative Artificial Intelligence (Gen AI)</b> to help visualize the vast and complex Alumni Data! Just describe what data you want to see in the below textbox:
                                        </p>
                                    </div>
                                    <div
                                        className={`${tableStyles.tableTitle} ${tableStyles.search}`}
                                    >
                                        <label htmlFor="dashboardPrompt">
                                            <img
                                                className="d-sm-block"
                                                src={aiIcon}
                                                alt="Filters"
                                                style={{
                                                    height: "30px",
                                                    width: "auto",
                                                    marginLeft: "0px",
                                                    marginRight: "10px"
                                                }}
                                            />
                                        </label>
                                        <textarea
                                            className="form-control mr-sm-2"
                                            placeholder="Enter description of data which you want to see."
                                            id="dashboardPrompt"
                                            style={{
                                                width: "100%",
                                                borderStyle: "solid",
                                                borderWidth: "2px",
                                                borderRadius: "10px",
                                                borderColor: "black"
                                            }}
                                            rows="3"
                                        />
                                        <LoadButton
                                            style={{
                                                width: "fit-content",
                                                marginLeft: "10px"
                                            }}
                                            lbText="✨ Visualize Data"
                                            type="success"
                                            lbId={`dashboardVisualize`}
                                            lbLoading={aiWorking}
                                            clickHandler={() => {
                                                if (document.getElementById("dashboardPrompt").value.replaceAll(" ", "") === "") {
                                                    showAlert("Enter your description of what you want to see first 😡", toast.error);
                                                    return;
                                                }
                                                setAiWorking(true);
                                                makeSessionRequestPost("/admin/doar/new", {
                                                    prompt: document.getElementById("dashboardPrompt").value
                                                }, (response) => {
                                                    setAiWorking(false);
                                                    const newVisualData = response.data;
                                                    if (newVisualData.error) {
                                                        if (newVisualData.error === "np") {
                                                            showAlert("No visual can be created for your request. Try another description or try again (Sometimes the AI just zones out...)", toast.error);
                                                        } else {
                                                            showAlert(newVisualData.error, toast.error);
                                                        }
                                                        return;
                                                    }
                                                    const newData = [...visuals];
                                                    newData.push(newVisualData);
                                                    setVisuals(newData);
                                                    showAlert("Visual created successfully ✅");
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
                                    </div>
                                </Widget>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1em",
                    justifyContent: (visuals.length === 0) ? "center" : "initial",
                    alignItems: (visuals.length === 0) ? "center" : "initial",
                    flex: (visuals.length === 0) ? "1 1 0" : "initial"
                }}>
                    {(visuals.length === 0) ? (
                        <>
                            Your visuals will appear here.
                        </>
                    ) : (
                        visuals.map((visual, index) => {
                            if (visual.type === "graph") {
                                return (
                                    <BarGraph
                                        key={index}
                                        dataset={visual.data}
                                        title={visual.title}
                                        total={visual.total}
                                        unit={visual.unit}
                                        id={visual.visualId}
                                        color={visual.color}
                                        deleteFunction={() => {
                                            const newData = [...visuals];
                                            newData.splice(index, 1);
                                            setVisuals(newData);
                                            showAlert("Visual deleted successfully ✅");
                                        }}
                                        updateFunction={(updatedData) => {
                                            const newData = [...visuals];
                                            newData[index] = updatedData;
                                            setVisuals(newData);
                                            showAlert("Visual Filter applied successfully ✅");
                                        }}
                                    />
                                );
                            } else if (visual.type === "stat") {
                                return (
                                    <StatBox
                                        key={index}
                                        data={visual.data}
                                        title={visual.title}
                                        unit={visual.unit}
                                        id={visual.visualId}
                                        color={visual.color}
                                        deleteFunction={() => {
                                            const newData = [...visuals];
                                            newData.splice(index, 1);
                                            setVisuals(newData);
                                            showAlert("Visual deleted successfully ✅");
                                        }}
                                        updateFunction={(updatedData) => {
                                            const newData = [...visuals];
                                            newData[index] = updatedData;
                                            setVisuals(newData);
                                            showAlert("Visual Filter applied successfully ✅");
                                        }}
                                    />
                                );
                            } else {
                                return (
                                    <></>
                                );
                            }
                        })
                    )}
                </div>
            </div>
        )
    );
}

export { Dashboard };