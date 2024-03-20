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
import { Spinner } from "react-bootstrap";
import { alert } from "react-bootstrap-confirmation";

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
                    tempFilters[tableHeader] = new Set([]);
                }
                tempFilters[tableHeader].add(tableRow[headerMap[tableHeader]]);
                return null;
            });
            return null;
        });

        setFilters(tempFilters);

    }, [tableData, headerMap]);

    const getFilters = async (filter) => {
        await alert((
            <div key={filter}>
                <h1>{filter}</h1>
                <br/>
                {Array.from(filters[filter]).map((filterOption) => {
                    return (
                        <h4>{filterOption}</h4>
                    )
                })}
            </div>
        ));
    }

    useEffect(() => {
        setTableLoading(true);
        updatePageData(tableCurrentPage, setTableLoading, setTableHeaders, setTableData, setTablePages, setFilters, filtersApplied);
        setSortInvalidated(true);
    }, [tableCurrentPage, filtersApplied]);

    useEffect(() => {

        if (tableData.length === 0) {
            return;
        }

        const tempTableData = [...tableData];

        for (let sortedField in sortedFields) {
            tempTableData.sort((dataRowX, dataRowY) => {
                return (sortedFields[sortedField] === 0) ? (dataRowX[headerMap[sortedField]].localeCompare(dataRowY[headerMap[sortedField]])) : (dataRowY[headerMap[sortedField]].localeCompare(dataRowX[headerMap[sortedField]]));
            });
        }

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
                                <div className={tableStyles.tableTitle}>
                                    <div className="headline-2">{title}</div>
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
                                                            onClick={async () => {
                                                                await getFilters(filter);
                                                            }}
                                                        >
                                                            {filter}
                                                        </DropdownItem>
                                                    );
                                                })}
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div
                                    className="widget-table-overflow"
                                    style={(tableLoading) ? {
                                            height: "61vh"
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
                                            <Table className={`table-striped table-borderless table-hover ${tableStyles.statesTable}`} responsive>
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
                                                <tbody>
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
        </div>
    )
}

export default DataTable;