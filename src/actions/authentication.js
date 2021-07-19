import jwt_decode from "jwt-decode";

export const isAuthenticated = () => {
  try {
    // check if token is defined
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return false;
    }

    // check if token has expired
    const { exp } = jwt_decode(accessToken);
    if (Date.now() >= exp * 1000) {
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
