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
        setRecordsNumber
    ] = useTable();

    const setTableHeight = () => {
        try {
            const tableHeight = (document.getElementById("main-content").offsetHeight) - ((document.getElementById("doarHeading").offsetHeight) + (document.getElementById("alumnilistTitle").offsetHeight) + 103);
            document.getElementsByClassName("table-responsive")[0].style.maxHeight = ((tableHeight > 100) ? `${tableHeight}px` : "unset");
        } catch (e) {}
    }
    
    useEffect(() => {

        ensureAdminAccess("DOAR", setLoading, navigate);

        return (() => {
            try {
                webSocket.close();
            } catch (e) {}
        });

    }, []);

    const handleWebSocketDown = async () => {
        setTableLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            document.getElementById("main-content").scroll(0, 0);
        } catch (e) {}
        setFilters({});
        setLiveConnected(liveConnected + 2);
    };

    const processTableData = (serverTableData) => {
        const newTableData = [];
        for (let i = 0; i < serverTableData.length; i++) {
            let newTableRow = [...serverTableData[i]];
            let tableDataStats = JSON.parse(newTableRow[newTableRow.length - 1]);
            newTableRow[newTableRow.length - 1] = (
                <div style={{
                    padding: "17px"
                }}>
                    Last updated at:&nbsp;
                    <span style={{
                        color: "#3fb950",
                        fontSynthesis: "initial",
                        fontWeight: "bold"
                    }}>
                        {timestampToHumanTime(tableDataStats["lu"])}
                    </span>
                    <br/>
                    Last update status:&nbsp;
                    <span style={{
                        color: (tableDataStats["ls"] === "s") ? "#3fb950" : "tomato",
                        fontSynthesis: "initial",
                        fontWeight: "bold"
                    }}>
                        {(tableDataStats["ls"] === "s") ? "Successfully Synced" : "Sync Failed"}
                    </span>
                    <br/><br/>
                    Current status:&nbsp;
                    <span style={(tableDataStats["cs"] !== "nl") ? {
                        fontWeight: "bold",
                        color: "goldenrod"
                    } : {}}>
                        {(tableDataStats["cs"] === "nl") ? (
                            <Button>Sync</Button>
                        ) : (
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

        webSocket.onopen = (message) => {
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
                messageJSON.data = processTableData(messageJSON.data);
                setTableData(messageJSON.data);
                setRecordsNumber(messageJSON.records);
                setTableLoading(false);
                setLiveConnected(0);
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
                        setTableLoading,
                        tableHeaders,
                        tableData,
                        tablePages,
                        filters,
                        setFilters,
                        filtersApplied,
                        setFiltersApplied,
                        recordsNumber
                    ]}
                    updatePageData={onPageUpdate}
                    setTableHeight={setTableHeight}
                    searchPlaceholder="Search Alumni."
                    resultsPlaceholder="Showing %r% results out of %t% Alumni%e%"
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
                            fontWeight: "bold"
                        }}>
                            Hello {AuthStore.getState().authName} 👋
                        </h4>
                        <p style={{
                            textAlign: "justify"
                        }}>
                            Welcome to the <b>Alumni Data Management Portal</b>. Alumni Data is listed below, and can be managed from there.
                        </p>
                        <h2 style={{
                            fontWeight: "bold",
                            fontSynthesis: "initial",
                            paddingTop: "1rem"
                        }}>
                            Alumni List
                        </h2>
                        {(true) ? (
                            <div style={{
                                display: "flex",
                                gap: "0.5em",
                                marginTop: "0.5em"
                            }}>
                                <LoadButton
                                    style={{
                                        marginBottom: "0.8em",
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
                                        width: "fit-content",
                                        marginBottom: "0.8em"
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