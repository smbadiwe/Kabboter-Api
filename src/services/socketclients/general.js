function getQueryStringParams(queryString) {
  if (!queryString) {
    queryString = window.location.search;
  }
  if (!queryString) {
    return {};
  }

  return (/^[?#]/.test(queryString) ? queryString.slice(1) : queryString)
    .split("&")
    .reduce((params, param) => {
      let [key, value] = param.split("=");
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
      return params;
    }, {});
}

function getUserInfo() {
  // Server sent you the user info when you logged in, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = localStorage.getItem("userInfo"); //TODO: Get it from wherever you kept it.
  return JSON.parse(userInfo);
}
