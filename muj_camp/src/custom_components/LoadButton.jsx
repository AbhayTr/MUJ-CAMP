/* eslint-disable react-hooks/exhaustive-deps */

import { adjustWidth } from "../tools/Visual";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LoadButton = ({
    lbLoading = false,
    lbDisabled = false,
    lbText,
    clickHandler = null,
    lbId = "lb-button",
    type = "success",
    style = {},
    onClickLoad = false,
    transitionTime = "0.3",
    path = undefined
}) => {

    const [loading, setLoading] = useState(lbLoading);

    if (onClickLoad) {
        lbLoading = loading;
    }

    const loadOnClick = () => {
        setLoading(true);
        if (clickHandler != null) {
            clickHandler();
        }
    }

    useEffect(() => {

        if (lbLoading) {
            adjustWidth(document.getElementById(lbId));
        } else {
            adjustWidth(document.getElementById(lbId), true);
        }
    
    }, [lbLoading]);

    return (
        <div className="lb-container" style={style}>
            {(path === undefined) ? (
                <Button
                    id={lbId}
                    variant={type}
                    disabled={lbLoading || lbDisabled}
                    onClick={(onClickLoad || clickHandler == null) ? loadOnClick : clickHandler}
                    className="lb-continue"
                    style={(lbLoading) ? {
                        borderRadius: "50%",
                        transition: `width ${transitionTime}s`
                    } : {}}
                >
                    {lbLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="lb-loader"
                            />
                        </>
                    ) : (
                        lbText
                    )}
                </Button>
            ) : (
                <Link
                    to={path}
                    id={lbId}
                    disabled={lbLoading || lbDisabled}
                    onClick={loadOnClick}
                    className={`lb-continue btn btn-${type}`}
                    style={(lbLoading) ? {
                        borderRadius: "50%",
                        transition: `width ${transitionTime}s`
                    } : {}}
                >
                    {lbLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="lb-loader"
                            />
                        </>
                    ) : (
                        lbText
                    )}
                </Link>
            )}
        </div>
    );
}

export default LoadButton;