/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ensureAdminAccess } from "../../tools/Auth";
import Tables from "../../custom_components/Table";

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        ensureAdminAccess("DOAR", setLoading, navigate);
    }, []);

    return (
        <>
            <Tables />
        </>
    )   
}

export { Home };