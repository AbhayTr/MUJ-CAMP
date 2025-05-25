import React from "react";
import PropTypes from "prop-types";

import widgetStyles from "../assets/scss/Widget.module.scss";
import classNames from "classnames";

const Widget = (props) => {
    
    const {
        title = null,
        className = "",
        headerClass = "",
        children = [],
        ...restProps
    } = props;

    return (
        <>
            <section
                className={`${widgetStyles.widget} ${className}`}
                {...restProps}
            >
                {title && (
                    <div className={classNames(headerClass, widgetStyles.title)}>
                        {title}
                    </div>)}
                <div>
                    {children}
                </div>
            </section>
        </>
    );
}

Widget.propTypes = {
    title: PropTypes.node,
    className: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    options: PropTypes.object
}

export default Widget;