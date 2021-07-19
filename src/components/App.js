import React from "react";
import { Route, Switch } from "react-router-dom";

import PageNotFound from "./PageNotFound";
import TranscriptionPage from "./TranscriptionPage";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "./LoginPage";

function App() {
  return (
    <Switch>
      <PrivateRoute exact path="/" component={TranscriptionPage} />
      <Route path="/login" component={LoginPage} />
      <Route component={PageNotFound} />
    </Switch>
  );
}

export default App;