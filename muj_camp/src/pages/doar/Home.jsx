/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import { ensureAdminAccess, makeWebSocketRequest } from "../../tools/Auth";
import DataTable from "../../custom_components/Table";
import LoadSpinner from "../../custom_components/LoadSpinner";
import { AuthStore } from "../../app_state/auth/auth";
import useTable from "../../hooks/TableHook";

let webSocket = null;

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [liveConnected, setLiveConnected] = useState(-1);

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
        setFiltersApplied
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
        setLiveConnected(liveConnected + 2);
    };

    useEffect(() => {

        if (liveConnected === 0) {
            return;
        }

        webSocket = new WebSocket(process.env.REACT_APP_WS_URL);

        webSocket.onopen = () => {
            makeWebSocketRequest(webSocket, {
                type: "init"
            });
        };

        webSocket.onmessage = (message) => {
            if (message == null) {
                return;
            }
            const messageJSON = JSON.parse(message.data);
            if (String(messageJSON.type) === "data") {
                setTablePages(messageJSON.pages);
                setTableHeaders(messageJSON.headers);
                setFilters(messageJSON.filters);
                setTableData(messageJSON.data);
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

    const onPageUpdate = (tableCurrentPage) => {
        
    };

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            <>
                <DataTable
                    title="Alumni List"
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
                        setFiltersApplied
                    ]}
                    updatePageData={onPageUpdate}
                    setTableHeight={setTableHeight}
                >
                    <div
                        style={{
                            padding: "1rem"
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
                    </div>
                </DataTable>
            </>
        )
    )   
}

export { Home };