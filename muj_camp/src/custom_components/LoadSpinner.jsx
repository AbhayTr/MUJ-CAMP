import { Spinner } from "react-bootstrap";

const LoadSpinner = () => (
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
);

export default LoadSpinner;