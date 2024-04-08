/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { ensureAdminAccess, makeWebSocketRequest } from "../../tools/Auth";
import DataTable from "../../custom_components/Table";
import LoadSpinner from "../../custom_components/LoadSpinner";
import { AuthStore } from "../../app_state/auth/auth";
import useTable from "../../hooks/TableHook";
import LoadButton from "../../custom_components/LoadButton";
import { showAlert, timestampToHumanTime } from "../../tools/UI";

let webSocket = null;

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [liveConnected, setLiveConnected] = useState(-1);

    const [updateDataLoading, setUpdateDataLoading] = useState(false);

    const [requestCount, setRequestCount] = useState(1);

    const [
        tableLoading,
        setTableLoading,
        tableHeaders,
        setTableHeaders,
        tableData,
        setTableData,
        tablePages,
        setTablePages,
        filters,
        setFilters,
        filtersApplied,
        setFiltersApplied,
        recordsNumber,
        setRecordsNumber,
        searchText,
        setSearchText
    ] = useTable();
    
    useEffect(() => {

        ensureAdminAccess("DOAR", setLoading, navigate);

        return (() => {
            try {
                webSocket.close();
            } catch (e) {}
        });

    }, []);

    useEffect(() => {
        
        if (liveConnected !== 0) {
            return;
        }

        if (requestCount < 0) {
            setRequestCount(0);
        }

        if (requestCount === 0) {
            setTableLoading(false);
        } else {
            setTableLoading(true);
        }
    }, [requestCount]);

    const handleWebSocketDown = async () => {
        setTableLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            document.getElementById("main-content").scroll(0, 0);
        } catch (e) {}
        setFilters({});
        setFiltersApplied({});
        setSearchText("");
        document.getElementById("Search").value = "";
        setLiveConnected(liveConnected + 2);
    };

    const processTableDataName = (serverTableData) => {
        const newTableData = [];
        for (let i = 0; i < serverTableData.length; i++) {
            let newTableRow = [...serverTableData[i]];
            let tableDataStats = newTableRow[0];
            newTableRow[0] = (
                <span
                    style={{
                        paddingLeft: "17px",
                        display: "inline-block"
                    }}
                    sortvalue={tableDataStats["name"]}
                >
                    <span
                        style={{
                            cursor: "pointer"
                        }}
                        onClick={() => {
                            window.open(`https://mujalumni.in/profile/${tableDataStats["alumniId"]}`);
                        }}
                    >
                        <span style={{
                            color: "#0d6efd",
                            fontWeight: "bold"
                        }}>
                            {tableDataStats["name"]}
                        </span>
                        <br/>
                        ({tableDataStats["muj_from"]} - {tableDataStats["muj_to"]})
                    </span>
                    <br/>
                    Alumni ID:&nbsp;
                    <span style={{
                        userSelect: "text"
                    }}>
                        <b>{tableDataStats["alumniId"]}</b>
                    </span>
                </span>
            );
            newTableData.push(newTableRow);
        }
        return newTableData;
    }

    const processTableDataStatus = (serverTableData) => {
        const newTableData = [];
        for (let i = 0; i < serverTableData.length; i++) {
            let newTableRow = [...serverTableData[i]];
            let tableDataStats = newTableRow[newTableRow.length - 1];
            newTableRow[newTableRow.length - 1] = (
                <div
                    style={{
                        padding: "17px"
                    }}
                    sortvalue={(tableDataStats["lastUpdated"] !== "-") ? timestampToHumanTime(tableDataStats["lastUpdated"]) : "N.A."}
                >
                    Last updated at:<br/>
                    <span style={{
                        color: "#3fb950",
                        fontSynthesis: "initial",
                        fontWeight: "bold"
                    }}>
                        {(tableDataStats["lastUpdated"] !== "-") ? timestampToHumanTime(tableDataStats["lastUpdated"]) : "N.A."}
                    </span>
                    <br/>
                    Last update status:<br/>
                    <span style={{
                        color: (tableDataStats["latestStatus"] === "s") ? "#3fb950" : (((tableDataStats["latestStatus"] === "f")) ? "tomato" : "goldenrod"),
                        fontSynthesis: "initial",
                        fontWeight: "bold"
                    }}>
                        {(tableDataStats["latestStatus"] === "s") ? "Successfully Synced" : ((tableDataStats["latestStatus"] === "f") ? "Sync Failed" : "Never Synced")}
                    </span>
                    <br/><br/>
                    Current status:<br/>
                    <span style={(tableDataStats["currentStatus"] !== "nl") ? ((tableDataStats["currentStatus"] === "l") ? {
                        fontWeight: "bold",
                        color: "goldenrod"
                    } : {
                        fontWeight: "bold",
                        color: "tomato"
                    }) : {}}>
                        {(tableDataStats["currentStatus"] === "nl") ? (
                            <Button>Sync</Button>
                        ) : (((tableDataStats["currentStatus"] === "l")) ? (
                                <>
                                    Syncing&nbsp;
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                </>
                            ) : (
                                <>
                                    LinkedIn ID not linked
                                </>
                            ) 
                        )}
                    </span>
                </div>
            );
            newTableData.push(newTableRow);
        }
        return newTableData;
    }

    useEffect(() => {

        if (liveConnected === 0) {
            return;
        }

        webSocket = new WebSocket(process.env.REACT_APP_WS_URL);

        webSocket.onopen = () => {
            makeWebSocketRequest(webSocket, {
                type: "init"
            });
        }

        webSocket.onmessage = (message) => {
            if (message == null) {
                return;
            }
            const messageJSON = JSON.parse(message.data);
            if (String(messageJSON.type) === "data") {
                setTablePages(messageJSON.pages);
                setTableHeaders(messageJSON.headers);
                setFilters(messageJSON.filters);
                messageJSON.data = processTableDataName(messageJSON.data);
                messageJSON.data = processTableDataStatus(messageJSON.data);
                setTableData(messageJSON.data);
                setRecordsNumber(messageJSON.records);
                setLiveConnected(0);
                setRequestCount(requestCount - 1);
            }
        };

        webSocket.onerror = async (error) => {
            await handleWebSocketDown();
        };

        webSocket.onclose = async (reason) => {
            await handleWebSocketDown();
        };

    }, [liveConnected]);

    const onPageUpdate = (tableCurrentPage, appliedFilters, searchText) => {
        setRequestCount(requestCount + 1);
        makeWebSocketRequest(webSocket, {
            type: "data",
            filters: appliedFilters,
            search: searchText,
            page: tableCurrentPage
        });
    };

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            <>
                <DataTable
                    setFiltersAutomatically={false}
                    tableHook={[
                        tableLoading,
                        tableHeaders,
                        tableData,
                        tablePages,
                        filters,
                        setFilters,
                        filtersApplied,
                        setFiltersApplied,
                        recordsNumber,
                        searchText,
                        setSearchText
                    ]}
                    updatePageData={onPageUpdate}
                    searchPlaceholder="Search Alumni."
                    resultsPlaceholder="Showing %r% results out of %t% Alumni%e%"
                    noResultsText="There is no alumni who matches your criteria 🤷"
                    systemDownText={
                        <div>
                            Welcome to <b>&nbsp;MUJ CAMP 🎓</b>
                            <br/><br/>
                            Please click on the &nbsp;
                            <button
                                className="btn btn-success"
                                disabled={true}
                            >
                                Update Alumni Data
                            </button>
                            &nbsp; button located above the Search Bar 🔍 to <b>load the data from AlmaShine Portal</b> and get started.
                            <br/><br/>
                            If you have <b>already clicked on that button in the past, and are seeing this message again</b>,<br/>
                            then please <b>call Abhay Tripathi (+91-8800958568)</b>.
                        </div>
                    }
                    searchDisabled={!(liveConnected === 0)}
                >
                    <div
                        style={{
                            padding: "1rem",
                            paddingBottom: "0rem",
                        }}
                        id="doarHeading"
                    >
                        {(liveConnected !== 0 && liveConnected !== -1) ? (
                            <div className="alert alert-danger">
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                &nbsp;&nbsp;
                                Connection is lost. We are trying to re-connect. Please wait or reload the page.
                            </div>
                        ): (<></>)}
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
                            Welcome to the <b>Alumni Data Management Portal</b>. Alumni Data is listed below, and can be managed from there.
                        </p>
                        <h2
                            style={{
                                fontWeight: "bold",
                                fontSynthesis: "initial",
                                paddingTop: "1rem",
                                marginLeft: "calc(-0.5rem + 17px)"
                            }}
                        >
                            Alumni List
                        </h2>
                        {(true) ? (
                            <div style={{
                                display: "flex",
                                gap: "0.5em",
                                marginTop: "0.5em",
                                flexWrap: "wrap",
                                marginLeft: "calc(-0.5rem + 17px)",
                                marginBottom: "0.8em"
                            }}>
                                <LoadButton
                                    style={{
                                        width: "fit-content"
                                    }}
                                    lbText="Update Alumni Data"
                                    type="success"
                                    lbId="updateData"
                                    lbDisabled={tableLoading}
                                    lbLoading={updateDataLoading}
                                    clickHandler={() => {
                                        setUpdateDataLoading(true);
                                    }}
                                />
                                <LoadButton
                                    style={{
                                        width: "fit-content"
                                    }}
                                    lbText="Sync All Alumni Data"
                                    type="primary"
                                    lbId="syncData"
                                    lbDisabled={tableLoading || updateDataLoading}
                                    clickHandler={() => {
                                        showAlert("Coming Soon...", toast.info)
                                    }}
                                />
                            </div>
                        ) : (<></>)}
                    </div>
                </DataTable>
            </>
        )
    )   
}

export { Home };