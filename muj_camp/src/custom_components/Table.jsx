/* eslint-disable react-hooks/exhaustive-deps */

import tableStyles from "../assets/scss/Tables.module.scss";
import headerStyles from "../assets/scss/Header.module.scss";

import optionsIcon from "../assets/images/tables/optionsIcon.svg";

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

const DataTable = (props) => {

    const {
        title,
        updatePageData,
        setFiltersAutomatically = true,
        ignoreFilters = []
    } = props;

    const [tableLoading, setTableLoading] = useState(true);

    const [tableHeaders, setTableHeaders] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [sortedTableData, setSortedTableData] = useState([]);

    const [tableCurrentPage, setTableCurrentPage] = useState(1);
    const [tablePages, setTablePages] = useState(1);

    const [sortedFields, setSortedFields] = useState({});
    const [sortInvalidated, setSortInvalidated] = useState(false);

    const [headerMap, setHeaderMap] = useState({});

    useEffect(() => {

        const tempHeaderMap = {};
        tableHeaders.map((tableHeader, index) => {
            tempHeaderMap[tableHeader] = index;
            return null;
        });
        setHeaderMap(tempHeaderMap);

    }, [tableHeaders]);

    const [filters, setFilters] = useState({});
    const [tempFiltersApplied, setTempFiltersApplied] = useState({});
    const [filtersApplied, setFiltersApplied] = useState({});

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

    const scrollToTop = () => {
        try {
            document.getElementsByClassName("table-responsive")[0].scroll(0, 0);
        } catch (e) {}
    }

    const setTableHeight = () => {
        try {
            const tableHeight = (document.getElementById("main-content").offsetHeight) - ((document.getElementById("doarHeading").offsetHeight) + (document.getElementById("alumnilistTitle").offsetHeight) + 90);
            document.getElementsByClassName("table-responsive")[0].style.maxHeight = ((tableHeight > 100) ? `${tableHeight}px` : "unset");
        } catch (e) {}
    }

    useEffect(() => {

        window.addEventListener("resize", setTableHeight);

        return (() => {
            window.removeEventListener("resize", setTableHeight);
        })
    }, []);

    useEffect(() => {

        if (!tableLoading) {
            setTableHeight();
        }

    }, [tableLoading]);

    const [choseFiltersModalShowing, setChoseFiltersModalShowing] = useState(null);

    const updatePage = () => {
        setTableLoading(true);
        updatePageData(tableCurrentPage, setTableLoading, setTableHeaders, setTableData, setTablePages, setFilters, filtersApplied);
        setSortInvalidated(true);
    }

    useEffect(() => {
        updatePage();
    }, [tableCurrentPage, filtersApplied]);

    useEffect(() => {

        if (tableData.length === 0) {
            return;
        }

        const tempTableData = [...tableData];

        for (let sortedField in sortedFields) {
            tempTableData.sort((dataRowX, dataRowY) => {
                return (sortedFields[sortedField] === 0) ? (String(dataRowX[headerMap[sortedField]]).localeCompare(String(dataRowY[headerMap[sortedField]]))) : (String(dataRowY[headerMap[sortedField]]).localeCompare(String(dataRowX[headerMap[sortedField]])));
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

    const tableDataToUse = ((Object.keys(sortedFields) === 0) ? tableData : sortedTableData);
    return (
        <div>
            <Row>
                <Col>
                    <Row className="mb-4">
                        <Col>
                            <Widget>
                                {props.children}
                                <div
                                    className={tableStyles.tableTitle}
                                    id={`${title.toLowerCase().replaceAll(" ", "")}Title`}
                                >
                                    <h3 style={{
                                        fontWeight: "bold",
                                        fontSynthesis: "initial"
                                    }}>
                                        {title}
                                    </h3>
                                    {(!tableLoading) ? (
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
                                                        return (
                                                            <DropdownItem
                                                                key={filter}
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
                                    ) : (
                                        <></>
                                    )}
                                </div>
                                <div
                                    className="widget-table-overflow"
                                    style={(tableLoading) ? {
                                            height: "51vh"
                                        } : {}
                                    }
                                >
                                    {(tableLoading) ? (
                                        <>
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    maxHeight: "100%",
                                                    maxWidth: "100%",
                                                    top: "0",
                                                    bottom: "0",
                                                    left: "0",
                                                    right: "0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}
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
                                        </>
                                    ) : (
                                        <>
                                            <Table
                                                className={`table-striped table-borderless table-hover ${tableStyles.statesTable}`}
                                                responsive
                                            >
                                                <thead>
                                                    <tr>
                                                        {tableHeaders.map((item) => {
                                                            return (
                                                                <th
                                                                    key={item}
                                                                    className="w-25"
                                                                    style={{
                                                                        position: "sticky",
                                                                        top: 0
                                                                    }}
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
                                                                                {item}
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
                                                                                        fontSynthesis: "initial"
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
                                                </thead>
                                                <tbody 
                                                    style={{
                                                        userSelect: "text"
                                                    }}
                                                >
                                                    {tableDataToUse.map((item, index) => (
                                                        <tr key={index}>
                                                            {tableHeaders.map((itemKey, index) => {
                                                                return (
                                                                    <td
                                                                        key={itemKey}
                                                                        className="align-items-center"
                                                                    >
                                                                        <span className="ml-3">
                                                                            {item[index]}
                                                                        </span>
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <Pagination
                                                className="pagination-borderless"
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center"
                                                }}
                                            >
                                                <PaginationItem disabled={tableCurrentPage <= 1}>
                                                    <PaginationLink
                                                        onClick={e => setTableCurrentPage(tableCurrentPage - 1)}
                                                        previous
                                                    />
                                                </PaginationItem>
                                                {[...Array(tablePages)].map((page, index) =>
                                                    <PaginationItem
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
                                                <PaginationItem disabled={tableCurrentPage >= tablePages}>
                                                    <PaginationLink
                                                        onClick={e => setTableCurrentPage(tableCurrentPage + 1)}
                                                        next
                                                    />
                                                </PaginationItem>
                                            </Pagination>
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
                    <Modal.Header closeButton />
                    <Modal.Body>
                        <>
                            <h1 style={{
                                color: "#0d6efd",
                                fontWeight: "bold",
                                fontSynthesis: "initial",
                                textAlign: "center"
                            }}>
                                {choseFiltersModalShowing}
                            </h1>
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
                                                className={`alert alert-${(tempFiltersApplied[choseFiltersModalShowing] != null && tempFiltersApplied[choseFiltersModalShowing].includes(filterOptionData[0])) ? "primary" : "secondary"}`}
                                                style={{
                                                    cursor: "pointer",
                                                    userSelect: "none"
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
                                                            newData[choseFiltersModalShowing] = newData[choseFiltersModalShowing].slice(0, indexToRemove).concat(newData[choseFiltersModalShowing].slice(indexToRemove + 1));
                                                        } else {
                                                            newData[choseFiltersModalShowing].push(filterOptionData[0]);
                                                        }
                                                    }
                                                    setTempFiltersApplied(newData);
                                                }}
                                            >
                                                {filterOptionData[0]} ({filterOptionData[1]})
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