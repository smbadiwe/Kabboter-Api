const userType = {
  Teacher: 1,
  Student: 2
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

const Enums = { UserType: userType, Audience: audience, VisibleTo: visibleTo };
export default Enums;
