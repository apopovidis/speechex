import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
import App from "./components/App";
import configurePersistedStore from "./redux/configurePersistedStore";
import "./css/styles.css";

const persistedStoreConfig = configurePersistedStore();
render(
  <Provider store={persistedStoreConfig.store}>
    <BrowserRouter>
      <PersistGate loading={null} persistor={persistedStoreConfig.persistor}>
        <App />
      </PersistGate>
    </BrowserRouter>
  </Provider >,
  document.getElementById("app")
);