export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(_req, res) {
  res.status(404).json({
    ok: false,
    error: {
      message: 'Not Found'
    }
  });
}

export function errorHandler(err, _req, res, _next) {
  const isMulterError = err && err.name === 'MulterError';
  let status = err?.status || (isMulterError ? 400 : 500);
  let message = err?.message || 'Internal Server Error';
  let details = err?.details || null;

  if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON payload';
  }

  if (err?.message === 'Not allowed by CORS') {
    status = 403;
    message = 'Not allowed by CORS';
  }

  if (err?.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Duplicate entry';
  }

  if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'Invalid reference';
  }

  if (status >= 500) {
    console.error(err);
  }

  const payload = {
    ok: false,
    error: {
      message
    }
  };

  if (details) {
    payload.error.details = details;
  }

  res.status(status).json(payload);
}
