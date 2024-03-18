/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { ensureAdminAccess } from "../../tools/Auth";

const Dashboard = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        ensureAdminAccess("DOAR_DASHBOARD", setLoading, navigate);
    }, []);

    return (
        <>Dashboard</>
    );
}

export { Dashboard };