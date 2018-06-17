## Login

**POST to /login**

### Request Data

A JSON object with the following keys.

| Key            | Required? | Type    | Description                          |
| -------------- | --------- | ------- | ------------------------------------ |
| **username**   | Yes       | string  | Username or email.                   |
| **password**   | Yes       | string  | The password.                        |
| **rememberme** |           | boolean | Tell us if we need to remember user. |

### Response Data

A JSON object with the following keys. Use this data to customize client display. For instance, you can display the logged-in user's names, username, email and/or user roles somewhere on the landing page. You can save it on the browser - localStorage or sessionStorage; but not cookies since we don't need you to be sending it to the server with every request.
| Key | Type | Description |
| --------------| ------- | ------ |
| **token** | string | The auth token. We'll verify if on every request to protected resource. Set it in request header line this: _request.headers["Authorization"] = "Bearer " + token;_ to every subsequent request. |
| **user** | Object | Some info about the user. [See definition](#user) |

#### **user**

| Key   | Type    | Description                                     |
| ----- | ------- | ----------------------------------------------- |
| **i** | integer | User db id. You may need it for querying later. |
| **u** | string  | The username.                                   |
| **e** | string  | User's email.                                   |
| **f** | string  | User's first name                               |
| **l** | string  | User's last name.                               |
| **r** | string  | User's roles.                                   |

NB: You can save the token on the browser's localStorage or sessionStorage.

## Logout

This should be handled on the client. No server interaction. Just delete the token you got from server when you logged in. In the future, you may be needed to call the server; but for now, no.

## Register User

**POST to /register**

### Request Data

A JSON object with the following keys.

| Key              | Required? | Type    | Description                                      |
| ---------------- | --------- | ------- | ------------------------------------------------ |
| **username**     | Yes       | string  | Username.                                        |
| **email**        | Yes       | string  | Email.                                           |
| **password**     | Yes       | string  | The password.                                    |
| **organization** |           | string  | The user's organization.                         |
| **firstname**    |           | string  | The user's first name.                           |
| **lastname**     |           | string  | The user's last name.                            |
| **usertype**     |           | integer | User type.                                       |
| **url**          | Yes       | string  | The 'verify email' url to send user in an email. |

### Response Data

No data. You'll just get an OK status.

## Verify User

**GET to /verifyuser**

This endpoint will be called to verify email verification token.

### Request Data

| Key       | Required? | Type   | Description                                        |
| --------- | --------- | ------ | -------------------------------------------------- |
| **token** | Yes       | string | The verification token sent to new user via email. |

### Response Data

No data. You'll just get an OK status.

## User's Quiz(zes)

**GET to /api/userquizzes**

This retrieves all the quizzes set up by a given user. For this query, we'll only give you the quizzes and their questions. When you query a particular quiz for a user, we can then package all other info: people who participated, scores, etc.

### Request Data

| Key     | Required? | Type    | Description                                                       |
| ------- | --------- | ------- | ----------------------------------------------------------------- |
| **uid** | Yes       | integer | The quiz owner's id. This will usually be the logged-in user's id |

### Response Data

The response data will be an array of objects whose keys are defined below.

| Key                 | Type       | Description                                            |
| ------------------- | ---------- | ------------------------------------------------------ |
| **id**              | integer    | The quiz id                                            |
| **title**           | string     | The quiz title                                         |
| **published**       | boolean    | Whether or not the quiz has been published             |
| **creditResources** | string     | Credits; bibliography                                  |
| **userId**          | string     | The quiz owner's id                                    |
| **introLink**       | string     | Video or other link introducing the quiz               |
| **visibleTo**       | Enum (int) | 1 for '_Everyone_'; 2 for '_Only Me_'.                 |
| **audience**        | Enum (int) | 1 for '_Social_'; 2 for '_School_'.                    |
| **questions**       | Object     | Some info about the user. [See definition](#questions) |

#### questions

| Key                | Type    | Description                                                                                                                                        |
| ------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **id**             | integer | The question id                                                                                                                                    |
| **quizId**         | integer | The id of the quiz this thistion belongs to                                                                                                        |
| **question**       | string  | The question                                                                                                                                       |
| **timeLimit**      | integer | Time limit **in seconds**                                                                                                                          |
| **option1**        | string  | The 1st option                                                                                                                                     |
| **option2**        | string  | The 2nd option                                                                                                                                     |
| **option3**        | string  | The 3rd option                                                                                                                                     |
| **option4**        | string  | The 4th option                                                                                                                                     |
| **correctOptions** | string  | The correct option, specified as 1,2,3,or 4. When there are more than one correct options, the numbers are separated by comma (,). E.g. "1", "2,3" |
