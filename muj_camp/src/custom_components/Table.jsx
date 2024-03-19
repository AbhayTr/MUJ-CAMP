/* eslint-disable react-hooks/exhaustive-deps */

import tableStyles from "../assets/scss/Tables.module.scss";
import headerStyles from "../assets/scss/Header.module.scss";

import cloudIcon from "../assets/images/tables/cloudIcon.svg";
import funnelIcon from "../assets/images/tables/funnelIcon.svg";
import optionsIcon from "../assets/images/tables/optionsIcon.svg";
import printerIcon from "../assets/images/tables/printerIcon.svg";
import searchIcon from "../assets/images/tables/searchIcon.svg";

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

import Widget from "./Widget.jsx";

const DataTable = (props) => {

    const {
        title,
        updatePageData
    } = props;

    const [tableLoading, setTableLoading] = useState(true);

    const [tableHeaders, setTableHeaders] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [tableCurrentPage, setTableCurrentPage] = useState(1);
    const [tablePages, setTablePages] = useState(1);

    const [sortedFields, setSortedFields] = useState({});

    const [headerMap, setHeaderMap] = useState({});

    useEffect(() => {

        const tempHeaderMap = {};
        tableHeaders.map((tableHeader, index) => {
            tempHeaderMap[tableHeader] = index;
            return null;
        });
        setHeaderMap(tempHeaderMap);

    }, [tableHeaders]);

    useEffect(() => {
        setTableLoading(true);
        updatePageData(tableCurrentPage, setTableLoading, setTableHeaders, setTableData, setTablePages, sortedFields);
    }, [tableCurrentPage]);

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

        setTableData(tempTableData);

    }, [sortedFields]);

    const sortStates = {};
    tableHeaders.map((tableHeader) => {
        sortStates[tableHeader] = false;
        return null;
    });

    const [headerSortStates, setHeaderSortStates] = useState(sortStates);

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
                                        <a href="/#">
                                            <img
                                                src={searchIcon}
                                                alt="Search"
                                            />
                                        </a>
                                        <a href="/#">
                                            <img
                                                className="d-none d-sm-block"
                                                src={cloudIcon}
                                                alt="Cloud"
                                            />
                                        </a>
                                        <a href="/#">
                                            <img
                                                src={printerIcon}
                                                alt="Printer"
                                            />
                                        </a>
                                        <a href="/#">
                                            <img
                                                className="d-none d-sm-block"
                                                src={optionsIcon}
                                                alt="Options"
                                            />
                                        </a>
                                        <a href="/#" title="Filter">
                                            <img
                                                src={funnelIcon}
                                                alt="Filter"
                                            />
                                        </a>
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
                                                                        id="basic-nav-dropdown"
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
                                                    {tableData.map((item, index) => (
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