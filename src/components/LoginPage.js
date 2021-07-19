import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { login } from "../redux/actions/authentication";
import { getSafely } from "../js/genericFunctions";

// TODO: import via env
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/
const minPasswordLength = 8;
const maxPasswordLength = 255;

const LoginPage = ({ dispatch, history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const success = res => {
    localStorage.setItem("accessToken", res.accessToken);
    history.push("/");
  }

  const fail = err => {
    let message = "an unexpected error occured";
    if (err) {
      message = getSafely(() => `${err.error}: ${err.res.errors.error}`,message);
    }
    setMessage(message);
  }

  const handleSubmit = e => {
    try {
      e.preventDefault();

      if (!email || !password) {
        setMessage("Please fill in both email and password");
        return;
      }

      if (!email.match(EMAIL_REGEX)) {
        setMessage("Please enter a valid email");
        return;
      }

      if (password.length < minPasswordLength) {
        setMessage(`Password must be at least ${minPasswordLength} characters long`);
        return;
      }

      if (password.length > maxPasswordLength) {
        setMessage(`Password must be at most ${maxPasswordLength} characters long`);
        return;
      }

      dispatch(login(email, password, success, fail)).then(res => success(res)).catch(err => fail(err));
    } catch (e) {
      setMessage(e);
    }
  };

  return (
    <div
      className="container-fluid login-container"
    >
      <form>
        <div className="mb-3">
          <input
            style={{ textAlign: "center" }}
            autoFocus
            type="text"
            className="form-control"
            id="email"
            placeholder="email"
            onChange={e => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="mb-3">
          <input
            style={{ textAlign: "center" }}
            type="password"
            className="form-control"
            id="password"
            placeholder="password"
            onChange={e => setPassword(e.target.value)}
            value={password}
            autoComplete="off"
          />
        </div>
        <div style={{ margin: "1em", color: "#cc0000", fontWeight: "bold" }}>{message}</div>
        <button
          type="submit"
          className="btn btn-light btn-md"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

LoginPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default connect()(LoginPage);
