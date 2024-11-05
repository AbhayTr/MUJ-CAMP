/* eslint-disable react-hooks/exhaustive-deps */

import mujLogo from "../assets/images/muj.png";
import mujLogoWhite from "../assets/images/muj_white.png";
import doarLogo from "../assets/images/doar.png";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";

import { AuthStore } from "../app_state/auth/auth";
import { confirmLogout, showCredits } from "../tools/UI";
import { useEffect } from "react";

const ManipalBar = ({ type = 0 }) => {

    useEffect(() => {
        if (type === 1) {
            const menuIcon = document.getElementsByClassName("navbar-toggler-icon")[0];
            menuIcon.className = "";
            menuIcon.innerText = "A";
        }
    }, []);

    const navigate = useNavigate();

    switch (type) {
        case 0:
            return (
                <Navbar
                    expand="lg"
                    className="home-logo-container bg-body-tertiary"
                >
                    <Container>
                        <Navbar.Brand
                            disabled
                            onClick={() => {
                                navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                            }}
                            style={{
                                cursor: "pointer"
                            }}
                        >
                            <img
                                className="home-logo"
                                src = {mujLogo}
                                alt = "Manipal"
                            />
                            <img
                                className="doar-logo"
                                src = {doarLogo}
                                alt = "DoAR"
                            />
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto">
                                <Nav.Link
                                    href="https://mujalumni.in/"
                                    target="_blank"
                                    style={{
                                        color: "white"
                                    }}
                                >
                                    MUJ Alumni Portal
                                </Nav.Link>
                                <Nav.Link
                                    href="https://jaipur.manipal.edu"
                                    target="_blank"
                                    style={{
                                        color: "white"
                                    }}
                                >
                                    MUJ Home
                                </Nav.Link>
                                <Nav.Link
                                    onClick={async () => {
                                        await showCredits();
                                    }}
                                    style={{
                                        color: "white"
                                    }}
                                >
                                    Credits
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            );
        case 1:
            return (
                <Navbar
                    expand="lg"
                    className="navbar-dark"
                >
                    <Container>
                        <Navbar.Brand
                            disabled
                            onClick={() => {
                                navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                            }}
                            style={{
                                cursor: "pointer"
                            }}
                        >
                            <img
                                className="home-logo"
                                style={{
                                    height: "4.2rem"
                                }}
                                src = {mujLogoWhite}
                                alt = "Manipal"
                            />
                        </Navbar.Brand>
                        <Navbar.Toggle
                            aria-controls="basic-navbar-nav"
                            style={{
                                height: "4rem",
                                width: "4rem",
                                display: "flex",
                                alignItems: "center",
                                fontWeight: "bold",
                                justifyContent: "center",
                                fontSize: "2.4rem",
                                backgroundColor: "#e25427",
                                borderColor: "#F4C430 white green",
                                borderStyle: "solid",
                                borderWidth: "0.09em",
                                color: "white",
                                borderRadius: "50%",
                                transition: "var(--bs-navbar-toggler-transition)"
                            }}
                        />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto">
                                <Nav.Link
                                    href="#"
                                    disabled
                                    style={{
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "1.4em"
                                    }}
                                    className="muj-camp-heading"
                                >
                                    {AuthStore.getState().authName}
                                </Nav.Link>
                                <Nav.Link
                                    onClick={async () => {
                                        await confirmLogout(navigate);
                                    }}
                                    target="_blank"
                                    style={{
                                        color: "white",
                                        fontSize: "1.3em"
                                    }}
                                >
                                    Logout
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            );
        default:
            return (<></>);
    }
}

export default ManipalBar;