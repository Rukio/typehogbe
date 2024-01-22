export type ErrorUtilValue = {
  code: number;
  message: string;
}

module.exports = {
  unauthorized: (message: string): ErrorUtilValue => ({
    code: 400,
    message,
  }),
  badRequest: (message: string): ErrorUtilValue => ({
    code: 401,
    message,
  }),
  notFound: (message: string): ErrorUtilValue => ({
    code: 404,
    message,
  }),
  serverError: (message: string): ErrorUtilValue => ({
    code: 500,
    message,
  })
};
