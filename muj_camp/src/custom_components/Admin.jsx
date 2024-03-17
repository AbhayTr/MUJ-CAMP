/* eslint-disable react-hooks/exhaustive-deps */

import headerStyles from "../assets/scss/Header.module.scss";
import layoutStyles from "../assets/scss/Layout.module.scss";

import React, { useEffect, useState } from "react";
import {
    Navbar,
    Nav,
    NavLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import { connect } from "react-redux";
import "animate.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ProfileIcon from "../assets/images/profileIcon";
import logoutIcon from "../assets/images/logoutOutlined.svg";
import Sidebar from "./SideBar";
import { AdminPages } from "../constants/roles";
import { AuthStore } from "../app_state/auth/auth";
import { validateSession } from "../tools/Auth";
import { confirmLogout, showAlert } from "../tools/UI";

let AdminLayout = ({
    adminPage = "Home"
}) => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        validateSession((sessionExisted) => {
            if (!sessionExisted) {
                showAlert("Please sign-in to continue.", toast.info, false);
                navigate("/");
            } else {
                setLoading(false);
            }
        }, null, false, true);
    }, []);

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        (loading) ? (<></>) : (
            <div style={{display: "flex"}}>
                <Sidebar />
                <div style={{flex: "1 1 auto"}}>
                    <div className={layoutStyles.root}>
                        <div className={layoutStyles.wrap}>
                            <Navbar className={`${headerStyles.root} d-print-none`}>
                                <div className={`d-md-none mr-3 ${headerStyles.navItem}`}>
                                    <h1>{adminPage}</h1>
                                </div>
                                <div className="d-none d-sm-block" inline="true">
                                    <h1>{adminPage}</h1>
                                </div>
                                <Nav className="ml-auto">
                                    <Dropdown
                                        isOpen={menuOpen}
                                        toggle={() => toggleMenu()}
                                        nav id="basic-nav-dropdown"
                                        className="ml-3"
                                    >
                                        <DropdownToggle
                                            nav
                                            caret
                                            className="navbar-dropdown-toggle"
                                        >
                                            <span className={`${headerStyles.avatar} rounded-circle float-left mr-2`}>
                                                <img
                                                    src="https://flatlogic.github.io/sofia-react-template/static/media/user.13df436f.svg"
                                                    alt="User"
                                                />
                                            </span>
                                            <span className="small d-none d-sm-block ml-1 mr-2 body-1">
                                                Christina Carey
                                            </span>
                                        </DropdownToggle>
                                        <DropdownMenu
                                            className="navbar-dropdown profile-dropdown"
                                            style={{
                                                width: "194px"
                                            }}>
                                            <DropdownItem className={headerStyles.dropdownProfileItem}>
                                                <ProfileIcon />
                                                <span>Profile</span>
                                            </DropdownItem>
                                            <NavLink>
                                                <button
                                                    onClick={async () => {
                                                        await confirmLogout(navigate);
                                                    }}
                                                    className="btn btn-primary rounded-pill mx-auto logout-btn"
                                                >
                                                    <img
                                                        src={logoutIcon}
                                                        alt="Logout"
                                                    />
                                                    <span className="ml-1">Logout</span>
                                                </button>
                                            </NavLink>
                                        </DropdownMenu>
                                    </Dropdown>
                                </Nav>
                            </Navbar>
                            <main className={headerStyles.content}>
                                <Routes>
                                    {AdminPages[AuthStore.getState().authRole].map((adminPage) => {
                                        return (
                                            <Route
                                                key={adminPage.path}
                                                path={adminPage.path}
                                                element={adminPage.component}
                                            />     
                                        );
                                    })}
                                </Routes>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

const mapNavigateStateToAdmin = (navigateState) => ({
    adminPage: navigateState.adminPage
});

AdminLayout = connect(
    mapNavigateStateToAdmin,
    null
)(AdminLayout);

export default AdminLayout;