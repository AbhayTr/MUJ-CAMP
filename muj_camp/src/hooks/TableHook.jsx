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
        setSearchText
    ];

}

export default useTable;