const sendResponse = (res, { status = 200, message = "OK", data = null }) => {
  const isSuccess = status >= 200 && status < 400;
  res.status(status).json({
    status: isSuccess,
    message,
    ...(data !== null && { data }),
    timestams: new Date().toISOString(),
  });
};

module.exports = sendResponse;
