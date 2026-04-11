export const BASE_URL =
    import.meta.env.VITE_REQUEST_URL || 'http://localhost:3000/api/';

/** Route for login using google */
export const GOOGLE_LOGIN_ROUTE = BASE_URL + 'auth/google';
/** Route for login using mail */
export const MAIL_LOGIN_ROUTE = BASE_URL + 'auth/login';

/** Route for signup using mail */
export const SIGNUP_ROUTE = BASE_URL + 'auth/signup';

export const LOGOUT_ROUTE = BASE_URL + 'auth/logout';

/**
 * Route for article. The request body should contain title, description, and content of the article.
 */

export const CREATE_ARTICLE_ROUTE = BASE_URL + 'article/';

/**
 * Route to get a single article by its ID. The article ID should be passed as a URL parameter.
 * Example: /article/123
 */

export const GET_ARTICLE_ROUTE = BASE_URL + `article/:articleId`;

/**
 * Route to get all articles with optional pagination and filtering. Pagination parameters (page and limit) can be passed as query parameters.
 */

export const GET_ALL_ARTICLES_ROUTE = BASE_URL + 'article';

/**
 * Route to update an existing article by its ID. The article ID should be passed as a URL parameter, and the request body should contain the updated title, description, and content of the article.
 */
export const UPDATE_ARTICLE_ROUTE = BASE_URL + `article/:articleId`;

/**
 * Route to delete an existing article by its ID. The article ID should be passed as a URL parameter.
 */
export const DELETE_ARTICLE_ROUTE = BASE_URL + `article/:articleId`;
