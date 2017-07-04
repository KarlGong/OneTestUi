import React from "react";
import {render} from "react-dom";
import {AppContainer} from "react-hot-loader";
import App from "./App";

render(
    <AppContainer>
        <App/>
    </AppContainer>,
    document.getElementById("app")
);

if (module.hot && process.env.NODE_ENV !== "production") {
    module.hot.accept();
}
