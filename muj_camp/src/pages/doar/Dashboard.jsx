/* eslint-disable react-hooks/exhaustive-deps */

import optionsIcon from "../../assets/images/optionsIcon.svg";
import tableStyles from "../../assets/scss/Tables.module.scss";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Row, Col } from "reactstrap";

import { ensureAdminAccess } from "../../tools/Auth";
import LoadSpinner from "../../custom_components/LoadSpinner";
import BarGraph from "../../custom_components/BarGraph";
import { AuthStore } from "../../app_state/auth/auth";
import Widget from "../../custom_components/Widget";

const Dashboard = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        ensureAdminAccess("DOAR_DASHBOARD", setLoading, navigate);
    }, []);

    const dataset = [
        {
            data: 70,
            key: 'IIT Madrasaaaaa',
        },
        {
            data: 42,
            key: 'IIT Bombay',
        },
        {
            data: 59,
            key: 'Jan49',
        },
        {
            data: 59,
            key: 'Jan39',
        },
        {
            data: 59,
            key: 'Jan29',
        },
        {
            data: 59,
            key: 'Jan28',
        },
        {
            data: 59,
            key: 'Jan27',
        },
        {
            data: 59,
            key: 'Jan26',
        },
        {
            data: 59,
            key: 'Jan25',
        },
        {
            data: 59,
            key: 'Jan24',
        },
        {
            data: 59,
            key: 'Jan23',
        },
        {
            data: 59,
            key: 'Jan22',
        },
        {
            data: 59,
            key: 'Jan21',
        },
        {
            data: 59,
            key: 'Jan20',
        },
        {
            data: 59,
            key: 'Jan19',
        },
        {
            data: 59,
            key: 'Jan18',
        },
        {
            data: 59,
            key: 'Jan17',
        },
        {
            data: 59,
            key: 'Jan16',
        },
        {
            data: 59,
            key: 'Jan15',
        },
        {
            data: 59,
            key: 'Jan14',
        },
        {
            data: 59,
            key: 'Jan13',
        },
        {
            data: 59,
            key: 'Jan12',
        },
        {
            data: 59,
            key: 'Jan11',
        },
        {
            data: 59,
            key: 'Jan10',
        },
        {
            data: 59,
            key: 'Jan9',
        },
        {
            data: 59,
            key: 'Jan8',
        },
        {
            data: 59,
            key: 'Jan7',
        },
        {
            data: 59,
            key: 'Jan6',
        },
        {
            data: 59,
            key: 'Jan5',
        },
        {
            data: 59,
            key: 'Jan4',
        },
        {
            data: 59,
            key: 'Jan3',
        },
        {
            data: 59,
            key: 'Jan2',
        },
        {
            data: 59,
            key: 'Jan1',
        },
    ];

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            <>
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
                                        <label htmlFor="dashboard">
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
                                        <textarea
                                            className="form-control mr-sm-2"
                                            placeholder="Enter description of data which you want to see."
                                            id="dashboard"
                                            style={{
                                                width: "100%",
                                                borderStyle: "solid",
                                                borderWidth: "2px",
                                                borderRadius: "10px",
                                                borderColor: "black"
                                            }}
                                            rows="3"
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
                    gap: "1em"
                }}>
                    <BarGraph
                        dataset={dataset}
                        title="Alumni in Top 100 Universities"
                        xLabel="No. of Alumni"
                        unit="Alumni"
                        id="1"
                    />
                    <BarGraph
                        dataset={dataset}
                        title="Alumni in Fortune 500 Companies"
                        xLabel="No. of Alumni"
                        unit="Alumni"
                        id="2"
                    />
                    <BarGraph
                        dataset={dataset}
                        title="Top 100 Alumni Startups"
                        xLabel="No. of Alumni"
                        unit="Alumni"
                        id="3"
                    />
                </div>
            </>
        )
    );
}

export { Dashboard };