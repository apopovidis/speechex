import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isAuthenticated } from "../actions/authentication";
import { logout } from "../redux/actions/authentication";

const Header = props => {
  const handleSubmit = async e => {
    e.preventDefault();
    props.dispatch(logout());
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div style={{ margin: "20px 0 20px 0" }} className="container-fluid">
      <div className="row">
        <div className="col">
          <form>
            <button type="submit" className="btn btn-primary btn-md" onClick={handleSubmit}>
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(Header);
