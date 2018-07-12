const userType = {
  Teacher: 1,
  StudentOver16: 2,
  StudentUnder16: 3,
  InBusiness: 4,
  SocialUser: 5
};
//Object.freeze(userType);
const audience = {
  Social: 1,
  School: 2
};
//Object.freeze(audience);
const visibleTo = {
  Everyone: 1,
  OnlyMe: 2
};
//Object.freeze(visibleTo);

// ALWAYS sync with the definition in /public/js/app.js
const userRoleOptions = {
  Players: 1,
  Moderator: 2,
  SuperAdmin: 3
};

const Enums = {
  UserType: userType,
  Audience: audience,
  VisibleTo: visibleTo,
  UserRoleOptions: userRoleOptions
};
export default Enums;
