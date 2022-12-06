import ApiError from '@src/util/errors/api-error';

describe('ApiError', () => {
  it('should format error with mandatory fields', () => {
    const error = ApiError.format({
      code: 404,
      message: 'User not found!',
    });

    expect(error).toEqual({
      code: 404,
      message: 'User not found!',
      error: 'Not Found',
    });
  });

  it('should format error with mandatory fields and description', () => {
    const error = ApiError.format({
      code: 404,
      message: 'User not found!',
      description: 'This error happens when there is no user created',
    });

    expect(error).toEqual({
      code: 404,
      message: 'User not found!',
      error: 'Not Found',
      description: 'This error happens when there is no user created',
    });
  });

  it('should format error with mandatory fields and description and documentation', () => {
    const error = ApiError.format({
      code: 404,
      message: 'User not found!',
      description: 'This error happens when there is no user created',
      documentation: 'https://mydocs.com/error-404',
    });

    expect(error).toEqual({
      code: 404,
      message: 'User not found!',
      error: 'Not Found',
      description: 'This error happens when there is no user created',
      documentation: 'https://mydocs.com/error-404',
    });
  });
});
