import { Spinner } from "react-bootstrap";

const LoadSpinner = ({
    title = ""
}) => (
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
            {(title === "") ? (
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="component-loader"
                />
            ) : (
                <div style={{
                    width: "80%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1em",
                    flexDirection: "column"
                }}>
                    <span style={{
                        textAlign: "center",
                        fontSize: "2.1em",
                        fontWeight: "bold"
                    }}>
                        {title}
                    </span>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="component-loader"
                    />
                </div>
            )}
        </div>
    </>
);

export default LoadSpinner;