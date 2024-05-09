/* eslint-disable react-hooks/exhaustive-deps */

import tableStyles from "../assets/scss/Tables.module.scss";
import headerStyles from "../assets/scss/Header.module.scss";

import optionsIcon from "../assets/images/optionsIcon.svg";
import searchIcon from "../assets/images/searchIcon.svg";

import React, { useEffect, useState } from "react";
import {
    Col,
    Row,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import { Button, Modal, Spinner } from "react-bootstrap";

import Widget from "./Widget.jsx";
import LoadButton from "./LoadButton.jsx";
import { moneyFormatIndia, scrollHorizontallyTo } from "../tools/UI.jsx";

const DataTable = (props) => {

    const {
        title = "",
        updatePageData,
        setFiltersAutomatically = true,
        tableHook,
        ignoreFilters = [],
        setTableHeight = null,
        searchPlaceholder,
        resultsPlaceholder,
        searchDisabled = false,
        recordsPerPage = 50,
        noResultsText = "No result matches your search criteria 🤷",
        systemDownText = "Yeah there is some problem with the system 😞. Please call " + process.env.REACT_APP_CONTACT_PERSON + "."
    } = props;

    const [
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
        setSearchText,
        tableCurrentPage,
        setTableCurrentPage
     ] = tableHook;

    const [sortedTableData, setSortedTableData] = useState([]);
    
    const [sortedFields, setSortedFields] = useState({});
    const [sortInvalidated, setSortInvalidated] = useState(false);

    const [headerMap, setHeaderMap] = useState({});

    const [originalPage, setOriginalPage] = useState(-1);

    const [noOfFilters, setNoOfFilters] = useState(0);

    useEffect(() => {

        const tempHeaderMap = {};
        tableHeaders.map((tableHeader, index) => {
            tempHeaderMap[tableHeader] = index;
            return null;
        });
        setHeaderMap(tempHeaderMap);

    }, [tableHeaders]);

    const [tempFiltersApplied, setTempFiltersApplied] = useState({});

    useEffect(() => {

        if (!setFiltersAutomatically) {
            return;
        }

        if (tableData.length === 0 || Object.keys(headerMap).length === 0) {
            return;
        }

        const tempFilters = {};

        tableData.map((tableRow) => {
            tableHeaders.map((tableHeader) => {
                if (ignoreFilters.includes(tableHeader)) {
                    return null;
                }
                if (tempFilters[tableHeader] == null) {
                    tempFilters[tableHeader] = {};
                    tempFilters[tableHeader][tableRow[headerMap[tableHeader]]] = 1;
                } else if (tempFilters[tableHeader][tableRow[headerMap[tableHeader]]] == null) {
                    tempFilters[tableHeader][tableRow[headerMap[tableHeader]]] = 1;
                } else {
                    tempFilters[tableHeader][tableRow[headerMap[tableHeader]]]++;
                }
                return null;
            });
            return null;
        });

        const finalTempFilter = {};
        for (let tempFilter in tempFilters) {
            const tempFilterName = tempFilter;
            tempFilter = tempFilters[tempFilter];
            const tempFilterOptions = [];
            for (let tempFilterOption in tempFilter) {
                tempFilterOptions.push([tempFilterOption, tempFilter[tempFilterOption]]);
            }
            tempFilterOptions.sort((filterOption1, filterOption2) => {
                return filterOption2[1] - filterOption1[1];
            });
            finalTempFilter[tempFilterName] = tempFilterOptions;
        }

        setFilters(finalTempFilter);

    }, [tableData, headerMap]);

    useEffect(() => {

        if (filters == null) {
            return;
        }

        let filtersCount = 0;
        for (let filter in filters) {
            filtersCount += filters[filter].length;
        }
        setNoOfFilters(filtersCount);

    }, [filters]);

    const scrollToTop = () => {
        try {
            document.getElementsByClassName("table-responsive")[0].scroll(0, 0);
        } catch (e) {}
    }

    useEffect(() => {

        if (setTableHeight == null) {
            return;
        }

        window.addEventListener("resize", setTableHeight);

        return (() => {
            window.removeEventListener("resize", setTableHeight);
        })
    }, []);

    useEffect(() => {

        if (!tableLoading) {
            try {
                scrollHorizontallyTo(document.getElementById(`page${tableCurrentPage}`));
            } catch (e) {}

            if (setTableHeight == null) {
                return;
            }
            setTableHeight();
        }

    }, [tableLoading]);

    const [choseFiltersModalShowing, setChoseFiltersModalShowing] = useState(null);

    const updatePage = () => {
        updatePageData();
        setSortInvalidated(true);
    }

    useEffect(() => {

        if (searchDisabled) {
            return;
        }

        if (filtersSortOrSearchApplied()) {
            if (originalPage === -1) {
                setOriginalPage(tableCurrentPage);
            }
            setTableCurrentPage(1);
        } else {
            if (originalPage !== -1) {
                setTableCurrentPage(originalPage);
            }
            setOriginalPage(-1);
        }

        updatePage();

    }, [filtersApplied, searchText]);

    useEffect(() => {

        if (searchDisabled) {
            return;
        }

        updatePage();

    }, [tableCurrentPage]);

    useEffect(() => {

        if (tableData.length === 0) {
            return;
        }

        const tempTableData = [...tableData];

        for (let sortedField in sortedFields) {
            tempTableData.sort((dataRowX, dataRowY) => {
                let toCompareX = String(dataRowX[headerMap[sortedField]]);
                let toCompareY = String(dataRowY[headerMap[sortedField]]);
                if (toCompareX.toLowerCase() === "[object object]") {
                    toCompareX = dataRowX[headerMap[sortedField]].props?.sortvalue || "";
                }
                if (toCompareY.toLowerCase() === "[object object]") {
                    toCompareY = dataRowY[headerMap[sortedField]].props?.sortvalue || "";
                }
                return (sortedFields[sortedField] === 0) ? (toCompareX.localeCompare(toCompareY)) : (toCompareY.localeCompare(toCompareX));
            });
        }

        scrollToTop();
        setSortInvalidated(false);
        setSortedTableData(tempTableData);

    }, [sortedFields, sortInvalidated]);

    const sortStates = {};
    tableHeaders.map((tableHeader) => {
        sortStates[tableHeader] = false;
        return null;
    });

    const [headerSortStates, setHeaderSortStates] = useState(sortStates);

    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    const tableDataToUse = ((Object.keys(sortedFields).length === 0) ? tableData : sortedTableData);

    const filtersOrSortApplied = () => {
        return !(Object.keys(filtersApplied).length === 0 && Object.keys(sortedFields).length === 0)
    }

    const filtersSortOrSearchApplied = () => {
        return filtersOrSortApplied() || searchText !== "";
    }

    const filtersAreVisible = () => {
        return (filters != null && noOfFilters > 0);
    }

    const [filterResetButtonLoading, setResetButtonFiltersLoading] = useState(false);
    
    return (
        <div>
            <Row>
                <Col>
                    <Row className="mb-4">
                        <Col>
                            <Widget>
                                {props.children}
                                {(title !== "") ? (
                                    <h3 style={{
                                        fontWeight: "bold",
                                        fontSynthesis: "initial",
                                        paddingLeft: "24px"
                                    }}>
                                        {title}
                                    </h3>
                                ) : (<></>)}
                                <div
                                    className="widget-table-overflow"
                                    style={(tableLoading) ? {
                                            height: "51vh",
                                            position: "relative"
                                        } : {
                                            position: "relative"
                                        }
                                    }
                                >
                                    {(false) ? (
                                        <></>
                                    ) : (
                                        <>
                                            <Table
                                                className={`table-striped table-borderless table-hover ${tableStyles.statesTable}`}
                                                responsive
                                            >
                                                <thead
                                                    id={`${title.toLowerCase().replaceAll(" ", "")}THead`}
                                                    style={{
                                                        position: "sticky",
                                                        top: "-24px",
                                                        background: "white",
                                                        zIndex: 1
                                                    }}
                                                >
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "0"
                                                            }}
                                                            colSpan={(tableHeaders != null) ? tableHeaders.length : null}
                                                        >
                                                            <div
                                                                className={`${tableStyles.tableTitle} ${tableStyles.search}`}
                                                                id={`${title.toLowerCase().replaceAll(" ", "")}Title`}
                                                            >
                                                                {(true) ? (
                                                                    <>
                                                                        <label htmlFor={`${title.toLowerCase().replaceAll(" ", "")}Search`}>
                                                                            <img
                                                                                className="d-sm-block"
                                                                                src={searchIcon}
                                                                                alt="Search"
                                                                                style={{
                                                                                    marginLeft: "0px",
                                                                                    marginRight: "10px"
                                                                                }}
                                                                            />
                                                                        </label>
                                                                        <input
                                                                            disabled={searchDisabled}
                                                                            type="search"
                                                                            className="form-control mr-sm-2"
                                                                            placeholder={searchPlaceholder}
                                                                            id={`${title.toLowerCase().replaceAll(" ", "")}Search`}
                                                                            onInput={(e) => {
                                                                                setSearchText(e.target.value);
                                                                            }}
                                                                            style={{
                                                                                width: "100%",
                                                                                borderStyle: "solid",
                                                                                borderWidth: "2px",
                                                                                borderRadius: "10px",
                                                                                borderColor: "black"
                                                                            }}
                                                                        />
                                                                        {(tableLoading || !filtersAreVisible()) ? (
                                                                            <></>
                                                                        ) : (
                                                                            <div className="d-flex">
                                                                                <Dropdown
                                                                                    isOpen={filterMenuOpen}
                                                                                    toggle={() => {
                                                                                        setFilterMenuOpen(!filterMenuOpen);
                                                                                    }}
                                                                                    id="basic-nav-dropdown-filter"
                                                                                >
                                                                                    <DropdownToggle
                                                                                        className="navbar-dropdown-toggle"
                                                                                        nav
                                                                                    >
                                                                                        <img
                                                                                            className="d-sm-block"
                                                                                            src={optionsIcon}
                                                                                            alt="Filters"
                                                                                            title="Filters"
                                                                                        />
                                                                                    </DropdownToggle>
                                                                                    <DropdownMenu
                                                                                        className="navbar-dropdown profile-dropdown"
                                                                                        style={{
                                                                                            width: "194px"
                                                                                        }}>
                                                                                            <DropdownItem
                                                                                                disabled
                                                                                                className={headerStyles.dropdownProfileItem}
                                                                                                style={{
                                                                                                    justifyContent: "center"
                                                                                                }}
                                                                                            >
                                                                                                <span
                                                                                                    style={{
                                                                                                    color: "#0d6efd",
                                                                                                    fontSize: "1.1em",
                                                                                                    fontWeight: "bold",
                                                                                                    fontSynthesis: "initial"
                                                                                                }}
                                                                                            >
                                                                                                Apply Filters
                                                                                            </span>
                                                                                        </DropdownItem>
                                                                                        {Object.keys(filters).map((filter) => {
                                                                                            if (!filters[filter] || filters[filter].length === 0) {
                                                                                                return (<></>);
                                                                                            }
                                                                                            return (
                                                                                                <DropdownItem
                                                                                                    key={filter}
                                                                                                    active={filtersApplied[filter] != null && filtersApplied[filter].length !== 0}
                                                                                                    style={{
                                                                                                        background: ((filtersApplied[filter] != null && filtersApplied[filter].length !== 0) ? "#198754" : ""),
                                                                                                        whiteSpace: "normal"
                                                                                                    }}
                                                                                                    className={headerStyles.dropdownProfileItem}
                                                                                                    onClick={() => {
                                                                                                        setTempFiltersApplied(filtersApplied);
                                                                                                        setChoseFiltersModalShowing(filter);
                                                                                                    }}
                                                                                                >
                                                                                                    {filter}
                                                                                                </DropdownItem>
                                                                                            );
                                                                                        })}
                                                                                    </DropdownMenu>
                                                                                </Dropdown>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {(tableLoading) ? (
                                                        <></>
                                                    ) : (
                                                        <>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding: "0"
                                                                    }}
                                                                    colSpan={tableHeaders.length}
                                                                >
                                                                    <div
                                                                        className={`${tableStyles.tableTitle} ${tableStyles.results}`}
                                                                        id={`${title.toLowerCase().replaceAll(" ", "")}Results`}
                                                                    >
                                                                        <h5
                                                                            style={{
                                                                                fontSynthesis: "initial",
                                                                                wordWrap: "break-word",
                                                                                textWrap: "wrap",
                                                                                display: "flex",
                                                                                flexWrap: "wrap"
                                                                            }}
                                                                        >
                                                                            {(tableData.length !== 0) ? (resultsPlaceholder.split(" ").map((word, index) => {
                                                                                return (
                                                                                    <span key={index}>
                                                                                        {(word === "%r%" || word === "%t%") ? (
                                                                                            <b style={{
                                                                                                color: "#3fb950"
                                                                                            }}>
                                                                                                {word.replace("%t%", moneyFormatIndia(String(recordsNumber))).replace("%r%", `${
                                                                                                    moneyFormatIndia(String(((recordsPerPage) * (tableCurrentPage - 1)) + 1))
                                                                                                } to ${
                                                                                                    moneyFormatIndia(String((((recordsPerPage) * (tableCurrentPage - 1))) + (tableData.length)))
                                                                                                }`)}
                                                                                            </b>
                                                                                        ) : (word.replace("%e%", (((filtersOrSortApplied())) ? " who match your selected criteria" : (searchText !== "") ? " who match your search criteria" : "")))}
                                                                                        {(index !== resultsPlaceholder.split(" ").length - 1) ? (<>&nbsp;</>) : (<></>)}
                                                                                    </span>
                                                                                );
                                                                            })) : (
                                                                                (filtersSortOrSearchApplied()) ? (
                                                                                    <>
                                                                                        {noResultsText}
                                                                                    </>
                                                                                ): (
                                                                                    <>
                                                                                        {systemDownText}
                                                                                    </>
                                                                                )
                                                                            )}
                                                                        </h5>
                                                                        {(filtersOrSortApplied()) ? (
                                                                            <LoadButton
                                                                                lbLoading={filterResetButtonLoading}
                                                                                lbText="Reset Filters and Sorting"
                                                                                type="danger"
                                                                                style={{
                                                                                    width: "fit-content"
                                                                                }}
                                                                                clickHandler={() => {
                                                                                    setResetButtonFiltersLoading(true);
                                                                                    setFiltersApplied({});
                                                                                    setSortedFields({});
                                                                                    setResetButtonFiltersLoading(false);
                                                                                }}
                                                                            />
                                                                        ) : (<></>)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {(tableData.length !== 0) ? (
                                                            <tr>
                                                                {tableHeaders.map((item) => {
                                                                    return (
                                                                        <th
                                                                            key={item}
                                                                            className="w-25"
                                                                        >
                                                                            <Dropdown
                                                                                isOpen={headerSortStates[item]}
                                                                                toggle={() => {
                                                                                    const newData = {
                                                                                        ...headerSortStates
                                                                                    };
                                                                                    newData[item] = !headerSortStates[item];
                                                                                    setHeaderSortStates(newData);
                                                                                }}
                                                                                id="basic-nav-dropdown-sort"
                                                                            >
                                                                                <DropdownToggle
                                                                                    nav
                                                                                    caret
                                                                                    className="navbar-dropdown-toggle"
                                                                                >
                                                                                    <span style={(sortedFields[item] != null) ? {
                                                                                        color: "darkorange"
                                                                                    } : {}}>
                                                                                        <span style={(true) ? ({
                                                                                            marginLeft: "17px"
                                                                                        }) : ({})}>
                                                                                            {item}
                                                                                        </span>
                                                                                    </span>
                                                                                </DropdownToggle>
                                                                                <DropdownMenu
                                                                                    className="navbar-dropdown profile-dropdown"
                                                                                    style={{
                                                                                        width: "194px"
                                                                                    }}>
                                                                                    <DropdownItem
                                                                                        disabled
                                                                                        className={headerStyles.dropdownProfileItem}
                                                                                        style={{
                                                                                            justifyContent: "center"
                                                                                        }}
                                                                                    >
                                                                                        <span
                                                                                            style={{
                                                                                                color: "#0d6efd",
                                                                                                fontSize: "1.1em",
                                                                                                fontWeight: "bold",
                                                                                                fontSynthesis: "initial",
                                                                                                textWrap: "pretty",
                                                                                                overflowWrap: "break-word",
                                                                                                wordBreak: "break-word",
                                                                                                whiteSpace: "normal"
                                                                                            }}
                                                                                        >
                                                                                            Sort {item}
                                                                                        </span>
                                                                                    </DropdownItem>
                                                                                    <DropdownItem
                                                                                        active={sortedFields[item] === 0}
                                                                                        className={headerStyles.dropdownProfileItem}
                                                                                        onClick={() => {
                                                                                            const newData = {
                                                                                                ...sortedFields
                                                                                            };
                                                                                            newData[item] = 0;
                                                                                            setSortedFields(newData);
                                                                                        }}
                                                                                    >
                                                                                        Ascending
                                                                                    </DropdownItem>
                                                                                    <DropdownItem
                                                                                        active={sortedFields[item] === 1}
                                                                                        className={headerStyles.dropdownProfileItem}
                                                                                        onClick={() => {
                                                                                            const newData = {
                                                                                                ...sortedFields
                                                                                            };
                                                                                            newData[item] = 1;
                                                                                            setSortedFields(newData);
                                                                                        }}
                                                                                    >
                                                                                        Descending
                                                                                    </DropdownItem>
                                                                                    <DropdownItem
                                                                                        className={headerStyles.dropdownProfileItem}
                                                                                        style={{
                                                                                            color: "tomato",
                                                                                            fontWeight: "bold",
                                                                                            fontSynthesis: "initial"
                                                                                        }}
                                                                                        onClick={() => {
                                                                                            const newData = {
                                                                                                ...sortedFields
                                                                                            };
                                                                                            delete newData[item];
                                                                                            setSortedFields(newData);
                                                                                        }}
                                                                                    >
                                                                                        Reset Sort
                                                                                    </DropdownItem>
                                                                                </DropdownMenu>
                                                                            </Dropdown>
                                                                        </th>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ) : (<></>)}
                                                        </>
                                                    )}
                                                </thead>
                                                {(false) ? (
                                                    <></>
                                                ) : (
                                                    <tbody 
                                                        style={(tableLoading) ? {
                                                            height: "24vh",
                                                            position: "relative"
                                                        } : {
                                                            userSelect: "text"
                                                        }}
                                                    >
                                                        {(tableLoading) ? (
                                                            <tr>
                                                                <td>
                                                                    <div
                                                                        className={tableStyles.loader}
                                                                    >
                                                                        <Spinner
                                                                            as="span"
                                                                            animation="border"
                                                                            size="sm"
                                                                            role="status"
                                                                            aria-hidden="true"
                                                                            className="component-loader"
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            <>
                                                                {tableDataToUse.map((item, index) => (
                                                                    <tr key={index}>
                                                                        {tableHeaders.map((itemKey, index) => {
                                                                            return (
                                                                                <td
                                                                                    key={itemKey}
                                                                                    className="align-items-center"
                                                                                >
                                                                                    <span className="ml-3">
                                                                                        {(typeof item[index] === "string") ? item[index].split("\n").map((dataLine, indexInternal) => {
                                                                                            return (
                                                                                                <span
                                                                                                    key={indexInternal}
                                                                                                    style={(true) ? ({
                                                                                                        paddingLeft: "17px",
                                                                                                        display: "inline-block"
                                                                                                    }) : ({})}
                                                                                                >
                                                                                                    {dataLine}
                                                                                                    {(indexInternal !== item[index].split("\n").length - 1) ? (<br/>) : (<></>)}
                                                                                                </span>
                                                                                            );
                                                                                        }) : (item[index])}
                                                                                    </span>
                                                                                </td>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                            </>
                                                        )}
                                                    </tbody>
                                                )}
                                            </Table>
                                            {(!tableLoading) ? (
                                                <Pagination
                                                    className="pagination-borderless"
                                                    style={{
                                                        display: "flex",
                                                        marginTop: "1rem",
                                                        overflow: "auto"
                                                    }}
                                                >
                                                    {/* <PaginationItem disabled={tableCurrentPage <= 1}>
                                                        <PaginationLink
                                                            onClick={e => setTableCurrentPage(tableCurrentPage - 1)}
                                                            previous
                                                        />
                                                    </PaginationItem> */}
                                                    {[...Array(tablePages)].map((page, index) =>
                                                        <PaginationItem
                                                            id={`page${index + 1}`}
                                                            active={tableCurrentPage === (index + 1)}
                                                            key={index + 1}
                                                        >
                                                            <PaginationLink
                                                                onClick={e => {
                                                                    if ((index + 1) === tableCurrentPage) {
                                                                        return;
                                                                    }
                                                                    setTableCurrentPage(index + 1);
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    )}
                                                    {/* <PaginationItem disabled={tableCurrentPage >= tablePages}>
                                                        <PaginationLink
                                                            onClick={e => setTableCurrentPage(tableCurrentPage + 1)}
                                                            next
                                                        />
                                                    </PaginationItem> */}
                                                </Pagination>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Widget>
                        </Col>
                    </Row>
                </Col>
            </Row>
            {(choseFiltersModalShowing != null) ? (
                <Modal
                    show={(choseFiltersModalShowing != null)}
                    onHide={() => {
                        setTempFiltersApplied({});
                        setChoseFiltersModalShowing(null);
                    }}
                >
                    <Modal.Header
                        closeButton
                        style={{
                            paddingBottom: "0px"
                        }}
                    >
                        <h3
                            className="modal-title"
                            style={{
                                color: "#0d6efd",
                                fontWeight: "bold",
                                fontSynthesis: "initial",
                                textAlign: "center"
                            }}
                        >
                            {choseFiltersModalShowing}
                        </h3>   
                    </Modal.Header>
                    <Modal.Body>
                        <>
                            <p
                                >Click on the values from below 👇, for which you want to see the {title} Records 📊 
                            </p>
                            <br/>
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.5em",
                                overflow: "auto",
                                maxHeight: "50vh"
                            }}>
                                {filters[choseFiltersModalShowing].map((filterOptionData) => {
                                    return (
                                        <div
                                            key={filterOptionData[0]}
                                            disabled
                                            className={headerStyles.dropdownProfileItem}
                                            style={{
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            <span
                                                className={`btn btn-${(tempFiltersApplied[choseFiltersModalShowing] != null && tempFiltersApplied[choseFiltersModalShowing].includes(filterOptionData[0])) ? "success" : "secondary"}`}
                                                style={{
                                                    cursor: "pointer",
                                                    userSelect: "none",
                                                    textAlign: "left"
                                                }}
                                                onClick={() => {
                                                    const newData = {
                                                        ...tempFiltersApplied
                                                    };
                                                    if (tempFiltersApplied[choseFiltersModalShowing] == null) {
                                                        newData[choseFiltersModalShowing] = [filterOptionData[0]];
                                                    } else {
                                                        if (tempFiltersApplied[choseFiltersModalShowing].includes(filterOptionData[0])) {
                                                            const indexToRemove = newData[choseFiltersModalShowing].indexOf(filterOptionData[0]);
                                                            newData[choseFiltersModalShowing].splice(indexToRemove, 1);
                                                        } else {
                                                            newData[choseFiltersModalShowing].push(filterOptionData[0]);
                                                        }
                                                    }
                                                    if (newData[choseFiltersModalShowing].length === 0) {
                                                        delete newData[choseFiltersModalShowing];
                                                    }
                                                    setTempFiltersApplied(newData);
                                                }}
                                            >
                                                <i className={`fa fa-${(tempFiltersApplied[choseFiltersModalShowing] != null && tempFiltersApplied[choseFiltersModalShowing].includes(filterOptionData[0])) ? "check" : "times"}`}/>&nbsp;&nbsp;&nbsp;{filterOptionData[0].toTitleCase()} (<b>{moneyFormatIndia(String(filterOptionData[1]))}</b>)
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setChoseFiltersModalShowing(null);
                                setFiltersApplied(tempFiltersApplied);
                            }}
                        >
                                Set Filters
                        </Button>
                    </Modal.Footer>
                </Modal>
            ) : (
                <></>
            )}
        </div>
    )
}

export default DataTable;