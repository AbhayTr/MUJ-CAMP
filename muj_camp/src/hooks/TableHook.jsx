import { useState } from "react";

const useTable = () => {
    
    const [tableLoading, setTableLoading] = useState(true);

    const [tableHeaders, setTableHeaders] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [tablePages, setTablePages] = useState(1);

    const [filters, setFilters] = useState({});
    const [filtersApplied, setFiltersApplied] = useState({});

    const [recordsNumber, setRecordsNumber] = useState(0);

    const [searchText, setSearchText] = useState("");
    
    const [tableCurrentPage, setTableCurrentPage] = useState(1);

    return [
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
        setSearchText,
        tableCurrentPage,
        setTableCurrentPage
    ];

}

export default useTable;