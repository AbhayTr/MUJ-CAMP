/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ensureAdminAccess } from "../../tools/Auth";
import DataTable from "../../custom_components/Table";
import LoadSpinner from "../../custom_components/LoadSpinner";
import { AuthStore } from "../../app_state/auth/auth";

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        ensureAdminAccess("DOAR", setLoading, navigate);
    }, []);

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            <>
                <DataTable
                    title="Alumni List"
                    updatePageData={(tableCurrentPage, setTableLoading, setTableHeaders, setTableData, setTablePages, sortedFields) => {
                        setTableHeaders([
                            "Apple",
                            "Ball",
                            "Cat",
                            "Dick"
                        ]);
                        setTablePages(3);
                        if (sortedFields["Apple"] == null) {
                            setTableData((tableCurrentPage === 1) ? [
                                [
                                    "A",
                                    "B",
                                    "C",
                                    "D"
                                ],
                                [
                                    "A1",
                                    "B1",
                                    "C1",
                                    "D1"
                                ],
                                [
                                    "A3",
                                    "B2",
                                    "C2",
                                    "D2"
                                ],
                                [
                                    "A2",
                                    "B3",
                                    "C3",
                                    "D3"
                                ],
                            ] : [
                                [
                                    "A7",
                                    "B4",
                                    "C4",
                                    "D4"
                                ],
                                [
                                    "A6",
                                    "B5",
                                    "C5",
                                    "D5"
                                ],
                                [
                                    "A5",
                                    "B6",
                                    "C6",
                                    "D6"
                                ],
                                [
                                    "A4",
                                    "B7",
                                    "C7",
                                    "D7"
                                ],
                            ]);
                        } else {
                            setTableData((tableCurrentPage === 1) ? [
                                [
                                    "A",
                                    "B",
                                    "C",
                                    "D"
                                ],
                                [
                                    "A1",
                                    "B1",
                                    "C1",
                                    "D1"
                                ],
                                [
                                    "A2",
                                    "B2",
                                    "C2",
                                    "D2"
                                ],
                                [
                                    "A3",
                                    "B3",
                                    "C3",
                                    "D3"
                                ],
                            ] : [
                                [
                                    "A4",
                                    "B4",
                                    "C4",
                                    "D4"
                                ],
                                [
                                    "A5",
                                    "B5",
                                    "C5",
                                    "D5"
                                ],
                                [
                                    "A6",
                                    "B6",
                                    "C6",
                                    "D6"
                                ],
                                [
                                    "A7",
                                    "B7",
                                    "C7",
                                    "D7"
                                ],
                            ]);
                        }
                        setTableLoading(false);
                    }}
                >
                    <div style={{
                        padding: "1rem"
                    }}>
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