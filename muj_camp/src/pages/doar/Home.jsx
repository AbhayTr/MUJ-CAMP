/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import { ensureAdminAccess } from "../../tools/Auth";
import DataTable from "../../custom_components/Table";
import LoadSpinner from "../../custom_components/LoadSpinner";
import { AuthStore } from "../../app_state/auth/auth";
import useTable from "../../hooks/TableHook";

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
    
    useEffect(() => {
        ensureAdminAccess("DOAR", setLoading, navigate);
    }, []);

    const onPageUpdate = (tableCurrentPage) => {
        
    };

    const { sendMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
        onOpen: () => {
            sendMessage(JSON.stringify({
                "authToken": AuthStore.getState().authToken,
                "authEmail": AuthStore.getState().authEmail
            }));
        },
        onMessage: (message) => {
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
            }
        },
        shouldReconnect: (closeEvent) => true,
    });

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
                >
                    <div
                        style={{
                            padding: "1rem"
                        }}
                        id="doarHeading"
                    >
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