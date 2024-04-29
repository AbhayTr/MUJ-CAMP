/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { ensureAdminAccess } from "../../tools/Auth";
import LoadSpinner from "../../custom_components/LoadSpinner";
import BarGraph from "../../custom_components/BarGraph";

const Dashboard = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        ensureAdminAccess("DOAR_DASHBOARD", setLoading, navigate);
    }, []);

    const dataset = [
        {
            data: 70,
            key: 'IIT Madras',
        },
        {
            data: 42,
            key: 'IIT Bombay',
        },
        {
            data: 59,
            key: 'Jan49',
        },
        {
            data: 59,
            key: 'Jan39',
        },
        {
            data: 59,
            key: 'Jan29',
        },
        {
            data: 59,
            key: 'Jan28',
        },
        {
            data: 59,
            key: 'Jan27',
        },
        {
            data: 59,
            key: 'Jan26',
        },
        {
            data: 59,
            key: 'Jan25',
        },
        {
            data: 59,
            key: 'Jan24',
        },
        {
            data: 59,
            key: 'Jan23',
        },
        {
            data: 59,
            key: 'Jan22',
        },
        {
            data: 59,
            key: 'Jan21',
        },
        {
            data: 59,
            key: 'Jan20',
        },
        {
            data: 59,
            key: 'Jan19',
        },
        {
            data: 59,
            key: 'Jan18',
        },
        {
            data: 59,
            key: 'Jan17',
        },
        {
            data: 59,
            key: 'Jan16',
        },
        {
            data: 59,
            key: 'Jan15',
        },
        {
            data: 59,
            key: 'Jan14',
        },
        {
            data: 59,
            key: 'Jan13',
        },
        {
            data: 59,
            key: 'Jan12',
        },
        {
            data: 59,
            key: 'Jan11',
        },
        {
            data: 59,
            key: 'Jan10',
        },
        {
            data: 59,
            key: 'Jan9',
        },
        {
            data: 59,
            key: 'Jan8',
        },
        {
            data: 59,
            key: 'Jan7',
        },
        {
            data: 59,
            key: 'Jan6',
        },
        {
            data: 59,
            key: 'Jan5',
        },
        {
            data: 59,
            key: 'Jan4',
        },
        {
            data: 59,
            key: 'Jan3',
        },
        {
            data: 59,
            key: 'Jan2',
        },
        {
            data: 59,
            key: 'Jan1',
        },
    ];

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            <>
                <BarGraph
                    dataset={dataset}
                    title="Alumni in Top 100 Universities"
                    xLabel="No. of Alumni"
                    unit="Alumni"
                />
            </>
        )
    );
}

export { Dashboard };