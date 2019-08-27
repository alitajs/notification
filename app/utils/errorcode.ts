import joi from 'joi';

export class UnknownError extends Error {
  static defaultMsg = 'unknown error';
  public errcode: ErrCode;

  constructor(message: string = UnknownError.defaultMsg, errcode: ErrCode = ErrCode.Unknown) {
    super(message);
    this.errcode = errcode;
  }
}

export class AuthError extends UnknownError {
  constructor(message: string) {
    super(message, ErrCode.AuthError);
  }
}

export class AccessDeny extends UnknownError {
  static defaultMsg = 'deny access to this resource';

  constructor(message: string = AccessDeny.defaultMsg) {
    super(message, ErrCode.AccessDeny);
  }
}

export class NotFound extends UnknownError {
  static defaultMsg = 'resource not found';

  constructor(message: string = NotFound.defaultMsg) {
    super(message, ErrCode.NotFound);
  }
}

export class ValidationError extends UnknownError implements joi.ValidationError {
  static defaultMsg = 'validate failed';
  isJoi = true;
  details = [] as joi.ValidationErrorItem[];
  _object = {};

  constructor(message: string = ValidationError.defaultMsg) {
    super(message, ErrCode.InvalidParam);
  }

  annotate = () => this.message;
}

export class ServerError extends UnknownError {
  static defaultMsg = 'server internal error';

  constructor(message: string = ServerError.defaultMsg, errcode: ErrCode = ErrCode.ServerError) {
    super(message, errcode);
  }
}

export class DatabaseError extends ServerError {
  constructor(message: string = ServerError.defaultMsg) {
    super(message, ErrCode.DatabaseError);
  }
}

export const enum ErrCode {
  Succeed = '0',
  SystemBusy = '-1',
  Unknown = '-2',
  ServerError = '30000',
  DatabaseError = '30002',
  AuthError = '40000',
  AccessDeny = '40001',
  NotFound = '40002',
  InvalidParam = '50000',
}

export default ErrCode;
